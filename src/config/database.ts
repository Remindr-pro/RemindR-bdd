import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import dotenv from 'dotenv';

// Ensure dotenv is loaded before Prisma
dotenv.config();

// Log DATABASE_URL (masked) for debugging in production
if (process.env.NODE_ENV === 'production') {
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  logger.info({ 
    databaseUrl: maskedUrl,
    hasDatabaseUrl: !!process.env.DATABASE_URL 
  }, 'Database configuration loaded');
  
  // Warn if DATABASE_URL looks like Docker hostname
  if (dbUrl.includes('postgres:5432') || dbUrl.includes('localhost:5432')) {
    logger.warn('⚠️  DATABASE_URL appears to point to localhost/Docker. Verify your .env file contains the correct Supabase URL.');
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

