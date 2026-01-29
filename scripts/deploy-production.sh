#!/bin/bash

# Script de déploiement en production pour RemindR API
# Usage: ./scripts/deploy-production.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de RemindR API en production..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Erreur: docker-compose.prod.yml non trouvé.${NC}"
    echo "Assurez-vous d'exécuter ce script depuis la racine du projet."
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé.${NC}"
    echo "Création depuis .env.production.example..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        echo -e "${YELLOW}⚠️  Veuillez modifier le fichier .env avec vos valeurs de production avant de continuer.${NC}"
        exit 1
    else
        echo -e "${RED}❌ Erreur: .env.production.example non trouvé.${NC}"
        exit 1
    fi
fi

# Sauvegarder la base de données avant la mise à jour
echo -e "${YELLOW}📦 Création d'une sauvegarde de la base de données...${NC}"
if docker-compose -f docker-compose.prod.yml ps | grep -q "postgres"; then
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup_before_deploy_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U ${POSTGRES_USER:-remindr_prod} ${POSTGRES_DB:-remindr_db_prod} > "$BACKUP_FILE" 2>/dev/null || true
    if [ -s "$BACKUP_FILE" ]; then
        echo -e "${GREEN}✅ Sauvegarde créée: $BACKUP_FILE${NC}"
    fi
fi

# Construire les images Docker
echo -e "${YELLOW}🔨 Construction des images Docker...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Arrêter les anciens conteneurs
echo -e "${YELLOW}🛑 Arrêt des anciens conteneurs...${NC}"
docker-compose -f docker-compose.prod.yml down

# Démarrer les nouveaux conteneurs
echo -e "${YELLOW}▶️  Démarrage des conteneurs...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Attendre que PostgreSQL soit prêt
echo -e "${YELLOW}⏳ Attente que PostgreSQL soit prêt...${NC}"
sleep 10

# Vérifier que PostgreSQL est accessible
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U ${POSTGRES_USER:-remindr_prod} > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL est prêt${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Tentative $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Erreur: PostgreSQL n'est pas prêt après $MAX_RETRIES tentatives${NC}"
    exit 1
fi

# Appliquer les migrations
echo -e "${YELLOW}📝 Application des migrations de base de données...${NC}"
docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Les migrations ont peut-être déjà été appliquées.${NC}"
}

# Vérifier que l'API est en cours d'exécution
echo -e "${YELLOW}⏳ Attente que l'API soit prête...${NC}"
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ L'API est prête${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Tentative $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Erreur: L'API n'est pas prête après $MAX_RETRIES tentatives${NC}"
    echo "Vérifiez les logs avec: docker-compose -f docker-compose.prod.yml logs api"
    exit 1
fi

# Afficher le statut des conteneurs
echo -e "${GREEN}📊 Statut des conteneurs:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Afficher les informations de santé
echo -e "${GREEN}🏥 Vérification de la santé de l'API:${NC}"
curl -s http://localhost:3000/health | jq . || curl -s http://localhost:3000/health

echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Vérifiez les logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "2. Testez l'API: curl https://remind-r.com/health"
echo "3. Vérifiez la documentation: https://remind-r.com/api-docs"

