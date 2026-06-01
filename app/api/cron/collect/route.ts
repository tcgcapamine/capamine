import { NextRequest, NextResponse } from "next/server";
import { collectAll } from "@/lib/collect";

// 번역 없이 빠르게 수집만 (Vercel 10초 제한 대응)
// 번역은 /api/cron/translate 에서 별도 처리
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // NO_TRANSLATE=true 로 번역 없이 수집
    process.env.NO_TRANSLATE = "true";
    const summary = await collectAll();
    process.env.NO_TRANSLATE = undefined;
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), saved: summary.totalSaved });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
