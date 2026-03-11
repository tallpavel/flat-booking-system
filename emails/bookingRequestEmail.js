/**
 * Builds a multilingual (EN / CZ / ES) acknowledgment email
 * sent to the guest when they submit a booking request.
 *
 * Returns { subject, html, text }
 */
function buildBookingRequestEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice }) {

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        langHeader:  'style="color: #0c4a6e; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #fef9f0; border: 1px solid #fde68a; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #92400e; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
        divider:     'style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"',
    };

    // ── Reusable booking-details table ────────────────────────────────
    function detailsTable(labels) {
        return `
            <div ${s.detailsBox}>
                <h3 ${s.detailsHead}>${labels.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td ${s.label}>${labels.checkIn}</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                    <tr><td ${s.label}>${labels.checkOut}</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                    <tr><td ${s.label}>${labels.nights}</td><td ${s.value}>🌙 ${nights}</td></tr>
                    <tr><td ${s.label}>${labels.totalPrice}</td><td ${s.value}>€${totalPrice}</td></tr>
                </table>
            </div>`;
    }

    // ── Build each language section ───────────────────────────────────
    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            Thank you for your booking request! We have received your details and will review your reservation within <strong>24 hours</strong>.<br><br>
            Once confirmed, you will receive a separate email with the deposit payment link.
        </p>
        ${detailsTable({ title: "Request Summary", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights", totalPrice: "Estimated Total" })}
        <p ${s.note}>📩 No payment is required at this stage. We will contact you shortly.</p>
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            Děkujeme za vaši žádost o rezervaci! Přijali jsme vaše údaje a vaši rezervaci zkontrolujeme do <strong>24 hodin</strong>.<br><br>
            Po potvrzení obdržíte samostatný e-mail s odkazem na platbu zálohy.
        </p>
        ${detailsTable({ title: "Shrnutí požadavku", checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí", totalPrice: "Odhadovaná cena" })}
        <p ${s.note}>📩 V této fázi není vyžadována žádná platba. Brzy se vám ozveme.</p>
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            ¡Gracias por tu solicitud de reserva! Hemos recibido tus datos y revisaremos tu reserva en un plazo de <strong>24 horas</strong>.<br><br>
            Una vez confirmada, recibirás un correo electrónico aparte con el enlace de pago del depósito.
        </p>
        ${detailsTable({ title: "Resumen de la solicitud", checkIn: "Entrada", checkOut: "Salida", nights: "Noches", totalPrice: "Precio estimado" })}
        <p ${s.note}>📩 No se requiere ningún pago en esta etapa. Nos pondremos en contacto contigo pronto.</p>
    `;

    // ── Assemble full HTML ────────────────────────────────────────────
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #92400e, #d97706); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">📨 Request Received · Solicitud Recibida</h1>
                <p style="color: #fde68a; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa Paraíso, Tenerife</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                ${englishSection}
                ${czechSection}
                ${spanishSection}
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Playa Paraíso, Tenerife 🌴<br>
                    This is an automated message · Mensaje automático · Automatická zpráva
                </p>
            </div>
        </div>
    `;

    // ── Plain-text fallback ───────────────────────────────────────────
    const text = [
        `— ENGLISH —`,
        `Hi ${guestName},`,
        `Thank you for your booking request! We will review it within 24 hours.`,
        `Check-in: ${checkInDate} · Check-out: ${checkOutDate} · Nights: ${nights}`,
        `Estimated Total: €${totalPrice}`,
        `No payment is required at this stage.`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Děkujeme za žádost o rezervaci! Zkontrolujeme ji do 24 hodin.`,
        `Příjezd: ${checkInDate} · Odjezd: ${checkOutDate} · Nocí: ${nights}`,
        `Odhadovaná cena: €${totalPrice}`,
        `V této fázi není vyžadována žádná platba.`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `¡Gracias por tu solicitud! La revisaremos en 24 horas.`,
        `Entrada: ${checkInDate} · Salida: ${checkOutDate} · Noches: ${nights}`,
        `Precio estimado: €${totalPrice}`,
        `No se requiere ningún pago en esta etapa.`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `📨 Booking Request Received · Solicitud de Reserva Recibida`;

    return { subject, html, text };
}

module.exports = { buildBookingRequestEmail };
