import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { translateArticle, summarizeKoreanArticle } from "@/lib/translate";

export const maxDuration = 60;

// 미번역/미요약 기사 처리 — cron-job.org에서 30분마다 호출
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
  }

  const noSummary = {
    OR: [
      { summary: null },
      { summary: "" },
      { summary: "-" },
      { summary: "번역 실패 — 원문 참조" },
    ],
  };

  // EN/JA 기사: 번역 필요
  const toTranslate = await prisma.article.findMany({
    where: {
      isPublished: true,
      AND: [
        { OR: [
          { source: { contains: "(EN)" } },
          { source: { contains: "(JA)" } },
          { source: { contains: "Dexerto" } },
          { source: { contains: "Official" } },
        ]},
        noSummary,
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // KR 기사: 요약만 생성
  const toSummarize = await prisma.article.findMany({
    where: {
      isPublished: true,
      AND: [
        { source: { contains: "(KR)" } },
        noSummary,
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  if (toTranslate.length === 0 && toSummarize.length === 0) {
    return NextResponse.json({ ok: true, message: "처리할 기사 없음" });
  }

  let translated = 0, summarized = 0, failed = 0;

  // EN/JA 번역
  for (const article of toTranslate) {
    try {
      const lang = article.source?.includes("(JA)") ? "ja" : "en";
      const result = await translateArticle(article.title, article.content, lang, article.publishedAt ?? undefined);
      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          summary: result.summary || "-",
          content: result.content || article.content,
          tags: result.tags || null,
          publishedAt: result.publishedAt ?? article.publishedAt,
        },
      });
      translated++;
    } catch {
      await prisma.article.update({ where: { id: article.id }, data: { summary: "번역 실패 — 원문 참조" } });
      failed++;
    }
  }

  // KR 요약
  for (const article of toSummarize) {
    try {
      const result = await summarizeKoreanArticle(article.title, article.content);
      if (result.summary) {
        await prisma.article.update({
          where: { id: article.id },
          data: { summary: result.summary, tags: result.tags || article.tags },
        });
        summarized++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, translated, summarized, failed });
}
