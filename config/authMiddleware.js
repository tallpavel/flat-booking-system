const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "paraiso-admin-secret-key";

/**
 * Express middleware — verifies JWT from Authorization header.
 * Attach to any route that requires admin authentication.
 */
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = { requireAdmin, JWT_SECRET };
