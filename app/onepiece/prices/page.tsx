import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "원피스 카드 시세" };

export default async function OnePiecePricesPage() {
  const prices = await prisma.cardPrice.findMany({
    where: { category: "onepiece" },
    orderBy: { price: "desc" },
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "4px" }}>원피스 카드 시세</h1>
      <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "2rem" }}>최근 거래 기준 시세 정보입니다.</p>

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2rem 1fr 100px 80px 80px" }}>
          {["#", "카드명 / 세트", "레어도", "현재가", "등락"].map((h, i) => (
            <div key={i} style={{ padding: "12px 14px", fontSize: "11px", fontWeight: "700", color: "#6b7280", borderBottom: "1px solid #2a2a2a" }}>{h}</div>
          ))}
        </div>
        {prices.map((card, i) => {
          const diff = card.prevPrice ? card.price - card.prevPrice : 0;
          const pct = card.prevPrice ? Math.round((diff / card.prevPrice) * 100) : 0;
          return (
            <div key={card.id} style={{ display: "grid", gridTemplateColumns: "2rem 1fr 100px 80px 80px", borderBottom: i < prices.length - 1 ? "1px solid #111" : "none", alignItems: "center" }}>
              <div style={{ padding: "14px", fontSize: "12px", color: i < 3 ? "#f87171" : "#4b5563", fontWeight: "700" }}>{i + 1}</div>
              <div style={{ padding: "14px 14px 14px 0" }}>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>{card.cardName}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>{card.setName}</div>
              </div>
              <div style={{ padding: "14px 0", fontSize: "12px", color: "#9ca3af" }}>{card.rarity ?? "-"}</div>
              <div style={{ padding: "14px 0", fontSize: "13px", fontWeight: "700", color: "#f87171" }}>{card.price.toLocaleString()}원</div>
              <div style={{ padding: "14px", fontSize: "12px", fontWeight: "600", color: diff > 0 ? "#f87171" : diff < 0 ? "#4ade80" : "#6b7280" }}>
                {diff !== 0 ? `${diff > 0 ? "▲" : "▼"} ${Math.abs(pct)}%` : "-"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
