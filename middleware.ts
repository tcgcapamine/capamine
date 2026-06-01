import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login 은 통과
  if (pathname === "/admin/login") return NextResponse.next();

  // /admin/* 접근 시 쿠키 확인
  if (pathname.startsWith("/admin")) {
    const secret = process.env.ADMIN_SECRET ?? "capamine2026";
    const cookie = req.cookies.get("admin_auth");

    if (!cookie || cookie.value !== secret) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
