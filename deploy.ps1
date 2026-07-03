# Deploy script for CGJ563 website to GitHub Pages
# Usage: .\deploy.ps1

Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📤 Deploying to GitHub Pages..." -ForegroundColor Cyan

# Store current branch
$currentBranch = git rev-parse --abbrev-ref HEAD

# Create temporary deploy branch
git checkout --orphan deploy-temp
git rm -rf .

# Copy dist files
Copy-Item -Path "dist/*" -Destination "." -Recurse -Force

# Commit and push
git add .
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push -u origin deploy-temp:gh-pages --force

# Clean up
git checkout $currentBranch
git branch -D deploy-temp

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "📍 Site will be live at: https://cgj563.com (or https://lioisi.github.io/cgj563-website/)"
