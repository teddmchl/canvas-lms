"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COLORS = [
  "#1d4ed8", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#be185d", "#374151",
];

export default function CourseManageClient({ course: initial, assignments: initialAssignments, enrollmentCount, pendingCount, gradedCount }) {
  const router = useRouter();
  const [course, setCourse]   = useState(initial);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [tab, setTab]         = useState("overview"); // overview | assignments | settings
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  // Edit form state (settings tab)
  const [form, setForm] = useState({
    title: initial.title, description: initial.description || "",
    subject: initial.subject || "", level: initial.level || "Beginner",
    coverColor: initial.coverColor || COLORS[0],
  });

  // New assignment form
  const [newAssign, setNewAssign] = useState({ title: "", description: "", dueDate: "", maxPoints: 100 });
  const [addingAssign, setAddingAssign] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  /* ── Toggle publish ── */
  const togglePublish = async () => {
    setSaving(true);
    const r = await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    });
    const data = await r.json();
    if (r.ok) { setCourse(data.course); flash(data.course.published ? "Course published!" : "Course unpublished"); }
    setSaving(false);
  };

  /* ── Save settings ── */
  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const r = await fetch(`/api/courses/${course._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (r.ok) { setCourse(data.course); flash("Saved!"); }
    setSaving(false);
  };

  /* ── Add assignment ── */
  const addAssignment = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    const r = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course._id, ...newAssign }),
    });
    const data = await r.json();
    if (r.ok) {
      setAssignments(p => [...p, data.assignment]);
      setNewAssign({ title: "", description: "", dueDate: "", maxPoints: 100 });
      setAddingAssign(false);
      flash("Assignment added!");
    }
    setAssignLoading(false);
  };

  const tabs = ["overview", "assignments", "settings"];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="breadcrumb">
              <Link href="/instructor/courses">My Courses</Link>
              <span className="breadcrumb-sep">›</span>
              <span>{course.title}</span>
            </div>
            <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
              <span className={`badge ${course.published ? "badge-green" : "badge-amber"}`}>
                {course.published ? "Published" : "Draft"}
              </span>
            </div>
            <h1 className="page-title">{course.title}</h1>
          </div>
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <Link href={`/instructor/courses/${course._id}/grades`} className="btn btn-primary">
              Grade Submissions {pendingCount > 0 && `(${pendingCount})`}
            </Link>
            <button onClick={togglePublish} disabled={saving} className="btn btn-secondary">
              {saving ? "…" : course.published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Tab bar */}
        <div style={{ display: "flex", gap: ".25rem", borderBottom: "2px solid var(--rule)", marginBottom: "2rem" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: "var(--ff-sans)", fontWeight: 600, fontSize: ".88rem",
              padding: ".65rem 1.25rem", background: "none", border: "none",
              borderBottom: `2px solid ${tab === t ? "var(--blue)" : "transparent"}`,
              color: tab === t ? "var(--blue)" : "var(--ink-faint)",
              cursor: "pointer", marginBottom: "-2px", textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === "overview" && (
          <div>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-num">{enrollmentCount}</div>
                <div className="analytics-label">Students Enrolled</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-num" style={{ color: "var(--amber)" }}>{pendingCount}</div>
                <div className="analytics-label">Pending Grades</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-num" style={{ color: "var(--green)" }}>{gradedCount}</div>
                <div className="analytics-label">Graded</div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "1.75rem" }}>
              <h3 style={{ fontFamily: "var(--ff-serif)", marginBottom: "1rem" }}>Course Info</h3>
              {[
                ["Title",   course.title],
                ["Subject", course.subject || "—"],
                ["Level",   course.level],
                ["Status",  course.published ? "Published" : "Draft"],
                ["Assignments", assignments.length],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", padding: ".6rem 0", borderBottom: "1px solid var(--parchment-2)", fontSize: ".92rem" }}>
                  <span style={{ width: 140, color: "var(--ink-faint)", flexShrink: 0 }}>{k}</span>
                  <span style={{ color: "var(--ink-mid)", fontWeight: 500 }}>{String(v)}</span>
                </div>
              ))}
              {course.description && (
                <div style={{ display: "flex", padding: ".6rem 0", fontSize: ".92rem" }}>
                  <span style={{ width: 140, color: "var(--ink-faint)", flexShrink: 0 }}>Description</span>
                  <span style={{ color: "var(--ink-mid)" }}>{course.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Assignments tab ── */}
        {tab === "assignments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
              <button onClick={() => setAddingAssign(p => !p)} className="btn btn-primary btn-sm">
                {addingAssign ? "Cancel" : "+ Add Assignment"}
              </button>
            </div>

            {addingAssign && (
              <form onSubmit={addAssignment} style={{ background: "var(--blue-pale)", border: "1px solid var(--blue-bdr)", borderRadius: "var(--radius)", padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontFamily: "var(--ff-serif)", fontSize: "1rem", marginBottom: "1rem" }}>New Assignment</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" required placeholder="Assignment title"
                      value={newAssign.title} onChange={e => setNewAssign(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Points</label>
                    <input className="form-input" type="number" min={1} max={1000}
                      value={newAssign.maxPoints} onChange={e => setNewAssign(p => ({ ...p, maxPoints: parseInt(e.target.value) || 100 }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input className="form-input" type="date"
                      value={newAssign.dueDate} onChange={e => setNewAssign(p => ({ ...p, dueDate: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions</label>
                  <textarea className="form-textarea" rows={3} placeholder="What should students do?"
                    value={newAssign.description} onChange={e => setNewAssign(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: ".75rem" }}>
                  <button type="button" onClick={() => setAddingAssign(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" disabled={assignLoading} className="btn btn-primary btn-sm">
                    {assignLoading ? "Adding…" : "Add Assignment"}
                  </button>
                </div>
              </form>
            )}

            {assignments.length === 0 ? (
              <div className="empty-state" style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)" }}>
                <div className="empty-icon">📝</div>
                <div className="empty-title">No assignments yet</div>
                <div className="empty-sub">Add your first assignment above</div>
              </div>
            ) : (
              <div className="assignment-list">
                {assignments.map((a, i) => (
                  <div key={a._id} className="assignment-item">
                    <div className="assignment-num">{i + 1}</div>
                    <div className="assignment-info">
                      <div className="assignment-title">{a.title}</div>
                      <div className="assignment-meta">
                        {a.maxPoints} pts
                        {a.dueDate && <span style={{ marginLeft: ".75rem" }}>Due {new Date(a.dueDate).toLocaleDateString("en-GB", { dateStyle: "medium" })}</span>}
                      </div>
                    </div>
                    <Link href={`/instructor/courses/${course._id}/grades?assignment=${a._id}`} className="btn btn-secondary btn-sm">
                      Grade
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings tab ── */}
        {tab === "settings" && (
          <form onSubmit={saveSettings}>
            <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "2rem", marginBottom: "1.25rem" }}>
              <h3 style={{ fontFamily: "var(--ff-serif)", marginBottom: "1.5rem", paddingBottom: ".75rem", borderBottom: "1px solid var(--rule)" }}>Edit Course</h3>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Colour</label>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".25rem" }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: `3px solid ${form.coverColor === c ? "var(--ink)" : "transparent"}`, outline: form.coverColor === c ? "2px solid #fff" : "none", outlineOffset: "-4px", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: ".75rem" }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
