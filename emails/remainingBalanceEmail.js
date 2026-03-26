/**
 * Builds a localized (EN / CZ / ES) remaining balance payment email.
 * Sent when the owner requests payment of the remaining balance.
 *
 * Returns { subject, html, text }
 */
function buildRemainingBalanceEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '💳 Remaining Balance',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Thank you for your deposit! To complete your booking payment, please pay the remaining balance below.`,
            detailsTitle: 'Payment Summary',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            depositPaid: 'Deposit Paid', remaining: 'Remaining',
            ctaLabel: `Pay Remaining €${remainingBalance}`,
            note: '💡 You can also pay the remaining balance in cash on arrival.',
            subject: `💳 Remaining Balance €${remainingBalance} — Paraíso`,
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '💳 Zbývající částka',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Děkujeme za zálohu! Pro dokončení platby prosím uhraďte zbývající částku níže.`,
            detailsTitle: 'Přehled platby',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            depositPaid: 'Zaplacená záloha', remaining: 'Zbývá',
            ctaLabel: `Zaplatit zbývajících €${remainingBalance}`,
            note: '💡 Zbývající částku můžete také zaplatit v hotovosti při příjezdu.',
            subject: `💳 Zbývající částka €${remainingBalance} — Paraíso`,
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '💳 Saldo Restante',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Gracias por tu depósito! Para completar el pago de tu reserva, por favor paga el saldo restante a continuación.`,
            detailsTitle: 'Resumen de pago',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            depositPaid: 'Depósito pagado', remaining: 'Restante',
            ctaLabel: `Pagar restante €${remainingBalance}`,
            note: '💡 También puedes pagar el saldo restante en efectivo a tu llegada.',
            subject: `💳 Saldo Restante €${remainingBalance} — Paraíso`,
            footerAuto: 'Mensaje automático',
        },
    };

    const l = t[locale] || t.en;

    const s = {
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #0c4a6e; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        paid:        'style="padding: 5px 0; color: #16a34a; font-size: 15px; font-weight: 600;"',
        remaining:   'style="padding: 5px 0; color: #dc2626; font-size: 17px; font-weight: 700;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
    };

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #991b1b, #dc2626); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #fecaca; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
            </div>
            <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                <p ${s.greeting}>${l.greeting}</p>
                <div ${s.detailsBox}>
                    <h3 ${s.detailsHead}>${l.detailsTitle}</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>${l.checkIn}</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                        <tr><td ${s.label}>${l.checkOut}</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                        <tr><td ${s.label}>${l.nights}</td><td ${s.value}>🌙 ${nights}</td></tr>
                        <tr><td ${s.label}>${l.totalPrice}</td><td ${s.value}>€${totalPrice}</td></tr>
                        <tr><td ${s.label}>${l.depositPaid}</td><td ${s.paid}>✓ €${depositAmount}</td></tr>
                        <tr><td ${s.label}>${l.remaining}</td><td ${s.remaining}>€${remainingBalance}</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #ef4444); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                        💳 ${l.ctaLabel}
                    </a>
                </div>
                <p ${s.note}>${l.note}</p>
            </div>
            <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Playa del Inglés, Gran Canaria 🌴<br>
                    ${l.footerAuto}
                </p>
            </div>
        </div>
    `;

    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice} · ${l.depositPaid}: €${depositAmount} · ${l.remaining}: €${remainingBalance}`,
        `Pay here: ${paymentUrl}`,
        l.note,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildRemainingBalanceEmail };
