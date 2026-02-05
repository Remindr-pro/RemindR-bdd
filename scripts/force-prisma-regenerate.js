#!/usr/bin/env node
/**
 * Script pour forcer la régénération complète de Prisma avec la bonne DATABASE_URL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env first
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ ERREUR: DATABASE_URL n\'est pas défini');
  process.exit(1);
}

// Remove quotes if present
let cleanDbUrl = dbUrl;
if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || 
    (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
  cleanDbUrl = dbUrl.slice(1, -1);
}

const maskedUrl = cleanDbUrl.replace(/:([^:@]+)@/, ':****@');
console.log('🔄 Régénération forcée de Prisma...');
console.log('📊 DATABASE_URL:', maskedUrl);
console.log('📊 Longueur:', cleanDbUrl.length, 'caractères');
console.log('📊 Contient "supabase":', cleanDbUrl.includes('supabase'));

if (!cleanDbUrl.includes('supabase')) {
  console.error('❌ ERREUR: DATABASE_URL ne contient pas "supabase"');
  console.error('   Vérifiez que votre .env contient bien l\'URL Supabase');
  process.exit(1);
}

try {
  // 1. Supprimer complètement le client Prisma
  console.log('\n🗑️  Suppression de l\'ancien client Prisma...');
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma');
  if (fs.existsSync(prismaClientPath)) {
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
    console.log('   ✅ Supprimé: node_modules/.prisma');
  }
  
  const prismaClientCachePath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client', '.prisma');
  if (fs.existsSync(prismaClientCachePath)) {
    fs.rmSync(prismaClientCachePath, { recursive: true, force: true });
    console.log('   ✅ Supprimé: node_modules/@prisma/client/.prisma');
  }

  // 2. Régénérer avec la bonne DATABASE_URL
  console.log('\n🔧 Génération du nouveau client Prisma...');
  const env = { ...process.env };
  env.DATABASE_URL = cleanDbUrl; // Force clean URL
  
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: env,
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Client Prisma régénéré avec succès!');
  console.log('⚠️  IMPORTANT: Redémarrez l\'application pour que les changements prennent effet');
  
} catch (error) {
  console.error('\n❌ Erreur lors de la régénération:', error.message);
  process.exit(1);
}

