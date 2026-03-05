"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COLORS = [
  "#1d4ed8", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#be185d", "#374151",
];

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", subject: "", level: "Beginner", coverColor: COLORS[0], published: false,
  });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true); setError("");
    const r = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error); setLoading(false); return; }
    router.push(`/instructor/courses/${data.course._id}`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="breadcrumb">
              <Link href="/instructor/courses">My Courses</Link>
              <span className="breadcrumb-sep">›</span>
              <span>New Course</span>
            </div>
            <div className="page-eyebrow">Instructor</div>
            <h1 className="page-title">Create a Course</h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 720, paddingBottom: "3rem" }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "2rem", marginBottom: "1.25rem" }}>
            <h3 style={{ fontFamily: "var(--ff-serif)", marginBottom: "1.5rem", paddingBottom: ".75rem", borderBottom: "1px solid var(--rule)" }}>Course Details</h3>

            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input name="title" className="form-input" required placeholder="e.g. Introduction to Python" value={form.title} onChange={handle} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" rows={4}
                placeholder="What will students learn in this course?" value={form.description} onChange={handle} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input name="subject" className="form-input" placeholder="e.g. Programming, Mathematics…" value={form.subject} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select name="level" className="form-select" value={form.level} onChange={handle}>
                  {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "2rem", marginBottom: "1.25rem" }}>
            <h3 style={{ fontFamily: "var(--ff-serif)", marginBottom: "1.5rem", paddingBottom: ".75rem", borderBottom: "1px solid var(--rule)" }}>Appearance</h3>
            <div className="form-group">
              <label className="form-label">Course Colour</label>
              <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".25rem" }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                    style={{
                      width: 36, height: 36, borderRadius: "50%", background: c, border: `3px solid ${form.coverColor === c ? "var(--ink)" : "transparent"}`,
                      outline: form.coverColor === c ? "2px solid #fff" : "none", outlineOffset: "-4px", cursor: "pointer",
                    }}
                  />
                ))}
              </div>
              <div className="form-hint">This colour appears as the course card accent strip</div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: ".2rem" }}>Publish immediately</div>
              <div style={{ fontSize: ".82rem", color: "var(--ink-faint)" }}>Students can find and enrol as soon as you save</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: ".6rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "var(--blue)" }} />
              <span style={{ fontSize: ".9rem", fontWeight: 500 }}>{form.published ? "Yes" : "No"}</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
            <Link href="/instructor/courses" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create Course →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
