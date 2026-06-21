import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TranslateResult {
  title: string;
  summary: string;   // 핵심 불릿 포인트들 (· 구분)
  content: string;   // 배경/상세 내용
  tags: string;
  publishedAt?: Date;
}

/** 한국어 기사 요약 생성 (번역 없이 summary + tags만) */
export async function summarizeKoreanArticle(
  title: string,
  content: string,
): Promise<{ summary: string; tags: string }> {
  const shortContent = content.slice(0, 1500);
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `다음 한국어 TCG 뉴스 기사의 핵심을 정리하세요. JSON만 출력.

제목: ${title}
내용: ${shortContent}

규칙:
- summary: 핵심 사실 2~3개를 "· 사실1\n· 사실2" 형식으로
- tags: 핵심 키워드 3~4개 (쉼표 구분)

{"summary":"· 핵심1\n· 핵심2","tags":"태그1,태그2,태그3"}`,
      }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match?.[0] ?? "{}");
    return { summary: json.summary ?? "", tags: json.tags ?? "" };
  } catch {
    return { summary: "", tags: "" };
  }
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
        content: `다음 ${langLabel} TCG 뉴스를 한국어로 번역하세요. JSON만 출력.

제목: ${title}
내용: ${shortContent}

규칙:
- summary: 핵심 사실 3~4개를 "· 사실1\n· 사실2\n· 사실3" 형식으로. 카드명/수치/날짜 등 구체적 정보 포함.
- content: 기사 배경과 맥락을 자연스러운 한국어 문장으로 200~300자. "왜 중요한지" 포함.
- tags: 핵심 키워드 4~5개

{"title":"한국어제목","summary":"· 핵심1\n· 핵심2\n· 핵심3","content":"배경설명200-300자","tags":"태그1,태그2,태그3","publishedAt":"YYYY-MM-DD 또는 null"}`,
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
      content: json.content || content,
      tags: json.tags ?? "",
      publishedAt,
    };
  } catch {
    return { title, summary: "", content, tags: "", publishedAt: fallbackDate };
  }
}
