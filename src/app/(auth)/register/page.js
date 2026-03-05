"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") || "student";

  const [form, setForm]     = useState({ name: "", email: "", password: "", role: defaultRole });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const setRole = (r) => setForm(p => ({ ...p, role: r }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error); return; }
      router.push("/dashboard");
      router.refresh();
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-brand">Canvas<span>LMS</span></div>
        <h2 className="auth-panel-headline">
          Start learning.<br />Start teaching.
        </h2>
        <p className="auth-panel-sub">
          Join the platform where instructors build great courses and students find exactly what they need to grow.
        </p>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Choose your role to get started</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="role-picker">
            <button type="button" className={`role-option ${form.role === "student" ? "selected" : ""}`} onClick={() => setRole("student")}>
              <div className="role-option-title">🎓 Student</div>
              <div className="role-option-sub">Enroll in courses, submit assignments, track grades</div>
            </button>
            <button type="button" className={`role-option ${form.role === "instructor" ? "selected" : ""}`} onClick={() => setRole("instructor")}>
              <div className="role-option-title">🏫 Instructor</div>
              <div className="role-option-sub">Create courses, assign work, grade students</div>
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input name="name" type="text" required className="form-input"
                placeholder="Jane Smith" value={form.name} onChange={handle} autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" required className="form-input"
                placeholder="jane@example.com" value={form.email} onChange={handle} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" required className="form-input"
                placeholder="Min. 8 characters" value={form.password} onChange={handle} autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: ".5rem" }} disabled={loading}>
              {loading ? "Creating account…" : `Join as ${form.role} →`}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule)", textAlign: "center", fontSize: ".88rem", color: "var(--ink-faint)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--blue)" }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
