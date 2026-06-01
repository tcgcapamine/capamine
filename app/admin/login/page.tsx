"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#181818",
  bd: "#272727", text: "#f0f0f0", text2: "#999999", text3: "#4a4a4a",
  pk: "#ff9500", red: "#ff3838",
};

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("비밀번호가 틀렸습니다.");
      setLoading(false);
    }
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "360px", padding: "0 1.25rem" }}>

        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", background: C.pk, marginBottom: "16px" }}>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#fff" }}>카</span>
          </div>
          <div style={{ fontSize: "14px", color: C.text2 }}>카파민 관리자</div>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ background: C.s1, border: `1px solid ${C.bd}`, padding: "28px 24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", color: C.text3, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>
                ADMIN PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                autoFocus
                style={{
                  width: "100%", padding: "10px 14px",
                  background: C.s2, border: `1px solid ${error ? C.red : C.bd}`,
                  color: C.text, fontSize: "14px", outline: "none",
                }}
              />
              {error && <p style={{ fontSize: "12px", color: C.red, marginTop: "8px" }}>{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: "100%", padding: "11px",
                background: password && !loading ? C.pk : C.s2,
                border: "none", color: password && !loading ? "#fff" : C.text3,
                fontSize: "13px", fontWeight: 800, cursor: password && !loading ? "pointer" : "default",
                letterSpacing: "0.08em", transition: "background 0.15s",
              }}>
              {loading ? "확인 중..." : "로그인"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
