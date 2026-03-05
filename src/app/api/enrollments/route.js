import { connectDB } from "@/lib/db";
import { Enrollment } from "@/lib/models/index";
import Course from "@/lib/models/Course";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* POST /api/enrollments — enroll student in course */
export async function POST(req) {
  await connectDB();
  const session = await getSession();
  if (!session || session.role !== "student") return err("Students only", 403);

  const { courseId } = await req.json();
  if (!courseId) return err("courseId required");

  const course = await Course.findById(courseId);
  if (!course || !course.published) return err("Course not found", 404);

  const existing = await Enrollment.findOne({ course: courseId, student: session.id });
  if (existing) return err("Already enrolled", 409);

  const enrollment = await Enrollment.create({ course: courseId, student: session.id });
  return ok({ enrollment }, 201);
}

/* DELETE /api/enrollments?course=id — unenroll */
export async function DELETE(req) {
  await connectDB();
  const session = await getSession();
  if (!session || session.role !== "student") return err("Students only", 403);

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course");
  if (!courseId) return err("course param required");

  await Enrollment.findOneAndDelete({ course: courseId, student: session.id });
  return ok({ message: "Unenrolled" });
}

/* GET /api/enrollments — student's enrolled courses with progress */
export async function GET(req) {
  await connectDB();
  const session = await getSession();
  if (!session || session.role !== "student") return err("Students only", 403);

  const enrollments = await Enrollment.find({ student: session.id })
    .populate({ path: "course", populate: { path: "instructor", select: "name" } })
    .sort({ createdAt: -1 })
    .lean();

  return ok({ enrollments });
}
