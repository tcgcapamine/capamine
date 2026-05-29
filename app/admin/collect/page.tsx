"use client";

import { useState } from "react";
import Link from "next/link";
import { NEWS_SOURCES } from "@/lib/sources/config";

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#1a1a1a", bd: "#2a2a2a",
  text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  pk: "#ff9500", pkDim: "#2d1a00",
  op: "#e03030", opDim: "#2d0808",
  green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

interface CollectResult {
  source: string;
  type: "rss" | "scrape";
  fetched: number;
  saved: number;
  skipped: number;
  errors: string[];
}
interface CollectSummary {
  ok: boolean;
  totalSaved: number;
  durationMs: number;
  results: CollectResult[];
  error?: string;
}

const LANG_BADGE: Record<string, { label: string; color: string }> = {
  en: { label: "EN", color: C.blue },
  ja: { label: "JA", color: "#ff6b35" },
  ko: { label: "KR", color: C.green },
};

const CAT_SOURCES = {
  pokemon:  NEWS_SOURCES.filter((s) => s.category === "pokemon"),
  onepiece: NEWS_SOURCES.filter((s) => s.category === "onepiece"),
};

export default function CollectPage() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<CollectSummary | null>(null);
  const [category, setCategory] = useState<"all" | "pokemon" | "onepiece">("all");

  async function runCollect() {
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category === "all" ? {} : { categories: [category] }),
      });
      const data = await res.json();
      setSummary({ ok: true, ...data });
    } catch (e) {
      setSummary({ ok: false, totalSaved: 0, durationMs: 0, results: [], error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  const totalSources = category === "all" ? NEWS_SOURCES.length
    : NEWS_SOURCES.filter((s) => s.category === category).length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "60px" }}>

      {/* 헤더 */}
      <div style={{ background: `linear-gradient(180deg, #002d1a 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 1.25rem 20px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 900, color: C.green, background: "#002d1a", border: `1px solid ${C.green}`, padding: "3px 10px", letterSpacing: "0.12em" }}>AUTO COLLECT</span>
            <span style={{ fontSize: "11px", color: C.text3 }}>RSS + 공식사이트 → Claude AI 번역 → DB</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#fff" }}>자동 수집</h1>
              <p style={{ fontSize: "12px", color: C.text3, marginTop: "4px" }}>
                {NEWS_SOURCES.filter((s) => s.type === "rss").length}개 RSS · {NEWS_SOURCES.filter((s) => s.type === "scrape").length}개 공식사이트 · 총 {NEWS_SOURCES.length}개 소스
              </p>
            </div>
            <Link href="/admin" style={{ fontSize: "11px", color: C.text3, padding: "5px 12px", border: `1px solid ${C.bd}`, textDecoration: "none" }}>← ADMIN</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 1.25rem", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* 수집 실행 컨트롤 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "4px", height: "18px", background: C.green, display: "inline-block" }} />
            <span style={{ fontSize: "13px", fontWeight: 900, color: C.text }}>수집 실행</span>
          </div>
          <div style={{ padding: "20px", display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: C.text3, letterSpacing: "0.12em", marginBottom: "8px" }}>카테고리 선택</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["all", "pokemon", "onepiece"] as const).map((c) => {
                  const active = category === c;
                  const color = c === "pokemon" ? C.pk : c === "onepiece" ? C.op : C.green;
                  return (
                    <button key={c} onClick={() => setCategory(c)}
                      style={{
                        padding: "6px 16px", fontSize: "12px", fontWeight: 700,
                        border: `1px solid ${active ? color : C.bd}`,
                        background: active ? C.s2 : "transparent",
                        color: active ? color : C.text3,
                        cursor: "pointer",
                      }}>
                      {c === "all" ? "전체" : c === "pokemon" ? "🎴 포켓몬" : "☠️ 원피스"}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={runCollect} disabled={loading}
              style={{
                padding: "10px 32px", fontSize: "13px", fontWeight: 900,
                background: loading ? C.s2 : C.green,
                color: loading ? C.text3 : "#000",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.08em", opacity: loading ? 0.7 : 1,
              }}>
              {loading ? `⏳ 수집 중... (${totalSources}개 소스)` : `▶ 수집 시작 (${totalSources}개 소스)`}
            </button>

            {loading && (
              <div style={{ fontSize: "12px", color: C.text3 }}>
                번역 포함 시 소스당 ~30초 소요 · 총 {Math.round(totalSources * 0.5)}~{totalSources * 2}분 예상
              </div>
            )}
          </div>
        </div>

        {/* 결과 */}
        {summary && (
          <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "4px", height: "18px", background: summary.error ? C.red : summary.totalSaved > 0 ? C.green : C.text3, display: "inline-block" }} />
              <span style={{ fontSize: "13px", fontWeight: 900, color: C.text }}>수집 결과</span>
              {summary.durationMs > 0 && (
                <span style={{ fontSize: "10px", color: C.text3 }}>{(summary.durationMs / 1000).toFixed(1)}초 소요</span>
              )}
            </div>

            {summary.error ? (
              <div style={{ padding: "20px", color: C.red, fontSize: "13px" }}>오류: {summary.error}</div>
            ) : (
              <>
                {/* 요약 통계 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${C.bd}` }}>
                  {[
                    { label: "신규 저장", value: summary.totalSaved, color: C.green },
                    { label: "총 수집", value: summary.results.reduce((s, r) => s + r.fetched, 0), color: C.blue },
                    { label: "중복 스킵", value: summary.results.reduce((s, r) => s + r.skipped, 0), color: C.text3 },
                    { label: "오류 소스", value: summary.results.filter((r) => r.errors.length > 0).length, color: C.red },
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: "16px", borderRight: i < 3 ? `1px solid ${C.bd}` : "none" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "28px", fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: "10px", color: C.text3, marginTop: "4px", fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* 소스별 결과 */}
                {summary.results.map((r, i) => (
                  <div key={i} style={{
                    padding: "10px 16px",
                    borderBottom: i < summary.results.length - 1 ? `1px solid ${C.bd}` : "none",
                    background: r.errors.length > 0 ? "#1a0808" : "transparent",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: r.type === "scrape" ? C.pk : C.blue, background: r.type === "scrape" ? C.pkDim : "#0a1f3d", padding: "1px 6px" }}>
                          {r.type === "scrape" ? "WEB" : "RSS"}
                        </span>
                        <span style={{ fontSize: "12px", color: r.errors.length > 0 ? C.red : C.text2 }}>{r.source}</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontFamily: "monospace" }}>
                        <span style={{ color: C.green }}>+{r.saved}</span>
                        <span style={{ color: C.text3 }}>skip {r.skipped}</span>
                        <span style={{ color: C.blue }}>fetch {r.fetched}</span>
                      </div>
                    </div>
                    {r.errors.length > 0 && (
                      <div style={{ fontSize: "11px", color: C.red, marginTop: "5px", padding: "5px 8px", background: "#200808", border: `1px solid ${C.opDim}` }}>
                        ⚠ {r.errors.slice(0, 2).join(" / ")}
                      </div>
                    )}
                  </div>
                ))}

                {summary.totalSaved > 0 && (
                  <div style={{ padding: "12px 16px", background: C.s2, borderTop: `1px solid ${C.bd}` }}>
                    <Link href="/admin/articles" style={{ fontSize: "12px", color: C.green, textDecoration: "none", fontWeight: 700 }}>
                      → 기사 목록 보기 ({summary.totalSaved}건 저장됨)
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 소스 목록 — 카테고리별 분리 */}
        {(["pokemon", "onepiece"] as const).map((cat) => {
          const catColor = cat === "pokemon" ? C.pk : C.op;
          const catDim   = cat === "pokemon" ? C.pkDim : C.opDim;
          const catLabel = cat === "pokemon" ? "🎴 POKÉMON" : "☠️ ONE PIECE";
          const srcs = CAT_SOURCES[cat];

          return (
            <div key={cat} style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "4px", height: "18px", background: catColor, display: "inline-block" }} />
                <span style={{ fontSize: "13px", fontWeight: 900, color: C.text }}>{catLabel}</span>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: catColor }}>{srcs.length}개 소스</span>
              </div>

              {srcs.map((s, i) => {
                const lang = LANG_BADGE[s.lang] ?? { label: s.lang.toUpperCase(), color: C.text3 };
                return (
                  <div key={i} style={{
                    padding: "10px 16px",
                    borderBottom: i < srcs.length - 1 ? `1px solid ${C.bd}` : "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px",
                  }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", minWidth: 0 }}>
                      {/* RSS vs SCRAPE 뱃지 */}
                      <span style={{
                        fontSize: "9px", fontWeight: 800, padding: "2px 6px",
                        color: s.type === "scrape" ? catColor : C.blue,
                        background: s.type === "scrape" ? catDim : "#0a1f3d",
                        border: `1px solid ${s.type === "scrape" ? catColor : C.blue}`,
                        flexShrink: 0, letterSpacing: "0.08em",
                      }}>
                        {s.type === "scrape" ? "WEB" : "RSS"}
                      </span>
                      <span style={{ fontSize: "12px", color: C.text2 }}>{s.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "1px 6px",
                        color: lang.color, background: "#0a0a0a", border: `1px solid ${lang.color}`,
                      }}>
                        {lang.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* 소셜 미디어 — 안내 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "4px", height: "18px", background: C.text3, display: "inline-block" }} />
            <span style={{ fontSize: "13px", fontWeight: 900, color: C.text }}>소셜 미디어</span>
            <span style={{ fontSize: "10px", color: C.text3, fontWeight: 700 }}>API 연동 필요</span>
          </div>
          <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "𝕏", name: "Twitter / X", desc: "@PokemonTCGKR · @PokemonJP · @onepiecetcg_en 등", note: "유료 API ($100/월 Basic)", color: "#1DA1F2" },
              { icon: "📸", name: "Instagram", desc: "@pokemontcg · @onepiecetcg 등 공식 계정", note: "앱 심사 후 API 발급", color: "#E1306C" },
              { icon: "▶", name: "YouTube", desc: "포켓몬 코리아 · Bandai Card Games 공식 채널", note: "YouTube Data API (무료 할당량 있음)", color: "#FF0000" },
            ].map((sm) => (
              <div key={sm.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: C.s2, border: `1px solid ${C.bd}` }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "16px" }}>{sm.icon}</span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: sm.color }}>{sm.name}</div>
                    <div style={{ fontSize: "11px", color: C.text3 }}>{sm.desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: "10px", color: C.text3, background: "#200808", border: `1px solid ${C.bd}`, padding: "2px 8px", flexShrink: 0 }}>
                  {sm.note}
                </span>
              </div>
            ))}
            <div style={{ fontSize: "11px", color: C.text3, padding: "8px 12px", background: C.s2, border: `1px solid ${C.bd}` }}>
              💡 트위터·인스타 공식 계정의 주요 공지는 Google News가 뉴스로 커버합니다. API 연동을 원하시면 각 플랫폼에서 키를 발급받아 .env에 추가하면 연동 모듈을 추가할 수 있습니다.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
