/**
 * Builds a localized (EN / CZ / ES) acknowledgment email
 * sent to the guest when they submit a booking request.
 *
 * @param {object} params
 * @param {string} params.locale  - 'en' | 'cs' | 'es' (default: 'en')
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, formatDate, tokens, iconCalendar, iconMoon, iconMail } = require('./emailLayout');

function buildBookingRequestEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Booking Request Received',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Thank you for your booking request! We have received your details and will review your reservation within <strong>24 hours</strong>.<br><br>Once confirmed, you will receive a separate email with the deposit payment link.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Estimated Total',
            noteText: 'No payment is required at this stage. We will contact you shortly.',
            subject: 'Booking Request Received — Paraíso',
            textGreeting: `Hi ${guestName},`,
            textBody: 'Thank you for your booking request! We will review it within 24 hours.',
            textNote: 'No payment is required at this stage.',
        },
        cs: {
            heading: 'Žádost o rezervaci přijata',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Děkujeme za vaši žádost o rezervaci! Přijali jsme vaše údaje a vaši rezervaci zkontrolujeme do <strong>24 hodin</strong>.<br><br>Po potvrzení obdržíte samostatný e-mail s odkazem na platbu zálohy.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Odhadovaná cena',
            noteText: 'V této fázi není vyžadována žádná platba. Brzy se vám ozveme.',
            subject: 'Žádost o rezervaci přijata — Paraíso',
            textGreeting: `Ahoj ${guestName},`,
            textBody: 'Děkujeme za žádost o rezervaci! Zkontrolujeme ji do 24 hodin.',
            textNote: 'V této fázi není vyžadována žádná platba.',
        },
        es: {
            heading: 'Solicitud de Reserva Recibida',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Gracias por tu solicitud de reserva! Hemos recibido tus datos y revisaremos tu reserva en un plazo de <strong>24 horas</strong>.<br><br>Una vez confirmada, recibirás un correo electrónico aparte con el enlace de pago del depósito.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio estimado',
            noteText: 'No se requiere ningún pago en esta etapa. Nos pondremos en contacto contigo pronto.',
            subject: 'Solicitud de Reserva Recibida — Paraíso',
            textGreeting: `Hola ${guestName},`,
            textBody: '¡Gracias por tu solicitud! La revisaremos en 24 horas.',
            textNote: 'No se requiere ningún pago en esta etapa.',
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.gold,
            rows: [
                [l.checkIn, `${iconCalendar(tokens.gold)} ${fmtIn}`],
                [l.checkOut, `${iconCalendar(tokens.gold)} ${fmtOut}`],
                [l.nights, `${iconMoon()} ${nights}`],
                [l.totalPrice, `€${totalPrice}`],
            ],
        }),
        note(`${iconMail()} ${l.noteText}`),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        l.textGreeting,
        l.textBody,
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice}`,
        l.textNote,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildBookingRequestEmail };
