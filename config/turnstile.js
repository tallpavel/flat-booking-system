/**
 * Cloudflare Turnstile server-side verification.
 *
 * Validates the token sent by the frontend against Cloudflare's API.
 * Uses TURNSTILE_SECRET_KEY from .env (falls back to test key in dev).
 *
 * SECURITY POLICY:
 * - Token PRESENT → verified against Cloudflare; fails closed on invalid/error.
 * - Token MISSING → allowed with warning. The frontend degrades gracefully when
 *   Turnstile is unavailable (widget errors, Cloudflare outages). Honeypot and
 *   timing checks on the frontend still provide bot protection.
 *   Reservation requests are manually reviewed before confirmation anyway.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Test secret key — always passes. Replace via .env for production.
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

/**
 * Verify a Turnstile token with Cloudflare.
 *
 * @param {string|undefined} token - The turnstile token from the client
 * @param {string|undefined} remoteIp - Optional client IP for extra validation
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function verifyTurnstile(token, remoteIp) {
    const secretKey = process.env.TURNSTILE_SECRET_KEY || TEST_SECRET_KEY;

    // If no secret key is configured and we're using the test key, skip in dev
    if (secretKey === TEST_SECRET_KEY && process.env.NODE_ENV === "development") {
        console.log("⚠️  Turnstile: using test key — skipping verification in dev");
        return { success: true };
    }

    // Token missing — allow but log warning (frontend degraded gracefully)
    if (!token) {
        console.warn("⚠️  Turnstile: no token provided — allowing request (frontend degraded). IP:", remoteIp || "unknown");
        return { success: true };
    }

    try {
        const body = { secret: secretKey, response: token };
        if (remoteIp) body.remoteip = remoteIp;

        console.log(`🔑 Turnstile: verifying token (${token.substring(0, 20)}...) from IP ${remoteIp || "unknown"}`);

        const res = await fetch(TURNSTILE_VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!data.success) {
            console.warn("🚫 Turnstile verification failed:", JSON.stringify({
                errorCodes: data["error-codes"],
                hostname: data.hostname,
                action: data.action,
            }));
            return { success: false, error: "Security verification failed. Please try again." };
        }

        console.log("✅ Turnstile: token verified successfully");
        return { success: true };
    } catch (err) {
        // FAIL CLOSED — reject on network errors when token WAS provided
        console.error("❌ Turnstile verification error:", err.message);
        return { success: false, error: "Security verification unavailable. Please try again later." };
    }
}

module.exports = { verifyTurnstile };
