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
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>, title: "Course Creation", desc: "Build structured courses with modules, descriptions, and difficulty levels. Publish when you're ready.", role: "Instructors" },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, title: "Assignments & Grading", desc: "Create assignments with deadlines and max points. Grade submissions with written feedback in real time.", role: "Instructors" },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M3 21c4-8 6-14 9-14s5 6 9 14"/></svg>, title: "Course Analytics", desc: "See grade distributions, submission rates, and student progress at a glance.", role: "Instructors" },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, title: "Course Enrollment", desc: "Browse the catalogue and enroll in courses that match your goals.", role: "Students" },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, title: "Assignment Submission", desc: "Submit your work, receive instructor feedback, and track your grades across all courses.", role: "Students" },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: "Progress Tracking", desc: "See your grades, completed assignments, and performance at a glance.", role: "Students" },
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
