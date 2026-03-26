/**
 * Builds a localized (EN / CZ / ES) remaining balance payment email.
 * Sent when the owner requests payment of the remaining balance.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, formatDate, tokens } = require('./emailLayout');

function buildRemainingBalanceEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Remaining Balance',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Thank you for your deposit! To complete your booking payment, please pay the remaining balance below.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            depositPaid: 'Deposit Paid', remaining: 'Remaining',
            ctaLabel: `Pay Remaining €${remainingBalance}`,
            noteText: '💡 You can also pay the remaining balance in cash on arrival.',
            deadline: `⏳ <strong>Important:</strong> To keep your reservation active, this payment must be completed within <strong>48 hours</strong>. Unpaid reservations will be automatically cancelled, and the deposit will be handled according to our cancellation policy.`,
            deadlineText: `⏳ Important: This payment must be completed within 48 hours, otherwise the reservation will be automatically cancelled.`,
            subject: `💳 Remaining Balance €${remainingBalance} — Paraíso`,
        },
        cs: {
            heading: 'Zbývající částka',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Děkujeme za zálohu! Pro dokončení platby prosím uhraďte zbývající částku níže.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            depositPaid: 'Zaplacená záloha', remaining: 'Zbývá',
            ctaLabel: `Zaplatit zbývajících €${remainingBalance}`,
            noteText: '💡 Zbývající částku můžete také zaplatit v hotovosti při příjezdu.',
            deadline: `⏳ <strong>Upozornění:</strong> Pro zachování rezervace je nutné tuto platbu uhradit do <strong>48 hodin</strong>. Neuhrazené rezervace budou automaticky zrušeny a záloha bude zpracována dle naší storno politiky.`,
            deadlineText: `⏳ Upozornění: Tato platba musí být uhrazena do 48 hodin, jinak bude rezervace automaticky zrušena.`,
            subject: `💳 Zbývající částka €${remainingBalance} — Paraíso`,
        },
        es: {
            heading: 'Saldo Restante',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Gracias por tu depósito! Para completar el pago de tu reserva, por favor paga el saldo restante a continuación.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            depositPaid: 'Depósito pagado', remaining: 'Restante',
            ctaLabel: `Pagar restante €${remainingBalance}`,
            noteText: '💡 También puedes pagar el saldo restante en efectivo a tu llegada.',
            deadline: `⏳ <strong>Aviso importante:</strong> Para mantener tu reserva activa, este pago debe completarse en un plazo de <strong>48 horas</strong>. Las reservas no pagadas se cancelarán automáticamente y el depósito se gestionará según nuestra política de cancelación.`,
            deadlineText: `⏳ Aviso: Este pago debe completarse en un plazo de 48 horas, de lo contrario la reserva se cancelará automáticamente.`,
            subject: `💳 Saldo Restante €${remainingBalance} — Paraíso`,
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
                [l.depositPaid, `✓ €${depositAmount}`, `color: ${tokens.success}; font-weight: 600;`],
                [l.remaining, `€${remainingBalance}`, `color: ${tokens.coral}; font-size: 17px; font-weight: 700;`],
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
        `${l.totalPrice}: €${totalPrice} · ${l.depositPaid}: €${depositAmount} · ${l.remaining}: €${remainingBalance}`,
        `Pay here: ${paymentUrl}`,
        l.deadlineText,
        l.noteText,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildRemainingBalanceEmail };
