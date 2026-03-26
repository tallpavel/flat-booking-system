/**
 * Builds a localized (EN / CZ / ES) deposit-paid confirmation email.
 *
 * Sent automatically when the Stripe webhook confirms a successful payment.
 *
 * Returns { subject, html, text }
 */
function buildDepositPaidEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '✅ Deposit Received',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your deposit of <span style="display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">€${depositAmount} PAID ✓</span> has been received. Thank you!<br><br>Your reservation is now fully secured. We're looking forward to welcoming you.`,
            detailsTitle: 'Booking Details',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price', deposit: 'Deposit (30%)',
            remaining: `💡 <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.`,
            subject: `✅ Deposit Received — €${depositAmount}`,
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '✅ Záloha přijata',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vaše záloha <span style="display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">€${depositAmount} ZAPLACENO ✓</span> byla přijata. Děkujeme!<br><br>Vaše rezervace je nyní plně zajištěna. Těšíme se na vás.`,
            detailsTitle: 'Detail rezervace',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena', deposit: 'Záloha (30%)',
            remaining: `💡 <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.`,
            subject: `✅ Záloha přijata — €${depositAmount}`,
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '✅ Depósito Recibido',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>Tu depósito de <span style="display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">€${depositAmount} PAGADO ✓</span> ha sido recibido. ¡Gracias!<br><br>Tu reserva está completamente asegurada. Estamos deseando recibirte.`,
            detailsTitle: 'Detalles de la reserva',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total', deposit: 'Depósito (30%)',
            remaining: `💡 <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.`,
            subject: `✅ Depósito Recibido — €${depositAmount}`,
            footerAuto: 'Mensaje automático',
        },
    };

    const l = t[locale] || t.en;

    const s = {
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #065f46; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        deposit:     'style="padding: 5px 0; color: #16a34a; font-size: 17px; font-weight: 700;"',
        remaining:   'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
    };

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #065f46, #16a34a); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #bbf7d0; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
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
                        <tr><td ${s.label}>${l.deposit}</td><td ${s.deposit}>✓ €${depositAmount}</td></tr>
                    </table>
                </div>
                <p ${s.remaining}>${l.remaining}</p>
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
        `${l.totalPrice}: €${totalPrice} · ${l.deposit}: €${depositAmount}`,
        `${l.remaining.replace(/<[^>]*>/g, '')}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildDepositPaidEmail };
