"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/",         label: "홈",       en: "HOME" },
  { href: "/pokemon",  label: "포켓몬",   en: "POKÉMON",   color: "#ff9500" },
  { href: "/onepiece", label: "원피스",   en: "ONE PIECE", color: "#e03030" },
  { href: "/calendar", label: "발매일정", en: "RELEASE" },
  { href: "/decks",    label: "덱레시피", en: "DECKS" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      background: "rgba(6,13,31,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid #1e3354",
    }}>
      {/* 상단 시안 그라디언트 띠 */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, #00d4ff 0%, #ff9500 50%, #e03030 100%)" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "center", height: "56px", gap: "28px" }}>

        {/* 로고 */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, textDecoration: "none" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #00d4ff 0%, #ff9500 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "17px", color: "#060d1f",
            clipPath: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)",
          }}>카</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#e8f4fd", lineHeight: 1.1, letterSpacing: "0.02em" }}>카파민</div>
            <div style={{ fontSize: "9px", color: "#00d4ff", letterSpacing: "0.25em", fontWeight: 700, opacity: 0.7 }}>TCG NEWS</div>
          </div>
        </Link>

        {/* PC 네비 */}
        <nav style={{ display: "flex", alignItems: "stretch", height: "56px" }} className="pc-nav">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const color = item.color ?? "#00d4ff";
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "0 18px", gap: "2px", textDecoration: "none",
                borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
                background: active ? "rgba(0,212,255,0.05)" : "transparent",
                transition: "background 0.15s, border-color 0.15s",
                position: "relative",
              }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: active ? color : "#3a5c7a", letterSpacing: "0.1em" }}>{item.en}</span>
                <span style={{ fontSize: "12px", fontWeight: active ? 700 : 400, color: active ? "#e8f4fd" : "#7aa8cc" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 우측 */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setOpen(!open)} className="mob-btn" style={{ display: "none", background: "none", border: "none", color: "#7aa8cc", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div style={{ background: "#0a1628", borderTop: "1px solid #1e3354" }}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 1.25rem", borderBottom: "1px solid #1e3354", textDecoration: "none" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#e8f4fd" }}>{item.label}</span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: item.color ?? "#00d4ff", letterSpacing: "0.1em" }}>{item.en}</span>
            </Link>
          ))}
        </div>
      )}

      <style>{`@media(max-width:640px){.pc-nav{display:none!important}.mob-btn{display:flex!important}}`}</style>
    </header>
  );
}
