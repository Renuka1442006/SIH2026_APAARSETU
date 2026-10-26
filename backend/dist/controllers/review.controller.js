import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ROLES, REVIEW_STATUS } from '../utils/constants.js';
import { logAuditEvent } from '../services/audit-service.js';
export async function getReviewCases(req, res) {
    try {
        const user = req.user;
        const { status, institutionId } = req.query;
        const where = {};
        if (status) {
            where.status = String(status);
        }
        if (user?.role === ROLES.INSTITUTION_ADMIN) {
            where.OR = [
                { primaryInstitutionId: user.institutionId },
                { conflictingInstitutionId: user.institutionId },
            ];
        }
        else if (institutionId) {
            where.OR = [
                { primaryInstitutionId: String(institutionId) },
                { conflictingInstitutionId: String(institutionId) },
            ];
        }
        const cases = await prisma.reviewCase.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        apaarId: true,
                        apaarStatus: true,
                        gender: true,
                        dob: true,
                    },
                },
                primaryInstitution: {
                    select: { id: true, name: true, code: true, state: true },
                },
                conflictingInstitution: {
                    select: { id: true, name: true, code: true, state: true },
                },
                reviewedByUser: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(cases);
    }
    catch (error) {
        console.error('Error fetching review cases:', error);
        res.status(500).json({ error: 'Failed to fetch review cases.' });
    }
}
export async function getReviewCaseById(req, res) {
    try {
        const id = String(req.params.id);
        const user = req.user;
        const reviewCase = await prisma.reviewCase.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        enrolments: {
                            include: {
                                institution: true,
                                course: true,
                            },
                        },
                        validationIssues: true,
                    },
                },
                primaryInstitution: true,
                conflictingInstitution: true,
                reviewedByUser: true,
            },
        });
        if (!reviewCase) {
            res.status(404).json({ error: 'Review case not found.' });
            return;
        }
        if (user?.role === ROLES.INSTITUTION_ADMIN &&
            reviewCase.primaryInstitutionId !== user.institutionId &&
            reviewCase.conflictingInstitutionId !== user.institutionId) {
            res.status(403).json({ error: 'Access denied to this review case.' });
            return;
        }
        res.json(reviewCase);
    }
    catch (error) {
        console.error('Error fetching review case by id:', error);
        res.status(500).json({ error: 'Failed to fetch review case.' });
    }
}
const updateCaseSchema = z.object({
    status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'REQUIRING_CORRECTION', 'REJECTED']),
    reviewerRemarks: z.string().min(3),
});
export async function updateReviewCase(req, res) {
    try {
        const id = String(req.params.id);
        const user = req.user;
        const parse = updateCaseSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
            return;
        }
        const { status, reviewerRemarks } = parse.data;
        const existingCase = await prisma.reviewCase.findUnique({
            where: { id },
        });
        if (!existingCase) {
            res.status(404).json({ error: 'Review case not found.' });
            return;
        }
        // Role check: Authorized verifiers or AICTE Admins can resolve cases
        const updated = await prisma.reviewCase.update({
            where: { id },
            data: {
                status,
                reviewerRemarks,
                reviewedByUserId: user?.userId,
                resolvedAt: status === REVIEW_STATUS.RESOLVED ? new Date() : null,
                updatedAt: new Date(),
            },
            include: {
                student: true,
                primaryInstitution: true,
                conflictingInstitution: true,
            },
        });
        // If resolved, update student validation status if necessary
        if (status === REVIEW_STATUS.RESOLVED) {
            await prisma.student.update({
                where: { id: updated.studentId },
                data: { apaarStatus: 'SIMULATED_VERIFIED' },
            });
            // Also mark enrolment active if flagged
            await prisma.enrolment.updateMany({
                where: { studentId: updated.studentId, status: 'FLAGGED' },
                data: { status: 'ACTIVE' },
            });
        }
        await logAuditEvent({
            userId: user?.userId,
            institutionId: updated.primaryInstitutionId,
            action: 'REVIEW_CASE_UPDATED',
            entityType: 'ReviewCase',
            entityId: id,
            details: {
                previousStatus: existingCase.status,
                newStatus: status,
                remarks: reviewerRemarks,
            },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating review case:', error);
        res.status(500).json({ error: 'Failed to update review case.' });
    }
}
