/**
 * Builds a multilingual (EN / CZ / ES) cancellation notification email.
 *
 * Returns { subject, html, text }
 */
function buildCancellationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice }) {

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        langHeader:  'style="color: #991b1b; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #991b1b; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600; text-decoration: line-through; color: #dc2626;"',
        helpText:    'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
        divider:     'style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"',
    };

    // ── Cancelled booking details ─────────────────────────────────────
    function cancelledTable(labels) {
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

    // ── Language sections ──────────────────────────────────────────────
    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            We're sorry to inform you that your reservation has been cancelled.
        </p>
        ${cancelledTable({ title: "Cancelled Booking", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights", totalPrice: "Total Price" })}
        <p ${s.helpText}>If you have any questions or would like to rebook, please don't hesitate to contact us.</p>
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            S lítostí Vám oznamujeme, že Vaše rezervace byla zrušena.
        </p>
        ${cancelledTable({ title: "Zrušená rezervace", checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí", totalPrice: "Celková cena" })}
        <p ${s.helpText}>Pokud máte jakékoliv dotazy nebo si přejete znovu rezervovat, neváhejte nás kontaktovat.</p>
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            Lamentamos informarte que tu reserva ha sido cancelada.
        </p>
        ${cancelledTable({ title: "Reserva cancelada", checkIn: "Entrada", checkOut: "Salida", nights: "Noches", totalPrice: "Precio total" })}
        <p ${s.helpText}>Si tienes alguna pregunta o deseas volver a reservar, no dudes en contactarnos.</p>
    `;

    // ── Full HTML ────────────────────────────────────────────────────
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #991b1b, #dc2626); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">❌ Reservation Cancelled · Reserva Cancelada</h1>
                <p style="color: #fecaca; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
            </div>
            <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                ${englishSection}
                ${czechSection}
                ${spanishSection}
            </div>
            <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Playa del Inglés, Gran Canaria 🌴<br>
                    This is an automated message · Mensaje automático · Automatická zpráva
                </p>
            </div>
        </div>
    `;

    // ── Plain-text fallback ───────────────────────────────────────────
    const text = [
        `— ENGLISH —`,
        `Hi ${guestName},`,
        `Your reservation has been cancelled.`,
        `Cancelled: ${checkInDate} → ${checkOutDate} · ${nights} nights · €${totalPrice}`,
        `If you have questions, please contact us.`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Vaše rezervace byla zrušena.`,
        `Zrušeno: ${checkInDate} → ${checkOutDate} · ${nights} nocí · €${totalPrice}`,
        `Pokud máte dotazy, kontaktujte nás.`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `Tu reserva ha sido cancelada.`,
        `Cancelada: ${checkInDate} → ${checkOutDate} · ${nights} noches · €${totalPrice}`,
        `Si tienes preguntas, contáctanos.`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `❌ Reservation Cancelled · Reserva Cancelada — ${checkInDate} → ${checkOutDate}`;

    return { subject, html, text };
}

module.exports = { buildCancellationEmail };
