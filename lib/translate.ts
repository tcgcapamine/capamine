import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TranslateResult {
  title: string;
  summary: string;
  content: string;
  tags: string;
  publishedAt?: Date;
}

export async function translateArticle(
  title: string,
  content: string,
  lang: "en" | "ja" = "en",
  fallbackDate?: Date,
): Promise<TranslateResult> {
  const langLabel = lang === "ja" ? "일본어" : "영어";
  const shortContent = content.slice(0, 1500);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `다음 ${langLabel} TCG 뉴스 기사를 한국어로 번역하세요. JSON만 출력.

제목: ${title}
내용: ${shortContent}

규칙:
- summary: 기사의 핵심 내용을 4~5문장으로 상세하게 요약. 구체적인 카드명, 수치, 날짜, 대회명 등 중요 정보를 포함.
- content: 기사 전체를 자연스러운 한국어로 번역 (500~800자 목표)
- tags: 핵심 키워드 4~5개 (카드명, 세트명, 레어도 등 포함)

{"title":"한국어제목","summary":"상세요약4~5문장","content":"전체번역내용","tags":"태그1,태그2,태그3,태그4","publishedAt":"YYYY-MM-DD 또는 null"}`,
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
      content: json.content || content,  // 번역된 본문 사용
      tags: json.tags ?? "",
      publishedAt,
    };
  } catch {
    return { title, summary: "", content, tags: "", publishedAt: fallbackDate };
  }
}
