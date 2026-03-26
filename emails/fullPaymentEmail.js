/**
 * Builds a localized (EN / CZ / ES) full payment email for last-minute bookings.
 * Sent when check-in is <14 days away and full payment is required.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, formatDate, tokens } = require('./emailLayout');

function buildFullPaymentEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Full Payment Required',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your booking has been confirmed! As your check-in is within 14 days, the full amount is required to secure your reservation.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            amountDue: 'Amount Due',
            ctaLabel: `Pay €${totalPrice}`,
            noteText: 'If you have any questions, please don\'t hesitate to contact us.',
            deadline: `⏳ <strong>Important:</strong> To keep your reservation active, this payment must be completed within <strong>48 hours</strong>. Unpaid reservations will be automatically cancelled.`,
            deadlineText: `⏳ Important: This payment must be completed within 48 hours, otherwise the reservation will be automatically cancelled.`,
            subject: `💳 Full Payment €${totalPrice} — Paraíso`,
        },
        cs: {
            heading: 'Požadována plná platba',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vaše rezervace byla potvrzena! Protože je příjezd do 14 dnů, je vyžadována plná platba pro zajištění rezervace.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            amountDue: 'K úhradě',
            ctaLabel: `Zaplatit €${totalPrice}`,
            noteText: '💡 Máte-li jakékoliv dotazy, neváhejte nás kontaktovat.',
            deadline: `⏳ <strong>Upozornění:</strong> Pro zachování rezervace je nutné tuto platbu uhradit do <strong>48 hodin</strong>. Neuhrazené rezervace budou automaticky zrušeny.`,
            deadlineText: `⏳ Upozornění: Tato platba musí být uhrazena do 48 hodin, jinak bude rezervace automaticky zrušena.`,
            subject: `💳 Plná platba €${totalPrice} — Paraíso`,
        },
        es: {
            heading: 'Pago Completo Requerido',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Tu reserva ha sido confirmada! Como tu llegada es en menos de 14 días, se requiere el pago completo para asegurar tu reserva.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            amountDue: 'A pagar',
            ctaLabel: `Pagar €${totalPrice}`,
            noteText: '💡 Si tienes alguna pregunta, no dudes en contactarnos.',
            deadline: `⏳ <strong>Aviso importante:</strong> Para mantener tu reserva activa, este pago debe completarse en un plazo de <strong>48 horas</strong>. Las reservas no pagadas se cancelarán automáticamente.`,
            deadlineText: `⏳ Aviso: Este pago debe completarse en un plazo de 48 horas, de lo contrario la reserva se cancelará automáticamente.`,
            subject: `💳 Pago Completo €${totalPrice} — Paraíso`,
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.coral,
            rows: [
                [l.checkIn, `📅 ${fmtIn}`],
                [l.checkOut, `📅 ${fmtOut}`],
                [l.nights, `🌙 ${nights}`],
                [l.totalPrice, `€${totalPrice}`],
                [l.amountDue, `€${totalPrice}`, `color: ${tokens.coral}; font-size: 17px; font-weight: 700;`],
            ],
        }),
        ctaButton({ label: `💳 ${l.ctaLabel}`, url: paymentUrl }),
        // 48-hour deadline callout box
        `<div style="background: #FFF8F0; border: 1px solid ${tokens.coral}; border-radius: 12px; padding: 16px 20px; margin: 16px 0 4px 0;">
            <p style="color: ${tokens.navy}; font-size: 13px; line-height: 1.6; margin: 0;">${l.deadline}</p>
        </div>`,
        note(l.noteText),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice}`,
        `${l.amountDue}: €${totalPrice}`,
        `Pay here: ${paymentUrl}`,
        l.deadlineText,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildFullPaymentEmail };
