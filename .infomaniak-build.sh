#!/bin/bash
# Script de build pour Infomaniak
# Ce script sera exécuté automatiquement par Infomaniak lors de l'installation

set -e

echo "🚀 Démarrage du build pour Infomaniak..."

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npm run prisma:generate

# Build de l'application
echo "🏗️  Build de l'application..."
npm run build

# Appliquer les migrations (si la base de données est configurée)
if [ -n "$DATABASE_URL" ]; then
    echo "📝 Application des migrations..."
    npx prisma migrate deploy || echo "⚠️  Les migrations ont peut-être déjà été appliquées"
fi

echo "✅ Build terminé avec succès!"

