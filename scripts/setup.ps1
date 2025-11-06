# Script de configuration initiale pour RemindR API (PowerShell)

Write-Host "🚀 Configuration de RemindR API..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si .env existe
if (-not (Test-Path .env)) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "✅ Fichier .env créé. Veuillez l'éditer avec vos valeurs." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Fichier .env existe déjà." -ForegroundColor Green
    Write-Host ""
}

# Vérifier si Docker est installé
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "🐳 Docker détecté. Démarrage de PostgreSQL et Redis..." -ForegroundColor Yellow
    docker-compose up -d postgres redis
    
    Write-Host "⏳ Attente du démarrage de PostgreSQL (10 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "✅ PostgreSQL et Redis démarrés." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  Docker non détecté. Assurez-vous que PostgreSQL et Redis sont installés et démarrés." -ForegroundColor Yellow
    Write-Host ""
}

# Installer les dépendances
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dépendances installées." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Dépendances déjà installées." -ForegroundColor Green
    Write-Host ""
}

# Générer le client Prisma
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Yellow
npm run prisma:generate
Write-Host "✅ Client Prisma généré." -ForegroundColor Green
Write-Host ""

# Créer la première migration
Write-Host "🗄️  Création de la première migration..." -ForegroundColor Yellow
npm run prisma:migrate -- --name init
Write-Host "✅ Migration créée." -ForegroundColor Green
Write-Host ""

# Demander si on veut peupler la base
$response = Read-Host "Voulez-vous peupler la base de données avec des données de test ? (o/n)"
if ($response -match "^[OoYy]") {
    Write-Host "🌱 Peuplement de la base de données..." -ForegroundColor Yellow
    npm run prisma:seed
    Write-Host "✅ Base de données peuplée." -ForegroundColor Green
    Write-Host ""
}

Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Vérifiez/éditez le fichier .env avec vos valeurs"
Write-Host "   2. Démarrez l'API avec : npm run dev"
Write-Host "   3. Ouvrez Prisma Studio avec : npm run prisma:studio"
Write-Host ""

