import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/lib/models/Course";
import Assignment from "@/lib/models/Assignment";
import { Enrollment, Submission } from "@/lib/models/index";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "./EnrollButton";

function daysUntilDue(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: "var(--red)" };
  if (days === 0) return { label: "Due today", color: "var(--amber)" };
  return { label: `Due in ${days}d`, color: "var(--ink-faint)" };
}

function gradePill(pct) {
  if (pct >= 90) return "grade-a";
  if (pct >= 75) return "grade-b";
  if (pct >= 60) return "grade-c";
  return "grade-d";
}

export default async function CourseDetailPage({ params }) {
  const session = await getSession();
  await connectDB();

  const course = await Course.findById(params.id)
    .populate("instructor", "name email bio")
    .lean();

  if (!course || (!course.published && course.instructor?._id?.toString() !== session?.id)) {
    notFound();
  }

  const assignments = await Assignment.find({ course: params.id }).sort({ order: 1 }).lean();
  const enrollmentCount = await Enrollment.countDocuments({ course: params.id });

  let isEnrolled = false;
  let submissions = [];
  if (session?.role === "student") {
    const enrollment = await Enrollment.findOne({ course: params.id, student: session.id });
    isEnrolled = !!enrollment;
    if (isEnrolled) {
      submissions = await Submission.find({ course: params.id, student: session.id }).lean();
    }
  }

  const subMap = Object.fromEntries(submissions.map(s => [s.assignment.toString(), s]));

  return (
    <div>
      <div className="course-hero">
        <div className="course-hero-layout">
          <div>
            <div className="breadcrumb">
              <Link href="/courses">Courses</Link>
              <span className="breadcrumb-sep">›</span>
              <span>{course.title}</span>
            </div>
            <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {course.subject && <span className="badge badge-blue">{course.subject}</span>}
              <span className="badge badge-gray">{course.level}</span>
              {!course.published && <span className="badge badge-amber">Draft</span>}
            </div>
            <h1 style={{ fontFamily: "var(--ff-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, letterSpacing: "-.03em", marginBottom: ".75rem" }}>
              {course.title}
            </h1>
            <p style={{ fontSize: "1rem", color: "var(--ink-light)", fontStyle: "italic", marginBottom: "1rem" }}>
              Taught by {course.instructor?.name}
            </p>
            {course.description && (
              <p style={{ fontSize: "1.05rem", color: "var(--ink-mid)", lineHeight: 1.65, maxWidth: 600 }}>
                {course.description}
              </p>
            )}
          </div>

          {/* Sidebar card */}
          <div className="course-hero-actions">
            <div className="enroll-price">Free</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {session?.role === "student" && (
                <EnrollButton
                  courseId={params.id}
                  isEnrolled={isEnrolled}
                  published={course.published}
                />
              )}
              {session?.id === course.instructor?._id?.toString() && (
                <>
                  <Link href={`/instructor/courses/${params.id}`} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                    Manage Course
                  </Link>
                  <Link href={`/instructor/courses/${params.id}/grades`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Grade Submissions
                  </Link>
                </>
              )}
            </div>
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule)" }}>
              {[
                ["Assignments", assignments.length],
                ["Students enrolled", enrollmentCount],
                ["Level", course.level],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: ".4rem 0", fontSize: ".88rem" }}>
                  <span style={{ color: "var(--ink-faint)" }}>{label}</span>
                  <span style={{ fontWeight: 500, color: "var(--ink-mid)" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {/* Assignments */}
        <div className="section-header">
          <h2 className="section-title">Assignments</h2>
          {session?.role === "student" && isEnrolled && (
            <span style={{ fontSize: ".82rem", color: "var(--ink-faint)" }}>
              {submissions.length}/{assignments.length} submitted
            </span>
          )}
        </div>

        {assignments.length === 0 ? (
          <div className="empty-state" style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)" }}>
            <div className="empty-icon">📝</div>
            <div className="empty-title">No assignments yet</div>
            <div className="empty-sub">Check back soon</div>
          </div>
        ) : (
          <div className="assignment-list">
            {assignments.map((a, i) => {
              const sub = subMap[a._id.toString()];
              const due = daysUntilDue(a.dueDate);
              const isInstructor = session?.id === course.instructor?._id?.toString();

              return (
                <div key={a._id.toString()} className="assignment-item">
                  <div className="assignment-num">{i + 1}</div>
                  <div className="assignment-info">
                    <div className="assignment-title">{a.title}</div>
                    <div className="assignment-meta">
                      {a.maxPoints} pts
                      {due && <span style={{ marginLeft: ".75rem", color: due.color }}>{due.label}</span>}
                    </div>
                  </div>

                  {session?.role === "student" && isEnrolled && (
                    sub ? (
                      sub.status === "graded"
                        ? <span className={`grade-pill ${gradePill(Math.round(sub.grade / a.maxPoints * 100))}`}>{sub.grade}/{a.maxPoints}</span>
                        : <span className="badge badge-amber">Submitted</span>
                    ) : (
                      <Link href={`/courses/${params.id}/assignments/${a._id}`} className="btn btn-primary btn-sm">
                        Submit →
                      </Link>
                    )
                  )}

                  {session?.role === "student" && !isEnrolled && (
                    <span className="badge badge-gray">Enroll to submit</span>
                  )}

                  {isInstructor && (
                    <Link href={`/instructor/courses/${params.id}/grades?assignment=${a._id}`} className="btn btn-secondary btn-sm">
                      Grade
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Course modules */}
        {course.modules?.length > 0 && (
          <>
            <div className="section-rule"><span className="section-rule-label">Course Content</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {course.modules.map((m, i) => (
                <div key={m._id?.toString() || i} style={{
                  background: "#fff",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius)",
                  padding: "1.25rem 1.5rem",
                }}>
                  <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--blue-pale)", border: "1px solid var(--blue-bdr)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 700, color: "var(--blue)", flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: ".25rem" }}>{m.title}</div>
                      {m.description && <p style={{ fontSize: ".88rem", color: "var(--ink-light)", lineHeight: 1.55 }}>{m.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
