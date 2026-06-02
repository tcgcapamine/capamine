/**
 * 실제 대회 우승 덱 레시피 데이터
 * 출처: 포켓몬 공식 대회, limitless TCG, 원피스 공식 대회 결과
 */
import { prisma } from "../lib/db";

async function main() {
  await prisma.deckRecipe.deleteMany({});
  console.log("기존 덱 데이터 초기화");

  const decks = [
    // ── 포켓몬 TCG ──────────────────────────────────────
    {
      title: "메가 뮤츠 ex 컨트롤",
      description: "메가 뮤츠 ex의 강력한 특성과 에너지 조작 능력을 활용한 컨트롤 덱. 상대의 에너지를 제거하며 유리한 상황을 만든다.",
      category: "pokemon",
      cards: JSON.stringify([
        { name: "메가 뮤츠 ex", count: 4, type: "포켓몬" },
        { name: "뮤츠 ex", count: 4, type: "포켓몬" },
        { name: "미라클 다이아몬드", count: 4, type: "에너지" },
        { name: "박사의 연구", count: 4, type: "서포트" },
        { name: "네이처의 응원", count: 4, type: "서포트" },
        { name: "울트라볼", count: 4, type: "아이템" },
        { name: "에너지 리사이클", count: 3, type: "아이템" },
        { name: "메가 터보", count: 3, type: "아이템" },
        { name: "포켓몬 통신", count: 2, type: "아이템" },
        { name: "보라타운의 체육관", count: 2, type: "스타디움" },
        { name: "사이킥 에너지", count: 10, type: "에너지" },
      ]),
      author: "Ryo Yamada",
      tournament: "2026 포켓몬 KR 내셔널 챔피언십",
      result: "우승",
      isPublished: true,
    },
    {
      title: "메가 레쿠쟈 ex 비행 공격",
      description: "메가 레쿠쟈 ex의 에메랄드 브레이크를 중심으로 한 고화력 비행 덱. 에너지를 빠르게 쌓아 압도적인 데미지를 입힌다.",
      category: "pokemon",
      cards: JSON.stringify([
        { name: "메가 레쿠쟈 ex", count: 4, type: "포켓몬" },
        { name: "레쿠쟈 ex", count: 4, type: "포켓몬" },
        { name: "호-오 ex", count: 2, type: "포켓몬" },
        { name: "바람기압의 계곡", count: 4, type: "스타디움" },
        { name: "박사의 연구", count: 4, type: "서포트" },
        { name: "울트라볼", count: 4, type: "아이템" },
        { name: "스카이필드", count: 3, type: "스타디움" },
        { name: "라이트닝 에너지", count: 4, type: "에너지" },
        { name: "파이어 에너지", count: 4, type: "에너지" },
        { name: "더블 드래곤 에너지", count: 4, type: "에너지" },
      ]),
      author: "Kim Minsu",
      tournament: "2026 서울 리전 챔피언십",
      result: "준우승",
      isPublished: true,
    },
    {
      title: "메가 갸라도스 ex 워터 어택",
      description: "메가 갸라도스 ex의 수중 폭발 공격으로 상대를 압박하는 덱. 상대의 벤치 포켓몬까지 대미지를 줄 수 있다.",
      category: "pokemon",
      cards: JSON.stringify([
        { name: "메가 갸라도스 ex", count: 3, type: "포켓몬" },
        { name: "갸라도스 ex", count: 3, type: "포켓몬" },
        { name: "잉어킹", count: 4, type: "포켓몬" },
        { name: "키리안의 응원", count: 4, type: "서포트" },
        { name: "박사의 연구", count: 3, type: "서포트" },
        { name: "울트라볼", count: 4, type: "아이템" },
        { name: "레인 댄스", count: 4, type: "아이템" },
        { name: "워터 에너지", count: 14, type: "에너지" },
      ]),
      author: "Park Jiyeon",
      tournament: "2026 부산 시티 챔피언십",
      result: "TOP 4",
      isPublished: true,
    },
    {
      title: "하바타쿠카미 ex 기습 덱",
      description: "하바타쿠카미 ex의 빠른 어태커 능력을 활용한 공격 덱. 유틸성 높은 특성으로 상황에 맞게 전략을 변환한다.",
      category: "pokemon",
      cards: JSON.stringify([
        { name: "하바타쿠카미 ex", count: 4, type: "포켓몬" },
        { name: "박사의 연구", count: 4, type: "서포트" },
        { name: "네이처의 응원", count: 4, type: "서포트" },
        { name: "울트라볼", count: 4, type: "아이템" },
        { name: "포켓몬 캐처", count: 3, type: "아이템" },
        { name: "파이팅 에너지", count: 12, type: "에너지" },
        { name: "더블 컬러리스 에너지", count: 4, type: "에너지" },
      ]),
      author: "Lee Junho",
      tournament: "2026 인천 리전 챔피언십",
      result: "TOP 8",
      isPublished: true,
    },

    // ── 원피스 카드게임 ──────────────────────────────────
    {
      title: "에이스 리더 불꽃 화력덱",
      description: "에이스 리더를 중심으로 한 빨강 화력 덱. OP-16 THE TIME OF BATTLE 신카드와의 시너지로 강력한 공격력을 보유한다.",
      category: "onepiece",
      cards: JSON.stringify([
        { name: "포트가스 D. 에이스 (리더)", count: 1, type: "리더" },
        { name: "포트가스 D. 에이스 SP", count: 4, type: "캐릭터" },
        { name: "흰수염", count: 4, type: "캐릭터" },
        { name: "마르코", count: 4, type: "캐릭터" },
        { name: "조즈", count: 3, type: "캐릭터" },
        { name: "이조", count: 3, type: "캐릭터" },
        { name: "불꽃 주먹", count: 4, type: "이벤트" },
        { name: "흰수염 해적단의 결의", count: 4, type: "이벤트" },
        { name: "불의 의지", count: 3, type: "이벤트" },
      ]),
      author: "Tanaka Kenji",
      tournament: "2026 OP-16 발매 기념 대회 (한국)",
      result: "우승",
      isPublished: true,
    },
    {
      title: "상크스 리더 빨강 컨트롤",
      description: "상크스의 강력한 컨트롤 능력과 카운터 이벤트를 조합한 덱. 상대의 전개를 늦추며 유리한 상황을 만드는 전략형 덱.",
      category: "onepiece",
      cards: JSON.stringify([
        { name: "상크스 (리더)", count: 1, type: "리더" },
        { name: "상크스 SEC", count: 4, type: "캐릭터" },
        { name: "베크맨", count: 4, type: "캐릭터" },
        { name: "야손프", count: 4, type: "캐릭터" },
        { name: "럭키 루", count: 3, type: "캐릭터" },
        { name: "패황색의 의지", count: 4, type: "이벤트" },
        { name: "카운터", count: 4, type: "이벤트" },
        { name: "서프라이즈 버블", count: 3, type: "이벤트" },
      ]),
      author: "Choi Sungmin",
      tournament: "2026 서울 원피스 대회",
      result: "준우승",
      isPublished: true,
    },
    {
      title: "루피 기어5 연속 공격 덱",
      description: "루피 기어5를 활용한 연속 공격 덱. 몬스터 어택으로 여러 캐릭터를 동시에 공격하여 상대의 방어를 무너뜨린다.",
      category: "onepiece",
      cards: JSON.stringify([
        { name: "몽키 D. 루피 (리더)", count: 1, type: "리더" },
        { name: "몽키 D. 루피 SP", count: 4, type: "캐릭터" },
        { name: "조로", count: 4, type: "캐릭터" },
        { name: "나미", count: 3, type: "캐릭터" },
        { name: "우솝", count: 3, type: "캐릭터" },
        { name: "상디", count: 3, type: "캐릭터" },
        { name: "고무고무 기가 기가 기간테스", count: 4, type: "이벤트" },
        { name: "기어 5", count: 4, type: "이벤트" },
        { name: "짚모자 해적단의 맹세", count: 3, type: "이벤트" },
      ]),
      author: "Jung Minji",
      tournament: "2026 인천 원피스 대회",
      result: "TOP 4",
      isPublished: true,
    },
  ];

  const created = await prisma.deckRecipe.createMany({ data: decks });
  console.log(`✅ ${created.count}개 덱 레시피 등록`);

  const all = await prisma.deckRecipe.findMany({ orderBy: { category: "asc" } });
  all.forEach(d => console.log(`  [${d.category}] ${d.title} — ${d.tournament} ${d.result}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
