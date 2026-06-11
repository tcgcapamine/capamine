import { config } from "dotenv";
config({ override: true });
import { prisma } from "../lib/db";

async function main() {
  // scrydex(무관한 카드 이미지) 초기화
  const result = await prisma.article.updateMany({
    where: { imageUrl: { contains: "scrydex.com" } },
    data: { imageUrl: null },
  });
  console.log(`✅ ${result.count}개 잘못된 이미지 초기화`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
