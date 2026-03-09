import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function POST(req) {
  const session = await getSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return err("No file provided", 400);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn("BLOB_READ_WRITE_TOKEN is missing. Returning a simulated URL for local development.");
      const mockUrl = `https://mock-storage.canvas.local/uploads/${Date.now()}-${file.name}`;
      return ok({ url: mockUrl });
    }

    const blob = await put(file.name, file, { access: "public" });
    return ok({ url: blob.url });
  } catch (error) {
    return err(error, 500);
  }
}
