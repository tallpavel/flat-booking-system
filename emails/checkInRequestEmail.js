/**
 * Builds a localized (EN / CZ / ES) check-in request email
 * with a link to the online check-in form.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, ctaButton, greeting, note, formatDate, tokens } = require('./emailLayout');

function buildCheckInRequestEmail({ guestName, checkInDate, checkOutDate, nights, checkInUrl, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Online Check-In',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Your stay is approaching! Please complete the online check-in form <strong>before you arrive</strong>.<br>We need the details of <strong>all guests</strong> who will be staying at the apartment.`,
            checkIn: 'Check-in', checkOut: 'Check-out', nights: 'Nights',
            ctaLabel: 'Complete Online Check-In',
            important: '🔑 <strong>Important:</strong> Access details — including door codes, WiFi credentials, and arrival instructions — will only be provided once all guests have been registered through this form. Please complete it at your earliest convenience to ensure a smooth arrival.',
            noteText: '📌 You can update the information anytime by reopening the same link.',
            subject: '📋 Online Check-In — Paraíso',
        },
        cs: {
            heading: 'Online Check-In',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Váš pobyt se blíží! Prosím vyplňte online formulář pro check-in <strong>před příjezdem</strong>.<br>Potřebujeme údaje <strong>všech hostů</strong>, kteří budou v apartmánu bydlet.`,
            checkIn: 'Příjezd', checkOut: 'Odjezd', nights: 'Počet nocí',
            ctaLabel: 'Vyplnit online check-in',
            important: '🔑 <strong>Důležité:</strong> Přístupové údaje — včetně kódů ke dveřím, přihlašovacích údajů k WiFi a pokynů k příjezdu — budou poskytnuty až po registraci všech hostů prostřednictvím tohoto formuláře. Prosím vyplňte jej co nejdříve, aby váš příjezd proběhl hladce.',
            noteText: '📌 Údaje můžete kdykoli upravit otevřením stejného odkazu.',
            subject: '📋 Online Check-In — Paraíso',
        },
        es: {
            heading: 'Check-In Online',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Tu estancia se acerca! Por favor completa el formulario de check-in online <strong>antes de llegar</strong>.<br>Necesitamos los datos de <strong>todos los huéspedes</strong> que se alojarán en el apartamento.`,
            checkIn: 'Entrada', checkOut: 'Salida', nights: 'Noches',
            ctaLabel: 'Completar check-in online',
            important: '🔑 <strong>Importante:</strong> Los datos de acceso — incluyendo códigos de entrada, credenciales WiFi e instrucciones de llegada — solo se proporcionarán una vez que todos los huéspedes hayan sido registrados a través de este formulario. Por favor, complétalo lo antes posible para garantizar una llegada sin contratiempos.',
            noteText: '📌 Puedes actualizar la información en cualquier momento reabriendo el mismo enlace.',
            subject: '📋 Check-In Online — Paraíso',
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    // Important callout box
    const importantBox = `<div style="background: ${tokens.sand}; border: 1px solid ${tokens.gold}; border-radius: 12px; padding: 16px 20px; margin: 16px 0 4px 0;">
        <p style="color: ${tokens.navy}; font-size: 13px; line-height: 1.6; margin: 0;">${l.important}</p>
    </div>`;

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),
        detailsCard({
            accentColor: tokens.gold,
            rows: [
                [l.checkIn, `📅 ${fmtIn}`],
                [l.checkOut, `📅 ${fmtOut}`],
                [l.nights, `🌙 ${nights}`],
            ],
        }),
        ctaButton({ label: `📋 ${l.ctaLabel}`, url: checkInUrl }),
        importantBox,
        note(l.noteText),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        `${l.checkIn}: ${fmtIn} · ${l.checkOut}: ${fmtOut} · ${l.nights}: ${nights}`,
        l.important.replace(/<[^>]*>/g, ''),
        `Complete check-in: ${checkInUrl}`,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildCheckInRequestEmail };
