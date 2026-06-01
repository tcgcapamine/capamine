/**
 * 네이버 쇼핑 검색 API를 이용한 TCG 카드 시세 수집
 * - 실제 유통 단품 카드 기준 (PSA/BGS 그레이딩 제외)
 * - 최저가 ~ 최고가 범위에서 중간값 사용
 */

export interface NaverPriceItem {
  cardName: string;
  setName: string;
  category: "pokemon" | "onepiece";
  rarity: string;
  price: number;
  mallName: string;
}

interface NaverShopItem {
  title: string;
  lprice: string;
  hprice: string;
  mallName: string;
}

async function searchNaver(query: string, display = 20): Promise<NaverShopItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("NAVER API 키 없음");

  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=${display}&sort=sim`;
  const res = await fetch(url, {
    headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`네이버 API ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

function cleanTitle(title: string): string {
  return title.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}

// PSA/BGS 그레이딩 카드 제외, 가격 범위 필터
function filterItems(items: NaverShopItem[]): NaverShopItem[] {
  return items.filter(item => {
    const title = cleanTitle(item.title).toLowerCase();
    const price = parseInt(item.lprice, 10);
    // 그레이딩 카드 제외
    if (/psa|bgs|cgc|슬래브|graded/.test(title)) return false;
    // 비현실적 가격 제외 (1천원 미만, 500만원 초과)
    if (price < 1000 || price > 5000000) return false;
    return true;
  });
}

// 여러 상품 가격의 중간값
function medianPrice(items: NaverShopItem[]): number {
  const prices = items.map(i => parseInt(i.lprice, 10)).filter(p => p > 0).sort((a, b) => a - b);
  if (prices.length === 0) return 0;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 === 0 ? Math.round((prices[mid - 1] + prices[mid]) / 2) : prices[mid];
}

const QUERIES: Array<{ query: string; category: "pokemon" | "onepiece"; setName: string; rarity: string; cardName: string }> = [
  // 포켓몬 — 현재 인기 카드
  { query: "포켓몬카드 뮤츠 ex SAR sv2a 단품", category: "pokemon", setName: "SV2a 포켓몬 카드 151", rarity: "SAR", cardName: "뮤츠 ex SAR" },
  { query: "포켓몬카드 리자몽 ex SAR 단품", category: "pokemon", setName: "포켓몬카드", rarity: "SAR", cardName: "리자몽 ex SAR" },
  { query: "포켓몬카드 피카츄 ex SAR 단품", category: "pokemon", setName: "포켓몬카드", rarity: "SAR", cardName: "피카츄 ex SAR" },
  { query: "포켓몬카드 이브이 ex SAR 단품", category: "pokemon", setName: "포켓몬카드", rarity: "SAR", cardName: "이브이 ex SAR" },
  { query: "포켓몬카드 망나뇽 ex SAR 단품", category: "pokemon", setName: "포켓몬카드", rarity: "SAR", cardName: "망나뇽 ex SAR" },
  { query: "포켓몬카드 UR 단품 텍스처", category: "pokemon", setName: "포켓몬카드", rarity: "UR", cardName: "포켓몬 UR 인기카드" },
  // 원피스 — 현재 인기 카드
  { query: "원피스카드 루피 리더 단품 OP", category: "onepiece", setName: "원피스 카드게임", rarity: "L", cardName: "몽키 D. 루피 리더" },
  { query: "원피스카드 상크스 리더 단품", category: "onepiece", setName: "원피스 카드게임", rarity: "L", cardName: "상크스 리더" },
  { query: "원피스카드 SP 단품 일본판", category: "onepiece", setName: "원피스 카드게임", rarity: "SP", cardName: "원피스 SP" },
  { query: "원피스카드 SEC 단품", category: "onepiece", setName: "원피스 카드게임", rarity: "SEC", cardName: "원피스 SEC" },
];

export async function fetchNaverPrices(): Promise<NaverPriceItem[]> {
  const results: NaverPriceItem[] = [];

  for (const q of QUERIES) {
    try {
      const raw = await searchNaver(q.query, 20);
      const filtered = filterItems(raw);
      if (filtered.length === 0) continue;

      const price = medianPrice(filtered);
      if (!price) continue;

      const bestItem = filtered[0];
      results.push({
        cardName: q.cardName,
        setName: q.setName,
        category: q.category,
        rarity: q.rarity,
        price,
        mallName: bestItem.mallName,
      });

      console.log(`[네이버] ${q.cardName}: ${price.toLocaleString()}원 (${filtered.length}개 매물 기준)`);
    } catch (err) {
      console.error(`[네이버 시세] ${q.query}:`, err);
    }
  }

  return results;
}
