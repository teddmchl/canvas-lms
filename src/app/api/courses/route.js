import { connectDB } from "@/lib/db";
import Course from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/index";
import { getSession, requireInstructor } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* GET /api/courses — public course listing (published only for students) */
export async function GET(req) {
  await connectDB();
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const mine    = searchParams.get("mine"); // instructor's own courses

  let query = {};

  if (mine && session?.role === "instructor") {
    query.instructor = session.id;
  } else {
    query.published = true;
  }

  if (subject) query.subject = subject;

  const courses = await Course.find(query)
    .populate("instructor", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Add enrollment counts
  const ids = courses.map((c) => c._id);
  const counts = await Enrollment.aggregate([
    { $match: { course: { $in: ids } } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  // If student, mark which they're enrolled in
  let enrolled = new Set();
  if (session?.role === "student") {
    const enrollments = await Enrollment.find({ student: session.id }).select("course").lean();
    enrollments.forEach((e) => enrolled.add(e.course.toString()));
  }

  const enriched = courses.map((c) => ({
    ...c,
    enrollmentCount: countMap[c._id.toString()] || 0,
    isEnrolled: enrolled.has(c._id.toString()),
  }));

  return ok({ courses: enriched });
}

/* POST /api/courses — create (instructor only) */
export async function POST(req) {
  await connectDB();
  const { session, error } = await requireInstructor();
  if (error) return err(error, 401);

  const body = await req.json();
  const { title, description, subject, level, coverColor } = body;
  if (!title) return err("Title is required");

  const course = await Course.create({
    title, description, subject, level, coverColor,
    instructor: session.id,
    published: false,
  });

  return ok({ course }, 201);
}
