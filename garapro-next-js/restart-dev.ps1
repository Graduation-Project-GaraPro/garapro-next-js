# PowerShell script to properly restart Next.js dev server with fresh environment variables

Write-Host "🔄 Restarting Next.js Development Server..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Next.js cache
Write-Host "1️⃣ Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}
Write-Host ""

# Step 2: Show current environment variables
Write-Host "2️⃣ Current environment variables:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match "^NEXT_PUBLIC_") {
            Write-Host "   $($_)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "   ⚠️  .env.local not found!" -ForegroundColor Red
}
Write-Host ""

# Step 3: Instructions
Write-Host "3️⃣ Next steps:" -ForegroundColor Yellow
Write-Host "   1. Stop your current dev server (Ctrl+C if running)" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor White
Write-Host "   3. Check browser console for '[BranchService] Initialized with baseURL' log" -ForegroundColor White
Write-Host ""

Write-Host "✨ Ready to restart!" -ForegroundColor Green
