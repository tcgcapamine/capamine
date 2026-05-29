import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "카파민 - TCG 뉴스 브리프",
    template: "%s | 카파민",
  },
  description: "포켓몬, 원피스 카드게임 최신 뉴스, 시세, 발매 일정을 리포트 형식으로 제공합니다.",
  keywords: ["포켓몬카드", "원피스카드게임", "TCG", "카드게임시세", "TCG뉴스"],
  openGraph: { siteName: "카파민", locale: "ko_KR", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#111111", color: "#111827" }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
