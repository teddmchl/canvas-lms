import { connectDB } from "@/lib/db";
import { Submission, Enrollment } from "@/lib/models/index";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();
  const session = await getSession();
  if (!session || session.role !== "instructor") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course");

  const stream = new ReadableStream({
    async start(controller) {
      // Send headers to keep connection alive
      controller.enqueue(`data: {"type":"connected"}\n\n`);

      try {
        // Attempt to watch the Submission collection (Requires MongoDB Replica Set / Atlas)
        const pipeline = courseId ? [{ $match: { "fullDocument.course": courseId } }] : [];
        const changeStream = Submission.watch(pipeline);

        changeStream.on("change", async (change) => {
          if (change.operationType === "insert" || change.operationType === "update") {
            const subId = change.documentKey._id;
            const updatedSub = await Submission.findById(subId)
              .populate("student", "name email")
              .populate("assignment", "title maxPoints")
              .lean();
            
            if (updatedSub) {
              controller.enqueue(`data: ${JSON.stringify({ type: "update", submission: updatedSub })}\n\n`);
            }
          }
        });

        // Close stream when client disconnects
        req.signal.addEventListener("abort", () => {
          changeStream.close();
        });

      } catch (error) {
        // Fallback for local MongoDB without replica sets: Polling inside the stream
        console.warn("MongoDB Change Streams not supported, falling back to server-side polling.", error.message);
        
        let lastCheck = new Date();
        const interval = setInterval(async () => {
          const newSubs = await Submission.find({ 
            ...(courseId && { course: courseId }),
            updatedAt: { $gt: lastCheck } 
          })
            .populate("student", "name email")
            .populate("assignment", "title maxPoints")
            .lean();

          if (newSubs.length > 0) {
            lastCheck = new Date();
            for (const sub of newSubs) {
              controller.enqueue(`data: ${JSON.stringify({ type: "update", submission: sub })}\n\n`);
            }
          } else {
            // Keep alive
            controller.enqueue(`data: {"type":"ping"}\n\n`);
          }
        }, 3000);

        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
        });
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
