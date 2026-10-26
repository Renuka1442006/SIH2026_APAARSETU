import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { logAuditEvent } from '../services/audit-service.js';
const JWT_SECRET = process.env.JWT_SECRET || 'apaarsetu_hackathon_demo_jwt_secret_key_2026_super_secure';
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export async function login(req, res) {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ error: 'Invalid input format', details: parseResult.error.format() });
            return;
        }
        const { email, password } = parseResult.data;
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                institution: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        aisheCode: true,
                        state: true,
                        city: true,
                    },
                },
            },
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            institutionId: user.institutionId,
            name: user.name,
        }, JWT_SECRET, { expiresIn: '24h' });
        await logAuditEvent({
            userId: user.id,
            institutionId: user.institutionId,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user.id,
            ipAddress: req.ip,
            details: { role: user.role, email: user.email },
        });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                designation: user.designation,
                institutionId: user.institutionId,
                institution: user.institution,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
}
export async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthenticated.' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                institution: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            designation: user.designation,
            institutionId: user.institutionId,
            institution: user.institution,
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
export async function getDemoAccounts(_req, res) {
    // Returns demo accounts info for testing convenience during evaluation
    res.json([
        {
            role: 'AICTE_ADMIN',
            label: 'AICTE National Administrator',
            email: 'aicte.admin@aicte.gov.in',
            password: 'Admin@123',
            description: 'National overview, cross-institution conflict resolution, capacity monitoring & policy controls.',
            badgeColor: 'purple',
        },
        {
            role: 'INSTITUTION_ADMIN',
            label: 'IIT Delhi — Institution Admin',
            email: 'admin@iitd.ac.in',
            password: 'IITD@123',
            description: 'Central Institute of National Importance (Code: 1-001). Student enrolments & batch uploads.',
            badgeColor: 'blue',
        },
        {
            role: 'INSTITUTION_ADMIN',
            label: 'COEP Tech Univ Pune — Institution Admin',
            email: 'admin@coep.ac.in',
            password: 'COEP@123',
            description: 'State Autonomous Engineering University (Code: 1-002). Intake monitoring & credential issuance.',
            badgeColor: 'cyan',
        },
        {
            role: 'INSTITUTION_ADMIN',
            label: 'VJTI Mumbai — Institution Admin',
            email: 'admin@vjti.ac.in',
            password: 'VJTI@123',
            description: 'State Autonomous Engineering Institute (Code: 1-003). Demonstrates cross-institution collision handling.',
            badgeColor: 'emerald',
        },
        {
            role: 'VERIFIER',
            label: 'Authorized Verifier (Corporate / HR)',
            email: 'verifier@tcs.com',
            password: 'Verifier@123',
            description: 'Third-party employer or agency inspecting cryptographic academic credentials and tamper proofs.',
            badgeColor: 'amber',
        },
    ]);
}
