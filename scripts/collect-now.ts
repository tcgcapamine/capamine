import { config } from "dotenv";
config(); // .env 파일 자동 로딩
import { collectAll } from "../lib/collect";

async function main() {
  console.log("🚀 수집 시작:", new Date().toLocaleString("ko-KR"));
  const result = await collectAll();
  console.log(`✅ 완료: ${result.totalSaved}개 저장 (${(result.durationMs / 1000).toFixed(1)}초)`);
  result.results.forEach((r) => {
    if (r.saved > 0 || r.errors.length > 0) {
      console.log(`  ${r.source}: ${r.saved}저장 ${r.skipped}스킵 ${r.errors.length > 0 ? "⚠️" + r.errors[0] : ""}`);
    }
  });
}

main().catch(console.error).finally(() => process.exit(0));
