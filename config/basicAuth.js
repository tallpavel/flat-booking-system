/**
 * HTTP Basic Authentication middleware.
 *
 * When enabled (BASIC_AUTH_USER + BASIC_AUTH_PASS are set in .env),
 * every request must include valid credentials — browsers will show
 * the native username / password dialog automatically.
 *
 * Skipped paths (e.g. Stripe webhooks) can be configured below.
 */

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS;

/** Paths that should bypass basic auth (e.g. external webhooks). */
const SKIP_PATHS = ["/api/stripe"];

function basicAuth(req, res, next) {
    // If credentials are not configured, skip this middleware entirely
    if (!BASIC_AUTH_USER || !BASIC_AUTH_PASS) {
        return next();
    }

    // Allow certain paths through without auth (webhooks, health-checks, etc.)
    if (SKIP_PATHS.some((p) => req.path.startsWith(p))) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.set("WWW-Authenticate", 'Basic realm="Flat Booking System"');
        return res.status(401).send("Authentication required");
    }

    // Decode Base64  →  "user:pass"
    const base64 = authHeader.split(" ")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [user, ...passParts] = decoded.split(":");
    const pass = passParts.join(":"); // handle passwords that contain ":"

    if (user === BASIC_AUTH_USER && pass === BASIC_AUTH_PASS) {
        return next();
    }

    res.set("WWW-Authenticate", 'Basic realm="Flat Booking System"');
    return res.status(401).send("Invalid credentials");
}

module.exports = basicAuth;
