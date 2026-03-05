"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function gradePct(grade, max) {
  return Math.round((grade / max) * 100);
}
function gradeClass(pct) {
  if (pct >= 90) return "grade-a";
  if (pct >= 75) return "grade-b";
  if (pct >= 60) return "grade-c";
  return "grade-d";
}

export default function GradingPage({ params }) {
  const searchParams   = useSearchParams();
  const focusAssignment = searchParams.get("assignment");

  const [courseId]    = useState(params.id);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected]       = useState(null); // active submission
  const [filterAssign, setFilterAssign] = useState(focusAssignment || "all");
  const [grade, setGrade]   = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  /* ── Fetch submissions (called on mount + polling) ── */
  const fetchSubmissions = useCallback(async () => {
    const url = filterAssign !== "all"
      ? `/api/submissions?assignment=${filterAssign}`
      : `/api/submissions?course=${courseId}`;
    const r = await fetch(url);
    if (!r.ok) return;
    const data = await r.json();
    setSubmissions(data.submissions || []);
    setLastRefresh(new Date());
  }, [courseId, filterAssign]);

  /* ── Fetch assignments once ── */
  useEffect(() => {
    fetch(`/api/assignments?course=${courseId}`)
      .then(r => r.json())
      .then(data => setAssignments(data.assignments || []));
  }, [courseId]);

  /* ── Fetch submissions + 5s polling (real-time feel) ── */
  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [fetchSubmissions]);

  /* ── When a submission is selected, pre-fill grade if already graded ── */
  useEffect(() => {
    if (selected) {
      setGrade(selected.grade !== null && selected.grade !== undefined ? String(selected.grade) : "");
      setFeedback(selected.feedback || "");
    }
  }, [selected]);

  /* ── Submit grade ── */
  const submitGrade = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) { flash("Enter a valid grade"); return; }
    setSaving(true);
    const r = await fetch(`/api/submissions/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade: numGrade, feedback }),
    });
    const data = await r.json();
    if (r.ok) {
      // Update local state immediately
      setSubmissions(prev => prev.map(s => s._id === selected._id ? { ...s, ...data.submission, status: "graded" } : s));
      setSelected(s => ({ ...s, ...data.submission, status: "graded" }));
      flash("Grade saved!");
    } else {
      flash(data.error || "Failed to save");
    }
    setSaving(false);
  };

  const filtered = filterAssign === "all"
    ? submissions
    : submissions.filter(s => s.assignment?._id === filterAssign);

  const pending = filtered.filter(s => s.status === "submitted").length;
  const graded  = filtered.filter(s => s.status === "graded").length;

  const assignmentTitle = filterAssign !== "all"
    ? assignments.find(a => a._id === filterAssign)?.title
    : null;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="breadcrumb">
              <Link href="/instructor/courses">My Courses</Link>
              <span className="breadcrumb-sep">›</span>
              <Link href={`/instructor/courses/${courseId}`}>Course</Link>
              <span className="breadcrumb-sep">›</span>
              <span>Grading</span>
            </div>
            <div className="page-eyebrow">Grading Interface</div>
            <h1 className="page-title">{assignmentTitle || "All Assignments"}</h1>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: ".5rem" }}>
              {pending > 0 && <span className="badge badge-amber">{pending} pending</span>}
              {graded  > 0 && <span className="badge badge-green">{graded} graded</span>}
              <span className="live-dot">Live</span>
              {lastRefresh && <span style={{ fontSize: ".72rem", color: "var(--ink-faint)" }}>Updated {lastRefresh.toLocaleTimeString("en-GB", { timeStyle: "short" })}</span>}
            </div>
          </div>

          {/* Assignment filter */}
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <button onClick={() => setFilterAssign("all")} className={`btn btn-sm ${filterAssign === "all" ? "btn-primary" : "btn-secondary"}`}>
              All
            </button>
            {assignments.map(a => (
              <button key={a._id} onClick={() => setFilterAssign(a._id)}
                className={`btn btn-sm ${filterAssign === a._id ? "btn-primary" : "btn-secondary"}`}>
                {a.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {msg && <div className="alert alert-success">{msg}</div>}

        {filtered.length === 0 ? (
          <div className="empty-state" style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)" }}>
            <div className="empty-icon">📭</div>
            <div className="empty-title">No submissions yet</div>
            <div className="empty-sub">Submissions will appear here automatically every 5 seconds</div>
          </div>
        ) : (
          <div className="grading-layout">
            {/* Sidebar — submission list */}
            <div className="grading-sidebar">
              <div className="grading-sidebar-header">
                {filtered.length} submission{filtered.length !== 1 ? "s" : ""}
              </div>
              {filtered.map(s => (
                <div
                  key={s._id}
                  className={`submission-list-item ${selected?._id === s._id ? "active" : ""}`}
                  onClick={() => setSelected(s)}
                >
                  <div className="sub-avatar">{initials(s.student?.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sub-name">{s.student?.name}</div>
                    <div className="sub-status">
                      {s.status === "graded"
                        ? <span style={{ color: "var(--green)" }}>Graded — {s.grade}/{s.assignment?.maxPoints}</span>
                        : <span style={{ color: "var(--amber)" }}>Awaiting grade</span>
                      }
                    </div>
                  </div>
                  {s.status === "graded" && (
                    <span className={`grade-pill ${gradeClass(gradePct(s.grade, s.assignment?.maxPoints))}`} style={{ fontSize: ".72rem", padding: "2px 6px" }}>
                      {gradePct(s.grade, s.assignment?.maxPoints)}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Main panel */}
            <div className="grading-main">
              {!selected ? (
                <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                  <div className="empty-icon">👈</div>
                  <div className="empty-title">Select a submission</div>
                  <div className="empty-sub">Click a student on the left to review their work</div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div>
                      <div style={{ fontFamily: "var(--ff-serif)", fontSize: "1.2rem", fontWeight: 700 }}>{selected.student?.name}</div>
                      <div style={{ fontSize: ".82rem", color: "var(--ink-faint)" }}>{selected.student?.email}</div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: ".82rem", color: "var(--ink-faint)" }}>
                      <div>Assignment: <strong style={{ color: "var(--ink-mid)" }}>{selected.assignment?.title}</strong></div>
                      <div>Submitted {new Date(selected.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</div>
                    </div>
                  </div>

                  {/* Submission content */}
                  <div style={{ background: "var(--parchment)", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "1.75rem", fontFamily: "var(--ff-serif)", fontSize: "1rem", lineHeight: 1.75, color: "var(--ink-mid)", minHeight: 120, whiteSpace: "pre-wrap" }}>
                    {selected.content || <em style={{ color: "var(--ink-faint)" }}>No content</em>}
                  </div>

                  {/* Grade form */}
                  <form onSubmit={submitGrade}>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ flex: "0 0 auto" }}>
                        <label className="form-label" style={{ marginBottom: ".5rem", display: "block" }}>Grade</label>
                        <div className="grade-input-wrap">
                          <input
                            type="number"
                            className="grade-input"
                            min={0}
                            max={selected.assignment?.maxPoints || 100}
                            value={grade}
                            onChange={e => setGrade(e.target.value)}
                            placeholder="0"
                          />
                          <span className="grade-max">/ {selected.assignment?.maxPoints || 100} pts</span>
                          {grade && (
                            <span className={`grade-pill ${gradeClass(gradePct(parseFloat(grade), selected.assignment?.maxPoints || 100))}`}>
                              {gradePct(parseFloat(grade), selected.assignment?.maxPoints || 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="form-label" style={{ marginBottom: ".5rem", display: "block" }}>Feedback</label>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          placeholder="Write feedback for the student…"
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: ".75rem", marginTop: ".75rem" }}>
                      {/* Quick grade next */}
                      {(() => {
                        const idx    = filtered.indexOf(filtered.find(s => s._id === selected._id));
                        const next   = filtered[idx + 1];
                        return next ? (
                          <button type="button" onClick={() => setSelected(next)} className="btn btn-secondary btn-sm">
                            Next →
                          </button>
                        ) : null;
                      })()}
                      <button type="submit" disabled={saving || !grade} className="btn btn-primary">
                        {saving ? "Saving…" : selected.status === "graded" ? "Update Grade" : "Save Grade"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
