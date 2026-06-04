/**
 * 텔레그램 봇 알림
 * 중요 TCG 뉴스를 채널에 자동 발송
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID ?? "";

export interface TelegramArticle {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  source: string | null;
  sourceUrl: string | null;
}

/** 중요 기사 여부 판단 */
export function isImportantArticle(article: TelegramArticle): boolean {
  const text = `${article.title} ${article.summary ?? ""}`.toLowerCase();

  const importantKeywords = [
    // 발매/신제품
    "새로운", "신카드", "공개", "발매", "출시", "공식 발표", "새 세트",
    "new set", "reveal", "official", "release", "expansion",
    "新弾", "新カード", "公式", "発売",
    // 레어 카드
    "sar", "ur", "secret", "special illustration",
    "초희귀", "울트라레어",
    // 가격 관련
    "최고가", "신고가", "폭등", "폭락", "가격 상승",
    // 대회
    "세계대회", "챔피언십", "우승", "world championship",
  ];

  return importantKeywords.some(kw => text.includes(kw));
}

/** 텔레그램 메시지 전송 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) return false;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** 중요 기사 알림 발송 */
export async function notifyImportantArticle(article: TelegramArticle): Promise<boolean> {
  if (!isImportantArticle(article)) return false;

  const catEmoji = article.category === "pokemon" ? "🎴" : article.category === "onepiece" ? "☠️" : "📋";
  const catLabel = article.category === "pokemon" ? "포켓몬 TCG" : article.category === "onepiece" ? "원피스 TCG" : "TCG 뉴스";

  const articleUrl = `https://capamine.vercel.app/articles/${article.id}`;

  const text = [
    `${catEmoji} <b>[${catLabel}] 중요 뉴스</b>`,
    ``,
    `<b>${article.title}</b>`,
    ``,
    article.summary ? `${article.summary}` : "",
    ``,
    article.source ? `📰 출처: ${article.source}` : "",
    `🔗 <a href="${articleUrl}">카파민에서 보기</a>`,
    article.sourceUrl ? `📄 <a href="${article.sourceUrl}">원문 보기</a>` : "",
  ].filter(Boolean).join("\n");

  return sendTelegramMessage(text);
}

/** 일일 요약 발송 */
export async function sendDailySummary(articles: TelegramArticle[]): Promise<boolean> {
  if (articles.length === 0) return false;

  const pk = articles.filter(a => a.category === "pokemon").slice(0, 3);
  const op = articles.filter(a => a.category === "onepiece").slice(0, 3);

  const lines = [
    `📊 <b>카파민 일일 TCG 뉴스 요약</b>`,
    ``,
  ];

  if (pk.length > 0) {
    lines.push(`🎴 <b>포켓몬 카드게임</b>`);
    pk.forEach((a, i) => lines.push(`${i + 1}. ${a.title}`));
    lines.push("");
  }

  if (op.length > 0) {
    lines.push(`☠️ <b>원피스 카드게임</b>`);
    op.forEach((a, i) => lines.push(`${i + 1}. ${a.title}`));
    lines.push("");
  }

  lines.push(`🔗 <a href="https://capamine.vercel.app">카파민 전체 뉴스 보기</a>`);

  return sendTelegramMessage(lines.join("\n"));
}
