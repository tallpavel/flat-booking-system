/**
 * Builds a multilingual (EN / CZ / ES) access information email
 * with door codes, WiFi, directions, and house rules.
 *
 * Returns { subject, html, text }
 */
function buildAccessInfoEmail({ guestName, checkInDate, checkOutDate, nights }) {

    const s = {
        langHeader:  'style="color: #065f46; margin: 24px 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;"',
        greeting:    'style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"',
        sectionBox:  'style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 16px;"',
        sectionHead: 'style="color: #065f46; margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;"',
        label:       'style="padding: 5px 0; color: #64748b; font-size: 13px; width: 160px; vertical-align: top;"',
        value:       'style="padding: 5px 0; color: #1e293b; font-size: 15px; font-weight: 600;"',
        note:        'style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 4px 0;"',
        ruleBox:     'style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 16px;"',
        ruleP:       'style="color: #92400e; font-size: 13px; line-height: 1.8; margin: 0;"',
        divider:     'style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"',
    };

    function accessTable(labels) {
        return `
            <div ${s.sectionBox}>
                <h3 ${s.sectionHead}>🔑 ${labels.accessTitle}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td ${s.label}>${labels.buildingEntry}</td><td ${s.value}>${labels.buildingCode}</td></tr>
                    <tr><td ${s.label}>${labels.apartmentDoor}</td><td ${s.value}>${labels.apartmentCode}</td></tr>
                    <tr><td ${s.label}>${labels.floor}</td><td ${s.value}>${labels.floorValue}</td></tr>
                </table>
            </div>
            <div ${s.sectionBox}>
                <h3 ${s.sectionHead}>📶 WiFi</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td ${s.label}>${labels.network}</td><td ${s.value}>${labels.networkValue}</td></tr>
                    <tr><td ${s.label}>${labels.password}</td><td ${s.value}>${labels.passwordValue}</td></tr>
                </table>
            </div>
            <div ${s.sectionBox}>
                <h3 ${s.sectionHead}>📅 ${labels.stayTitle}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td ${s.label}>${labels.checkIn}</td><td ${s.value}>📅 ${checkInDate} · ${labels.checkInTime}</td></tr>
                    <tr><td ${s.label}>${labels.checkOut}</td><td ${s.value}>📅 ${checkOutDate} · ${labels.checkOutTime}</td></tr>
                    <tr><td ${s.label}>${labels.nightsLabel}</td><td ${s.value}>🌙 ${nights}</td></tr>
                </table>
            </div>`;
    }

    function rulesBox(labels) {
        return `
            <div ${s.ruleBox}>
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px; font-weight: 700;">📋 ${labels.rulesTitle}</h3>
                <p ${s.ruleP}>
                    • ${labels.rule1}<br>
                    • ${labels.rule2}<br>
                    • ${labels.rule3}<br>
                    • ${labels.rule4}<br>
                    • ${labels.rule5}
                </p>
            </div>`;
    }

    const englishSection = `
        <p ${s.langHeader}>🇬🇧 English</p>
        <p ${s.greeting}>
            Hi <strong>${guestName}</strong>,<br><br>
            Welcome! Here is everything you need for your stay at <strong>Verónica's Flat</strong>. Please save this email for reference.
        </p>
        ${accessTable({
            accessTitle: 'Access Information',
            buildingEntry: 'Building entrance',
            buildingCode: '🏢 Code: <strong>2580</strong>',
            apartmentDoor: 'Apartment door',
            apartmentCode: '🚪 Lockbox code: <strong>1234</strong>',
            floor: 'Floor / Door',
            floorValue: '2nd floor, door B',
            network: 'Network name',
            networkValue: 'Veronicas_Flat',
            password: 'Password',
            passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Your Stay',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            nightsLabel: 'Nights',
            checkInTime: 'from 15:00',
            checkOutTime: 'by 11:00',
        })}
        ${rulesBox({
            rulesTitle: 'House Rules — Please Read',
            rule1: 'No smoking inside the apartment (terrace only)',
            rule2: 'Quiet hours: 22:00 – 08:00',
            rule3: 'Please leave the apartment tidy and take out your rubbish',
            rule4: 'No pets allowed',
            rule5: 'Pool hours: 09:00 – 21:00',
        })}
        <p ${s.note}>📍 <strong>Address:</strong> Playa Paraíso, Adeje, Tenerife. <a href="https://maps.google.com/?q=Playa+Paraiso+Adeje+Tenerife" style="color: #059669;">Get directions →</a></p>
        <p ${s.note}>📞 <strong>Emergency contact:</strong> +34 600 000 000 (WhatsApp available)</p>
    `;

    const czechSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇨🇿 Česky</p>
        <p ${s.greeting}>
            Ahoj <strong>${guestName}</strong>,<br><br>
            Vítejte! Zde jsou všechny informace pro váš pobyt v <strong>apartmánu Verónica's Flat</strong>. Prosím uložte si tento email.
        </p>
        ${accessTable({
            accessTitle: 'Přístupové údaje',
            buildingEntry: 'Vchod do budovy',
            buildingCode: '🏢 Kód: <strong>2580</strong>',
            apartmentDoor: 'Dveře apartmánu',
            apartmentCode: '🚪 Kód schránky: <strong>1234</strong>',
            floor: 'Patro / Dveře',
            floorValue: '2. patro, dveře B',
            network: 'Název sítě',
            networkValue: 'Veronicas_Flat',
            password: 'Heslo',
            passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Váš pobyt',
            checkIn: 'Příjezd',
            checkOut: 'Odjezd',
            nightsLabel: 'Počet nocí',
            checkInTime: 'od 15:00',
            checkOutTime: 'do 11:00',
        })}
        ${rulesBox({
            rulesTitle: 'Domovní řád — Prosím přečtěte si',
            rule1: 'Zákaz kouření uvnitř apartmánu (pouze na terase)',
            rule2: 'Noční klid: 22:00 – 08:00',
            rule3: 'Prosím zanechte apartmán uklizený a vyhoďte odpadky',
            rule4: 'Zvířata nejsou povolena',
            rule5: 'Provozní doba bazénu: 09:00 – 21:00',
        })}
        <p ${s.note}>📍 <strong>Adresa:</strong> Playa Paraíso, Adeje, Tenerife. <a href="https://maps.google.com/?q=Playa+Paraiso+Adeje+Tenerife" style="color: #059669;">Navigace →</a></p>
        <p ${s.note}>📞 <strong>Nouzový kontakt:</strong> +34 600 000 000 (WhatsApp k dispozici)</p>
    `;

    const spanishSection = `
        <hr ${s.divider} />
        <p ${s.langHeader}>🇪🇸 Español</p>
        <p ${s.greeting}>
            Hola <strong>${guestName}</strong>,<br><br>
            ¡Bienvenido/a! Aquí tienes toda la información para tu estancia en <strong>Verónica's Flat</strong>. Por favor, guarda este email como referencia.
        </p>
        ${accessTable({
            accessTitle: 'Información de acceso',
            buildingEntry: 'Entrada al edificio',
            buildingCode: '🏢 Código: <strong>2580</strong>',
            apartmentDoor: 'Puerta del apartamento',
            apartmentCode: '🚪 Código caja: <strong>1234</strong>',
            floor: 'Planta / Puerta',
            floorValue: '2ª planta, puerta B',
            network: 'Nombre de red',
            networkValue: 'Veronicas_Flat',
            password: 'Contraseña',
            passwordValue: 'ParaisoWifi2026',
            stayTitle: 'Tu estancia',
            checkIn: 'Entrada',
            checkOut: 'Salida',
            nightsLabel: 'Noches',
            checkInTime: 'desde las 15:00',
            checkOutTime: 'antes de las 11:00',
        })}
        ${rulesBox({
            rulesTitle: 'Normas de la casa — Por favor léelas',
            rule1: 'No fumar dentro del apartamento (solo en la terraza)',
            rule2: 'Horas de silencio: 22:00 – 08:00',
            rule3: 'Por favor deja el apartamento ordenado y saca la basura',
            rule4: 'No se admiten mascotas',
            rule5: 'Horario de piscina: 09:00 – 21:00',
        })}
        <p ${s.note}>📍 <strong>Dirección:</strong> Playa Paraíso, Adeje, Tenerife. <a href="https://maps.google.com/?q=Playa+Paraiso+Adeje+Tenerife" style="color: #059669;">Cómo llegar →</a></p>
        <p ${s.note}>📞 <strong>Contacto de emergencia:</strong> +34 600 000 000 (WhatsApp disponible)</p>
    `;

    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #065f46, #059669); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">🔑 Access Information</h1>
                <p style="color: #bbf7d0; margin: 0; font-size: 14px;">Paraíso — Verónica's Flat · Playa Paraíso</p>
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
                    Paraíso — Verónica's Flat · Playa Paraíso, Tenerife 🌴<br>
                    This is an automated message · Mensaje automático · Automatická zpráva
                </p>
            </div>
        </div>
    `;

    const text = [
        `— ENGLISH —`,
        `Hi ${guestName},`,
        `Here is your access information for Verónica's Flat.`,
        ``,
        `Building entrance code: 2580`,
        `Apartment lockbox code: 1234`,
        `Floor: 2nd floor, door B`,
        `WiFi: Veronicas_Flat / ParaisoWifi2026`,
        ``,
        `Check-in: ${checkInDate} from 15:00 · Check-out: ${checkOutDate} by 11:00 · Nights: ${nights}`,
        `Address: Playa Paraíso, Adeje, Tenerife`,
        `Emergency: +34 600 000 000`,
        ``,
        `— ČESKY —`,
        `Ahoj ${guestName},`,
        `Zde jsou přístupové údaje pro Verónica's Flat.`,
        ``,
        `Kód vchodu: 2580`,
        `Kód schránky apartmánu: 1234`,
        `Patro: 2. patro, dveře B`,
        `WiFi: Veronicas_Flat / ParaisoWifi2026`,
        ``,
        `Příjezd: ${checkInDate} od 15:00 · Odjezd: ${checkOutDate} do 11:00 · Nocí: ${nights}`,
        ``,
        `— ESPAÑOL —`,
        `Hola ${guestName},`,
        `Aquí tienes la información de acceso para Verónica's Flat.`,
        ``,
        `Código entrada edificio: 2580`,
        `Código caja apartamento: 1234`,
        `Planta: 2ª planta, puerta B`,
        `WiFi: Veronicas_Flat / ParaisoWifi2026`,
        ``,
        `Entrada: ${checkInDate} desde 15:00 · Salida: ${checkOutDate} antes de 11:00 · Noches: ${nights}`,
        ``,
        `— Paraíso, Verónica's Flat`,
    ].join("\n");

    const subject = `🔑 Access Information · Información de acceso — Paraíso`;

    return { subject, html, text };
}

module.exports = { buildAccessInfoEmail };
