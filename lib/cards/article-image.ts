/**
 * 기사 제목/태그에서 카드 이름 추출 → Pokemon TCG API 이미지 가져오기
 */

interface TCGCard {
  id: string;
  name: string;
  images: { small: string; large: string };
  set: { name: string };
  rarity?: string;
}

// 포켓몬 카드명 키워드 (자주 등장하는 이름들)
const POKEMON_NAMES = [
  "Pikachu", "Charizard", "Mewtwo", "Rayquaza", "Gyarados", "Eevee", "Mew",
  "Gengar", "Lucario", "Garchomp", "Zoroark", "Greninja", "Aegislash",
  "Terapagos", "Koraidon", "Miraidon", "Arceus", "Dialga", "Palkia",
  "피카츄", "리자몽", "뮤츠", "레쿠쟈", "갸라도스", "이브이", "뮤",
  "팬텀", "루카리오", "망나뇽", "조로아크", "게코가", "기라티나",
  "테라파고스", "코라이돈", "미라이돈", "아르세우스",
];

const CARD_CACHE = new Map<string, string>();

async function searchCardImage(cardName: string): Promise<string | null> {
  if (CARD_CACHE.has(cardName)) return CARD_CACHE.get(cardName)!;
  try {
    const q = encodeURIComponent(`name:"${cardName}"`);
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${q}&pageSize=1&orderBy=-set.releaseDate`,
      {
        headers: process.env.POKEMON_TCG_API_KEY ? { "X-Api-Key": process.env.POKEMON_TCG_API_KEY } : {},
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as { data: TCGCard[] };
    const card = data.data?.[0];
    if (!card?.images?.large) return null;
    CARD_CACHE.set(cardName, card.images.large);
    return card.images.large;
  } catch { return null; }
}

/** 기사 제목/태그/요약에서 포켓몬 카드 이미지 찾기 */
export async function findPokemonCardImage(
  title: string,
  tags?: string | null,
  summary?: string | null
): Promise<string | null> {
  const text = `${title} ${tags ?? ""} ${summary ?? ""}`;

  // 태그에서 카드명 찾기
  if (tags) {
    for (const tag of tags.split(",").map(t => t.trim())) {
      if (tag.length > 2) {
        const img = await searchCardImage(tag);
        if (img) return img;
      }
    }
  }

  // 알려진 포켓몬 이름 찾기
  for (const name of POKEMON_NAMES) {
    if (text.toLowerCase().includes(name.toLowerCase())) {
      const img = await searchCardImage(name + " ex") ?? await searchCardImage(name);
      if (img) return img;
    }
  }

  // 세트명 기반 검색
  const setMatches = [
    { pattern: /30th|30주년|celebration/i, query: "set.name:\"30th\"" },
    { pattern: /pitch black|피치 블랙/i, query: "set.name:\"Pitch Black\"" },
    { pattern: /chaos rising|카오스/i, query: "set.name:\"Chaos Rising\"" },
    { pattern: /ascended heroes/i, query: "set.name:\"Ascended Heroes\"" },
    { pattern: /mega evolution|메가 에볼루션/i, query: "set.series:\"Mega Evolution\"" },
  ];

  for (const { pattern, query } of setMatches) {
    if (pattern.test(text)) {
      try {
        const q = encodeURIComponent(query);
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=${q}&pageSize=1&orderBy=-set.releaseDate`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
          const data = await res.json() as { data: TCGCard[] };
          const card = data.data?.[0];
          if (card?.images?.large) return card.images.large;
        }
      } catch { continue; }
    }
  }

  return null;
}
