/**
 * Builds a localized (EN / CZ / ES) confirmation email
 * with the Stripe payment link.
 *
 * Returns { subject, html, text }
 */
function buildConfirmationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '🏖️ Booking Confirmed',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Great news! Your reservation has been confirmed. To secure your dates, please pay the deposit below.`,
            detailsTitle: 'Booking Details',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price', deposit: 'Deposit (30%)',
            ctaLabel: `Pay €${depositAmount} Deposit`,
            remaining: `💡 <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.`,
            subject: `✅ Booking Confirmed — Pay Your Deposit`,
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '🏖️ Rezervace potvrzena',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Skvělá zpráva! Vaše rezervace byla potvrzena. Pro zajištění termínu prosím uhraďte zálohu níže.`,
            detailsTitle: 'Detail rezervace',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena', deposit: 'Záloha (30%)',
            ctaLabel: `Zaplatit zálohu €${depositAmount}`,
            remaining: `💡 <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.`,
            subject: `✅ Rezervace potvrzena — Zaplaťte zálohu`,
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '🏖️ Reserva Confirmada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Buenas noticias! Tu reserva ha sido confirmada. Para asegurar tus fechas, por favor realiza el pago del depósito a continuación.`,
            detailsTitle: 'Detalles de la reserva',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total', deposit: 'Depósito (30%)',
            ctaLabel: `Pagar depósito de €${depositAmount}`,
            remaining: `💡 <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.`,
            subject: `✅ Reserva Confirmada — Paga tu depósito`,
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
        deposit:     'style="padding: 5px 0; color: #0284c7; font-size: 17px; font-weight: 700;"',
        remaining:   'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
    };

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #0c4a6e, #0284c7); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #bae6fd; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
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
                        <tr><td ${s.label}>${l.deposit}</td><td ${s.deposit}>€${depositAmount}</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7, #0ea5e9); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                        💳 ${l.ctaLabel}
                    </a>
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
        `${l.greeting.replace(/<[^>]*>/g, '')}`,
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice} · ${l.deposit}: €${depositAmount}`,
        `Pay here: ${paymentUrl}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildConfirmationEmail };
