import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ROLES } from '../utils/constants.js';
import { logAuditEvent } from '../services/audit-service.js';

export async function getInstitutions(req, res) {
  try {
    const user = req.user;
    let whereClause = {};

    if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId) {
      whereClause = { id: user.institutionId };
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
      include: {
        courses: {
          include: {
            intakeApprovals: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            designation: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            students: true,
            enrolments: true,
            uploadBatches: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions.' });
  }
}

export async function getInstitutionById(req, res) {
  try {
    const id = String(req.params.id);
    const user = req.user;

    if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId !== id) {
      return res.status(403).json({ error: 'Access denied to this institution.' });
    }

    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            intakeApprovals: true,
            _count: {
              select: { enrolments: true },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            designation: true,
          },
        },
        intakeApprovals: {
          include: {
            course: true,
          },
        },
        _count: {
          select: {
            students: true,
            enrolments: true,
            uploadBatches: true,
          },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({ error: 'Institution not found.' });
    }

    res.json(institution);
  } catch (error) {
    console.error('Error fetching institution by id:', error);
    res.status(500).json({ error: 'Failed to fetch institution profile.' });
  }
}

const createInstitutionSchema = z.object({
  code: z.string().min(2, 'Institution code is required'),
  name: z.string().min(3, 'Institution name is required'),
  aisheCode: z.string().min(2, 'AISHE code is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  type: z.string().default('Government'),
});

// Admin authority to add an institution
export async function createInstitution(req, res) {
  try {
    const parse = createInstitutionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const data = parse.data;

    // Check unique code and aisheCode
    const existing = await prisma.institution.findFirst({
      where: {
        OR: [{ code: data.code }, { aisheCode: data.aisheCode }],
      },
    });

    if (existing) {
      return res.status(409).json({
        error: `An institution with Code '${data.code}' or AISHE Code '${data.aisheCode}' already exists.`,
      });
    }

    const institution = await prisma.institution.create({
      data: {
        code: data.code,
        name: data.name,
        aisheCode: data.aisheCode,
        state: data.state,
        city: data.city,
        address: data.address || null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        type: data.type,
      },
    });

    await logAuditEvent({
      userId: req.user?.userId,
      institutionId: institution.id,
      action: 'INSTITUTION_CREATED',
      entityType: 'Institution',
      entityId: institution.id,
      details: data,
    });

    res.status(201).json(institution);
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: 'Failed to create institution.' });
  }
}

const onboardSchema = z.object({
  // Institution details
  code: z.string().min(2),
  name: z.string().min(3),
  aisheCode: z.string().min(2),
  state: z.string().min(2),
  city: z.string().min(2),
  address: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  type: z.string().default('State Autonomous'),

  // Initial Admin credentials
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  adminDesignation: z.string().default('Head of Institution / Registrar'),
});

// Admin authority: onboard institution and immediately generate its admin credentials
export async function onboardInstitutionWithAdmin(req, res) {
  try {
    const parse = onboardSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const data = parse.data;

    // Check user email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email: data.adminEmail } });
    if (existingUser) {
      return res.status(409).json({ error: `Admin user with email '${data.adminEmail}' already exists.` });
    }

    // Check institution code uniqueness
    const existingInst = await prisma.institution.findFirst({
      where: {
        OR: [{ code: data.code }, { aisheCode: data.aisheCode }],
      },
    });
    if (existingInst) {
      return res.status(409).json({
        error: `Institution with Code '${data.code}' or AISHE '${data.aisheCode}' already exists.`,
      });
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 10);

    // Transaction to create both
    const result = await prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          code: data.code,
          name: data.name,
          aisheCode: data.aisheCode,
          state: data.state,
          city: data.city,
          address: data.address || null,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          type: data.type,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          email: data.adminEmail,
          passwordHash,
          name: data.adminName,
          role: ROLES.INSTITUTION_ADMIN,
          institutionId: institution.id,
          designation: data.adminDesignation,
        },
      });

      return { institution, adminUser };
    });

    await logAuditEvent({
      userId: req.user?.userId,
      institutionId: result.institution.id,
      action: 'INSTITUTION_ONBOARDED_WITH_ADMIN',
      entityType: 'Institution',
      entityId: result.institution.id,
      details: {
        institution: result.institution.name,
        adminEmail: result.adminUser.email,
      },
    });

    res.status(201).json({
      message: `Institution '${result.institution.name}' and its Admin credentials provisioned successfully.`,
      institution: result.institution,
      admin: {
        id: result.adminUser.id,
        name: result.adminUser.name,
        email: result.adminUser.email,
        role: result.adminUser.role,
        designation: result.adminUser.designation,
        createdAt: result.adminUser.createdAt,
      },
      adminUser: {
        id: result.adminUser.id,
        name: result.adminUser.name,
        email: result.adminUser.email,
        role: result.adminUser.role,
        designation: result.adminUser.designation,
        createdAt: result.adminUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error onboarding institution:', error);
    res.status(500).json({ error: 'Failed to onboard institution and administrator.' });
  }
}

const courseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  level: z.string().default('UG'),
  durationYears: z.number().int().min(1).max(6).default(4),
});

export async function addCourse(req, res) {
  try {
    const institutionId = String(req.params.institutionId);
    const parse = courseSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const course = await prisma.course.create({
      data: {
        ...parse.data,
        institutionId,
      },
    });

    await logAuditEvent({
      userId: req.user?.userId,
      institutionId,
      action: 'COURSE_CREATE',
      entityType: 'Course',
      entityId: course.id,
      details: parse.data,
    });

    res.status(201).json(course);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Course with this code already exists for this institution.' });
    }
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Failed to create course.' });
  }
}

const intakeSchema = z.object({
  courseId: z.string().uuid(),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/, 'Must be in format YYYY-YY (e.g. 2024-25)'),
  approvedIntake: z.number().int().min(1),
  maxSupernumerary: z.number().int().min(0).default(18),
  approvalLetterRef: z.string().default('AICTE/APP/2024-25/SANCTION'),
});

export async function setIntakeApproval(req, res) {
  try {
    const institutionId = String(req.params.institutionId);
    const parse = intakeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
    }

    const approval = await prisma.intakeApproval.upsert({
      where: {
        institutionId_courseId_academicYear: {
          institutionId,
          courseId: parse.data.courseId,
          academicYear: parse.data.academicYear,
        },
      },
      update: {
        approvedIntake: parse.data.approvedIntake,
        maxSupernumerary: parse.data.maxSupernumerary,
        approvalLetterRef: parse.data.approvalLetterRef,
        updatedAt: new Date(),
      },
      create: {
        institutionId,
        courseId: parse.data.courseId,
        academicYear: parse.data.academicYear,
        approvedIntake: parse.data.approvedIntake,
        maxSupernumerary: parse.data.maxSupernumerary,
        approvalLetterRef: parse.data.approvalLetterRef,
      },
    });

    await logAuditEvent({
      userId: req.user?.userId,
      institutionId,
      action: 'INTAKE_APPROVAL_SET',
      entityType: 'IntakeApproval',
      entityId: approval.id,
      details: parse.data,
    });

    res.json(approval);
  } catch (error) {
    console.error('Error setting intake approval:', error);
    res.status(500).json({ error: 'Failed to update intake approval.' });
  }
}
