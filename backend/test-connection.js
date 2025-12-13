// Quick database connection test
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
});

pool.query('SELECT 1 as test')
  .then(() => {
    console.log('✅ Database connection successful!');
    return pool.query('SELECT current_database() as db_name');
  })
  .then((result) => {
    console.log('✅ Connected to database:', result.rows[0].db_name);
    return pool.end();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('1. PostgreSQL is running');
    console.error('2. DATABASE_URL in .env is correct');
    console.error('3. Database exists');
    console.error('4. User has permissions');
    process.exit(1);
  });
