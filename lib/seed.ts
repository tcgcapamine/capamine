import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.article.createMany({
    data: [
      {
        title: "스칼렛&바이올렛 '반짝이는 보물' 한국 발매 확정",
        summary: "2024년 3월 발매 예정인 '반짝이는 보물' 확장팩이 한국에도 동시 발매됩니다.",
        content: "포켓몬 카드 게임 스칼렛&바이올렛 시리즈의 최신 확장팩 '반짝이는 보물'이 한국에도 발매됩니다. 이번 팩에는 새로운 ex 카드와 희귀 일러스트 카드가 다수 포함됩니다.",
        category: "pokemon",
        source: "공식",
        isPublished: true,
        publishedAt: new Date("2024-03-01"),
        tags: JSON.stringify(["발매", "스칼렛바이올렛", "신규팩"]),
      },
      {
        title: "리자몽 ex SAR, 경매 최고가 경신",
        summary: "리자몽 ex SAR 카드가 국내 경매에서 280만원에 낙찰되며 최고가를 기록했습니다.",
        content: "국내 TCG 커뮤니티에서 리자몽 ex SAR 카드가 280만원에 낙찰되며 국내 포켓몬 카드 단일 경매 최고가를 경신했습니다.",
        category: "pokemon",
        source: "커뮤니티",
        isPublished: true,
        publishedAt: new Date("2024-03-05"),
        tags: JSON.stringify(["리자몽", "SAR", "경매"]),
      },
      {
        title: "포켓몬 공식 대회 '2024 챔피언십' 일정 발표",
        summary: "2024년 포켓몬 챔피언십 시리즈 한국 지역 대회 일정이 발표됐습니다.",
        content: "포켓몬 코리아가 2024 챔피언십 시리즈 한국 지역 대회 일정을 발표했습니다.",
        category: "pokemon",
        source: "공식",
        isPublished: true,
        publishedAt: new Date("2024-03-08"),
        tags: JSON.stringify(["대회", "챔피언십"]),
      },
      {
        title: "원피스 카드게임 'EB01' 한국 발매일 확정",
        summary: "원피스 카드게임 EXTRA BOOSTER EB01이 한국에 3월 말 발매됩니다.",
        content: "반다이의 원피스 카드게임 EXTRA BOOSTER 첫 번째 시리즈가 드디어 한국에 공식 발매됩니다.",
        category: "onepiece",
        source: "공식",
        isPublished: true,
        publishedAt: new Date("2024-03-02"),
        tags: JSON.stringify(["EB01", "발매"]),
      },
      {
        title: "포르타가스 D. 에이스 SEC 가격 급등",
        summary: "원피스 카드게임 에이스 SEC 카드가 최근 30% 상승하며 화제입니다.",
        content: "원피스 카드게임의 희귀 카드 '포르타가스 D. 에이스 SEC'의 시세가 최근 일주일 사이 30% 가까이 상승했습니다.",
        category: "onepiece",
        source: "커뮤니티",
        isPublished: true,
        publishedAt: new Date("2024-03-06"),
        tags: JSON.stringify(["에이스", "SEC", "시세"]),
      },
    ],
  });

  await prisma.cardPrice.createMany({
    data: [
      { cardName: "리자몽 ex SAR", setName: "폭발적인 마법", category: "pokemon", rarity: "SAR", price: 2500000, prevPrice: 2200000 },
      { cardName: "피카츄 ex SAR", setName: "스타터덱", category: "pokemon", rarity: "SAR", price: 180000, prevPrice: 200000 },
      { cardName: "이브이 ex SAR", setName: "팔데아의 진화", category: "pokemon", rarity: "SAR", price: 350000, prevPrice: 320000 },
      { cardName: "가오가이거 ex SAR", setName: "반짝이는 보물", category: "pokemon", rarity: "SAR", price: 120000, prevPrice: 110000 },
      { cardName: "뮤 ex SAR", setName: "트리플 비트", category: "pokemon", rarity: "SAR", price: 95000, prevPrice: 100000 },
      { cardName: "에이스 SEC", setName: "OP-02", category: "onepiece", rarity: "SEC", price: 450000, prevPrice: 350000 },
      { cardName: "카이도 SP", setName: "OP-04", category: "onepiece", rarity: "SP", price: 280000, prevPrice: 290000 },
      { cardName: "루피 리더 SR", setName: "OP-01", category: "onepiece", rarity: "SR", price: 85000, prevPrice: 80000 },
      { cardName: "조로 ALT", setName: "OP-03", category: "onepiece", rarity: "ALT", price: 65000, prevPrice: 70000 },
    ],
  });

  await prisma.releaseEvent.createMany({
    data: [
      { title: "스칼렛&바이올렛 '반짝이는 보물'", description: "새로운 ex, SAR 카드 포함", category: "pokemon", releaseDate: new Date("2024-12-22"), isJapan: false },
      { title: "원피스 카드게임 EB01", description: "EXTRA BOOSTER 한국 첫 출시", category: "onepiece", releaseDate: new Date("2024-12-29"), isJapan: false },
      { title: "[일본] 포켓몬 '나이트 원더러'", description: "일본 선행 발매. 국내 미정.", category: "pokemon", releaseDate: new Date("2025-04-26"), isJapan: true },
      { title: "[일본] 원피스 OP-08", description: "일본 선행 발매", category: "onepiece", releaseDate: new Date("2025-05-24"), isJapan: true },
      { title: "2024 포켓몬 챔피언십 서울 예선", description: "서울 코엑스. 마스터/시니어/주니어 부문", category: "event", releaseDate: new Date("2025-04-13"), isJapan: false },
    ],
  });

  await prisma.deckRecipe.createMany({
    data: [
      {
        title: "리자몽 ex 불꽃 컨트롤",
        description: "리자몽 ex를 중심으로 한 공격적인 불꽃 덱. 현재 메타 최강.",
        category: "pokemon",
        cards: JSON.stringify([
          { name: "리자몽 ex", count: 2, type: "포켓몬" },
          { name: "리자드", count: 2, type: "포켓몬" },
          { name: "파이리", count: 4, type: "포켓몬" },
          { name: "불꽃의 에너지", count: 10, type: "에너지" },
          { name: "박사의 연구", count: 4, type: "서포터" },
          { name: "네오 챔피언의 격려", count: 4, type: "서포터" },
          { name: "쾌속 공 신화", count: 4, type: "아이템" },
        ]),
        author: "LastMoney",
        tournament: "2024 서울 지역 대회",
        result: "우승",
        isPublished: true,
      },
      {
        title: "루피 리더 빨간색 덱",
        description: "루피 리더를 중심으로 한 공격적인 빨간색 덱.",
        category: "onepiece",
        cards: JSON.stringify([
          { name: "몽키 D. 루피 (리더)", count: 1, type: "리더" },
          { name: "조로", count: 4, type: "캐릭터" },
          { name: "상디", count: 4, type: "캐릭터" },
          { name: "나미", count: 3, type: "캐릭터" },
          { name: "불꽃권", count: 4, type: "이벤트" },
          { name: "기아 5", count: 2, type: "이벤트" },
        ]),
        author: "카파민",
        tournament: "2024 킨텍스 원피스 대회",
        result: "8강",
        isPublished: true,
      },
    ],
  });

  console.log("✅ 시드 데이터 생성 완료!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
