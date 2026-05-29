"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkPublish({ count }: { count: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleBulk() {
    if (!confirm(`미게시 기사 ${count}건을 전체 게시할까요?`)) return;
    setLoading(true);
    await fetch("/api/articles/bulk", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={handleBulk} disabled={loading}
      style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: loading ? "#222" : "#00cc70", border: "none", padding: "4px 12px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
      {loading ? "처리 중..." : `전체 게시 (${count}건)`}
    </button>
  );
}
