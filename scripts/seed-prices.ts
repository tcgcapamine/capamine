/**
 * 포켓몬 / 원피스 TCG 시세 샘플 데이터
 * 실제 운영 시 카드라쉬(JP), 하비스(KR), TCGPlayer(EN) 등에서 스크래핑 예정
 */
import { prisma } from "../lib/db";

async function main() {
  await prisma.cardPrice.deleteMany({});
  console.log("기존 시세 데이터 초기화");

  const prices = [
    // ── 포켓몬 ──────────────────────────────────────
    { cardName: "뮤츠 ex SAR", setName: "메가 에볼루션 Ascended Heroes", category: "pokemon", rarity: "SAR", price: 280000, prevPrice: 240000 },
    { cardName: "메가 레쿠쟈 ex SAR", setName: "메가 에볼루션 Ascended Heroes", category: "pokemon", rarity: "SAR", price: 220000, prevPrice: 210000 },
    { cardName: "메가 갸라도스 ex SAR", setName: "Perfect Order", category: "pokemon", rarity: "SAR", price: 195000, prevPrice: 180000 },
    { cardName: "메가 팬텀 ex UR", setName: "Perfect Order", category: "pokemon", rarity: "UR", price: 160000, prevPrice: 165000 },
    { cardName: "피카츄 PROMO", setName: "30주년 기념", category: "pokemon", rarity: "PROMO", price: 145000, prevPrice: 130000 },
    { cardName: "메가 그라스듀 ex SAR", setName: "Chaos Rising", category: "pokemon", rarity: "SAR", price: 130000, prevPrice: 125000 },
    { cardName: "메가 파이어로 ex SAR", setName: "Chaos Rising", category: "pokemon", rarity: "SAR", price: 120000, prevPrice: 118000 },
    { cardName: "뮤 SAR", setName: "Ascended Heroes", category: "pokemon", rarity: "SAR", price: 110000, prevPrice: 105000 },
    { cardName: "메가 게코가 ex UR", setName: "Chaos Rising", category: "pokemon", rarity: "UR", price: 98000, prevPrice: 92000 },
    { cardName: "리자몽 ex SAR", setName: "파트너 Series 1", category: "pokemon", rarity: "SAR", price: 88000, prevPrice: 90000 },

    // ── 원피스 ───────────────────────────────────────
    { cardName: "몽키 D. 루피 SP", setName: "OP-16 THE TIME OF BATTLE", category: "onepiece", rarity: "SP", price: 350000, prevPrice: 320000 },
    { cardName: "포트가스 D. 에이스 SP", setName: "OP-16 THE TIME OF BATTLE", category: "onepiece", rarity: "SP", price: 310000, prevPrice: 290000 },
    { cardName: "흰수염 TR", setName: "OP-16 THE TIME OF BATTLE", category: "onepiece", rarity: "TR", price: 240000, prevPrice: 230000 },
    { cardName: "상크스 SEC", setName: "STK-23", category: "onepiece", rarity: "SEC", price: 190000, prevPrice: 185000 },
    { cardName: "야마토 SP", setName: "STK-28", category: "onepiece", rarity: "SP", price: 165000, prevPrice: 155000 },
    { cardName: "센고쿠 TR", setName: "OP-16 THE TIME OF BATTLE", category: "onepiece", rarity: "TR", price: 145000, prevPrice: 140000 },
    { cardName: "버기 SEC", setName: "STK-25", category: "onepiece", rarity: "SEC", price: 130000, prevPrice: 128000 },
    { cardName: "쥬얼리 보니 SP", setName: "STK-24", category: "onepiece", rarity: "SP", price: 118000, prevPrice: 110000 },
    { cardName: "마샬 D. 티치 SR", setName: "STK-27", category: "onepiece", rarity: "SR", price: 95000, prevPrice: 98000 },
    { cardName: "보아 핸콕 SR", setName: "OPK-11", category: "onepiece", rarity: "SR", price: 82000, prevPrice: 78000 },
  ];

  const created = await prisma.cardPrice.createMany({ data: prices });
  console.log(`✅ ${created.count}개 시세 데이터 등록`);

  const top = await prisma.cardPrice.findMany({ orderBy: { price: "desc" }, take: 5 });
  console.log("\n💰 시세 TOP 5:");
  top.forEach((p, i) => {
    const diff = p.prevPrice ? ((p.price - p.prevPrice) / p.prevPrice * 100).toFixed(1) : "-";
    console.log(`  ${i+1}. [${p.category}] ${p.cardName} — ${p.price.toLocaleString()}원 (${diff}%)`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
