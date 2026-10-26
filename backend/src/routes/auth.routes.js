import { Router } from 'express';
import { login, getCurrentUser, getDemoAccounts, createUser, getUsers } from '../controllers/auth.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/demo-accounts', getDemoAccounts);

// AICTE Admin authority to view and provision users
router.get(
  '/users',
  authenticateToken,
  requireRole([ROLES.AICTE_ADMIN]),
  getUsers
);

router.post(
  '/create-user',
  authenticateToken,
  requireRole([ROLES.AICTE_ADMIN]),
  createUser
);

export default router;
