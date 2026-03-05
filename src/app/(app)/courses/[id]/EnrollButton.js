"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId, isEnrolled: initial, published }) {
  const [enrolled, setEnrolled] = useState(initial);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const toggle = async () => {
    if (enrolled) {
      if (!window.confirm("Are you sure you want to unenroll from this course? This action cannot be undone.")) return;
    }

    setLoading(true);
    if (!enrolled) {
      const r = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (r.ok) { setEnrolled(true); router.refresh(); }
    } else {
      const r = await fetch(`/api/enrollments?course=${courseId}`, { method: "DELETE" });
      if (r.ok) { setEnrolled(false); router.refresh(); }
    }
    setLoading(false);
  };

  if (!published) return <button className="btn btn-secondary" style={{ width: "100%" }} disabled>Not yet published</button>;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${enrolled ? "btn-secondary" : "btn-primary"}`}
      style={{ width: "100%", justifyContent: "center" }}
    >
      {loading ? "…" : enrolled ? "Unenroll" : "Enrol in Course →"}
    </button>
  );
}
