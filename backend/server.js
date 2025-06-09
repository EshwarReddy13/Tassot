// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Route modules
import userRoutes from './routes/users/userRoutes.js';
import projectRoutes from './routes/projects/projectRoutes.js';

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
// Enable CORS for local frontend
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// Parse JSON bodies
app.use(express.json());

// Mount feature routers under /api
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Healthcheck endpoint
app.get('/health', (_req, res) => res.send('ok'));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server\const PORT = process.env.PORT;
const isProd = process.env.NODE_ENV === 'production';
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
});