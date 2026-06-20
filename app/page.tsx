import Link from "next/link";
import { prisma } from "@/lib/db";
import { format, differenceInDays, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export const dynamic = "force-dynamic";

const C = {
  bg: "#060d1f", s1: "#0a1628", s2: "#0f1f3a", s3: "#162540",
  bd: "#1e3354", bd2: "#2a4468",
  text: "#e8f4fd", text2: "#7aa8cc", text3: "#3a5c7a",
  pk: "#ff9500", pkDim: "#1e0f00",
  op: "#e03030", opDim: "#1a0808",
  cyan: "#00d4ff", cyanDim: "#001a2e",
  green: "#00ffaa", red: "#ff4444",
};

const CAT = {
  pokemon:  { color: C.pk,    dim: C.pkDim,    label: "POKÉMON",   emoji: "🎴",  href: "/pokemon" },
  onepiece: { color: C.op,    dim: C.opDim,    label: "ONE PIECE", emoji: "☠️",  href: "/onepiece" },
  general:  { color: C.green, dim: "#001a0f",  label: "TCG NEWS",  emoji: "🃏",  href: "/tcg" },
};
const catOf = (k: string) => CAT[k as keyof typeof CAT] ?? CAT.general;

type Article = {
  id: string; title: string; summary: string | null;
  source: string | null; publishedAt: Date | null; createdAt: Date; category: string;
};

function timeAgo(a: Article) {
  const d = new Date(a.publishedAt ?? a.createdAt);
  const diff = Date.now() - d.getTime();
  if (diff < 1000 * 60 * 60 * 24) {
    return formatDistanceToNow(d, { locale: ko, addSuffix: true });
  }
  return format(d, "M월 d일", { locale: ko });
}

function fmtPrice(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만` : n.toLocaleString();
}

/* ── 상단 LIVE 티커 ── */
function Ticker({ articles }: { articles: Article[] }) {
  const items = [...articles, ...articles];
  return (
    <div className="ticker-wrap" style={{
      background: "#040a18", borderBottom: `1px solid ${C.bd}`,
      height: "30px", overflow: "hidden", display: "flex", alignItems: "center",
    }}>
      <div style={{ flexShrink: 0, padding: "0 16px", borderRight: `1px solid ${C.bd}`, height: "100%", display: "flex", alignItems: "center", gap: "7px" }}>
        <span className="cyan-pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.cyan, display: "inline-block" }} />
        <span className="f-display" style={{ fontSize: "10px", fontWeight: 900, color: C.cyan, letterSpacing: "0.18em" }}>LIVE</span>
      </div>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track">
          {items.map((a, i) => {
            const cat = catOf(a.category);
            return (
              <Link key={`${a.id}-${i}`} href={`/articles/${a.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "0 32px", whiteSpace: "nowrap" }}>
                <span className="f-display" style={{ fontSize: "9px", fontWeight: 900, color: cat.color, letterSpacing: "0.14em" }}>{cat.label}</span>
                <span style={{ width: "2px", height: "2px", background: C.text3, borderRadius: "50%", display: "inline-block" }} />
                <span style={{ fontSize: "12px", color: C.text2 }}>{a.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 헤드라인 히어로 ── */
function Hero({ article }: { article: Article }) {
  const cat = catOf(article.category);
  return (
    <Link href={`/articles/${article.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: `linear-gradient(180deg, ${cat.dim} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.bd}`,
        padding: "40px 0 36px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          {/* 라벨 */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
            <span className="f-display" style={{
              fontSize: "10px", fontWeight: 900, color: cat.color,
              background: `${cat.color}20`, border: `1px solid ${cat.color}50`,
              padding: "3px 12px", letterSpacing: "0.2em",
            }}>{cat.emoji} {cat.label}</span>
            <span className="f-display" style={{ fontSize: "10px", color: C.text3, letterSpacing: "0.14em" }}>TOP STORY</span>
          </div>

          {/* 제목 */}
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 900,
            color: "#fff", lineHeight: 1.25, marginBottom: "16px",
            letterSpacing: "-0.5px", maxWidth: "800px",
          }}>
            {article.title}
          </h1>

          {/* 요약 */}
          {article.summary && (
            <p style={{
              fontSize: "16px", color: C.text2, lineHeight: 1.8,
              maxWidth: "680px", marginBottom: "20px",
            }}>
              {article.summary}
            </p>
          )}

          {/* 메타 */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            {article.source && (
              <span style={{ fontSize: "12px", color: C.text3, background: C.s2, border: `1px solid ${C.bd}`, padding: "3px 10px" }}>
                {article.source}
              </span>
            )}
            <span style={{ fontSize: "12px", color: C.text3 }}>{timeAgo(article)}</span>
            <span className="f-display" style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 700, color: cat.color, letterSpacing: "0.06em" }}>
              기사 전문 읽기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── 기사 목록 아이템 ── */
function ArticleItem({ article, accent, rank }: { article: Article; accent: string; rank?: number }) {
  const cat = catOf(article.category);
  return (
    <Link href={`/articles/${article.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        padding: "18px 0", borderBottom: `1px solid ${C.bd}`,
        transition: "background 0.15s",
      }} className="article-row">
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {/* 순위 */}
          {rank !== undefined && (
            <span className="f-display" style={{
              fontSize: "20px", fontWeight: 900, color: rank < 3 ? accent : C.text3,
              minWidth: "28px", flexShrink: 0, lineHeight: 1.2, marginTop: "2px",
            }}>
              {String(rank + 1).padStart(2, "0")}
            </span>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 메타 */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
              <span className="f-display" style={{
                fontSize: "9px", fontWeight: 900, color: cat.color,
                letterSpacing: "0.16em",
              }}>{cat.label}</span>
              {article.source && (
                <span style={{ fontSize: "11px", color: C.text3 }}>· {article.source}</span>
              )}
              <span style={{ fontSize: "11px", color: C.text3 }}>· {timeAgo(article)}</span>
            </div>

            {/* 제목 */}
            <h3 style={{
              fontSize: "15px", fontWeight: 700, color: C.text,
              lineHeight: 1.5, marginBottom: article.summary ? "8px" : "0",
            }}>
              {article.title}
            </h3>

            {/* 요약 */}
            {article.summary && (
              <p className="line-clamp-2" style={{ fontSize: "13px", color: C.text2, lineHeight: 1.7 }}>
                {article.summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── 섹션 헤더 ── */
function SectionHeader({ label, accent, href, count }: { label: string; accent: string; href: string; count?: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      paddingBottom: "14px", marginBottom: "4px",
      borderBottom: `2px solid ${accent}`,
    }}>
      <span style={{ width: "4px", height: "24px", background: accent, flexShrink: 0, borderRadius: "2px" }} />
      <span className="f-headline" style={{ fontSize: "clamp(16px, 2vw, 22px)", color: C.text }}>
        {label}
      </span>
      {count !== undefined && (
        <span className="f-display" style={{ fontSize: "11px", color: accent, fontWeight: 900, letterSpacing: "0.08em" }}>
          {count}건
        </span>
      )}
      <Link href={href} style={{ marginLeft: "auto", fontSize: "12px", color: C.text3, fontWeight: 700, letterSpacing: "0.06em", flexShrink: 0 }}
        className="hover-dim f-display">
        전체보기 →
      </Link>
    </div>
  );
}

/* ── 메인 페이지 ── */
export default async function HomePage() {
  const now = new Date();

  const [pokeArticles, opArticles, tcgArticles, prices, events] = await Promise.all([
    prisma.article.findMany({ where: { isPublished: true, category: "pokemon" }, orderBy: { publishedAt: "desc" }, take: 8, select: { id: true, title: true, summary: true, source: true, publishedAt: true, createdAt: true, category: true } }),
    prisma.article.findMany({ where: { isPublished: true, category: "onepiece" }, orderBy: { publishedAt: "desc" }, take: 8, select: { id: true, title: true, summary: true, source: true, publishedAt: true, createdAt: true, category: true } }),
    prisma.article.findMany({ where: { isPublished: true, category: "general" }, orderBy: { publishedAt: "desc" }, take: 6, select: { id: true, title: true, summary: true, source: true, publishedAt: true, createdAt: true, category: true } }),
    prisma.cardPrice.findMany({ orderBy: { price: "desc" }, take: 10 }),
    prisma.releaseEvent.findMany({ where: { releaseDate: { gte: now } }, orderBy: { releaseDate: "asc" }, take: 7 }),
  ]);

  const all = [...pokeArticles, ...opArticles, ...tcgArticles].sort(
    (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
  );
  const hero = all[0];
  const heroId = hero?.id;

  const pokeNews = pokeArticles.filter(a => a.id !== heroId);
  const opNews   = opArticles.filter(a => a.id !== heroId);
  const tcgNews  = tcgArticles.filter(a => a.id !== heroId);
  const tickerArticles = all.slice(0, 14);

  const pkPrices = prices.filter(p => p.category === "pokemon").slice(0, 6);
  const opPrices = prices.filter(p => p.category === "onepiece").slice(0, 6);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }} className="terminal-grid">

      {/* 티커 */}
      {tickerArticles.length > 0 && <Ticker articles={tickerArticles} />}

      {/* 히어로 */}
      {hero && <Hero article={hero} />}

      {/* MARKET 스트립 */}
      {prices.length > 0 && (
        <div style={{ background: C.s1, borderBottom: `1px solid ${C.bd}`, overflowX: "auto" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "stretch" }}>
            <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: "8px", borderRight: `1px solid ${C.bd}`, flexShrink: 0 }}>
              <span style={{ width: "2px", height: "12px", background: C.cyan, display: "inline-block" }} />
              <span className="f-display" style={{ fontSize: "10px", fontWeight: 900, color: C.cyan, letterSpacing: "0.22em" }}>MARKET</span>
            </div>
            {prices.slice(0, 7).map((p) => {
              const cat = catOf(p.category);
              const up = p.prevPrice && p.price > p.prevPrice;
              const down = p.prevPrice && p.price < p.prevPrice;
              const pct = p.prevPrice ? Math.abs(Math.round(((p.price - p.prevPrice) / p.prevPrice) * 100)) : null;
              return (
                <div key={p.id} style={{ padding: "10px 20px", borderRight: `1px solid ${C.bd}`, flexShrink: 0 }}>
                  <div className="line-clamp-1" style={{ fontSize: "11px", color: C.text2, marginBottom: "3px", maxWidth: "120px" }}>{p.cardName}</div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                    <span className="f-display" style={{ fontSize: "14px", fontWeight: 900, color: cat.color }}>
                      {fmtPrice(p.price)}<span style={{ fontSize: "9px", fontWeight: 400, color: C.text3 }}>원</span>
                    </span>
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

      {/* 메인 컨텐츠 */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 1.5rem 80px" }}>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "60px", alignItems: "start" }}>

          {/* 왼쪽: 뉴스 피드 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "52px" }}>

            {/* 포켓몬 섹션 */}
            {pokeNews.length > 0 && (
              <section>
                <SectionHeader label="포켓몬 카드게임" accent={C.pk} href="/pokemon" count={pokeNews.length} />
                <div>
                  {/* 첫 번째 기사 크게 */}
                  <Link href={`/articles/${pokeNews[0].id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ padding: "24px 0 20px", borderBottom: `1px solid ${C.bd}` }} className="article-row">
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                        <span className="f-display" style={{ fontSize: "9px", fontWeight: 900, color: C.pk, letterSpacing: "0.18em" }}>POKÉMON</span>
                        {pokeNews[0].source && <span style={{ fontSize: "11px", color: C.text3 }}>· {pokeNews[0].source}</span>}
                        <span style={{ fontSize: "11px", color: C.text3 }}>· {timeAgo(pokeNews[0])}</span>
                      </div>
                      <h2 style={{ fontSize: "20px", fontWeight: 800, color: C.text, lineHeight: 1.4, marginBottom: "10px" }}>
                        {pokeNews[0].title}
                      </h2>
                      {pokeNews[0].summary && (
                        <p className="line-clamp-2" style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8 }}>
                          {pokeNews[0].summary}
                        </p>
                      )}
                    </div>
                  </Link>
                  {/* 나머지 기사 목록 */}
                  {pokeNews.slice(1, 6).map((a, i) => (
                    <ArticleItem key={a.id} article={a} accent={C.pk} rank={i + 1} />
                  ))}
                </div>
              </section>
            )}

            {/* 원피스 섹션 */}
            {opNews.length > 0 && (
              <section>
                <SectionHeader label="원피스 카드게임" accent={C.op} href="/onepiece" count={opNews.length} />
                <div>
                  <Link href={`/articles/${opNews[0].id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ padding: "24px 0 20px", borderBottom: `1px solid ${C.bd}` }} className="article-row">
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                        <span className="f-display" style={{ fontSize: "9px", fontWeight: 900, color: C.op, letterSpacing: "0.18em" }}>ONE PIECE</span>
                        {opNews[0].source && <span style={{ fontSize: "11px", color: C.text3 }}>· {opNews[0].source}</span>}
                        <span style={{ fontSize: "11px", color: C.text3 }}>· {timeAgo(opNews[0])}</span>
                      </div>
                      <h2 style={{ fontSize: "20px", fontWeight: 800, color: C.text, lineHeight: 1.4, marginBottom: "10px" }}>
                        {opNews[0].title}
                      </h2>
                      {opNews[0].summary && (
                        <p className="line-clamp-2" style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8 }}>
                          {opNews[0].summary}
                        </p>
                      )}
                    </div>
                  </Link>
                  {opNews.slice(1, 6).map((a, i) => (
                    <ArticleItem key={a.id} article={a} accent={C.op} rank={i + 1} />
                  ))}
                </div>
              </section>
            )}

            {/* TCG 뉴스 섹션 */}
            {tcgNews.length > 0 && (
              <section>
                <SectionHeader label="TCG 뉴스" accent={C.green} href="/tcg" count={tcgNews.length} />
                <div>
                  <Link href={`/articles/${tcgNews[0].id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ padding: "24px 0 20px", borderBottom: `1px solid ${C.bd}` }} className="article-row">
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                        <span className="f-display" style={{ fontSize: "9px", fontWeight: 900, color: C.green, letterSpacing: "0.18em" }}>🃏 TCG NEWS</span>
                        {tcgNews[0].source && <span style={{ fontSize: "11px", color: C.text3 }}>· {tcgNews[0].source}</span>}
                        <span style={{ fontSize: "11px", color: C.text3 }}>· {timeAgo(tcgNews[0])}</span>
                      </div>
                      <h2 style={{ fontSize: "20px", fontWeight: 800, color: C.text, lineHeight: 1.4, marginBottom: "10px" }}>
                        {tcgNews[0].title}
                      </h2>
                      {tcgNews[0].summary && (
                        <p className="line-clamp-2" style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8 }}>
                          {tcgNews[0].summary}
                        </p>
                      )}
                    </div>
                  </Link>
                  {tcgNews.slice(1, 5).map((a, i) => (
                    <ArticleItem key={a.id} article={a} accent={C.green} rank={i + 1} />
                  ))}
                </div>
              </section>
            )}

            {pokeNews.length === 0 && opNews.length === 0 && tcgNews.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.text3 }}>
                <p style={{ fontSize: "14px" }}>수집된 기사가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px", position: "sticky", top: "76px" }}>

            {/* 발매 예정 */}
            {events.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: `1px solid ${C.bd}`, marginBottom: "4px" }}>
                  <span style={{ width: "3px", height: "18px", background: C.cyan, display: "inline-block", borderRadius: "2px" }} />
                  <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: C.text, letterSpacing: "0.06em" }}>발매 예정</span>
                  <Link href="/calendar" className="hover-dim f-display" style={{ marginLeft: "auto", fontSize: "11px", color: C.cyan, fontWeight: 700 }}>전체 →</Link>
                </div>
                <div>
                  {events.map((ev) => {
                    const d = new Date(ev.releaseDate);
                    const days = differenceInDays(d, now);
                    const cat = catOf(ev.category);
                    const dColor = days <= 7 ? C.red : days <= 30 ? C.pk : C.text3;
                    return (
                      <div key={ev.id} style={{ display: "flex", gap: "14px", padding: "12px 0", borderBottom: `1px solid ${C.bd}`, alignItems: "flex-start" }}>
                        {/* 날짜 */}
                        <div style={{ flexShrink: 0, minWidth: "40px", textAlign: "center" }}>
                          <div className="f-display" style={{ fontSize: "8px", color: cat.color, fontWeight: 800, letterSpacing: "0.06em" }}>{d.getMonth() + 1}월</div>
                          <div className="f-display" style={{ fontSize: "24px", fontWeight: 900, color: C.text, lineHeight: 1 }}>{d.getDate()}</div>
                        </div>
                        {/* 내용 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="line-clamp-2" style={{ fontSize: "12px", fontWeight: 600, color: C.text, lineHeight: 1.5, marginBottom: "5px" }}>{ev.title}</div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ fontSize: "10px" }}>{ev.isJapan ? "🇯🇵" : "🇰🇷"}</span>
                            <span className="f-display" style={{ fontSize: "11px", fontWeight: 900, color: dColor }}>D-{days}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 포켓몬 시세 */}
            {pkPrices.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: `1px solid ${C.bd}`, marginBottom: "4px" }}>
                  <span style={{ width: "3px", height: "18px", background: C.pk, display: "inline-block", borderRadius: "2px" }} />
                  <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: C.text, letterSpacing: "0.06em" }}>포켓몬 시세</span>
                  <Link href="/pokemon/prices" className="hover-dim f-display" style={{ marginLeft: "auto", fontSize: "11px", color: C.pk, fontWeight: 700 }}>전체 →</Link>
                </div>
                <div>
                  {pkPrices.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.bd}` }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0 }}>
                        <span className="f-display" style={{ fontSize: "12px", fontWeight: 900, color: i < 3 ? C.pk : C.text3, minWidth: "20px" }}>{i + 1}</span>
                        <span className="line-clamp-1" style={{ fontSize: "12px", color: C.text2 }}>{p.cardName}</span>
                      </div>
                      <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: C.pk, flexShrink: 0, marginLeft: "8px" }}>
                        {fmtPrice(p.price)}<span style={{ fontSize: "9px", fontWeight: 400, color: C.text3 }}>원</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 원피스 시세 */}
            {opPrices.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: `1px solid ${C.bd}`, marginBottom: "4px" }}>
                  <span style={{ width: "3px", height: "18px", background: C.op, display: "inline-block", borderRadius: "2px" }} />
                  <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: C.text, letterSpacing: "0.06em" }}>원피스 시세</span>
                  <Link href="/onepiece/prices" className="hover-dim f-display" style={{ marginLeft: "auto", fontSize: "11px", color: C.op, fontWeight: 700 }}>전체 →</Link>
                </div>
                <div>
                  {opPrices.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.bd}` }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0 }}>
                        <span className="f-display" style={{ fontSize: "12px", fontWeight: 900, color: i < 3 ? C.op : C.text3, minWidth: "20px" }}>{i + 1}</span>
                        <span className="line-clamp-1" style={{ fontSize: "12px", color: C.text2 }}>{p.cardName}</span>
                      </div>
                      <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: C.op, flexShrink: 0, marginLeft: "8px" }}>
                        {fmtPrice(p.price)}<span style={{ fontSize: "9px", fontWeight: 400, color: C.text3 }}>원</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .article-row:hover { background: rgba(0,212,255,0.03); padding-left: 8px; transition: padding 0.15s, background 0.15s; }
      `}</style>
    </div>
  );
}
