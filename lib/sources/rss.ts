import Parser from "rss-parser";
import type { RssSource } from "./config";

type CustomFields = {
  item: [["media:thumbnail", "mediaThumbnail"]];
};

const parser = new Parser<Record<string, unknown>, CustomFields>({
  timeout: 15000,
  headers: {
    "User-Agent": "Capamine/1.0 TCG News Aggregator (contact: hyunsoo6489@gmail.com)",
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
  customFields: { item: [["media:thumbnail", "mediaThumbnail"]] },
});

export interface FetchedItem {
  title: string;
  content: string;
  url: string;
  publishedAt: Date;
  source: string;
  category: string;
  lang: string;
}

export async function fetchRss(src: RssSource): Promise<FetchedItem[]> {
  if (!src.url) return [];

  const feed = await parser.parseURL(src.url).catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${src.name}: ${msg}`);
  });

  return (feed.items ?? []).slice(0, 30).map((item) => {
    const raw = item as unknown as Record<string, unknown>;
    const content =
      (raw.contentSnippet as string) ??
      (raw.content as string) ??
      (raw.summary as string) ??
      (raw["media:description"] as string) ??
      "";
    return {
      title: (item.title ?? "(제목 없음)").replace(/\[.*?\]/g, "").trim(),
      content: typeof content === "string" ? content.slice(0, 3000) : "",
      url: item.link ?? "",
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: src.name,
      category: src.category,
      lang: src.lang,
    };
  });
}
