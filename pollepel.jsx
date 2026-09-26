import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChefHat, Star, Plus, Minus, Trash2, Check, ShoppingCart, Package,
  Clock, Users, Search, X, Pencil, ChevronLeft, AlertTriangle, Loader2,
  Flame, CheckCircle2, Sparkles, Link2, ClipboardPaste, Camera, ScanLine,
  ArrowDownCircle, ArrowUpCircle, CalendarDays, Share2, Download,
  Sandwich, ClipboardList, ImagePlus, Wand2, Settings, Copy, LogOut,
  Printer, UserPlus, Shuffle, WifiOff, CalendarClock, StickyNote, Sun,
  Moon, ChevronUp, ChevronDown, ChevronRight, Tag, Mic, Timer as TimerIcon, SlidersHorizontal,
} from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Vaste referentielijsten                                          */
/* ---------------------------------------------------------------- */

const UNITS = ["stuks", "g", "kg", "ml", "l", "eetlepel", "theelepel", "snufje"];

const WEEK_DAYS = [
  { key: "ma", label: "Maandag" },
  { key: "di", label: "Dinsdag" },
  { key: "wo", label: "Woensdag" },
  { key: "do", label: "Donderdag" },
  { key: "vr", label: "Vrijdag" },
  { key: "za", label: "Zaterdag" },
  { key: "zo", label: "Zondag" },
];

// ---- Weekmenu op datum ----
// De week begint op de boodschappendag die het huishouden instelt, niet op
// maandag. Je plant immers tot je volgende keer boodschappen doet.
// shoppingDay volgt de JS-conventie: 0 = zondag, 1 = maandag ... 6 = zaterdag.

const DAG_KORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const DAG_LANG = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MAAND_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const MAAND_LANG = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

// Datum als YYYY-MM-DD in lokale tijd. Bewust niet toISOString(): die rekent
// om naar UTC en zet in Nederland een avonddatum een dag terug.
function dateKey(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseDateKey(sleutel) {
  const [j, m, d] = String(sleutel).split("-").map(Number);
  return new Date(j, m - 1, d);
}

function addDays(d, n) {
  const uit = new Date(d);
  uit.setDate(uit.getDate() + n);
  uit.setHours(0, 0, 0, 0);
  return uit;
}

function startOfDay(d) {
  const uit = new Date(d);
  uit.setHours(0, 0, 0, 0);
  return uit;
}

// Eerste dag van de periode waar een datum in valt.
// Valt de datum op de boodschappendag zelf, dan begint die dag de nieuwe periode.
function periodStart(datum, shoppingDay) {
  const d = startOfDay(datum);
  const verschil = (d.getDay() - Number(shoppingDay) + 7) % 7;
  return addDays(d, -verschil);
}

// De vier periodes die je kunt plannen: de lopende plus drie vooruit.
function planningPeriods(shoppingDay, aantal = 4, vandaag = new Date()) {
  const eerste = periodStart(vandaag, shoppingDay);
  return Array.from({ length: aantal }, (_, i) => {
    const start = addDays(eerste, i * 7);
    const eind = addDays(start, 6);
    return {
      index: i,
      start,
      eind,
      startKey: dateKey(start),
      dagen: Array.from({ length: 7 }, (_, n) => addDays(start, n)),
    };
  });
}

// "3 sep" voor op een tabblad
function kortDatum(d) {
  return `${d.getDate()} ${MAAND_KORT[d.getMonth()]}`;
}

// "Woensdag 3 t/m dinsdag 9 september"
function periodeLabel(start, eind) {
  const zelfdeMaand = start.getMonth() === eind.getMonth();
  const eersteDeel = `${DAG_LANG[start.getDay()]} ${start.getDate()}${zelfdeMaand ? "" : " " + MAAND_LANG[start.getMonth()]}`;
  return `${eersteDeel} t/m ${DAG_LANG[eind.getDay()]} ${eind.getDate()} ${MAAND_LANG[eind.getMonth()]}`;
}

// "Gevarieerd" is geen stijl maar een verdeling: elke dag een andere.
// Een hele week hetzelfde soort gerecht is precies wat je niet wilt.
// Op volgorde van getDay(): 0 = zondag ... 6 = zaterdag.
// Doordeweeks snel, donderdag iets om voor te bereiden, in het weekend de tijd.
// Wat voor soort gerecht een dag mag zijn. Niet iedereen eet elke dag vlees,
// en wie geen vis lust wil dat per dag kunnen sturen in plaats van alleen via
// een algemene afkeur.
const SOORTEN = [
  { id: "alles", label: "Maakt niet uit", icon: "🍽️", opdracht: "" },
  { id: "vlees", label: "Vlees", icon: "🥩", opdracht: "Het hoofdingrediënt is vlees (kip, rund, varken of gehakt)." },
  { id: "vis", label: "Vis", icon: "🐟", opdracht: "Het hoofdingrediënt is vis of schaaldieren." },
  { id: "vega", label: "Vegetarisch", icon: "🥦", opdracht: "Het gerecht is vegetarisch: geen vlees en geen vis." },
  { id: "geenvis", label: "Geen vis", icon: "🚫", opdracht: "Gebruik geen vis of schaaldieren." },
];

const GEVARIEERDE_VERDELING = [
  "uitgebreid",  // zondag
  "snel",        // maandag
  "snel",        // dinsdag
  "gezond",      // woensdag
  "miseplace",   // donderdag
  "gezond",      // vrijdag
  "uitgebreid",  // zaterdag
];

const MEAL_STYLES = [
  { id: "snel", label: "Eenvoudig en snel", icon: "⚡", description: "klaar binnen circa 20-25 minuten, weinig ingrediënten en minimale voorbereiding" },
  { id: "gezond", label: "Gezond", icon: "🥦", description: "veel groenten en volwaardige eiwitten, weinig bewerkte producten, in balans" },
  { id: "miseplace", label: "Mise en place", icon: "🔪", description: "onderdelen zijn vooraf te snijden, marineren of portioneren — geschikt om een deel al eerder voor te bereiden" },
  { id: "uitgebreid", label: "Uitgebreid", icon: "🍷", description: "meer tijd en stappen, een verfijnder gerecht, gerust wat meer ingrediënten en een langere bereiding" },
];

// Nederlandse seizoenskalender voor groente & fruit (globale indicatie, geen exacte bron).
// Index 0 = januari ... 11 = december.
const SEASONAL_PRODUCE = [
  ["boerenkool", "spruitjes", "prei", "witlof", "andijvie", "pastinaak", "knolselderij", "rode kool"],
  ["boerenkool", "spruitjes", "prei", "witlof", "andijvie", "pastinaak", "knolselderij", "veldsla"],
  ["prei", "witlof", "spinazie", "raapstelen", "rabarber", "veldsla"],
  ["spinazie", "radijs", "raapstelen", "rabarber", "asperges", "bospeen"],
  ["asperges", "spinazie", "radijs", "bospeen", "doperwten", "aardbeien"],
  ["asperges", "doperwten", "sla", "aardbeien", "kers", "bospeen"],
  ["sla", "komkommer", "courgette", "tomaat", "bloemkool", "aardbeien", "kers", "bosbes"],
  ["tomaat", "courgette", "komkommer", "paprika", "bloemkool", "bosbes", "framboos", "pruim"],
  ["pompoen", "prei", "bloemkool", "spruitjes", "peer", "appel", "druif", "framboos"],
  ["pompoen", "prei", "spruitjes", "boerenkool", "knolselderij", "appel", "peer", "pastinaak"],
  ["boerenkool", "spruitjes", "prei", "witlof", "knolselderij", "pastinaak", "rode kool", "appel"],
  ["boerenkool", "spruitjes", "witlof", "rode kool", "andijvie", "pastinaak"],
];

function seasonalProduceNow() {
  return SEASONAL_PRODUCE[new Date().getMonth()];
}

// Volgorde volgt de looproute door een supermarkt: bij de groente naar binnen,
// via zuivel en vlees naar de schappen, en diepvries als laatste zodat het niet
// staat te ontdooien. De boodschappenlijst gebruikt dezelfde volgorde.
const CATEGORIES = [
  "Groente & fruit",
  "Brood & bakkerij",
  "Zuivel & eieren",
  "Kaas",
  "Vlees & vis",
  "Vega & vleesvervangers",
  "Maaltijden & salades",
  "Pasta, rijst & wereldkeuken",
  "Soepen, sauzen & conserven",
  "Ontbijt & broodbeleg",
  "Koek & snoep",
  "Chips, noten & borrel",
  "Dranken",
  "Olie, azijn & basis",
  "Bakken & zoetwaren",
  "Kruiden & specerijen",
  "Diepvries",
  "Huishouden",
  "Overig",
];

const COMMON_GROCERY_ITEMS = [
  "Halfvolle melk", "Volle melk", "Karnemelk", "Boter", "Margarine", "Eieren",
  "Jong belegen kaas", "Oude kaas", "Roomkaas", "Mozzarella", "Bruin brood", "Wit brood",
  "Aardappelen", "Uien", "Knoflook", "Tomaten", "Komkommer", "Sla", "Wortels", "Paprika",
  "Appels", "Bananen", "Sinaasappels", "Citroenen", "Avocado", "Champignons",
  "Kipfilet", "Gehakt", "Spekjes", "Bacon", "Zalmfilet", "Tonijn in blik",
  "Spaghetti", "Macaroni", "Rijst", "Bloem", "Suiker", "Zout", "Peper",
  "Olijfolie", "Zonnebloemolie", "Azijn", "Mosterd", "Mayonaise", "Ketchup", "Sojasaus",
  "Couscous", "Rode linzen", "Kikkererwten (blik)", "Bruine bonen (blik)",
  "Yoghurt", "Kwark", "Slagroom", "Kookroom", "Pindakaas", "Jam", "Honing",
  "Koffie", "Thee", "Cornflakes", "Havermout", "Bouillonblokjes",
  "Tomatenblokjes (blik)", "Tomatenpuree", "Pastasaus", "Pesto",
];

/* ---------------------------------------------------------------- */
/*  Merk-identiteit                                                  */
/* ---------------------------------------------------------------- */

const LIGHT_PALETTE = {
  blue: "#1F3F66",
  blueDeep: "#152C48",
  blueSoft: "#4A6C8F",
  ceramic: "#EAE7DC",
  ceramicDark: "#DAD5C6",
  paper: "#F6F4EE",
  mustard: "#D9A441",
  mustardDeep: "#B4832C",
  brick: "#B5533C",
  sage: "#54744F",
  ink: "#1C1D1B",
  inkSoft: "#5B5C57",
  cardBg: "#ffffff",
  borderTint: "rgba(31,63,102,0.16)",
  warnBg: "#F1DCC9",
  successBg: "#EEF3EC",
  noteBg: "#FBF3E3",
};

const DARK_PALETTE = {
  blue: "#4A7BAE",
  blueDeep: "#0E1A2B",
  blueSoft: "#8FA9C4",
  ceramic: "#181B22",
  ceramicDark: "#33373F",
  paper: "#20242C",
  mustard: "#E3B155",
  mustardDeep: "#F0C878",
  brick: "#D97862",
  sage: "#8AB08F",
  ink: "#F0EEE6",
  inkSoft: "#A8A69C",
  cardBg: "#242832",
  borderTint: "rgba(143,169,196,0.22)",
  warnBg: "#3D2B22",
  successBg: "#1F2B22",
  noteBg: "#332A18",
};

// let (niet const): de app wisselt het thema door de eigenschappen van dit object te
// overschrijven (zie applyTheme), zodat alle bestaande C.xxx-verwijzingen door de hele
// app automatisch het nieuwe thema volgen zonder dat elk component aangepast hoeft te worden.
let C = { ...LIGHT_PALETTE };

function applyTheme(dark) {
  Object.assign(C, dark ? DARK_PALETTE : LIGHT_PALETTE);
  // De buitenste paginabreedte-achtergrond (buiten React's bereik) los meesturen,
  // anders blijft die bij overscrollen de oude, lichte kleur tonen.
  if (typeof document !== "undefined") {
    const bg = dark ? DARK_PALETTE.ceramic : LIGHT_PALETTE.ceramic;
    const tekst = dark ? DARK_PALETTE.ink : LIGHT_PALETTE.ink;
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    // Zonder basiskleur valt alles wat zelf geen kleur meegeeft terug op zwart.
    // In donkere modus is dat vrijwel onleesbaar — precies wat er misging bij
    // de ingrediëntenlijst en de kopjes op de receptpagina.
    document.documentElement.style.color = tekst;
    document.body.style.color = tekst;
  }
}

// Versie van deze build. Staat onderaan Instellingen, zodat in één oogopslag
// duidelijk is of een oplevering daadwerkelijk is aangekomen — in plaats van
// te moeten raden of de browser nog iets ouds serveert.
const APP_VERSIE = "v70 · 25 september 2026";

const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Work Sans', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const TILE_GRADIENTS = [
  ["#1F3F66", "#4A6C8F"],
  ["#B5533C", "#D9A441"],
  ["#5E7F63", "#8AAE8E"],
  ["#B4832C", "#D9A441"],
  ["#152C48", "#4A6C8F"],
];

/* ---------------------------------------------------------------- */
/*  Voorbeelddata                                                    */
/* ---------------------------------------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 10);
const round2 = (n) => Math.round(n * 100) / 100;
const norm = (s) => (s || "").trim().toLowerCase();

// Onregelmatige Nederlandse meervouden die de regels hieronder niet vangen.
const IRREGULAR_SINGULARS = {
  eieren: "ei", kinderen: "kind", bladeren: "blad", eiwitten: "eiwit",
  tenen: "teen", teentjes: "teentje",
};

// Geeft de mogelijke enkelvoudsvormen terug. We gokken bewust niet op één vorm:
// "aardappelen" kan zowel "aardappel" als "aardappeel" opleveren, en met beide
// kandidaten in de hand stranden we niet op de verkeerde gok.
const _variantCache = new Map();
function wordVariants(w) {
  if (!w) return [];
  const uitCache = _variantCache.get(w);
  if (uitCache) return uitCache;
  const out = new Set([w]);
  if (IRREGULAR_SINGULARS[w]) out.add(IRREGULAR_SINGULARS[w]);
  if (w.length > 3) {
    if (/tjes$/.test(w)) out.add(w.slice(0, -4));
    if (/jes$/.test(w)) out.add(w.slice(0, -3));
    if (/s$/.test(w) && !/ss$/.test(w)) out.add(w.slice(0, -1));
    if (/en$/.test(w)) {
      const stem = w.slice(0, -2);
      out.add(stem);
      if (/([bdfgklmnprst])\1$/.test(stem)) out.add(stem.slice(0, -1));   // bollen -> bol
      if (/[aeiou][bcdfghjklmnpqrstvwxz]$/.test(stem) && stem.length >= 4) {
        out.add(stem.slice(0, -1) + stem.slice(-2, -1) + stem.slice(-1)); // tomaten -> tomaat
      }
    }
  }
  const lijst = [...out];
  if (_variantCache.size < 5000) _variantCache.set(w, lijst);
  return lijst;
}

// Samenstellingen die in de keuken hetzelfde product aanduiden. Bewust een
// vaste lijst: een algemene "begint met"-regel koppelt ook Kip aan Kipling en
// Boter aan Boterham, en een foute koppeling boekt de verkeerde voorraad af.
const INGREDIENT_SYNONYMS = [
  ["knoflook", "knoflookteen", "knoflooktenen", "knoflookteentje", "knoflookteentjes", "teentje knoflook"],
  ["kip", "kipfilet", "kipdij", "kipdijfilet", "kippenpoot", "kipreepjes", "kippendij"],
  ["tomaat", "tomaten", "tomatenblokje", "tomatenblokjes", "trostomaat", "kerstomaat", "cherrytomaat", "cherrytomaatjes"],
  ["ui", "uien", "sjalot", "sjalotje"],
  ["room", "kookroom", "slagroom"],
  ["melk", "halfvolle melk", "volle melk", "magere melk"],
  ["gehakt", "rundergehakt", "varkensgehakt"],
  ["spek", "spekjes", "katenspek", "ontbijtspek"],
  ["wortel", "wortels", "winterpeen", "bospeen", "worteltjes"],
  ["aardappel", "aardappelen"],
  ["boter", "roomboter"],
  ["olie", "olijfolie", "zonnebloemolie", "bakolie"],
  ["bouillon", "bouillonblokje", "bouillonblokjes"],
  ["pasta", "spaghetti", "macaroni", "penne", "tagliatelle", "fusilli"],
  ["kaas", "geraspte kaas"],
];

function nameWords(s) {
  return norm(s)
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-zà-ÿ\s-]/g, " ")
    .replace(/-+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Twee woorden zijn gelijk als één van hun enkelvoudsvormen overeenkomt.
function wordsEqual(a, b) {
  if (a === b) return true;
  const va = wordVariants(a), vb = wordVariants(b);
  return va.some((x) => vb.includes(x));
}

// Opzoektabel, één keer opgebouwd. Eerder werd de hele synoniemenlijst bij elke
// vergelijking doorlopen; dat kostte bij een miswedstrijd zestig keer zoveel tijd
// als bij een treffer, en die miswedstrijden zijn juist de regel.
const SYNONYM_INDEX = (() => {
  const index = new Map();
  INGREDIENT_SYNONYMS.forEach((group) => {
    group.forEach((term) => {
      if (!index.has(term)) index.set(term, group);
      if (!term.includes(" ")) {
        wordVariants(term).forEach((v) => { if (!index.has(v)) index.set(v, group); });
      }
    });
  });
  return index;
})();

function synonymGroup(words) {
  const joined = words.join(" ");
  const viaHeel = SYNONYM_INDEX.get(joined);
  if (viaHeel) return viaHeel;
  for (const w of words) {
    const direct = SYNONYM_INDEX.get(w);
    if (direct) return direct;
    for (const v of wordVariants(w)) {
      const via = SYNONYM_INDEX.get(v);
      if (via) return via;
    }
  }
  return null;
}

// Naamvergelijking op hele woorden in plaats van ruwe tekstfragmenten.
// Daardoor matcht "Ei" wel op "Eieren", maar niet op "Prei".
// Uitkomsten onthouden: dezelfde namen worden bij elk recept opnieuw tegen
// dezelfde voorraad gelegd, en die vergelijking is niet gratis.
const _matchCache = new Map();

function namesMatch(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  const sleutel = na < nb ? na + "\u0000" + nb : nb + "\u0000" + na;
  const bekend = _matchCache.get(sleutel);
  if (bekend !== undefined) return bekend;
  const uitkomst = namesMatchBerekenen(na, nb);
  if (_matchCache.size < 20000) _matchCache.set(sleutel, uitkomst);
  return uitkomst;
}

function namesMatchBerekenen(na, nb) {
  const wa = nameWords(na), wb = nameWords(nb);
  if (!wa.length || !wb.length) return false;

  // Zelfde product volgens de synoniemenlijst
  const ga = synonymGroup(wa), gb = synonymGroup(wb);
  if (ga && gb && ga === gb) return true;

  // Alle woorden van de kortste naam komen voor in de langste:
  // "Ui" ~ "Rode ui", "Kaas" ~ "Geraspte kaas".
  //
  // Met één voorwaarde: de gedeelde woorden moeten minstens de helft van de
  // lange naam beslaan. Anders kaapt "Mozzarella" een pak
  // "Tortelloni Tomate-Mozzarella", waar het woord alleen de smaak aanduidt.
  const shorter = wa.length <= wb.length ? wa : wb;
  const longer = shorter === wa ? wb : wa;
  if (shorter.every((s) => longer.some((l) => wordsEqual(s, l)))
      && shorter.length * 2 >= longer.length) return true;

  // Aaneengeschreven tegenover los: recepten schrijven "rodekool" en
  // "rodewijnazijn", terwijl je voorraad "Rode wijnazijn" heet. Zonder deze
  // stap zijn dat voor de app totaal verschillende woorden.
  if (aaneenMatch(wa, wb)) return true;

  return false;
}

// Plakt de woorden van de korte naam aan elkaar en zoekt die vorm terug in een
// aaneengesloten stuk van de lange naam. Zo matcht "rodekool" ook midden in
// "Bio gekookte rode kool met appeltjes", zonder losse letters te vergelijken.
function aaneenMatch(wa, wb) {
  const kort = wa.length <= wb.length ? wa : wb;
  const lang = kort === wa ? wb : wa;
  const doel = kort.join("");
  if (doel.length < 6) return false; // te kort om betrouwbaar te zijn

  for (let start = 0; start < lang.length; start++) {
    let stuk = "";
    for (let eind = start; eind < lang.length; eind++) {
      stuk += lang[eind];
      if (stuk.length > doel.length + 3) break;
      // Minstens twee woorden aan elkaar: dát is waar deze regel voor is.
      // Eén enkel woord dat toevallig voorkomt — "Mozzarella" in
      // "Tortelloni Tomate-Mozzarella" — is een smaakaanduiding, geen product.
      if (eind === start) continue;
      if (stuk === doel) return true;
      if (wordVariants(stuk).includes(doel) || wordVariants(doel).includes(stuk)) return true;
    }
  }
  return false;
}

// Gemiddeld gewicht per stuk. Hiermee kan de app "4 tomaten" vergelijken met
// "500 g tomaten" in je voorraad. Bewust alleen om te bepálen of je genoeg
// hebt — nooit om precies af te boeken, want het is een schatting.
const STUK_GEWICHTEN = [
  ["teentje knoflook", 5], ["teen knoflook", 5], ["knoflookteen", 5], ["knoflookteentje", 5],
  ["laurierblad", 0.2], ["kruidnagel", 0.1], ["bosje peterselie", 30], ["bosje bieslook", 15],
  ["bosje koriander", 30], ["chilipeper", 15], ["rode peper", 15], ["spaanse peper", 15],
  ["sjalotje", 25], ["sjalot", 25], ["lente-ui", 15], ["bosui", 15],
  ["rode ui", 100], ["ui", 100], ["uien", 100], ["eidooier", 18],
  ["eiwit", 33], ["eieren", 55], ["ei", 55], ["trostomaat", 100],
  ["cherrytomaatje", 15], ["cherrytomaat", 15], ["tomaat", 120], ["tomaten", 120],
  ["aardappel", 150], ["aardappelen", 150], ["wortel", 80], ["wortels", 80],
  ["winterpeen", 200], ["paprika", 150], ["courgette", 250], ["prei", 150],
  ["komkommer", 300], ["bleekselderij", 60], ["stengel bleekselderij", 60], ["venkelknol", 300],
  ["aubergine", 250], ["citroen", 100], ["limoen", 70], ["sinaasappel", 200],
  ["appel", 150], ["peer", 170], ["banaan", 120], ["avocado", 200],
  ["kipfilet", 150], ["kipfilets", 150], ["knoflook", 5], ["knoflookbol", 50],
  ["zalmfilet", 125], ["visfilet", 125], ["kabeljauwfilet", 125], ["witvis", 125],
  ["kipdijfilet", 100], ["kippenpoot", 200], ["drumstick", 100], ["speklap", 40],
  ["schnitzel", 120], ["hamburger", 100], ["gehaktbal", 90], ["braadworst", 90],
  ["rookworst", 275], ["knakworst", 25], ["cordon bleu", 150], ["saucijs", 90],
  ["plak ham", 20], ["ham", 20], ["witlof", 100], ["witlofstronk", 100],
  ["stronk witlof", 100], ["broccoli", 400], ["bloemkool", 800], ["spitskool", 700],
  ["venkel", 300], ["mais", 200], ["maiskolf", 200], ["radijs", 8],
  ["biet", 150], ["rode biet", 150], ["pastinaak", 150], ["knolselderij", 700],
  ["koolrabi", 300], ["artisjok", 300], ["mozzarella", 125], ["bol mozzarella", 125],
  ["burrata", 125], ["wrap", 40], ["tortilla", 40], ["pitabroodje", 60],
  ["pita", 60], ["boterham", 35], ["snee brood", 35], ["broodje", 60],
  ["bagel", 85], ["beschuit", 10], ["cracker", 8], ["rijstwafel", 8],
  ["bouillonblokje", 4], ["bouillonblokjes", 4], ["stockcube", 4], ["blik", 400],
  ["blikje", 400], ["pot", 350], ["potje", 350], ["pak", 500],
  ["tomatenblokjes", 400], ["kokosmelk", 400],
];

function stukGewicht(naam) {
  const woorden = nameWords(naam);
  if (!woorden.length) return null;
  let beste = null;
  for (const [sleutel, gram] of STUK_GEWICHTEN) {
    const sleutelWoorden = sleutel.split(" ");
    const raak = sleutelWoorden.every((sw) =>
      woorden.some((w) => wordsEqual(w, sw))
    );
    // Langere sleutel is specifieker: "cherrytomaat" wint van "tomaat".
    if (raak && (!beste || sleutel.length > beste.sleutel.length)) beste = { sleutel, gram };
  }
  return beste ? beste.gram : null;
}

// ---- Eén gedeelde koppeling tussen receptingrediënt en voorraad ----
// Deze logica stond eerder op drie plekken los in de code, met verschillende regels.
// Lepels en snufjes zijn maatbekers, geen aparte grootheid. Zonder deze
// omrekening viel bijna elk kruid en elke scheut olie in de categorie
// "niet te vergelijken", en die gold ten onrechte als aanwezig.
const UNIT_BASE = {
  g: 1, kg: 1000,
  ml: 1, l: 1000,
  eetlepel: 15, theelepel: 5, snufje: 0.5,
};
const UNIT_KIND = {
  g: "massa", kg: "massa",
  ml: "volume", l: "volume",
  // Een eetlepel meten we in milliliters, maar voor droge kruiden komt dat
  // dicht genoeg bij grammen om bruikbaar te zijn.
  eetlepel: "maat", theelepel: "maat", snufje: "maat",
};

// Een maatlepel mag met beide grootheden vergeleken worden.
function vergelijkbaar(a, b) {
  const ka = UNIT_KIND[a], kb = UNIT_KIND[b];
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  return ka === "maat" || kb === "maat";
}

// Rekent een hoeveelheid om, of geeft null als de eenheden onvergelijkbaar
// zijn (stuks tegenover gram).
function convertAmount(amount, fromUnit, toUnit) {
  const f = (fromUnit || "").toLowerCase(), t = (toUnit || "").toLowerCase();
  if (f === t) return Number(amount || 0);
  if (vergelijkbaar(f, t)) {
    return (Number(amount || 0) * UNIT_BASE[f]) / UNIT_BASE[t];
  }
  return null;
}

// Zoekt het voorraaditem bij een receptingrediënt.
// Een vastgelegde koppeling gaat altijd voor op raden.
function findInventoryMatch(inventory, ing) {
  if (!ing) return null;
  if (ing.inventoryItemId) {
    const linked = inventory.find((i) => i.id === ing.inventoryItemId);
    if (linked) return linked;
  }

  // Meerdere producten kunnen op dezelfde naam matchen: "Aardappelen" én
  // "Krieltjes". Eerder pakte de app simpelweg de eerste uit de lijst, wat een
  // willekeurige keuze is. Nu kiest hij de beste.
  const kandidaten = inventory.filter((i) => namesMatch(i.name, ing.name));
  if (!kandidaten.length) return null;
  if (kandidaten.length === 1) return kandidaten[0];

  const gevraagd = norm(ing.name);
  const score = (item) => {
    let s = 0;
    const naam = norm(item.name);
    if (naam === gevraagd) s += 100;                                   // exact dezelfde naam
    else if (nameWords(naam).length === nameWords(gevraagd).length) s += 20;
    if (convertAmount(1, ing.unit, item.unit) !== null) s += 30;        // vergelijkbare eenheid
    if (Number(item.current || 0) > 0) s += 15;                         // je hebt er iets van
    s -= Math.abs(naam.length - gevraagd.length) * 0.2;                 // hoe dichter bij, hoe beter
    return s;
  };
  return [...kandidaten].sort((a, b) => score(b) - score(a))[0];
}

// Hoeveel heb je, en hoeveel is er nodig — in dezelfde eenheid.
// Null wanneer de eenheden niet te vergelijken zijn.
function stockVsNeed(item, ing, scale = 1) {
  if (!item) return null;
  const gevraagd = Number(ing.amount || 0) * scale;
  const need = convertAmount(gevraagd, ing.unit, item.unit);
  if (need !== null) return { have: Number(item.current || 0), need, unit: item.unit };

  // Stuks tegenover gewicht: dat is niet exact om te rekenen, maar met een
  // gemiddeld stukgewicht valt wél te zeggen óf je genoeg hebt. "4 tomaten"
  // tegen 500 g in huis is een zinnige vergelijking; alleen niet precies genoeg
  // om er de voorraad mee af te boeken.
  const ingUnit = (ing.unit || "").toLowerCase();
  const itemUnit = (item.unit || "").toLowerCase();
  const gram = stukGewicht(ing.name) || stukGewicht(item.name);
  if (!gram) return null;

  if (ingUnit === "stuks" && UNIT_KIND[itemUnit]) {
    const inGram = gevraagd * gram;
    const need2 = convertAmount(inGram, "g", itemUnit);
    if (need2 === null) return null;
    return { have: Number(item.current || 0), need: need2, unit: itemUnit, geschat: true };
  }
  if (itemUnit === "stuks" && UNIT_KIND[ingUnit]) {
    const inGram = convertAmount(gevraagd, ingUnit, "g");
    if (inGram === null) return null;
    return { have: Number(item.current || 0), need: inGram / gram, unit: "stuks", geschat: true };
  }
  return null;
}

const EMOJI_KEYWORDS = [
  [["spaghetti", "pasta", "macaroni", "lasagne", "penne", "tagliatelle"], "🍝"],
  [["soep", "bouillon"], "🍲"],
  [["salade", "sla"], "🥗"],
  [["kip", "kipfilet"], "🍗"],
  [["vis", "zalm", "tonijn", "garnaal", "garnalen"], "🐟"],
  [["taart", "cake", "gebak", "koek"], "🍰"],
  [["brood", "bolletje", "toast"], "🍞"],
  [["pizza"], "🍕"],
  [["curry"], "🍛"],
  [["rijst", "risotto", "nasi"], "🍚"],
  [["stamppot", "hutspot", "aardappel", "puree"], "🥔"],
  [["ei", "omelet", "eieren"], "🍳"],
  [["burger"], "🍔"],
  [["wrap", "burrito", "taco", "quesadilla"], "🌯"],
  [["pannenkoek"], "🥞"],
  [["biefstuk", "rund", "gehakt", "worst", "vlees"], "🥩"],
  [["taco"], "🌮"],
  [["noedel", "mie", "ramen"], "🍜"],
  [["dessert", "toetje", "pudding", "ijs"], "🍨"],
];

function suggestEmoji(name) {
  const n = norm(name);
  if (!n) return "🍽️";
  for (const [keywords, emoji] of EMOJI_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return emoji;
  }
  return "🍽️";
}

// Trefwoorden om een categorie te raden bij nieuwe producten.
// Volgorde is bepalend: specifiek gaat vóór algemeen, anders belandt
// "chocopasta" bij de pasta en "gerookte paprika" bij de groente.
const CATEGORY_KEYWORDS = [
  [["vriezer", "diepvries", "ijsje", "ijstaart"], "Diepvries"],

  [["kruidenmix", "kipkruiden", "aardappelkruiden", "gerookte paprika", "paprika pikant",
    "specerij", "kruiden"], "Kruiden & specerijen"],

  [["chocopasta", "hagelslag", "hagel", "pindakaas", "jam", "honing", "stroop", "siroop",
    "notenpasta", "appelstroop", "muisjes"], "Ontbijt & broodbeleg"],

  [["spaghetti", "macaroni", "penne", "tagliatelle", "fusilli", "tortelloni", "lasagne",
    "pasta", "rijst", "risotto", "couscous", "bulgur", "quinoa", "noedel", "mihoen",
    "wrap", "tortilla"], "Pasta, rijst & wereldkeuken"],

  [["kaas", "parmezaan", "boursin", "mozzarella", "feta", "brie", "camembert",
    "roomkaas", "geitenkaas"], "Kaas"],

  [["tofu", "tempeh", "seitan", "vegaburger", "vegetarische", "falafel",
    "vleesvervanger"], "Vega & vleesvervangers"],

  [["kip", "gehakt", "spek", "worst", "ham", "zalm", "tonijn", "vis", "garnaal", "garnalen",
    "kabeljauw", "biefstuk", "rund", "varkens", "kalkoen", "spareribs", "gehaktbal", "vlees",
    "bacon", "filet", "schnitzel", "hamburger", "makreel", "haring", "mosselen", "fuet",
    "salami", "rookvlees"], "Vlees & vis"],

  [["melk", "boter", "yoghurt", "kwark", "kookroom", "slagroom", "room", "crèmefraîche",
    "margarine", "ei", "eieren", "zuivel", "vla", "pudding", "chocomel", "skyr"], "Zuivel & eieren"],

  [["brood", "pita", "knäckebröd", "beschuit", "cracker", "toast", "croissant", "bagel",
    "stokbrood", "bolletjes"], "Brood & bakkerij"],

  [["bouillon", "passata", "tomatenpuree", "blik", "olijven", "sojasaus", "ketjap", "saus",
    "soep", "augurk", "zilverui", "mais", "bonen in blik", "kokosmelk"], "Soepen, sauzen & conserven"],

  [["chips", "nootjes", "noten", "walnoot", "walnut", "amandel", "pinda", "cashew",
    "borrelnoot", "zoutje"], "Chips, noten & borrel"],

  [["koekje", "koek", "speculaas", "biscuit", "chocolade", "snoep", "drop", "reep"], "Koek & snoep"],

  [["cola", "sap", "bier", "wijn", "koffie", "thee", "frisdrank", "limonade", "ranja",
    "sinas", "energiedrank", "smoothie", "drank", "water"], "Dranken"],

  [["olijfolie", "zonnebloemolie", "sesamolie", "bakolie", "olie", "azijn", "balsamico"], "Olie, azijn & basis"],

  [["suiker", "bloem", "tarwemeel", "bakpoeder", "gist", "vanillesuiker", "cacao",
    "amandelmeel"], "Bakken & zoetwaren"],

  [["afwasmiddel", "wasmiddel", "vuilniszak", "keukenrol", "wc-papier", "schoonmaak",
    "aluminiumfolie", "vaatwastablet"], "Huishouden"],

  [["maaltijdsalade", "kant-en-klaar", "restje", "maaltijd"], "Maaltijden & salades"],

  [["ui", "knoflook", "tomaat", "tomaten", "paprika", "komkommer", "wortel", "peen", "prei",
    "broccoli", "bloemkool", "appel", "banaan", "citroen", "limoen", "avocado", "champignon",
    "spinazie", "sla", "andijvie", "boerenkool", "witlof", "pompoen", "aardappel", "krieltjes",
    "courgette", "aubergine", "framboos", "druif", "druiven", "peer", "peren", "sinaasappel",
    "mandarijn", "gember", "koriander", "basilicum", "peterselie", "bieslook", "venkel",
    "rabarber", "spruit", "aardbei", "kers", "kersen", "meloen", "kiwi", "mango", "ananas",
    "perzik", "abrikoos", "bosbes", "bramen", "granaatappel", "groente", "fruit", "kool"], "Groente & fruit"],

  [["zout", "peper", "paprikapoeder", "kerrie", "komijn", "kaneel", "oregano", "tijm",
    "laurier", "nootmuskaat", "kurkuma", "kardemom", "sumak", "steranijs", "foelie",
    "jeneverbes", "sesamzaad", "chilivlokken", "garam", "masala"], "Kruiden & specerijen"],
];

// Mapt Open Food Facts' eigen (Engelstalige) categorie-tags naar onze categorieën —
// betrouwbaarder dan zelf raden, want dit is de classificatie van het product zelf.
const OFF_CATEGORY_RULES = [
  [["fruit", "vegetable", "potato", "tomato", "onion", "fresh-produce", "salad", "herb-fresh"], "Groente & Fruit"],
  [["dairies", "dairy", "milk", "cheese", "yogurt", "yoghurt", "cream", "butter", "egg"], "Zuivel"],
  [["meat", "poultry", "fish", "seafood", "sausage", "ham", "beef", "pork", "chicken", "cold-cuts"], "Vlees & Vis"],
  [["bread", "pasta", "cereal", "rice", "flour", "noodle", "bakery"], "Bakkerij & Granen"],
  [["spice", "condiment", "sauce", "herb", "oil", "vinegar", "seasoning", "dressing"], "Kruiden & Specerijen"],
  [["frozen"], "Diepvries"],
  [["beverage", "drink", "juice", "soda", "water", "beer", "wine", "coffee", "tea"], "Drank"],
];

function guessCategory(name) {
  const n = norm(name);
  if (!n) return "Overig";
  const tokens = n.split(/[^a-zà-öø-ÿ]+/).filter(Boolean);
  for (const [keywords, category] of CATEGORY_KEYWORDS) {
    const matched = keywords.some((k) =>
      k.length <= 3 ? tokens.some((t) => t.startsWith(k)) : n.includes(k)
    );
    if (matched) return category;
  }
  return "Overig";
}

function categoryFromOffTags(tags) {
  if (!tags || !tags.length) return null;
  const joined = tags.join(" ").toLowerCase();
  for (const [words, category] of OFF_CATEGORY_RULES) {
    if (words.some((w) => joined.includes(w))) return category;
  }
  return null;
}

// Basisproducten die vrijwel iedereen in huis heeft en die niemand in de
// voorraad bijhoudt. Zonder deze uitzondering zou bijna geen enkel recept
// ooit als "compleet" gelden.
const PANTRY_BASICS = [
  "zout", "peper", "zwarte peper", "witte peper", "water", "suiker", "azijn", "olie",
  "olijfolie", "zonnebloemolie", "bakolie", "boter", "margarine", "bloem", "maizena",
  "kruiden", "specerijen", "paprikapoeder", "komijn", "kerrie", "kerriepoeder", "oregano",
  "tijm", "rozemarijn", "laurier", "laurierblad", "nootmuskaat", "kaneel", "chilipoeder",
  "mosterd", "honing", "sojasaus", "ketjap", "bouillon", "bouillonblokje", "bouillonblokjes",
];

function isPantryBasic(name) {
  const n = norm(name);
  if (!n) return false;
  return PANTRY_BASICS.some((b) => n === b || namesMatch(n, b));
}

// Bepaalt wat je van een recept in huis hebt en wat er nog ontbreekt.
// Anders dan voorheen tellen ingrediënten die hélemaal niet in de voorraad
// staan óók als ontbrekend — die had je immers niet.
function recipeReadiness(recipe, inventory, scale = 1) {
  const missing = [];   // wat je nog moet halen
  const unknown = [];   // niet te beoordelen (bijv. stuks vs. gram)
  const estimated = []; // beoordeeld met een gemiddeld stukgewicht
  let have = 0;
  let relevant = 0;

  (recipe.ingredients || []).forEach((ing) => {
    if (isPantryBasic(ing.name)) return; // basics gelden als aanwezig
    relevant += 1;
    const item = findInventoryMatch(inventory, ing);
    if (!item) { missing.push(ing.name); return; }
    const cmp = stockVsNeed(item, ing, scale);
    // Kunnen we de hoeveelheid niet vergelijken (stuks tegenover grammen), dan
    // weten we het simpelweg niet. Dat als "aanwezig" tellen maakte gerechten
    // compleet die het niet waren.
    if (!cmp) { unknown.push(ing.name); return; }
    if (cmp.geschat) estimated.push(ing.name);
    if (cmp.have >= cmp.need) have += 1;
    else missing.push(ing.name);
  });

  return {
    have, relevant, missing, unknown, estimated,
    total: (recipe.ingredients || []).length,
    complete: relevant > 0 && missing.length === 0 && unknown.length === 0,
    canMake: relevant > 0 && missing.length === 0 && unknown.length === 0,
    tracked: relevant,
  };
}

// Herkent Nederlandse tijdsduur in tekst, bijv. "10 minuten" of "1 uur" -> minuten.
// Gebruikt zowel om automatisch een timerknop bij een bereidingsstap te tonen,
// als om een gesproken commando ("zet een timer van 8 minuten") te verwerken.
function parseSpokenDurationMinutes(text) {
  if (!text) return null;
  const n = text.toLowerCase();
  let totalMinutes = 0;
  let found = false;
  const hourMatch = n.match(/(\d+)\s*(uur|uren)/);
  if (hourMatch) { totalMinutes += Number(hourMatch[1]) * 60; found = true; }
  const minMatch = n.match(/(\d+)\s*(minuten|minuut|min)\b/);
  if (minMatch) { totalMinutes += Number(minMatch[1]); found = true; }
  return found ? totalMinutes : null;
}

function VoiceInputButton({ onResult, title, size = 15 }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = React.useRef(null);
  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!supported) return null;

  const start = () => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "nl-NL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const text = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
      if (text) onResult(text);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stop = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  return (
    <button aria-label="Invoeren met spraak"
      onClick={listening ? stop : start}
      title={title || "Spreek in"}
      style={{
        width: 44, height: 44, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        border: `1.5px solid ${listening ? C.brick : C.borderTint}`,
        background: listening ? C.brick : C.cardBg,
        flexShrink: 0,
      }}
    >
      <Mic size={size} color={listening ? "#fff" : C.inkSoft} />
    </button>
  );
}

function resizeImageFile(file, maxDim = 1024, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("lezen mislukt"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("afbeelding ongeldig"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Telt voorraad bij, maar nooit boven het ingestelde maximum.
// Staat het maximum op 0, dan is er geen bovengrens: bij producten die je
// niet op voorraad houdt zou je aankoop anders meteen verdwijnen.
function addToStock(item, erbij) {
  const nieuw = round2(Number(item.current || 0) + Number(erbij || 0));
  const max = Number(item.max || 0);
  return max > 0 ? Math.min(max, nieuw) : nieuw;
}

function pushLowStockToShopping(shoppingArr, item, newCurrent) {
  if (newCurrent >= item.min) return { list: shoppingArr, added: false };
  const needed = round2(Math.max(item.max - newCurrent, item.min - newCurrent));
  const idx = shoppingArr.findIndex((s) => namesMatch(s.name, item.name) && s.unit === item.unit);
  const entry = {
    id: idx > -1 ? shoppingArr[idx].id : uid(),
    name: item.name,
    unit: item.unit,
    category: item.category,
    amount: needed,
    auto: true,
    checked: false,
  };
  const next = [...shoppingArr];
  if (idx > -1) next[idx] = entry;
  else next.push(entry);
  return { list: next, added: true };
}

// Zorgt dat de boodschappenlijst altijd klopt met de huidige voorraadstatus van één item:
// voegt toe/werkt bij als het onder het minimum zit, haalt een automatisch toegevoegd item
// er weer af zodra de voorraad weer op peil is.
function reconcileShoppingForItem(shoppingArr, item) {
  if (item.current < item.min) {
    const { list, added } = pushLowStockToShopping(shoppingArr, item, item.current);
    return { list, changed: added };
  }
  const idx = shoppingArr.findIndex((s) => s.auto && namesMatch(s.name, item.name) && s.unit === item.unit);
  if (idx === -1) return { list: shoppingArr, changed: false };
  return { list: shoppingArr.filter((_, i) => i !== idx), changed: true };
}

/* ---------------------------------------------------------------- */
/*  Lokale (offline) recept-parser — vangnet zonder netwerk          */
/* ---------------------------------------------------------------- */

const UNIT_ALIASES = {
  g: "g", gram: "g", gr: "g",
  kg: "kg", kilo: "kg",
  ml: "ml",
  l: "l", liter: "l",
  el: "eetlepel", eetlepel: "eetlepel", eetlepels: "eetlepel", eetl: "eetlepel",
  tl: "theelepel", theelepel: "theelepel", theelepels: "theelepel",
  snufje: "snufje", snuf: "snufje",
  stuk: "stuks", stuks: "stuks",
};

const NO_QUANTITY_MARKERS = ["snufje", "snuf", "scheutje", "scheut", "beetje", "handje", "klontje"];
const STEP_HEADING_RE = /^(zo maak je|zo bereid je|bereiding(swijze)?|werkwijze|instructies|stappen|bereidingsstappen)\b/i;
const JUNK_LINE_RE = /^(direct in je mandje|albert[\s-]?heijn|jumbo|dirk|picnic|winkelwagen|voeg toe aan)/i;

function parseRecipeLocally(sourceText) {
  const lines = sourceText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bulletRe = /^[▢□☐☑✓✔•●○*\-]\s*(.+)$/;

  let name = "";
  const madeMatch = sourceText.match(/zo (maak|bereid) je\s+([^\n.]{3,60})/i);
  const titleMatch = sourceText.match(/recept\s+voor\s+([^\n.]{3,60})/i);
  if (madeMatch) name = madeMatch[2].trim();
  else if (titleMatch) name = titleMatch[1].trim();
  if (!name) {
    const candidate = lines.find((l) =>
      l.length >= 4 && l.length <= 60 &&
      !/^(stap|ingredi|bereiding|kookstappen)/i.test(l) &&
      !JUNK_LINE_RE.test(l) && !bulletRe.test(l) && !STEP_HEADING_RE.test(l)
    );
    name = candidate || "Geïmporteerd recept";
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Cijfer + herkende eenheid (bijv. "250 gr bloem"); anders cijfer + de rest als naam (bijv. "2 eieren").
  const unitAlt = Object.keys(UNIT_ALIASES).sort((a, b) => b.length - a.length).join("|");
  const ingRegexWithUnit = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s+(${unitAlt})\\b\\.?\\s+(.+)$`, "i");
  const ingRegexNoUnit = /^(\d+(?:[.,]\d+)?)\s+(.+)$/;
  const ingRegex = ingRegexNoUnit; // gebruikt elders als generieke "begint met cijfer"-check
  const seen = new Set();
  const ingredients = [];

  const addIngredient = (ingName, amount, unit) => {
    ingName = ingName.replace(/^,\s*/, "").replace(/[,.]$/, "").trim();
    if (!ingName || ingName.length > 60) return;
    const key = ingName.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ingredients.push({ name: ingName, amount, unit });
  };

  const parseQuantityLine = (content) => {
    const withUnit = content.match(ingRegexWithUnit);
    if (withUnit) {
      const amount = parseFloat(withUnit[1].replace(",", ".")) || 1;
      const unit = UNIT_ALIASES[withUnit[2].toLowerCase()] || "stuks";
      return { name: withUnit[3], amount, unit };
    }
    const noUnit = content.match(ingRegexNoUnit);
    if (noUnit) {
      const amount = parseFloat(noUnit[1].replace(",", ".")) || 1;
      return { name: noUnit[2], amount, unit: "stuks" };
    }
    return null;
  };

  lines.forEach((line) => {
    if (/^stap\s*\d+/i.test(line) || JUNK_LINE_RE.test(line)) return;
    const bulletMatch = line.match(bulletRe);

    if (bulletMatch) {
      // Regel met vinkje/bullet: altijd een ingrediënt, ook zonder duidelijk aantal.
      const content = bulletMatch[1];
      const parsed = parseQuantityLine(content);
      if (parsed) { addIngredient(parsed.name, parsed.amount, parsed.unit); return; }
      const markerRe = new RegExp(`^(${NO_QUANTITY_MARKERS.join("|")})\\s+(.+)$`, "i");
      const markerMatch = content.match(markerRe);
      if (markerMatch) { addIngredient(markerMatch[2], 1, "snufje"); return; }
      addIngredient(content, 1, "stuks");
      return;
    }

    const parsed = parseQuantityLine(line);
    if (parsed) addIngredient(parsed.name, parsed.amount, parsed.unit);
  });

  const steps = [];

  // 1) Genummerde "Stap N:" secties
  const stepChunks = sourceText.split(/stap\s*\d+\s*[:.]?/i).slice(1);
  stepChunks.forEach((chunk) => {
    const chunkLines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const contentLines = chunkLines.filter((l) => !ingRegex.test(l) && !bulletRe.test(l));
    const clean = contentLines.join(" ").replace(/\s+/g, " ").trim();
    if (clean) steps.push(clean.slice(0, 300));
  });

  // 2) Een kopje als "Zo maak je …" / "Bereiding" / "Werkwijze": alles erna, regel voor regel
  if (!steps.length) {
    const headingIdx = lines.findIndex((l) => STEP_HEADING_RE.test(l));
    if (headingIdx > -1) {
      lines.slice(headingIdx + 1).forEach((l) => {
        if (bulletRe.test(l) || ingRegex.test(l) || JUNK_LINE_RE.test(l)) return;
        if (l.length >= 12) steps.push(l.slice(0, 300));
      });
    }
  }

  // 3) Genummerde lijst "1." "2)"
  if (!steps.length) {
    const numbered = sourceText.match(/(?:^|\n)\s*\d+[.)]\s*([^\n]{5,200})/g);
    if (numbered) numbered.forEach((n) => steps.push(n.replace(/^\s*\d+[.)]\s*/, "").trim()));
  }

  // 4) Laatste redmiddel: langere zinnen die geen ingrediënt/bullet/kop/junk zijn
  if (!steps.length) {
    lines.forEach((l) => {
      if (bulletRe.test(l) || ingRegex.test(l) || JUNK_LINE_RE.test(l) || STEP_HEADING_RE.test(l)) return;
      if (l.length >= 25 && /[.!]$/.test(l)) steps.push(l.slice(0, 300));
    });
  }

  let cookTime = 30;
  const timeMatch = sourceText.match(/(\d+)(?:\s*-\s*\d+)?\s*(uur|u\b|minuten|min\b)/i);
  if (timeMatch) {
    const n = parseInt(timeMatch[1], 10);
    cookTime = /^u/i.test(timeMatch[2]) ? n * 60 : n;
  }

  let servings = 4;
  const servMatch = sourceText.match(/(\d+)\s*(personen|porties)/i);
  if (servMatch) servings = parseInt(servMatch[1], 10);

  return {
    name,
    emoji: suggestEmoji(name),
    cookTime,
    servings,
    ingredients: ingredients.slice(0, 20),
    steps: steps.slice(0, 10),
  };
}

const seedInventory = () => [
  { id: uid(), name: "Gehakt (half-om-half)", category: "Vlees & Vis", unit: "g", current: 300, min: 200, max: 1000 },
  { id: uid(), name: "Ui", category: "Groente & Fruit", unit: "stuks", current: 4, min: 2, max: 6 },
  { id: uid(), name: "Knoflook", category: "Groente & Fruit", unit: "stuks", current: 3, min: 2, max: 8 },
  { id: uid(), name: "Tomatenblokjes (blik)", category: "Overig", unit: "stuks", current: 2, min: 2, max: 6 },
  { id: uid(), name: "Spaghetti", category: "Bakkerij & Granen", unit: "g", current: 500, min: 250, max: 1500 },
  { id: uid(), name: "Aardappelen", category: "Groente & Fruit", unit: "kg", current: 1.5, min: 1, max: 3 },
  { id: uid(), name: "Wortels", category: "Groente & Fruit", unit: "g", current: 400, min: 250, max: 1000 },
  { id: uid(), name: "Rookworst", category: "Vlees & Vis", unit: "stuks", current: 2, min: 1, max: 4 },
  { id: uid(), name: "Rode linzen", category: "Bakkerij & Granen", unit: "g", current: 300, min: 200, max: 1000 },
  { id: uid(), name: "Bouillonblokjes", category: "Kruiden & Specerijen", unit: "stuks", current: 4, min: 2, max: 10 },
  { id: uid(), name: "Kookroom", category: "Zuivel", unit: "ml", current: 200, min: 200, max: 600 },
];

const seedRecipes = () => [
  {
    id: uid(),
    name: "Spaghetti Bolognese",
    emoji: "🍝",
    photoUrl: "",
    cookTime: 45,
    servings: 4,
    favorite: true,
    ingredients: [
      { name: "Gehakt (half-om-half)", amount: 400, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Knoflook", amount: 2, unit: "stuks" },
      { name: "Tomatenblokjes (blik)", amount: 2, unit: "stuks" },
      { name: "Spaghetti", amount: 400, unit: "g" },
    ],
    steps: [
      "Snipper de ui en hak de knoflook fijn.",
      "Bak het gehakt rul in een hete pan met een scheut olie.",
      "Voeg ui en knoflook toe en fruit 2 minuten mee.",
      "Voeg de tomatenblokjes toe en laat 25 minuten zachtjes sudderen.",
      "Kook ondertussen de spaghetti volgens de verpakking.",
      "Breng de saus op smaak met zout en peper en serveer over de spaghetti.",
    ],
  },
  {
    id: uid(),
    name: "Hutspot met rookworst",
    emoji: "🥕",
    photoUrl: "",
    cookTime: 60,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Aardappelen", amount: 1, unit: "kg" },
      { name: "Wortels", amount: 400, unit: "g" },
      { name: "Ui", amount: 2, unit: "stuks" },
      { name: "Rookworst", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Schil de aardappelen en wortels en snijd in grove stukken.",
      "Snipper de uien.",
      "Kook alles samen ongeveer 20-25 minuten gaar in ruim water met zout.",
      "Verwarm de rookworst zoals aangegeven op de verpakking.",
      "Giet het groentemengsel af en stamp tot een grove puree.",
      "Breng op smaak met boter, peper en zout en serveer met de rookworst.",
    ],
  },
  {
    id: uid(),
    name: "Romige rode-linzensoep",
    emoji: "🍲",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Rode linzen", amount: 250, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Knoflook", amount: 2, unit: "stuks" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Kookroom", amount: 200, unit: "ml" },
    ],
    steps: [
      "Snipper ui en knoflook en fruit glazig in een soeppan.",
      "Spoel de linzen af en voeg toe aan de pan.",
      "Voeg bouillon toe (blokjes + water) en breng aan de kook.",
      "Laat 20 minuten zachtjes koken tot de linzen zacht zijn.",
      "Pureer de soep glad met een staafmixer.",
      "Roer de kookroom erdoor en breng op smaak met peper en zout.",
    ],
  },
  {
    id: uid(), name: "Macaroni met kaas en spek", emoji: "🧀", photoUrl: "", cookTime: 30, servings: 4, favorite: false,
    ingredients: [
      { name: "Macaroni", amount: 350, unit: "g" },
      { name: "Spekjes", amount: 150, unit: "g" },
      { name: "Jong belegen kaas", amount: 150, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Kookroom", amount: 200, unit: "ml" },
    ],
    steps: [
      "Kook de macaroni volgens de verpakking beetgaar.",
      "Bak de spekjes en gesnipperde ui knapperig in een pan.",
      "Rasp de kaas en roer samen met de kookroom door de spekjes.",
      "Schep de afgegoten macaroni erdoorheen tot een romige massa.",
      "Breng op smaak met peper en serveer direct.",
    ],
  },
  {
    id: uid(), name: "Zalm met broccoli en aardappelpuree", emoji: "🐟", photoUrl: "", cookTime: 35, servings: 4, favorite: false,
    ingredients: [
      { name: "Zalmfilet", amount: 4, unit: "stuks" },
      { name: "Broccoli", amount: 500, unit: "g" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Boter", amount: 30, unit: "g" },
      { name: "Citroen", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Schil en kook de aardappelen 20 minuten gaar.",
      "Stoom of kook de broccoliroosjes 8 minuten beetgaar.",
      "Bak de zalmfilets 4 minuten per kant in een beetje boter.",
      "Stamp de aardappelen met boter tot een gladde puree.",
      "Besprenkel de zalm met citroensap en serveer met puree en broccoli.",
    ],
  },
  {
    id: uid(), name: "Kip-kerriesoep", emoji: "🍛", photoUrl: "", cookTime: 30, servings: 4, favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 300, unit: "g" },
      { name: "Kerriepoeder", amount: 1, unit: "eetlepel" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Kokosmelk", amount: 400, unit: "ml" },
      { name: "Bouillonblokjes", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Snijd de kipfilet in blokjes en snipper de ui.",
      "Fruit de ui met de kerriepoeder glazig in een soeppan.",
      "Voeg de kip toe en bak kort mee.",
      "Voeg kokosmelk en bouillon toe en laat 15 minuten sudderen.",
      "Breng op smaak met zout en peper en serveer warm.",
    ],
  },
  {
    id: uid(), name: "Griekse salade met feta", emoji: "🥗", photoUrl: "", cookTime: 15, servings: 4, favorite: false,
    ingredients: [
      { name: "Komkommer", amount: 1, unit: "stuks" },
      { name: "Tomaten", amount: 4, unit: "stuks" },
      { name: "Feta", amount: 200, unit: "g" },
      { name: "Rode ui", amount: 1, unit: "stuks" },
      { name: "Olijfolie", amount: 3, unit: "eetlepel" },
    ],
    steps: [
      "Snijd komkommer en tomaten in grove stukken.",
      "Snijd de rode ui in dunne ringen.",
      "Meng de groenten in een schaal en verkruimel de feta erover.",
      "Besprenkel met olijfolie en breng op smaak met zout en peper.",
      "Serveer direct, eventueel met wat olijven.",
    ],
  },
  {
    id: uid(), name: "Shoarma van kipfilet met knoflooksaus", emoji: "🌯", photoUrl: "", cookTime: 30, servings: 4, favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 500, unit: "g" },
      { name: "Shoarmakruiden", amount: 1, unit: "eetlepel" },
      { name: "Wraps", amount: 8, unit: "stuks" },
      { name: "Komkommer", amount: 1, unit: "stuks" },
      { name: "Knoflooksaus", amount: 150, unit: "ml" },
    ],
    steps: [
      "Snijd de kipfilet in reepjes en meng met de shoarmakruiden.",
      "Bak de kip op hoog vuur 8-10 minuten gaar en goudbruin.",
      "Snijd de komkommer in dunne plakjes.",
      "Verwarm de wraps kort in een droge pan.",
      "Vul de wraps met kip, komkummer en knoflooksaus.",
    ],
  },
  {
    id: uid(), name: "Vegetarische chili sin carne", emoji: "🌶️", photoUrl: "", cookTime: 35, servings: 4, favorite: false,
    ingredients: [
      { name: "Kidneybonen (blik)", amount: 2, unit: "stuks" },
      { name: "Tomatenblokjes (blik)", amount: 2, unit: "stuks" },
      { name: "Paprika", amount: 2, unit: "stuks" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Chilipoeder", amount: 1, unit: "theelepel" },
    ],
    steps: [
      "Snipper de ui en snijd de paprika in blokjes.",
      "Fruit ui en paprika glazig in een pan met een scheut olie.",
      "Voeg de tomatenblokjes en chilipoeder toe.",
      "Spoel de bonen af en voeg toe aan de pan.",
      "Laat 20 minuten sudderen en breng op smaak met zout en peper.",
    ],
  },
  {
    id: uid(), name: "Ovenschotel met witlof en ham", emoji: "🍽️", photoUrl: "", cookTime: 45, servings: 4, favorite: false,
    ingredients: [
      { name: "Witlof", amount: 8, unit: "stuks" },
      { name: "Ham", amount: 8, unit: "stuks" },
      { name: "Jong belegen kaas", amount: 150, unit: "g" },
      { name: "Bloem", amount: 30, unit: "g" },
      { name: "Halfvolle melk", amount: 500, unit: "ml" },
    ],
    steps: [
      "Kook de witlof 10 minuten voor in gezouten water en giet af.",
      "Wikkel elke stronk witlof in een plak ham.",
      "Maak een bechamelsaus van boter, bloem en melk.",
      "Leg de rolletjes in een ovenschaal en giet de saus erover.",
      "Bestrooi met geraspte kaas en bak 20 minuten op 200°C tot goudbruin.",
    ],
  },
  {
    id: uid(), name: "Aardappel-preisoep", emoji: "🍲", photoUrl: "", cookTime: 35, servings: 4, favorite: false,
    ingredients: [
      { name: "Prei", amount: 2, unit: "stuks" },
      { name: "Aardappelen", amount: 400, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Kookroom", amount: 100, unit: "ml" },
      { name: "Boter", amount: 20, unit: "g" },
    ],
    steps: [
      "Snijd de prei in ringen en de aardappelen in blokjes.",
      "Fruit de prei kort aan in de boter.",
      "Voeg aardappelen en bouillon toe en breng aan de kook.",
      "Laat 20 minuten sudderen tot de aardappelen zacht zijn.",
      "Pureer de soep en roer de kookroom erdoor.",
    ],
  },
  {
    id: uid(), name: "Caprese salade met tomaat en mozzarella", emoji: "🍅", photoUrl: "", cookTime: 10, servings: 4, favorite: false,
    ingredients: [
      { name: "Tomaten", amount: 4, unit: "stuks" },
      { name: "Mozzarella", amount: 2, unit: "stuks" },
      { name: "Basilicum", amount: 1, unit: "snufje" },
      { name: "Olijfolie", amount: 2, unit: "eetlepel" },
      { name: "Balsamicoazijn", amount: 1, unit: "eetlepel" },
    ],
    steps: [
      "Snijd de tomaten en mozzarella in plakken.",
      "Leg ze afwisselend op een bord.",
      "Verdeel de basilicumblaadjes erover.",
      "Besprenkel met olijfolie en balsamicoazijn.",
      "Breng op smaak met peper en zout.",
    ],
  },
  {
    id: uid(), name: "Kip tikka masala", emoji: "🍛", photoUrl: "", cookTime: 40, servings: 4, favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 500, unit: "g" },
      { name: "Tikka masala pasta", amount: 3, unit: "eetlepel" },
      { name: "Tomatenblokjes (blik)", amount: 1, unit: "stuks" },
      { name: "Kookroom", amount: 200, unit: "ml" },
      { name: "Ui", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Snijd de kipfilet in blokjes en de ui fijn.",
      "Bak de kip rondom bruin en haal uit de pan.",
      "Fruit de ui glazig en voeg de tikka masala pasta toe.",
      "Voeg tomatenblokjes en kip weer toe, laat 15 minuten sudderen.",
      "Roer de kookroom erdoor en breng op smaak met zout.",
    ],
  },
  {
    id: uid(), name: "Boerenkoolstamppot met worst", emoji: "🥔", photoUrl: "", cookTime: 45, servings: 4, favorite: false,
    ingredients: [
      { name: "Aardappelen", amount: 1, unit: "kg" },
      { name: "Boerenkool (gesneden)", amount: 400, unit: "g" },
      { name: "Rookworst", amount: 1, unit: "stuks" },
      { name: "Melk", amount: 100, unit: "ml" },
      { name: "Boter", amount: 30, unit: "g" },
    ],
    steps: [
      "Schil de aardappelen en kook 20 minuten met de boerenkool.",
      "Verwarm de rookworst zoals aangegeven op de verpakking.",
      "Giet het aardappel-boerenkoolmengsel af.",
      "Stamp met melk en boter tot een grove puree.",
      "Breng op smaak met peper en zout en serveer met de rookworst.",
    ],
  },
  {
    id: uid(), name: "Pasta pesto met kerstomaatjes", emoji: "🍝", photoUrl: "", cookTime: 20, servings: 4, favorite: false,
    ingredients: [
      { name: "Penne", amount: 350, unit: "g" },
      { name: "Groene pesto", amount: 150, unit: "g" },
      { name: "Kerstomaatjes", amount: 250, unit: "g" },
      { name: "Pijnboompitten", amount: 30, unit: "g" },
      { name: "Parmezaanse kaas", amount: 40, unit: "g" },
    ],
    steps: [
      "Kook de penne beetgaar volgens de verpakking.",
      "Halveer de kerstomaatjes.",
      "Rooster de pijnboompitten kort in een droge pan.",
      "Meng de afgegoten pasta met pesto en kerstomaatjes.",
      "Bestrooi met pijnboompitten en Parmezaanse kaas.",
    ],
  },
  {
    id: uid(), name: "Viscurry met kokosmelk", emoji: "🍲", photoUrl: "", cookTime: 30, servings: 4, favorite: false,
    ingredients: [
      { name: "Witvis (bijv. kabeljauw)", amount: 500, unit: "g" },
      { name: "Kokosmelk", amount: 400, unit: "ml" },
      { name: "Currypasta", amount: 2, unit: "eetlepel" },
      { name: "Paprika", amount: 1, unit: "stuks" },
      { name: "Rijst", amount: 300, unit: "g" },
    ],
    steps: [
      "Kook de rijst volgens de verpakking.",
      "Snijd de vis in grote stukken en de paprika in reepjes.",
      "Fruit de currypasta kort aan in een pan.",
      "Voeg kokosmelk en paprika toe en laat 10 minuten sudderen.",
      "Voeg de vis toe en gaar 5-7 minuten mee. Serveer met rijst.",
    ],
  },
  {
    id: uid(), name: "Gehaktballen in tomatensaus met puree", emoji: "🍽️", photoUrl: "", cookTime: 45, servings: 4, favorite: false,
    ingredients: [
      { name: "Gehakt (half-om-half)", amount: 500, unit: "g" },
      { name: "Tomatenblokjes (blik)", amount: 2, unit: "stuks" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Ei", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Meng gehakt met een gesnipperd kwart van de ui, ei, zout en peper. Rol er balletjes van.",
      "Bak de gehaktballen rondom bruin en haal uit de pan.",
      "Fruit de rest van de ui en voeg de tomatenblokjes toe.",
      "Leg de balletjes terug in de saus en laat 20 minuten sudderen.",
      "Kook ondertussen de aardappelen en stamp tot puree.",
    ],
  },
  {
    id: uid(), name: "Nasi goreng met kipsaté", emoji: "🍚", photoUrl: "", cookTime: 35, servings: 4, favorite: false,
    ingredients: [
      { name: "Rijst", amount: 300, unit: "g" },
      { name: "Kipfilet", amount: 300, unit: "g" },
      { name: "Ketjap manis", amount: 3, unit: "eetlepel" },
      { name: "Ei", amount: 2, unit: "stuks" },
      { name: "Satesaus", amount: 150, unit: "ml" },
    ],
    steps: [
      "Kook de rijst gaar en laat afkoelen (het liefst van de dag ervoor).",
      "Snijd de kip in blokjes en bak gaar in een wok.",
      "Bak de eieren tot roerei en meng door de rijst en kip.",
      "Voeg ketjap manis toe en roerbak alles goed door elkaar.",
      "Verwarm de satesaus en serveer erbij.",
    ],
  },
  {
    id: uid(), name: "Broccoli-roomsoep", emoji: "🥦", photoUrl: "", cookTime: 25, servings: 4, favorite: false,
    ingredients: [
      { name: "Broccoli", amount: 500, unit: "g" },
      { name: "Aardappelen", amount: 200, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Kookroom", amount: 100, unit: "ml" },
      { name: "Ui", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Snijd broccoli, aardappel en ui in stukken.",
      "Fruit de ui glazig in een soeppan.",
      "Voeg broccoli, aardappel en bouillon toe en breng aan de kook.",
      "Laat 15 minuten sudderen tot alles zacht is.",
      "Pureer glad en roer de kookroom erdoor.",
    ],
  },
  {
    id: uid(), name: "Wraps met gekruide kip en groenten", emoji: "🌯", photoUrl: "", cookTime: 25, servings: 4, favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 400, unit: "g" },
      { name: "Wraps", amount: 8, unit: "stuks" },
      { name: "Paprika", amount: 2, unit: "stuks" },
      { name: "Fajitakruiden", amount: 1, unit: "eetlepel" },
      { name: "Crème fraîche", amount: 100, unit: "ml" },
    ],
    steps: [
      "Snijd kip en paprika in reepjes.",
      "Meng de kip met de fajitakruiden.",
      "Bak kip en paprika 8-10 minuten op hoog vuur gaar.",
      "Verwarm de wraps kort in een droge pan.",
      "Vul de wraps met het kip-paprikamengsel en een schep crème fraîche.",
    ],
  },
  {
    id: uid(), name: "Risotto met champignons", emoji: "🍚", photoUrl: "", cookTime: 40, servings: 4, favorite: false,
    ingredients: [
      { name: "Risottorijst", amount: 300, unit: "g" },
      { name: "Champignons", amount: 250, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Parmezaanse kaas", amount: 50, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Snipper de ui en snijd de champignons in plakjes.",
      "Fruit de ui glazig en voeg de risottorijst toe, roerbak 1 minuut.",
      "Voeg al roerend beetje bij beetje warme bouillon toe.",
      "Bak de champignons apart en meng erdoor als de rijst bijna gaar is.",
      "Roer de Parmezaanse kaas erdoor en breng op smaak.",
    ],
  },
  {
    id: uid(), name: "Zalmfilet met citroen-dillesaus", emoji: "🐟", photoUrl: "", cookTime: 25, servings: 4, favorite: false,
    ingredients: [
      { name: "Zalmfilet", amount: 4, unit: "stuks" },
      { name: "Citroen", amount: 1, unit: "stuks" },
      { name: "Verse dille", amount: 1, unit: "snufje" },
      { name: "Crème fraîche", amount: 150, unit: "ml" },
      { name: "Aardappelen", amount: 700, unit: "g" },
    ],
    steps: [
      "Kook de aardappelen 20 minuten gaar.",
      "Bak de zalmfilets 4 minuten per kant in een pan.",
      "Meng crème fraîche met citroensap en gehakte dille.",
      "Breng de saus op smaak met zout en peper.",
      "Serveer de zalm met de saus en de aardappelen.",
    ],
  },
  {
    id: uid(), name: "Andijviestamppot met gehaktballetjes", emoji: "🥔", photoUrl: "", cookTime: 40, servings: 4, favorite: false,
    ingredients: [
      { name: "Aardappelen", amount: 1, unit: "kg" },
      { name: "Andijvie (gesneden)", amount: 300, unit: "g" },
      { name: "Gehakt (half-om-half)", amount: 400, unit: "g" },
      { name: "Melk", amount: 100, unit: "ml" },
      { name: "Boter", amount: 30, unit: "g" },
    ],
    steps: [
      "Rol het gehakt tot kleine balletjes en bak rondom bruin.",
      "Kook ondertussen de aardappelen 20 minuten gaar.",
      "Giet de aardappelen af en stamp met melk en boter.",
      "Meng de rauwe andijvie erdoor tot die net slinkt.",
      "Breng op smaak en serveer met de gehaktballetjes.",
    ],
  },
  {
    id: uid(), name: "Pompoensoep met kokos", emoji: "🎃", photoUrl: "", cookTime: 35, servings: 4, favorite: false,
    ingredients: [
      { name: "Pompoen", amount: 800, unit: "g" },
      { name: "Kokosmelk", amount: 300, unit: "ml" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Gemberpasta", amount: 1, unit: "eetlepel" },
    ],
    steps: [
      "Schil de pompoen en snijd in blokjes.",
      "Fruit ui en gember kort aan in een soeppan.",
      "Voeg pompoen en bouillon toe en breng aan de kook.",
      "Laat 20 minuten sudderen tot de pompoen zacht is.",
      "Pureer glad en roer de kokosmelk erdoor.",
    ],
  },
  {
    id: uid(), name: "Pasta carbonara", emoji: "🍝", photoUrl: "", cookTime: 25, servings: 4, favorite: false,
    ingredients: [
      { name: "Spaghetti", amount: 350, unit: "g" },
      { name: "Spekjes", amount: 150, unit: "g" },
      { name: "Ei", amount: 3, unit: "stuks" },
      { name: "Parmezaanse kaas", amount: 60, unit: "g" },
      { name: "Knoflook", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Kook de spaghetti beetgaar volgens de verpakking.",
      "Bak de spekjes met de fijngehakte knoflook krokant.",
      "Klop de eieren los met de geraspte Parmezaanse kaas.",
      "Meng de afgegoten hete pasta door de spekjes, van het vuur af.",
      "Roer snel het eimengsel erdoor tot een romige saus ontstaat.",
    ],
  },
  {
    id: uid(), name: "Groentecurry met tofu", emoji: "🍛", photoUrl: "", cookTime: 30, servings: 4, favorite: false,
    ingredients: [
      { name: "Tofu", amount: 400, unit: "g" },
      { name: "Kokosmelk", amount: 400, unit: "ml" },
      { name: "Currypasta", amount: 2, unit: "eetlepel" },
      { name: "Broccoli", amount: 300, unit: "g" },
      { name: "Rijst", amount: 300, unit: "g" },
    ],
    steps: [
      "Kook de rijst volgens de verpakking.",
      "Snijd de tofu in blokjes en bak goudbruin.",
      "Fruit de currypasta kort aan in een pan.",
      "Voeg kokosmelk en broccoli toe, laat 10 minuten sudderen.",
      "Voeg de tofu toe en verwarm mee. Serveer met rijst.",
    ],
  },
  {
    id: uid(), name: "Ovenschotel met gehakt en aardappel", emoji: "🍽️", photoUrl: "", cookTime: 50, servings: 4, favorite: false,
    ingredients: [
      { name: "Gehakt (half-om-half)", amount: 500, unit: "g" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Wortels", amount: 200, unit: "g" },
      { name: "Jong belegen kaas", amount: 100, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
    ],
    steps: [
      "Kook de aardappelen 20 minuten gaar en stamp grof.",
      "Bak het gehakt met ui en wortelblokjes rul.",
      "Verdeel het gehaktmengsel in een ovenschaal.",
      "Bedek met de gestampte aardappel en bestrooi met kaas.",
      "Bak 20 minuten op 200°C tot de kaas goudbruin is.",
    ],
  },
  {
    id: uid(), name: "Kip-groenteroerbak met noedels", emoji: "🍜", photoUrl: "", cookTime: 25, servings: 4, favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 400, unit: "g" },
      { name: "Mie noedels", amount: 300, unit: "g" },
      { name: "Paprika", amount: 2, unit: "stuks" },
      { name: "Sojasaus", amount: 3, unit: "eetlepel" },
      { name: "Knoflook", amount: 2, unit: "stuks" },
    ],
    steps: [
      "Kook de noedels volgens de verpakking en giet af.",
      "Snijd kip en paprika in reepjes, hak de knoflook fijn.",
      "Roerbak de kip op hoog vuur 5 minuten gaar.",
      "Voeg paprika en knoflook toe en bak 3 minuten mee.",
      "Voeg de noedels en sojasaus toe en meng goed door elkaar.",
    ],
  },
  {
    id: uid(), name: "Erwtensoep (snert)", emoji: "🍲", photoUrl: "", cookTime: 60, servings: 4, favorite: false,
    ingredients: [
      { name: "Spliterwten", amount: 300, unit: "g" },
      { name: "Rookworst", amount: 1, unit: "stuks" },
      { name: "Prei", amount: 1, unit: "stuks" },
      { name: "Wortels", amount: 200, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
    ],
    steps: [
      "Spoel de spliterwten af en breng met bouillon aan de kook.",
      "Laat 30 minuten zachtjes koken tot de erwten uiteenvallen.",
      "Snijd prei en wortels in stukjes en voeg toe.",
      "Voeg de rookworst toe en laat 20 minuten meegaren.",
      "Haal de worst eruit, snijd in plakjes en serveer erbij.",
    ],
  },
  {
    id: uid(), name: "Falafel met hummus en pitabroodjes", emoji: "🧆", photoUrl: "", cookTime: 30, servings: 4, favorite: false,
    ingredients: [
      { name: "Falafel (kant-en-klaar)", amount: 12, unit: "stuks" },
      { name: "Pitabroodjes", amount: 4, unit: "stuks" },
      { name: "Hummus", amount: 200, unit: "g" },
      { name: "Komkommer", amount: 1, unit: "stuks" },
      { name: "Tomaten", amount: 2, unit: "stuks" },
    ],
    steps: [
      "Bak de falafel volgens de verpakking goudbruin.",
      "Snijd komkommer en tomaten in blokjes.",
      "Verwarm de pitabroodjes kort in de oven of pan.",
      "Besmeer de pitabroodjes met hummus.",
      "Vul met falafel, komkommer en tomaat.",
    ],
  },
  {
    id: uid(), name: "Kip cordon bleu met sperziebonen", emoji: "🍽️", photoUrl: "", cookTime: 35, servings: 4, favorite: false,
    ingredients: [
      { name: "Kip cordon bleu", amount: 4, unit: "stuks" },
      { name: "Sperziebonen", amount: 400, unit: "g" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Boter", amount: 20, unit: "g" },
      { name: "Zout", amount: 1, unit: "snufje" },
    ],
    steps: [
      "Kook de aardappelen 20 minuten gaar.",
      "Bak de kip cordon bleu volgens de verpakking goudbruin en gaar.",
      "Kook de sperziebonen 10 minuten beetgaar.",
      "Stamp de aardappelen met boter tot puree of serveer heel.",
      "Serveer de kip met de sperziebonen en aardappelen.",
    ],
  },
];

/* ---------------------------------------------------------------- */
/*  Storage helpers (gedeeld met huisgenoten)                        */
/* ---------------------------------------------------------------- */

async function loadKey(key, seedFn) {
  try {
    const res = await window.storage.get(key, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {
    /* key bestaat nog niet */
  }
  const seeded = seedFn ? seedFn() : [];
  try {
    await window.storage.set(key, JSON.stringify(seeded), true);
  } catch (e) {
    console.error(`Startgegevens voor "${key}" konden niet worden opgeslagen:`, e);
  }
  return seeded;
}

async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), true);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------------------------------------------------------------- */
/*  Kleine UI-onderdelen                                             */
/* ---------------------------------------------------------------- */

function TileThumb({ recipe, size = "normal" }) {
  const idx = Math.abs([...recipe.name].reduce((a, c) => a + c.charCodeAt(0), 0)) % TILE_GRADIENTS.length;
  const [c1, c2] = TILE_GRADIENTS[idx];
  const h = size === "large" ? 180 : 96;
  if (recipe.photoUrl) {
    return (
      <div style={{ height: h, borderRadius: 16, overflow: "hidden", position: "relative" }}>
        <img src={recipe.photoUrl} alt={recipe.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div
      style={{
        height: h,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size === "large" ? 56 : 34,
        position: "relative",
      }}
    >
      {recipe.emoji || "🍽️"}
      <div style={{ position: "absolute", top: 6, left: 6, width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.55)" }} />
      <div style={{ position: "absolute", bottom: 6, right: 6, width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.35)" }} />
    </div>
  );
}

function Pill({ children, tone = "default" }) {
  const tones = {
    default: { bg: C.ceramicDark, fg: C.inkSoft },
    warn: { bg: C.warnBg, fg: C.brick },
    ok: { bg: C.successBg, fg: C.sage },
    auto: { bg: C.noteBg, fg: C.mustardDeep },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.fg,
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: 0.3,
        padding: "3px 8px",
        borderRadius: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, tone = "blue", disabled, full, compact }) {
  const bg = tone === "blue" ? C.blue : tone === "mustard" ? C.mustard : tone === "brick" ? C.brick : C.sage;
  // Wit op mosterdgeel haalt maar 2,25:1 — ruim onder de leesbaarheidsnorm.
  // Donkere tekst op datzelfde geel haalt 7,5:1.
  const tekstkleur = tone === "mustard" ? "#2A1F06" : "#fff";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#B9B6AC" : bg,
        color: disabled ? "#fff" : tekstkleur,
        border: "none",
        borderRadius: 14,
        padding: compact ? "9px 14px" : "10px 16px",
        // Aanraakvlak van minimaal 44 px: dit is de belangrijkste actie op elk
        // scherm en was met 37 px kleiner dan een stapper die je zelden gebruikt.
        minHeight: compact ? 40 : 44,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: compact ? 13 : 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, danger, full, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        color: danger ? C.brick : C.blue,
        border: `1.5px solid ${danger ? C.brick : C.blue}`,
        borderRadius: 14,
        padding: "9px 14px",
        minHeight: 44,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 4, fontFamily: FONT_BODY }}>
        {label}
      </span>
      {children}
    </label>
  );
}

// De kleuren staan als getter, niet als vaste waarde. Een gewoon object zou de
// lichte kleuren vastleggen op het moment dat dit bestand geladen wordt, en dan
// blijven alle 43 invoervelden wit — ook in donkere modus.
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 12,
  padding: "9px 11px",
  fontFamily: FONT_BODY,
  fontSize: 16,
  get border() { return `1.5px solid ${C.borderTint}`; },
  get background() { return C.cardBg; },
  get color() { return C.ink; },
};

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(21,44,72,0.45)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.paper, width: "100%", maxWidth: wide ? 640 : 480,
          maxHeight: "88vh", overflowY: "auto", borderRadius: "28px 28px 0 0",
          borderTop: `4px solid ${C.blue}`,
          padding: 20, boxShadow: "0 -8px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: C.ink, margin: 0 }}>{title}</h2>
          <button aria-label="Sluiten" onClick={onClose} style={{ background: C.ceramic, border: "none", borderRadius: 12, padding: 7, cursor: "pointer" }}>
            <X size={18} color={C.ink} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="lm-wood" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#E3B278" />
          <stop offset="1" stopColor="#8B5A2B" />
        </linearGradient>
        <linearGradient id="lm-handle" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#C98A47" />
          <stop offset="1" stopColor="#9C6530" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" rx="22" fill={C.blueDeep} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="rgba(255,255,255,0.10)" transform="rotate(45 14 14)" />
      <rect x="82" y="82" width="8" height="8" rx="2" fill="rgba(255,255,255,0.08)" transform="rotate(45 86 86)" />
      <g transform="rotate(-28 50 50)">
        <path d="M46 42 C 58 40, 71 40, 81 43 L 84 47 C 85 48.5, 85 51, 84 52.5 L 81 56 C 71 59, 58 59, 46 55 Z"
              fill="url(#lm-handle)" stroke="#6B4423" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="78" cy="49.5" r="1.9" fill="#152C48" />
        <ellipse cx="34" cy="49" rx="19" ry="14" fill="url(#lm-wood)" stroke="#6B4423" strokeWidth="1.6" />
        <path d="M22 46 C 28 43, 40 43, 47 47" stroke="#6B4423" strokeWidth="0.9" fill="none" opacity="0.35" />
        <path d="M21 52 C 28 55, 41 56, 48 51" stroke="#6B4423" strokeWidth="0.9" fill="none" opacity="0.3" />
        <ellipse cx="29" cy="43.5" rx="8" ry="4.5" fill="#F6DFB6" opacity="0.4" />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/*  Hoofd-app                                                        */
/* ---------------------------------------------------------------- */

// Welkomstscherm na het aanmaken van een huishouden.
// Bewust kort: het enige dat echt moet blijven hangen is dat Pollepel een
// kringloop is. De rest ontdekken mensen vanzelf.
// Vangt renderfouten op. Zonder dit verdwijnt bij één fout de hele app en
// blijft er een wit scherm over, zonder enige manier om verder te komen.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Onverwachte fout in de app:", error, info && info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: "100dvh", background: C.paper, color: C.ink,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        fontFamily: FONT_BODY,
      }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🥄</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, margin: "0 0 8px" }}>
            Er ging iets mis
          </h1>
          <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: "0 0 18px" }}>
            Je gegevens staan veilig opgeslagen — er is niets kwijt. Probeer het opnieuw,
            of herlaad de app.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => this.setState({ error: null })}
              style={{
                background: C.blue, color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY,
              }}
            >
              Terug naar de app
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "transparent", color: C.blue, border: `1.5px solid ${C.blue}`,
                borderRadius: 12, padding: "10px 16px", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: FONT_BODY,
              }}
            >
              App herladen
            </button>
          </div>
          <details style={{ marginTop: 18, textAlign: "left" }}>
            <summary style={{ fontSize: 12, color: C.inkSoft, cursor: "pointer" }}>
              Technische details
            </summary>
            <pre style={{
              fontFamily: FONT_MONO, fontSize: 11, color: C.inkSoft, whiteSpace: "pre-wrap",
              wordBreak: "break-word", marginTop: 6,
            }}>{String(this.state.error && (this.state.error.stack || this.state.error.message))}</pre>
          </details>
        </div>
      </div>
    );
  }
}

// Toont wat je huisgenoten op dit moment aan het koken zijn. Dit is de
// voorloper van de pushmelding in de app-versie: dezelfde gegevens, alleen
// nog binnen de app in plaats van op je vergrendelscherm.
// Abonneren op het weekmenu. Een bestand downloaden werkt op iOS slecht: het
// belandt in Bestanden en de Agenda-app wordt daar niet aangeboden. Een
// abonnement is bovendien beter passend, want het menu verandert steeds.
// Afstand tussen twee woorden: hoeveel losse wijzigingen zijn er nodig.
// Gebruikt om bijna-treffers voor te stellen, zoals "Wintepreen" bij "winterpeen".
function woordAfstand(a, b) {
  a = norm(a); b = norm(b);
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 4) return 99;
  const rij = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let vorige = rij[0];
    rij[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tijdelijk = rij[j];
      rij[j] = Math.min(
        rij[j] + 1,
        rij[j - 1] + 1,
        vorige + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      vorige = tijdelijk;
    }
  }
  return rij[b.length];
}

// Sorteert de voorraad op waarschijnlijkheid voor dit ingrediënt.
function koppelSuggesties(ingredientNaam, inventory, zoek) {
  const q = norm(zoek || "");
  const basis = q
    ? inventory.filter((i) => norm(i.name).includes(q))
    : inventory;

  const woorden = nameWords(ingredientNaam);
  return [...basis]
    .map((item) => {
      const itemWoorden = nameWords(item.name);
      let score = 0;
      if (namesMatch(item.name, ingredientNaam)) score += 100;
      // gedeelde woorden
      woorden.forEach((w) => {
        if (itemWoorden.some((iw) => wordsEqual(iw, w))) score += 20;
      });
      // bijna-treffers: één of twee letters verschil
      woorden.forEach((w) => {
        itemWoorden.forEach((iw) => {
          const d = woordAfstand(w, iw);
          if (d === 1) score += 14;
          else if (d === 2) score += 7;
        });
      });
      if (norm(item.name).startsWith(norm(ingredientNaam).slice(0, 4))) score += 5;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
}

function KoppelModal({ ingredientNaam, inventory, onKies, onClose }) {
  const [zoek, setZoek] = useState("");
  const suggesties = koppelSuggesties(ingredientNaam, inventory, zoek);

  return (
    <Modal title="Koppel aan je voorraad" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.ink, marginTop: 0, lineHeight: 1.5 }}>
        Welk product uit je voorraad bedoelt het recept met{" "}
        <strong>{ingredientNaam}</strong>?
      </p>
      <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 12px", lineHeight: 1.45 }}>
        Deze koppeling wordt onthouden, ook als de namen blijven verschillen.
      </p>

      <input
        autoComplete="off"
        style={{ ...inputStyle, marginBottom: 10 }}
        placeholder="Zoeken in je voorraad…"
        value={zoek}
        onChange={(e) => setZoek(e.target.value)}
      />

      <div style={{ maxHeight: "45vh", overflowY: "auto" }}>
        {suggesties.length === 0 && (
          <p style={{ fontSize: 13, color: C.inkSoft }}>Niets gevonden in je voorraad.</p>
        )}
        {suggesties.map(({ item, score }) => (
          <button
            key={item.id}
            onClick={() => onKies(item)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
              background: C.cardBg, border: `1.5px solid ${score >= 10 ? C.sage : C.borderTint}`,
              borderRadius: 12, padding: "9px 11px", marginBottom: 6, cursor: "pointer",
              fontFamily: FONT_BODY,
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, color: C.ink }}>{item.name}</span>
              <span style={{ display: "block", fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }}>
                {item.current} {item.unit}
              </span>
            </span>
            {score >= 10 && <Pill tone="ok">waarschijnlijk</Pill>}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <GhostButton full onClick={onClose}>Annuleren</GhostButton>
      </div>
    </Modal>
  );
}

function AgendaModal({ token, onClose, onDownload }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  if (!token) {
    return (
      <Modal title="Agenda" onClose={onClose}>
        <p style={{ fontSize: 13, color: C.inkSoft }}>
          Het agenda-adres is nog niet beschikbaar. Probeer de app te herladen.
        </p>
      </Modal>
    );
  }

  const https = `${window.location.origin}/agenda/weekmenu.ics?t=${token}`;
  const webcal = https.replace(/^https?:/, "webcal:");

  const knop = (kleur, icoon, titel, uitleg, actie) => (
    <button
      onClick={actie}
      style={{
        display: "flex", alignItems: "flex-start", gap: 11, width: "100%", textAlign: "left",
        background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14,
        padding: "12px 13px", marginBottom: 8, cursor: "pointer", fontFamily: FONT_BODY,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.2 }}>{icoon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: kleur }}>{titel}</span>
        <span style={{ display: "block", fontSize: 12, color: C.inkSoft, lineHeight: 1.45, marginTop: 1 }}>{uitleg}</span>
      </span>
    </button>
  );

  return (
    <Modal title="Weekmenu in je agenda" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.ink, marginTop: 0, lineHeight: 1.5 }}>
        Je abonneert je één keer. Daarna verschijnt elke wijziging in het weekmenu
        vanzelf in je agenda — je hoeft niets meer te downloaden.
      </p>

      {knop(C.ink, "", "Apple Agenda", "Voor iPhone, iPad en Mac. Eén tik en je bent geabonneerd.",
        () => { window.location.href = webcal; })}

      {knop(C.blue, "📅", "Google Agenda", "Werkt alleen via de website van Google Agenda, niet in de app. Google ververst ongeveer eens per etmaal.",
        () => { window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(https)}`, "_blank"); })}

      {knop(C.blueDeep, "📧", "Outlook", "Voegt het menu toe als geabonneerde agenda.",
        () => { window.open(`https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent("Weekmenu Pollepel")}`, "_blank"); })}

      <div style={{ borderTop: `1px solid ${C.ceramic}`, marginTop: 6, paddingTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>
          Andere agenda?
        </div>
        <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 8px", lineHeight: 1.45 }}>
          Kopieer dit adres en plak het bij "agenda toevoegen via internetadres".
        </p>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, color: C.ink, background: C.paper,
          borderRadius: 10, padding: "8px 10px", wordBreak: "break-all", marginBottom: 8,
        }}>{https}</div>
        <GhostButton
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(https);
              setGekopieerd(true);
              setTimeout(() => setGekopieerd(false), 2500);
            } catch (e) {
              setGekopieerd(false);
            }
          }}
        >
          <Copy size={14} /> {gekopieerd ? "Gekopieerd" : "Adres kopiëren"}
        </GhostButton>
      </div>

      {onDownload && (
        <div style={{ borderTop: `1px solid ${C.ceramic}`, marginTop: 12, paddingTop: 12 }}>
          <GhostButton onClick={onDownload}>
            <Download size={14} /> Eenmalig bestand downloaden
          </GhostButton>
          <p style={{ fontSize: 11, color: C.inkSoft, margin: "6px 0 0", lineHeight: 1.45 }}>
            Alleen de huidige periode, zonder latere wijzigingen. Op de iPhone werkt
            abonneren beter.
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: C.inkSoft, marginTop: 14, lineHeight: 1.45 }}>
        Iedereen met dit adres kan jullie weekmenu zien. Deel het alleen met je huisgenoten.
      </p>
    </Modal>
  );
}

// Wat eten we vanavond? De app opende op het kookboek en liet die vraag
// onbeantwoord, terwijl dat de kernbelofte is. Deze strook geeft het antwoord
// meteen bij het openen.
// Draaiende pollepel als wachtaanduiding. Verschijnt pas na een korte vertraging:
// bij wachttijden onder een derde seconde flitst zo'n ding alleen maar, en dat
// voelt onrustiger dan helemaal niets tonen.
function PollepelLoader({ tekst, size = 44, delay = 350, inline = false }) {
  const [zichtbaar, setZichtbaar] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setZichtbaar(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!zichtbaar) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex", flexDirection: inline ? "row" : "column",
        alignItems: "center", justifyContent: "center", gap: inline ? 8 : 10,
        padding: inline ? 0 : "24px 12px",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          // Draait om het uiteinde van de steel, zodat de bak van de lepel
          // roert in plaats van dat het geheel om zijn as tolt.
          animation: "pollepelRoeren 1.4s linear infinite",
          transformOrigin: "72% 50%",
        }}
      >
        <LogoMark size={size} />
      </span>
      {tekst && (
        <span style={{ fontSize: 12.5, color: C.inkSoft, fontFamily: FONT_BODY }}>{tekst}</span>
      )}
    </div>
  );
}

// ---- Genummerde vriesbakjes ----
// Je plakt één keer genummerde stickers op je bakjes. De sticker verandert
// daarna nooit meer; alleen wat de app erover zegt. Eet je bakje 3 op, dan is
// dat nummer weer vrij voor het volgende gerecht.

// Welke nummers zijn op dit moment in gebruik?
const SPELLING_CORRECTIES = [
  [/\bjasrijst\b/gi, "jasmijnrijst"],
  [/\bjasmijn rijst\b/gi, "jasmijnrijst"],
  [/\bzilvervlies rijst\b/gi, "zilvervliesrijst"],
  [/\bcreme fraiche\b/gi, "crème fraîche"],
  [/\bcrème fraiche\b/gi, "crème fraîche"],
  [/\bkook room\b/gi, "kookroom"],
  [/\bslag room\b/gi, "slagroom"],
  [/\bknoflook teen(tje)?s?\b/gi, "knoflookteentjes"],
  // "ui en" is bewust weggelaten: dat komt in gewoon Nederlands voor
  // ("de ui en de knoflook") en werd dan verminkt tot "de uien knoflook".
  [/\bpaprika poeder\b/gi, "paprikapoeder"],
  [/\bolijf olie\b/gi, "olijfolie"],
  [/\bsoja saus\b/gi, "sojasaus"],
  [/\bwortel en\b/gi, "wortelen"],
  [/\btagliatele\b/gi, "tagliatelle"],
  [/\bcourgete\b/gi, "courgette"],
  [/\bauberginne\b/gi, "aubergine"],
  [/\bmozarella\b/gi, "mozzarella"],
  [/\bspaghettie\b/gi, "spaghetti"],
  [/\bbouillon blokje\b/gi, "bouillonblokje"],
  [/\bkip filet\b/gi, "kipfilet"],
  [/\brook worst\b/gi, "rookworst"],
  // Engelse termen die door de Nederlandse tekst heen sijpelen.
  [/\bbell pepper[s]?\b/gi, "paprika"],
  [/\bspring onion[s]?\b/gi, "lente-ui"],
  [/\bscallion[s]?\b/gi, "lente-ui"],
  [/\bcilantro\b/gi, "koriander"],
  [/\bzucchini\b/gi, "courgette"],
  [/\beggplant\b/gi, "aubergine"],
  [/\bsweet potato(es)?\b/gi, "zoete aardappel"],
  [/\bchickpeas?\b/gi, "kikkererwten"],
  [/\bpine nuts?\b/gi, "pijnboompitten"],
  [/\bheavy cream\b/gi, "slagroom"],
  [/\bsour cream\b/gi, "zure room"],
  [/\bcream cheese\b/gi, "roomkaas"],
  [/\bground beef\b/gi, "rundergehakt"],
  [/\bminced meat\b/gi, "gehakt"],
  [/\bchicken breast\b/gi, "kipfilet"],
  [/\bchicken thighs?\b/gi, "kipdijfilet"],
  [/\bolive oil\b/gi, "olijfolie"],
  [/\bsoy sauce\b/gi, "sojasaus"],
  [/\bstock cube[s]?\b/gi, "bouillonblokje"],
  // Werkwoorden in de gebiedende wijs, zoals een Nederlands recept ze schrijft.
  // "Roerbakken de groenten" is geen verbetering ten opzichte van het Engels.
  [/\bstir[- ]?fry\b/gi, "roerbak"],
  [/\bstir[- ]?frying\b/gi, "roerbakken"],
  // Het accent telt niet als woordteken, dus een grens erachter werkt niet.
  [/\bsaut[eé](er|ed|ing)?(?![a-zà-ÿ])/gi, "fruit"],
  [/\bsimmer for\b/gi, "laat sudderen"],
  [/\bsimmer\b/gi, "laat sudderen"],
  [/\blet simmer\b/gi, "laat sudderen"],
  [/\bseason to taste\b/gi, "breng op smaak"],
  [/\bpreheat the oven\b/gi, "verwarm de oven voor"],
  [/\bpreheat de oven\b/gi, "verwarm de oven voor"],
  [/\btopping(s)?\b/gi, "garnering"],
  [/\bside dish\b/gi, "bijgerecht"],
  [/\bserve(s)? with\b/gi, "serveer met"],
  [/\bset aside\b/gi, "apart zetten"],
  [/\bpreheat\b/gi, "verwarm voor"],
  // "drain" bewust niet vertaald: "giet af de pasta" is krom, en een scheidbaar
  // werkwoord laat zich niet met zoek-en-vervang goed omzetten. De opdracht
  // vraagt al om Nederlands; dit vangnet mag niets erger maken dan het was.
  [/\bchop(ped)?\b/gi, "gesneden"],
  [/\bsliced\b/gi, "in plakjes"],
  [/\bdiced\b/gi, "in blokjes"],
  [/\bgrated\b/gi, "geraspt"],
  [/\bfresh\b/gi, "verse"],
  [/\bto taste\b/gi, "naar smaak"],
  [/\bbaking (tray|sheet)\b/gi, "bakplaat"],
  [/\bfrying pan\b/gi, "koekenpan"],
  [/\bmedium heat\b/gi, "middelhoog vuur"],
  [/\bcherry tomatoes?\b/gi, "cherrytomaatjes"],
  [/\bbay leaf\b/gi, "laurierblad"],
  [/\bgarlic cloves?\b/gi, "knoflookteentjes"]
];
function corrigeerSpelling(tekst) {
  if (!tekst) return tekst;
  let uit = String(tekst);
  SPELLING_CORRECTIES.forEach(([patroon, juist]) => {
    uit = uit.replace(patroon, juist);
  });
  if (/^[A-ZÀ-Þ]/.test(String(tekst)) && /^[a-zà-ÿ]/.test(uit)) {
    uit = uit.charAt(0).toUpperCase() + uit.slice(1);
  }
  return uit;
}
const BEKENDE_PRODUCTWOORDEN = [
  "aardappel",
  "broccoli",
  "spinazie",
  "wortel",
  "paprika",
  "courgette",
  "aubergine",
  "bloemkool",
  "spruitjes",
  "prei",
  "champignon",
  "tomaat",
  "komkommer",
  "boerenkool",
  "kip",
  "eend",
  "rund",
  "varken",
  "gehakt",
  "spek",
  "worst",
  "zalm",
  "kabeljauw",
  "rijst",
  "pasta",
  "bulgur",
  "quinoa",
  "couscous",
  "noedel",
  "room",
  "kaas",
  "boter",
  "yoghurt",
  "melk"
];
const ECHTE_SAMENSTELLINGEN = [
  "rundergehakt",
  "varkensgehakt",
  "kalfsgehakt",
  "kippengehakt",
  "kipgehakt",
  "roomboter",
  "roomkaas",
  "roomijs",
  "kookroom",
  "slagroom",
  "zilvervliesrijst",
  "jasmijnrijst",
  "risottorijst",
  "paellarijst",
  "kabeljauwfilet",
  "zalmfilet",
  "kipfilet",
  "kipdijfilet",
  "varkenshaas",
  "kippenbouillon",
  "runderbouillon",
  "groentebouillon",
  "visbouillon",
  "aardappelpuree",
  "tomatenpuree",
  "tomatenblokjes",
  "tomatenpassata",
  "boerenkool",
  "bloemkool",
  "zuurkool",
  "rodekool",
  "spitskool",
  "witlof",
  "champignonroomsaus",
  "kaassaus",
  "kaasblokjes",
  "geitenkaas",
  "roomkwark"
];
function lijktVerzonnen(naam) {
  const n = norm(naam).replace(/[^a-zà-ÿ]/g, "");
  if (n.length < 10) return false;
  if (ECHTE_SAMENSTELLINGEN.some((echt) => n.includes(echt))) return false;
  const gevonden = BEKENDE_PRODUCTWOORDEN.filter((w) => n.includes(w));
  if (gevonden.length < 2) return false;
  const gedekt = gevonden.reduce((s, w) => s + w.length, 0);
  return gedekt >= n.length - 3;
}
const AFKEUR_FAMILIES = {
  vis: [
    "zalm",
    "kabeljauw",
    "tonijn",
    "haring",
    "makreel",
    "forel",
    "schol",
    "pangasius",
    "koolvis",
    "tilapia",
    "ansjovis",
    "sardine",
    "zeebaars",
    "victoriabaars",
    "heilbot",
    "garnaal",
    "garnalen",
    "mosselen",
    "scampi",
    "inktvis",
    "surimi",
    "vissticks",
    "visfilet",
    "zeevruchten",
    "schaaldieren",
    "lekkerbek",
    "kibbeling"
  ],
  vlees: [
    "kip",
    "rund",
    "varken",
    "gehakt",
    "spek",
    "worst",
    "ham",
    "kalkoen",
    "lam",
    "biefstuk",
    "schnitzel",
    "bacon",
    "salami",
    "shoarma",
    "kipfilet"
  ],
  varkensvlees: ["spek", "ham", "bacon", "worst", "schnitzel", "procureur", "speklapjes"],
  noten: [
    "walnoot",
    "amandel",
    "cashew",
    "hazelnoot",
    "pecan",
    "pistache",
    "pinda",
    "pijnboompitten",
    "notenmix"
  ],
  paddenstoelen: ["champignon", "shiitake", "oesterzwam", "cantharel", "portobello"]
};
function valtOnderAfkeur(ingredientNaam, afkeur) {
  if (namesMatch(ingredientNaam, afkeur)) return true;
  const familie = AFKEUR_FAMILIES[norm(afkeur)];
  if (!familie) return false;
  const naam = norm(ingredientNaam);
  return familie.some((lid) => {
    if (namesMatch(ingredientNaam, lid)) return true;
    return lid.length >= 4 && naam.includes(lid);
  });
}

function bezetteBakjes(inventory) {
  const bezet = new Set();
  (inventory || []).forEach((i) => {
    (i.containers || []).forEach((n) => bezet.add(Number(n)));
  });
  return bezet;
}

// Geeft de laagste vrije nummers uit. Zijn er te weinig vrij, dan krijg je
// terug wat er wél is — liever drie bakjes genummerd dan de hele actie afbreken.
function kiesVrijeBakjes(inventory, aantal, maxNummers = 40) {
  const bezet = bezetteBakjes(inventory);
  const vrij = [];
  for (let n = 1; n <= maxNummers && vrij.length < aantal; n++) {
    if (!bezet.has(n)) vrij.push(n);
  }
  return vrij;
}

// "3 en 4", "3, 4 en 5", "3"
function bakjesTekst(nummers) {
  const lijst = (nummers || []).map(Number).sort((a, b) => a - b);
  if (!lijst.length) return "";
  if (lijst.length === 1) return String(lijst[0]);
  return lijst.slice(0, -1).join(", ") + " en " + lijst[lijst.length - 1];
}

// ---- Gezondheidscheck van je gegevens ----
// Bijna elke fout die we tegenkwamen was stil: de app deed het "gewoon", en je
// ontdekte het pas weken later. Deze controle stelt dezelfde vragen die je
// anders zelf zou moeten stellen.
// Leidt een minimumvoorraad af uit je eigen verbruik. Het minimum is de
// belangrijkste instelling in de app — daar hangt de hele boodschappenlijst
// aan — maar niemand vult dat voor honderd producten doordacht in.
function stelMinimumVoor(item, consumptionLog) {
  if (!item || !consumptionLog || !consumptionLog.length) return null;

  const nu = Date.now();
  const regels = consumptionLog.filter(
    (c) => namesMatch(c.name, item.name) && c.unit === item.unit
  );
  if (regels.length < 2) return null; // te weinig om iets zinnigs over te zeggen

  const oudste = Math.min(...regels.map((c) => new Date(c.date).getTime()));
  const dagen = Math.max(7, (nu - oudste) / 86400000);
  const totaal = regels.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  if (totaal <= 0) return null;

  const perWeek = (totaal / dagen) * 7;

  // Afronden op bruikbare stappen: 496 gram is geen voorraadinstelling,
  // 500 wel. Wat je instelt moet je ook kunnen onthouden.
  const eenheid = (item.unit || "").toLowerCase();
  const stap = eenheid === "g" || eenheid === "ml" ? 50
    : (eenheid === "kg" || eenheid === "l" ? 0.5 : 1);
  const afronden = (n) => Math.max(stap, Math.round(n / stap) * stap);

  const minimum = afronden(perWeek);
  return {
    perWeek: round2(perWeek),
    minimum,
    maximum: afronden(minimum * 3),
    gebaseerdOp: regels.length,
    periodeDagen: Math.round(dagen),
  };
}

function controleerGegevens({ inventory = [], weekmenu = {}, recipes = [], shoppingList = [], categories = CATEGORIES }) {
  const bevindingen = [];
  const vandaag = dateKey(new Date());

  // 1. Maximum onder het minimum: elke aankoop wordt dan afgetopt op dat lage getal.
  inventory.forEach((i) => {
    const min = Number(i.min || 0), max = Number(i.max || 0);
    if (max > 0 && max < min) {
      bevindingen.push({
        soort: "minmax", ernst: "hoog", itemId: i.id,
        tekst: `${i.name}: maximum (${max}) ligt onder het minimum (${min}).`,
        gevolg: "Wat je bijkoopt wordt afgetopt op het maximum.",
        herstel: { min, max: Math.max(min, Number(i.current || 0)) },
      });
    }
  });

  // 2. Negatieve voorraad kan niet bestaan.
  inventory.forEach((i) => {
    if (Number(i.current || 0) < 0) {
      bevindingen.push({
        soort: "negatief", ernst: "hoog", itemId: i.id,
        tekst: `${i.name} staat op ${i.current} ${i.unit}.`,
        gevolg: "Een voorraad onder nul klopt nooit.",
        herstel: { current: 0 },
      });
    }
  });

  // 3. Houdbaarheidsdatum verstreken.
  inventory.forEach((i) => {
    if (i.expiryDate && i.expiryDate < vandaag && Number(i.current || 0) > 0) {
      bevindingen.push({
        soort: "verlopen", ernst: "laag", itemId: i.id,
        tekst: `${i.name} was houdbaar tot ${i.expiryDate}.`,
        gevolg: "Nog wel als voorraad meegeteld.",
      });
    }
  });

  // 4. Categorie die niet bestaat: die producten zag je tot voor kort helemaal niet.
  const onbekend = new Map();
  [...inventory, ...shoppingList].forEach((i) => {
    if (i.category && !categories.includes(i.category)) {
      onbekend.set(i.category, (onbekend.get(i.category) || 0) + 1);
    }
  });
  onbekend.forEach((aantal, cat) => {
    bevindingen.push({
      soort: "categorie", ernst: "midden",
      tekst: `${aantal} product${aantal > 1 ? "en" : ""} staat in de categorie "${cat}".`,
      gevolg: "Die categorie bestaat niet meer in de lijst.",
    });
  });

  // 5. Twee bakjes met hetzelfde nummer. Kan gebeuren als twee huisgenoten
  // op precies hetzelfde moment invriezen.
  const nummerGebruik = new Map();
  inventory.forEach((i) => {
    (i.containers || []).forEach((n) => {
      if (!nummerGebruik.has(n)) nummerGebruik.set(n, []);
      nummerGebruik.get(n).push(i.name);
    });
  });
  nummerGebruik.forEach((namen, nummer) => {
    if (namen.length > 1) {
      bevindingen.push({
        soort: "bakje", ernst: "midden",
        tekst: `Bakje ${nummer} is aan meerdere gerechten toegekend: ${namen.join(" en ")}.`,
        gevolg: "Pas een van beide nummers aan.",
      });
    }
  });

  // 6. Weekmenu verwijst naar iets dat niet meer bestaat.
  Object.entries(weekmenu).forEach(([dag, entry]) => {
    if (!entry) return;
    if (entry.recipeId && !recipes.some((r) => r.id === entry.recipeId)) {
      bevindingen.push({
        soort: "weekmenu", ernst: "midden",
        tekst: `${dag}: het geplande recept bestaat niet meer.`,
        gevolg: "Die avond is in feite leeg.",
      });
    }
    if (entry.leftoverItemId && !inventory.some((i) => i.id === entry.leftoverItemId)) {
      bevindingen.push({
        soort: "kliekje", ernst: "midden",
        tekst: `${dag}: het geplande kliekje staat niet meer in je voorraad.`,
        gevolg: "Opgegeten, of verwijderd.",
      });
    }
  });

  const volgorde = { hoog: 0, midden: 1, laag: 2 };
  return bevindingen.sort((a, b) => volgorde[a.ernst] - volgorde[b.ernst]);
}

const EXTRA_LABELS = ["Ontbijt", "Lunch", "Middag", "Toetje", "Taart", "Borrel"];
const EXTRA_ICONEN = { Ontbijt: "🥐", Lunch: "🥪", Middag: "☕", Toetje: "🍮", Taart: "🎂", Borrel: "🥂" };

// Kiezen wát het is, en voor hoeveel mensen. Dat aantal is apart nodig: een
// taart voor twaalf terwijl jullie met vier eten, anders klopt de boodschappenlijst niet.
function ExtraToevoegenModal({ datum, recipes, onKies, onClose }) {
  const [label, setLabel] = useState("Taart");
  const [eigenLabel, setEigenLabel] = useState("");
  const [zoek, setZoek] = useState("");
  const [gekozenRecept, setGekozenRecept] = useState(null);
  const [personen, setPersonen] = useState("");

  const gevonden = recipes
    .filter((r) => !zoek || r.name.toLowerCase().includes(zoek.toLowerCase()))
    .slice(0, 25);

  const echteLabel = label === "Anders" ? (eigenLabel.trim() || "Extra") : label;

  return (
    <Modal title="Iets extra's toevoegen" onClose={onClose}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 7 }}>Wat is het?</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {[...EXTRA_LABELS, "Anders"].map((l) => (
          <button
            key={l}
            onClick={() => setLabel(l)}
            style={{
              padding: "8px 12px", minHeight: 38, borderRadius: 20, cursor: "pointer",
              fontFamily: FONT_BODY, fontSize: 13,
              background: label === l ? C.blue : C.cardBg,
              color: label === l ? "#fff" : C.ink,
              border: `1.5px solid ${label === l ? C.blue : C.borderTint}`,
            }}
          >
            {EXTRA_ICONEN[l] ? EXTRA_ICONEN[l] + " " : ""}{l}
          </button>
        ))}
      </div>

      {label === "Anders" && (
        <Field label="Wat is het?">
          <input autoComplete="off" style={inputStyle} value={eigenLabel}
            onChange={(e) => setEigenLabel(e.target.value)} placeholder="Bijvoorbeeld: high tea" />
        </Field>
      )}

      {!gekozenRecept ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 7px" }}>Welk recept?</div>
          <input autoComplete="off" style={{ ...inputStyle, marginBottom: 10 }}
            placeholder="Zoek een recept…" value={zoek} onChange={(e) => setZoek(e.target.value)} />
          <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
            {gevonden.map((r) => (
              <button
                key={r.id}
                onClick={() => { setGekozenRecept(r); setPersonen(String(r.servings || 4)); }}
                style={{
                  display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
                  background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12,
                  padding: "9px 11px", marginBottom: 6, cursor: "pointer", fontFamily: FONT_BODY,
                }}
              >
                <span style={{ fontSize: 18 }}>{r.emoji || "🍽️"}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: C.ink }}>{r.name}</span>
              </button>
            ))}
            {gevonden.length === 0 && (
              <p style={{ fontSize: 12.5, color: C.inkSoft }}>Geen recept gevonden.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, background: C.noteBg,
            border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: "11px 13px", marginBottom: 12,
          }}>
            <span style={{ fontSize: 22 }}>{gekozenRecept.emoji || "🍽️"}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11, color: C.inkSoft }}>{echteLabel}</span>
              <span style={{ display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }}>{gekozenRecept.name}</span>
            </span>
            <GhostButton onClick={() => setGekozenRecept(null)}>Anders</GhostButton>
          </div>

          <Field label="Voor hoeveel personen?">
            <input autoComplete="off" type="number" style={inputStyle} value={personen}
              onChange={(e) => setPersonen(e.target.value)} />
          </Field>
          <p style={{ fontSize: 11, color: C.inkSoft, margin: "-4px 0 14px", lineHeight: 1.45 }}>
            Hiermee wordt de boodschappenlijst berekend. Een taart voor twaalf vraagt
            andere hoeveelheden dan een toetje voor vier.
          </p>

          <PrimaryButton full onClick={() => onKies({
            date: datum, recipeId: gekozenRecept.id, label: echteLabel,
            servings: Number(personen) || gekozenRecept.servings || 4,
          })}>
            <Plus size={16} /> Toevoegen
          </PrimaryButton>
        </>
      )}
    </Modal>
  );
}

// Foutlogboek in de app. Op een iPhone kun je niet bij dat van de browser,
// waardoor een probleem melden neerkomt op "het werkt niet" — en daar kan
// niemand iets mee.
function LogboekModal({ onClose }) {
  const regels = (typeof window !== "undefined" && window.pollepelLog) ? [...window.pollepelLog].reverse() : [];
  const [gekopieerd, setGekopieerd] = useState(false);

  const alsTekst = () =>
    regels.map((r) => `[${r.soort}] ${r.tijd.slice(11, 19)} ${r.tekst}`).join("\n") || "geen meldingen";

  const deel = async () => {
    const tekst = `Pollepel foutlogboek\n${new Date().toLocaleString("nl-NL")}\n\n${alsTekst()}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Pollepel foutlogboek", text: tekst }); return; } catch (e) { return; }
    }
    try {
      await navigator.clipboard.writeText(tekst);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2500);
    } catch (e) { /* niets meer aan te doen */ }
  };

  return (
    <Modal title="Foutlogboek" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0, lineHeight: 1.5 }}>
        Hier staan de laatste meldingen van de app. Werkt er iets niet, dan kun je
        dit delen — dan is meteen duidelijk wat er misging.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <PrimaryButton onClick={deel}>
          <Share2 size={15} /> {gekopieerd ? "Gekopieerd" : "Delen"}
        </PrimaryButton>
        <GhostButton onClick={() => {
          if (window.pollepelLog) window.pollepelLog.length = 0;
          try { localStorage.removeItem("pollepel-log"); } catch (e) { /* niets aan te doen */ }
          onClose();
        }}>
          Leegmaken
        </GhostButton>
      </div>

      {regels.length === 0 ? (
        <p style={{ fontSize: 13, color: C.sage }}>Geen meldingen — er is niets misgegaan.</p>
      ) : (
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {regels.map((r, i) => (
            <div key={i} style={{
              background: r.soort === "error" ? C.warnBg : C.cardBg,
              border: `1px solid ${r.soort === "error" ? C.brick : C.borderTint}`,
              borderRadius: 10, padding: "8px 10px", marginBottom: 6,
            }}>
              <div style={{ fontSize: 10, color: C.inkSoft, fontFamily: FONT_MONO, marginBottom: 2 }}>
                {r.tijd.slice(11, 19)} · {r.soort === "error" ? "fout" : "waarschuwing"}
              </div>
              <div style={{ fontSize: 11.5, color: C.ink, fontFamily: FONT_MONO, wordBreak: "break-word", lineHeight: 1.45 }}>
                {r.tekst}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function ControleModal({ bevindingen, onHerstel, onClose }) {
  const kleur = { hoog: C.brick, midden: C.mustardDeep, laag: C.inkSoft };
  const label = { hoog: "Moet je bekijken", midden: "Let op", laag: "Ter info" };

  return (
    <Modal title="Controle van je gegevens" onClose={onClose}>
      {bevindingen.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 10px" }}>
          <CheckCircle2 size={30} color={C.sage} />
          <p style={{ fontSize: 13.5, color: C.ink, marginTop: 8 }}>Alles ziet er goed uit.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0, lineHeight: 1.5 }}>
            Dit soort dingen doet de app niet vanzelf opvallen. Hier staan ze bij elkaar.
          </p>
          {bevindingen.map((b, i) => (
            <div key={i} style={{
              background: C.cardBg, border: `1.5px solid ${b.ernst === "hoog" ? C.brick : C.borderTint}`,
              borderRadius: 14, padding: "11px 13px", marginBottom: 8,
            }}>
              <div style={{ fontSize: 10.5, color: kleur[b.ernst], fontWeight: 600, letterSpacing: "0.03em", marginBottom: 3 }}>
                {label[b.ernst]}
              </div>
              <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>{b.tekst}</div>
              {b.gevolg && (
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>{b.gevolg}</div>
              )}
              {b.herstel && (
                <div style={{ marginTop: 9 }}>
                  <GhostButton onClick={() => onHerstel(b)}>
                    <Check size={14} /> Rechtzetten
                  </GhostButton>
                </div>
              )}
            </div>
          ))}
        </>
      )}
      <div style={{ marginTop: 12 }}>
        <PrimaryButton full onClick={onClose}>Sluiten</PrimaryButton>
      </div>
    </Modal>
  );
}

function VanavondStrook({ entry, recipe, readiness, cookNaam, alGekookt, onOpen, onVerrasMe, onNaarWeekmenu }) {
  const basis = {
    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
    borderRadius: 16, padding: "12px 14px", marginBottom: 12, cursor: "pointer",
    fontFamily: FONT_BODY, border: `1.5px solid ${C.borderTint}`, background: C.cardBg,
  };

  // Niemand kookt vanavond
  if (entry && entry.offNight) {
    return (
      <div style={{ ...basis, cursor: "default" }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🍕</span>
        <span>
          <span style={{ display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Vanavond</span>
          <span style={{ display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }}>Niemand kookt</span>
        </span>
      </div>
    );
  }

  // Niets gepland
  if (!recipe) {
    return (
      <div style={{ ...basis, cursor: "default", flexWrap: "wrap" }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🤔</span>
        <span style={{ flex: 1, minWidth: 120 }}>
          <span style={{ display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Vanavond</span>
          <span style={{ display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }}>Nog niets gepland</span>
        </span>
        <span style={{ display: "flex", gap: 6 }}>
          <PrimaryButton tone="mustard" compact onClick={onVerrasMe}>
            <Shuffle size={14} /> Verras me
          </PrimaryButton>
          <GhostButton onClick={onNaarWeekmenu}>Plannen</GhostButton>
        </span>
      </div>
    );
  }

  const mist = readiness ? readiness.missing.length : 0;

  if (alGekookt) {
    return (
      <button onClick={() => onOpen(recipe.id)} style={{ ...basis, borderColor: C.sage }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>{recipe.emoji || "🍽️"}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Vanavond</span>
          <span style={{ display: "block", fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.25 }}>{recipe.name}</span>
          <span style={{ display: "block", fontSize: 12, color: C.sage, marginTop: 2 }}>
            <Check size={12} style={{ verticalAlign: -1, marginRight: 3 }} />Gekookt — eet smakelijk
          </span>
        </span>
        <ChevronRight size={18} color={C.inkSoft} style={{ flexShrink: 0 }} />
      </button>
    );
  }

  return (
    <button onClick={() => onOpen(recipe.id)} style={{ ...basis, borderColor: C.mustard }}>
      <span style={{ fontSize: 26, flexShrink: 0 }}>{recipe.emoji || "🍽️"}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }}>Vanavond</span>
        <span style={{ display: "block", fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.25 }}>{recipe.name}</span>
        <span style={{ display: "block", fontSize: 12, color: mist ? C.brick : C.sage, marginTop: 2 }}>
          {cookNaam ? `${cookNaam} kookt · ` : ""}
          {mist === 0
            ? "alles in huis"
            : `nog ${mist} ${mist === 1 ? "ingrediënt" : "ingrediënten"} nodig`}
        </span>
      </span>
      <ChevronRight size={18} color={C.inkSoft} style={{ flexShrink: 0 }} />
    </button>
  );
}

function KookMelding({ sessies, currentUserName, onOpen }) {
  const vanAnderen = (sessies || []).filter((s) => (s.cookName || "") !== currentUserName);
  if (!vanAnderen.length) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      {vanAnderen.map((s) => {
        const klaar = s.readyAt ? new Date(s.readyAt) : null;
        const nog = klaar ? Math.round((klaar - Date.now()) / 60000) : null;
        return (
          <button
            key={s.id}
            onClick={() => s.recipeId && onOpen && onOpen(s.recipeId)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
              background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16,
              padding: "11px 13px", cursor: s.recipeId ? "pointer" : "default",
              marginBottom: 8, fontFamily: FONT_BODY,
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji || "🍳"}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }}>
                {s.cookName || "Iemand"} is begonnen aan {s.recipeName}
              </span>
              <span style={{ display: "block", fontSize: 12, color: C.inkSoft, marginTop: 1 }}>
                {klaar
                  ? (nog > 0
                      ? `Klaar rond ${klaar.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} — nog ${nog} min`
                      : "Zou nu klaar moeten zijn")
                  : "Aan het koken"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function WelcomeTour({ onFinish }) {
  const [step, setStep] = useState(0);

  const LOOP = [
    { emoji: "📦", label: "Voorraad", color: C.sage, text: "Je legt vast wat er in huis hoort te zijn." },
    { emoji: "🗓️", label: "Weekmenu", color: C.blue, text: "Je plant welke avonden je wat eet." },
    { emoji: "🛒", label: "Boodschappen", color: C.mustard, text: "De lijst vult zichzelf met wat je mist." },
    { emoji: "🔥", label: "Koken", color: C.brick, text: "Na het koken gaat het van je voorraad af." },
  ];

  const steps = [
    {
      title: "Welkom bij Pollepel",
      body: (
        <>
          <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, margin: "0 0 14px" }}>
            Pollepel is geen verzameling lijstjes, maar één kringloop. Elke stap voedt de volgende.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LOOP.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: s.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                }}>{s.emoji}</div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{s.text}</div>
                </div>
                {i < LOOP.length - 1 && null}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.inkSoft, margin: "14px 0 0", lineHeight: 1.5 }}>
            En dan begint hij opnieuw: wat opraakt staat vanzelf weer op je boodschappenlijst.
          </p>
        </>
      ),
    },
    {
      title: "Je eerste avond",
      body: (
        <>
          <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, margin: "0 0 14px" }}>
            Drie dingen, en de kringloop draait. Reken op een half uur.
          </p>
          {[
            ["Vijf recepten die je écht vaak maakt", "Niet je mooiste, je meest gemaakte. Typen mag, of laat Pollepel ze overnemen van een foto of een link."],
            ["Je voorraadkast, nog niet je koelkast", "Begin met wat er altijd hoort te staan: pasta, rijst, olie, blik tomaat."],
            ["Plan drie avonden, geen zeven", "Een half menu dat je volhoudt werkt beter dan een vol menu dat je woensdag loslaat."],
          ].map(([kop, uitleg], i) => (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: C.blue, color: "#fff", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT_MONO, fontSize: 12,
              }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{kop}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{uitleg}</div>
              </div>
            </div>
          ))}
        </>
      ),
    },
    {
      title: "Twee dingen die het verschil maken",
      body: (
        <>
          <div style={{ background: C.paper, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
              Zet een minimum per product
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
              Dit is de belangrijkste instelling in de app. Zak je eronder, dan komt het vanzelf op je boodschappenlijst. Zonder minimum blijft de lijst leeg.
            </div>
          </div>
          <div style={{ background: C.paper, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
              Tik na het eten op “Ik heb dit gekookt”
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
              Dit sluit de kringloop. Sla je het over, dan loopt je voorraad achter en klopt je lijst niet meer.
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
            Pollepel werkt pas echt als je hem samen gebruikt. Stuur je huisgenoot een uitnodiging via Instellingen — één tik, en jullie delen hetzelfde kookboek, dezelfde voorraad en dezelfde boodschappenlijst.
          </p>
        </>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,29,27,0.55)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: C.cardBg, width: "100%", maxWidth: 460,
        borderRadius: "22px 22px 0 0", padding: "22px 20px 18px",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🥄</span>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, margin: 0, color: C.ink }}>
            {steps[step].title}
          </h2>
        </div>

        <div style={{ marginTop: 12 }}>{steps[step].body}</div>

        {/* voortgang */}
        <div style={{ display: "flex", gap: 5, justifyContent: "center", margin: "18px 0 14px" }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 7, height: 7, borderRadius: 4,
              background: i === step ? C.mustard : C.ceramic, transition: "width .2s",
            }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {step > 0 && <GhostButton onClick={() => setStep(step - 1)}>Terug</GhostButton>}
          <PrimaryButton full onClick={() => (isLast ? onFinish() : setStep(step + 1))}>
            {isLast ? "Aan de slag" : "Verder"}
          </PrimaryButton>
        </div>

        {!isLast && (
          <button
            onClick={onFinish}
            style={{
              display: "block", margin: "10px auto 0", background: "none", border: "none",
              color: C.inkSoft, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY,
            }}
          >
            Overslaan
          </button>
        )}
      </div>
    </div>
  );
}

function AppInner({ household = null, members = [], onLogout = null, onRenameHousehold = null } = {}) {
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null); // { key, opnieuw() }
  const [cookingSessions, setCookingSessions] = useState([]); // wie is er nu aan het koken
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [koppelVoor, setKoppelVoor] = useState(null); // { recipeId, ingredientNaam }
  const [leftoverContext, setLeftoverContext] = useState(null); // voorraaditem-id van een gepland kliekje
  const [controleOpen, setControleOpen] = useState(false);
  const [logboekOpen, setLogboekOpen] = useState(false);
  const [extras, setExtras] = useState([]); // extra gerechten naast het avondeten
  const [extraVoorDag, setExtraVoorDag] = useState(null);

  const [periodIndex, setPeriodIndex] = useState(0); // welke planningsperiode je bekijkt
  // Welke kijk op je kookboek: alles, kan ik maken, favoriet of seizoen.
  // Bewust niet bewaard tussen sessies: anders open je de app in een gefilterde
  // staat en denk je dat er recepten kwijt zijn.
  const [bookView, setBookView] = useState("alles");
  const [currentUserName, setCurrentUserName] = useState("");
  const savingRef = React.useRef(false); // voorkomt dat verversen je eigen bewerking overschrijft
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const [saving, setSaving] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [weekmenu, setWeekmenu] = useState({});
  const [cooks, setCooks] = useState([]);
  const [preferences, setPreferences] = useState({ darkMode: false, categoryOrder: null, diets: [], dislikes: [], premium: { photoInventory: true, predictiveDepletion: true, householdRSVP: true, sousChef: true } });
  const [cookLog, setCookLog] = useState([]);
  const [consumptionLog, setConsumptionLog] = useState([]);
  const [rsvp, setRsvp] = useState({});
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash === "#boodschappen") return "boodschappen";
    return "kookboek";
  });
  const [query, setQuery] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [bookMode, setBookMode] = useState("mine"); // "mine" | "community"
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const hasCommunityBackend = typeof window !== "undefined" && !!window.communityStore;
  const hasDataAPI = typeof window !== "undefined" && !!window.dataAPI;
  const [maxCookTime, setMaxCookTime] = useState(null);
  const [openRecipeId, setOpenRecipeId] = useState(null);
  const [doublePortionDefault, setDoublePortionDefault] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null); // object or null; {} = nieuw
  const [editingItem, setEditingItem] = useState(null); // voorraaditem
  const [toast, setToast] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState(null);
  const [cookDay, setCookDay] = useState(null);
  const [attendeesDay, setAttendeesDay] = useState(null);
  const [aiWeekOpen, setAiWeekOpen] = useState(false);
  const [aiWeekGenerating, setAiWeekGenerating] = useState(false);
  const [aiWeekProgress, setAiWeekProgress] = useState("");
  const [aiWeekError, setAiWeekError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [printCardOpen, setPrintCardOpen] = useState(false);
  const [tabletModeOpen, setTabletModeOpen] = useState(false);
  const [shelfPhotoOpen, setShelfPhotoOpen] = useState(false);
  const [shelfScanning, setShelfScanning] = useState(false);
  const [shelfScanError, setShelfScanError] = useState("");
  const [shelfScanResults, setShelfScanResults] = useState([]);

  useEffect(() => {
    (async () => {
      let r, i, s, w, c, p, log, cLog;
      if (hasDataAPI) {
        [r, i, s, w, c, p, log, cLog] = await Promise.all([
          window.dataAPI.recipes.list(),
          window.dataAPI.inventory.list(),
          window.dataAPI.shopping.list(),
          window.dataAPI.weekmenu.list(),
          window.dataAPI.cooks.list(),
          window.dataAPI.preferences.get(),
          window.dataAPI.cookLog.list(),
          window.dataAPI.consumptionLog.list(),
        ]);
        if (!r.length) r = seedRecipes(); // veiligheidsnet: mocht de startbibliotheek onverhoopt leeg zijn
      } else {
        [r, i, s, w, c, p, log, cLog] = await Promise.all([
          loadKey("recipes", seedRecipes),
          loadKey("inventory", seedInventory),
          loadKey("shoppingList", () => []),
          loadKey("weekmenu", () => ({})),
          loadKey("cooks", () => []),
          loadKey("preferences", () => ({ darkMode: false, categoryOrder: null, diets: [], dislikes: [], premium: { photoInventory: true, predictiveDepletion: true, householdRSVP: true, sousChef: true } })),
          loadKey("cookLog", () => []),
          loadKey("consumptionLog", () => []),
        ]);
      }
      applyTheme(!!p.darkMode);
      setPreferences(p);
      setCookLog(log);
      setConsumptionLog(cLog);
      setRecipes(r);
      setInventory(i);
      setShoppingList(s);
      setWeekmenu(w);
      setCooks(c);
      setLoading(false);
      if (hasDataAPI && window.dataAPI.cooking) {
        try { setCookingSessions(await window.dataAPI.cooking.active()); } catch (e) { /* niet kritiek */ }
      }
      if (hasDataAPI && window.dataAPI.extras) {
        try { setExtras(await window.dataAPI.extras.list()); } catch (e) { /* niet kritiek */ }
      }
          // Komt iemand binnen via een receptlink uit de agenda, open dan dat recept.
      try {
        const params = new URLSearchParams(window.location.search);
        const receptId = params.get("recept");
        if (receptId) {
          setTab("kookboek");
          setOpenRecipeId(receptId);
          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch (e) { /* geen geldig adres */ }

      // Menu's ouder dan twee maanden opruimen: anders groeit de tabel eindeloos.
      if (hasDataAPI && window.dataAPI.weekmenu.opruimen) {
        const grens = new Date(); grens.setMonth(grens.getMonth() - 2);
        window.dataAPI.weekmenu.opruimen(dateKey(grens)).catch(() => {});
      }
      if (window.householdAPI && window.householdAPI.getCurrentUserEmail) {
        try {
          const email = await window.householdAPI.getCurrentUserEmail();
          const lid = (members || []).find((m) => m.email === email);
          setCurrentUserName((lid && (lid.displayName || lid.email)) || (email || "").split("@")[0] || "Iemand");
        } catch (e) { setCurrentUserName("Iemand"); }
      }
    })();
  }, []);

  // Haalt de gedeelde gegevens opnieuw op. Bewust niet de voorkeuren en logs:
  // die zijn persoonlijk of groeien alleen aan, en hoeven niet te verversen.
  const laatsteRefresh = React.useRef(0);

  const refreshShared = useCallback(async (sleutels) => {
    if (!hasDataAPI) return;
    // Sla je zelf net iets op, dan is jouw versie de nieuwste. Even wachten.
    if (savingRef.current) {
      setTimeout(() => refreshShared(sleutels), 600);
      return;
    }
    // Terugkeren naar de app vuurt zowel visibilitychange als focus af. Zonder
    // deze rem worden alle recepten met hun ingrediënten twee keer opgehaald.
    const nu = Date.now();
    if (!sleutels && nu - laatsteRefresh.current < 3000) return;
    laatsteRefresh.current = nu;
    const wil = (k) => !sleutels || sleutels.includes(k);
    try {
      const [i, s, w, r, k, x] = await Promise.all([
        wil("inventory") ? window.dataAPI.inventory.list() : null,
        wil("shoppingList") ? window.dataAPI.shopping.list() : null,
        wil("weekmenu") ? window.dataAPI.weekmenu.list() : null,
        wil("recipes") ? window.dataAPI.recipes.list() : null,
        wil("cooking") && window.dataAPI.cooking ? window.dataAPI.cooking.active() : null,
        wil("extras") && window.dataAPI.extras ? window.dataAPI.extras.list() : null,
      ]);
      if (i) setInventory(i);
      if (s) setShoppingList(s);
      if (w) setWeekmenu(w);
      if (r && r.length) setRecipes(r);
      if (k) setCookingSessions(k);
      if (x) setExtras(x);
    } catch (e) {
      console.error("Verversen van gedeelde gegevens mislukt:", e);
    }
  }, [hasDataAPI]);

  // Realtime meeluisteren. Wijzigingen komen los binnen, dus we bundelen ze
  // kort: bij het legen van een boodschappenlijst regent het anders gebeurtenissen.
  useEffect(() => {
    if (!hasDataAPI || !window.dataAPI.realtime) return;
    let timer = null;
    const wachtrij = new Set();

    const opWijziging = (sleutel) => {
      wachtrij.add(sleutel);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const sleutels = [...wachtrij];
        wachtrij.clear();
        refreshShared(sleutels);
      }, 400);
    };

    const stop = window.dataAPI.realtime.subscribe(opWijziging);
    return () => { clearTimeout(timer); if (typeof stop === "function") stop(); };
  }, [hasDataAPI, refreshShared]);

  // Ook verversen bij terugkeren in de app: realtime kan zijn weggevallen
  // terwijl je telefoon in je zak zat.
  useEffect(() => {
    const opTerug = () => { if (document.visibilityState === "visible") refreshShared(); };
    document.addEventListener("visibilitychange", opTerug);
    window.addEventListener("focus", opTerug);
    return () => {
      document.removeEventListener("visibilitychange", opTerug);
      window.removeEventListener("focus", opTerug);
    };
  }, [refreshShared]);

  // Opslaan met terugrol. De wijziging is meteen zichtbaar (dat voelt snel),
  // maar mislukt het opslaan, dan draaien we terug naar de vorige toestand en
  // zeggen we het. Anders denk je dat iets is opgeslagen terwijl je huisgenoot
  // het nooit te zien krijgt — in een gedeeld huishouden het ergste dat er is.
  const persist = useCallback(async (key, value, setter, vorigeWaarde) => {
    // De vorige waarde halen we uit de setter zelf: die krijgt de actuele
    // toestand aangereikt, ook als er net iets anders is gewijzigd.
    let terugrolWaarde = vorigeWaarde;
    setter((huidig) => {
      if (terugrolWaarde === undefined) terugrolWaarde = huidig;
      return value;
    });
    setSaving(true);
    savingRef.current = true;
    try {
      if (hasDataAPI) {
        await syncToDataAPI(key, value);
      } else {
        await saveKey(key, value);
      }
      setSaveError(null);
    } catch (e) {
      console.error(`Opslaan van "${key}" mislukt:`, e);
      if (terugrolWaarde !== undefined) setter(terugrolWaarde);
      setSaveError({
        key,
        // Opnieuw proberen doet precies dezelfde handeling nog een keer.
        opnieuw: () => persist(key, value, setter, terugrolWaarde),
      });
    }
    setSaving(false);
    savingRef.current = false;
  }, [hasDataAPI, inventory, shoppingList, cooks, cookLog, consumptionLog, preferences, recipes, weekmenu]);

  // Vergelijkt de oude met de nieuwe lijst en stuurt alleen het daadwerkelijke verschil naar de
  // juiste tabel — zo hoeft niet elke aparte plek in de app een aparte databasecall te krijgen.
  const syncToDataAPI = async (key, value) => {
    if (key === "inventory") {
      const prev = inventory;
      const prevIds = new Set(prev.map((i) => i.id));
      const nextIds = new Set(value.map((i) => i.id));
      await Promise.all(prev.filter((i) => !nextIds.has(i.id)).map((i) => window.dataAPI.inventory.remove(i.id)));
      for (const item of value) {
        const before = prev.find((i) => i.id === item.id);
        if (!before) {
          const newId = await window.dataAPI.inventory.create(item);
          item.id = newId;
        } else if (JSON.stringify(before) !== JSON.stringify(item)) {
          await window.dataAPI.inventory.update(item.id, item);
        }
      }
      return;
    }
    if (key === "shoppingList") {
      const prev = shoppingList;
      const prevIds = new Set(prev.map((s) => s.id));
      const nextIds = new Set(value.map((s) => s.id));
      await Promise.all(prev.filter((s) => !nextIds.has(s.id)).map((s) => window.dataAPI.shopping.remove(s.id)));
      for (const item of value) {
        const before = prev.find((s) => s.id === item.id);
        if (!before) {
          const newId = await window.dataAPI.shopping.create(item);
          item.id = newId;
        } else if (JSON.stringify(before) !== JSON.stringify(item)) {
          await window.dataAPI.shopping.patch(item.id, { name: item.name, amount: item.amount, unit: item.unit, category: item.category, checked: !!item.checked, auto: !!item.auto });
        }
      }
      return;
    }
    if (key === "cooks") {
      const toAdd = value.filter((c) => !cooks.includes(c));
      const toRemove = cooks.filter((c) => !value.includes(c));
      await Promise.all([...toAdd.map((c) => window.dataAPI.cooks.add(c)), ...toRemove.map((c) => window.dataAPI.cooks.remove(c))]);
      return;
    }
    if (key === "cookLog") {
      if (value.length && (!cookLog.length || value[0].id !== cookLog[0]?.id)) {
        await window.dataAPI.cookLog.add(value[0]);
      }
      return;
    }
    if (key === "consumptionLog") {
      const nieuw = value.slice(0, Math.max(0, value.length - consumptionLog.length));
      if (nieuw.length) await window.dataAPI.consumptionLog.addMany(nieuw);
      return;
    }
    if (key === "preferences") {
      await window.dataAPI.preferences.update(value);
      return;
    }
    if (key === "weekmenu" || key === "weekmenuTemplate") {
      const table = key === "weekmenu" ? "weekmenu_days" : "weekmenu_template_days";
      await window.dataAPI.weekmenu.replaceAll(value, table);
      return;
    }
    // Onbekende sleutel (bijv. legacy): stil negeren, niets in de nieuwe schema-opzet voor nodig
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  };

  /* ---------- Recept importeren (tekst of URL) ---------- */

  // Endpoint van onze eigen Netlify-functie (houdt de API-sleutel veilig aan de serverkant).
  // Werkt hier binnen Claude niet nodig (fetch naar api.anthropic.com wordt daar apart afgehandeld),
  // maar op de daadwerkelijk gedeployde site is dit endpoint vereist — en verwacht een geldig
  // inlogbewijs, zodat het niet buiten de app om misbruikt kan worden.
  // Supabase eerst: daar geldt een tijdslimiet van 150 seconden in plaats van de
  // tien die Netlify gunt. Netlify blijft als terugval staan, zodat een storing
  // aan één kant de AI-hulp niet meteen onbruikbaar maakt.
  const AI_PADEN = [
    "https://ucevkzircawpapsrywfv.supabase.co/functions/v1/ask-claude",
    "/api/ask-claude",
    "/.netlify/functions/ask-claude",
  ];
  const aiPadRef = React.useRef(0);

  const aiFetch = async (opties) => {
    let laatste;
    for (let poging = 0; poging < AI_PADEN.length; poging++) {
      const index = (aiPadRef.current + poging) % AI_PADEN.length;
      const antwoord = await fetch(AI_PADEN[index], opties);
      // 404 betekent: dit adres bestaat niet. 5xx betekent: daar is iets stuk.
      const kapot = antwoord.status === 404 || antwoord.status >= 500;
      if (!kapot) {
        // Alleen een wérkend adres onthouden. Bij de laatste poging het
        // antwoord teruggeven zoals het is, maar niet onthouden — anders
        // blijft de app de rest van de sessie een stuk adres gebruiken.
        aiPadRef.current = index;
        return antwoord;
      }
      if (poging === AI_PADEN.length - 1) return antwoord;
      laatste = antwoord;
      console.warn(`AI-adres ${AI_PADEN[index]} gaf ${antwoord.status}, volgende proberen…`);
    }
    return laatste;
  };

  const buildAuthHeaders = async () => {
    // apikey is nodig voor Supabase Edge Functions; Netlify negeert hem.
    const headers = {
      "Content-Type": "application/json",
      apikey: "sb_publishable_t0F12XeC1bPLzmZgvLWUeQ_CPat-lMn",
    };
    if (typeof window !== "undefined" && window.householdAPI && window.householdAPI.getAccessToken) {
      try {
        const token = await window.householdAPI.getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } catch (e) { /* binnen Claude niet beschikbaar/nodig, stil negeren */ }
    }
    return headers;
  };

  // maxTokens instelbaar: bij het weekmenu telt elke seconde, want Netlify
  // breekt een functie na tien seconden af. Minder uitvoer is minder wachttijd.
  // snel=true kiest een lichter model. Voor het bedenken van een avondgerecht
  // is dat ruim voldoende, en het is het verschil tussen binnen of buiten de
  // tien seconden blijven die Netlify een functie gunt.
  const askClaude = async (prompt, maxTokens = 1000, snel = false) => {
    // Eigen tijdslimiet. Zonder dit kan een verzoek dat nooit antwoordt de app
    // eindeloos op "bezig" laten staan — en dat is precies wat er gebeurde.
    const afbreken = new AbortController();
    // Ruimer sinds de verhuizing naar Supabase: daar mag een aanroep 150 seconden
    // duren in plaats van tien. Zestig is genoeg voor een recept en kort genoeg
    // om niet eindeloos te wachten als er echt iets hangt.
    const klok = setTimeout(() => afbreken.abort(), 60000);
    let response;
    try {
      response = await aiFetch({
        method: "POST",
        headers: await buildAuthHeaders(),
        body: JSON.stringify({
          max_tokens: maxTokens,
          snel,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: afbreken.signal,
      });
    } catch (e) {
      clearTimeout(klok);
      const err = new Error(e.name === "AbortError" ? "duurde te lang" : (e.message || "verbinding mislukt"));
      err.status = 0;
      throw err;
    }
    clearTimeout(klok);
    if (!response.ok) {
      let bodyText = "";
      try { bodyText = (await response.text()).slice(0, 300); } catch (e) { /* negeren */ }
      // 429 betekent: limiet bereikt. Dat is geen storing maar een grens, en
      // hoort dus ook als zodanig te klinken.
      const err = new Error(
        response.status === 429 ? "limiet bereikt"
        : response.status === 404 ? "AI-functie niet gevonden op de server"
        : `API-fout ${response.status}`
      );
      err.status = response.status;
      err.body = bodyText;
      throw err;
    }
    const data = await response.json();
    // Het model denkt na vóór het antwoordt; dat verbruikt ruimte maar levert
    // geen tekst op. Raakt de ruimte daardoor op, dan is dat de oorzaak —
    // en die willen we meteen weten in plaats van uit te moeten zoeken.
    const tekst = (data.content || []).map((b) => b.text || "").join("\n");
    if (data.stop_reason === "max_tokens") {
      console.warn(
        `Antwoord afgekapt: ${data.usage ? data.usage.output_tokens : "?"} van ${maxTokens} tokens verbruikt, ` +
        `${tekst.length} tekens tekst. Verhoog de ruimte.`
      );
    }
    return tekst;
  };

  const askClaudeVision = async (base64, mediaType, prompt) => {
    // Ook hier een tijdslimiet: een foto uitlezen duurt langer, dus ruimer.
    const afbreken = new AbortController();
    const klok = setTimeout(() => afbreken.abort(), 30000);
    let response;
    try {
      response = await aiFetch({
      method: "POST",
      signal: afbreken.signal,
      headers: await buildAuthHeaders(),
      body: JSON.stringify({
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: prompt },
          ],
        }],
      }),
      });
    } catch (e) {
      clearTimeout(klok);
      const err = new Error(e.name === "AbortError" ? "duurde te lang" : (e.message || "verbinding mislukt"));
      err.status = 0;
      throw err;
    }
    clearTimeout(klok);

    if (!response.ok) {
      let bodyText = "";
      try { bodyText = (await response.text()).slice(0, 300); } catch (e) { /* negeren */ }
      // 429 betekent: limiet bereikt. Dat is geen storing maar een grens, en
      // hoort dus ook als zodanig te klinken.
      const err = new Error(
        response.status === 429 ? "limiet bereikt"
        : response.status === 404 ? "AI-functie niet gevonden op de server"
        : `API-fout ${response.status}`
      );
      err.status = response.status;
      err.body = bodyText;
      throw err;
    }
    const data = await response.json();
    return (data.content || []).map((b) => b.text || "").join("\n");
  };

  const sanitizeDraft = (raw) => {
    const allowedUnits = new Set(UNITS);
    return {
      name: (raw.name || "Nieuw geïmporteerd recept").toString().slice(0, 80),
      emoji: raw.emoji && String(raw.emoji).trim() ? String(raw.emoji).trim().slice(0, 4) : suggestEmoji(raw.name),
      photoUrl: "",
      cookTime: Math.max(1, Math.round(Number(raw.cookTime) || 30)),
      servings: Math.max(1, Math.round(Number(raw.servings) || 4)),
      ingredients: Array.isArray(raw.ingredients)
        ? raw.ingredients
            .filter((i) => i && i.name)
            .map((i) => ({
              name: corrigeerSpelling(String(i.name).slice(0, 60)),
              amount: Number(i.amount) > 0 ? Number(i.amount) : 1,
              unit: allowedUnits.has(i.unit) ? i.unit : "stuks",
            }))
        : [],
      steps: Array.isArray(raw.steps) ? raw.steps.filter(Boolean).map((s) => corrigeerSpelling(String(s).slice(0, 300))) : [],
      diets: Array.isArray(raw.diets) ? raw.diets.filter((d) => DIET_TAGS.includes(d)) : [],
      community: false,
    };
  };

  const buildExtractionPrompt = (sourceText) => `Je bent een recept-extractor voor de kookboek-app "Pollepel". Zet de onderstaande brontekst om naar STRIKT GELDIGE, COMPACTE JSON (één regel, geen witruimte/inspringing, geen markdown-codeblok, geen uitleg ervoor of erna) volgens dit format:

{"name":string,"emoji":"één relevante food-emoji","cookTime":integer(minuten),"servings":integer,"ingredients":[{"name":string,"amount":number,"unit":één van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...]}

Regels:
- Herschrijf elke bereidingsstap kort (max ~15 woorden) en in je eigen woorden, niet letterlijk overnemen uit de bron.
- BELANGRIJK — volgorde van de stappen: houd de chronologische kookvolgorde uit de bron exact aan. Verzin geen andere volgorde en herschik niets. Als de bron parallelle acties beschrijft (bijv. "verwarm de oven terwijl je de groenten snijdt"), zet ze in de volgorde waarin je ze zou uitvoeren, en noem dat expliciet in de stap zelf (bijv. "Verwarm ondertussen de oven voor") in plaats van een aparte, losstaande stap te maken die de volgorde verwart.
- Controleer voor je antwoordt zelf of de stappenvolgorde logisch en compleet is (bijv. niet iets gebruiken vóór het is voorbereid) — corrigeer dit zo nodig, maar blijf zo dicht mogelijk bij de bron.
- Als een ingrediënt meerdere keren voorkomt (bijv. zowel in een stappenlijst als in een aparte ingrediëntenoverzicht), voeg het maar één keer toe met de duidelijkste hoeveelheid.
- Negeer voedingswaardetabellen, allergenenlijsten, "weetjes"/tips, contactgegevens, benodigdheden (pannen e.d.) en voetnootverwijzingen zoals cijfers tussen haakjes — dit hoort niet bij het recept zelf.
- Maximaal 8 stappen en maximaal 16 ingrediënten — vat samen of combineer kleine kruiden waar nodig, dit moet compact blijven, belangrijker dan volledigheid.
- Kies per ingrediënt de dichtstbijzijnde toegestane eenheid; gebruik "stuks" als er geen duidelijke maateenheid is (bijv. "1 kopje" ≈ 240 ml).
- Negeer reclame, menu's, reacties of andere tekst die niet bij het recept hoort.
- Schat een redelijke kooktijd als die niet genoemd wordt.
- Antwoord ALLEEN met de JSON, niets anders.

Brontekst:
"""
${sourceText.slice(0, 6000)}
"""`;

  const extractJson = (raw) => {
    const start = raw.indexOf("{");
    if (start === -1) throw new Error("geen-json-gevonden");

    const end = raw.lastIndexOf("}");

    if (end > start) {
      try { return JSON.parse(raw.slice(start, end + 1)); } catch (e) { /* mogelijk afgekapt */ }
    }

    // Afgekapt antwoord: het laatste volledige onderdeel afmaken en de rest
    // laten vallen. Een recept met vijf van de zes stappen is nog bruikbaar;
    // helemaal niets is dat niet.
    let tekst = raw.slice(start);
    const laatsteKomma = Math.max(tekst.lastIndexOf("},"), tekst.lastIndexOf('",'), tekst.lastIndexOf("],"));
    if (laatsteKomma > 0) tekst = tekst.slice(0, laatsteKomma + 1);

    // Openstaande haakjes tellen en sluiten.
    let inTekst = false, ontsnapt = false;
    const stapel = [];
    for (const teken of tekst) {
      if (ontsnapt) { ontsnapt = false; continue; }
      if (teken === "\\") { ontsnapt = true; continue; }
      if (teken === '"') { inTekst = !inTekst; continue; }
      if (inTekst) continue;
      if (teken === "{" || teken === "[") stapel.push(teken);
      else if (teken === "}" || teken === "]") stapel.pop();
    }
    if (inTekst) tekst += '"';
    while (stapel.length) tekst += stapel.pop() === "{" ? "}" : "]";

    try {
      const hersteld = JSON.parse(tekst);
      console.warn("Antwoord was afgekapt; het bruikbare deel is gered.");
      return hersteld;
    } catch (e) {
      throw new Error("geen-json-gevonden");
    }
  };

  const parseRecipeFromText = async (sourceText) => {
    let aiDraft = null;
    try {
      const raw = await askClaude(buildExtractionPrompt(sourceText));
      aiDraft = sanitizeDraft(extractJson(raw));
    } catch (e) {
      aiDraft = null;
    }
    if (aiDraft && aiDraft.ingredients.length && aiDraft.steps.length) {
      return { draft: aiDraft, method: "ai" };
    }
    const localDraft = sanitizeDraft(parseRecipeLocally(sourceText));
    if (localDraft.ingredients.length && localDraft.steps.length) {
      return { draft: localDraft, method: "local" };
    }
    throw new Error("leeg");
  };

  const importFromText = async (text) => {
    setImporting(true);
    setImportError("");
    try {
      const { draft, method } = await parseRecipeFromText(text);
      setImportOpen(false);
      setEditingRecipe(draft);
      if (method === "local") {
        showToast("De AI-herkenning was niet bereikbaar, dus het recept is met een eenvoudigere, lokale methode herkend. Controleer de ingrediënten en stappen goed voordat je opslaat.");
      }
    } catch (e) {
      setImportError("Kon geen (volledig) recept herkennen in deze tekst. Zorg dat er zowel hoeveelheden bij de ingrediënten staan als duidelijke bereidingsstappen, of vul het recept handmatig in.");
    } finally {
      setImporting(false);
    }
  };

  const importFromUrl = async (url) => {
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch-fout");
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const text = (doc.body && (doc.body.innerText || doc.body.textContent)) || "";
      if (!text.trim()) throw new Error("leeg");
      const { draft, method } = await parseRecipeFromText(text);
      setImportOpen(false);
      setEditingRecipe(draft);
      if (method === "local") {
        showToast("De AI-herkenning was niet bereikbaar, dus het recept is met een eenvoudigere, lokale methode herkend. Controleer de ingrediënten en stappen goed voordat je opslaat.");
      }
    } catch (e) {
      setImportError("Deze pagina kon niet automatisch opgehaald of herkend worden (sommige sites blokkeren dit, of de pagina bevat geen duidelijke ingrediënten/stappen). Kopieer de recepttekst van de site en plak die in het tekstveld hierboven.");
    } finally {
      setImporting(false);
    }
  };

  const buildPhotoExtractionPrompt = () => `Je bent een recept-extractor voor de kookboek-app "Pollepel". Op de afbeelding staat een recept (bijv. een kookboekpagina, maaltijdbox-kaart zoals HelloFresh, uitprint, verpakking of handgeschreven kaart). Lees de tekst op de foto en zet die om naar STRIKT GELDIGE, COMPACTE JSON (één regel, geen witruimte/inspringing, geen markdown-codeblok, geen uitleg ervoor of erna) volgens dit format:

{"name":string,"emoji":"één relevante food-emoji","cookTime":integer(minuten),"servings":integer,"ingredients":[{"name":string,"amount":number,"unit":één van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...]}

Regels:
- Herschrijf elke bereidingsstap kort (max ~12 woorden) en in je eigen woorden.
- BELANGRIJK — volgorde van de stappen: houd de chronologische kookvolgorde op de foto exact aan, meestal herkenbaar aan genummerde stappen. Verzin geen andere volgorde. Bij parallelle acties (bijv. "verwarm ondertussen de oven"), noem dat expliciet in de stap zelf in plaats van een verwarrende losse stap te maken.
- Controleer voor je antwoordt zelf of de stappenvolgorde logisch is (niet iets gebruiken vóór het is voorbereid) — corrigeer dit zo nodig, maar blijf zo dicht mogelijk bij de foto.
- Negeer alles wat niet de kern van het recept is: voedingswaardetabel, allergenenlijst, "weetjes"/tips, contactgegevens, benodigdheden (pannen e.d.), en voetnootverwijzingen zoals cijfers tussen haakjes.
- Maximaal 8 stappen en maximaal 16 ingrediënten — combineer of laat de minder essentiële weg als er meer op de foto staan. Dit moet compact blijven, belangrijker dan volledigheid.
- Kies per ingrediënt de dichtstbijzijnde toegestane eenheid; gebruik "stuks" als er geen duidelijke maateenheid is. Bij een kaart met een "zelf toevoegen"-lijst: neem beide lijsten samen als ingrediënten.
- Als de foto onduidelijk, onvolledig of geen recept is, antwoord dan met {"error":"onleesbaar"}.
- Antwoord ALLEEN met de JSON, niets anders.`;

  const describePhotoError = (code, detail) => {
    const detailSuffix = detail ? ` [Detail: ${detail.slice(0, 200)}]` : "";
    if (code && code.startsWith("serverfout-")) {
      const status = Number(code.split("-")[1]);
      if (status === 413) return "Deze foto is te groot om te versturen. Probeer een foto met minder detail, of een kleiner deel van de pagina." + detailSuffix;
      if (status === 429) return "De AI heeft het op dit moment te druk. Wacht een minuutje en probeer het opnieuw." + detailSuffix;
      if (status === 401) return "Je bent niet (meer) ingelogd. Log opnieuw in en probeer het nogmaals." + detailSuffix;
      if (status === 403) return "Geen toegang tot de AI-dienst op dit moment. Probeer het later opnieuw." + detailSuffix;
      if (status >= 500) return "De AI-dienst heeft zelf een probleem (tijdelijke storing). Probeer het over een paar minuten opnieuw." + detailSuffix;
      return `De AI wees dit verzoek af (foutcode ${status}).${detailSuffix}`;
    }
    const messages = {
      resize: "Kon deze foto niet verwerken op je toestel. Probeer een andere foto, of gebruik 'Uploaden' in plaats van 'Foto maken'.",
      netwerk: "Kon geen verbinding maken met de AI. Controleer je internetverbinding en probeer het opnieuw." + detailSuffix,
      json: "De AI-respons was te lang en brak af. Probeer het nog eens, of maak een foto van een kleiner deel.",
      vorm: "De AI gaf een onverwacht antwoord terug. Probeer het nog eens, of typ het over in het tekstveld." + detailSuffix,
      onleesbaar: "De foto is niet goed leesbaar. Zorg dat de tekst scherp en volledig in beeld is.",
      leeg: "Kon niets bruikbaars herkennen op deze foto.",
    };
    return (messages[code] || "Er ging iets mis bij het verwerken van deze foto.") + (messages[code] ? "" : detailSuffix);
  };

  const importFromPhoto = async (file) => {
    setImporting(true);
    setImportError("");
    try {
      let base64, mediaType;
      try {
        ({ base64, mediaType } = await resizeImageFile(file));
      } catch (e) {
        console.error("Foto verwerken mislukt:", e);
        throw new Error("resize");
      }
      let raw;
      try {
        raw = await askClaudeVision(base64, mediaType, buildPhotoExtractionPrompt());
      } catch (e) {
        console.error("AI-aanroep (foto naar recept) mislukt:", e.status, e.body || e.message);
        const err = new Error(e.status ? `serverfout-${e.status}` : "netwerk");
        err.detail = e.body || e.message;
        throw err;
      }
      let parsed;
      try {
        parsed = extractJson(raw);
      } catch (e) {
        console.error("Kon AI-antwoord niet als JSON lezen:", raw);
        const err = new Error("json");
        err.detail = raw;
        throw err;
      }
      if (parsed.error) throw new Error("onleesbaar");
      let draft;
      try {
        draft = sanitizeDraft(parsed);
      } catch (e) {
        console.error("Kon AI-antwoord niet omzetten naar recept (onverwachte vorm):", parsed, e);
        const err = new Error("vorm");
        err.detail = e.message;
        throw err;
      }
      if (!draft.ingredients.length || !draft.steps.length) throw new Error("leeg");
      setImportOpen(false);
      setEditingRecipe(draft);
    } catch (e) {
      setImportError(describePhotoError(e.message, e.detail));
    } finally {
      setImporting(false);
    }
  };

  /* ---------- Premium: kastfoto → voorraad ---------- */

  const buildShelfPhotoPrompt = () => `Je bent een voorraad-herkenner voor de kookboek-app "Pollepel". Op de afbeelding staat een foto van een kast, koelkast of voorraadplank. Herken zoveel mogelijk zichtbare voedingsproducten en schat de hoeveelheid.

Antwoord ALLEEN met STRIKT GELDIGE, COMPACTE JSON (één regel, geen markdown-codeblok, geen uitleg) in dit format:
{"items":[{"name":string,"amount":number,"unit":één van "stuks"|"g"|"kg"|"ml"|"l","category":één van ${JSON.stringify(CATEGORIES)}}]}

Regels:
- Alleen duidelijk herkenbare producten, geen gokwerk bij onduidelijke/onleesbare verpakkingen.
- Voor onduidelijke hoeveelheden: gebruik "stuks" met een redelijke schatting (bijv. 3 appels, 1 pak melk).
- Maximaal 20 producten. Dit moet compact blijven — belangrijker dan volledigheid.
- Als er niets herkenbaars op de foto staat, antwoord dan met {"items":[]}.`;

  const scanShelfPhoto = async (file) => {
    setShelfScanning(true);
    setShelfScanError("");
    setShelfScanResults([]);
    try {
      let base64, mediaType;
      try {
        ({ base64, mediaType } = await resizeImageFile(file));
      } catch (e) {
        console.error("Kastfoto verwerken mislukt:", e);
        throw new Error("resize");
      }
      let raw;
      try {
        raw = await askClaudeVision(base64, mediaType, buildShelfPhotoPrompt());
      } catch (e) {
        console.error("AI-aanroep (kastfoto) mislukt:", e.status, e.body || e.message);
        const err = new Error(e.status ? `serverfout-${e.status}` : "netwerk");
        err.detail = e.body || e.message;
        throw err;
      }
      let parsed;
      try {
        parsed = extractJson(raw);
      } catch (e) {
        console.error("Kon AI-antwoord niet als JSON lezen:", raw);
        const err = new Error("json");
        err.detail = raw;
        throw err;
      }
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      if (!items.length) throw new Error("leeg");
      let results;
      try {
        results = items.slice(0, 20).map((it) => {
          const existing = inventory.find((i) => namesMatch(i.name, it.name) && i.unit === it.unit);
          return {
            tempId: uid(),
            name: String(it.name || "").slice(0, 60),
            amount: Number(it.amount) > 0 ? Number(it.amount) : 1,
            unit: UNITS.includes(it.unit) ? it.unit : "stuks",
            category: CATEGORIES.includes(it.category) ? it.category : guessCategory(it.name),
            matchedId: existing ? existing.id : null,
            include: true,
          };
        }).filter((r) => r.name);
      } catch (e) {
        console.error("Kon AI-antwoord niet omzetten naar producten (onverwachte vorm):", parsed, e);
        const err = new Error("vorm");
        err.detail = e.message;
        throw err;
      }
      if (!results.length) throw new Error("leeg");
      setShelfScanResults(results);
    } catch (e) {
      setShelfScanError(describePhotoError(e.message, e.detail));
    } finally {
      setShelfScanning(false);
    }
  };

  const toggleShelfResultInclude = (tempId) => {
    setShelfScanResults((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, include: !r.include } : r)));
  };

  const applyShelfScanResults = (results) => {
    const nextInventory = inventory.map((i) => ({ ...i }));
    let updated = 0;
    let created = 0;
    results.filter((r) => r.include).forEach((r) => {
      const idx = nextInventory.findIndex((i) => i.id === r.matchedId);
      if (idx > -1) {
        nextInventory[idx] = { ...nextInventory[idx], current: addToStock(nextInventory[idx], r.amount) };
        updated += 1;
      } else {
        nextInventory.push({
          id: uid(), name: r.name, category: r.category, unit: r.unit,
          current: r.amount, min: round2(Math.max(r.amount * 0.4, 0.5)), max: r.amount,
        });
        created += 1;
      }
    });
    persist("inventory", nextInventory, setInventory);
    setShelfPhotoOpen(false);
    setShelfScanResults([]);
    showToast(`Voorraad bijgewerkt: ${updated} product${updated !== 1 ? "en" : ""} aangevuld, ${created} nieuw toegevoegd.`);
  };

  /* ---------- Premium: AI-souschef ---------- */

  const askSousChef = async (recipe, question) => {
    const invList = inventory.map((i) => `${i.name} (${i.current} ${i.unit})`).join(", ") || "onbekend";
    const prompt = `Je bent een ervaren, geruststellende souschef die meekijkt terwijl iemand thuis kookt. Ze zijn bezig met "${recipe.name}".

Ingrediënten van het recept: ${recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`).join(", ")}.
Bereidingsstappen: ${recipe.steps.join(" | ")}.
Wat er nu in hun voorraad staat (gebruik dit om vervangingen te suggereren die ze al in huis hebben): ${invList}.

Vraag van de kok: "${question}"

Geef een kort, praktisch, gerust antwoord in het Nederlands (max ~80 woorden). Geen opsomming van meerdere opties tenzij echt nodig — geef gewoon het beste advies.`;
    return await askClaude(prompt);
  };

  const openRecipe = openRecipeId
    ? recipes.find((r) => r.id === openRecipeId) || communityRecipes.find((r) => r.id === openRecipeId)
    : null;
  const openRecipeIsMine = openRecipe ? recipes.some((r) => r.id === openRecipe.id) : true;

  const loadCommunityRecipes = useCallback(async () => {
    if (hasDataAPI) {
      try {
        const items = await window.dataAPI.recipes.listCommunity();
        setCommunityRecipes(items || []);
      } catch (e) { /* stil negeren; val terug op lokale filter */ }
      return;
    }
    if (!hasCommunityBackend) return;
    try {
      const items = await window.communityStore.list();
      setCommunityRecipes(items || []);
    } catch (e) {
      // stil negeren; val terug op lokale filter
    }
  }, [hasCommunityBackend, hasDataAPI]);

  useEffect(() => {
    if (hasCommunityBackend || hasDataAPI) loadCommunityRecipes();
  }, [hasCommunityBackend, hasDataAPI, loadCommunityRecipes]);

  const communitySourceRecipes = (hasCommunityBackend || hasDataAPI) ? communityRecipes : recipes;

  const [dietOnly, setDietOnly] = useState(false);

  const activeDietTags = useMemo(() => {
    const all = new Set();
    (preferences.diets || []).forEach((d) => d.tags.forEach((t) => all.add(t)));
    return Array.from(all);
  }, [preferences.diets]);

  const filteredRecipes = useMemo(() => {
    const source = bookMode === "community" ? communitySourceRecipes : recipes;
    const seizoensIds = new Set(getSeasonalRecipeSuggestions(recipes).map((r) => r.id));
    const zichtbaar = source.filter((r) => {
      if (bookMode === "community" && !hasCommunityBackend && !hasDataAPI && !r.community) return false;
      if (bookMode === "mine" && bookView === "favoriet" && !r.favorite) return false;
      if (bookMode === "mine" && bookView === "seizoen" && !seizoensIds.has(r.id)) return false;
      // Bij "wat kan ik maken" filteren we niet hard weg: recepten waarvoor je
      // nog iets mist blijven zichtbaar, mét vermelding van wat er ontbreekt.
      if (maxCookTime && Number(r.cookTime || 999) > maxCookTime) return false;
      if (dietOnly && activeDietTags.length && !activeDietTags.every((tag) => (r.diets || []).includes(tag))) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    // Compleet bovenaan, daarna oplopend naar wat het meest ontbreekt.
    // Eerst per recept één keer uitrekenen, dán sorteren: rekenen bínnen de
    // vergelijkfunctie deed hetzelfde werk tientallen keren opnieuw.
    if (bookView !== "kan" || bookMode !== "mine") return zichtbaar;
    // Compleet bovenaan, daarna oplopend naar wat het meest ontbreekt.
    return zichtbaar
      .map((r) => ({ r, mist: recipeReadiness(r, inventory).missing.length }))
      .sort((a, b) => a.mist - b.mist)
      .map((x) => x.r);
  }, [recipes, communitySourceRecipes, bookMode, bookView, hasCommunityBackend, hasDataAPI, favOnly, maxCookTime, dietOnly, activeDietTags, query, inventory]);

  // De week begint op de ingestelde boodschappendag. Vier periodes vooruit.
  const shoppingDay = preferences.shoppingDay == null ? 6 : Number(preferences.shoppingDay);
  const periods = useMemo(() => planningPeriods(shoppingDay, 4), [shoppingDay]);
  const activePeriod = periods[Math.min(periodIndex, periods.length - 1)];

  // Dezelfde vorm als de oude vaste weeklijst, maar met echte datums erbij,
  // zodat alles wat vroeger "de week" gebruikte hier op kan aansluiten.
  const periodDays = useMemo(() => {
    const vandaagKey = dateKey(new Date());
    return activePeriod.dagen.map((d) => ({
      key: dateKey(d),
      date: d,
      label: DAG_LANG[d.getDay()].charAt(0).toUpperCase() + DAG_LANG[d.getDay()].slice(1),
      kort: DAG_KORT[d.getDay()],
      dagnummer: d.getDate(),
      isVandaag: dateKey(d) === vandaagKey,
      isVerleden: dateKey(d) < vandaagKey,
      isBoodschappendag: d.getDay() === shoppingDay,
    }));
  }, [activePeriod, shoppingDay]);

  // Het gerecht van vandaag uit het weekmenu.
  const vanavondEntry = weekmenu[dateKey(new Date())];
  const vanavondRecept = vanavondEntry && vanavondEntry.recipeId
    ? recipes.find((r) => r.id === vanavondEntry.recipeId)
    : null;

  // Heb je het vandaag al gekookt? Dan hoeft de app je niet te blijven vertellen
  // dat je het nog moet maken, en al helemaal niet dat je ingrediënten mist.
  const vanavondAlGekookt = !!(vanavondRecept && cookLog.some((e) =>
    e.recipeId === vanavondRecept.id &&
    dateKey(new Date(e.date)) === dateKey(new Date())
  ));

  // Kiest iets wat je met je voorraad kunt maken; is niets compleet, dan wat er
  // het dichtst bij zit — met vermelding van wat er nog moet komen.
  const verrasMeVanavond = () => {
    if (!recipes.length) return;
    const gescoord = recipes
      .map((r) => ({ r, mist: recipeReadiness(r, inventory).missing.length }))
      .sort((a, b) => a.mist - b.mist);
    const minste = gescoord[0].mist;
    const pool = gescoord.filter((x) => x.mist === minste);
    const keuze = pool[Math.floor(Math.random() * pool.length)];
    if (minste > 0) {
      showToast(`${keuze.r.name}: hiervoor mis je nog ${recipeReadiness(keuze.r, inventory).missing.join(", ")}.`);
    }
    setOpenRecipeId(keuze.r.id);
  };

  const lowStockCount = inventory.filter((i) => i.current < i.min).length;
  const shoppingCount = shoppingList.length;

  /* ---------- Recepten ---------- */

  const toggleFavorite = (id) => {
    const next = recipes.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r));
    setRecipes(next);
    if (hasDataAPI) window.dataAPI.recipes.patch(id, { favorite: !recipes.find((r) => r.id === id)?.favorite }).catch(() => {});
    else persist("recipes", next, setRecipes);
  };

  const toggleCommunity = async (id) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    const nowShared = !recipe.community;
    const next = recipes.map((r) => (r.id === id ? { ...r, community: nowShared } : r));
    setRecipes(next);

    if (hasDataAPI) {
      try {
        await window.dataAPI.recipes.patch(id, { community: nowShared });
        loadCommunityRecipes();
      } catch (e) {
        showToast("Delen is lokaal gelukt, maar kon niet worden opgeslagen.");
      }
    } else {
      persist("recipes", next, setRecipes);
      if (hasCommunityBackend) {
        try {
          if (nowShared) await window.communityStore.publish({ ...recipe, community: true });
          else await window.communityStore.unpublish(id);
          loadCommunityRecipes();
        } catch (e) {
          showToast("Delen is lokaal gelukt, maar kon niet worden gesynchroniseerd met de community-backend.");
        }
      }
    }

    showToast(nowShared
      ? `${recipe.name} is gedeeld met de community.`
      : `${recipe.name} is niet langer gedeeld.`);
  };

  const duplicateToMyBook = async (id) => {
    const recipe = recipes.find((r) => r.id === id) || communityRecipes.find((r) => r.id === id);
    if (!recipe) return;
    if (hasDataAPI) {
      const newId = await window.dataAPI.recipes.create({ ...recipe, community: false, favorite: false });
      setRecipes([...recipes, { ...recipe, id: newId, community: false, favorite: false }]);
    } else {
      const copy = { ...recipe, id: uid(), community: false, favorite: false };
      persist("recipes", [...recipes, copy], setRecipes);
    }
    showToast(`${recipe.name} toegevoegd aan jouw kookboek.`);
  };

  const saveRecipe = async (recipe) => {
    if (hasDataAPI) {
      if (recipe.id) {
        await window.dataAPI.recipes.update(recipe.id, recipe);
        setRecipes(recipes.map((r) => (r.id === recipe.id ? recipe : r)));
      } else {
        const newId = await window.dataAPI.recipes.create({ ...recipe, favorite: false, community: false });
        setRecipes([...recipes, { ...recipe, id: newId, favorite: false, community: false }]);
      }
    } else {
      let next;
      if (recipe.id) next = recipes.map((r) => (r.id === recipe.id ? recipe : r));
      else next = [...recipes, { ...recipe, id: uid(), favorite: false, community: false }];
      persist("recipes", next, setRecipes);
    }
    setEditingRecipe(null);
  };

  const [nutritionBusy, setNutritionBusy] = useState(false);

  // Legt vast dat er met een gerecht wordt begonnen, met de verwachte klaartijd.
  // Huisgenoten zien dit meteen; in de app-versie wordt dit straks een melding.
  const startCookingSession = async (recipe, personen) => {
    if (!hasDataAPI || !window.dataAPI.cooking) return;
    try {
      await window.dataAPI.cooking.start({
        recipeId: recipe.id,
        recipeName: recipe.name,
        emoji: recipe.emoji || "",
        servings: personen || recipe.servings,
        cookTimeMinutes: Number(recipe.cookTime) || null,
        cookName: currentUserName,
      });
      const sessies = await window.dataAPI.cooking.active();
      setCookingSessions(sessies);
    } catch (e) {
      console.error("Kookstart kon niet worden vastgelegd:", e);
    }
  };

  const recalculateNutrition = async (recipeId) => {
    if (!hasDataAPI || !window.dataAPI.nutrition) return;
    const recipe = recipes.find((r) => r.id === recipeId) || communityRecipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    setNutritionBusy(true);
    try {
      const { perPortion, unmatched, matched, coverage } = await window.dataAPI.nutrition.calculateForRecipe(recipe);
      const fingerprint = window.dataAPI.nutrition.fingerprint(recipe);
      await window.dataAPI.nutrition.save(recipeId, perPortion, unmatched, matched, fingerprint, coverage);
      const nutrition = {
        kcal: perPortion.kcal, proteinG: perPortion.protein_g, carbsG: perPortion.carbs_g, sugarsG: perPortion.sugars_g,
        fiberG: perPortion.fiber_g, fatG: perPortion.fat_g, saturatedFatG: perPortion.saturated_fat_g, saltG: perPortion.salt_g,
        unmatched, matched, fingerprint, coverage, calculatedAt: new Date().toISOString(),
      };
      setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, nutrition } : r)));
      showToast(unmatched.length ? `Voedingswaarden berekend (${unmatched.length} ingrediënt${unmatched.length > 1 ? "en" : ""} niet meegerekend).` : "Voedingswaarden berekend.");
    } catch (e) {
      console.error("Voedingswaarden berekenen mislukt:", e);
      showToast("Kon voedingswaarden niet berekenen. Probeer het later opnieuw.");
    } finally {
      setNutritionBusy(false);
    }
  };

  // Legt vast welk voorraaditem bij een receptingrediënt hoort. Vanaf dan
  // hoeft de app niet meer op naam te raden.
  // Extra gerechten: plannen en meetellen in de boodschappen. Bewust géén
  // afboeken van de voorraad — dan zou elk extraatje een eigen kookknop met
  // bevestigingsscherm krijgen, en dat maakt het weekmenu een rommeltje.
  const voegExtraToe = async ({ date, recipeId, label, servings }) => {
    const bestaande = extras.filter((e) => e.date === date).length;
    const nieuw = { date, recipeId, label: label || "Extra", servings: servings || null, sortOrder: bestaande };
    if (hasDataAPI && window.dataAPI.extras) {
      try {
        const id = await window.dataAPI.extras.add(nieuw);
        setExtras((prev) => [...prev, { ...nieuw, id }]);
      } catch (e) {
        console.error("Extra toevoegen mislukt:", e);
        showToast("Het extra gerecht kon niet worden opgeslagen.");
        return;
      }
    } else {
      setExtras((prev) => [...prev, { ...nieuw, id: uid() }]);
    }
    setExtraVoorDag(null);
    showToast(`${label} toegevoegd aan het weekmenu.`);
  };

  const verwijderExtra = async (id) => {
    setExtras((prev) => prev.filter((e) => e.id !== id));
    if (hasDataAPI && window.dataAPI.extras) {
      try { await window.dataAPI.extras.remove(id); }
      catch (e) { console.error("Extra verwijderen mislukt:", e); }
    }
  };

  const koppelIngredient = async (recipeId, ingredientNaam, item) => {
    setKoppelVoor(null);
    setRecipes((prev) => prev.map((r) => (r.id !== recipeId ? r : {
      ...r,
      ingredients: (r.ingredients || []).map((ing) =>
        ing.name === ingredientNaam ? { ...ing, inventoryItemId: item.id } : ing),
    })));
    if (hasDataAPI && window.dataAPI.linkIngredient) {
      try {
        await window.dataAPI.linkIngredient(recipeId, ingredientNaam, item.id);
        showToast(`${ingredientNaam} gekoppeld aan ${item.name}.`);
      } catch (e) {
        console.error("Koppelen mislukt:", e);
        showToast("De koppeling kon niet worden opgeslagen. Probeer het opnieuw.");
      }
    }
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter((r) => r.id !== id));
    if (hasDataAPI) window.dataAPI.recipes.remove(id).catch(() => {});
    else persist("recipes", recipes.filter((r) => r.id !== id), setRecipes);
    setOpenRecipeId(null);
  };

  /* ---------- Koken -> voorraad + boodschappenlijst ---------- */

  // overrides: { [voorraaditem-id]: werkelijk gebruikte hoeveelheid }
  // Zo boeken we nooit meer af dan er was, en klopt de verbruiksgeschiedenis.
  const cookRecipe = (recipe, scale = 1, overrides = {}) => {
    // Sessie afsluiten: het gerecht is klaar, dus huisgenoten hoeven het niet
    // meer als "wordt nu gekookt" te zien.
    if (hasDataAPI && window.dataAPI.cooking) {
      window.dataAPI.cooking.finish(recipe.id)
        .then(() => window.dataAPI.cooking.active())
        .then(setCookingSessions)
        .catch((e) => console.error("Kooksessie afsluiten mislukt:", e));
    }
    const nextInventory = inventory.map((i) => ({ ...i }));
    let nextShopping = shoppingList.map((s) => ({ ...s }));
    const used = [];
    const added = [];
    const newConsumptionEntries = [];

    recipe.ingredients.forEach((ing) => {
      const matchItem = findInventoryMatch(nextInventory, ing);
      const idx = matchItem ? nextInventory.findIndex((i) => i.id === matchItem.id) : -1;
      if (idx === -1) return; // niet bijgehouden in voorraad, sla over
      const item = nextInventory[idx];
      const cmp = stockVsNeed(item, ing, scale);
      if (!cmp) return; // eenheden niet vergelijkbaar: liever niets afboeken dan het verkeerde
      const override = overrides[item.id];
      // Vult de gebruiker zelf een hoeveelheid in, dan is dat de waarheid — ook
      // als die hoger is dan de voorraad aangaf; dan klopte de voorraad niet.
      // Zonder antwoord boeken we nooit meer af dan er volgens de app was.
      const amountUsed = round2(
        override != null ? Math.max(0, Number(override)) : Math.min(cmp.need, cmp.have)
      );
      if (amountUsed <= 0) return; // niets van in huis: niets af te boeken
      const newCurrent = Math.max(0, round2(item.current - amountUsed));
      nextInventory[idx] = { ...item, current: newCurrent };
      used.push(item.name);
      newConsumptionEntries.push({ name: item.name, unit: item.unit, amount: amountUsed, date: new Date().toISOString() });

      const result = pushLowStockToShopping(nextShopping, item, newCurrent);
      nextShopping = result.list;
      if (result.added) added.push(item.name);
    });

    persist("inventory", nextInventory, setInventory);
    persist("shoppingList", nextShopping, setShoppingList);
    if (newConsumptionEntries.length) {
      persist("consumptionLog", [...newConsumptionEntries, ...consumptionLog].slice(0, 500), setConsumptionLog);
    }

    // Twee losse boodschappen: wat er van de voorraad af ging, en — apart —
    // waarom er iets op de boodschappenlijst is gezet. Dat laatste gaat over
    // je minimumvoorraad, niet over het gerecht dat je zojuist kookte.
    if (!used.length) {
      showToast("Lekker gegeten! Deze ingrediënten worden niet in je voorraad bijgehouden.");
    } else {
      showToast(`Lekker gegeten! Voorraad bijgewerkt (${used.length} product${used.length > 1 ? "en" : ""}).`);
      if (added.length) {
        setTimeout(() => {
          showToast(`${added.join(", ")} ${added.length > 1 ? "zijn" : "is"} onder je minimum gezakt en op de boodschappenlijst gezet.`);
        }, 2600);
      }
    }

    const logEntry = { id: uid(), recipeId: recipe.id, recipeName: recipe.name, emoji: recipe.emoji, date: new Date().toISOString(), servings: Math.round(recipe.servings * scale) };
    persist("cookLog", [logEntry, ...cookLog].slice(0, 200), setCookLog);
  };

  /* ---------- Voorkeuren (donkere modus, categorie-volgorde, dieetwensen) ---------- */

  const updatePreferences = (patch) => {
    const next = { ...preferences, ...patch };
    persist("preferences", next, setPreferences);
    if ("darkMode" in patch) applyTheme(!!patch.darkMode);
  };

  const toggleDarkMode = () => updatePreferences({ darkMode: !preferences.darkMode });

  const togglePremiumFeature = (key) => {
    const current = preferences.premium || {};
    updatePreferences({ premium: { ...current, [key]: !current[key] } });
  };
  // Heeft dit huishouden een lopend abonnement?
  // Staat bewust hier: deze controle leest inventory, weekmenu, recipes en
  // shoppingList, en die moeten eerst bestaan. Stond hij eerder, dan crasht de
  // app bij het openen.
  const bevindingen = useMemo(
    () => (loading ? [] : controleerGegevens({ inventory, weekmenu, recipes, shoppingList, categories: CATEGORIES })),
    [loading, inventory, weekmenu, recipes, shoppingList]
  );

  const herstelBevinding = (b) => {
    if (!b.herstel || !b.itemId) return;
    persist("inventory", inventory.map((i) => (i.id === b.itemId ? { ...i, ...b.herstel } : i)), setInventory);
    showToast("Rechtgezet.");
  };

  const heeftPremium = !!(household && household.premium_until && new Date(household.premium_until) > new Date());

  const isPremiumOn = (key) => {
    // Gratis functies staan altijd aan: het is rekenwerk op je eigen gegevens.
    if (GRATIS_FEATURES.some((f) => f.key === key)) return true;
    // Premiumfuncties alleen met een lopend abonnement. De schakelaars in
    // Instellingen blijven werken om iets tijdelijk uit te zetten.
    if (!heeftPremium) return false;
    return preferences.premium ? preferences.premium[key] !== false : true;
  };

  const moveCategoryOrder = (category, direction) => {
    const order = preferences.categoryOrder && preferences.categoryOrder.length === CATEGORIES.length ? [...preferences.categoryOrder] : [...CATEGORIES];
    const idx = order.indexOf(category);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= order.length) return;
    [order[idx], order[swapWith]] = [order[swapWith], order[idx]];
    updatePreferences({ categoryOrder: order });
  };

  const orderedCategories = preferences.categoryOrder && preferences.categoryOrder.length === CATEGORIES.length ? preferences.categoryOrder : CATEGORIES;

  const updateCookDiets = (cookName, tags) => {
    const rest = (preferences.diets || []).filter((d) => d.name !== cookName);
    const next = tags.length ? [...rest, { name: cookName, tags }] : rest;
    updatePreferences({ diets: next });
  };

  const updateCookDislikes = (cookName, items) => {
    const rest = (preferences.dislikes || []).filter((d) => d.name !== cookName);
    const next = items.length ? [...rest, { name: cookName, items }] : rest;
    updatePreferences({ dislikes: next });
  };

  // Alle ingrediënten die door minstens één huisgenoot niet gelust worden, met wie
  const allDislikes = useMemo(() => {
    const map = new Map(); // genormaliseerde ingrediëntnaam -> array van huisgenootnamen
    (preferences.dislikes || []).forEach((d) => {
      (d.items || []).forEach((item) => {
        const key = norm(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(d.name);
      });
    });
    return map;
  }, [preferences.dislikes]);

  const getRecipeDislikeWarnings = (recipe) => {
    if (!recipe || !recipe.ingredients) return [];
    const warnings = [];
    recipe.ingredients.forEach((ing) => {
      for (const [dislikeKey, people] of allDislikes.entries()) {
        if (namesMatch(dislikeKey, ing.name)) {
          warnings.push({ ingredient: ing.name, people });
          break;
        }
      }
    });
    return warnings;
  };

  /* ---------- Kliekjes ---------- */

  // Waar het restje heen gaat bepaalt hoe lang het goed blijft: een paar dagen
  // in de koelkast, maanden in de vriezer. Eerder stond dat vast op drie dagen,
  // ook voor wat je invroor.
  const addLeftover = (recipe, portions, bewaarplek = "koelkast") => {
    if (!portions || portions <= 0) return;
    const naarVriezer = bewaarplek === "vriezer";
    const dagen = naarVriezer ? 90 : 3;

    // Nummers alleen voor de vriezer: koelkastrestjes eet je binnen drie dagen,
    // daar is een nummer overdreven.
    const nummertOp = naarVriezer && preferences.containerNumbering;
    const bakjes = nummertOp
      ? kiesVrijeBakjes(inventory, portions, Number(preferences.containerCount) || 40)
      : [];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + dagen);
    const newItem = {
      id: uid(),
      name: naarVriezer ? `Vriezer: ${recipe.name}` : `Restje ${recipe.name}`,
      category: naarVriezer ? "Diepvries" : "Maaltijden & salades",
      unit: "stuks",
      current: portions,
      min: 0,
      max: portions,
      expiryDate: expiry.toISOString().slice(0, 10),
      sourceRecipeId: recipe.id,
      containers: bakjes,
    };
    persist("inventory", [...inventory, newItem], setInventory);

    if (nummertOp && bakjes.length) {
      showToast(
        bakjes.length < portions
          ? `Pak bakje ${bakjesTekst(bakjes)}. Je hebt niet genoeg vrije nummers voor alle porties.`
          : `Pak bakje ${bakjesTekst(bakjes)} — ${recipe.name}, houdbaar tot over 3 maanden.`
      );
    } else if (nummertOp && !bakjes.length) {
      showToast("Alle genummerde bakjes zijn in gebruik. Er is niets genummerd.");
    } else {
      showToast(
        naarVriezer
          ? `${portions} portie${portions > 1 ? "s" : ""} in de vriezer gezet (houdbaar tot over 3 maanden).`
          : `${portions} portie${portions > 1 ? "s" : ""} in de koelkast gezet (eet binnen 3 dagen op).`
      );
    }
  };

  // Een gepland kliekje opeten: dat gaat van de restjesvoorraad af, niet van de
  // losse ingrediënten. Die zijn immers al opgemaakt toen je het kookte.
  // gekozenBakjes: welke bakjes je werkelijk gepakt hebt. Die nummers komen
  // daarna weer vrij voor een volgend gerecht.
  const eatLeftover = (inventoryItemId, porties, recipe, gekozenBakjes = null) => {
    const item = inventory.find((i) => i.id === inventoryItemId);
    if (!item) { showToast("Dit kliekje staat niet meer in je voorraad."); return; }
    const gebruikt = Math.min(Number(porties) || 1, Number(item.current) || 0);
    const rest = round2(Math.max(0, Number(item.current || 0) - gebruikt));

    // Alleen de bakjes die je hebt aangetikt komen vrij; de rest blijft staan.
    const hadBakjes = item.containers || [];
    const vrijgegeven = gekozenBakjes && gekozenBakjes.length
      ? gekozenBakjes.map(Number)
      : hadBakjes.slice(0, gebruikt);
    const overigeBakjes = hadBakjes.filter((n) => !vrijgegeven.includes(Number(n)));

    const next = rest > 0
      ? inventory.map((i) => (i.id === item.id ? { ...i, current: rest, containers: overigeBakjes } : i))
      : inventory.filter((i) => i.id !== item.id);
    persist("inventory", next, setInventory);

    if (recipe) {
      const entry = { id: uid(), recipeId: recipe.id, recipeName: recipe.name, emoji: recipe.emoji || "", servings: recipe.servings, date: new Date().toISOString(), leftover: true };
      persist("cookLog", [entry, ...cookLog], setCookLog);
    }
    const bakjeMelding = vrijgegeven.length ? ` Bakje ${bakjesTekst(vrijgegeven)} is weer vrij.` : "";
    showToast((rest > 0
      ? `Opgegeten. Er ${rest === 1 ? "is nog 1 portie" : `zijn nog ${rest} porties`} over.`
      : "Opgegeten — het kliekje is op.") + bakjeMelding);
  };

  const addFreezerPortion = (recipe) => {
    const portions = recipe.servings || 1;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);

    // Deze route kende de bakjesnummers niet. Een dubbele portie gaat net zo
    // goed de vriezer in als een gewoon restje, dus krijgt hij ook nummers.
    const bakjes = preferences.containerNumbering
      ? kiesVrijeBakjes(inventory, portions, Number(preferences.containerCount) || 40)
      : [];

    const newItem = {
      id: uid(),
      name: `Vriezer: ${recipe.name}`,
      category: "Diepvries",
      unit: "stuks",
      current: portions,
      min: 0,
      max: portions,
      expiryDate: expiry.toISOString().slice(0, 10),
      sourceRecipeId: recipe.id,
      containers: bakjes,
    };
    persist("inventory", [...inventory, newItem], setInventory);
    showToast(bakjes.length
      ? `Pak bakje ${bakjesTekst(bakjes)} — extra portie ${recipe.name}, houdbaar tot over 3 maanden.`
      : `Extra portie ${recipe.name} in de vriezer gezet (${portions} pers., THT over 3 maanden).`);
  };

  /* ---------- Scannen: los af- of bijboeken buiten een recept om ---------- */

  const consumeInventoryItem = (itemId, amount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newCurrent = Math.max(0, round2(item.current - Number(amount || 0)));
    const nextInventory = inventory.map((i) => (i.id === itemId ? { ...i, current: newCurrent } : i));
    const { list: nextShopping, added } = pushLowStockToShopping(shoppingList, item, newCurrent);
    persist("inventory", nextInventory, setInventory);
    persist("consumptionLog", [{ name: item.name, unit: item.unit, amount: Number(amount || 0), date: new Date().toISOString() }, ...consumptionLog].slice(0, 500), setConsumptionLog);
    if (added) persist("shoppingList", nextShopping, setShoppingList);
    showToast(added ? `${item.name} afgeboekt — voorraad onder minimum, toegevoegd aan boodschappenlijst.` : `${item.name} afgeboekt van de voorraad.`);
  };

  const restockInventoryItem = (itemId, amount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newCurrent = addToStock(item, amount);
    const updatedItem = { ...item, current: newCurrent };
    const nextInventory = inventory.map((i) => (i.id === itemId ? updatedItem : i));
    const { list: nextShopping, changed } = reconcileShoppingForItem(shoppingList, updatedItem);
    persist("inventory", nextInventory, setInventory);
    if (changed) persist("shoppingList", nextShopping, setShoppingList);
    showToast(`${item.name} bijgevuld in de voorraad.`);
  };

  /* ---------- Voorraad ---------- */

  const saveInventoryItem = (item) => {
    const savedItem = item.id ? item : { ...item, id: uid() };
    const next = item.id ? inventory.map((i) => (i.id === item.id ? savedItem : i)) : [...inventory, savedItem];
    const { list: nextShopping, changed } = reconcileShoppingForItem(shoppingList, savedItem);
    persist("inventory", next, setInventory);
    if (changed) {
      persist("shoppingList", nextShopping, setShoppingList);
      if (savedItem.current < savedItem.min) {
        showToast(`${savedItem.name} staat onder het minimum en is toegevoegd aan de boodschappenlijst.`);
      }
    }
    setEditingItem(null);
  };

  const deleteInventoryItem = (id) => {
    persist("inventory", inventory.filter((i) => i.id !== id), setInventory);
  };

  /* ---------- Boodschappenlijst ---------- */

  const toggleChecked = (id) => {
    persist("shoppingList", shoppingList.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)), setShoppingList);
  };

  const addManualItem = (item) => {
    persist("shoppingList", [...shoppingList, { ...item, id: uid(), auto: false, checked: false }], setShoppingList);
  };

  // Zet alles wat je voor een recept nog mist in één keer op de boodschappenlijst.
  // Staat een ingrediënt er al op, dan slaan we het over in plaats van te verdubbelen.
  const addMissingToShopping = (recipe, scale = 1) => {
    const { missing } = recipeReadiness(recipe, inventory, scale);
    if (!missing.length) { showToast("Je hebt alles voor dit gerecht al in huis."); return; }

    const toAdd = [];
    const skipped = [];
    missing.forEach((name) => {
      if (shoppingList.some((s) => namesMatch(s.name, name))) { skipped.push(name); return; }
      const ing = (recipe.ingredients || []).find((i) => namesMatch(i.name, name));
      const invItem = inventory.find((i) => namesMatch(i.name, name));
      const needed = ing ? round2(Number(ing.amount || 0) * scale) : 1;
      // Heb je er al iets van, dan hoef je alleen het tekort te kopen.
      let amount = needed;
      if (invItem && ing && (invItem.unit || "").toLowerCase() === (ing.unit || "").toLowerCase()) {
        amount = Math.max(round2(needed - Number(invItem.current || 0)), 0.01);
      }
      toAdd.push({
        name,
        amount,
        unit: ing ? ing.unit : "stuks",
        category: (invItem && invItem.category) || guessCategory(name),
      });
    });

    if (toAdd.length) {
      persist("shoppingList",
        [...shoppingList, ...toAdd.map((i) => ({ ...i, id: uid(), auto: false, checked: false }))],
        setShoppingList);
    }
    const parts = [];
    if (toAdd.length) parts.push(`${toAdd.length} ingredi\u00ebnt${toAdd.length === 1 ? "" : "en"} toegevoegd aan de boodschappenlijst`);
    if (skipped.length) parts.push(`${skipped.length} stond${skipped.length === 1 ? "" : "en"} er al op`);
    showToast(parts.join(" \u2014 ") + ".");
  };

  // Aantal bijstellen tijdens het winkelen. De stapgrootte hangt af van de
  // eenheid: bij grammen heeft +1 geen zin, bij stuks juist wel.
  const changeShoppingAmount = (id, richting) => {
    const item = shoppingList.find((s) => s.id === id);
    if (!item) return;
    const eenheid = (item.unit || "").toLowerCase();
    const stap = eenheid === "g" || eenheid === "ml" ? 50 : (eenheid === "kg" || eenheid === "l" ? 0.5 : 1);
    const nieuw = round2(Math.max(0, Number(item.amount || 0) + richting * stap));
    if (nieuw === 0) { removeShoppingItem(id); return; } // tot nul terug = van de lijst af
    persist("shoppingList", shoppingList.map((s) => (s.id === id ? { ...s, amount: nieuw } : s)), setShoppingList);
  };

  const setShoppingAmount = (id, waarde) => {
    const nieuw = round2(Math.max(0, Number(String(waarde).replace(",", ".")) || 0));
    if (nieuw === 0) { removeShoppingItem(id); return; }
    persist("shoppingList", shoppingList.map((s) => (s.id === id ? { ...s, amount: nieuw } : s)), setShoppingList);
  };

  const removeShoppingItem = (id) => {
    persist("shoppingList", shoppingList.filter((s) => s.id !== id), setShoppingList);
  };

  const processChecked = () => {
    const checkedItems = shoppingList.filter((s) => s.checked);
    if (!checkedItems.length) return;
    const nextInventory = inventory.map((i) => ({ ...i }));
    let createdCount = 0;
    checkedItems.forEach((s) => {
      const idx = nextInventory.findIndex((i) => namesMatch(i.name, s.name) && i.unit === s.unit);
      if (idx > -1) {
        const item = nextInventory[idx];
        nextInventory[idx] = { ...item, current: addToStock(item, s.amount) };
      } else {
        // Nog geen voorraaditem met deze naam/eenheid: nieuw aanmaken op basis van het gekochte aantal.
        const amount = Number(s.amount || 0) || 1;
        nextInventory.push({
          id: uid(),
          name: s.name,
          category: s.category || guessCategory(s.name),
          unit: s.unit,
          current: amount,
          // Bewust 0: dit product kocht je voor een recept, niet om op voorraad
          // te houden. Met een minimum zou het na het koken meteen weer op je
          // boodschappenlijst staan. Wil je het wél aanhouden, zet dan zelf een
          // minimum en maximum bij het product.
          min: 0,
          max: 0,
        });
        createdCount += 1;
      }
    });
    persist("inventory", nextInventory, setInventory);
    persist("shoppingList", shoppingList.filter((s) => !s.checked), setShoppingList);
    showToast(createdCount
      ? `${checkedItems.length} artikel${checkedItems.length > 1 ? "en" : ""} afgevinkt, voorraad bijgewerkt (${createdCount} nieuw toegevoegd — check zelf even het minimum/maximum).`
      : `${checkedItems.length} artikel${checkedItems.length > 1 ? "en" : ""} afgevinkt en voorraad bijgewerkt.`);
  };

  /* ---------- Weekmenu ---------- */

  // Normaliseert een dag-item: ondersteunt zowel de oude vorm (recipeId als string)
  // als de nieuwe vorm ({ recipeId, cook }).
  const dayEntry = (day) => {
    const raw = weekmenu[day];
    if (!raw) return null;
    if (typeof raw === "string") return { recipeId: raw, cook: "" };
    return raw;
  };
  const isDayEmpty = (day) => {
    const e = dayEntry(day);
    return !e || (!e.recipeId && !e.offNight);
  };

  // leftoverItemId verwijst naar het restje in je voorraad. Daaraan ziet de app
  // dat er niet gekookt maar opgewarmd wordt: geen boodschappen, en de
  // ingrediënten gaan niet nóg een keer van je voorraad af.
  const setDayRecipe = (day, recipeId, leftoverItemId = null) => {
    const next = {
      ...weekmenu,
      [day]: { ...dayEntry(day), recipeId, offNight: false, leftoverItemId: leftoverItemId || null },
    };
    persist("weekmenu", next, setWeekmenu);
    setPickerDay(null);
  };

  const setDayOffNight = (day) => {
    const next = { ...weekmenu, [day]: { offNight: true, cook: "", attendees: [], doublePortion: false } };
    persist("weekmenu", next, setWeekmenu);
    setPickerDay(null);
  };

  const setDayDoublePortion = (day, value) => {
    const next = { ...weekmenu, [day]: { ...dayEntry(day), doublePortion: value } };
    persist("weekmenu", next, setWeekmenu);
  };

  const setDayCook = (day, cook) => {
    const next = { ...weekmenu, [day]: { ...dayEntry(day), cook: cook.trim() } };
    persist("weekmenu", next, setWeekmenu);
    setCookDay(null);
  };

  const setDayAttendees = (day, attendeeNames) => {
    const next = { ...weekmenu, [day]: { ...dayEntry(day), attendees: attendeeNames } };
    persist("weekmenu", next, setWeekmenu);
    setAttendeesDay(null);
  };

  const quickPlanExpiring = (recipeId, recipeName) => {
    const emptyDay = periodDays.find((d) => isDayEmpty(d.key));
    if (!emptyDay) {
      showToast("Alle dagen zijn al ingepland — maak eerst een dag leeg om dit te plannen.");
      return;
    }
    const next = { ...weekmenu, [emptyDay.key]: { ...dayEntry(emptyDay.key), recipeId } };
    persist("weekmenu", next, setWeekmenu);
    showToast(`${recipeName} ingepland op ${emptyDay.label}.`);
  };

  const addCook = (name) => {
    const trimmed = name.trim();
    if (!trimmed || cooks.includes(trimmed)) return;
    persist("cooks", [...cooks, trimmed], setCooks);
  };

  const removeCook = (name) => {
    persist("cooks", cooks.filter((c) => c !== name), setCooks);
  };

  const duplicateWeekmenu = () => {
    persist("weekmenuTemplate", weekmenu, () => {});
    showToast("Dit weekmenu is opgeslagen als sjabloon. Gebruik 'Vorig weekmenu' om het later opnieuw toe te passen.");
  };

  const applyWeekmenuTemplate = async () => {
    const template = hasDataAPI
      ? await window.dataAPI.weekmenu.list("weekmenu_template_days")
      : await loadKey("weekmenuTemplate", () => null);
    if (!template || !Object.keys(template).length) {
      showToast("Er is nog geen opgeslagen weekmenu-sjabloon.");
      return;
    }
    persist("weekmenu", template, setWeekmenu);
    showToast("Vorig weekmenu opnieuw toegepast.");
  };

  const shuffleWeekmenu = () => {
    const filledDays = periodDays.filter((d) => dayEntry(d.key)?.recipeId);
    if (filledDays.length < 2) {
      showToast("Vul minstens twee dagen in om ze te kunnen verwisselen.");
      return;
    }
    const origineel = filledDays.map((d) => dayEntry(d.key));

    // Blijven husselen tot er werkelijk iets veranderd is. Een toevallige
    // volgorde die gelijk blijft, laat de app niets doen lijken.
    let entries;
    for (let poging = 0; poging < 12; poging++) {
      entries = [...origineel];
      for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
      }
      if (entries.some((e, i) => e !== origineel[i])) break;
    }
    const next = { ...weekmenu };
    filledDays.forEach((d, idx) => { next[d.key] = entries[idx]; });
    persist("weekmenu", next, setWeekmenu);
    showToast(`${filledDays.length} gerechten over andere dagen verdeeld.`);
  };

  const exportWeekmenuToCalendar = () => {
    const planned = periodDays
      .map((d, idx) => ({ day: d, idx, entry: dayEntry(d.key) }))
      .filter(({ entry }) => entry?.recipeId);

    if (!planned.length) {
      showToast("Er staat nog niets in het weekmenu.");
      return;
    }

    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const events = planned.map(({ day, entry }) => {
      const recipe = recipes.find((r) => r.id === entry.recipeId);
      // De dag heeft nu een echte datum; die hoeft niet meer berekend te worden.
      const date = new Date(day.date);
      const start = new Date(date); start.setHours(18, 0, 0, 0);
      const end = new Date(date); end.setHours(19, 0, 0, 0);
      const title = `Koken: ${recipe ? recipe.name : "Gerecht"}${entry.cook ? ` (${entry.cook})` : ""}`;
      return [
        "BEGIN:VEVENT",
        `UID:${uid()}@pollepel`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${title.replace(/[\r\n]/g, " ")}`,
        recipe ? `DESCRIPTION:Ingrediënten: ${recipe.ingredients.map((i) => i.name).join(", ")}` : "",
        "END:VEVENT",
      ].filter(Boolean).join("\r\n");
    });

    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pollepel//NL", ...events, "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pollepel-weekmenu.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Agendabestand gedownload — open het om de kookafspraken in je agenda te zetten.");
  };

  const clearDay = (day) => {
    const next = { ...weekmenu };
    delete next[day];
    persist("weekmenu", next, setWeekmenu);
  };

  // Voor welke periode moet de lijst gemaakt worden? Bij meerdere gevulde
  // periodes vragen we het; staat er maar één vol, dan is er niets te kiezen.
  const [shoppingPeriodChoice, setShoppingPeriodChoice] = useState(null);

  const vraagPeriodeVoorLijst = () => {
    const gevuld = periods
      .map((p, i) => ({
        index: i, periode: p,
        aantal: p.dagen.filter((d) => {
          const e = weekmenu[dateKey(d)];
          return e && e.recipeId;
        }).length,
      }))
      .filter((x) => x.aantal > 0);

    if (!gevuld.length) { showToast("Er staat nog niets in je weekmenu."); return; }
    if (gevuld.length === 1) { generateWeekShoppingList(gevuld[0].index); return; }
    setShoppingPeriodChoice(gevuld);
  };

  const generateWeekShoppingList = (welkeIndex) => {
    const periode = periods[welkeIndex == null ? periodIndex : welkeIndex];
    const dagen = periode.dagen.map((d) => ({ key: dateKey(d) }));
    // Extra gerechten van deze periode tellen gewoon mee — dat is de hele reden
    // dat ze bestaan. Met hun eigen aantal personen, want een taart voor twaalf
    // vraagt andere hoeveelheden dan het avondeten voor vier.
    const dagSleutels = new Set(dagen.map((d) => d.key));
    const extraEntries = (extras || [])
      .filter((e) => dagSleutels.has(e.date) && e.recipeId)
      .map((e) => ({ recipeId: e.recipeId, extraServings: e.servings }));

    const plannedEntries = dagen
      .map((d) => dayEntry(d.key))
      // Kliekjes overslaan: die heb je al gekookt, de boodschappen zijn gedaan.
      .filter((e) => e && e.recipeId && !e.leftoverItemId)
      .concat(extraEntries)
      .map((e) => {
        const recipe = recipes.find((r) => r.id === e.recipeId);
        if (!recipe) return null;
        // Een extra gerecht heeft zijn eigen aantal personen.
        if (e.extraServings) {
          return { recipe, scale: Number(e.extraServings) / (recipe.servings || 1) };
        }
        const attendeeScale = isPremiumOn("householdRSVP") && e.attendees && e.attendees.length
          ? e.attendees.length / (recipe.servings || 1)
          : 1;
        const scale = attendeeScale * (e.doublePortion ? 2 : 1);
        return { recipe, scale };
      })
      .filter(Boolean);

    if (!plannedEntries.length) {
      showToast("Er staan nog geen gerechten in het weekmenu.");
      return;
    }

    // Benodigde totalen per (naam+eenheid) optellen over alle geplande gerechten (geschaald op aanwezigen indien bekend)
    const totals = new Map();
    plannedEntries.forEach(({ recipe, scale }) => {
      recipe.ingredients.forEach((ing) => {
        const key = `${norm(ing.name)}|${ing.unit}`;
        const prev = totals.get(key) || { name: ing.name, unit: ing.unit, amount: 0 };
        totals.set(key, { ...prev, amount: round2(prev.amount + Number(ing.amount || 0) * scale) });
      });
    });


    let nextShopping = shoppingList.map((s) => ({ ...s }));
    let addedCount = 0;

    totals.forEach((need) => {
      const item = findInventoryMatch(inventory, need);
      const cmp = item ? stockVsNeed(item, need, 1) : null;
      const inStock = cmp ? cmp.have : 0;
      const needed = cmp ? cmp.need : Number(need.amount || 0);
      const shortfall = round2(needed - inStock);
      if (shortfall <= 0) return;

      const category = item ? item.category : guessCategory(need.name);
      const idx = nextShopping.findIndex((s) => namesMatch(s.name, need.name) && s.unit === need.unit);
      const entry = {
        id: idx > -1 ? nextShopping[idx].id : uid(),
        name: need.name,
        unit: need.unit,
        category,
        amount: shortfall,
        auto: true,
        checked: false,
      };
      if (idx > -1) nextShopping[idx] = entry;
      else nextShopping.push(entry);
      addedCount += 1;
    });

    persist("shoppingList", nextShopping, setShoppingList);
    showToast(addedCount
      ? `Boodschappenlijst aangevuld met ${addedCount} product${addedCount > 1 ? "en" : ""} voor het weekmenu.`
      : "Je hebt al alles in huis voor het weekmenu — niets toegevoegd.");
  };

  const buildWeekRecipePrompt = (style, priorNames, recentNames, diets, saleNames, alGebruikt = [], afkeuren = [], soortOpdracht = "") => `${(afkeuren.length || soortOpdracht) ? `HARDE EIS — lees dit eerst en controleer je antwoord hieraan:
${soortOpdracht ? `• ${soortOpdracht}` : ""}
${afkeuren.length ? `• Deze producten worden in dit huishouden niet gegeten: ${afkeuren.join(", ")}. Ze mogen nergens in voorkomen — niet als hoofdingrediënt, niet in een saus, niet als garnering, en ook geen familieleden ervan (geen kabeljauw, geen tonijn, geen garnalen als er "vis" staat).` : ""}
Voldoet je gerecht hier niet aan, bedenk dan iets anders voordat je antwoordt.

` : ""}Je bent een menuplanner voor de kookboek-app "Pollepel". Bedenk één Nederlands AVONDETEN (hoofdgerecht voor het diner) in de stijl "${style.label}": ${style.description}.

Je hoeft je niet te beperken tot wat er in huis is — boodschappen doen hoort erbij. Kies gerust iets waarvoor nog ingrediënten gehaald moeten worden.

Belangrijk: dit is uitsluitend voor het avondeten. Bedenk GEEN ontbijt, lunch, tussendoortje, salade-als-bijgerecht of dessert — altijd een volwaardig hoofdgerecht dat je 's avonds warm opdient.
${priorNames.length ? `Deze gerechten staan al gepland deze week: ${priorNames.join(", ")}.
BELANGRIJK: zorg voor duidelijke afwisseling. Kies een ánder hoofdingrediënt (niet weer kip als er al kip staat), een ándere bereidingswijze (niet weer gegrild, gebakken of geroosterd) en een ándere keukenstijl dan wat er al staat. Een week met drie keer "gegrilde kipfilet met groenten en een graansoort" is precies wat we niet willen.` : ""}
${alGebruikt.length ? `Deze ingrediënten komen deze week al voor: ${alGebruikt.join(", ")}. Gebruik andere groenten en een andere koolhydraatbron dan deze.` : ""}
Denk breed: stamppot, pasta, curry, soep met brood, ovenschotel, wok, rijstgerecht, Mexicaans, Indonesisch, Italiaans, Marokkaans. Niet altijd "eiwit met groenten en een graansoort" op een bord.
${recentNames.length ? `Dit is recent al gegeten (laatste 2 weken), bedenk liever iets anders voor afwisseling: ${recentNames.join(", ")}.` : ""}
${diets.length ? `Houd rekening met deze dieetwensen/allergieën in het huishouden: ${diets.join(", ")}. Het gerecht moet hier geschikt voor zijn.` : ""}
${afkeuren.length ? `Denk eraan: geen ${afkeuren.join(", ")}.` : ""}
${saleNames.length ? `Deze producten zijn nu in de aanbieding bij de supermarkt: ${saleNames.join(", ")}. Gebruik er waar mogelijk en passend één of meer van, voor een voordeliger boodschappenlijst.` : ""}

Antwoord ALLEEN met STRIKT GELDIGE, COMPACTE JSON (één regel, geen markdown-codeblok, geen uitleg) in dit format:
{"name":string,"emoji":"één relevante food-emoji","cookTime":integer(minuten),"servings":4,"ingredients":[{"name":string,"amount":number,"unit":één van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...],"diets":[zero of meer van ${JSON.stringify(DIET_TAGS)}]}

SCHRIJF ALLES IN HET NEDERLANDS. Geen Engelse woorden in de ingrediënten of de bereiding. Gebruik de namen die in een Nederlandse supermarkt en een Nederlands kookboek staan:
- paprika (niet bell pepper), lente-ui (niet spring onion), koriander (niet cilantro), courgette (niet zucchini), aubergine (niet eggplant)
- roerbakken (niet stir-fry), bakken, sudderen, smoren, blancheren
- garnering of afwerking (niet topping), dressing mag, maar liever "sausje"
- kikkererwten (niet chickpeas), pijnboompitten (niet pine nuts), zoete aardappel (niet sweet potato)
Schrijf ingrediëntnamen voluit en correct gespeld: jasmijnrijst (niet jasrijst), zilvervliesrijst, crème fraîche, tagliatelle. Een verkeerd gespeld ingrediënt wordt niet herkend in de voorraad.

Houd het compact: maximaal 6 bereidingsstappen (kort, ~12 woorden per stap) en maximaal 9 ingrediënten. Basis zoals zout, peper en olie hoef je niet op te sommen.

CONTROLEER JEZELF VOORDAT JE ANTWOORDT. Loop je ingrediëntenlijst na en vraag je bij elk product af: bestaat dit echt, en kan ik dit zo in een Nederlandse supermarkt vragen? Plak nooit twee producten aan elkaar tot een woord dat niet bestaat — "eendenaardappel", "kipbroccoli" en "roomspinazie" zijn geen producten. Zijn het er twee, schrijf ze dan als twee losse ingrediënten. Twijfel je over een naam, kies dan het gewonere woord.`;

  // Vult (lege) dagen op basis van jullie eigen kookritme — geen nieuwe AI-recepten, maar een
  // slimme keuze uit wat je al vaak maakt, bij voorkeur per weekdag (bijv. altijd vis op vrijdag).
  const generatePatternWeekmenu = ({ scope }) => {
    const days = scope === "empty" ? periodDays.filter((d) => isDayEmpty(d.key)) : periodDays;
    if (!days.length) {
      showToast("Alle dagen zijn al ingevuld. Kies 'hele week' om ze te vervangen, of maak eerst dagen leeg.");
      return;
    }
    if (!cookLog.length && !recipes.some((r) => r.favorite)) {
      showToast("Nog geen kookgeschiedenis of favorieten bekend — kook eerst een paar keer, of markeer favorieten, voor deze functie iets kan voorstellen.");
      return;
    }

    const dutchDayIndex = { zo: 0, ma: 1, di: 2, wo: 3, do: 4, vr: 5, za: 6 };
    const next = { ...weekmenu };
    const usedThisRun = [];

    days.forEach((day) => {
      // 1) Voorkeur: wat wordt er historisch het vaakst gekookt op precies déze weekdag?
      const sameDayCounts = new Map();
      cookLog.forEach((entry) => {
        if (!entry.recipeId) return;
        const dow = new Date(entry.date).getDay();
        if (dutchDayIndex[day.key] === dow) {
          sameDayCounts.set(entry.recipeId, (sameDayCounts.get(entry.recipeId) || 0) + 1);
        }
      });
      let candidates = Array.from(sameDayCounts.entries())
        .filter(([id]) => recipes.some((r) => r.id === id) && !usedThisRun.includes(id))
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);

      // 2) Terugval: algemeen vaakst gekookt, of favorieten, als er niets specifieks voor deze dag is
      if (!candidates.length) {
        const overallCounts = new Map();
        // Kliekjes tellen niet mee voor "hoe vaak koken we dit": je hebt het
        // opgewarmd, niet gemaakt. Anders stelt de app hachee vaker voor dan je
        // hem werkelijk kookt.
        cookLog.forEach((entry) => {
          if (entry.recipeId && !entry.leftover) overallCounts.set(entry.recipeId, (overallCounts.get(entry.recipeId) || 0) + 1);
        });
        const byFrequency = Array.from(overallCounts.entries())
          .filter(([id]) => recipes.some((r) => r.id === id) && !usedThisRun.includes(id))
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id);
        const favorites = recipes.filter((r) => r.favorite && !usedThisRun.includes(r.id)).map((r) => r.id);
        candidates = [...byFrequency, ...favorites];
      }

      if (!candidates.length) return; // niets bruikbaars gevonden voor deze dag, gewoon overslaan
      const pick = candidates[0];
      usedThisRun.push(pick);
      next[day.key] = { ...dayEntry(day.key), recipeId: pick };
    });

    persist("weekmenu", next, setWeekmenu);
    showToast("Weekmenu ingevuld op basis van jullie eigen kookritme.");
  };

  const generateAIWeekmenu = async ({ styleId, scope }) => {
    const gevarieerd = styleId === "gevarieerd";
    const vasteStijl = MEAL_STYLES.find((s) => s.id === styleId) || MEAL_STYLES[0];
    const days = scope === "empty" ? periodDays.filter((d) => isDayEmpty(d.key)) : periodDays;

    // Bij "gevarieerd" krijgt elke dag van de week zijn eigen stijl: snel op een
    // doordeweekse avond, uitgebreid in het weekend. De verdeling hangt aan de
    // weekdag, niet aan de volgorde van lege dagen — anders krijgt een half
    // gevulde week een rare indeling.
    const stijlVoorDag = (dag) => {
      if (!gevarieerd) return vasteStijl;
      const weekdag = dag.date ? dag.date.getDay() : 1;
      const verdeling = (preferences.weekdayStyles && preferences.weekdayStyles.length === 7)
        ? preferences.weekdayStyles
        : GEVARIEERDE_VERDELING;
      const id = verdeling[weekdag];
      return MEAL_STYLES.find((s) => s.id === id) || vasteStijl;
    };

    if (!days.length) {
      setAiWeekError("Alle dagen zijn al ingevuld. Kies 'hele week' om ze te vervangen, of maak eerst dagen leeg.");
      return;
    }

    const twoWeeksAgo = Date.now() - 14 * 86400000;
    const recentNames = Array.from(new Set(
      cookLog.filter((e) => new Date(e.date).getTime() > twoWeeksAgo).map((e) => e.recipeName)
    )).slice(0, 15);
    const saleNames = inventory.filter((i) => i.onSale).map((i) => i.name);

    // Wat er in Instellingen bij "afkeuren" staat, per huisgenoot. Dit ging
    // nergens naartoe: de generator kende alleen de dieetwensen, waardoor er
    // vis op het menu kwam terwijl daar juist een afkeur voor staat.
    const alleAfkeuren = [...new Set(
      (preferences.dislikes || []).flatMap((d) => d.items || []).filter(Boolean)
    )];

    setAiWeekGenerating(true);
    setAiWeekError("");
    const newRecipes = [];
    const mislukt = [];
    let limietBereikt = false;
    let opeenvolgendeFouten = 0;
    let gestopt = false;
    const nextWeekmenu = { ...weekmenu };

    for (let i = 0; i < days.length; i++) {
      // De stijl hangt per dag af van de verdeling, dus hier ophalen.
      // Stond hier eerder `style`, een variabele die na het invoeren van de
      // stijl-per-dag niet meer bestond — en die fout viel buiten elk vangnet.
      const dagStijl = stijlVoorDag(days[i]);
      setAiWeekProgress(`Gerecht ${i + 1} van ${days.length} bedenken (${dagStijl.label.toLowerCase()})…`);
      try {
        // Ook wat er al in dit weekmenu staat uit eerdere rondes. Zonder dit
        // begint elke poging blanco en krijg je drie keer hetzelfde gerecht.
        const alGepland = periodDays
          .map((d) => dayEntry(d.key))
          .filter((e) => e && e.recipeId)
          .map((e) => (recipes.find((r) => r.id === e.recipeId) || {}).name)
          .filter(Boolean);
        const priorNames = [...new Set([...alGepland, ...newRecipes.map((r) => r.name)])];

        // Ook de ingrediënten van wat er al ligt. Op namen alleen ziet de app
        // "kip met bulgur" en "kip met quinoa" als verschillend, terwijl het
        // op tafel hetzelfde bord is.
        const alGebruikt = [...new Set(
          periodDays
            .map((d) => dayEntry(d.key))
            .filter((e) => e && e.recipeId)
            .flatMap((e) => {
              const r = recipes.find((x) => x.id === e.recipeId);
              return r ? (r.ingredients || []).map((ing) => ing.name) : [];
            })
            .concat(newRecipes.flatMap((r) => (r.ingredients || []).map((ing) => ing.name)))
            .filter((naam) => !isPantryBasic(naam))
        )].slice(0, 25);

        // Per weekdag instelbaar: vlees, vis, vegetarisch of maakt niet uit.
        const soorten = (preferences.weekdaySoorten && preferences.weekdaySoorten.length === 7)
          ? preferences.weekdaySoorten
          : ["alles", "alles", "alles", "alles", "alles", "alles", "alles"];
        const weekdagVanDeze = days[i].date ? days[i].date.getDay() : 1;
        const soort = SOORTEN.find((s) => s.id === soorten[weekdagVanDeze]) || SOORTEN[0];

        const opdracht = buildWeekRecipePrompt(dagStijl, priorNames, recentNames, activeDietTags, saleNames, alGebruikt, alleAfkeuren, soort.opdracht);
        let raw;
        try {
          // Ruim bemeten: het model denkt na vóór het antwoordt, en dat nadenken
          // telt mee in dezelfde ruimte. Bij 2000 ging die volledig op aan
          // nadenken en bleef er niets over voor het recept zelf.
          raw = await askClaude(opdracht, 4000);
        } catch (eerste) {
          // Een afgebroken verbinding is vaak gewoon pech met de timing.
          // Eén keer opnieuw, met een nog kortere uitvoer.
          if (eerste.status === 429) throw eerste;
          console.warn(`Dag ${days[i].key}: eerste poging mislukt (${eerste.status || eerste.message}), opnieuw…`);
          raw = await askClaude(opdracht, 4000);
        }
        const parsed = sanitizeDraft(extractJson(raw));
        // Controleren of de afkeuren werkelijk zijn gerespecteerd. Een model
        // dat weinig nadenkt glijdt makkelijker over een beperking heen, en
        // dan is een vriendelijk verzoek niet genoeg.
        if (alleAfkeuren.length && parsed.ingredients.length) {
          const verboden = alleAfkeuren.filter((afkeur) =>
            parsed.ingredients.some((ing) => valtOnderAfkeur(ing.name, afkeur)) ||
            valtOnderAfkeur(parsed.name || "", afkeur)
          );
          if (verboden.length) {
            console.warn(`Dag ${days[i].key}: bevat ${verboden.join(", ")} terwijl dat niet gegeten wordt. Geweigerd.`);
            mislukt.push({ dag: days[i].key, reden: `bevatte ${verboden.join(", ")}` });
            continue;
          }
        }

        // Verzonnen samenstellingen melden. Niet weigeren — dan gooien we een
        // verder prima recept weg om één naam — maar wel vastleggen.
        const verzonnen = parsed.ingredients.map((ing) => ing.name).filter(lijktVerzonnen);
        if (verzonnen.length) {
          console.warn(`Dag ${days[i].key}: verdachte ingrediëntnaam: ${verzonnen.join(", ")}`);
        }

        if (!parsed.ingredients.length || !parsed.steps.length) {
          // Onbruikbaar antwoord. Vastleggen wát er kwam, anders is dit later
          // niet te achterhalen — precies waar we nu tegenaan liepen.
          // Lengte erbij: houdt het antwoord midden in een zin op, dan is het
          // afgekapt en is de ruimte te krap — dat is iets anders dan onzin.
          const ruw = String(raw || "");
          console.error(
            `Dag ${days[i].key}: antwoord niet te gebruiken (${ruw.length} tekens, eindigt op "${ruw.slice(-40)}").`,
            ruw.slice(0, 300)
          );
          mislukt.push({ dag: days[i].key, reden: "onbruikbaar antwoord" });
          continue;
        }
        // Meteen in de database opslaan en het echte nummer gebruiken.
        // Eerder kregen deze gerechten alleen een lokaal nummer: ze verdwenen
        // bij het herladen en het weekmenu wees daarna naar niets.
        let recipeWithId;
        if (hasDataAPI) {
          const nieuwId = await window.dataAPI.recipes.create({ ...parsed, favorite: false, community: false });
          recipeWithId = { ...parsed, id: nieuwId, favorite: false, community: false };
        } else {
          recipeWithId = { ...parsed, id: uid(), favorite: false };
        }
        newRecipes.push(recipeWithId);
        opeenvolgendeFouten = 0;
        nextWeekmenu[days[i].key] = { ...dayEntry(days[i].key), recipeId: recipeWithId.id };
      } catch (e) {
        console.error(`Dag ${days[i].key} mislukt:`, e.status || "", e.message, e.body || "");
        if (e.status === 429) {
          // Limiet bereikt: doorgaan heeft geen zin, de rest faalt ook.
          mislukt.push({ dag: days[i].key, reden: "limiet" });
          limietBereikt = true;
          break;
        }
        mislukt.push({ dag: days[i].key, reden: e.message || "onbekende fout" });
        opeenvolgendeFouten += 1;
        // Gaat het drie keer achter elkaar mis, dan is er iets structureel
        // stuk. Doorgaan kost alleen maar tijd en levert niets op.
        if (opeenvolgendeFouten >= 3) {
          console.error("Drie mislukkingen op rij — gestopt.", e.status || "", e.message, e.body || "");
          gestopt = true;
          break;
        }
      }
    }

    setAiWeekGenerating(false);
    setAiWeekProgress("");

    if (!newRecipes.length && mislukt.length) {
      const alles404 = mislukt.length > 0 && mislukt.every((m) => String(m.reden).includes("niet gevonden"));
      setAiWeekError(limietBereikt
        ? "Je AI-tegoed voor deze maand is op. Met Pollepel Premium kun je hele weekmenu's laten bedenken."
        : alles404
          ? "De AI-functie staat niet op de server. Controleer of netlify/functions/ask-claude.js is geüpload."
          : gestopt
            ? "De AI-hulp reageert niet. Probeer het later opnieuw — er is niets van je tegoed afgegaan."
            : "Er kwam geen bruikbaar recept terug. Probeer het zo nog eens.");
    }

    if (newRecipes.length) {
      // Bij een databaseverbinding zijn ze hierboven al aangemaakt; dan hoeft
      // alleen het scherm nog bij te werken.
      if (hasDataAPI) setRecipes((prev) => [...prev, ...newRecipes]);
      else persist("recipes", [...recipes, ...newRecipes], setRecipes);
      persist("weekmenu", nextWeekmenu, setWeekmenu);
      setAiWeekOpen(false);
      const gelukt = newRecipes.length;
      if (mislukt.length === 0) {
        showToast(`${gelukt} AI-gerecht${gelukt > 1 ? "en" : ""} toegevoegd aan het weekmenu en het kookboek.`);
      } else if (limietBereikt) {
        showToast(`${gelukt} van de ${days.length} dagen gelukt. Daarna was je AI-tegoed voor deze maand op.`);
      } else {
        showToast(`${gelukt} van de ${days.length} dagen gelukt; ${mislukt.length} gaven geen bruikbaar recept.`);
      }
    } else {
      setAiWeekError("Kon geen AI-gerechten genereren — de AI-verbinding lijkt niet bereikbaar. Probeer het later opnieuw, of stel het weekmenu handmatig samen.");
    }
  };

  /* ---------- Backup ---------- */

  const exportBackup = () => {
    const data = { recipes, inventory, shoppingList, weekmenu, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pollepel-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup gedownload.");
  };

  /* ---------------------------------------------------------------- */

  const showWelcome = !loading && preferences && preferences.welcomeSeen !== true;

  if (loading) {
    return (
      <div style={{ minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center", background: C.ceramic, fontFamily: FONT_BODY }}>
        <PollepelLoader tekst="Kookboek wordt geladen…" size={52} delay={0} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT_BODY, background: C.ceramic, minHeight: "100dvh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea { font-size: 16px !important; }
        input:focus, textarea:focus, select:focus { outline: 2px solid ${C.mustard}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${C.mustard}; outline-offset: 2px; }
        @keyframes pollepelRoeren {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          /* Wie beweging heeft uitgezet krijgt een rustige pulsering. */
          @keyframes pollepelRoeren {
            0%, 100% { transform: rotate(0deg); opacity: 1; }
            50%      { transform: rotate(0deg); opacity: 0.45; }
          }
        }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

      {showWelcome && (
        <WelcomeTour onFinish={() => updatePreferences({ welcomeSeen: true })} />
      )}

      {extraVoorDag && (
        <ExtraToevoegenModal
          datum={extraVoorDag}
          recipes={recipes}
          onKies={voegExtraToe}
          onClose={() => setExtraVoorDag(null)}
        />
      )}

      {logboekOpen && <LogboekModal onClose={() => setLogboekOpen(false)} />}

      {controleOpen && (
        <ControleModal
          bevindingen={bevindingen}
          onHerstel={herstelBevinding}
          onClose={() => setControleOpen(false)}
        />
      )}

      {koppelVoor && (
        <KoppelModal
          ingredientNaam={koppelVoor.ingredientNaam}
          inventory={inventory}
          onKies={(item) => koppelIngredient(koppelVoor.recipeId, koppelVoor.ingredientNaam, item)}
          onClose={() => setKoppelVoor(null)}
        />
      )}

      {calendarOpen && (
        <AgendaModal token={household && household.calendar_token} onDownload={() => { exportWeekmenuToCalendar(); setCalendarOpen(false); }} onClose={() => setCalendarOpen(false)} />
      )}

      {shoppingPeriodChoice && (
        <Modal title="Voor welke periode?" onClose={() => setShoppingPeriodChoice(null)}>
          <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
            Je hebt in meerdere periodes maaltijden gepland. Voor welke wil je boodschappen doen?
          </p>
          {shoppingPeriodChoice.map((x) => (
            <button
              key={x.periode.startKey}
              onClick={() => { const i = x.index; setShoppingPeriodChoice(null); generateWeekShoppingList(i); }}
              style={{
                display: "block", width: "100%", textAlign: "left", cursor: "pointer",
                background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14,
                padding: "11px 13px", marginBottom: 8, fontFamily: FONT_BODY,
              }}
            >
              <div style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>
                {periodeLabel(x.periode.start, x.periode.eind)}
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>
                {x.aantal} {x.aantal === 1 ? "maaltijd" : "maaltijden"} gepland
              </div>
            </button>
          ))}
        </Modal>
      )}

      {saveError && (
        <div
          role="alert"
          style={{
            position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 180,
            maxWidth: 460, margin: "0 auto", background: C.brick, color: "#fff",
            borderRadius: 14, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          }}
        >
          <AlertTriangle size={17} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}>
            Niet opgeslagen — je laatste wijziging is teruggedraaid.
          </span>
          <button
            onClick={() => { const fn = saveError.opnieuw; setSaveError(null); fn(); }}
            style={{
              background: "#fff", color: C.brick, border: "none", borderRadius: 10,
              padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT_BODY, flexShrink: 0,
            }}
          >
            Opnieuw
          </button>
          <button
            onClick={() => setSaveError(null)}
            aria-label="Melding sluiten"
            style={{ background: "none", border: "none", color: "#fff", opacity: 0.8, cursor: "pointer", padding: 0, flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: C.blue, padding: "16px 18px 20px", color: "#fff", position: "relative", overflow: "hidden",
        borderRadius: "0 0 28px 28px",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.4px, transparent 1.4px)",
        backgroundSize: "16px 16px",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 40, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          <LogoMark size={22} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, flexShrink: 0, whiteSpace: "nowrap" }}>
            Pollepel
          </span>
          {saving && <span style={{ marginLeft: 6, flexShrink: 0 }}><PollepelLoader size={15} inline delay={0} /></span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setSettingsOpen(true)}
              title="Instellingen"
              style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 10, padding: 6, cursor: "pointer", display: "flex" }}
            >
              <Settings size={15} color="#fff" />
            </button>
          </div>
        </div>

        {household?.name ? (
          <div style={{
            fontSize: 13, fontWeight: 600, color: C.mustard, marginTop: 5, position: "relative",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
          }}>
            {household.name}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 5, position: "relative" }}>
            Jullie digitale kookboek · voorraad &amp; boodschappen automatisch bijgewerkt
          </div>
        )}
      </div>

      {isOffline && (
        <div style={{ background: C.brick, color: "#fff", textAlign: "center", padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <WifiOff size={13} /> Geen internetverbinding — wijzigingen worden pas opgeslagen zodra je weer online bent.
        </div>
      )}

      {/* Tegeltjes-rand */}
      <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "9px 0 3px" }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: 2,
            background: i % 3 === 0 ? C.mustard : C.blue,
            opacity: i % 3 === 0 ? 0.55 : 0.28,
            transform: "rotate(45deg)",
          }} />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          margin: "8px 14px 0", background: C.cardBg, border: `1.5px solid ${C.sage}`, borderRadius: 14,
          padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: C.ink,
        }}>
          <CheckCircle2 size={18} color={C.sage} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 14 }}>
        {tab === "kookboek" && !openRecipe && !cookingSessions.length && (
          <VanavondStrook
            entry={weekmenu[dateKey(new Date())]}
            recipe={vanavondRecept}
            readiness={vanavondRecept ? recipeReadiness(vanavondRecept, inventory) : null}
            cookNaam={(weekmenu[dateKey(new Date())] || {}).cook}
            alGekookt={vanavondAlGekookt}
            onOpen={(id) => setOpenRecipeId(id)}
            onVerrasMe={verrasMeVanavond}
            onNaarWeekmenu={() => setTab("weekmenu")}
          />
        )}

        {!openRecipe && (
          <KookMelding
            sessies={cookingSessions}
            currentUserName={currentUserName}
            onOpen={(id) => { setTab("kookboek"); setOpenRecipeId(id); }}
          />
        )}

        {tab === "kookboek" && !openRecipe && (
          <KookboekView
            recipes={filteredRecipes}
            allRecipes={recipes}
            view={bookView}
            setView={setBookView}
            cookLog={cookLog}
            query={query} setQuery={setQuery}
            favOnly={favOnly} setFavOnly={setFavOnly}
            maxCookTime={maxCookTime} setMaxCookTime={setMaxCookTime}
            dietOnly={dietOnly} setDietOnly={setDietOnly}
            activeDietTags={activeDietTags}
            bookMode={bookMode} setBookMode={setBookMode}
            inventory={inventory}
            onOpen={setOpenRecipeId}
            onToggleFav={toggleFavorite}
            onNew={() => setEditingRecipe({})}
            onImport={() => { setImportError(""); setImportOpen(true); }}
            onDuplicate={duplicateToMyBook}
            showToast={showToast}
          />
        )}

        {tab === "kookboek" && openRecipe && (
          <RecipeDetail
            recipe={openRecipe}
            isMine={openRecipeIsMine}
            onBack={() => setOpenRecipeId(null)}
            onToggleFav={() => toggleFavorite(openRecipe.id)}
            onToggleCommunity={() => toggleCommunity(openRecipe.id)}
            onEdit={() => setEditingRecipe(openRecipe)}
            onDelete={() => deleteRecipe(openRecipe.id)}
            onCook={(scale, overrides) => cookRecipe(openRecipe, scale, overrides)}
            onDuplicate={() => duplicateToMyBook(openRecipe.id)}
            onAddLeftover={addLeftover}
            onAddFreezerPortion={addFreezerPortion}
            onAskSousChef={askSousChef}
            isPremiumOn={isPremiumOn}
            inventory={inventory}
            showToast={showToast}
            dislikeWarnings={getRecipeDislikeWarnings(openRecipe)}
            doublePortionDefault={doublePortionDefault}
            onAddMissingToShopping={(scale) => addMissingToShopping(openRecipe, scale)}
            onStartCooking={(personen) => startCookingSession(openRecipe, personen)}
            onKoppel={(naam) => setKoppelVoor({ recipeId: openRecipe.id, ingredientNaam: naam })}
            cookLog={cookLog}
            toonBakjesTip={!preferences.containerNumbering && !preferences.containerHintSeen}
            onBakjesTipGezien={() => updatePreferences({ containerHintSeen: true })}
            leftoverItem={leftoverContext ? inventory.find((i) => i.id === leftoverContext) : null}
            onEatLeftover={(porties, bakjes) => { eatLeftover(leftoverContext, porties, openRecipe, bakjes); setLeftoverContext(null); setOpenRecipeId(null); }}
            onRecalculateNutrition={() => recalculateNutrition(openRecipe.id)}
            nutritionBusy={nutritionBusy}
          />
        )}

        {tab === "voorraad" && (
          <VoorraadView
            inventory={inventory}
            recipes={recipes}
            categories={orderedCategories}
            consumptionLog={consumptionLog}
            isPremiumOn={isPremiumOn}
            onEdit={setEditingItem}
            onNew={() => setEditingItem({})}
            onDelete={deleteInventoryItem}
            onScan={() => setScanOpen(true)}
            onOpenRecipe={(id, dbl, leftoverId) => { setOpenRecipeId(id); setDoublePortionDefault(!!dbl); setLeftoverContext(leftoverId || null); setTab("kookboek"); }}
            ernstigeBevindingen={bevindingen.filter((b) => b.ernst === "hoog").length}
            onOpenControle={() => setControleOpen(true)}
            onOpenShelfPhoto={() => { setShelfScanError(""); setShelfScanResults([]); setShelfPhotoOpen(true); }}
          />
        )}

        {tab === "boodschappen" && (
          <BoodschappenView
            list={shoppingList}
            categories={orderedCategories}
            onToggle={toggleChecked}
            onRemove={removeShoppingItem}
            onAddManual={addManualItem}
            onChangeAmount={changeShoppingAmount}
            onSetAmount={setShoppingAmount}
            onProcess={processChecked}
          />
        )}

        {tab === "weekmenu" && (
          <WeekmenuView
            extras={extras}
            onAddExtra={(dag) => setExtraVoorDag(dag)}
            onRemoveExtra={verwijderExtra}
            periodDays={periodDays}
            periods={periods}
            periodIndex={periodIndex}
            onPeriodChange={setPeriodIndex}
            weekmenu={weekmenu}
            recipes={recipes}
            cooks={cooks}
            inventory={inventory}
            isPremiumOn={isPremiumOn}
            onPickDay={setPickerDay}
            onPickCook={setCookDay}
            onPickAttendees={setAttendeesDay}
            onSetDoublePortion={setDayDoublePortion}
            onClearDay={clearDay}
            onGenerate={vraagPeriodeVoorLijst}
            onAIGenerate={() => { setAiWeekError(""); setAiWeekOpen(true); }}
            onPatternGenerate={() => generatePatternWeekmenu({ scope: "empty" })}
            onDuplicate={duplicateWeekmenu}
            onApplyTemplate={applyWeekmenuTemplate}
            onShuffle={shuffleWeekmenu}
            onOpenRecipe={(id, dbl, leftoverId) => { setOpenRecipeId(id); setDoublePortionDefault(!!dbl); setLeftoverContext(leftoverId || null); setTab("kookboek"); }}
            onExportCalendar={() => setCalendarOpen(true)}
            onQuickPlan={quickPlanExpiring}
          />
        )}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto", width: "100%", maxWidth: 480,
        background: C.cardBg, borderTop: `1.5px solid ${C.borderTint}`, display: "flex",
        // Onderaan ruimte voor de streep van het thuisscherm op nieuwere iPhones,
        // anders valt die over de tabbladen heen.
        padding: "8px 4px calc(8px + env(safe-area-inset-bottom, 0px))",
        borderRadius: "22px 22px 0 0",
        boxShadow: "0 -4px 14px rgba(0,0,0,0.08)",
        zIndex: 40,
      }}>
        <TabButton icon={<ChefHat size={18} />} label="Kookboek" active={tab === "kookboek"} onClick={() => { setTab("kookboek"); setOpenRecipeId(null); }} />
        <TabButton icon={<CalendarDays size={18} />} label="Weekmenu" active={tab === "weekmenu"} onClick={() => setTab("weekmenu")} />
        <TabButton icon={<Package size={18} />} label="Voorraad" active={tab === "voorraad"} onClick={() => setTab("voorraad")} badge={lowStockCount || null} badgeTone="warn" />
        <TabButton icon={<ShoppingCart size={18} />} label="Boodschappen" active={tab === "boodschappen"} onClick={() => setTab("boodschappen")} badge={shoppingCount || null} badgeTone="mustard" />
      </div>

      {pickerDay && (
        <RecipePickerModal
          recipes={recipes}
          inventory={inventory}
          onPick={(recipeId, leftoverItemId) => setDayRecipe(pickerDay, recipeId, leftoverItemId)}
          onPickOffNight={() => setDayOffNight(pickerDay)}
          onClose={() => setPickerDay(null)}
        />
      )}

      {cookDay && (
        <CookPickerModal
          cooks={cooks}
          current={dayEntry(cookDay)?.cook || ""}
          onPick={(name) => setDayCook(cookDay, name)}
          onAddCook={addCook}
          onRemoveCook={removeCook}
          onClose={() => setCookDay(null)}
        />
      )}

      {attendeesDay && (
        <AttendeesPickerModal
          cooks={cooks}
          current={dayEntry(attendeesDay)?.attendees || []}
          onSave={(names) => setDayAttendees(attendeesDay, names)}
          onAddCook={addCook}
          onClose={() => setAttendeesDay(null)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          household={household}
          members={members}
          preferences={preferences}
          cooks={cooks}
          onRename={onRenameHousehold}
          onLogout={onLogout}
          onOpenMagnet={() => { setSettingsOpen(false); setPrintCardOpen(true); }}
          onOpenTabletMode={() => { setSettingsOpen(false); setTabletModeOpen(true); }}
          onShowWelcome={() => { setSettingsOpen(false); updatePreferences({ welcomeSeen: false }); }}
          onExportBackup={exportBackup}
          onToggleDarkMode={toggleDarkMode}
          onSetShoppingDay={(d) => { updatePreferences({ shoppingDay: d }); setPeriodIndex(0); }}
          onSetContainerNumbering={(v) => updatePreferences({ containerNumbering: v })}
          onSetContainerCount={(v) => updatePreferences({ containerCount: v })}
          onOpenControle={() => { setSettingsOpen(false); setControleOpen(true); }}
          onOpenLogboek={() => { setSettingsOpen(false); setLogboekOpen(true); }}
          aantalBevindingen={bevindingen.length}
          heeftPremium={heeftPremium}
          onMoveCategoryOrder={moveCategoryOrder}
          onUpdateCookDiets={updateCookDiets}
          onUpdateCookDislikes={updateCookDislikes}
          onTogglePremium={togglePremiumFeature}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {printCardOpen && (
        <FridgeMagnetView household={household} onClose={() => setPrintCardOpen(false)} />
      )}

      {tabletModeOpen && (
        <TabletModeView
          inventory={inventory}
          onConsume={consumeInventoryItem}
          onRestock={restockInventoryItem}
          onCreate={saveInventoryItem}
          onClose={() => setTabletModeOpen(false)}
        />
      )}

      {shelfPhotoOpen && (
        <ShelfPhotoModal
          scanning={shelfScanning}
          error={shelfScanError}
          results={shelfScanResults}
          onScan={scanShelfPhoto}
          onToggleInclude={toggleShelfResultInclude}
          onApply={applyShelfScanResults}
          onClose={() => setShelfPhotoOpen(false)}
        />
      )}

      {editingRecipe !== null && (
        <RecipeForm
          initial={editingRecipe}
          inventoryNames={[...new Set([...inventory.map((i) => i.name), ...COMMON_GROCERY_ITEMS])]}
          inventoryItems={inventory}
          onImport={() => { setEditingRecipe(null); setImportError(""); setImportOpen(true); }}
          onCancel={() => setEditingRecipe(null)}
          onSave={saveRecipe}
        />
      )}

      {editingItem !== null && (
        <InventoryForm
          consumptionLog={consumptionLog}
          inventory={inventory}
          nummertBakjes={!!preferences.containerNumbering}
          bakjesAantal={Number(preferences.containerCount) || 40}
          initial={editingItem}
          onCancel={() => setEditingItem(null)}
          onSave={saveInventoryItem}
        />
      )}

      {importOpen && (
        <ImportModal
          importing={importing}
          error={importError}
          onCancel={() => setImportOpen(false)}
          onImportText={importFromText}
          onImportUrl={importFromUrl}
          onImportPhoto={importFromPhoto}
        />
      )}

      {scanOpen && (
        <ScanModal
          inventory={inventory}
          onClose={() => setScanOpen(false)}
          onConsume={consumeInventoryItem}
          onRestock={restockInventoryItem}
          onCreate={saveInventoryItem}
        />
      )}

      {aiWeekOpen && (
        <AIWeekmenuModal
          generating={aiWeekGenerating}
          progress={aiWeekProgress}
          error={aiWeekError}
          onCancel={() => setAiWeekOpen(false)}
          onGenerate={generateAIWeekmenu}
          weekdayStyles={preferences.weekdayStyles}
          onSetWeekdayStyles={(v) => updatePreferences({ weekdayStyles: v })}
          weekdaySoorten={preferences.weekdaySoorten}
          onSetWeekdaySoorten={(v) => updatePreferences({ weekdaySoorten: v })}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function TabButton({ icon, label, active, onClick, badge, badgeTone = "warn" }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, background: "transparent", border: "none", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        padding: "4px 2px", position: "relative", color: active ? C.blue : C.inkSoft,
      }}
    >
      <div style={{ position: "relative" }}>
        {icon}
        {badge && (
          <span style={{
            position: "absolute", top: -6, right: -10, background: badgeTone === "warn" ? C.brick : C.mustard,
            color: "#fff", fontSize: 11, fontFamily: FONT_MONO, borderRadius: 20, padding: "1px 5px", lineHeight: "13px",
          }}>{badge}</span>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
  );
}

/* ---------------------------------------------------------------- */
/*  Kookboek                                                          */
/* ---------------------------------------------------------------- */

function SeasonalAndSurpriseBar({ recipes, inventory, onOpen, showToast }) {
  const seasonal = useMemo(() => getSeasonalRecipeSuggestions(recipes).slice(0, 4), [recipes]);
  const monthName = new Date().toLocaleDateString("nl-NL", { month: "long" });
  const [lastPickId, setLastPickId] = useState(null);

  const surpriseMe = () => {
    const makeable = recipes.filter((r) => recipeReadiness(r, inventory).complete);
    // Niets compleet? Kies dan uit wat er het dichtst bij zit, in plaats van
    // willekeurig iets waarvoor je nog een halve boodschappenlijst nodig hebt.
    let incomplete = false;
    let pool = makeable;
    if (!pool.length && recipes.length) {
      const scored = recipes
        .map((r) => ({ r, missing: recipeReadiness(r, inventory).missing.length }))
        .sort((a, b) => a.missing - b.missing);
      const fewest = scored[0].missing;
      pool = scored.filter((s) => s.missing === fewest).map((s) => s.r);
      incomplete = true;
    }
    if (!pool.length) return;

    let pick;
    if (pool.length === 1) {
      pick = pool[0];
    } else {
      // Nooit twee keer achter elkaar dezelfde suggestie, als er een keuze is
      const choices = pool.filter((r) => r.id !== lastPickId);
      const finalPool = choices.length ? choices : pool;
      pick = finalPool[Math.floor(Math.random() * finalPool.length)];
    }

    // Zeg er eerlijk bij wát er nog ontbreekt voor dit specifieke gerecht,
    // in plaats van alleen een aantal te noemen.
    if (showToast) {
      const { missing } = recipeReadiness(pick, inventory);
      if (missing.length) {
        showToast(`${pick.name}: hiervoor mis je nog ${missing.join(", ")}.`);
      } else if (pool.length === 1 && !incomplete) {
        showToast("Dit is nu het enige gerecht dat volledig met je voorraad te maken is — voeg meer voorraad toe voor meer variatie.");
      }
    }

    setLastPickId(pick.id);
    onOpen(pick.id);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={surpriseMe}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: `linear-gradient(135deg, ${C.mustard}, ${C.mustardDeep})`, color: "#fff", border: "none",
          borderRadius: 14, padding: "11px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 10,
        }}
      >
        <Shuffle size={16} /> Verras me! (kijkt naar je voorraad)
      </button>

      {seasonal.length > 0 && (
        <div style={{ background: C.successBg, border: `1.5px solid ${C.sage}`, borderRadius: 16, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>🌱</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.sage }}>Nu in seizoen ({monthName})</span>
          </div>
          <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {seasonal.map(({ recipe, matches }) => (
              <button
                key={recipe.id}
                onClick={() => onOpen(recipe.id)}
                style={{ flexShrink: 0, background: C.cardBg, border: `1px solid ${C.sage}`, borderRadius: 12, padding: "8px 10px", cursor: "pointer", textAlign: "left", minWidth: 130 }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{recipe.emoji || "🍽️"} {recipe.name}</div>
                <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>met {matches.slice(0, 2).join(", ")}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KookboekView({ recipes, allRecipes, cookLog, query, setQuery, favOnly, setFavOnly, maxCookTime, setMaxCookTime, dietOnly, setDietOnly, activeDietTags, bookMode, setBookMode, view, setView, inventory, onOpen, onToggleFav, onNew, onImport, onDuplicate, showToast }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const zoekt = query.trim().length > 0;

  // Tellingen over je hele kookboek, niet over wat er nu gefilterd is.
  // Zodra je zoekt verdwijnen ze: "Kan ik maken 6" naast één resultaat liegt.
  const tellingen = useMemo(() => {
    const eigen = allRecipes || [];
    return {
      alles: eigen.length,
      kan: eigen.filter((r) => recipeReadiness(r, inventory).complete).length,
      favoriet: eigen.filter((r) => r.favorite).length,
      seizoen: getSeasonalRecipeSuggestions(eigen).length,
    };
  }, [allRecipes, inventory]);

  const INGANGEN = [
    { key: "alles", label: "Alles", telling: tellingen.alles },
    { key: "kan", label: "🍳 Kan ik maken", telling: tellingen.kan },
    { key: "favoriet", label: "★ Favoriet", telling: tellingen.favoriet },
    { key: "seizoen", label: "🌱 Seizoen", telling: tellingen.seizoen },
  ];

  const chip = (actief, inhoud, onClick, gedimd) => (
    <button
      key={inhoud}
      onClick={onClick}
      style={{
        flexShrink: 0, borderRadius: 20, padding: "9px 14px", minHeight: 38,
        fontSize: 13, fontWeight: actief ? 700 : 500, cursor: "pointer",
        fontFamily: FONT_BODY, whiteSpace: "nowrap",
        background: actief ? C.blue : C.cardBg,
        color: actief ? "#fff" : (gedimd ? C.inkSoft : C.ink),
        border: `1.5px solid ${actief ? C.blue : C.borderTint}`,
        opacity: gedimd && !actief ? 0.6 : 1,
      }}
    >
      {inhoud}
    </button>
  );

  return (
    <div>
      {/* Zoeken scrolt weg; de ingangen blijven staan, want daar wissel je vaker. */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} color={C.inkSoft} style={{ position: "absolute", left: 10, top: 13 }} />
          <input autoComplete="off"
            style={{ ...inputStyle, paddingLeft: 30 }}
            placeholder="Zoek een gerecht…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{
        position: "sticky", top: 0, zIndex: 20, background: C.paper,
        paddingTop: 4, paddingBottom: 8, marginBottom: 4,
        borderBottom: `1px solid ${C.ceramic}`,
      }}>
        <div className="no-scrollbar" style={{ display: "flex", gap: 7, overflowX: "auto" }}>
          {INGANGEN.map((i) =>
            chip(
              view === i.key && bookMode === "mine",
              zoekt ? i.label : `${i.label} ${i.telling}`,
              () => { setBookMode("mine"); setView(i.key); },
              i.telling === 0
            )
          )}

          <span style={{ flexShrink: 0, width: 1, background: C.ceramicDark, margin: "4px 2px" }} />

          {chip(bookMode === "community", "Community", () => setBookMode("community"))}
          {chip(bookMode === "history", "Historie", () => setBookMode("history"))}

          <button
            onClick={() => setFilterOpen(true)}
            aria-label="Meer filters"
            style={{
              flexShrink: 0, borderRadius: 20, padding: "9px 12px", minHeight: 38, cursor: "pointer",
              background: (dietOnly || maxCookTime) ? C.sage : C.cardBg,
              border: `1.5px solid ${(dietOnly || maxCookTime) ? C.sage : C.borderTint}`,
              display: "flex", alignItems: "center",
            }}
          >
            <SlidersHorizontal size={15} color={(dietOnly || maxCookTime) ? "#fff" : C.ink} />
          </button>
        </div>
      </div>

      {filterOpen && (
        <Modal title="Filteren" onClose={() => setFilterOpen(false)}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Kooktijd</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {[["Alles", null], ["Tot 20 min", 20], ["Tot 45 min", 45]].map(([label, val]) => (
              <button
                key={label}
                onClick={() => setMaxCookTime(val)}
                style={{
                  padding: "8px 12px", minHeight: 34, borderRadius: 20, fontSize: 12.5, cursor: "pointer",
                  fontFamily: FONT_BODY,
                  background: maxCookTime === val ? C.blue : C.cardBg,
                  color: maxCookTime === val ? "#fff" : C.ink,
                  border: `1.5px solid ${maxCookTime === val ? C.blue : C.borderTint}`,
                }}
              >{label}</button>
            ))}
          </div>

          {activeDietTags && activeDietTags.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Dieetwensen</div>
              <button
                onClick={() => setDietOnly((v) => !v)}
                style={{
                  width: "100%", textAlign: "left", padding: "11px 13px", borderRadius: 14, cursor: "pointer",
                  fontFamily: FONT_BODY, fontSize: 13, marginBottom: 16,
                  background: dietOnly ? C.sage : C.cardBg,
                  color: dietOnly ? "#fff" : C.ink,
                  border: `1.5px solid ${dietOnly ? C.sage : C.borderTint}`,
                }}
              >
                Alleen wat past bij {activeDietTags.join(", ")}
              </button>
            </>
          )}

          <PrimaryButton full onClick={() => setFilterOpen(false)}>Klaar</PrimaryButton>
        </Modal>
      )}

      {bookMode === "history" ? (
        <CookHistoryList cookLog={cookLog} onOpen={onOpen} />
      ) : (
        <>
      {view === "kan" && bookMode === "mine" && (() => {
        const compleet = recipes.filter((r) => recipeReadiness(r, inventory).complete);
        return compleet.length === 0 && recipes.length > 0 ? (
          <div style={{ background: C.noteBg, border: `1px solid ${C.mustard}`, borderRadius: 14, padding: "10px 12px", marginBottom: 12, fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>
            Op dit moment is niets helemaal compleet. Deze komen het dichtst in de buurt.
          </div>
        ) : null;
      })()}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {recipes.map((r, idx) => {
          const readiness = recipeReadiness(r, inventory);
          // Grens tussen compleet en bijna compleet: alleen in de ingang "kan",
          // waar de lijst op ontbrekende ingrediënten gesorteerd staat.
          const vorige = idx > 0 ? recipes[idx - 1] : null;
          const toonScheiding = view === "kan" && bookMode === "mine" && idx > 0
            && !readiness.complete && vorige && recipeReadiness(vorige, inventory).complete;
          return (
            <React.Fragment key={r.id}>
            {toonScheiding && (
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 9, margin: "6px 0 2px" }}>
                <span style={{ height: 1, background: C.ceramicDark, flex: 1 }} />
                <span style={{ fontSize: 12, color: C.inkSoft }}>Bijna compleet</span>
                <span style={{ height: 1, background: C.ceramicDark, flex: 1 }} />
              </div>
            )}
            <div
              onClick={() => onOpen(r.id)}
              style={{ background: C.cardBg, borderRadius: 16, padding: 8, cursor: "pointer", border: `1.5px solid ${C.borderTint}`, position: "relative" }}
            >
              <div style={{ position: "absolute", top: 5, left: 5, width: 6, height: 6, borderRadius: 2, background: C.blue, opacity: 0.18, transform: "rotate(45deg)" }} />
              <div style={{ position: "absolute", bottom: 5, right: 5, width: 6, height: 6, borderRadius: 2, background: C.blue, opacity: 0.18, transform: "rotate(45deg)" }} />
              <TileThumb recipe={r} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, color: C.ink, lineHeight: 1.25,
                  // Afkappen na twee regels: een lange naam maakte de tegel
                  // hoger dan zijn buurman en trok het raster scheef.
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  overflow: "hidden", wordBreak: "break-word",
                }}>{r.name}</span>
                {bookMode === "mine" && (
                  <button onClick={(e) => { e.stopPropagation(); onToggleFav(r.id); }} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 0, marginLeft: 4 }}>
                    <Star size={16} fill={r.favorite ? C.mustard : "none"} color={r.favorite ? C.mustard : C.ceramicDark} />
                  </button>
                )}
              </div>
              {/* Eén regel in plaats van drie blokken. Mist er precies één ding,
                  dan noemen we het bij naam — dan kun je meteen beslissen. */}
              <div style={{ marginTop: 4, fontSize: 12, color: readiness.complete ? C.sage : C.inkSoft, lineHeight: 1.35 }}>
                {r.cookTime}m
                {readiness.relevant > 0 && (
                  readiness.complete
                    ? " · compleet"
                    : readiness.missing.length === 0
                      ? " · voorraad onzeker"
                      : readiness.missing.length === 1
                        ? ` · nog ${readiness.missing[0].toLowerCase()}`
                        : ` · nog ${readiness.missing.length} nodig`
                )}
              </div>
              {r.community && bookMode === "mine" && (
                <div style={{ marginTop: 5 }}><Pill tone="auto"><Users size={10} /> Gedeeld</Pill></div>
              )}
              {bookMode === "community" && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(r.id); }}
                  style={{ marginTop: 8, width: "100%", padding: "6px 8px", borderRadius: 10, border: "none", background: C.mustard, color: "#2A1F06", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  <Plus size={12} /> Voeg toe
                </button>
              )}
            </div>
            </React.Fragment>
          );
        })}
      </div>

      {recipes.length === 0 && bookMode === "community" && (
        <div style={{ textAlign: "center", padding: "40px 10px", color: C.inkSoft, fontSize: 13 }}>
          <Users size={26} color={C.ceramicDark} style={{ marginBottom: 8 }} />
          <p>Nog geen gedeelde recepten. Open een recept in je eigen kookboek en tik op het community-icoon om als eerste iets te delen.</p>
        </div>
      )}
      {recipes.length === 0 && bookMode === "mine" && (
        <div style={{ textAlign: "center", padding: "36px 14px", color: C.inkSoft, fontSize: 13, lineHeight: 1.55 }}>
          {/* Per ingang een eigen lege staat: een blanco scherm vertelt je niet
              wat je nu zou kunnen doen. */}
          {zoekt ? (
            <>Geen gerecht gevonden voor “{query}”.</>
          ) : view === "favoriet" ? (
            <>Nog geen favorieten. Tik op de ster bij een recept om het hier te bewaren.</>
          ) : view === "seizoen" ? (
            <>Geen van je recepten gebruikt typische producten van deze maand.</>
          ) : view === "kan" ? (
            <>Je kunt op dit moment niets volledig maken. Vul je voorraad aan, of kijk bij “Alles” wat er dichtbij komt.</>
          ) : (
            <>Je kookboek is nog leeg. Tik op de plusknop om je eerste recept toe te voegen.</>
          )}
        </div>
      )}

      {/* Zweeft boven de tabbladen, met ruimte voor de thuisbalk. In Community
          verborgen: daar voeg je niets toe aan andermans boek. */}
      {bookMode === "mine" && (
        <button
          onClick={onNew}
          aria-label="Nieuw recept toevoegen"
          style={{
            position: "fixed", right: 16, zIndex: 60,
            bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
            width: 56, height: 56, borderRadius: 28, border: "none",
            background: C.blue, color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(21,44,72,0.28)",
          }}
        >
          <Plus size={26} />
        </button>
      )}

        </>
      )}
    </div>
  );
}

function CookHistoryList({ cookLog, onOpen }) {
  const counts = useMemo(() => {
    const map = {};
    cookLog.forEach((e) => { map[e.recipeId] = (map[e.recipeId] || 0) + 1; });
    return map;
  }, [cookLog]);

  if (!cookLog.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px 10px", color: C.inkSoft, fontSize: 13 }}>
        <Clock size={26} color={C.ceramicDark} style={{ marginBottom: 8 }} />
        <p>Nog geen kookgeschiedenis. Zodra je "Ik heb dit gekookt" gebruikt, verschijnt het hier.</p>
      </div>
    );
  }

  return (
    <div style={{ background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }}>
      {cookLog.map((entry, idx) => (
        <div
          key={entry.id}
          onClick={() => onOpen(entry.recipeId)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: idx < cookLog.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{entry.emoji || "🍽️"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.ink }}>
              {entry.leftover ? "🍱 " : ""}{entry.recipeName}
            </div>
            <div style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }}>
              {new Date(entry.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
              {entry.leftover ? " · als kliekje" : ` · ${entry.servings} pers.`}
              {!entry.leftover && counts[entry.recipeId] > 1 && ` · ${counts[entry.recipeId]}x gemaakt`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SousChefModal({ recipe, onAsk, onClose }) {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setThread((t) => [...t, { role: "user", text: q }]);
    setQuestion("");
    setAsking(true);
    setError("");
    try {
      const answer = await onAsk(recipe, q);
      setThread((t) => [...t, { role: "chef", text: answer.trim() || "Hmm, daar heb ik geen goed antwoord op — probeer het anders te vragen." }]);
    } catch (e) {
      setError("Kon de souschef niet bereiken. Controleer je verbinding en probeer het opnieuw.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <Modal title="AI-souschef" onClose={onClose} wide>
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
        Stel een vraag over dit recept — bijv. een vervanging voor een ingrediënt dat je niet hebt.
      </p>

      {thread.length > 0 && (
        <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 12 }}>
          {thread.map((msg, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div style={{
                maxWidth: "85%", padding: "9px 12px", borderRadius: 14,
                background: msg.role === "user" ? C.blue : C.cardBg,
                color: msg.role === "user" ? "#fff" : C.ink,
                border: msg.role === "user" ? "none" : `1.5px solid ${C.borderTint}`,
                fontSize: 13, lineHeight: 1.4,
              }}>
                {msg.role === "chef" && <span style={{ marginRight: 5 }}>👨‍🍳</span>}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {asking && (
        <div style={{ marginBottom: 10 }}>
          <PollepelLoader tekst="Souschef denkt na…" size={22} inline />
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: C.brick, marginTop: -4, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: "flex", gap: 8 }}>
        <input autoComplete="off"
          style={inputStyle}
          placeholder="Bijv. Kan ik room vervangen door melk?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <PrimaryButton onClick={submit} disabled={!question.trim() || asking}><Sparkles size={16} /></PrimaryButton>
      </div>
    </Modal>
  );
}

// Vingerafdruk van de ingrediënten; identiek aan die in dataAPI.nutrition,
// zodat we kunnen zien of een berekening nog bij het recept past.
function nutritionFingerprint(recipe) {
  return (recipe.ingredients || [])
    .map((i) => `${(i.name || "").toLowerCase()}|${i.amount}|${i.unit}`)
    .join("~") + `#${recipe.servings || 1}`;
}

function NutritionLabel({ recipe, isMine, onRecalculate, busy }) {
  const [showDetails, setShowDetails] = useState(false);
  const n = recipe.nutrition;

  if (!n) {
    return (
      <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 16, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: isMine ? 8 : 0 }}>Voedingswaarden nog niet berekend.</div>
        {isMine && (
          <GhostButton onClick={onRecalculate} disabled={busy} full>
            {busy && <PollepelLoader size={16} inline delay={0} />}
            {busy ? "Bezig met berekenen…" : "Bereken voedingswaarden"}
          </GhostButton>
        )}
      </div>
    );
  }

  // Per portie is per portie: deze waarden veranderen niet mee met de personen-teller.
  const stale = n.fingerprint && n.fingerprint !== nutritionFingerprint(recipe);
  const r1 = (v) => Math.round((v || 0) * 10) / 10;
  const rows = [
    ["Energie", `${Math.round(n.kcal || 0)} kcal`],
    ["Eiwitten", `${r1(n.proteinG)} g`],
    ["Koolhydraten", `${r1(n.carbsG)} g`, `waarvan suikers ${r1(n.sugarsG)} g`],
    ["Vezels", `${r1(n.fiberG)} g`],
    ["Vet", `${r1(n.fatG)} g`, `waarvan verzadigd ${r1(n.saturatedFatG)} g`],
    ["Zout", `${r1(n.saltG)} g`],
  ];

  return (
    <div style={{ background: C.cardBg, border: `1.5px solid ${stale ? C.brick : C.borderTint}`, borderRadius: 16, padding: 14, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 14, margin: 0 }}>Voedingswaarden per portie</h3>
        {isMine && (
          <button onClick={onRecalculate} disabled={busy} style={{ background: "none", border: "none", cursor: busy ? "default" : "pointer", color: C.blue, fontSize: 12, fontWeight: 600, padding: 0, flexShrink: 0 }}>
            {busy ? "Bezig…" : "Opnieuw berekenen"}
          </button>
        )}
      </div>

      {stale && (
        <div style={{ background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 10, padding: "7px 9px", marginBottom: 8, fontSize: 12, color: C.brick }}>
          ⚠️ Het recept is gewijzigd na deze berekening — de waarden kloppen mogelijk niet meer.
        </div>
      )}

      {rows.map(([label, value, sub], idx) => (
        <div key={idx} style={{ padding: "5px 0", borderBottom: idx < rows.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>{label}</span>
            <span style={{ fontFamily: FONT_MONO, color: C.ink, fontWeight: 600 }}>{value}</span>
          </div>
          {sub && <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 1 }}>{sub}</div>}
        </div>
      ))}

      {n.unmatched && n.unmatched.length > 0 && (
        <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 8 }}>
          {typeof n.coverage === "number" && n.coverage < 70
            ? `⚠️ Ruwe schatting — een groot deel van het recept kon niet worden herkend (${n.coverage}% van het gewicht meegerekend). Niet meegeteld: ${n.unmatched.join(", ")}`
            : `Gedeeltelijke schatting — niet meegerekend: ${n.unmatched.join(", ")}`}
        </div>
      )}

      {n.matched && n.matched.length > 0 && (
        <>
          <button
            onClick={() => setShowDetails((v) => !v)}
            style={{ background: "none", border: "none", padding: 0, marginTop: 8, cursor: "pointer", color: C.blue, fontSize: 12, fontWeight: 600 }}
          >
            {showDetails ? "Verberg" : "Toon"} welke producten zijn gebruikt
          </button>
          {showDetails && (
            <div style={{ marginTop: 6, borderTop: `1px solid ${C.ceramic}`, paddingTop: 6 }}>
              {n.matched.map((m, idx) => (
                <div key={idx} style={{ fontSize: 11, color: C.inkSoft, padding: "2px 0" }}>
                  <strong style={{ color: C.ink }}>{m.ingredient}</strong> ({m.grams} g) → {m.nevo}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 8, lineHeight: 1.4 }}>
        Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven.
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, isMine = true, onBack, onToggleFav, onToggleCommunity, onEdit, onDelete, onCook, onDuplicate, onAddLeftover, onAddFreezerPortion, onAskSousChef, isPremiumOn, inventory, showToast, dislikeWarnings, doublePortionDefault, onAddMissingToShopping, onStartCooking, onKoppel, leftoverItem, onEatLeftover, cookLog = [], toonBakjesTip, onBakjesTipGezien, onRecalculateNutrition, nutritionBusy }) {
  const [confirmCook, setConfirmCook] = useState(false);
  const [usedAmounts, setUsedAmounts] = useState({}); // werkelijk gebruikte hoeveelheden bij tekort
  const [leftoverPortions, setLeftoverPortions] = useState(0);
  const [bewaarplek, setBewaarplek] = useState("koelkast");
  const [eatPortions, setEatPortions] = useState(1);
  const [gekozenBakjes, setGekozenBakjes] = useState([]);

  const vandaagGekookt = !!(cookLog || []).some((e) =>
    e.recipeId === recipe.id && String(e.date).slice(0, 10) === new Date().toISOString().slice(0, 10)
  );
  const [wantDoublePortion, setWantDoublePortion] = useState(!!doublePortionDefault);

  useEffect(() => { setWantDoublePortion(!!doublePortionDefault); }, [doublePortionDefault, recipe?.id]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [servings, setServings] = useState(recipe.servings);
  const [keepAwake, setKeepAwake] = useState(false); // wat de gebruiker wil, los van of de lock nu actief is
  const [sousChefOpen, setSousChefOpen] = useState(false);
  const [timers, setTimers] = useState([]); // [{ id, label, endTime, notified }]
  const [timerTick, setTimerTick] = useState(0);
  const audioCtxRef = React.useRef(null);

  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const Ctx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (Ctx) { try { audioCtxRef.current = new Ctx(); } catch (e) { /* niet beschikbaar */ } }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  const playTimerSound = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      [0, 0.32, 0.64].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch (e) { console.error("Timer-geluid afspelen mislukt:", e); }
  };

  const startTimer = (minutes, label) => {
    if (!minutes || minutes <= 0) return;
    ensureAudioContext(); // moet binnen een gebruikersactie gebeuren, vandaar hier
    setTimers((prev) => [...prev, { id: uid(), label: label || `${minutes} min`, endTime: Date.now() + minutes * 60000, notified: false }]);
  };

  const cancelTimer = (id) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!timers.length) return;
    const iv = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [timers.length]);

  useEffect(() => {
    timers.forEach((t) => {
      const remaining = Math.max(0, Math.round((t.endTime - Date.now()) / 1000));
      if (remaining <= 0 && !t.notified) {
        playTimerSound();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimers((prev) => prev.map((x) => (x.id === t.id ? { ...x, notified: true } : x)));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerTick]);

  const handleVoiceTimer = (text) => {
    const minutes = parseSpokenDurationMinutes(text);
    if (minutes) startTimer(minutes, text);
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const wakeLockRef = React.useRef(null);
  const keepAwakeRef = React.useRef(false); // spiegel van keepAwake, leesbaar vanuit listeners
  const wakeLockSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  const acquireWakeLock = async () => {
    if (!wakeLockSupported) return false;
    try {
      const lock = await navigator.wakeLock.request("screen");
      wakeLockRef.current = lock;
      // Het systeem geeft de lock zelf vrij bij wisselen van app. We onthouden
      // alleen dát hij weg is; de wens van de gebruiker blijft staan.
      lock.addEventListener("release", () => { wakeLockRef.current = null; });
      return true;
    } catch (e) {
      console.error("Wake Lock-aanvraag mislukt:", e.name, e.message);
      return false;
    }
  };

  const releaseWakeLock = async () => {
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (lock) { try { await lock.release(); } catch (e) { /* al vrijgegeven */ } }
  };

  const toggleScreenAwake = async () => {
    if (keepAwakeRef.current) {
      keepAwakeRef.current = false;
      setKeepAwake(false);
      await releaseWakeLock();
      return;
    }
    const ok = await acquireWakeLock();
    if (ok) {
      keepAwakeRef.current = true;
      setKeepAwake(true);
    } else if (showToast) {
      showToast("Het scherm kon niet aan worden gehouden. Dit kan gebeuren bij een lage batterij of in de energiebesparingsmodus.");
    }
  };

  // Alleen opruimen bij het verlaten van dit scherm — niet bij elke wijziging
  // van de schakelaar, want dan zet de knop zichzelf meteen weer uit.
  useEffect(() => {
    const handleVisibility = () => {
      if (keepAwakeRef.current && document.visibilityState === "visible" && !wakeLockRef.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      keepAwakeRef.current = false;
      releaseWakeLock();
    };
  }, []);

  // Vangnet: een recept met 0 personen (bijv. door een import) zou hier
  // een deling door nul geven en alle hoeveelheden op NaN zetten.
  const scale = servings / (recipe.servings || 1);

  // Voorraaditems waarvan je minder in huis hebt dan het recept vraagt.
  // Hiermee vragen we achteraf wat je werkelijk gebruikt hebt, in plaats van
  // de voorraad stilletjes naar nul af te ronden.
  const shortfallItems = (recipe.ingredients || []).map((ing) => {
    const item = findInventoryMatch(inventory || [], ing);
    if (!item) return null;
    const cmp = stockVsNeed(item, ing, scale);
    if (!cmp || cmp.have >= cmp.need) return null;
    return { item, ing, have: cmp.have, need: cmp.need, unit: cmp.unit };
  }).filter(Boolean);

  const startCook = () => {
    if (shortfallItems.length) {
      const defaults = {};
      shortfallItems.forEach((s) => { defaults[s.item.id] = s.have; });
      setUsedAmounts(defaults);
      setConfirmCook("shortfall");
    } else {
      setConfirmCook(true);
    }
  };

  const finishCook = (overrides) => {
    onCook(wantDoublePortion ? scale * 2 : scale, overrides || {});
    if (wantDoublePortion) { onAddFreezerPortion(recipe); setConfirmCook(false); }
    else setConfirmCook("leftover");
  };

  const scaledIngredients = recipe.ingredients.map((ing) => ({ ...ing, scaledAmount: round2(ing.amount * scale) }));

  const readiness = recipeReadiness(recipe, inventory, scale);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 4, color: C.blue, cursor: "pointer", padding: 0, fontWeight: 600, fontSize: 13 }}>
          <ChevronLeft size={16} /> Terug
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {isMine && isPremiumOn && isPremiumOn("sousChef") && (
            <button
              onClick={() => setSousChefOpen(true)}
              title="Vraag de AI-souschef"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", minHeight: 34, borderRadius: 20, cursor: "pointer", border: `1.5px solid ${C.borderTint}`, background: C.cardBg, color: C.inkSoft }}
            >
              <span style={{ fontSize: 13 }}>👨‍🍳</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Souschef</span>
            </button>
          )}
          {wakeLockSupported && (
            <button
              onClick={toggleScreenAwake}
              title={keepAwake ? "Het scherm blijft aan tijdens het koken" : "Voorkom dat het scherm uitvalt tijdens het koken"}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", minHeight: 34, borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${keepAwake ? C.mustard : C.borderTint}`,
                background: keepAwake ? C.mustard : C.cardBg, color: keepAwake ? "#fff" : C.inkSoft,
              }}
            >
              <Sun size={13} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{keepAwake ? "Scherm blijft aan" : "Scherm aan houden"}</span>
            </button>
          )}
        </div>
      </div>

      {!isMine && (
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, padding: "8px 10px", marginBottom: 10, fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={13} color={C.blue} /> Gedeeld door een ander huishouden — bekijk, of dupliceer naar je eigen kookboek om aan te passen.
        </div>
      )}

      <TileThumb recipe={recipe} size="large" />


      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.ink, margin: 0 }}>{recipe.name}</h1>
        {isMine && (
        <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 8 }}>
          <button aria-label="Recept delen met andere huishoudens" onClick={onToggleCommunity} title={recipe.community ? "Niet meer delen" : "Delen met community"} style={{ padding: 8, margin: -8, background: "none", border: "none", cursor: "pointer" }}>
            <Users size={20} fill={recipe.community ? C.blue : "none"} color={recipe.community ? C.blue : C.ceramicDark} />
          </button>
          <button aria-label="Markeren als favoriet" onClick={onToggleFav} style={{ padding: 8, margin: -8, background: "none", border: "none", cursor: "pointer" }}>
            <Star size={22} fill={recipe.favorite ? C.mustard : "none"} color={recipe.favorite ? C.mustard : C.ceramicDark} />
          </button>
        </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <Pill><Clock size={11} /> {recipe.cookTime} min</Pill>
        {recipe.community && <Pill tone="auto"><Users size={10} /> Gedeeld met community</Pill>}
        {readiness.relevant > 0 && (
          readiness.complete
            ? <Pill tone="ok"><Check size={10} /> Alles in huis</Pill>
            : <Pill tone="warn">Nog {readiness.missing.length} nodig</Pill>
        )}
      </div>

      {readiness.missing.length > 0 && (
        <div style={{ background: C.warnBg, border: `1px solid ${C.mustardDeep}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
            Hiervoor heb je nog nodig:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {readiness.missing.map((naam) => (
              <button
                key={naam}
                onClick={() => onKoppel && onKoppel(naam)}
                title="Staat dit wél in je voorraad? Koppel het."
                style={{
                  background: C.cardBg, border: `1px dashed ${C.mustardDeep}`, borderRadius: 10,
                  padding: "8px 11px", minHeight: 34, fontSize: 13, color: C.ink, cursor: onKoppel ? "pointer" : "default",
                  fontFamily: FONT_BODY,
                }}
              >
                {naam}
              </button>
            ))}
          </div>
          {onKoppel && (
            <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6 }}>
              Heb je het toch in huis onder een andere naam? Tik erop om het te koppelen.
            </div>
          )}
          <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 6, marginBottom: 8 }}>
            Voor {servings} {servings === 1 ? "persoon" : "personen"}. Basis zoals zout, peper en olie is niet meegerekend.
            {readiness.estimated && readiness.estimated.length > 0 && (
              <> Bij {readiness.estimated.join(", ")} is gerekend met een gemiddeld gewicht per stuk.</>
            )}
          </div>
          {onAddMissingToShopping && (
            <button
              onClick={() => onAddMissingToShopping(scale)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: C.mustard, color: "#2A1F06", border: "none", borderRadius: 12,
                padding: "9px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY,
              }}
            >
              <ShoppingCart size={15} /> Zet op de boodschappenlijst
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: "8px 12px", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: C.ink, display: "flex", alignItems: "center", gap: 6 }}><Users size={15} color={C.inkSoft} /> Aantal personen</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setServings((s) => Math.max(1, s - 1))} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 15, minWidth: 18, textAlign: "center" }}>{servings}</span>
          <button onClick={() => setServings((s) => s + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
        </div>
      </div>

      {dislikeWarnings && dislikeWarnings.length > 0 && (
        <div style={{ background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 14, padding: 12, marginBottom: 14 }}>
          {dislikeWarnings.map((w, idx) => (
            <div key={idx} style={{ fontSize: 13, color: C.brick, marginBottom: idx < dislikeWarnings.length - 1 ? 4 : 0 }}>
              ⚠️ Bevat <strong>{w.ingredient}</strong> — {w.people.join(" en ")} {w.people.length > 1 ? "lusten" : "lust"} dit niet
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, margin: "0 0 8px" }}>Ingrediënten</h3>
      <div style={{ background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }}>
        {scaledIngredients.map((ing, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderBottom: idx < scaledIngredients.length - 1 ? `1px solid ${C.ceramic}` : "none", fontSize: 14 }}>
            <span>{ing.name}</span>
            <span style={{ fontFamily: FONT_MONO, color: C.inkSoft }}>{ing.scaledAmount} {ing.unit}</span>
          </div>
        ))}
      </div>

      <NutritionLabel recipe={recipe} isMine={isMine} onRecalculate={onRecalculateNutrition} busy={nutritionBusy} />

      <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
        Bereiding
        <VoiceInputButton onResult={handleVoiceTimer} title="Zeg bijv. 'zet een timer van 10 minuten'" size={13} />
      </h3>

      {timers.length > 0 && (
        <div style={{ position: "sticky", top: 8, zIndex: 5, marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {timers.map((t) => {
            const remaining = Math.max(0, Math.round((t.endTime - Date.now()) / 1000));
            const done = remaining <= 0;
            return (
              <div key={t.id} style={{
                background: done ? C.brick : C.blueDeep, color: "#fff",
                borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <TimerIcon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700 }}>
                    {done ? "Klaar!" : formatTimer(remaining)}
                  </span>
                  <button onClick={() => cancelTimer(t.id)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 4, cursor: "pointer", display: "flex" }}>
                    <X size={14} color="#fff" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ol style={{ padding: 0, margin: "0 0 18px", listStyle: "none" }}>
        {recipe.steps.map((s, idx) => {
          const minutes = parseSpokenDurationMinutes(s);
          return (
            <li key={idx} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14, color: C.ink, lineHeight: 1.4 }}>
              <span style={{ fontFamily: FONT_MONO, color: C.mustardDeep, fontWeight: 600, flexShrink: 0 }}>{String(idx + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1 }}>{s}</span>
              {minutes && (
                <button
                  onClick={() => startTimer(minutes, `Stap ${idx + 1}: ${minutes} min`)}
                  title={`Start timer van ${minutes} minuten`}
                  style={{ flexShrink: 0, background: C.ceramic, border: "none", borderRadius: 8, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, height: 22 }}
                >
                  <TimerIcon size={12} color={C.blueDeep} />
                  <span style={{ fontSize: 11, color: C.blueDeep, fontFamily: FONT_MONO }}>{minutes}m</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {recipe.notes && (
        <div style={{ background: C.noteBg, border: `1px solid ${C.mustard}`, borderRadius: 14, padding: 12, marginBottom: 16, display: "flex", gap: 8 }}>
          <StickyNote size={16} color={C.mustardDeep} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.mustardDeep, marginBottom: 2 }}>Jouw notitie</div>
            <div style={{ fontSize: 13, color: C.ink, whiteSpace: "pre-wrap" }}>{recipe.notes}</div>
          </div>
        </div>
      )}

      {/* Op een kliekje-avond kook je niet, je warmt op. De ingrediënten zijn al
          opgemaakt toen je het maakte; alleen het restje gaat van de voorraad af. */}
      {isMine && leftoverItem && confirmCook === false && (
        <div style={{ background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🍱</span>
            <span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.ink }}>
                Dit staat als kliekje gepland
              </span>
              <span style={{ display: "block", fontSize: 12, color: C.inkSoft }}>
                {leftoverItem.name} · {leftoverItem.current} {leftoverItem.current === 1 ? "portie" : "porties"} over
              </span>
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: C.inkSoft, margin: "0 0 10px", lineHeight: 1.45 }}>
            Je hoeft niets af te boeken van je voorraad — dat is al gebeurd toen je dit kookte.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 11 }}>
            <button
              aria-label="Minder porties"
              onClick={() => setEatPortions((p) => Math.max(1, p - 1))}
              style={{ width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }}
            ><Minus size={14} /></button>
            <span style={{ fontFamily: FONT_MONO, fontSize: 15, minWidth: 92, textAlign: "center" }}>
              {eatPortions} {eatPortions === 1 ? "portie" : "porties"}
            </span>
            <button
              aria-label="Meer porties"
              onClick={() => setEatPortions((p) => Math.min(Number(leftoverItem.current) || 1, p + 1))}
              style={{ width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }}
            ><Plus size={14} /></button>
          </div>
          {/* Je pakt het bakje dat vooraan staat, niet het bakje dat de app
              het handigst vindt. Dus kies je zelf. */}
          {(leftoverItem.containers || []).length > 0 && (
            <div style={{ marginBottom: 11 }}>
              <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>
                {leftoverItem.containers.length === 1
                  ? `Pak bakje ${leftoverItem.containers[0]}.`
                  : "Welk bakje heb je gepakt?"}
              </div>
              {leftoverItem.containers.length > 1 && (
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {[...leftoverItem.containers].sort((a, b) => a - b).map((n) => {
                    const aan = gekozenBakjes.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => setGekozenBakjes(aan
                          ? gekozenBakjes.filter((x) => x !== n)
                          : [...gekozenBakjes, n])}
                        style={{
                          minWidth: 48, minHeight: 44, borderRadius: 12, cursor: "pointer",
                          fontFamily: FONT_MONO, fontSize: 16, fontWeight: 600,
                          background: aan ? C.blue : C.cardBg,
                          color: aan ? "#fff" : C.ink,
                          border: `1.5px solid ${aan ? C.blue : C.borderTint}`,
                        }}
                      >{n}</button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <PrimaryButton
            tone="sage"
            full
            onClick={() => onEatLeftover(
              (leftoverItem.containers || []).length > 1 && gekozenBakjes.length
                ? gekozenBakjes.length
                : eatPortions,
              gekozenBakjes.length ? gekozenBakjes : null
            )}
          >
            <Check size={16} /> Opgegeten
          </PrimaryButton>
        </div>
      )}

      {isMine && !leftoverItem && confirmCook === false && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Al gekookt vandaag? Dan zeggen we dat, in plaats van te blijven
              vragen of je het gaat maken. Nogmaals koken kan gewoon. */}
          {vandaagGekookt && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, background: C.cardBg,
              border: `1.5px solid ${C.sage}`, borderRadius: 14, padding: "10px 12px",
            }}>
              <Check size={16} color={C.sage} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.ink }}>
                Je hebt dit vandaag al gekookt. De voorraad is bijgewerkt.
              </span>
            </div>
          )}
          <GhostButton full onClick={() => setConfirmCook("prep")}>
            <ShoppingCart size={15} /> Ik ga dit koken — check mijn voorraad
          </GhostButton>
          <PrimaryButton tone="sage" full onClick={startCook}>
            <Flame size={16} /> {vandaagGekookt ? "Nog een keer gekookt" : "Ik heb dit gekookt"}
          </PrimaryButton>
        </div>
      )}

      {isMine && confirmCook === "prep" && (
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }}>
          {recipe.cookTime > 0 && (
            <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 8px" }}>
              <Clock size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
              Begin je nu, dan sta je rond{" "}
              <strong style={{ color: C.ink }}>
                {new Date(Date.now() + Number(recipe.cookTime) * 60000)
                  .toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
              </strong>{" "}
              aan tafel. Je huisgenoten zien dat ook.
            </p>
          )}
          {readiness.missing.length === 0 ? (
            <p style={{ fontSize: 13, margin: "0 0 10px", color: C.ink }}>
              <Check size={14} color={C.sage} style={{ verticalAlign: -2, marginRight: 4 }} />
              Je hebt alles in huis voor {servings} {servings === 1 ? "persoon" : "personen"}. Veel kookplezier.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13, margin: "0 0 6px", color: C.ink }}>
                Voor {servings} {servings === 1 ? "persoon" : "personen"} mis je nog:
              </p>
              <div style={{ fontSize: 13, color: C.brick, marginBottom: 10, lineHeight: 1.5 }}>
                {readiness.missing.join(" · ")}
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {readiness.missing.length > 0 && onAddMissingToShopping && (
              <PrimaryButton onClick={() => { onAddMissingToShopping(scale); setConfirmCook(false); }}>
                <ShoppingCart size={15} /> Op de lijst
              </PrimaryButton>
            )}
            {onStartCooking && (
              <PrimaryButton tone="sage" onClick={() => { onStartCooking(servings); setConfirmCook(false); }}>
                <Flame size={15} /> Ik begin
              </PrimaryButton>
            )}
            <GhostButton onClick={() => setConfirmCook(false)}>Sluiten</GhostButton>
          </div>
        </div>
      )}

      {isMine && confirmCook === "shortfall" && (
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }}>
          <p style={{ fontSize: 13, margin: "0 0 4px", color: C.ink }}>
            Volgens je voorraad had je van een paar dingen te weinig.
          </p>
          <p style={{ fontSize: 12, margin: "0 0 10px", color: C.inkSoft }}>
            Hoeveel heb je er werkelijk van gebruikt? Zo blijft je voorraad kloppen.
          </p>
          {shortfallItems.map((s) => (
            <div key={s.item.id} style={{ borderTop: `1px solid ${C.ceramic}`, padding: "8px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: C.ink, fontWeight: 600 }}>{s.item.name}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.inkSoft }}>
                  recept {round2(s.need)} · in huis {round2(s.have)} {s.unit}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  autoComplete="off"
                  type="number"
                  style={{ ...inputStyle, width: 100 }}
                  value={usedAmounts[s.item.id] != null ? usedAmounts[s.item.id] : s.have}
                  onChange={(e) => setUsedAmounts({ ...usedAmounts, [s.item.id]: e.target.value })}
                />
                <span style={{ fontSize: 12, color: C.inkSoft }}>{s.unit} gebruikt</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <PrimaryButton tone="sage" onClick={() => {
              const overrides = {};
              Object.keys(usedAmounts).forEach((k) => { overrides[k] = Number(usedAmounts[k]) || 0; });
              finishCook(overrides);
            }}>Klopt, bijwerken</PrimaryButton>
            <GhostButton onClick={() => setConfirmCook(false)}>Annuleren</GhostButton>
          </div>
        </div>
      )}
      {isMine && confirmCook === true && (
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.sage}`, borderRadius: 14, padding: 12 }}>
          <p style={{ fontSize: 13, margin: "0 0 10px", color: C.ink }}>
            Dit haalt de gebruikte ingrediënten van je voorraad af (voor {servings} {servings === 1 ? "persoon" : "personen"}). Zakt iets daardoor onder je ingestelde minimum, dan zetten we dat apart op de boodschappenlijst. Doorgaan?
          </p>
          <button
            onClick={() => setWantDoublePortion((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", marginBottom: 10,
              background: wantDoublePortion ? C.successBg : C.cardBg, border: `1.5px solid ${wantDoublePortion ? C.sage : C.borderTint}`, borderRadius: 12, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 15 }}>❄️</span>
            <span style={{ fontSize: 13, color: wantDoublePortion ? C.sage : C.inkSoft, fontWeight: wantDoublePortion ? 600 : 400 }}>
              Dubbele portie koken (extra gaat de vriezer in)
            </span>
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton tone="sage" onClick={() => finishCook({})}>Ja, bijwerken</PrimaryButton>
            <GhostButton onClick={() => setConfirmCook(false)}>Annuleren</GhostButton>
          </div>
        </div>
      )}

      {isMine && confirmCook === "leftover" && (
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }}>
          <p style={{ fontSize: 13, margin: "0 0 10px", color: C.ink }}>Is er iets van dit gerecht overgebleven?</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 10 }}>
            <button onClick={() => setLeftoverPortions((p) => Math.max(0, p - 1))} style={{ width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }}><Minus size={14} /></button>
            <span style={{ fontFamily: FONT_MONO, fontSize: 15, minWidth: 90, textAlign: "center" }}>{leftoverPortions === 0 ? "Niets over" : `${leftoverPortions} portie${leftoverPortions > 1 ? "s" : ""}`}</span>
            <button onClick={() => setLeftoverPortions((p) => p + 1)} style={{ width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }}><Plus size={14} /></button>
          </div>
          {leftoverPortions > 0 && (
            <>
              {/* Waar het heen gaat bepaalt hoe lang het goed blijft. */}
              <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 6 }}>Waar bewaar je het?</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  ["koelkast", "❄️ Koelkast", "eet binnen 3 dagen op"],
                  ["vriezer", "🧊 Vriezer", "houdbaar tot 3 maanden"],
                ].map(([waarde, label, uitleg]) => (
                  <button
                    key={waarde}
                    onClick={() => setBewaarplek(waarde)}
                    style={{
                      flex: 1, padding: "10px 8px", borderRadius: 14, cursor: "pointer",
                      fontFamily: FONT_BODY, textAlign: "center", minHeight: 44,
                      background: bewaarplek === waarde ? C.blue : C.cardBg,
                      color: bewaarplek === waarde ? "#fff" : C.ink,
                      border: `1.5px solid ${bewaarplek === waarde ? C.blue : C.borderTint}`,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>{uitleg}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Eén keer laten weten dat nummeren bestaat. Anders ontdekt niemand het. */}
          {leftoverPortions > 0 && bewaarplek === "vriezer" && toonBakjesTip && (
            <p style={{ fontSize: 11.5, color: C.inkSoft, margin: "0 0 10px", lineHeight: 1.45, background: C.paper, borderRadius: 10, padding: "8px 10px" }}>
              Werk je met genummerde bakjes? Dan zegt Pollepel voortaan welk nummer je moet pakken.
              Aan te zetten in Instellingen.
            </p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton tone="mustard" onClick={() => { if (leftoverPortions > 0) onAddLeftover(recipe, leftoverPortions, bewaarplek); setConfirmCook(false); setLeftoverPortions(0); setBewaarplek("koelkast"); if (toonBakjesTip && onBakjesTipGezien) onBakjesTipGezien(); }}>
              {leftoverPortions > 0 ? "Bewaren" : "Klaar"}
            </PrimaryButton>
            {leftoverPortions > 0 && <GhostButton onClick={() => { setConfirmCook(false); setLeftoverPortions(0); setBewaarplek("koelkast"); }}>Overslaan</GhostButton>}
          </div>
        </div>
      )}

      {!isMine && (
        <PrimaryButton tone="mustard" full onClick={onDuplicate}><Plus size={16} /> Dupliceer naar mijn kookboek</PrimaryButton>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {isMine && !confirmDelete && <div style={{ flex: 1, minWidth: 0 }}><GhostButton full onClick={onEdit}><Pencil size={14} /> Bewerken</GhostButton></div>}
        {isMine && !confirmDelete && <div style={{ flex: 1, minWidth: 0 }}><GhostButton full onClick={onDuplicate}><Plus size={14} /> Dupliceer</GhostButton></div>}
        {isMine && (!confirmDelete ? (
          <div style={{ flex: 1, minWidth: 0 }}><GhostButton full danger onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> Verwijderen</GhostButton></div>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: 0 }}><GhostButton full danger onClick={onDelete}>Zeker weten</GhostButton></div>
            <div style={{ flex: 1, minWidth: 0 }}><GhostButton full onClick={() => setConfirmDelete(false)}>Annuleren</GhostButton></div>
          </>
        ))}
      </div>

      {sousChefOpen && (
        <SousChefModal recipe={recipe} onAsk={onAskSousChef} onClose={() => setSousChefOpen(false)} />
      )}
    </div>
  );
}

function RecipeForm({ initial, inventoryNames, inventoryItems = [], onImport, onCancel, onSave }) {
  const [name, setName] = useState(initial.name || "");
  const [emoji, setEmoji] = useState(initial.emoji || "🍽️");
  const [emojiTouched, setEmojiTouched] = useState(Boolean(initial.id || initial.emoji));
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl || "");
  const [cookTime, setCookTime] = useState(initial.cookTime || 30);
  const [servings, setServings] = useState(initial.servings || 4);
  const [ingredients, setIngredients] = useState(initial.ingredients?.length ? initial.ingredients : [{ name: "", amount: "", unit: "stuks" }]);
  const [steps, setSteps] = useState(initial.steps?.length ? initial.steps : [""]);
  const [notes, setNotes] = useState(initial.notes || "");
  const [diets, setDiets] = useState(initial.diets || []);

  useEffect(() => {
    if (!emojiTouched) setEmoji(suggestEmoji(name));
  }, [name, emojiTouched]);

  const handleNameChange = (val) => setName(val);
  const handleEmojiChange = (val) => { setEmoji(val); setEmojiTouched(true); };

  const updateIng = (idx, patch) => setIngredients(ingredients.map((ing, i) => (i === idx ? { ...ing, ...patch } : ing)));

  const [suggestFor, setSuggestFor] = useState(null);

  // Toont voorraaditems die bij het getypte woord passen. Leeg veld -> de
  // items waar je het meest van in huis hebt, zodat de lijst nooit leeg oogt.
  const suggestionsFor = (text) => {
    const q = norm(text);
    const pool = inventoryItems || [];
    if (!q) return pool.slice(0, 5);
    const starts = pool.filter((i) => norm(i.name).startsWith(q));
    const contains = pool.filter((i) => !norm(i.name).startsWith(q) && (norm(i.name).includes(q) || namesMatch(i.name, text)));
    return [...starts, ...contains].slice(0, 5);
  };
  const updateStep = (idx, val) => setSteps(steps.map((s, i) => (i === idx ? val : s)));
  const moveStep = (idx, direction) => {
    const target = idx + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSteps(next);
  };

  const canSave = name.trim() && ingredients.some((i) => i.name.trim() && i.amount !== "") && steps.some((s) => s.trim());

  const handleSave = () => {
    onSave({
      ...initial,
      name: name.trim(),
      emoji,
      photoUrl: photoUrl.trim(),
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      ingredients: ingredients.filter((i) => i.name.trim() && i.amount !== "").map((i) => ({ ...i, amount: Number(i.amount) })),
      steps: steps.filter((s) => s.trim()),
      notes: notes.trim(),
      diets,
    });
  };

  return (
    <Modal title={initial.id ? "Recept bewerken" : "Nieuw recept"} onClose={onCancel} wide>
      {/* Importeren is óók een recept aanmaken. Als losse knop naast "nieuw
          recept" suggereerde het iets anders. */}
      {!initial.id && onImport && (
        <button
          onClick={onImport}
          style={{
            display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
            background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14,
            padding: "11px 13px", marginBottom: 16, cursor: "pointer", fontFamily: FONT_BODY,
          }}
        >
          <Sparkles size={17} color={C.mustardDeep} />
          <span>
            <span style={{ display: "block", fontSize: 13.5, color: C.ink, fontWeight: 600 }}>
              Liever overnemen van een foto of link?
            </span>
            <span style={{ display: "block", fontSize: 11.5, color: C.inkSoft }}>
              Pollepel leest het recept uit en vult dit formulier alvast in.
            </span>
          </span>
        </button>
      )}

      <Field label="Naam"><input autoComplete="off" style={inputStyle} value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Bijv. Groentecurry" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 70 }}><Field label="Emoji"><input autoComplete="off" style={inputStyle} value={emoji} onChange={(e) => handleEmojiChange(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Foto-URL (optioneel)"><input autoComplete="off" style={inputStyle} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" /></Field></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Kooktijd (min)"><input autoComplete="off" type="number" style={inputStyle} value={cookTime} onChange={(e) => setCookTime(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Personen"><input autoComplete="off" type="number" style={inputStyle} value={servings} onChange={(e) => setServings(e.target.value)} /></Field></div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "10px 0 6px" }}>Ingrediënten</div>
      {ingredients.map((ing, idx) => (
        <div key={idx}>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <div style={{ flex: 2, position: "relative" }}>
          <input
            autoComplete="off"
            style={{ ...inputStyle, width: "100%" }}
            placeholder="Naam"
            value={ing.name}
            onFocus={() => setSuggestFor(idx)}
            onBlur={() => setTimeout(() => setSuggestFor((v) => (v === idx ? null : v)), 150)}
            onChange={(e) => updateIng(idx, { name: e.target.value, inventoryItemId: null })}
          />
          </div>
          <input autoComplete="off" type="number" style={{ ...inputStyle, width: 64 }} placeholder="Aantal" value={ing.amount} onChange={(e) => updateIng(idx, { amount: e.target.value })} />
          <select style={{ ...inputStyle, width: 90 }} value={ing.unit} onChange={(e) => updateIng(idx, { unit: e.target.value })}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <button onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color={C.inkSoft} />
          </button>
        </div>

        {suggestFor === idx && suggestionsFor(ing.name).length > 0 && (
          <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
            <div style={{ fontSize: 11, color: C.inkSoft, padding: "6px 10px 2px" }}>Uit je voorraad — tikken vult ook de eenheid in</div>
            {suggestionsFor(ing.name).map((item) => (
              <button
                key={item.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  updateIng(idx, { name: item.name, unit: item.unit, inventoryItemId: item.id });
                  setSuggestFor(null);
                }}
                style={{
                  display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
                  gap: 8, background: "none", border: "none", borderTop: `1px solid ${C.ceramic}`,
                  padding: "8px 10px", cursor: "pointer", textAlign: "left", fontFamily: FONT_BODY, fontSize: 13,
                }}
              >
                <span style={{ color: C.ink }}>{item.name}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.inkSoft }}>
                  {item.current} {item.unit} in huis
                </span>
              </button>
            ))}
          </div>
        )}

        {ing.inventoryItemId && suggestFor !== idx && (
          <div style={{ fontSize: 11, color: C.sage, marginBottom: 6, marginTop: -2 }}>
            <Check size={10} style={{ verticalAlign: -1, marginRight: 3 }} />Gekoppeld aan je voorraad
          </div>
        )}
        </div>
      ))}
      <GhostButton onClick={() => setIngredients([...ingredients, { name: "", amount: "", unit: "stuks" }])}><Plus size={14} /> Ingrediënt</GhostButton>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }}>Bereidingsstappen</div>
      {steps.map((s, idx) => (
        <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
          <span style={{ fontFamily: FONT_MONO, color: C.mustardDeep, fontSize: 12, paddingTop: 10 }}>{String(idx + 1).padStart(2, "0")}</span>
          <textarea style={{ ...inputStyle, flex: 1, minHeight: 40, resize: "vertical" }} value={s} onChange={(e) => updateStep(idx, e.target.value)} />
          <div style={{ display: "flex", flexDirection: "column", paddingTop: 4 }}>
            <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 2 }}>
              <ChevronUp size={15} color={C.inkSoft} />
            </button>
            <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} style={{ background: "none", border: "none", cursor: idx === steps.length - 1 ? "default" : "pointer", opacity: idx === steps.length - 1 ? 0.3 : 1, padding: 2 }}>
              <ChevronDown size={15} color={C.inkSoft} />
            </button>
          </div>
          <button onClick={() => setSteps(steps.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer", paddingTop: 8 }}>
            <X size={16} color={C.inkSoft} />
          </button>
        </div>
      ))}
      <GhostButton onClick={() => setSteps([...steps, ""])}><Plus size={14} /> Stap</GhostButton>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }}>Past bij dieet (optioneel)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
        {DIET_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setDiets((d) => d.includes(tag) ? d.filter((t) => t !== tag) : [...d, tag])}
            style={{
              padding: "6px 11px", borderRadius: 16, fontSize: 12, cursor: "pointer",
              border: `1.5px solid ${diets.includes(tag) ? C.sage : C.borderTint}`,
              background: diets.includes(tag) ? C.sage : C.cardBg, color: diets.includes(tag) ? "#fff" : C.inkSoft,
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }}>Eigen notities (optioneel)</div>
      <textarea
        style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
        placeholder="Bijv. 'volgende keer iets minder zout' of 'kids vonden dit top'"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <PrimaryButton disabled={!canSave} onClick={handleSave}><Check size={16} /> Opslaan</PrimaryButton>
        <GhostButton onClick={onCancel}>Annuleren</GhostButton>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- */
/*  Voorraad                                                         */
/* ---------------------------------------------------------------- */

function WeekmenuView({ weekmenu, recipes, cooks, inventory, isPremiumOn, extras = [], onAddExtra, onRemoveExtra, periodDays, periods, periodIndex, onPeriodChange, onPickDay, onPickCook, onPickAttendees, onSetDoublePortion, onClearDay, onGenerate, onAIGenerate, onPatternGenerate, onDuplicate, onApplyTemplate, onShuffle, onOpenRecipe, onExportCalendar, onQuickPlan }) {
  const findRecipe = (id) => recipes.find((r) => r.id === id);
  const dayEntry = (day) => {
    const raw = weekmenu[day];
    if (!raw) return null;
    if (typeof raw === "string") return { recipeId: raw, cook: "" };
    return raw;
  };
  const [toolsOpen, setToolsOpen] = useState(false);
  const plannedCount = periodDays.filter((d) => dayEntry(d.key)?.recipeId).length;

  const hasEmptyDay = periodDays.some((d) => { const e = dayEntry(d.key); return !e || (!e.recipeId && !e.offNight); });
  const plannedRecipeIds = periodDays.map((d) => dayEntry(d.key)?.recipeId).filter(Boolean);
  const expiringWithRecipes = useMemo(() => {
    if (!hasEmptyDay || !inventory) return [];
    return getExpirySuggestions(inventory, recipes)
      .map((s) => ({ ...s, recipes: s.recipes.filter((r) => !plannedRecipeIds.includes(r.id)) }))
      .filter((s) => s.recipes.length > 0);
  }, [inventory, recipes, hasEmptyDay, plannedRecipeIds]);

  return (
    <div>
      {/* Tabbladen per periode. De week begint op de boodschappendag uit Instellingen. */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {periods.map((p, i) => {
          const gepland = p.dagen.filter((d) => dayEntry(dateKey(d))?.recipeId).length;
          const actief = i === periodIndex;
          return (
            <button
              key={p.startKey}
              onClick={() => onPeriodChange(i)}
              style={{
                flex: 1, padding: "7px 2px", borderRadius: 12, cursor: "pointer",
                background: actief ? C.mustard : C.cardBg,
                border: `1.5px solid ${actief ? C.mustard : C.borderTint}`,
                fontFamily: FONT_BODY, textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: actief ? 700 : 500, color: actief ? "#2A1F06" : C.ink }}>
                {kortDatum(p.start)}
              </div>
              <div style={{ fontSize: 11, color: actief ? "#4A3608" : C.inkSoft }}>
                {gepland ? `${gepland} gepland` : "leeg"}
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 12px" }}>
        {periodeLabel(periods[periodIndex].start, periods[periodIndex].eind)}
      </p>

      {expiringWithRecipes.length > 0 && (
        <div style={{ background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <CalendarClock size={15} color={C.mustardDeep} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.mustardDeep }}>Ruim dit op vóórdat het te laat is</span>
          </div>
          {expiringWithRecipes.map(({ item, daysLeft, recipes: matches }) => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: C.ink, marginBottom: 4 }}>
                <strong>{item.name}</strong>{" "}
                {daysLeft <= 0 ? "is bijna over de datum" : `is over ${daysLeft} dag${daysLeft > 1 ? "en" : ""} over de datum`} — zullen we dat verwerken?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {matches.slice(0, 2).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onQuickPlan(r.id, r.name)}
                    style={{ background: C.cardBg, border: `1px solid ${C.mustard}`, borderRadius: 20, padding: "4px 10px", fontSize: 12, color: C.mustardDeep, fontWeight: 600, cursor: "pointer" }}
                  >
                    {r.emoji || "🍽️"} Plan {r.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }}>
        {periodDays.map((day, idx) => {
          const entry = dayEntry(day.key);
          const recipe = entry?.recipeId ? findRecipe(entry.recipeId) : null;
          return (
            <div
              key={day.key}
              style={{
                padding: "10px 12px",
                borderBottom: idx < periodDays.length - 1 ? `1px solid ${C.ceramic}` : "none",
                background: day.isVandaag ? C.noteBg : "transparent",
                opacity: day.isVerleden ? 0.55 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 46, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: C.blueSoft }}>
                    {day.kort}{day.isBoodschappendag ? " 🛒" : ""}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: day.isVandaag ? 700 : 400, color: C.ink }}>{day.dagnummer}</div>
                </div>
                {entry?.offNight ? (
                  <>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🍕</div>
                    <div style={{ flex: 1, fontSize: 14, color: C.inkSoft, fontStyle: "italic" }}>Geen kookavond</div>
                    <button onClick={() => onClearDay(day.key)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={15} color={C.inkSoft} /></button>
                  </>
                ) : recipe ? (
                  <>
                    <div
                      onClick={() => onOpenRecipe(recipe.id, entry?.doublePortion, entry?.leftoverItemId)}
                      title="Open dit recept"
                      style={{ width: 30, height: 30, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, cursor: "pointer" }}
                    >
                      {recipe.emoji || "🍽️"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onOpenRecipe(recipe.id, entry?.doublePortion, entry?.leftoverItemId)}>
                      <div style={{ fontSize: 14, color: C.ink }}>
                        {entry?.leftoverItemId ? "🍱 " : ""}{recipe.name}
                      </div>
                      {/* Bij een kliekje erbij zetten hoeveel er is en hoe lang het nog
                          goed is — plan je iets dat eerder bederft, dan zeg ik dat. */}
                      {entry?.leftoverItemId && (() => {
                        const restje = (inventory || []).find((i) => i.id === entry.leftoverItemId);
                        if (!restje) {
                          return (
                            <div style={{ fontSize: 11.5, color: C.brick }}>
                              Kliekje staat niet meer in je voorraad
                            </div>
                          );
                        }
                        const houdbaarTot = restje.expiryDate ? parseDateKey(restje.expiryDate) : null;
                        const bederftEerder = houdbaarTot && dateKey(houdbaarTot) < day.key;
                        const dagenOver = houdbaarTot
                          ? Math.round((houdbaarTot - startOfDay(new Date())) / 86400000)
                          : null;
                        return (
                          <div style={{ fontSize: 11.5, color: bederftEerder ? C.brick : C.mustardDeep }}>
                            Kliekje · {restje.current} {restje.current === 1 ? "portie" : "porties"}
                            {(restje.containers || []).length > 0 ? ` · bakje ${bakjesTekst(restje.containers)}` : ""}
                            {bederftEerder
                              ? ` · let op: houdbaar tot ${houdbaarTot.getDate()}/${houdbaarTot.getMonth() + 1}`
                              : dagenOver !== null ? ` · nog ${dagenOver} ${dagenOver === 1 ? "dag" : "dagen"} houdbaar` : ""}
                          </div>
                        );
                      })()}
                    </div>
                    <button onClick={() => onPickDay(day.key)} title="Ander recept kiezen" style={{ background: "none", border: "none", cursor: "pointer" }}><Pencil size={13} color={C.inkSoft} /></button>
                    <button onClick={() => onClearDay(day.key)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={15} color={C.inkSoft} /></button>
                  </>
                ) : (
                  <button onClick={() => onPickDay(day.key)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.inkSoft, fontSize: 13, cursor: "pointer", padding: "4px 0" }}>
                    <Plus size={14} /> Kies een recept
                  </button>
                )}
              </div>
              {!entry?.offNight && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: 76, marginTop: 6 }}>
                  <button
                    onClick={() => onPickCook(day.key)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: entry?.cook ? C.ceramic : "none", border: entry?.cook ? "none" : `1px dashed ${C.borderTint}`,
                      borderRadius: 20, padding: "3px 10px", cursor: "pointer",
                    }}
                  >
                    <ChefHat size={11} color={entry?.cook ? C.blueDeep : C.inkSoft} />
                    <span style={{ fontSize: 12, color: entry?.cook ? C.blueDeep : C.inkSoft, fontWeight: entry?.cook ? 600 : 400 }}>
                      {entry?.cook ? entry.cook : "Wie kookt?"}
                    </span>
                  </button>
                  {isPremiumOn && isPremiumOn("householdRSVP") && (
                    <button
                      onClick={() => onPickAttendees(day.key)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: entry?.attendees?.length ? C.successBg : "none", border: entry?.attendees?.length ? "none" : `1px dashed ${C.borderTint}`,
                        borderRadius: 20, padding: "3px 10px", cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>🙋</span>
                      <span style={{ fontSize: 12, color: entry?.attendees?.length ? C.sage : C.inkSoft, fontWeight: entry?.attendees?.length ? 600 : 400 }}>
                        {entry?.attendees?.length ? `${entry.attendees.length} eten mee` : "Wie eet mee?"}
                      </span>
                    </button>
                  )}
                  {recipe && (
                    <button
                      onClick={() => onSetDoublePortion(day.key, !entry?.doublePortion)}
                      title="Kook dubbele portie, extra portie gaat de vriezer in"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: entry?.doublePortion ? C.successBg : "none", border: entry?.doublePortion ? "none" : `1px dashed ${C.borderTint}`,
                        borderRadius: 20, padding: "3px 10px", cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>❄️</span>
                      <span style={{ fontSize: 12, color: entry?.doublePortion ? C.sage : C.inkSoft, fontWeight: entry?.doublePortion ? 600 : 400 }}>
                        Dubbele portie
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Extra's naast het avondeten: een taart, een soep in de middag.
                  Het avondgerecht blijft het anker van de dag. */}
              {(extras || []).filter((e) => e.date === day.key).map((extra) => {
                const extraRecept = extra.recipeId ? findRecipe(extra.recipeId) : null;
                return (
                  <div key={extra.id} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, paddingLeft: 56 }}>
                    <span style={{ color: C.ceramicDark, fontSize: 13 }}>┗</span>
                    <span style={{ fontSize: 15 }}>{EXTRA_ICONEN[extra.label] || "✨"}</span>
                    <span
                      style={{ flex: 1, minWidth: 0, cursor: extraRecept ? "pointer" : "default" }}
                      onClick={() => extraRecept && onOpenRecipe(extraRecept.id)}
                    >
                      <span style={{ fontSize: 13, color: C.ink }}>
                        {extraRecept ? extraRecept.name : "Onbekend recept"}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: C.inkSoft }}>
                        {extra.label}{extra.servings ? ` · voor ${extra.servings}` : ""}
                      </span>
                    </span>
                    <button
                      onClick={() => onRemoveExtra(extra.id)}
                      aria-label="Extra verwijderen"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 8, margin: -8 }}
                    >
                      <X size={14} color={C.inkSoft} />
                    </button>
                  </div>
                );
              })}

              {!day.isVerleden && (
                <button
                  onClick={() => onAddExtra(day.key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, marginLeft: 56,
                    background: "none", border: `1px dashed ${C.borderTint}`, borderRadius: 20,
                    padding: "5px 11px", minHeight: 34, cursor: "pointer", fontFamily: FONT_BODY,
                  }}
                >
                  <Plus size={12} color={C.inkSoft} />
                  <span style={{ fontSize: 11.5, color: C.inkSoft }}>Iets extra's</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <PrimaryButton tone="mustard" full disabled={plannedCount === 0 && (extras || []).length === 0} onClick={onGenerate}>
        <ClipboardList size={16} /> Boodschappenlijst genereren
      </PrimaryButton>

      {/* Hulpmiddelen stonden vóór de week, waardoor je langs vijf knoppen moest
          scrollen om je eigen dagen te zien. Nu eronder, en ingeklapt. */}
      <button
        onClick={() => setToolsOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          width: "100%", marginTop: 12, background: "none", border: "none",
          color: C.blue, fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: FONT_BODY, minHeight: 44,
        }}
      >
        <Sparkles size={14} /> Deze week snel vullen
        {toolsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {toolsOpen && (
        <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 16, padding: 12, marginTop: 4 }}>
          <div style={{ marginBottom: 8 }}>
            <PrimaryButton full onClick={onAIGenerate}>
              <Wand2 size={16} /> Laat de AI een week bedenken
            </PrimaryButton>
          </div>
          <div style={{ marginBottom: 8 }}>
            <GhostButton full onClick={onPatternGenerate}>
              <Sparkles size={14} /> Zoals wij normaal eten
            </GhostButton>
          </div>
          <div style={{ marginBottom: 8 }}>
            <GhostButton full onClick={onApplyTemplate}>
              <CalendarDays size={14} /> Vorige week overnemen
            </GhostButton>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <GhostButton full onClick={onDuplicate}><Copy size={13} /> Dupliceren</GhostButton>
            </div>
            <div style={{ flex: 1 }}>
              {/* Paneel sluiten, anders kijk je ernaar terwijl de dagen erboven
                  zijn verwisseld en lijkt er niets gebeurd te zijn. */}
              <GhostButton full onClick={() => { onShuffle(); setToolsOpen(false); }}>
                <Shuffle size={13} /> Door elkaar
              </GhostButton>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button
          onClick={onExportCalendar}
          style={{
            background: "none", border: "none", color: C.inkSoft, fontSize: 12.5,
            cursor: "pointer", fontFamily: FONT_BODY, minHeight: 44,
            textDecoration: "underline", textUnderlineOffset: 3,
          }}
        >
          Weekmenu in je agenda zetten
        </button>
      </div>
    </div>
  );
}

function AttendeesPickerModal({ cooks, current, onSave, onAddCook, onClose }) {
  const [selected, setSelected] = useState(current || []);
  const [newName, setNewName] = useState("");

  const toggle = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const addAndSelect = () => {
    if (!newName.trim()) return;
    onAddCook(newName.trim());
    setSelected((prev) => [...prev, newName.trim()]);
    setNewName("");
  };

  return (
    <Modal title="Wie eet er mee?" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
        Vink aan wie meeëet — de portiegrootte en de boodschappenlijst passen zich hierop aan.
      </p>

      {cooks.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {cooks.map((name) => (
            <button
              key={name}
              onClick={() => toggle(name)}
              style={{
                padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${selected.includes(name) ? C.sage : C.borderTint}`,
                background: selected.includes(name) ? C.sage : "#fff", color: selected.includes(name) ? "#fff" : C.ink,
              }}
            >
              {selected.includes(name) && <Check size={12} style={{ verticalAlign: -1, marginRight: 3 }} />}
              {name}
            </button>
          ))}
        </div>
      )}

      <Field label="Nieuwe naam toevoegen">
        <div style={{ display: "flex", gap: 8 }}>
          <input autoComplete="off" style={inputStyle} placeholder="Bijv. Pietje" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAndSelect()} />
          <PrimaryButton onClick={addAndSelect} disabled={!newName.trim()}><Plus size={16} /></PrimaryButton>
        </div>
      </Field>

      <p style={{ fontSize: 12, color: C.inkSoft, marginTop: -4 }}>
        {selected.length === 0 ? "Niemand geselecteerd — de standaard receptportie wordt gebruikt." : `${selected.length} perso${selected.length === 1 ? "on" : "nen"} geselecteerd.`}
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <PrimaryButton tone="sage" onClick={() => onSave(selected)}><Check size={16} /> Opslaan</PrimaryButton>
        <GhostButton onClick={onClose}>Annuleren</GhostButton>
      </div>
    </Modal>
  );
}

function CookPickerModal({ cooks, current, onPick, onAddCook, onRemoveCook, onClose }) {
  const [newName, setNewName] = useState("");

  const submitNew = () => {
    if (!newName.trim()) return;
    onAddCook(newName.trim());
    onPick(newName.trim());
    setNewName("");
  };

  return (
    <Modal title="Wie kookt er?" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
        Kies iemand uit het huishouden, of voeg een nieuwe naam toe.
      </p>

      {cooks.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {cooks.map((name) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => onPick(name)}
                style={{
                  padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${current === name ? C.blue : C.borderTint}`,
                  background: current === name ? C.blue : C.cardBg, color: current === name ? "#fff" : C.ink,
                }}
              >
                {name}
              </button>
              <button onClick={() => onRemoveCook(name)} title="Verwijder uit lijst" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <X size={13} color={C.inkSoft} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Field label="Nieuwe naam toevoegen">
        <div style={{ display: "flex", gap: 8 }}>
          <input autoComplete="off" style={inputStyle} placeholder="Bijv. Pietje" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitNew()} />
          <PrimaryButton onClick={submitNew} disabled={!newName.trim()}><Plus size={16} /></PrimaryButton>
        </div>
      </Field>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {current && <GhostButton onClick={() => onPick("")}><X size={14} /> Niemand toewijzen</GhostButton>}
        <GhostButton onClick={onClose}>Sluiten</GhostButton>
      </div>
    </Modal>
  );
}

const DIET_TAGS = ["Vegetarisch", "Veganistisch", "Glutenvrij", "Lactosevrij", "Notenallergie", "Halal", "Suikervrij"];

// De scheidslijn ligt bij wat geld kost om te draaien, niet bij wat "geavanceerd"
// oogt. Rekenwerk op je eigen gegevens is gratis: dat kost niets en maakt de
// gratis app beter. Alles waar AI aan te pas komt kost per gebruik geld, en
// staat daarom achter het abonnement.
const PREMIUM_FEATURES = [
  { key: "photoInventory", label: "Koelkastscanner", description: "Eén foto van een kast of koelkast, automatisch omgezet naar voorraaditems.", icon: "📸" },
  { key: "sousChef", label: "AI-souschef", description: "Stel tijdens het koken vragen zoals \"kan ik room vervangen door melk?\".", icon: "👨‍🍳" },
  { key: "aiImport", label: "Recepten overnemen met AI", description: "Een foto van een kookboekpagina of een link, automatisch omgezet naar een recept.", icon: "✨" },
  { key: "aiWeekmenu", label: "AI-weekmenu", description: "Laat de app een hele week bedenken, afgestemd op jullie voorraad en voorkeuren.", icon: "🪄" },
];

// Deze zitten in de gratis versie: het is rekenwerk op gegevens die je zelf al
// hebt ingevoerd. Dat kost niets om te draaien.
const GRATIS_FEATURES = [
  { key: "predictiveDepletion", label: "Voorspelde uitputting", description: "Inschatting wanneer iets op is, op basis van jullie eigen verbruik.", icon: "📉" },
  { key: "householdRSVP", label: "\"Wie eet er mee?\"", description: "Per dag aangeven wie meeëet — porties en boodschappen passen zich aan.", icon: "🙋" },
];


function CookDietRow({ name, preferences, onUpdate }) {
  const [open, setOpen] = useState(false);
  const active = (preferences?.diets || []).find((d) => d.name === name)?.tags || [];

  const toggleTag = (tag) => {
    const next = active.includes(tag) ? active.filter((t) => t !== tag) : [...active, tag];
    onUpdate(name, next);
  };

  return (
    <div style={{ padding: "8px 0", borderBottom: `1px solid ${C.ceramic}` }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 11, color: C.inkSoft }}>{active.length ? active.join(", ") : "geen wensen"}</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {DIET_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "8px 12px", minHeight: 34, borderRadius: 16, fontSize: 11, cursor: "pointer",
                border: `1.5px solid ${active.includes(tag) ? C.sage : C.borderTint}`,
                background: active.includes(tag) ? C.sage : C.cardBg, color: active.includes(tag) ? "#fff" : C.inkSoft,
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CookDislikeRow({ name, preferences, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const active = (preferences?.dislikes || []).find((d) => d.name === name)?.items || [];

  const addItem = () => {
    const val = newItem.trim();
    if (!val || active.includes(val)) return;
    onUpdate(name, [...active, val]);
    setNewItem("");
  };

  const removeItem = (item) => {
    onUpdate(name, active.filter((i) => i !== item));
  };

  return (
    <div style={{ padding: "8px 0", borderBottom: `1px solid ${C.ceramic}` }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 11, color: C.inkSoft }}>{active.length ? active.join(", ") : "geen afkeuren"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          {active.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {active.map((item) => (
                <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 16, fontSize: 11, background: C.warnBg, color: C.brick }}>
                  {item}
                  <button onClick={() => removeItem(item)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}><X size={11} color={C.brick} /></button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1, fontSize: 13, padding: "7px 10px" }} placeholder="Bijv. paddenstoelen" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
            <button aria-label="Toevoegen" onClick={addItem} disabled={!newItem.trim()} style={{ background: C.blue, border: "none", borderRadius: 10, padding: "0 12px", cursor: newItem.trim() ? "pointer" : "default", opacity: newItem.trim() ? 1 : 0.5, display: "flex", alignItems: "center" }}>
              <Plus size={14} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsModal({ household, members, preferences, cooks, onRename, onLogout, onOpenMagnet, onOpenTabletMode, onShowWelcome, onExportBackup, onToggleDarkMode, onSetShoppingDay, onSetContainerNumbering, onSetContainerCount, onOpenControle, onOpenLogboek, aantalBevindingen = 0, heeftPremium = false, onMoveCategoryOrder, onUpdateCookDiets, onUpdateCookDislikes, onTogglePremium, onClose }) {
  const [name, setName] = useState(household?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const [nameError, setNameError] = useState("");

  const saveName = async () => {
    if (!onRename || !name.trim() || name.trim() === household?.name) return;
    setSavingName(true);
    setNameError("");
    try {
      await onRename(name.trim());
    } catch (e) {
      console.error("Huishouden hernoemen mislukt:", e);
      setNameError("De nieuwe naam kon niet worden opgeslagen. Controleer je verbinding en probeer opnieuw.");
      setName(household?.name || ""); // terug naar de naam die er wél staat
    }
    setSavingName(false);
  };

  const copyCode = async () => {
    if (!household?.invite_code) return;
    try {
      await navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Klembord werkt niet overal (of zonder https). Dan maar zichtbaar tonen,
      // zodat de code alsnog over te nemen is.
      console.error("Kopiëren naar klembord mislukt:", e);
      setCopyError(true);
    }
  };

  return (
    <Modal title="Instellingen" onClose={onClose}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>Naam van je huishouden</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input autoComplete="off" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Familie Jansen" />
        <PrimaryButton onClick={saveName} disabled={savingName || !name.trim() || name.trim() === household?.name}>
          {savingName ? <PollepelLoader size={17} inline delay={0} /> : <Check size={16} />}
        </PrimaryButton>
      </div>
      {nameError && (
        <p role="alert" style={{ fontSize: 12, color: C.brick, margin: "-8px 0 14px", lineHeight: 1.45 }}>
          {nameError}
        </p>
      )}

      {household?.invite_code && (() => {
        // Een link in plaats van een code om over te typen. De ontvanger tikt
        // erop, maakt een account en zit meteen in het juiste huishouden.
        const link = `${window.location.origin}/?uitnodiging=${encodeURIComponent(household.invite_code)}`;
        const bericht = `Doe je mee in ons kookboek op Pollepel? Dan delen we onze recepten, voorraad, het weekmenu en de boodschappenlijst.\n\n${link}`;

        const deel = async () => {
          setCopyError(false);
          if (navigator.share) {
            try { await navigator.share({ title: "Pollepel", text: bericht }); return; } catch (e) { /* geannuleerd */ return; }
          }
          try {
            await navigator.clipboard.writeText(bericht);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch (e) {
            console.error("Delen en kopiëren beide mislukt:", e);
            setCopyError(true);
          }
        };

        return (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>
              Huisgenoot uitnodigen
            </div>
            <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 10px", lineHeight: 1.5 }}>
              Pollepel werkt pas echt als je hem samen gebruikt. Stuur deze link en je huisgenoot
              zit meteen in hetzelfde kookboek.
            </p>
            <PrimaryButton full onClick={deel}>
              <Share2 size={16} /> Uitnodiging versturen
            </PrimaryButton>
            {copied && <p style={{ fontSize: 12, color: C.sage, margin: "8px 0 0" }}>Uitnodiging gekopieerd — plak hem in een berichtje.</p>}
            {copyError && (
              <p role="alert" style={{ fontSize: 12, color: C.brick, margin: "8px 0 0" }}>
                Delen lukt niet in deze browser. Geef dan deze code door: <strong>{household.invite_code}</strong>
              </p>
            )}
            <details style={{ marginTop: 10, marginBottom: 16 }}>
              <summary style={{ fontSize: 11.5, color: C.inkSoft, cursor: "pointer" }}>
                Liever de code doorgeven?
              </summary>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: "10px 12px", marginTop: 8 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 1, flex: 1 }}>{household.invite_code}</span>
                <button aria-label="Code kopiëren" onClick={copyCode} style={{ background: C.ceramic, border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
                  <Copy size={15} color={C.blueDeep} />
                </button>
              </div>
            </details>
          </>
        );
      })()}

      {members && members.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>Wie kan inloggen</div>
          <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }}>
            {members.map((m, idx) => (
              <div key={m.userId || idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: idx < members.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.blueDeep, flexShrink: 0 }}>
                  {(m.displayName || m.email || "?").charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{m.displayName || m.email}</span>
                {m.role === "owner" && <Pill>eigenaar</Pill>}
              </div>
            ))}
          </div>
        </>
      )}


      {cooks && cooks.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>Dieetwensen &amp; allergieën</div>
          <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, padding: "4px 12px" }}>
            {cooks.map((cookName) => (
              <CookDietRow key={cookName} name={cookName} preferences={preferences} onUpdate={onUpdateCookDiets} />
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>Afkeuren per huisgenoot</div>
          <p style={{ fontSize: 11, color: C.inkSoft, marginTop: -4, marginBottom: 8 }}>
            Geen dieet, gewoon een voorkeur — bijv. "paddenstoelen". Je krijgt een seintje op een recept, geen harde blokkade.
          </p>
          <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, padding: "4px 12px" }}>
            {cooks.map((cookName) => (
              <CookDislikeRow key={cookName} name={cookName} preferences={preferences} onUpdate={onUpdateCookDislikes} />
            ))}
          </div>
        </>
      )}
      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.04em", textTransform: "uppercase", margin: "22px 0 8px" }}>
        Hoe de app werkt
      </div>
      <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 6, overflow: "hidden" }}>
        <div style={{ padding: "12px", borderBottom: `1px solid ${C.ceramic}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink }}>
              <Moon size={15} color={C.blueDeep} /> Donkere modus
            </span>
            <button
              onClick={onToggleDarkMode}
              aria-label="Donkere modus aan of uit"
              style={{
                width: 46, height: 28, borderRadius: 20, flexShrink: 0, cursor: "pointer", border: "none",
                background: preferences?.darkMode ? C.sage : C.ceramicDark,
                display: "flex", alignItems: "center", padding: 3,
                justifyContent: preferences?.darkMode ? "flex-end" : "flex-start",
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 11, background: "#fff" }} />
            </button>
          </div>
        </div>
        <div style={{ padding: "12px", borderBottom: `1px solid ${C.ceramic}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span>
              <span style={{ display: "block", fontSize: 14, color: C.ink }}>Bakjes nummeren</span>
              <span style={{ display: "block", fontSize: 11, color: C.inkSoft, lineHeight: 1.45 }}>
                Plak genummerde stickers op je vriesbakjes. De app zegt welk nummer je moet pakken —
                schrijven hoeft niet meer.
              </span>
            </span>
            <button
              onClick={() => onSetContainerNumbering(!preferences.containerNumbering)}
              aria-label="Bakjes nummeren aan of uit"
              style={{
                width: 46, height: 28, borderRadius: 20, flexShrink: 0, cursor: "pointer", border: "none",
                background: preferences.containerNumbering ? C.sage : C.ceramicDark,
                display: "flex", alignItems: "center", padding: 3,
                justifyContent: preferences.containerNumbering ? "flex-end" : "flex-start",
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 11, background: "#fff" }} />
            </button>
          </div>
          {preferences.containerNumbering && (
            <div style={{ marginTop: 10 }}>
              <Field label="Hoeveel genummerde bakjes heb je?">
                <input
                  autoComplete="off"
                  type="number"
                  style={inputStyle}
                  value={preferences.containerCount == null ? 40 : preferences.containerCount}
                  onChange={(e) => onSetContainerCount(Math.max(1, Number(e.target.value) || 1))}
                />
              </Field>
            </div>
          )}
        </div>
        <div style={{ padding: "12px", borderBottom: `1px solid ${C.ceramic}` }}>
          <div style={{ fontSize: 14, color: C.ink, marginBottom: 2 }}>Boodschappendag</div>
          <div style={{ fontSize: 11, color: C.inkSoft, marginBottom: 8 }}>
            Je weekmenu begint op deze dag, want je plant tot je volgende keer boodschappen doet.
          </div>
          <select
            style={inputStyle}
            value={preferences.shoppingDay == null ? 6 : preferences.shoppingDay}
            onChange={(e) => onSetShoppingDay(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <option key={d} value={d}>
                {DAG_LANG[d].charAt(0).toUpperCase() + DAG_LANG[d].slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>


      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>Volgorde boodschappenlijst</div>
      <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }}>
        {(preferences?.categoryOrder && preferences.categoryOrder.length === CATEGORIES.length ? preferences.categoryOrder : CATEGORIES).map((cat, idx, arr) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: idx < arr.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{cat}</span>
            <button onClick={() => onMoveCategoryOrder(cat, -1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 4 }}>
              <ChevronUp size={15} color={C.inkSoft} />
            </button>
            <button onClick={() => onMoveCategoryOrder(cat, 1)} disabled={idx === arr.length - 1} style={{ background: "none", border: "none", cursor: idx === arr.length - 1 ? "default" : "pointer", opacity: idx === arr.length - 1 ? 0.3 : 1, padding: 4 }}>
              <ChevronDown size={15} color={C.inkSoft} />
            </button>
          </div>
        ))}
      </div>

      {/* Wat gratis is en wat niet, met de reden erbij. Een grens die je kunt
          uitleggen voelt eerlijker dan een grens die er gewoon is. */}
      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>
        Altijd gratis
      </div>
      <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 6, overflow: "hidden" }}>
        {GRATIS_FEATURES.map((feat, idx) => (
          <div key={feat.key} style={{ padding: "11px 12px", borderBottom: idx < GRATIS_FEATURES.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink, fontWeight: 600 }}>
              <span>{feat.icon}</span> {feat.label}
              <Pill tone="ok">gratis</Pill>
            </div>
            <p style={{ fontSize: 11, color: C.inkSoft, margin: "4px 0 0" }}>{feat.description}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: C.inkSoft, margin: "0 0 16px", lineHeight: 1.45 }}>
        Dit is rekenwerk op gegevens die je zelf hebt ingevoerd. Dat kost niets om te draaien,
        dus dat blijft gratis.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 8px" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>Met Premium</span>
        {heeftPremium ? <Pill tone="ok">actief</Pill> : <Pill tone="auto">proefstand</Pill>}
      </div>
      <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 6, overflow: "hidden" }}>
        {PREMIUM_FEATURES.map((feat, idx) => {
          const on = preferences?.premium ? preferences.premium[feat.key] !== false : true;
          return (
            <div key={feat.key} style={{ padding: "11px 12px", borderBottom: idx < PREMIUM_FEATURES.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink, fontWeight: 600 }}>
                  <span>{feat.icon}</span> {feat.label}
                </span>
                <button
                  onClick={() => onTogglePremium(feat.key)}
                  style={{ width: 38, height: 21, borderRadius: 20, background: on ? C.mustard : C.ceramicDark, position: "relative", border: "none", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 2, left: on ? 19 : 2, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                </button>
              </div>
              <p style={{ fontSize: 11, color: C.inkSoft, margin: "4px 0 0" }}>{feat.description}</p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: C.inkSoft, margin: "0 0 16px", lineHeight: 1.45 }}>
        Deze functies gebruiken AI, en dat kost per keer geld. Daarom zitten ze in het abonnement.
        {heeftPremium
          ? " Jullie abonnement loopt — bedankt daarvoor."
          : " Zolang er nog geen abonnement is, kun je ze in deze proefstand gewoon gebruiken."}
      </p>


      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.04em", textTransform: "uppercase", margin: "22px 0 8px" }}>
        Hulpmiddelen
      </div>
      <div style={{ background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 6, overflow: "hidden" }}>
        <button
          onClick={onOpenMagnet}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" }}
        >
          <Printer size={16} color={C.blueDeep} />
          <span style={{ fontSize: 14, color: C.ink }}>Koelkastmagneet printen</span>
        </button>
        <button
          onClick={onOpenTabletMode}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" }}
        >
          <ScanLine size={16} color={C.blueDeep} />
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, color: C.ink }}>Scanstation starten</span>
            <span style={{ fontSize: 11, color: C.inkSoft }}>Zet een tablet in de keuken en scan barcodes om je voorraad bij te werken</span>
          </span>
        </button>
        <button
          onClick={onOpenControle}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" }}
        >
          <CheckCircle2 size={16} color={C.blueDeep} />
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13.5, color: C.ink }}>Gegevens controleren</span>
            <span style={{ fontSize: 11, color: C.inkSoft }}>
              {aantalBevindingen === 0 ? "Alles ziet er goed uit" : `${aantalBevindingen} ding${aantalBevindingen > 1 ? "en" : ""} om na te kijken`}
            </span>
          </span>
        </button>
        <button
          onClick={onShowWelcome}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" }}
        >
          <Sparkles size={16} color={C.blueDeep} />
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, color: C.ink }}>Uitleg opnieuw bekijken</span>
            <span style={{ fontSize: 11, color: C.inkSoft }}>Hoe Pollepel werkt, in drie schermen</span>
          </span>
        </button>
        <button
          onClick={onOpenLogboek}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" }}
        >
          <AlertTriangle size={16} color={C.blueDeep} />
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, color: C.ink }}>Foutlogboek</span>
            <span style={{ fontSize: 11, color: C.inkSoft }}>Werkt er iets niet? Deel dit, dan zie ik wat er misging</span>
          </span>
        </button>

        <button
          onClick={onExportBackup}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <Download size={16} color={C.blueDeep} />
          <span style={{ fontSize: 14, color: C.ink }}>Backup downloaden</span>
        </button>
      </div>


      {/* Privacy en accountverwijdering. Beide zijn verplicht in de App Store
          en Google Play, en horen er sowieso te zijn. */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.ceramic}` }}>
        <button
          onClick={() => setPrivacyOpen(true)}
          style={{
            background: "none", border: "none", padding: "8px 0", cursor: "pointer",
            color: C.blue, fontSize: 13, fontFamily: FONT_BODY, minHeight: 44,
            textDecoration: "underline", textUnderlineOffset: 3, display: "block",
          }}
        >
          Wat bewaart Pollepel over ons?
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: "none", border: "none", padding: "8px 0", cursor: "pointer",
              color: C.inkSoft, fontSize: 12.5, fontFamily: FONT_BODY, minHeight: 44,
              display: "block",
            }}
          >
            Account verwijderen
          </button>
        ) : (
          <div style={{ background: C.warnBg, border: `1.5px solid ${C.brick}`, borderRadius: 14, padding: 13, marginTop: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.brick, marginBottom: 6 }}>
              Weet je het zeker?
            </div>
            <p style={{ fontSize: 12.5, color: C.ink, margin: "0 0 10px", lineHeight: 1.5 }}>
              Je account wordt verwijderd. Ben je de laatste in dit huishouden, dan verdwijnen
              ook alle recepten, je voorraad, het weekmenu en de boodschappenlijst — voorgoed.
              Zijn er nog huisgenoten, dan blijft hun kookboek gewoon bestaan.
            </p>
            <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 8px" }}>
              Typ <strong>VERWIJDER</strong> om te bevestigen:
            </p>
            <input
              autoComplete="off"
              style={{ ...inputStyle, marginBottom: 10 }}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="VERWIJDER"
            />
            {deleteError && (
              <p role="alert" style={{ fontSize: 12, color: C.brick, margin: "0 0 8px" }}>{deleteError}</p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <PrimaryButton
                tone="brick"
                disabled={deleteConfirmText.trim().toUpperCase() !== "VERWIJDER" || deleting}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError("");
                  try {
                    await window.householdAPI.deleteAccount();
                    window.location.reload();
                  } catch (e) {
                    console.error("Account verwijderen mislukt:", e);
                    setDeleteError("Het verwijderen is niet gelukt. Controleer je verbinding en probeer het opnieuw.");
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "Bezig…" : "Definitief verwijderen"}
              </PrimaryButton>
              <GhostButton onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); setDeleteError(""); }}>
                Annuleren
              </GhostButton>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 10.5, color: C.inkSoft, textAlign: "center", marginTop: 20, fontFamily: FONT_MONO }}>
        Pollepel {APP_VERSIE}
      </p>

      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </Modal>
  );
}

// Privacybeleid in gewone taal. Verplicht voor beide appwinkels, maar vooral:
// mensen mogen weten wat er van ze bewaard wordt.
function PrivacyModal({ onClose }) {
  const kop = { fontFamily: FONT_DISPLAY, fontSize: 15, margin: "16px 0 4px", color: C.ink };
  const tekst = { fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 6px" };
  const lijst = { fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 6px", paddingLeft: 18 };

  return (
    <Modal title="Privacy" onClose={onClose}>
      <p style={{ ...tekst, marginTop: 0 }}>
        Pollepel is een kookapp voor je huishouden. Hieronder staat precies wat er
        bewaard wordt, waar het staat en hoe je ervan af komt.
      </p>

      <h3 style={kop}>Wat we bewaren</h3>
      <ul style={lijst}>
        <li>Je e-mailadres, om in te loggen</li>
        <li>De naam van je huishouden en wie er lid van zijn</li>
        <li>Je recepten, voorraad, weekmenu en boodschappenlijst</li>
        <li>Wat je gekookt hebt en wat er van je voorraad af ging</li>
        <li>Foto's die je bij een recept zet</li>
      </ul>

      <h3 style={kop}>Wat we niet doen</h3>
      <ul style={lijst}>
        <li>Geen advertenties, en niets wordt verkocht of gedeeld met adverteerders</li>
        <li>Geen volgtechnieken om je gedrag buiten de app te volgen</li>
        <li>Geen toegang tot je gegevens door andere huishoudens</li>
      </ul>

      <h3 style={kop}>Met wie het gedeeld wordt</h3>
      <p style={tekst}>
        Alleen met je eigen huisgenoten. Deel je een recept met de community, dan is
        dát recept zichtbaar voor andere huishoudens — je voorraad en weekmenu nooit.
      </p>
      <p style={tekst}>
        Abonneer je op het weekmenu in je agenda, dan is dat menu leesbaar voor
        iedereen die het adres heeft. Deel dat adres dus alleen met je huisgenoten.
      </p>

      <h3 style={kop}>Waar het staat</h3>
      <p style={tekst}>
        Op servers van Supabase binnen de Europese Unie. De verbinding is versleuteld.
      </p>

      <h3 style={kop}>De AI-hulp</h3>
      <p style={tekst}>
        Vraag je de app om een recept te bedenken of een foto te lezen, dan gaat die
        vraag naar Anthropic om beantwoord te worden. Alleen wat nodig is voor die ene
        vraag wordt meegestuurd — niet je hele kookboek of voorraad.
      </p>

      <h3 style={kop}>Je gegevens weghalen</h3>
      <p style={tekst}>
        Onderaan Instellingen staat “Account verwijderen”. Ben je de laatste in je
        huishouden, dan wordt alles gewist. Zijn er nog huisgenoten, dan blijft hun
        kookboek bestaan en verdwijnt alleen jouw account.
      </p>
      <p style={tekst}>
        Wil je eerst een kopie? Met “Backup downloaden” haal je al je gegevens op.
      </p>

      <h3 style={kop}>Vragen</h3>
      <p style={tekst}>
        Neem contact op met de beheerder van je huishouden of met de maker van deze app.
      </p>

      <div style={{ marginTop: 18 }}>
        <PrimaryButton full onClick={onClose}>Sluiten</PrimaryButton>
      </div>
    </Modal>
  );
}

function ShelfPhotoModal({ scanning, error, results, onScan, onToggleInclude, onApply, onClose }) {
  const [preview, setPreview] = useState("");
  const cameraRef = React.useRef(null);
  const galleryRef = React.useRef(null);

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onScan(file);
  };

  const includedCount = results.filter((r) => r.include).length;

  return (
    <Modal title="Koelkastscanner" onClose={onClose} wide>
      <input autoComplete="off" ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      <input autoComplete="off" ref={galleryRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      {!preview && (
        <>
          <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
            Maak een foto van een open kast, koelkast of voorraadplank. Pollepel herkent zoveel mogelijk producten in één keer en stelt voor je voorraad bij te werken.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><PrimaryButton full onClick={() => galleryRef.current && galleryRef.current.click()}><ImagePlus size={15} /> Foto kiezen</PrimaryButton></div>
            <div style={{ flex: 1 }}><GhostButton onClick={() => cameraRef.current && cameraRef.current.click()}><Camera size={15} /> Direct camera</GhostButton></div>
          </div>
          <p style={{ fontSize: 11, color: C.inkSoft, marginTop: -4 }}>
            Lukt "Direct camera" niet (sommige browsers blokkeren dit)? Maak de foto dan eerst met je gewone camera-app, en kies 'm daarna via "Foto kiezen".
          </p>
        </>
      )}

      {preview && (
        <img src={preview} alt="Kast" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 14, border: `1.5px solid ${C.borderTint}`, background: C.ceramic, marginBottom: 12 }} />
      )}

      {scanning && (
        <PollepelLoader tekst="Producten herkennen…" size={40} />
      )}

      {error && !scanning && (
        <div style={{ background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10 }}>
          {error}
        </div>
      )}

      {!scanning && results.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: C.inkSoft }}>{results.length} product{results.length !== 1 ? "en" : ""} herkend — vink uit wat niet klopt:</p>
          <div style={{ maxHeight: 320, overflowY: "auto", background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 14 }}>
            {results.map((r, idx) => (
              <div key={r.tempId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: idx < results.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
                <button
                  onClick={() => onToggleInclude(r.tempId)}
                  style={{ width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${r.include ? C.sage : C.borderTint}`, background: r.include ? C.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                >
                  {r.include && <Check size={13} color="#fff" />}
                </button>
                <div style={{ flex: 1, opacity: r.include ? 1 : 0.45 }}>
                  <div style={{ fontSize: 13, color: C.ink }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }}>
                    {r.amount} {r.unit} · {r.category} {r.matchedId && "· aanvullen op bestaand item"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PrimaryButton tone="sage" full disabled={includedCount === 0} onClick={() => onApply(results)}>
            <Check size={16} /> {includedCount} product{includedCount !== 1 ? "en" : ""} bijwerken in voorraad
          </PrimaryButton>
        </>
      )}

      <div style={{ marginTop: 12 }}><GhostButton onClick={onClose}>Sluiten</GhostButton></div>
    </Modal>
  );
}

function TabletModeView({ inventory, onConsume, onRestock, onCreate, onClose }) {
  const inputRef = React.useRef(null);
  const wakeLockRef = React.useRef(null);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState("scanning"); // scanning | found | creating | done
  const [matchedItem, setMatchedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const [doneTone, setDoneTone] = useState("sage");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newUnit, setNewUnit] = useState("stuks");

  // Scherm aan houden zolang tabletmodus actief is
  useEffect(() => {
    let cancelled = false;
    const requestLock = async () => {
      if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) { lock.release().catch(() => {}); return; }
        wakeLockRef.current = lock;
        // Zonder dit blijft de verwijzing naar een vrijgegeven lock staan,
        // waardoor er na terugkeren geen nieuwe wordt aangevraagd.
        lock.addEventListener("release", () => { wakeLockRef.current = null; });
      } catch (e) { /* niet ondersteund of geweigerd */ }
    };
    requestLock();
    const handleVisibility = () => { if (document.visibilityState === "visible" && !wakeLockRef.current) requestLock(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (wakeLockRef.current) { wakeLockRef.current.release().catch(() => {}); wakeLockRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (phase === "scanning" && inputRef.current) inputRef.current.focus();
  }, [phase]);

  const resetToScanning = () => {
    setCode(""); setMatchedItem(null); setAmount(1); setNewName("");
    setPhase("scanning");
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  const lookupProductName = async (c) => {
    setLookupLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=product_name,product_name_nl,categories_tags`);
      const data = await res.json();
      const name = (data && data.product && (data.product.product_name_nl || data.product.product_name)) || "";
      const tags = (data && data.product && data.product.categories_tags) || [];
      if (name) { setNewName(name); setNewCategory(categoryFromOffTags(tags) || guessCategory(name)); }
    } catch (e) { /* stil negeren, handmatig invullen blijft mogelijk */ }
    finally { setLookupLoading(false); }
  };

  const handleScan = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const match = inventory.find((i) => i.barcode && i.barcode === trimmed);
    setCode(trimmed);
    setAmount(1);
    if (match) {
      setMatchedItem(match);
      setPhase("found");
    } else {
      setMatchedItem(null);
      setNewName(""); setNewCategory(CATEGORIES[0]); setNewUnit("stuks");
      setPhase("creating");
      lookupProductName(trimmed);
    }
  };

  const finishWith = (msg, tone) => {
    setDoneMsg(msg); setDoneTone(tone); setPhase("done");
    setTimeout(resetToScanning, 1600);
  };

  const confirmRestock = () => {
    onRestock(matchedItem.id, amount);
    finishWith(`${amount} ${matchedItem.unit} ${matchedItem.name} bijgevuld.`, "sage");
  };
  const confirmConsume = () => {
    onConsume(matchedItem.id, amount);
    finishWith(`${amount} ${matchedItem.unit} ${matchedItem.name} afgeboekt.`, "brick");
  };
  const confirmCreate = () => {
    if (!newName.trim()) return;
    onCreate({ name: newName.trim(), category: newCategory, unit: newUnit, current: amount, min: 1, max: Math.max(amount, 1), barcode: code });
    finishWith(`${newName.trim()} toegevoegd aan de voorraad.`, "sage");
  };

  const stepperBtn = { width: 52, height: 52, borderRadius: 16, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 26, cursor: "pointer" };

  return (
    <div style={{ position: "fixed", inset: 0, background: C.blueDeep, zIndex: 80, display: "flex", flexDirection: "column", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark size={26} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }}>Pollepel — Tabletmodus</span>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13 }}>
          Sluiten
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        {phase === "scanning" && (
          <>
            <ScanLine size={72} color={C.mustard} style={{ marginBottom: 22 }} />
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Klaar om te scannen</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 28, textAlign: "center", maxWidth: 340 }}>
              Scan een barcode met een aangesloten scanner, of typ 'm hieronder in en druk op Enter.
            </div>
            <input autoComplete="off"
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleScan(code); }}
              inputMode="numeric"
              autoFocus
              style={{ width: "100%", maxWidth: 380, fontSize: 26, textAlign: "center", padding: "18px", borderRadius: 16, border: "none", fontFamily: FONT_MONO }}
              placeholder="000000000000"
            />
          </>
        )}

        {phase === "found" && matchedItem && (
          <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{matchedItem.name}</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 30 }}>Huidige voorraad: {matchedItem.current} {matchedItem.unit}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginBottom: 32 }}>
              <button onClick={() => setAmount((a) => Math.max(1, a - 1))} style={stepperBtn}>−</button>
              <div style={{ fontFamily: FONT_MONO, fontSize: 32, minWidth: 110 }}>{amount} {matchedItem.unit}</div>
              <button onClick={() => setAmount((a) => a + 1)} style={stepperBtn}>+</button>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={confirmRestock} style={{ flex: 1, padding: "22px 10px", borderRadius: 20, border: "none", background: C.sage, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ArrowUpCircle size={30} /> Bijvullen
              </button>
              <button onClick={confirmConsume} style={{ flex: 1, padding: "22px 10px", borderRadius: 20, border: "none", background: C.brick, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ArrowDownCircle size={30} /> Afboeken
              </button>
            </div>
            <button onClick={resetToScanning} style={{ marginTop: 22, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>Annuleren</button>
          </div>
        )}

        {phase === "creating" && (
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
              {lookupLoading ? "Product opzoeken…" : "Onbekende barcode — nieuw product"}
            </div>
            <input autoComplete="off" style={{ ...inputStyle, marginBottom: 10, fontSize: 16 }} placeholder="Productnaam" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <select style={{ ...inputStyle, marginBottom: 10, fontSize: 16 }} value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select style={{ ...inputStyle, marginBottom: 16, fontSize: 16 }} value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 22 }}>
              <button onClick={() => setAmount((a) => Math.max(1, a - 1))} style={{ ...stepperBtn, width: 46, height: 46, fontSize: 22 }}>−</button>
              <div style={{ fontFamily: FONT_MONO, fontSize: 22 }}>{amount} {newUnit}</div>
              <button onClick={() => setAmount((a) => a + 1)} style={{ ...stepperBtn, width: 46, height: 46, fontSize: 22 }}>+</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmCreate} disabled={!newName.trim()} style={{ flex: 1, padding: "16px", borderRadius: 16, border: "none", background: newName.trim() ? C.mustard : "rgba(255,255,255,0.2)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: newName.trim() ? "pointer" : "default" }}>
                Toevoegen
              </button>
              <button onClick={resetToScanning} style={{ padding: "16px 22px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", background: "none", color: "#fff", fontSize: 15, cursor: "pointer" }}>
                Annuleren
              </button>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center" }}>
            <CheckCircle2 size={68} color={doneTone === "sage" ? C.sage : C.mustard} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 20, fontWeight: 700, maxWidth: 380 }}>{doneMsg}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FridgeMagnetView({ household, onClose }) {
  const url = (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://pollepel.netlify.app") + "#boodschappen";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&color=31-63-102&data=${encodeURIComponent(url)}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,44,72,0.55)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pollepel-magnet, #pollepel-magnet * { visibility: visible; }
          #pollepel-magnet { position: fixed; inset: 0; margin: auto; }
        }
      `}</style>
      <div id="pollepel-magnet" style={{
        background: C.cardBg, borderRadius: 28, padding: 32, width: "100%", maxWidth: 340, textAlign: "center",
        border: `6px solid ${C.blue}`, boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><LogoMark size={44} /></div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: C.blueDeep }}>Pollepel</div>
        {household?.name && <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 14 }}>{household.name}</div>}
        <img src={qrSrc} alt="QR-code naar Pollepel" style={{ width: "100%", maxWidth: 220, margin: "10px auto", display: "block", borderRadius: 12 }} />
        <p style={{ fontSize: 12, color: C.inkSoft, margin: "10px 0 0" }}>Scan voor het kookboek, de voorraad &amp; de boodschappenlijst</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <PrimaryButton onClick={() => window.print()}><Printer size={16} /> Printen</PrimaryButton>
        <button
          onClick={onClose}
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 14, padding: "10px 16px", fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Sluiten
        </button>
      </div>
    </div>
  );
}

function RecipePickerModal({ recipes, inventory, onPick, onPickOffNight, onClose }) {
  const [query, setQuery] = useState("");
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  // Roulette. Draait even door voordat de uitkomst verschijnt — dat korte
  // moment maakt het een verrassing in plaats van zomaar een willekeurige regel.
  const [rouletteBezig, setRouletteBezig] = useState(false);
  const [gerold, setGerold] = useState(null);

  const rol = () => {
    if (!recipes.length) return;
    setRouletteBezig(true);
    setGerold(null);
    setTimeout(() => {
      // Wat je kunt maken krijgt voorrang; kun je niets compleet maken, dan
      // pakken we wat er het dichtst bij zit.
      const gescoord = recipes
        .map((r) => ({ r, mist: inventory ? recipeReadiness(r, inventory).missing.length : 0 }))
        .sort((a, b) => a.mist - b.mist);
      const minste = gescoord[0].mist;
      const pool = gescoord.filter((x) => x.mist === minste);
      const keuze = pool[Math.floor(Math.random() * pool.length)];
      setGerold(keuze);
      setRouletteBezig(false);
    }, 900);
  };

  const leftovers = useMemo(() => {
    if (!inventory) return [];
    return inventory
      .filter((i) => i.sourceRecipeId && i.current > 0)
      .map((i) => ({ item: i, recipe: recipes.find((r) => r.id === i.sourceRecipeId), daysLeft: daysUntil(i.expiryDate) }))
      .filter((l) => l.recipe);
  }, [inventory, recipes]);

  return (
    <Modal title="Kies een recept" onClose={onClose}>
      {!query && !gerold && !rouletteBezig && (
        <button
          onClick={rol}
          style={{
            display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left",
            background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14,
            padding: "12px 13px", marginBottom: 12, cursor: "pointer", fontFamily: FONT_BODY,
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎲</span>
          <span>
            <span style={{ display: "block", fontSize: 14.5, color: C.ink, fontWeight: 600 }}>Verrassing</span>
            <span style={{ display: "block", fontSize: 11.5, color: C.inkSoft }}>
              Laat Pollepel kiezen — met voorrang voor wat je in huis hebt
            </span>
          </span>
        </button>
      )}

      {rouletteBezig && (
        <div style={{ background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: "18px 13px", marginBottom: 12 }}>
          <PollepelLoader tekst="Even roeren…" size={40} delay={0} />
        </div>
      )}

      {gerold && !rouletteBezig && (
        <div style={{ background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: "13px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{gerold.r.emoji || "🍽️"}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11, color: C.inkSoft, letterSpacing: "0.04em" }}>HET WORDT…</span>
              <span style={{ display: "block", fontSize: 15.5, color: C.ink, fontWeight: 600, lineHeight: 1.25 }}>{gerold.r.name}</span>
              <span style={{ display: "block", fontSize: 12, color: gerold.mist ? C.brick : C.sage, marginTop: 2 }}>
                {gerold.r.cookTime}m · {gerold.mist === 0 ? "alles in huis" : `nog ${gerold.mist} nodig`}
              </span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton tone="sage" onClick={() => onPick(gerold.r.id)}>
              <Check size={15} /> Deze wordt het
            </PrimaryButton>
            <GhostButton onClick={rol}><Shuffle size={14} /> Nog eens</GhostButton>
          </div>
        </div>
      )}

      {!query && (
        <button
          onClick={onPickOffNight}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.cardBg, border: `1.5px dashed ${C.borderTint}`, borderRadius: 12, padding: "9px 10px", marginBottom: 12, cursor: "pointer" }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🍕</div>
          <div>
            <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>Geen kookavond</div>
            <div style={{ fontSize: 11, color: C.inkSoft }}>Afhaal, uit eten, of gewoon vrij — geen boodschappen nodig</div>
          </div>
        </button>
      )}
      {leftovers.length > 0 && !query && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.mustardDeep, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
            🍱 Kliekjes op — eerst opeten?
          </div>
          {leftovers.map(({ item, recipe, daysLeft }) => (
            <button
              key={item.id}
              onClick={() => onPick(recipe.id, item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{recipe.emoji || "🍽️"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{recipe.name}</div>
                <div style={{ fontSize: 11, color: C.mustardDeep, fontFamily: FONT_MONO }}>
                  {item.current} {item.unit} restje{item.current > 1 ? "s" : ""} · {daysLeft !== null && daysLeft <= 0 ? "vandaag over datum" : daysLeft !== null ? `nog ${daysLeft}d houdbaar` : ""}
                </div>
              </div>
            </button>
          ))}
          <div style={{ height: 1, background: C.ceramic, margin: "4px 0 10px" }} />
        </div>
      )}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} color={C.inkSoft} style={{ position: "absolute", left: 10, top: 11 }} />
        <input autoComplete="off" style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Zoek een gerecht…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div style={{ maxHeight: 340, overflowY: "auto" }}>
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => onPick(r.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer" }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{r.emoji || "🍽️"}</div>
            <div>
              <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }}>{r.cookTime} min · {r.servings} pers.</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: C.inkSoft, textAlign: "center" }}>Geen gerechten gevonden.</p>}
      </div>
    </Modal>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function getSeasonalRecipeSuggestions(recipes) {
  const seasonal = seasonalProduceNow();
  return recipes
    .map((r) => ({
      recipe: r,
      matches: r.ingredients.filter((ing) => seasonal.some((s) => namesMatch(s, ing.name))).map((ing) => ing.name),
    }))
    .filter((r) => r.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);
}

function getDepletionForecast(inventory, consumptionLog) {
  if (!consumptionLog || !consumptionLog.length) return [];
  const cutoff = Date.now() - 30 * 86400000; // laatste 30 dagen
  const recent = consumptionLog.filter((e) => new Date(e.date).getTime() > cutoff);
  const results = [];

  inventory.forEach((item) => {
    const entries = recent.filter((e) => namesMatch(e.name, item.name) && e.unit === item.unit);
    if (entries.length < 2) return; // te weinig data voor een zinvolle inschatting
    const totalConsumed = entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    if (totalConsumed <= 0) return;
    const earliest = Math.min(...entries.map((e) => new Date(e.date).getTime()));
    const daysSpan = Math.max(1, (Date.now() - earliest) / 86400000);
    const dailyRate = totalConsumed / daysSpan;
    if (dailyRate <= 0) return;
    const daysLeft = Math.round(item.current / dailyRate);
    if (daysLeft >= 0 && daysLeft <= 7) results.push({ item, daysLeft });
  });

  return results.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
}

function getExpirySuggestions(inventory, recipes) {
  return inventory
    .filter((item) => item.expiryDate)
    .map((item) => ({ item, daysLeft: daysUntil(item.expiryDate) }))
    .filter(({ daysLeft }) => daysLeft !== null && daysLeft <= 3)
    .map(({ item, daysLeft }) => {
      // Een restje is direct gekoppeld aan het recept waar het vandaan komt — geen
      // ingrediënt-matching nodig (en die zou ook nooit iets vinden, want "Restje X" is geen ingrediënt).
      const sourceRecipe = item.sourceRecipeId ? recipes.find((r) => r.id === item.sourceRecipeId) : null;
      const matchedRecipes = sourceRecipe
        ? [sourceRecipe]
        : recipes.filter((r) => r.ingredients.some((ing) => namesMatch(ing.name, item.name) && ing.unit === item.unit));
      return { item, daysLeft, recipes: matchedRecipes };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

function VoorraadView({ inventory, recipes, categories, consumptionLog, isPremiumOn, ernstigeBevindingen = 0, onOpenControle, onEdit, onNew, onDelete, onScan, onOpenRecipe, onOpenShelfPhoto }) {
  const cats = categories && categories.length ? categories : CATEGORIES;
  const [zoek, setZoek] = useState("");
  const [teVerwijderen, setTeVerwijderen] = useState(null);

  // Zoeken met dezelfde slimme naamvergelijking als bij recepten: "kool" vindt
  // ook "Bio gekookte rode kool met appeltjes", en "ui" niet zomaar "bouillon".
  const gefilterd = useMemo(() => {
    const q = zoek.trim();
    if (!q) return inventory;
    const kort = norm(q);
    // Een getal intypen zoekt op bakjesnummer. Dat is precies de vraag die je
    // hebt als je met een bevroren bakje in je hand staat.
    const alsNummer = /^\d+$/.test(kort) ? Number(kort) : null;
    return inventory.filter((i) =>
      norm(i.name).includes(kort)
      || namesMatch(i.name, q)
      || (alsNummer !== null && (i.containers || []).map(Number).includes(alsNummer))
    );
  }, [inventory, zoek]);

  const byCategory = useMemo(() => {
    const map = {};
    cats.forEach((c) => (map[c] = []));
    gefilterd.forEach((i) => { (map[i.category] || (map[i.category] = [])).push(i); });
    // Binnen elke categorie alfabetisch, met Nederlandse sortering (é, ij enz.)
    Object.keys(map).forEach((c) => {
      map[c] = [...map[c]].sort((a, b) => (a.name || "").localeCompare(b.name || "", "nl", { sensitivity: "base" }));
    });
    return map;
  }, [gefilterd, cats]);

  const expirySuggestions = useMemo(() => getExpirySuggestions(inventory, recipes), [inventory, recipes]);
  const depletionForecast = useMemo(
    () => (isPremiumOn("predictiveDepletion") ? getDepletionForecast(inventory, consumptionLog) : []),
    [inventory, consumptionLog, isPremiumOn]
  );

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} color={C.inkSoft} style={{ position: "absolute", left: 10, top: 13 }} />
        <input
          autoComplete="off"
          style={{ ...inputStyle, paddingLeft: 30, paddingRight: zoek ? 36 : 11 }}
          placeholder={`Zoek in ${inventory.length} producten…`}
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
        />
        {zoek && (
          <button
            onClick={() => setZoek("")}
            aria-label="Zoekterm wissen"
            style={{
              position: "absolute", right: 4, top: 4, width: 36, height: 36,
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={15} color={C.inkSoft} />
          </button>
        )}
      </div>


      {zoek ? (
        <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 12px" }}>
          {gefilterd.length === 0
            ? `Niets gevonden voor “${zoek}”.`
            : `${gefilterd.length} ${gefilterd.length === 1 ? "product" : "producten"} gevonden.`}
        </p>
      ) : (
        <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
          Stel per ingrediënt een minimum en maximum in. Zodra de voorraad onder het minimum komt, verschijnt het automatisch op de boodschappenlijst.
        </p>
      )}

      {/* Een kliekje weggooien is eten weggooien dat je zelf hebt gekookt.
          Dat verdient dezelfde drempel als andere onomkeerbare dingen. */}
      {teVerwijderen && (
        <Modal title="Weggooien?" onClose={() => setTeVerwijderen(null)}>
          <div>
            {[(() => {
              const isKliekje = !!teVerwijderen.sourceRecipeId;
              const porties = Number(teVerwijderen.current) || 0;
              const bakjes = (teVerwijderen.containers || []);
              return (
                <div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 11,
                    background: isKliekje ? C.warnBg : C.cardBg,
                    border: `1.5px solid ${isKliekje ? C.brick : C.borderTint}`,
                    borderRadius: 14, padding: "12px 13px", marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{isKliekje ? "🍱" : "📦"}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: C.ink }}>
                        {teVerwijderen.name}
                      </span>
                      <span style={{ display: "block", fontSize: 12, color: C.inkSoft }}>
                        {porties} {teVerwijderen.unit}
                        {bakjes.length ? ` \u00b7 bakje ${bakjesTekst(bakjes)}` : ""}
                      </span>
                    </span>
                  </div>

                  {isKliekje ? (
                    <p style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55, margin: "0 0 14px" }}>
                      Dit is eten dat je zelf hebt gekookt. Gooi je het hier weg, dan is het uit je
                      voorraad — ook als het nog in je vriezer of koelkast staat.
                      {bakjes.length ? ` Bakje ${bakjesTekst(bakjes)} komt weer vrij.` : ""}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.55, margin: "0 0 14px" }}>
                      Dit product verdwijnt uit je voorraad. Recepten die het gebruiken blijven gewoon bestaan.
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryButton tone="brick" onClick={() => { onDelete(teVerwijderen.id); setTeVerwijderen(null); }}>
                      Ja, weggooien
                    </PrimaryButton>
                    <GhostButton onClick={() => setTeVerwijderen(null)}>Annuleren</GhostButton>
                  </div>
                </div>
              );
            })()]}
          </div>
        </Modal>
      )}

      {!zoek && ernstigeBevindingen > 0 && (
        <button
          onClick={onOpenControle}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
            background: C.warnBg, border: `1.5px solid ${C.brick}`, borderRadius: 14,
            padding: "11px 13px", marginBottom: 12, cursor: "pointer", fontFamily: FONT_BODY,
          }}
        >
          <AlertTriangle size={17} color={C.brick} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.brick }}>
              {ernstigeBevindingen === 1 ? "Er is iets om na te kijken" : `Er zijn ${ernstigeBevindingen} dingen om na te kijken`}
            </span>
            <span style={{ display: "block", fontSize: 11.5, color: C.inkSoft }}>
              Tik om te bekijken en recht te zetten
            </span>
          </span>
        </button>
      )}

      {!zoek && depletionForecast.length > 0 && (
        <div style={{ background: C.successBg, border: `1.5px solid ${C.sage}`, borderRadius: 16, padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>📉</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.sage }}>Voorspelde uitputting</span>
            <Pill tone="auto">premium</Pill>
          </div>
          {depletionForecast.map((f) => (
            <div key={f.item.id} style={{ fontSize: 13, color: C.ink, marginBottom: 4 }}>
              <strong>{f.item.name}</strong> is op basis van jullie verbruik over ongeveer <strong>{f.daysLeft} dag{f.daysLeft !== 1 ? "en" : ""}</strong> op.
            </div>
          ))}
        </div>
      )}

      {!zoek && expirySuggestions.length > 0 && (
        <div style={{ background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <CalendarClock size={15} color={C.mustardDeep} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.mustardDeep }}>Bijna over de datum</span>
          </div>
          {expirySuggestions.map(({ item, daysLeft, recipes: matches }) => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: C.ink }}>
                <strong>{item.name}</strong>{" "}
                {daysLeft < 0 ? "is al verlopen" : daysLeft === 0 ? "is vandaag over de datum" : `is over ${daysLeft} dag${daysLeft > 1 ? "en" : ""} over de datum`}
              </div>
              {matches.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: C.inkSoft }}>Maak {daysLeft <= 0 ? "vandaag" : "op tijd"}:</span>
                  {matches.slice(0, 3).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onOpenRecipe && onOpenRecipe(r.id)}
                      style={{ background: C.cardBg, border: `1px solid ${C.mustard}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, color: C.mustardDeep, fontWeight: 600, cursor: "pointer" }}
                    >
                      {r.emoji || "🍽️"} {r.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Geen recept in je kookboek met dit ingrediënt.</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1 }}><PrimaryButton tone="mustard" full compact onClick={onScan}><Camera size={15} /> Scannen</PrimaryButton></div>
        <div style={{ flex: 1 }}><PrimaryButton full compact onClick={onNew}><Plus size={15} /> Toevoegen</PrimaryButton></div>
      </div>
      {isPremiumOn("photoInventory") && (
        <div style={{ marginBottom: 16 }}>
          <GhostButton onClick={onOpenShelfPhoto}><ImagePlus size={14} /> Koelkastscanner: hele voorraad bijwerken <Pill tone="auto">premium</Pill></GhostButton>
        </div>
      )}
      {[...cats, ...Object.keys(byCategory).filter((c) => !cats.includes(c))].map((cat) => {
        const items = byCategory[cat];
        if (!items || !items.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.blueSoft, marginBottom: 6, textTransform: "uppercase" }}>{cat}</div>
            <div style={{ background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }}>
              {items.map((item, idx) => {
                const low = item.current < item.min;
                const expDays = item.expiryDate ? daysUntil(item.expiryDate) : null;
                return (
                  <div key={item.id} onClick={() => onEdit(item)} style={{ padding: "10px 12px", borderBottom: idx < items.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, color: C.ink, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                        {item.name}
                        {item.onSale && <Tag size={12} color={C.mustardDeep} />}
                      </span>
                      {low && <AlertTriangle size={14} color={C.brick} />}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 4 }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: low ? C.brick : C.inkSoft }}>
                        {item.current} {item.unit} <span style={{ opacity: 0.6 }}>(min {item.min} · max {item.max})</span>
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {expDays !== null && expDays <= 5 && (
                          <Pill tone={expDays <= 0 ? "warn" : "auto"}>
                            <CalendarClock size={10} /> {expDays < 0 ? "verlopen" : expDays === 0 ? "vandaag" : `${expDays}d`}
                          </Pill>
                        )}
                        <button
                          aria-label={`${item.name} verwijderen`}
                          onClick={(e) => { e.stopPropagation(); setTeVerwijderen(item); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, margin: -8 }}
                        >
                          <Trash2 size={13} color={C.inkSoft} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InventoryForm({ initial, consumptionLog = [], inventory = [], nummertBakjes = false, bakjesAantal = 40, onCancel, onSave }) {
  const [name, setName] = useState(initial.name || "");
  const [category, setCategory] = useState(initial.category || CATEGORIES[0]);
  const [unit, setUnit] = useState(initial.unit || "stuks");
  const [current, setCurrent] = useState(initial.current ?? "");
  const [min, setMin] = useState(initial.min ?? "");
  const [max, setMax] = useState(initial.max ?? "");
  const [bakjes, setBakjes] = useState((initial.containers || []).join(", "));

  // Nummers horen bij de vriezer. Ook handig als een sticker loslaat en je het
  // nummer wilt wijzigen.
  const inVriezer = category === "Diepvries" || /^vriezer:/i.test(name);

  const geefVrijeNummers = () => {
    const aantal = Math.max(1, Math.round(Number(current) || 1));
    // Nummers van dit product zelf tellen niet als bezet — anders kun je ze
    // niet opnieuw toewijzen.
    const anderen = inventory.filter((i) => i.id !== initial.id);
    const vrij = kiesVrijeBakjes(anderen, aantal, bakjesAantal);
    setBakjes(vrij.join(", "));
  };

  // Alleen voorstellen als het iets toevoegt: wanneer er nog geen minimum staat.
  // Anders zou het bij elke bewerking in de weg zitten.
  const voorstel = useMemo(() => {
    if (Number(initial.min || 0) > 0) return null;
    return stelMinimumVoor({ name: initial.name || name, unit: initial.unit || unit }, consumptionLog);
  }, [initial, consumptionLog, name, unit]);
  const [barcode, setBarcode] = useState(initial.barcode || "");
  const [expiryDate, setExpiryDate] = useState(initial.expiryDate || "");
  const [onSale, setOnSale] = useState(initial.onSale || false);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState("");

  const canSave = name.trim() && current !== "" && min !== "" && max !== "";

  // Live zoeken in Open Food Facts (bevat veel NL-supermarktproducten) — alleen bij nieuw item
  useEffect(() => {
    if (initial.id) return;
    if (!name.trim() || name.trim().length < 3) { setSuggestions([]); setSearchError(""); return; }
    const handle = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await fetch(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(name.trim())}&page_size=6&langs=nl&fields=product_name,product_name_nl,brands,code`);
        if (!res.ok) throw new Error("zoek-fout");
        const data = await res.json();
        const hits = data.hits || data.products || [];
        const items = hits
          .map((p) => ({ product_name: p.product_name || p.product_name_nl || p.generic_name || "", brands: p.brands || "", code: p.code || p._id || "" }))
          .filter((p) => p.product_name)
          .slice(0, 6);
        setSuggestions(items);
        setShowSuggestions(true);
        if (!items.length) setSearchError("Geen producten gevonden voor deze zoekterm.");
      } catch (e) {
        setSuggestions([]);
        setSearchError("Kon geen verbinding maken om productsuggesties op te halen. Je kunt gewoon zelf de gegevens invullen.");
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(handle);
  }, [name, initial.id]);

  const pickSuggestion = async (p) => {
    setName(p.product_name);
    setCategory(guessCategory(p.product_name));
    if (p.code) {
      setBarcode(p.code);
      // Categorie verfijnen via Open Food Facts' eigen classificatie (stabiele, betrouwbare product-API)
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${p.code}.json?fields=categories_tags`);
        const data = await res.json();
        const tags = (data && data.product && data.product.categories_tags) || [];
        const offCategory = categoryFromOffTags(tags);
        if (offCategory) setCategory(offCategory);
      } catch (e) { /* stil negeren, gok op naam blijft staan */ }
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <Modal title={initial.id ? "Ingrediënt bewerken" : "Nieuw ingrediënt"} onClose={onCancel}>
      <Field label="Naam">
        <div style={{ position: "relative" }}>
          <input autoComplete="off"
            style={inputStyle}
            list="common-groceries"
            value={name}
            onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Bijv. Rijst — of typ 3+ letters voor productsuggesties"
          />
          <datalist id="common-groceries">{COMMON_GROCERY_ITEMS.map((n) => <option key={n} value={n} />)}</datalist>
          {searching && (
            <div style={{ position: "absolute", right: 10, top: 9 }}><PollepelLoader size={16} inline delay={0} /></div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, zIndex: 5, maxHeight: 220, overflowY: "auto", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }}>
              {suggestions.map((p, idx) => (
                <button
                  key={p.code || idx}
                  onClick={() => pickSuggestion(p)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", background: "none", border: "none", borderBottom: idx < suggestions.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 13, color: C.ink }}>{p.product_name}</div>
                  {p.brands && <div style={{ fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }}>{p.brands}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>
      {!initial.id && searchError && !searching && (
        <p style={{ fontSize: 12, color: C.inkSoft, marginTop: -8, marginBottom: 12 }}>{searchError}</p>
      )}
      {!initial.id && !searchError && (
        <p style={{ fontSize: 11, color: C.inkSoft, marginTop: -8, marginBottom: 12 }}>
          Productsuggesties komen uit Open Food Facts, een open database met o.a. veel Nederlandse supermarktproducten.
        </p>
      )}
      <Field label="Categorie">
        <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Eenheid">
        <select style={inputStyle} value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><Field label="Huidige voorraad"><input autoComplete="off" type="number" style={inputStyle} value={current} onChange={(e) => setCurrent(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Minimum"><input autoComplete="off" type="number" style={inputStyle} value={min} onChange={(e) => setMin(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Maximum"><input autoComplete="off" type="number" style={inputStyle} value={max} onChange={(e) => setMax(e.target.value)} /></Field></div>
      </div>

      {/* Het minimum bepaalt wanneer iets vanzelf op je boodschappenlijst komt.
          De app weet uit je verbruik hoeveel je van dit product gebruikt, dus
          die kan het voorstellen in plaats van erom te vragen. */}
      {voorstel && (
        <button
          onClick={() => { setMin(String(voorstel.minimum)); setMax(String(voorstel.maximum)); }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 9, width: "100%", textAlign: "left",
            background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14,
            padding: "11px 13px", marginBottom: 12, cursor: "pointer", fontFamily: FONT_BODY,
          }}
        >
          <span style={{ fontSize: 17, flexShrink: 0 }}>📉</span>
          <span>
            <span style={{ display: "block", fontSize: 13, color: C.ink, fontWeight: 600 }}>
              Voorstel: minimum {voorstel.minimum}, maximum {voorstel.maximum} {unit}
            </span>
            <span style={{ display: "block", fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45, marginTop: 1 }}>
              Jullie gebruiken hier ongeveer {voorstel.perWeek} {unit} per week van,
              gemeten over {voorstel.periodeDagen} dagen. Tik om over te nemen.
            </span>
          </span>
        </button>
      )}

      {nummertBakjes && inVriezer && (
        <>
          <Field label="Bakjes">
            <input
              autoComplete="off"
              style={inputStyle}
              value={bakjes}
              onChange={(e) => setBakjes(e.target.value)}
              placeholder="Bijvoorbeeld: 3, 4"
              inputMode="numeric"
            />
          </Field>
          <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "-4px 0 14px", flexWrap: "wrap" }}>
            <GhostButton onClick={geefVrijeNummers}>
              <Shuffle size={13} /> Geef me vrije nummers
            </GhostButton>
            <span style={{ fontSize: 11, color: C.inkSoft, flex: 1, minWidth: 120, lineHeight: 1.4 }}>
              De nummers van de stickers op je bakjes, gescheiden door komma's.
            </span>
          </div>
        </>
      )}

      <Field label="Barcode (optioneel, voor scannen)"><input autoComplete="off" style={inputStyle} value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Bijv. 8710400123456" /></Field>
      <Field label="Houdbaar tot (THT, optioneel)"><input autoComplete="off" type="date" style={inputStyle} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></Field>
      <button
        onClick={() => setOnSale((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", marginBottom: 8,
          background: onSale ? C.noteBg : C.cardBg, border: `1.5px solid ${onSale ? C.mustard : C.borderTint}`, borderRadius: 12, cursor: "pointer",
        }}
      >
        <Tag size={15} color={onSale ? C.mustardDeep : C.inkSoft} />
        <span style={{ fontSize: 13, color: onSale ? C.mustardDeep : C.ink, fontWeight: onSale ? 600 : 400 }}>Nu in de aanbieding</span>
      </button>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <PrimaryButton
          disabled={!canSave}
          onClick={() => {
            const minWaarde = Number(min) || 0;
            let maxWaarde = Number(max) || 0;
            // Een maximum onder het minimum is altijd een typefout, en een
            // stille: elke aankoop wordt dan afgetopt op dat lage getal.
            if (maxWaarde > 0 && maxWaarde < minWaarde) maxWaarde = minWaarde;
            // "3, 4" wordt [3, 4]. Onzin eruit filteren, dubbele eruit, gesorteerd.
            const bakjesLijst = [...new Set(
              String(bakjes).split(/[^0-9]+/).map(Number).filter((x) => x > 0)
            )].sort((a, b) => a - b);
            onSave({ ...initial, name: name.trim(), category, unit, current: Number(current) || 0, min: minWaarde, max: maxWaarde, barcode: barcode.trim(), expiryDate, onSale, containers: bakjesLijst });
          }}
        >
          <Check size={16} /> Opslaan
        </PrimaryButton>
        <GhostButton onClick={onCancel}>Annuleren</GhostButton>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- */
/*  Boodschappenlijst                                                */
/* ---------------------------------------------------------------- */

// Deze knoppen bedien je staand in een winkel, vaak met één hand. Het zichtbare
// vlak blijft klein zodat de regel niet log wordt, maar het aanraakvlak is ruim:
// een doorzichtige knop van 40 px met daarin het zichtbare vierkantje.
const stepKnop = {
  width: 40, height: 40, padding: 0, border: "none", background: "transparent",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0,
};

const stepVlak = {
  width: 24, height: 24, borderRadius: 8,
  display: "flex", alignItems: "center", justifyContent: "center",
  get border() { return `1.5px solid ${C.ceramicDark}`; },
  get background() { return C.cardBg; },
};

function BoodschappenView({ list, categories, onToggle, onRemove, onAddManual, onProcess, onChangeAmount, onSetAmount }) {
  const [editAmountId, setEditAmountId] = useState(null);
  const [editAmountValue, setEditAmountValue] = useState("");
  const cats = categories && categories.length ? categories : CATEGORIES;
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newUnit, setNewUnit] = useState("stuks");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    if (!categoryTouched && newName.trim().length >= 3) setNewCategory(guessCategory(newName));
  }, [newName, categoryTouched]);

  const byCategory = useMemo(() => {
    const map = {};
    cats.forEach((c) => (map[c] = []));
    list.forEach((item) => { (map[item.category] || (map[item.category] = [])).push(item); });
    // Binnen elke categorie: onafgevinkt eerst, zodat wat je nog moet halen bovenaan blijft staan
    Object.keys(map).forEach((c) => {
      map[c] = [...map[c]].sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1));
    });
    return map;
  }, [list, cats]);

  // Categorieën met nog iets te doen eerst; volledig afgevinkte categorieën schuiven naar het einde
  // en worden ingeklapt, zodat je tijdens het winkelen altijd bovenaan verder kunt.
  const orderedCatsForDisplay = useMemo(() => {
    // Ook categorieën die niet (meer) in de vaste lijst staan meenemen. Anders
    // verdwijnen producten stilzwijgend uit beeld terwijl ze wél meetellen in
    // het aantal op het tabblad — precies wat er gebeurde na het hernoemen
    // van de categorieën.
    const alle = [...cats, ...Object.keys(byCategory).filter((c) => !cats.includes(c))];
    const withItems = alle.filter((c) => byCategory[c] && byCategory[c].length > 0);
    const open = withItems.filter((c) => byCategory[c].some((i) => !i.checked));
    const done = withItems.filter((c) => byCategory[c].every((i) => i.checked));
    return [...open, ...done];
  }, [cats, byCategory]);

  const checkedCount = list.filter((i) => i.checked).length;

  const submitManual = () => {
    if (!newName.trim() || newAmount === "") return;
    // Leeg of onleesbaar getal wordt 1: een boodschap met hoeveelheid 0 zeg je
    // niets, en verdwijnt met de nieuwe min-knop meteen weer van de lijst.
    onAddManual({ name: newName.trim(), amount: Number(newAmount) || 1, unit: newUnit, category: newCategory });
    setNewName(""); setNewAmount(""); setCategoryTouched(false); setNewCategory(CATEGORIES[0]); setAdding(false);
  };

  const buildListText = () => {
    const body = cats.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return `${cat}:\n` + items.map((i) => `- ${i.name} (${i.amount} ${i.unit})`).join("\n");
    }).filter(Boolean).join("\n\n");
    return `Boodschappenlijst — Pollepel\n\n${body}`;
  };

  const buildChecklistText = () => {
    const dateStr = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
    const body = cats.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return `${cat.toUpperCase()}\n` + items.map((i) => `☐ ${i.name} (${i.amount} ${i.unit})`).join("\n");
    }).filter(Boolean).join("\n\n");
    return `Boodschappenlijst — Pollepel (${dateStr})\n\n${body}\n`;
  };

  const downloadList = () => {
    const blob = new Blob([buildChecklistText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boodschappenlijst-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareList = async () => {
    const text = buildListText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Boodschappenlijst", text });
        return;
      } catch (e) { /* geannuleerd of niet beschikbaar, val terug op kopiëren */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareMsg("Boodschappenlijst gekopieerd naar het klembord.");
    } catch (e) {
      setShareMsg("Kon niet automatisch kopiëren. Selecteer en kopieer de lijst handmatig.");
    }
    setTimeout(() => setShareMsg(""), 3500);
  };

  if (list.length === 0) {
    return (
      <div>
        <div style={{ textAlign: "center", padding: "40px 10px", color: C.inkSoft }}>
          <ShoppingCart size={28} color={C.ceramicDark} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13 }}>Boodschappenlijst is leeg. Kook een gerecht of voeg zelf iets toe — die verschijnen hier automatisch als voorraad onder het minimum komt.</p>
        </div>
        {adding ? (
          <ManualAddForm {...{ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched: () => setCategoryTouched(true), submitManual, onCancel: () => setAdding(false) }} />
        ) : (
          <PrimaryButton onClick={() => setAdding(true)} full><Plus size={16} /> Zelf iets toevoegen</PrimaryButton>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 14, display: "flex", gap: 8 }}>
        <button aria-label="Delen" onClick={shareList} title="Lijst delen / kopiëren" style={{ width: 44, height: 44, background: C.cardBg, border: `1.5px solid ${C.blue}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Share2 size={17} color={C.blue} />
        </button>
        <button aria-label="Downloaden" onClick={downloadList} title="Downloaden als afvinklijst" style={{ width: 44, height: 44, background: C.cardBg, border: `1.5px solid ${C.blue}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Download size={17} color={C.blue} />
        </button>
      </div>
      {shareMsg && <p style={{ fontSize: 12, color: C.inkSoft, marginTop: -8, marginBottom: 10 }}>{shareMsg}</p>}
      {orderedCatsForDisplay.map((cat) => {
        const items = byCategory[cat];
        if (!items || !items.length) return null;
        const isDone = items.every((i) => i.checked);
        if (isDone) {
          return (
            <div key={cat} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6, padding: "6px 2px", opacity: 0.6 }}>
              <CheckCircle2 size={13} color={C.sage} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.sage, textTransform: "uppercase" }}>{cat} — klaar ({items.length})</span>
            </div>
          );
        }
        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.blueSoft, marginBottom: 6, textTransform: "uppercase" }}>{cat}</div>
            <div style={{ background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: idx < items.length - 1 ? `1px solid ${C.ceramic}` : "none" }}>
                  <button onClick={() => onToggle(item.id)} style={{
                    width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${item.checked ? C.sage : C.ceramicDark}`,
                    background: item.checked ? C.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
                  }}>
                    {item.checked && <Check size={13} color="#fff" />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0, textDecoration: item.checked ? "line-through" : "none", opacity: item.checked ? 0.55 : 1 }}>
                    <div style={{ fontSize: 14, color: C.ink }}>
                {item.name}
                {(item.containers || []).length > 0 && (
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.blueSoft, marginLeft: 6 }}>
                    bakje {bakjesTekst(item.containers)}
                  </span>
                )}
              </div>

                    {/* Aantal aanpassen in de winkel: knopjes voor snel bijstellen,
                        of tik het getal aan om het zelf in te typen. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <button
                        aria-label={`Minder ${item.name}`}
                        onClick={() => onChangeAmount(item.id, -1)}
                        style={stepKnop}
                      >
                        <span style={stepVlak}><Minus size={13} color={C.inkSoft} /></span>
                      </button>

                      {editAmountId === item.id ? (
                        <input
                          autoComplete="off"
                          type="number"
                          inputMode="decimal"
                          autoFocus
                          value={editAmountValue}
                          onChange={(e) => setEditAmountValue(e.target.value)}
                          onBlur={() => { onSetAmount(item.id, editAmountValue); setEditAmountId(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                          style={{
                            width: 58, padding: "2px 6px", borderRadius: 8,
                            border: `1.5px solid ${C.mustard}`, fontFamily: FONT_MONO, fontSize: 12,
                            background: C.cardBg, color: C.ink,
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => { setEditAmountId(item.id); setEditAmountValue(String(item.amount)); }}
                          title="Aantal aanpassen"
                          style={{
                            background: "none", border: "none", padding: "2px 4px", cursor: "pointer",
                            fontFamily: FONT_MONO, fontSize: 12, color: C.inkSoft,
                            borderBottom: `1px dashed ${C.ceramicDark}`,
                          }}
                        >
                          {item.amount} {item.unit}
                        </button>
                      )}

                      <button
                        aria-label={`Meer ${item.name}`}
                        onClick={() => onChangeAmount(item.id, 1)}
                        style={stepKnop}
                      >
                        <span style={stepVlak}><Plus size={13} color={C.inkSoft} /></span>
                      </button>
                    </div>
                  </div>
                  {item.auto && <Pill tone="auto">via voorraad</Pill>}
                  <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <X size={15} color={C.inkSoft} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {adding ? (
        <ManualAddForm {...{ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched: () => setCategoryTouched(true), submitManual, onCancel: () => setAdding(false) }} />
      ) : (
        <GhostButton onClick={() => setAdding(true)}><Plus size={14} /> Zelf iets toevoegen</GhostButton>
      )}

      {checkedCount > 0 && (
        <div style={{ marginTop: 14 }}>
          <PrimaryButton tone="sage" full onClick={onProcess}>
            <Check size={16} /> {checkedCount} artikel{checkedCount > 1 ? "en" : ""} afvinken &amp; voorraad bijwerken
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

function ImportModal({ importing, error, onCancel, onImportText, onImportUrl, onImportPhoto }) {
  const [mode, setMode] = useState("text"); // "text" | "url" | "photo"
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const cameraInputRef = React.useRef(null);
  const galleryInputRef = React.useRef(null);

  const canSubmit =
    mode === "text" ? text.trim().length > 20 :
    mode === "url" ? url.trim().startsWith("http") :
    !!photoFile;

  const handleSubmit = () => {
    if (!canSubmit || importing) return;
    if (mode === "text") onImportText(text);
    else if (mode === "url") onImportUrl(url.trim());
    else onImportPhoto(photoFile);
  };

  const handlePhotoSelected = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <Modal title="Recept importeren" onClose={onCancel} wide>
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
        Plak een receptlink, plak tekst, of maak/upload een foto — Pollepel zet het om naar het juiste format. Je krijgt het resultaat daarna te zien om te controleren voordat het wordt opgeslagen.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button
          onClick={() => setMode("url")}
          style={{
            flex: 1, padding: "8px 6px", borderRadius: 12, cursor: "pointer",
            border: `1.5px solid ${mode === "url" ? C.blue : C.ceramicDark}`,
            background: mode === "url" ? C.blue : C.cardBg, color: mode === "url" ? "#fff" : C.ink,
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <Link2 size={13} /> Link
        </button>
        <button
          onClick={() => setMode("text")}
          style={{
            flex: 1, padding: "8px 6px", borderRadius: 12, cursor: "pointer",
            border: `1.5px solid ${mode === "text" ? C.blue : C.ceramicDark}`,
            background: mode === "text" ? C.blue : C.cardBg, color: mode === "text" ? "#fff" : C.ink,
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <ClipboardPaste size={13} /> Tekst
        </button>
        <button
          onClick={() => setMode("photo")}
          style={{
            flex: 1, padding: "8px 6px", borderRadius: 12, cursor: "pointer",
            border: `1.5px solid ${mode === "photo" ? C.blue : C.ceramicDark}`,
            background: mode === "photo" ? C.blue : C.cardBg, color: mode === "photo" ? "#fff" : C.ink,
            fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <ImagePlus size={13} /> Foto
        </button>
      </div>

      {mode === "url" && (
        <Field label="Link naar het recept">
          <input autoComplete="off" style={inputStyle} placeholder="https://voorbeeld.nl/recept/spaghetti" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
      )}

      {mode === "text" && (
        <Field label="Plak de recepttekst (ingrediënten + bereiding)">
          <textarea
            style={{ ...inputStyle, minHeight: 160, resize: "vertical" }}
            placeholder="Plak hier de volledige recepttekst…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
      )}

      {mode === "photo" && (
        <div>
          <input autoComplete="off" ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} style={{ display: "none" }} />
          <input autoComplete="off" ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} style={{ display: "none" }} />

          {photoPreview ? (
            <div style={{ marginBottom: 10 }}>
              <img src={photoPreview} alt="Recept" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 14, border: `1.5px solid ${C.borderTint}`, background: C.ceramic }} />
              <div style={{ marginTop: 6 }}>
                <GhostButton onClick={() => { setPhotoFile(null); setPhotoPreview(""); }}><X size={13} /> Andere foto kiezen</GhostButton>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}><PrimaryButton full onClick={() => galleryInputRef.current && galleryInputRef.current.click()}><ImagePlus size={15} /> Foto kiezen</PrimaryButton></div>
              <div style={{ flex: 1 }}><GhostButton onClick={() => cameraInputRef.current && cameraInputRef.current.click()}><Camera size={15} /> Direct camera</GhostButton></div>
            </div>
          )}
          <p style={{ fontSize: 12, color: C.inkSoft, marginTop: -2 }}>
            Lukt "Direct camera" niet? Maak de foto eerst met je gewone camera-app en kies 'm daarna via "Foto kiezen". Zorg dat de tekst scherp en volledig in beeld is.
          </p>
        </div>
      )}

      {mode === "url" && (
        <p style={{ fontSize: 12, color: C.inkSoft, marginTop: -6 }}>
          Sommige sites blokkeren automatisch ophalen — lukt het niet, kopieer dan de tekst en gebruik "Tekst".
        </p>
      )}

      {error && (
        <div style={{ background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <PrimaryButton tone="mustard" disabled={!canSubmit || importing} onClick={handleSubmit}>
          {importing ? <PollepelLoader size={18} inline delay={0} /> : <Sparkles size={16} />}
          {importing ? "Bezig met herkennen…" : "Recept herkennen"}
        </PrimaryButton>
        <GhostButton onClick={onCancel}>Annuleren</GhostButton>
      </div>
    </Modal>
  );
}

function AIWeekmenuModal({ generating, progress, error, weekdayStyles, onSetWeekdayStyles, weekdaySoorten, onSetWeekdaySoorten, onCancel, onGenerate }) {
  const [dagenOpen, setDagenOpen] = useState(false);
  const verdeling = (weekdayStyles && weekdayStyles.length === 7) ? weekdayStyles : GEVARIEERDE_VERDELING;
  const soorten = (weekdaySoorten && weekdaySoorten.length === 7)
    ? weekdaySoorten
    : ["alles", "alles", "alles", "alles", "alles", "alles", "alles"];
  // Gevarieerd als standaard: dat is voor vrijwel iedereen de betere week.
  const [styleId, setStyleId] = useState("gevarieerd");
  const [scope, setScope] = useState("empty"); // "empty" | "all"

  return (
    <Modal title="AI: genereer weekmenu" onClose={onCancel} wide>
      <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
        Pollepel bedenkt per dag een avondgerecht. Hij zorgt voor afwisseling, houdt rekening met wat jullie niet lusten, en past de stijl aan per dag van de week.
      </p>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "4px 0 8px" }}>Stijl</div>
      {/* Gevarieerd staat apart en bovenaan: een hele week dezelfde stijl is
          zelden wat je wilt, maar het blijft wel te kiezen. */}
      <button
        onClick={() => setStyleId("gevarieerd")}
        style={{
          display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left",
          padding: "12px 13px", borderRadius: 14, cursor: "pointer", marginBottom: 8,
          border: `1.5px solid ${styleId === "gevarieerd" ? C.blue : C.borderTint}`,
          background: styleId === "gevarieerd" ? C.blue : C.cardBg,
          color: styleId === "gevarieerd" ? "#fff" : C.ink,
          fontFamily: FONT_BODY,
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>🎲</span>
        <span>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>Gevarieerd</span>
          <span style={{ display: "block", fontSize: 11.5, opacity: styleId === "gevarieerd" ? 0.9 : 0.75 }}>
            Elke dag een andere stijl: snel doordeweeks, uitgebreider in het weekend
          </span>
        </span>
      </button>

      {/* Welke stijl bij welke dag hoort verschilt per huishouden. De een kookt
          uitgebreid op zaterdag, de ander juist op woensdag. */}
      {styleId === "gevarieerd" && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setDagenOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
              color: C.blue, fontSize: 12.5, cursor: "pointer", fontFamily: FONT_BODY,
              padding: "6px 0", minHeight: 34,
            }}
          >
            {dagenOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Welke stijl op welke dag?
          </button>

          {dagenOpen && (
            <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 10, marginTop: 4 }}>
              {[1, 2, 3, 4, 5, 6, 0].map((wd) => (
                <div key={wd} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 62, fontSize: 12, color: C.ink, flexShrink: 0 }}>
                    {DAG_LANG[wd].charAt(0).toUpperCase() + DAG_LANG[wd].slice(1)}
                  </span>
                  <select
                    style={{ ...inputStyle, fontSize: 12.5, padding: "7px 9px", flex: 1 }}
                    value={verdeling[wd]}
                    onChange={(e) => {
                      const nieuwe = [...verdeling];
                      nieuwe[wd] = e.target.value;
                      onSetWeekdayStyles(nieuwe);
                    }}
                  >
                    {MEAL_STYLES.map((s) => (
                      <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                    ))}
                  </select>
                  <select
                    style={{ ...inputStyle, fontSize: 12.5, padding: "7px 9px", flex: 1 }}
                    value={soorten[wd]}
                    onChange={(e) => {
                      const nieuwe = [...soorten];
                      nieuwe[wd] = e.target.value;
                      onSetWeekdaySoorten(nieuwe);
                    }}
                  >
                    {SOORTEN.map((s) => (
                      <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                    ))}
                  </select>
                </div>
              ))}
              <p style={{ fontSize: 11, color: C.inkSoft, margin: "6px 0 0", lineHeight: 1.45 }}>
                Dit wordt onthouden voor je huishouden.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {MEAL_STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyleId(s.id)}
            style={{
              textAlign: "left", padding: "10px 10px", borderRadius: 14, cursor: "pointer",
              border: `1.5px solid ${styleId === s.id ? C.blue : C.borderTint}`,
              background: styleId === s.id ? C.blue : C.cardBg,
              color: styleId === s.id ? "#fff" : C.ink,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }}>Welke dagen?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setScope("empty")}
          style={{
            flex: 1, padding: "9px 8px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${scope === "empty" ? C.blue : C.borderTint}`,
            background: scope === "empty" ? C.blue : C.cardBg, color: scope === "empty" ? "#fff" : C.ink,
          }}
        >
          Alleen lege dagen
        </button>
        <button
          onClick={() => setScope("all")}
          style={{
            flex: 1, padding: "9px 8px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${scope === "all" ? C.blue : C.borderTint}`,
            background: scope === "all" ? C.blue : C.cardBg, color: scope === "all" ? "#fff" : C.ink,
          }}
        >
          Hele week (overschrijven)
        </button>
      </div>

      {generating && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <PollepelLoader size={20} inline delay={0} />
          <span style={{ fontSize: 13, color: C.ink }}>{progress || "Bezig…"}</span>
        </div>
      )}

      {error && !generating && (
        <div style={{ background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <PrimaryButton tone="mustard" disabled={generating} onClick={() => onGenerate({ styleId, scope })}>
          {generating ? <PollepelLoader size={17} inline delay={0} /> : <Wand2 size={16} />}
          {generating ? "Bezig…" : "Genereer weekmenu"}
        </PrimaryButton>
        <GhostButton onClick={onCancel}>{generating ? "Sluiten" : "Annuleren"}</GhostButton>
      </div>
    </Modal>
  );
}

function ScanModal({ inventory, onClose, onConsume, onRestock, onCreate }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectorRef = React.useRef(null);
  const lastHitRef = React.useRef({ code: "", at: 0 });
  const busyRef = React.useRef(false);

  const [phase, setPhase] = useState("intro"); // intro | scanning | found | done
  const [code, setCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [decoderKind, setDecoderKind] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [offName, setOffName] = useState("");
  const [amount, setAmount] = useState(1);
  const [doneMsg, setDoneMsg] = useState("");
  const [flash, setFlash] = useState("");        // korte bevestiging tijdens doorscannen
  const [session, setSession] = useState([]);    // wat er deze sessie is gescand

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [newUnit, setNewUnit] = useState("stuks");
  const [newCurrent, setNewCurrent] = useState(1);
  const [newMin, setNewMin] = useState(1);
  const [newMax, setNewMax] = useState(5);

  useEffect(() => {
    if (!categoryTouched && newName.trim().length >= 3) setNewCategory(guessCategory(newName));
  }, [newName, categoryTouched]);

  const matchedItem = code ? inventory.find((i) => i.barcode && i.barcode === code) : null;

  // ---- Camera aan/uit ----
  useEffect(() => {
    if (phase !== "scanning") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
        }
      } catch (e) {
        setCameraError(
          e && e.name === "NotAllowedError"
            ? "Geen toestemming voor de camera. Sta cameratoegang toe voor deze site en probeer het opnieuw — of voer de cijfers hieronder handmatig in."
            : "De camera kon niet worden gestart. Voer de cijfers hieronder handmatig in."
        );
        setPhase("intro");
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    };
  }, [phase]);

  // ---- Detectielus: videoframe -> canvas -> decoder ----
  useEffect(() => {
    if (phase !== "scanning" || !detectorRef.current) return;
    let active = true;
    const tick = async () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2 && !busyRef.current) {
        busyRef.current = true;
        try {
          // Alleen de middelste strook, teruggeschaald: sneller en dwingt netjes richten.
          const vw = video.videoWidth, vh = video.videoHeight;
          if (vw && vh) {
            const cropH = Math.round(vh * 0.4);
            const cropY = Math.round((vh - cropH) / 2);
            const targetW = Math.min(640, vw);
            const scale = targetW / vw;
            canvas.width = targetW;
            canvas.height = Math.round(cropH * scale);
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(video, 0, cropY, vw, cropH, 0, 0, canvas.width, canvas.height);
            const value = await detectorRef.current.detect(canvas);
            if (value && window.barcodeDecoder.checksumOk(value)) handleDetected(value);
          }
        } catch (e) { /* frame overslaan */ }
        busyRef.current = false;
      }
      if (active) setTimeout(tick, 250);
    };
    tick();
    return () => { active = false; };
  }, [phase, inventory]);

  const startScanning = async () => {
    setCameraError("");
    setPreparing(true);
    try {
      const d = await window.barcodeDecoder.prepare();
      detectorRef.current = d;
      setDecoderKind(d.kind);
      setPhase("scanning");
    } catch (e) {
      setCameraError("De scanner-module kon niet worden geladen (controleer je internetverbinding). Handmatig invoeren werkt wel.");
    } finally {
      setPreparing(false);
    }
  };

  const lookupProductName = async (c) => {
    setLookupLoading(true);
    setOffName("");
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=product_name,product_name_nl,categories_tags`);
      const data = await res.json();
      const name = (data && data.product && (data.product.product_name_nl || data.product.product_name)) || "";
      const tags = (data && data.product && data.product.categories_tags) || [];
      setOffName(name);
      if (name) { setNewName(name); setNewCategory(categoryFromOffTags(tags) || guessCategory(name)); setCategoryTouched(true); }
    } catch (e) {
      setOffName("");
    } finally {
      setLookupLoading(false);
    }
  };

  // Bekend product: direct bijboeken en gewoon doorscannen.
  // Onbekend product: even pauzeren, want daar is invoer voor nodig.
  const handleDetected = (c) => {
    const now = Date.now();
    if (lastHitRef.current.code === c && now - lastHitRef.current.at < 3000) return;
    lastHitRef.current = { code: c, at: now };

    const match = inventory.find((i) => i.barcode && i.barcode === c);
    if (match && phase === "scanning") {
      onRestock(match.id, 1);
      setSession((s) => [{ name: match.name, unit: match.unit, qty: 1, at: now }, ...s.filter((x) => x.name !== match.name).slice(0, 5)]);
      setFlash(`${match.name} +1 ${match.unit}`);
      if (navigator.vibrate) navigator.vibrate(40);
      setTimeout(() => setFlash(""), 1600);
      return;
    }
    setCode(c);
    setAmount(1);
    setPhase("found");
    if (!match) lookupProductName(c);
  };

  const backToScan = () => {
    setCode(""); setOffName(""); setNewName(""); setDoneMsg("");
    lastHitRef.current = { code: "", at: Date.now() };
    setPhase(detectorRef.current ? "scanning" : "intro");
  };

  const stepper = (value, setValue, unitLabel) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", margin: "10px 0" }}>
      <button onClick={() => setValue(Math.max(0, round2(value - 1)))} style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }}><Minus size={16} /></button>
      <div style={{ minWidth: 70, textAlign: "center", fontFamily: FONT_MONO, fontSize: 16 }}>{value} {unitLabel}</div>
      <button onClick={() => setValue(round2(value + 1))} style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }}><Plus size={16} /></button>
    </div>
  );

  return (
    <Modal title="Barcode scannen" onClose={onClose}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {phase === "scanning" && (
        <div>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "3/4" }}>
            <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: "30% 8%", border: `2px solid ${C.mustard}`, borderRadius: 14, boxShadow: "0 0 0 999px rgba(0,0,0,0.28)" }} />
            {flash && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: C.sage, color: "#fff", padding: "10px 12px", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                <CheckCircle2 size={16} style={{ verticalAlign: -3, marginRight: 6 }} />{flash}
              </div>
            )}
          </div>

          <p style={{ fontSize: 13, color: C.inkSoft, textAlign: "center", margin: "10px 0 6px" }}>
            <ScanLine size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            Houd de streepjescode in het kader. Bekende producten worden meteen bijgeboekt — scan er gerust meerdere achter elkaar.
          </p>

          {session.length > 0 && (
            <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 4 }}>Deze sessie bijgeboekt:</div>
              {session.map((s, i) => (
                <div key={i} style={{ fontSize: 13, padding: "2px 0" }}>
                  <CheckCircle2 size={12} color={C.sage} style={{ verticalAlign: -1, marginRight: 5 }} />
                  {s.name} <span style={{ fontFamily: FONT_MONO, color: C.inkSoft }}>+{s.qty} {s.unit}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <GhostButton onClick={() => setPhase("intro")}>Handmatig invoeren</GhostButton>
            <GhostButton onClick={onClose}>Klaar</GhostButton>
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div>
          {cameraError && (
            <div style={{ background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10 }}>
              {cameraError}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <PrimaryButton onClick={startScanning} disabled={preparing}>
              <Camera size={16} /> {preparing ? "Scanner laden…" : "Camera starten"}
            </PrimaryButton>
          </div>

          <p style={{ fontSize: 13, color: C.inkSoft, marginTop: 0 }}>
            Of voer de cijfers onder de streepjescode in:
          </p>
          <Field label="Barcode">
            <input autoComplete="off" style={inputStyle} value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Bijv. 8710400123456" inputMode="numeric" />
          </Field>
          <PrimaryButton disabled={!manualCode.trim()} onClick={() => { setPhase("intro"); handleDetected(manualCode.trim()); }}>
            <Search size={16} /> Opzoeken
          </PrimaryButton>
        </div>
      )}

      {phase === "found" && matchedItem && (
        <div>
          <p style={{ fontSize: 13, color: C.ink, marginTop: 0 }}>Herkend als bestaand voorraaditem:</p>
          <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{matchedItem.name}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.inkSoft }}>Huidige voorraad: {matchedItem.current} {matchedItem.unit}</div>
          </div>
          {stepper(amount, setAmount, matchedItem.unit)}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <PrimaryButton tone="sage" onClick={() => { onRestock(matchedItem.id, amount); setDoneMsg(`${amount} ${matchedItem.unit} ${matchedItem.name} toegevoegd aan voorraad.`); setPhase("done"); }}>
              <ArrowUpCircle size={16} /> Voorraad aanvullen
            </PrimaryButton>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton tone="brick" onClick={() => { onConsume(matchedItem.id, amount); setDoneMsg(`${amount} ${matchedItem.unit} ${matchedItem.name} afgeboekt van voorraad.`); setPhase("done"); }}>
              <ArrowDownCircle size={16} /> Afboeken (buiten gerecht om)
            </PrimaryButton>
          </div>
          <div style={{ marginTop: 12 }}><GhostButton onClick={backToScan}>Verder scannen</GhostButton></div>
        </div>
      )}

      {phase === "found" && !matchedItem && (
        <div>
          <p style={{ fontSize: 13, color: C.ink, marginTop: 0 }}>
            Onbekende barcode ({code}). {lookupLoading ? "Productnaam opzoeken…" : offName ? "Gevonden via Open Food Facts:" : "Niet gevonden — vul zelf de gegevens in:"}
          </p>
          <Field label="Naam">
            <input autoComplete="off" style={inputStyle} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={lookupLoading ? "Bezig met zoeken…" : "Productnaam"} />
          </Field>
          <Field label="Categorie">
            <select style={inputStyle} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategoryTouched(true); }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Eenheid">
            <select style={inputStyle} value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}><Field label="Huidige voorraad"><input autoComplete="off" type="number" style={inputStyle} value={newCurrent} onChange={(e) => setNewCurrent(e.target.value)} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Minimum"><input autoComplete="off" type="number" style={inputStyle} value={newMin} onChange={(e) => setNewMin(e.target.value)} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Maximum"><input autoComplete="off" type="number" style={inputStyle} value={newMax} onChange={(e) => setNewMax(e.target.value)} /></Field></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <PrimaryButton
              disabled={!newName.trim()}
              onClick={() => {
                onCreate({ name: newName.trim(), category: newCategory, unit: newUnit, current: Number(newCurrent) || 0, min: Number(newMin) || 0, max: Number(newMax) || 1, barcode: code });
                setDoneMsg(`${newName.trim()} toegevoegd aan de voorraad en gekoppeld aan deze barcode.`);
                setPhase("done");
              }}
            >
              <Plus size={16} /> Toevoegen aan voorraad
            </PrimaryButton>
            <GhostButton onClick={backToScan}>Annuleren</GhostButton>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ textAlign: "center", padding: "16px 6px" }}>
          <CheckCircle2 size={32} color={C.sage} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: C.ink }}>{doneMsg}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            <PrimaryButton onClick={backToScan}><ScanLine size={16} /> Verder scannen</PrimaryButton>
            <GhostButton onClick={onClose}>Klaar</GhostButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ManualAddForm({ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched, submitManual, onCancel }) {
  return (
    <div style={{ background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 10, marginTop: 8 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input autoComplete="off" style={{ ...inputStyle, flex: 1 }} placeholder="Naam" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <VoiceInputButton onResult={(text) => setNewName(text)} title="Naam inspreken" />
        <input autoComplete="off" type="number" style={{ ...inputStyle, width: 64 }} placeholder="Aantal" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <select style={{ ...inputStyle, flex: 1 }} value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select style={{ ...inputStyle, flex: 1 }} value={newCategory} onChange={(e) => { setNewCategory(e.target.value); if (onCategoryTouched) onCategoryTouched(); }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <PrimaryButton onClick={submitManual}><Plus size={14} /> Toevoegen</PrimaryButton>
        <GhostButton onClick={onCancel}>Annuleren</GhostButton>
      </div>
    </div>
  );
}

// De hele app in de vangnet-component, zodat een fout in één scherm niet de
// rest onbereikbaar maakt.
export default function App(props) {
  return (
    <ErrorBoundary>
      <AppInner {...props} />
    </ErrorBoundary>
  );
}
