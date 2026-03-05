"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AssignmentPage({ params }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [existing, setExisting]     = useState(null);
  const [content, setContent]       = useState("");
  const [status, setStatus]         = useState("idle"); // idle | loading | done | error
  const [error, setError]           = useState("");

  useEffect(() => {
    // Fetch assignment details + existing submission
    Promise.all([
      fetch(`/api/assignments?course=${params.id}`).then(r => r.json()),
      fetch(`/api/submissions?assignment=${params.assignmentId}`).then(r => r.json()),
    ]).then(([assignData, subData]) => {
      const a = assignData.assignments?.find(a => a._id === params.assignmentId);
      setAssignment(a);
      const sub = subData.submissions?.[0];
      if (sub) { setExisting(sub); setContent(sub.content); }
    });
  }, [params.id, params.assignmentId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError("Submission cannot be empty"); return; }
    setStatus("loading"); setError("");
    const r = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId: params.assignmentId, content }),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error); setStatus("error"); return; }
    setStatus("done");
    setTimeout(() => router.push(`/courses/${params.id}`), 1500);
  };

  if (!assignment) return <div className="loading-screen"><div className="spinner" /></div>;

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="breadcrumb">
              <Link href="/courses">Courses</Link>
              <span className="breadcrumb-sep">›</span>
              <Link href={`/courses/${params.id}`}>Course</Link>
              <span className="breadcrumb-sep">›</span>
              <span>{assignment.title}</span>
            </div>
            <div className="page-eyebrow">Assignment</div>
            <h1 className="page-title">{assignment.title}</h1>
            <div style={{ display: "flex", gap: "1rem", marginTop: ".5rem", flexWrap: "wrap", fontSize: ".88rem", color: "var(--ink-faint)" }}>
              <span>Max points: <strong style={{ color: "var(--ink-mid)" }}>{assignment.maxPoints}</strong></span>
              {dueDate && <span>Due: <strong style={{ color: "var(--ink-mid)" }}>{dueDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}</strong></span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 760, paddingBottom: "3rem" }}>
        {assignment.description && (
          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "1.5rem", marginBottom: "1.75rem" }}>
            <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: ".6rem" }}>Instructions</div>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.65 }}>{assignment.description}</p>
          </div>
        )}

        {/* Already graded */}
        {existing?.status === "graded" && (
          <div className="alert alert-success" style={{ marginBottom: "1.75rem" }}>
            <div>
              <strong>Graded — {existing.grade}/{assignment.maxPoints} points</strong>
              {existing.feedback && <p style={{ marginTop: ".35rem", fontSize: ".9rem" }}>{existing.feedback}</p>}
            </div>
          </div>
        )}

        {/* Already submitted but not graded */}
        {existing?.status === "submitted" && (
          <div className="alert alert-info" style={{ marginBottom: "1.75rem" }}>
            Submitted and awaiting grading. Your submission is shown below.
          </div>
        )}

        {status === "done" && (
          <div className="alert alert-success">Submitted successfully! Redirecting…</div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "1.75rem" }}>
          <div className="form-group">
            <label className="form-label">Your Answer</label>
            <textarea
              className="form-textarea"
              rows={12}
              placeholder="Write your submission here…"
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={!!existing}
              style={{ fontSize: "1rem", lineHeight: 1.7 }}
            />
          </div>

          {!existing && (
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
              <Link href={`/courses/${params.id}`} className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "Submitting…" : "Submit Assignment →"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
