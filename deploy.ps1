# Deploy script for CGJ563 website
# Compiles and pushes to GitHub (upload to Ferozo manually via web manager)
# Usage: .\deploy.ps1

Write-Host "[BUILD] Compiling project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[OK] Build successful!`n" -ForegroundColor Green

# Push changes to GitHub
Write-Host "[GITHUB] Pushing to GitHub..." -ForegroundColor Cyan
git add -A
git commit -m "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>$null
git push origin main 2>$null

Write-Host "`n[SUCCESS] Deployment to GitHub complete!" -ForegroundColor Green

Write-Host "`nINSTRUCCIONES PARA FEROZO:" -ForegroundColor Yellow
Write-Host "1. Abre: https://miembro.ferozo.com"
Write-Host "2. Login con a0150879 / Mohabon563Pagina*"
Write-Host "3. Gestor de Archivos > public_html"
Write-Host "4. Sube carpeta: dist/"
Write-Host "`nArchivos listos en: C:\CGJAPP\logia-admin\dist" -ForegroundColor Cyan
