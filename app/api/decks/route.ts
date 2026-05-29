import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const decks = await prisma.deckRecipe.findMany({
    where: {
      isPublished: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const deck = await prisma.deckRecipe.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        category: body.category,
        cards: JSON.stringify(body.cards),
        author: body.author ?? null,
        tournament: body.tournament ?? null,
        result: body.result ?? null,
        imageUrl: body.imageUrl ?? null,
        isPublished: body.isPublished ?? true,
      },
    });
    return NextResponse.json(deck, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
  }
}
