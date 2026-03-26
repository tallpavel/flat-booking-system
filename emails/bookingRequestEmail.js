/**
 * Builds a localized (EN / CZ / ES) acknowledgment email
 * sent to the guest when they submit a booking request.
 *
 * @param {object} params
 * @param {string} params.locale  - 'en' | 'cs' | 'es' (default: 'en')
 * Returns { subject, html, text }
 */
function buildBookingRequestEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, locale = 'en' }) {

    // ── Translations ──────────────────────────────────────────────────
    const t = {
        en: {
            headerTitle: '📨 Booking Request Received',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Thank you for your booking request! We have received your details and will review your reservation within <strong>24 hours</strong>.<br><br>Once confirmed, you will receive a separate email with the deposit payment link.`,
            detailsTitle: 'Request Summary',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Estimated Total',
            note: '📩 No payment is required at this stage. We will contact you shortly.',
            subject: '📨 Booking Request Received',
            footerAuto: 'This is an automated message',
            textGreeting: `Hi ${guestName},`,
            textBody: 'Thank you for your booking request! We will review it within 24 hours.',
            textNote: 'No payment is required at this stage.',
        },
        cs: {
            headerTitle: '📨 Žádost o rezervaci přijata',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Děkujeme za vaši žádost o rezervaci! Přijali jsme vaše údaje a vaši rezervaci zkontrolujeme do <strong>24 hodin</strong>.<br><br>Po potvrzení obdržíte samostatný e-mail s odkazem na platbu zálohy.`,
            detailsTitle: 'Shrnutí požadavku',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Odhadovaná cena',
            note: '📩 V této fázi není vyžadována žádná platba. Brzy se vám ozveme.',
            subject: '📨 Žádost o rezervaci přijata',
            footerAuto: 'Automatická zpráva',
            textGreeting: `Ahoj ${guestName},`,
            textBody: 'Děkujeme za žádost o rezervaci! Zkontrolujeme ji do 24 hodin.',
            textNote: 'V této fázi není vyžadována žádná platba.',
        },
        es: {
            headerTitle: '📨 Solicitud de Reserva Recibida',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Gracias por tu solicitud de reserva! Hemos recibido tus datos y revisaremos tu reserva en un plazo de <strong>24 horas</strong>.<br><br>Una vez confirmada, recibirás un correo electrónico aparte con el enlace de pago del depósito.`,
            detailsTitle: 'Resumen de la solicitud',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio estimado',
            note: '📩 No se requiere ningún pago en esta etapa. Nos pondremos en contacto contigo pronto.',
            subject: '📨 Solicitud de Reserva Recibida',
            footerAuto: 'Mensaje automático',
            textGreeting: `Hola ${guestName},`,
            textBody: '¡Gracias por tu solicitud! La revisaremos en 24 horas.',
            textNote: 'No se requiere ningún pago en esta etapa.',
        },
    };

    const l = t[locale] || t.en;

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #fef9f0; border: 1px solid #fde68a; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #92400e; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
    };

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #92400e, #d97706); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #fde68a; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa Paraíso, Tenerife</p>
            </div>

            <!-- Body -->
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
                <p ${s.note}>${l.note}</p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Playa Paraíso, Tenerife 🌴<br>
                    ${l.footerAuto}
                </p>
            </div>
        </div>
    `;

    const text = [
        l.textGreeting,
        l.textBody,
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights}`,
        `${l.totalPrice}: €${totalPrice}`,
        l.textNote,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildBookingRequestEmail };
