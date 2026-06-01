import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TranslateResult {
  title: string;
  summary: string;
  content: string;
  tags: string;
  publishedAt?: Date; // 본문/제목에서 파싱된 실제 날짜
}

export async function translateArticle(
  title: string,
  content: string,
  lang: "en" | "ja" = "en",
  fallbackDate?: Date,
): Promise<TranslateResult> {
  const langLabel = lang === "ja" ? "일본어" : "영어";
  const currentYear = new Date().getFullYear();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1800,
    messages: [
      {
        role: "user",
        content: `다음 ${langLabel} TCG 뉴스를 한국어로 번역/요약해주세요.

제목: ${title}

내용:
${content.slice(0, 3000)}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "title": "한국어 제목",
  "summary": "핵심 내용 2-3문장 요약 (한국어)",
  "content": "전체 번역 내용 (한국어, 200-500자)",
  "tags": "관련 태그 3개 (쉼표 구분, 예: 포켓몬,신제품,일본)",
  "publishedAt": "제목이나 본문에 명시된 실제 날짜 (YYYY-MM-DD 형식, 없으면 null). 예: 제목에 '3月12日', '3월12일', '3/12' 등이 있으면 '${currentYear}-03-12'. 연도가 없으면 ${currentYear}년으로 간주."
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match?.[0] ?? "{}");

    // publishedAt 파싱: Claude가 날짜를 찾았으면 사용, 없으면 fallback
    let publishedAt: Date | undefined;
    if (json.publishedAt && json.publishedAt !== "null") {
      const parsed = new Date(json.publishedAt);
      // 유효한 날짜이고 미래 날짜가 아닌 경우만 사용
      if (!isNaN(parsed.getTime()) && parsed <= new Date()) {
        publishedAt = parsed;
      }
    }
    // Claude가 날짜를 못 찾았으면 fallback 날짜 사용
    if (!publishedAt && fallbackDate) {
      publishedAt = fallbackDate;
    }

    return {
      title: json.title ?? title,
      summary: json.summary ?? "",
      content: json.content ?? content,
      tags: json.tags ?? "",
      publishedAt,
    };
  } catch {
    return { title, summary: "", content, tags: "", publishedAt: fallbackDate };
  }
}
