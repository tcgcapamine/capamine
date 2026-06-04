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
  realSourceUrl?: string;  // 실제 기사 URL (Google News가 아닌)
  publishedAt: Date;
  source: string;
  category: string;
  lang: string;
  imageUrl?: string;
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
    // 이미지 추출: media:thumbnail > media:content > enclosure > content 내 첫 img
    const mediaThumbnail = (raw.mediaThumbnail as { $?: { url?: string } } | string | undefined);
    const mediaContent = (raw["media:content"] as { $?: { url?: string } } | undefined);
    const enclosure = (raw.enclosure as { url?: string } | undefined);
    let imageUrl: string | undefined;
    if (typeof mediaThumbnail === "string") imageUrl = mediaThumbnail;
    else if (mediaThumbnail?.$?.url) imageUrl = mediaThumbnail.$.url;
    else if (mediaContent?.$?.url) imageUrl = mediaContent.$.url;
    else if (enclosure?.url) imageUrl = enclosure.url;
    else {
      const imgMatch = (typeof content === "string" ? content : "").match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) imageUrl = imgMatch[1];
    }

    // Google News RSS: <source url="실제사이트"> 에서 실제 기사 URL 추출 시도
    const sourceElem = raw.source as { url?: string; "#"?: string } | undefined;
    const sourceDomain = sourceElem?.url ?? "";
    // description에서 실제 기사 href 추출 (Google News가 아닌 URL)
    const descHtml = (raw.description as string) ?? "";
    const descHrefMatch = descHtml.match(/href=["']([^"']+)["']/g);
    const realUrl = descHrefMatch
      ?.map(h => h.replace(/href=["']/g, "").replace(/["']/g, ""))
      .find(u => !u.includes("news.google.com") && u.startsWith("http"));

    return {
      title: (item.title ?? "(제목 없음)").replace(/\[.*?\]/g, "").trim(),
      content: typeof content === "string" ? content.slice(0, 3000) : "",
      url: item.link ?? "",
      realSourceUrl: realUrl ?? sourceDomain ?? "",  // 실제 기사 URL (또는 소스 도메인)
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: src.name,
      category: src.category,
      lang: src.lang,
      imageUrl,
    };
  });
}
