/**
 * Builds an owner-facing notification email when a new booking request arrives.
 * Uses the shared layout for visual consistency, single-language (English).
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, tokens } = require('./emailLayout');

function buildOwnerNewRequestEmail({ guestName, guestEmail, guestPhone, checkInDate, checkOutDate, nights, totalPrice, comment }) {

    const phoneRow = guestPhone ? ['Phone', `📞 ${guestPhone}`] : null;
    const commentRow = comment
        ? ['Comment', comment]
        : ['Comment', `<span style="color: ${tokens.lightGray}; font-style: italic;">—</span>`];

    const guestRows = [
        ['Name', guestName],
        ['Email', `<a href="mailto:${guestEmail}" style="color: ${tokens.coral}; text-decoration: none;">${guestEmail}</a>`],
        phoneRow,
    ].filter(Boolean);

    const bookingRows = [
        ['Check-in', `📅 ${checkInDate}`],
        ['Check-out', `📅 ${checkOutDate}`],
        ['Nights', `🌙 ${nights}`],
        ['Total Price', `💰 €${totalPrice}`],
        ['Deposit (30%)', `€${Math.round(totalPrice * 0.3)}`],
        commentRow,
    ];

    // Section sub-heading helper
    const subHead = (text) => `<h3 style="margin: 24px 0 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: ${tokens.warmGray}; text-transform: uppercase; letter-spacing: 1px;">${text}</h3>`;

    const content = [
        sectionHeading('🔔 New Booking Request'),
        greeting(`A new booking request has been submitted by <strong>${guestName}</strong>. Please review and confirm or decline in the Admin Dashboard.`),
        subHead('Guest Details'),
        detailsCard({ accentColor: tokens.coral, rows: guestRows }),
        subHead('Booking Details'),
        detailsCard({ accentColor: tokens.gold, rows: bookingRows }),
        note('⚡ <strong>Action required:</strong> Review this request in the <strong>Admin Dashboard</strong> and confirm or decline it.'),
    ].join('\n');

    const html = wrapEmail({ content, locale: 'en' });

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
