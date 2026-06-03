import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "카드 검색 · 카파민" };

const C = {
  bg: "#060d1f", s1: "#0a1628", s2: "#0f1f3a",
  bd: "#1e3354", text: "#e8f4fd", text2: "#7aa8cc", text3: "#3a5c7a",
  pk: "#ff9500", cyan: "#00d4ff",
};

interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  rarity?: string;
  set: { name: string; series: string };
  images: { small: string; large: string };
  number: string;
  cardmarket?: { prices?: { averageSellPrice?: number } };
}

interface ApiResponse {
  data: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

async function searchCards(query: string, page = 1): Promise<ApiResponse> {
  const q = query
    ? `name:"${query}*"`
    : 'supertype:pokemon rarity:"Special Illustration Rare" OR rarity:"Ultra Rare"';
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&page=${page}&pageSize=24&orderBy=-set.releaseDate`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": process.env.POKEMON_TCG_API_KEY ?? "" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Pokemon TCG API 오류");
  return res.json();
}

function RarityBadge({ rarity }: { rarity?: string }) {
  if (!rarity) return null;
  const color = rarity.includes("Illustration") || rarity.includes("Special")
    ? C.pk
    : rarity.includes("Ultra") || rarity.includes("Hyper")
    ? C.cyan
    : C.text3;
  return (
    <span className="f-display" style={{
      fontSize: "9px", fontWeight: 800, color,
      background: `${color}18`, border: `1px solid ${color}40`,
      padding: "2px 7px", letterSpacing: "0.08em",
    }}>
      {rarity}
    </span>
  );
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);

  let data: ApiResponse | null = null;
  let error = "";

  try {
    data = await searchCards(q, pageNum);
  } catch (e) {
    error = String(e);
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: "80px" }}>
      {/* 헤더 */}
      <div style={{ background: `linear-gradient(135deg, #1e0f00 0%, ${C.bg} 60%)`, borderBottom: `1px solid ${C.bd}`, padding: "28px 1.5rem 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
            <span className="f-display" style={{ fontSize: "10px", fontWeight: 800, color: C.pk, background: `${C.pk}18`, border: `1px solid ${C.pk}40`, padding: "3px 12px", letterSpacing: "0.18em" }}>
              🎴 CARD DB
            </span>
          </div>
          <h1 className="f-headline" style={{ fontSize: "clamp(20px, 3vw, 28px)", color: C.text, marginBottom: "16px" }}>
            포켓몬 카드 검색
          </h1>

          {/* 검색 폼 */}
          <form method="get" style={{ display: "flex", gap: "8px", maxWidth: "480px" }}>
            <input
              name="q"
              defaultValue={q}
              placeholder="카드 이름 검색 (영문)... ex: Charizard, Pikachu"
              style={{
                flex: 1, padding: "10px 14px", background: C.s2,
                border: `1px solid ${C.bd}`, color: C.text, fontSize: "14px",
                outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "10px 20px", background: C.pk, border: "none",
              color: "#000", fontSize: "13px", fontWeight: 800, cursor: "pointer",
              letterSpacing: "0.06em",
            }}>
              검색
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 1.5rem 0" }}>
        {error && (
          <div style={{ padding: "20px", color: "#ff4444", background: C.s1, border: `1px solid ${C.bd}`, marginBottom: "24px" }}>
            카드 데이터를 불러오지 못했습니다. (API 키 필요)
          </div>
        )}

        {data && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", color: C.text3 }}>
                총 <strong style={{ color: C.text }}>{data.totalCount.toLocaleString()}</strong>장
                {q && ` · "${q}" 검색 결과`}
              </span>
              <span style={{ fontSize: "12px", color: C.text3 }}>
                {pageNum} / {Math.ceil(data.totalCount / 24)} 페이지
              </span>
            </div>

            {/* 카드 그리드 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
              {data.data.map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`} style={{ textDecoration: "none" }}>
                  <div className="card-lift" style={{ background: C.s1, border: `1px solid ${C.bd}`, overflow: "hidden", borderTop: `2px solid ${C.pk}` }}>
                    {/* 카드 이미지 */}
                    <div style={{ background: C.s2, display: "flex", justifyContent: "center", padding: "12px" }}>
                      <img
                        src={card.images.small}
                        alt={card.name}
                        style={{ width: "100%", maxWidth: "130px", height: "auto", borderRadius: "4px" }}
                        loading="lazy"
                      />
                    </div>
                    {/* 카드 정보 */}
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "4px", lineHeight: 1.3 }}>{card.name}</div>
                      <div style={{ fontSize: "11px", color: C.text3, marginBottom: "6px" }}>{card.set.name}</div>
                      <RarityBadge rarity={card.rarity} />
                      {card.cardmarket?.prices?.averageSellPrice && (
                        <div className="f-display" style={{ marginTop: "6px", fontSize: "13px", fontWeight: 900, color: C.pk }}>
                          €{card.cardmarket.prices.averageSellPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
              {pageNum > 1 && (
                <Link href={`/cards?q=${q}&page=${pageNum - 1}`}
                  style={{ padding: "8px 16px", background: C.s1, border: `1px solid ${C.bd}`, color: C.text2, fontSize: "13px" }}>
                  ← 이전
                </Link>
              )}
              {pageNum < Math.ceil(data.totalCount / 24) && (
                <Link href={`/cards?q=${q}&page=${pageNum + 1}`}
                  style={{ padding: "8px 16px", background: C.pk, border: "none", color: "#000", fontSize: "13px", fontWeight: 700 }}>
                  다음 →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
