import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cardPriceId = searchParams.get("id");
  if (!cardPriceId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [card, history] = await Promise.all([
    prisma.cardPrice.findUnique({ where: { id: cardPriceId } }),
    prisma.cardPriceHistory.findMany({
      where: { cardPriceId },
      orderBy: { recordedAt: "asc" },
      take: 30,
    }),
  ]);

  if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 현재가도 포함한 전체 히스토리
  const fullHistory = [
    ...history.map(h => ({ price: h.price, date: h.recordedAt })),
    { price: card.price, date: card.recordedAt },
  ];

  return NextResponse.json({ card, history: fullHistory });
}
