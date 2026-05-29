import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "덱 레시피 · 카파민" };

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#1a1a1a", bd: "#2a2a2a",
  text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  pk: "#ff9500", pkDim: "#2d1a00",
  op: "#e03030", opDim: "#2d0808",
  green: "#00cc70", blue: "#4a9eff", red: "#ff3838",
};

const CAT = {
  pokemon:  { label: "POKÉMON",   color: C.pk,  dim: C.pkDim, emoji: "🎴" },
  onepiece: { label: "ONE PIECE", color: C.op,  dim: C.opDim, emoji: "☠️" },
};

function catOf(k: string) { return CAT[k as keyof typeof CAT] ?? CAT.pokemon; }

export default async function DecksPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const decks = await prisma.deckRecipe.findMany({
    where: { isPublished: true, ...(cat ? { category: cat } : {}) },
    orderBy: { createdAt: "desc" },
  });

  const totalPk = await prisma.deckRecipe.count({ where: { isPublished: true, category: "pokemon" } });
  const totalOp = await prisma.deckRecipe.count({ where: { isPublished: true, category: "onepiece" } });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "60px" }}>

      {/* 히어로 헤더 */}
      <div style={{ background: `linear-gradient(180deg, #1a0e00 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.bd}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 1.25rem 24px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 900, color: C.pk, background: C.pkDim, border: `1px solid ${C.pk}`, padding: "3px 10px", letterSpacing: "0.12em" }}>🃏 DECK RECIPE</span>
            <span style={{ fontSize: "11px", color: C.text3, letterSpacing: "0.1em" }}>대회 우승덱 · 추천 덱 레시피</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "6px" }}>덱 레시피 DB</h1>
              <p style={{ fontSize: "13px", color: C.text2 }}>포켓몬 · 원피스 TCG 덱 레시피 데이터베이스</p>
            </div>
            <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: "28px", fontWeight: 900, color: C.pk, lineHeight: 1 }}>{totalPk}</div>
                <div style={{ fontSize: "10px", color: C.text3, fontWeight: 700, letterSpacing: "0.08em" }}>POKÉMON</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: "28px", fontWeight: 900, color: C.op, lineHeight: 1 }}>{totalOp}</div>
                <div style={{ fontSize: "10px", color: C.text3, fontWeight: 700, letterSpacing: "0.08em" }}>ONE PIECE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 1.25rem 0", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* 필터 탭 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}`, display: "flex" }}>
          {[
            { value: "",          label: "전체",     emoji: "◈" },
            { value: "pokemon",   label: "포켓몬",   emoji: "🎴" },
            { value: "onepiece",  label: "원피스",   emoji: "☠️" },
          ].map((f) => {
            const active = cat === f.value || (!cat && f.value === "");
            const cfg = f.value ? catOf(f.value) : null;
            const accentColor = cfg ? cfg.color : C.text;
            return (
              <a key={f.value}
                href={f.value ? `/decks?cat=${f.value}` : "/decks"}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "10px 20px", gap: "2px", textDecoration: "none",
                  borderBottom: active ? `3px solid ${accentColor}` : "3px solid transparent",
                  borderRight: `1px solid ${C.bd}`,
                  background: active ? C.s2 : "transparent",
                }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: active ? accentColor : C.text3, letterSpacing: "0.08em" }}>{f.emoji} {f.label.toUpperCase()}</span>
              </a>
            );
          })}
          <div style={{ marginLeft: "auto", padding: "10px 16px", display: "flex", alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: C.text3 }}>{decks.length}건</span>
          </div>
        </div>

        {/* 덱 없음 */}
        {decks.length === 0 && (
          <div style={{ background: C.s1, border: `1px solid ${C.bd}`, padding: "60px 18px", textAlign: "center", color: C.text3, fontSize: "13px" }}>
            등록된 덱 레시피가 없습니다.
          </div>
        )}

        {/* 덱 목록 */}
        {decks.map((deck) => {
          const cfg = catOf(deck.category);
          let cards: { name: string; count: number; type: string }[] = [];
          try { cards = JSON.parse(deck.cards); } catch { cards = []; }

          const pokemon = cards.filter(c => c.type === "pokemon");
          const trainer = cards.filter(c => c.type === "trainer");
          const energy  = cards.filter(c => c.type === "energy");
          const total   = cards.reduce((s, c) => s + c.count, 0);

          return (
            <div key={deck.id} style={{ background: C.s1, border: `1px solid ${C.bd}`, borderTop: `3px solid ${cfg.color}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "0" }} className="deck-inner">

                {/* 왼쪽: 덱 정보 */}
                <div style={{ padding: "18px 20px", borderRight: `1px solid ${C.bd}` }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 8px", fontSize: "10px", fontWeight: 800, color: cfg.color, background: cfg.dim, border: `1px solid ${cfg.color}`, letterSpacing: "0.08em" }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    {deck.result && (
                      <span style={{ padding: "2px 8px", fontSize: "10px", fontWeight: 800, color: "#ffd700", background: "#2a1f00", border: "1px solid #ffd700" }}>🏆 {deck.result}</span>
                    )}
                    {deck.tournament && (
                      <span style={{ fontSize: "11px", color: C.text3 }}>{deck.tournament}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 900, color: C.text, marginBottom: "8px", lineHeight: 1.3 }}>{deck.title}</h3>
                  {deck.description && (
                    <p style={{ fontSize: "13px", color: C.text2, lineHeight: 1.65, marginBottom: "10px" }}>{deck.description}</p>
                  )}
                  <div style={{ fontSize: "11px", color: C.text3 }}>
                    {deck.author && <span>by <strong style={{ color: C.text2 }}>{deck.author}</strong> · </span>}
                    <span>{format(new Date(deck.createdAt), "yyyy.MM.dd", { locale: ko })}</span>
                  </div>

                  {/* 카드 타입 통계 */}
                  {cards.length > 0 && (
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.bd}`, display: "flex", gap: "20px" }}>
                      {[
                        { label: "포켓몬", count: pokemon.reduce((s, c) => s + c.count, 0), color: C.pk },
                        { label: "트레이너", count: trainer.reduce((s, c) => s + c.count, 0), color: C.blue },
                        { label: "에너지", count: energy.reduce((s, c) => s + c.count, 0), color: C.green },
                        { label: "TOTAL", count: total, color: C.text },
                      ].map(t => (
                        <div key={t.label}>
                          <div style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.count}</div>
                          <div style={{ fontSize: "10px", color: C.text3, fontWeight: 600, marginTop: "2px" }}>{t.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 오른쪽: 카드 목록 */}
                <div style={{ padding: "16px", background: C.s2 }}>
                  <div style={{ fontSize: "9px", fontWeight: 800, color: C.text3, letterSpacing: "0.15em", marginBottom: "10px" }}>DECK LIST</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {cards.slice(0, 12).map((c, ci) => (
                      <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", background: C.s1, border: `1px solid ${C.bd}` }}>
                        <span style={{ fontSize: "11px", color: C.text2 }} className="line-clamp-1">{c.name}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: cfg.color, flexShrink: 0, marginLeft: "6px", fontWeight: 700 }}>×{c.count}</span>
                      </div>
                    ))}
                  </div>
                  {cards.length > 12 && (
                    <div style={{ fontSize: "10px", color: C.text3, textAlign: "center", marginTop: "6px", padding: "4px" }}>외 {cards.length - 12}종</div>
                  )}
                  {cards.length === 0 && (
                    <div style={{ fontSize: "12px", color: C.text3, padding: "16px 0", textAlign: "center" }}>카드 목록 없음</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@media(max-width:640px){ .deck-inner{grid-template-columns:1fr!important} }`}</style>
    </div>
  );
}
