#!/bin/bash

# Script de configuration initiale pour RemindR API

set -e

echo "🚀 Configuration de RemindR API..."
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp env.example .env
    echo "✅ Fichier .env créé. Veuillez l'éditer avec vos valeurs."
    echo ""
else
    echo "✅ Fichier .env existe déjà."
    echo ""
fi

# Vérifier si Docker est installé
if command -v docker &> /dev/null; then
    echo "🐳 Docker détecté. Démarrage de PostgreSQL et Redis..."
    docker-compose up -d postgres redis
    
    echo "⏳ Attente du démarrage de PostgreSQL (10 secondes)..."
    sleep 10
    
    echo "✅ PostgreSQL et Redis démarrés."
    echo ""
else
    echo "⚠️  Docker non détecté. Assurez-vous que PostgreSQL et Redis sont installés et démarrés."
    echo ""
fi

# Installer les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances npm..."
    npm install
    echo "✅ Dépendances installées."
    echo ""
else
    echo "✅ Dépendances déjà installées."
    echo ""
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npm run prisma:generate
echo "✅ Client Prisma généré."
echo ""

# Créer la première migration
echo "🗄️  Création de la première migration..."
npm run prisma:migrate -- --name init
echo "✅ Migration créée."
echo ""

# Demander si on veut peupler la base
read -p "Voulez-vous peupler la base de données avec des données de test ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[OoYy]$ ]]; then
    echo "🌱 Peuplement de la base de données..."
    npm run prisma:seed
    echo "✅ Base de données peuplée."
    echo ""
fi

echo "✅ Configuration terminée !"
echo ""
echo "📝 Prochaines étapes :"
echo "   1. Vérifiez/éditez le fichier .env avec vos valeurs"
echo "   2. Démarrez l'API avec : npm run dev"
echo "   3. Ouvrez Prisma Studio avec : npm run prisma:studio"
echo ""

