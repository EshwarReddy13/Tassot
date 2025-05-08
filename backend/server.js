// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Route modules
import loginRoutes from './routes/login/loginRoutes.js';
// import userRoutes from './routes/users/userRoutes.js';
// import dashboardRoutes from './routes/dashboard/dashboardRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
// Enable CORS for local frontend
app.use(cors({ origin: 'http://localhost:5173' }));
// Parse JSON bodies
app.use(express.json());

// Mount feature routers under /api
app.use('/api/login', loginRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// Healthcheck endpoint
app.get('/health', (_req, res) => res.send('ok'));

// Start server\const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
});