import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  order:       { type: Number, default: 0 },
  content:     { type: String }, // markdown / rich text
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  instructor:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject:     { type: String, trim: true },
  level:       { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  coverColor:  { type: String, default: "#1d4ed8" },
  published:   { type: Boolean, default: false },
  modules:     [moduleSchema],
}, { timestamps: true });

courseSchema.virtual("enrollmentCount", {
  ref: "Enrollment", localField: "_id", foreignField: "course", count: true,
});

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
