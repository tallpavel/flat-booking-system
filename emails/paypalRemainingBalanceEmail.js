/**
 * Builds a localized (EN / CZ / ES) remaining balance payment email via PayPal.
 * Sent when the owner requests payment of the remaining balance through PayPal.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, formatDate, tokens, iconCalendar, iconMoon, iconPaypal, iconTip, iconClock, iconEdit } = require('./emailLayout');

function buildPaypalRemainingBalanceEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Remaining Balance',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Thank you for your deposit! To complete your booking payment, please pay the remaining balance via PayPal below.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            depositPaid: 'Deposit Paid', remaining: 'Remaining',
            ctaLabel: `Pay Remaining €${remainingBalance} via PayPal`,
            noteText: `${iconTip()} You can also pay the remaining balance in cash on arrival.`,
            paypalNote: `${iconEdit()} <strong>Important:</strong> Please include your <strong>full name</strong> and <strong>check-in date (${checkInDate})</strong> in the PayPal payment note so we can identify your payment.`,
            deadline: `${iconClock()} <strong>Important:</strong> To keep your reservation active, this payment must be completed within <strong>48 hours</strong>. Unpaid reservations will be automatically cancelled, and the deposit will be handled according to our cancellation policy.`,
            deadlineText: `Important: This payment must be completed within 48 hours, otherwise the reservation will be automatically cancelled.`,
            subject: `Remaining Balance €${remainingBalance} via PayPal — Paraíso`,
        },
        cs: {
            heading: 'Zbývající částka',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Děkujeme za zálohu! Pro dokončení platby prosím uhraďte zbývající částku přes PayPal níže.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            depositPaid: 'Zaplacená záloha', remaining: 'Zbývá',
            ctaLabel: `Zaplatit zbývajících €${remainingBalance} přes PayPal`,
            noteText: `${iconTip()} Zbývající částku můžete také zaplatit v hotovosti při příjezdu.`,
            paypalNote: `${iconEdit()} <strong>Důležité:</strong> Prosím uveďte své <strong>celé jméno</strong> a <strong>datum příjezdu (${checkInDate})</strong> do poznámky platby na PayPal, abychom mohli vaši platbu identifikovat.`,
            deadline: `${iconClock()} <strong>Upozornění:</strong> Pro zachování rezervace je nutné tuto platbu uhradit do <strong>48 hodin</strong>. Neuhrazené rezervace budou automaticky zrušeny a záloha bude zpracována dle naší storno politiky.`,
            deadlineText: `Upozornění: Tato platba musí být uhrazena do 48 hodin, jinak bude rezervace automaticky zrušena.`,
            subject: `Zbývající částka €${remainingBalance} přes PayPal — Paraíso`,
        },
        es: {
            heading: 'Saldo Restante',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Gracias por tu depósito! Para completar el pago de tu reserva, por favor paga el saldo restante a través de PayPal a continuación.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            depositPaid: 'Depósito pagado', remaining: 'Restante',
            ctaLabel: `Pagar restante €${remainingBalance} por PayPal`,
            noteText: `${iconTip()} También puedes pagar el saldo restante en efectivo a tu llegada.`,
            paypalNote: `${iconEdit()} <strong>Importante:</strong> Por favor incluye tu <strong>nombre completo</strong> y <strong>fecha de entrada (${checkInDate})</strong> en la nota de pago de PayPal para que podamos identificar tu pago.`,
            deadline: `${iconClock()} <strong>Aviso importante:</strong> Para mantener tu reserva activa, este pago debe completarse en un plazo de <strong>48 horas</strong>. Las reservas no pagadas se cancelarán automáticamente y el depósito será gestionado según nuestra política de cancelación.`,
            deadlineText: `Aviso: Este pago debe completarse en un plazo de 48 horas, de lo contrario la reserva se cancelará automáticamente.`,
            subject: `Saldo Restante €${remainingBalance} por PayPal — Paraíso`,
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
                [l.depositPaid, `€${depositAmount}`],
                [l.remaining, `€${remainingBalance}`, `color: ${tokens.coral}; font-size: 17px; font-weight: 700;`],
            ],
        }),
        ctaButton({ label: `${iconPaypal('#FFFFFF')} ${l.ctaLabel}`, url: paymentUrl, color: '#003087' }),
        paypalNoteBox,
        deadlineBox,
        note(l.noteText),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        `${l.greeting.replace(/<[^>]*>/g, '')}`,
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice} · ${l.depositPaid}: €${depositAmount} · ${l.remaining}: €${remainingBalance}`,
        `Pay via PayPal: ${paymentUrl}`,
        ``,
        l.deadlineText,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildPaypalRemainingBalanceEmail };
