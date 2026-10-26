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
      return res.status(400).json({ error: 'Invalid input format', details: parseResult.error.format() });
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
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        institution: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
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
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['AICTE_ADMIN', 'INSTITUTION_ADMIN', 'VERIFIER']),
  institutionId: z.string().uuid().optional().nullable(),
  designation: z.string().optional(),
});

// Admin authority to provision users (Institution Admins & Verification Officers)
export async function createUser(req, res) {
  try {
    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const { email, password, name, role, institutionId, designation } = parse.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: `User with email '${email}' already exists.` });
    }

    // If role is INSTITUTION_ADMIN, institutionId is required
    if (role === 'INSTITUTION_ADMIN' && !institutionId) {
      return res.status(400).json({ error: 'Institution selection is required for Institution Admin role.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        institutionId: role === 'INSTITUTION_ADMIN' ? institutionId : null,
        designation: designation || (role === 'VERIFIER' ? 'Verification Officer' : 'Institution Nodal Officer'),
      },
      include: {
        institution: {
          select: { id: true, code: true, name: true, state: true },
        },
      },
    });

    await logAuditEvent({
      userId: req.user?.userId,
      institutionId: newUser.institutionId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      details: { email, name, role, institution: newUser.institution?.name },
    });

    res.status(201).json({
      message: `Account for ${name} (${role}) provisioned successfully in database.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        designation: newUser.designation,
        institutionId: newUser.institutionId,
        institution: newUser.institution,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user account.' });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        designation: true,
        institutionId: true,
        createdAt: true,
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
}

export async function getDemoAccounts(_req, res) {
  res.json([
    {
      role: 'INSTITUTION_ADMIN',
      portalTitle: 'Institution Admin Portal',
      label: 'Institution Admin (IIT Delhi)',
      email: 'admin@iitd.ac.in',
      password: 'IITD@123',
      description: 'Manages student records and document uploads. Checks admission and intake compliance. Reviews verification alerts.',
      features: [
        'Manages student records and document uploads.',
        'Checks admission and intake compliance.',
        'Reviews verification alerts.',
      ],
      badgeColor: 'blue',
    },
    {
      role: 'AICTE_ADMIN',
      portalTitle: 'AICTE / Platform Admin Portal',
      label: 'AICTE Apex Platform Admin',
      email: 'aicte.admin@aicte.gov.in',
      password: 'Admin@123',
      description: 'Views institution-wise dashboards. Monitors potential duplicate enrolments. Reviews compliance reports and audit logs.',
      features: [
        'Views institution-wise dashboards.',
        'Monitors potential duplicate enrolments.',
        'Reviews compliance reports and audit logs.',
        'Authority to onboard new institutions & provision officers.',
      ],
      badgeColor: 'purple',
    },
    {
      role: 'VERIFIER',
      portalTitle: 'Verification Officer Portal',
      label: 'Verification Officer (TCS / Agency)',
      email: 'verifier@tcs.com',
      password: 'Verifier@123',
      description: 'Reviews AI-generated alerts. Checks documents and conflicting records. Approves or rejects cases after manual review.',
      features: [
        'Reviews AI-generated alerts.',
        'Checks documents and conflicting records.',
        'Approves or rejects cases after manual review.',
      ],
      badgeColor: 'amber',
    },
  ]);
}
