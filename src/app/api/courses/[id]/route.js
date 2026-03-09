import { connectDB } from "@/lib/db";
import Course from "@/lib/models/Course";
import Assignment from "@/lib/models/Assignment";
import { Enrollment, Submission } from "@/lib/models/index";
import { getSession, requireInstructor } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* GET /api/courses/[id] — full course with assignments, enrollment info */
export async function GET(req, { params }) {
  await connectDB();
  const session = await getSession();

  const course = await Course.findById(params.id)
    .populate("instructor", "name email bio")
    .lean();
  if (!course) return err("Course not found", 404);
  if (!course.published && course.instructor._id?.toString() !== session?.id) {
    return err("Not found", 404);
  }

  const assignments = await Assignment.find({ course: params.id }).sort({ order: 1 }).lean();
  const enrollmentCount = await Enrollment.countDocuments({ course: params.id });

  let isEnrolled = false;
  let submissions = [];
  if (session?.role === "student") {
    const enrollment = await Enrollment.findOne({ course: params.id, student: session.id });
    isEnrolled = !!enrollment;
    if (isEnrolled) {
      submissions = await Submission.find({ course: params.id, student: session.id }).lean();
    }
  }

  // Instructor: get submission counts per assignment
  let submissionCounts = {};
  if (session?.role === "instructor" && course.instructor._id?.toString() === session.id) {
    const counts = await Submission.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: "$assignment", total: { $sum: 1 }, graded: { $sum: { $cond: [{ $eq: ["$status", "graded"] }, 1, 0] } } } },
    ]);
    counts.forEach((c) => { submissionCounts[c._id.toString()] = { total: c.total, graded: c.graded }; });
  }

  return ok({
    course,
    assignments: assignments.map((a) => ({
      ...a,
      submissionCounts: submissionCounts[a._id.toString()] || null,
    })),
    enrollmentCount,
    isEnrolled,
    submissions,
  });
}

/* PUT /api/courses/[id] — update course (instructor) */
export async function PUT(req, { params }) {
  await connectDB();
  const { session, error } = await requireInstructor();
  if (error) return err(error, 401);

  const course = await Course.findById(params.id);
  if (!course) return err("Not found", 404);
  if (course.instructor.toString() !== session.id) return err("Forbidden", 403);

  const body = await req.json();
  const allowed = ["title", "description", "subject", "level", "coverColor", "published", "modules"];
  allowed.forEach((k) => { if (body[k] !== undefined) course[k] = body[k]; });
  await course.save();

  return ok({ course });
}

/* DELETE /api/courses/[id] */
export async function DELETE(req, { params }) {
  await connectDB();
  const { session, error } = await requireInstructor();
  if (error) return err(error, 401);

  const course = await Course.findById(params.id);
  if (!course) return err("Not found", 404);
  if (course.instructor.toString() !== session.id) return err("Forbidden", 403);

  await Course.findOneAndDelete({ _id: params.id });

  return ok({ message: "Course deleted" });
}
