import admin from 'firebase-admin';
import pool from '../db.js'; // Adjust path to your PostgreSQL pool

// Initialize Firebase Admin SDK
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(__dirname, '../config/tassot-b7d80-firebase-adminsdk-fbsvc-a9becb65f1.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (err)
 {
  console.error(`FATAL ERROR: Cannot load service account at ${serviceAccountPath}`, err);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK Initialized.');
}

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // *** THE FIX IS HERE ***
    // We select 'firebase_uid' without renaming it.
    const { rows } = await pool.query(
      `SELECT id, firebase_uid, email, first_name, last_name FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: User not registered.' });
    }

    // Now req.user will have a 'firebase_uid' property, which is what the other controllers expect.
    req.user = rows[0];
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Unauthorized: Token expired.' });
    }
    return res.status(403).json({ error: 'Forbidden: Invalid token.' });
  }
};