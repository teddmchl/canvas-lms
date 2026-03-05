import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return err("Unauthorized", 401);
  return ok({ user: session });
}
