import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { jest, beforeAll, afterAll } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables (use .env file)
// Try backend/.env first, then root .env
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Also try loading from root if backend/.env doesn't exist
if (!process.env.DATABASE_URL) {
  const rootEnvPath = join(__dirname, '../../.env');
  dotenv.config({ path: rootEnvPath });
}

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-change-in-production';
process.env.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
process.env.OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES || '10';
process.env.OTP_MAX_ATTEMPTS = process.env.OTP_MAX_ATTEMPTS || '3';

// Increase Jest timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Ensure test database is ready
  const { testPool, runMigrations } = await import('./helpers/db.js');
  const client = await testPool.connect();
  
  try {
    // Run migrations
    await runMigrations();
  } catch (error) {
    // Migrations may already exist, continue
    console.warn('Migration warning:', error.message);
  } finally {
    client.release();
  }
});

// Clean up after all tests
afterAll(async () => {
  const { testPool } = await import('./helpers/db.js');
  await testPool.end();
});
