/**
 * TOTP (Time-based One-Time Password) helper for admin 2FA.
 *
 * Uses the `otpauth` library for TOTP generation/verification
 * and `qrcode` for generating QR code data URLs.
 *
 * The TOTP secret is persisted in config/totp.json (gitignored).
 */

const { TOTP, Secret } = require("otpauth");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const TOTP_FILE = path.join(__dirname, "totp.json");
const ISSUER = "Paraiso Admin";
const ACCOUNT = "admin";

/**
 * Check whether 2FA has been set up (secret file exists and contains a secret).
 */
function isSetUp() {
    try {
        const data = JSON.parse(fs.readFileSync(TOTP_FILE, "utf8"));
        return !!data.secret;
    } catch {
        return false;
    }
}

/**
 * Read the stored TOTP secret.
 */
function getStoredSecret() {
    try {
        const data = JSON.parse(fs.readFileSync(TOTP_FILE, "utf8"));
        return data.secret || null;
    } catch {
        return null;
    }
}

/**
 * Generate a new random secret and return { secret, otpauthUrl, qrDataUrl }.
 */
async function generateSetup() {
    const secret = new Secret({ size: 20 });
    const base32 = secret.base32;

    const totp = new TOTP({
        issuer: ISSUER,
        label: ACCOUNT,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret,
    });

    const otpauthUrl = totp.toString();
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    return { secret: base32, otpauthUrl, qrDataUrl };
}

/**
 * Verify a 6-digit token against a given base32 secret string.
 * Allows a ±1 period window to account for clock drift.
 */
function verifyToken(base32Secret, token) {
    const totp = new TOTP({
        issuer: ISSUER,
        label: ACCOUNT,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(base32Secret),
    });

    // delta = null means invalid; 0 = exact match; ±1 = within window
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
}

/**
 * Persist the TOTP secret to the config file.
 */
function saveSecret(base32Secret) {
    fs.writeFileSync(
        TOTP_FILE,
        JSON.stringify({ secret: base32Secret, createdAt: new Date().toISOString() }, null, 2),
        "utf8"
    );
}

module.exports = { isSetUp, getStoredSecret, generateSetup, verifyToken, saveSecret };
