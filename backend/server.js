import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';


dotenv.config();

const app = express();
app.use(express.json());

// Choose the Neon URL based on NODE_ENV
const isProd = process.env.NODE_ENV === 'production';
const connectionString = isProd
  ? process.env.NEON_PSQL_URL_PRODUCTION
  : process.env.NEON_PSQL_URL_DEVELOPMENT;

// Set up Postgres pool
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

app.get('/health', (_req, res) => res.send('ok'));

// … your other routes …

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
});
