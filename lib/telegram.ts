/**
 * 텔레그램 봇 알림 — 개선된 포맷 + 이미지 지원
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
  imageUrl?: string | null;
  tags?: string | null;
}

const IMPORTANT_KEYWORDS = [
  // 발매/신제품
  "새로운", "신카드", "공개", "발매", "출시", "공식 발표", "새 세트", "신규",
  "new set", "reveal", "official", "release", "expansion", "announced",
  "新弾", "新カード", "公式", "発売", "新商品",
  // 레어 카드
  "sar", "ur", "secret", "special illustration", "초희귀", "울트라레어",
  // 가격 관련
  "최고가", "신고가", "폭등", "폭락", "가격 상승", "30만", "50만", "100만",
  // 대회
  "세계대회", "챔피언십", "우승", "world championship", "regional",
  // 원피스
  "op-16", "op-17", "sp 카드", "sec 카드", "정상결전",
  // 포켓몬 30주년
  "30주년", "30th", "30 celebration",
];

export function isImportantArticle(article: TelegramArticle): boolean {
  const text = `${article.title} ${article.summary ?? ""} ${article.tags ?? ""}`.toLowerCase();
  return IMPORTANT_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

/** 카테고리 표시 */
function getCatInfo(category: string) {
  if (category === "pokemon") return { emoji: "🎴", label: "POKÉMON TCG", color: "🟠" };
  if (category === "onepiece") return { emoji: "☠️", label: "ONE PIECE TCG", color: "🔴" };
  return { emoji: "📋", label: "TCG NEWS", color: "🔵" };
}

/** 텍스트 메시지 전송 */
async function sendMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch { return false; }
}

/** 이미지 + 캡션 전송 */
async function sendPhoto(imageUrl: string, caption: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        photo: imageUrl,
        caption,
        parse_mode: "HTML",
      }),
    });
    if (res.ok) return true;
    // 이미지 전송 실패 시 텍스트로 fallback
    return sendMessage(caption);
  } catch {
    return sendMessage(caption);
  }
}

/** 중요 기사 알림 — 개선된 포맷 */
export async function notifyImportantArticle(article: TelegramArticle): Promise<boolean> {
  if (!isImportantArticle(article)) return false;

  const cat = getCatInfo(article.category);
  const articleUrl = `https://capamine.vercel.app/articles/${article.id}`;

  // 태그를 해시태그로 변환
  const hashtags = article.tags
    ? article.tags.split(",").slice(0, 3)
        .map(t => `#${t.trim().replace(/\s+/g, "_")}`)
        .join(" ")
    : "";

  const caption = [
    `${cat.color} <b>${cat.emoji} ${cat.label} · 주요 소식</b>`,
    ``,
    `<b>${article.title}</b>`,
    ``,
    article.summary ? `💬 ${article.summary}` : "",
    ``,
    `─────────────────────`,
    article.source ? `📰 <i>${article.source}</i>` : "",
    ``,
    `<a href="${articleUrl}">📖 카파민에서 자세히 보기</a>`,
    article.sourceUrl ? `<a href="${article.sourceUrl}">🔗 원문 바로가기</a>` : "",
    hashtags ? `\n${hashtags}` : "",
  ].filter(l => l !== undefined && l !== null && l !== "").join("\n");

  // 이미지가 있으면 사진으로, 없으면 텍스트로
  if (article.imageUrl) {
    return sendPhoto(article.imageUrl, caption);
  }
  return sendMessage(caption);
}

/** 일일 요약 */
export async function sendDailySummary(articles: TelegramArticle[]): Promise<boolean> {
  if (articles.length === 0) return false;

  const pk = articles.filter(a => a.category === "pokemon").slice(0, 4);
  const op = articles.filter(a => a.category === "onepiece").slice(0, 4);
  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  const lines = [
    `📊 <b>카파민 일일 뉴스 브리핑</b>`,
    `<i>${today}</i>`,
    `━━━━━━━━━━━━━━━━━━━━`,
  ];

  if (pk.length > 0) {
    lines.push(``, `🎴 <b>포켓몬 카드게임</b>`);
    pk.forEach((a, i) => {
      lines.push(`${["①","②","③","④"][i]} ${a.title}`);
    });
  }

  if (op.length > 0) {
    lines.push(``, `☠️ <b>원피스 카드게임</b>`);
    op.forEach((a, i) => {
      lines.push(`${["①","②","③","④"][i]} ${a.title}`);
    });
  }

  lines.push(
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `<a href="https://capamine.vercel.app">🌐 카파민 전체 뉴스 보기</a>`
  );

  return sendMessage(lines.join("\n"));
}

/** 텔레그램 직접 메시지 (외부 사용) */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  return sendMessage(text);
}
