import prisma from '../config/prisma.js';
import { ROLES } from '../utils/constants.js';
export async function getAuditEvents(req, res) {
    try {
        const user = req.user;
        const { action, entityType, institutionId, page = '1', limit = '50' } = req.query;
        const where = {};
        if (user?.role === ROLES.INSTITUTION_ADMIN) {
            where.institutionId = user.institutionId;
        }
        else if (institutionId) {
            where.institutionId = String(institutionId);
        }
        if (action)
            where.action = String(action);
        if (entityType)
            where.entityType = String(entityType);
        const pageNum = parseInt(String(page), 10) || 1;
        const take = parseInt(String(limit), 10) || 50;
        const skip = (pageNum - 1) * take;
        const [events, total] = await Promise.all([
            prisma.auditEvent.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    institution: { select: { id: true, name: true, code: true } },
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take,
            }),
            prisma.auditEvent.count({ where }),
        ]);
        res.json({
            events,
            pagination: {
                page: pageNum,
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    }
    catch (error) {
        console.error('Error fetching audit events:', error);
        res.status(500).json({ error: 'Failed to retrieve audit events.' });
    }
}
