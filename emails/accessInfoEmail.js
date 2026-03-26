/**
 * Builds a localized (EN / CZ / ES) access information email
 * with door codes, WiFi, directions, and house rules.
 *
 * Returns { subject, html, text }
 */
const { wrapEmail, sectionHeading, detailsCard, greeting, note, formatDate, tokens } = require('./emailLayout');

function buildAccessInfoEmail({ guestName, checkInDate, checkOutDate, nights, locale = 'en' }) {

    const t = {
        en: {
            heading: 'Access Information',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Welcome! Here is everything you need for your stay at <strong>Verónica's Flat</strong>. Please save this email for reference.`,
            accessTitle: 'Access Information',
            buildingEntry: 'Building entrance', buildingCode: '🏢 Code: <strong>2580</strong>',
            apartmentDoor: 'Apartment door', apartmentCode: '🚪 Lockbox code: <strong>1234</strong>',
            floor: 'Floor / Door', floorValue: '2nd floor, door B',
            wifiTitle: 'WiFi',
            network: 'Network name', networkValue: 'Veronicas_Flat',
            password: 'Password', passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Your Stay',
            checkIn: 'Check-in', checkOut: 'Check-out', nightsLabel: 'Nights',
            checkInTime: 'from 15:00', checkOutTime: 'by 11:00',
            rulesTitle: 'House Rules — Please Read',
            rules: [
                'No smoking inside the apartment (terrace only)',
                'Quiet hours: 22:00 – 08:00',
                'Please leave the apartment tidy and take out your rubbish',
                'No pets allowed',
                'Pool hours: 09:00 – 21:00',
            ],
            address: '📍 <strong>Address:</strong> Playa Paraíso, Adeje, Tenerife.',
            directions: 'Get directions →',
            emergency: '📞 <strong>Emergency contact:</strong> +34 600 000 000 (WhatsApp available)',
            subject: '🔑 Access Information — Paraíso',
        },
        cs: {
            heading: 'Přístupové údaje',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vítejte! Zde jsou všechny informace pro váš pobyt v <strong>apartmánu Verónica's Flat</strong>. Prosím uložte si tento email.`,
            accessTitle: 'Přístupové údaje',
            buildingEntry: 'Vchod do budovy', buildingCode: '🏢 Kód: <strong>2580</strong>',
            apartmentDoor: 'Dveře apartmánu', apartmentCode: '🚪 Kód schránky: <strong>1234</strong>',
            floor: 'Patro / Dveře', floorValue: '2. patro, dveře B',
            wifiTitle: 'WiFi',
            network: 'Název sítě', networkValue: 'Veronicas_Flat',
            password: 'Heslo', passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Váš pobyt',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nightsLabel: 'Počet nocí',
            checkInTime: 'od 15:00', checkOutTime: 'do 11:00',
            rulesTitle: 'Domovní řád — Prosím přečtěte si',
            rules: [
                'Zákaz kouření uvnitř apartmánu (pouze na terase)',
                'Noční klid: 22:00 – 08:00',
                'Prosím zanechte apartmán uklizený a vyhoďte odpadky',
                'Zvířata nejsou povolena',
                'Provozní doba bazénu: 09:00 – 21:00',
            ],
            address: '📍 <strong>Adresa:</strong> Playa Paraíso, Adeje, Tenerife.',
            directions: 'Navigace →',
            emergency: '📞 <strong>Nouzový kontakt:</strong> +34 600 000 000 (WhatsApp k dispozici)',
            subject: '🔑 Přístupové údaje — Paraíso',
        },
        es: {
            heading: 'Información de acceso',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Bienvenido/a! Aquí tienes toda la información para tu estancia en <strong>Verónica's Flat</strong>. Por favor, guarda este email como referencia.`,
            accessTitle: 'Información de acceso',
            buildingEntry: 'Entrada al edificio', buildingCode: '🏢 Código: <strong>2580</strong>',
            apartmentDoor: 'Puerta del apartamento', apartmentCode: '🚪 Código caja: <strong>1234</strong>',
            floor: 'Planta / Puerta', floorValue: '2ª planta, puerta B',
            wifiTitle: 'WiFi',
            network: 'Nombre de red', networkValue: 'Veronicas_Flat',
            password: 'Contraseña', passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Tu estancia',
            checkIn: 'Entrada', checkOut: 'Salida', nightsLabel: 'Noches',
            checkInTime: 'desde las 15:00', checkOutTime: 'antes de las 11:00',
            rulesTitle: 'Normas de la casa — Por favor léelas',
            rules: [
                'No fumar dentro del apartamento (solo en la terraza)',
                'Horas de silencio: 22:00 – 08:00',
                'Por favor deja el apartamento ordenado y saca la basura',
                'No se admiten mascotas',
                'Horario de piscina: 09:00 – 21:00',
            ],
            address: '📍 <strong>Dirección:</strong> Playa Paraíso, Adeje, Tenerife.',
            directions: 'Cómo llegar →',
            emergency: '📞 <strong>Contacto de emergencia:</strong> +34 600 000 000 (WhatsApp disponible)',
            subject: '🔑 Información de acceso — Paraíso',
        },
    };

    const l = t[locale] || t.en;

    const fmtIn = formatDate(checkInDate, locale);
    const fmtOut = formatDate(checkOutDate, locale);

    // House rules callout
    const rulesHtml = l.rules.map(r => `• ${r}`).join('<br>');
    const rulesBox = `<div style="background: ${tokens.sand}; border: 1px solid ${tokens.gold}; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        <h3 style="color: ${tokens.navy}; margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700;">📋 ${l.rulesTitle}</h3>
        <p style="color: ${tokens.bodyText}; font-size: 13px; line-height: 1.8; margin: 0;">${rulesHtml}</p>
    </div>`;

    // Section sub-heading helper
    const subHead = (text) => `<h3 style="margin: 24px 0 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: ${tokens.warmGray}; text-transform: uppercase; letter-spacing: 1px;">${text}</h3>`;

    const content = [
        sectionHeading(l.heading),
        greeting(l.greeting),

        // Access
        subHead(`🔑 ${l.accessTitle}`),
        detailsCard({
            accentColor: tokens.navy,
            rows: [
                [l.buildingEntry, l.buildingCode],
                [l.apartmentDoor, l.apartmentCode],
                [l.floor, l.floorValue],
            ],
        }),

        // WiFi
        subHead(`📶 ${l.wifiTitle}`),
        detailsCard({
            accentColor: tokens.navy,
            rows: [
                [l.network, l.networkValue],
                [l.password, l.passwordValue],
            ],
        }),

        // Stay
        subHead(`📅 ${l.stayTitle}`),
        detailsCard({
            accentColor: tokens.navy,
            rows: [
                [l.checkIn, `📅 ${fmtIn} · ${l.checkInTime}`],
                [l.checkOut, `📅 ${fmtOut} · ${l.checkOutTime}`],
                [l.nightsLabel, `🌙 ${nights}`],
            ],
        }),

        // Rules
        rulesBox,

        // Address & emergency
        note(`${l.address} <a href="https://maps.google.com/?q=Playa+Paraiso+Adeje+Tenerife" style="color: ${tokens.coral};">${l.directions}</a>`),
        note(l.emergency),
    ].join('\n');

    const html = wrapEmail({ content, locale });

    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        ``,
        `Building code: 2580`,
        `Apartment lockbox: 1234`,
        `Floor: 2nd floor, door B`,
        `WiFi: Veronicas_Flat / ParaisoWifi2026`,
        ``,
        `${l.checkIn}: ${fmtIn} ${l.checkInTime} · ${l.checkOut}: ${fmtOut} ${l.checkOutTime} · ${l.nightsLabel}: ${nights}`,
        `Address: Playa Paraíso, Adeje, Tenerife`,
        `Emergency: +34 600 000 000`,
        ``,
        `— Verónica's Flat, Playa Paraíso`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildAccessInfoEmail };
