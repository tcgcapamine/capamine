"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkDelete({ totalCount }: { totalCount: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`기사 전체 ${totalCount}건을 삭제할까요?\n삭제 후 자동 수집을 다시 실행하세요.`)) return;
    setLoading(true);
    await fetch("/api/articles/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    router.refresh();
    setLoading(false);
  }

  if (totalCount === 0) return null;

  return (
    <button onClick={handleDelete} disabled={loading}
      style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: loading ? "#222" : "#2d0808", border: "1px solid #ff3838", padding: "4px 12px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
      {loading ? "삭제 중..." : `전체 삭제 (${totalCount}건)`}
    </button>
  );
}
