const express = require("express");
const router = express.Router();
const { getTransporter } = require("../config/mailer");
const { verifyTurnstile } = require("../config/turnstile");

// ── POST /api/contact — Receive a contact form message ────────────────
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, message, turnstileToken } = req.body;

        // ── Turnstile bot protection ──────────────────────────────────
        const turnstileResult = await verifyTurnstile(turnstileToken, req.ip);
        if (!turnstileResult.success) {
            return res.status(403).json({ message: turnstileResult.error });
        }

        // Basic validation
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Build the email
        const mailOptions = {
            from: `"Verónica's Flat Website" <${process.env.EMAIL_USER}>`,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            replyTo: email.trim(),
            subject: `📩 New inquiry from ${name.trim()} — Verónica's Flat`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0c4a6e, #0ea5e9); padding: 24px 32px; border-radius: 12px 12px 0 0;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">🏠 New Contact Form Message</h2>
                    </div>
                    <div style="background: #f8fafc; padding: 24px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600; width: 100px;">Name</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 15px;">${name.trim()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Email</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 15px;">
                                    <a href="mailto:${email.trim()}" style="color: #0ea5e9;">${email.trim()}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Phone</td>
                                <td style="padding: 8px 0; color: #1e293b; font-size: 15px;">${phone ? phone.trim() : "—"}</td>
                            </tr>
                        </table>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                        <div style="color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</div>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            Sent from the Verónica's Flat website contact form · ${new Date().toLocaleString("en-GB", { timeZone: "Atlantic/Canary" })}
                        </p>
                    </div>
                </div>
            `,
            text: `New contact form message\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nPhone: ${phone ? phone.trim() : "N/A"}\n\nMessage:\n${message.trim()}`,
        };

        await getTransporter().sendMail(mailOptions);

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("❌ Error sending contact email:", error.message);
        res.status(500).json({
            message: "Failed to send message. Please try again later.",
            error: error.message,
        });
    }
});

module.exports = router;
