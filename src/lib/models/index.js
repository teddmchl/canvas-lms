import mongoose from "mongoose";

/* ── Submission ── */
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  student:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:    { type: String, trim: true }, // text submission
  attachments: [{ type: String }],
  grade:      { type: Number, default: null, min: 0 },
  feedback:   { type: String, trim: true },
  gradedAt:   { type: Date },
  gradedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status:     { type: String, enum: ["submitted", "graded"], default: "submitted" },
}, { timestamps: true });

/* Unique: one submission per student per assignment */
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ course: 1, student: 1 });
submissionSchema.index({ course: 1, createdAt: -1 });
submissionSchema.index({ student: 1, status: 1 });
/* ── Enrollment ── */
const enrollmentSchema = new mongoose.Schema({
  course:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 }, // 0-100%
}, { timestamps: true });

enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

export const Submission  = mongoose.models.Submission  || mongoose.model("Submission",  submissionSchema);
export const Enrollment  = mongoose.models.Enrollment  || mongoose.model("Enrollment",  enrollmentSchema);
