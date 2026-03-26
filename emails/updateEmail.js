/**
 * Builds a localized (EN / CZ / ES) reservation update email.
 * Shows what changed (old → new values).
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, tokens } = require('./emailLayout');

function buildUpdateEmail({ guestName, changes, checkInDate, checkOutDate, nights, totalPrice, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Reservation Updated',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your reservation has been updated. Please review the changes below.`,
            changesTitle: 'What Changed',
            summaryTitle: 'Updated Booking',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            subject: `📝 Reservation Updated — ${checkInDate} → ${checkOutDate}`,
        },
        cs: {
            heading: 'Rezervace aktualizována',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vaše rezervace byla aktualizována. Zkontrolujte prosím změny níže.`,
            changesTitle: 'Co se změnilo',
            summaryTitle: 'Aktualizovaná rezervace',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            subject: `📝 Rezervace aktualizována — ${checkInDate} → ${checkOutDate}`,
        },
        es: {
            heading: 'Reserva Actualizada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>Tu reserva ha sido actualizada. Por favor revisa los cambios a continuación.`,
            changesTitle: 'Qué cambió',
            summaryTitle: 'Reserva actualizada',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            subject: `📝 Reserva Actualizada — ${checkInDate} → ${checkOutDate}`,
        },
    };

    const l = t[locale] || t.en;

    // Build changes section
    let changesHtml = '';
    if (changes && changes.length > 0) {
        const changeRows = changes.map(c => [
            c.field,
            `<span style="color: ${tokens.danger}; text-decoration: line-through; font-size: 13px;">${c.from}</span>
             <span style="color: ${tokens.warmGray}; padding: 0 6px;">→</span>
             <span style="color: ${tokens.success}; font-weight: 700; font-size: 15px;">${c.to}</span>`
        ]);
        changesHtml = detailsCard({ accentColor: tokens.gold, rows: changeRows });
    }

    // Build changes sub-heading
    const changesSection = changesHtml
        ? `<h3 style="margin: 24px 0 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: ${tokens.warmGray}; text-transform: uppercase; letter-spacing: 1px;">${l.changesTitle}</h3>${changesHtml}`
        : '';

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        changesSection,
        `<h3 style="margin: 24px 0 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: ${tokens.warmGray}; text-transform: uppercase; letter-spacing: 1px;">${l.summaryTitle}</h3>`,
        detailsCard({
            accentColor: tokens.gold,
            rows: [
                [l.checkIn, `📅 ${checkInDate}`],
                [l.checkOut, `📅 ${checkOutDate}`],
                [l.nights, `🌙 ${nights}`],
                [l.totalPrice, `€${totalPrice}`],
            ],
        }),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const changesText = changes.map(c => `  ${c.field}: ${c.from} → ${c.to}`).join("\n");
    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        changesText,
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights} · €${totalPrice}`,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildUpdateEmail };
