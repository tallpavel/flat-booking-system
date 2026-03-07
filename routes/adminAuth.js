const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/authMiddleware");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "paraiso2026";

/**
 * POST /api/admin/login
 * Validates admin password and returns a signed JWT.
 */
router.post("/login", async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Sign a JWT valid for 24 hours
        const token = jwt.sign(
            { role: "admin", iat: Math.floor(Date.now() / 1000) },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token, expiresIn: 86400 });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
