import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#0d0d0d", borderTop: "1px solid #1a1a1a", padding: "24px 1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>CAPAMINE</span>
          <span style={{ fontSize: "11px", color: "#555", marginLeft: "8px" }}>TCG 뉴스 어그리게이터</span>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { href: "/pokemon", label: "포켓몬" },
            { href: "/onepiece", label: "원피스" },
            { href: "/calendar", label: "발매일정" },
            { href: "/decks", label: "덱레시피" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: "11px", color: "#555", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
        <div style={{ fontSize: "11px", color: "#333" }}>© 2024 카파민</div>
      </div>
    </footer>
  );
}
