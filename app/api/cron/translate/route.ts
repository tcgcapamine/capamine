import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { translateArticle } from "@/lib/translate";

// 미번역 기사를 10개씩 번역 — cron-job.org에서 30분마다 호출
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
  }

  // 번역 안 된 기사: 제목에 영어/일본어가 포함되고 source 언어가 ko가 아닌 것
  // source 컬럼에 (EN) 또는 (JA) 포함 여부로 판별
  const untranslated = await prisma.article.findMany({
    where: {
      isPublished: true,
      AND: [
        {
          OR: [
            { source: { contains: "(EN)" } },
            { source: { contains: "(JA)" } },
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
    take: 10,
  });

  if (untranslated.length === 0) {
    return NextResponse.json({ ok: true, message: "번역할 기사 없음" });
  }

  let translated = 0;
  for (const article of untranslated) {
    try {
      const lang = article.source?.includes("(JA)") ? "ja" : "en";
      const result = await translateArticle(article.title, article.content, lang, article.publishedAt ?? undefined);

      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          summary: result.summary,
          content: result.content,
          tags: result.tags || null,
          publishedAt: result.publishedAt ?? article.publishedAt,
        },
      });
      translated++;
    } catch (err) {
      console.error(`[translate] ${article.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, translated, remaining: untranslated.length - translated });
}
