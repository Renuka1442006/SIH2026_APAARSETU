import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config({ override: true });

import authRoutes from './routes/auth.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import studentRoutes from './routes/student.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reviewRoutes from './routes/review.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import institutionPortalRoutes from './routes/institution-portal.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local hackathon demo
      }
    },
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'APAARSetu AICTE Platform API (Node.js + Express.js)',
    version: '1.0.0',
    mode: 'Hackathon Prototype — Simulated APAAR Verification Active',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/institution', institutionPortalRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/review-cases', reviewRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-events', auditRoutes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  // Avoid logging sensitive parameters
  console.error('[SERVER ERROR]:', err?.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.',
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 APAARSetu AICTE Backend (Node.js + Express.js) running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [PORT ${PORT} IN USE]: Another instance or process is already using port ${PORT}.`);
    console.error(`👉 To free the port in PowerShell, run:`);
    console.error(`   Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force`);
    console.error(`   or: npx --yes kill-port ${PORT}\n`);
    process.exit(1);
  } else {
    console.error('[FATAL SERVER ERROR]:', err);
    process.exit(1);
  }
});

export default app;
