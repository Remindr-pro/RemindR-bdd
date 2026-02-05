#!/usr/bin/env node
/**
 * Script pour régénérer le client Prisma avec la bonne DATABASE_URL
 * À exécuter après avoir modifié le .env
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔄 Régénération du client Prisma...');

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR: DATABASE_URL n\'est pas défini dans le .env');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
console.log('📊 DATABASE_URL:', maskedUrl);

// Vérifier que ce n'est pas l'URL Docker par défaut
if (dbUrl.includes('postgres:5432') && !dbUrl.includes('supabase')) {
  console.warn('⚠️  ATTENTION: DATABASE_URL semble pointer vers Docker (postgres:5432)');
  console.warn('   Vérifiez que votre .env contient bien l\'URL Supabase');
}

try {
  // Supprimer l'ancien client Prisma
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma');
  if (fs.existsSync(prismaClientPath)) {
    console.log('🗑️  Suppression de l\'ancien client Prisma...');
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
  }

  // Régénérer le client Prisma
  console.log('🔧 Génération du nouveau client Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  console.log('✅ Client Prisma régénéré avec succès!');
} catch (error) {
  console.error('❌ Erreur lors de la régénération:', error.message);
  process.exit(1);
}

