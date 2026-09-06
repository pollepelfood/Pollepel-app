// Pollepel — agenda-abonnement
//
// Serveert het weekmenu van één huishouden als iCalendar-feed. Agenda-apps
// halen dit adres periodiek op, zodat een wijziging in het menu vanzelf in
// ieders agenda verschijnt. Downloaden en opnieuw importeren is dan niet meer
// nodig — en op iOS is dat downloaden ook precies wat niet goed werkt.
//
// Toegang gaat via een lange willekeurige sleutel in het adres, omdat
// agenda-apps geen inlog kunnen meesturen.

const SUPABASE_URL = "https://ucevkzircawpapsrywfv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_t0F12XeC1bPLzmZgvLWUeQ_CPat-lMn";

const APP_URL = "https://pollepel.netlify.app";

const DAG_LANG = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

// Haalt de agendagegevens op via een databasefunctie die op de sleutel werkt.
// Rechtstreeks de tabellen lezen kan niet: die zijn afgeschermd per ingelogde
// gebruiker, en een agenda-app kan niet inloggen.
async function haalFeed(token, vanafKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/weekmenu_feed`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, p_vanaf: vanafKey }),
  });
  if (!res.ok) return null;
  return await res.json();
}

// Regels mogen niet langer dan 75 tekens zijn volgens de standaard; agenda-apps
// van Apple zijn daar streng in.
function vouw(regel) {
  const bytes = [...regel];
  if (bytes.length <= 74) return regel;
  let uit = bytes.slice(0, 74).join("");
  let rest = bytes.slice(74);
  while (rest.length) {
    uit += "\r\n " + rest.slice(0, 73).join("");
    rest = rest.slice(73);
  }
  return uit;
}

function esc(tekst) {
  return String(tekst || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function stempel(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
}

function datumOnly(datumTekst) {
  return datumTekst.replace(/-/g, "");
}

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token || token.length < 20) {
    return new Response("Ongeldig of ontbrekend agenda-adres.", { status: 400 });
  }

  // Alleen het lopende en komende menu; het verleden hoeft niet in je agenda.
  const vanaf = new Date();
  vanaf.setDate(vanaf.getDate() - 14);
  const vanafKey = vanaf.toISOString().slice(0, 10);

  const feed = await haalFeed(token, vanafKey);
  if (!feed || !feed.household_name) {
    return new Response("Dit agenda-adres bestaat niet meer.", { status: 404 });
  }

  const huishouden = { name: feed.household_name, id: token.slice(0, 12) };
  const dagen = feed.days || [];

  const nu = stempel(new Date());
  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pollepel//Weekmenu//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Weekmenu ${esc(huishouden.name || "Pollepel")}`,
    "X-WR-TIMEZONE:Europe/Amsterdam",
    // Hoe vaak agenda-apps mogen verversen. Apple houdt zich hieraan.
    "X-PUBLISHED-TTL:PT2H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT2H",
    // Tijdzone expliciet meesturen. Zonder deze definitie interpreteert vooral
    // Outlook de tijden verkeerd rond de overgang naar zomer- of wintertijd.
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Amsterdam",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  dagen.forEach((d) => {
    const recept = d.recipe_id ? { id: d.recipe_id, name: d.recipe_name, emoji: d.emoji, cook_time: d.cook_time } : null;
    if (!recept && !d.off_night) return;

    const [j, mm, dd] = d.menu_date.split("-").map(Number);
    // 18:00 lokale tijd. We schrijven de tijdzone er expliciet bij, zodat de
    // zomer- en wintertijd goed vallen.
    const start = `${j}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}T180000`;
    const eind = `${j}${String(mm).padStart(2, "0")}${String(dd).padStart(2, "0")}T190000`;

    const titel = d.off_night
      ? "🍕 Geen kookavond"
      : `${recept.emoji ? recept.emoji + " " : ""}${recept.name}${d.cook ? ` — ${d.cook} kookt` : ""}`;

    const omschrijving = [];
    if (recept) {
      if (d.cook) omschrijving.push(`Kok: ${d.cook}`);
      if (d.double_portion) omschrijving.push("Dubbele portie — helft voor de vriezer");
      if (recept.cook_time) omschrijving.push(`Kooktijd: ${recept.cook_time} minuten`);
      omschrijving.push(`Recept openen: ${APP_URL}/?recept=${recept.id}`);
    } else {
      omschrijving.push("Vanavond kookt er niemand.");
    }

    regels.push(
      "BEGIN:VEVENT",
      vouw(`UID:${d.menu_date}-${huishouden.id}@pollepel`),
      `DTSTAMP:${nu}`,
      `DTSTART;TZID=Europe/Amsterdam:${start}`,
      `DTEND;TZID=Europe/Amsterdam:${eind}`,
      vouw(`SUMMARY:${esc(titel)}`),
      vouw(`DESCRIPTION:${esc(omschrijving.join("\n"))}`),
      recept ? vouw(`URL:${APP_URL}/?recept=${recept.id}`) : "",
      "END:VEVENT"
    );
  });

  // Boodschappendag als hele dag, zodat je hem in je weekoverzicht ziet staan.
  const boodschappendag = feed.shopping_day == null ? 6 : Number(feed.shopping_day);
  const vandaag = new Date();
  for (let i = 0; i < 56; i++) {
    const d = new Date(vandaag);
    d.setDate(vandaag.getDate() + i);
    if (d.getDay() !== boodschappendag) continue;
    const sleutel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const volgende = new Date(d);
    volgende.setDate(d.getDate() + 1);
    const volgendeSleutel = `${volgende.getFullYear()}-${String(volgende.getMonth() + 1).padStart(2, "0")}-${String(volgende.getDate()).padStart(2, "0")}`;
    regels.push(
      "BEGIN:VEVENT",
      vouw(`UID:boodschappen-${sleutel}-${huishouden.id}@pollepel`),
      `DTSTAMP:${nu}`,
      `DTSTART;VALUE=DATE:${datumOnly(sleutel)}`,
      `DTEND;VALUE=DATE:${datumOnly(volgendeSleutel)}`,
      "SUMMARY:🛒 Boodschappendag",
      vouw(`DESCRIPTION:${esc(`Je boodschappenlijst staat klaar in Pollepel.\n${APP_URL}/#boodschappen`)}`),
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }

  regels.push("END:VCALENDAR");
  const ics = regels.filter(Boolean).join("\r\n");

  return new Response(ics, {
    status: 200,
    headers: {
      // Het juiste type is essentieel: bij application/octet-stream weigert
      // iOS de overdracht naar de Agenda-app.
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="pollepel-weekmenu.ics"',
      "Cache-Control": "public, max-age=900",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const config = {
  path: "/agenda/weekmenu.ics",
};
