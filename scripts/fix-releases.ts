/**
 * 실제 2026년 포켓몬 / 원피스 TCG 발매 일정 데이터
 * Sources:
 *  - Pokémon TCG: dexerto.com, tcgradar.eu, primeprotector.at
 *  - One Piece TCG: en.onepiece-cardgame.com, onepiece-cardgame.kr, titancards.co.uk
 *  - 원피스 2026 전세계 동시발매: ruliweb.com/pc/board/300007/read/2321511
 */
import { prisma } from "../lib/db";

async function main() {
  await prisma.releaseEvent.deleteMany({});
  console.log("기존 데이터 초기화");

  const events = [

    // ═══════════════════════════════════════════════════════
    // POKÉMON TCG — Mega Evolution 시대 (2026)
    // ═══════════════════════════════════════════════════════

    // 이미 발매됨 (지난 일정)
    {
      title: "메가 에볼루션 · Ascended Heroes",
      description: "메가 에볼루션 시대 첫 탄. 메가 레쿠쟈 ex, 메가 뮤츠 ex 수록. 스칼렛&바이올렛 시대 이후 새로운 포맷.",
      category: "pokemon",
      releaseDate: new Date("2026-01-30"),
      isJapan: false,
      link: "https://www.pokemon.com/us/pokemon-news/",
    },
    {
      title: "파트너 일러스트 컬렉션 Series 1 (조토·호연)",
      description: "역대 스타팅 포켓몬 풀아트 SAR 컬렉션 첫 번째 시리즈. 조토·호연 지방 스타팅.",
      category: "pokemon",
      releaseDate: new Date("2026-03-20"),
      isJapan: false,
    },
    {
      title: "메가 에볼루션 · Perfect Order",
      description: "메가 갸라도스 ex, 메가 팬텀 ex 포함. 경쟁 환경 핵심 카드 다수 수록.",
      category: "pokemon",
      releaseDate: new Date("2026-03-27"),
      isJapan: false,
    },
    {
      title: "메가 에볼루션 · Chaos Rising",
      description: "메가 그라스듀, 메가 게코가 ex, 메가 파이어로 ex 등장. 루미오스 시티 배경.",
      category: "pokemon",
      releaseDate: new Date("2026-05-22"),
      isJapan: false,
    },

    // 예정 (upcoming)
    {
      title: "파트너 일러스트 컬렉션 Series 2 (하나·가라르)",
      description: "하나·가라르 지방 스타팅 포켓몬 SAR 풀아트. 츠타자 ex, 후파 등 수록 예정.",
      category: "pokemon",
      releaseDate: new Date("2026-06-19"),
      isJapan: false,
    },
    {
      title: "[일본] Storm Emerald (스톰 에메랄드)",
      description: "메가 레쿠쟈 ex 중심. 일본 선행 발매. 국내판은 2026년 하반기 예정.",
      category: "pokemon",
      releaseDate: new Date("2026-07-31"),
      isJapan: true,
    },
    {
      title: "메가 에볼루션 · Pitch Black",
      description: "6종의 메가 에볼루션 ex 포함. 메가 거라팬 ex 첫 등장. UR·SAR 18종 이상.",
      category: "pokemon",
      releaseDate: new Date("2026-07-17"),
      isJapan: false,
    },
    {
      title: "포켓몬 TCG 30주년 기념 세트",
      description: "전 카드 홀로그램 특별판. 6매 1팩 구성. 피카츄·뮤츠·뮤 신규 레어리티 첫 등장. 전세계 동시 발매.",
      category: "pokemon",
      releaseDate: new Date("2026-09-18"),
      isJapan: false,
    },

    // ═══════════════════════════════════════════════════════
    // ONE PIECE TCG — 2026 (전세계 동시발매 시대)
    // ═══════════════════════════════════════════════════════

    // 이미 발매됨
    {
      title: "OPK-11 · 신속한 권위 (Pillars of Strength)",
      description: "한국 공식판. 루피·보아행콕 리더 수록. 박스 48,000원.",
      category: "onepiece",
      releaseDate: new Date("2026-03-27"),
      isJapan: false,
      link: "https://onepiece-cardgame.kr/products.do",
    },
    {
      title: "OPK-12 · 사제의 연 (Egghead Crisis)",
      description: "한국 공식판. 에그헤드 아크 카드 다수 수록. 베가펑크 계열 리더 등장.",
      category: "onepiece",
      releaseDate: new Date("2026-04-24"),
      isJapan: false,
      link: "https://onepiece-cardgame.kr/products.do",
    },
    {
      title: "STK-23~28 스타터덱 6종 (샹크스·버기·야마토 外)",
      description: "STK-23 샹크스·STK-24 쥬얼리보니·STK-25 버기·STK-26 루피(녹흑)·STK-27 티치·STK-28 야마토. 각 12,000원.",
      category: "onepiece",
      releaseDate: new Date("2026-05-22"),
      isJapan: false,
      link: "https://onepiece-cardgame.kr/products.do",
    },

    // 예정 (동시발매 시대)
    {
      title: "[일본] OP-16 · THE TIME OF BATTLE (정상결전)",
      description: "정상결전 아크 테마. 리더 6종(에이스·흰수염·센고쿠 등) 전 공개. SP·TR 포함 126+1종.",
      category: "onepiece",
      releaseDate: new Date("2026-05-30"),
      isJapan: true,
      link: "https://onepiece-cardgame.com/products/op16.html",
    },
    {
      title: "OP-16 · THE TIME OF BATTLE — 글로벌 동시발매 (한국 포함)",
      description: "2026년부터 시작된 전세계 동시발매. 에이스·흰수염·센고쿠 리더, TR·SP 카드 다수. OPK-13에 해당.",
      category: "onepiece",
      releaseDate: new Date("2026-06-12"),
      isJapan: false,
      link: "https://en.onepiece-cardgame.com/products/op16.html",
    },
    {
      title: "ST-30 스타터덱 · 루피 & 에이스 — 글로벌 동시발매",
      description: "루피 & 에이스 2인 주인공 스타터덱. OP-16 동시 발매.",
      category: "onepiece",
      releaseDate: new Date("2026-06-12"),
      isJapan: false,
      link: "https://en.onepiece-cardgame.com/products/",
    },
    {
      title: "ST-31~36 스타터덱 6종 — 글로벌 동시발매",
      description: "일러스트 박스 Vol.7·8, 프리미엄 카드 컬렉션 'Best Selection Vol.6' 동시 발매.",
      category: "onepiece",
      releaseDate: new Date("2026-07-31"),
      isJapan: false,
      link: "https://en.onepiece-cardgame.com/products/",
    },
    {
      title: "OP-17 부스터팩 — 글로벌 동시발매",
      description: "차기 메인 부스터팩. 세트 내용 미공개. 더블팩 DP-12 동시 발매 예정.",
      category: "onepiece",
      releaseDate: new Date("2026-08-28"),
      isJapan: false,
      link: "https://en.onepiece-cardgame.com/products/",
    },
    {
      title: "미니 케이스 세트 Vol.3 (6종 어소트)",
      description: "6종류 미니 케이스 어소트 세트. 영국 기준 2026년 10월 30일 발매.",
      category: "onepiece",
      releaseDate: new Date("2026-10-30"),
      isJapan: false,
    },
  ];

  const created = await prisma.releaseEvent.createMany({ data: events });
  console.log(`✅ ${created.count}개 실제 발매 일정 등록`);

  const upcoming = await prisma.releaseEvent.findMany({
    where: { releaseDate: { gte: new Date() } },
    orderBy: { releaseDate: "asc" },
  });

  console.log(`\n📅 오늘(${new Date().toISOString().slice(0,10)}) 이후 예정: ${upcoming.length}건`);
  upcoming.forEach((e) => {
    const flag = e.isJapan ? "🇯🇵" : "🇰🇷";
    console.log(`  ${e.releaseDate.toISOString().slice(0,10)} ${flag} [${e.category}] ${e.title}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
