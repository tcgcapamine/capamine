export type SourceLang = "en" | "ja" | "ko";
export type SourceCategory = "pokemon" | "onepiece";

export interface RssSource {
  type: "rss";
  name: string;
  url: string;
  category: SourceCategory;
  lang: SourceLang;
}

export interface ScrapeSource {
  type: "scrape";
  name: string;
  url: string;
  category: SourceCategory;
  lang: SourceLang;
}

export type NewsSource = RssSource | ScrapeSource;

export const NEWS_SOURCES: NewsSource[] = [

  // ─────────────────────────────────────────
  // POKÉMON TCG
  // ─────────────────────────────────────────

  // Google News (EN) — 일반·신제품·경쟁
  {
    type: "rss",
    name: "Google News · Pokémon TCG (EN)",
    url: 'https://news.google.com/rss/search?q="pokemon+card+game"+OR+"pokemon+tcg"&hl=en-US&gl=US&ceid=US:en',
    category: "pokemon", lang: "en",
  },
  {
    type: "rss",
    name: "Google News · Pokémon 신제품 (EN)",
    url: 'https://news.google.com/rss/search?q="pokemon+tcg"+("new+set"+OR+expansion+OR+spoiler+OR+reveal+OR+preview)&hl=en-US&gl=US&ceid=US:en',
    category: "pokemon", lang: "en",
  },
  {
    type: "rss",
    name: "Google News · Pokémon 대회 (EN)",
    url: 'https://news.google.com/rss/search?q="pokemon+tcg"+(tournament+OR+championship+OR+worlds+OR+"best+deck")&hl=en-US&gl=US&ceid=US:en',
    category: "pokemon", lang: "en",
  },

  // Google News (JA)
  {
    type: "rss",
    name: "Google News · ポケモンカード (JA)",
    url: "https://news.google.com/rss/search?q=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%82%AB%E3%83%BC%E3%83%89%E3%82%B2%E3%83%BC%E3%83%A0&hl=ja&gl=JP&ceid=JP:ja",
    category: "pokemon", lang: "ja",
  },
  {
    type: "rss",
    name: "Google News · ポケモン大会 (JA)",
    url: "https://news.google.com/rss/search?q=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%82%AB%E3%83%BC%E3%83%89+%E5%A4%A7%E4%BC%9A+OR+%E5%84%AA%E5%8B%9D+OR+%E6%96%B0%E5%BC%BE&hl=ja&gl=JP&ceid=JP:ja",
    category: "pokemon", lang: "ja",
  },

  // Google News (KR) — 한국 뉴스
  {
    type: "rss",
    name: "Google News · 포켓몬 카드 (KR)",
    url: "https://news.google.com/rss/search?q=%ED%8F%AC%EC%BC%93%EB%AA%AC+%EC%B9%B4%EB%93%9C%EA%B2%8C%EC%9E%84&hl=ko&gl=KR&ceid=KR:ko",
    category: "pokemon", lang: "ko",
  },
  // Google News (KR) — 대회/덱 정보
  {
    type: "rss",
    name: "Google News · 포켓몬 대회덱 (KR)",
    url: "https://news.google.com/rss/search?q=%ED%8F%AC%EC%BC%93%EB%AA%AC+%EC%B9%B4%EB%93%9C+%EB%8C%80%ED%9A%8C+OR+%EC%9A%B0%EC%8A%B9%EB%8D%B1+OR+%EB%8D%B1%EB%A0%88%EC%8B%9C%ED%94%BC&hl=ko&gl=KR&ceid=KR:ko",
    category: "pokemon", lang: "ko",
  },

  // 전문 미디어 RSS
  {
    type: "rss",
    name: "Dexerto · Pokémon (EN)",
    url: "https://www.dexerto.com/pokemon/feed/",
    category: "pokemon", lang: "en",
  },
  {
    type: "rss",
    name: "Google News · Pokémon 시세 (EN)",
    url: 'https://news.google.com/rss/search?q="pokemon+card"+(price+OR+value+OR+expensive+OR+rare+OR+pull)&hl=en-US&gl=US&ceid=US:en',
    category: "pokemon", lang: "en",
  },
  // PokémonBlog는 포켓몬 GO 기사가 많아 제외
  // 대신 TCG 특화 쿼리 추가
  {
    type: "rss",
    name: "Google News · Pokémon TCG 신카드 (EN)",
    url: 'https://news.google.com/rss/search?q="pokemon+card"+("new+card"+OR+"secret+rare"+OR+"special+illustration"+OR+SAR+OR+spoiler)&hl=en-US&gl=US&ceid=US:en',
    category: "pokemon", lang: "en",
  },

  // 포켓몬 한국 공식 뉴스 (Google News 경유 — URL 인코딩)
  {
    type: "rss",
    name: "Google News · 포켓몬 공식 (KR)",
    url: "https://news.google.com/rss/search?q=%ED%8F%AC%EC%BC%93%EB%AA%AC%EC%B9%B4%EB%93%9C+OR+%ED%8F%AC%EC%BC%93%EB%AA%AC+TCG+site%3Apokemonkorea.co.kr+OR+site%3Apokemoncard.co.kr&hl=ko&gl=KR&ceid=KR%3Ako",
    category: "pokemon", lang: "ko",
  },
  {
    type: "scrape",
    name: "Pokémon.co.jp 公式 (JA)",
    url: "https://www.pokemon.co.jp/ex/tcg/news/",
    category: "pokemon", lang: "ja",
  },

  // ─────────────────────────────────────────
  // ONE PIECE TCG
  // ─────────────────────────────────────────

  // Google News (EN)
  {
    type: "rss",
    name: "Google News · One Piece Card (EN)",
    url: 'https://news.google.com/rss/search?q="one+piece+card+game"&hl=en-US&gl=US&ceid=US:en',
    category: "onepiece", lang: "en",
  },
  {
    type: "rss",
    name: "Google News · One Piece 신제품 (EN)",
    url: 'https://news.google.com/rss/search?q="one+piece+card"+(new+set+OR+expansion+OR+spoiler+OR+reveal+OR+booster)&hl=en-US&gl=US&ceid=US:en',
    category: "onepiece", lang: "en",
  },
  {
    type: "rss",
    name: "Google News · One Piece 대회 (EN)",
    url: 'https://news.google.com/rss/search?q="one+piece+card"+(tournament+OR+championship+OR+champion+OR+deck)&hl=en-US&gl=US&ceid=US:en',
    category: "onepiece", lang: "en",
  },

  // Google News (JA)
  {
    type: "rss",
    name: "Google News · ワンピースカード (JA)",
    url: "https://news.google.com/rss/search?q=%E3%83%AF%E3%83%B3%E3%83%94%E3%83%BC%E3%82%B9%E3%82%AB%E3%83%BC%E3%83%89%E3%82%B2%E3%83%BC%E3%83%A0&hl=ja&gl=JP&ceid=JP:ja",
    category: "onepiece", lang: "ja",
  },
  {
    type: "rss",
    name: "Google News · ワンピース大会 (JA)",
    url: "https://news.google.com/rss/search?q=%E3%83%AF%E3%83%B3%E3%83%94%E3%83%BC%E3%82%B9%E3%82%AB%E3%83%BC%E3%83%89+%E5%A4%A7%E4%BC%9A+OR+%E6%96%B0%E5%BC%BE+OR+%E5%84%AA%E5%8B%9D&hl=ja&gl=JP&ceid=JP:ja",
    category: "onepiece", lang: "ja",
  },

  // Google News (KR)
  {
    type: "rss",
    name: "Google News · 원피스 카드 (KR)",
    url: "https://news.google.com/rss/search?q=%EC%9B%90%ED%94%BC%EC%8A%A4+%EC%B9%B4%EB%93%9C%EA%B2%8C%EC%9E%84&hl=ko&gl=KR&ceid=KR:ko",
    category: "onepiece", lang: "ko",
  },
  // Google News (KR) — 원피스 대회/덱
  {
    type: "rss",
    name: "Google News · 원피스 대회덱 (KR)",
    url: "https://news.google.com/rss/search?q=%EC%9B%90%ED%94%BC%EC%8A%A4+%EC%B9%B4%EB%93%9C+%EB%8C%80%ED%9A%8C+OR+%EC%9A%B0%EC%8A%B9%EB%8D%B1&hl=ko&gl=KR&ceid=KR:ko",
    category: "onepiece", lang: "ko",
  },

  // 공식 사이트 스크래핑
  {
    type: "scrape",
    name: "One Piece Card Game Official (EN)",
    url: "https://en.onepiece-cardgame.com/news/",
    category: "onepiece", lang: "en",
  },
  // ワンピース公式JA 스크래퍼 제거 — 메뉴 항목만 수집되는 문제
  // 대신 Google News JA로 커버

];

// 하위호환용 (rss만 필요할 때)
export const RSS_SOURCES = NEWS_SOURCES.filter((s): s is RssSource => s.type === "rss");
export const SCRAPE_SOURCES = NEWS_SOURCES.filter((s): s is ScrapeSource => s.type === "scrape");
