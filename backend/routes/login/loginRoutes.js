import express from 'express';
import { handleLogin } from '../../controllers/login/loginController.js';
const router = express.Router();
router.post('/', handleLogin);
export default router;