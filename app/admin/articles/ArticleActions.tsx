"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  border: "#2a2a2a", text3: "#555555",
  red: "#ff3838", amber: "#ff9500", green: "#00cc70",
};

export default function ArticleActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function togglePublish() {
    setLoading(true);
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    router.refresh();
    setLoading(false);
  }

  async function deleteArticle() {
    if (!confirm("이 기사를 삭제할까요?")) return;
    setLoading(true);
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
      <button onClick={togglePublish} disabled={loading}
        style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", background: isPublished ? C.amber : C.green, color: "#fff", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
        {loading ? "..." : isPublished ? "게시 취소" : "게시"}
      </button>
      <button onClick={deleteArticle} disabled={loading}
        style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: `1px solid ${C.border}`, cursor: loading ? "not-allowed" : "pointer", background: "transparent", color: C.text3, opacity: loading ? 0.6 : 1 }}>
        삭제
      </button>
    </div>
  );
}
