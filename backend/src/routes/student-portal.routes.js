import { Router } from 'express';
import multer from 'multer';
import {
  lookupCandidate,
  uploadStudentSelfDocument,
} from '../controllers/student-portal.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

// Public endpoints for student self-service document submission
router.post('/lookup', lookupCandidate);
router.post('/upload', upload.single('file'), uploadStudentSelfDocument);

export default router;
