"use client";

import { useState } from "react";
import Link from "next/link";

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#1a1a1a", bd: "#2a2a2a",
  text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  red: "#ff3838", amber: "#ff9500", green: "#00cc70", blue: "#4a9eff",
};

export default function AdminArticlesNewPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("pokemon");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, content, summary, category, source,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          isPublished: true,
          publishedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setMessage("ok");
        setTitle(""); setContent(""); setSummary(""); setSource(""); setTags("");
      } else {
        setMessage("err");
      }
    } catch {
      setMessage("err");
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: C.s2,
    border: `1px solid ${C.bd}`,
    color: C.text,
    padding: "10px 12px",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    marginBottom: "6px",
    color: C.text3,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "20px 1.25rem 0", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 헤더 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: C.blue, background: "#0a1f3d", border: `1px solid ${C.blue}`, padding: "2px 8px", letterSpacing: "0.1em" }}>NEW ARTICLE</span>
              <span style={{ fontSize: "11px", color: C.text3 }}>기사 직접 작성</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href="/admin/articles" style={{ fontSize: "11px", color: C.text3, padding: "4px 10px", border: `1px solid ${C.bd}`, textDecoration: "none" }}>← 목록</Link>
              <Link href="/admin" style={{ fontSize: "11px", color: C.text3, padding: "4px 10px", border: `1px solid ${C.bd}`, textDecoration: "none" }}>ADMIN</Link>
            </div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 900, color: C.text }}>새 기사 작성</h1>
          </div>
        </div>

        {/* 결과 메시지 */}
        {message === "ok" && (
          <div style={{ padding: "12px 16px", background: "#002d1a", border: `1px solid ${C.green}`, fontSize: "13px", color: C.green, fontWeight: 700 }}>
            ✅ 기사가 등록됐습니다.
          </div>
        )}
        {message === "err" && (
          <div style={{ padding: "12px 16px", background: "#2d0808", border: `1px solid ${C.red}`, fontSize: "13px", color: C.red, fontWeight: 700 }}>
            ❌ 오류가 발생했습니다.
          </div>
        )}

        {/* 폼 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
          <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

            <div>
              <label style={labelStyle}>카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="pokemon">🎴 포켓몬</option>
                <option value="onepiece">☠️ 원피스</option>
                <option value="general">일반</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>제목 *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="기사 제목" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>요약</label>
              <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="한 줄 요약 (선택)" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>본문 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                placeholder="기사 본문"
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>출처</label>
                <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="예: 공식, 커뮤니티" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>태그 (쉼표 구분)</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="예: 발매, SAR, 시세" style={inputStyle} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? C.s2 : C.blue,
                color: "#fff", border: "none",
                padding: "12px 24px", fontSize: "13px", fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.08em",
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? "등록 중..." : "▶ 기사 등록"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
