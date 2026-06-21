/**
 * 한국어 기사 summary 일괄 생성
 */
import { config } from "dotenv";
config({ override: true });

import { prisma } from "../lib/db";
import { summarizeKoreanArticle } from "../lib/translate";

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
      source: { contains: "(KR)" },
      OR: [{ summary: null }, { summary: "" }, { summary: "-" }],
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`📋 요약 없는 한국어 기사: ${articles.length}개`);
  if (articles.length === 0) { console.log("✅ 모두 완료됨"); return; }

  let done = 0, failed = 0;
  for (const article of articles) {
    try {
      const result = await summarizeKoreanArticle(article.title, article.content);
      if (result.summary) {
        await prisma.article.update({
          where: { id: article.id },
          data: { summary: result.summary, tags: result.tags || article.tags },
        });
        done++;
      } else {
        failed++;
      }
      if ((done + failed) % 10 === 0) console.log(`  ⏳ ${done + failed}/${articles.length}개 처리...`);
    } catch {
      failed++;
    }
  }
  console.log(`✅ 완료: ${done}개 요약 생성, ${failed}개 실패`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
