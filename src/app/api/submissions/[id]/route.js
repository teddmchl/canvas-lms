import { connectDB } from "@/lib/db";
import { Submission } from "@/lib/models/index";
import Course from "@/lib/models/Course";
import { requireInstructor } from "@/lib/auth";
import { ok, err } from "@/lib/api";
import { sendEmail } from "@/lib/email";

/* PATCH /api/submissions/[id] — grade a submission */
export async function PATCH(req, { params }) {
  await connectDB();
  const { session, error } = await requireInstructor();
  if (error) return err(error, 401);

  const { grade, feedback } = await req.json();
  if (grade === undefined || grade === null) return err("grade is required");

  const submission = await Submission.findById(params.id)
    .populate("assignment")
    .populate("student", "name email");
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

  // Dispatch Transactional Email (Fire and forget)
  sendEmail({
    to: submission.student.email,
    subject: `New Grade Posted: ${submission.assignment.title}`,
    html: `
      <h2>Assignment Graded</h2>
      <p>Hi ${submission.student.name},</p>
      <p>Your submission for <strong>${submission.assignment.title}</strong> has been graded.</p>
      <p><strong>Grade:</strong> ${grade} / ${submission.assignment.maxPoints}</p>
      ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
    `
  }).catch(e => console.error("Failed to send grading email:", e));

  return ok({ submission });
}
