import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const upcoming = searchParams.get("upcoming") === "true";

  const events = await prisma.releaseEvent.findMany({
    where: {
      ...(upcoming ? { releaseDate: { gte: new Date() } } : {}),
    },
    orderBy: { releaseDate: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = await prisma.releaseEvent.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        category: body.category,
        releaseDate: new Date(body.releaseDate),
        imageUrl: body.imageUrl ?? null,
        isJapan: body.isJapan ?? false,
        link: body.link ?? null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
