"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        fontSize: "11px", color: "#555555", background: "transparent",
        border: "1px solid #272727", padding: "4px 10px", cursor: "pointer",
      }}>
      로그아웃
    </button>
  );
}
