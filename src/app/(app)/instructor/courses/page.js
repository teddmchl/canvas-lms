import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/lib/models/Course";
import Assignment from "@/lib/models/Assignment";
import { Enrollment, Submission } from "@/lib/models/index";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InstructorCoursesPage() {
  const session = await getSession();
  if (!session || session.role !== "instructor") redirect("/dashboard");

  await connectDB();

  const courses = await Course.find({ instructor: session.id }).sort({ createdAt: -1 }).lean();
  const ids = courses.map(c => c._id);

  const [enrollCounts, subCounts] = await Promise.all([
    Enrollment.aggregate([{ $match: { course: { $in: ids } } }, { $group: { _id: "$course", count: { $sum: 1 } } }]),
    Submission.aggregate([
      { $match: { course: { $in: ids }, status: "submitted" } },
      { $group: { _id: "$course", pending: { $sum: 1 } } },
    ]),
  ]);

  const enrollMap  = Object.fromEntries(enrollCounts.map(e => [e._id.toString(), e.count]));
  const pendingMap = Object.fromEntries(subCounts.map(s => [s._id.toString(), s.pending]));

  const totalStudents = enrollCounts.reduce((s, e) => s + e.count, 0);
  const totalPending  = subCounts.reduce((s, e) => s + e.pending, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-eyebrow">Instructor Dashboard</div>
            <h1 className="page-title">Your Courses</h1>
            <p className="page-subtitle">Manage your courses and grade student work</p>
          </div>
          <Link href="/instructor/courses/new" className="btn btn-primary">+ New Course</Link>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {/* Stats */}
        <div className="dash-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total Courses</div>
            <div className="stat-value">{courses.length}</div>
            <div className="stat-sub">{courses.filter(c => c.published).length} published</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Pending Grades</div>
            <div className="stat-value">{totalPending}</div>
            <div className="stat-sub">awaiting review</div>
          </div>
        </div>

        {/* Course list */}
        {courses.length === 0 ? (
          <div className="empty-state" style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)" }}>
            <div className="empty-icon">🏫</div>
            <div className="empty-title">No courses yet</div>
            <div className="empty-sub">Create your first course to get started</div>
            <Link href="/instructor/courses/new" className="btn btn-primary" style={{ marginTop: "1rem" }}>Create Course</Link>
          </div>
        ) : (
          <div>
            {courses.map(course => {
              const students = enrollMap[course._id.toString()] || 0;
              const pending  = pendingMap[course._id.toString()] || 0;
              return (
                <div key={course._id.toString()} style={{
                  background: "#fff",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius)",
                  marginBottom: "1rem",
                  overflow: "hidden",
                  display: "flex",
                  transition: "box-shadow .15s",
                }}>
                  <div style={{ width: 6, background: course.coverColor || "#1d4ed8", flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", gap: ".5rem", marginBottom: ".35rem" }}>
                        <span className={`badge ${course.published ? "badge-green" : "badge-amber"}`}>
                          {course.published ? "Published" : "Draft"}
                        </span>
                        {course.subject && <span className="badge badge-gray">{course.subject}</span>}
                      </div>
                      <div style={{ fontFamily: "var(--ff-serif)", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>{course.title}</div>
                    </div>
                    <div style={{ display: "flex", gap: "2rem" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--ff-serif)", fontSize: "1.4rem", fontWeight: 700 }}>{students}</div>
                        <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Students</div>
                      </div>
                      {pending > 0 && (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--ff-serif)", fontSize: "1.4rem", fontWeight: 700, color: "var(--amber)" }}>{pending}</div>
                          <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--amber)" }}>To Grade</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      {pending > 0 && (
                        <Link href={`/instructor/courses/${course._id}/grades`} className="btn btn-primary btn-sm">
                          Grade ({pending})
                        </Link>
                      )}
                      <Link href={`/instructor/courses/${course._id}`} className="btn btn-secondary btn-sm">Manage</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
