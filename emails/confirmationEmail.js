/**
 * Builds a multilingual (EN / CZ / ES) confirmation email
 * with the Stripe payment link.
 *
 * Returns { subject, html, text }
 */
function buildConfirmationEmail({ guestName, checkInDate, checkOutDate, nights, totalPrice, depositAmount, remainingBalance, paymentUrl }) {

    // ── Shared styles ─────────────────────────────────────────────────
    const s = {
        langHeader:  'style="color: #0c4a6e; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #0c4a6e; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        deposit:     'style="padding: 5px 0; color: #0284c7; font-size: 17px; font-weight: 700;"',
        remaining:   'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
        divider:     'style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"',
    };

    // ── Reusable booking-details table (labels change per language) ────
    function detailsTable(labels) {
        return `
            <div ${s.detailsBox}>
                <h3 ${s.detailsHead}>${labels.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td ${s.label}>${labels.checkIn}</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                    <tr><td ${s.label}>${labels.checkOut}</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                    <tr><td ${s.label}>${labels.nights}</td><td ${s.value}>🌙 ${nights}</td></tr>
                    <tr><td ${s.label}>${labels.totalPrice}</td><td ${s.value}>€${totalPrice}</td></tr>
                    <tr><td ${s.label}>${labels.deposit}</td><td ${s.deposit}>€${depositAmount}</td></tr>
                </table>
            </div>`;
    }

    // ── CTA button (same in all languages, but label changes) ─────────
    function ctaButton(label) {
        return `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7, #0ea5e9); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                    💳 ${label}
                </a>
            </div>`;
    }

    // ── Build each language section ───────────────────────────────────
    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            Great news! Your reservation has been confirmed. To secure your dates, please pay the deposit below.
        </p>
        ${detailsTable({ title: "Booking Details", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights", totalPrice: "Total Price", deposit: "Deposit (30%)" })}
        ${ctaButton(`Pay €${depositAmount} Deposit`)}
        <p ${s.remaining}>💡 <strong>Remaining balance:</strong> €${remainingBalance} — payable on arrival.</p>
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            Skvělá zpráva! Vaše rezervace byla potvrzena. Pro zajištění termínu prosím uhraďte zálohu níže.
        </p>
        ${detailsTable({ title: "Detail rezervace", checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí", totalPrice: "Celková cena", deposit: "Záloha (30%)" })}
        ${ctaButton(`Zaplatit zálohu €${depositAmount}`)}
        <p ${s.remaining}>💡 <strong>Zbývající částka:</strong> €${remainingBalance} — splatná při příjezdu.</p>
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            ¡Buenas noticias! Tu reserva ha sido confirmada. Para asegurar tus fechas, por favor realiza el pago del depósito a continuación.
        </p>
        ${detailsTable({ title: "Detalles de la reserva", checkIn: "Entrada", checkOut: "Salida", nights: "Noches", totalPrice: "Precio total", deposit: "Depósito (30%)" })}
        ${ctaButton(`Pagar depósito de €${depositAmount}`)}
        <p ${s.remaining}>💡 <strong>Saldo restante:</strong> €${remainingBalance} — a pagar a la llegada.</p>
    `;

    // ── Assemble full HTML ────────────────────────────────────────────
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0c4a6e, #0284c7); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">🏖️ Booking Confirmed · Reserva Confirmada</h1>
                <p style="color: #bae6fd; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
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
        `Your booking is confirmed!`,
        `Check-in: ${checkInDate} · Check-out: ${checkOutDate} · Nights: ${nights}`,
        `Total: €${totalPrice} · Deposit (30%): €${depositAmount}`,
        `Pay here: ${paymentUrl}`,
        `Remaining: €${remainingBalance} — payable on arrival.`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Tvoje rezervace byla potvrzena!`,
        `Příjezd: ${checkInDate} · Odjezd: ${checkOutDate} · Nocí: ${nights}`,
        `Celkem: €${totalPrice} · Záloha (30%): €${depositAmount}`,
        `Zaplatit zde: ${paymentUrl}`,
        `Zbývá: €${remainingBalance} — splatné při příjezdu.`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `¡Tu reserva ha sido confirmada!`,
        `Entrada: ${checkInDate} · Salida: ${checkOutDate} · Noches: ${nights}`,
        `Total: €${totalPrice} · Depósito (30%): €${depositAmount}`,
        `Pagar aquí: ${paymentUrl}`,
        `Restante: €${remainingBalance} — a pagar a la llegada.`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `✅ Booking Confirmed · Reserva Confirmada — Pay Your Deposit`;

    return { subject, html, text };
}

module.exports = { buildConfirmationEmail };
