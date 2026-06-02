import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Metadata } from "next";

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#181818", s3: "#222222",
  bd: "#272727", text: "#f0f0f0", text2: "#999999", text3: "#4a4a4a",
  pk: "#ff9500", pkDim: "#1e1000",
  op: "#e03030", opDim: "#1a0808",
  green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

const CAT = {
  pokemon:  { label: "POKÉMON",   color: C.pk,  dim: C.pkDim, emoji: "🎴",  href: "/pokemon" },
  onepiece: { label: "ONE PIECE", color: C.op,  dim: C.opDim, emoji: "☠️", href: "/onepiece" },
};
const catOf = (k: string) => CAT[k as keyof typeof CAT] ?? CAT.pokemon;

type Card = { name: string; count: number; type: string };

const TYPE_ORDER = ["리더", "포켓몬", "캐릭터", "이벤트", "스타디움", "트레이너", "아이템", "서포트", "에너지"];
const TYPE_COLOR: Record<string, string> = {
  리더: C.red, 포켓몬: C.pk, 캐릭터: C.op,
  이벤트: C.blue, 스타디움: C.green, 트레이너: C.blue,
  아이템: "#a78bfa", 서포트: "#34d399", 에너지: C.green,
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const deck = await prisma.deckRecipe.findUnique({ where: { id } });
  if (!deck) return { title: "덱을 찾을 수 없습니다 · 카파민" };
  return { title: `${deck.title} · 카파민`, description: deck.description ?? undefined };
}

export default async function DeckDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deck = await prisma.deckRecipe.findUnique({ where: { id } });
  if (!deck || !deck.isPublished) notFound();

  const cat = catOf(deck.category);

  let cards: Card[] = [];
  try { cards = JSON.parse(deck.cards); } catch { cards = []; }

  // 타입별 그룹화
  const grouped = TYPE_ORDER.reduce<Record<string, Card[]>>((acc, type) => {
    const group = cards.filter(c => c.type === type);
    if (group.length > 0) acc[type] = group;
    return acc;
  }, {});

  // 통계
  const stats = [
    { label: deck.category === "pokemon" ? "포켓몬" : "캐릭터", types: ["포켓몬", "캐릭터", "리더"], color: cat.color },
    { label: "이벤트/트레이너", types: ["이벤트", "트레이너", "아이템", "서포트", "스타디움"], color: C.blue },
    { label: "에너지", types: ["에너지"], color: C.green },
  ].map(s => ({
    ...s,
    count: cards.filter(c => s.types.includes(c.type)).reduce((sum, c) => sum + c.count, 0),
  }));
  const total = cards.reduce((s, c) => s + c.count, 0);

  // 관련 덱 (같은 카테고리)
  const related = await prisma.deckRecipe.findMany({
    where: { isPublished: true, category: deck.category, id: { not: id } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>

      {/* 히어로 */}
      <div style={{ background: `linear-gradient(135deg, ${cat.dim} 0%, ${C.bg} 55%)`, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 1.25rem 28px" }}>
          {/* 브레드크럼 */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
            <Link href="/" style={{ fontSize: "11px", color: C.text3 }}>홈</Link>
            <span style={{ fontSize: "11px", color: C.text3 }}>›</span>
            <Link href="/decks" style={{ fontSize: "11px", color: C.text3 }}>덱 레시피</Link>
            <span style={{ fontSize: "11px", color: C.text3 }}>›</span>
            <span style={{ fontSize: "11px", color: C.text2 }} className="line-clamp-1">{deck.title}</span>
          </div>

          {/* 뱃지 */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
            <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: cat.color, background: `${cat.color}18`, border: `1px solid ${cat.color}40`, padding: "3px 12px", letterSpacing: "0.18em" }}>
              {cat.emoji} {cat.label}
            </span>
            {deck.result && (
              <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: "#ffd700", background: "#2a1f00", border: "1px solid #ffd700", padding: "3px 12px" }}>
                🏆 {deck.result}
              </span>
            )}
          </div>

          <h1 className="f-headline" style={{ fontSize: "clamp(20px, 3vw, 30px)", color: "#fff", marginBottom: "10px", lineHeight: 1.3 }}>
            {deck.title}
          </h1>

          {deck.description && (
            <p style={{ fontSize: "14px", color: C.text2, lineHeight: 1.8, maxWidth: "640px", marginBottom: "14px" }}>
              {deck.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "11px", color: C.text3 }}>
            {deck.author && <span>by <strong style={{ color: C.text2 }}>{deck.author}</strong></span>}
            {deck.tournament && <span>📍 {deck.tournament}</span>}
            <span>{format(new Date(deck.createdAt), "yyyy.MM.dd", { locale: ko })}</span>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 1.25rem 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "28px", alignItems: "start" }} className="deck-grid">

          {/* 왼쪽: 카드 목록 */}
          <div>
            {/* 통계 바 */}
            <div style={{ display: "flex", gap: "2px", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "24px" }}>
              {stats.filter(s => s.count > 0).map(s => (
                <div key={s.label} style={{ flex: s.count, background: s.color, opacity: 0.8 }} />
              ))}
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div className="f-display" style={{ fontSize: "22px", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.count}</div>
                  <div style={{ fontSize: "10px", color: C.text3, marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
              <div>
                <div className="f-display" style={{ fontSize: "22px", fontWeight: 900, color: C.text, lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: "10px", color: C.text3, marginTop: "2px" }}>TOTAL</div>
              </div>
            </div>

            {/* 카드 타입별 목록 */}
            {Object.entries(grouped).map(([type, typeCards]) => {
              const typeColor = TYPE_COLOR[type] ?? C.text2;
              const typeTotal = typeCards.reduce((s, c) => s + c.count, 0);
              return (
                <div key={type} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${C.bd}` }}>
                    <span style={{ width: "3px", height: "16px", background: typeColor, display: "inline-block" }} />
                    <span className="f-display" style={{ fontSize: "11px", fontWeight: 800, color: typeColor, letterSpacing: "0.1em" }}>{type.toUpperCase()}</span>
                    <span className="f-display" style={{ fontSize: "11px", color: C.text3, fontWeight: 700 }}>{typeTotal}장</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    {typeCards.map((card, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.s1, border: `1px solid ${C.bd}` }}>
                        <span style={{ fontSize: "13px", color: C.text, fontWeight: 600 }}>{card.name}</span>
                        <span className="f-display" style={{ fontSize: "13px", fontWeight: 900, color: typeColor, marginLeft: "8px" }}>×{card.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {cards.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: C.text3, background: C.s1, border: `1px solid ${C.bd}` }}>
                카드 목록이 없습니다.
              </div>
            )}

            {/* 하단 내비 */}
            <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between" }}>
              <Link href="/decks" style={{ fontSize: "12px", color: C.text3, padding: "8px 16px", border: `1px solid ${C.bd}`, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                ← 덱 목록
              </Link>
              <Link href="/" style={{ fontSize: "12px", color: C.text3, padding: "8px 16px", border: `1px solid ${C.bd}` }}>
                홈으로
              </Link>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div style={{ position: "sticky", top: "76px" }}>

            {/* 덱 정보 */}
            <div style={{ background: C.s1, border: `1px solid ${C.bd}`, marginBottom: "16px" }}>
              <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "16px", background: cat.color, display: "inline-block" }} />
                <span style={{ fontSize: "12px", fontWeight: 900, color: C.text }}>덱 정보</span>
              </div>
              <div style={{ padding: "14px" }}>
                {[
                  { label: "작성자", value: deck.author },
                  { label: "대회", value: deck.tournament },
                  { label: "결과", value: deck.result },
                  { label: "등록일", value: format(new Date(deck.createdAt), "yyyy.MM.dd", { locale: ko }) },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.bd}`, fontSize: "12px" }}>
                    <span style={{ color: C.text3 }}>{row.label}</span>
                    <span style={{ color: C.text2, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 관련 덱 */}
            {related.length > 0 && (
              <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "16px", background: cat.color, display: "inline-block" }} />
                  <span style={{ fontSize: "12px", fontWeight: 900, color: C.text }}>관련 덱</span>
                </div>
                {related.map((r, i) => (
                  <Link key={r.id} href={`/decks/${r.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ padding: "12px 14px", borderBottom: i < related.length - 1 ? `1px solid ${C.bd}` : "none", transition: "background 0.12s" }}
                      className="related-deck-item">
                      <div style={{ fontSize: "12px", color: C.text, fontWeight: 600, lineHeight: 1.4, marginBottom: "4px" }}>{r.title}</div>
                      {r.result && <div style={{ fontSize: "10px", color: "#ffd700" }}>🏆 {r.result}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:720px){ .deck-grid{grid-template-columns:1fr!important} }
        .related-deck-item:hover { background: #1a1a1a; }
      `}</style>
    </div>
  );
}
