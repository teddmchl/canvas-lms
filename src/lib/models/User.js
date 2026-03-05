import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ["student", "instructor"], default: "student" },
  avatar:   { type: String }, // initials-based, generated client-side
  bio:      { type: String, trim: true },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform(_, ret) { delete ret.password; delete ret.__v; return ret; }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
