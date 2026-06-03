import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "포켓몬 카드 시세 · 카파민" };

const C = {
  bg: "#0a0a0a", s1: "#111111", s2: "#181818",
  bd: "#272727", text: "#f0f0f0", text2: "#999999", text3: "#4a4a4a",
  pk: "#ff9500", green: "#00cc70", red: "#ff3838",
};

export default async function PokemonPricesPage() {
  const prices = await prisma.cardPrice.findMany({
    where: { category: "pokemon" },
    orderBy: { price: "desc" },
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>
      {/* 헤더 */}
      <div style={{ background: `linear-gradient(135deg, #1e1000 0%, ${C.bg} 60%)`, borderBottom: `1px solid ${C.bd}`, padding: "28px 1.25rem 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
            <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: C.pk, background: `${C.pk}18`, border: `1px solid ${C.pk}40`, padding: "3px 12px", letterSpacing: "0.18em" }}>
              🎴 POKÉMON
            </span>
          </div>
          <h1 className="f-headline" style={{ fontSize: "clamp(20px, 3vw, 28px)", color: C.text, marginBottom: "6px" }}>포켓몬 카드 시세</h1>
          <p style={{ fontSize: "12px", color: C.text3 }}>네이버 쇼핑 실거래가 기준 · 매일 자동 업데이트</p>
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ maxWidth: "900px", margin: "32px auto 0", padding: "0 1.25rem" }}>
        <div style={{ background: C.s1, border: `1px solid ${C.bd}` }}>
          {/* 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px 110px 80px", borderBottom: `1px solid ${C.bd}`, background: C.s2 }}>
            {["#", "카드명 / 세트", "레어도", "현재가", "등락"].map((h, i) => (
              <div key={i} className="f-display" style={{ padding: "10px 14px", fontSize: "10px", fontWeight: 800, color: C.text3, letterSpacing: "0.12em" }}>{h}</div>
            ))}
          </div>

          {prices.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: C.text3, fontSize: "13px" }}>시세 데이터가 없습니다.</div>
          )}

          {prices.map((card, i) => {
            const diff = card.prevPrice ? card.price - card.prevPrice : 0;
            const pct = card.prevPrice ? Math.round((diff / card.prevPrice) * 100) : 0;
            const diffColor = diff > 0 ? C.red : diff < 0 ? C.green : C.text3;

            return (
              <div key={card.id} style={{
                display: "grid", gridTemplateColumns: "44px 1fr 90px 110px 80px",
                borderBottom: i < prices.length - 1 ? `1px solid ${C.bd}` : "none",
                alignItems: "center",
              }}>
                {/* 순위 */}
                <div className="f-display" style={{ padding: "14px", fontSize: "14px", fontWeight: 900, color: i < 3 ? C.pk : C.text3 }}>{i + 1}</div>

                {/* 카드명 */}
                <div style={{ padding: "14px 14px 14px 0" }}>
                  <Link href={`/prices/${card.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "3px" }} className="hover-dim">{card.cardName} →</div>
                </Link>
                  <div style={{ fontSize: "11px", color: C.text3 }}>{card.setName}</div>
                  {card.source && <div style={{ fontSize: "10px", color: C.text3, marginTop: "2px" }}>출처: {card.source}</div>}
                </div>

                {/* 레어도 */}
                <div className="f-display" style={{ padding: "14px 0", fontSize: "11px", fontWeight: 800, color: C.pk, letterSpacing: "0.08em" }}>{card.rarity ?? "-"}</div>

                {/* 가격 */}
                <div className="f-display" style={{ padding: "14px 0", fontSize: "15px", fontWeight: 900, color: C.pk }}>
                  {card.price.toLocaleString()}<span style={{ fontSize: "10px", fontWeight: 400, color: C.text3 }}>원</span>
                </div>

                {/* 등락 */}
                <div className="f-display" style={{ padding: "14px", fontSize: "12px", fontWeight: 800, color: diffColor }}>
                  {diff !== 0 ? `${diff > 0 ? "▲" : "▼"} ${Math.abs(pct)}%` : <span style={{ color: C.text3 }}>-</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
