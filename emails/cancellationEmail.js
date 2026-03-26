/**
 * Builds a localized (EN / CZ / ES) cancellation notification email.
 *
 * Returns { subject, html, text }
 */
function buildCancellationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '❌ Reservation Cancelled',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>We're sorry to inform you that your reservation has been cancelled.`,
            detailsTitle: 'Cancelled Booking',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            helpText: 'If you have any questions or would like to rebook, please don\'t hesitate to contact us.',
            subject: `❌ Reservation Cancelled — ${checkInDate} → ${checkOutDate}`,
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '❌ Rezervace zrušena',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>S lítostí Vám oznamujeme, že Vaše rezervace byla zrušena.`,
            detailsTitle: 'Zrušená rezervace',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            helpText: 'Pokud máte jakékoliv dotazy nebo si přejete znovu rezervovat, neváhejte nás kontaktovat.',
            subject: `❌ Rezervace zrušena — ${checkInDate} → ${checkOutDate}`,
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '❌ Reserva Cancelada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>Lamentamos informarte que tu reserva ha sido cancelada.`,
            detailsTitle: 'Reserva cancelada',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            helpText: 'Si tienes alguna pregunta o deseas volver a reservar, no dudes en contactarnos.',
            subject: `❌ Reserva Cancelada — ${checkInDate} → ${checkOutDate}`,
            footerAuto: 'Mensaje automático',
        },
    };

    const l = t[locale] || t.en;

    const s = {
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #991b1b; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600; text-decoration: line-through; color: #dc2626;"',
        helpText:    'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
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
                    </table>
                </div>
                <p ${s.helpText}>${l.helpText}</p>
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
        `${l.checkIn}: ${checkInDate} → ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights} · €${totalPrice}`,
        l.helpText,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildCancellationEmail };
