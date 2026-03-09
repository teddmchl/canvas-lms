"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import DOMPurify from "isomorphic-dompurify";

export default function AssignmentPage({ params }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [existing, setExisting]     = useState(null);
  const [content, setContent]       = useState("");
  const [status, setStatus]         = useState("idle");
  const [error, setError]           = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading]     = useState(false);

  useEffect(() => {
    // Fetch assignment details + existing submission
    Promise.all([
      fetch(`/api/assignments?course=${params.id}`).then(r => r.json()),
      fetch(`/api/submissions?assignment=${params.assignmentId}`).then(r => r.json()),
    ]).then(([assignData, subData]) => {
      const a = assignData.assignments?.find(a => a._id === params.assignmentId);
      setAssignment(a);
      const sub = subData.submissions?.[0];
      if (sub) { 
        setExisting(sub); 
        setContent(sub.content); 
        setAttachments(sub.attachments || []);
      }
    });
  }, [params.id, params.assignmentId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError("Submission cannot be empty"); return; }
    setStatus("loading"); setError("");
    const r = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId: params.assignmentId, content, attachments }),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error); setStatus("error"); return; }
    setStatus("done");
    setTimeout(() => router.push(`/courses/${params.id}`), 1500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAttachments(prev => [...prev, data.url]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = null; // reset
    }
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
            <div className="prose-content" style={{ color: "var(--ink-mid)", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assignment.description) }} />
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
            {existing ? (
              <div className="prose-content" style={{ padding: "1rem", background: "var(--parchment)", border: "1px solid var(--rule)", borderRadius: "var(--radius)" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
            ) : (
              <RichTextEditor value={content} onChange={setContent} placeholder="Write your submission here…" />
            )}
          </div>

          {!existing && (
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label className="form-label">Attachments & Files</label>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexDirection: "column" }}>
                {attachments.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".5rem" }}>
                    {attachments.map((url, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".88rem", background: "var(--parchment-2)", padding: ".5rem .75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--rule)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)" }}>Attachment {i + 1}</a>
                        <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} style={{ color: "var(--red)", border: "none", background: "none", cursor: "pointer", marginLeft: "auto", padding: 0 }}>×</button>
                      </li>
                    ))}
                  </ul>
                )}
                
                <label className="btn btn-sm btn-secondary" style={{ cursor: uploading ? "wait" : "pointer" }}>
                  {uploading ? "Uploading…" : "+ Add File"}
                  <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          )}

          {existing && attachments.length > 0 && (
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label className="form-label">Attachments</label>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".88rem", background: "var(--parchment-2)", padding: ".5rem .75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--rule)", color: "var(--blue)", textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                    File {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

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
