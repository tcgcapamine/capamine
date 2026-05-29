import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";
import ArticleActions from "./ArticleActions";
import BulkPublish from "./BulkPublish";
import BulkDelete from "./BulkDelete";

export const metadata: Metadata = { title: "기사 관리 · 카파민" };
export const dynamic = "force-dynamic";

const C = {
  bg: "#0a0a0a", surface: "#111111", s2: "#1a1a1a",
  border: "#2a2a2a", text: "#f0f0f0", text2: "#aaaaaa", text3: "#555555",
  red: "#ff3838", amber: "#ff9500", green: "#00cc70", blue: "#4a9eff",
};

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;

  const articles = await prisma.article.findMany({
    where: filter === "unpublished" ? { isPublished: false } : filter === "published" ? { isPublished: true } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalCount = await prisma.article.count();
  const unpubCount = await prisma.article.count({ where: { isPublished: false } });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "20px 1.25rem 60px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* 헤더 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px", borderBottom: `1px solid ${C.border}`, background: C.s2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: C.blue, color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 8px", letterSpacing: "0.1em" }}>ARTICLES</span>
              <span style={{ fontSize: "11px", color: C.text2 }}>기사 관리</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {unpubCount > 0 && <BulkPublish count={unpubCount} />}
              <BulkDelete totalCount={totalCount} />
              <Link href="/admin/articles/new" style={{ fontSize: "11px", color: C.text, textDecoration: "none", padding: "4px 12px", background: C.blue, fontWeight: 700 }}>+ 새 기사</Link>
              <Link href="/admin" style={{ fontSize: "11px", color: C.text3, textDecoration: "none", padding: "4px 10px", border: `1px solid ${C.border}` }}>← 관리자</Link>
            </div>
          </div>

          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: C.text }}>{totalCount}</div>
                <div style={{ fontSize: "10px", color: C.text3 }}>전체 기사</div>
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: C.amber }}>{unpubCount}</div>
                <div style={{ fontSize: "10px", color: C.text3 }}>검토 대기</div>
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: C.green }}>{totalCount - unpubCount}</div>
                <div style={{ fontSize: "10px", color: C.text3 }}>게시됨</div>
              </div>
            </div>

            {/* 필터 */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { value: "", label: "전체" },
                { value: "unpublished", label: `미게시 ${unpubCount}` },
                { value: "published", label: "게시됨" },
              ].map((f) => {
                const active = (filter ?? "") === f.value;
                return (
                  <Link key={f.value} href={f.value ? `/admin/articles?filter=${f.value}` : "/admin/articles"}
                    style={{ padding: "4px 10px", fontSize: "11px", fontWeight: active ? 700 : 400, color: active ? C.text : C.text3, background: active ? C.s2 : "transparent", border: `1px solid ${active ? C.border : "transparent"}`, textDecoration: "none" }}>
                    {f.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 기사 목록 */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          {articles.length === 0 && (
            <div style={{ padding: "40px 18px", textAlign: "center", color: C.text3, fontSize: "13px" }}>기사가 없습니다.</div>
          )}
          {articles.map((a, i) => (
            <div key={a.id} style={{ padding: "14px 18px", borderBottom: i < articles.length - 1 ? `1px solid ${C.border}` : "none", display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px",
                    color: a.category === "pokemon" ? C.amber : a.category === "onepiece" ? C.red : C.blue,
                    background: a.category === "pokemon" ? "#2d1a00" : a.category === "onepiece" ? "#2d0808" : "#0a1f3d" }}>
                    {a.category === "pokemon" ? "🎴 POKÉMON" : a.category === "onepiece" ? "☠️ ONE PIECE" : "GENERAL"}
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: a.isPublished ? C.green : C.amber }}>
                    {a.isPublished ? "● 게시됨" : "○ 미게시"}
                  </span>
                  {a.source && <span style={{ fontSize: "10px", color: C.text3, border: `1px solid ${C.border}`, padding: "0 5px" }}>{a.source}</span>}
                  <span style={{ fontSize: "10px", color: C.text3 }}>{format(new Date(a.createdAt), "MM/dd HH:mm", { locale: ko })}</span>
                </div>
                <Link href={`/articles/${a.id}`} target="_blank" style={{ fontSize: "14px", fontWeight: 700, color: C.text, lineHeight: 1.4, marginBottom: "4px", textDecoration: "none", display: "block" }}>{a.title} ↗</Link>
                {a.summary && <div style={{ fontSize: "12px", color: C.text3, lineHeight: 1.5 }} className="line-clamp-2">{a.summary}</div>}
                {a.sourceUrl && (
                  <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "11px", color: C.blue, textDecoration: "none", display: "inline-block", marginTop: "4px" }}>
                    원문 보기 →
                  </a>
                )}
              </div>
              <ArticleActions id={a.id} isPublished={a.isPublished} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
