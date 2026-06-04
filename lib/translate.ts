import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TranslateResult {
  title: string;
  summary: string;
  content: string;
  tags: string;
  publishedAt?: Date;
}

/**
 * 빠른 번역 — 제목 + 요약만 번역 (Vercel 10초 제한 대응)
 * max_tokens 줄이고, 내용 입력도 최소화해서 기사당 0.3~0.8초 목표
 */
export async function translateArticle(
  title: string,
  content: string,
  lang: "en" | "ja" = "en",
  fallbackDate?: Date,
): Promise<TranslateResult> {
  const langLabel = lang === "ja" ? "일본어" : "영어";
  const currentYear = new Date().getFullYear();

  // 입력 최소화: 제목 + 내용 앞 500자만
  const shortContent = content.slice(0, 500);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,  // 1800 → 600으로 축소 (3배 빠름)
    messages: [
      {
        role: "user",
        content: `${langLabel} TCG 뉴스를 한국어로 번역하세요. JSON만 출력.

제목: ${title}
내용: ${shortContent}

{"title":"한국어제목","summary":"2문장요약","tags":"태그1,태그2,태그3","publishedAt":"날짜(YYYY-MM-DD) 또는 null"}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match?.[0] ?? "{}");

    let publishedAt: Date | undefined;
    if (json.publishedAt && json.publishedAt !== "null") {
      const parsed = new Date(json.publishedAt);
      if (!isNaN(parsed.getTime()) && parsed <= new Date()) {
        publishedAt = parsed;
      }
    }
    if (!publishedAt && fallbackDate) publishedAt = fallbackDate;

    return {
      title: json.title ?? title,
      summary: json.summary ?? "",
      content: content, // 본문은 원문 유지 (번역 시간 절약)
      tags: json.tags ?? "",
      publishedAt,
    };
  } catch {
    return { title, summary: "", content, tags: "", publishedAt: fallbackDate };
  }
}
