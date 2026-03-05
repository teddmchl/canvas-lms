import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-64-chars-long"
);

const COOKIE_NAME = "canvas_token";
const EXPIRY = "7d";

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(res, payload) {
  const token = await signToken(payload);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return token;
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

/** Use in API routes to require auth — returns session or 401 response */
export async function requireAuth() {
  const session = await getSession();
  if (!session) return { session: null, error: "Unauthorized" };
  return { session, error: null };
}

/** Use in API routes to require instructor role */
export async function requireInstructor() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (session.role !== "instructor") return { session: null, error: "Forbidden" };
  return { session, error: null };
}
