import { prisma } from "@/lib/db";
import { format, isBefore, startOfDay, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "발매 일정 · 카파민" };

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#1a1a1a", bd: "#2a2a2a",
  text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  pk: "#ff9500", pkDim: "#2d1a00",
  op: "#e03030", opDim: "#2d0808",
  green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

const CAT = {
  pokemon:  { label: "POKÉMON",   color: C.pk,   dim: C.pkDim, emoji: "🎴" },
  onepiece: { label: "ONE PIECE", color: C.op,   dim: C.opDim, emoji: "☠️" },
  event:    { label: "EVENT",     color: C.blue,  dim: "#0a1f3d", emoji: "📅" },
};

function catOf(k: string) { return CAT[k as keyof typeof CAT] ?? CAT.event; }

export default async function CalendarPage() {
  const all = await prisma.releaseEvent.findMany({ orderBy: { releaseDate: "asc" } });
  const today = startOfDay(new Date());
  const upcoming = all.filter((e) => !isBefore(new Date(e.releaseDate), today));
  const past = all.filter((e) => isBefore(new Date(e.releaseDate), today)).reverse();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "60px" }}>

      {/* 히어로 헤더 */}
      <div style={{ background: `linear-gradient(180deg, #0a1f3d 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 1.25rem 24px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 900, color: C.blue, background: "#0a1f3d", border: `1px solid ${C.blue}`, padding: "3px 10px", letterSpacing: "0.12em" }}>📅 RELEASE CALENDAR</span>
            <span style={{ fontSize: "11px", color: C.text3, letterSpacing: "0.1em" }}>{format(today, "yyyy.MM.dd (EEE)", { locale: ko })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "6px" }}>발매 일정</h1>
              <p style={{ fontSize: "13px", color: C.text2 }}>국내외 TCG 제품 발매 스케줄 · 포켓몬 · 원피스</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 900, color: C.blue, lineHeight: 1 }}>{upcoming.length}</div>
              <div style={{ fontSize: "10px", color: C.text3, fontWeight: 700, letterSpacing: "0.1em" }}>UPCOMING</div>
            </div>
          </div>

          {/* 범례 */}
          <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {Object.entries(CAT).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: v.color }} />
                <span style={{ fontSize: "11px", color: C.text3, fontWeight: 600 }}>{v.emoji} {v.label}</span>
              </div>
            ))}
            <span style={{ fontSize: "11px", color: C.text3 }}>🇯🇵 일본 선행 · 🇰🇷 한국</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 1.25rem 0", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* 예정 목록 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "4px", height: "18px", background: C.blue, display: "inline-block" }} />
            <span style={{ fontSize: "13px", fontWeight: 900, color: C.text }}>예정된 일정</span>
            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: C.blue, letterSpacing: "0.1em" }}>{upcoming.length}건</span>
          </div>

          {upcoming.length === 0 && (
            <div style={{ padding: "40px 18px", textAlign: "center", color: C.text3, fontSize: "13px" }}>예정된 일정이 없습니다.</div>
          )}

          {upcoming.map((ev, i) => {
            const d = new Date(ev.releaseDate);
            const days = differenceInDays(d, today);
            const cat = catOf(ev.category);
            const dColor = days === 0 ? C.red : days <= 7 ? C.red : days <= 30 ? C.pk : C.text3;
            return (
              <div key={ev.id} style={{
                display: "grid", gridTemplateColumns: "80px 1fr 80px",
                borderBottom: i < upcoming.length - 1 ? `1px solid ${C.bd}` : "none",
                borderLeft: `3px solid ${cat.color}`,
              }}>
                {/* 날짜 셀 */}
                <div style={{ background: C.s2, borderRight: `1px solid ${C.bd}`, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "9px", color: cat.color, fontWeight: 800, letterSpacing: "0.1em" }}>{d.getFullYear()}</div>
                  <div style={{ fontSize: "10px", color: C.text3 }}>{d.getMonth() + 1}월</div>
                  <div style={{ fontFamily: "monospace", fontSize: "28px", fontWeight: 900, color: C.text, lineHeight: 1 }}>{String(d.getDate()).padStart(2, "0")}</div>
                  <div style={{ fontSize: "10px", color: C.text3 }}>{format(d, "EEE", { locale: ko })}</div>
                </div>

                {/* 내용 */}
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 8px", fontSize: "10px", fontWeight: 800, color: cat.color, background: cat.dim, border: `1px solid ${cat.color}`, letterSpacing: "0.08em" }}>
                      {cat.emoji} {cat.label}
                    </span>
                    <span style={{ fontSize: "10px", color: C.text3, fontWeight: 600 }}>
                      {ev.isJapan ? "🇯🇵 일본 선행" : "🇰🇷 한국"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, lineHeight: 1.4, marginBottom: "4px" }}>{ev.title}</h3>
                  {ev.description && <p style={{ fontSize: "12px", color: C.text3, lineHeight: 1.6 }}>{ev.description}</p>}
                </div>

                {/* D-day */}
                <div style={{ borderLeft: `1px solid ${C.bd}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 900, color: dColor, letterSpacing: "-0.02em" }}>
                      {days === 0 ? "D-DAY" : `D-${days}`}
                    </div>
                    <div style={{ fontSize: "10px", color: C.text3, marginTop: "2px" }}>{days === 0 ? "오늘" : `${days}일 후`}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 지난 일정 */}
        {past.length > 0 && (
          <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "4px", height: "18px", background: C.text3, display: "inline-block" }} />
              <span style={{ fontSize: "13px", fontWeight: 900, color: C.text }}>지난 일정</span>
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: C.text3, letterSpacing: "0.1em" }}>{past.length}건</span>
            </div>
            {past.slice(0, 8).map((ev, i) => {
              const d = new Date(ev.releaseDate);
              const cat = catOf(ev.category);
              return (
                <div key={ev.id} style={{
                  display: "flex", gap: "14px", padding: "10px 16px",
                  borderBottom: i < Math.min(7, past.length - 1) ? `1px solid ${C.bd}` : "none",
                  opacity: 0.45, alignItems: "center",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: C.text3, minWidth: "68px", flexShrink: 0 }}>{format(d, "yyyy.MM.dd")}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: cat.color, background: cat.dim, padding: "1px 6px", flexShrink: 0 }}>{cat.label}</span>
                  <span style={{ fontSize: "12px", color: C.text2 }} className="line-clamp-1">{ev.title}</span>
                  <span style={{ fontSize: "10px", color: C.text3, flexShrink: 0 }}>{ev.isJapan ? "🇯🇵" : "🇰🇷"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
