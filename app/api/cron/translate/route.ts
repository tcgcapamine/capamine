import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { translateArticle } from "@/lib/translate";

export const maxDuration = 60;

// 미번역 기사 번역 — cron-job.org에서 30분마다 호출
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
  }

  // 번역 안 된 기사: EN/JA 소스인데 summary가 없거나 빈 것
  const untranslated = await prisma.article.findMany({
    where: {
      isPublished: true,
      AND: [
        {
          OR: [
            { source: { contains: "(EN)" } },
            { source: { contains: "(JA)" } },
            { source: { contains: "Dexerto" } },
          ],
        },
        {
          OR: [
            { summary: null },
            { summary: "" },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  if (untranslated.length === 0) {
    return NextResponse.json({ ok: true, message: "번역할 기사 없음" });
  }

  let translated = 0;
  let failed = 0;

  for (const article of untranslated) {
    try {
      const lang = article.source?.includes("(JA)") ? "ja" : "en";
      const result = await translateArticle(
        article.title,
        article.content,
        lang,
        article.publishedAt ?? undefined
      );

      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          summary: result.summary || "요약 없음",
          content: result.content || article.content,
          tags: result.tags || null,
          publishedAt: result.publishedAt ?? article.publishedAt,
        },
      });
      translated++;
    } catch (err) {
      console.error(`[translate] ${article.id}:`, err);
      // 번역 실패 시 원문 그대로 두되 빈 summary 표시 방지
      await prisma.article.update({
        where: { id: article.id },
        data: { summary: "번역 실패 — 원문 참조" },
      });
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    translated,
    failed,
    remaining: untranslated.length - translated,
  });
}
