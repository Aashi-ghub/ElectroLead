import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment (use .env file)
// Try backend/.env first, then root .env
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Also try loading from root if backend/.env doesn't exist
if (!process.env.DATABASE_URL) {
  const rootEnvPath = join(__dirname, '../../../.env');
  dotenv.config({ path: rootEnvPath });
}

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set');
  console.error('Please add to your .env file (backend/.env or root .env):');
  console.error('DATABASE_URL=postgresql://username:password@host:port/database_name');
  throw new Error('DATABASE_URL is required in .env file');
}

// Test database connection pool (use DATABASE_URL from .env)
export const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Increased for concurrent tests
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout
  allowExitOnIdle: true,
});

// Truncate lock to prevent concurrent truncations
let truncateLock = false;

/**
 * Truncate all tables (clean state)
 */
export const truncateAll = async () => {
  // Prevent concurrent truncations
  while (truncateLock) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  truncateLock = true;
  const client = await testPool.connect();
  
  try {
    // Use transaction to ensure atomicity
    await client.query('BEGIN');
    
    // Truncate in order (respecting foreign keys with CASCADE)
    // Order matters: child tables first, then parent tables
    await client.query('TRUNCATE TABLE audit_logs CASCADE;');
    await client.query('TRUNCATE TABLE quotations CASCADE;');
    await client.query('TRUNCATE TABLE enquiries CASCADE;');
    await client.query('TRUNCATE TABLE user_documents CASCADE;');
    await client.query('TRUNCATE TABLE subscriptions CASCADE;');
    await client.query('TRUNCATE TABLE users CASCADE;');
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    // Ignore deadlock errors (can happen with concurrent tests)
    if (!error.message.includes('deadlock')) {
      console.error('Error truncating tables:', error.message);
    }
  } finally {
    truncateLock = false;
    client.release();
  }
};

/**
 * Run database migrations (schema.sql)
 */
export const runMigrations = async () => {
  const client = await testPool.connect();
  try {
    // Try backend/database/schema.sql first, then root database/schema.sql
    let schemaPath = join(__dirname, '../../database/schema.sql');
    if (!existsSync(schemaPath)) {
      schemaPath = join(__dirname, '../../../database/schema.sql');
    }
    
    if (!existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Remove single-line comments
    let cleanSchema = schema.replace(/--.*$/gm, '');
    
    // Remove multi-line comments
    cleanSchema = cleanSchema.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Split by semicolons, but preserve dollar-quoted strings (for functions)
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    
    for (let i = 0; i < cleanSchema.length; i++) {
      const char = cleanSchema[i];
      const nextChars = cleanSchema.substring(i, i + 2);
      
      // Check for dollar-quote start: $tag$ or $$
      if (nextChars === '$$' || (char === '$' && /^\$[a-zA-Z_]*\$/.test(cleanSchema.substring(i)))) {
        const match = cleanSchema.substring(i).match(/^\$([a-zA-Z_]*)\$/);
        if (match) {
          dollarTag = match[0];
          inDollarQuote = !inDollarQuote;
          currentStatement += dollarTag;
          i += dollarTag.length - 1;
          continue;
        }
      }
      
      currentStatement += char;
      
      // If we hit a semicolon and we're not in a dollar-quote, end the statement
      if (char === ';' && !inDollarQuote) {
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }
    
    // Execute each statement
    for (const statement of statements) {
      if (statement && statement.length > 5) {
        try {
          await client.query(statement);
        } catch (error) {
          // Ignore "already exists", "duplicate", and some expected errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('does not exist') &&
              error.code !== '42P07' && // duplicate_table
              error.code !== '42710') {  // duplicate_object
            // Log but don't fail for non-critical errors
            if (error.severity !== 'ERROR' || error.code === '00000') {
              console.warn(`Migration note: ${error.message}`);
            } else {
              // Only throw for real errors
            throw error;
            }
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
