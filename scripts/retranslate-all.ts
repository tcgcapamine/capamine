/**
 * 기존 기사들을 새 프롬프트로 재번역 (본문 + 상세 요약)
 * 실행: scripts/collect-now.bat 방식으로
 */
import { config } from "dotenv";
config({ override: true });

import { prisma } from "../lib/db";
import { translateArticle } from "../lib/translate";

async function main() {
  // 영어/일본어 소스 기사 중 본문이 원문인 것 (일본어/영어 텍스트가 남아있는 것)
  const articles = await prisma.article.findMany({
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
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 200, // 최신 200개만
  });

  console.log(`📋 재번역 대상: ${articles.length}개`);

  let done = 0, skipped = 0, failed = 0;

  for (const article of articles) {
    try {
      const lang = article.source?.includes("(JA)") ? "ja" : "en";
      const result = await translateArticle(
        article.title, article.content, lang, article.publishedAt ?? undefined
      );

      await prisma.article.update({
        where: { id: article.id },
        data: {
          title: result.title,
          summary: result.summary || article.summary,
          content: result.content || article.content,
          tags: result.tags || article.tags,
        },
      });
      done++;
      if (done % 10 === 0) console.log(`  ⏳ ${done}/${articles.length}개 완료...`);
    } catch (err) {
      failed++;
    }
  }

  console.log(`✅ 완료: ${done}개 재번역, ${skipped}개 스킵, ${failed}개 실패`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
