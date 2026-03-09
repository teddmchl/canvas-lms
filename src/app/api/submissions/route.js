import { connectDB } from "@/lib/db";
import { Submission, Enrollment } from "@/lib/models/index";
import Assignment from "@/lib/models/Assignment";
import Course from "@/lib/models/Course";
import { getSession, requireInstructor } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* GET /api/submissions?course=id  or  ?assignment=id&student=id */
export async function GET(req) {
  await connectDB();
  const session = await getSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const courseId     = searchParams.get("course");
  const assignmentId = searchParams.get("assignment");

  let query = {};

  if (session.role === "instructor") {
    if (courseId)     query.course     = courseId;
    if (assignmentId) query.assignment = assignmentId;
  } else {
    // Students only see their own
    query.student = session.id;
    if (courseId)     query.course     = courseId;
    if (assignmentId) query.assignment = assignmentId;
  }

  const submissions = await Submission.find(query)
    .populate("student", "name email")
    .populate("assignment", "title maxPoints")
    .sort({ createdAt: -1 })
    .lean();

  return ok({ submissions });
}

/* POST /api/submissions — student submits */
export async function POST(req) {
  await connectDB();
  const session = await getSession();
  if (!session || session.role !== "student") return err("Students only", 403);

  const { assignmentId, content, attachments = [] } = await req.json();
  if (!assignmentId || !content) return err("assignmentId and content required");

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return err("Assignment not found", 404);

  // Must be enrolled
  const enrollment = await Enrollment.findOne({ course: assignment.course, student: session.id });
  if (!enrollment) return err("Not enrolled in this course", 403);

  const existing = await Submission.findOne({ assignment: assignmentId, student: session.id });
  if (existing) return err("Already submitted", 409);

  const submission = await Submission.create({
    assignment: assignmentId,
    course: assignment.course,
    student: session.id,
    content,
    attachments,
    status: "submitted",
  });

  return ok({ submission }, 201);
}
