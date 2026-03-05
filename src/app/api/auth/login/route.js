import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) return err("Email and password required");
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) return err("Invalid credentials", 401);
  const token = await signToken({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
  const res = ok({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("canvas_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60*60*24*7, path: "/" });
  return res;
}
