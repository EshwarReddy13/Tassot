// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Route modules
import userRoutes from './routes/users/userRoutes.js';

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
// Enable CORS for local frontend
app.use(cors({ origin: 'http://localhost:5173' }));
// Parse JSON bodies
app.use(express.json());

// Mount feature routers under /api
app.use('/api/users', userRoutes);

// Healthcheck endpoint
app.get('/health', (_req, res) => res.send('ok'));

// Start server\const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
});