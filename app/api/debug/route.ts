import { NextResponse } from "next/server";

export async function GET() {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TELEGRAM_CHANNEL_ID;

  // 텔레그램 직접 테스트
  let tgTest = false;
  if (tgToken && tgChat) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text: "✅ Vercel 텔레그램 연결 테스트 성공!" }),
      });
      tgTest = r.ok;
    } catch { tgTest = false; }
  }

  return NextResponse.json({
    anthropic: anthropic ? anthropic.slice(0, 10) + "..." : null,
    telegram: {
      hasToken: !!tgToken,
      hasChat: !!tgChat,
      chatId: tgChat ?? null,
      testSent: tgTest,
    },
  });
}
