import { ok } from "@/lib/api";

export async function POST() {
  const res = ok({ message: "Logged out" });
  res.cookies.set("canvas_token", "", { maxAge: 0, path: "/" });
  return res;
}
