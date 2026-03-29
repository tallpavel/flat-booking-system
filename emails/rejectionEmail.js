/**
 * Builds a localized (EN / CZ / ES) rejection notification email
 * for initial booking requests.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, formatDate, tokens, iconCalendar, iconMoon, iconCancel } = require('./emailLayout');

function buildRejectionEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, locale = 'en', reason = '' }) {

    const t = {
        en: {
            heading: 'Booking Request Update',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Thank you for your interest in Verónica's Flat. We've reviewed your booking request, but unfortunately, we are unable to accommodate you at this time.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            reasonLabel: 'Reason',
            helpText: 'We apologize for any inconvenience. We hope to have the chance to host you in the future!',
            subject: `Update on your Booking Request — ${checkInDate}`,
        },
        cs: {
            heading: 'Aktualizace žádosti o rezervaci',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Děkujeme za Váš zájem o apartmán Verónica's Flat. Prověřili jsme Vaši žádost o rezervaci, ale bohužel Vám v tomto termínu nemůžeme vyhovět.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            reasonLabel: 'Důvod',
            helpText: 'Omlouváme se za případné nepříjemnosti. Doufáme, že Vás budeme moci ubytovat jindy!',
            subject: `Aktualizace Vaší žádosti o rezervaci — ${checkInDate}`,
        },
        es: {
            heading: 'Actualización de Solicitud de Reserva',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>Gracias por tu interés en el apartamento de Verónica. Hemos revisado tu solicitud de reserva, pero lamentablemente no podemos atenderte en esta ocasión.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            reasonLabel: 'Motivo',
            helpText: 'Lamentamos cualquier inconveniente. ¡Esperamos tener la oportunidad de alojarte en el futuro!',
            subject: `Actualización de su Solicitud de Reserva — ${checkInDate}`,
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    const detailRows = [
        [l.checkIn, `${iconCalendar(tokens.danger)} ${fmtIn}`, `text-decoration: line-through; color: ${tokens.danger};`],
        [l.checkOut, `${iconCalendar(tokens.danger)} ${fmtOut}`, `text-decoration: line-through; color: ${tokens.danger};`],
        [l.nights, `${iconMoon(tokens.danger)} ${nights}`, `text-decoration: line-through; color: ${tokens.danger};`],
    ];

    // Add reason row if provided
    if (reason && reason.trim()) {
        detailRows.push([l.reasonLabel, reason.trim(), `color: ${tokens.danger}; font-style: italic;`]);
    }

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.danger,
            rows: detailRows,
        }),
        note(l.helpText),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const textParts = [
        l.greeting.replace(/<[^>]*>/g, ''),
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
    ];
    if (reason && reason.trim()) {
        textParts.push(`${l.reasonLabel}: ${reason.trim()}`);
    }
    textParts.push(l.helpText, ``, `— Verónica's Flat, Playa Paraíso`);

    const text = textParts.join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildRejectionEmail };
