/**
 * Builds a multilingual (EN / CZ / ES) deposit-paid confirmation email.
 *
 * Sent automatically when the Stripe webhook confirms a successful payment.
 *
 * Returns { subject, html, text }
 */
function buildDepositPaidEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance }) {

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        langHeader:  'style="color: #065f46; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #065f46; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        deposit:     'style="padding: 5px 0; color: #16a34a; font-size: 17px; font-weight: 700;"',
        paidBadge:   'style="display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;"',
        remaining:   'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
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
                    <tr><td ${s.label}>${labels.deposit}</td><td ${s.deposit}>✓ €${depositAmount}</td></tr>
                </table>
            </div>`;
    }

    // ── Build each language section ───────────────────────────────────
    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            Your deposit of <span ${s.paidBadge}>€${depositAmount} PAID ✓</span> has been received. Thank you!<br><br>
            Your reservation is now fully secured. We're looking forward to welcoming you.
        </p>
        ${detailsTable({ title: "Booking Details", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights", totalPrice: "Total Price", deposit: "Deposit (30%)" })}
        <p ${s.remaining}>💡 <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.</p>
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            Vaše záloha <span ${s.paidBadge}>€${depositAmount} ZAPLACENO ✓</span> byla přijata. Děkujeme!<br><br>
            Vaše rezervace je nyní plně zajištěna. Těšíme se na vás.
        </p>
        ${detailsTable({ title: "Detail rezervace", checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí", totalPrice: "Celková cena", deposit: "Záloha (30%)" })}
        <p ${s.remaining}>💡 <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.</p>
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            Tu depósito de <span ${s.paidBadge}>€${depositAmount} PAGADO ✓</span> ha sido recibido. ¡Gracias!<br><br>
            Tu reserva está completamente asegurada. Estamos deseando recibirte.
        </p>
        ${detailsTable({ title: "Detalles de la reserva", checkIn: "Entrada", checkOut: "Salida", nights: "Noches", totalPrice: "Precio total", deposit: "Depósito (30%)" })}
        <p ${s.remaining}>💡 <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.</p>
    `;

    // ── Assemble full HTML ────────────────────────────────────────────
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #065f46, #16a34a); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">✅ Deposit Received · Depósito Recibido</h1>
                <p style="color: #bbf7d0; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
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
        `Your deposit of €${depositAmount} has been received — thank you!`,
        `Your reservation is now fully secured.`,
        `Check-in: ${checkInDate} · Check-out: ${checkOutDate} · Nights: ${nights}`,
        `Total: €${totalPrice} · Deposit (30%): €${depositAmount}`,
        `Remaining: €${remainingBalance} — payable on arrival.`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Vaše záloha €${depositAmount} byla přijata — děkujeme!`,
        `Vaše rezervace je nyní plně zajištěna.`,
        `Příjezd: ${checkInDate} · Odjezd: ${checkOutDate} · Nocí: ${nights}`,
        `Celkem: €${totalPrice} · Záloha (30%): €${depositAmount}`,
        `Zbývá: €${remainingBalance} — splatné při příjezdu.`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `Tu depósito de €${depositAmount} ha sido recibido — ¡gracias!`,
        `Tu reserva está completamente asegurada.`,
        `Entrada: ${checkInDate} · Salida: ${checkOutDate} · Noches: ${nights}`,
        `Total: €${totalPrice} · Depósito (30%): €${depositAmount}`,
        `Restante: €${remainingBalance} — a pagar a la llegada.`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `✅ Deposit Received · Depósito Recibido — €${depositAmount}`;

    return { subject, html, text };
}

module.exports = { buildDepositPaidEmail };
