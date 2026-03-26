/**
 * Builds a localized (EN / CZ / ES) access information email
 * with door codes, WiFi, directions, and house rules.
 *
 * Returns { subject, html, text }
 */
function buildAccessInfoEmail({ guestName, checkInDate, checkOutDate, nights, locale = 'en' }) {

    const t = {
        en: {
            headerTitle: '🔑 Access Information',
            greeting: `Hi <strong>${guestName}</strong>,<br><br>Welcome! Here is everything you need for your stay at <strong>Verónica's Flat</strong>. Please save this email for reference.`,
            accessTitle: 'Access Information',
            buildingEntry: 'Building entrance', buildingCode: '🏢 Code: <strong>2580</strong>',
            apartmentDoor: 'Apartment door', apartmentCode: '🚪 Lockbox code: <strong>1234</strong>',
            floor: 'Floor / Door', floorValue: '2nd floor, door B',
            network: 'Network name', networkValue: 'Veronicas_Flat',
            password: 'Password', passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Your Stay',
            checkIn: 'Check-in', checkOut: 'Check-out', nightsLabel: 'Nights',
            checkInTime: 'from 15:00', checkOutTime: 'by 11:00',
            rulesTitle: 'House Rules — Please Read',
            rule1: 'No smoking inside the apartment (terrace only)',
            rule2: 'Quiet hours: 22:00 – 08:00',
            rule3: 'Please leave the apartment tidy and take out your rubbish',
            rule4: 'No pets allowed',
            rule5: 'Pool hours: 09:00 – 21:00',
            address: '📍 <strong>Address:</strong> Playa Paraíso, Adeje, Tenerife.',
            directions: 'Get directions →',
            emergency: '📞 <strong>Emergency contact:</strong> +34 600 000 000 (WhatsApp available)',
            subject: '🔑 Access Information — Paraíso',
            footerAuto: 'This is an automated message',
        },
        cs: {
            headerTitle: '🔑 Přístupové údaje',
            greeting: `Ahoj <strong>${guestName}</strong>,<br><br>Vítejte! Zde jsou všechny informace pro váš pobyt v <strong>apartmánu Verónica's Flat</strong>. Prosím uložte si tento email.`,
            accessTitle: 'Přístupové údaje',
            buildingEntry: 'Vchod do budovy', buildingCode: '🏢 Kód: <strong>2580</strong>',
            apartmentDoor: 'Dveře apartmánu', apartmentCode: '🚪 Kód schránky: <strong>1234</strong>',
            floor: 'Patro / Dveře', floorValue: '2. patro, dveře B',
            network: 'Název sítě', networkValue: 'Veronicas_Flat',
            password: 'Heslo', passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Váš pobyt',
            checkIn: 'Příjezd', checkOut: 'Odjezd', nightsLabel: 'Počet nocí',
            checkInTime: 'od 15:00', checkOutTime: 'do 11:00',
            rulesTitle: 'Domovní řád — Prosím přečtěte si',
            rule1: 'Zákaz kouření uvnitř apartmánu (pouze na terase)',
            rule2: 'Noční klid: 22:00 – 08:00',
            rule3: 'Prosím zanechte apartmán uklizený a vyhoďte odpadky',
            rule4: 'Zvířata nejsou povolena',
            rule5: 'Provozní doba bazénu: 09:00 – 21:00',
            address: '📍 <strong>Adresa:</strong> Playa Paraíso, Adeje, Tenerife.',
            directions: 'Navigace →',
            emergency: '📞 <strong>Nouzový kontakt:</strong> +34 600 000 000 (WhatsApp k dispozici)',
            subject: '🔑 Přístupové údaje — Paraíso',
            footerAuto: 'Automatická zpráva',
        },
        es: {
            headerTitle: '🔑 Información de acceso',
            greeting: `Hola <strong>${guestName}</strong>,<br><br>¡Bienvenido/a! Aquí tienes toda la información para tu estancia en <strong>Verónica's Flat</strong>. Por favor, guarda este email como referencia.`,
            accessTitle: 'Información de acceso',
            buildingEntry: 'Entrada al edificio', buildingCode: '🏢 Código: <strong>2580</strong>',
            apartmentDoor: 'Puerta del apartamento', apartmentCode: '🚪 Código caja: <strong>1234</strong>',
            floor: 'Planta / Puerta', floorValue: '2ª planta, puerta B',
            network: 'Nombre de red', networkValue: 'Veronicas_Flat',
            password: 'Contraseña', passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Tu estancia',
            checkIn: 'Entrada', checkOut: 'Salida', nightsLabel: 'Noches',
            checkInTime: 'desde las 15:00', checkOutTime: 'antes de las 11:00',
            rulesTitle: 'Normas de la casa — Por favor léelas',
            rule1: 'No fumar dentro del apartamento (solo en la terraza)',
            rule2: 'Horas de silencio: 22:00 – 08:00',
            rule3: 'Por favor deja el apartamento ordenado y saca la basura',
            rule4: 'No se admiten mascotas',
            rule5: 'Horario de piscina: 09:00 – 21:00',
            address: '📍 <strong>Dirección:</strong> Playa Paraíso, Adeje, Tenerife.',
            directions: 'Cómo llegar →',
            emergency: '📞 <strong>Contacto de emergencia:</strong> +34 600 000 000 (WhatsApp disponible)',
            subject: '🔑 Información de acceso — Paraíso',
            footerAuto: 'Mensaje automático',
        },
    };

    const l = t[locale] || t.en;

    const s = {
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        sectionBox:  'style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 16px;"',
        sectionHead: 'style="color: #065f46; margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 160px; vertical-align: top;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
    };

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #065f46, #059669); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${l.headerTitle}</h1>
                <p style="color: #bbf7d0; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa Paraíso</p>
            </div>

            <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                <p ${s.greeting}>${l.greeting}</p>

                <div ${s.sectionBox}>
                    <h3 ${s.sectionHead}>🔑 ${l.accessTitle}</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>${l.buildingEntry}</td><td ${s.value}>${l.buildingCode}</td></tr>
                        <tr><td ${s.label}>${l.apartmentDoor}</td><td ${s.value}>${l.apartmentCode}</td></tr>
                        <tr><td ${s.label}>${l.floor}</td><td ${s.value}>${l.floorValue}</td></tr>
                    </table>
                </div>
                <div ${s.sectionBox}>
                    <h3 ${s.sectionHead}>📶 WiFi</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>${l.network}</td><td ${s.value}>${l.networkValue}</td></tr>
                        <tr><td ${s.label}>${l.password}</td><td ${s.value}>${l.passwordValue}</td></tr>
                    </table>
                </div>
                <div ${s.sectionBox}>
                    <h3 ${s.sectionHead}>📅 ${l.stayTitle}</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td ${s.label}>${l.checkIn}</td><td ${s.value}>📅 ${checkInDate} · ${l.checkInTime}</td></tr>
                        <tr><td ${s.label}>${l.checkOut}</td><td ${s.value}>📅 ${checkOutDate} · ${l.checkOutTime}</td></tr>
                        <tr><td ${s.label}>${l.nightsLabel}</td><td ${s.value}>🌙 ${nights}</td></tr>
                    </table>
                </div>
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 16px;">
                    <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px; font-weight: 700;">📋 ${l.rulesTitle}</h3>
                    <p style="color: #92400e; font-size: 13px; line-height: 1.8; margin: 0;">
                        • ${l.rule1}<br>
                        • ${l.rule2}<br>
                        • ${l.rule3}<br>
                        • ${l.rule4}<br>
                        • ${l.rule5}
                    </p>
                </div>
                <p ${s.note}>${l.address} <a href="https://maps.google.com/?q=Playa+Paraiso+Adeje+Tenerife" style="color: #059669;">${l.directions}</a></p>
                <p ${s.note}>${l.emergency}</p>
            </div>

            <div style="background: #f8fafc; padding: 20px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Paraíso — Verónica's Flat · Playa Paraíso, Tenerife 🌴<br>
                    ${l.footerAuto}
                </p>
            </div>
        </div>
    `;

    const text = [
        l.greeting.replace(/<[^>]*>/g, ''),
        ``,
        `Building code: 2580`,
        `Apartment lockbox: 1234`,
        `Floor: 2nd floor, door B`,
        `WiFi: Veronicas_Flat / ParaisoWifi2026`,
        ``,
        `${l.checkIn}: ${checkInDate} ${l.checkInTime} · ${l.checkOut}: ${checkOutDate} ${l.checkOutTime} · ${l.nightsLabel}: ${nights}`,
        `Address: Playa Paraíso, Adeje, Tenerife`,
        `Emergency: +34 600 000 000`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    return { subject: l.subject, html, text };
}

module.exports = { buildAccessInfoEmail };
