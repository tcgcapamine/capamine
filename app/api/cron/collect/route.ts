import { NextRequest, NextResponse } from "next/server";
import { collectAll } from "@/lib/collect";

// 새 기사 수집 + 즉시 번역
// 매시간 실행 시 새 기사는 보통 5~20개 → 번역 포함 10~30초 이내
export const maxDuration = 60; // Vercel 최대 허용 시간 (초)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await collectAll();
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), saved: summary.totalSaved });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
