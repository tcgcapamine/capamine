import { NextRequest, NextResponse } from "next/server";
import { collectAll } from "@/lib/collect";

// Vercel Cron Job — 6시간마다 자동 수집
// vercel.json: { "crons": [{ "path": "/api/cron/collect", "schedule": "0 */6 * * *" }] }
export async function GET(req: NextRequest) {
  // Vercel Cron 인증 헤더 검증
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron/collect] 자동 수집 시작:", new Date().toISOString());
    const summary = await collectAll();
    console.log("[cron/collect] 완료:", summary);
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), ...summary });
  } catch (err) {
    console.error("[cron/collect] 오류:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
