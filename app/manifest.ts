import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "카파민 - TCG 뉴스 & 시세",
    short_name: "카파민",
    description: "포켓몬·원피스 TCG 뉴스, 시세, 발매 일정",
    start_url: "/",
    display: "standalone",
    background_color: "#060d1f",
    theme_color: "#060d1f",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    categories: ["news", "entertainment", "games"],
    lang: "ko",
    shortcuts: [
      { name: "포켓몬 뉴스", url: "/pokemon", description: "포켓몬 카드게임 최신 뉴스" },
      { name: "원피스 뉴스", url: "/onepiece", description: "원피스 카드게임 최신 뉴스" },
      { name: "발매 일정", url: "/calendar", description: "TCG 발매 예정 일정" },
    ],
  };
}
