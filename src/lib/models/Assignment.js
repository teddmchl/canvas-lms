import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  dueDate:     { type: Date },
  maxPoints:   { type: Number, default: 100 },
  order:       { type: Number, default: 0 },
}, { timestamps: true });
assignmentSchema.index({ course: 1, order: 1 });

assignmentSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await mongoose.model("Submission").deleteMany({ assignment: doc._id });
  }
  next();
});

export default mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
