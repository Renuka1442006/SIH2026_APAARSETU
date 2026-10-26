import { Router } from 'express';
import { getAuditEvents } from '../controllers/audit.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAuditEvents);

export default router;
