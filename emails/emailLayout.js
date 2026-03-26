/**
 * Shared email layout module for Verónica's Flat — Paraíso booking system.
 *
 * Provides a consistent header (logo + brand), body wrapper, and footer
 * for all guest-facing and admin emails.
 *
 * Usage:
 *   const { wrapEmail, emailAttachments } = require('./emailLayout');
 *   const html = wrapEmail({ content: bodyHtml, locale: 'en' });
 *   // Pass emailAttachments to sendMail({ ..., attachments: emailAttachments })
 */

const path = require('path');

/* Logo embedded via CID so it works in all email clients */
const LOGO_CID = 'logo@veronicas-flat';
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo.png');

/** Nodemailer attachments array — include in every sendMail call */
const emailAttachments = [
    {
        filename: 'logo.png',
        path: LOGO_PATH,
        cid: LOGO_CID,
    },
];

/* ── Design tokens ────────────────────────────────────────────────── */
const tokens = {
    navy:      '#1B2B3A',
    cream:     '#FAF5F0',
    sand:      '#F5EDE4',
    gold:      '#C9A96E',
    coral:     '#E8845C',
    warmGray:  '#8B8680',
    lightGray: '#B8B3AE',
    white:     '#FFFFFF',
    bodyText:  '#3D3A37',
    success:   '#2D7A4F',
    danger:    '#A83232',
};

/* ── Localized footer strings ─────────────────────────────────────── */
const footerText = {
    en: { auto: 'This is an automated message', brand: 'Verónica\'s Flat · Playa Paraíso, Tenerife' },
    cs: { auto: 'Automatická zpráva',           brand: 'Verónica\'s Flat · Playa Paraíso, Tenerife' },
    es: { auto: 'Mensaje automático',            brand: 'Verónica\'s Flat · Playa Paraíso, Tenerife' },
};

/**
 * Wraps email body content in the shared layout shell.
 *
 * @param {object}  opts
 * @param {string}  opts.content   - Inner HTML body (greeting, details, CTA, etc.)
 * @param {string}  [opts.locale]  - 'en' | 'cs' | 'es'
 * @returns {string} Complete HTML email string
 */
function wrapEmail({ content, locale = 'en' }) {
    const ft = footerText[locale] || footerText.en;

    return `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verónica's Flat</title>
    <!--[if mso]>
    <style>table,td{font-family:Arial,sans-serif!important;}</style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #EDEBE8; -webkit-font-smoothing: antialiased;">
    <!-- Preheader spacer -->
    <div style="display: none; max-height: 0; overflow: hidden;">&nbsp;</div>

    <!-- Outer wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #EDEBE8;">
        <tr>
            <td align="center" style="padding: 32px 16px;">

                <!-- Email card -->
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: ${tokens.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

                    <!-- ═══ HEADER ═══ -->
                    <tr>
                        <td style="background-color: ${tokens.cream}; padding: 36px 32px 28px 32px; text-align: center;">
                            <!-- Logo -->
                            <img src="cid:${LOGO_CID}" alt="Verónica's Flat" width="80" height="80" style="display: block; margin: 0 auto 16px auto; width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                            <!-- Tagline -->
                            <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 13px; color: ${tokens.warmGray}; letter-spacing: 1.5px; text-transform: uppercase;">
                                Playa Paraíso · Tenerife
                            </p>
                        </td>
                    </tr>

                    <!-- Gold divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 2px; background: linear-gradient(90deg, transparent, ${tokens.gold}, transparent);"></div>
                        </td>
                    </tr>

                    <!-- ═══ BODY ═══ -->
                    <tr>
                        <td style="padding: 36px 40px 32px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: ${tokens.bodyText};">
                            ${content}
                        </td>
                    </tr>

                    <!-- ═══ FOOTER ═══ -->
                    <tr>
                        <td style="background-color: ${tokens.cream}; padding: 24px 32px; text-align: center; border-top: 1px solid #E8E4DF;">
                            <p style="margin: 0 0 4px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 13px; color: ${tokens.warmGray};">
                                ${ft.brand} 🌴
                            </p>
                            <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: ${tokens.lightGray};">
                                ${ft.auto}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/* ── Shared style helpers ─────────────────────────────────────────── */

/** Section heading (e.g. "Booking Details") */
function sectionHeading(text) {
    return `<h2 style="margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: ${tokens.navy}; letter-spacing: -0.3px;">${text}</h2>`;
}

/** Details card with configurable border accent */
function detailsCard({ rows, accentColor = tokens.gold }) {
    const rowsHtml = rows.map(([label, value, valueStyle]) => `
        <tr>
            <td style="padding: 8px 0; color: ${tokens.warmGray}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; width: 145px; vertical-align: top;">${label}</td>
            <td style="padding: 8px 0; color: ${tokens.navy}; font-size: 15px; font-weight: 600;${valueStyle ? ' ' + valueStyle : ''}">${value}</td>
        </tr>`).join('');

    return `<div style="background: ${tokens.sand}; border-radius: 12px; padding: 22px 24px; margin: 20px 0; border-left: 3px solid ${accentColor};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}
        </table>
    </div>`;
}

/** CTA button */
function ctaButton({ label, url, color = tokens.coral }) {
    return `<div style="text-align: center; margin: 28px 0 20px 0;">
        <a href="${url}" style="display: inline-block; background-color: ${color}; color: ${tokens.white}; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.4px;">${label}</a>
    </div>`;
}

/** Inline badge (e.g. "€210 PAID ✓") */
function badge({ text, bgColor = '#dcfce7', textColor = '#15803d' }) {
    return `<span style="display: inline-block; background: ${bgColor}; color: ${textColor}; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">${text}</span>`;
}

/** Note / info line */
function note(text) {
    return `<p style="color: ${tokens.warmGray}; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">${text}</p>`;
}

/** Greeting paragraph */
function greeting(text) {
    return `<p style="color: ${tokens.bodyText}; font-size: 15px; line-height: 1.65; margin: 0 0 24px 0;">${text}</p>`;
}

/* ── Locale-aware date helpers ────────────────────────────────────── */

const localeMap = { en: 'en-GB', cs: 'cs-CZ', es: 'es-ES' };

/**
 * Formats an ISO date string (e.g. "2026-04-15") into a beautiful
 * locale-aware format:
 *   EN → "15 April 2026"
 *   CS → "15. dubna 2026"
 *   ES → "15 de abril de 2026"
 */
function formatDate(isoDateStr, locale = 'en') {
    const intlLocale = localeMap[locale] || localeMap.en;
    const date = new Date(isoDateStr + 'T12:00:00Z'); // noon UTC avoids TZ edge cases
    return new Intl.DateTimeFormat(intlLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

module.exports = {
    wrapEmail,
    sectionHeading,
    detailsCard,
    ctaButton,
    badge,
    note,
    greeting,
    formatDate,
    tokens,
    emailAttachments,
};
