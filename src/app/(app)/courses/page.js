import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/index";
import Link from "next/link";

export default async function CoursesPage({ searchParams }) {
  const session = await getSession();
  await connectDB();

  const subject = searchParams?.subject || "";

  const query = { published: true };
  if (subject) query.subject = subject;

  const courses = await Course.find(query)
    .populate("instructor", "name")
    .sort({ createdAt: -1 })
    .lean();

  // Enrollment counts
  const ids = courses.map(c => c._id);
  const counts = await Enrollment.aggregate([
    { $match: { course: { $in: ids } } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

  // Student's enrollments
  let enrolled = new Set();
  if (session?.role === "student") {
    const enrs = await Enrollment.find({ student: session.id }).select("course").lean();
    enrs.forEach(e => enrolled.add(e.course.toString()));
  }

  // Unique subjects for filter
  const subjects = [...new Set(courses.map(c => c.subject).filter(Boolean))];

  const levels = { Beginner: "badge-green", Intermediate: "badge-blue", Advanced: "badge-amber" };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-eyebrow">Course Catalogue</div>
            <h1 className="page-title">Browse Courses</h1>
            <p className="page-subtitle">{courses.length} course{courses.length !== 1 ? "s" : ""} available</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {/* Subject filters */}
        {subjects.length > 0 && (
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <Link href="/courses" className={`btn btn-sm ${!subject ? "btn-primary" : "btn-secondary"}`}>All</Link>
            {subjects.map(s => (
              <Link key={s} href={`/courses?subject=${encodeURIComponent(s)}`}
                className={`btn btn-sm ${subject === s ? "btn-primary" : "btn-secondary"}`}>{s}</Link>
            ))}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No courses found</div>
            <div className="empty-sub">Check back soon — new courses are added regularly</div>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => {
              const isEnrolled = enrolled.has(course._id.toString());
              return (
                <Link key={course._id.toString()} href={`/courses/${course._id}`} className="course-card card">
                  <div className="course-spine" style={{ background: course.coverColor || "#1d4ed8" }} />
                  <div className="card-body">
                    <div className="course-meta" style={{ marginBottom: ".5rem" }}>
                      {course.subject && <span style={{ fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{course.subject}</span>}
                      <span className={`badge ${levels[course.level] || "badge-gray"}`}>{course.level}</span>
                    </div>
                    <div className="course-title">{course.title}</div>
                    <div className="course-instructor" style={{ margin: ".3rem 0 .75rem" }}>by {course.instructor?.name}</div>
                    {course.description && (
                      <p style={{ fontSize: ".85rem", color: "var(--ink-light)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="card-footer">
                    <span style={{ fontSize: ".8rem", color: "var(--ink-faint)" }}>
                      {countMap[course._id.toString()] || 0} enrolled
                    </span>
                    {isEnrolled
                      ? <span className="badge badge-green">Enrolled ✓</span>
                      : <span style={{ fontSize: ".82rem", color: "var(--blue)", fontWeight: 500 }}>View course →</span>
                    }
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
