// Next.js instrumentation - 서버 시작 시 자동 실행
// Turbopack 환경에서 .env가 누락되는 경우를 보완
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");

    try {
      const envFile = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
      for (const line of envFile.split("\n")) {
        const match = line.match(/^([^=\s#][^=\s]*)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch {
      // .env 없으면 무시
    }
  }
}
