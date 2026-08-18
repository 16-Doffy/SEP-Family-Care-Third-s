# Script tu kiem tra sau khi Claude sua web admin + mobile.
# Chay tung buoc, dung lai neu buoc nao bao loi truoc khi sang buoc tiep theo.
#
# Cach chay: mo PowerShell tai d:\Desktop\sep, go:
#   .\scripts\self-test.ps1

Write-Host "=== BUOC 1: Dung moi dev server cu (neu co) truoc khi test ===" -ForegroundColor Cyan
Write-Host "Neu terminal khac dang chay 'pnpm dev' hoac 'next dev', bam Ctrl+C o do truoc." -ForegroundColor Yellow
Write-Host ""

Write-Host "=== BUOC 2: Web Admin - xoa cache cu, build lai tu dau ===" -ForegroundColor Cyan
Set-Location "d:\Desktop\sep\apps\web"
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD LOI - dung lai, doc thong bao loi o tren." -ForegroundColor Red
    exit 1
}
Write-Host "Build OK." -ForegroundColor Green
Write-Host ""

Write-Host "=== BUOC 3: Web Admin - khoi dong dev server ===" -ForegroundColor Cyan
Write-Host "Sap chay 'pnpm dev'. Doi thay dong 'Ready' roi mo trinh duyet:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/admin/plans   (kiem o Chon quan tri vien) -> trang Goi dich vu, thu bam Sua mot goi" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/calendar      (kiem o app thuong)         -> phai vao duoc khong bi khoa neu goi co calendar.enabled" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/ai-chat       (kiem o app thuong)         -> phai vao duoc khong bi khoa neu goi co ai.assistant" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/settings      (kiem o app thuong)         -> the 'Goi dang ky' phai mo duoc dialog nang cap" -ForegroundColor Yellow
Write-Host "Bam Ctrl+C de dung server khi test xong." -ForegroundColor Yellow
Write-Host ""
pnpm dev
