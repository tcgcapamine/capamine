/**
 * 카드 시세 자동 수집
 * 소스: カードラッシュ (cardrush.jp) — 일본 최대 TCG 중고 거래소
 * JPY → KRW 환율 적용 (기본 9.5)
 */

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36";
const JPY_TO_KRW = 9.5;

export interface PriceItem {
  cardName: string;
  setName: string;
  category: "pokemon" | "onepiece";
  rarity: string;
  price: number; // KRW
  sourcePrice: number; // JPY
  sourceCurrency: "JPY";
}

async function fetchCardrush(query: string, category: "pokemon" | "onepiece"): Promise<PriceItem[]> {
  const url = `https://www.cardrush.jp/search?s=${encodeURIComponent(query)}&layout=list`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "ja,en;q=0.9" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`카드라쉬 ${res.status}`);
  const html = await res.text();

  const items: PriceItem[] = [];

  // 상품 블록 파싱: 이름과 가격 추출
  const blocks = html.matchAll(/<div class="product-name"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<span class="price"[^>]*>([\s\S]*?)<\/span>/g);

  for (const block of blocks) {
    const rawName = block[1].replace(/<[^>]+>/g, "").trim();
    const rawPrice = block[2].replace(/[^0-9]/g, "");
    if (!rawName || !rawPrice) continue;

    const jpy = parseInt(rawPrice, 10);
    if (!jpy || jpy < 100) continue;

    // 레어리티 추출 (SAR, SR, UR, SP, TR, SEC 등)
    const rarityMatch = rawName.match(/\b(SAR|UR|SR|RR|R|SEC|SP|TR|PROMO)\b/i);
    const rarity = rarityMatch ? rarityMatch[1].toUpperCase() : "R";

    items.push({
      cardName: rawName.slice(0, 80),
      setName: query,
      category,
      rarity,
      price: Math.round(jpy * JPY_TO_KRW / 100) * 100, // 100원 단위 반올림
      sourcePrice: jpy,
      sourceCurrency: "JPY",
    });

    if (items.length >= 10) break;
  }

  return items;
}

export async function scrapePrices(): Promise<PriceItem[]> {
  const queries: Array<{ q: string; cat: "pokemon" | "onepiece" }> = [
    { q: "ポケモンカード SAR", cat: "pokemon" },
    { q: "ポケモンカード UR", cat: "pokemon" },
    { q: "ワンピースカード SP", cat: "onepiece" },
    { q: "ワンピースカード SEC", cat: "onepiece" },
  ];

  const all: PriceItem[] = [];
  for (const { q, cat } of queries) {
    try {
      const items = await fetchCardrush(q, cat);
      all.push(...items);
    } catch (err) {
      console.error(`[카드라쉬] ${q}:`, err);
    }
  }
  return all;
}
