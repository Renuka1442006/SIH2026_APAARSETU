import prisma from '../config/prisma.js';
export async function logAuditEvent(params) {
    try {
        const detailsStr = params.details
            ? typeof params.details === 'string'
                ? params.details
                : JSON.stringify(params.details)
            : null;
        return await prisma.auditEvent.create({
            data: {
                userId: params.userId || null,
                institutionId: params.institutionId || null,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId || null,
                ipAddress: params.ipAddress || null,
                details: detailsStr,
            },
        });
    }
    catch (error) {
        console.error('Failed to log audit event:', error);
    }
}
