import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const article = await prisma.article.create({
      data: {
        title: body.title,
        content: body.content,
        summary: body.summary ?? null,
        category: body.category,
        source: body.source ?? null,
        sourceUrl: body.sourceUrl ?? null,
        imageUrl: body.imageUrl ?? null,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        isPublished: body.isPublished ?? false,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      },
    });
    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
