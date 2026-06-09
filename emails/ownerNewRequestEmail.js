/**
 * Builds an owner-facing notification email when a new booking request arrives.
 * Uses the shared layout for visual consistency, single-language (English).
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, formatDate, tokens, iconCalendar, iconMoon, iconCard, iconPaypal, iconPhone, iconBell, iconBolt, iconMoney } = require('./emailLayout');

function buildOwnerNewRequestEmail({ guestName, guestEmail, guestPhone, checkInDate, checkOutDate, nights, totalPrice, comment, preferredPaymentMethod, adults, children, childrenAges }) {

    const phoneRow = guestPhone ? ['Phone', `${iconPhone()} ${guestPhone}`] : null;
    const paymentMethodRow = ['Payment Preference', preferredPaymentMethod === 'paypal' ? `${iconPaypal()} PayPal` : `${iconCard()} Stripe (Card)`];

    const commentRow = comment
        ? ['Comment', comment]
        : ['Comment', `<span style="color: ${tokens.lightGray}; font-style: italic;">—</span>`];

    const guestRows = [
        ['Name', guestName],
        ['Email', `<a href="mailto:${guestEmail}" style="color: ${tokens.coral}; text-decoration: none;">${guestEmail}</a>`],
        phoneRow,
        paymentMethodRow,
    ].filter(Boolean);

    const fmtIn = formatDate(checkInDate, 'en');
    const fmtOut = formatDate(checkOutDate, 'en');

    // Build guest count display
    const adultCount = adults || 1;
    const childCount = children || 0;
    const ages = childrenAges || [];
    let guestsDisplay = `${adultCount} Adult${adultCount !== 1 ? 's' : ''}`;
    if (childCount > 0) {
        guestsDisplay += `, ${childCount} Child${childCount !== 1 ? 'ren' : ''}`;
        if (ages.length > 0) {
            guestsDisplay += ` (age${ages.length !== 1 ? 's' : ''}: ${ages.join(', ')})`;
        }
    }

    const bookingRows = [
        ['Guests', `👥 ${guestsDisplay}`],
        ['Check-in', `${iconCalendar()} ${fmtIn}`],
        ['Check-out', `${iconCalendar()} ${fmtOut}`],
        ['Nights', `${iconMoon()} ${nights}`],
        ['Total Price', `${iconMoney()} €${totalPrice}`],
        ['Deposit (30%)', `€${Math.round(totalPrice * 0.3)}`],
        commentRow,
    ];

    // Section sub-heading helper
    const subHead = (text) => `<h3 style="margin: 24px 0 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: ${tokens.warmGray}; text-transform: uppercase; letter-spacing: 1px;">${text}</h3>`;

    const content = [
        sectionHeading(`${iconBell()} New Booking Request`),
        greeting(`A new booking request has been submitted by <strong>${guestName}</strong>. Please review and confirm or decline in the Admin Dashboard.`),
        subHead('Guest Details'),
        detailsCard({ accentColor: tokens.coral, rows: guestRows }),
        subHead('Booking Details'),
        detailsCard({ accentColor: tokens.gold, rows: bookingRows }),
        note(`${iconBolt()} <strong>Action required:</strong> Review this request in the <strong>Admin Dashboard</strong> and confirm or decline it.`),
    ].join('\n');

    const html = wrapEmail({ content, locale: 'en' });

    // Build guest count for plaintext
    let guestsText = `${adultCount} Adult${adultCount !== 1 ? 's' : ''}`;
    if (childCount > 0) {
        guestsText += `, ${childCount} Child${childCount !== 1 ? 'ren' : ''}`;
        if (ages.length > 0) {
            guestsText += ` (ages: ${ages.join(', ')})`;
        }
    }

    const text = [
        `NEW BOOKING REQUEST`,
        ``,
        `Guest: ${guestName}`,
        `Email: ${guestEmail}`,
        guestPhone ? `Phone: ${guestPhone}` : null,
        ``,
        `Guests: ${guestsText}`,
        `Check-in: ${fmtIn}`,
        `Check-out: ${fmtOut}`,
        `Nights: ${nights}`,
        `Total: €${totalPrice}`,
        `Deposit (30%): €${Math.round(totalPrice * 0.3)}`,
        comment ? `Comment: ${comment}` : null,
        ``,
        `→ Review this request in the Admin Dashboard.`,
    ].filter(Boolean).join("\n");

    const subject = `New Booking Request — ${guestName} · ${fmtIn} → ${fmtOut}`;

    return { subject, html, text };
}

module.exports = { buildOwnerNewRequestEmail };
