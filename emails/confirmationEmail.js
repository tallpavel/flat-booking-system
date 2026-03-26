/**
 * Builds a localized (EN / CZ / ES) confirmation email
 * with the Stripe payment link.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, tokens } = require('./emailLayout');

function buildConfirmationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Booking Confirmed',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Great news! Your reservation has been confirmed. To secure your dates, please pay the deposit below.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price', deposit: 'Deposit (30%)',
            ctaLabel: `Pay €${depositAmount} Deposit`,
            remaining: `💡 <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.`,
            subject: `✅ Booking Confirmed — Pay Your Deposit`,
        },
        cs: {
            heading: 'Rezervace potvrzena',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Skvělá zpráva! Vaše rezervace byla potvrzena. Pro zajištění termínu prosím uhraďte zálohu níže.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena', deposit: 'Záloha (30%)',
            ctaLabel: `Zaplatit zálohu €${depositAmount}`,
            remaining: `💡 <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.`,
            subject: `✅ Rezervace potvrzena — Zaplaťte zálohu`,
        },
        es: {
            heading: 'Reserva Confirmada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Buenas noticias! Tu reserva ha sido confirmada. Para asegurar tus fechas, por favor realiza el pago del depósito a continuación.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total', deposit: 'Depósito (30%)',
            ctaLabel: `Pagar depósito de €${depositAmount}`,
            remaining: `💡 <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.`,
            subject: `✅ Reserva Confirmada — Paga tu depósito`,
        },
    };

    const l = t[locale] || t.en;

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.coral,
            rows: [
                [l.checkIn, `📅 ${checkInDate}`],
                [l.checkOut, `📅 ${checkOutDate}`],
                [l.nights, `🌙 ${nights}`],
                [l.totalPrice, `€${totalPrice}`],
                [l.deposit, `€${depositAmount}`, `color: ${tokens.coral}; font-size: 17px; font-weight: 700;`],
            ],
        }),
        ctaButton({ label: `💳 ${l.ctaLabel}`, url: paymentUrl }),
        note(l.remaining),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        `${l.greeting.replace(/<[^>]*>/g, '')}`,
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice} · ${l.deposit}: €${depositAmount}`,
        `Pay here: ${paymentUrl}`,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildConfirmationEmail };
