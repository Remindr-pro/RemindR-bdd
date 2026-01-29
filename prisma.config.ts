import { defineConfig, env } from '@prisma/config';

// Use a dummy DATABASE_URL for Prisma Client generation if not provided
// Prisma only needs the schema, not a real database connection for generation
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db?schema=public';

// Set it in process.env if not already set (for Prisma config)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});

