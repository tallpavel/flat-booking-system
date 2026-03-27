const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/authMiddleware");
const totp = require("../config/totp");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "paraiso2026";

/**
 * Helper: sign a JWT for the admin.
 */
function signToken() {
    return jwt.sign(
        { role: "admin", iat: Math.floor(Date.now() / 1000) },
        JWT_SECRET,
        { expiresIn: "24h" }
    );
}

/**
 * POST /api/admin/login
 * Step 1: Validate password, then check 2FA status.
 *
 * Responses:
 *  - 2FA not set up  → { requires2FASetup: true, qrDataUrl, secret }
 *  - 2FA is set up   → { requires2FA: true }
 */
router.post("/vchod", async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Password is correct — check 2FA status
        if (!totp.isSetUp()) {
            // First-time: generate QR code for setup
            const setup = await totp.generateSetup();
            return res.json({
                requires2FASetup: true,
                qrDataUrl: setup.qrDataUrl,
                secret: setup.secret,
            });
        }

        // 2FA is set up — ask for the code
        return res.json({ requires2FA: true });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * POST /api/admin/setup-2fa
 * Step 2 (first time): Verify the TOTP code matches the new secret, then persist it.
 *
 * Body: { password, token, secret }
 */
router.post("/setup-2fa", async (req, res) => {
    try {
        const { password, token, secret } = req.body;

        if (!password || !token || !secret) {
            return res.status(400).json({ message: "Password, token, and secret are required" });
        }

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Verify the code against the provided secret
        if (!totp.verifyToken(secret, token)) {
            return res.status(401).json({ message: "Invalid verification code" });
        }

        // Persist the secret
        totp.saveSecret(secret);
        console.log("✅ 2FA has been set up successfully");

        // Issue JWT
        const jwt_token = signToken();
        res.json({ token: jwt_token, expiresIn: 86400 });

    } catch (error) {
        console.error("2FA setup error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 * POST /api/admin/verify-2fa
 * Step 2 (returning): Verify the TOTP code against the stored secret.
 *
 * Body: { password, token }
 */
router.post("/verify-2fa", async (req, res) => {
    try {
        const { password, token } = req.body;

        if (!password || !token) {
            return res.status(400).json({ message: "Password and token are required" });
        }

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const storedSecret = totp.getStoredSecret();
        if (!storedSecret) {
            return res.status(400).json({ message: "2FA is not set up" });
        }

        if (!totp.verifyToken(storedSecret, token)) {
            return res.status(401).json({ message: "Invalid verification code" });
        }

        // Issue JWT
        const jwt_token = signToken();
        res.json({ token: jwt_token, expiresIn: 86400 });

    } catch (error) {
        console.error("2FA verify error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
