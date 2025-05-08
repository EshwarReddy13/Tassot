import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.NODE_ENV === 'production'
    ? process.env.NEON_PSQL_URL_PRODUCTION
    : process.env.NEON_PSQL_URL_DEVELOPMENT,
  ssl: { rejectUnauthorized: false }
});

export default pool;