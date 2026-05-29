import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "관리자 · 카파민" };

const C = {
  bg: "#0a0a0a", surface: "#111111", s2: "#1a1a1a",
  border: "#2a2a2a", text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  red: "#ff3838", amber: "#ff9500", green: "#00cc70", blue: "#4a9eff",
};

export default async function AdminPage() {
  const [articleCount, priceCount, eventCount, deckCount] = await Promise.all([
    prisma.article.count(),
    prisma.cardPrice.count(),
    prisma.releaseEvent.count(),
    prisma.deckRecipe.count(),
  ]);
  const recentArticles = await prisma.article.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  const stats = [
    { label: "뉴스 기사", value: articleCount, href: "/admin/articles", color: C.blue,  accent: "#0a1f3d" },
    { label: "시세 정보", value: priceCount,   href: "/admin/prices",   color: C.amber, accent: "#2d1a00" },
    { label: "발매 일정", value: eventCount,   href: "/admin/calendar", color: C.green, accent: "#002d1a" },
    { label: "덱 레시피", value: deckCount,    href: "/admin/decks",    color: C.red,   accent: "#2d0808" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "20px 1.25rem 60px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* 헤더 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px", borderBottom: `1px solid ${C.border}`, background: C.s2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: C.text3, color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 8px", letterSpacing: "0.1em" }}>ADMIN</span>
              <span style={{ fontSize: "11px", color: C.text2 }}>카파민 콘텐츠 관리 패널</span>
            </div>
            <Link href="/" style={{ fontSize: "11px", color: C.text3, textDecoration: "none", padding: "4px 10px", border: `1px solid ${C.border}` }}>
              ← 사이트 보기
            </Link>
          </div>
          <div style={{ padding: "18px 18px 16px" }}>
            <div style={{ fontSize: "11px", color: C.text3, letterSpacing: "0.1em", fontWeight: 600, marginBottom: "4px" }}>CONTENT MANAGEMENT SYSTEM</div>
            <h1 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 900, color: C.text }}>관리자 패널</h1>
          </div>
        </div>

        {/* 통계 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="stats-grid">
          {stats.map((s) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.color}`, padding: "16px" }}>
                <div style={{ fontSize: "28px", fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: C.text2, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "10px", color: C.text3, marginTop: "6px", letterSpacing: "0.05em" }}>관리 →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 빠른 작업 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", borderBottom: `1px solid ${C.border}`, background: C.s2 }}>
            <div style={{ width: "3px", height: "14px", background: C.blue, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", fontWeight: 800, color: C.text, letterSpacing: "0.05em" }}>빠른 작업</span>
            <span style={{ fontSize: "10px", color: C.text3, letterSpacing: "0.1em", fontWeight: 600 }}>· QUICK ACTIONS</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }} className="action-grid4">
            {[
              { href: "/admin/collect",      label: "자동 수집",     sub: "AUTO COLLECT",    color: C.green },
              { href: "/admin/articles/new", label: "새 기사 작성",  sub: "NEWS ARTICLE",    color: C.blue  },
              { href: "/admin/prices/new",   label: "시세 등록",     sub: "PRICE UPDATE",    color: C.amber },
              { href: "/admin/decks/new",    label: "덱 등록",       sub: "DECK RECIPE",     color: C.red   },
            ].map((a, i) => (
              <Link key={a.href} href={a.href} style={{ padding: "14px 16px", borderRight: i < 3 ? `1px solid ${C.border}` : "none", textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: "10px", color: a.color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>{a.sub}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{a.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 기사 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px", borderBottom: `1px solid ${C.border}`, background: C.s2 }}>
            <div style={{ width: "3px", height: "14px", background: C.amber, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", fontWeight: 800, color: C.text, letterSpacing: "0.05em" }}>최근 등록 기사</span>
            <span style={{ fontSize: "10px", color: C.text3, letterSpacing: "0.1em", fontWeight: 600 }}>· RECENT ARTICLES</span>
          </div>
          {recentArticles.map((a, i) => (
            <div key={a.id} style={{ padding: "12px 18px", borderBottom: i < recentArticles.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", minWidth: 0 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", flexShrink: 0,
                  color: a.category === "pokemon" ? C.amber : C.red,
                  background: a.category === "pokemon" ? "#78350f" : "#7f1d1d" }}>
                  {a.category === "pokemon" ? "POKÉMON" : "ONE PIECE"}
                </span>
                <span style={{ fontSize: "13px", color: C.text2 }} className="line-clamp-1">{a.title}</span>
              </div>
              <span style={{ fontSize: "11px", color: a.isPublished ? C.green : C.text3, flexShrink: 0, fontWeight: 600 }}>
                {a.isPublished ? "게시됨" : "미게시"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:640px){
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .action-grid4{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>
    </div>
  );
}
