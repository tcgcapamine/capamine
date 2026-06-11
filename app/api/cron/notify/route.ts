import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyImportantArticle, sendDailySummary, isImportantArticle } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode  = url.searchParams.get("mode") ?? "summary";
  const limit = parseInt(url.searchParams.get("limit") ?? "5");
  const test  = url.searchParams.get("test") === "true";

  try {
    if (mode === "important") {
      // 최근 3시간 내 기사 (70분에서 확대)
      const since = test
        ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
        : new Date(Date.now() - 1000 * 60 * 60 * 3);

      const recent = await prisma.article.findMany({
        where: { isPublished: true, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, title: true, summary: true, content: true, category: true, source: true, sourceUrl: true, imageUrl: true },
      });

      // 중복 제거: 비슷한 제목의 기사는 첫 번째만 사용
      const seen = new Set<string>();
      const deduped = recent.filter(a => {
        // 제목 앞 20글자로 중복 체크
        const key = a.title.slice(0, 20).toLowerCase().replace(/\s+/g, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // 중요 기사 필터 (test 모드면 스킵)
      const candidates = test
        ? deduped.slice(0, limit)
        : deduped.filter(a => isImportantArticle(a)).slice(0, limit);

      let notified = 0;
      for (const article of candidates) {
        const sent = await notifyImportantArticle(article, test);
        if (sent) notified++;
      }

      return NextResponse.json({
        ok: true, mode: "important",
        checked: recent.length,
        afterDedup: deduped.length,
        notified,
      });
    }

    // 일일 요약
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
