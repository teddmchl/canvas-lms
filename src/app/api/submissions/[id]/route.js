import { connectDB } from "@/lib/db";
import { Submission } from "@/lib/models/index";
import Course from "@/lib/models/Course";
import { requireInstructor } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* PATCH /api/submissions/[id] — grade a submission */
export async function PATCH(req, { params }) {
  await connectDB();
  const { session, error } = await requireInstructor();
  if (error) return err(error, 401);

  const { grade, feedback } = await req.json();
  if (grade === undefined || grade === null) return err("grade is required");

  const submission = await Submission.findById(params.id).populate("assignment");
  if (!submission) return err("Submission not found", 404);

  // Verify instructor owns the course
  const course = await Course.findById(submission.course);
  if (course.instructor.toString() !== session.id) return err("Forbidden", 403);

  if (grade < 0 || grade > submission.assignment.maxPoints) {
    return err(`Grade must be between 0 and ${submission.assignment.maxPoints}`);
  }

  submission.grade    = grade;
  submission.feedback = feedback || "";
  submission.status   = "graded";
  submission.gradedAt = new Date();
  submission.gradedBy = session.id;
  await submission.save();

  return ok({ submission });
}
