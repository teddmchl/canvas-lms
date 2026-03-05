import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/lib/models/Course";
import Assignment from "@/lib/models/Assignment";
import { Enrollment, Submission } from "@/lib/models/index";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CourseManageClient from "./CourseManageClient";

export default async function InstructorCourseDetailPage({ params }) {
  const session = await getSession();
  if (!session || session.role !== "instructor") redirect("/dashboard");

  await connectDB();

  const course = await Course.findById(params.id).lean();
  if (!course || course.instructor.toString() !== session.id) notFound();

  const [assignments, enrollmentCount, submissionStats] = await Promise.all([
    Assignment.find({ course: params.id }).sort({ order: 1 }).lean(),
    Enrollment.countDocuments({ course: params.id }),
    Submission.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statMap  = Object.fromEntries(submissionStats.map(s => [s._id, s.count]));
  const pending  = statMap["submitted"] || 0;
  const graded   = statMap["graded"]    || 0;

  return (
    <CourseManageClient
      course={JSON.parse(JSON.stringify(course))}
      assignments={JSON.parse(JSON.stringify(assignments))}
      enrollmentCount={enrollmentCount}
      pendingCount={pending}
      gradedCount={graded}
    />
  );
}
