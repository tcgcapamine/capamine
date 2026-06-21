/**
 * 미번역 기사 전체 번역 스크립트
 * 실행: scripts/collect-now.bat 방식으로 (API 키 필요)
 */
import { config } from "dotenv";
config({ override: true });

import { prisma } from "../lib/db";
import { translateArticle } from "../lib/translate";

async function main() {
  const untranslated = await prisma.article.findMany({
    where: {
      isPublished: true,
      AND: [
        {
          OR: [
            { source: { contains: "(EN)" } },
            { source: { contains: "(JA)" } },
            { source: { contains: "Dexerto" } },
            { source: { contains: "Official" } },
          ],
        },
        // 미번역: summary 없음 / 빈 값 / 실패 표시 / 원문 그대로
        {
          OR: [
            { summary: null },
            { summary: "" },
            { summary: "-" },
            { summary: "번역 실패 — 원문 참조" },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`📋 미번역 기사: ${untranslated.length}개`);
  if (untranslated.length === 0) { console.log("✅ 모두 번역됨"); return; }

  let done = 0, failed = 0;

  for (const article of untranslated) {
    try {
      const lang = article.source?.includes("(JA)") ? "ja" : "en";
      const result = await translateArticle(article.title, article.content, lang, article.publishedAt ?? undefined);

      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          summary: result.summary || "-",
          tags: result.tags || null,
          publishedAt: result.publishedAt ?? article.publishedAt,
        },
      });
      done++;
      if (done % 10 === 0) console.log(`  ⏳ ${done}/${untranslated.length}개 완료...`);
    } catch (err) {
      failed++;
      await prisma.article.update({ where: { id: article.id }, data: { summary: "-" } });
    }
  }

  console.log(`✅ 완료: ${done}개 번역, ${failed}개 실패`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
