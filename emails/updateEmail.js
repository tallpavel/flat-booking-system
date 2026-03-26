/**
 * Builds a localized (EN / CZ / ES) reservation update email.
 * Shows what changed (old → new values).
 *
 * Returns { subject, html, text }
 */
function buildUpdateEmail({ guestName, changes, checkInDate, checkOutDate, nights, totalPrice, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '📝 Reservation Updated',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your reservation has been updated. Please review the changes below.`,
            changesTitle: 'What Changed',
            summaryTitle: 'Updated Booking',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights', totalPrice: 'Total Price',
            guestName: 'Guest Name', guestEmail: 'Email', comment: 'Comment',
            subject: `📝 Reservation Updated — ${checkInDate} → ${checkOutDate}`,
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '📝 Rezervace aktualizována',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vaše rezervace byla aktualizována. Zkontrolujte prosím změny níže.`,
            changesTitle: 'Co se změnilo',
            summaryTitle: 'Aktualizovaná rezervace',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí', totalPrice: 'Celková cena',
            guestName: 'Jméno', guestEmail: 'Email', comment: 'Komentář',
            subject: `📝 Rezervace aktualizována — ${checkInDate} → ${checkOutDate}`,
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '📝 Reserva Actualizada',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>Tu reserva ha sido actualizada. Por favor revisa los cambios a continuación.`,
            changesTitle: 'Qué cambió',
            summaryTitle: 'Reserva actualizada',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches', totalPrice: 'Precio total',
            guestName: 'Nombre', guestEmail: 'Email', comment: 'Comentario',
            subject: `📝 Reserva Actualizada — ${checkInDate} → ${checkOutDate}`,
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
        changeOld:   'style="color: #dc2626; text-decoration: line-through; font-size: 13px;"',
        changeNew:   'style="color: #16a34a; font-weight: 700; font-size: 15px;"',
        changeArrow: 'style="color: #94a3b8; padding: 0 6px;"',
    };

    // Build changes table
    let changesHtml = '';
    if (changes && changes.length > 0) {
        const rows = changes.map(c => {
            return `<tr>
                <td ${s.label}>${c.field}</td>
                <td ${s.value}>
                    <span ${s.changeOld}>${c.from}</span>
                    <span ${s.changeArrow}>→</span>
                    <span ${s.changeNew}>${c.to}</span>
                </td>
            </tr>`;
        }).join('');

        changesHtml = `
            <div ${s.detailsBox}>
                <h3 ${s.detailsHead}>${l.changesTitle}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${rows}
                </table>
            </div>`;
    }

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #0c4a6e, #0284c7); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #bae6fd; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
            </div>
            <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                <p ${s.greeting}>${l.greeting}</p>
                ${changesHtml}
                <div ${s.detailsBox}>
                    <h3 ${s.detailsHead}>${l.summaryTitle}</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>${l.checkIn}</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                        <tr><td ${s.label}>${l.checkOut}</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                        <tr><td ${s.label}>${l.nights}</td><td ${s.value}>🌙 ${nights}</td></tr>
                        <tr><td ${s.label}>${l.totalPrice}</td><td ${s.value}>€${totalPrice}</td></tr>
                    </table>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Playa del Inglés, Gran Canaria 🌴<br>
                    ${l.footerAuto}
                </p>
            </div>
        </div>
    `;

    const changesText = changes.map(c => `  ${c.field}: ${c.from} → ${c.to}`).join("\n");
    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        changesText,
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights} · €${totalPrice}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildUpdateEmail };
