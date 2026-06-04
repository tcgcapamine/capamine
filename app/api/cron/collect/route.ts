import { NextRequest, NextResponse } from "next/server";
import { collectAll } from "@/lib/collect";

// 수집 + 실시간 번역
// 번역을 제목+요약만 하도록 최적화해서 기사당 0.3~0.8초 → 10초 안에 10~20개 번역 가능
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await collectAll();
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      saved: summary.totalSaved,
      durationMs: summary.durationMs,
    });
  } catch (err) {
    console.error("[cron/collect]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
