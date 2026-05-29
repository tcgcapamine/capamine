import Link from "next/link";
import { prisma } from "@/lib/db";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "포켓몬 카드게임 · 카파민" };

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#181818", s3: "#222222",
  bd: "#272727", bd2: "#333333",
  text: "#f0f0f0", text2: "#999999", text3: "#4a4a4a",
  pk: "#ff9500", pkDim: "#1e1000",
  op: "#e03030", green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

function fmtPrice(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만` : n.toLocaleString();
}
function Diff({ cur, prev }: { cur: number; prev?: number | null }) {
  if (!prev || cur === prev) return null;
  const up = cur > prev;
  return <span style={{ fontSize: "10px", fontWeight: 800, color: up ? C.red : C.green }}>{up ? "▲" : "▼"}{Math.abs(Math.round(((cur - prev) / prev) * 100))}%</span>;
}

export default async function PokemonPage() {
  const now = new Date();
  const [news, prices, events] = await Promise.all([
    prisma.article.findMany({ where: { isPublished: true, category: "pokemon" }, orderBy: { publishedAt: "desc" }, take: 13 }),
    prisma.cardPrice.findMany({ where: { category: "pokemon" }, orderBy: { price: "desc" }, take: 10 }),
    prisma.releaseEvent.findMany({ where: { category: "pokemon", releaseDate: { gte: now } }, orderBy: { releaseDate: "asc" }, take: 5 }),
  ]);
  const hero = news[0];
  const rest = news.slice(1);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>

      {/* ── 히어로 ── */}
      {hero ? (
        <div style={{ background: `linear-gradient(135deg, ${C.pkDim} 0%, #0a0a0a 55%)`, borderBottom: `1px solid ${C.bd}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}>
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", minHeight: "320px" }}>

              {/* 왼쪽 */}
              <Link href={`/articles/${hero.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "36px 36px 36px 0", borderRight: `1px solid ${C.bd}`, position: "relative" }}>
                <span className="f-display" style={{ position: "absolute", top: "16px", left: 0, fontSize: "140px", fontWeight: 900, color: C.pk, opacity: 0.04, lineHeight: 1, userSelect: "none", letterSpacing: "-0.05em" }}>
                  001
                </span>
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                    <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: C.pk, background: `${C.pk}18`, border: `1px solid ${C.pk}40`, padding: "3px 12px", letterSpacing: "0.18em" }}>
                      🎴 POKÉMON
                    </span>
                    <span className="f-display" style={{ fontSize: "10px", color: C.text3, letterSpacing: "0.14em", fontWeight: 700 }}>HEADLINE</span>
                  </div>
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
                    <span className="f-display" style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: C.pk, letterSpacing: "0.08em" }}>기사 보기 →</span>
                  </div>
                </div>
              </Link>

              {/* 오른쪽: 발매 예정 */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "3px", height: "16px", background: C.blue, display: "inline-block" }} />
                  <span className="f-display" style={{ fontSize: "11px", fontWeight: 800, color: C.text, letterSpacing: "0.1em" }}>발매 예정</span>
                </div>
                {events.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.text3, fontSize: "12px" }}>예정 없음</div>
                ) : (
                  events.map((ev, i) => {
                    const d = new Date(ev.releaseDate);
                    const days = differenceInDays(d, now);
                    const dColor = days <= 7 ? C.red : days <= 30 ? C.pk : C.text3;
                    return (
                      <div key={ev.id} style={{ padding: "14px 24px", borderBottom: i < events.length - 1 ? `1px solid ${C.bd}` : "none", display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ textAlign: "center", flexShrink: 0, width: "32px" }}>
                          <div className="f-display" style={{ fontSize: "8px", color: C.pk, fontWeight: 800 }}>{d.getMonth() + 1}월</div>
                          <div className="f-display" style={{ fontSize: "22px", fontWeight: 900, color: C.text, lineHeight: 1 }}>{d.getDate()}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="line-clamp-2" style={{ fontSize: "12px", fontWeight: 700, color: C.text, lineHeight: 1.4, marginBottom: "3px" }}>{ev.title}</div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ fontSize: "9px" }}>{ev.isJapan ? "🇯🇵" : "🇰🇷"}</span>
                            <span className="f-display" style={{ fontSize: "10px", fontWeight: 900, color: dColor }}>D-{days}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: `linear-gradient(135deg, ${C.pkDim} 0%, #0a0a0a 55%)`, borderBottom: `1px solid ${C.bd}`, padding: "40px 1.25rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: C.pk, letterSpacing: "0.18em" }}>🎴 POKÉMON</span>
            <p style={{ color: C.text3, marginTop: "16px", fontSize: "14px" }}>수집된 기사가 없습니다.</p>
          </div>
        </div>
      )}

      {/* ── 시세 스트립 ── */}
      {prices.length > 0 && (
        <div style={{ borderBottom: `1px solid ${C.bd}`, overflowX: "auto" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "stretch" }}>
            <div style={{ padding: "0 16px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.bd}`, flexShrink: 0 }}>
              <span className="f-display" style={{ fontSize: "10px", fontWeight: 900, color: C.text3, letterSpacing: "0.2em" }}>MARKET</span>
            </div>
            {prices.slice(0, 6).map((p, i) => (
              <div key={p.id} style={{ padding: "10px 18px", borderRight: `1px solid ${C.bd}`, flexShrink: 0 }}>
                <div style={{ fontSize: "8px", fontWeight: 800, color: C.pk, letterSpacing: "0.1em", marginBottom: "2px" }}>{p.rarity ?? "POKÉMON"}</div>
                <div className="line-clamp-1" style={{ fontSize: "11px", color: C.text2, marginBottom: "3px", maxWidth: "100px" }}>{p.cardName}</div>
                <div style={{ display: "flex", gap: "5px", alignItems: "baseline" }}>
                  <span className="f-display" style={{ fontSize: "14px", fontWeight: 900, color: C.pk }}>{fmtPrice(p.price)}<span style={{ fontSize: "9px", fontWeight: 400 }}>원</span></span>
                  <Diff cur={p.price} prev={p.prevPrice} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 뉴스 그리드 ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 1.25rem 0" }}>

        {/* 섹션 헤더 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "16px" }}>
          <span style={{ display: "inline-block", width: "4px", height: "28px", background: C.pk, flexShrink: 0 }} />
          <span className="f-headline" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: C.text }}>포켓몬 카드게임</span>
          <span className="f-display" style={{ fontSize: "11px", color: C.pk, fontWeight: 800, letterSpacing: "0.1em" }}>{rest.length}건</span>
          <Link href="/pokemon" className="hover-dim f-display" style={{ marginLeft: "auto", fontSize: "11px", color: C.text3, fontWeight: 700, letterSpacing: "0.1em" }}>전체보기 →</Link>
        </div>

        {rest.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", background: C.bd }} className="news-grid">
            {rest.slice(0, 6).map((a, i) => (
              <Link key={a.id} href={`/articles/${a.id}`} className="card-lift"
                style={{ textDecoration: "none", background: C.s1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px", borderTop: `2px solid ${C.pk}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="f-display" style={{ fontSize: "10px", color: C.text3, fontWeight: 700 }}>#{String(i + 2).padStart(2, "0")}</span>
                  <span style={{ fontSize: "10px", color: C.text3 }}>{format(new Date(a.publishedAt ?? a.createdAt), "M/d")}</span>
                </div>
                <h3 className="line-clamp-3" style={{ fontSize: "13px", fontWeight: 700, color: C.text, lineHeight: 1.55, flex: 1 }}>{a.title}</h3>
                {a.source && <span style={{ fontSize: "10px", color: C.text3, background: C.s2, padding: "1px 6px", alignSelf: "flex-start" }}>{a.source}</span>}
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.text3, fontSize: "13px" }}>기사가 없습니다.</div>
        )}

        {/* 시세 전체 */}
        {prices.length > 0 && (
          <div style={{ marginTop: "48px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "16px" }}>
              <span style={{ display: "inline-block", width: "4px", height: "28px", background: C.pk, flexShrink: 0 }} />
              <span className="f-headline" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: C.text }}>시세 TOP</span>
              <Link href="/pokemon/prices" className="hover-dim f-display" style={{ marginLeft: "auto", fontSize: "11px", color: C.text3, fontWeight: 700, letterSpacing: "0.1em" }}>전체보기 →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2px", background: C.bd }} className="prices-grid">
              {prices.map((p, i) => (
                <div key={p.id} style={{ background: C.s1, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0 }}>
                    <span className="f-display" style={{ fontSize: "18px", fontWeight: 900, color: i < 3 ? C.pk : C.text3, minWidth: "24px" }}>{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="line-clamp-1" style={{ fontSize: "13px", color: C.text, fontWeight: 700, marginBottom: "2px" }}>{p.cardName}</div>
                      {p.rarity && <div style={{ fontSize: "10px", color: C.text3 }}>{p.rarity}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="f-display" style={{ fontSize: "16px", fontWeight: 900, color: C.pk }}>{fmtPrice(p.price)}<span style={{ fontSize: "10px", fontWeight: 400 }}>원</span></div>
                    <Diff cur={p.price} prev={p.prevPrice} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:900px){ .hero-grid{grid-template-columns:1fr!important} }
        @media(max-width:900px){ .news-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:640px){ .news-grid{grid-template-columns:1fr!important} }
        @media(max-width:640px){ .prices-grid{grid-template-columns:1fr!important} }
      `}</style>
    </div>
  );
}
