/**
 * Builds a localized (EN / CZ / ES) full payment email for last-minute bookings via PayPal.
 * Sent when check-in is <14 days away and full payment is required.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, formatDate, tokens, iconCalendar, iconMoon, iconPaypal, iconClock, iconEdit } = require('./emailLayout');

function buildPaypalFullPaymentEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Full Payment Required',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your booking has been confirmed! As your check-in is within 14 days, the full amount is required to secure your reservation. Please complete your payment via PayPal.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            amountDue: 'Amount Due',
            ctaLabel: `Pay €${totalPrice} via PayPal`,
            paypalNote: `${iconEdit()} <strong>Important:</strong> Please include your <strong>full name</strong> and <strong>check-in date (${checkInDate})</strong> in the PayPal payment note so we can identify your payment.`,
            deadline: `${iconClock()} <strong>Important:</strong> To keep your reservation active, this payment must be completed within <strong>48 hours</strong>. Unpaid reservations will be automatically cancelled.`,
            deadlineText: `Important: This payment must be completed within 48 hours, otherwise the reservation will be automatically cancelled.`,
            subject: `Full Payment €${totalPrice} via PayPal — Paraíso`,
        },
        cs: {
            heading: 'Požadována plná platba',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vaše rezervace byla potvrzena! Protože je příjezd do 14 dnů, je vyžadována plná platba pro zajištění rezervace. Prosím dokončete platbu přes PayPal.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            amountDue: 'K úhradě',
            ctaLabel: `Zaplatit €${totalPrice} přes PayPal`,
            paypalNote: `${iconEdit()} <strong>Důležité:</strong> Prosím uveďte své <strong>celé jméno</strong> a <strong>datum příjezdu (${checkInDate})</strong> do poznámky platby na PayPal, abychom mohli vaši platbu identifikovat.`,
            deadline: `${iconClock()} <strong>Upozornění:</strong> Pro zachování rezervace je nutné tuto platbu uhradit do <strong>48 hodin</strong>. Neuhrazené rezervace budou automaticky zrušeny.`,
            deadlineText: `Upozornění: Tato platba musí být uhrazena do 48 hodin, jinak bude rezervace automaticky zrušena.`,
            subject: `Plná platba €${totalPrice} přes PayPal — Paraíso`,
        },
        es: {
            heading: 'Pago Completo Requerido',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Tu reserva ha sido confirmada! Como tu entrada es en menos de 14 días, se requiere el pago completo para asegurar tu reserva. Por favor completa tu pago a través de PayPal.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            amountDue: 'Importe a pagar',
            ctaLabel: `Pagar €${totalPrice} por PayPal`,
            paypalNote: `${iconEdit()} <strong>Importante:</strong> Por favor incluye tu <strong>nombre completo</strong> y <strong>fecha de entrada (${checkInDate})</strong> en la nota de pago de PayPal para que podamos identificar tu pago.`,
            deadline: `${iconClock()} <strong>Aviso importante:</strong> Para mantener tu reserva activa, este pago debe completarse en un plazo de <strong>48 horas</strong>. Las reservas no pagadas se cancelarán automáticamente.`,
            deadlineText: `Aviso: Este pago debe completarse en un plazo de 48 horas, de lo contrario la reserva se cancelará automáticamente.`,
            subject: `Pago Completo €${totalPrice} por PayPal — Paraíso`,
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    const deadlineBox = `<div style="background: #FFF8F0; border: 1px solid ${tokens.coral}; border-radius: 12px; padding: 16px 20px; margin: 16px 0 4px 0;">
        <p style="color: ${tokens.navy}; font-size: 13px; line-height: 1.6; margin: 0;">${l.deadline}</p>
    </div>`;

    const paypalNoteBox = `<div style="background: #FFF9E6; border: 1px solid #F5C518; border-radius: 12px; padding: 16px 20px; margin: 16px 0 4px 0;">
        <p style="color: ${tokens.navy}; font-size: 13px; line-height: 1.6; margin: 0;">${l.paypalNote}</p>
    </div>`;

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.coral,
            rows: [
                [l.checkIn, `${iconCalendar()} ${fmtIn}`],
                [l.checkOut, `${iconCalendar()} ${fmtOut}`],
                [l.nights, `${iconMoon()} ${nights}`],
                [l.totalPrice, `€${totalPrice}`],
                [l.amountDue, `€${totalPrice}`, `color: ${tokens.coral}; font-size: 17px; font-weight: 700;`],
            ],
        }),
        ctaButton({ label: `${iconPaypal('#FFFFFF')} ${l.ctaLabel}`, url: paymentUrl, color: '#003087' }),
        paypalNoteBox,
        deadlineBox,
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        `${l.greeting.replace(/<[^>]*>/g, '')}`,
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice}`,
        `Pay via PayPal: ${paymentUrl}`,
        ``,
        l.deadlineText,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildPaypalFullPaymentEmail };
