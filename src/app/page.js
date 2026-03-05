import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--ff-sans)" }}>
      {/* Simple nav */}
      <nav style={{
        borderBottom: "1px solid var(--rule)",
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "var(--max-w)",
        margin: "0 auto",
        width: "100%",
      }}>
        <span style={{ fontFamily: "var(--ff-serif)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-.03em" }}>
          Canvas<span style={{ color: "var(--blue)" }}>LMS</span>
        </span>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <Link href="/login" className="btn btn-secondary btn-sm">Sign in</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Learning Management Platform</div>
          <h1 className="hero-title">
            Where <em>great teaching</em><br />meets modern tools
          </h1>
          <p className="hero-subtitle">
            Create courses, manage assignments, and track student progress —
            all in one clean, focused platform built for educators and learners.
          </p>
          <div className="hero-cta">
            <Link href="/register?role=instructor" className="btn btn-primary btn-lg">Start teaching →</Link>
            <Link href="/register?role=student" className="btn btn-secondary btn-lg">Enroll as student</Link>
          </div>
        </div>
      </section>

      {/* Rule */}
      <div className="container">
        <div className="section-rule">
          <span className="section-rule-label">Built for both sides of the classroom</span>
        </div>
      </div>

      {/* Feature grid */}
      <section style={{ padding: "3rem 0 5rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: "📚", title: "Course Creation", desc: "Build structured courses with modules, descriptions, and difficulty levels. Publish when you're ready.", role: "Instructors" },
              { icon: "📝", title: "Assignments & Grading", desc: "Create assignments with deadlines and max points. Grade submissions with written feedback in real time.", role: "Instructors" },
              { icon: "📊", title: "Course Analytics", desc: "See grade distributions, submission rates, and student progress at a glance.", role: "Instructors" },
              { icon: "🎓", title: "Course Enrollment", desc: "Browse the catalogue and enroll in courses that match your goals.", role: "Students" },
              { icon: "✍️", title: "Assignment Submission", desc: "Submit your work, receive instructor feedback, and track your grades across all courses.", role: "Students" },
              { icon: "📈", title: "Progress Tracking", desc: "See your grades, completed assignments, and performance at a glance.", role: "Students" },
            ].map((f) => (
              <div key={f.title} style={{
                background: "#fff",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius)",
                padding: "1.75rem",
              }}>
                <div style={{ fontSize: "1.8rem", marginBottom: ".75rem" }}>{f.icon}</div>
                <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--blue)", marginBottom: ".4rem" }}>{f.role}</div>
                <h3 style={{ fontFamily: "var(--ff-serif)", marginBottom: ".5rem" }}>{f.title}</h3>
                <p style={{ fontSize: ".9rem", color: "var(--ink-light)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--rule)", padding: "1.5rem 2rem", textAlign: "center" }}>
        <small>Canvas LMS · Built with Next.js, Node.js & MongoDB</small>
      </footer>
    </div>
  );
}
