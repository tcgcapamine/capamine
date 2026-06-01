import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://capamine.vercel.app";

  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/pokemon`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/onepiece`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/calendar`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/decks`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articles/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
