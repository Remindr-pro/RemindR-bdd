#!/bin/bash

# Script de déploiement pour RemindR API
# Usage: ./scripts/deploy.sh [environment]

set -e  # Arrêter en cas d'erreur

ENVIRONMENT=${1:-production}
echo "🚀 Déploiement pour l'environnement: $ENVIRONMENT"

# Vérifier que NODE_ENV est défini
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=$ENVIRONMENT
fi

echo "📦 Installation des dépendances..."
npm ci

echo "🔨 Build de production..."
npm run build

echo "🗄️  Application des migrations..."
npm run prisma:migrate deploy

echo "✅ Déploiement terminé avec succès!"
echo ""
echo "Pour démarrer l'application:"
echo "  npm start"
echo ""
echo "Pour vérifier le health check:"
echo "  curl http://localhost:${PORT:-3000}/health"

