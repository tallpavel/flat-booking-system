/**
 * Builds an owner-facing notification email when a new booking request arrives.
 * Simple, information-dense, single-language (English) — this is an internal alert.
 *
 * Returns { subject, html, text }
 */
function buildOwnerNewRequestEmail({ guestName, guestEmail, guestPhone, checkInDate, checkOutDate, nights, totalPrice, comment }) {

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        label:    'style="padding: 6px 0; color: #64748b; font-size: 13px; width: 130px; vertical-align: top;"',
        value:    'style="padding: 6px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        muted:    'style="color: #94a3b8; font-size: 13px; font-style: italic;"',
    };

    const phoneRow = guestPhone
        ? `<tr><td ${s.label}>Phone</td><td ${s.value}>📞 ${guestPhone}</td></tr>`
        : '';

    const commentRow = comment
        ? `<tr><td ${s.label}>Comment</td><td ${s.value}>${comment}</td></tr>`
        : `<tr><td ${s.label}>Comment</td><td ${s.muted}>—</td></tr>`;

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 28px 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 22px; font-weight: 700;">🔔 New Booking Request</h1>
                <p style="color: #e9d5ff; margin: 0; font-size: 14px;">Someone wants to book Paraíso!</p>
            </div>

            <!-- Body -->
            <div style="padding: 28px 32px; border: 1px solid #e2e8f0; border-top: none;">
                <!-- Guest info -->
                <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #6b21a8; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Guest Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>Name</td><td ${s.value}>${guestName}</td></tr>
                        <tr><td ${s.label}>Email</td><td ${s.value}><a href="mailto:${guestEmail}" style="color: #7c3aed; text-decoration: none;">${guestEmail}</a></td></tr>
                        ${phoneRow}
                    </table>
                </div>

                <!-- Booking details -->
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #0c4a6e; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>Check-in</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                        <tr><td ${s.label}>Check-out</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                        <tr><td ${s.label}>Nights</td><td ${s.value}>🌙 ${nights}</td></tr>
                        <tr><td ${s.label}>Total Price</td><td ${s.value}>💰 €${totalPrice}</td></tr>
                        <tr><td ${s.label}>Deposit (30%)</td><td ${s.value}>€${Math.round(totalPrice * 0.3)}</td></tr>
                        ${commentRow}
                    </table>
                </div>

                <!-- Action reminder -->
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                    ⚡ <strong>Action required:</strong> Review this request in the <strong>Admin Dashboard</strong> and confirm or decline it.
                </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 16px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Owner Notification 🔔
                </p>
            </div>
        </div>
    `;

    const text = [
        `🔔 NEW BOOKING REQUEST`,
        ``,
        `Guest: ${guestName}`,
        `Email: ${guestEmail}`,
        guestPhone ? `Phone: ${guestPhone}` : null,
        ``,
        `Check-in: ${checkInDate}`,
        `Check-out: ${checkOutDate}`,
        `Nights: ${nights}`,
        `Total: €${totalPrice}`,
        `Deposit (30%): €${Math.round(totalPrice * 0.3)}`,
        comment ? `Comment: ${comment}` : null,
        ``,
        `→ Review this request in the Admin Dashboard.`,
    ].filter(Boolean).join("\n");

    const subject = `🔔 New Booking Request — ${guestName} · ${checkInDate} → ${checkOutDate}`;

    return { subject, html, text };
}

module.exports = { buildOwnerNewRequestEmail };
