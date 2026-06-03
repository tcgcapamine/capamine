"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const C = {
  bg: "#060d1f", s1: "#0a1628", s2: "#0f1f3a",
  bd: "#1e3354", text: "#e8f4fd", text2: "#7aa8cc", text3: "#3a5c7a",
  pk: "#ff9500", op: "#e03030", cyan: "#00d4ff",
  green: "#00ffaa", red: "#ff4444",
};

function fmtPrice(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString();
}

function MiniChart({ history, color }: { history: { price: number; date: string }[]; color: string }) {
  if (history.length < 2) return (
    <div style={{ padding: "20px", textAlign: "center", color: C.text3, fontSize: "12px" }}>
      아직 히스토리 데이터가 부족합니다. 매일 자동 업데이트됩니다.
    </div>
  );

  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 600; const H = 120;
  const PAD = 20;

  const points = history.map((h, i) => {
    const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - h.price) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = [
    `${PAD},${H}`,
    ...history.map((h, i) => {
      const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
      const y = PAD + ((max - h.price) / range) * (H - PAD * 2);
      return `${x},${y}`;
    }),
    `${W - PAD},${H}`,
  ].join(" ");

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "120px" }}>
        {/* 그리드 라인 */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i}
            x1={PAD} x2={W - PAD}
            y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
            stroke={C.bd} strokeWidth="0.5" strokeDasharray="4,4"
          />
        ))}
        {/* 영역 fill */}
        <polygon points={areaPoints} fill={`${color}15`} />
        {/* 라인 */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {/* 포인트 */}
        {history.map((h, i) => {
          const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
          const y = PAD + ((max - h.price) / range) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: C.text3, marginTop: "4px" }}>
        <span>{new Date(history[0].date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
        <span>{new Date(history[history.length - 1].date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}

export default function PriceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ card: any; history: { price: number; date: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prices/history?id=${id}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.text3 }}>
      로딩 중...
    </div>
  );

  if (!data?.card) return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "60px 1.5rem", textAlign: "center", color: C.text3 }}>
      카드를 찾을 수 없습니다.
    </div>
  );

  const { card, history } = data;
  const color = card.category === "pokemon" ? C.pk : C.op;
  const diff = card.prevPrice ? card.price - card.prevPrice : 0;
  const pct = card.prevPrice ? ((diff / card.prevPrice) * 100).toFixed(1) : null;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>
      {/* 헤더 */}
      <div style={{ background: `linear-gradient(135deg, ${card.category === "pokemon" ? "#1e0f00" : "#1a0808"} 0%, ${C.bg} 60%)`, borderBottom: `1px solid ${C.bd}`, padding: "28px 1.5rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ marginBottom: "12px" }}>
            <Link href={`/${card.category}/prices`} style={{ fontSize: "12px", color: C.text3 }}>
              ← {card.category === "pokemon" ? "포켓몬" : "원피스"} 시세 목록
            </Link>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <span className="f-display" style={{ fontSize: "9px", fontWeight: 800, color, background: `${color}18`, border: `1px solid ${color}40`, padding: "3px 10px", letterSpacing: "0.14em" }}>
              {card.category === "pokemon" ? "🎴 POKÉMON" : "☠️ ONE PIECE"}
            </span>
            {card.rarity && (
              <span className="f-display" style={{ fontSize: "9px", fontWeight: 800, color: C.cyan, letterSpacing: "0.1em" }}>{card.rarity}</span>
            )}
          </div>
          <h1 className="f-headline" style={{ fontSize: "clamp(18px, 3vw, 26px)", color: C.text, marginBottom: "6px" }}>{card.cardName}</h1>
          <div style={{ fontSize: "12px", color: C.text3 }}>{card.setName}</div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "32px auto 0", padding: "0 1.5rem" }}>
        {/* 가격 현황 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}`, padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "12px", color: C.text3, marginBottom: "6px" }}>현재가</div>
              <div className="f-display" style={{ fontSize: "36px", fontWeight: 900, color, lineHeight: 1 }}>
                {card.price.toLocaleString()}<span style={{ fontSize: "16px", fontWeight: 400, color: C.text3 }}>원</span>
              </div>
            </div>
            {card.prevPrice && (
              <div>
                <div style={{ fontSize: "12px", color: C.text3, marginBottom: "6px" }}>전일대비</div>
                <div className="f-display" style={{ fontSize: "24px", fontWeight: 900, color: diff > 0 ? C.red : diff < 0 ? C.green : C.text3, lineHeight: 1 }}>
                  {diff > 0 ? "▲" : diff < 0 ? "▼" : ""} {Math.abs(diff).toLocaleString()}원
                  {pct && <span style={{ fontSize: "14px", marginLeft: "6px" }}>({pct}%)</span>}
                </div>
              </div>
            )}
            {card.prevPrice && (
              <div>
                <div style={{ fontSize: "12px", color: C.text3, marginBottom: "6px" }}>전일가</div>
                <div className="f-display" style={{ fontSize: "20px", fontWeight: 700, color: C.text2, lineHeight: 1 }}>
                  {card.prevPrice.toLocaleString()}원
                </div>
              </div>
            )}
          </div>
          {card.source && (
            <div style={{ marginTop: "12px", fontSize: "11px", color: C.text3 }}>출처: {card.source}</div>
          )}
        </div>

        {/* 가격 차트 */}
        <div style={{ background: C.s1, border: `1px solid ${C.bd}`, padding: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ width: "3px", height: "16px", background: color, display: "inline-block" }} />
            <span className="f-display" style={{ fontSize: "12px", fontWeight: 800, color: C.text, letterSpacing: "0.1em" }}>가격 변동 추이</span>
            <span style={{ fontSize: "11px", color: C.text3 }}>({history.length}일 기록)</span>
          </div>
          <MiniChart history={history} color={color} />
          {history.length >= 2 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", padding: "10px", background: C.s2, border: `1px solid ${C.bd}` }}>
              <div style={{ fontSize: "12px", color: C.text3 }}>
                최저: <strong style={{ color: C.green }}>{Math.min(...history.map(h => h.price)).toLocaleString()}원</strong>
              </div>
              <div style={{ fontSize: "12px", color: C.text3 }}>
                최고: <strong style={{ color: C.red }}>{Math.max(...history.map(h => h.price)).toLocaleString()}원</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
