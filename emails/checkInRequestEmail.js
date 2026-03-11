/**
 * Builds a multilingual (EN / CZ / ES) check-in request email
 * with a link to the online check-in form.
 *
 * Returns { subject, html, text }
 */
function buildCheckInRequestEmail({ guestName, checkInDate, checkOutDate, nights, checkInUrl }) {

    const s = {
        langHeader:  'style="color: #065f46; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #065f46; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
        divider:     'style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"',
    };

    function detailsTable(labels) {
        return `
            <div ${s.detailsBox}>
                <h3 ${s.detailsHead}>${labels.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td ${s.label}>${labels.checkIn}</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                    <tr><td ${s.label}>${labels.checkOut}</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                    <tr><td ${s.label}>${labels.nights}</td><td ${s.value}>🌙 ${nights}</td></tr>
                </table>
            </div>`;
    }

    function ctaButton(label) {
        return `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${checkInUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                    📋 ${label}
                </a>
            </div>`;
    }

    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            Your stay is approaching! Please complete the online check-in form <strong>before you arrive</strong>.<br>
            We need the details of <strong>all guests</strong> who will be staying at the apartment.
        </p>
        ${detailsTable({ title: "Your Stay", checkIn: "Check-in", checkOut: "Check-out", nights: "Nights" })}
        ${ctaButton("Complete Online Check-In")}
        <p ${s.note}>📌 You can update the information anytime by reopening the same link.</p>
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            Váš pobyt se blíží! Prosím vyplňte online formulář pro check-in <strong>před příjezdem</strong>.<br>
            Potřebujeme údaje <strong>všech hostů</strong>, kteří budou v apartmánu bydlet.
        </p>
        ${detailsTable({ title: "Váš pobyt", checkIn: "Příjezd", checkOut: "Odjezd", nights: "Počet nocí" })}
        ${ctaButton("Vyplnit online check-in")}
        <p ${s.note}>📌 Údaje můžete kdykoli upravit otevřením stejného odkazu.</p>
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            ¡Tu estancia se acerca! Por favor completa el formulario de check-in online <strong>antes de llegar</strong>.<br>
            Necesitamos los datos de <strong>todos los huéspedes</strong> que se alojarán en el apartamento.
        </p>
        ${detailsTable({ title: "Tu estancia", checkIn: "Entrada", checkOut: "Salida", nights: "Noches" })}
        ${ctaButton("Completar check-in online")}
        <p ${s.note}>📌 Puedes actualizar la información en cualquier momento reabriendo el mismo enlace.</p>
    `;

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #065f46, #059669); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">📋 Online Check-In</h1>
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

    const text = [
        `— ENGLISH —`,
        `Hi ${guestName},`,
        `Please complete your online check-in before arrival.`,
        `Check-in: ${checkInDate} · Check-out: ${checkOutDate} · Nights: ${nights}`,
        `Complete check-in: ${checkInUrl}`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Prosím vyplňte online check-in před příjezdem.`,
        `Příjezd: ${checkInDate} · Odjezd: ${checkOutDate} · Nocí: ${nights}`,
        `Vyplnit check-in: ${checkInUrl}`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `Por favor completa el check-in online antes de llegar.`,
        `Entrada: ${checkInDate} · Salida: ${checkOutDate} · Noches: ${nights}`,
        `Completar check-in: ${checkInUrl}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `📋 Online Check-In · Check-In Online — Paraíso`;

    return { subject, html, text };
}

module.exports = { buildCheckInRequestEmail };
