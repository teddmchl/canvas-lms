import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-64-chars-long"
);

const PUBLIC  = ["/", "/login", "/register"];
const API_PUBLIC = ["/api/auth/login", "/api/auth/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // API routes handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Public pages
  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get("canvas_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Instructor-only routes
    if (pathname.startsWith("/instructor") && payload.role !== "instructor") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("canvas_token", "", { maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
