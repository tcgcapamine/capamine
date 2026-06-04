/**
 * Pokemon TCG API 연동
 * https://api.pokemontcg.io/v2
 * 무료 (API 키 없어도 1,000 req/day, 키 있으면 20,000 req/day)
 */

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  rarity?: string;
  set: { name: string; series: string };
  images: { small: string; large: string };
  number: string;
  cardmarket?: { prices?: { averageSellPrice?: number; trendPrice?: number } };
}

const BASE = "https://api.pokemontcg.io/v2";
const API_KEY = process.env.POKEMON_TCG_API_KEY ?? "";

async function fetchPokemon(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: API_KEY ? { "X-Api-Key": API_KEY } : {},
    next: { revalidate: 3600 }, // 1시간 캐시
  });
  if (!res.ok) return null;
  return res.json();
}

/** 카드 이름으로 검색 (정확한 이름 우선) */
export async function searchPokemonCards(name: string, limit = 4): Promise<PokemonCard[]> {
  try {
    const encoded = encodeURIComponent(`name:"${name}"`);
    const data = await fetchPokemon(`/cards?q=${encoded}&pageSize=${limit}&orderBy=-set.releaseDate`) as { data?: PokemonCard[] };
    return data?.data ?? [];
  } catch { return []; }
}

/** 기사 태그에서 포켓몬 카드 이름 추출 후 검색 */
export async function getRelatedPokemonCards(tags: string): Promise<PokemonCard[]> {
  if (!tags) return [];

  const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

  // 포켓몬 이름처럼 보이는 태그 선별 (일반 단어 제외)
  const skipWords = new Set([
    "포켓몬", "카드", "TCG", "뉴스", "대회", "신제품", "발매", "일본", "한국",
    "pokemon", "card", "tcg", "news", "new", "set", "japan", "korea",
    "포켓몬카드", "sar", "ur", "sr", "tournament", "championship",
  ]);

  const cardNames: string[] = [];
  for (const tag of tagList) {
    if (!skipWords.has(tag.toLowerCase()) && tag.length >= 3) {
      cardNames.push(tag);
    }
  }

  if (cardNames.length === 0) return [];

  // 최대 2개 태그로 검색
  const results: PokemonCard[] = [];
  for (const name of cardNames.slice(0, 2)) {
    const cards = await searchPokemonCards(name, 2);
    results.push(...cards);
    if (results.length >= 4) break;
  }

  return results.slice(0, 4);
}

/** 원피스 카드 — 공식 사이트 카드 리스트 링크 생성 */
export function getOnePieceCardUrl(cardName: string): string {
  const q = encodeURIComponent(cardName);
  return `https://en.onepiece-cardgame.com/cardlist/?search=${q}`;
}
