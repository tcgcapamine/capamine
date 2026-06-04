@echo off
cd /d C:\Projects\capamine
for /f "tokens=2 delims==" %%a in ('findstr "ANTHROPIC_API_KEY" .env') do set ANTHROPIC_API_KEY=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DATABASE_URL=" .env') do set DATABASE_URL=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DIRECT_URL=" .env') do set DIRECT_URL=%%a
echo ANTHROPIC_API_KEY loaded: %ANTHROPIC_API_KEY:~0,20%...
echo 기존 기사 재번역 시작 (최신 200개, 20-30분 소요)...
npx tsx scripts/retranslate-all.ts
