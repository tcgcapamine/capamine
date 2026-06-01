import Link from "next/link";
import { prisma } from "@/lib/db";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

/* ── 색상 ── */
const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#181818", s3: "#222222",
  bd: "#272727", bd2: "#333333",
  text: "#f0f0f0", text2: "#999999", text3: "#4a4a4a",
  pk: "#ff9500", pkDim: "#1e1000",
  op: "#e03030", opDim: "#1a0808",
  green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

const CAT = {
  pokemon:  { color: C.pk,  dim: C.pkDim,  label: "POKÉMON",   emoji: "🎴",  href: "/pokemon" },
  onepiece: { color: C.op,  dim: C.opDim,  label: "ONE PIECE", emoji: "☠️",  href: "/onepiece" },
  general:  { color: C.blue, dim: "#051524", label: "NEWS",     emoji: "📋",  href: "/" },
};
const catOf = (k: string) => CAT[k as keyof typeof CAT] ?? CAT.general;

type Article = { id: string; title: string; summary: string | null; source: string | null; publishedAt: Date | null; createdAt: Date; category: string; imageUrl: string | null; };

function fmtPrice(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만` : n.toLocaleString();
}
function fmtDate(a: Article, fmt = "M/d") {
  return format(new Date(a.publishedAt ?? a.createdAt), fmt, { locale: ko });
}

/* ─────────────────────────────────────────
   라이브 티커
───────────────────────────────────────── */
function Ticker({ articles }: { articles: Article[] }) {
  const items = [...articles, ...articles]; // 끊기지 않도록 복제
  return (
    <div className="ticker-wrap" style={{ background: "#0d0d0d", borderBottom: `1px solid ${C.bd}`, height: "32px", overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* LIVE 뱃지 */}
      <div style={{ flexShrink: 0, padding: "0 14px", borderRight: `1px solid ${C.bd}`, height: "100%", display: "flex", alignItems: "center", gap: "6px" }}>
        <span className="price-live" style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.red, display: "inline-block" }} />
        <span className="f-display" style={{ fontSize: "11px", fontWeight: 800, color: C.red, letterSpacing: "0.15em" }}>LIVE</span>
      </div>
      {/* 스크롤 트랙 */}
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track">
          {items.map((a, i) => {
            const cat = catOf(a.category);
            return (
              <Link key={`${a.id}-${i}`} href={`/articles/${a.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "0 28px", whiteSpace: "nowrap", textDecoration: "none" }}>
                <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: cat.color, letterSpacing: "0.12em" }}>{cat.label}</span>
                <span style={{ width: "3px", height: "3px", background: C.text3, borderRadius: "50%", display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: C.text2 }}>{a.title}</span>
                <span style={{ fontSize: "10px", color: C.text3 }}>{fmtDate(a, "M/d")}</span>
                <span style={{ color: C.bd2, marginLeft: "8px" }}>·</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   히어로: 메인 피처 기사
───────────────────────────────────────── */
function Hero({ hero, side }: { hero: Article; side: Article[] }) {
  const cat = catOf(hero.category);
  return (
    <div style={{ background: `linear-gradient(135deg, ${cat.dim} 0%, #0a0a0a 55%)`, borderBottom: `1px solid ${C.bd}` }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", minHeight: "360px" }}>

          {/* 왼쪽: 메인 기사 */}
          <Link href={`/articles/${hero.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 40px 40px 0", borderRight: `1px solid ${C.bd}`, position: "relative" }}>
            {/* 큰 ghost 번호 */}
            <span className="f-display" style={{
              position: "absolute", top: "20px", left: 0,
              fontSize: "160px", fontWeight: 900, color: cat.color,
              opacity: 0.04, lineHeight: 1, userSelect: "none", letterSpacing: "-0.05em",
            }}>001</span>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "18px" }}>
                <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: cat.color, background: `${cat.color}18`, border: `1px solid ${cat.color}40`, padding: "3px 12px", letterSpacing: "0.18em" }}>
                  {cat.emoji} {cat.label}
                </span>
                <span className="f-display" style={{ fontSize: "10px", color: C.text3, letterSpacing: "0.14em", fontWeight: 700 }}>HEADLINE</span>
              </div>

              <h1 style={{ fontSize: "clamp(22px, 3.2vw, 36px)", fontWeight: 900, color: "#fff", lineHeight: 1.35, marginBottom: "14px", letterSpacing: "-0.2px", maxWidth: "680px" }}>
                {hero.title}
              </h1>
              {hero.summary && (
                <p className="line-clamp-2" style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8, maxWidth: "600px", marginBottom: "20px" }}>
                  {hero.summary}
                </p>
              )}
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                {hero.source && <span style={{ fontSize: "11px", color: C.text3, background: "#ffffff0a", border: `1px solid ${C.bd}`, padding: "3px 10px" }}>{hero.source}</span>}
                <span style={{ fontSize: "11px", color: C.text3 }}>{fmtDate(hero, "yyyy.MM.dd")}</span>
                <span className="f-display" style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 700, color: cat.color, letterSpacing: "0.08em" }}>기사 보기 →</span>
              </div>
            </div>
          </Link>

          {/* 오른쪽: 사이드 기사 2개 */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {side.slice(0, 2).map((a, i) => {
              const c = catOf(a.category);
              return (
                <Link key={a.id} href={`/articles/${a.id}`} style={{ textDecoration: "none", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 28px", borderBottom: i === 0 ? `1px solid ${C.bd}` : "none" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                    <span className="f-display" style={{ fontSize: "9px", fontWeight: 800, color: c.color, letterSpacing: "0.14em" }}>{c.label}</span>
                    <span style={{ fontSize: "10px", color: C.text3 }}>{fmtDate(a)}</span>
                  </div>
                  <h3 className="line-clamp-2" style={{ fontSize: "14px", fontWeight: 700, color: C.text, lineHeight: 1.55, marginBottom: "8px" }}>{a.title}</h3>
                  {a.source && <span style={{ fontSize: "10px", color: C.text3 }}>{a.source}</span>}
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   섹션 헤더
───────────────────────────────────────── */
function SectionHead({ label, accent, href, count }: { label: string; accent: string; href: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "16px" }}>
      <span style={{ display: "inline-block", width: "4px", height: "28px", background: accent, flexShrink: 0, verticalAlign: "middle" }} />
      <span className="f-headline" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", color: C.text, letterSpacing: "0.01em" }}>{label}</span>
      {count !== undefined && (
        <span className="f-display" style={{ fontSize: "11px", color: accent, fontWeight: 800, letterSpacing: "0.1em" }}>{count}건</span>
      )}
      <Link href={href} className="hover-dim f-display" style={{ marginLeft: "auto", fontSize: "11px", color: C.text3, fontWeight: 700, letterSpacing: "0.1em", flexShrink: 0 }}>
        전체보기 →
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────
   뉴스 섹션 (1 BIG + 5 SMALL)
───────────────────────────────────────── */
function NewsSection({ articles, accent, label, href }: { articles: Article[]; accent: string; label: string; href: string }) {
  if (articles.length === 0) return null;
  const [big, ...rest] = articles;

  return (
    <div>
      <SectionHead label={label} accent={accent} href={href} count={articles.length} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: "2px", background: C.bd }} className="news-grid">

        {/* BIG CARD — 왼쪽 2행 차지 */}
        <Link href={`/articles/${big.id}`} className="card-lift"
          style={{ textDecoration: "none", gridRow: "1 / 3", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden", background: big.imageUrl ? "none" : `linear-gradient(160deg, ${accent}12 0%, ${C.s1} 60%)`, padding: "28px 24px", minHeight: "280px" }}>
          {/* 배경 이미지 */}
          {big.imageUrl && (
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${big.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)" }} />
            </div>
          )}
          {/* Ghost 숫자 */}
          {!big.imageUrl && <span className="f-display" style={{ position: "absolute", top: "12px", right: "12px", fontSize: "120px", fontWeight: 900, color: accent, opacity: 0.05, lineHeight: 1, userSelect: "none" }}>01</span>}
          <span style={{ display: "inline-block", width: "100%", height: "2px", background: accent, marginBottom: "16px" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
            <span className="f-display" style={{ fontSize: "9px", fontWeight: 800, color: accent, letterSpacing: "0.16em" }}>FEATURED</span>
            <span style={{ fontSize: "10px", color: C.text3 }}>{fmtDate(big)}</span>
          </div>
          <h3 className="line-clamp-3" style={{ fontSize: "18px", fontWeight: 800, color: "#fff", lineHeight: 1.45, marginBottom: "10px" }}>{big.title}</h3>
          {big.summary && <p className="line-clamp-2" style={{ fontSize: "12px", color: C.text2, lineHeight: 1.7 }}>{big.summary}</p>}
          {big.source && <span style={{ fontSize: "10px", color: C.text3, marginTop: "12px", display: "block" }}>{big.source}</span>}
        </Link>

        {/* SMALL CARDS */}
        {rest.slice(0, 4).map((a, i) => (
          <Link key={a.id} href={`/articles/${a.id}`} className="card-lift"
            style={{ textDecoration: "none", background: C.s1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px", borderTop: `2px solid ${accent}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="f-display" style={{ fontFamily: "monospace", fontSize: "10px", color: C.text3, fontWeight: 700 }}>#{String(i + 2).padStart(2, "0")}</span>
              <span style={{ fontSize: "10px", color: C.text3 }}>{fmtDate(a)}</span>
            </div>
            <h4 className="line-clamp-2" style={{ fontSize: "13px", fontWeight: 700, color: C.text, lineHeight: 1.55, flex: 1 }}>{a.title}</h4>
            {a.source && <span style={{ fontSize: "10px", color: C.text3, background: C.s2, padding: "1px 6px", alignSelf: "flex-start" }}>{a.source}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   메인 페이지
───────────────────────────────────────── */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();

  const [pokeArticles, opArticles, prices, events] = await Promise.all([
    prisma.article.findMany({ where: { isPublished: true, category: "pokemon" }, orderBy: { publishedAt: "desc" }, take: 8 }),
    prisma.article.findMany({ where: { isPublished: true, category: "onepiece" }, orderBy: { publishedAt: "desc" }, take: 8 }),
    prisma.cardPrice.findMany({ orderBy: { price: "desc" }, take: 12 }),
    prisma.releaseEvent.findMany({ where: { releaseDate: { gte: now } }, orderBy: { releaseDate: "asc" }, take: 6 }),
  ]);

  // 히어로 선정
  const all = [...pokeArticles, ...opArticles].sort(
    (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
  );
  const hero = all[0];
  const heroId = hero?.id;

  // 히어로 사이드 (히어로 제외, 다른 카테고리 우선)
  const sidePool = all.filter((a) => a.id !== heroId);
  const heroSide = sidePool.slice(0, 2);

  // 각 카테고리 기사 (히어로 제외)
  const pokeNews = pokeArticles.filter((a) => a.id !== heroId).slice(0, 6);
  const opNews   = opArticles.filter((a) => a.id !== heroId).slice(0, 6);

  // 티커용 기사
  const tickerArticles = all.slice(0, 12);

  const pkPrices = prices.filter((p) => p.category === "pokemon");
  const opPrices = prices.filter((p) => p.category === "onepiece");

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>

      {/* ── LIVE 티커 ── */}
      {tickerArticles.length > 0 && <Ticker articles={tickerArticles} />}

      {/* ── 히어로 ── */}
      {hero && <Hero hero={hero} side={heroSide} />}

      {/* ── 시세 스트립 ── */}
      {prices.length > 0 && (
        <div style={{ borderBottom: `1px solid ${C.bd}`, overflowX: "auto" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "stretch" }}>
            {/* MARKET 라벨 */}
            <div style={{ padding: "0 16px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.bd}`, flexShrink: 0 }}>
              <span className="f-display" style={{ fontSize: "10px", fontWeight: 900, color: C.text3, letterSpacing: "0.2em" }}>MARKET</span>
            </div>
            {prices.slice(0, 7).map((p, i) => {
              const cat = catOf(p.category);
              const up = p.prevPrice && p.price > p.prevPrice;
              const down = p.prevPrice && p.price < p.prevPrice;
              const pct = p.prevPrice ? Math.abs(Math.round(((p.price - p.prevPrice) / p.prevPrice) * 100)) : null;
              return (
                <div key={p.id} style={{ padding: "10px 20px", borderRight: `1px solid ${C.bd}`, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "2px" }}>
                    <span className="f-display" style={{ fontSize: "9px", color: cat.color, fontWeight: 800, letterSpacing: "0.1em" }}>{p.rarity ?? cat.label}</span>
                  </div>
                  <div className="line-clamp-1" style={{ fontSize: "11px", color: C.text2, marginBottom: "3px", maxWidth: "110px" }}>{p.cardName}</div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                    <span className="f-display" style={{ fontSize: "15px", fontWeight: 900, color: cat.color, letterSpacing: "-0.01em" }}>{fmtPrice(p.price)}<span style={{ fontSize: "10px", fontWeight: 400 }}>원</span></span>
                    {pct !== null && (
                      <span style={{ fontSize: "10px", fontWeight: 800, color: up ? C.red : down ? C.green : C.text3 }}>
                        {up ? "▲" : "▼"}{pct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 1.25rem 80px" }}>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "56px", alignItems: "start" }}>

          {/* 왼쪽: 뉴스 섹션 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>

            {pokeNews.length > 0 && (
              <NewsSection articles={pokeNews} accent={C.pk} label="포켓몬 카드게임" href="/pokemon" />
            )}

            {opNews.length > 0 && (
              <NewsSection articles={opNews} accent={C.op} label="원피스 카드게임" href="/onepiece" />
            )}

            {pokeNews.length === 0 && opNews.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.text3 }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📭</div>
                <p style={{ fontSize: "14px" }}>수집된 기사가 없습니다. 관리자 페이지에서 자동 수집을 실행해주세요.</p>
              </div>
            )}
          </div>

          {/* 오른쪽: 사이드바 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px", position: "sticky", top: "76px" }}>

            {/* 발매 예정 */}
            {events.length > 0 && (
              <div>
                <SectionHead label="발매 예정" accent={C.blue} href="/calendar" />
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {events.map((ev, i) => {
                    const d = new Date(ev.releaseDate);
                    const days = differenceInDays(d, now);
                    const cat = catOf(ev.category);
                    const dColor = days <= 7 ? C.red : days <= 30 ? C.pk : C.text3;
                    return (
                      <div key={ev.id} style={{ display: "flex", gap: "14px", padding: "12px 0", borderBottom: `1px solid ${C.bd}`, alignItems: "center" }}>
                        {/* 날짜 블록 */}
                        <div style={{ textAlign: "center", flexShrink: 0, width: "38px" }}>
                          <div className="f-display" style={{ fontSize: "9px", color: cat.color, fontWeight: 800, letterSpacing: "0.08em" }}>{d.getMonth() + 1}월</div>
                          <div className="f-display" style={{ fontSize: "26px", fontWeight: 900, color: C.text, lineHeight: 1 }}>{d.getDate()}</div>
                        </div>
                        {/* 내용 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="line-clamp-2" style={{ fontSize: "12px", fontWeight: 700, color: C.text, lineHeight: 1.45, marginBottom: "4px" }}>{ev.title}</div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "10px" }}>{ev.isJapan ? "🇯🇵" : "🇰🇷"}</span>
                            <span className="f-display" style={{ fontSize: "11px", fontWeight: 900, color: dColor, letterSpacing: "0.04em" }}>D-{days}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/calendar" className="hover-dim" style={{ display: "block", marginTop: "12px", fontSize: "11px", color: C.blue, fontWeight: 700, letterSpacing: "0.06em" }}>전체 일정 보기 →</Link>
              </div>
            )}

            {/* 포켓몬 시세 */}
            {pkPrices.length > 0 && (
              <div>
                <SectionHead label="포켓몬 시세 TOP" accent={C.pk} href="/pokemon/prices" />
                <div>
                  {pkPrices.slice(0, 6).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.bd}` }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0 }}>
                        <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: i < 3 ? C.pk : C.text3, minWidth: "18px", flexShrink: 0 }}>{i + 1}</span>
                        <span className="line-clamp-1" style={{ fontSize: "12px", color: C.text2 }}>{p.cardName}</span>
                      </div>
                      <span className="f-display" style={{ fontSize: "14px", fontWeight: 900, color: C.pk, flexShrink: 0, marginLeft: "8px" }}>
                        {fmtPrice(p.price)}<span style={{ fontSize: "10px", fontWeight: 400 }}>원</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 원피스 시세 */}
            {opPrices.length > 0 && (
              <div>
                <SectionHead label="원피스 시세 TOP" accent={C.op} href="/onepiece/prices" />
                <div>
                  {opPrices.slice(0, 6).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.bd}` }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0 }}>
                        <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: i < 3 ? C.op : C.text3, minWidth: "18px", flexShrink: 0 }}>{i + 1}</span>
                        <span className="line-clamp-1" style={{ fontSize: "12px", color: C.text2 }}>{p.cardName}</span>
                      </div>
                      <span className="f-display" style={{ fontSize: "14px", fontWeight: 900, color: C.op, flexShrink: 0, marginLeft: "8px" }}>
                        {fmtPrice(p.price)}<span style={{ fontSize: "10px", fontWeight: 400 }}>원</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
