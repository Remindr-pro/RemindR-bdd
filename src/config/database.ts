import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

// Load .env file explicitly with absolute path
const envPath = resolve(process.cwd(), '.env');
const envResult = dotenv.config({ path: envPath });

if (envResult.error && process.env.NODE_ENV === 'production') {
  console.error('❌ ERREUR: Impossible de charger le fichier .env:', envResult.error.message);
  console.error('📁 Chemin recherché:', envPath);
  console.error('📁 Répertoire de travail:', process.cwd());
}

// Force DATABASE_URL to be set from .env
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ ERREUR: DATABASE_URL n\'est pas défini dans le .env');
}

// Log DATABASE_URL (masked) for debugging in production
if (process.env.NODE_ENV === 'production') {
  // Better masking: replace password but keep structure
  const maskedUrl = dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@') : 'NON DÉFINI';
  const urlLength = dbUrl?.length || 0;
  
  console.log('📊 DATABASE_URL chargé (masqué):', maskedUrl);
  console.log('📊 Longueur de DATABASE_URL:', urlLength, 'caractères');
  console.log('📊 DATABASE_URL contient "supabase":', dbUrl?.includes('supabase') || false);
  console.log('📊 DATABASE_URL contient "postgres:5432":', dbUrl?.includes('postgres:5432') || false);
  console.log('📊 DATABASE_URL se termine par "/postgres":', dbUrl?.endsWith('/postgres') || false);
  
  // Show first and last 30 chars for debugging (without password)
  if (dbUrl) {
    const start = dbUrl.substring(0, 30);
    const end = dbUrl.substring(Math.max(0, dbUrl.length - 30));
    console.log('📊 Début DATABASE_URL:', start, '...');
    console.log('📊 Fin DATABASE_URL:', '...', end);
  }
  
  logger.info({ 
    databaseUrl: maskedUrl,
    databaseUrlLength: urlLength,
    hasDatabaseUrl: !!dbUrl,
    containsSupabase: dbUrl?.includes('supabase') || false,
    envPath: envPath,
    cwd: process.cwd()
  }, 'Database configuration loaded');
  
  // Warn if DATABASE_URL looks like Docker hostname
  if (dbUrl && (dbUrl.includes('postgres:5432') || dbUrl.includes('localhost:5432')) && !dbUrl.includes('supabase')) {
    logger.warn('⚠️  DATABASE_URL semble pointer vers Docker/localhost. Vérifiez que votre .env contient bien l\'URL Supabase.');
  }
  
  // Warn if DATABASE_URL seems incomplete
  if (dbUrl && urlLength < 50) {
    logger.warn('⚠️  DATABASE_URL semble incomplet (trop court). Vérifiez le format dans le .env.');
  }
}

// Create Prisma client
// Prisma will read DATABASE_URL from process.env automatically
// We ensure it's loaded via dotenv.config() above

// Force DATABASE_URL in process.env before creating PrismaClient
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  
  // Log what Prisma will use
  if (process.env.NODE_ENV === 'production') {
    console.log('🔧 Prisma utilisera DATABASE_URL:', dbUrl.replace(/:([^:@]+)@/, ':****@'));
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

