import crypto from 'crypto';
import QRCode from 'qrcode';
const CREDENTIAL_SIGNING_KEY = process.env.CREDENTIAL_SIGNING_KEY || 'apaarsetu_aicte_credential_ed25519_demo_signing_key_9921';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export function generateCredentialReference() {
    const year = new Date().getFullYear();
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `APAAR-CRD-${year}-${randomSuffix}`;
}
export function signCredentialPayload(payload) {
    // Deterministic canonical string
    const canonicalData = [
        payload.credentialReference,
        payload.studentId,
        payload.studentName,
        payload.apaarMasked,
        payload.institutionCode,
        payload.courseCode,
        payload.academicYear,
        payload.issuedAt,
    ].join('|');
    return crypto
        .createHmac('sha256', CREDENTIAL_SIGNING_KEY)
        .update(canonicalData)
        .digest('hex');
}
export function verifyCredentialSignature(payload, signature) {
    try {
        const expectedSignature = signCredentialPayload(payload);
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    catch (err) {
        return false;
    }
}
export async function generateCredentialQRCode(credentialReference, signature) {
    // Security Requirement: Never put full APAAR or sensitive personal data into the QR URL!
    // Only non-sensitive reference and signature token:
    const verificationUrl = `${CLIENT_URL}/verify?ref=${encodeURIComponent(credentialReference)}&sig=${encodeURIComponent(signature.slice(0, 32))}`;
    return await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 250,
        color: {
            dark: '#1e3a8a', // Deep Government Navy Blue
            light: '#ffffff',
        },
    });
}
