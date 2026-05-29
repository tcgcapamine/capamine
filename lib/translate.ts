import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface TranslateResult {
  title: string;
  summary: string;
  content: string;
  tags: string;
}

export async function translateArticle(
  title: string,
  content: string,
  lang: "en" | "ja" = "en",
): Promise<TranslateResult> {
  const langLabel = lang === "ja" ? "일본어" : "영어";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
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
  "tags": "관련 태그 3개 (쉼표 구분, 예: 포켓몬,신제품,일본)"
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const match = text.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match?.[0] ?? "{}");
    return {
      title: json.title ?? title,
      summary: json.summary ?? "",
      content: json.content ?? content,
      tags: json.tags ?? "",
    };
  } catch {
    return { title, summary: "", content, tags: "" };
  }
}
