# Script de déploiement pour RemindR API (PowerShell)
# Usage: .\scripts\deploy.ps1 [environment]

param(
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Déploiement pour l'environnement: $Environment" -ForegroundColor Cyan

# Vérifier que NODE_ENV est défini
if (-not $env:NODE_ENV) {
    $env:NODE_ENV = $Environment
}

Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm ci

Write-Host "🔨 Build de production..." -ForegroundColor Yellow
npm run build

Write-Host "🗄️  Application des migrations..." -ForegroundColor Yellow
npm run prisma:migrate deploy

Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer l'application:" -ForegroundColor Cyan
Write-Host "  npm start"
Write-Host ""
Write-Host "Pour vérifier le health check:" -ForegroundColor Cyan
$port = if ($env:PORT) { $env:PORT } else { "3000" }
Write-Host "  curl http://localhost:$port/health"

