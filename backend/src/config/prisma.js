import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';
dotenv.config({ override: true });

export const prisma = new PrismaClient({
  datasources: process.env.DATABASE_URL ? { db: { url: process.env.DATABASE_URL } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
