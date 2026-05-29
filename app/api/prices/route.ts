import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const prices = await prisma.cardPrice.findMany({
    where: { ...(category ? { category } : {}) },
    orderBy: { price: "desc" },
  });

  return NextResponse.json(prices);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const price = await prisma.cardPrice.create({
      data: {
        cardName: body.cardName,
        setName: body.setName,
        category: body.category,
        rarity: body.rarity ?? null,
        price: parseInt(body.price),
        prevPrice: body.prevPrice ? parseInt(body.prevPrice) : null,
        source: body.source ?? null,
      },
    });
    return NextResponse.json(price, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create price entry" }, { status: 500 });
  }
}
