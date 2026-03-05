"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Navbar({ user }) {
  const router   = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (path) => pathname.startsWith(path) ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/dashboard" className="navbar-logo">
          Canvas<span>LMS</span>
        </Link>

        <div className="navbar-nav">
          {user?.role === "instructor" ? (
            <>
              <Link href="/dashboard"            className={isActive("/dashboard")}>Dashboard</Link>
              <Link href="/instructor/courses"   className={isActive("/instructor")}>My Courses</Link>
              <Link href="/instructor/courses/new" className="btn btn-primary btn-sm" style={{ marginLeft: ".5rem" }}>+ New Course</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
              <Link href="/courses"   className={isActive("/courses")}>Browse Courses</Link>
            </>
          )}

          <div className="nav-user" style={{ marginLeft: ".5rem" }} onClick={logout} title="Sign out">
            <div className="nav-avatar">{initials(user?.name)}</div>
            <div>
              <div className="nav-username">{user?.name?.split(" ")[0]}</div>
              <div className="nav-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
