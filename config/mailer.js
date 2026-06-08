const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// ── Microsoft Graph API mailer (OAuth2 / Modern Auth) ─────────────────
// Uses client credentials flow — no user interaction needed.
// Requires an Azure AD (Entra ID) app registration with Mail.Send permission.

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Fetch an OAuth2 access token using client credentials flow.
 */
async function getAccessToken() {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) return cachedToken;

    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
    });

    const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to get Azure token: ${resp.status} ${err}`);
    }

    const data = await resp.json();
    cachedToken = data.access_token;
    tokenExpiry = now + (data.expires_in - 60) * 1000; // refresh 60s before expiry
    return cachedToken;
}

/**
 * Send an email via Microsoft Graph API.
 * Accepts the same mailOptions shape as nodemailer's sendMail().
 */
async function sendMailViaGraph(mailOptions) {
    const token = await getAccessToken();
    const fromEmail = process.env.EMAIL_USER;

    // Build recipients
    const toRecipients = (Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to])
        .map(addr => ({ emailAddress: { address: addr.trim() } }));

    // Build the Graph API message payload
    const message = {
        subject: mailOptions.subject,
        body: {
            contentType: mailOptions.html ? "HTML" : "Text",
            content: mailOptions.html || mailOptions.text || "",
        },
        from: {
            emailAddress: { address: fromEmail },
        },
        toRecipients,
    };

    // Add replyTo if present
    if (mailOptions.replyTo) {
        message.replyTo = [
            { emailAddress: { address: mailOptions.replyTo.trim() } },
        ];
    }

    // Add attachments (e.g., inline CID logos)
    if (mailOptions.attachments && mailOptions.attachments.length > 0) {
        message.hasAttachments = true;
        message.attachments = mailOptions.attachments.map(att => {
            const contentBytes = fs.readFileSync(att.path).toString("base64");
            
            // Determine content type roughly based on extension
            const ext = path.extname(att.filename || att.path).toLowerCase();
            let contentType = "application/octet-stream";
            if (ext === ".png") contentType = "image/png";
            if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
            if (ext === ".pdf") contentType = "application/pdf";
            
            const attachment = {
                "@odata.type": "#microsoft.graph.fileAttachment",
                name: att.filename || path.basename(att.path),
                contentType: att.contentType || contentType,
                contentBytes,
                isInline: !!att.cid
            };
            
            if (att.cid) {
                attachment.contentId = att.cid;
            }
            
            return attachment;
        });
    }

    const url = `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`;
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, saveToSentItems: true }),
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Graph API sendMail failed: ${resp.status} ${err}`);
    }

    return { messageId: `graph-${Date.now()}`, accepted: [mailOptions.to] };
}

// ── Transporter wrapper ───────────────────────────────────────────────
// Provides a unified .sendMail() interface regardless of backend.

let transporter = null;

function getTransporter() {
    // If Azure credentials are configured, use Graph API
    if (process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
        return { sendMail: sendMailViaGraph };
    }

    // Otherwise fall back to SMTP (Gmail or custom)
    if (!transporter) {
        const smtpHost = process.env.SMTP_HOST;

        if (smtpHost) {
            transporter = nodemailer.createTransport({
                host: smtpHost,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }
    }
    return transporter;
}

module.exports = { getTransporter };
