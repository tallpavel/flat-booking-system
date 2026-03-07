const nodemailer = require("nodemailer");

// ── Lazy-initialised Gmail SMTP transporter ───────────────────────────
// Created on first use so that dotenv has already loaded the env vars.
let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Gmail App Password
            },
        });
    }
    return transporter;
}

module.exports = { getTransporter };
