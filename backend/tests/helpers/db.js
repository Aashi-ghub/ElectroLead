import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment (use .env file)
dotenv.config({ path: join(__dirname, '../../.env') });

// Test database connection pool (use DATABASE_URL from .env)
export const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Truncate all tables (clean state)
 */
export const truncateAll = async () => {
  const client = await testPool.connect();
  try {
    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');
    
    // Truncate in order (respecting foreign keys)
    await client.query('TRUNCATE TABLE audit_logs CASCADE;');
    await client.query('TRUNCATE TABLE quotations CASCADE;');
    await client.query('TRUNCATE TABLE enquiries CASCADE;');
    await client.query('TRUNCATE TABLE user_documents CASCADE;');
    await client.query('TRUNCATE TABLE subscriptions CASCADE;');
    await client.query('TRUNCATE TABLE users CASCADE;');
    
    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
  } catch (error) {
    console.error('Error truncating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Run database migrations (schema.sql)
 */
export const runMigrations = async () => {
  const client = await testPool.connect();
  try {
    const schemaPath = join(__dirname, '../../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        try {
          await client.query(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate')) {
            throw error;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get database connection for direct queries
 */
export const getClient = async () => {
  return await testPool.connect();
};

/**
 * Execute a query in a transaction that auto-rollbacks
 */
export const withTransaction = async (callback) => {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('ROLLBACK');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
