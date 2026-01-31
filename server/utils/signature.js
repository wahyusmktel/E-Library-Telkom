const crypto = require('crypto');

const SIGNED_URL_SECRET = process.env.JWT_SECRET || 'secret-key';

function generateSignedUrl(filePath, expiresIn = '1h') {
    const expires = Date.now() + (parseInt(expiresIn) * 3600 * 1000);
    const signature = crypto.createHmac('sha256', SIGNED_URL_SECRET)
        .update(`${filePath}${expires}`)
        .digest('hex');
    return `/api/files/view?path=${encodeURIComponent(filePath)}&expires=${expires}&signature=${signature}`;
}

function verifySignature(filePath, expires, signature) {
    if (Date.now() > parseInt(expires)) return false;
    const expectedSignature = crypto.createHmac('sha256', SIGNED_URL_SECRET)
        .update(`${filePath}${expires}`)
        .digest('hex');
    return signature === expectedSignature;
}

module.exports = { generateSignedUrl, verifySignature };
