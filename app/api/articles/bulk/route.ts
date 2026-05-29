import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 미게시 전체 게시
export async function POST() {
  const result = await prisma.article.updateMany({
    where: { isPublished: false },
    data: { isPublished: true },
  });
  return NextResponse.json({ ok: true, count: result.count });
}

// 전체 삭제
export async function DELETE(req: NextRequest) {
  const { category } = await req.json().catch(() => ({}));
  const result = await prisma.article.deleteMany({
    where: category ? { category } : {},
  });
  return NextResponse.json({ ok: true, count: result.count });
}
