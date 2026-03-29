/**
 * Builds a localized (EN / CZ / ES) confirmation email
 * with a PayPal.me payment link (deposit).
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, formatDate, tokens, iconCalendar, iconMoon, iconPaypal, iconTip, iconClock, iconEdit } = require('./emailLayout');

function buildPaypalConfirmationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Booking Confirmed',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Great news! Your reservation has been confirmed. To secure your dates, please pay the deposit via PayPal below.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price', deposit: 'Deposit (30%)',
            ctaLabel: `Pay €${depositAmount} via PayPal`,
            remaining: `${iconTip()} <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.`,
            paypalNote: `${iconEdit()} <strong>Important:</strong> Please include your <strong>full name</strong> and <strong>check-in date (${checkInDate})</strong> in the PayPal payment note so we can identify your payment.`,
            deadline: `${iconClock()} <strong>Please note:</strong> To keep your reservation active, the deposit must be completed within <strong>48 hours</strong>. Unpaid reservations will be automatically cancelled to ensure availability for all guests.`,
            deadlineText: `Please note: The deposit must be paid within 48 hours, otherwise the reservation will be automatically cancelled.`,
            subject: `✅ Booking Confirmed — Pay Your Deposit via PayPal`,
        },
        cs: {
            heading: 'Rezervace potvrzena',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Skvělá zpráva! Vaše rezervace byla potvrzena. Pro zajištění termínu prosím uhraďte zálohu přes PayPal níže.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena', deposit: 'Záloha (30%)',
            ctaLabel: `Zaplatit zálohu €${depositAmount} přes PayPal`,
            remaining: `${iconTip()} <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.`,
            paypalNote: `${iconEdit()} <strong>Důležité:</strong> Prosím uveďte své <strong>celé jméno</strong> a <strong>datum příjezdu (${checkInDate})</strong> do poznámky platby na PayPal, abychom mohli vaši platbu identifikovat.`,
            deadline: `${iconClock()} <strong>Upozornění:</strong> Pro zachování rezervace je nutné uhradit zálohu do <strong>48 hodin</strong>. Neuhrazené rezervace budou automaticky zrušeny, aby byla zajištěna dostupnost pro všechny hosty.`,
            deadlineText: `Upozornění: Záloha musí být uhrazena do 48 hodin, jinak bude rezervace automaticky zrušena.`,
            subject: `✅ Rezervace potvrzena — Zaplaťte zálohu přes PayPal`,
        },
        es: {
            heading: 'Reserva Confirmada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Buenas noticias! Tu reserva ha sido confirmada. Para asegurar tus fechas, por favor realiza el pago del depósito a través de PayPal a continuación.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total', deposit: 'Depósito (30%)',
            ctaLabel: `Pagar depósito de €${depositAmount} por PayPal`,
            remaining: `${iconTip()} <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.`,
            paypalNote: `${iconEdit()} <strong>Importante:</strong> Por favor incluye tu <strong>nombre completo</strong> y <strong>fecha de entrada (${checkInDate})</strong> en la nota de pago de PayPal para que podamos identificar tu pago.`,
            deadline: `${iconClock()} <strong>Aviso importante:</strong> Para mantener tu reserva activa, el depósito debe completarse en un plazo de <strong>48 horas</strong>. Las reservas no pagadas se cancelarán automáticamente para garantizar la disponibilidad para todos los huéspedes.`,
            deadlineText: `Aviso: El depósito debe pagarse en un plazo de 48 horas, de lo contrario la reserva se cancelará automáticamente.`,
            subject: `✅ Reserva Confirmada — Paga tu depósito por PayPal`,
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
                [l.deposit, `€${depositAmount}`, `color: ${tokens.coral}; font-size: 17px; font-weight: 700;`],
            ],
        }),
        ctaButton({ label: `${iconPaypal('#FFFFFF')} ${l.ctaLabel}`, url: paymentUrl, color: '#003087' }),
        paypalNoteBox,
        deadlineBox,
        note(l.remaining),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        `${l.greeting.replace(/<[^>]*>/g, '')}`,
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice} · ${l.deposit}: €${depositAmount}`,
        `Pay via PayPal: ${paymentUrl}`,
        ``,
        l.deadlineText,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildPaypalConfirmationEmail };
