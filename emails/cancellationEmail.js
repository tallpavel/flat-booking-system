/**
 * Builds a localized (EN / CZ / ES) cancellation notification email.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, formatDate, tokens } = require('./emailLayout');

function buildCancellationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Reservation Cancelled',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>We're sorry to inform you that your reservation has been cancelled.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            helpText: 'If you have any questions or would like to rebook, please don\'t hesitate to contact us.',
            subject: `❌ Reservation Cancelled — ${checkInDate} → ${checkOutDate}`,
        },
        cs: {
            heading: 'Rezervace zrušena',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>S lítostí Vám oznamujeme, že Vaše rezervace byla zrušena.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            helpText: 'Pokud máte jakékoliv dotazy nebo si přejete znovu rezervovat, neváhejte nás kontaktovat.',
            subject: `❌ Rezervace zrušena — ${checkInDate} → ${checkOutDate}`,
        },
        es: {
            heading: 'Reserva Cancelada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>Lamentamos informarte que tu reserva ha sido cancelada.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            helpText: 'Si tienes alguna pregunta o deseas volver a reservar, no dudes en contactarnos.',
            subject: `❌ Reserva Cancelada — ${checkInDate} → ${checkOutDate}`,
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.danger,
            rows: [
                [l.checkIn, `📅 ${fmtIn}`, `text-decoration: line-through; color: ${tokens.danger};`],
                [l.checkOut, `📅 ${fmtOut}`, `text-decoration: line-through; color: ${tokens.danger};`],
                [l.nights, `🌙 ${nights}`, `text-decoration: line-through; color: ${tokens.danger};`],
                [l.totalPrice, `€${totalPrice}`, `text-decoration: line-through; color: ${tokens.danger};`],
            ],
        }),
        note(l.helpText),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice}`,
        l.helpText,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildCancellationEmail };
