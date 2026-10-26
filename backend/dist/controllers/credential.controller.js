import { z } from 'zod';
import prisma from '../config/prisma.js';
import { maskApaar } from '../utils/constants.js';
import { generateCredentialReference, signCredentialPayload, verifyCredentialSignature, generateCredentialQRCode, } from '../services/crypto-service.js';
import { logAuditEvent } from '../services/audit-service.js';
const issueCredentialSchema = z.object({
    studentId: z.string().uuid(),
    courseId: z.string().uuid(),
    academicYear: z.string().regex(/^\d{4}-\d{2}$/),
});
export async function issueCredential(req, res) {
    try {
        const user = req.user;
        const parse = issueCredentialSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ error: 'Validation failed', details: parse.error.format() });
            return;
        }
        const { studentId, courseId, academicYear } = parse.data;
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                currentInstitution: true,
            },
        });
        if (!student) {
            res.status(404).json({ error: 'Student not found.' });
            return;
        }
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            res.status(404).json({ error: 'Course not found.' });
            return;
        }
        // Generate unique reference
        const credentialReference = generateCredentialReference();
        const issuedAt = new Date().toISOString();
        const apaarMasked = maskApaar(student.apaarId);
        const payload = {
            credentialReference,
            studentId: student.id,
            studentName: student.fullName,
            apaarMasked,
            institutionCode: student.currentInstitution.code,
            courseCode: course.code,
            academicYear,
            issuedAt,
        };
        // Cryptographic digital signature
        const digitalSignature = signCredentialPayload(payload);
        // QR code with reference & signature token (NO raw APAAR or PII in URL!)
        const qrCodeDataUrl = await generateCredentialQRCode(credentialReference, digitalSignature);
        const credential = await prisma.verificationCredential.create({
            data: {
                credentialReference,
                studentId: student.id,
                institutionId: student.currentInstitutionId,
                courseId: course.id,
                academicYear,
                issuedAt: new Date(issuedAt),
                status: 'ACTIVE',
                digitalSignature,
                signatureAlgorithm: 'HMAC-SHA256',
                qrCodeDataUrl,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        apaarId: true,
                        apaarStatus: true,
                    },
                },
                institution: {
                    select: { id: true, name: true, code: true, state: true },
                },
                course: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
        await logAuditEvent({
            userId: user?.userId,
            institutionId: student.currentInstitutionId,
            action: 'CREDENTIAL_ISSUED',
            entityType: 'VerificationCredential',
            entityId: credential.id,
            details: {
                reference: credentialReference,
                studentName: student.fullName,
            },
        });
        res.status(201).json({
            credential,
            payload,
        });
    }
    catch (error) {
        console.error('Error issuing credential:', error);
        res.status(500).json({ error: 'Failed to issue academic credential.' });
    }
}
// Public or Verifier verification endpoint
export async function verifyCredential(req, res) {
    try {
        const { ref, sig } = req.query;
        if (!ref) {
            res.status(400).json({ error: 'Credential reference (ref) is required.' });
            return;
        }
        const credential = await prisma.verificationCredential.findUnique({
            where: { credentialReference: String(ref) },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        apaarId: true,
                        apaarStatus: true,
                        gender: true,
                        socialCategory: true,
                        supernumeraryCategory: true,
                    },
                },
                institution: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        aisheCode: true,
                        state: true,
                        city: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        level: true,
                        durationYears: true,
                    },
                },
            },
        });
        if (!credential) {
            res.status(404).json({
                verified: false,
                error: 'Credential not found in AICTE registry.',
                details: 'The reference code does not match any issued academic credentials.',
            });
            return;
        }
        // Build canonical payload to test signature
        const canonicalPayload = {
            credentialReference: credential.credentialReference,
            studentId: credential.student.id,
            studentName: credential.student.fullName,
            apaarMasked: maskApaar(credential.student.apaarId),
            institutionCode: credential.institution.code,
            courseCode: credential.course.code,
            academicYear: credential.academicYear,
            issuedAt: credential.issuedAt.toISOString(),
        };
        const isSignatureValid = verifyCredentialSignature(canonicalPayload, credential.digitalSignature);
        // Increment verification count
        await prisma.verificationCredential.update({
            where: { id: credential.id },
            data: {
                verificationCount: { increment: 1 },
                lastVerifiedAt: new Date(),
            },
        });
        await logAuditEvent({
            userId: req.user?.userId || null,
            institutionId: credential.institutionId,
            action: 'CREDENTIAL_VERIFIED',
            entityType: 'VerificationCredential',
            entityId: credential.id,
            ipAddress: req.ip,
            details: {
                reference: credential.credentialReference,
                signatureValid: isSignatureValid,
                status: credential.status,
            },
        });
        res.json({
            verified: isSignatureValid && credential.status === 'ACTIVE',
            signatureValid: isSignatureValid,
            status: credential.status,
            revocationReason: credential.revocationReason,
            revokedAt: credential.revokedAt,
            credential: {
                reference: credential.credentialReference,
                studentName: credential.student.fullName,
                apaarMasked: maskApaar(credential.student.apaarId),
                apaarStatus: credential.student.apaarStatus,
                institutionName: credential.institution.name,
                institutionCode: credential.institution.code,
                courseName: credential.course.name,
                courseCode: credential.course.code,
                academicYear: credential.academicYear,
                issuedAt: credential.issuedAt,
                algorithm: credential.signatureAlgorithm,
                verificationCount: credential.verificationCount + 1,
            },
            auditNotice: 'Verification performed against AICTE National APAARSetu Root Registry.',
        });
    }
    catch (error) {
        console.error('Error verifying credential:', error);
        res.status(500).json({ error: 'Failed to verify credential.' });
    }
}
// Tamper Demonstration Endpoint (Allows hackathon judges to simulate payload alteration)
export async function simulateTamperCheck(req, res) {
    try {
        const { credentialId, tamperedField, tamperedValue } = req.body;
        const credential = await prisma.verificationCredential.findUnique({
            where: { id: credentialId },
            include: {
                student: true,
                institution: true,
                course: true,
            },
        });
        if (!credential) {
            res.status(404).json({ error: 'Credential not found.' });
            return;
        }
        const payload = {
            credentialReference: credential.credentialReference,
            studentId: credential.student.id,
            studentName: credential.student.fullName,
            apaarMasked: maskApaar(credential.student.apaarId),
            institutionCode: credential.institution.code,
            courseCode: credential.course.code,
            academicYear: credential.academicYear,
            issuedAt: credential.issuedAt.toISOString(),
        };
        // Apply the simulated tamper
        const tamperedPayload = { ...payload, [tamperedField || 'studentName']: tamperedValue || 'Tampered Attacker' };
        const isOriginalValid = verifyCredentialSignature(payload, credential.digitalSignature);
        const isTamperedValid = verifyCredentialSignature(tamperedPayload, credential.digitalSignature);
        res.json({
            simulationTest: 'Cryptographic Signature Tamper Verification',
            originalPayload: payload,
            originalSignatureValid: isOriginalValid,
            tamperedField,
            tamperedValue,
            tamperedPayload,
            tamperedSignatureValid: isTamperedValid,
            securityGuarantee: isTamperedValid
                ? 'FAILURE: Tamper was not detected!'
                : 'SUCCESS: Cryptographic Tamper Detected! HMAC-SHA256 signature verification failed immediately.',
        });
    }
    catch (error) {
        console.error('Tamper simulation error:', error);
        res.status(500).json({ error: 'Tamper simulation failed.' });
    }
}
export async function revokeCredential(req, res) {
    try {
        const id = String(req.params.id);
        const { reason = 'Revoked by authorized AICTE administrator' } = req.body;
        const credential = await prisma.verificationCredential.update({
            where: { id },
            data: {
                status: 'REVOKED',
                revocationReason: reason,
                revokedAt: new Date(),
            },
            include: {
                student: true,
                institution: true,
            },
        });
        await logAuditEvent({
            userId: req.user?.userId,
            institutionId: credential.institutionId,
            action: 'CREDENTIAL_REVOKED',
            entityType: 'VerificationCredential',
            entityId: id,
            details: { reason, reference: credential.credentialReference },
        });
        res.json(credential);
    }
    catch (error) {
        console.error('Error revoking credential:', error);
        res.status(500).json({ error: 'Failed to revoke credential.' });
    }
}
