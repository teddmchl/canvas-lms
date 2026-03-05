"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from   = params.get("from") || "/dashboard";

  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error); return; }
      router.push(from);
      router.refresh();
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <div className="auth-brand">Canvas<span>LMS</span></div>
        <h2 className="auth-panel-headline">
          Good to have<br />you back.
        </h2>
        <p className="auth-panel-sub">
          Sign in to access your courses, assignments, and progress — right where you left off.
        </p>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-sub">Enter your credentials to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" required className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handle} autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" required className="form-input"
                placeholder="••••••••" value={form.password} onChange={handle} autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: ".5rem" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--rule)", textAlign: "center", fontSize: ".88rem", color: "var(--ink-faint)" }}>
            No account? <Link href="/register" style={{ color: "var(--blue)" }}>Create one</Link>
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--parchment-2)", borderRadius: "var(--radius)", fontSize: ".78rem", color: "var(--ink-faint)" }}>
            <strong style={{ color: "var(--ink-mid)" }}>Demo accounts</strong><br />
            Instructor: instructor@demo.com / demo1234<br />
            Student: student@demo.com / demo1234
          </div>
        </div>
      </div>
    </div>
  );
}
