@echo off
cd /d C:\Projects\capamine
for /f "tokens=2 delims==" %%a in ('findstr "ANTHROPIC_API_KEY" .env') do set ANTHROPIC_API_KEY=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DATABASE_URL=" .env') do set DATABASE_URL=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DIRECT_URL=" .env') do set DIRECT_URL=%%a
for /f "tokens=2 delims==" %%a in ('findstr "TELEGRAM_BOT_TOKEN" .env') do set TELEGRAM_BOT_TOKEN=%%a
for /f "tokens=2 delims==" %%a in ('findstr "TELEGRAM_CHANNEL_ID" .env') do set TELEGRAM_CHANNEL_ID=%%a
for /f "tokens=2 delims==" %%a in ('findstr "CRON_SECRET" .env') do set CRON_SECRET=%%a
set FETCH_IMAGES=true
echo ANTHROPIC_API_KEY loaded: %ANTHROPIC_API_KEY:~0,20%...
npx tsx scripts/collect-now.ts
