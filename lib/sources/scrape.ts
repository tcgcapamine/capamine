import type { ScrapeSource } from "./config";
import type { FetchedItem } from "./rss";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko,ja,en;q=0.8",
  "Cache-Control": "no-cache",
};

/** HTML 엔티티 & 태그 제거 */
function clean(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 상대 URL → 절대 URL */
function abs(href: string, base: string): string {
  if (!href || href.startsWith("#")) return "";
  if (href.startsWith("http")) return href;
  const u = new URL(base);
  return href.startsWith("/")
    ? `${u.protocol}//${u.host}${href}`
    : `${u.protocol}//${u.host}/${href}`;
}

/** 날짜 파싱 (다양한 포맷 시도) */
function parseDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s.replace(/(\d{4})[.\-년](\d{1,2})[.\-월](\d{1,2})/, "$1-$2-$3").trim());
  return isNaN(d.getTime()) ? undefined : d;
}

// ─────────────────────────────────────────────────────────
// 사이트별 파서
// ─────────────────────────────────────────────────────────

/** One Piece Card Game 공식 (EN/JA 공통 — Bandai 동일 구조) */
function parseOpCardOfficial(html: string, src: ScrapeSource): FetchedItem[] {
  const items: FetchedItem[] = [];

  // <li class="..."> 안의 <a href>, 날짜, 제목 추출
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = liPattern.exec(html)) !== null) {
    const block = m[1];
    const linkM = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!linkM) continue;
    const href = abs(linkM[1], src.url);
    if (!href) continue;
    const titleRaw = clean(linkM[2]);
    if (!titleRaw || titleRaw.length < 5) continue;

    const dateM = block.match(/(\d{4}[.\-\/年]\d{1,2}[.\-\/月]\d{1,2})/);
    const date = dateM ? parseDate(dateM[1]) : undefined;

    items.push({
      title: titleRaw,
      content: "",
      url: href,
      publishedAt: date ?? new Date(),
      source: src.name,
      category: src.category,
      lang: src.lang,
    });
    if (items.length >= 10) break;
  }
  return items;
}

/** 포켓몬 코리아 공식 (KR) */
function parsePokemonKorea(html: string, src: ScrapeSource): FetchedItem[] {
  const items: FetchedItem[] = [];

  // board-list li 패턴
  const rowPattern = /<(?:li|tr|div)[^>]*class=["'][^"']*(?:board|notice|news|list)[^"']*["'][^>]*>([\s\S]*?)<\/(?:li|tr|div)>/gi;
  let m: RegExpExecArray | null;
  while ((m = rowPattern.exec(html)) !== null) {
    const block = m[1];
    const linkM = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!linkM) continue;
    const href = abs(linkM[1], src.url);
    if (!href || href === src.url) continue;
    const title = clean(linkM[2]);
    if (!title || title.length < 5) continue;

    const dateM = block.match(/(\d{4}[.\-]\d{1,2}[.\-]\d{1,2})/);
    items.push({
      title,
      content: "",
      url: href,
      publishedAt: dateM ? (parseDate(dateM[1]) ?? new Date()) : new Date(),
      source: src.name,
      category: src.category,
      lang: src.lang,
    });
    if (items.length >= 10) break;
  }
  return items;
}

/** Pokémon Japan TCG 공식 (JA) */
function parsePokemonJapan(html: string, src: ScrapeSource): FetchedItem[] {
  const items: FetchedItem[] = [];

  // pokemon.co.jp의 뉴스 리스트는 <section class="..."> 또는 <article> 기반
  const blockPattern = /<(?:article|section|li)[^>]*>([\s\S]*?)<\/(?:article|section|li)>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockPattern.exec(html)) !== null) {
    const block = m[1];
    const headingM = block.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
    const linkM = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
    if (!headingM || !linkM) continue;
    const href = abs(linkM[1], src.url);
    const title = clean(headingM[1]);
    if (!title || title.length < 5 || !href) continue;

    const dateM = block.match(/<time[^>]*datetime=["']([^"']+)["']/i)
      ?? block.match(/(\d{4}[.\-年]\d{1,2}[.\-月]\d{1,2})/);
    const date = dateM ? parseDate(dateM[1]) : undefined;

    items.push({
      title,
      content: "",
      url: href,
      publishedAt: date ?? new Date(),
      source: src.name,
      category: src.category,
      lang: src.lang,
    });
    if (items.length >= 10) break;
  }
  return items;
}

/** 범용 파서 — 위 전용 파서가 없는 경우 */
function parseGeneral(html: string, src: ScrapeSource): FetchedItem[] {
  const items: FetchedItem[] = [];
  const seen = new Set<string>();

  // <article>, <li>, <div class="*news*|*item*|*post*"> 순서로 시도
  const blockPattern = /<(?:article|li|div)[^>]*(?:class=["'][^"']*(?:news|item|post|article|notice|board)[^"']*["'])?[^>]*>([\s\S]*?)<\/(?:article|li|div)>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockPattern.exec(html)) !== null) {
    const block = m[1];
    // 제목 (h2/h3/h4 또는 .title class)
    const headingM = block.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i)
      ?? block.match(/<[^>]+class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
    const linkM = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
    if (!headingM || !linkM) continue;

    const href = abs(linkM[1], src.url);
    const title = clean(headingM[1]);
    if (!title || title.length < 8 || !href || seen.has(href)) continue;
    seen.add(href);

    const timeM = block.match(/<time[^>]*datetime=["']([^"']+)["']/i);
    const dateStrM = block.match(/(\d{4}[.\-\/年]\d{1,2}[.\-\/月]\d{1,2})/);
    const date = timeM ? parseDate(timeM[1]) : dateStrM ? parseDate(dateStrM[1]) : undefined;

    const descM = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

    items.push({
      title,
      content: descM ? clean(descM[1]) : "",
      url: href,
      publishedAt: date ?? new Date(),
      source: src.name,
      category: src.category,
      lang: src.lang,
    });
    if (items.length >= 10) break;
  }
  return items;
}

// ─────────────────────────────────────────────────────────
// 메인 함수
// ─────────────────────────────────────────────────────────
export async function fetchScrape(src: ScrapeSource): Promise<FetchedItem[]> {
  const res = await fetch(src.url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${src.url}`);

  const html = await res.text();

  // 사이트별 전용 파서 선택
  if (src.url.includes("onepiece-cardgame.com")) return parseOpCardOfficial(html, src);
  if (src.url.includes("pokemonkorea.co.kr"))   return parsePokemonKorea(html, src);
  if (src.url.includes("pokemon.co.jp"))        return parsePokemonJapan(html, src);

  // 나머지는 범용 파서
  return parseGeneral(html, src);
}
