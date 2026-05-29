import { NextRequest, NextResponse } from "next/server";
import { collectAll } from "@/lib/collect";

export async function POST(req: NextRequest) {
  // 간단한 관리자 키 보호
  const secret = req.headers.get("x-admin-secret");
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const categories: string[] | undefined = body.categories;

    const summary = await collectAll(categories);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[/api/collect]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
