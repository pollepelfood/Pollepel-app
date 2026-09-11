import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChefHat,
  Star,
  Plus,
  Minus,
  Trash2,
  Check,
  ShoppingCart,
  Package,
  Clock,
  Users,
  Search,
  X,
  Pencil,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  Flame,
  CheckCircle2,
  Sparkles,
  Link2,
  ClipboardPaste,
  Camera,
  ScanLine,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  Share2,
  Download,
  Sandwich,
  ClipboardList,
  ImagePlus,
  Wand2,
  Settings,
  Copy,
  LogOut,
  Printer,
  UserPlus,
  Shuffle,
  WifiOff,
  CalendarClock,
  StickyNote,
  Sun,
  Moon,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Tag,
  Mic,
  Timer as TimerIcon,
  SlidersHorizontal
} from "lucide-react";
const UNITS = ["stuks", "g", "kg", "ml", "l", "eetlepel", "theelepel", "snufje"];
const WEEK_DAYS = [
  { key: "ma", label: "Maandag" },
  { key: "di", label: "Dinsdag" },
  { key: "wo", label: "Woensdag" },
  { key: "do", label: "Donderdag" },
  { key: "vr", label: "Vrijdag" },
  { key: "za", label: "Zaterdag" },
  { key: "zo", label: "Zondag" }
];
const DAG_KORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const DAG_LANG = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MAAND_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const MAAND_LANG = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
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
function periodStart(datum, shoppingDay) {
  const d = startOfDay(datum);
  const verschil = (d.getDay() - Number(shoppingDay) + 7) % 7;
  return addDays(d, -verschil);
}
function planningPeriods(shoppingDay, aantal = 4, vandaag = /* @__PURE__ */ new Date()) {
  const eerste = periodStart(vandaag, shoppingDay);
  return Array.from({ length: aantal }, (_, i) => {
    const start = addDays(eerste, i * 7);
    const eind = addDays(start, 6);
    return {
      index: i,
      start,
      eind,
      startKey: dateKey(start),
      dagen: Array.from({ length: 7 }, (_2, n) => addDays(start, n))
    };
  });
}
function kortDatum(d) {
  return `${d.getDate()} ${MAAND_KORT[d.getMonth()]}`;
}
function periodeLabel(start, eind) {
  const zelfdeMaand = start.getMonth() === eind.getMonth();
  const eersteDeel = `${DAG_LANG[start.getDay()]} ${start.getDate()}${zelfdeMaand ? "" : " " + MAAND_LANG[start.getMonth()]}`;
  return `${eersteDeel} t/m ${DAG_LANG[eind.getDay()]} ${eind.getDate()} ${MAAND_LANG[eind.getMonth()]}`;
}
const MEAL_STYLES = [
  { id: "snel", label: "Eenvoudig en snel", icon: "\u26A1", description: "klaar binnen circa 20-25 minuten, weinig ingredi\xEBnten en minimale voorbereiding" },
  { id: "gezond", label: "Gezond", icon: "\u{1F966}", description: "veel groenten en volwaardige eiwitten, weinig bewerkte producten, in balans" },
  { id: "miseplace", label: "Mise en place", icon: "\u{1F52A}", description: "onderdelen zijn vooraf te snijden, marineren of portioneren \u2014 geschikt om een deel al eerder voor te bereiden" },
  { id: "uitgebreid", label: "Uitgebreid", icon: "\u{1F377}", description: "meer tijd en stappen, een verfijnder gerecht, gerust wat meer ingredi\xEBnten en een langere bereiding" }
];
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
  ["boerenkool", "spruitjes", "witlof", "rode kool", "andijvie", "pastinaak"]
];
function seasonalProduceNow() {
  return SEASONAL_PRODUCE[(/* @__PURE__ */ new Date()).getMonth()];
}
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
  "Overig"
];
const COMMON_GROCERY_ITEMS = [
  "Halfvolle melk",
  "Volle melk",
  "Karnemelk",
  "Boter",
  "Margarine",
  "Eieren",
  "Jong belegen kaas",
  "Oude kaas",
  "Roomkaas",
  "Mozzarella",
  "Bruin brood",
  "Wit brood",
  "Aardappelen",
  "Uien",
  "Knoflook",
  "Tomaten",
  "Komkommer",
  "Sla",
  "Wortels",
  "Paprika",
  "Appels",
  "Bananen",
  "Sinaasappels",
  "Citroenen",
  "Avocado",
  "Champignons",
  "Kipfilet",
  "Gehakt",
  "Spekjes",
  "Bacon",
  "Zalmfilet",
  "Tonijn in blik",
  "Spaghetti",
  "Macaroni",
  "Rijst",
  "Bloem",
  "Suiker",
  "Zout",
  "Peper",
  "Olijfolie",
  "Zonnebloemolie",
  "Azijn",
  "Mosterd",
  "Mayonaise",
  "Ketchup",
  "Sojasaus",
  "Couscous",
  "Rode linzen",
  "Kikkererwten (blik)",
  "Bruine bonen (blik)",
  "Yoghurt",
  "Kwark",
  "Slagroom",
  "Kookroom",
  "Pindakaas",
  "Jam",
  "Honing",
  "Koffie",
  "Thee",
  "Cornflakes",
  "Havermout",
  "Bouillonblokjes",
  "Tomatenblokjes (blik)",
  "Tomatenpuree",
  "Pastasaus",
  "Pesto"
];
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
  noteBg: "#FBF3E3"
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
  noteBg: "#332A18"
};
let C = { ...LIGHT_PALETTE };
function applyTheme(dark) {
  Object.assign(C, dark ? DARK_PALETTE : LIGHT_PALETTE);
  if (typeof document !== "undefined") {
    const bg = dark ? DARK_PALETTE.ceramic : LIGHT_PALETTE.ceramic;
    const tekst = dark ? DARK_PALETTE.ink : LIGHT_PALETTE.ink;
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    document.documentElement.style.color = tekst;
    document.body.style.color = tekst;
  }
}
const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Work Sans', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";
const TILE_GRADIENTS = [
  ["#1F3F66", "#4A6C8F"],
  ["#B5533C", "#D9A441"],
  ["#5E7F63", "#8AAE8E"],
  ["#B4832C", "#D9A441"],
  ["#152C48", "#4A6C8F"]
];
const uid = () => Math.random().toString(36).slice(2, 10);
const round2 = (n) => Math.round(n * 100) / 100;
const norm = (s) => (s || "").trim().toLowerCase();
const IRREGULAR_SINGULARS = {
  eieren: "ei",
  kinderen: "kind",
  bladeren: "blad",
  eiwitten: "eiwit",
  tenen: "teen",
  teentjes: "teentje"
};
const _variantCache = /* @__PURE__ */ new Map();
function wordVariants(w) {
  if (!w) return [];
  const uitCache = _variantCache.get(w);
  if (uitCache) return uitCache;
  const out = /* @__PURE__ */ new Set([w]);
  if (IRREGULAR_SINGULARS[w]) out.add(IRREGULAR_SINGULARS[w]);
  if (w.length > 3) {
    if (/tjes$/.test(w)) out.add(w.slice(0, -4));
    if (/jes$/.test(w)) out.add(w.slice(0, -3));
    if (/s$/.test(w) && !/ss$/.test(w)) out.add(w.slice(0, -1));
    if (/en$/.test(w)) {
      const stem = w.slice(0, -2);
      out.add(stem);
      if (/([bdfgklmnprst])\1$/.test(stem)) out.add(stem.slice(0, -1));
      if (/[aeiou][bcdfghjklmnpqrstvwxz]$/.test(stem) && stem.length >= 4) {
        out.add(stem.slice(0, -1) + stem.slice(-2, -1) + stem.slice(-1));
      }
    }
  }
  const lijst = [...out];
  if (_variantCache.size < 5e3) _variantCache.set(w, lijst);
  return lijst;
}
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
  ["kaas", "geraspte kaas"]
];
function nameWords(s) {
  return norm(s).replace(/\(.*?\)/g, " ").replace(/[^a-zà-ÿ\s-]/g, " ").replace(/-+/g, " ").split(/\s+/).filter(Boolean);
}
function wordsEqual(a, b) {
  if (a === b) return true;
  const va = wordVariants(a), vb = wordVariants(b);
  return va.some((x) => vb.includes(x));
}
const SYNONYM_INDEX = (() => {
  const index = /* @__PURE__ */ new Map();
  INGREDIENT_SYNONYMS.forEach((group) => {
    group.forEach((term) => {
      if (!index.has(term)) index.set(term, group);
      if (!term.includes(" ")) {
        wordVariants(term).forEach((v) => {
          if (!index.has(v)) index.set(v, group);
        });
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
const _matchCache = /* @__PURE__ */ new Map();
function namesMatch(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const sleutel = na < nb ? na + "\0" + nb : nb + "\0" + na;
  const bekend = _matchCache.get(sleutel);
  if (bekend !== void 0) return bekend;
  const uitkomst = namesMatchBerekenen(na, nb);
  if (_matchCache.size < 2e4) _matchCache.set(sleutel, uitkomst);
  return uitkomst;
}
function namesMatchBerekenen(na, nb) {
  const wa = nameWords(na), wb = nameWords(nb);
  if (!wa.length || !wb.length) return false;
  const ga = synonymGroup(wa), gb = synonymGroup(wb);
  if (ga && gb && ga === gb) return true;
  const shorter = wa.length <= wb.length ? wa : wb;
  const longer = shorter === wa ? wb : wa;
  if (shorter.every((s) => longer.some((l) => wordsEqual(s, l))) && shorter.length * 2 >= longer.length) return true;
  if (aaneenMatch(wa, wb)) return true;
  return false;
}
function aaneenMatch(wa, wb) {
  const kort = wa.length <= wb.length ? wa : wb;
  const lang = kort === wa ? wb : wa;
  const doel = kort.join("");
  if (doel.length < 6) return false;
  for (let start = 0; start < lang.length; start++) {
    let stuk = "";
    for (let eind = start; eind < lang.length; eind++) {
      stuk += lang[eind];
      if (stuk.length > doel.length + 3) break;
      if (eind === start) continue;
      if (stuk === doel) return true;
      if (wordVariants(stuk).includes(doel) || wordVariants(doel).includes(stuk)) return true;
    }
  }
  return false;
}
const STUK_GEWICHTEN = [
  ["teentje knoflook", 5],
  ["teen knoflook", 5],
  ["knoflookteen", 5],
  ["knoflookteentje", 5],
  ["laurierblad", 0.2],
  ["kruidnagel", 0.1],
  ["bosje peterselie", 30],
  ["bosje bieslook", 15],
  ["bosje koriander", 30],
  ["chilipeper", 15],
  ["rode peper", 15],
  ["spaanse peper", 15],
  ["sjalotje", 25],
  ["sjalot", 25],
  ["lente-ui", 15],
  ["bosui", 15],
  ["rode ui", 100],
  ["ui", 100],
  ["uien", 100],
  ["eidooier", 18],
  ["eiwit", 33],
  ["eieren", 55],
  ["ei", 55],
  ["trostomaat", 100],
  ["cherrytomaatje", 15],
  ["cherrytomaat", 15],
  ["tomaat", 120],
  ["tomaten", 120],
  ["aardappel", 150],
  ["aardappelen", 150],
  ["wortel", 80],
  ["wortels", 80],
  ["winterpeen", 200],
  ["paprika", 150],
  ["courgette", 250],
  ["prei", 150],
  ["komkommer", 300],
  ["bleekselderij", 60],
  ["stengel bleekselderij", 60],
  ["venkelknol", 300],
  ["aubergine", 250],
  ["citroen", 100],
  ["limoen", 70],
  ["sinaasappel", 200],
  ["appel", 150],
  ["peer", 170],
  ["banaan", 120],
  ["avocado", 200],
  ["kipfilet", 150],
  ["kipfilets", 150],
  ["knoflook", 5],
  ["knoflookbol", 50],
  ["zalmfilet", 125],
  ["visfilet", 125],
  ["kabeljauwfilet", 125],
  ["witvis", 125],
  ["kipdijfilet", 100],
  ["kippenpoot", 200],
  ["drumstick", 100],
  ["speklap", 40],
  ["schnitzel", 120],
  ["hamburger", 100],
  ["gehaktbal", 90],
  ["braadworst", 90],
  ["rookworst", 275],
  ["knakworst", 25],
  ["cordon bleu", 150],
  ["saucijs", 90],
  ["plak ham", 20],
  ["ham", 20],
  ["witlof", 100],
  ["witlofstronk", 100],
  ["stronk witlof", 100],
  ["broccoli", 400],
  ["bloemkool", 800],
  ["spitskool", 700],
  ["venkel", 300],
  ["mais", 200],
  ["maiskolf", 200],
  ["radijs", 8],
  ["biet", 150],
  ["rode biet", 150],
  ["pastinaak", 150],
  ["knolselderij", 700],
  ["koolrabi", 300],
  ["artisjok", 300],
  ["mozzarella", 125],
  ["bol mozzarella", 125],
  ["burrata", 125],
  ["wrap", 40],
  ["tortilla", 40],
  ["pitabroodje", 60],
  ["pita", 60],
  ["boterham", 35],
  ["snee brood", 35],
  ["broodje", 60],
  ["bagel", 85],
  ["beschuit", 10],
  ["cracker", 8],
  ["rijstwafel", 8],
  ["bouillonblokje", 4],
  ["bouillonblokjes", 4],
  ["stockcube", 4],
  ["blik", 400],
  ["blikje", 400],
  ["pot", 350],
  ["potje", 350],
  ["pak", 500],
  ["tomatenblokjes", 400],
  ["kokosmelk", 400]
];
function stukGewicht(naam) {
  const woorden = nameWords(naam);
  if (!woorden.length) return null;
  let beste = null;
  for (const [sleutel, gram] of STUK_GEWICHTEN) {
    const sleutelWoorden = sleutel.split(" ");
    const raak = sleutelWoorden.every(
      (sw) => woorden.some((w) => wordsEqual(w, sw))
    );
    if (raak && (!beste || sleutel.length > beste.sleutel.length)) beste = { sleutel, gram };
  }
  return beste ? beste.gram : null;
}
const UNIT_BASE = {
  g: 1,
  kg: 1e3,
  ml: 1,
  l: 1e3,
  eetlepel: 15,
  theelepel: 5,
  snufje: 0.5
};
const UNIT_KIND = {
  g: "massa",
  kg: "massa",
  ml: "volume",
  l: "volume",
  // Een eetlepel meten we in milliliters, maar voor droge kruiden komt dat
  // dicht genoeg bij grammen om bruikbaar te zijn.
  eetlepel: "maat",
  theelepel: "maat",
  snufje: "maat"
};
function vergelijkbaar(a, b) {
  const ka = UNIT_KIND[a], kb = UNIT_KIND[b];
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  return ka === "maat" || kb === "maat";
}
function convertAmount(amount, fromUnit, toUnit) {
  const f = (fromUnit || "").toLowerCase(), t = (toUnit || "").toLowerCase();
  if (f === t) return Number(amount || 0);
  if (vergelijkbaar(f, t)) {
    return Number(amount || 0) * UNIT_BASE[f] / UNIT_BASE[t];
  }
  return null;
}
function findInventoryMatch(inventory, ing) {
  if (!ing) return null;
  if (ing.inventoryItemId) {
    const linked = inventory.find((i) => i.id === ing.inventoryItemId);
    if (linked) return linked;
  }
  const kandidaten = inventory.filter((i) => namesMatch(i.name, ing.name));
  if (!kandidaten.length) return null;
  if (kandidaten.length === 1) return kandidaten[0];
  const gevraagd = norm(ing.name);
  const score = (item) => {
    let s = 0;
    const naam = norm(item.name);
    if (naam === gevraagd) s += 100;
    else if (nameWords(naam).length === nameWords(gevraagd).length) s += 20;
    if (convertAmount(1, ing.unit, item.unit) !== null) s += 30;
    if (Number(item.current || 0) > 0) s += 15;
    s -= Math.abs(naam.length - gevraagd.length) * 0.2;
    return s;
  };
  return [...kandidaten].sort((a, b) => score(b) - score(a))[0];
}
function stockVsNeed(item, ing, scale = 1) {
  if (!item) return null;
  const gevraagd = Number(ing.amount || 0) * scale;
  const need = convertAmount(gevraagd, ing.unit, item.unit);
  if (need !== null) return { have: Number(item.current || 0), need, unit: item.unit };
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
  [["spaghetti", "pasta", "macaroni", "lasagne", "penne", "tagliatelle"], "\u{1F35D}"],
  [["soep", "bouillon"], "\u{1F372}"],
  [["salade", "sla"], "\u{1F957}"],
  [["kip", "kipfilet"], "\u{1F357}"],
  [["vis", "zalm", "tonijn", "garnaal", "garnalen"], "\u{1F41F}"],
  [["taart", "cake", "gebak", "koek"], "\u{1F370}"],
  [["brood", "bolletje", "toast"], "\u{1F35E}"],
  [["pizza"], "\u{1F355}"],
  [["curry"], "\u{1F35B}"],
  [["rijst", "risotto", "nasi"], "\u{1F35A}"],
  [["stamppot", "hutspot", "aardappel", "puree"], "\u{1F954}"],
  [["ei", "omelet", "eieren"], "\u{1F373}"],
  [["burger"], "\u{1F354}"],
  [["wrap", "burrito", "taco", "quesadilla"], "\u{1F32F}"],
  [["pannenkoek"], "\u{1F95E}"],
  [["biefstuk", "rund", "gehakt", "worst", "vlees"], "\u{1F969}"],
  [["taco"], "\u{1F32E}"],
  [["noedel", "mie", "ramen"], "\u{1F35C}"],
  [["dessert", "toetje", "pudding", "ijs"], "\u{1F368}"]
];
function suggestEmoji(name) {
  const n = norm(name);
  if (!n) return "\u{1F37D}\uFE0F";
  for (const [keywords, emoji] of EMOJI_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return emoji;
  }
  return "\u{1F37D}\uFE0F";
}
const CATEGORY_KEYWORDS = [
  [["vriezer", "diepvries", "ijsje", "ijstaart"], "Diepvries"],
  [[
    "kruidenmix",
    "kipkruiden",
    "aardappelkruiden",
    "gerookte paprika",
    "paprika pikant",
    "specerij",
    "kruiden"
  ], "Kruiden & specerijen"],
  [[
    "chocopasta",
    "hagelslag",
    "hagel",
    "pindakaas",
    "jam",
    "honing",
    "stroop",
    "siroop",
    "notenpasta",
    "appelstroop",
    "muisjes"
  ], "Ontbijt & broodbeleg"],
  [[
    "spaghetti",
    "macaroni",
    "penne",
    "tagliatelle",
    "fusilli",
    "tortelloni",
    "lasagne",
    "pasta",
    "rijst",
    "risotto",
    "couscous",
    "bulgur",
    "quinoa",
    "noedel",
    "mihoen",
    "wrap",
    "tortilla"
  ], "Pasta, rijst & wereldkeuken"],
  [[
    "kaas",
    "parmezaan",
    "boursin",
    "mozzarella",
    "feta",
    "brie",
    "camembert",
    "roomkaas",
    "geitenkaas"
  ], "Kaas"],
  [[
    "tofu",
    "tempeh",
    "seitan",
    "vegaburger",
    "vegetarische",
    "falafel",
    "vleesvervanger"
  ], "Vega & vleesvervangers"],
  [[
    "kip",
    "gehakt",
    "spek",
    "worst",
    "ham",
    "zalm",
    "tonijn",
    "vis",
    "garnaal",
    "garnalen",
    "kabeljauw",
    "biefstuk",
    "rund",
    "varkens",
    "kalkoen",
    "spareribs",
    "gehaktbal",
    "vlees",
    "bacon",
    "filet",
    "schnitzel",
    "hamburger",
    "makreel",
    "haring",
    "mosselen",
    "fuet",
    "salami",
    "rookvlees"
  ], "Vlees & vis"],
  [[
    "melk",
    "boter",
    "yoghurt",
    "kwark",
    "kookroom",
    "slagroom",
    "room",
    "cr\xE8mefra\xEEche",
    "margarine",
    "ei",
    "eieren",
    "zuivel",
    "vla",
    "pudding",
    "chocomel",
    "skyr"
  ], "Zuivel & eieren"],
  [[
    "brood",
    "pita",
    "kn\xE4ckebr\xF6d",
    "beschuit",
    "cracker",
    "toast",
    "croissant",
    "bagel",
    "stokbrood",
    "bolletjes"
  ], "Brood & bakkerij"],
  [[
    "bouillon",
    "passata",
    "tomatenpuree",
    "blik",
    "olijven",
    "sojasaus",
    "ketjap",
    "saus",
    "soep",
    "augurk",
    "zilverui",
    "mais",
    "bonen in blik",
    "kokosmelk"
  ], "Soepen, sauzen & conserven"],
  [[
    "chips",
    "nootjes",
    "noten",
    "walnoot",
    "walnut",
    "amandel",
    "pinda",
    "cashew",
    "borrelnoot",
    "zoutje"
  ], "Chips, noten & borrel"],
  [["koekje", "koek", "speculaas", "biscuit", "chocolade", "snoep", "drop", "reep"], "Koek & snoep"],
  [[
    "cola",
    "sap",
    "bier",
    "wijn",
    "koffie",
    "thee",
    "frisdrank",
    "limonade",
    "ranja",
    "sinas",
    "energiedrank",
    "smoothie",
    "drank",
    "water"
  ], "Dranken"],
  [["olijfolie", "zonnebloemolie", "sesamolie", "bakolie", "olie", "azijn", "balsamico"], "Olie, azijn & basis"],
  [[
    "suiker",
    "bloem",
    "tarwemeel",
    "bakpoeder",
    "gist",
    "vanillesuiker",
    "cacao",
    "amandelmeel"
  ], "Bakken & zoetwaren"],
  [[
    "afwasmiddel",
    "wasmiddel",
    "vuilniszak",
    "keukenrol",
    "wc-papier",
    "schoonmaak",
    "aluminiumfolie",
    "vaatwastablet"
  ], "Huishouden"],
  [["maaltijdsalade", "kant-en-klaar", "restje", "maaltijd"], "Maaltijden & salades"],
  [[
    "ui",
    "knoflook",
    "tomaat",
    "tomaten",
    "paprika",
    "komkommer",
    "wortel",
    "peen",
    "prei",
    "broccoli",
    "bloemkool",
    "appel",
    "banaan",
    "citroen",
    "limoen",
    "avocado",
    "champignon",
    "spinazie",
    "sla",
    "andijvie",
    "boerenkool",
    "witlof",
    "pompoen",
    "aardappel",
    "krieltjes",
    "courgette",
    "aubergine",
    "framboos",
    "druif",
    "druiven",
    "peer",
    "peren",
    "sinaasappel",
    "mandarijn",
    "gember",
    "koriander",
    "basilicum",
    "peterselie",
    "bieslook",
    "venkel",
    "rabarber",
    "spruit",
    "aardbei",
    "kers",
    "kersen",
    "meloen",
    "kiwi",
    "mango",
    "ananas",
    "perzik",
    "abrikoos",
    "bosbes",
    "bramen",
    "granaatappel",
    "groente",
    "fruit",
    "kool"
  ], "Groente & fruit"],
  [[
    "zout",
    "peper",
    "paprikapoeder",
    "kerrie",
    "komijn",
    "kaneel",
    "oregano",
    "tijm",
    "laurier",
    "nootmuskaat",
    "kurkuma",
    "kardemom",
    "sumak",
    "steranijs",
    "foelie",
    "jeneverbes",
    "sesamzaad",
    "chilivlokken",
    "garam",
    "masala"
  ], "Kruiden & specerijen"]
];
const OFF_CATEGORY_RULES = [
  [["fruit", "vegetable", "potato", "tomato", "onion", "fresh-produce", "salad", "herb-fresh"], "Groente & Fruit"],
  [["dairies", "dairy", "milk", "cheese", "yogurt", "yoghurt", "cream", "butter", "egg"], "Zuivel"],
  [["meat", "poultry", "fish", "seafood", "sausage", "ham", "beef", "pork", "chicken", "cold-cuts"], "Vlees & Vis"],
  [["bread", "pasta", "cereal", "rice", "flour", "noodle", "bakery"], "Bakkerij & Granen"],
  [["spice", "condiment", "sauce", "herb", "oil", "vinegar", "seasoning", "dressing"], "Kruiden & Specerijen"],
  [["frozen"], "Diepvries"],
  [["beverage", "drink", "juice", "soda", "water", "beer", "wine", "coffee", "tea"], "Drank"]
];
function guessCategory(name) {
  const n = norm(name);
  if (!n) return "Overig";
  const tokens = n.split(/[^a-zà-öø-ÿ]+/).filter(Boolean);
  for (const [keywords, category] of CATEGORY_KEYWORDS) {
    const matched = keywords.some(
      (k) => k.length <= 3 ? tokens.some((t) => t.startsWith(k)) : n.includes(k)
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
const PANTRY_BASICS = [
  "zout",
  "peper",
  "zwarte peper",
  "witte peper",
  "water",
  "suiker",
  "azijn",
  "olie",
  "olijfolie",
  "zonnebloemolie",
  "bakolie",
  "boter",
  "margarine",
  "bloem",
  "maizena",
  "kruiden",
  "specerijen",
  "paprikapoeder",
  "komijn",
  "kerrie",
  "kerriepoeder",
  "oregano",
  "tijm",
  "rozemarijn",
  "laurier",
  "laurierblad",
  "nootmuskaat",
  "kaneel",
  "chilipoeder",
  "mosterd",
  "honing",
  "sojasaus",
  "ketjap",
  "bouillon",
  "bouillonblokje",
  "bouillonblokjes"
];
function isPantryBasic(name) {
  const n = norm(name);
  if (!n) return false;
  return PANTRY_BASICS.some((b) => n === b || namesMatch(n, b));
}
function recipeReadiness(recipe, inventory, scale = 1) {
  const missing = [];
  const unknown = [];
  const estimated = [];
  let have = 0;
  let relevant = 0;
  (recipe.ingredients || []).forEach((ing) => {
    if (isPantryBasic(ing.name)) return;
    relevant += 1;
    const item = findInventoryMatch(inventory, ing);
    if (!item) {
      missing.push(ing.name);
      return;
    }
    const cmp = stockVsNeed(item, ing, scale);
    if (!cmp) {
      unknown.push(ing.name);
      return;
    }
    if (cmp.geschat) estimated.push(ing.name);
    if (cmp.have >= cmp.need) have += 1;
    else missing.push(ing.name);
  });
  return {
    have,
    relevant,
    missing,
    unknown,
    estimated,
    total: (recipe.ingredients || []).length,
    complete: relevant > 0 && missing.length === 0 && unknown.length === 0,
    canMake: relevant > 0 && missing.length === 0 && unknown.length === 0,
    tracked: relevant
  };
}
function parseSpokenDurationMinutes(text) {
  if (!text) return null;
  const n = text.toLowerCase();
  let totalMinutes = 0;
  let found = false;
  const hourMatch = n.match(/(\d+)\s*(uur|uren)/);
  if (hourMatch) {
    totalMinutes += Number(hourMatch[1]) * 60;
    found = true;
  }
  const minMatch = n.match(/(\d+)\s*(minuten|minuut|min)\b/);
  if (minMatch) {
    totalMinutes += Number(minMatch[1]);
    found = true;
  }
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
  return /* @__PURE__ */ jsx(
    "button",
    {
      "aria-label": "Invoeren met spraak",
      onClick: listening ? stop : start,
      title: title || "Spreek in",
      style: {
        width: 44,
        height: 44,
        borderRadius: 10,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1.5px solid ${listening ? C.brick : C.borderTint}`,
        background: listening ? C.brick : C.cardBg,
        flexShrink: 0
      },
      children: /* @__PURE__ */ jsx(Mic, { size, color: listening ? "#fff" : C.inkSoft })
    }
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
    checked: false
  };
  const next = [...shoppingArr];
  if (idx > -1) next[idx] = entry;
  else next.push(entry);
  return { list: next, added: true };
}
function reconcileShoppingForItem(shoppingArr, item) {
  if (item.current < item.min) {
    const { list, added } = pushLowStockToShopping(shoppingArr, item, item.current);
    return { list, changed: added };
  }
  const idx = shoppingArr.findIndex((s) => s.auto && namesMatch(s.name, item.name) && s.unit === item.unit);
  if (idx === -1) return { list: shoppingArr, changed: false };
  return { list: shoppingArr.filter((_, i) => i !== idx), changed: true };
}
const UNIT_ALIASES = {
  g: "g",
  gram: "g",
  gr: "g",
  kg: "kg",
  kilo: "kg",
  ml: "ml",
  l: "l",
  liter: "l",
  el: "eetlepel",
  eetlepel: "eetlepel",
  eetlepels: "eetlepel",
  eetl: "eetlepel",
  tl: "theelepel",
  theelepel: "theelepel",
  theelepels: "theelepel",
  snufje: "snufje",
  snuf: "snufje",
  stuk: "stuks",
  stuks: "stuks"
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
    const candidate = lines.find(
      (l) => l.length >= 4 && l.length <= 60 && !/^(stap|ingredi|bereiding|kookstappen)/i.test(l) && !JUNK_LINE_RE.test(l) && !bulletRe.test(l) && !STEP_HEADING_RE.test(l)
    );
    name = candidate || "Ge\xEFmporteerd recept";
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);
  const unitAlt = Object.keys(UNIT_ALIASES).sort((a, b) => b.length - a.length).join("|");
  const ingRegexWithUnit = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s+(${unitAlt})\\b\\.?\\s+(.+)$`, "i");
  const ingRegexNoUnit = /^(\d+(?:[.,]\d+)?)\s+(.+)$/;
  const ingRegex = ingRegexNoUnit;
  const seen = /* @__PURE__ */ new Set();
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
      const content = bulletMatch[1];
      const parsed2 = parseQuantityLine(content);
      if (parsed2) {
        addIngredient(parsed2.name, parsed2.amount, parsed2.unit);
        return;
      }
      const markerRe = new RegExp(`^(${NO_QUANTITY_MARKERS.join("|")})\\s+(.+)$`, "i");
      const markerMatch = content.match(markerRe);
      if (markerMatch) {
        addIngredient(markerMatch[2], 1, "snufje");
        return;
      }
      addIngredient(content, 1, "stuks");
      return;
    }
    const parsed = parseQuantityLine(line);
    if (parsed) addIngredient(parsed.name, parsed.amount, parsed.unit);
  });
  const steps = [];
  const stepChunks = sourceText.split(/stap\s*\d+\s*[:.]?/i).slice(1);
  stepChunks.forEach((chunk) => {
    const chunkLines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const contentLines = chunkLines.filter((l) => !ingRegex.test(l) && !bulletRe.test(l));
    const clean = contentLines.join(" ").replace(/\s+/g, " ").trim();
    if (clean) steps.push(clean.slice(0, 300));
  });
  if (!steps.length) {
    const headingIdx = lines.findIndex((l) => STEP_HEADING_RE.test(l));
    if (headingIdx > -1) {
      lines.slice(headingIdx + 1).forEach((l) => {
        if (bulletRe.test(l) || ingRegex.test(l) || JUNK_LINE_RE.test(l)) return;
        if (l.length >= 12) steps.push(l.slice(0, 300));
      });
    }
  }
  if (!steps.length) {
    const numbered = sourceText.match(/(?:^|\n)\s*\d+[.)]\s*([^\n]{5,200})/g);
    if (numbered) numbered.forEach((n) => steps.push(n.replace(/^\s*\d+[.)]\s*/, "").trim()));
  }
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
    steps: steps.slice(0, 10)
  };
}
const seedInventory = () => [
  { id: uid(), name: "Gehakt (half-om-half)", category: "Vlees & Vis", unit: "g", current: 300, min: 200, max: 1e3 },
  { id: uid(), name: "Ui", category: "Groente & Fruit", unit: "stuks", current: 4, min: 2, max: 6 },
  { id: uid(), name: "Knoflook", category: "Groente & Fruit", unit: "stuks", current: 3, min: 2, max: 8 },
  { id: uid(), name: "Tomatenblokjes (blik)", category: "Overig", unit: "stuks", current: 2, min: 2, max: 6 },
  { id: uid(), name: "Spaghetti", category: "Bakkerij & Granen", unit: "g", current: 500, min: 250, max: 1500 },
  { id: uid(), name: "Aardappelen", category: "Groente & Fruit", unit: "kg", current: 1.5, min: 1, max: 3 },
  { id: uid(), name: "Wortels", category: "Groente & Fruit", unit: "g", current: 400, min: 250, max: 1e3 },
  { id: uid(), name: "Rookworst", category: "Vlees & Vis", unit: "stuks", current: 2, min: 1, max: 4 },
  { id: uid(), name: "Rode linzen", category: "Bakkerij & Granen", unit: "g", current: 300, min: 200, max: 1e3 },
  { id: uid(), name: "Bouillonblokjes", category: "Kruiden & Specerijen", unit: "stuks", current: 4, min: 2, max: 10 },
  { id: uid(), name: "Kookroom", category: "Zuivel", unit: "ml", current: 200, min: 200, max: 600 }
];
const seedRecipes = () => [
  {
    id: uid(),
    name: "Spaghetti Bolognese",
    emoji: "\u{1F35D}",
    photoUrl: "",
    cookTime: 45,
    servings: 4,
    favorite: true,
    ingredients: [
      { name: "Gehakt (half-om-half)", amount: 400, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Knoflook", amount: 2, unit: "stuks" },
      { name: "Tomatenblokjes (blik)", amount: 2, unit: "stuks" },
      { name: "Spaghetti", amount: 400, unit: "g" }
    ],
    steps: [
      "Snipper de ui en hak de knoflook fijn.",
      "Bak het gehakt rul in een hete pan met een scheut olie.",
      "Voeg ui en knoflook toe en fruit 2 minuten mee.",
      "Voeg de tomatenblokjes toe en laat 25 minuten zachtjes sudderen.",
      "Kook ondertussen de spaghetti volgens de verpakking.",
      "Breng de saus op smaak met zout en peper en serveer over de spaghetti."
    ]
  },
  {
    id: uid(),
    name: "Hutspot met rookworst",
    emoji: "\u{1F955}",
    photoUrl: "",
    cookTime: 60,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Aardappelen", amount: 1, unit: "kg" },
      { name: "Wortels", amount: 400, unit: "g" },
      { name: "Ui", amount: 2, unit: "stuks" },
      { name: "Rookworst", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Schil de aardappelen en wortels en snijd in grove stukken.",
      "Snipper de uien.",
      "Kook alles samen ongeveer 20-25 minuten gaar in ruim water met zout.",
      "Verwarm de rookworst zoals aangegeven op de verpakking.",
      "Giet het groentemengsel af en stamp tot een grove puree.",
      "Breng op smaak met boter, peper en zout en serveer met de rookworst."
    ]
  },
  {
    id: uid(),
    name: "Romige rode-linzensoep",
    emoji: "\u{1F372}",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Rode linzen", amount: 250, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Knoflook", amount: 2, unit: "stuks" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Kookroom", amount: 200, unit: "ml" }
    ],
    steps: [
      "Snipper ui en knoflook en fruit glazig in een soeppan.",
      "Spoel de linzen af en voeg toe aan de pan.",
      "Voeg bouillon toe (blokjes + water) en breng aan de kook.",
      "Laat 20 minuten zachtjes koken tot de linzen zacht zijn.",
      "Pureer de soep glad met een staafmixer.",
      "Roer de kookroom erdoor en breng op smaak met peper en zout."
    ]
  },
  {
    id: uid(),
    name: "Macaroni met kaas en spek",
    emoji: "\u{1F9C0}",
    photoUrl: "",
    cookTime: 30,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Macaroni", amount: 350, unit: "g" },
      { name: "Spekjes", amount: 150, unit: "g" },
      { name: "Jong belegen kaas", amount: 150, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Kookroom", amount: 200, unit: "ml" }
    ],
    steps: [
      "Kook de macaroni volgens de verpakking beetgaar.",
      "Bak de spekjes en gesnipperde ui knapperig in een pan.",
      "Rasp de kaas en roer samen met de kookroom door de spekjes.",
      "Schep de afgegoten macaroni erdoorheen tot een romige massa.",
      "Breng op smaak met peper en serveer direct."
    ]
  },
  {
    id: uid(),
    name: "Zalm met broccoli en aardappelpuree",
    emoji: "\u{1F41F}",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Zalmfilet", amount: 4, unit: "stuks" },
      { name: "Broccoli", amount: 500, unit: "g" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Boter", amount: 30, unit: "g" },
      { name: "Citroen", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Schil en kook de aardappelen 20 minuten gaar.",
      "Stoom of kook de broccoliroosjes 8 minuten beetgaar.",
      "Bak de zalmfilets 4 minuten per kant in een beetje boter.",
      "Stamp de aardappelen met boter tot een gladde puree.",
      "Besprenkel de zalm met citroensap en serveer met puree en broccoli."
    ]
  },
  {
    id: uid(),
    name: "Kip-kerriesoep",
    emoji: "\u{1F35B}",
    photoUrl: "",
    cookTime: 30,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 300, unit: "g" },
      { name: "Kerriepoeder", amount: 1, unit: "eetlepel" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Kokosmelk", amount: 400, unit: "ml" },
      { name: "Bouillonblokjes", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Snijd de kipfilet in blokjes en snipper de ui.",
      "Fruit de ui met de kerriepoeder glazig in een soeppan.",
      "Voeg de kip toe en bak kort mee.",
      "Voeg kokosmelk en bouillon toe en laat 15 minuten sudderen.",
      "Breng op smaak met zout en peper en serveer warm."
    ]
  },
  {
    id: uid(),
    name: "Griekse salade met feta",
    emoji: "\u{1F957}",
    photoUrl: "",
    cookTime: 15,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Komkommer", amount: 1, unit: "stuks" },
      { name: "Tomaten", amount: 4, unit: "stuks" },
      { name: "Feta", amount: 200, unit: "g" },
      { name: "Rode ui", amount: 1, unit: "stuks" },
      { name: "Olijfolie", amount: 3, unit: "eetlepel" }
    ],
    steps: [
      "Snijd komkommer en tomaten in grove stukken.",
      "Snijd de rode ui in dunne ringen.",
      "Meng de groenten in een schaal en verkruimel de feta erover.",
      "Besprenkel met olijfolie en breng op smaak met zout en peper.",
      "Serveer direct, eventueel met wat olijven."
    ]
  },
  {
    id: uid(),
    name: "Shoarma van kipfilet met knoflooksaus",
    emoji: "\u{1F32F}",
    photoUrl: "",
    cookTime: 30,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 500, unit: "g" },
      { name: "Shoarmakruiden", amount: 1, unit: "eetlepel" },
      { name: "Wraps", amount: 8, unit: "stuks" },
      { name: "Komkommer", amount: 1, unit: "stuks" },
      { name: "Knoflooksaus", amount: 150, unit: "ml" }
    ],
    steps: [
      "Snijd de kipfilet in reepjes en meng met de shoarmakruiden.",
      "Bak de kip op hoog vuur 8-10 minuten gaar en goudbruin.",
      "Snijd de komkommer in dunne plakjes.",
      "Verwarm de wraps kort in een droge pan.",
      "Vul de wraps met kip, komkummer en knoflooksaus."
    ]
  },
  {
    id: uid(),
    name: "Vegetarische chili sin carne",
    emoji: "\u{1F336}\uFE0F",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kidneybonen (blik)", amount: 2, unit: "stuks" },
      { name: "Tomatenblokjes (blik)", amount: 2, unit: "stuks" },
      { name: "Paprika", amount: 2, unit: "stuks" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Chilipoeder", amount: 1, unit: "theelepel" }
    ],
    steps: [
      "Snipper de ui en snijd de paprika in blokjes.",
      "Fruit ui en paprika glazig in een pan met een scheut olie.",
      "Voeg de tomatenblokjes en chilipoeder toe.",
      "Spoel de bonen af en voeg toe aan de pan.",
      "Laat 20 minuten sudderen en breng op smaak met zout en peper."
    ]
  },
  {
    id: uid(),
    name: "Ovenschotel met witlof en ham",
    emoji: "\u{1F37D}\uFE0F",
    photoUrl: "",
    cookTime: 45,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Witlof", amount: 8, unit: "stuks" },
      { name: "Ham", amount: 8, unit: "stuks" },
      { name: "Jong belegen kaas", amount: 150, unit: "g" },
      { name: "Bloem", amount: 30, unit: "g" },
      { name: "Halfvolle melk", amount: 500, unit: "ml" }
    ],
    steps: [
      "Kook de witlof 10 minuten voor in gezouten water en giet af.",
      "Wikkel elke stronk witlof in een plak ham.",
      "Maak een bechamelsaus van boter, bloem en melk.",
      "Leg de rolletjes in een ovenschaal en giet de saus erover.",
      "Bestrooi met geraspte kaas en bak 20 minuten op 200\xB0C tot goudbruin."
    ]
  },
  {
    id: uid(),
    name: "Aardappel-preisoep",
    emoji: "\u{1F372}",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Prei", amount: 2, unit: "stuks" },
      { name: "Aardappelen", amount: 400, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Kookroom", amount: 100, unit: "ml" },
      { name: "Boter", amount: 20, unit: "g" }
    ],
    steps: [
      "Snijd de prei in ringen en de aardappelen in blokjes.",
      "Fruit de prei kort aan in de boter.",
      "Voeg aardappelen en bouillon toe en breng aan de kook.",
      "Laat 20 minuten sudderen tot de aardappelen zacht zijn.",
      "Pureer de soep en roer de kookroom erdoor."
    ]
  },
  {
    id: uid(),
    name: "Caprese salade met tomaat en mozzarella",
    emoji: "\u{1F345}",
    photoUrl: "",
    cookTime: 10,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Tomaten", amount: 4, unit: "stuks" },
      { name: "Mozzarella", amount: 2, unit: "stuks" },
      { name: "Basilicum", amount: 1, unit: "snufje" },
      { name: "Olijfolie", amount: 2, unit: "eetlepel" },
      { name: "Balsamicoazijn", amount: 1, unit: "eetlepel" }
    ],
    steps: [
      "Snijd de tomaten en mozzarella in plakken.",
      "Leg ze afwisselend op een bord.",
      "Verdeel de basilicumblaadjes erover.",
      "Besprenkel met olijfolie en balsamicoazijn.",
      "Breng op smaak met peper en zout."
    ]
  },
  {
    id: uid(),
    name: "Kip tikka masala",
    emoji: "\u{1F35B}",
    photoUrl: "",
    cookTime: 40,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 500, unit: "g" },
      { name: "Tikka masala pasta", amount: 3, unit: "eetlepel" },
      { name: "Tomatenblokjes (blik)", amount: 1, unit: "stuks" },
      { name: "Kookroom", amount: 200, unit: "ml" },
      { name: "Ui", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Snijd de kipfilet in blokjes en de ui fijn.",
      "Bak de kip rondom bruin en haal uit de pan.",
      "Fruit de ui glazig en voeg de tikka masala pasta toe.",
      "Voeg tomatenblokjes en kip weer toe, laat 15 minuten sudderen.",
      "Roer de kookroom erdoor en breng op smaak met zout."
    ]
  },
  {
    id: uid(),
    name: "Boerenkoolstamppot met worst",
    emoji: "\u{1F954}",
    photoUrl: "",
    cookTime: 45,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Aardappelen", amount: 1, unit: "kg" },
      { name: "Boerenkool (gesneden)", amount: 400, unit: "g" },
      { name: "Rookworst", amount: 1, unit: "stuks" },
      { name: "Melk", amount: 100, unit: "ml" },
      { name: "Boter", amount: 30, unit: "g" }
    ],
    steps: [
      "Schil de aardappelen en kook 20 minuten met de boerenkool.",
      "Verwarm de rookworst zoals aangegeven op de verpakking.",
      "Giet het aardappel-boerenkoolmengsel af.",
      "Stamp met melk en boter tot een grove puree.",
      "Breng op smaak met peper en zout en serveer met de rookworst."
    ]
  },
  {
    id: uid(),
    name: "Pasta pesto met kerstomaatjes",
    emoji: "\u{1F35D}",
    photoUrl: "",
    cookTime: 20,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Penne", amount: 350, unit: "g" },
      { name: "Groene pesto", amount: 150, unit: "g" },
      { name: "Kerstomaatjes", amount: 250, unit: "g" },
      { name: "Pijnboompitten", amount: 30, unit: "g" },
      { name: "Parmezaanse kaas", amount: 40, unit: "g" }
    ],
    steps: [
      "Kook de penne beetgaar volgens de verpakking.",
      "Halveer de kerstomaatjes.",
      "Rooster de pijnboompitten kort in een droge pan.",
      "Meng de afgegoten pasta met pesto en kerstomaatjes.",
      "Bestrooi met pijnboompitten en Parmezaanse kaas."
    ]
  },
  {
    id: uid(),
    name: "Viscurry met kokosmelk",
    emoji: "\u{1F372}",
    photoUrl: "",
    cookTime: 30,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Witvis (bijv. kabeljauw)", amount: 500, unit: "g" },
      { name: "Kokosmelk", amount: 400, unit: "ml" },
      { name: "Currypasta", amount: 2, unit: "eetlepel" },
      { name: "Paprika", amount: 1, unit: "stuks" },
      { name: "Rijst", amount: 300, unit: "g" }
    ],
    steps: [
      "Kook de rijst volgens de verpakking.",
      "Snijd de vis in grote stukken en de paprika in reepjes.",
      "Fruit de currypasta kort aan in een pan.",
      "Voeg kokosmelk en paprika toe en laat 10 minuten sudderen.",
      "Voeg de vis toe en gaar 5-7 minuten mee. Serveer met rijst."
    ]
  },
  {
    id: uid(),
    name: "Gehaktballen in tomatensaus met puree",
    emoji: "\u{1F37D}\uFE0F",
    photoUrl: "",
    cookTime: 45,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Gehakt (half-om-half)", amount: 500, unit: "g" },
      { name: "Tomatenblokjes (blik)", amount: 2, unit: "stuks" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Ei", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Meng gehakt met een gesnipperd kwart van de ui, ei, zout en peper. Rol er balletjes van.",
      "Bak de gehaktballen rondom bruin en haal uit de pan.",
      "Fruit de rest van de ui en voeg de tomatenblokjes toe.",
      "Leg de balletjes terug in de saus en laat 20 minuten sudderen.",
      "Kook ondertussen de aardappelen en stamp tot puree."
    ]
  },
  {
    id: uid(),
    name: "Nasi goreng met kipsat\xE9",
    emoji: "\u{1F35A}",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Rijst", amount: 300, unit: "g" },
      { name: "Kipfilet", amount: 300, unit: "g" },
      { name: "Ketjap manis", amount: 3, unit: "eetlepel" },
      { name: "Ei", amount: 2, unit: "stuks" },
      { name: "Satesaus", amount: 150, unit: "ml" }
    ],
    steps: [
      "Kook de rijst gaar en laat afkoelen (het liefst van de dag ervoor).",
      "Snijd de kip in blokjes en bak gaar in een wok.",
      "Bak de eieren tot roerei en meng door de rijst en kip.",
      "Voeg ketjap manis toe en roerbak alles goed door elkaar.",
      "Verwarm de satesaus en serveer erbij."
    ]
  },
  {
    id: uid(),
    name: "Broccoli-roomsoep",
    emoji: "\u{1F966}",
    photoUrl: "",
    cookTime: 25,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Broccoli", amount: 500, unit: "g" },
      { name: "Aardappelen", amount: 200, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Kookroom", amount: 100, unit: "ml" },
      { name: "Ui", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Snijd broccoli, aardappel en ui in stukken.",
      "Fruit de ui glazig in een soeppan.",
      "Voeg broccoli, aardappel en bouillon toe en breng aan de kook.",
      "Laat 15 minuten sudderen tot alles zacht is.",
      "Pureer glad en roer de kookroom erdoor."
    ]
  },
  {
    id: uid(),
    name: "Wraps met gekruide kip en groenten",
    emoji: "\u{1F32F}",
    photoUrl: "",
    cookTime: 25,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 400, unit: "g" },
      { name: "Wraps", amount: 8, unit: "stuks" },
      { name: "Paprika", amount: 2, unit: "stuks" },
      { name: "Fajitakruiden", amount: 1, unit: "eetlepel" },
      { name: "Cr\xE8me fra\xEEche", amount: 100, unit: "ml" }
    ],
    steps: [
      "Snijd kip en paprika in reepjes.",
      "Meng de kip met de fajitakruiden.",
      "Bak kip en paprika 8-10 minuten op hoog vuur gaar.",
      "Verwarm de wraps kort in een droge pan.",
      "Vul de wraps met het kip-paprikamengsel en een schep cr\xE8me fra\xEEche."
    ]
  },
  {
    id: uid(),
    name: "Risotto met champignons",
    emoji: "\u{1F35A}",
    photoUrl: "",
    cookTime: 40,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Risottorijst", amount: 300, unit: "g" },
      { name: "Champignons", amount: 250, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Parmezaanse kaas", amount: 50, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Snipper de ui en snijd de champignons in plakjes.",
      "Fruit de ui glazig en voeg de risottorijst toe, roerbak 1 minuut.",
      "Voeg al roerend beetje bij beetje warme bouillon toe.",
      "Bak de champignons apart en meng erdoor als de rijst bijna gaar is.",
      "Roer de Parmezaanse kaas erdoor en breng op smaak."
    ]
  },
  {
    id: uid(),
    name: "Zalmfilet met citroen-dillesaus",
    emoji: "\u{1F41F}",
    photoUrl: "",
    cookTime: 25,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Zalmfilet", amount: 4, unit: "stuks" },
      { name: "Citroen", amount: 1, unit: "stuks" },
      { name: "Verse dille", amount: 1, unit: "snufje" },
      { name: "Cr\xE8me fra\xEEche", amount: 150, unit: "ml" },
      { name: "Aardappelen", amount: 700, unit: "g" }
    ],
    steps: [
      "Kook de aardappelen 20 minuten gaar.",
      "Bak de zalmfilets 4 minuten per kant in een pan.",
      "Meng cr\xE8me fra\xEEche met citroensap en gehakte dille.",
      "Breng de saus op smaak met zout en peper.",
      "Serveer de zalm met de saus en de aardappelen."
    ]
  },
  {
    id: uid(),
    name: "Andijviestamppot met gehaktballetjes",
    emoji: "\u{1F954}",
    photoUrl: "",
    cookTime: 40,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Aardappelen", amount: 1, unit: "kg" },
      { name: "Andijvie (gesneden)", amount: 300, unit: "g" },
      { name: "Gehakt (half-om-half)", amount: 400, unit: "g" },
      { name: "Melk", amount: 100, unit: "ml" },
      { name: "Boter", amount: 30, unit: "g" }
    ],
    steps: [
      "Rol het gehakt tot kleine balletjes en bak rondom bruin.",
      "Kook ondertussen de aardappelen 20 minuten gaar.",
      "Giet de aardappelen af en stamp met melk en boter.",
      "Meng de rauwe andijvie erdoor tot die net slinkt.",
      "Breng op smaak en serveer met de gehaktballetjes."
    ]
  },
  {
    id: uid(),
    name: "Pompoensoep met kokos",
    emoji: "\u{1F383}",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Pompoen", amount: 800, unit: "g" },
      { name: "Kokosmelk", amount: 300, unit: "ml" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" },
      { name: "Ui", amount: 1, unit: "stuks" },
      { name: "Gemberpasta", amount: 1, unit: "eetlepel" }
    ],
    steps: [
      "Schil de pompoen en snijd in blokjes.",
      "Fruit ui en gember kort aan in een soeppan.",
      "Voeg pompoen en bouillon toe en breng aan de kook.",
      "Laat 20 minuten sudderen tot de pompoen zacht is.",
      "Pureer glad en roer de kokosmelk erdoor."
    ]
  },
  {
    id: uid(),
    name: "Pasta carbonara",
    emoji: "\u{1F35D}",
    photoUrl: "",
    cookTime: 25,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Spaghetti", amount: 350, unit: "g" },
      { name: "Spekjes", amount: 150, unit: "g" },
      { name: "Ei", amount: 3, unit: "stuks" },
      { name: "Parmezaanse kaas", amount: 60, unit: "g" },
      { name: "Knoflook", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Kook de spaghetti beetgaar volgens de verpakking.",
      "Bak de spekjes met de fijngehakte knoflook krokant.",
      "Klop de eieren los met de geraspte Parmezaanse kaas.",
      "Meng de afgegoten hete pasta door de spekjes, van het vuur af.",
      "Roer snel het eimengsel erdoor tot een romige saus ontstaat."
    ]
  },
  {
    id: uid(),
    name: "Groentecurry met tofu",
    emoji: "\u{1F35B}",
    photoUrl: "",
    cookTime: 30,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Tofu", amount: 400, unit: "g" },
      { name: "Kokosmelk", amount: 400, unit: "ml" },
      { name: "Currypasta", amount: 2, unit: "eetlepel" },
      { name: "Broccoli", amount: 300, unit: "g" },
      { name: "Rijst", amount: 300, unit: "g" }
    ],
    steps: [
      "Kook de rijst volgens de verpakking.",
      "Snijd de tofu in blokjes en bak goudbruin.",
      "Fruit de currypasta kort aan in een pan.",
      "Voeg kokosmelk en broccoli toe, laat 10 minuten sudderen.",
      "Voeg de tofu toe en verwarm mee. Serveer met rijst."
    ]
  },
  {
    id: uid(),
    name: "Ovenschotel met gehakt en aardappel",
    emoji: "\u{1F37D}\uFE0F",
    photoUrl: "",
    cookTime: 50,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Gehakt (half-om-half)", amount: 500, unit: "g" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Wortels", amount: 200, unit: "g" },
      { name: "Jong belegen kaas", amount: 100, unit: "g" },
      { name: "Ui", amount: 1, unit: "stuks" }
    ],
    steps: [
      "Kook de aardappelen 20 minuten gaar en stamp grof.",
      "Bak het gehakt met ui en wortelblokjes rul.",
      "Verdeel het gehaktmengsel in een ovenschaal.",
      "Bedek met de gestampte aardappel en bestrooi met kaas.",
      "Bak 20 minuten op 200\xB0C tot de kaas goudbruin is."
    ]
  },
  {
    id: uid(),
    name: "Kip-groenteroerbak met noedels",
    emoji: "\u{1F35C}",
    photoUrl: "",
    cookTime: 25,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kipfilet", amount: 400, unit: "g" },
      { name: "Mie noedels", amount: 300, unit: "g" },
      { name: "Paprika", amount: 2, unit: "stuks" },
      { name: "Sojasaus", amount: 3, unit: "eetlepel" },
      { name: "Knoflook", amount: 2, unit: "stuks" }
    ],
    steps: [
      "Kook de noedels volgens de verpakking en giet af.",
      "Snijd kip en paprika in reepjes, hak de knoflook fijn.",
      "Roerbak de kip op hoog vuur 5 minuten gaar.",
      "Voeg paprika en knoflook toe en bak 3 minuten mee.",
      "Voeg de noedels en sojasaus toe en meng goed door elkaar."
    ]
  },
  {
    id: uid(),
    name: "Erwtensoep (snert)",
    emoji: "\u{1F372}",
    photoUrl: "",
    cookTime: 60,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Spliterwten", amount: 300, unit: "g" },
      { name: "Rookworst", amount: 1, unit: "stuks" },
      { name: "Prei", amount: 1, unit: "stuks" },
      { name: "Wortels", amount: 200, unit: "g" },
      { name: "Bouillonblokjes", amount: 2, unit: "stuks" }
    ],
    steps: [
      "Spoel de spliterwten af en breng met bouillon aan de kook.",
      "Laat 30 minuten zachtjes koken tot de erwten uiteenvallen.",
      "Snijd prei en wortels in stukjes en voeg toe.",
      "Voeg de rookworst toe en laat 20 minuten meegaren.",
      "Haal de worst eruit, snijd in plakjes en serveer erbij."
    ]
  },
  {
    id: uid(),
    name: "Falafel met hummus en pitabroodjes",
    emoji: "\u{1F9C6}",
    photoUrl: "",
    cookTime: 30,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Falafel (kant-en-klaar)", amount: 12, unit: "stuks" },
      { name: "Pitabroodjes", amount: 4, unit: "stuks" },
      { name: "Hummus", amount: 200, unit: "g" },
      { name: "Komkommer", amount: 1, unit: "stuks" },
      { name: "Tomaten", amount: 2, unit: "stuks" }
    ],
    steps: [
      "Bak de falafel volgens de verpakking goudbruin.",
      "Snijd komkommer en tomaten in blokjes.",
      "Verwarm de pitabroodjes kort in de oven of pan.",
      "Besmeer de pitabroodjes met hummus.",
      "Vul met falafel, komkommer en tomaat."
    ]
  },
  {
    id: uid(),
    name: "Kip cordon bleu met sperziebonen",
    emoji: "\u{1F37D}\uFE0F",
    photoUrl: "",
    cookTime: 35,
    servings: 4,
    favorite: false,
    ingredients: [
      { name: "Kip cordon bleu", amount: 4, unit: "stuks" },
      { name: "Sperziebonen", amount: 400, unit: "g" },
      { name: "Aardappelen", amount: 800, unit: "g" },
      { name: "Boter", amount: 20, unit: "g" },
      { name: "Zout", amount: 1, unit: "snufje" }
    ],
    steps: [
      "Kook de aardappelen 20 minuten gaar.",
      "Bak de kip cordon bleu volgens de verpakking goudbruin en gaar.",
      "Kook de sperziebonen 10 minuten beetgaar.",
      "Stamp de aardappelen met boter tot puree of serveer heel.",
      "Serveer de kip met de sperziebonen en aardappelen."
    ]
  }
];
async function loadKey(key, seedFn) {
  try {
    const res = await window.storage.get(key, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {
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
function TileThumb({ recipe, size = "normal" }) {
  const idx = Math.abs([...recipe.name].reduce((a, c) => a + c.charCodeAt(0), 0)) % TILE_GRADIENTS.length;
  const [c1, c2] = TILE_GRADIENTS[idx];
  const h = size === "large" ? 180 : 96;
  if (recipe.photoUrl) {
    return /* @__PURE__ */ jsx("div", { style: { height: h, borderRadius: 16, overflow: "hidden", position: "relative" }, children: /* @__PURE__ */ jsx("img", { src: recipe.photoUrl, alt: recipe.name, style: { width: "100%", height: "100%", objectFit: "cover" } }) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        height: h,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size === "large" ? 56 : 34,
        position: "relative"
      },
      children: [
        recipe.emoji || "\u{1F37D}\uFE0F",
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 6, left: 6, width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.55)" } }),
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", bottom: 6, right: 6, width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.35)" } })
      ]
    }
  );
}
function Pill({ children, tone = "default" }) {
  const tones = {
    default: { bg: C.ceramicDark, fg: C.inkSoft },
    warn: { bg: C.warnBg, fg: C.brick },
    ok: { bg: C.successBg, fg: C.sage },
    auto: { bg: C.noteBg, fg: C.mustardDeep }
  };
  const t = tones[tone];
  return /* @__PURE__ */ jsx(
    "span",
    {
      style: {
        background: t.bg,
        color: t.fg,
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: 0.3,
        padding: "3px 8px",
        borderRadius: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      },
      children
    }
  );
}
function PrimaryButton({ children, onClick, tone = "blue", disabled, full, compact }) {
  const bg = tone === "blue" ? C.blue : tone === "mustard" ? C.mustard : tone === "brick" ? C.brick : C.sage;
  const tekstkleur = tone === "mustard" ? "#2A1F06" : "#fff";
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      style: {
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
        width: full ? "100%" : "auto"
      },
      children
    }
  );
}
function GhostButton({ children, onClick, danger, full, disabled }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      style: {
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
        width: full ? "100%" : void 0
      },
      children
    }
  );
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxs("label", { style: { display: "block", marginBottom: 12 }, children: [
    /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 4, fontFamily: FONT_BODY }, children: label }),
    children
  ] });
}
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 12,
  padding: "9px 11px",
  fontFamily: FONT_BODY,
  fontSize: 16,
  get border() {
    return `1.5px solid ${C.borderTint}`;
  },
  get background() {
    return C.cardBg;
  },
  get color() {
    return C.ink;
  }
};
function Modal({ title, onClose, children, wide }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(21,44,72,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50
      },
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            background: C.paper,
            width: "100%",
            maxWidth: wide ? 640 : 480,
            maxHeight: "88vh",
            overflowY: "auto",
            borderRadius: "28px 28px 0 0",
            borderTop: `4px solid ${C.blue}`,
            padding: 20,
            boxShadow: "0 -8px 30px rgba(0,0,0,0.25)"
          },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
              /* @__PURE__ */ jsx("h2", { style: { fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: C.ink, margin: 0 }, children: title }),
              /* @__PURE__ */ jsx("button", { "aria-label": "Sluiten", onClick: onClose, style: { background: C.ceramic, border: "none", borderRadius: 12, padding: 7, cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 18, color: C.ink }) })
            ] }),
            children
          ]
        }
      )
    }
  );
}
function LogoMark({ size = 26 }) {
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", fill: "none", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: "lm-wood", x1: "0.1", y1: "0", x2: "0.9", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#E3B278" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#8B5A2B" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "lm-handle", x1: "0", y1: "0", x2: "1", y2: "0.3", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#C98A47" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#9C6530" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("rect", { x: "1", y: "1", width: "98", height: "98", rx: "22", fill: C.blueDeep, stroke: "rgba(255,255,255,0.12)", strokeWidth: "1" }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "10", width: "8", height: "8", rx: "2", fill: "rgba(255,255,255,0.10)", transform: "rotate(45 14 14)" }),
    /* @__PURE__ */ jsx("rect", { x: "82", y: "82", width: "8", height: "8", rx: "2", fill: "rgba(255,255,255,0.08)", transform: "rotate(45 86 86)" }),
    /* @__PURE__ */ jsxs("g", { transform: "rotate(-28 50 50)", children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M46 42 C 58 40, 71 40, 81 43 L 84 47 C 85 48.5, 85 51, 84 52.5 L 81 56 C 71 59, 58 59, 46 55 Z",
          fill: "url(#lm-handle)",
          stroke: "#6B4423",
          strokeWidth: "1.4",
          strokeLinejoin: "round"
        }
      ),
      /* @__PURE__ */ jsx("circle", { cx: "78", cy: "49.5", r: "1.9", fill: "#152C48" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "34", cy: "49", rx: "19", ry: "14", fill: "url(#lm-wood)", stroke: "#6B4423", strokeWidth: "1.6" }),
      /* @__PURE__ */ jsx("path", { d: "M22 46 C 28 43, 40 43, 47 47", stroke: "#6B4423", strokeWidth: "0.9", fill: "none", opacity: "0.35" }),
      /* @__PURE__ */ jsx("path", { d: "M21 52 C 28 55, 41 56, 48 51", stroke: "#6B4423", strokeWidth: "0.9", fill: "none", opacity: "0.3" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "29", cy: "43.5", rx: "8", ry: "4.5", fill: "#F6DFB6", opacity: "0.4" })
    ] })
  ] });
}
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
    return /* @__PURE__ */ jsx("div", { style: {
      minHeight: "100dvh",
      background: C.paper,
      color: C.ink,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: FONT_BODY
    }, children: /* @__PURE__ */ jsxs("div", { style: { maxWidth: 420, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 34, marginBottom: 10 }, children: "\u{1F944}" }),
      /* @__PURE__ */ jsx("h1", { style: { fontFamily: FONT_DISPLAY, fontSize: 22, margin: "0 0 8px" }, children: "Er ging iets mis op dit scherm" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: "0 0 18px" }, children: "Je gegevens staan veilig opgeslagen. Ga terug naar het beginscherm om verder te gaan." }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => this.setState({ error: null }),
            style: {
              background: C.blue,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_BODY
            },
            children: "Terug naar de app"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.location.reload(),
            style: {
              background: "transparent",
              color: C.blue,
              border: `1.5px solid ${C.blue}`,
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_BODY
            },
            children: "App herladen"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("details", { style: { marginTop: 18, textAlign: "left" }, children: [
        /* @__PURE__ */ jsx("summary", { style: { fontSize: 12, color: C.inkSoft, cursor: "pointer" }, children: "Technische details" }),
        /* @__PURE__ */ jsx("pre", { style: {
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: C.inkSoft,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          marginTop: 6
        }, children: String(this.state.error && (this.state.error.stack || this.state.error.message)) })
      ] })
    ] }) });
  }
}
function woordAfstand(a, b) {
  a = norm(a);
  b = norm(b);
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
function koppelSuggesties(ingredientNaam, inventory, zoek) {
  const q = norm(zoek || "");
  const basis = q ? inventory.filter((i) => norm(i.name).includes(q)) : inventory;
  const woorden = nameWords(ingredientNaam);
  return [...basis].map((item) => {
    const itemWoorden = nameWords(item.name);
    let score = 0;
    if (namesMatch(item.name, ingredientNaam)) score += 100;
    woorden.forEach((w) => {
      if (itemWoorden.some((iw) => wordsEqual(iw, w))) score += 20;
    });
    woorden.forEach((w) => {
      itemWoorden.forEach((iw) => {
        const d = woordAfstand(w, iw);
        if (d === 1) score += 14;
        else if (d === 2) score += 7;
      });
    });
    if (norm(item.name).startsWith(norm(ingredientNaam).slice(0, 4))) score += 5;
    return { item, score };
  }).sort((a, b) => b.score - a.score).slice(0, 40);
}
function KoppelModal({ ingredientNaam, inventory, onKies, onClose }) {
  const [zoek, setZoek] = useState("");
  const suggesties = koppelSuggesties(ingredientNaam, inventory, zoek);
  return /* @__PURE__ */ jsxs(Modal, { title: "Koppel aan je voorraad", onClose, children: [
    /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, color: C.ink, marginTop: 0, lineHeight: 1.5 }, children: [
      "Welk product uit je voorraad bedoelt het recept met",
      " ",
      /* @__PURE__ */ jsx("strong", { children: ingredientNaam }),
      "?"
    ] }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 12px", lineHeight: 1.45 }, children: "Deze koppeling wordt onthouden, ook als de namen blijven verschillen." }),
    /* @__PURE__ */ jsx(
      "input",
      {
        autoComplete: "off",
        style: { ...inputStyle, marginBottom: 10 },
        placeholder: "Zoeken in je voorraad\u2026",
        value: zoek,
        onChange: (e) => setZoek(e.target.value)
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { maxHeight: "45vh", overflowY: "auto" }, children: [
      suggesties.length === 0 && /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft }, children: "Niets gevonden in je voorraad." }),
      suggesties.map(({ item, score }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onKies(item),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            background: C.cardBg,
            border: `1.5px solid ${score >= 10 ? C.sage : C.borderTint}`,
            borderRadius: 12,
            padding: "9px 11px",
            marginBottom: 6,
            cursor: "pointer",
            fontFamily: FONT_BODY
          },
          children: [
            /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 14, color: C.ink }, children: item.name }),
              /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: [
                item.current,
                " ",
                item.unit
              ] })
            ] }),
            score >= 10 && /* @__PURE__ */ jsx(Pill, { tone: "ok", children: "waarschijnlijk" })
          ]
        },
        item.id
      ))
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsx(GhostButton, { full: true, onClick: onClose, children: "Annuleren" }) })
  ] });
}
function AgendaModal({ token, onClose, onDownload }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  if (!token) {
    return /* @__PURE__ */ jsx(Modal, { title: "Agenda", onClose, children: /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft }, children: "Het agenda-adres is nog niet beschikbaar. Probeer de app te herladen." }) });
  }
  const https = `${window.location.origin}/agenda/weekmenu.ics?t=${token}`;
  const webcal = https.replace(/^https?:/, "webcal:");
  const knop = (kleur, icoon, titel, uitleg, actie) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: actie,
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 11,
        width: "100%",
        textAlign: "left",
        background: C.cardBg,
        border: `1.5px solid ${C.borderTint}`,
        borderRadius: 14,
        padding: "12px 13px",
        marginBottom: 8,
        cursor: "pointer",
        fontFamily: FONT_BODY
      },
      children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 20, flexShrink: 0, lineHeight: 1.2 }, children: icoon }),
        /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 14, fontWeight: 600, color: kleur }, children: titel }),
          /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 12, color: C.inkSoft, lineHeight: 1.45, marginTop: 1 }, children: uitleg })
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxs(Modal, { title: "Weekmenu in je agenda", onClose, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.ink, marginTop: 0, lineHeight: 1.5 }, children: "Je abonneert je \xE9\xE9n keer. Daarna verschijnt elke wijziging in het weekmenu vanzelf in je agenda \u2014 je hoeft niets meer te downloaden." }),
    knop(
      C.ink,
      "",
      "Apple Agenda",
      "Voor iPhone, iPad en Mac. E\xE9n tik en je bent geabonneerd.",
      () => {
        window.location.href = webcal;
      }
    ),
    knop(
      C.blue,
      "\u{1F4C5}",
      "Google Agenda",
      "Werkt alleen via de website van Google Agenda, niet in de app. Google ververst ongeveer eens per etmaal.",
      () => {
        window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(https)}`, "_blank");
      }
    ),
    knop(
      C.blueDeep,
      "\u{1F4E7}",
      "Outlook",
      "Voegt het menu toe als geabonneerde agenda.",
      () => {
        window.open(`https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent("Weekmenu Pollepel")}`, "_blank");
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { borderTop: `1px solid ${C.ceramic}`, marginTop: 6, paddingTop: 12 }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }, children: "Andere agenda?" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 8px", lineHeight: 1.45 }, children: 'Kopieer dit adres en plak het bij "agenda toevoegen via internetadres".' }),
      /* @__PURE__ */ jsx("div", { style: {
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.ink,
        background: C.paper,
        borderRadius: 10,
        padding: "8px 10px",
        wordBreak: "break-all",
        marginBottom: 8
      }, children: https }),
      /* @__PURE__ */ jsxs(
        GhostButton,
        {
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(https);
              setGekopieerd(true);
              setTimeout(() => setGekopieerd(false), 2500);
            } catch (e) {
              setGekopieerd(false);
            }
          },
          children: [
            /* @__PURE__ */ jsx(Copy, { size: 14 }),
            " ",
            gekopieerd ? "Gekopieerd" : "Adres kopi\xEBren"
          ]
        }
      )
    ] }),
    onDownload && /* @__PURE__ */ jsxs("div", { style: { borderTop: `1px solid ${C.ceramic}`, marginTop: 12, paddingTop: 12 }, children: [
      /* @__PURE__ */ jsxs(GhostButton, { onClick: onDownload, children: [
        /* @__PURE__ */ jsx(Download, { size: 14 }),
        " Eenmalig bestand downloaden"
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, margin: "6px 0 0", lineHeight: 1.45 }, children: "Alleen de huidige periode, zonder latere wijzigingen. Op de iPhone werkt abonneren beter." })
    ] }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, marginTop: 14, lineHeight: 1.45 }, children: "Iedereen met dit adres kan jullie weekmenu zien. Deel het alleen met je huisgenoten." })
  ] });
}
function PollepelLoader({ tekst, size = 44, delay = 350, inline = false }) {
  const [zichtbaar, setZichtbaar] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setZichtbaar(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!zichtbaar) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      style: {
        display: "flex",
        flexDirection: inline ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: inline ? 8 : 10,
        padding: inline ? 0 : "24px 12px"
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              display: "inline-flex",
              // Draait om het uiteinde van de steel, zodat de bak van de lepel
              // roert in plaats van dat het geheel om zijn as tolt.
              animation: "pollepelRoeren 1.4s linear infinite",
              transformOrigin: "72% 50%"
            },
            children: /* @__PURE__ */ jsx(LogoMark, { size })
          }
        ),
        tekst && /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, color: C.inkSoft, fontFamily: FONT_BODY }, children: tekst })
      ]
    }
  );
}
function stelMinimumVoor(item, consumptionLog) {
  if (!item || !consumptionLog || !consumptionLog.length) return null;
  const nu = Date.now();
  const regels = consumptionLog.filter(
    (c) => namesMatch(c.name, item.name) && c.unit === item.unit
  );
  if (regels.length < 2) return null;
  const oudste = Math.min(...regels.map((c) => new Date(c.date).getTime()));
  const dagen = Math.max(7, (nu - oudste) / 864e5);
  const totaal = regels.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  if (totaal <= 0) return null;
  const perWeek = totaal / dagen * 7;
  const eenheid = (item.unit || "").toLowerCase();
  const stap = eenheid === "g" || eenheid === "ml" ? 50 : eenheid === "kg" || eenheid === "l" ? 0.5 : 1;
  const afronden = (n) => Math.max(stap, Math.round(n / stap) * stap);
  const minimum = afronden(perWeek);
  return {
    perWeek: round2(perWeek),
    minimum,
    maximum: afronden(minimum * 3),
    gebaseerdOp: regels.length,
    periodeDagen: Math.round(dagen)
  };
}
function controleerGegevens({ inventory = [], weekmenu = {}, recipes = [], shoppingList = [], categories = CATEGORIES }) {
  const bevindingen = [];
  const vandaag = dateKey(/* @__PURE__ */ new Date());
  inventory.forEach((i) => {
    const min = Number(i.min || 0), max = Number(i.max || 0);
    if (max > 0 && max < min) {
      bevindingen.push({
        soort: "minmax",
        ernst: "hoog",
        itemId: i.id,
        tekst: `${i.name}: maximum (${max}) ligt onder het minimum (${min}).`,
        gevolg: "Wat je bijkoopt wordt afgetopt op het maximum.",
        herstel: { min, max: Math.max(min, Number(i.current || 0)) }
      });
    }
  });
  inventory.forEach((i) => {
    if (Number(i.current || 0) < 0) {
      bevindingen.push({
        soort: "negatief",
        ernst: "hoog",
        itemId: i.id,
        tekst: `${i.name} staat op ${i.current} ${i.unit}.`,
        gevolg: "Een voorraad onder nul klopt nooit.",
        herstel: { current: 0 }
      });
    }
  });
  inventory.forEach((i) => {
    if (i.expiryDate && i.expiryDate < vandaag && Number(i.current || 0) > 0) {
      bevindingen.push({
        soort: "verlopen",
        ernst: "laag",
        itemId: i.id,
        tekst: `${i.name} was houdbaar tot ${i.expiryDate}.`,
        gevolg: "Nog wel als voorraad meegeteld."
      });
    }
  });
  const onbekend = /* @__PURE__ */ new Map();
  [...inventory, ...shoppingList].forEach((i) => {
    if (i.category && !categories.includes(i.category)) {
      onbekend.set(i.category, (onbekend.get(i.category) || 0) + 1);
    }
  });
  onbekend.forEach((aantal, cat) => {
    bevindingen.push({
      soort: "categorie",
      ernst: "midden",
      tekst: `${aantal} product${aantal > 1 ? "en" : ""} staat in de categorie "${cat}".`,
      gevolg: "Die categorie bestaat niet meer in de lijst."
    });
  });
  Object.entries(weekmenu).forEach(([dag, entry]) => {
    if (!entry) return;
    if (entry.recipeId && !recipes.some((r) => r.id === entry.recipeId)) {
      bevindingen.push({
        soort: "weekmenu",
        ernst: "midden",
        tekst: `${dag}: het geplande recept bestaat niet meer.`,
        gevolg: "Die avond is in feite leeg."
      });
    }
    if (entry.leftoverItemId && !inventory.some((i) => i.id === entry.leftoverItemId)) {
      bevindingen.push({
        soort: "kliekje",
        ernst: "midden",
        tekst: `${dag}: het geplande kliekje staat niet meer in je voorraad.`,
        gevolg: "Opgegeten, of verwijderd."
      });
    }
  });
  const volgorde = { hoog: 0, midden: 1, laag: 2 };
  return bevindingen.sort((a, b) => volgorde[a.ernst] - volgorde[b.ernst]);
}
function ControleModal({ bevindingen, onHerstel, onClose }) {
  const kleur = { hoog: C.brick, midden: C.mustardDeep, laag: C.inkSoft };
  const label = { hoog: "Moet je bekijken", midden: "Let op", laag: "Ter info" };
  return /* @__PURE__ */ jsxs(Modal, { title: "Controle van je gegevens", onClose, children: [
    bevindingen.length === 0 ? /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "20px 10px" }, children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 30, color: C.sage }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13.5, color: C.ink, marginTop: 8 }, children: "Alles ziet er goed uit." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0, lineHeight: 1.5 }, children: "Dit soort dingen doet de app niet vanzelf opvallen. Hier staan ze bij elkaar." }),
      bevindingen.map((b, i) => /* @__PURE__ */ jsxs("div", { style: {
        background: C.cardBg,
        border: `1.5px solid ${b.ernst === "hoog" ? C.brick : C.borderTint}`,
        borderRadius: 14,
        padding: "11px 13px",
        marginBottom: 8
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: kleur[b.ernst], fontWeight: 600, letterSpacing: "0.03em", marginBottom: 3 }, children: label[b.ernst] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13.5, color: C.ink, lineHeight: 1.4 }, children: b.tekst }),
        b.gevolg && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 3 }, children: b.gevolg }),
        b.herstel && /* @__PURE__ */ jsx("div", { style: { marginTop: 9 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: () => onHerstel(b), children: [
          /* @__PURE__ */ jsx(Check, { size: 14 }),
          " Rechtzetten"
        ] }) })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsx(PrimaryButton, { full: true, onClick: onClose, children: "Sluiten" }) })
  ] });
}
function VanavondStrook({ entry, recipe, readiness, cookNaam, onOpen, onVerrasMe, onNaarWeekmenu }) {
  const basis = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    textAlign: "left",
    borderRadius: 16,
    padding: "12px 14px",
    marginBottom: 12,
    cursor: "pointer",
    fontFamily: FONT_BODY,
    border: `1.5px solid ${C.borderTint}`,
    background: C.cardBg
  };
  if (entry && entry.offNight) {
    return /* @__PURE__ */ jsxs("div", { style: { ...basis, cursor: "default" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 24, flexShrink: 0 }, children: "\u{1F355}" }),
      /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Vanavond" }),
        /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }, children: "Niemand kookt" })
      ] })
    ] });
  }
  if (!recipe) {
    return /* @__PURE__ */ jsxs("div", { style: { ...basis, cursor: "default", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 24, flexShrink: 0 }, children: "\u{1F914}" }),
      /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 120 }, children: [
        /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Vanavond" }),
        /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }, children: "Nog niets gepland" })
      ] }),
      /* @__PURE__ */ jsxs("span", { style: { display: "flex", gap: 6 }, children: [
        /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", compact: true, onClick: onVerrasMe, children: [
          /* @__PURE__ */ jsx(Shuffle, { size: 14 }),
          " Verras me"
        ] }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: onNaarWeekmenu, children: "Plannen" })
      ] })
    ] });
  }
  const mist = readiness ? readiness.missing.length : 0;
  return /* @__PURE__ */ jsxs("button", { onClick: () => onOpen(recipe.id), style: { ...basis, borderColor: C.mustard }, children: [
    /* @__PURE__ */ jsx("span", { style: { fontSize: 26, flexShrink: 0 }, children: recipe.emoji || "\u{1F37D}\uFE0F" }),
    /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Vanavond" }),
      /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 15, color: C.ink, fontWeight: 600, lineHeight: 1.25 }, children: recipe.name }),
      /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 12, color: mist ? C.brick : C.sage, marginTop: 2 }, children: [
        cookNaam ? `${cookNaam} kookt \xB7 ` : "",
        mist === 0 ? "alles in huis" : `nog ${mist} ${mist === 1 ? "ingredi\xEBnt" : "ingredi\xEBnten"} nodig`
      ] })
    ] }),
    /* @__PURE__ */ jsx(ChevronRight, { size: 18, color: C.inkSoft, style: { flexShrink: 0 } })
  ] });
}
function KookMelding({ sessies, currentUserName, onOpen }) {
  const vanAnderen = (sessies || []).filter((s) => (s.cookName || "") !== currentUserName);
  if (!vanAnderen.length) return null;
  return /* @__PURE__ */ jsx("div", { style: { marginBottom: 12 }, children: vanAnderen.map((s) => {
    const klaar = s.readyAt ? new Date(s.readyAt) : null;
    const nog = klaar ? Math.round((klaar - Date.now()) / 6e4) : null;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => s.recipeId && onOpen && onOpen(s.recipeId),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          textAlign: "left",
          background: C.noteBg,
          border: `1.5px solid ${C.mustard}`,
          borderRadius: 16,
          padding: "11px 13px",
          cursor: s.recipeId ? "pointer" : "default",
          marginBottom: 8,
          fontFamily: FONT_BODY
        },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 22, flexShrink: 0 }, children: s.emoji || "\u{1F373}" }),
          /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 14, color: C.ink, fontWeight: 600 }, children: [
              s.cookName || "Iemand",
              " is begonnen aan ",
              s.recipeName
            ] }),
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 12, color: C.inkSoft, marginTop: 1 }, children: klaar ? nog > 0 ? `Klaar rond ${klaar.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} \u2014 nog ${nog} min` : "Zou nu klaar moeten zijn" : "Aan het koken" })
          ] })
        ]
      },
      s.id
    );
  }) });
}
function WelcomeTour({ onFinish }) {
  const [step, setStep] = useState(0);
  const LOOP = [
    { emoji: "\u{1F4E6}", label: "Voorraad", color: C.sage, text: "Je legt vast wat er in huis hoort te zijn." },
    { emoji: "\u{1F5D3}\uFE0F", label: "Weekmenu", color: C.blue, text: "Je plant welke avonden je wat eet." },
    { emoji: "\u{1F6D2}", label: "Boodschappen", color: C.mustard, text: "De lijst vult zichzelf met wat je mist." },
    { emoji: "\u{1F525}", label: "Koken", color: C.brick, text: "Na het koken gaat het van je voorraad af." }
  ];
  const steps = [
    {
      title: "Welkom bij Pollepel",
      body: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 15, color: C.ink, lineHeight: 1.6, margin: "0 0 14px" }, children: "Pollepel is geen verzameling lijstjes, maar \xE9\xE9n kringloop. Elke stap voedt de volgende." }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: LOOP.map((s, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: s.color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0
          }, children: s.emoji }),
          /* @__PURE__ */ jsxs("div", { style: { paddingTop: 2 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600, color: s.color }, children: s.label }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }, children: s.text })
          ] }),
          i < LOOP.length - 1 && null
        ] }, s.label)) }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, margin: "14px 0 0", lineHeight: 1.5 }, children: "En dan begint hij opnieuw: wat opraakt staat vanzelf weer op je boodschappenlijst." })
      ] })
    },
    {
      title: "Je eerste avond",
      body: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 15, color: C.ink, lineHeight: 1.6, margin: "0 0 14px" }, children: "Drie dingen, en de kringloop draait. Reken op een half uur." }),
        [
          ["Vijf recepten die je \xE9cht vaak maakt", "Niet je mooiste, je meest gemaakte. Typen mag, of laat Pollepel ze overnemen van een foto of een link."],
          ["Je voorraadkast, nog niet je koelkast", "Begin met wat er altijd hoort te staan: pasta, rijst, olie, blik tomaat."],
          ["Plan drie avonden, geen zeven", "Een half menu dat je volhoudt werkt beter dan een vol menu dat je woensdag loslaat."]
        ].map(([kop, uitleg], i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 11, marginBottom: 12 }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: C.blue,
            color: "#fff",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_MONO,
            fontSize: 12
          }, children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600, color: C.ink }, children: kop }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }, children: uitleg })
          ] })
        ] }, i))
      ] })
    },
    {
      title: "Twee dingen die het verschil maken",
      body: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { style: { background: C.paper, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }, children: "Zet een minimum per product" }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }, children: "Dit is de belangrijkste instelling in de app. Zak je eronder, dan komt het vanzelf op je boodschappenlijst. Zonder minimum blijft de lijst leeg." })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { background: C.paper, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }, children: "Tik na het eten op \u201CIk heb dit gekookt\u201D" }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }, children: "Dit sluit de kringloop. Sla je het over, dan loopt je voorraad achter en klopt je lijst niet meer." })
        ] }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.5 }, children: "Pollepel werkt pas echt als je hem samen gebruikt. Stuur je huisgenoot een uitnodiging via Instellingen \u2014 \xE9\xE9n tik, en jullie delen hetzelfde kookboek, dezelfde voorraad en dezelfde boodschappenlijst." })
      ] })
    }
  ];
  const isLast = step === steps.length - 1;
  return /* @__PURE__ */ jsx("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "rgba(28,29,27,0.55)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  }, children: /* @__PURE__ */ jsxs("div", { style: {
    background: C.cardBg,
    width: "100%",
    maxWidth: 460,
    borderRadius: "22px 22px 0 0",
    padding: "22px 20px 18px",
    maxHeight: "88vh",
    overflowY: "auto"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 22 }, children: "\u{1F944}" }),
      /* @__PURE__ */ jsx("h2", { style: { fontFamily: FONT_DISPLAY, fontSize: 20, margin: 0, color: C.ink }, children: steps[step].title })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: steps[step].body }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 5, justifyContent: "center", margin: "18px 0 14px" }, children: steps.map((_, i) => /* @__PURE__ */ jsx("div", { style: {
      width: i === step ? 20 : 7,
      height: 7,
      borderRadius: 4,
      background: i === step ? C.mustard : C.ceramic,
      transition: "width .2s"
    } }, i)) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      step > 0 && /* @__PURE__ */ jsx(GhostButton, { onClick: () => setStep(step - 1), children: "Terug" }),
      /* @__PURE__ */ jsx(PrimaryButton, { full: true, onClick: () => isLast ? onFinish() : setStep(step + 1), children: isLast ? "Aan de slag" : "Verder" })
    ] }),
    !isLast && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onFinish,
        style: {
          display: "block",
          margin: "10px auto 0",
          background: "none",
          border: "none",
          color: C.inkSoft,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: FONT_BODY
        },
        children: "Overslaan"
      }
    )
  ] }) });
}
function AppInner({ household = null, members = [], onLogout = null, onRenameHousehold = null } = {}) {
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [cookingSessions, setCookingSessions] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [koppelVoor, setKoppelVoor] = useState(null);
  const [leftoverContext, setLeftoverContext] = useState(null);
  const [controleOpen, setControleOpen] = useState(false);
  const bevindingen = useMemo(
    () => loading ? [] : controleerGegevens({ inventory, weekmenu, recipes, shoppingList, categories: CATEGORIES }),
    [loading, inventory, weekmenu, recipes, shoppingList]
  );
  const herstelBevinding = (b) => {
    if (!b.herstel || !b.itemId) return;
    persist("inventory", inventory.map((i) => i.id === b.itemId ? { ...i, ...b.herstel } : i), setInventory);
    showToast("Rechtgezet.");
  };
  const [periodIndex, setPeriodIndex] = useState(0);
  const [bookView, setBookView] = useState("alles");
  const [currentUserName, setCurrentUserName] = useState("");
  const savingRef = React.useRef(false);
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
  const [bookMode, setBookMode] = useState("mine");
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const hasCommunityBackend = typeof window !== "undefined" && !!window.communityStore;
  const hasDataAPI = typeof window !== "undefined" && !!window.dataAPI;
  const [maxCookTime, setMaxCookTime] = useState(null);
  const [openRecipeId, setOpenRecipeId] = useState(null);
  const [doublePortionDefault, setDoublePortionDefault] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
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
          window.dataAPI.consumptionLog.list()
        ]);
        if (!r.length) r = seedRecipes();
      } else {
        [r, i, s, w, c, p, log, cLog] = await Promise.all([
          loadKey("recipes", seedRecipes),
          loadKey("inventory", seedInventory),
          loadKey("shoppingList", () => []),
          loadKey("weekmenu", () => ({})),
          loadKey("cooks", () => []),
          loadKey("preferences", () => ({ darkMode: false, categoryOrder: null, diets: [], dislikes: [], premium: { photoInventory: true, predictiveDepletion: true, householdRSVP: true, sousChef: true } })),
          loadKey("cookLog", () => []),
          loadKey("consumptionLog", () => [])
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
        try {
          setCookingSessions(await window.dataAPI.cooking.active());
        } catch (e) {
        }
      }
      try {
        const params = new URLSearchParams(window.location.search);
        const receptId = params.get("recept");
        if (receptId) {
          setTab("kookboek");
          setOpenRecipeId(receptId);
          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch (e) {
      }
      if (hasDataAPI && window.dataAPI.weekmenu.opruimen) {
        const grens = /* @__PURE__ */ new Date();
        grens.setMonth(grens.getMonth() - 2);
        window.dataAPI.weekmenu.opruimen(dateKey(grens)).catch(() => {
        });
      }
      if (window.householdAPI && window.householdAPI.getCurrentUserEmail) {
        try {
          const email = await window.householdAPI.getCurrentUserEmail();
          const lid = (members || []).find((m) => m.email === email);
          setCurrentUserName(lid && (lid.displayName || lid.email) || (email || "").split("@")[0] || "Iemand");
        } catch (e) {
          setCurrentUserName("Iemand");
        }
      }
    })();
  }, []);
  const laatsteRefresh = React.useRef(0);
  const refreshShared = useCallback(async (sleutels) => {
    if (!hasDataAPI) return;
    if (savingRef.current) {
      setTimeout(() => refreshShared(sleutels), 600);
      return;
    }
    const nu = Date.now();
    if (!sleutels && nu - laatsteRefresh.current < 3e3) return;
    laatsteRefresh.current = nu;
    const wil = (k) => !sleutels || sleutels.includes(k);
    try {
      const [i, s, w, r, k] = await Promise.all([
        wil("inventory") ? window.dataAPI.inventory.list() : null,
        wil("shoppingList") ? window.dataAPI.shopping.list() : null,
        wil("weekmenu") ? window.dataAPI.weekmenu.list() : null,
        wil("recipes") ? window.dataAPI.recipes.list() : null,
        wil("cooking") && window.dataAPI.cooking ? window.dataAPI.cooking.active() : null
      ]);
      if (i) setInventory(i);
      if (s) setShoppingList(s);
      if (w) setWeekmenu(w);
      if (r && r.length) setRecipes(r);
      if (k) setCookingSessions(k);
    } catch (e) {
      console.error("Verversen van gedeelde gegevens mislukt:", e);
    }
  }, [hasDataAPI]);
  useEffect(() => {
    if (!hasDataAPI || !window.dataAPI.realtime) return;
    let timer = null;
    const wachtrij = /* @__PURE__ */ new Set();
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
    return () => {
      clearTimeout(timer);
      if (typeof stop === "function") stop();
    };
  }, [hasDataAPI, refreshShared]);
  useEffect(() => {
    const opTerug = () => {
      if (document.visibilityState === "visible") refreshShared();
    };
    document.addEventListener("visibilitychange", opTerug);
    window.addEventListener("focus", opTerug);
    return () => {
      document.removeEventListener("visibilitychange", opTerug);
      window.removeEventListener("focus", opTerug);
    };
  }, [refreshShared]);
  const persist = useCallback(async (key, value, setter, vorigeWaarde) => {
    let terugrolWaarde = vorigeWaarde;
    setter((huidig) => {
      if (terugrolWaarde === void 0) terugrolWaarde = huidig;
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
      if (terugrolWaarde !== void 0) setter(terugrolWaarde);
      setSaveError({
        key,
        // Opnieuw proberen doet precies dezelfde handeling nog een keer.
        opnieuw: () => persist(key, value, setter, terugrolWaarde)
      });
    }
    setSaving(false);
    savingRef.current = false;
  }, [hasDataAPI, inventory, shoppingList, cooks, cookLog, consumptionLog, preferences, recipes, weekmenu]);
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
  };
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  };
  const AI_ENDPOINT = "/api/ask-claude";
  const buildAuthHeaders = async () => {
    const headers = { "Content-Type": "application/json" };
    if (typeof window !== "undefined" && window.householdAPI && window.householdAPI.getAccessToken) {
      try {
        const token = await window.householdAPI.getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } catch (e) {
      }
    }
    return headers;
  };
  const askClaude = async (prompt) => {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: await buildAuthHeaders(),
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1e3,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) {
      let bodyText = "";
      try {
        bodyText = (await response.text()).slice(0, 300);
      } catch (e) {
      }
      const err = new Error(`API-fout ${response.status}`);
      err.status = response.status;
      err.body = bodyText;
      throw err;
    }
    const data = await response.json();
    return (data.content || []).map((b) => b.text || "").join("\n");
  };
  const askClaudeVision = async (base64, mediaType, prompt) => {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: await buildAuthHeaders(),
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1e3,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });
    if (!response.ok) {
      let bodyText = "";
      try {
        bodyText = (await response.text()).slice(0, 300);
      } catch (e) {
      }
      const err = new Error(`API-fout ${response.status}`);
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
      name: (raw.name || "Nieuw ge\xEFmporteerd recept").toString().slice(0, 80),
      emoji: raw.emoji && String(raw.emoji).trim() ? String(raw.emoji).trim().slice(0, 4) : suggestEmoji(raw.name),
      photoUrl: "",
      cookTime: Math.max(1, Math.round(Number(raw.cookTime) || 30)),
      servings: Math.max(1, Math.round(Number(raw.servings) || 4)),
      ingredients: Array.isArray(raw.ingredients) ? raw.ingredients.filter((i) => i && i.name).map((i) => ({
        name: String(i.name).slice(0, 60),
        amount: Number(i.amount) > 0 ? Number(i.amount) : 1,
        unit: allowedUnits.has(i.unit) ? i.unit : "stuks"
      })) : [],
      steps: Array.isArray(raw.steps) ? raw.steps.filter(Boolean).map((s) => String(s).slice(0, 300)) : [],
      diets: Array.isArray(raw.diets) ? raw.diets.filter((d) => DIET_TAGS.includes(d)) : [],
      community: false
    };
  };
  const buildExtractionPrompt = (sourceText) => `Je bent een recept-extractor voor de kookboek-app "Pollepel". Zet de onderstaande brontekst om naar STRIKT GELDIGE, COMPACTE JSON (\xE9\xE9n regel, geen witruimte/inspringing, geen markdown-codeblok, geen uitleg ervoor of erna) volgens dit format:

{"name":string,"emoji":"\xE9\xE9n relevante food-emoji","cookTime":integer(minuten),"servings":integer,"ingredients":[{"name":string,"amount":number,"unit":\xE9\xE9n van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...]}

Regels:
- Herschrijf elke bereidingsstap kort (max ~15 woorden) en in je eigen woorden, niet letterlijk overnemen uit de bron.
- BELANGRIJK \u2014 volgorde van de stappen: houd de chronologische kookvolgorde uit de bron exact aan. Verzin geen andere volgorde en herschik niets. Als de bron parallelle acties beschrijft (bijv. "verwarm de oven terwijl je de groenten snijdt"), zet ze in de volgorde waarin je ze zou uitvoeren, en noem dat expliciet in de stap zelf (bijv. "Verwarm ondertussen de oven voor") in plaats van een aparte, losstaande stap te maken die de volgorde verwart.
- Controleer voor je antwoordt zelf of de stappenvolgorde logisch en compleet is (bijv. niet iets gebruiken v\xF3\xF3r het is voorbereid) \u2014 corrigeer dit zo nodig, maar blijf zo dicht mogelijk bij de bron.
- Als een ingredi\xEBnt meerdere keren voorkomt (bijv. zowel in een stappenlijst als in een aparte ingredi\xEBntenoverzicht), voeg het maar \xE9\xE9n keer toe met de duidelijkste hoeveelheid.
- Negeer voedingswaardetabellen, allergenenlijsten, "weetjes"/tips, contactgegevens, benodigdheden (pannen e.d.) en voetnootverwijzingen zoals cijfers tussen haakjes \u2014 dit hoort niet bij het recept zelf.
- Maximaal 8 stappen en maximaal 16 ingredi\xEBnten \u2014 vat samen of combineer kleine kruiden waar nodig, dit moet compact blijven, belangrijker dan volledigheid.
- Kies per ingredi\xEBnt de dichtstbijzijnde toegestane eenheid; gebruik "stuks" als er geen duidelijke maateenheid is (bijv. "1 kopje" \u2248 240 ml).
- Negeer reclame, menu's, reacties of andere tekst die niet bij het recept hoort.
- Schat een redelijke kooktijd als die niet genoemd wordt.
- Antwoord ALLEEN met de JSON, niets anders.

Brontekst:
"""
${sourceText.slice(0, 6e3)}
"""`;
  const extractJson = (raw) => {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("geen-json-gevonden");
    return JSON.parse(raw.slice(start, end + 1));
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
        showToast("De AI-herkenning was niet bereikbaar, dus het recept is met een eenvoudigere, lokale methode herkend. Controleer de ingredi\xEBnten en stappen goed voordat je opslaat.");
      }
    } catch (e) {
      setImportError("Kon geen (volledig) recept herkennen in deze tekst. Zorg dat er zowel hoeveelheden bij de ingredi\xEBnten staan als duidelijke bereidingsstappen, of vul het recept handmatig in.");
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
      const text = doc.body && (doc.body.innerText || doc.body.textContent) || "";
      if (!text.trim()) throw new Error("leeg");
      const { draft, method } = await parseRecipeFromText(text);
      setImportOpen(false);
      setEditingRecipe(draft);
      if (method === "local") {
        showToast("De AI-herkenning was niet bereikbaar, dus het recept is met een eenvoudigere, lokale methode herkend. Controleer de ingredi\xEBnten en stappen goed voordat je opslaat.");
      }
    } catch (e) {
      setImportError("Deze pagina kon niet automatisch opgehaald of herkend worden (sommige sites blokkeren dit, of de pagina bevat geen duidelijke ingredi\xEBnten/stappen). Kopieer de recepttekst van de site en plak die in het tekstveld hierboven.");
    } finally {
      setImporting(false);
    }
  };
  const buildPhotoExtractionPrompt = () => `Je bent een recept-extractor voor de kookboek-app "Pollepel". Op de afbeelding staat een recept (bijv. een kookboekpagina, maaltijdbox-kaart zoals HelloFresh, uitprint, verpakking of handgeschreven kaart). Lees de tekst op de foto en zet die om naar STRIKT GELDIGE, COMPACTE JSON (\xE9\xE9n regel, geen witruimte/inspringing, geen markdown-codeblok, geen uitleg ervoor of erna) volgens dit format:

{"name":string,"emoji":"\xE9\xE9n relevante food-emoji","cookTime":integer(minuten),"servings":integer,"ingredients":[{"name":string,"amount":number,"unit":\xE9\xE9n van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...]}

Regels:
- Herschrijf elke bereidingsstap kort (max ~12 woorden) en in je eigen woorden.
- BELANGRIJK \u2014 volgorde van de stappen: houd de chronologische kookvolgorde op de foto exact aan, meestal herkenbaar aan genummerde stappen. Verzin geen andere volgorde. Bij parallelle acties (bijv. "verwarm ondertussen de oven"), noem dat expliciet in de stap zelf in plaats van een verwarrende losse stap te maken.
- Controleer voor je antwoordt zelf of de stappenvolgorde logisch is (niet iets gebruiken v\xF3\xF3r het is voorbereid) \u2014 corrigeer dit zo nodig, maar blijf zo dicht mogelijk bij de foto.
- Negeer alles wat niet de kern van het recept is: voedingswaardetabel, allergenenlijst, "weetjes"/tips, contactgegevens, benodigdheden (pannen e.d.), en voetnootverwijzingen zoals cijfers tussen haakjes.
- Maximaal 8 stappen en maximaal 16 ingredi\xEBnten \u2014 combineer of laat de minder essenti\xEBle weg als er meer op de foto staan. Dit moet compact blijven, belangrijker dan volledigheid.
- Kies per ingredi\xEBnt de dichtstbijzijnde toegestane eenheid; gebruik "stuks" als er geen duidelijke maateenheid is. Bij een kaart met een "zelf toevoegen"-lijst: neem beide lijsten samen als ingredi\xEBnten.
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
      leeg: "Kon niets bruikbaars herkennen op deze foto."
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
  const buildShelfPhotoPrompt = () => `Je bent een voorraad-herkenner voor de kookboek-app "Pollepel". Op de afbeelding staat een foto van een kast, koelkast of voorraadplank. Herken zoveel mogelijk zichtbare voedingsproducten en schat de hoeveelheid.

Antwoord ALLEEN met STRIKT GELDIGE, COMPACTE JSON (\xE9\xE9n regel, geen markdown-codeblok, geen uitleg) in dit format:
{"items":[{"name":string,"amount":number,"unit":\xE9\xE9n van "stuks"|"g"|"kg"|"ml"|"l","category":\xE9\xE9n van ${JSON.stringify(CATEGORIES)}}]}

Regels:
- Alleen duidelijk herkenbare producten, geen gokwerk bij onduidelijke/onleesbare verpakkingen.
- Voor onduidelijke hoeveelheden: gebruik "stuks" met een redelijke schatting (bijv. 3 appels, 1 pak melk).
- Maximaal 20 producten. Dit moet compact blijven \u2014 belangrijker dan volledigheid.
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
            include: true
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
    setShelfScanResults((prev) => prev.map((r) => r.tempId === tempId ? { ...r, include: !r.include } : r));
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
          id: uid(),
          name: r.name,
          category: r.category,
          unit: r.unit,
          current: r.amount,
          min: round2(Math.max(r.amount * 0.4, 0.5)),
          max: r.amount
        });
        created += 1;
      }
    });
    persist("inventory", nextInventory, setInventory);
    setShelfPhotoOpen(false);
    setShelfScanResults([]);
    showToast(`Voorraad bijgewerkt: ${updated} product${updated !== 1 ? "en" : ""} aangevuld, ${created} nieuw toegevoegd.`);
  };
  const askSousChef = async (recipe, question) => {
    const invList = inventory.map((i) => `${i.name} (${i.current} ${i.unit})`).join(", ") || "onbekend";
    const prompt = `Je bent een ervaren, geruststellende souschef die meekijkt terwijl iemand thuis kookt. Ze zijn bezig met "${recipe.name}".

Ingredi\xEBnten van het recept: ${recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`).join(", ")}.
Bereidingsstappen: ${recipe.steps.join(" | ")}.
Wat er nu in hun voorraad staat (gebruik dit om vervangingen te suggereren die ze al in huis hebben): ${invList}.

Vraag van de kok: "${question}"

Geef een kort, praktisch, gerust antwoord in het Nederlands (max ~80 woorden). Geen opsomming van meerdere opties tenzij echt nodig \u2014 geef gewoon het beste advies.`;
    return await askClaude(prompt);
  };
  const openRecipe = openRecipeId ? recipes.find((r) => r.id === openRecipeId) || communityRecipes.find((r) => r.id === openRecipeId) : null;
  const openRecipeIsMine = openRecipe ? recipes.some((r) => r.id === openRecipe.id) : true;
  const loadCommunityRecipes = useCallback(async () => {
    if (hasDataAPI) {
      try {
        const items = await window.dataAPI.recipes.listCommunity();
        setCommunityRecipes(items || []);
      } catch (e) {
      }
      return;
    }
    if (!hasCommunityBackend) return;
    try {
      const items = await window.communityStore.list();
      setCommunityRecipes(items || []);
    } catch (e) {
    }
  }, [hasCommunityBackend, hasDataAPI]);
  useEffect(() => {
    if (hasCommunityBackend || hasDataAPI) loadCommunityRecipes();
  }, [hasCommunityBackend, hasDataAPI, loadCommunityRecipes]);
  const communitySourceRecipes = hasCommunityBackend || hasDataAPI ? communityRecipes : recipes;
  const [dietOnly, setDietOnly] = useState(false);
  const activeDietTags = useMemo(() => {
    const all = /* @__PURE__ */ new Set();
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
      if (maxCookTime && Number(r.cookTime || 999) > maxCookTime) return false;
      if (dietOnly && activeDietTags.length && !activeDietTags.every((tag) => (r.diets || []).includes(tag))) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    if (bookView !== "kan" || bookMode !== "mine") return zichtbaar;
    return zichtbaar.map((r) => ({ r, mist: recipeReadiness(r, inventory).missing.length })).sort((a, b) => a.mist - b.mist).map((x) => x.r);
  }, [recipes, communitySourceRecipes, bookMode, bookView, hasCommunityBackend, hasDataAPI, favOnly, maxCookTime, dietOnly, activeDietTags, query, inventory]);
  const shoppingDay = preferences.shoppingDay == null ? 6 : Number(preferences.shoppingDay);
  const periods = useMemo(() => planningPeriods(shoppingDay, 4), [shoppingDay]);
  const activePeriod = periods[Math.min(periodIndex, periods.length - 1)];
  const periodDays = useMemo(() => {
    const vandaagKey = dateKey(/* @__PURE__ */ new Date());
    return activePeriod.dagen.map((d) => ({
      key: dateKey(d),
      date: d,
      label: DAG_LANG[d.getDay()].charAt(0).toUpperCase() + DAG_LANG[d.getDay()].slice(1),
      kort: DAG_KORT[d.getDay()],
      dagnummer: d.getDate(),
      isVandaag: dateKey(d) === vandaagKey,
      isVerleden: dateKey(d) < vandaagKey,
      isBoodschappendag: d.getDay() === shoppingDay
    }));
  }, [activePeriod, shoppingDay]);
  const vanavondEntry = weekmenu[dateKey(/* @__PURE__ */ new Date())];
  const vanavondRecept = vanavondEntry && vanavondEntry.recipeId ? recipes.find((r) => r.id === vanavondEntry.recipeId) : null;
  const verrasMeVanavond = () => {
    if (!recipes.length) return;
    const gescoord = recipes.map((r) => ({ r, mist: recipeReadiness(r, inventory).missing.length })).sort((a, b) => a.mist - b.mist);
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
  const toggleFavorite = (id) => {
    const next = recipes.map((r) => r.id === id ? { ...r, favorite: !r.favorite } : r);
    setRecipes(next);
    if (hasDataAPI) window.dataAPI.recipes.patch(id, { favorite: !recipes.find((r) => r.id === id)?.favorite }).catch(() => {
    });
    else persist("recipes", next, setRecipes);
  };
  const toggleCommunity = async (id) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    const nowShared = !recipe.community;
    const next = recipes.map((r) => r.id === id ? { ...r, community: nowShared } : r);
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
    showToast(nowShared ? `${recipe.name} is gedeeld met de community.` : `${recipe.name} is niet langer gedeeld.`);
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
        setRecipes(recipes.map((r) => r.id === recipe.id ? recipe : r));
      } else {
        const newId = await window.dataAPI.recipes.create({ ...recipe, favorite: false, community: false });
        setRecipes([...recipes, { ...recipe, id: newId, favorite: false, community: false }]);
      }
    } else {
      let next;
      if (recipe.id) next = recipes.map((r) => r.id === recipe.id ? recipe : r);
      else next = [...recipes, { ...recipe, id: uid(), favorite: false, community: false }];
      persist("recipes", next, setRecipes);
    }
    setEditingRecipe(null);
  };
  const [nutritionBusy, setNutritionBusy] = useState(false);
  const startCookingSession = async (recipe, personen) => {
    if (!hasDataAPI || !window.dataAPI.cooking) return;
    try {
      await window.dataAPI.cooking.start({
        recipeId: recipe.id,
        recipeName: recipe.name,
        emoji: recipe.emoji || "",
        servings: personen || recipe.servings,
        cookTimeMinutes: Number(recipe.cookTime) || null,
        cookName: currentUserName
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
        kcal: perPortion.kcal,
        proteinG: perPortion.protein_g,
        carbsG: perPortion.carbs_g,
        sugarsG: perPortion.sugars_g,
        fiberG: perPortion.fiber_g,
        fatG: perPortion.fat_g,
        saturatedFatG: perPortion.saturated_fat_g,
        saltG: perPortion.salt_g,
        unmatched,
        matched,
        fingerprint,
        coverage,
        calculatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setRecipes((prev) => prev.map((r) => r.id === recipeId ? { ...r, nutrition } : r));
      showToast(unmatched.length ? `Voedingswaarden berekend (${unmatched.length} ingredi\xEBnt${unmatched.length > 1 ? "en" : ""} niet meegerekend).` : "Voedingswaarden berekend.");
    } catch (e) {
      console.error("Voedingswaarden berekenen mislukt:", e);
      showToast("Kon voedingswaarden niet berekenen. Probeer het later opnieuw.");
    } finally {
      setNutritionBusy(false);
    }
  };
  const koppelIngredient = async (recipeId, ingredientNaam, item) => {
    setKoppelVoor(null);
    setRecipes((prev) => prev.map((r) => r.id !== recipeId ? r : {
      ...r,
      ingredients: (r.ingredients || []).map((ing) => ing.name === ingredientNaam ? { ...ing, inventoryItemId: item.id } : ing)
    }));
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
    if (hasDataAPI) window.dataAPI.recipes.remove(id).catch(() => {
    });
    else persist("recipes", recipes.filter((r) => r.id !== id), setRecipes);
    setOpenRecipeId(null);
  };
  const cookRecipe = (recipe, scale = 1, overrides = {}) => {
    if (hasDataAPI && window.dataAPI.cooking) {
      window.dataAPI.cooking.finish(recipe.id).then(() => window.dataAPI.cooking.active()).then(setCookingSessions).catch((e) => console.error("Kooksessie afsluiten mislukt:", e));
    }
    const nextInventory = inventory.map((i) => ({ ...i }));
    let nextShopping = shoppingList.map((s) => ({ ...s }));
    const used = [];
    const added = [];
    const newConsumptionEntries = [];
    recipe.ingredients.forEach((ing) => {
      const matchItem = findInventoryMatch(nextInventory, ing);
      const idx = matchItem ? nextInventory.findIndex((i) => i.id === matchItem.id) : -1;
      if (idx === -1) return;
      const item = nextInventory[idx];
      const cmp = stockVsNeed(item, ing, scale);
      if (!cmp) return;
      const override = overrides[item.id];
      const amountUsed = round2(
        override != null ? Math.max(0, Number(override)) : Math.min(cmp.need, cmp.have)
      );
      if (amountUsed <= 0) return;
      const newCurrent = Math.max(0, round2(item.current - amountUsed));
      nextInventory[idx] = { ...item, current: newCurrent };
      used.push(item.name);
      newConsumptionEntries.push({ name: item.name, unit: item.unit, amount: amountUsed, date: (/* @__PURE__ */ new Date()).toISOString() });
      const result = pushLowStockToShopping(nextShopping, item, newCurrent);
      nextShopping = result.list;
      if (result.added) added.push(item.name);
    });
    persist("inventory", nextInventory, setInventory);
    persist("shoppingList", nextShopping, setShoppingList);
    if (newConsumptionEntries.length) {
      persist("consumptionLog", [...newConsumptionEntries, ...consumptionLog].slice(0, 500), setConsumptionLog);
    }
    if (!used.length) {
      showToast("Lekker gegeten! Deze ingredi\xEBnten worden niet in je voorraad bijgehouden.");
    } else {
      showToast(`Lekker gegeten! Voorraad bijgewerkt (${used.length} product${used.length > 1 ? "en" : ""}).`);
      if (added.length) {
        setTimeout(() => {
          showToast(`${added.join(", ")} ${added.length > 1 ? "zijn" : "is"} onder je minimum gezakt en op de boodschappenlijst gezet.`);
        }, 2600);
      }
    }
    const logEntry = { id: uid(), recipeId: recipe.id, recipeName: recipe.name, emoji: recipe.emoji, date: (/* @__PURE__ */ new Date()).toISOString(), servings: Math.round(recipe.servings * scale) };
    persist("cookLog", [logEntry, ...cookLog].slice(0, 200), setCookLog);
  };
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
  const isPremiumOn = (key) => preferences.premium ? preferences.premium[key] !== false : true;
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
  const allDislikes = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
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
  const addLeftover = (recipe, portions, bewaarplek = "koelkast") => {
    if (!portions || portions <= 0) return;
    const naarVriezer = bewaarplek === "vriezer";
    const dagen = naarVriezer ? 90 : 3;
    const expiry = /* @__PURE__ */ new Date();
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
      sourceRecipeId: recipe.id
    };
    persist("inventory", [...inventory, newItem], setInventory);
    showToast(
      naarVriezer ? `${portions} portie${portions > 1 ? "s" : ""} in de vriezer gezet (houdbaar tot over 3 maanden).` : `${portions} portie${portions > 1 ? "s" : ""} in de koelkast gezet (eet binnen 3 dagen op).`
    );
  };
  const eatLeftover = (inventoryItemId, porties, recipe) => {
    const item = inventory.find((i) => i.id === inventoryItemId);
    if (!item) {
      showToast("Dit kliekje staat niet meer in je voorraad.");
      return;
    }
    const gebruikt = Math.min(Number(porties) || 1, Number(item.current) || 0);
    const rest = round2(Math.max(0, Number(item.current || 0) - gebruikt));
    const next = rest > 0 ? inventory.map((i) => i.id === item.id ? { ...i, current: rest } : i) : inventory.filter((i) => i.id !== item.id);
    persist("inventory", next, setInventory);
    if (recipe) {
      const entry = { id: uid(), recipeId: recipe.id, recipeName: recipe.name, emoji: recipe.emoji || "", servings: recipe.servings, date: (/* @__PURE__ */ new Date()).toISOString(), leftover: true };
      persist("cookLog", [entry, ...cookLog], setCookLog);
    }
    showToast(rest > 0 ? `Opgegeten. Er ${rest === 1 ? "is nog 1 portie" : `zijn nog ${rest} porties`} over.` : "Opgegeten \u2014 het kliekje is op.");
  };
  const addFreezerPortion = (recipe) => {
    const portions = recipe.servings || 1;
    const expiry = /* @__PURE__ */ new Date();
    expiry.setDate(expiry.getDate() + 90);
    const newItem = {
      id: uid(),
      name: `Vriezer: ${recipe.name}`,
      category: "Diepvries",
      unit: "stuks",
      current: portions,
      min: 0,
      max: portions,
      expiryDate: expiry.toISOString().slice(0, 10),
      sourceRecipeId: recipe.id
    };
    persist("inventory", [...inventory, newItem], setInventory);
    showToast(`Extra portie ${recipe.name} in de vriezer gezet (${portions} pers., THT over 3 maanden).`);
  };
  const consumeInventoryItem = (itemId, amount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newCurrent = Math.max(0, round2(item.current - Number(amount || 0)));
    const nextInventory = inventory.map((i) => i.id === itemId ? { ...i, current: newCurrent } : i);
    const { list: nextShopping, added } = pushLowStockToShopping(shoppingList, item, newCurrent);
    persist("inventory", nextInventory, setInventory);
    persist("consumptionLog", [{ name: item.name, unit: item.unit, amount: Number(amount || 0), date: (/* @__PURE__ */ new Date()).toISOString() }, ...consumptionLog].slice(0, 500), setConsumptionLog);
    if (added) persist("shoppingList", nextShopping, setShoppingList);
    showToast(added ? `${item.name} afgeboekt \u2014 voorraad onder minimum, toegevoegd aan boodschappenlijst.` : `${item.name} afgeboekt van de voorraad.`);
  };
  const restockInventoryItem = (itemId, amount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newCurrent = addToStock(item, amount);
    const updatedItem = { ...item, current: newCurrent };
    const nextInventory = inventory.map((i) => i.id === itemId ? updatedItem : i);
    const { list: nextShopping, changed } = reconcileShoppingForItem(shoppingList, updatedItem);
    persist("inventory", nextInventory, setInventory);
    if (changed) persist("shoppingList", nextShopping, setShoppingList);
    showToast(`${item.name} bijgevuld in de voorraad.`);
  };
  const saveInventoryItem = (item) => {
    const savedItem = item.id ? item : { ...item, id: uid() };
    const next = item.id ? inventory.map((i) => i.id === item.id ? savedItem : i) : [...inventory, savedItem];
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
  const toggleChecked = (id) => {
    persist("shoppingList", shoppingList.map((s) => s.id === id ? { ...s, checked: !s.checked } : s), setShoppingList);
  };
  const addManualItem = (item) => {
    persist("shoppingList", [...shoppingList, { ...item, id: uid(), auto: false, checked: false }], setShoppingList);
  };
  const addMissingToShopping = (recipe, scale = 1) => {
    const { missing } = recipeReadiness(recipe, inventory, scale);
    if (!missing.length) {
      showToast("Je hebt alles voor dit gerecht al in huis.");
      return;
    }
    const toAdd = [];
    const skipped = [];
    missing.forEach((name) => {
      if (shoppingList.some((s) => namesMatch(s.name, name))) {
        skipped.push(name);
        return;
      }
      const ing = (recipe.ingredients || []).find((i) => namesMatch(i.name, name));
      const invItem = inventory.find((i) => namesMatch(i.name, name));
      const needed = ing ? round2(Number(ing.amount || 0) * scale) : 1;
      let amount = needed;
      if (invItem && ing && (invItem.unit || "").toLowerCase() === (ing.unit || "").toLowerCase()) {
        amount = Math.max(round2(needed - Number(invItem.current || 0)), 0.01);
      }
      toAdd.push({
        name,
        amount,
        unit: ing ? ing.unit : "stuks",
        category: invItem && invItem.category || guessCategory(name)
      });
    });
    if (toAdd.length) {
      persist(
        "shoppingList",
        [...shoppingList, ...toAdd.map((i) => ({ ...i, id: uid(), auto: false, checked: false }))],
        setShoppingList
      );
    }
    const parts = [];
    if (toAdd.length) parts.push(`${toAdd.length} ingredi\xEBnt${toAdd.length === 1 ? "" : "en"} toegevoegd aan de boodschappenlijst`);
    if (skipped.length) parts.push(`${skipped.length} stond${skipped.length === 1 ? "" : "en"} er al op`);
    showToast(parts.join(" \u2014 ") + ".");
  };
  const changeShoppingAmount = (id, richting) => {
    const item = shoppingList.find((s) => s.id === id);
    if (!item) return;
    const eenheid = (item.unit || "").toLowerCase();
    const stap = eenheid === "g" || eenheid === "ml" ? 50 : eenheid === "kg" || eenheid === "l" ? 0.5 : 1;
    const nieuw = round2(Math.max(0, Number(item.amount || 0) + richting * stap));
    if (nieuw === 0) {
      removeShoppingItem(id);
      return;
    }
    persist("shoppingList", shoppingList.map((s) => s.id === id ? { ...s, amount: nieuw } : s), setShoppingList);
  };
  const setShoppingAmount = (id, waarde) => {
    const nieuw = round2(Math.max(0, Number(String(waarde).replace(",", ".")) || 0));
    if (nieuw === 0) {
      removeShoppingItem(id);
      return;
    }
    persist("shoppingList", shoppingList.map((s) => s.id === id ? { ...s, amount: nieuw } : s), setShoppingList);
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
          max: 0
        });
        createdCount += 1;
      }
    });
    persist("inventory", nextInventory, setInventory);
    persist("shoppingList", shoppingList.filter((s) => !s.checked), setShoppingList);
    showToast(createdCount ? `${checkedItems.length} artikel${checkedItems.length > 1 ? "en" : ""} afgevinkt, voorraad bijgewerkt (${createdCount} nieuw toegevoegd \u2014 check zelf even het minimum/maximum).` : `${checkedItems.length} artikel${checkedItems.length > 1 ? "en" : ""} afgevinkt en voorraad bijgewerkt.`);
  };
  const dayEntry = (day) => {
    const raw = weekmenu[day];
    if (!raw) return null;
    if (typeof raw === "string") return { recipeId: raw, cook: "" };
    return raw;
  };
  const isDayEmpty = (day) => {
    const e = dayEntry(day);
    return !e || !e.recipeId && !e.offNight;
  };
  const setDayRecipe = (day, recipeId, leftoverItemId = null) => {
    const next = {
      ...weekmenu,
      [day]: { ...dayEntry(day), recipeId, offNight: false, leftoverItemId: leftoverItemId || null }
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
      showToast("Alle dagen zijn al ingepland \u2014 maak eerst een dag leeg om dit te plannen.");
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
    persist("weekmenuTemplate", weekmenu, () => {
    });
    showToast("Dit weekmenu is opgeslagen als sjabloon. Gebruik 'Vorig weekmenu' om het later opnieuw toe te passen.");
  };
  const applyWeekmenuTemplate = async () => {
    const template = hasDataAPI ? await window.dataAPI.weekmenu.list("weekmenu_template_days") : await loadKey("weekmenuTemplate", () => null);
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
      showToast("Vul minstens twee dagen in om te kunnen shuffelen.");
      return;
    }
    const entries = filledDays.map((d) => dayEntry(d.key));
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    const next = { ...weekmenu };
    filledDays.forEach((d, idx) => {
      next[d.key] = entries[idx];
    });
    persist("weekmenu", next, setWeekmenu);
    showToast("Weekmenu geshuffeld!");
  };
  const exportWeekmenuToCalendar = () => {
    const planned = periodDays.map((d, idx) => ({ day: d, idx, entry: dayEntry(d.key) })).filter(({ entry }) => entry?.recipeId);
    if (!planned.length) {
      showToast("Er staat nog niets in het weekmenu.");
      return;
    }
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const events = planned.map(({ day, entry }) => {
      const recipe = recipes.find((r) => r.id === entry.recipeId);
      const date = new Date(day.date);
      const start = new Date(date);
      start.setHours(18, 0, 0, 0);
      const end = new Date(date);
      end.setHours(19, 0, 0, 0);
      const title = `Koken: ${recipe ? recipe.name : "Gerecht"}${entry.cook ? ` (${entry.cook})` : ""}`;
      return [
        "BEGIN:VEVENT",
        `UID:${uid()}@pollepel`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${title.replace(/[\r\n]/g, " ")}`,
        recipe ? `DESCRIPTION:Ingredi\xEBnten: ${recipe.ingredients.map((i) => i.name).join(", ")}` : "",
        "END:VEVENT"
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
    showToast("Agendabestand gedownload \u2014 open het om de kookafspraken in je agenda te zetten.");
  };
  const clearDay = (day) => {
    const next = { ...weekmenu };
    delete next[day];
    persist("weekmenu", next, setWeekmenu);
  };
  const [shoppingPeriodChoice, setShoppingPeriodChoice] = useState(null);
  const vraagPeriodeVoorLijst = () => {
    const gevuld = periods.map((p, i) => ({
      index: i,
      periode: p,
      aantal: p.dagen.filter((d) => {
        const e = weekmenu[dateKey(d)];
        return e && e.recipeId;
      }).length
    })).filter((x) => x.aantal > 0);
    if (!gevuld.length) {
      showToast("Er staat nog niets in je weekmenu.");
      return;
    }
    if (gevuld.length === 1) {
      generateWeekShoppingList(gevuld[0].index);
      return;
    }
    setShoppingPeriodChoice(gevuld);
  };
  const generateWeekShoppingList = (welkeIndex) => {
    const periode = periods[welkeIndex == null ? periodIndex : welkeIndex];
    const dagen = periode.dagen.map((d) => ({ key: dateKey(d) }));
    const plannedEntries = dagen.map((d) => dayEntry(d.key)).filter((e) => e && e.recipeId && !e.leftoverItemId).map((e) => {
      const recipe = recipes.find((r) => r.id === e.recipeId);
      if (!recipe) return null;
      const attendeeScale = isPremiumOn("householdRSVP") && e.attendees && e.attendees.length ? e.attendees.length / (recipe.servings || 1) : 1;
      const scale = attendeeScale * (e.doublePortion ? 2 : 1);
      return { recipe, scale };
    }).filter(Boolean);
    if (!plannedEntries.length) {
      showToast("Er staan nog geen gerechten in het weekmenu.");
      return;
    }
    const totals = /* @__PURE__ */ new Map();
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
        checked: false
      };
      if (idx > -1) nextShopping[idx] = entry;
      else nextShopping.push(entry);
      addedCount += 1;
    });
    persist("shoppingList", nextShopping, setShoppingList);
    showToast(addedCount ? `Boodschappenlijst aangevuld met ${addedCount} product${addedCount > 1 ? "en" : ""} voor het weekmenu.` : "Je hebt al alles in huis voor het weekmenu \u2014 niets toegevoegd.");
  };
  const buildWeekRecipePrompt = (style, priorNames, recentNames, diets, saleNames) => `Je bent een menuplanner voor de kookboek-app "Pollepel". Bedenk \xE9\xE9n Nederlands AVONDETEN (hoofdgerecht voor het diner) in de stijl "${style.label}": ${style.description}.

Belangrijk: dit is uitsluitend voor het avondeten. Bedenk GEEN ontbijt, lunch, tussendoortje, salade-als-bijgerecht of dessert \u2014 altijd een volwaardig hoofdgerecht dat je 's avonds warm opdient.
${priorNames.length ? `Deze gerechten staan al gepland deze week: ${priorNames.join(", ")}. Hergebruik waar zinvol overlappende ingredi\xEBnten (bijv. een deel van een pak roomboter, verse kruiden, een groente die je toch al haalt) zodat de boodschappenlijst compacter en scherper wordt \u2014 maar bedenk geen gerecht dat al in de lijst staat.` : ""}
${recentNames.length ? `Dit is recent al gegeten (laatste 2 weken), bedenk liever iets anders voor afwisseling: ${recentNames.join(", ")}.` : ""}
${diets.length ? `Houd rekening met deze dieetwensen/allergie\xEBn in het huishouden: ${diets.join(", ")}. Het gerecht moet hier geschikt voor zijn.` : ""}
${saleNames.length ? `Deze producten zijn nu in de aanbieding bij de supermarkt: ${saleNames.join(", ")}. Gebruik er waar mogelijk en passend \xE9\xE9n of meer van, voor een voordeliger boodschappenlijst.` : ""}

Antwoord ALLEEN met STRIKT GELDIGE, COMPACTE JSON (\xE9\xE9n regel, geen markdown-codeblok, geen uitleg) in dit format:
{"name":string,"emoji":"\xE9\xE9n relevante food-emoji","cookTime":integer(minuten),"servings":4,"ingredients":[{"name":string,"amount":number,"unit":\xE9\xE9n van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...],"diets":[zero of meer van ${JSON.stringify(DIET_TAGS)}]}

Maximaal 8 bereidingsstappen (kort, ~15 woorden per stap) en maximaal 12 ingredi\xEBnten.`;
  const generatePatternWeekmenu = ({ scope }) => {
    const days = scope === "empty" ? periodDays.filter((d) => isDayEmpty(d.key)) : periodDays;
    if (!days.length) {
      showToast("Alle dagen zijn al ingevuld. Kies 'hele week' om ze te vervangen, of maak eerst dagen leeg.");
      return;
    }
    if (!cookLog.length && !recipes.some((r) => r.favorite)) {
      showToast("Nog geen kookgeschiedenis of favorieten bekend \u2014 kook eerst een paar keer, of markeer favorieten, voor deze functie iets kan voorstellen.");
      return;
    }
    const dutchDayIndex = { zo: 0, ma: 1, di: 2, wo: 3, do: 4, vr: 5, za: 6 };
    const next = { ...weekmenu };
    const usedThisRun = [];
    days.forEach((day) => {
      const sameDayCounts = /* @__PURE__ */ new Map();
      cookLog.forEach((entry) => {
        if (!entry.recipeId) return;
        const dow = new Date(entry.date).getDay();
        if (dutchDayIndex[day.key] === dow) {
          sameDayCounts.set(entry.recipeId, (sameDayCounts.get(entry.recipeId) || 0) + 1);
        }
      });
      let candidates = Array.from(sameDayCounts.entries()).filter(([id]) => recipes.some((r) => r.id === id) && !usedThisRun.includes(id)).sort((a, b) => b[1] - a[1]).map(([id]) => id);
      if (!candidates.length) {
        const overallCounts = /* @__PURE__ */ new Map();
        cookLog.forEach((entry) => {
          if (entry.recipeId && !entry.leftover) overallCounts.set(entry.recipeId, (overallCounts.get(entry.recipeId) || 0) + 1);
        });
        const byFrequency = Array.from(overallCounts.entries()).filter(([id]) => recipes.some((r) => r.id === id) && !usedThisRun.includes(id)).sort((a, b) => b[1] - a[1]).map(([id]) => id);
        const favorites = recipes.filter((r) => r.favorite && !usedThisRun.includes(r.id)).map((r) => r.id);
        candidates = [...byFrequency, ...favorites];
      }
      if (!candidates.length) return;
      const pick = candidates[0];
      usedThisRun.push(pick);
      next[day.key] = { ...dayEntry(day.key), recipeId: pick };
    });
    persist("weekmenu", next, setWeekmenu);
    showToast("Weekmenu ingevuld op basis van jullie eigen kookritme.");
  };
  const generateAIWeekmenu = async ({ styleId, scope }) => {
    const style = MEAL_STYLES.find((s) => s.id === styleId) || MEAL_STYLES[0];
    const days = scope === "empty" ? periodDays.filter((d) => isDayEmpty(d.key)) : periodDays;
    if (!days.length) {
      setAiWeekError("Alle dagen zijn al ingevuld. Kies 'hele week' om ze te vervangen, of maak eerst dagen leeg.");
      return;
    }
    const twoWeeksAgo = Date.now() - 14 * 864e5;
    const recentNames = Array.from(new Set(
      cookLog.filter((e) => new Date(e.date).getTime() > twoWeeksAgo).map((e) => e.recipeName)
    )).slice(0, 15);
    const saleNames = inventory.filter((i) => i.onSale).map((i) => i.name);
    setAiWeekGenerating(true);
    setAiWeekError("");
    const newRecipes = [];
    const nextWeekmenu = { ...weekmenu };
    for (let i = 0; i < days.length; i++) {
      setAiWeekProgress(`Gerecht ${i + 1} van ${days.length} bedenken (${style.label.toLowerCase()})\u2026`);
      try {
        const priorNames = newRecipes.map((r) => r.name);
        const raw = await askClaude(buildWeekRecipePrompt(style, priorNames, recentNames, activeDietTags, saleNames));
        const parsed = sanitizeDraft(extractJson(raw));
        if (!parsed.ingredients.length || !parsed.steps.length) continue;
        let recipeWithId;
        if (hasDataAPI) {
          const nieuwId = await window.dataAPI.recipes.create({ ...parsed, favorite: false, community: false });
          recipeWithId = { ...parsed, id: nieuwId, favorite: false, community: false };
        } else {
          recipeWithId = { ...parsed, id: uid(), favorite: false };
        }
        newRecipes.push(recipeWithId);
        nextWeekmenu[days[i].key] = { ...dayEntry(days[i].key), recipeId: recipeWithId.id };
      } catch (e) {
      }
    }
    setAiWeekGenerating(false);
    setAiWeekProgress("");
    if (newRecipes.length) {
      if (hasDataAPI) setRecipes((prev) => [...prev, ...newRecipes]);
      else persist("recipes", [...recipes, ...newRecipes], setRecipes);
      persist("weekmenu", nextWeekmenu, setWeekmenu);
      setAiWeekOpen(false);
      showToast(`${newRecipes.length} AI-gerecht${newRecipes.length > 1 ? "en" : ""} toegevoegd aan het weekmenu en het kookboek.`);
    } else {
      setAiWeekError("Kon geen AI-gerechten genereren \u2014 de AI-verbinding lijkt niet bereikbaar. Probeer het later opnieuw, of stel het weekmenu handmatig samen.");
    }
  };
  const exportBackup = () => {
    const data = { recipes, inventory, shoppingList, weekmenu, exportedAt: (/* @__PURE__ */ new Date()).toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pollepel-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup gedownload.");
  };
  const showWelcome = !loading && preferences && preferences.welcomeSeen !== true;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { style: { minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center", background: C.ceramic, fontFamily: FONT_BODY }, children: /* @__PURE__ */ jsx(PollepelLoader, { tekst: "Kookboek wordt geladen\u2026", size: 52, delay: 0 }) });
  }
  return /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT_BODY, background: C.ceramic, minHeight: "100dvh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }, children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    showWelcome && /* @__PURE__ */ jsx(WelcomeTour, { onFinish: () => updatePreferences({ welcomeSeen: true }) }),
    controleOpen && /* @__PURE__ */ jsx(
      ControleModal,
      {
        bevindingen,
        onHerstel: herstelBevinding,
        onClose: () => setControleOpen(false)
      }
    ),
    koppelVoor && /* @__PURE__ */ jsx(
      KoppelModal,
      {
        ingredientNaam: koppelVoor.ingredientNaam,
        inventory,
        onKies: (item) => koppelIngredient(koppelVoor.recipeId, koppelVoor.ingredientNaam, item),
        onClose: () => setKoppelVoor(null)
      }
    ),
    calendarOpen && /* @__PURE__ */ jsx(AgendaModal, { token: household && household.calendar_token, onDownload: () => {
      exportWeekmenuToCalendar();
      setCalendarOpen(false);
    }, onClose: () => setCalendarOpen(false) }),
    shoppingPeriodChoice && /* @__PURE__ */ jsxs(Modal, { title: "Voor welke periode?", onClose: () => setShoppingPeriodChoice(null), children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Je hebt in meerdere periodes maaltijden gepland. Voor welke wil je boodschappen doen?" }),
      shoppingPeriodChoice.map((x) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            const i = x.index;
            setShoppingPeriodChoice(null);
            generateWeekShoppingList(i);
          },
          style: {
            display: "block",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            background: C.cardBg,
            border: `1.5px solid ${C.borderTint}`,
            borderRadius: 14,
            padding: "11px 13px",
            marginBottom: 8,
            fontFamily: FONT_BODY
          },
          children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: C.ink, fontWeight: 600 }, children: periodeLabel(x.periode.start, x.periode.eind) }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkSoft }, children: [
              x.aantal,
              " ",
              x.aantal === 1 ? "maaltijd" : "maaltijden",
              " gepland"
            ] })
          ]
        },
        x.periode.startKey
      ))
    ] }),
    saveError && /* @__PURE__ */ jsxs(
      "div",
      {
        role: "alert",
        style: {
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 180,
          maxWidth: 460,
          margin: "0 auto",
          background: C.brick,
          color: "#fff",
          borderRadius: 14,
          padding: "11px 13px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)"
        },
        children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 17, style: { flexShrink: 0 } }),
          /* @__PURE__ */ jsx("span", { style: { flex: 1, fontSize: 14, lineHeight: 1.4 }, children: "Niet opgeslagen \u2014 je laatste wijziging is teruggedraaid." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                const fn = saveError.opnieuw;
                setSaveError(null);
                fn();
              },
              style: {
                background: "#fff",
                color: C.brick,
                border: "none",
                borderRadius: 10,
                padding: "7px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_BODY,
                flexShrink: 0
              },
              children: "Opnieuw"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSaveError(null),
              "aria-label": "Melding sluiten",
              style: { background: "none", border: "none", color: "#fff", opacity: 0.8, cursor: "pointer", padding: 0, flexShrink: 0 },
              children: /* @__PURE__ */ jsx(X, { size: 16 })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: {
      background: C.blue,
      padding: "16px 18px 20px",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      borderRadius: "0 0 28px 28px",
      backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.4px, transparent 1.4px)",
      backgroundSize: "16px 16px"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" } }),
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", bottom: -30, left: 40, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)" } }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, position: "relative" }, children: [
        /* @__PURE__ */ jsx(LogoMark, { size: 22 }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, flexShrink: 0, whiteSpace: "nowrap" }, children: "Pollepel" }),
        saving && /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 14, style: { marginLeft: 6, flexShrink: 0 } }),
        /* @__PURE__ */ jsx("div", { style: { marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }, children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSettingsOpen(true),
            title: "Instellingen",
            style: { background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 10, padding: 6, cursor: "pointer", display: "flex" },
            children: /* @__PURE__ */ jsx(Settings, { size: 15, color: "#fff" })
          }
        ) })
      ] }),
      household?.name ? /* @__PURE__ */ jsx("div", { style: {
        fontSize: 13,
        fontWeight: 600,
        color: C.mustard,
        marginTop: 5,
        position: "relative",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%"
      }, children: household.name }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 5, position: "relative" }, children: "Jullie digitale kookboek \xB7 voorraad & boodschappen automatisch bijgewerkt" })
    ] }),
    isOffline && /* @__PURE__ */ jsxs("div", { style: { background: C.brick, color: "#fff", textAlign: "center", padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsx(WifiOff, { size: 13 }),
      " Geen internetverbinding \u2014 wijzigingen worden pas opgeslagen zodra je weer online bent."
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "center", gap: 7, padding: "9px 0 3px" }, children: Array.from({ length: 11 }).map((_, i) => /* @__PURE__ */ jsx("div", { style: {
      width: 5,
      height: 5,
      borderRadius: 2,
      background: i % 3 === 0 ? C.mustard : C.blue,
      opacity: i % 3 === 0 ? 0.55 : 0.28,
      transform: "rotate(45deg)"
    } }, i)) }),
    toast && /* @__PURE__ */ jsxs("div", { style: {
      margin: "8px 14px 0",
      background: C.cardBg,
      border: `1.5px solid ${C.sage}`,
      borderRadius: 14,
      padding: "10px 12px",
      display: "flex",
      gap: 8,
      alignItems: "flex-start",
      fontSize: 13,
      color: C.ink
    }, children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 18, color: C.sage, style: { flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsx("span", { children: toast })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: 14 }, children: [
      tab === "kookboek" && !openRecipe && !cookingSessions.length && /* @__PURE__ */ jsx(
        VanavondStrook,
        {
          entry: weekmenu[dateKey(/* @__PURE__ */ new Date())],
          recipe: vanavondRecept,
          readiness: vanavondRecept ? recipeReadiness(vanavondRecept, inventory) : null,
          cookNaam: (weekmenu[dateKey(/* @__PURE__ */ new Date())] || {}).cook,
          onOpen: (id) => setOpenRecipeId(id),
          onVerrasMe: verrasMeVanavond,
          onNaarWeekmenu: () => setTab("weekmenu")
        }
      ),
      !openRecipe && /* @__PURE__ */ jsx(
        KookMelding,
        {
          sessies: cookingSessions,
          currentUserName,
          onOpen: (id) => {
            setTab("kookboek");
            setOpenRecipeId(id);
          }
        }
      ),
      tab === "kookboek" && !openRecipe && /* @__PURE__ */ jsx(
        KookboekView,
        {
          recipes: filteredRecipes,
          allRecipes: recipes,
          view: bookView,
          setView: setBookView,
          cookLog,
          query,
          setQuery,
          favOnly,
          setFavOnly,
          maxCookTime,
          setMaxCookTime,
          dietOnly,
          setDietOnly,
          activeDietTags,
          bookMode,
          setBookMode,
          inventory,
          onOpen: setOpenRecipeId,
          onToggleFav: toggleFavorite,
          onNew: () => setEditingRecipe({}),
          onImport: () => {
            setImportError("");
            setImportOpen(true);
          },
          onDuplicate: duplicateToMyBook,
          showToast
        }
      ),
      tab === "kookboek" && openRecipe && /* @__PURE__ */ jsx(
        RecipeDetail,
        {
          recipe: openRecipe,
          isMine: openRecipeIsMine,
          onBack: () => setOpenRecipeId(null),
          onToggleFav: () => toggleFavorite(openRecipe.id),
          onToggleCommunity: () => toggleCommunity(openRecipe.id),
          onEdit: () => setEditingRecipe(openRecipe),
          onDelete: () => deleteRecipe(openRecipe.id),
          onCook: (scale, overrides) => cookRecipe(openRecipe, scale, overrides),
          onDuplicate: () => duplicateToMyBook(openRecipe.id),
          onAddLeftover: addLeftover,
          onAddFreezerPortion: addFreezerPortion,
          onAskSousChef: askSousChef,
          isPremiumOn,
          inventory,
          showToast,
          dislikeWarnings: getRecipeDislikeWarnings(openRecipe),
          doublePortionDefault,
          onAddMissingToShopping: (scale) => addMissingToShopping(openRecipe, scale),
          onStartCooking: (personen) => startCookingSession(openRecipe, personen),
          onKoppel: (naam) => setKoppelVoor({ recipeId: openRecipe.id, ingredientNaam: naam }),
          leftoverItem: leftoverContext ? inventory.find((i) => i.id === leftoverContext) : null,
          onEatLeftover: (porties) => {
            eatLeftover(leftoverContext, porties, openRecipe);
            setLeftoverContext(null);
            setOpenRecipeId(null);
          },
          onRecalculateNutrition: () => recalculateNutrition(openRecipe.id),
          nutritionBusy
        }
      ),
      tab === "voorraad" && /* @__PURE__ */ jsx(
        VoorraadView,
        {
          inventory,
          recipes,
          categories: orderedCategories,
          consumptionLog,
          isPremiumOn,
          onEdit: setEditingItem,
          onNew: () => setEditingItem({}),
          onDelete: deleteInventoryItem,
          onScan: () => setScanOpen(true),
          onOpenRecipe: (id, dbl, leftoverId) => {
            setOpenRecipeId(id);
            setDoublePortionDefault(!!dbl);
            setLeftoverContext(leftoverId || null);
            setTab("kookboek");
          },
          ernstigeBevindingen: bevindingen.filter((b) => b.ernst === "hoog").length,
          onOpenControle: () => setControleOpen(true),
          onOpenShelfPhoto: () => {
            setShelfScanError("");
            setShelfScanResults([]);
            setShelfPhotoOpen(true);
          }
        }
      ),
      tab === "boodschappen" && /* @__PURE__ */ jsx(
        BoodschappenView,
        {
          list: shoppingList,
          categories: orderedCategories,
          onToggle: toggleChecked,
          onRemove: removeShoppingItem,
          onAddManual: addManualItem,
          onChangeAmount: changeShoppingAmount,
          onSetAmount: setShoppingAmount,
          onProcess: processChecked
        }
      ),
      tab === "weekmenu" && /* @__PURE__ */ jsx(
        WeekmenuView,
        {
          periodDays,
          periods,
          periodIndex,
          onPeriodChange: setPeriodIndex,
          weekmenu,
          recipes,
          cooks,
          inventory,
          isPremiumOn,
          onPickDay: setPickerDay,
          onPickCook: setCookDay,
          onPickAttendees: setAttendeesDay,
          onSetDoublePortion: setDayDoublePortion,
          onClearDay: clearDay,
          onGenerate: vraagPeriodeVoorLijst,
          onAIGenerate: () => {
            setAiWeekError("");
            setAiWeekOpen(true);
          },
          onPatternGenerate: () => generatePatternWeekmenu({ scope: "empty" }),
          onDuplicate: duplicateWeekmenu,
          onApplyTemplate: applyWeekmenuTemplate,
          onShuffle: shuffleWeekmenu,
          onOpenRecipe: (id, dbl, leftoverId) => {
            setOpenRecipeId(id);
            setDoublePortionDefault(!!dbl);
            setLeftoverContext(leftoverId || null);
            setTab("kookboek");
          },
          onExportCalendar: () => setCalendarOpen(true),
          onQuickPlan: quickPlanExpiring
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      margin: "0 auto",
      width: "100%",
      maxWidth: 480,
      background: C.cardBg,
      borderTop: `1.5px solid ${C.borderTint}`,
      display: "flex",
      // Onderaan ruimte voor de streep van het thuisscherm op nieuwere iPhones,
      // anders valt die over de tabbladen heen.
      padding: "8px 4px calc(8px + env(safe-area-inset-bottom, 0px))",
      borderRadius: "22px 22px 0 0",
      boxShadow: "0 -4px 14px rgba(0,0,0,0.08)",
      zIndex: 40
    }, children: [
      /* @__PURE__ */ jsx(TabButton, { icon: /* @__PURE__ */ jsx(ChefHat, { size: 18 }), label: "Kookboek", active: tab === "kookboek", onClick: () => {
        setTab("kookboek");
        setOpenRecipeId(null);
      } }),
      /* @__PURE__ */ jsx(TabButton, { icon: /* @__PURE__ */ jsx(CalendarDays, { size: 18 }), label: "Weekmenu", active: tab === "weekmenu", onClick: () => setTab("weekmenu") }),
      /* @__PURE__ */ jsx(TabButton, { icon: /* @__PURE__ */ jsx(Package, { size: 18 }), label: "Voorraad", active: tab === "voorraad", onClick: () => setTab("voorraad"), badge: lowStockCount || null, badgeTone: "warn" }),
      /* @__PURE__ */ jsx(TabButton, { icon: /* @__PURE__ */ jsx(ShoppingCart, { size: 18 }), label: "Boodschappen", active: tab === "boodschappen", onClick: () => setTab("boodschappen"), badge: shoppingCount || null, badgeTone: "mustard" })
    ] }),
    pickerDay && /* @__PURE__ */ jsx(
      RecipePickerModal,
      {
        recipes,
        inventory,
        onPick: (recipeId, leftoverItemId) => setDayRecipe(pickerDay, recipeId, leftoverItemId),
        onPickOffNight: () => setDayOffNight(pickerDay),
        onClose: () => setPickerDay(null)
      }
    ),
    cookDay && /* @__PURE__ */ jsx(
      CookPickerModal,
      {
        cooks,
        current: dayEntry(cookDay)?.cook || "",
        onPick: (name) => setDayCook(cookDay, name),
        onAddCook: addCook,
        onRemoveCook: removeCook,
        onClose: () => setCookDay(null)
      }
    ),
    attendeesDay && /* @__PURE__ */ jsx(
      AttendeesPickerModal,
      {
        cooks,
        current: dayEntry(attendeesDay)?.attendees || [],
        onSave: (names) => setDayAttendees(attendeesDay, names),
        onAddCook: addCook,
        onClose: () => setAttendeesDay(null)
      }
    ),
    settingsOpen && /* @__PURE__ */ jsx(
      SettingsModal,
      {
        household,
        members,
        preferences,
        cooks,
        onRename: onRenameHousehold,
        onLogout,
        onOpenMagnet: () => {
          setSettingsOpen(false);
          setPrintCardOpen(true);
        },
        onOpenTabletMode: () => {
          setSettingsOpen(false);
          setTabletModeOpen(true);
        },
        onShowWelcome: () => {
          setSettingsOpen(false);
          updatePreferences({ welcomeSeen: false });
        },
        onExportBackup: exportBackup,
        onToggleDarkMode: toggleDarkMode,
        onSetShoppingDay: (d) => {
          updatePreferences({ shoppingDay: d });
          setPeriodIndex(0);
        },
        onOpenControle: () => {
          setSettingsOpen(false);
          setControleOpen(true);
        },
        aantalBevindingen: bevindingen.length,
        onMoveCategoryOrder: moveCategoryOrder,
        onUpdateCookDiets: updateCookDiets,
        onUpdateCookDislikes: updateCookDislikes,
        onTogglePremium: togglePremiumFeature,
        onClose: () => setSettingsOpen(false)
      }
    ),
    printCardOpen && /* @__PURE__ */ jsx(FridgeMagnetView, { household, onClose: () => setPrintCardOpen(false) }),
    tabletModeOpen && /* @__PURE__ */ jsx(
      TabletModeView,
      {
        inventory,
        onConsume: consumeInventoryItem,
        onRestock: restockInventoryItem,
        onCreate: saveInventoryItem,
        onClose: () => setTabletModeOpen(false)
      }
    ),
    shelfPhotoOpen && /* @__PURE__ */ jsx(
      ShelfPhotoModal,
      {
        scanning: shelfScanning,
        error: shelfScanError,
        results: shelfScanResults,
        onScan: scanShelfPhoto,
        onToggleInclude: toggleShelfResultInclude,
        onApply: applyShelfScanResults,
        onClose: () => setShelfPhotoOpen(false)
      }
    ),
    editingRecipe !== null && /* @__PURE__ */ jsx(
      RecipeForm,
      {
        initial: editingRecipe,
        inventoryNames: [.../* @__PURE__ */ new Set([...inventory.map((i) => i.name), ...COMMON_GROCERY_ITEMS])],
        inventoryItems: inventory,
        onImport: () => {
          setEditingRecipe(null);
          setImportError("");
          setImportOpen(true);
        },
        onCancel: () => setEditingRecipe(null),
        onSave: saveRecipe
      }
    ),
    editingItem !== null && /* @__PURE__ */ jsx(
      InventoryForm,
      {
        consumptionLog,
        initial: editingItem,
        onCancel: () => setEditingItem(null),
        onSave: saveInventoryItem
      }
    ),
    importOpen && /* @__PURE__ */ jsx(
      ImportModal,
      {
        importing,
        error: importError,
        onCancel: () => setImportOpen(false),
        onImportText: importFromText,
        onImportUrl: importFromUrl,
        onImportPhoto: importFromPhoto
      }
    ),
    scanOpen && /* @__PURE__ */ jsx(
      ScanModal,
      {
        inventory,
        onClose: () => setScanOpen(false),
        onConsume: consumeInventoryItem,
        onRestock: restockInventoryItem,
        onCreate: saveInventoryItem
      }
    ),
    aiWeekOpen && /* @__PURE__ */ jsx(
      AIWeekmenuModal,
      {
        generating: aiWeekGenerating,
        progress: aiWeekProgress,
        error: aiWeekError,
        onCancel: () => setAiWeekOpen(false),
        onGenerate: generateAIWeekmenu
      }
    )
  ] });
}
function TabButton({ icon, label, active, onClick, badge, badgeTone = "warn" }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      style: {
        flex: 1,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "4px 2px",
        position: "relative",
        color: active ? C.blue : C.inkSoft
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
          icon,
          badge && /* @__PURE__ */ jsx("span", { style: {
            position: "absolute",
            top: -6,
            right: -10,
            background: badgeTone === "warn" ? C.brick : C.mustard,
            color: "#fff",
            fontSize: 11,
            fontFamily: FONT_MONO,
            borderRadius: 20,
            padding: "1px 5px",
            lineHeight: "13px"
          }, children: badge })
        ] }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 11, fontWeight: active ? 700 : 500 }, children: label })
      ]
    }
  );
}
function SeasonalAndSurpriseBar({ recipes, inventory, onOpen, showToast }) {
  const seasonal = useMemo(() => getSeasonalRecipeSuggestions(recipes).slice(0, 4), [recipes]);
  const monthName = (/* @__PURE__ */ new Date()).toLocaleDateString("nl-NL", { month: "long" });
  const [lastPickId, setLastPickId] = useState(null);
  const surpriseMe = () => {
    const makeable = recipes.filter((r) => recipeReadiness(r, inventory).complete);
    let incomplete = false;
    let pool = makeable;
    if (!pool.length && recipes.length) {
      const scored = recipes.map((r) => ({ r, missing: recipeReadiness(r, inventory).missing.length })).sort((a, b) => a.missing - b.missing);
      const fewest = scored[0].missing;
      pool = scored.filter((s) => s.missing === fewest).map((s) => s.r);
      incomplete = true;
    }
    if (!pool.length) return;
    let pick;
    if (pool.length === 1) {
      pick = pool[0];
    } else {
      const choices = pool.filter((r) => r.id !== lastPickId);
      const finalPool = choices.length ? choices : pool;
      pick = finalPool[Math.floor(Math.random() * finalPool.length)];
    }
    if (showToast) {
      const { missing } = recipeReadiness(pick, inventory);
      if (missing.length) {
        showToast(`${pick.name}: hiervoor mis je nog ${missing.join(", ")}.`);
      } else if (pool.length === 1 && !incomplete) {
        showToast("Dit is nu het enige gerecht dat volledig met je voorraad te maken is \u2014 voeg meer voorraad toe voor meer variatie.");
      }
    }
    setLastPickId(pick.id);
    onOpen(pick.id);
  };
  return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 12 }, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: surpriseMe,
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: `linear-gradient(135deg, ${C.mustard}, ${C.mustardDeep})`,
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "11px",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          marginBottom: 10
        },
        children: [
          /* @__PURE__ */ jsx(Shuffle, { size: 16 }),
          " Verras me! (kijkt naar je voorraad)"
        ]
      }
    ),
    seasonal.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.successBg, border: `1.5px solid ${C.sage}`, borderRadius: 16, padding: 12 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 14 }, children: "\u{1F331}" }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, fontWeight: 700, color: C.sage }, children: [
          "Nu in seizoen (",
          monthName,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "no-scrollbar", style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }, children: seasonal.map(({ recipe, matches }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onOpen(recipe.id),
          style: { flexShrink: 0, background: C.cardBg, border: `1px solid ${C.sage}`, borderRadius: 12, padding: "8px 10px", cursor: "pointer", textAlign: "left", minWidth: 130 },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, fontWeight: 600, color: C.ink }, children: [
              recipe.emoji || "\u{1F37D}\uFE0F",
              " ",
              recipe.name
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, marginTop: 2 }, children: [
              "met ",
              matches.slice(0, 2).join(", ")
            ] })
          ]
        },
        recipe.id
      )) })
    ] })
  ] });
}
function KookboekView({ recipes, allRecipes, cookLog, query, setQuery, favOnly, setFavOnly, maxCookTime, setMaxCookTime, dietOnly, setDietOnly, activeDietTags, bookMode, setBookMode, view, setView, inventory, onOpen, onToggleFav, onNew, onImport, onDuplicate, showToast }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const zoekt = query.trim().length > 0;
  const tellingen = useMemo(() => {
    const eigen = allRecipes || [];
    return {
      alles: eigen.length,
      kan: eigen.filter((r) => recipeReadiness(r, inventory).complete).length,
      favoriet: eigen.filter((r) => r.favorite).length,
      seizoen: getSeasonalRecipeSuggestions(eigen).length
    };
  }, [allRecipes, inventory]);
  const INGANGEN = [
    { key: "alles", label: "Alles", telling: tellingen.alles },
    { key: "kan", label: "\u{1F373} Kan ik maken", telling: tellingen.kan },
    { key: "favoriet", label: "\u2605 Favoriet", telling: tellingen.favoriet },
    { key: "seizoen", label: "\u{1F331} Seizoen", telling: tellingen.seizoen }
  ];
  const chip = (actief, inhoud, onClick, gedimd) => /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      style: {
        flexShrink: 0,
        borderRadius: 20,
        padding: "9px 14px",
        minHeight: 38,
        fontSize: 13,
        fontWeight: actief ? 700 : 500,
        cursor: "pointer",
        fontFamily: FONT_BODY,
        whiteSpace: "nowrap",
        background: actief ? C.blue : C.cardBg,
        color: actief ? "#fff" : gedimd ? C.inkSoft : C.ink,
        border: `1.5px solid ${actief ? C.blue : C.borderTint}`,
        opacity: gedimd && !actief ? 0.6 : 1
      },
      children: inhoud
    },
    inhoud
  );
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, marginBottom: 10 }, children: /* @__PURE__ */ jsxs("div", { style: { flex: 1, position: "relative" }, children: [
      /* @__PURE__ */ jsx(Search, { size: 15, color: C.inkSoft, style: { position: "absolute", left: 10, top: 13 } }),
      /* @__PURE__ */ jsx(
        "input",
        {
          autoComplete: "off",
          style: { ...inputStyle, paddingLeft: 30 },
          placeholder: "Zoek een gerecht\u2026",
          value: query,
          onChange: (e) => setQuery(e.target.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: C.paper,
      paddingTop: 4,
      paddingBottom: 8,
      marginBottom: 4,
      borderBottom: `1px solid ${C.ceramic}`
    }, children: /* @__PURE__ */ jsxs("div", { className: "no-scrollbar", style: { display: "flex", gap: 7, overflowX: "auto" }, children: [
      INGANGEN.map(
        (i) => chip(
          view === i.key && bookMode === "mine",
          zoekt ? i.label : `${i.label} ${i.telling}`,
          () => {
            setBookMode("mine");
            setView(i.key);
          },
          i.telling === 0
        )
      ),
      /* @__PURE__ */ jsx("span", { style: { flexShrink: 0, width: 1, background: C.ceramicDark, margin: "4px 2px" } }),
      chip(bookMode === "community", "Community", () => setBookMode("community")),
      chip(bookMode === "history", "Historie", () => setBookMode("history")),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setFilterOpen(true),
          "aria-label": "Meer filters",
          style: {
            flexShrink: 0,
            borderRadius: 20,
            padding: "9px 12px",
            minHeight: 38,
            cursor: "pointer",
            background: dietOnly || maxCookTime ? C.sage : C.cardBg,
            border: `1.5px solid ${dietOnly || maxCookTime ? C.sage : C.borderTint}`,
            display: "flex",
            alignItems: "center"
          },
          children: /* @__PURE__ */ jsx(SlidersHorizontal, { size: 15, color: dietOnly || maxCookTime ? "#fff" : C.ink })
        }
      )
    ] }) }),
    filterOpen && /* @__PURE__ */ jsxs(Modal, { title: "Filteren", onClose: () => setFilterOpen(false), children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }, children: "Kooktijd" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }, children: [["Alles", null], ["Tot 20 min", 20], ["Tot 45 min", 45]].map(([label, val]) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMaxCookTime(val),
          style: {
            padding: "8px 12px",
            minHeight: 34,
            borderRadius: 20,
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: FONT_BODY,
            background: maxCookTime === val ? C.blue : C.cardBg,
            color: maxCookTime === val ? "#fff" : C.ink,
            border: `1.5px solid ${maxCookTime === val ? C.blue : C.borderTint}`
          },
          children: label
        },
        label
      )) }),
      activeDietTags && activeDietTags.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }, children: "Dieetwensen" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setDietOnly((v) => !v),
            style: {
              width: "100%",
              textAlign: "left",
              padding: "11px 13px",
              borderRadius: 14,
              cursor: "pointer",
              fontFamily: FONT_BODY,
              fontSize: 13,
              marginBottom: 16,
              background: dietOnly ? C.sage : C.cardBg,
              color: dietOnly ? "#fff" : C.ink,
              border: `1.5px solid ${dietOnly ? C.sage : C.borderTint}`
            },
            children: [
              "Alleen wat past bij ",
              activeDietTags.join(", ")
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(PrimaryButton, { full: true, onClick: () => setFilterOpen(false), children: "Klaar" })
    ] }),
    bookMode === "history" ? /* @__PURE__ */ jsx(CookHistoryList, { cookLog, onOpen }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      view === "kan" && bookMode === "mine" && (() => {
        const compleet = recipes.filter((r) => recipeReadiness(r, inventory).complete);
        return compleet.length === 0 && recipes.length > 0 ? /* @__PURE__ */ jsx("div", { style: { background: C.noteBg, border: `1px solid ${C.mustard}`, borderRadius: 14, padding: "10px 12px", marginBottom: 12, fontSize: 12.5, color: C.ink, lineHeight: 1.5 }, children: "Op dit moment is niets helemaal compleet. Deze komen het dichtst in de buurt." }) : null;
      })(),
      /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: recipes.map((r, idx) => {
        const readiness = recipeReadiness(r, inventory);
        const vorige = idx > 0 ? recipes[idx - 1] : null;
        const toonScheiding = view === "kan" && bookMode === "mine" && idx > 0 && !readiness.complete && vorige && recipeReadiness(vorige, inventory).complete;
        return /* @__PURE__ */ jsxs(React.Fragment, { children: [
          toonScheiding && /* @__PURE__ */ jsxs("div", { style: { gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 9, margin: "6px 0 2px" }, children: [
            /* @__PURE__ */ jsx("span", { style: { height: 1, background: C.ceramicDark, flex: 1 } }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: C.inkSoft }, children: "Bijna compleet" }),
            /* @__PURE__ */ jsx("span", { style: { height: 1, background: C.ceramicDark, flex: 1 } })
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => onOpen(r.id),
              style: { background: C.cardBg, borderRadius: 16, padding: 8, cursor: "pointer", border: `1.5px solid ${C.borderTint}`, position: "relative" },
              children: [
                /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 5, left: 5, width: 6, height: 6, borderRadius: 2, background: C.blue, opacity: 0.18, transform: "rotate(45deg)" } }),
                /* @__PURE__ */ jsx("div", { style: { position: "absolute", bottom: 5, right: 5, width: 6, height: 6, borderRadius: 2, background: C.blue, opacity: 0.18, transform: "rotate(45deg)" } }),
                /* @__PURE__ */ jsx(TileThumb, { recipe: r }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }, children: [
                  /* @__PURE__ */ jsx("span", { style: {
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.ink,
                    lineHeight: 1.25,
                    // Afkappen na twee regels: een lange naam maakte de tegel
                    // hoger dan zijn buurman en trok het raster scheef.
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    wordBreak: "break-word"
                  }, children: r.name }),
                  bookMode === "mine" && /* @__PURE__ */ jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onToggleFav(r.id);
                  }, style: { background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 0, marginLeft: 4 }, children: /* @__PURE__ */ jsx(Star, { size: 16, fill: r.favorite ? C.mustard : "none", color: r.favorite ? C.mustard : C.ceramicDark }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { marginTop: 4, fontSize: 12, color: readiness.complete ? C.sage : C.inkSoft, lineHeight: 1.35 }, children: [
                  r.cookTime,
                  "m",
                  readiness.relevant > 0 && (readiness.complete ? " \xB7 compleet" : readiness.missing.length === 0 ? " \xB7 voorraad onzeker" : readiness.missing.length === 1 ? ` \xB7 nog ${readiness.missing[0].toLowerCase()}` : ` \xB7 nog ${readiness.missing.length} nodig`)
                ] }),
                r.community && bookMode === "mine" && /* @__PURE__ */ jsx("div", { style: { marginTop: 5 }, children: /* @__PURE__ */ jsxs(Pill, { tone: "auto", children: [
                  /* @__PURE__ */ jsx(Users, { size: 10 }),
                  " Gedeeld"
                ] }) }),
                bookMode === "community" && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      onDuplicate(r.id);
                    },
                    style: { marginTop: 8, width: "100%", padding: "6px 8px", borderRadius: 10, border: "none", background: C.mustard, color: "#2A1F06", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
                    children: [
                      /* @__PURE__ */ jsx(Plus, { size: 12 }),
                      " Voeg toe"
                    ]
                  }
                )
              ]
            }
          )
        ] }, r.id);
      }) }),
      recipes.length === 0 && bookMode === "community" && /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "40px 10px", color: C.inkSoft, fontSize: 13 }, children: [
        /* @__PURE__ */ jsx(Users, { size: 26, color: C.ceramicDark, style: { marginBottom: 8 } }),
        /* @__PURE__ */ jsx("p", { children: "Nog geen gedeelde recepten. Open een recept in je eigen kookboek en tik op het community-icoon om als eerste iets te delen." })
      ] }),
      recipes.length === 0 && bookMode === "mine" && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "36px 14px", color: C.inkSoft, fontSize: 13, lineHeight: 1.55 }, children: zoekt ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "Geen gerecht gevonden voor \u201C",
        query,
        "\u201D."
      ] }) : view === "favoriet" ? /* @__PURE__ */ jsx(Fragment, { children: "Nog geen favorieten. Tik op de ster bij een recept om het hier te bewaren." }) : view === "seizoen" ? /* @__PURE__ */ jsx(Fragment, { children: "Geen van je recepten gebruikt typische producten van deze maand." }) : view === "kan" ? /* @__PURE__ */ jsx(Fragment, { children: "Je kunt op dit moment niets volledig maken. Vul je voorraad aan, of kijk bij \u201CAlles\u201D wat er dichtbij komt." }) : /* @__PURE__ */ jsx(Fragment, { children: "Je kookboek is nog leeg. Tik op de plusknop om je eerste recept toe te voegen." }) }),
      bookMode === "mine" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onNew,
          "aria-label": "Nieuw recept toevoegen",
          style: {
            position: "fixed",
            right: 16,
            zIndex: 60,
            bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
            width: 56,
            height: 56,
            borderRadius: 28,
            border: "none",
            background: C.blue,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(21,44,72,0.28)"
          },
          children: /* @__PURE__ */ jsx(Plus, { size: 26 })
        }
      )
    ] })
  ] });
}
function CookHistoryList({ cookLog, onOpen }) {
  const counts = useMemo(() => {
    const map = {};
    cookLog.forEach((e) => {
      map[e.recipeId] = (map[e.recipeId] || 0) + 1;
    });
    return map;
  }, [cookLog]);
  if (!cookLog.length) {
    return /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "40px 10px", color: C.inkSoft, fontSize: 13 }, children: [
      /* @__PURE__ */ jsx(Clock, { size: 26, color: C.ceramicDark, style: { marginBottom: 8 } }),
      /* @__PURE__ */ jsx("p", { children: 'Nog geen kookgeschiedenis. Zodra je "Ik heb dit gekookt" gebruikt, verschijnt het hier.' })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }, children: cookLog.map((entry, idx) => /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: () => onOpen(entry.recipeId),
      style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: idx < cookLog.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" },
      children: [
        /* @__PURE__ */ jsx("div", { style: { width: 32, height: 32, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }, children: entry.emoji || "\u{1F37D}\uFE0F" }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 14, color: C.ink }, children: [
            entry.leftover ? "\u{1F371} " : "",
            entry.recipeName
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: [
            new Date(entry.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
            entry.leftover ? " \xB7 als kliekje" : ` \xB7 ${entry.servings} pers.`,
            !entry.leftover && counts[entry.recipeId] > 1 && ` \xB7 ${counts[entry.recipeId]}x gemaakt`
          ] })
        ] })
      ]
    },
    entry.id
  )) });
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
      setThread((t) => [...t, { role: "chef", text: answer.trim() || "Hmm, daar heb ik geen goed antwoord op \u2014 probeer het anders te vragen." }]);
    } catch (e) {
      setError("Kon de souschef niet bereiken. Controleer je verbinding en probeer het opnieuw.");
    } finally {
      setAsking(false);
    }
  };
  return /* @__PURE__ */ jsxs(Modal, { title: "AI-souschef", onClose, wide: true, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Stel een vraag over dit recept \u2014 bijv. een vervanging voor een ingredi\xEBnt dat je niet hebt." }),
    thread.length > 0 && /* @__PURE__ */ jsx("div", { style: { maxHeight: 280, overflowY: "auto", marginBottom: 12 }, children: thread.map((msg, idx) => /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }, children: /* @__PURE__ */ jsxs("div", { style: {
      maxWidth: "85%",
      padding: "9px 12px",
      borderRadius: 14,
      background: msg.role === "user" ? C.blue : C.cardBg,
      color: msg.role === "user" ? "#fff" : C.ink,
      border: msg.role === "user" ? "none" : `1.5px solid ${C.borderTint}`,
      fontSize: 13,
      lineHeight: 1.4
    }, children: [
      msg.role === "chef" && /* @__PURE__ */ jsx("span", { style: { marginRight: 5 }, children: "\u{1F468}\u200D\u{1F373}" }),
      msg.text
    ] }) }, idx)) }),
    asking && /* @__PURE__ */ jsx("div", { style: { marginBottom: 10 }, children: /* @__PURE__ */ jsx(PollepelLoader, { tekst: "Souschef denkt na\u2026", size: 22, inline: true }) }),
    error && /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.brick, marginTop: -4, marginBottom: 10 }, children: error }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          autoComplete: "off",
          style: inputStyle,
          placeholder: "Bijv. Kan ik room vervangen door melk?",
          value: question,
          onChange: (e) => setQuestion(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && submit()
        }
      ),
      /* @__PURE__ */ jsx(PrimaryButton, { onClick: submit, disabled: !question.trim() || asking, children: /* @__PURE__ */ jsx(Sparkles, { size: 16 }) })
    ] })
  ] });
}
function nutritionFingerprint(recipe) {
  return (recipe.ingredients || []).map((i) => `${(i.name || "").toLowerCase()}|${i.amount}|${i.unit}`).join("~") + `#${recipe.servings || 1}`;
}
function NutritionLabel({ recipe, isMine, onRecalculate, busy }) {
  const [showDetails, setShowDetails] = useState(false);
  const n = recipe.nutrition;
  if (!n) {
    return /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 16, padding: 14, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkSoft, marginBottom: isMine ? 8 : 0 }, children: "Voedingswaarden nog niet berekend." }),
      isMine && /* @__PURE__ */ jsxs(GhostButton, { onClick: onRecalculate, disabled: busy, full: true, children: [
        busy && /* @__PURE__ */ jsx(PollepelLoader, { size: 16, inline: true, delay: 0 }),
        busy ? "Bezig met berekenen\u2026" : "Bereken voedingswaarden"
      ] })
    ] });
  }
  const stale = n.fingerprint && n.fingerprint !== nutritionFingerprint(recipe);
  const r1 = (v) => Math.round((v || 0) * 10) / 10;
  const rows = [
    ["Energie", `${Math.round(n.kcal || 0)} kcal`],
    ["Eiwitten", `${r1(n.proteinG)} g`],
    ["Koolhydraten", `${r1(n.carbsG)} g`, `waarvan suikers ${r1(n.sugarsG)} g`],
    ["Vezels", `${r1(n.fiberG)} g`],
    ["Vet", `${r1(n.fatG)} g`, `waarvan verzadigd ${r1(n.saturatedFatG)} g`],
    ["Zout", `${r1(n.saltG)} g`]
  ];
  return /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${stale ? C.brick : C.borderTint}`, borderRadius: 16, padding: 14, marginBottom: 16 }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }, children: [
      /* @__PURE__ */ jsx("h3", { style: { fontFamily: FONT_DISPLAY, fontSize: 14, margin: 0 }, children: "Voedingswaarden per portie" }),
      isMine && /* @__PURE__ */ jsx("button", { onClick: onRecalculate, disabled: busy, style: { background: "none", border: "none", cursor: busy ? "default" : "pointer", color: C.blue, fontSize: 12, fontWeight: 600, padding: 0, flexShrink: 0 }, children: busy ? "Bezig\u2026" : "Opnieuw berekenen" })
    ] }),
    stale && /* @__PURE__ */ jsx("div", { style: { background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 10, padding: "7px 9px", marginBottom: 8, fontSize: 12, color: C.brick }, children: "\u26A0\uFE0F Het recept is gewijzigd na deze berekening \u2014 de waarden kloppen mogelijk niet meer." }),
    rows.map(([label, value, sub], idx) => /* @__PURE__ */ jsxs("div", { style: { padding: "5px 0", borderBottom: idx < rows.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13 }, children: [
        /* @__PURE__ */ jsx("span", { children: label }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, color: C.ink, fontWeight: 600 }, children: value })
      ] }),
      sub && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, marginTop: 1 }, children: sub })
    ] }, idx)),
    n.unmatched && n.unmatched.length > 0 && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, marginTop: 8 }, children: typeof n.coverage === "number" && n.coverage < 70 ? `\u26A0\uFE0F Ruwe schatting \u2014 een groot deel van het recept kon niet worden herkend (${n.coverage}% van het gewicht meegerekend). Niet meegeteld: ${n.unmatched.join(", ")}` : `Gedeeltelijke schatting \u2014 niet meegerekend: ${n.unmatched.join(", ")}` }),
    n.matched && n.matched.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowDetails((v) => !v),
          style: { background: "none", border: "none", padding: 0, marginTop: 8, cursor: "pointer", color: C.blue, fontSize: 12, fontWeight: 600 },
          children: [
            showDetails ? "Verberg" : "Toon",
            " welke producten zijn gebruikt"
          ]
        }
      ),
      showDetails && /* @__PURE__ */ jsx("div", { style: { marginTop: 6, borderTop: `1px solid ${C.ceramic}`, paddingTop: 6 }, children: n.matched.map((m, idx) => /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, padding: "2px 0" }, children: [
        /* @__PURE__ */ jsx("strong", { style: { color: C.ink }, children: m.ingredient }),
        " (",
        m.grams,
        " g) \u2192 ",
        m.nevo
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, marginTop: 8, lineHeight: 1.4 }, children: "Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven." })
  ] });
}
function RecipeDetail({ recipe, isMine = true, onBack, onToggleFav, onToggleCommunity, onEdit, onDelete, onCook, onDuplicate, onAddLeftover, onAddFreezerPortion, onAskSousChef, isPremiumOn, inventory, showToast, dislikeWarnings, doublePortionDefault, onAddMissingToShopping, onStartCooking, onKoppel, leftoverItem, onEatLeftover, onRecalculateNutrition, nutritionBusy }) {
  const [confirmCook, setConfirmCook] = useState(false);
  const [usedAmounts, setUsedAmounts] = useState({});
  const [leftoverPortions, setLeftoverPortions] = useState(0);
  const [bewaarplek, setBewaarplek] = useState("koelkast");
  const [eatPortions, setEatPortions] = useState(1);
  const [wantDoublePortion, setWantDoublePortion] = useState(!!doublePortionDefault);
  useEffect(() => {
    setWantDoublePortion(!!doublePortionDefault);
  }, [doublePortionDefault, recipe?.id]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [servings, setServings] = useState(recipe.servings);
  const [keepAwake, setKeepAwake] = useState(false);
  const [sousChefOpen, setSousChefOpen] = useState(false);
  const [timers, setTimers] = useState([]);
  const [timerTick, setTimerTick] = useState(0);
  const audioCtxRef = React.useRef(null);
  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const Ctx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (Ctx) {
        try {
          audioCtxRef.current = new Ctx();
        } catch (e) {
        }
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {
      });
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
        gain.gain.setValueAtTime(1e-3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + delay + 0.28);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch (e) {
      console.error("Timer-geluid afspelen mislukt:", e);
    }
  };
  const startTimer = (minutes, label) => {
    if (!minutes || minutes <= 0) return;
    ensureAudioContext();
    setTimers((prev) => [...prev, { id: uid(), label: label || `${minutes} min`, endTime: Date.now() + minutes * 6e4, notified: false }]);
  };
  const cancelTimer = (id) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };
  useEffect(() => {
    if (!timers.length) return;
    const iv = setInterval(() => setTimerTick((t) => t + 1), 1e3);
    return () => clearInterval(iv);
  }, [timers.length]);
  useEffect(() => {
    timers.forEach((t) => {
      const remaining = Math.max(0, Math.round((t.endTime - Date.now()) / 1e3));
      if (remaining <= 0 && !t.notified) {
        playTimerSound();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        setTimers((prev) => prev.map((x) => x.id === t.id ? { ...x, notified: true } : x));
      }
    });
  }, [timerTick]);
  const handleVoiceTimer = (text) => {
    const minutes = parseSpokenDurationMinutes(text);
    if (minutes) startTimer(minutes, text);
  };
  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const wakeLockRef = React.useRef(null);
  const keepAwakeRef = React.useRef(false);
  const wakeLockSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const acquireWakeLock = async () => {
    if (!wakeLockSupported) return false;
    try {
      const lock = await navigator.wakeLock.request("screen");
      wakeLockRef.current = lock;
      lock.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
      return true;
    } catch (e) {
      console.error("Wake Lock-aanvraag mislukt:", e.name, e.message);
      return false;
    }
  };
  const releaseWakeLock = async () => {
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
      }
    }
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
  const scale = servings / (recipe.servings || 1);
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
      shortfallItems.forEach((s) => {
        defaults[s.item.id] = s.have;
      });
      setUsedAmounts(defaults);
      setConfirmCook("shortfall");
    } else {
      setConfirmCook(true);
    }
  };
  const finishCook = (overrides) => {
    onCook(wantDoublePortion ? scale * 2 : scale, overrides || {});
    if (wantDoublePortion) {
      onAddFreezerPortion(recipe);
      setConfirmCook(false);
    } else setConfirmCook("leftover");
  };
  const scaledIngredients = recipe.ingredients.map((ing) => ({ ...ing, scaledAmount: round2(ing.amount * scale) }));
  const readiness = recipeReadiness(recipe, inventory, scale);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
      /* @__PURE__ */ jsxs("button", { onClick: onBack, style: { background: "none", border: "none", display: "flex", alignItems: "center", gap: 4, color: C.blue, cursor: "pointer", padding: 0, fontWeight: 600, fontSize: 13 }, children: [
        /* @__PURE__ */ jsx(ChevronLeft, { size: 16 }),
        " Terug"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        isMine && isPremiumOn && isPremiumOn("sousChef") && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSousChefOpen(true),
            title: "Vraag de AI-souschef",
            style: { display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", minHeight: 34, borderRadius: 20, cursor: "pointer", border: `1.5px solid ${C.borderTint}`, background: C.cardBg, color: C.inkSoft },
            children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 13 }, children: "\u{1F468}\u200D\u{1F373}" }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 12, fontWeight: 600 }, children: "Souschef" })
            ]
          }
        ),
        wakeLockSupported && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: toggleScreenAwake,
            title: keepAwake ? "Het scherm blijft aan tijdens het koken" : "Voorkom dat het scherm uitvalt tijdens het koken",
            style: {
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 12px",
              minHeight: 34,
              borderRadius: 20,
              cursor: "pointer",
              border: `1.5px solid ${keepAwake ? C.mustard : C.borderTint}`,
              background: keepAwake ? C.mustard : C.cardBg,
              color: keepAwake ? "#fff" : C.inkSoft
            },
            children: [
              /* @__PURE__ */ jsx(Sun, { size: 13 }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 12, fontWeight: 600 }, children: keepAwake ? "Scherm blijft aan" : "Scherm aan houden" })
            ]
          }
        )
      ] })
    ] }),
    !isMine && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, padding: "8px 10px", marginBottom: 10, fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsx(Users, { size: 13, color: C.blue }),
      " Gedeeld door een ander huishouden \u2014 bekijk, of dupliceer naar je eigen kookboek om aan te passen."
    ] }),
    /* @__PURE__ */ jsx(TileThumb, { recipe, size: "large" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }, children: [
      /* @__PURE__ */ jsx("h1", { style: { fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.ink, margin: 0 }, children: recipe.name }),
      isMine && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0, marginLeft: 8 }, children: [
        /* @__PURE__ */ jsx("button", { "aria-label": "Recept delen met andere huishoudens", onClick: onToggleCommunity, title: recipe.community ? "Niet meer delen" : "Delen met community", style: { padding: 8, margin: -8, background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Users, { size: 20, fill: recipe.community ? C.blue : "none", color: recipe.community ? C.blue : C.ceramicDark }) }),
        /* @__PURE__ */ jsx("button", { "aria-label": "Markeren als favoriet", onClick: onToggleFav, style: { padding: 8, margin: -8, background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Star, { size: 22, fill: recipe.favorite ? C.mustard : "none", color: recipe.favorite ? C.mustard : C.ceramicDark }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, marginTop: 6, marginBottom: 14, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs(Pill, { children: [
        /* @__PURE__ */ jsx(Clock, { size: 11 }),
        " ",
        recipe.cookTime,
        " min"
      ] }),
      recipe.community && /* @__PURE__ */ jsxs(Pill, { tone: "auto", children: [
        /* @__PURE__ */ jsx(Users, { size: 10 }),
        " Gedeeld met community"
      ] }),
      readiness.relevant > 0 && (readiness.complete ? /* @__PURE__ */ jsxs(Pill, { tone: "ok", children: [
        /* @__PURE__ */ jsx(Check, { size: 10 }),
        " Alles in huis"
      ] }) : /* @__PURE__ */ jsxs(Pill, { tone: "warn", children: [
        "Nog ",
        readiness.missing.length,
        " nodig"
      ] }))
    ] }),
    readiness.missing.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.warnBg, border: `1px solid ${C.mustardDeep}`, borderRadius: 14, padding: "10px 12px", marginBottom: 14 }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4 }, children: "Hiervoor heb je nog nodig:" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: readiness.missing.map((naam) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onKoppel && onKoppel(naam),
          title: "Staat dit w\xE9l in je voorraad? Koppel het.",
          style: {
            background: C.cardBg,
            border: `1px dashed ${C.mustardDeep}`,
            borderRadius: 10,
            padding: "8px 11px",
            minHeight: 34,
            fontSize: 13,
            color: C.ink,
            cursor: onKoppel ? "pointer" : "default",
            fontFamily: FONT_BODY
          },
          children: naam
        },
        naam
      )) }),
      onKoppel && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, marginTop: 6 }, children: "Heb je het toch in huis onder een andere naam? Tik erop om het te koppelen." }),
      /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, marginTop: 6, marginBottom: 8 }, children: [
        "Voor ",
        servings,
        " ",
        servings === 1 ? "persoon" : "personen",
        ". Basis zoals zout, peper en olie is niet meegerekend.",
        readiness.estimated && readiness.estimated.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          " Bij ",
          readiness.estimated.join(", "),
          " is gerekend met een gemiddeld gewicht per stuk."
        ] })
      ] }),
      onAddMissingToShopping && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onAddMissingToShopping(scale),
          style: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: C.mustard,
            color: "#2A1F06",
            border: "none",
            borderRadius: 12,
            padding: "9px 12px",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: FONT_BODY
          },
          children: [
            /* @__PURE__ */ jsx(ShoppingCart, { size: 15 }),
            " Zet op de boodschappenlijst"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: "8px 12px", marginBottom: 14 }, children: [
      /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, color: C.ink, display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx(Users, { size: 15, color: C.inkSoft }),
        " Aantal personen"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setServings((s) => Math.max(1, s - 1)), style: { width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx(Minus, { size: 14 }) }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 15, minWidth: 18, textAlign: "center" }, children: servings }),
        /* @__PURE__ */ jsx("button", { onClick: () => setServings((s) => s + 1), style: { width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx(Plus, { size: 14 }) })
      ] })
    ] }),
    dislikeWarnings && dislikeWarnings.length > 0 && /* @__PURE__ */ jsx("div", { style: { background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 14, padding: 12, marginBottom: 14 }, children: dislikeWarnings.map((w, idx) => /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.brick, marginBottom: idx < dislikeWarnings.length - 1 ? 4 : 0 }, children: [
      "\u26A0\uFE0F Bevat ",
      /* @__PURE__ */ jsx("strong", { children: w.ingredient }),
      " \u2014 ",
      w.people.join(" en "),
      " ",
      w.people.length > 1 ? "lusten" : "lust",
      " dit niet"
    ] }, idx)) }),
    /* @__PURE__ */ jsx("h3", { style: { fontFamily: FONT_DISPLAY, fontSize: 15, margin: "0 0 8px" }, children: "Ingredi\xEBnten" }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: scaledIngredients.map((ing, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "9px 12px", borderBottom: idx < scaledIngredients.length - 1 ? `1px solid ${C.ceramic}` : "none", fontSize: 14 }, children: [
      /* @__PURE__ */ jsx("span", { children: ing.name }),
      /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, color: C.inkSoft }, children: [
        ing.scaledAmount,
        " ",
        ing.unit
      ] })
    ] }, idx)) }),
    /* @__PURE__ */ jsx(NutritionLabel, { recipe, isMine, onRecalculate: onRecalculateNutrition, busy: nutritionBusy }),
    /* @__PURE__ */ jsxs("h3", { style: { fontFamily: FONT_DISPLAY, fontSize: 15, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }, children: [
      "Bereiding",
      /* @__PURE__ */ jsx(VoiceInputButton, { onResult: handleVoiceTimer, title: "Zeg bijv. 'zet een timer van 10 minuten'", size: 13 })
    ] }),
    timers.length > 0 && /* @__PURE__ */ jsx("div", { style: { position: "sticky", top: 8, zIndex: 5, marginBottom: 12, display: "flex", flexDirection: "column", gap: 6 }, children: timers.map((t) => {
      const remaining = Math.max(0, Math.round((t.endTime - Date.now()) / 1e3));
      const done = remaining <= 0;
      return /* @__PURE__ */ jsxs("div", { style: {
        background: done ? C.brick : C.blueDeep,
        color: "#fff",
        borderRadius: 14,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx(TimerIcon, { size: 16, style: { flexShrink: 0 } }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: t.label })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700 }, children: done ? "Klaar!" : formatTimer(remaining) }),
          /* @__PURE__ */ jsx("button", { onClick: () => cancelTimer(t.id), style: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 4, cursor: "pointer", display: "flex" }, children: /* @__PURE__ */ jsx(X, { size: 14, color: "#fff" }) })
        ] })
      ] }, t.id);
    }) }),
    /* @__PURE__ */ jsx("ol", { style: { padding: 0, margin: "0 0 18px", listStyle: "none" }, children: recipe.steps.map((s, idx) => {
      const minutes = parseSpokenDurationMinutes(s);
      return /* @__PURE__ */ jsxs("li", { style: { display: "flex", gap: 10, marginBottom: 10, fontSize: 14, color: C.ink, lineHeight: 1.4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, color: C.mustardDeep, fontWeight: 600, flexShrink: 0 }, children: String(idx + 1).padStart(2, "0") }),
        /* @__PURE__ */ jsx("span", { style: { flex: 1 }, children: s }),
        minutes && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => startTimer(minutes, `Stap ${idx + 1}: ${minutes} min`),
            title: `Start timer van ${minutes} minuten`,
            style: { flexShrink: 0, background: C.ceramic, border: "none", borderRadius: 8, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, height: 22 },
            children: [
              /* @__PURE__ */ jsx(TimerIcon, { size: 12, color: C.blueDeep }),
              /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: C.blueDeep, fontFamily: FONT_MONO }, children: [
                minutes,
                "m"
              ] })
            ]
          }
        )
      ] }, idx);
    }) }),
    recipe.notes && /* @__PURE__ */ jsxs("div", { style: { background: C.noteBg, border: `1px solid ${C.mustard}`, borderRadius: 14, padding: 12, marginBottom: 16, display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx(StickyNote, { size: 16, color: C.mustardDeep, style: { flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 600, color: C.mustardDeep, marginBottom: 2 }, children: "Jouw notitie" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.ink, whiteSpace: "pre-wrap" }, children: recipe.notes })
      ] })
    ] }),
    isMine && leftoverItem && confirmCook === false && /* @__PURE__ */ jsxs("div", { style: { background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 13 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 22 }, children: "\u{1F371}" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 14, fontWeight: 600, color: C.ink }, children: "Dit staat als kliekje gepland" }),
          /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 12, color: C.inkSoft }, children: [
            leftoverItem.name,
            " \xB7 ",
            leftoverItem.current,
            " ",
            leftoverItem.current === 1 ? "portie" : "porties",
            " over"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, margin: "0 0 10px", lineHeight: 1.45 }, children: "Je hoeft niets af te boeken van je voorraad \u2014 dat is al gebeurd toen je dit kookte." }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 11 }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Minder porties",
            onClick: () => setEatPortions((p) => Math.max(1, p - 1)),
            style: { width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" },
            children: /* @__PURE__ */ jsx(Minus, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, fontSize: 15, minWidth: 92, textAlign: "center" }, children: [
          eatPortions,
          " ",
          eatPortions === 1 ? "portie" : "porties"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Meer porties",
            onClick: () => setEatPortions((p) => Math.min(Number(leftoverItem.current) || 1, p + 1)),
            style: { width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" },
            children: /* @__PURE__ */ jsx(Plus, { size: 14 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", full: true, onClick: () => onEatLeftover(eatPortions), children: [
        /* @__PURE__ */ jsx(Check, { size: 16 }),
        " Opgegeten"
      ] })
    ] }),
    isMine && !leftoverItem && confirmCook === false && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
      /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: () => setConfirmCook("prep"), children: [
        /* @__PURE__ */ jsx(ShoppingCart, { size: 15 }),
        " Ik ga dit koken \u2014 check mijn voorraad"
      ] }),
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", full: true, onClick: startCook, children: [
        /* @__PURE__ */ jsx(Flame, { size: 16 }),
        " Ik heb dit gekookt"
      ] })
    ] }),
    isMine && confirmCook === "prep" && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }, children: [
      recipe.cookTime > 0 && /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 8px" }, children: [
        /* @__PURE__ */ jsx(Clock, { size: 12, style: { verticalAlign: -1, marginRight: 4 } }),
        "Begin je nu, dan sta je rond",
        " ",
        /* @__PURE__ */ jsx("strong", { style: { color: C.ink }, children: new Date(Date.now() + Number(recipe.cookTime) * 6e4).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) }),
        " ",
        "aan tafel. Je huisgenoten zien dat ook."
      ] }),
      readiness.missing.length === 0 ? /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, margin: "0 0 10px", color: C.ink }, children: [
        /* @__PURE__ */ jsx(Check, { size: 14, color: C.sage, style: { verticalAlign: -2, marginRight: 4 } }),
        "Je hebt alles in huis voor ",
        servings,
        " ",
        servings === 1 ? "persoon" : "personen",
        ". Veel kookplezier."
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, margin: "0 0 6px", color: C.ink }, children: [
          "Voor ",
          servings,
          " ",
          servings === 1 ? "persoon" : "personen",
          " mis je nog:"
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.brick, marginBottom: 10, lineHeight: 1.5 }, children: readiness.missing.join(" \xB7 ") })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        readiness.missing.length > 0 && onAddMissingToShopping && /* @__PURE__ */ jsxs(PrimaryButton, { onClick: () => {
          onAddMissingToShopping(scale);
          setConfirmCook(false);
        }, children: [
          /* @__PURE__ */ jsx(ShoppingCart, { size: 15 }),
          " Op de lijst"
        ] }),
        onStartCooking && /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", onClick: () => {
          onStartCooking(servings);
          setConfirmCook(false);
        }, children: [
          /* @__PURE__ */ jsx(Flame, { size: 15 }),
          " Ik begin"
        ] }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmCook(false), children: "Sluiten" })
      ] })
    ] }),
    isMine && confirmCook === "shortfall" && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }, children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, margin: "0 0 4px", color: C.ink }, children: "Volgens je voorraad had je van een paar dingen te weinig." }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 12, margin: "0 0 10px", color: C.inkSoft }, children: "Hoeveel heb je er werkelijk van gebruikt? Zo blijft je voorraad kloppen." }),
      shortfallItems.map((s) => /* @__PURE__ */ jsxs("div", { style: { borderTop: `1px solid ${C.ceramic}`, padding: "8px 0" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: C.ink, fontWeight: 600 }, children: s.item.name }),
          /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, fontSize: 11, color: C.inkSoft }, children: [
            "recept ",
            round2(s.need),
            " \xB7 in huis ",
            round2(s.have),
            " ",
            s.unit
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              autoComplete: "off",
              type: "number",
              style: { ...inputStyle, width: 100 },
              value: usedAmounts[s.item.id] != null ? usedAmounts[s.item.id] : s.have,
              onChange: (e) => setUsedAmounts({ ...usedAmounts, [s.item.id]: e.target.value })
            }
          ),
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: C.inkSoft }, children: [
            s.unit,
            " gebruikt"
          ] })
        ] })
      ] }, s.item.id)),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 12 }, children: [
        /* @__PURE__ */ jsx(PrimaryButton, { tone: "sage", onClick: () => {
          const overrides = {};
          Object.keys(usedAmounts).forEach((k) => {
            overrides[k] = Number(usedAmounts[k]) || 0;
          });
          finishCook(overrides);
        }, children: "Klopt, bijwerken" }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmCook(false), children: "Annuleren" })
      ] })
    ] }),
    isMine && confirmCook === true && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.sage}`, borderRadius: 14, padding: 12 }, children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, margin: "0 0 10px", color: C.ink }, children: [
        "Dit haalt de gebruikte ingredi\xEBnten van je voorraad af (voor ",
        servings,
        " ",
        servings === 1 ? "persoon" : "personen",
        "). Zakt iets daardoor onder je ingestelde minimum, dan zetten we dat apart op de boodschappenlijst. Doorgaan?"
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setWantDoublePortion((v) => !v),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "9px 10px",
            marginBottom: 10,
            background: wantDoublePortion ? C.successBg : C.cardBg,
            border: `1.5px solid ${wantDoublePortion ? C.sage : C.borderTint}`,
            borderRadius: 12,
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: 15 }, children: "\u2744\uFE0F" }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: wantDoublePortion ? C.sage : C.inkSoft, fontWeight: wantDoublePortion ? 600 : 400 }, children: "Dubbele portie koken (extra gaat de vriezer in)" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx(PrimaryButton, { tone: "sage", onClick: () => finishCook({}), children: "Ja, bijwerken" }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmCook(false), children: "Annuleren" })
      ] })
    ] }),
    isMine && confirmCook === "leftover" && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }, children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, margin: "0 0 10px", color: C.ink }, children: "Is er iets van dit gerecht overgebleven?" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setLeftoverPortions((p) => Math.max(0, p - 1)), style: { width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }, children: /* @__PURE__ */ jsx(Minus, { size: 14 }) }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 15, minWidth: 90, textAlign: "center" }, children: leftoverPortions === 0 ? "Niets over" : `${leftoverPortions} portie${leftoverPortions > 1 ? "s" : ""}` }),
        /* @__PURE__ */ jsx("button", { onClick: () => setLeftoverPortions((p) => p + 1), style: { width: 44, height: 44, borderRadius: 8, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }, children: /* @__PURE__ */ jsx(Plus, { size: 14 }) })
      ] }),
      leftoverPortions > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkSoft, marginBottom: 6 }, children: "Waar bewaar je het?" }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, marginBottom: 12 }, children: [
          ["koelkast", "\u2744\uFE0F Koelkast", "eet binnen 3 dagen op"],
          ["vriezer", "\u{1F9CA} Vriezer", "houdbaar tot 3 maanden"]
        ].map(([waarde, label, uitleg]) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setBewaarplek(waarde),
            style: {
              flex: 1,
              padding: "10px 8px",
              borderRadius: 14,
              cursor: "pointer",
              fontFamily: FONT_BODY,
              textAlign: "center",
              minHeight: 44,
              background: bewaarplek === waarde ? C.blue : C.cardBg,
              color: bewaarplek === waarde ? "#fff" : C.ink,
              border: `1.5px solid ${bewaarplek === waarde ? C.blue : C.borderTint}`
            },
            children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600 }, children: label }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, opacity: 0.85, marginTop: 1 }, children: uitleg })
            ]
          },
          waarde
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx(PrimaryButton, { tone: "mustard", onClick: () => {
          if (leftoverPortions > 0) onAddLeftover(recipe, leftoverPortions, bewaarplek);
          setConfirmCook(false);
          setLeftoverPortions(0);
          setBewaarplek("koelkast");
        }, children: leftoverPortions > 0 ? "Bewaren" : "Klaar" }),
        leftoverPortions > 0 && /* @__PURE__ */ jsx(GhostButton, { onClick: () => {
          setConfirmCook(false);
          setLeftoverPortions(0);
          setBewaarplek("koelkast");
        }, children: "Overslaan" })
      ] })
    ] }),
    !isMine && /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", full: true, onClick: onDuplicate, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Dupliceer naar mijn kookboek"
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }, children: [
      isMine && !confirmDelete && /* @__PURE__ */ jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: onEdit, children: [
        /* @__PURE__ */ jsx(Pencil, { size: 14 }),
        " Bewerken"
      ] }) }),
      isMine && !confirmDelete && /* @__PURE__ */ jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: onDuplicate, children: [
        /* @__PURE__ */ jsx(Plus, { size: 14 }),
        " Dupliceer"
      ] }) }),
      isMine && (!confirmDelete ? /* @__PURE__ */ jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, danger: true, onClick: () => setConfirmDelete(true), children: [
        /* @__PURE__ */ jsx(Trash2, { size: 14 }),
        " Verwijderen"
      ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsx(GhostButton, { full: true, danger: true, onClick: onDelete, children: "Zeker weten" }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsx(GhostButton, { full: true, onClick: () => setConfirmDelete(false), children: "Annuleren" }) })
      ] }))
    ] }),
    sousChefOpen && /* @__PURE__ */ jsx(SousChefModal, { recipe, onAsk: onAskSousChef, onClose: () => setSousChefOpen(false) })
  ] });
}
function RecipeForm({ initial, inventoryNames, inventoryItems = [], onImport, onCancel, onSave }) {
  const [name, setName] = useState(initial.name || "");
  const [emoji, setEmoji] = useState(initial.emoji || "\u{1F37D}\uFE0F");
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
  const handleEmojiChange = (val) => {
    setEmoji(val);
    setEmojiTouched(true);
  };
  const updateIng = (idx, patch) => setIngredients(ingredients.map((ing, i) => i === idx ? { ...ing, ...patch } : ing));
  const [suggestFor, setSuggestFor] = useState(null);
  const suggestionsFor = (text) => {
    const q = norm(text);
    const pool = inventoryItems || [];
    if (!q) return pool.slice(0, 5);
    const starts = pool.filter((i) => norm(i.name).startsWith(q));
    const contains = pool.filter((i) => !norm(i.name).startsWith(q) && (norm(i.name).includes(q) || namesMatch(i.name, text)));
    return [...starts, ...contains].slice(0, 5);
  };
  const updateStep = (idx, val) => setSteps(steps.map((s, i) => i === idx ? val : s));
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
      diets
    });
  };
  return /* @__PURE__ */ jsxs(Modal, { title: initial.id ? "Recept bewerken" : "Nieuw recept", onClose: onCancel, wide: true, children: [
    !initial.id && onImport && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onImport,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 9,
          width: "100%",
          textAlign: "left",
          background: C.noteBg,
          border: `1.5px solid ${C.mustard}`,
          borderRadius: 14,
          padding: "11px 13px",
          marginBottom: 16,
          cursor: "pointer",
          fontFamily: FONT_BODY
        },
        children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 17, color: C.mustardDeep }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 13.5, color: C.ink, fontWeight: 600 }, children: "Liever overnemen van een foto of link?" }),
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11.5, color: C.inkSoft }, children: "Pollepel leest het recept uit en vult dit formulier alvast in." })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Field, { label: "Naam", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: name, onChange: (e) => handleNameChange(e.target.value), placeholder: "Bijv. Groentecurry" }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: 70 }, children: /* @__PURE__ */ jsx(Field, { label: "Emoji", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: emoji, onChange: (e) => handleEmojiChange(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Foto-URL (optioneel)", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: photoUrl, onChange: (e) => setPhotoUrl(e.target.value), placeholder: "https://\u2026" }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Kooktijd (min)", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: cookTime, onChange: (e) => setCookTime(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Personen", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: servings, onChange: (e) => setServings(e.target.value) }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "10px 0 6px" }, children: "Ingredi\xEBnten" }),
    ingredients.map((ing, idx) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6 }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 2, position: "relative" }, children: /* @__PURE__ */ jsx(
          "input",
          {
            autoComplete: "off",
            style: { ...inputStyle, width: "100%" },
            placeholder: "Naam",
            value: ing.name,
            onFocus: () => setSuggestFor(idx),
            onBlur: () => setTimeout(() => setSuggestFor((v) => v === idx ? null : v), 150),
            onChange: (e) => updateIng(idx, { name: e.target.value, inventoryItemId: null })
          }
        ) }),
        /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: { ...inputStyle, width: 64 }, placeholder: "Aantal", value: ing.amount, onChange: (e) => updateIng(idx, { amount: e.target.value }) }),
        /* @__PURE__ */ jsx("select", { style: { ...inputStyle, width: 90 }, value: ing.unit, onChange: (e) => updateIng(idx, { unit: e.target.value }), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }),
        /* @__PURE__ */ jsx("button", { onClick: () => setIngredients(ingredients.filter((_, i) => i !== idx)), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 16, color: C.inkSoft }) })
      ] }),
      suggestFor === idx && suggestionsFor(ing.name).length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, padding: "6px 10px 2px" }, children: "Uit je voorraad \u2014 tikken vult ook de eenheid in" }),
        suggestionsFor(ing.name).map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            onMouseDown: (e) => e.preventDefault(),
            onClick: () => {
              updateIng(idx, { name: item.name, unit: item.unit, inventoryItemId: item.id });
              setSuggestFor(null);
            },
            style: {
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              background: "none",
              border: "none",
              borderTop: `1px solid ${C.ceramic}`,
              padding: "8px 10px",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: FONT_BODY,
              fontSize: 13
            },
            children: [
              /* @__PURE__ */ jsx("span", { style: { color: C.ink }, children: item.name }),
              /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, fontSize: 11, color: C.inkSoft }, children: [
                item.current,
                " ",
                item.unit,
                " in huis"
              ] })
            ]
          },
          item.id
        ))
      ] }),
      ing.inventoryItemId && suggestFor !== idx && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.sage, marginBottom: 6, marginTop: -2 }, children: [
        /* @__PURE__ */ jsx(Check, { size: 10, style: { verticalAlign: -1, marginRight: 3 } }),
        "Gekoppeld aan je voorraad"
      ] })
    ] }, idx)),
    /* @__PURE__ */ jsxs(GhostButton, { onClick: () => setIngredients([...ingredients, { name: "", amount: "", unit: "stuks" }]), children: [
      /* @__PURE__ */ jsx(Plus, { size: 14 }),
      " Ingredi\xEBnt"
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }, children: "Bereidingsstappen" }),
    steps.map((s, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, color: C.mustardDeep, fontSize: 12, paddingTop: 10 }, children: String(idx + 1).padStart(2, "0") }),
      /* @__PURE__ */ jsx("textarea", { style: { ...inputStyle, flex: 1, minHeight: 40, resize: "vertical" }, value: s, onChange: (e) => updateStep(idx, e.target.value) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", paddingTop: 4 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => moveStep(idx, -1), disabled: idx === 0, style: { background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 2 }, children: /* @__PURE__ */ jsx(ChevronUp, { size: 15, color: C.inkSoft }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => moveStep(idx, 1), disabled: idx === steps.length - 1, style: { background: "none", border: "none", cursor: idx === steps.length - 1 ? "default" : "pointer", opacity: idx === steps.length - 1 ? 0.3 : 1, padding: 2 }, children: /* @__PURE__ */ jsx(ChevronDown, { size: 15, color: C.inkSoft }) })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => setSteps(steps.filter((_, i) => i !== idx)), style: { background: "none", border: "none", cursor: "pointer", paddingTop: 8 }, children: /* @__PURE__ */ jsx(X, { size: 16, color: C.inkSoft }) })
    ] }, idx)),
    /* @__PURE__ */ jsxs(GhostButton, { onClick: () => setSteps([...steps, ""]), children: [
      /* @__PURE__ */ jsx(Plus, { size: 14 }),
      " Stap"
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }, children: "Past bij dieet (optioneel)" }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }, children: DIET_TAGS.map((tag) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setDiets((d) => d.includes(tag) ? d.filter((t) => t !== tag) : [...d, tag]),
        style: {
          padding: "6px 11px",
          borderRadius: 16,
          fontSize: 12,
          cursor: "pointer",
          border: `1.5px solid ${diets.includes(tag) ? C.sage : C.borderTint}`,
          background: diets.includes(tag) ? C.sage : C.cardBg,
          color: diets.includes(tag) ? "#fff" : C.inkSoft
        },
        children: tag
      },
      tag
    )) }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }, children: "Eigen notities (optioneel)" }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        style: { ...inputStyle, minHeight: 60, resize: "vertical" },
        placeholder: "Bijv. 'volgende keer iets minder zout' of 'kids vonden dit top'",
        value: notes,
        onChange: (e) => setNotes(e.target.value)
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 18 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { disabled: !canSave, onClick: handleSave, children: [
        /* @__PURE__ */ jsx(Check, { size: 16 }),
        " Opslaan"
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onCancel, children: "Annuleren" })
    ] })
  ] });
}
function WeekmenuView({ weekmenu, recipes, cooks, inventory, isPremiumOn, periodDays, periods, periodIndex, onPeriodChange, onPickDay, onPickCook, onPickAttendees, onSetDoublePortion, onClearDay, onGenerate, onAIGenerate, onPatternGenerate, onDuplicate, onApplyTemplate, onShuffle, onOpenRecipe, onExportCalendar, onQuickPlan }) {
  const findRecipe = (id) => recipes.find((r) => r.id === id);
  const dayEntry = (day) => {
    const raw = weekmenu[day];
    if (!raw) return null;
    if (typeof raw === "string") return { recipeId: raw, cook: "" };
    return raw;
  };
  const [toolsOpen, setToolsOpen] = useState(false);
  const plannedCount = periodDays.filter((d) => dayEntry(d.key)?.recipeId).length;
  const hasEmptyDay = periodDays.some((d) => {
    const e = dayEntry(d.key);
    return !e || !e.recipeId && !e.offNight;
  });
  const plannedRecipeIds = periodDays.map((d) => dayEntry(d.key)?.recipeId).filter(Boolean);
  const expiringWithRecipes = useMemo(() => {
    if (!hasEmptyDay || !inventory) return [];
    return getExpirySuggestions(inventory, recipes).map((s) => ({ ...s, recipes: s.recipes.filter((r) => !plannedRecipeIds.includes(r.id)) })).filter((s) => s.recipes.length > 0);
  }, [inventory, recipes, hasEmptyDay, plannedRecipeIds]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, marginBottom: 8 }, children: periods.map((p, i) => {
      const gepland = p.dagen.filter((d) => dayEntry(dateKey(d))?.recipeId).length;
      const actief = i === periodIndex;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPeriodChange(i),
          style: {
            flex: 1,
            padding: "7px 2px",
            borderRadius: 12,
            cursor: "pointer",
            background: actief ? C.mustard : C.cardBg,
            border: `1.5px solid ${actief ? C.mustard : C.borderTint}`,
            fontFamily: FONT_BODY,
            textAlign: "center"
          },
          children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: actief ? 700 : 500, color: actief ? "#2A1F06" : C.ink }, children: kortDatum(p.start) }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: actief ? "#4A3608" : C.inkSoft }, children: gepland ? `${gepland} gepland` : "leeg" })
          ]
        },
        p.startKey
      );
    }) }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 12px" }, children: periodeLabel(periods[periodIndex].start, periods[periodIndex].eind) }),
    expiringWithRecipes.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 12, marginBottom: 14 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx(CalendarClock, { size: 15, color: C.mustardDeep }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 700, color: C.mustardDeep }, children: "Ruim dit op v\xF3\xF3rdat het te laat is" })
      ] }),
      expiringWithRecipes.map(({ item, daysLeft, recipes: matches }) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.ink, marginBottom: 4 }, children: [
          /* @__PURE__ */ jsx("strong", { children: item.name }),
          " ",
          daysLeft <= 0 ? "is bijna over de datum" : `is over ${daysLeft} dag${daysLeft > 1 ? "en" : ""} over de datum`,
          " \u2014 zullen we dat verwerken?"
        ] }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: matches.slice(0, 2).map((r) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onQuickPlan(r.id, r.name),
            style: { background: C.cardBg, border: `1px solid ${C.mustard}`, borderRadius: 20, padding: "4px 10px", fontSize: 12, color: C.mustardDeep, fontWeight: 600, cursor: "pointer" },
            children: [
              r.emoji || "\u{1F37D}\uFE0F",
              " Plan ",
              r.name
            ]
          },
          r.id
        )) })
      ] }, item.id))
    ] }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: periodDays.map((day, idx) => {
      const entry = dayEntry(day.key);
      const recipe = entry?.recipeId ? findRecipe(entry.recipeId) : null;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            padding: "10px 12px",
            borderBottom: idx < periodDays.length - 1 ? `1px solid ${C.ceramic}` : "none",
            background: day.isVandaag ? C.noteBg : "transparent",
            opacity: day.isVerleden ? 0.55 : 1
          },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { width: 46, flexShrink: 0 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, fontFamily: FONT_MONO, color: C.blueSoft }, children: [
                  day.kort,
                  day.isBoodschappendag ? " \u{1F6D2}" : ""
                ] }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 15, fontWeight: day.isVandaag ? 700 : 400, color: C.ink }, children: day.dagnummer })
              ] }),
              entry?.offNight ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { style: { width: 30, height: 30, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }, children: "\u{1F355}" }),
                /* @__PURE__ */ jsx("div", { style: { flex: 1, fontSize: 14, color: C.inkSoft, fontStyle: "italic" }, children: "Geen kookavond" }),
                /* @__PURE__ */ jsx("button", { onClick: () => onClearDay(day.key), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 15, color: C.inkSoft }) })
              ] }) : recipe ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    onClick: () => onOpenRecipe(recipe.id, entry?.doublePortion, entry?.leftoverItemId),
                    title: "Open dit recept",
                    style: { width: 30, height: 30, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, cursor: "pointer" },
                    children: recipe.emoji || "\u{1F37D}\uFE0F"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0, cursor: "pointer" }, onClick: () => onOpenRecipe(recipe.id, entry?.doublePortion, entry?.leftoverItemId), children: [
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 14, color: C.ink }, children: [
                    entry?.leftoverItemId ? "\u{1F371} " : "",
                    recipe.name
                  ] }),
                  entry?.leftoverItemId && (() => {
                    const restje = (inventory || []).find((i) => i.id === entry.leftoverItemId);
                    if (!restje) {
                      return /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.brick }, children: "Kliekje staat niet meer in je voorraad" });
                    }
                    const houdbaarTot = restje.expiryDate ? parseDateKey(restje.expiryDate) : null;
                    const bederftEerder = houdbaarTot && dateKey(houdbaarTot) < day.key;
                    const dagenOver = houdbaarTot ? Math.round((houdbaarTot - startOfDay(/* @__PURE__ */ new Date())) / 864e5) : null;
                    return /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: bederftEerder ? C.brick : C.mustardDeep }, children: [
                      "Kliekje \xB7 ",
                      restje.current,
                      " ",
                      restje.current === 1 ? "portie" : "porties",
                      bederftEerder ? ` \xB7 let op: houdbaar tot ${houdbaarTot.getDate()}/${houdbaarTot.getMonth() + 1}` : dagenOver !== null ? ` \xB7 nog ${dagenOver} ${dagenOver === 1 ? "dag" : "dagen"} houdbaar` : ""
                    ] });
                  })()
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => onPickDay(day.key), title: "Ander recept kiezen", style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Pencil, { size: 13, color: C.inkSoft }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => onClearDay(day.key), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 15, color: C.inkSoft }) })
              ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => onPickDay(day.key), style: { flex: 1, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.inkSoft, fontSize: 13, cursor: "pointer", padding: "4px 0" }, children: [
                /* @__PURE__ */ jsx(Plus, { size: 14 }),
                " Kies een recept"
              ] })
            ] }),
            !entry?.offNight && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginLeft: 76, marginTop: 6 }, children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => onPickCook(day.key),
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: entry?.cook ? C.ceramic : "none",
                    border: entry?.cook ? "none" : `1px dashed ${C.borderTint}`,
                    borderRadius: 20,
                    padding: "3px 10px",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsx(ChefHat, { size: 11, color: entry?.cook ? C.blueDeep : C.inkSoft }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: entry?.cook ? C.blueDeep : C.inkSoft, fontWeight: entry?.cook ? 600 : 400 }, children: entry?.cook ? entry.cook : "Wie kookt?" })
                  ]
                }
              ),
              isPremiumOn && isPremiumOn("householdRSVP") && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => onPickAttendees(day.key),
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: entry?.attendees?.length ? C.successBg : "none",
                    border: entry?.attendees?.length ? "none" : `1px dashed ${C.borderTint}`,
                    borderRadius: 20,
                    padding: "3px 10px",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12 }, children: "\u{1F64B}" }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: entry?.attendees?.length ? C.sage : C.inkSoft, fontWeight: entry?.attendees?.length ? 600 : 400 }, children: entry?.attendees?.length ? `${entry.attendees.length} eten mee` : "Wie eet mee?" })
                  ]
                }
              ),
              recipe && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => onSetDoublePortion(day.key, !entry?.doublePortion),
                  title: "Kook dubbele portie, extra portie gaat de vriezer in",
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: entry?.doublePortion ? C.successBg : "none",
                    border: entry?.doublePortion ? "none" : `1px dashed ${C.borderTint}`,
                    borderRadius: 20,
                    padding: "3px 10px",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12 }, children: "\u2744\uFE0F" }),
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: entry?.doublePortion ? C.sage : C.inkSoft, fontWeight: entry?.doublePortion ? 600 : 400 }, children: "Dubbele portie" })
                  ]
                }
              )
            ] })
          ]
        },
        day.key
      );
    }) }),
    /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", full: true, disabled: plannedCount === 0, onClick: onGenerate, children: [
      /* @__PURE__ */ jsx(ClipboardList, { size: 16 }),
      " Boodschappenlijst genereren"
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setToolsOpen((v) => !v),
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          marginTop: 12,
          background: "none",
          border: "none",
          color: C.blue,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: FONT_BODY,
          minHeight: 44
        },
        children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 14 }),
          " Deze week snel vullen",
          toolsOpen ? /* @__PURE__ */ jsx(ChevronUp, { size: 15 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 15 })
        ]
      }
    ),
    toolsOpen && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 16, padding: 12, marginTop: 4 }, children: [
      /* @__PURE__ */ jsx("div", { style: { marginBottom: 8 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { full: true, onClick: onAIGenerate, children: [
        /* @__PURE__ */ jsx(Wand2, { size: 16 }),
        " Laat de AI een week bedenken"
      ] }) }),
      /* @__PURE__ */ jsx("div", { style: { marginBottom: 8 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: onPatternGenerate, children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 14 }),
        " Zoals wij normaal eten"
      ] }) }),
      /* @__PURE__ */ jsx("div", { style: { marginBottom: 8 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: onApplyTemplate, children: [
        /* @__PURE__ */ jsx(CalendarDays, { size: 14 }),
        " Vorige week overnemen"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: onDuplicate, children: [
          /* @__PURE__ */ jsx(Copy, { size: 13 }),
          " Dupliceren"
        ] }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { full: true, onClick: onShuffle, children: [
          /* @__PURE__ */ jsx(Shuffle, { size: 13 }),
          " Door elkaar"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { textAlign: "center", marginTop: 14 }, children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onExportCalendar,
        style: {
          background: "none",
          border: "none",
          color: C.inkSoft,
          fontSize: 12.5,
          cursor: "pointer",
          fontFamily: FONT_BODY,
          minHeight: 44,
          textDecoration: "underline",
          textUnderlineOffset: 3
        },
        children: "Weekmenu in je agenda zetten"
      }
    ) })
  ] });
}
function AttendeesPickerModal({ cooks, current, onSave, onAddCook, onClose }) {
  const [selected, setSelected] = useState(current || []);
  const [newName, setNewName] = useState("");
  const toggle = (name) => {
    setSelected((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  };
  const addAndSelect = () => {
    if (!newName.trim()) return;
    onAddCook(newName.trim());
    setSelected((prev) => [...prev, newName.trim()]);
    setNewName("");
  };
  return /* @__PURE__ */ jsxs(Modal, { title: "Wie eet er mee?", onClose, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Vink aan wie mee\xEBet \u2014 de portiegrootte en de boodschappenlijst passen zich hierop aan." }),
    cooks.length > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }, children: cooks.map((name) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => toggle(name),
        style: {
          padding: "8px 12px",
          borderRadius: 20,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          border: `1.5px solid ${selected.includes(name) ? C.sage : C.borderTint}`,
          background: selected.includes(name) ? C.sage : "#fff",
          color: selected.includes(name) ? "#fff" : C.ink
        },
        children: [
          selected.includes(name) && /* @__PURE__ */ jsx(Check, { size: 12, style: { verticalAlign: -1, marginRight: 3 } }),
          name
        ]
      },
      name
    )) }),
    /* @__PURE__ */ jsx(Field, { label: "Nieuwe naam toevoegen", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, placeholder: "Bijv. Pietje", value: newName, onChange: (e) => setNewName(e.target.value), onKeyDown: (e) => e.key === "Enter" && addAndSelect() }),
      /* @__PURE__ */ jsx(PrimaryButton, { onClick: addAndSelect, disabled: !newName.trim(), children: /* @__PURE__ */ jsx(Plus, { size: 16 }) })
    ] }) }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, marginTop: -4 }, children: selected.length === 0 ? "Niemand geselecteerd \u2014 de standaard receptportie wordt gebruikt." : `${selected.length} perso${selected.length === 1 ? "on" : "nen"} geselecteerd.` }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", onClick: () => onSave(selected), children: [
        /* @__PURE__ */ jsx(Check, { size: 16 }),
        " Opslaan"
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onClose, children: "Annuleren" })
    ] })
  ] });
}
function CookPickerModal({ cooks, current, onPick, onAddCook, onRemoveCook, onClose }) {
  const [newName, setNewName] = useState("");
  const submitNew = () => {
    if (!newName.trim()) return;
    onAddCook(newName.trim());
    onPick(newName.trim());
    setNewName("");
  };
  return /* @__PURE__ */ jsxs(Modal, { title: "Wie kookt er?", onClose, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Kies iemand uit het huishouden, of voeg een nieuwe naam toe." }),
    cooks.length > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }, children: cooks.map((name) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onPick(name),
          style: {
            padding: "8px 12px",
            borderRadius: 20,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            border: `1.5px solid ${current === name ? C.blue : C.borderTint}`,
            background: current === name ? C.blue : C.cardBg,
            color: current === name ? "#fff" : C.ink
          },
          children: name
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: () => onRemoveCook(name), title: "Verwijder uit lijst", style: { background: "none", border: "none", cursor: "pointer", padding: 2 }, children: /* @__PURE__ */ jsx(X, { size: 13, color: C.inkSoft }) })
    ] }, name)) }),
    /* @__PURE__ */ jsx(Field, { label: "Nieuwe naam toevoegen", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, placeholder: "Bijv. Pietje", value: newName, onChange: (e) => setNewName(e.target.value), onKeyDown: (e) => e.key === "Enter" && submitNew() }),
      /* @__PURE__ */ jsx(PrimaryButton, { onClick: submitNew, disabled: !newName.trim(), children: /* @__PURE__ */ jsx(Plus, { size: 16 }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [
      current && /* @__PURE__ */ jsxs(GhostButton, { onClick: () => onPick(""), children: [
        /* @__PURE__ */ jsx(X, { size: 14 }),
        " Niemand toewijzen"
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onClose, children: "Sluiten" })
    ] })
  ] });
}
const DIET_TAGS = ["Vegetarisch", "Veganistisch", "Glutenvrij", "Lactosevrij", "Notenallergie", "Halal", "Suikervrij"];
const PREMIUM_FEATURES = [
  { key: "photoInventory", label: "Koelkastscanner", description: "E\xE9n foto van een kast of koelkast, automatisch omgezet naar voorraaditems.", icon: "\u{1F4F8}" },
  { key: "predictiveDepletion", label: "Voorspelde uitputting", description: "Slimme inschatting wanneer iets op is, op basis van jullie eigen verbruikspatroon.", icon: "\u{1F4C9}" },
  { key: "householdRSVP", label: '"Wie eet er mee?"', description: "Per dag aangeven wie mee\xEBet \u2014 porties en boodschappen passen zich automatisch aan.", icon: "\u{1F64B}" },
  { key: "sousChef", label: "AI-souschef", description: 'Stel tijdens het koken vragen zoals "kan ik room vervangen door melk?".', icon: "\u{1F468}\u200D\u{1F373}" }
];
function CookDietRow({ name, preferences, onUpdate }) {
  const [open, setOpen] = useState(false);
  const active = (preferences?.diets || []).find((d) => d.name === name)?.tags || [];
  const toggleTag = (tag) => {
    const next = active.includes(tag) ? active.filter((t) => t !== tag) : [...active, tag];
    onUpdate(name, next);
  };
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px 0", borderBottom: `1px solid ${C.ceramic}` }, children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => setOpen((o) => !o), style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: C.ink, fontWeight: 600 }, children: name }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: C.inkSoft }, children: active.length ? active.join(", ") : "geen wensen" })
    ] }),
    open && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }, children: DIET_TAGS.map((tag) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => toggleTag(tag),
        style: {
          padding: "8px 12px",
          minHeight: 34,
          borderRadius: 16,
          fontSize: 11,
          cursor: "pointer",
          border: `1.5px solid ${active.includes(tag) ? C.sage : C.borderTint}`,
          background: active.includes(tag) ? C.sage : C.cardBg,
          color: active.includes(tag) ? "#fff" : C.inkSoft
        },
        children: tag
      },
      tag
    )) })
  ] });
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
  return /* @__PURE__ */ jsxs("div", { style: { padding: "8px 0", borderBottom: `1px solid ${C.ceramic}` }, children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => setOpen((o) => !o), style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: C.ink, fontWeight: 600 }, children: name }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: C.inkSoft }, children: active.length ? active.join(", ") : "geen afkeuren" })
    ] }),
    open && /* @__PURE__ */ jsxs("div", { style: { marginTop: 8 }, children: [
      active.length > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }, children: active.map((item) => /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 16, fontSize: 11, background: C.warnBg, color: C.brick }, children: [
        item,
        /* @__PURE__ */ jsx("button", { onClick: () => removeItem(item), style: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }, children: /* @__PURE__ */ jsx(X, { size: 11, color: C.brick }) })
      ] }, item)) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6 }, children: [
        /* @__PURE__ */ jsx("input", { style: { ...inputStyle, flex: 1, fontSize: 13, padding: "7px 10px" }, placeholder: "Bijv. paddenstoelen", value: newItem, onChange: (e) => setNewItem(e.target.value), onKeyDown: (e) => e.key === "Enter" && addItem() }),
        /* @__PURE__ */ jsx("button", { "aria-label": "Toevoegen", onClick: addItem, disabled: !newItem.trim(), style: { background: C.blue, border: "none", borderRadius: 10, padding: "0 12px", cursor: newItem.trim() ? "pointer" : "default", opacity: newItem.trim() ? 1 : 0.5, display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsx(Plus, { size: 14, color: "#fff" }) })
      ] })
    ] })
  ] });
}
function SettingsModal({ household, members, preferences, cooks, onRename, onLogout, onOpenMagnet, onOpenTabletMode, onShowWelcome, onExportBackup, onToggleDarkMode, onSetShoppingDay, onOpenControle, aantalBevindingen = 0, onMoveCategoryOrder, onUpdateCookDiets, onUpdateCookDislikes, onTogglePremium, onClose }) {
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
      setName(household?.name || "");
    }
    setSavingName(false);
  };
  const copyCode = async () => {
    if (!household?.invite_code) return;
    try {
      await navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (e) {
      console.error("Kopi\xEBren naar klembord mislukt:", e);
      setCopyError(true);
    }
  };
  return /* @__PURE__ */ jsxs(Modal, { title: "Instellingen", onClose, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Naam van je huishouden" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: name, onChange: (e) => setName(e.target.value), placeholder: "Bijv. Familie Jansen" }),
      /* @__PURE__ */ jsx(PrimaryButton, { onClick: saveName, disabled: savingName || !name.trim() || name.trim() === household?.name, children: savingName ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 16 }) : /* @__PURE__ */ jsx(Check, { size: 16 }) })
    ] }),
    nameError && /* @__PURE__ */ jsx("p", { role: "alert", style: { fontSize: 12, color: C.brick, margin: "-8px 0 14px", lineHeight: 1.45 }, children: nameError }),
    household?.invite_code && (() => {
      const link = `${window.location.origin}/?uitnodiging=${encodeURIComponent(household.invite_code)}`;
      const bericht = `Doe je mee in ons kookboek op Pollepel? Dan delen we onze recepten, voorraad, het weekmenu en de boodschappenlijst.

${link}`;
      const deel = async () => {
        setCopyError(false);
        if (navigator.share) {
          try {
            await navigator.share({ title: "Pollepel", text: bericht });
            return;
          } catch (e) {
            return;
          }
        }
        try {
          await navigator.clipboard.writeText(bericht);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (e) {
          console.error("Delen en kopi\xEBren beide mislukt:", e);
          setCopyError(true);
        }
      };
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Huisgenoot uitnodigen" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 10px", lineHeight: 1.5 }, children: "Pollepel werkt pas echt als je hem samen gebruikt. Stuur deze link en je huisgenoot zit meteen in hetzelfde kookboek." }),
        /* @__PURE__ */ jsxs(PrimaryButton, { full: true, onClick: deel, children: [
          /* @__PURE__ */ jsx(Share2, { size: 16 }),
          " Uitnodiging versturen"
        ] }),
        copied && /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.sage, margin: "8px 0 0" }, children: "Uitnodiging gekopieerd \u2014 plak hem in een berichtje." }),
        copyError && /* @__PURE__ */ jsxs("p", { role: "alert", style: { fontSize: 12, color: C.brick, margin: "8px 0 0" }, children: [
          "Delen lukt niet in deze browser. Geef dan deze code door: ",
          /* @__PURE__ */ jsx("strong", { children: household.invite_code })
        ] }),
        /* @__PURE__ */ jsxs("details", { style: { marginTop: 10, marginBottom: 16 }, children: [
          /* @__PURE__ */ jsx("summary", { style: { fontSize: 11.5, color: C.inkSoft, cursor: "pointer" }, children: "Liever de code doorgeven?" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: "10px 12px", marginTop: 8 }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 1, flex: 1 }, children: household.invite_code }),
            /* @__PURE__ */ jsx("button", { "aria-label": "Code kopi\xEBren", onClick: copyCode, style: { background: C.ceramic, border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }, children: /* @__PURE__ */ jsx(Copy, { size: 15, color: C.blueDeep }) })
          ] })
        ] })
      ] });
    })(),
    members && members.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Wie kan inloggen" }),
      /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: members.map((m, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: idx < members.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 26, height: 26, borderRadius: "50%", background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.blueDeep, flexShrink: 0 }, children: (m.displayName || m.email || "?").charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: C.ink, flex: 1 }, children: m.displayName || m.email }),
        m.role === "owner" && /* @__PURE__ */ jsx(Pill, { children: "eigenaar" })
      ] }, m.userId || idx)) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Weergave" }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onToggleDarkMode,
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px",
          background: C.cardBg,
          border: `1.5px solid ${C.borderTint}`,
          borderRadius: 14,
          marginBottom: 16,
          cursor: "pointer"
        },
        children: [
          /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink }, children: [
            /* @__PURE__ */ jsx(Moon, { size: 15, color: C.blueDeep }),
            " Donkere modus"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { width: 40, height: 22, borderRadius: 20, background: preferences?.darkMode ? C.blue : C.ceramicDark, position: "relative", transition: "background 0.15s" }, children: /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 2, left: preferences?.darkMode ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.15s" } }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, margin: "0 0 8px" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft }, children: "Premium functies" }),
      /* @__PURE__ */ jsx(Pill, { tone: "auto", children: "nu gratis" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, overflow: "hidden" }, children: PREMIUM_FEATURES.map((feat, idx) => {
      const on = preferences?.premium ? preferences.premium[feat.key] !== false : true;
      return /* @__PURE__ */ jsxs("div", { style: { padding: "11px 12px", borderBottom: idx < PREMIUM_FEATURES.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink, fontWeight: 600 }, children: [
            /* @__PURE__ */ jsx("span", { children: feat.icon }),
            " ",
            feat.label
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onTogglePremium(feat.key),
              style: { width: 38, height: 21, borderRadius: 20, background: on ? C.mustard : C.ceramicDark, position: "relative", border: "none", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 },
              children: /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 2, left: on ? 19 : 2, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.15s" } })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, margin: "4px 0 0" }, children: feat.description })
      ] }, feat.key);
    }) }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Volgorde boodschappenlijst" }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: (preferences?.categoryOrder && preferences.categoryOrder.length === CATEGORIES.length ? preferences.categoryOrder : CATEGORIES).map((cat, idx, arr) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: idx < arr.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: C.ink, flex: 1 }, children: cat }),
      /* @__PURE__ */ jsx("button", { onClick: () => onMoveCategoryOrder(cat, -1), disabled: idx === 0, style: { background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 4 }, children: /* @__PURE__ */ jsx(ChevronUp, { size: 15, color: C.inkSoft }) }),
      /* @__PURE__ */ jsx("button", { onClick: () => onMoveCategoryOrder(cat, 1), disabled: idx === arr.length - 1, style: { background: "none", border: "none", cursor: idx === arr.length - 1 ? "default" : "pointer", opacity: idx === arr.length - 1 ? 0.3 : 1, padding: 4 }, children: /* @__PURE__ */ jsx(ChevronDown, { size: 15, color: C.inkSoft }) })
    ] }, cat)) }),
    cooks && cooks.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Dieetwensen & allergie\xEBn" }),
      /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, padding: "4px 12px" }, children: cooks.map((cookName) => /* @__PURE__ */ jsx(CookDietRow, { name: cookName, preferences, onUpdate: onUpdateCookDiets }, cookName)) }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Afkeuren per huisgenoot" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, marginTop: -4, marginBottom: 8 }, children: 'Geen dieet, gewoon een voorkeur \u2014 bijv. "paddenstoelen". Je krijgt een seintje op een recept, geen harde blokkade.' }),
      /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, padding: "4px 12px" }, children: cooks.map((cookName) => /* @__PURE__ */ jsx(CookDislikeRow, { name: cookName, preferences, onUpdate: onUpdateCookDislikes }, cookName)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onOpenMagnet,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(Printer, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 14, color: C.ink }, children: "Koelkastmagneet printen" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { padding: "12px", borderBottom: `1px solid ${C.ceramic}` }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: C.ink, marginBottom: 2 }, children: "Boodschappendag" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, marginBottom: 8 }, children: "Je weekmenu begint op deze dag, want je plant tot je volgende keer boodschappen doet." }),
        /* @__PURE__ */ jsx(
          "select",
          {
            style: inputStyle,
            value: preferences.shoppingDay == null ? 6 : preferences.shoppingDay,
            onChange: (e) => onSetShoppingDay(Number(e.target.value)),
            children: [1, 2, 3, 4, 5, 6, 0].map((d) => /* @__PURE__ */ jsx("option", { value: d, children: DAG_LANG[d].charAt(0).toUpperCase() + DAG_LANG[d].slice(1) }, d))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onOpenTabletMode,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(ScanLine, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsxs("span", { style: { display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 14, color: C.ink }, children: "Tabletmodus starten" }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: C.inkSoft }, children: "Scanstation voor de keuken \u2014 barcodes scannen om voorraad bij te werken" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onOpenControle,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(CheckCircle2, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsxs("span", { style: { display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 13.5, color: C.ink }, children: "Gegevens controleren" }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: C.inkSoft }, children: aantalBevindingen === 0 ? "Alles ziet er goed uit" : `${aantalBevindingen} ding${aantalBevindingen > 1 ? "en" : ""} om na te kijken` })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onShowWelcome,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(Sparkles, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsxs("span", { style: { display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 14, color: C.ink }, children: "Uitleg opnieuw bekijken" }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: C.inkSoft }, children: "Hoe Pollepel werkt, in drie schermen" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onExportBackup,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(Download, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 14, color: C.ink }, children: "Backup downloaden" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.ceramic}` }, children: !confirmLogout ? /* @__PURE__ */ jsxs(GhostButton, { danger: true, onClick: () => setConfirmLogout(true), children: [
      /* @__PURE__ */ jsx(LogOut, { size: 14 }),
      " Uitloggen"
    ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 }, children: [
      /* @__PURE__ */ jsx(GhostButton, { danger: true, onClick: onLogout, children: "Zeker weten, uitloggen" }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmLogout(false), children: "Annuleren" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: { marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.ceramic}` }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setPrivacyOpen(true),
          style: {
            background: "none",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
            color: C.blue,
            fontSize: 13,
            fontFamily: FONT_BODY,
            minHeight: 44,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            display: "block"
          },
          children: "Wat bewaart Pollepel over ons?"
        }
      ),
      !confirmDelete ? /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setConfirmDelete(true),
          style: {
            background: "none",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
            color: C.inkSoft,
            fontSize: 12.5,
            fontFamily: FONT_BODY,
            minHeight: 44,
            display: "block"
          },
          children: "Account verwijderen"
        }
      ) : /* @__PURE__ */ jsxs("div", { style: { background: C.warnBg, border: `1.5px solid ${C.brick}`, borderRadius: 14, padding: 13, marginTop: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13.5, fontWeight: 600, color: C.brick, marginBottom: 6 }, children: "Weet je het zeker?" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.ink, margin: "0 0 10px", lineHeight: 1.5 }, children: "Je account wordt verwijderd. Ben je de laatste in dit huishouden, dan verdwijnen ook alle recepten, je voorraad, het weekmenu en de boodschappenlijst \u2014 voorgoed. Zijn er nog huisgenoten, dan blijft hun kookboek gewoon bestaan." }),
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 8px" }, children: [
          "Typ ",
          /* @__PURE__ */ jsx("strong", { children: "VERWIJDER" }),
          " om te bevestigen:"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            autoComplete: "off",
            style: { ...inputStyle, marginBottom: 10 },
            value: deleteConfirmText,
            onChange: (e) => setDeleteConfirmText(e.target.value),
            placeholder: "VERWIJDER"
          }
        ),
        deleteError && /* @__PURE__ */ jsx("p", { role: "alert", style: { fontSize: 12, color: C.brick, margin: "0 0 8px" }, children: deleteError }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx(
            PrimaryButton,
            {
              tone: "brick",
              disabled: deleteConfirmText.trim().toUpperCase() !== "VERWIJDER" || deleting,
              onClick: async () => {
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
              },
              children: deleting ? "Bezig\u2026" : "Definitief verwijderen"
            }
          ),
          /* @__PURE__ */ jsx(GhostButton, { onClick: () => {
            setConfirmDelete(false);
            setDeleteConfirmText("");
            setDeleteError("");
          }, children: "Annuleren" })
        ] })
      ] })
    ] }),
    privacyOpen && /* @__PURE__ */ jsx(PrivacyModal, { onClose: () => setPrivacyOpen(false) })
  ] });
}
function PrivacyModal({ onClose }) {
  const kop = { fontFamily: FONT_DISPLAY, fontSize: 15, margin: "16px 0 4px", color: C.ink };
  const tekst = { fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 6px" };
  const lijst = { fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 6px", paddingLeft: 18 };
  return /* @__PURE__ */ jsxs(Modal, { title: "Privacy", onClose, children: [
    /* @__PURE__ */ jsx("p", { style: { ...tekst, marginTop: 0 }, children: "Pollepel is een kookapp voor je huishouden. Hieronder staat precies wat er bewaard wordt, waar het staat en hoe je ervan af komt." }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "Wat we bewaren" }),
    /* @__PURE__ */ jsxs("ul", { style: lijst, children: [
      /* @__PURE__ */ jsx("li", { children: "Je e-mailadres, om in te loggen" }),
      /* @__PURE__ */ jsx("li", { children: "De naam van je huishouden en wie er lid van zijn" }),
      /* @__PURE__ */ jsx("li", { children: "Je recepten, voorraad, weekmenu en boodschappenlijst" }),
      /* @__PURE__ */ jsx("li", { children: "Wat je gekookt hebt en wat er van je voorraad af ging" }),
      /* @__PURE__ */ jsx("li", { children: "Foto's die je bij een recept zet" })
    ] }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "Wat we niet doen" }),
    /* @__PURE__ */ jsxs("ul", { style: lijst, children: [
      /* @__PURE__ */ jsx("li", { children: "Geen advertenties, en niets wordt verkocht of gedeeld met adverteerders" }),
      /* @__PURE__ */ jsx("li", { children: "Geen volgtechnieken om je gedrag buiten de app te volgen" }),
      /* @__PURE__ */ jsx("li", { children: "Geen toegang tot je gegevens door andere huishoudens" })
    ] }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "Met wie het gedeeld wordt" }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Alleen met je eigen huisgenoten. Deel je een recept met de community, dan is d\xE1t recept zichtbaar voor andere huishoudens \u2014 je voorraad en weekmenu nooit." }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Abonneer je op het weekmenu in je agenda, dan is dat menu leesbaar voor iedereen die het adres heeft. Deel dat adres dus alleen met je huisgenoten." }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "Waar het staat" }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Op servers van Supabase binnen de Europese Unie. De verbinding is versleuteld." }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "De AI-hulp" }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Vraag je de app om een recept te bedenken of een foto te lezen, dan gaat die vraag naar Anthropic om beantwoord te worden. Alleen wat nodig is voor die ene vraag wordt meegestuurd \u2014 niet je hele kookboek of voorraad." }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "Je gegevens weghalen" }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Onderaan Instellingen staat \u201CAccount verwijderen\u201D. Ben je de laatste in je huishouden, dan wordt alles gewist. Zijn er nog huisgenoten, dan blijft hun kookboek bestaan en verdwijnt alleen jouw account." }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Wil je eerst een kopie? Met \u201CBackup downloaden\u201D haal je al je gegevens op." }),
    /* @__PURE__ */ jsx("h3", { style: kop, children: "Vragen" }),
    /* @__PURE__ */ jsx("p", { style: tekst, children: "Neem contact op met de beheerder van je huishouden of met de maker van deze app." }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 18 }, children: /* @__PURE__ */ jsx(PrimaryButton, { full: true, onClick: onClose, children: "Sluiten" }) })
  ] });
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
  return /* @__PURE__ */ jsxs(Modal, { title: "Koelkastscanner", onClose, wide: true, children: [
    /* @__PURE__ */ jsx("input", { autoComplete: "off", ref: cameraRef, type: "file", accept: "image/*", capture: "environment", onChange: handleFile, style: { display: "none" } }),
    /* @__PURE__ */ jsx("input", { autoComplete: "off", ref: galleryRef, type: "file", accept: "image/*", onChange: handleFile, style: { display: "none" } }),
    !preview && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Maak een foto van een open kast, koelkast of voorraadplank. Pollepel herkent zoveel mogelijk producten in \xE9\xE9n keer en stelt voor je voorraad bij te werken." }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { full: true, onClick: () => galleryRef.current && galleryRef.current.click(), children: [
          /* @__PURE__ */ jsx(ImagePlus, { size: 15 }),
          " Foto kiezen"
        ] }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: () => cameraRef.current && cameraRef.current.click(), children: [
          /* @__PURE__ */ jsx(Camera, { size: 15 }),
          " Direct camera"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, marginTop: -4 }, children: `Lukt "Direct camera" niet (sommige browsers blokkeren dit)? Maak de foto dan eerst met je gewone camera-app, en kies 'm daarna via "Foto kiezen".` })
    ] }),
    preview && /* @__PURE__ */ jsx("img", { src: preview, alt: "Kast", style: { width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 14, border: `1.5px solid ${C.borderTint}`, background: C.ceramic, marginBottom: 12 } }),
    scanning && /* @__PURE__ */ jsx(PollepelLoader, { tekst: "Producten herkennen\u2026", size: 40 }),
    error && !scanning && /* @__PURE__ */ jsx("div", { style: { background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10 }, children: error }),
    !scanning && results.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: C.inkSoft }, children: [
        results.length,
        " product",
        results.length !== 1 ? "en" : "",
        " herkend \u2014 vink uit wat niet klopt:"
      ] }),
      /* @__PURE__ */ jsx("div", { style: { maxHeight: 320, overflowY: "auto", background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 14 }, children: results.map((r, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: idx < results.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onToggleInclude(r.tempId),
            style: { width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${r.include ? C.sage : C.borderTint}`, background: r.include ? C.sage : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
            children: r.include && /* @__PURE__ */ jsx(Check, { size: 13, color: "#fff" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, opacity: r.include ? 1 : 0.45 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.ink }, children: r.name }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: [
            r.amount,
            " ",
            r.unit,
            " \xB7 ",
            r.category,
            " ",
            r.matchedId && "\xB7 aanvullen op bestaand item"
          ] })
        ] })
      ] }, r.tempId)) }),
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", full: true, disabled: includedCount === 0, onClick: () => onApply(results), children: [
        /* @__PURE__ */ jsx(Check, { size: 16 }),
        " ",
        includedCount,
        " product",
        includedCount !== 1 ? "en" : "",
        " bijwerken in voorraad"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsx(GhostButton, { onClick: onClose, children: "Sluiten" }) })
  ] });
}
function TabletModeView({ inventory, onConsume, onRestock, onCreate, onClose }) {
  const inputRef = React.useRef(null);
  const wakeLockRef = React.useRef(null);
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState("scanning");
  const [matchedItem, setMatchedItem] = useState(null);
  const [amount, setAmount] = useState(1);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const [doneTone, setDoneTone] = useState("sage");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newUnit, setNewUnit] = useState("stuks");
  useEffect(() => {
    let cancelled = false;
    const requestLock = async () => {
      if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {
          });
          return;
        }
        wakeLockRef.current = lock;
        lock.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } catch (e) {
      }
    };
    requestLock();
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) requestLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
        });
        wakeLockRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (phase === "scanning" && inputRef.current) inputRef.current.focus();
  }, [phase]);
  const resetToScanning = () => {
    setCode("");
    setMatchedItem(null);
    setAmount(1);
    setNewName("");
    setPhase("scanning");
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };
  const lookupProductName = async (c) => {
    setLookupLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=product_name,product_name_nl,categories_tags`);
      const data = await res.json();
      const name = data && data.product && (data.product.product_name_nl || data.product.product_name) || "";
      const tags = data && data.product && data.product.categories_tags || [];
      if (name) {
        setNewName(name);
        setNewCategory(categoryFromOffTags(tags) || guessCategory(name));
      }
    } catch (e) {
    } finally {
      setLookupLoading(false);
    }
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
      setNewName("");
      setNewCategory(CATEGORIES[0]);
      setNewUnit("stuks");
      setPhase("creating");
      lookupProductName(trimmed);
    }
  };
  const finishWith = (msg, tone) => {
    setDoneMsg(msg);
    setDoneTone(tone);
    setPhase("done");
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
  return /* @__PURE__ */ jsxs("div", { style: { position: "fixed", inset: 0, background: C.blueDeep, zIndex: 80, display: "flex", flexDirection: "column", color: "#fff" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsx(LogoMark, { size: 26 }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20 }, children: "Pollepel \u2014 Tabletmodus" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, style: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13 }, children: "Sluiten" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }, children: [
      phase === "scanning" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(ScanLine, { size: 72, color: C.mustard, style: { marginBottom: 22 } }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 24, fontWeight: 700, marginBottom: 8 }, children: "Klaar om te scannen" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 28, textAlign: "center", maxWidth: 340 }, children: "Scan een barcode met een aangesloten scanner, of typ 'm hieronder in en druk op Enter." }),
        /* @__PURE__ */ jsx(
          "input",
          {
            autoComplete: "off",
            ref: inputRef,
            value: code,
            onChange: (e) => setCode(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") handleScan(code);
            },
            inputMode: "numeric",
            autoFocus: true,
            style: { width: "100%", maxWidth: 380, fontSize: 26, textAlign: "center", padding: "18px", borderRadius: 16, border: "none", fontFamily: FONT_MONO },
            placeholder: "000000000000"
          }
        )
      ] }),
      phase === "found" && matchedItem && /* @__PURE__ */ jsxs("div", { style: { width: "100%", maxWidth: 440, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 26, fontWeight: 700, marginBottom: 6 }, children: matchedItem.name }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 30 }, children: [
          "Huidige voorraad: ",
          matchedItem.current,
          " ",
          matchedItem.unit
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginBottom: 32 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setAmount((a) => Math.max(1, a - 1)), style: stepperBtn, children: "\u2212" }),
          /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT_MONO, fontSize: 32, minWidth: 110 }, children: [
            amount,
            " ",
            matchedItem.unit
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setAmount((a) => a + 1), style: stepperBtn, children: "+" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ jsxs("button", { onClick: confirmRestock, style: { flex: 1, padding: "22px 10px", borderRadius: 20, border: "none", background: C.sage, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx(ArrowUpCircle, { size: 30 }),
            " Bijvullen"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: confirmConsume, style: { flex: 1, padding: "22px 10px", borderRadius: 20, border: "none", background: C.brick, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx(ArrowDownCircle, { size: 30 }),
            " Afboeken"
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: resetToScanning, style: { marginTop: 22, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }, children: "Annuleren" })
      ] }),
      phase === "creating" && /* @__PURE__ */ jsxs("div", { style: { width: "100%", maxWidth: 400 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }, children: lookupLoading ? "Product opzoeken\u2026" : "Onbekende barcode \u2014 nieuw product" }),
        /* @__PURE__ */ jsx("input", { autoComplete: "off", style: { ...inputStyle, marginBottom: 10, fontSize: 16 }, placeholder: "Productnaam", value: newName, onChange: (e) => setNewName(e.target.value) }),
        /* @__PURE__ */ jsx("select", { style: { ...inputStyle, marginBottom: 10, fontSize: 16 }, value: newCategory, onChange: (e) => setNewCategory(e.target.value), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }),
        /* @__PURE__ */ jsx("select", { style: { ...inputStyle, marginBottom: 16, fontSize: 16 }, value: newUnit, onChange: (e) => setNewUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 22 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setAmount((a) => Math.max(1, a - 1)), style: { ...stepperBtn, width: 46, height: 46, fontSize: 22 }, children: "\u2212" }),
          /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT_MONO, fontSize: 22 }, children: [
            amount,
            " ",
            newUnit
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setAmount((a) => a + 1), style: { ...stepperBtn, width: 46, height: 46, fontSize: 22 }, children: "+" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: confirmCreate, disabled: !newName.trim(), style: { flex: 1, padding: "16px", borderRadius: 16, border: "none", background: newName.trim() ? C.mustard : "rgba(255,255,255,0.2)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: newName.trim() ? "pointer" : "default" }, children: "Toevoegen" }),
          /* @__PURE__ */ jsx("button", { onClick: resetToScanning, style: { padding: "16px 22px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", background: "none", color: "#fff", fontSize: 15, cursor: "pointer" }, children: "Annuleren" })
        ] })
      ] }),
      phase === "done" && /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsx(CheckCircle2, { size: 68, color: doneTone === "sage" ? C.sage : C.mustard, style: { marginBottom: 16 } }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 20, fontWeight: 700, maxWidth: 380 }, children: doneMsg })
      ] })
    ] })
  ] });
}
function FridgeMagnetView({ household, onClose }) {
  const url = (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://pollepel.netlify.app") + "#boodschappen";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&color=31-63-102&data=${encodeURIComponent(url)}`;
  return /* @__PURE__ */ jsxs("div", { style: { position: "fixed", inset: 0, background: "rgba(21,44,72,0.55)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @media print {
          body * { visibility: hidden; }
          #pollepel-magnet, #pollepel-magnet * { visibility: visible; }
          #pollepel-magnet { position: fixed; inset: 0; margin: auto; }
        }
      ` }),
    /* @__PURE__ */ jsxs("div", { id: "pollepel-magnet", style: {
      background: C.cardBg,
      borderRadius: 28,
      padding: 32,
      width: "100%",
      maxWidth: 340,
      textAlign: "center",
      border: `6px solid ${C.blue}`,
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "center", marginBottom: 10 }, children: /* @__PURE__ */ jsx(LogoMark, { size: 44 }) }),
      /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: C.blueDeep }, children: "Pollepel" }),
      household?.name && /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkSoft, marginBottom: 14 }, children: household.name }),
      /* @__PURE__ */ jsx("img", { src: qrSrc, alt: "QR-code naar Pollepel", style: { width: "100%", maxWidth: 220, margin: "10px auto", display: "block", borderRadius: 12 } }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, margin: "10px 0 0" }, children: "Scan voor het kookboek, de voorraad & de boodschappenlijst" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, marginTop: 20 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { onClick: () => window.print(), children: [
        /* @__PURE__ */ jsx(Printer, { size: 16 }),
        " Printen"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          style: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 14, padding: "10px 16px", fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14, cursor: "pointer" },
          children: "Sluiten"
        }
      )
    ] })
  ] });
}
function RecipePickerModal({ recipes, inventory, onPick, onPickOffNight, onClose }) {
  const [query, setQuery] = useState("");
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const [rouletteBezig, setRouletteBezig] = useState(false);
  const [gerold, setGerold] = useState(null);
  const rol = () => {
    if (!recipes.length) return;
    setRouletteBezig(true);
    setGerold(null);
    setTimeout(() => {
      const gescoord = recipes.map((r) => ({ r, mist: inventory ? recipeReadiness(r, inventory).missing.length : 0 })).sort((a, b) => a.mist - b.mist);
      const minste = gescoord[0].mist;
      const pool = gescoord.filter((x) => x.mist === minste);
      const keuze = pool[Math.floor(Math.random() * pool.length)];
      setGerold(keuze);
      setRouletteBezig(false);
    }, 900);
  };
  const leftovers = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((i) => i.sourceRecipeId && i.current > 0).map((i) => ({ item: i, recipe: recipes.find((r) => r.id === i.sourceRecipeId), daysLeft: daysUntil(i.expiryDate) })).filter((l) => l.recipe);
  }, [inventory, recipes]);
  return /* @__PURE__ */ jsxs(Modal, { title: "Kies een recept", onClose, children: [
    !query && !gerold && !rouletteBezig && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: rol,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          width: "100%",
          textAlign: "left",
          background: C.noteBg,
          border: `1.5px solid ${C.mustard}`,
          borderRadius: 14,
          padding: "12px 13px",
          marginBottom: 12,
          cursor: "pointer",
          fontFamily: FONT_BODY
        },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 24, flexShrink: 0 }, children: "\u{1F3B2}" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 14.5, color: C.ink, fontWeight: 600 }, children: "Verrassing" }),
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11.5, color: C.inkSoft }, children: "Laat Pollepel kiezen \u2014 met voorrang voor wat je in huis hebt" })
          ] })
        ]
      }
    ),
    rouletteBezig && /* @__PURE__ */ jsx("div", { style: { background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: "18px 13px", marginBottom: 12 }, children: /* @__PURE__ */ jsx(PollepelLoader, { tekst: "Even roeren\u2026", size: 40, delay: 0 }) }),
    gerold && !rouletteBezig && /* @__PURE__ */ jsxs("div", { style: { background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: "13px", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 28, flexShrink: 0 }, children: gerold.r.emoji || "\u{1F37D}\uFE0F" }),
        /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11, color: C.inkSoft, letterSpacing: "0.04em" }, children: "HET WORDT\u2026" }),
          /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 15.5, color: C.ink, fontWeight: 600, lineHeight: 1.25 }, children: gerold.r.name }),
          /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 12, color: gerold.mist ? C.brick : C.sage, marginTop: 2 }, children: [
            gerold.r.cookTime,
            "m \xB7 ",
            gerold.mist === 0 ? "alles in huis" : `nog ${gerold.mist} nodig`
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", onClick: () => onPick(gerold.r.id), children: [
          /* @__PURE__ */ jsx(Check, { size: 15 }),
          " Deze wordt het"
        ] }),
        /* @__PURE__ */ jsxs(GhostButton, { onClick: rol, children: [
          /* @__PURE__ */ jsx(Shuffle, { size: 14 }),
          " Nog eens"
        ] })
      ] })
    ] }),
    !query && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onPickOffNight,
        style: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.cardBg, border: `1.5px dashed ${C.borderTint}`, borderRadius: 12, padding: "9px 10px", marginBottom: 12, cursor: "pointer" },
        children: [
          /* @__PURE__ */ jsx("div", { style: { width: 32, height: 32, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }, children: "\u{1F355}" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: C.ink, fontWeight: 500 }, children: "Geen kookavond" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft }, children: "Afhaal, uit eten, of gewoon vrij \u2014 geen boodschappen nodig" })
          ] })
        ]
      }
    ),
    leftovers.length > 0 && !query && /* @__PURE__ */ jsxs("div", { style: { marginBottom: 12 }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 700, color: C.mustardDeep, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }, children: "\u{1F371} Kliekjes op \u2014 eerst opeten?" }),
      leftovers.map(({ item, recipe, daysLeft }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPick(recipe.id, item.id),
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsx("div", { style: { width: 32, height: 32, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }, children: recipe.emoji || "\u{1F37D}\uFE0F" }),
            /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: C.ink, fontWeight: 500 }, children: recipe.name }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.mustardDeep, fontFamily: FONT_MONO }, children: [
                item.current,
                " ",
                item.unit,
                " restje",
                item.current > 1 ? "s" : "",
                " \xB7 ",
                daysLeft !== null && daysLeft <= 0 ? "vandaag over datum" : daysLeft !== null ? `nog ${daysLeft}d houdbaar` : ""
              ] })
            ] })
          ]
        },
        item.id
      )),
      /* @__PURE__ */ jsx("div", { style: { height: 1, background: C.ceramic, margin: "4px 0 10px" } })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { position: "relative", marginBottom: 10 }, children: [
      /* @__PURE__ */ jsx(Search, { size: 15, color: C.inkSoft, style: { position: "absolute", left: 10, top: 11 } }),
      /* @__PURE__ */ jsx("input", { autoComplete: "off", style: { ...inputStyle, paddingLeft: 30 }, placeholder: "Zoek een gerecht\u2026", value: query, onChange: (e) => setQuery(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { maxHeight: 340, overflowY: "auto" }, children: [
      filtered.map((r) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPick(r.id),
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsx("div", { style: { width: 32, height: 32, borderRadius: 8, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }, children: r.emoji || "\u{1F37D}\uFE0F" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: C.ink, fontWeight: 500 }, children: r.name }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: [
                r.cookTime,
                " min \xB7 ",
                r.servings,
                " pers."
              ] })
            ] })
          ]
        },
        r.id
      )),
      filtered.length === 0 && /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, textAlign: "center" }, children: "Geen gerechten gevonden." })
    ] })
  ] });
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const target = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 864e5);
}
function getSeasonalRecipeSuggestions(recipes) {
  const seasonal = seasonalProduceNow();
  return recipes.map((r) => ({
    recipe: r,
    matches: r.ingredients.filter((ing) => seasonal.some((s) => namesMatch(s, ing.name))).map((ing) => ing.name)
  })).filter((r) => r.matches.length > 0).sort((a, b) => b.matches.length - a.matches.length);
}
function getDepletionForecast(inventory, consumptionLog) {
  if (!consumptionLog || !consumptionLog.length) return [];
  const cutoff = Date.now() - 30 * 864e5;
  const recent = consumptionLog.filter((e) => new Date(e.date).getTime() > cutoff);
  const results = [];
  inventory.forEach((item) => {
    const entries = recent.filter((e) => namesMatch(e.name, item.name) && e.unit === item.unit);
    if (entries.length < 2) return;
    const totalConsumed = entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    if (totalConsumed <= 0) return;
    const earliest = Math.min(...entries.map((e) => new Date(e.date).getTime()));
    const daysSpan = Math.max(1, (Date.now() - earliest) / 864e5);
    const dailyRate = totalConsumed / daysSpan;
    if (dailyRate <= 0) return;
    const daysLeft = Math.round(item.current / dailyRate);
    if (daysLeft >= 0 && daysLeft <= 7) results.push({ item, daysLeft });
  });
  return results.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
}
function getExpirySuggestions(inventory, recipes) {
  return inventory.filter((item) => item.expiryDate).map((item) => ({ item, daysLeft: daysUntil(item.expiryDate) })).filter(({ daysLeft }) => daysLeft !== null && daysLeft <= 3).map(({ item, daysLeft }) => {
    const sourceRecipe = item.sourceRecipeId ? recipes.find((r) => r.id === item.sourceRecipeId) : null;
    const matchedRecipes = sourceRecipe ? [sourceRecipe] : recipes.filter((r) => r.ingredients.some((ing) => namesMatch(ing.name, item.name) && ing.unit === item.unit));
    return { item, daysLeft, recipes: matchedRecipes };
  }).sort((a, b) => a.daysLeft - b.daysLeft);
}
function VoorraadView({ inventory, recipes, categories, consumptionLog, isPremiumOn, ernstigeBevindingen = 0, onOpenControle, onEdit, onNew, onDelete, onScan, onOpenRecipe, onOpenShelfPhoto }) {
  const cats = categories && categories.length ? categories : CATEGORIES;
  const [zoek, setZoek] = useState("");
  const gefilterd = useMemo(() => {
    const q = zoek.trim();
    if (!q) return inventory;
    const kort = norm(q);
    return inventory.filter(
      (i) => norm(i.name).includes(kort) || namesMatch(i.name, q)
    );
  }, [inventory, zoek]);
  const byCategory = useMemo(() => {
    const map = {};
    cats.forEach((c) => map[c] = []);
    gefilterd.forEach((i) => {
      (map[i.category] || (map[i.category] = [])).push(i);
    });
    Object.keys(map).forEach((c) => {
      map[c] = [...map[c]].sort((a, b) => (a.name || "").localeCompare(b.name || "", "nl", { sensitivity: "base" }));
    });
    return map;
  }, [gefilterd, cats]);
  const expirySuggestions = useMemo(() => getExpirySuggestions(inventory, recipes), [inventory, recipes]);
  const depletionForecast = useMemo(
    () => isPremiumOn("predictiveDepletion") ? getDepletionForecast(inventory, consumptionLog) : [],
    [inventory, consumptionLog, isPremiumOn]
  );
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { position: "relative", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsx(Search, { size: 15, color: C.inkSoft, style: { position: "absolute", left: 10, top: 13 } }),
      /* @__PURE__ */ jsx(
        "input",
        {
          autoComplete: "off",
          style: { ...inputStyle, paddingLeft: 30, paddingRight: zoek ? 36 : 11 },
          placeholder: `Zoek in ${inventory.length} producten\u2026`,
          value: zoek,
          onChange: (e) => setZoek(e.target.value)
        }
      ),
      zoek && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setZoek(""),
          "aria-label": "Zoekterm wissen",
          style: {
            position: "absolute",
            right: 4,
            top: 4,
            width: 36,
            height: 36,
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ jsx(X, { size: 15, color: C.inkSoft })
        }
      )
    ] }),
    zoek ? /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, margin: "0 0 12px" }, children: gefilterd.length === 0 ? `Niets gevonden voor \u201C${zoek}\u201D.` : `${gefilterd.length} ${gefilterd.length === 1 ? "product" : "producten"} gevonden.` }) : /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Stel per ingredi\xEBnt een minimum en maximum in. Zodra de voorraad onder het minimum komt, verschijnt het automatisch op de boodschappenlijst." }),
    !zoek && ernstigeBevindingen > 0 && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onOpenControle,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          textAlign: "left",
          background: C.warnBg,
          border: `1.5px solid ${C.brick}`,
          borderRadius: 14,
          padding: "11px 13px",
          marginBottom: 12,
          cursor: "pointer",
          fontFamily: FONT_BODY
        },
        children: [
          /* @__PURE__ */ jsx(AlertTriangle, { size: 17, color: C.brick, style: { flexShrink: 0 } }),
          /* @__PURE__ */ jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 13.5, fontWeight: 600, color: C.brick }, children: ernstigeBevindingen === 1 ? "Er is iets om na te kijken" : `Er zijn ${ernstigeBevindingen} dingen om na te kijken` }),
            /* @__PURE__ */ jsx("span", { style: { display: "block", fontSize: 11.5, color: C.inkSoft }, children: "Tik om te bekijken en recht te zetten" })
          ] })
        ]
      }
    ),
    !zoek && depletionForecast.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.successBg, border: `1.5px solid ${C.sage}`, borderRadius: 16, padding: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 14 }, children: "\u{1F4C9}" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 700, color: C.sage }, children: "Voorspelde uitputting" }),
        /* @__PURE__ */ jsx(Pill, { tone: "auto", children: "premium" })
      ] }),
      depletionForecast.map((f) => /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.ink, marginBottom: 4 }, children: [
        /* @__PURE__ */ jsx("strong", { children: f.item.name }),
        " is op basis van jullie verbruik over ongeveer ",
        /* @__PURE__ */ jsxs("strong", { children: [
          f.daysLeft,
          " dag",
          f.daysLeft !== 1 ? "en" : ""
        ] }),
        " op."
      ] }, f.item.id))
    ] }),
    !zoek && expirySuggestions.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.noteBg, border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx(CalendarClock, { size: 15, color: C.mustardDeep }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 700, color: C.mustardDeep }, children: "Bijna over de datum" })
      ] }),
      expirySuggestions.map(({ item, daysLeft, recipes: matches }) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.ink }, children: [
          /* @__PURE__ */ jsx("strong", { children: item.name }),
          " ",
          daysLeft < 0 ? "is al verlopen" : daysLeft === 0 ? "is vandaag over de datum" : `is over ${daysLeft} dag${daysLeft > 1 ? "en" : ""} over de datum`
        ] }),
        matches.length > 0 ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }, children: [
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: C.inkSoft }, children: [
            "Maak ",
            daysLeft <= 0 ? "vandaag" : "op tijd",
            ":"
          ] }),
          matches.slice(0, 3).map((r) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => onOpenRecipe && onOpenRecipe(r.id),
              style: { background: C.cardBg, border: `1px solid ${C.mustard}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, color: C.mustardDeep, fontWeight: 600, cursor: "pointer" },
              children: [
                r.emoji || "\u{1F37D}\uFE0F",
                " ",
                r.name
              ]
            },
            r.id
          ))
        ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkSoft, marginTop: 2 }, children: "Geen recept in je kookboek met dit ingredi\xEBnt." })
      ] }, item.id))
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", full: true, compact: true, onClick: onScan, children: [
        /* @__PURE__ */ jsx(Camera, { size: 15 }),
        " Scannen"
      ] }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { full: true, compact: true, onClick: onNew, children: [
        /* @__PURE__ */ jsx(Plus, { size: 15 }),
        " Toevoegen"
      ] }) })
    ] }),
    isPremiumOn("photoInventory") && /* @__PURE__ */ jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: onOpenShelfPhoto, children: [
      /* @__PURE__ */ jsx(ImagePlus, { size: 14 }),
      " Koelkastscanner: hele voorraad bijwerken ",
      /* @__PURE__ */ jsx(Pill, { tone: "auto", children: "premium" })
    ] }) }),
    [...cats, ...Object.keys(byCategory).filter((c) => !cats.includes(c))].map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.blueSoft, marginBottom: 6, textTransform: "uppercase" }, children: cat }),
        /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }, children: items.map((item, idx) => {
          const low = item.current < item.min;
          const expDays = item.expiryDate ? daysUntil(item.expiryDate) : null;
          return /* @__PURE__ */ jsxs("div", { onClick: () => onEdit(item), style: { padding: "10px 12px", borderBottom: idx < items.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxs("span", { style: { fontSize: 14, color: C.ink, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }, children: [
                item.name,
                item.onSale && /* @__PURE__ */ jsx(Tag, { size: 12, color: C.mustardDeep })
              ] }),
              low && /* @__PURE__ */ jsx(AlertTriangle, { size: 14, color: C.brick })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 4 }, children: [
              /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, fontSize: 12, color: low ? C.brick : C.inkSoft }, children: [
                item.current,
                " ",
                item.unit,
                " ",
                /* @__PURE__ */ jsxs("span", { style: { opacity: 0.6 }, children: [
                  "(min ",
                  item.min,
                  " \xB7 max ",
                  item.max,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                expDays !== null && expDays <= 5 && /* @__PURE__ */ jsxs(Pill, { tone: expDays <= 0 ? "warn" : "auto", children: [
                  /* @__PURE__ */ jsx(CalendarClock, { size: 10 }),
                  " ",
                  expDays < 0 ? "verlopen" : expDays === 0 ? "vandaag" : `${expDays}d`
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: (e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }, style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Trash2, { size: 13, color: C.inkSoft }) })
              ] })
            ] })
          ] }, item.id);
        }) })
      ] }, cat);
    })
  ] });
}
function InventoryForm({ initial, consumptionLog = [], onCancel, onSave }) {
  const [name, setName] = useState(initial.name || "");
  const [category, setCategory] = useState(initial.category || CATEGORIES[0]);
  const [unit, setUnit] = useState(initial.unit || "stuks");
  const [current, setCurrent] = useState(initial.current ?? "");
  const [min, setMin] = useState(initial.min ?? "");
  const [max, setMax] = useState(initial.max ?? "");
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
  useEffect(() => {
    if (initial.id) return;
    if (!name.trim() || name.trim().length < 3) {
      setSuggestions([]);
      setSearchError("");
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await fetch(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(name.trim())}&page_size=6&langs=nl&fields=product_name,product_name_nl,brands,code`);
        if (!res.ok) throw new Error("zoek-fout");
        const data = await res.json();
        const hits = data.hits || data.products || [];
        const items = hits.map((p) => ({ product_name: p.product_name || p.product_name_nl || p.generic_name || "", brands: p.brands || "", code: p.code || p._id || "" })).filter((p) => p.product_name).slice(0, 6);
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
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${p.code}.json?fields=categories_tags`);
        const data = await res.json();
        const tags = data && data.product && data.product.categories_tags || [];
        const offCategory = categoryFromOffTags(tags);
        if (offCategory) setCategory(offCategory);
      } catch (e) {
      }
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };
  return /* @__PURE__ */ jsxs(Modal, { title: initial.id ? "Ingredi\xEBnt bewerken" : "Nieuw ingredi\xEBnt", onClose: onCancel, children: [
    /* @__PURE__ */ jsx(Field, { label: "Naam", children: /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          autoComplete: "off",
          style: inputStyle,
          list: "common-groceries",
          value: name,
          onChange: (e) => {
            setName(e.target.value);
            setShowSuggestions(true);
          },
          onFocus: () => setShowSuggestions(true),
          placeholder: "Bijv. Rijst \u2014 of typ 3+ letters voor productsuggesties"
        }
      ),
      /* @__PURE__ */ jsx("datalist", { id: "common-groceries", children: COMMON_GROCERY_ITEMS.map((n) => /* @__PURE__ */ jsx("option", { value: n }, n)) }),
      searching && /* @__PURE__ */ jsx("div", { style: { position: "absolute", right: 10, top: 11 }, children: /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 15, color: C.inkSoft }) }),
      showSuggestions && suggestions.length > 0 && /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, zIndex: 5, maxHeight: 220, overflowY: "auto", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }, children: suggestions.map((p, idx) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => pickSuggestion(p),
          style: { display: "block", width: "100%", textAlign: "left", padding: "8px 10px", background: "none", border: "none", borderBottom: idx < suggestions.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.ink }, children: p.product_name }),
            p.brands && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: p.brands })
          ]
        },
        p.code || idx
      )) })
    ] }) }),
    !initial.id && searchError && !searching && /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, marginTop: -8, marginBottom: 12 }, children: searchError }),
    !initial.id && !searchError && /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, marginTop: -8, marginBottom: 12 }, children: "Productsuggesties komen uit Open Food Facts, een open database met o.a. veel Nederlandse supermarktproducten." }),
    /* @__PURE__ */ jsx(Field, { label: "Categorie", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: category, onChange: (e) => setCategory(e.target.value), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
    /* @__PURE__ */ jsx(Field, { label: "Eenheid", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: unit, onChange: (e) => setUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Huidige voorraad", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: current, onChange: (e) => setCurrent(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Minimum", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: min, onChange: (e) => setMin(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Maximum", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: max, onChange: (e) => setMax(e.target.value) }) }) })
    ] }),
    voorstel && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          setMin(String(voorstel.minimum));
          setMax(String(voorstel.maximum));
        },
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 9,
          width: "100%",
          textAlign: "left",
          background: C.noteBg,
          border: `1.5px solid ${C.mustard}`,
          borderRadius: 14,
          padding: "11px 13px",
          marginBottom: 12,
          cursor: "pointer",
          fontFamily: FONT_BODY
        },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 17, flexShrink: 0 }, children: "\u{1F4C9}" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 13, color: C.ink, fontWeight: 600 }, children: [
              "Voorstel: minimum ",
              voorstel.minimum,
              ", maximum ",
              voorstel.maximum,
              " ",
              unit
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { display: "block", fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45, marginTop: 1 }, children: [
              "Jullie gebruiken hier ongeveer ",
              voorstel.perWeek,
              " ",
              unit,
              " per week van, gemeten over ",
              voorstel.periodeDagen,
              " dagen. Tik om over te nemen."
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(Field, { label: "Barcode (optioneel, voor scannen)", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: barcode, onChange: (e) => setBarcode(e.target.value), placeholder: "Bijv. 8710400123456" }) }),
    /* @__PURE__ */ jsx(Field, { label: "Houdbaar tot (THT, optioneel)", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "date", style: inputStyle, value: expiryDate, onChange: (e) => setExpiryDate(e.target.value) }) }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOnSale((v) => !v),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "10px 12px",
          marginBottom: 8,
          background: onSale ? C.noteBg : C.cardBg,
          border: `1.5px solid ${onSale ? C.mustard : C.borderTint}`,
          borderRadius: 12,
          cursor: "pointer"
        },
        children: [
          /* @__PURE__ */ jsx(Tag, { size: 15, color: onSale ? C.mustardDeep : C.inkSoft }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: onSale ? C.mustardDeep : C.ink, fontWeight: onSale ? 600 : 400 }, children: "Nu in de aanbieding" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
      /* @__PURE__ */ jsxs(
        PrimaryButton,
        {
          disabled: !canSave,
          onClick: () => {
            const minWaarde = Number(min) || 0;
            let maxWaarde = Number(max) || 0;
            if (maxWaarde > 0 && maxWaarde < minWaarde) maxWaarde = minWaarde;
            onSave({ ...initial, name: name.trim(), category, unit, current: Number(current) || 0, min: minWaarde, max: maxWaarde, barcode: barcode.trim(), expiryDate, onSale });
          },
          children: [
            /* @__PURE__ */ jsx(Check, { size: 16 }),
            " Opslaan"
          ]
        }
      ),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onCancel, children: "Annuleren" })
    ] })
  ] });
}
const stepKnop = {
  width: 40,
  height: 40,
  padding: 0,
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0
};
const stepVlak = {
  width: 24,
  height: 24,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  get border() {
    return `1.5px solid ${C.ceramicDark}`;
  },
  get background() {
    return C.cardBg;
  }
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
    cats.forEach((c) => map[c] = []);
    list.forEach((item) => {
      (map[item.category] || (map[item.category] = [])).push(item);
    });
    Object.keys(map).forEach((c) => {
      map[c] = [...map[c]].sort((a, b) => a.checked === b.checked ? 0 : a.checked ? 1 : -1);
    });
    return map;
  }, [list, cats]);
  const orderedCatsForDisplay = useMemo(() => {
    const alle = [...cats, ...Object.keys(byCategory).filter((c) => !cats.includes(c))];
    const withItems = alle.filter((c) => byCategory[c] && byCategory[c].length > 0);
    const open = withItems.filter((c) => byCategory[c].some((i) => !i.checked));
    const done = withItems.filter((c) => byCategory[c].every((i) => i.checked));
    return [...open, ...done];
  }, [cats, byCategory]);
  const checkedCount = list.filter((i) => i.checked).length;
  const submitManual = () => {
    if (!newName.trim() || newAmount === "") return;
    onAddManual({ name: newName.trim(), amount: Number(newAmount) || 1, unit: newUnit, category: newCategory });
    setNewName("");
    setNewAmount("");
    setCategoryTouched(false);
    setNewCategory(CATEGORIES[0]);
    setAdding(false);
  };
  const buildListText = () => {
    const body = cats.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return `${cat}:
` + items.map((i) => `- ${i.name} (${i.amount} ${i.unit})`).join("\n");
    }).filter(Boolean).join("\n\n");
    return `Boodschappenlijst \u2014 Pollepel

${body}`;
  };
  const buildChecklistText = () => {
    const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
    const body = cats.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return `${cat.toUpperCase()}
` + items.map((i) => `\u2610 ${i.name} (${i.amount} ${i.unit})`).join("\n");
    }).filter(Boolean).join("\n\n");
    return `Boodschappenlijst \u2014 Pollepel (${dateStr})

${body}
`;
  };
  const downloadList = () => {
    const blob = new Blob([buildChecklistText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boodschappenlijst-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.txt`;
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
      } catch (e) {
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareMsg("Boodschappenlijst gekopieerd naar het klembord.");
    } catch (e) {
      setShareMsg("Kon niet automatisch kopi\xEBren. Selecteer en kopieer de lijst handmatig.");
    }
    setTimeout(() => setShareMsg(""), 3500);
  };
  if (list.length === 0) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "40px 10px", color: C.inkSoft }, children: [
        /* @__PURE__ */ jsx(ShoppingCart, { size: 28, color: C.ceramicDark, style: { marginBottom: 8 } }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13 }, children: "Boodschappenlijst is leeg. Kook een gerecht of voeg zelf iets toe \u2014 die verschijnen hier automatisch als voorraad onder het minimum komt." })
      ] }),
      adding ? /* @__PURE__ */ jsx(ManualAddForm, { ...{ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched: () => setCategoryTouched(true), submitManual, onCancel: () => setAdding(false) } }) : /* @__PURE__ */ jsxs(PrimaryButton, { onClick: () => setAdding(true), full: true, children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " Zelf iets toevoegen"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14, display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx("button", { "aria-label": "Delen", onClick: shareList, title: "Lijst delen / kopi\xEBren", style: { width: 44, height: 44, background: C.cardBg, border: `1.5px solid ${C.blue}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsx(Share2, { size: 17, color: C.blue }) }),
      /* @__PURE__ */ jsx("button", { "aria-label": "Downloaden", onClick: downloadList, title: "Downloaden als afvinklijst", style: { width: 44, height: 44, background: C.cardBg, border: `1.5px solid ${C.blue}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsx(Download, { size: 17, color: C.blue }) })
    ] }),
    shareMsg && /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, marginTop: -8, marginBottom: 10 }, children: shareMsg }),
    orderedCatsForDisplay.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      const isDone = items.every((i) => i.checked);
      if (isDone) {
        return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 8, display: "flex", alignItems: "center", gap: 6, padding: "6px 2px", opacity: 0.6 }, children: [
          /* @__PURE__ */ jsx(CheckCircle2, { size: 13, color: C.sage }),
          /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.sage, textTransform: "uppercase" }, children: [
            cat,
            " \u2014 klaar (",
            items.length,
            ")"
          ] })
        ] }, cat);
      }
      return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.blueSoft, marginBottom: 6, textTransform: "uppercase" }, children: cat }),
        /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }, children: items.map((item, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: idx < items.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => onToggle(item.id), style: {
            width: 20,
            height: 20,
            borderRadius: 4,
            border: `1.5px solid ${item.checked ? C.sage : C.ceramicDark}`,
            background: item.checked ? C.sage : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0
          }, children: item.checked && /* @__PURE__ */ jsx(Check, { size: 13, color: "#fff" }) }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0, textDecoration: item.checked ? "line-through" : "none", opacity: item.checked ? 0.55 : 1 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 14, color: C.ink }, children: item.name }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4, marginTop: 2 }, children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": `Minder ${item.name}`,
                  onClick: () => onChangeAmount(item.id, -1),
                  style: stepKnop,
                  children: /* @__PURE__ */ jsx("span", { style: stepVlak, children: /* @__PURE__ */ jsx(Minus, { size: 13, color: C.inkSoft }) })
                }
              ),
              editAmountId === item.id ? /* @__PURE__ */ jsx(
                "input",
                {
                  autoComplete: "off",
                  type: "number",
                  inputMode: "decimal",
                  autoFocus: true,
                  value: editAmountValue,
                  onChange: (e) => setEditAmountValue(e.target.value),
                  onBlur: () => {
                    onSetAmount(item.id, editAmountValue);
                    setEditAmountId(null);
                  },
                  onKeyDown: (e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  },
                  style: {
                    width: 58,
                    padding: "2px 6px",
                    borderRadius: 8,
                    border: `1.5px solid ${C.mustard}`,
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    background: C.cardBg,
                    color: C.ink
                  }
                }
              ) : /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setEditAmountId(item.id);
                    setEditAmountValue(String(item.amount));
                  },
                  title: "Aantal aanpassen",
                  style: {
                    background: "none",
                    border: "none",
                    padding: "2px 4px",
                    cursor: "pointer",
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    color: C.inkSoft,
                    borderBottom: `1px dashed ${C.ceramicDark}`
                  },
                  children: [
                    item.amount,
                    " ",
                    item.unit
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": `Meer ${item.name}`,
                  onClick: () => onChangeAmount(item.id, 1),
                  style: stepKnop,
                  children: /* @__PURE__ */ jsx("span", { style: stepVlak, children: /* @__PURE__ */ jsx(Plus, { size: 13, color: C.inkSoft }) })
                }
              )
            ] })
          ] }),
          item.auto && /* @__PURE__ */ jsx(Pill, { tone: "auto", children: "via voorraad" }),
          /* @__PURE__ */ jsx("button", { onClick: () => onRemove(item.id), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 15, color: C.inkSoft }) })
        ] }, item.id)) })
      ] }, cat);
    }),
    adding ? /* @__PURE__ */ jsx(ManualAddForm, { ...{ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched: () => setCategoryTouched(true), submitManual, onCancel: () => setAdding(false) } }) : /* @__PURE__ */ jsxs(GhostButton, { onClick: () => setAdding(true), children: [
      /* @__PURE__ */ jsx(Plus, { size: 14 }),
      " Zelf iets toevoegen"
    ] }),
    checkedCount > 0 && /* @__PURE__ */ jsx("div", { style: { marginTop: 14 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", full: true, onClick: onProcess, children: [
      /* @__PURE__ */ jsx(Check, { size: 16 }),
      " ",
      checkedCount,
      " artikel",
      checkedCount > 1 ? "en" : "",
      " afvinken & voorraad bijwerken"
    ] }) })
  ] });
}
function ImportModal({ importing, error, onCancel, onImportText, onImportUrl, onImportPhoto }) {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const cameraInputRef = React.useRef(null);
  const galleryInputRef = React.useRef(null);
  const canSubmit = mode === "text" ? text.trim().length > 20 : mode === "url" ? url.trim().startsWith("http") : !!photoFile;
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
  return /* @__PURE__ */ jsxs(Modal, { title: "Recept importeren", onClose: onCancel, wide: true, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Plak een receptlink, plak tekst, of maak/upload een foto \u2014 Pollepel zet het om naar het juiste format. Je krijgt het resultaat daarna te zien om te controleren voordat het wordt opgeslagen." }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMode("url"),
          style: {
            flex: 1,
            padding: "8px 6px",
            borderRadius: 12,
            cursor: "pointer",
            border: `1.5px solid ${mode === "url" ? C.blue : C.ceramicDark}`,
            background: mode === "url" ? C.blue : C.cardBg,
            color: mode === "url" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5
          },
          children: [
            /* @__PURE__ */ jsx(Link2, { size: 13 }),
            " Link"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMode("text"),
          style: {
            flex: 1,
            padding: "8px 6px",
            borderRadius: 12,
            cursor: "pointer",
            border: `1.5px solid ${mode === "text" ? C.blue : C.ceramicDark}`,
            background: mode === "text" ? C.blue : C.cardBg,
            color: mode === "text" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5
          },
          children: [
            /* @__PURE__ */ jsx(ClipboardPaste, { size: 13 }),
            " Tekst"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setMode("photo"),
          style: {
            flex: 1,
            padding: "8px 6px",
            borderRadius: 12,
            cursor: "pointer",
            border: `1.5px solid ${mode === "photo" ? C.blue : C.ceramicDark}`,
            background: mode === "photo" ? C.blue : C.cardBg,
            color: mode === "photo" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5
          },
          children: [
            /* @__PURE__ */ jsx(ImagePlus, { size: 13 }),
            " Foto"
          ]
        }
      )
    ] }),
    mode === "url" && /* @__PURE__ */ jsx(Field, { label: "Link naar het recept", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, placeholder: "https://voorbeeld.nl/recept/spaghetti", value: url, onChange: (e) => setUrl(e.target.value) }) }),
    mode === "text" && /* @__PURE__ */ jsx(Field, { label: "Plak de recepttekst (ingredi\xEBnten + bereiding)", children: /* @__PURE__ */ jsx(
      "textarea",
      {
        style: { ...inputStyle, minHeight: 160, resize: "vertical" },
        placeholder: "Plak hier de volledige recepttekst\u2026",
        value: text,
        onChange: (e) => setText(e.target.value)
      }
    ) }),
    mode === "photo" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("input", { autoComplete: "off", ref: cameraInputRef, type: "file", accept: "image/*", capture: "environment", onChange: handlePhotoSelected, style: { display: "none" } }),
      /* @__PURE__ */ jsx("input", { autoComplete: "off", ref: galleryInputRef, type: "file", accept: "image/*", onChange: handlePhotoSelected, style: { display: "none" } }),
      photoPreview ? /* @__PURE__ */ jsxs("div", { style: { marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("img", { src: photoPreview, alt: "Recept", style: { width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 14, border: `1.5px solid ${C.borderTint}`, background: C.ceramic } }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: 6 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: () => {
          setPhotoFile(null);
          setPhotoPreview("");
        }, children: [
          /* @__PURE__ */ jsx(X, { size: 13 }),
          " Andere foto kiezen"
        ] }) })
      ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { full: true, onClick: () => galleryInputRef.current && galleryInputRef.current.click(), children: [
          /* @__PURE__ */ jsx(ImagePlus, { size: 15 }),
          " Foto kiezen"
        ] }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: () => cameraInputRef.current && cameraInputRef.current.click(), children: [
          /* @__PURE__ */ jsx(Camera, { size: 15 }),
          " Direct camera"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, marginTop: -2 }, children: `Lukt "Direct camera" niet? Maak de foto eerst met je gewone camera-app en kies 'm daarna via "Foto kiezen". Zorg dat de tekst scherp en volledig in beeld is.` })
    ] }),
    mode === "url" && /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: C.inkSoft, marginTop: -6 }, children: 'Sommige sites blokkeren automatisch ophalen \u2014 lukt het niet, kopieer dan de tekst en gebruik "Tekst".' }),
    error && /* @__PURE__ */ jsxs("div", { style: { background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 14, style: { flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 6 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", disabled: !canSubmit || importing, onClick: handleSubmit, children: [
        importing ? /* @__PURE__ */ jsx(PollepelLoader, { size: 18, inline: true, delay: 0 }) : /* @__PURE__ */ jsx(Sparkles, { size: 16 }),
        importing ? "Bezig met herkennen\u2026" : "Recept herkennen"
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onCancel, children: "Annuleren" })
    ] })
  ] });
}
function AIWeekmenuModal({ generating, progress, error, onCancel, onGenerate }) {
  const [styleId, setStyleId] = useState(MEAL_STYLES[0].id);
  const [scope, setScope] = useState("empty");
  return /* @__PURE__ */ jsxs(Modal, { title: "AI: genereer weekmenu", onClose: onCancel, wide: true, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Pollepel bedenkt per dag een avondeten (geen ontbijt of lunch) en houdt rekening met overlappende ingredi\xEBnten tussen de gerechten, zodat je boodschappenlijst compacter en scherper wordt." }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "4px 0 8px" }, children: "Stijl" }),
    /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }, children: MEAL_STYLES.map((s) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setStyleId(s.id),
        style: {
          textAlign: "left",
          padding: "10px 10px",
          borderRadius: 14,
          cursor: "pointer",
          border: `1.5px solid ${styleId === s.id ? C.blue : C.borderTint}`,
          background: styleId === s.id ? C.blue : C.cardBg,
          color: styleId === s.id ? "#fff" : C.ink
        },
        children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 18, marginBottom: 4 }, children: s.icon }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600 }, children: s.label })
        ]
      },
      s.id
    )) }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Welke dagen?" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setScope("empty"),
          style: {
            flex: 1,
            padding: "9px 8px",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            border: `1.5px solid ${scope === "empty" ? C.blue : C.borderTint}`,
            background: scope === "empty" ? C.blue : C.cardBg,
            color: scope === "empty" ? "#fff" : C.ink
          },
          children: "Alleen lege dagen"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setScope("all"),
          style: {
            flex: 1,
            padding: "9px 8px",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            border: `1.5px solid ${scope === "all" ? C.blue : C.borderTint}`,
            background: scope === "all" ? C.blue : C.cardBg,
            color: scope === "all" ? "#fff" : C.ink
          },
          children: "Hele week (overschrijven)"
        }
      )
    ] }),
    generating && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 12, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 16, color: C.blue }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: C.ink }, children: progress || "Bezig\u2026" })
    ] }),
    error && !generating && /* @__PURE__ */ jsxs("div", { style: { background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 14, style: { flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", disabled: generating, onClick: () => onGenerate({ styleId, scope }), children: [
        generating ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 16 }) : /* @__PURE__ */ jsx(Wand2, { size: 16 }),
        generating ? "Bezig\u2026" : "Genereer weekmenu"
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onCancel, children: generating ? "Sluiten" : "Annuleren" })
    ] })
  ] });
}
function ScanModal({ inventory, onClose, onConsume, onRestock, onCreate }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectorRef = React.useRef(null);
  const lastHitRef = React.useRef({ code: "", at: 0 });
  const busyRef = React.useRef(false);
  const [phase, setPhase] = useState("intro");
  const [code, setCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [decoderKind, setDecoderKind] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [offName, setOffName] = useState("");
  const [amount, setAmount] = useState(1);
  const [doneMsg, setDoneMsg] = useState("");
  const [flash, setFlash] = useState("");
  const [session, setSession] = useState([]);
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
  useEffect(() => {
    if (phase !== "scanning") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
        }
      } catch (e) {
        setCameraError(
          e && e.name === "NotAllowedError" ? "Geen toestemming voor de camera. Sta cameratoegang toe voor deze site en probeer het opnieuw \u2014 of voer de cijfers hieronder handmatig in." : "De camera kon niet worden gestart. Voer de cijfers hieronder handmatig in."
        );
        setPhase("intro");
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [phase]);
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
        } catch (e) {
        }
        busyRef.current = false;
      }
      if (active) setTimeout(tick, 250);
    };
    tick();
    return () => {
      active = false;
    };
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
      const name = data && data.product && (data.product.product_name_nl || data.product.product_name) || "";
      const tags = data && data.product && data.product.categories_tags || [];
      setOffName(name);
      if (name) {
        setNewName(name);
        setNewCategory(categoryFromOffTags(tags) || guessCategory(name));
        setCategoryTouched(true);
      }
    } catch (e) {
      setOffName("");
    } finally {
      setLookupLoading(false);
    }
  };
  const handleDetected = (c) => {
    const now = Date.now();
    if (lastHitRef.current.code === c && now - lastHitRef.current.at < 3e3) return;
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
    setCode("");
    setOffName("");
    setNewName("");
    setDoneMsg("");
    lastHitRef.current = { code: "", at: Date.now() };
    setPhase(detectorRef.current ? "scanning" : "intro");
  };
  const stepper = (value, setValue, unitLabel) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", margin: "10px 0" }, children: [
    /* @__PURE__ */ jsx("button", { onClick: () => setValue(Math.max(0, round2(value - 1))), style: { width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }, children: /* @__PURE__ */ jsx(Minus, { size: 16 }) }),
    /* @__PURE__ */ jsxs("div", { style: { minWidth: 70, textAlign: "center", fontFamily: FONT_MONO, fontSize: 16 }, children: [
      value,
      " ",
      unitLabel
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: () => setValue(round2(value + 1)), style: { width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }, children: /* @__PURE__ */ jsx(Plus, { size: 16 }) })
  ] });
  return /* @__PURE__ */ jsxs(Modal, { title: "Barcode scannen", onClose, children: [
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { display: "none" } }),
    phase === "scanning" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "3/4" }, children: [
        /* @__PURE__ */ jsx("video", { ref: videoRef, muted: true, playsInline: true, style: { width: "100%", height: "100%", objectFit: "cover" } }),
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: "30% 8%", border: `2px solid ${C.mustard}`, borderRadius: 14, boxShadow: "0 0 0 999px rgba(0,0,0,0.28)" } }),
        flash && /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left: 0, right: 0, bottom: 0, background: C.sage, color: "#fff", padding: "10px 12px", fontSize: 14, fontWeight: 600, textAlign: "center" }, children: [
          /* @__PURE__ */ jsx(CheckCircle2, { size: 16, style: { verticalAlign: -3, marginRight: 6 } }),
          flash
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, color: C.inkSoft, textAlign: "center", margin: "10px 0 6px" }, children: [
        /* @__PURE__ */ jsx(ScanLine, { size: 14, style: { verticalAlign: -2, marginRight: 4 } }),
        "Houd de streepjescode in het kader. Bekende producten worden meteen bijgeboekt \u2014 scan er gerust meerdere achter elkaar."
      ] }),
      session.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 10, marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkSoft, marginBottom: 4 }, children: "Deze sessie bijgeboekt:" }),
        session.map((s, i) => /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, padding: "2px 0" }, children: [
          /* @__PURE__ */ jsx(CheckCircle2, { size: 12, color: C.sage, style: { verticalAlign: -1, marginRight: 5 } }),
          s.name,
          " ",
          /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, color: C.inkSoft }, children: [
            "+",
            s.qty,
            " ",
            s.unit
          ] })
        ] }, i))
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx(GhostButton, { onClick: () => setPhase("intro"), children: "Handmatig invoeren" }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: onClose, children: "Klaar" })
      ] })
    ] }),
    phase === "intro" && /* @__PURE__ */ jsxs("div", { children: [
      cameraError && /* @__PURE__ */ jsx("div", { style: { background: C.warnBg, border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 13, color: C.brick, marginBottom: 10 }, children: cameraError }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { onClick: startScanning, disabled: preparing, children: [
        /* @__PURE__ */ jsx(Camera, { size: 16 }),
        " ",
        preparing ? "Scanner laden\u2026" : "Camera starten"
      ] }) }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.inkSoft, marginTop: 0 }, children: "Of voer de cijfers onder de streepjescode in:" }),
      /* @__PURE__ */ jsx(Field, { label: "Barcode", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: manualCode, onChange: (e) => setManualCode(e.target.value), placeholder: "Bijv. 8710400123456", inputMode: "numeric" }) }),
      /* @__PURE__ */ jsxs(PrimaryButton, { disabled: !manualCode.trim(), onClick: () => {
        setPhase("intro");
        handleDetected(manualCode.trim());
      }, children: [
        /* @__PURE__ */ jsx(Search, { size: 16 }),
        " Opzoeken"
      ] })
    ] }),
    phase === "found" && matchedItem && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: C.ink, marginTop: 0 }, children: "Herkend als bestaand voorraaditem:" }),
      /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 12, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 15 }, children: matchedItem.name }),
        /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT_MONO, fontSize: 12, color: C.inkSoft }, children: [
          "Huidige voorraad: ",
          matchedItem.current,
          " ",
          matchedItem.unit
        ] })
      ] }),
      stepper(amount, setAmount, matchedItem.unit),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", onClick: () => {
        onRestock(matchedItem.id, amount);
        setDoneMsg(`${amount} ${matchedItem.unit} ${matchedItem.name} toegevoegd aan voorraad.`);
        setPhase("done");
      }, children: [
        /* @__PURE__ */ jsx(ArrowUpCircle, { size: 16 }),
        " Voorraad aanvullen"
      ] }) }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { tone: "brick", onClick: () => {
        onConsume(matchedItem.id, amount);
        setDoneMsg(`${amount} ${matchedItem.unit} ${matchedItem.name} afgeboekt van voorraad.`);
        setPhase("done");
      }, children: [
        /* @__PURE__ */ jsx(ArrowDownCircle, { size: 16 }),
        " Afboeken (buiten gerecht om)"
      ] }) }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsx(GhostButton, { onClick: backToScan, children: "Verder scannen" }) })
    ] }),
    phase === "found" && !matchedItem && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, color: C.ink, marginTop: 0 }, children: [
        "Onbekende barcode (",
        code,
        "). ",
        lookupLoading ? "Productnaam opzoeken\u2026" : offName ? "Gevonden via Open Food Facts:" : "Niet gevonden \u2014 vul zelf de gegevens in:"
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Naam", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", style: inputStyle, value: newName, onChange: (e) => setNewName(e.target.value), placeholder: lookupLoading ? "Bezig met zoeken\u2026" : "Productnaam" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Categorie", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: newCategory, onChange: (e) => {
        setNewCategory(e.target.value);
        setCategoryTouched(true);
      }, children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
      /* @__PURE__ */ jsx(Field, { label: "Eenheid", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: newUnit, onChange: (e) => setNewUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Huidige voorraad", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: newCurrent, onChange: (e) => setNewCurrent(e.target.value) }) }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Minimum", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: newMin, onChange: (e) => setNewMin(e.target.value) }) }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Maximum", children: /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: inputStyle, value: newMax, onChange: (e) => setNewMax(e.target.value) }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [
        /* @__PURE__ */ jsxs(
          PrimaryButton,
          {
            disabled: !newName.trim(),
            onClick: () => {
              onCreate({ name: newName.trim(), category: newCategory, unit: newUnit, current: Number(newCurrent) || 0, min: Number(newMin) || 0, max: Number(newMax) || 1, barcode: code });
              setDoneMsg(`${newName.trim()} toegevoegd aan de voorraad en gekoppeld aan deze barcode.`);
              setPhase("done");
            },
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 16 }),
              " Toevoegen aan voorraad"
            ]
          }
        ),
        /* @__PURE__ */ jsx(GhostButton, { onClick: backToScan, children: "Annuleren" })
      ] })
    ] }),
    phase === "done" && /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "16px 6px" }, children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 32, color: C.sage, style: { marginBottom: 8 } }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: C.ink }, children: doneMsg }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }, children: [
        /* @__PURE__ */ jsxs(PrimaryButton, { onClick: backToScan, children: [
          /* @__PURE__ */ jsx(ScanLine, { size: 16 }),
          " Verder scannen"
        ] }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: onClose, children: "Klaar" })
      ] })
    ] })
  ] });
}
function ManualAddForm({ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched, submitManual, onCancel }) {
  return /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 10, marginTop: 8 }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6 }, children: [
      /* @__PURE__ */ jsx("input", { autoComplete: "off", style: { ...inputStyle, flex: 1 }, placeholder: "Naam", value: newName, onChange: (e) => setNewName(e.target.value) }),
      /* @__PURE__ */ jsx(VoiceInputButton, { onResult: (text) => setNewName(text), title: "Naam inspreken" }),
      /* @__PURE__ */ jsx("input", { autoComplete: "off", type: "number", style: { ...inputStyle, width: 64 }, placeholder: "Aantal", value: newAmount, onChange: (e) => setNewAmount(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 8 }, children: [
      /* @__PURE__ */ jsx("select", { style: { ...inputStyle, flex: 1 }, value: newUnit, onChange: (e) => setNewUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }),
      /* @__PURE__ */ jsx("select", { style: { ...inputStyle, flex: 1 }, value: newCategory, onChange: (e) => {
        setNewCategory(e.target.value);
        if (onCategoryTouched) onCategoryTouched();
      }, children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { onClick: submitManual, children: [
        /* @__PURE__ */ jsx(Plus, { size: 14 }),
        " Toevoegen"
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: onCancel, children: "Annuleren" })
    ] })
  ] });
}
function App(props) {
  return /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(AppInner, { ...props }) });
}
export {
  App as default
};
