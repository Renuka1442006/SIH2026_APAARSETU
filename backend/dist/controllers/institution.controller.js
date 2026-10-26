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
    }
    catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({ error: 'Failed to fetch institutions.' });
    }
}
export async function getInstitutionById(req, res) {
    try {
        const id = String(req.params.id);
        const user = req.user;
        if (user?.role === ROLES.INSTITUTION_ADMIN && user.institutionId !== id) {
            res.status(403).json({ error: 'Access denied to this institution.' });
            return;
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
            res.status(404).json({ error: 'Institution not found.' });
            return;
        }
        res.json(institution);
    }
    catch (error) {
        console.error('Error fetching institution by id:', error);
        res.status(500).json({ error: 'Failed to fetch institution profile.' });
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
            res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
            return;
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
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Course with this code already exists for this institution.' });
            return;
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
            res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
            return;
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
    }
    catch (error) {
        console.error('Error setting intake approval:', error);
        res.status(500).json({ error: 'Failed to update intake approval.' });
    }
}
