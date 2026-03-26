/**
 * Builds a localized (EN / CZ / ES) deposit-paid confirmation email.
 *
 * Sent automatically when the Stripe webhook confirms a successful payment.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, badge, tokens } = require('./emailLayout');

function buildDepositPaidEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Deposit Received',
            paidBadge: `€${depositAmount} PAID ✓`,
            greetingPre: `Hi <strong>${guestName}</strong>,<br><br>Your deposit of `,
            greetingPost: ` has been received. Thank you!<br><br>Your reservation is now fully secured. We're looking forward to welcoming you.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price', deposit: 'Deposit (30%)',
            remaining: `💡 <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.`,
            subject: `✅ Deposit Received — €${depositAmount}`,
        },
        cs: {
            heading: 'Záloha přijata',
            paidBadge: `€${depositAmount} ZAPLACENO ✓`,
            greetingPre: `Ahoj <strong>${guestName}</strong>,<br><br>Vaše záloha `,
            greetingPost: ` byla přijata. Děkujeme!<br><br>Vaše rezervace je nyní plně zajištěna. Těšíme se na vás.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena', deposit: 'Záloha (30%)',
            remaining: `💡 <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.`,
            subject: `✅ Záloha přijata — €${depositAmount}`,
        },
        es: {
            heading: 'Depósito Recibido',
            paidBadge: `€${depositAmount} PAGADO ✓`,
            greetingPre: `Hola <strong>${guestName}</strong>,<br><br>Tu depósito de `,
            greetingPost: ` ha sido recibido. ¡Gracias!<br><br>Tu reserva está completamente asegurada. Estamos deseando recibirte.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total', deposit: 'Depósito (30%)',
            remaining: `💡 <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.`,
            subject: `✅ Depósito Recibido — €${depositAmount}`,
        },
    };

    const l = t[locale] || t.en;
    const paidBadgeHtml = badge({ text: l.paidBadge, bgColor: '#dcfce7', textColor: tokens.success });

    const content = [
        sectionHeading(l.heading),
        greeting(`${l.greetingPre}${paidBadgeHtml}${l.greetingPost}`),
        detailsCard({
            accentColor: tokens.success,
            rows: [
                [l.checkIn, `📅 ${checkInDate}`],
                [l.checkOut, `📅 ${checkOutDate}`],
                [l.nights, `🌙 ${nights}`],
                [l.totalPrice, `€${totalPrice}`],
                [l.deposit, `€${depositAmount} ✓`, `color: ${tokens.success}; font-size: 17px; font-weight: 700;`],
            ],
        }),
        note(l.remaining),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        `Hi ${guestName},`,
        `${l.paidBadge}`,
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice} · ${l.deposit}: €${depositAmount}`,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildDepositPaidEmail };
