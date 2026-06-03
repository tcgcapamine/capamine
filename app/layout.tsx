import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "카파민 - TCG 뉴스 & 시세",
    template: "%s · 카파민",
  },
  description: "포켓몬, 원피스 카드게임 최신 뉴스, 시세, 발매 일정을 한눈에. 매시간 업데이트.",
  keywords: ["포켓몬카드", "원피스카드게임", "TCG", "카드게임시세", "TCG뉴스", "포켓몬TCG", "원피스TCG"],
  metadataBase: new URL("https://capamine.vercel.app"),
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "카파민" },
  openGraph: {
    siteName: "카파민",
    locale: "ko_KR",
    type: "website",
    title: "카파민 - TCG 뉴스 & 시세",
    description: "포켓몬, 원피스 카드게임 최신 뉴스, 시세, 발매 일정을 한눈에. 매시간 업데이트.",
    url: "https://capamine.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "카파민 - TCG 뉴스 & 시세",
    description: "포켓몬, 원피스 카드게임 최신 뉴스, 시세, 발매 일정.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#060d1f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="카파민" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#060d1f", color: "#e8f4fd" }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
