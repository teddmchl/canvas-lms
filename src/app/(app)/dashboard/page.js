import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Enrollment, Submission } from "@/lib/models/index";
import Assignment from "@/lib/models/Assignment";
import Link from "next/link";
import { redirect } from "next/navigation";

function gradePill(pct) {
  if (pct >= 90) return "grade-a";
  if (pct >= 75) return "grade-b";
  if (pct >= 60) return "grade-c";
  return "grade-d";
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "instructor") redirect("/instructor/courses");

  await connectDB();

  const enrollments = await Enrollment.find({ student: session.id })
    .populate({ path: "course", populate: { path: "instructor", select: "name" } })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = enrollments.map(e => e.course?._id).filter(Boolean);

  const [submissions, assignments] = await Promise.all([
    Submission.find({ student: session.id, course: { $in: courseIds } })
      .populate("assignment", "title maxPoints")
      .populate("course", "title")
      .sort({ gradedAt: -1 })
      .lean(),
    Assignment.find({ course: { $in: courseIds } }).lean(),
  ]);

  const pendingCount = assignments.filter(a => {
    const submitted = submissions.find(s => s.assignment?._id?.toString() === a._id.toString());
    return !submitted;
  }).length;

  const gradedSubmissions = submissions.filter(s => s.status === "graded" && s.assignment);
  const avgGrade = gradedSubmissions.length
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade / s.assignment.maxPoints * 100), 0) / gradedSubmissions.length)
    : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-eyebrow">Student Dashboard</div>
            <h1 className="page-title">Welcome back, {session.name.split(" ")[0]}</h1>
            <p className="page-subtitle">Track your courses and assignments</p>
          </div>
          <Link href="/courses" className="btn btn-primary">Browse Courses →</Link>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {/* Stats */}
        <div className="dash-grid">
          <div className="stat-card blue">
            <div className="stat-label">Enrolled Courses</div>
            <div className="stat-value">{enrollments.length}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Pending Assignments</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Average Grade</div>
            <div className="stat-value">{avgGrade !== null ? `${avgGrade}%` : "—"}</div>
            <div className="stat-sub">{gradedSubmissions.length} graded</div>
          </div>
        </div>

        {/* My Courses */}
        <div className="section-header">
          <h2 className="section-title">My Courses</h2>
          <Link href="/courses" className="section-link">Browse all →</Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state" style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", marginBottom: "2.5rem" }}>
            <div className="empty-icon">📚</div>
            <div className="empty-title">No courses yet</div>
            <div className="empty-sub">Browse the catalogue and enroll in your first course</div>
            <Link href="/courses" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Courses</Link>
          </div>
        ) : (
          <div className="courses-grid" style={{ marginBottom: "2.5rem" }}>
            {enrollments.map(e => {
              const course = e.course;
              if (!course) return null;
              const courseSubmissions = submissions.filter(s => s.course?._id?.toString() === course._id.toString());
              const courseAssignments = assignments.filter(a => a.course?.toString() === course._id.toString());
              const progress = courseAssignments.length
                ? Math.round((courseSubmissions.length / courseAssignments.length) * 100)
                : 0;
              return (
                <Link key={e._id.toString()} href={`/courses/${course._id}`} className="course-card card">
                  <div className="course-spine" style={{ background: course.coverColor || "#1d4ed8" }} />
                  <div className="card-body">
                    <div className="course-subject">{course.subject || course.level}</div>
                    <div className="course-title">{course.title}</div>
                    <div className="course-instructor">{course.instructor?.name}</div>
                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "var(--ink-faint)", marginBottom: ".4rem" }}>
                        <span>Progress</span><span>{progress}%</span>
                      </div>
                      <div className="progress-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="badge badge-blue">{courseAssignments.length} assignments</span>
                    <span style={{ fontSize: ".8rem", color: "var(--ink-faint)" }}>{courseSubmissions.length} submitted</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent grades */}
        {gradedSubmissions.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">Recent Grades</h2>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Assignment</th><th>Course</th><th>Grade</th><th>Feedback</th></tr>
                </thead>
                <tbody>
                  {gradedSubmissions.slice(0, 8).map(s => {
                    const pct = Math.round((s.grade / s.assignment.maxPoints) * 100);
                    return (
                      <tr key={s._id.toString()}>
                        <td style={{ fontWeight: 500 }}>{s.assignment.title}</td>
                        <td style={{ color: "var(--ink-faint)" }}>{s.course?.title}</td>
                        <td>
                          <span className={`grade-pill ${gradePill(pct)}`}>{s.grade}/{s.assignment.maxPoints}</span>
                        </td>
                        <td style={{ fontSize: ".85rem", color: "var(--ink-faint)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.feedback || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
