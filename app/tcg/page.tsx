import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "TCG 뉴스 · 카파민" };

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#181818",
  bd: "#272727", bd2: "#333333",
  text: "#f0f0f0", text2: "#999999", text3: "#4a4a4a",
  tcg: "#00ffaa", tcgDim: "#001a0f",
};

const GAME_TAGS: Record<string, { label: string; color: string }> = {
  naruto:     { label: "나루토",   color: "#ff6b35" },
  "yu-gi-oh": { label: "유희왕",   color: "#8b5cf6" },
  yugioh:     { label: "유희왕",   color: "#8b5cf6" },
  "dragon ball": { label: "드래곤볼", color: "#f59e0b" },
  digimon:    { label: "디지몬",   color: "#3b82f6" },
  mtg:        { label: "MTG",      color: "#10b981" },
  "magic":    { label: "MTG",      color: "#10b981" },
};

function detectGame(title: string, source?: string | null): { label: string; color: string } | null {
  const t = (title + " " + (source ?? "")).toLowerCase();
  for (const [key, val] of Object.entries(GAME_TAGS)) {
    if (t.includes(key)) return val;
  }
  return null;
}

export default async function TcgPage() {
  const news = await prisma.article.findMany({
    where: { isPublished: true, category: "general" },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const hero = news[0];
  const rest = news.slice(1);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>

      {/* ── 히어로 ── */}
      {hero ? (
        <div style={{ background: `linear-gradient(135deg, ${C.tcgDim} 0%, #0a0a0a 55%)`, borderBottom: `1px solid ${C.bd}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}>
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", minHeight: "280px" }}>

              {/* 왼쪽 */}
              <Link href={`/articles/${hero.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "36px 36px 36px 0", borderRight: `1px solid ${C.bd}`, position: "relative" }}>
                <span className="f-display" style={{ position: "absolute", top: "16px", left: 0, fontSize: "140px", fontWeight: 900, color: C.tcg, opacity: 0.04, lineHeight: 1, userSelect: "none", letterSpacing: "-0.05em" }}>
                  001
                </span>
                <div style={{ position: "relative" }}>
                  {(() => {
                    const game = detectGame(hero.title, hero.source);
                    return (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                        <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: C.tcg, background: `${C.tcg}18`, border: `1px solid ${C.tcg}40`, padding: "3px 12px", letterSpacing: "0.18em" }}>
                          🃏 TCG NEWS
                        </span>
                        {game && (
                          <span style={{ fontSize: "10px", fontWeight: 800, color: game.color, background: `${game.color}18`, border: `1px solid ${game.color}40`, padding: "3px 10px", letterSpacing: "0.1em" }}>
                            {game.label}
                          </span>
                        )}
                        <span className="f-display" style={{ fontSize: "10px", color: C.text3, letterSpacing: "0.14em", fontWeight: 700 }}>HEADLINE</span>
                      </div>
                    );
                  })()}
                  <h1 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 900, color: "#fff", lineHeight: 1.35, marginBottom: "12px", maxWidth: "640px" }}>
                    {hero.title}
                  </h1>
                  {hero.summary && (
                    <p className="line-clamp-2" style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8, maxWidth: "560px", marginBottom: "16px" }}>
                      {hero.summary}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {hero.source && <span style={{ fontSize: "11px", color: C.text3, background: "#ffffff0a", border: `1px solid ${C.bd}`, padding: "2px 8px" }}>{hero.source}</span>}
                    <span style={{ fontSize: "11px", color: C.text3 }}>{format(new Date(hero.publishedAt ?? hero.createdAt), "yyyy.MM.dd", { locale: ko })}</span>
                    <span className="f-display" style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: C.tcg, letterSpacing: "0.08em" }}>기사 보기 →</span>
                  </div>
                </div>
              </Link>

              {/* 오른쪽: 최신 5건 미리보기 */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "3px", height: "16px", background: C.tcg, display: "inline-block" }} />
                  <span className="f-display" style={{ fontSize: "11px", fontWeight: 800, color: C.text, letterSpacing: "0.1em" }}>최신 뉴스</span>
                </div>
                {rest.slice(0, 5).map((a, i) => {
                  const game = detectGame(a.title, a.source);
                  return (
                    <Link key={a.id} href={`/articles/${a.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "12px 24px", borderBottom: i < 4 ? `1px solid ${C.bd}` : "none", display: "flex", gap: "10px", alignItems: "flex-start" }} className="article-row-sm">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {game && (
                            <span style={{ fontSize: "9px", fontWeight: 800, color: game.color, letterSpacing: "0.08em", display: "block", marginBottom: "3px" }}>{game.label}</span>
                          )}
                          <div className="line-clamp-2" style={{ fontSize: "12px", fontWeight: 600, color: C.text, lineHeight: 1.45 }}>{a.title}</div>
                          <div style={{ fontSize: "10px", color: C.text3, marginTop: "3px" }}>
                            {format(new Date(a.publishedAt ?? a.createdAt), "M/d")}
                            {a.source && ` · ${a.source}`}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: `linear-gradient(135deg, ${C.tcgDim} 0%, #0a0a0a 55%)`, borderBottom: `1px solid ${C.bd}`, padding: "40px 1.25rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: C.tcg, letterSpacing: "0.18em" }}>🃏 TCG NEWS</span>
            <p style={{ color: C.text3, marginTop: "16px", fontSize: "14px" }}>수집된 기사가 없습니다. 잠시 후 다시 확인해주세요.</p>
          </div>
        </div>
      )}

      {/* ── 뉴스 그리드 ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 1.25rem 0" }}>

        {/* 섹션 헤더 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "16px" }}>
          <span style={{ display: "inline-block", width: "4px", height: "28px", background: C.tcg, flexShrink: 0 }} />
          <span className="f-headline" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: C.text }}>전체 TCG 뉴스</span>
          <span className="f-display" style={{ fontSize: "11px", color: C.tcg, fontWeight: 800, letterSpacing: "0.1em" }}>{rest.length}건</span>
        </div>

        {rest.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", background: C.bd }} className="news-grid">
            {rest.map((a, i) => {
              const game = detectGame(a.title, a.source);
              return (
                <Link key={a.id} href={`/articles/${a.id}`} className="card-lift"
                  style={{ textDecoration: "none", background: C.s1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px", borderTop: `2px solid ${game?.color ?? C.tcg}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {game ? (
                      <span style={{ fontSize: "9px", fontWeight: 800, color: game.color, letterSpacing: "0.1em" }}>{game.label}</span>
                    ) : (
                      <span className="f-display" style={{ fontSize: "10px", color: C.text3, fontWeight: 700 }}>#{String(i + 2).padStart(2, "0")}</span>
                    )}
                    <span style={{ fontSize: "10px", color: C.text3 }}>{format(new Date(a.publishedAt ?? a.createdAt), "M/d")}</span>
                  </div>
                  <h3 className="line-clamp-3" style={{ fontSize: "13px", fontWeight: 700, color: C.text, lineHeight: 1.55, flex: 1 }}>{a.title}</h3>
                  {a.summary && (
                    <p className="line-clamp-2" style={{ fontSize: "11px", color: C.text2, lineHeight: 1.6 }}>{a.summary}</p>
                  )}
                  {a.source && <span style={{ fontSize: "10px", color: C.text3, background: C.s2, padding: "1px 6px", alignSelf: "flex-start" }}>{a.source}</span>}
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.text3, fontSize: "13px" }}>기사가 없습니다.</div>
        )}

        {/* 안내 */}
        <div style={{ marginTop: "40px", padding: "20px 24px", background: C.s1, border: `1px solid ${C.bd}`, borderLeft: `3px solid ${C.tcg}` }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.tcg, marginBottom: "8px", letterSpacing: "0.06em" }}>🃏 카파민 TCG 뉴스</div>
          <p style={{ fontSize: "13px", color: C.text2, lineHeight: 1.8 }}>
            포켓몬·원피스 외 다양한 TCG 소식을 모아드립니다.
            나루토 카드게임, 유희왕, 드래곤볼 슈퍼 카드게임, 디지몬, 매직 더 게더링 등
            TCG 업계 전반의 중요 이슈와 신제품 소식을 빠르게 전달합니다.
          </p>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){ .hero-grid{grid-template-columns:1fr!important} }
        @media(max-width:900px){ .news-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:640px){ .news-grid{grid-template-columns:1fr!important} }
        .article-row-sm > div { transition: background 0.12s; }
        .article-row-sm:hover > div { background: rgba(0,255,170,0.04); }
      `}</style>
    </div>
  );
}
