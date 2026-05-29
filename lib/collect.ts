import { prisma } from "./db";
import { NEWS_SOURCES, type RssSource, type ScrapeSource } from "./sources/config";
import { fetchRss, type FetchedItem } from "./sources/rss";
import { fetchScrape } from "./sources/scrape";
import { translateArticle } from "./translate";

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

  // 한국어가 아니면 Claude로 번역
  if (item.lang !== "ko" && process.env.ANTHROPIC_API_KEY) {
    try {
      const translated = await translateArticle(title, content, item.lang as "en" | "ja");
      title    = translated.title;
      summary  = translated.summary;
      content  = translated.content;
      tags     = translated.tags;
    } catch (err) {
      console.error("[Translate] failed:", err);
      // 번역 실패 시 원문 그대로 저장
    }
  }

  // 제목이 너무 짧으면 저장 안 함
  if (!title || title.length < 5) return "skipped";

  await prisma.article.create({
    data: {
      title,
      summary,
      content,
      category: item.category,
      source: item.source,
      sourceUrl: item.url || null,
      tags: tags || null,
      isPublished: true,
      publishedAt: item.publishedAt,
    },
  });

  return "saved";
}

async function collectSource(
  src: RssSource | ScrapeSource,
): Promise<CollectResult> {
  const result: CollectResult = {
    source: src.name,
    type: src.type,
    fetched: 0, saved: 0, skipped: 0, errors: [],
  };

  let items: FetchedItem[] = [];
  try {
    items = src.type === "rss"
      ? await fetchRss(src)
      : await fetchScrape(src);
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

  const results: CollectResult[] = [];
  for (const src of sources) {
    results.push(await collectSource(src));
  }

  return {
    results,
    totalSaved: results.reduce((s, r) => s + r.saved, 0),
    durationMs: Date.now() - start,
  };
}

// 단일 소스 수집 (이름으로 찾아서 실행)
export async function collectByName(name: string): Promise<CollectResult | null> {
  const src = NEWS_SOURCES.find((s) => s.name === name);
  if (!src) return null;
  return collectSource(src);
}
