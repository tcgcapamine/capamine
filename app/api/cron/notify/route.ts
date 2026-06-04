import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyImportantArticle, sendDailySummary } from "@/lib/telegram";

// 매일 오전 8시 (UTC 23시) 실행 — 일일 요약 + 중요 기사 알림
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "summary";
  const limit = parseInt(url.searchParams.get("limit") ?? "20");

  try {
    if (mode === "important") {
      // 최근 1시간 내 수집된 중요 기사 알림
      const since = new Date(Date.now() - 1000 * 60 * 70); // 70분 전
      const recent = await prisma.article.findMany({
        where: { isPublished: true, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, title: true, summary: true, content: true, category: true, source: true, sourceUrl: true },
      });

      let notified = 0;
      for (const article of recent.slice(0, limit)) {
        const sent = await notifyImportantArticle(article);
        if (sent) notified++;
      }

      return NextResponse.json({ ok: true, mode: "important", checked: recent.length, notified });
    }

    // 일일 요약 모드
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const articles = await prisma.article.findMany({
      where: { isPublished: true, createdAt: { gte: since } },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: { id: true, title: true, summary: true, category: true, source: true, sourceUrl: true },
    });

    const sent = await sendDailySummary(articles);
    return NextResponse.json({ ok: true, mode: "summary", articles: articles.length, sent });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
