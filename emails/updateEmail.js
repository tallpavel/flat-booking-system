/**
 * Builds a multilingual (EN / CZ / ES) reservation update email.
 * Shows what changed (old → new values).
 *
 * Returns { subject, html, text }
 */
function buildUpdateEmail({ guestName, changes, checkInDate, checkOutDate, nights, totalPrice }) {

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        langHeader:  'style="color: #0c4a6e; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #0c4a6e; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        changeOld:   'style="color: #dc2626; text-decoration: line-through; font-size: 13px;"',
        changeNew:   'style="color: #16a34a; font-weight: 700; font-size: 15px;"',
        changeArrow: 'style="color: #94a3b8; padding: 0 6px;"',
        divider:     'style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"',
    };

    // ── Changes table ─────────────────────────────────────────────────
    function changesTable(title, fieldLabels) {
        if (!changes || changes.length === 0) return '';
        const rows = changes.map(c => {
            const label = fieldLabels[c.field] || c.field;
            return `<tr>
                <td ${s.label}>${label}</td>
                <td ${s.value}>
                    <span ${s.changeOld}>${c.from}</span>
                    <span ${s.changeArrow}>→</span>
                    <span ${s.changeNew}>${c.to}</span>
                </td>
            </tr>`;
        }).join('');

        return `
            <div ${s.detailsBox}>
                <h3 ${s.detailsHead}>${title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${rows}
                </table>
            </div>`;
    }

    // ── Current booking summary ────────────────────────────────────────
    function summaryTable(labels) {
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
    const enFields = { checkIn: "Check-in", checkOut: "Check-out", nights: "Nights", totalPrice: "Total Price", guestName: "Guest Name", guestEmail: "Email", comment: "Comment" };
    const csFields = { checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí", totalPrice: "Celková cena", guestName: "Jméno", guestEmail: "Email", comment: "Komentář" };
    const esFields = { checkIn: "Entrada", checkOut: "Salida", nights: "Noches", totalPrice: "Precio total", guestName: "Nombre", guestEmail: "Email", comment: "Comentario" };

    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            Your reservation has been updated. Please review the changes below.
        </p>
        ${changesTable("What Changed", enFields)}
        ${summaryTable({ title: "Updated Booking", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights", totalPrice: "Total Price" })}
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            Vaše rezervace byla aktualizována. Zkontrolujte prosím změny níže.
        </p>
        ${changesTable("Co se změnilo", csFields)}
        ${summaryTable({ title: "Aktualizovaná rezervace", checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí", totalPrice: "Celková cena" })}
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            Tu reserva ha sido actualizada. Por favor revisa los cambios a continuación.
        </p>
        ${changesTable("Qué cambió", esFields)}
        ${summaryTable({ title: "Reserva actualizada", checkIn: "Entrada", checkOut: "Salida", nights: "Noches", totalPrice: "Precio total" })}
    `;

    // ── Full HTML ────────────────────────────────────────────────────
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #0c4a6e, #0284c7); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">📝 Reservation Updated · Reserva Actualizada</h1>
                <p style="color: #bae6fd; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
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
    const changesText = changes.map(c => `  ${c.field}: ${c.from} → ${c.to}`).join("\n");
    const text = [
        `— ENGLISH —`,
        `Hi ${guestName},`,
        `Your reservation has been updated.`,
        `Changes:`, changesText,
        `Updated booking: ${checkInDate} → ${checkOutDate} · ${nights} nights · €${totalPrice}`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Vaše rezervace byla aktualizována.`,
        `Změny:`, changesText,
        `Aktualizovaná rezervace: ${checkInDate} → ${checkOutDate} · ${nights} nocí · €${totalPrice}`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `Tu reserva ha sido actualizada.`,
        `Cambios:`, changesText,
        `Reserva actualizada: ${checkInDate} → ${checkOutDate} · ${nights} noches · €${totalPrice}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `📝 Reservation Updated · Reserva Actualizada — ${checkInDate} → ${checkOutDate}`;

    return { subject, html, text };
}

module.exports = { buildUpdateEmail };
