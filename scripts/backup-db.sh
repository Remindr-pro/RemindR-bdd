#!/bin/bash

# Script de sauvegarde de la base de données
# Usage: ./scripts/backup-db.sh

set -e

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

POSTGRES_USER=${POSTGRES_USER:-remindr_prod}
POSTGRES_DB=${POSTGRES_DB:-remindr_db_prod}
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Création de la sauvegarde de la base de données..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"

if [ -s "$BACKUP_FILE" ]; then
    echo "✅ Sauvegarde créée: $BACKUP_FILE"
    
    # Compresser la sauvegarde
    gzip "$BACKUP_FILE"
    echo "✅ Sauvegarde compressée: ${BACKUP_FILE}.gz"
    
    # Supprimer les anciennes sauvegardes (garder les 30 derniers jours)
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
    echo "✅ Anciennes sauvegardes supprimées (>30 jours)"
else
    echo "❌ Erreur: La sauvegarde est vide"
    exit 1
fi

