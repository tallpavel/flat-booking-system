/**
 * Builds a localized (EN / CZ / ES) check-in request email
 * with a link to the online check-in form.
 *
 * Returns { subject, html, text }
 */
function buildCheckInRequestEmail({ guestName, checkInDate, checkOutDate, nights, checkInUrl, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '📋 Online Check-In',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your stay is approaching! Please complete the online check-in form <strong>before you arrive</strong>.<br>We need the details of <strong>all guests</strong> who will be staying at the apartment.`,
            detailsTitle: 'Your Stay',
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights',
            ctaLabel: 'Complete Online Check-In',
            important: '🔑 <strong>Important:</strong> Access details — including door codes, WiFi credentials, and arrival instructions — will only be provided once all guests have been registered through this form. Please complete it at your earliest convenience to ensure a smooth arrival.',
            note: '📌 You can update the information anytime by reopening the same link.',
            subject: '📋 Online Check-In — Paraíso',
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '📋 Online Check-In',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Váš pobyt se blíží! Prosím vyplňte online formulář pro check-in <strong>před příjezdem</strong>.<br>Potřebujeme údaje <strong>všech hostů</strong>, kteří budou v apartmánu bydlet.`,
            detailsTitle: 'Váš pobyt',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí',
            ctaLabel: 'Vyplnit online check-in',
            important: '🔑 <strong>Důležité:</strong> Přístupové údaje — včetně kódů ke dveřím, přihlašovacích údajů k WiFi a pokynů k příjezdu — budou poskytnuty až po registraci všech hostů prostřednictvím tohoto formuláře. Prosím vyplňte jej co nejdříve, aby váš příjezd proběhl hladce.',
            note: '📌 Údaje můžete kdykoli upravit otevřením stejného odkazu.',
            subject: '📋 Online Check-In — Paraíso',
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '📋 Check-In Online',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Tu estancia se acerca! Por favor completa el formulario de check-in online <strong>antes de llegar</strong>.<br>Necesitamos los datos de <strong>todos los huéspedes</strong> que se alojarán en el apartamento.`,
            detailsTitle: 'Tu estancia',
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches',
            ctaLabel: 'Completar check-in online',
            important: '🔑 <strong>Importante:</strong> Los datos de acceso — incluyendo códigos de entrada, credenciales WiFi e instrucciones de llegada — solo se proporcionarán una vez que todos los huéspedes hayan sido registrados a través de este formulario. Por favor, complétalo lo antes posible para garantizar una llegada sin contratiempos.',
            note: '📌 Puedes actualizar la información en cualquier momento reabriendo el mismo enlace.',
            subject: '📋 Check-In Online — Paraíso',
            footerAuto: 'Mensaje automático',
        },
    };

    const l = t[locale] || t.en;

    const s = {
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        detailsBox:  'style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;"',
        detailsHead: 'style="color: #065f46; margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 140px;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
    };

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #065f46, #059669); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #bbf7d0; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa del Inglés</p>
            </div>

            <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                <p ${s.greeting}>${l.greeting}</p>
                <div ${s.detailsBox}>
                    <h3 ${s.detailsHead}>${l.detailsTitle}</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>${l.checkIn}</td><td ${s.value}>📅 ${checkInDate}</td></tr>
                        <tr><td ${s.label}>${l.checkOut}</td><td ${s.value}>📅 ${checkOutDate}</td></tr>
                        <tr><td ${s.label}>${l.nights}</td><td ${s.value}>🌙 ${nights}</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${checkInUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                        📋 ${l.ctaLabel}
                    </a>
                </div>
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin: 16px 0 4px 0;">
                    <p style="color: #92400e; font-size: 13px; line-height: 1.6; margin: 0;">
                        ${l.important}
                    </p>
                </div>
                <p ${s.note}>${l.note}</p>
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
        `${l.checkIn}: ${checkInDate} · ${l.checkOut}: ${checkOutDate} · ${l.nights}: ${nights}`,
        l.important.replace(/<[^>]*>/g, ''),
        `Complete check-in: ${checkInUrl}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildCheckInRequestEmail };
