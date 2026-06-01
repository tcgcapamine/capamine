import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapePrices } from "@/lib/prices/scrape-prices";

// Vercel Cron: 매일 오전 6시 (UTC) 실행
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await scrapePrices();
    if (items.length === 0) {
      return NextResponse.json({ ok: true, message: "수집된 시세 없음" });
    }

    let updated = 0;
    for (const item of items) {
      const existing = await prisma.cardPrice.findFirst({
        where: { cardName: item.cardName, category: item.category },
      });

      if (existing) {
        await prisma.cardPrice.update({
          where: { id: existing.id },
          data: { prevPrice: existing.price, price: item.price, recordedAt: new Date() },
        });
      } else {
        await prisma.cardPrice.create({
          data: {
            cardName: item.cardName, setName: item.setName,
            category: item.category, rarity: item.rarity,
            price: item.price,
          },
        });
      }
      updated++;
    }

    return NextResponse.json({ ok: true, updated, total: items.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
