/**
 * 텔레그램 봇 알림 — 프리미엄 이모지 + entities 방식
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID ?? "";

// 프리미엄 이모지 ID
const EMOJI = {
  STAR:  { char: "⭐",  id: "6143251942928818741" },  // ⭐ (length 1)
  CHECK: { char: "✔️", id: "5895222507912302025" },  // ✔️ (length 2)
  ARROW: { char: "➡️", id: "5215330331711775720" },  // ➡️ (length 2)
};

export interface TelegramArticle {
  id: string;
  title: string;
  summary: string | null;
  content?: string | null;
  category: string;
  source: string | null;
  sourceUrl: string | null;
  imageUrl?: string | null;
  tags?: string | null;
}

interface TelegramEntity {
  offset: number;
  length: number;
  type: string;
  url?: string;
  custom_emoji_id?: string;
}

/** 메시지 빌더 — 텍스트와 entities를 동시에 구성 */
class MsgBuilder {
  private parts: string[] = [];
  private ents: TelegramEntity[] = [];
  get offset() { return this.parts.join("").length; }

  add(text: string) { this.parts.push(text); return this; }
  nl(n = 1) { return this.add("\n".repeat(n)); }

  bold(text: string) {
    this.ents.push({ offset: this.offset, length: text.length, type: "bold" });
    return this.add(text);
  }

  link(text: string, url: string) {
    this.ents.push({ offset: this.offset, length: text.length, type: "text_link", url });
    return this.add(text);
  }

  emoji(e: { char: string; id: string }, alsoBold = false) {
    const len = e.char.length;
    if (alsoBold) this.ents.push({ offset: this.offset, length: len, type: "bold" });
    this.ents.push({ offset: this.offset, length: len, type: "custom_emoji", custom_emoji_id: e.id });
    return this.add(e.char);
  }

  build() { return { text: this.parts.join(""), entities: this.ents }; }
}

function getCatLabel(category: string) {
  if (category === "pokemon") return "POKÉMON TCG";
  if (category === "onepiece") return "ONE PIECE TCG";
  return "TCG NEWS";
}

/** 중요 기사 판단 */
const IMPORTANT_KEYWORDS = [
  "새로운", "신카드", "공개", "발매", "출시", "공식 발표", "신규",
  "new set", "reveal", "official", "release", "expansion", "announced",
  "新弾", "新カード", "公式", "発売",
  "sar", "ur", "secret", "special illustration",
  "최고가", "신고가", "폭등", "폭락",
  "세계대회", "챔피언십", "우승", "world championship",
  "op-16", "op-17", "sp 카드", "sec", "30주년", "30th",
];

export function isImportantArticle(article: TelegramArticle): boolean {
  const text = `${article.title} ${article.summary ?? ""} ${article.tags ?? ""}`.toLowerCase();
  return IMPORTANT_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

/** 텔레그램 API 전송 (entities 방식) */
async function send(payload: object): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHANNEL_ID, disable_web_page_preview: false, ...payload }),
    });
    return res.ok;
  } catch { return false; }
}

async function sendPhoto(imageUrl: string, payload: object): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHANNEL_ID, photo: imageUrl, ...payload }),
    });
    if (res.ok) return true;
    return send(payload); // fallback
  } catch { return send(payload); }
}

/** Claude로 텔레그램용 구조화 포맷 실시간 생성 (DB 저장 안 함) */
async function generateTelegramFormat(article: TelegramArticle): Promise<{ bullets: string[]; context: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const input = `제목: ${article.title}\n요약: ${(article.summary ?? "").slice(0, 300)}\n내용: ${(article.content ?? "").slice(0, 500)}`;
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `다음 TCG 뉴스를 텔레그램 알림용으로 정리하세요. JSON만 출력.\n\n${input}\n\n{"bullets":["핵심사실1","핵심사실2","핵심사실3"],"context":"배경설명 2문장"}`,
      }],
    });
    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const match = text.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match?.[0] ?? "{}");
    return { bullets: json.bullets ?? [], context: json.context ?? "" };
  } catch { return null; }
}

/** 중요 기사 알림 — Claude가 발송 시점에 포맷 생성 (DB 수정 없음) */
export async function notifyImportantArticle(article: TelegramArticle): Promise<boolean> {
  if (!isImportantArticle(article)) return false;

  const label = getCatLabel(article.category);
  const articleUrl = `https://capamine.vercel.app/articles/${article.id}`;

  // Claude로 구조화 포맷 실시간 생성 (저장 안 함)
  const fmt = await generateTelegramFormat(article);

  const b = new MsgBuilder();
  b.emoji(EMOJI.STAR).bold(` ${label} · 주요 소식`).nl(2);
  b.bold(article.title).nl(2);

  if (fmt && fmt.bullets.length >= 2) {
    b.bold("💡 핵심").nl();
    for (const bullet of fmt.bullets.slice(0, 4)) {
      b.add(`· ${bullet}`).nl();
    }
    b.nl();
  }

  if (fmt?.context) {
    b.bold("📖 내용").nl();
    b.add(fmt.context.slice(0, 250)).nl(2);
  } else if (article.summary) {
    b.bold("📖 내용").nl();
    b.add(article.summary.slice(0, 200)).nl(2);
  }

  b.add("─────────────────────").nl()
   .emoji(EMOJI.ARROW).link(` 카파민에서 자세히 보기`, articleUrl);
  if (article.sourceUrl) {
    b.nl().emoji(EMOJI.ARROW).link(` 원문 바로가기`, article.sourceUrl);
  }

  const { text, entities } = b.build();
  const payload = { text, entities };
  if (article.imageUrl) return sendPhoto(article.imageUrl, { caption: text, caption_entities: entities });
  return send(payload);
}

/** 일일 요약 */
export async function sendDailySummary(articles: TelegramArticle[]): Promise<boolean> {
  if (articles.length === 0) return false;

  const pk = articles.filter(a => a.category === "pokemon").slice(0, 4);
  const op = articles.filter(a => a.category === "onepiece").slice(0, 4);
  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  const b = new MsgBuilder();
  b.bold(`📊 카파민 일일 뉴스 브리핑`).nl()
   .add(`${today}`).nl()
   .add("━━━━━━━━━━━━━━━━━━━━").nl();

  if (pk.length > 0) {
    b.nl().bold("🎴 포켓몬 카드게임").nl();
    ["①","②","③","④"].slice(0, pk.length).forEach((n, i) => {
      b.add(`${n} ${pk[i].title}`).nl();
    });
  }

  if (op.length > 0) {
    b.nl().bold("☠️ 원피스 카드게임").nl();
    ["①","②","③","④"].slice(0, op.length).forEach((n, i) => {
      b.add(`${n} ${op[i].title}`).nl();
    });
  }

  b.nl().add("━━━━━━━━━━━━━━━━━━━━").nl()
   .link("🌐 카파민 전체 뉴스 보기", "https://capamine.vercel.app");

  const { text, entities } = b.build();
  return send({ text, entities });
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  return send({ text, parse_mode: "HTML" });
}
