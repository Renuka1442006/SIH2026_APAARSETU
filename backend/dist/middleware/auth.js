import jwt from 'jsonwebtoken';
import { ROLES } from '../utils/constants.js';
const JWT_SECRET = process.env.JWT_SECRET || 'apaarsetu_hackathon_demo_jwt_secret_key_2026_super_secure';
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Authentication required. No token provided.' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
        return;
    }
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
            });
            return;
        }
        next();
    };
}
export function requireInstitutionAccess(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
    }
    // AICTE Admin can access any institution
    if (req.user.role === ROLES.AICTE_ADMIN) {
        next();
        return;
    }
    // Institution Admin can only access their own institution
    const requestedInstitutionId = req.params.institutionId || req.query.institutionId || req.body.institutionId;
    if (requestedInstitutionId && req.user.institutionId !== requestedInstitutionId) {
        res.status(403).json({
            error: 'Access denied. You can only view and manage records for your own institution.',
        });
        return;
    }
    next();
}
