import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken, getSession, clearSessionCookie } from "@/lib/auth";
import { ok, err } from "@/lib/api";

/* POST /api/auth/register */
export async function registerHandler(req) {
  await connectDB();
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return err("All fields required");
  if (password.length < 8) return err("Password must be at least 8 characters");
  if (!["student", "instructor"].includes(role)) return err("Invalid role");

  const existing = await User.findOne({ email });
  if (existing) return err("Email already registered", 409);

  const user = await User.create({ name, email, password, role });
  const token = await signToken({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });

  const res = ok({ user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
  res.cookies.set("canvas_token", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
  });
  return res;
}

/* POST /api/auth/login */
export async function loginHandler(req) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) return err("Email and password required");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) return err("Invalid credentials", 401);

  const token = await signToken({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });

  const res = ok({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("canvas_token", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
  });
  return res;
}

/* POST /api/auth/logout */
export async function logoutHandler() {
  const res = ok({ message: "Logged out" });
  res.cookies.set("canvas_token", "", { maxAge: 0, path: "/" });
  return res;
}

/* GET /api/auth/me */
export async function meHandler() {
  const session = await getSession();
  if (!session) return err("Unauthorized", 401);
  return ok({ user: session });
}
