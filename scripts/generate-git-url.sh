#!/bin/bash

# Script pour générer l'URL Git avec token pour Infomaniak
# Usage: ./scripts/generate-git-url.sh

echo "🔐 Générateur d'URL Git avec Token pour Infomaniak"
echo ""

# Demander le type de repository
echo "Quel est votre hébergeur Git ?"
echo "1) GitHub"
echo "2) GitLab"
read -p "Choix (1 ou 2): " git_type

# Demander le token
read -p "Entrez votre token d'accès personnel: " token

# Demander l'URL du repository
read -p "Entrez l'URL de votre repository (ex: github.com/username/repo): " repo_url

# Nettoyer l'URL (enlever https:// si présent)
repo_url=$(echo "$repo_url" | sed 's|^https://||' | sed 's|^http://||' | sed 's|^git@||' | sed 's|\.git$||')

# Générer l'URL selon le type
if [ "$git_type" = "1" ]; then
    # GitHub
    git_url="https://${token}@${repo_url}.git"
    echo ""
    echo "✅ URL GitHub générée :"
    echo "$git_url"
elif [ "$git_type" = "2" ]; then
    # GitLab
    git_url="https://oauth2:${token}@${repo_url}.git"
    echo ""
    echo "✅ URL GitLab générée :"
    echo "$git_url"
else
    echo "❌ Choix invalide"
    exit 1
fi

echo ""
echo "📋 Copiez cette URL dans l'interface Infomaniak :"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$git_url"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Important : Ne partagez jamais cette URL publiquement !"
echo "   Elle contient votre token d'accès personnel."

