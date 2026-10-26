import { Router } from 'express';
import { login, getCurrentUser, getDemoAccounts } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/demo-accounts', getDemoAccounts);
export default router;
