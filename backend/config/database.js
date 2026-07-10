import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  // Serverless Postgres (e.g. Neon) can take several seconds to wake a
  // suspended compute on the first query after idling - 2s was too tight
  // and caused spurious "connection timeout" failures.
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

// A pooled client can be dropped by the server at any time (e.g. a serverless
// provider recycling idle connections) - that's routine, not fatal. The pool
// removes the bad client and opens a new one on the next query. Crashing the
// whole process here would turn a normal idle-disconnect into an outage.
pool.on('error', (err) => {
  console.error('Database pool error (client removed, pool continues):', err.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

export default pool;



