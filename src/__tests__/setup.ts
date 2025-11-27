// Setup file for Jest tests
import dotenv from 'dotenv';

// Load environment variables from .env.test or .env
dotenv.config({ path: '.env.test' });
dotenv.config();

// Set test environment variables if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://remindr:remindr_password@localhost:5432/remindr_test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

