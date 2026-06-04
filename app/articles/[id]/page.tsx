import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Metadata } from "next";
import { getRelatedPokemonCards, getOnePieceCardUrl } from "@/lib/cards/pokemon-api";

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#1a1a1a", bd: "#2a2a2a",
  text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  pk: "#ff9500", pkDim: "#2d1a00",
  op: "#e03030", opDim: "#2d0808",
  green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

const CAT = {
  pokemon:  { color: C.pk,   dim: C.pkDim,  label: "POKÉMON",   emoji: "🎴",  href: "/pokemon" },
  onepiece: { color: C.op,   dim: C.opDim,  label: "ONE PIECE", emoji: "☠️",  href: "/onepiece" },
  general:  { color: C.blue, dim: "#0a1f3d", label: "GENERAL",  emoji: "📋",  href: "/" },
};
const catOf = (k: string) => CAT[k as keyof typeof CAT] ?? CAT.general;

/* ── 메타데이터 ── */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { title: "기사를 찾을 수 없습니다 · 카파민" };
  return {
    title: `${article.title} · 카파민`,
    description: article.summary ?? undefined,
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || !article.isPublished) notFound();

  const cat = catOf(article.category);
  const date = format(
    new Date(article.publishedAt ?? article.createdAt),
    "yyyy년 M월 d일 (EEE)",
    { locale: ko }
  );

  // 관련 포켓몬 카드 (태그 기반)
  const relatedCards = article.category === "pokemon" && article.tags
    ? await getRelatedPokemonCards(article.tags)
    : [];

  // 관련 기사 (같은 카테고리, 최신 4건)
  const related = await prisma.article.findMany({
    where: { isPublished: true, category: article.category, id: { not: id } },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: { id: true, title: true, publishedAt: true, createdAt: true, source: true },
  });

  // 태그 파싱
  const tags = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  // 본문 단락 분리
  const paragraphs = (article.content || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>

      {/* ── 히어로 ── */}
      <div style={{ background: `linear-gradient(180deg, ${cat.dim} 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 1.25rem 28px" }}>

          {/* 브레드크럼 */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
            <Link href="/" style={{ fontSize: "11px", color: C.text3, textDecoration: "none" }}>홈</Link>
            <span style={{ fontSize: "11px", color: C.text3 }}>›</span>
            <Link href={cat.href} style={{ fontSize: "11px", color: C.text3, textDecoration: "none" }}>{cat.label}</Link>
            <span style={{ fontSize: "11px", color: C.text3 }}>›</span>
            <span style={{ fontSize: "11px", color: C.text2 }} className="line-clamp-1">{article.title}</span>
          </div>

          {/* 카테고리 뱃지 */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: 900, color: cat.color, background: cat.dim, border: `1px solid ${cat.color}`, padding: "3px 10px", letterSpacing: "0.12em" }}>
              {cat.emoji} {cat.label}
            </span>
          </div>

          {/* 제목 */}
          <h1 style={{ fontSize: "clamp(20px, 3.5vw, 32px)", fontWeight: 900, color: "#fff", lineHeight: 1.35, marginBottom: "16px", letterSpacing: "-0.3px" }}>
            {article.title}
          </h1>

          {/* 메타 */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            {article.source && (
              <span style={{ fontSize: "11px", color: C.text3, background: C.s2, border: `1px solid ${C.bd}`, padding: "2px 8px" }}>
                {article.source}
              </span>
            )}
            <span style={{ fontSize: "11px", color: C.text3 }}>{date}</span>
          </div>
        </div>
      </div>

      {/* ── 본문 영역 ── */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "32px", alignItems: "start", paddingTop: "32px" }} className="article-grid">

          {/* 왼쪽: 본문 */}
          <div>
            {/* 요약 */}
            {article.summary && (
              <div style={{ background: cat.dim, border: `1px solid ${cat.color}20`, borderLeft: `3px solid ${cat.color}`, padding: "14px 16px", marginBottom: "28px" }}>
                <p style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8, fontWeight: 500 }}>
                  {article.summary}
                </p>
              </div>
            )}

            {/* 본문 단락 */}
            <div style={{ color: C.text2, lineHeight: 1.9, fontSize: "15px" }}>
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} style={{ marginBottom: "18px" }}>{p}</p>
                ))
              ) : (
                <p style={{ color: C.text3 }}>본문 내용이 없습니다.</p>
              )}
            </div>

            {/* 태그 */}
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${C.bd}` }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ fontSize: "11px", color: cat.color, background: cat.dim, border: `1px solid ${cat.color}40`, padding: "3px 10px", fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 원문 링크 */}
            {article.sourceUrl && (
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `1px solid ${C.bd}` }}>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 20px", fontSize: "12px", fontWeight: 800,
                    color: cat.color, background: cat.dim,
                    border: `1px solid ${cat.color}`,
                    textDecoration: "none", letterSpacing: "0.05em",
                  }}>
                  원문 보기 →
                </a>
              </div>
            )}

            {/* 하단 내비 */}
            <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between" }}>
              <Link href={cat.href}
                style={{ fontSize: "12px", color: C.text3, textDecoration: "none", padding: "8px 16px", border: `1px solid ${C.bd}`, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                ← {cat.label} 목록
              </Link>
              <Link href="/"
                style={{ fontSize: "12px", color: C.text3, textDecoration: "none", padding: "8px 16px", border: `1px solid ${C.bd}` }}>
                홈으로
              </Link>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div style={{ position: "sticky", top: "76px" }}>

            {/* 관련 카드 (포켓몬) */}
            {relatedCards.length > 0 && (
              <div style={{ background: C.s1, border: `1px solid ${C.bd}`, marginBottom: "16px" }}>
                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "16px", background: cat.color, display: "inline-block" }} />
                  <span style={{ fontSize: "12px", fontWeight: 900, color: C.text }}>관련 카드</span>
                  <Link href="/cards" style={{ marginLeft: "auto", fontSize: "10px", color: C.text3 }}>카드 DB →</Link>
                </div>
                <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {relatedCards.map(card => (
                    <Link key={card.id} href={`/cards/${card.id}`} style={{ textDecoration: "none" }} className="hover-dim">
                      <div style={{ textAlign: "center" }}>
                        <img src={card.images.small} alt={card.name}
                          style={{ width: "100%", borderRadius: "4px", border: `1px solid ${C.bd}` }}
                          loading="lazy" />
                        <div style={{ fontSize: "10px", color: C.text2, marginTop: "4px", lineHeight: 1.3 }} className="line-clamp-2">{card.name}</div>
                        {card.rarity && (
                          <div style={{ fontSize: "9px", color: cat.color, fontWeight: 700, marginTop: "2px" }}>{card.rarity}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 원피스 카드 검색 링크 */}
            {article.category === "onepiece" && article.tags && (
              <div style={{ background: C.s1, border: `1px solid ${C.bd}`, marginBottom: "16px" }}>
                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "16px", background: cat.color, display: "inline-block" }} />
                  <span style={{ fontSize: "12px", fontWeight: 900, color: C.text }}>관련 카드 검색</span>
                </div>
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {article.tags.split(",").slice(0, 3).map(t => t.trim()).filter(t => t.length > 2).map(tag => (
                    <a key={tag} href={getOnePieceCardUrl(tag)} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "12px", color: cat.color, padding: "6px 10px", border: `1px solid ${cat.color}40`, display: "block" }}
                      className="hover-dim">
                      🔍 "{tag}" 카드 보기 →
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 관련 기사 */}
            <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
              <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "16px", background: cat.color, display: "inline-block" }} />
                <span style={{ fontSize: "12px", fontWeight: 900, color: C.text }}>관련 기사</span>
              </div>
              {related.length === 0 ? (
                <div style={{ padding: "16px 14px", fontSize: "12px", color: C.text3 }}>관련 기사가 없습니다.</div>
              ) : (
                related.map((r, i) => (
                  <Link key={r.id} href={`/articles/${r.id}`} className="related-item" style={{ textDecoration: "none", display: "block" }}>
                    <div style={{
                      padding: "12px 14px",
                      borderBottom: i < related.length - 1 ? `1px solid ${C.bd}` : "none",
                    }}>
                      <div style={{ fontSize: "12px", color: C.text, lineHeight: 1.5, fontWeight: 600 }} className="line-clamp-2">
                        {r.title}
                      </div>
                      <div style={{ fontSize: "10px", color: C.text3, marginTop: "5px" }}>
                        {format(new Date(r.publishedAt ?? r.createdAt), "M/d", { locale: ko })}
                        {r.source && ` · ${r.source}`}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:720px){ .article-grid{grid-template-columns:1fr!important} }
        .related-item > div { transition: background 0.12s, border-left-color 0.12s; border-left: 2px solid transparent; }
        .related-item:hover > div { background: #1a1a1a; border-left-color: ${cat.color}; }
      `}</style>
    </div>
  );
}
