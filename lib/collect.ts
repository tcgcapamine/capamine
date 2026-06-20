import { prisma } from "./db";
import { NEWS_SOURCES, type RssSource, type ScrapeSource } from "./sources/config";
import { fetchRss, type FetchedItem } from "./sources/rss";
import { fetchScrape } from "./sources/scrape";
import { translateArticle } from "./translate";
import { notifyImportantArticle } from "./telegram";
import { findPokemonCardImage } from "./cards/article-image";

export interface CollectResult {
  source: string;
  type: "rss" | "scrape";
  fetched: number;
  saved: number;
  skipped: number;
  errors: string[];
}

export interface CollectSummary {
  results: CollectResult[];
  totalSaved: number;
  durationMs: number;
}

/** 수집 시 og:image 미리 가져오기 (로컬 실행 시 타임아웃 없음) */
async function fetchImageForArticle(sourceUrl: string | null, title: string): Promise<string | null> {
  if (!sourceUrl) return null;
  try {
    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0";

    // Google News URL → DuckDuckGo로 실제 URL 찾기
    let fetchUrl = sourceUrl;
    if (sourceUrl.includes("news.google.com")) {
      const q = encodeURIComponent(title.replace(/\s*[-—|]\s*\S+$/, "").trim().slice(0, 80));
      const r = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
        headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) {
        const html = await r.text();
        const urlMatch = html.match(/class="result__url"[^>]*>([^<\s]+)/);
        if (urlMatch) {
          const found = "https://" + urlMatch[1].trim();
          if (!found.includes("google.com") && !found.includes("duckduckgo.com")) {
            fetchUrl = found;
          }
        }
      }
    }

    if (fetchUrl.includes("news.google.com")) return null;

    const res = await fetch(fetchUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const html = await res.text();

    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og?.[1]) return og[1];

    const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    return tw?.[1] ?? null;
  } catch { return null; }
}

async function processItem(item: FetchedItem): Promise<"saved" | "skipped" | "error"> {
  // URL 기반 중복 체크
  if (item.url) {
    const existing = await prisma.article.findFirst({ where: { sourceUrl: item.url } });
    if (existing) return "skipped";
  }

  let title = item.title;
  let summary = "";
  let content = item.content;
  let tags = "";
  let publishedAt = item.publishedAt;

  // 한국어가 아니면 Claude로 번역 + 날짜 파싱
  if (item.lang !== "ko" && process.env.ANTHROPIC_API_KEY && !process.env.NO_TRANSLATE) {
    try {
      const translated = await translateArticle(title, content, item.lang as "en" | "ja", item.publishedAt);
      title       = translated.title;
      summary     = translated.summary;
      content     = translated.content;
      tags        = translated.tags;
      if (translated.publishedAt) publishedAt = translated.publishedAt;
    } catch (err) {
      console.error("[Translate] failed:", err);
    }
  }

  if (!title || title.length < 5) return "skipped";

  // TCG 무관 키워드 필터
  const lowerTitle = title.toLowerCase();
  const baseExclude = ["pokémon go", "pokemon go", "포켓몬 go", "carplay", "android auto", "playlist", "music"];
  // general 카테고리는 애니메/영화 언급이 있어도 카드게임 뉴스일 수 있으므로 완화
  const excludeKeywords = item.category === "general"
    ? baseExclude
    : [...baseExclude, "anime", "アニメ", "movie", "영화", "nintendo switch"];
  if (excludeKeywords.some(kw => lowerTitle.includes(kw))) return "skipped";

  // 이미지 미리 가져오기
  let imageUrl = item.imageUrl ?? null;
  if (!imageUrl && process.env.FETCH_IMAGES === "true") {
    // 포켓몬 기사: TCG API 카드 이미지 우선
    if (item.category === "pokemon") {
      imageUrl = await findPokemonCardImage(title, tags, summary);
    }
    // 그래도 없으면 og:image 시도
    if (!imageUrl) {
      imageUrl = await fetchImageForArticle(item.url || null, title);
    }
  }

  const saved = await prisma.article.create({
    data: {
      title, summary, content,
      category: item.category,
      source: item.source,
      sourceUrl: item.realSourceUrl || item.url || null,
      tags: tags || null,
      imageUrl,
      isPublished: true,
      publishedAt,
    },
  });

  // 중요 기사 텔레그램 알림 (비동기)
  notifyImportantArticle({
    id: saved.id, title, summary, content,
    category: item.category,
    source: item.source,
    sourceUrl: item.url || null,
    imageUrl,
    tags: tags || null,
  }).catch(() => {});

  return "saved";
}

async function collectSource(src: RssSource | ScrapeSource): Promise<CollectResult> {
  const result: CollectResult = {
    source: src.name,
    type: src.type,
    fetched: 0, saved: 0, skipped: 0, errors: [],
  };

  let items: FetchedItem[] = [];
  try {
    items = src.type === "rss" ? await fetchRss(src) : await fetchScrape(src);
  } catch (err) {
    result.errors.push(String(err));
    return result;
  }
  result.fetched = items.length;

  for (const item of items) {
    try {
      const status = await processItem(item);
      if (status === "saved") result.saved++;
      else result.skipped++;
    } catch (err) {
      result.errors.push(String(err));
    }
  }
  return result;
}

export async function collectAll(categories?: string[]): Promise<CollectSummary> {
  const start = Date.now();
  const sources = categories
    ? NEWS_SOURCES.filter((s) => categories.includes(s.category))
    : NEWS_SOURCES;

  // 소스별 RSS 패치를 병렬 실행 (기사 처리는 소스 내에서 순차)
  // 순차 실행 시 29소스 × ~500ms = ~15s → 병렬 시 ~2s
  const results = await Promise.all(sources.map(src => collectSource(src)));

  return {
    results,
    totalSaved: results.reduce((s, r) => s + r.saved, 0),
    durationMs: Date.now() - start,
  };
}

export async function collectByName(name: string): Promise<CollectResult | null> {
  const src = NEWS_SOURCES.find((s) => s.name === name);
  if (!src) return null;
  return collectSource(src);
}
