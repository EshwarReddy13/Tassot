// src/middleware/authMiddleware.js
import admin from 'firebase-admin';
import pool from '../db.js'; // Adjust the path to your PostgreSQL pool instance

// --- Import JSON using fs module ---
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Helper to get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct the absolute path to your service account key file
// IMPORTANT: Adjust the relative path ('../../config/...') if needed,
// based on where authMiddleware.js is located relative to your key file.
const serviceAccountPath = join(__dirname, '../config/tassot-b7d80-firebase-adminsdk-fbsvc-88ed4a7ad2.json');

let serviceAccount;
try {
    const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
    console.error(`FATAL ERROR: Could not read or parse service account key file at: ${serviceAccountPath}`);
    console.error(error);
    process.exit(1); // Exit if the key file is essential and cannot be loaded
}
// --- End Import JSON ---


// --- Firebase Admin Initialization ---
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
      // databaseURL: "https://your-project-id.firebaseio.com" // Optional
    });
    console.log('Firebase Admin SDK Initialized.');
  }
} catch (error) {
  console.error('Firebase Admin SDK Initialization Error:', error);
  process.exit(1);
}
// --- End Firebase Admin Initialization ---


/**
 * Express Middleware to verify Firebase ID token and attach user data.
 */
export const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.log('Auth Middleware: No or invalid Authorization header');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  if (!idToken) {
     console.log('Auth Middleware: Token missing after Bearer split');
     return res.status(401).json({ error: 'Unauthorized: Token missing.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    const userQuery = `
      SELECT id, email, first_name, last_name, photo_url, provider, created_at, settings
      FROM users
      WHERE firebase_uid = $1;
    `;
    const { rows } = await pool.query(userQuery, [firebaseUid]);

    if (rows.length === 0) {
      console.log(`Auth Middleware: User not found in DB for Firebase UID: ${firebaseUid}`);
      return res.status(403).json({ error: 'Forbidden: User not registered in application database.' });
    }

    req.user = rows[0];
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Unauthorized: Token expired.' });
    }
    if (error.code && error.code.startsWith('auth/')) {
        return res.status(403).json({ error: 'Forbidden: Invalid token.' });
    }
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};