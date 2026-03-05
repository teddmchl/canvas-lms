import { connectDB } from "@/lib/db";
import Assignment from "@/lib/models/Assignment";
import Course from "@/lib/models/Course";
import { requireInstructor, getSession } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* GET /api/assignments?course=id */
export async function GET(req) {
  await connectDB();
  const session = await getSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course");
  if (!courseId) return err("course param required");

  const assignments = await Assignment.find({ course: courseId }).sort({ order: 1 }).lean();
  return ok({ assignments });
}

/* POST /api/assignments — create assignment */
export async function POST(req) {
  await connectDB();
  const { session, error } = await requireInstructor();
  if (error) return err(error, 401);

  const { courseId, title, description, dueDate, maxPoints } = await req.json();
  if (!courseId || !title) return err("courseId and title required");

  const course = await Course.findById(courseId);
  if (!course) return err("Course not found", 404);
  if (course.instructor.toString() !== session.id) return err("Forbidden", 403);

  const count = await Assignment.countDocuments({ course: courseId });
  const assignment = await Assignment.create({
    course: courseId, title, description, dueDate, maxPoints: maxPoints || 100, order: count,
  });

  return ok({ assignment }, 201);
}
