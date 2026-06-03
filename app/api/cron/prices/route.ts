import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchNaverPrices } from "@/lib/prices/naver-prices";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await fetchNaverPrices();
    if (items.length === 0) {
      return NextResponse.json({ ok: true, message: "수집된 시세 없음" });
    }

    let updated = 0;
    for (const item of items) {
      const existing = await prisma.cardPrice.findFirst({
        where: { cardName: { contains: item.cardName.slice(0, 20) }, category: item.category },
      });

      if (existing) {
        if (existing.price !== item.price) {
          // 히스토리 기록 후 업데이트
          await prisma.cardPriceHistory.create({
            data: { cardPriceId: existing.id, price: existing.price },
          });
          await prisma.cardPrice.update({
            where: { id: existing.id },
            data: { prevPrice: existing.price, price: item.price, recordedAt: new Date() },
          });
          updated++;
        }
      } else {
        await prisma.cardPrice.create({
          data: {
            cardName: item.cardName,
            setName: item.setName,
            category: item.category,
            rarity: item.rarity,
            price: item.price,
            source: `네이버쇼핑 · ${item.mallName}`,
          },
        });
        updated++;
      }
    }

    return NextResponse.json({ ok: true, fetched: items.length, updated, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/prices]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
