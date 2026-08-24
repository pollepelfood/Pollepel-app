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
  Tag
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
  "Groente & Fruit",
  "Zuivel",
  "Vlees & Vis",
  "Bakkerij & Granen",
  "Kruiden & Specerijen",
  "Diepvries",
  "Drank",
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
  sage: "#5E7F63",
  ink: "#1C1D1B",
  inkSoft: "#5B5C57",
  cardBg: "#ffffff",
  borderTint: "rgba(31,63,102,0.16)"
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
  borderTint: "rgba(143,169,196,0.22)"
};
let C = { ...LIGHT_PALETTE };
function applyTheme(dark) {
  Object.assign(C, dark ? DARK_PALETTE : LIGHT_PALETTE);
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
function namesMatch(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const stripSuffix = (s) => s.replace(/('s|s|en)$/, "");
  if (stripSuffix(na) === stripSuffix(nb)) return true;
  if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) return true;
  return false;
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
  [[
    "ui",
    "knoflook",
    "tomaat",
    "tomaten",
    "paprika",
    "komkommer",
    "wortel",
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
    "bes",
    "granaatappel",
    "groente",
    "fruit",
    "salade"
  ], "Groente & Fruit"],
  [[
    "melk",
    "kaas",
    "boter",
    "yoghurt",
    "kwark",
    "kookroom",
    "slagroom",
    "room",
    "cr\xE8mefra\xEEche",
    "roomkaas",
    "mozzarella",
    "feta",
    "margarine",
    "ei",
    "eieren",
    "parmezaan",
    "zuivel",
    "vla",
    "pudding",
    "chocomel"
  ], "Zuivel"],
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
    "tofu",
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
    "kroket",
    "frikandel",
    "makreel",
    "haring",
    "mosselen"
  ], "Vlees & Vis"],
  [[
    "brood",
    "pasta",
    "spaghetti",
    "macaroni",
    "penne",
    "rijst",
    "bloem",
    "noedel",
    "couscous",
    "wrap",
    "pita",
    "cornflakes",
    "havermout",
    "beschuit",
    "cracker",
    "risottorijst",
    "lasagne",
    "tortilla",
    "muesli",
    "graan",
    "granen",
    "toast",
    "croissant",
    "bagel",
    "quinoa"
  ], "Bakkerij & Granen"],
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
    "bouillon",
    "currypasta",
    "sojasaus",
    "ketjap",
    "mosterd",
    "mayonaise",
    "ketchup",
    "azijn",
    "olijfolie",
    "zonnebloemolie",
    "suiker",
    "honing",
    "jam",
    "pindakaas",
    "pesto",
    "specerij",
    "kruiden",
    "kruidenmix",
    "sambal",
    "knoflookpasta",
    "gemberpasta",
    "saus",
    "dressing",
    "marinade"
  ], "Kruiden & Specerijen"],
  [["diepvries", "vriezer", "ijsje", "ijstaart", "diepvries"], "Diepvries"],
  [[
    "cola",
    "sap",
    "bier",
    "wijn",
    "koffie",
    "thee",
    "frisdrank",
    "water",
    "limonade",
    "sinas",
    "energiedrank",
    "smoothie",
    "drank"
  ], "Drank"]
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
function recipeReadiness(recipe, inventory, scale = 1) {
  let tracked = 0;
  let have = 0;
  const missing = [];
  recipe.ingredients.forEach((ing) => {
    const item = inventory.find((i) => namesMatch(i.name, ing.name) && i.unit === ing.unit);
    if (!item) return;
    tracked += 1;
    if (item.current >= Number(ing.amount || 0) * scale) have += 1;
    else missing.push(item.name);
  });
  return { tracked, have, missing, canMake: tracked > 0 && missing.length === 0, total: recipe.ingredients.length };
}
function resizeImageFile(file, maxDim = 1280, quality = 0.85) {
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
    warn: { bg: "#F1DCC9", fg: C.brick },
    ok: { bg: "#DCE7DD", fg: C.sage },
    auto: { bg: "#E4D9C3", fg: C.mustardDeep }
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
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      style: {
        background: disabled ? "#B9B6AC" : bg,
        color: "#fff",
        border: "none",
        borderRadius: 14,
        padding: compact ? "9px 12px" : "10px 16px",
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
function GhostButton({ children, onClick, danger }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      style: {
        background: "transparent",
        color: danger ? C.brick : C.blue,
        border: `1.5px solid ${danger ? C.brick : C.blue}`,
        borderRadius: 14,
        padding: "9px 14px",
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 14,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer"
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
  border: `1.5px solid ${C.borderTint}`,
  borderRadius: 12,
  padding: "9px 11px",
  fontFamily: FONT_BODY,
  fontSize: 16,
  background: C.cardBg,
  color: C.ink
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
              /* @__PURE__ */ jsx("button", { onClick: onClose, style: { background: C.ceramic, border: "none", borderRadius: 12, padding: 7, cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 18, color: C.ink }) })
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
function App({ household = null, members = [], onLogout = null, onRenameHousehold = null } = {}) {
  const [loading, setLoading] = useState(true);
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
  const [preferences, setPreferences] = useState({ darkMode: false, categoryOrder: null, diets: [] });
  const [cookLog, setCookLog] = useState([]);
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash === "#boodschappen") return "boodschappen";
    return "kookboek";
  });
  const [query, setQuery] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [bookMode, setBookMode] = useState("mine");
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const hasCommunityBackend = typeof window !== "undefined" && !!window.communityStore;
  const [makeOnly, setMakeOnly] = useState(false);
  const [openRecipeId, setOpenRecipeId] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState(null);
  const [cookDay, setCookDay] = useState(null);
  const [aiWeekOpen, setAiWeekOpen] = useState(false);
  const [aiWeekGenerating, setAiWeekGenerating] = useState(false);
  const [aiWeekProgress, setAiWeekProgress] = useState("");
  const [aiWeekError, setAiWeekError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [printCardOpen, setPrintCardOpen] = useState(false);
  const [tabletModeOpen, setTabletModeOpen] = useState(false);
  useEffect(() => {
    (async () => {
      const [r, i, s, w, c, p, log] = await Promise.all([
        loadKey("recipes", seedRecipes),
        loadKey("inventory", seedInventory),
        loadKey("shoppingList", () => []),
        loadKey("weekmenu", () => ({})),
        loadKey("cooks", () => []),
        loadKey("preferences", () => ({ darkMode: false, categoryOrder: null, diets: [] })),
        loadKey("cookLog", () => [])
      ]);
      applyTheme(!!p.darkMode);
      setPreferences(p);
      setCookLog(log);
      setRecipes(r);
      setInventory(i);
      setShoppingList(s);
      setWeekmenu(w);
      setCooks(c);
      setLoading(false);
    })();
  }, []);
  const persist = useCallback(async (key, value, setter) => {
    setter(value);
    setSaving(true);
    await saveKey(key, value);
    setSaving(false);
  }, []);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  };
  const askClaude = async (prompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1e3,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) throw new Error("API-fout");
    const data = await response.json();
    return (data.content || []).map((b) => b.text || "").join("\n");
  };
  const askClaudeVision = async (base64, mediaType, prompt) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
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
    if (!response.ok) throw new Error("API-fout");
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
- Als een ingredi\xEBnt meerdere keren voorkomt (bijv. zowel in een stappenlijst als in een aparte ingredi\xEBntenoverzicht), voeg het maar \xE9\xE9n keer toe met de duidelijkste hoeveelheid.
- Maximaal 10 stappen en maximaal 20 ingredi\xEBnten \u2014 vat samen of combineer kleine kruiden waar nodig, dit moet compact blijven.
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
  const buildPhotoExtractionPrompt = () => `Je bent een recept-extractor voor de kookboek-app "Pollepel". Op de afbeelding staat een recept (bijv. een kookboekpagina, uitprint, verpakking of handgeschreven kaart). Lees de tekst op de foto en zet die om naar STRIKT GELDIGE, COMPACTE JSON (\xE9\xE9n regel, geen witruimte/inspringing, geen markdown-codeblok, geen uitleg ervoor of erna) volgens dit format:

{"name":string,"emoji":"\xE9\xE9n relevante food-emoji","cookTime":integer(minuten),"servings":integer,"ingredients":[{"name":string,"amount":number,"unit":\xE9\xE9n van "stuks"|"g"|"kg"|"ml"|"l"|"eetlepel"|"theelepel"|"snufje"}],"steps":[string,...]}

Regels:
- Herschrijf elke bereidingsstap kort (max ~15 woorden) en in je eigen woorden.
- Maximaal 10 stappen en maximaal 20 ingredi\xEBnten.
- Kies per ingredi\xEBnt de dichtstbijzijnde toegestane eenheid; gebruik "stuks" als er geen duidelijke maateenheid is.
- Als de foto onduidelijk, onvolledig of geen recept is, antwoord dan met {"error":"onleesbaar"}.
- Antwoord ALLEEN met de JSON, niets anders.`;
  const importFromPhoto = async (file) => {
    setImporting(true);
    setImportError("");
    try {
      const { base64, mediaType } = await resizeImageFile(file);
      const raw = await askClaudeVision(base64, mediaType, buildPhotoExtractionPrompt());
      const parsed = extractJson(raw);
      if (parsed.error) throw new Error("onleesbaar");
      const draft = sanitizeDraft(parsed);
      if (!draft.ingredients.length || !draft.steps.length) throw new Error("leeg");
      setImportOpen(false);
      setEditingRecipe(draft);
    } catch (e) {
      setImportError("Kon geen recept herkennen op deze foto. Zorg dat de tekst scherp en volledig zichtbaar is, of typ het recept over in het tekstveld.");
    } finally {
      setImporting(false);
    }
  };
  const openRecipe = openRecipeId ? recipes.find((r) => r.id === openRecipeId) || communityRecipes.find((r) => r.id === openRecipeId) : null;
  const openRecipeIsMine = openRecipe ? recipes.some((r) => r.id === openRecipe.id) : true;
  const loadCommunityRecipes = useCallback(async () => {
    if (!hasCommunityBackend) return;
    try {
      const items = await window.communityStore.list();
      setCommunityRecipes(items || []);
    } catch (e) {
    }
  }, [hasCommunityBackend]);
  useEffect(() => {
    if (hasCommunityBackend) loadCommunityRecipes();
  }, [hasCommunityBackend, loadCommunityRecipes]);
  const communitySourceRecipes = hasCommunityBackend ? communityRecipes : recipes;
  const [dietOnly, setDietOnly] = useState(false);
  const activeDietTags = useMemo(() => {
    const all = /* @__PURE__ */ new Set();
    (preferences.diets || []).forEach((d) => d.tags.forEach((t) => all.add(t)));
    return Array.from(all);
  }, [preferences.diets]);
  const filteredRecipes = useMemo(() => {
    const source = bookMode === "community" ? communitySourceRecipes : recipes;
    return source.filter((r) => {
      if (bookMode === "community" && !hasCommunityBackend && !r.community) return false;
      if (favOnly && !r.favorite) return false;
      if (makeOnly && !recipeReadiness(r, inventory).canMake) return false;
      if (dietOnly && activeDietTags.length && !activeDietTags.every((tag) => (r.diets || []).includes(tag))) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [recipes, communitySourceRecipes, bookMode, hasCommunityBackend, favOnly, makeOnly, dietOnly, activeDietTags, query, inventory]);
  const lowStockCount = inventory.filter((i) => i.current < i.min).length;
  const shoppingCount = shoppingList.length;
  const toggleFavorite = (id) => {
    const next = recipes.map((r) => r.id === id ? { ...r, favorite: !r.favorite } : r);
    persist("recipes", next, setRecipes);
  };
  const toggleCommunity = async (id) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    const nowShared = !recipe.community;
    const next = recipes.map((r) => r.id === id ? { ...r, community: nowShared } : r);
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
    showToast(nowShared ? `${recipe.name} is gedeeld met de community.` : `${recipe.name} is niet langer gedeeld.`);
  };
  const duplicateToMyBook = (id) => {
    const recipe = recipes.find((r) => r.id === id) || communityRecipes.find((r) => r.id === id);
    if (!recipe) return;
    const copy = { ...recipe, id: uid(), community: false, favorite: false };
    persist("recipes", [...recipes, copy], setRecipes);
    showToast(`${recipe.name} toegevoegd aan jouw kookboek.`);
  };
  const saveRecipe = (recipe) => {
    let next;
    if (recipe.id) {
      next = recipes.map((r) => r.id === recipe.id ? recipe : r);
    } else {
      next = [...recipes, { ...recipe, id: uid(), favorite: false, community: false }];
    }
    persist("recipes", next, setRecipes);
    setEditingRecipe(null);
  };
  const deleteRecipe = (id) => {
    persist("recipes", recipes.filter((r) => r.id !== id), setRecipes);
    setOpenRecipeId(null);
  };
  const cookRecipe = (recipe, scale = 1) => {
    const nextInventory = inventory.map((i) => ({ ...i }));
    let nextShopping = shoppingList.map((s) => ({ ...s }));
    const used = [];
    const added = [];
    recipe.ingredients.forEach((ing) => {
      const idx = nextInventory.findIndex(
        (i) => namesMatch(i.name, ing.name) && i.unit === ing.unit
      );
      if (idx === -1) return;
      const item = nextInventory[idx];
      const newCurrent = Math.max(0, round2(item.current - Number(ing.amount || 0) * scale));
      nextInventory[idx] = { ...item, current: newCurrent };
      used.push(item.name);
      const result = pushLowStockToShopping(nextShopping, item, newCurrent);
      nextShopping = result.list;
      if (result.added) added.push(item.name);
    });
    persist("inventory", nextInventory, setInventory);
    persist("shoppingList", nextShopping, setShoppingList);
    if (added.length) {
      showToast(`Lekker gegeten! ${added.length} ingredient${added.length > 1 ? "en" : ""} toegevoegd aan de boodschappenlijst: ${added.join(", ")}.`);
    } else if (used.length) {
      showToast("Lekker gegeten! Voorraad bijgewerkt, nog genoeg in huis.");
    } else {
      showToast("Lekker gegeten! (Deze ingredi\xEBnten worden niet in de voorraad bijgehouden.)");
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
  const addLeftover = (recipe, portions) => {
    if (!portions || portions <= 0) return;
    const expiry = /* @__PURE__ */ new Date();
    expiry.setDate(expiry.getDate() + 3);
    const newItem = {
      id: uid(),
      name: `Restje ${recipe.name}`,
      category: "Overig",
      unit: "stuks",
      current: portions,
      min: 0,
      max: portions,
      expiryDate: expiry.toISOString().slice(0, 10)
    };
    persist("inventory", [...inventory, newItem], setInventory);
    showToast(`${portions} portie${portions > 1 ? "s" : ""} kliekjes toegevoegd aan je voorraad (THT over 3 dagen).`);
  };
  const consumeInventoryItem = (itemId, amount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newCurrent = Math.max(0, round2(item.current - Number(amount || 0)));
    const nextInventory = inventory.map((i) => i.id === itemId ? { ...i, current: newCurrent } : i);
    const { list: nextShopping, added } = pushLowStockToShopping(shoppingList, item, newCurrent);
    persist("inventory", nextInventory, setInventory);
    if (added) persist("shoppingList", nextShopping, setShoppingList);
    showToast(added ? `${item.name} afgeboekt \u2014 voorraad onder minimum, toegevoegd aan boodschappenlijst.` : `${item.name} afgeboekt van de voorraad.`);
  };
  const restockInventoryItem = (itemId, amount) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newCurrent = Math.min(item.max, round2(item.current + Number(amount || 0)));
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
        nextInventory[idx] = { ...item, current: round2(Math.min(item.max, item.current + Number(s.amount || 0))) };
      } else {
        const amount = Number(s.amount || 0) || 1;
        nextInventory.push({
          id: uid(),
          name: s.name,
          category: s.category || guessCategory(s.name),
          unit: s.unit,
          current: amount,
          min: round2(Math.max(amount * 0.4, 0.5)),
          max: amount
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
  const setDayRecipe = (day, recipeId) => {
    const next = { ...weekmenu, [day]: { ...dayEntry(day), recipeId } };
    persist("weekmenu", next, setWeekmenu);
    setPickerDay(null);
  };
  const setDayCook = (day, cook) => {
    const next = { ...weekmenu, [day]: { ...dayEntry(day), cook: cook.trim() } };
    persist("weekmenu", next, setWeekmenu);
    setCookDay(null);
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
    const template = await loadKey("weekmenuTemplate", () => null);
    if (!template || !Object.keys(template).length) {
      showToast("Er is nog geen opgeslagen weekmenu-sjabloon.");
      return;
    }
    persist("weekmenu", template, setWeekmenu);
    showToast("Vorig weekmenu opnieuw toegepast.");
  };
  const shuffleWeekmenu = () => {
    const filledDays = WEEK_DAYS.filter((d) => dayEntry(d.key)?.recipeId);
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
    const planned = WEEK_DAYS.map((d, idx) => ({ day: d, idx, entry: dayEntry(d.key) })).filter(({ entry }) => entry?.recipeId);
    if (!planned.length) {
      showToast("Er staat nog niets in het weekmenu.");
      return;
    }
    const today = /* @__PURE__ */ new Date();
    const monday = new Date(today);
    const isoDayIdx = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - isoDayIdx);
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const events = planned.map(({ day, idx, entry }) => {
      const recipe = recipes.find((r) => r.id === entry.recipeId);
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
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
  const generateWeekShoppingList = () => {
    const plannedRecipes = WEEK_DAYS.map((d) => dayEntry(d.key)?.recipeId).filter(Boolean).map((id) => recipes.find((r) => r.id === id)).filter(Boolean);
    if (!plannedRecipes.length) {
      showToast("Er staan nog geen gerechten in het weekmenu.");
      return;
    }
    const totals = /* @__PURE__ */ new Map();
    plannedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        const key = `${norm(ing.name)}|${ing.unit}`;
        const prev = totals.get(key) || { name: ing.name, unit: ing.unit, amount: 0 };
        totals.set(key, { ...prev, amount: round2(prev.amount + Number(ing.amount || 0)) });
      });
    });
    let nextShopping = shoppingList.map((s) => ({ ...s }));
    let addedCount = 0;
    totals.forEach((need) => {
      const item = inventory.find((i) => namesMatch(i.name, need.name) && i.unit === need.unit);
      const inStock = item ? item.current : 0;
      const shortfall = round2(need.amount - inStock);
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
  const generateAIWeekmenu = async ({ styleId, scope }) => {
    const style = MEAL_STYLES.find((s) => s.id === styleId) || MEAL_STYLES[0];
    const days = scope === "empty" ? WEEK_DAYS.filter((d) => !weekmenu[d.key]) : WEEK_DAYS;
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
        const recipeWithId = { ...parsed, id: uid(), favorite: false };
        newRecipes.push(recipeWithId);
        nextWeekmenu[days[i].key] = { ...dayEntry(days[i].key), recipeId: recipeWithId.id };
      } catch (e) {
      }
    }
    setAiWeekGenerating(false);
    setAiWeekProgress("");
    if (newRecipes.length) {
      persist("recipes", [...recipes, ...newRecipes], setRecipes);
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
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { style: { minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center", background: C.ceramic, fontFamily: FONT_BODY }, children: [
      /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 22, color: C.blue }),
      /* @__PURE__ */ jsx("span", { style: { marginLeft: 8, color: C.blueDeep }, children: "Kookboek wordt geladen\u2026" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT_BODY, background: C.ceramic, minHeight: 600, maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 72 }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea { font-size: 16px !important; }
        input:focus, textarea:focus, select:focus { outline: 2px solid ${C.mustard}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${C.mustard}; outline-offset: 2px; }
      ` }),
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
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, flexShrink: 0, whiteSpace: "nowrap" }, children: "Pollepel" }),
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
      }, children: household.name }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 5, position: "relative" }, children: "Jullie digitale kookboek \xB7 voorraad & boodschappen automatisch bijgewerkt" })
    ] }),
    isOffline && /* @__PURE__ */ jsxs("div", { style: { background: C.brick, color: "#fff", textAlign: "center", padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsx(WifiOff, { size: 13 }),
      " Geen internetverbinding \u2014 wijzigingen worden pas opgeslagen zodra je weer online bent."
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "center", gap: 7, padding: "9px 0 3px" }, children: Array.from({ length: 11 }).map((_, i) => /* @__PURE__ */ jsx("div", { style: {
      width: 5,
      height: 5,
      borderRadius: 1,
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
      tab === "kookboek" && !openRecipe && /* @__PURE__ */ jsx(
        KookboekView,
        {
          recipes: filteredRecipes,
          cookLog,
          query,
          setQuery,
          favOnly,
          setFavOnly,
          makeOnly,
          setMakeOnly,
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
          onDuplicate: duplicateToMyBook
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
          onCook: (scale) => cookRecipe(openRecipe, scale),
          onDuplicate: () => duplicateToMyBook(openRecipe.id),
          onAddLeftover: addLeftover,
          inventory
        }
      ),
      tab === "voorraad" && /* @__PURE__ */ jsx(
        VoorraadView,
        {
          inventory,
          recipes,
          categories: orderedCategories,
          onEdit: setEditingItem,
          onNew: () => setEditingItem({}),
          onDelete: deleteInventoryItem,
          onScan: () => setScanOpen(true),
          onOpenRecipe: (id) => {
            setOpenRecipeId(id);
            setTab("kookboek");
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
          onProcess: processChecked
        }
      ),
      tab === "weekmenu" && /* @__PURE__ */ jsx(
        WeekmenuView,
        {
          weekmenu,
          recipes,
          cooks,
          onPickDay: setPickerDay,
          onPickCook: setCookDay,
          onClearDay: clearDay,
          onGenerate: generateWeekShoppingList,
          onAIGenerate: () => {
            setAiWeekError("");
            setAiWeekOpen(true);
          },
          onDuplicate: duplicateWeekmenu,
          onApplyTemplate: applyWeekmenuTemplate,
          onShuffle: shuffleWeekmenu,
          onOpenRecipe: (id) => {
            setOpenRecipeId(id);
            setTab("kookboek");
          },
          onExportCalendar: exportWeekmenuToCalendar
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      background: C.cardBg,
      borderTop: `1.5px solid ${C.borderTint}`,
      display: "flex",
      padding: "8px 4px",
      borderRadius: "22px 22px 0 0",
      boxShadow: "0 -4px 14px rgba(0,0,0,0.08)"
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
        onPick: (recipeId) => setDayRecipe(pickerDay, recipeId),
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
        onExportBackup: exportBackup,
        onToggleDarkMode: toggleDarkMode,
        onMoveCategoryOrder: moveCategoryOrder,
        onUpdateCookDiets: updateCookDiets,
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
    editingRecipe !== null && /* @__PURE__ */ jsx(
      RecipeForm,
      {
        initial: editingRecipe,
        inventoryNames: [.../* @__PURE__ */ new Set([...inventory.map((i) => i.name), ...COMMON_GROCERY_ITEMS])],
        onCancel: () => setEditingRecipe(null),
        onSave: saveRecipe
      }
    ),
    editingItem !== null && /* @__PURE__ */ jsx(
      InventoryForm,
      {
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
            fontSize: 10,
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
function SeasonalAndSurpriseBar({ recipes, inventory, onOpen }) {
  const seasonal = useMemo(() => getSeasonalRecipeSuggestions(recipes).slice(0, 4), [recipes]);
  const monthName = (/* @__PURE__ */ new Date()).toLocaleDateString("nl-NL", { month: "long" });
  const surpriseMe = () => {
    const makeable = recipes.filter((r) => recipeReadiness(r, inventory).canMake);
    const pool = makeable.length ? makeable : recipes;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
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
          fontSize: 13.5,
          cursor: "pointer",
          marginBottom: 10
        },
        children: [
          /* @__PURE__ */ jsx(Shuffle, { size: 16 }),
          " Verras me! (kies iets wat ik kan maken)"
        ]
      }
    ),
    seasonal.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: "#EEF3EC", border: `1.5px solid ${C.sage}`, borderRadius: 16, padding: 12 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 14 }, children: "\u{1F331}" }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 12.5, fontWeight: 700, color: C.sage }, children: [
          "Nu in seizoen (",
          monthName,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }, children: seasonal.map(({ recipe, matches }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onOpen(recipe.id),
          style: { flexShrink: 0, background: C.cardBg, border: `1px solid ${C.sage}`, borderRadius: 12, padding: "8px 10px", cursor: "pointer", textAlign: "left", minWidth: 130 },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12.5, fontWeight: 600, color: C.ink }, children: [
              recipe.emoji || "\u{1F37D}\uFE0F",
              " ",
              recipe.name
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.inkSoft, marginTop: 2 }, children: [
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
function KookboekView({ recipes, cookLog, query, setQuery, favOnly, setFavOnly, makeOnly, setMakeOnly, dietOnly, setDietOnly, activeDietTags, bookMode, setBookMode, inventory, onOpen, onToggleFav, onNew, onImport, onDuplicate }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setBookMode("mine"),
          style: {
            flex: 1,
            padding: "8px 4px",
            borderRadius: 12,
            cursor: "pointer",
            border: `1.5px solid ${bookMode === "mine" ? C.blue : C.borderTint}`,
            background: bookMode === "mine" ? C.blue : "#fff",
            color: bookMode === "mine" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4
          },
          children: [
            /* @__PURE__ */ jsx(ChefHat, { size: 12 }),
            " Mijn kookboek"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setBookMode("community"),
          style: {
            flex: 1,
            padding: "8px 4px",
            borderRadius: 12,
            cursor: "pointer",
            border: `1.5px solid ${bookMode === "community" ? C.blue : C.borderTint}`,
            background: bookMode === "community" ? C.blue : "#fff",
            color: bookMode === "community" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4
          },
          children: [
            /* @__PURE__ */ jsx(Users, { size: 12 }),
            " Community"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setBookMode("history"),
          style: {
            flex: 1,
            padding: "8px 4px",
            borderRadius: 12,
            cursor: "pointer",
            border: `1.5px solid ${bookMode === "history" ? C.blue : C.borderTint}`,
            background: bookMode === "history" ? C.blue : "#fff",
            color: bookMode === "history" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4
          },
          children: [
            /* @__PURE__ */ jsx(Clock, { size: 12 }),
            " Historie"
          ]
        }
      )
    ] }),
    bookMode === "community" && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: -6, marginBottom: 10 }, children: 'Recepten die huishoudens gedeeld hebben. Tik "voeg toe" om een eigen bewerkbare kopie in je kookboek te zetten.' }),
    bookMode === "mine" && /* @__PURE__ */ jsx(SeasonalAndSurpriseBar, { recipes, inventory, onOpen }),
    bookMode === "history" ? /* @__PURE__ */ jsx(CookHistoryList, { cookLog, onOpen }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, position: "relative" }, children: [
          /* @__PURE__ */ jsx(Search, { size: 15, color: C.inkSoft, style: { position: "absolute", left: 10, top: 11 } }),
          /* @__PURE__ */ jsx(
            "input",
            {
              style: { ...inputStyle, paddingLeft: 30 },
              placeholder: "Zoek een gerecht\u2026",
              value: query,
              onChange: (e) => setQuery(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFavOnly((v) => !v),
            title: "Alleen favorieten",
            style: {
              border: `1.5px solid ${favOnly ? C.mustard : C.borderTint}`,
              background: favOnly ? C.mustard : "#fff",
              borderRadius: 12,
              width: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            },
            children: /* @__PURE__ */ jsx(Star, { size: 17, fill: favOnly ? "#fff" : "none", color: favOnly ? "#fff" : C.inkSoft })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMakeOnly((v) => !v),
            title: "Alleen wat ik kan maken",
            style: {
              border: `1.5px solid ${makeOnly ? C.sage : C.borderTint}`,
              background: makeOnly ? C.sage : "#fff",
              borderRadius: 12,
              width: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            },
            children: /* @__PURE__ */ jsx(ChefHat, { size: 17, color: makeOnly ? "#fff" : C.inkSoft })
          }
        ),
        activeDietTags && activeDietTags.length > 0 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDietOnly((v) => !v),
            title: `Past bij: ${activeDietTags.join(", ")}`,
            style: {
              border: `1.5px solid ${dietOnly ? C.sage : C.borderTint}`,
              background: dietOnly ? C.sage : "#fff",
              borderRadius: 12,
              width: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            },
            children: /* @__PURE__ */ jsx(StickyNote, { size: 17, color: dietOnly ? "#fff" : C.inkSoft })
          }
        )
      ] }),
      makeOnly && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: -6, marginBottom: 10 }, children: "Alleen gerechten waarvan je alle bijgehouden ingredi\xEBnten in voorraad hebt." }),
      /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: recipes.map((r) => {
        const readiness = recipeReadiness(r, inventory);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => onOpen(r.id),
            style: { background: C.cardBg, borderRadius: 18, padding: 8, cursor: "pointer", border: `1.5px solid ${C.borderTint}`, position: "relative" },
            children: [
              /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 5, left: 5, width: 6, height: 6, borderRadius: 1, background: C.blue, opacity: 0.18, transform: "rotate(45deg)" } }),
              /* @__PURE__ */ jsx("div", { style: { position: "absolute", bottom: 5, right: 5, width: 6, height: 6, borderRadius: 1, background: C.blue, opacity: 0.18, transform: "rotate(45deg)" } }),
              /* @__PURE__ */ jsx(TileThumb, { recipe: r }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }, children: [
                /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, color: C.ink, lineHeight: 1.2 }, children: r.name }),
                bookMode === "mine" && /* @__PURE__ */ jsx("button", { onClick: (e) => {
                  e.stopPropagation();
                  onToggleFav(r.id);
                }, style: { background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 0, marginLeft: 4 }, children: /* @__PURE__ */ jsx(Star, { size: 16, fill: r.favorite ? C.mustard : "none", color: r.favorite ? C.mustard : C.ceramicDark }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 6, fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: [
                /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 3 }, children: [
                  /* @__PURE__ */ jsx(Clock, { size: 11 }),
                  r.cookTime,
                  "m"
                ] }),
                /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 3 }, children: [
                  /* @__PURE__ */ jsx(Users, { size: 11 }),
                  r.servings
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }, children: [
                readiness.tracked > 0 && (readiness.canMake ? /* @__PURE__ */ jsxs(Pill, { tone: "ok", children: [
                  /* @__PURE__ */ jsx(Check, { size: 10 }),
                  " In huis"
                ] }) : /* @__PURE__ */ jsxs(Pill, { tone: "warn", children: [
                  readiness.tracked - readiness.missing.length,
                  "/",
                  readiness.tracked,
                  " in huis"
                ] })),
                r.community && bookMode === "mine" && /* @__PURE__ */ jsxs(Pill, { tone: "auto", children: [
                  /* @__PURE__ */ jsx(Users, { size: 10 }),
                  " Gedeeld"
                ] })
              ] }),
              bookMode === "community" && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    onDuplicate(r.id);
                  },
                  style: { marginTop: 8, width: "100%", padding: "6px 8px", borderRadius: 10, border: "none", background: C.mustard, color: "#fff", fontSize: 11.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
                  children: [
                    /* @__PURE__ */ jsx(Plus, { size: 12 }),
                    " Voeg toe"
                  ]
                }
              )
            ]
          },
          r.id
        );
      }) }),
      recipes.length === 0 && bookMode === "community" && /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "40px 10px", color: C.inkSoft, fontSize: 13 }, children: [
        /* @__PURE__ */ jsx(Users, { size: 26, color: C.ceramicDark, style: { marginBottom: 8 } }),
        /* @__PURE__ */ jsx("p", { children: "Nog geen gedeelde recepten. Open een recept in je eigen kookboek en tik op het community-icoon om als eerste iets te delen." })
      ] }),
      recipes.length === 0 && bookMode === "mine" && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "40px 10px", color: C.inkSoft, fontSize: 13 }, children: "Geen gerechten gevonden. Voeg je eerste recept toe." }),
      bookMode === "mine" && /* @__PURE__ */ jsxs("div", { style: { marginTop: 16, display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxs(PrimaryButton, { onClick: onNew, full: true, children: [
          /* @__PURE__ */ jsx(Plus, { size: 16 }),
          " Nieuw recept"
        ] }),
        /* @__PURE__ */ jsxs(GhostButton, { onClick: onImport, children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 15 }),
          " Importeren"
        ] })
      ] })
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
        /* @__PURE__ */ jsx("div", { style: { width: 32, height: 32, borderRadius: 9, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }, children: entry.emoji || "\u{1F37D}\uFE0F" }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13.5, color: C.ink }, children: entry.recipeName }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkSoft, fontFamily: FONT_MONO }, children: [
            new Date(entry.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
            " \xB7 ",
            entry.servings,
            " pers.",
            counts[entry.recipeId] > 1 && ` \xB7 ${counts[entry.recipeId]}x gemaakt`
          ] })
        ] })
      ]
    },
    entry.id
  )) });
}
function RecipeDetail({ recipe, isMine = true, onBack, onToggleFav, onToggleCommunity, onEdit, onDelete, onCook, onDuplicate, onAddLeftover, inventory }) {
  const [confirmCook, setConfirmCook] = useState(false);
  const [leftoverPortions, setLeftoverPortions] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [servings, setServings] = useState(recipe.servings);
  const [screenAwake, setScreenAwake] = useState(false);
  const wakeLockRef = React.useRef(null);
  const wakeLockSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const requestWakeLock = async () => {
    if (!wakeLockSupported) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setScreenAwake(true);
      wakeLockRef.current.addEventListener("release", () => setScreenAwake(false));
    } catch (e) {
      setScreenAwake(false);
    }
  };
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (e) {
      }
      wakeLockRef.current = null;
    }
    setScreenAwake(false);
  };
  const toggleScreenAwake = () => {
    screenAwake ? releaseWakeLock() : requestWakeLock();
  };
  useEffect(() => {
    const handleVisibility = () => {
      if (screenAwake && document.visibilityState === "visible" && !wakeLockRef.current) requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      releaseWakeLock();
    };
  }, [screenAwake]);
  const scale = servings / recipe.servings;
  const scaledIngredients = recipe.ingredients.map((ing) => ({ ...ing, scaledAmount: round2(ing.amount * scale) }));
  const readiness = recipeReadiness(recipe, inventory, scale);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
      /* @__PURE__ */ jsxs("button", { onClick: onBack, style: { background: "none", border: "none", display: "flex", alignItems: "center", gap: 4, color: C.blue, cursor: "pointer", padding: 0, fontWeight: 600, fontSize: 13 }, children: [
        /* @__PURE__ */ jsx(ChevronLeft, { size: 16 }),
        " Terug"
      ] }),
      wakeLockSupported && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: toggleScreenAwake,
          title: screenAwake ? "Scherm blijft aan (keukenmodus)" : "Scherm aan houden tijdens koken",
          style: {
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            borderRadius: 20,
            cursor: "pointer",
            border: `1.5px solid ${screenAwake ? C.mustard : C.borderTint}`,
            background: screenAwake ? C.mustard : "#fff",
            color: screenAwake ? "#fff" : C.inkSoft
          },
          children: [
            /* @__PURE__ */ jsx(Sun, { size: 13 }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 11.5, fontWeight: 600 }, children: screenAwake ? "Scherm blijft aan" : "Keukenmodus" })
          ]
        }
      )
    ] }),
    !isMine && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, padding: "8px 10px", marginBottom: 10, fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsx(Users, { size: 13, color: C.blue }),
      " Gedeeld door een ander huishouden \u2014 bekijk, of dupliceer naar je eigen kookboek om aan te passen."
    ] }),
    /* @__PURE__ */ jsx(TileThumb, { recipe, size: "large" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }, children: [
      /* @__PURE__ */ jsx("h1", { style: { fontFamily: FONT_DISPLAY, fontSize: 23, fontWeight: 700, color: C.ink, margin: 0 }, children: recipe.name }),
      isMine && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0, marginLeft: 8 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: onToggleCommunity, title: recipe.community ? "Niet meer delen" : "Delen met community", style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Users, { size: 20, fill: recipe.community ? C.blue : "none", color: recipe.community ? C.blue : C.ceramicDark }) }),
        /* @__PURE__ */ jsx("button", { onClick: onToggleFav, style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Star, { size: 22, fill: recipe.favorite ? C.mustard : "none", color: recipe.favorite ? C.mustard : C.ceramicDark }) })
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
      readiness.tracked > 0 && (readiness.canMake ? /* @__PURE__ */ jsxs(Pill, { tone: "ok", children: [
        /* @__PURE__ */ jsx(Check, { size: 10 }),
        " Alles in huis"
      ] }) : /* @__PURE__ */ jsxs(Pill, { tone: "warn", children: [
        readiness.tracked - readiness.missing.length,
        "/",
        readiness.tracked,
        " in huis"
      ] }))
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: "8px 12px", marginBottom: 14 }, children: [
      /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, color: C.ink, display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx(Users, { size: 15, color: C.inkSoft }),
        " Aantal personen"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setServings((s) => Math.max(1, s - 1)), style: { width: 30, height: 30, borderRadius: 9, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx(Minus, { size: 14 }) }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 15, minWidth: 18, textAlign: "center" }, children: servings }),
        /* @__PURE__ */ jsx("button", { onClick: () => setServings((s) => s + 1), style: { width: 30, height: 30, borderRadius: 9, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx(Plus, { size: 14 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h3", { style: { fontFamily: FONT_DISPLAY, fontSize: 15, margin: "0 0 8px" }, children: "Ingredi\xEBnten" }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: scaledIngredients.map((ing, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "9px 12px", borderBottom: idx < scaledIngredients.length - 1 ? `1px solid ${C.ceramic}` : "none", fontSize: 13.5 }, children: [
      /* @__PURE__ */ jsx("span", { children: ing.name }),
      /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, color: C.inkSoft }, children: [
        ing.scaledAmount,
        " ",
        ing.unit
      ] })
    ] }, idx)) }),
    /* @__PURE__ */ jsx("h3", { style: { fontFamily: FONT_DISPLAY, fontSize: 15, margin: "0 0 8px" }, children: "Bereiding" }),
    /* @__PURE__ */ jsx("ol", { style: { padding: 0, margin: "0 0 18px", listStyle: "none" }, children: recipe.steps.map((s, idx) => /* @__PURE__ */ jsxs("li", { style: { display: "flex", gap: 10, marginBottom: 10, fontSize: 13.5, color: C.ink, lineHeight: 1.4 }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, color: C.mustardDeep, fontWeight: 600, flexShrink: 0 }, children: String(idx + 1).padStart(2, "0") }),
      /* @__PURE__ */ jsx("span", { children: s })
    ] }, idx)) }),
    recipe.notes && /* @__PURE__ */ jsxs("div", { style: { background: "#FBF3E3", border: `1px solid ${C.mustard}`, borderRadius: 14, padding: 12, marginBottom: 18, display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx(StickyNote, { size: 16, color: C.mustardDeep, style: { flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, fontWeight: 600, color: C.mustardDeep, marginBottom: 2 }, children: "Jouw notitie" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.ink, whiteSpace: "pre-wrap" }, children: recipe.notes })
      ] })
    ] }),
    isMine && confirmCook === false && /* @__PURE__ */ jsxs(PrimaryButton, { tone: "sage", full: true, onClick: () => setConfirmCook(true), children: [
      /* @__PURE__ */ jsx(Flame, { size: 16 }),
      " Ik heb dit gekookt"
    ] }),
    isMine && confirmCook === true && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.sage}`, borderRadius: 14, padding: 12 }, children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, margin: "0 0 10px", color: C.ink }, children: [
        "Dit verlaagt de voorraad (voor ",
        servings,
        " ",
        servings === 1 ? "persoon" : "personen",
        ") en vult de boodschappenlijst automatisch aan waar nodig. Doorgaan?"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx(PrimaryButton, { tone: "sage", onClick: () => {
          onCook(scale);
          setConfirmCook("leftover");
        }, children: "Ja, bijwerken" }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmCook(false), children: "Annuleren" })
      ] })
    ] }),
    isMine && confirmCook === "leftover" && /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.mustard}`, borderRadius: 14, padding: 12 }, children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, margin: "0 0 10px", color: C.ink }, children: "Is er iets van dit gerecht overgebleven?" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setLeftoverPortions((p) => Math.max(0, p - 1)), style: { width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }, children: /* @__PURE__ */ jsx(Minus, { size: 14 }) }),
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 15, minWidth: 90, textAlign: "center" }, children: leftoverPortions === 0 ? "Niets over" : `${leftoverPortions} portie${leftoverPortions > 1 ? "s" : ""}` }),
        /* @__PURE__ */ jsx("button", { onClick: () => setLeftoverPortions((p) => p + 1), style: { width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.borderTint}`, background: C.cardBg, cursor: "pointer" }, children: /* @__PURE__ */ jsx(Plus, { size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx(PrimaryButton, { tone: "mustard", onClick: () => {
          if (leftoverPortions > 0) onAddLeftover(recipe, leftoverPortions);
          setConfirmCook(false);
          setLeftoverPortions(0);
        }, children: leftoverPortions > 0 ? "Bewaren als kliekje" : "Klaar" }),
        leftoverPortions > 0 && /* @__PURE__ */ jsx(GhostButton, { onClick: () => {
          setConfirmCook(false);
          setLeftoverPortions(0);
        }, children: "Overslaan" })
      ] })
    ] }),
    !isMine && /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", full: true, onClick: onDuplicate, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Dupliceer naar mijn kookboek"
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 12 }, children: [
      isMine && /* @__PURE__ */ jsxs(GhostButton, { onClick: onEdit, children: [
        /* @__PURE__ */ jsx(Pencil, { size: 14 }),
        " Bewerken"
      ] }),
      isMine && /* @__PURE__ */ jsxs(GhostButton, { onClick: onDuplicate, children: [
        /* @__PURE__ */ jsx(Plus, { size: 14 }),
        " Dupliceer"
      ] }),
      isMine && (!confirmDelete ? /* @__PURE__ */ jsxs(GhostButton, { danger: true, onClick: () => setConfirmDelete(true), children: [
        /* @__PURE__ */ jsx(Trash2, { size: 14 }),
        " Verwijderen"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(GhostButton, { danger: true, onClick: onDelete, children: "Zeker weten" }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmDelete(false), children: "Annuleren" })
      ] }))
    ] })
  ] });
}
function RecipeForm({ initial, inventoryNames, onCancel, onSave }) {
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
  const updateStep = (idx, val) => setSteps(steps.map((s, i) => i === idx ? val : s));
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
    /* @__PURE__ */ jsx(Field, { label: "Naam", children: /* @__PURE__ */ jsx("input", { style: inputStyle, value: name, onChange: (e) => handleNameChange(e.target.value), placeholder: "Bijv. Groentecurry" }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: 70 }, children: /* @__PURE__ */ jsx(Field, { label: "Emoji", children: /* @__PURE__ */ jsx("input", { style: inputStyle, value: emoji, onChange: (e) => handleEmojiChange(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Foto-URL (optioneel)", children: /* @__PURE__ */ jsx("input", { style: inputStyle, value: photoUrl, onChange: (e) => setPhotoUrl(e.target.value), placeholder: "https://\u2026" }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Kooktijd (min)", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: cookTime, onChange: (e) => setCookTime(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Personen", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: servings, onChange: (e) => setServings(e.target.value) }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "10px 0 6px" }, children: "Ingredi\xEBnten" }),
    ingredients.map((ing, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6 }, children: [
      /* @__PURE__ */ jsx("input", { style: { ...inputStyle, flex: 2 }, list: "ing-names", placeholder: "Naam", value: ing.name, onChange: (e) => updateIng(idx, { name: e.target.value }) }),
      /* @__PURE__ */ jsx("input", { type: "number", style: { ...inputStyle, width: 64 }, placeholder: "Aantal", value: ing.amount, onChange: (e) => updateIng(idx, { amount: e.target.value }) }),
      /* @__PURE__ */ jsx("select", { style: { ...inputStyle, width: 90 }, value: ing.unit, onChange: (e) => updateIng(idx, { unit: e.target.value }), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }),
      /* @__PURE__ */ jsx("button", { onClick: () => setIngredients(ingredients.filter((_, i) => i !== idx)), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 16, color: C.inkSoft }) })
    ] }, idx)),
    /* @__PURE__ */ jsx("datalist", { id: "ing-names", children: inventoryNames.map((n) => /* @__PURE__ */ jsx("option", { value: n }, n)) }),
    /* @__PURE__ */ jsxs(GhostButton, { onClick: () => setIngredients([...ingredients, { name: "", amount: "", unit: "stuks" }]), children: [
      /* @__PURE__ */ jsx(Plus, { size: 14 }),
      " Ingredi\xEBnt"
    ] }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "16px 0 6px" }, children: "Bereidingsstappen" }),
    steps.map((s, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6 }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, color: C.mustardDeep, fontSize: 12, paddingTop: 10 }, children: String(idx + 1).padStart(2, "0") }),
      /* @__PURE__ */ jsx("textarea", { style: { ...inputStyle, flex: 1, minHeight: 40, resize: "vertical" }, value: s, onChange: (e) => updateStep(idx, e.target.value) }),
      /* @__PURE__ */ jsx("button", { onClick: () => setSteps(steps.filter((_, i) => i !== idx)), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 16, color: C.inkSoft }) })
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
          background: diets.includes(tag) ? C.sage : "#fff",
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
function WeekmenuView({ weekmenu, recipes, cooks, onPickDay, onPickCook, onClearDay, onGenerate, onAIGenerate, onDuplicate, onApplyTemplate, onShuffle, onOpenRecipe, onExportCalendar }) {
  const findRecipe = (id) => recipes.find((r) => r.id === id);
  const dayEntry = (day) => {
    const raw = weekmenu[day];
    if (!raw) return null;
    if (typeof raw === "string") return { recipeId: raw, cook: "" };
    return raw;
  };
  const plannedCount = WEEK_DAYS.filter((d) => dayEntry(d.key)?.recipeId).length;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.inkSoft, marginTop: 0 }, children: "Plan gerechten voor de week, wijs desgewenst iemand aan om te koken, en genereer in \xE9\xE9n keer de boodschappenlijst." }),
    /* @__PURE__ */ jsx("div", { style: { marginBottom: 14 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", full: true, onClick: onAIGenerate, children: [
      /* @__PURE__ */ jsx(Wand2, { size: 16 }),
      " AI: genereer weekmenu"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 14 }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: onDuplicate, children: [
        /* @__PURE__ */ jsx(Copy, { size: 13 }),
        " Dupliceer"
      ] }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: onApplyTemplate, children: [
        /* @__PURE__ */ jsx(CalendarDays, { size: 13 }),
        " Vorig weekmenu"
      ] }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onShuffle,
          title: "Shuffel de geplande gerechten door de dagen",
          style: { width: 42, background: C.cardBg, border: `1.5px solid ${C.blue}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
          children: /* @__PURE__ */ jsx(Shuffle, { size: 15, color: C.blue })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: onExportCalendar, children: [
      /* @__PURE__ */ jsx(CalendarClock, { size: 14 }),
      " Weekmenu naar agenda (.ics)"
    ] }) }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: WEEK_DAYS.map((day, idx) => {
      const entry = dayEntry(day.key);
      const recipe = entry?.recipeId ? findRecipe(entry.recipeId) : null;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          style: { padding: "10px 12px", borderBottom: idx < WEEK_DAYS.length - 1 ? `1px solid ${C.ceramic}` : "none" },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
              /* @__PURE__ */ jsx("div", { style: { width: 66, fontSize: 12, fontFamily: FONT_MONO, color: C.blueSoft, flexShrink: 0 }, children: day.label }),
              recipe ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    onClick: () => onOpenRecipe(recipe.id),
                    title: "Open dit recept",
                    style: { width: 30, height: 30, borderRadius: 9, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, cursor: "pointer" },
                    children: recipe.emoji || "\u{1F37D}\uFE0F"
                  }
                ),
                /* @__PURE__ */ jsx("div", { style: { flex: 1, fontSize: 13.5, color: C.ink, cursor: "pointer" }, onClick: () => onOpenRecipe(recipe.id), children: recipe.name }),
                /* @__PURE__ */ jsx("button", { onClick: () => onPickDay(day.key), title: "Ander recept kiezen", style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(Pencil, { size: 13, color: C.inkSoft }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => onClearDay(day.key), style: { background: "none", border: "none", cursor: "pointer" }, children: /* @__PURE__ */ jsx(X, { size: 15, color: C.inkSoft }) })
              ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => onPickDay(day.key), style: { flex: 1, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.inkSoft, fontSize: 13, cursor: "pointer", padding: "4px 0" }, children: [
                /* @__PURE__ */ jsx(Plus, { size: 14 }),
                " Kies een recept"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => onPickCook(day.key),
                style: {
                  marginLeft: 76,
                  marginTop: 6,
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
                  /* @__PURE__ */ jsx("span", { style: { fontSize: 11.5, color: entry?.cook ? C.blueDeep : C.inkSoft, fontWeight: entry?.cook ? 600 : 400 }, children: entry?.cook ? entry.cook : "Wie kookt?" })
                ]
              }
            )
          ]
        },
        day.key
      );
    }) }),
    /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", full: true, disabled: plannedCount === 0, onClick: onGenerate, children: [
      /* @__PURE__ */ jsx(ClipboardList, { size: 16 }),
      " Boodschappenlijst genereren voor deze week"
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
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.inkSoft, marginTop: 0 }, children: "Kies iemand uit het huishouden, of voeg een nieuwe naam toe." }),
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
            background: current === name ? C.blue : "#fff",
            color: current === name ? "#fff" : C.ink
          },
          children: name
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: () => onRemoveCook(name), title: "Verwijder uit lijst", style: { background: "none", border: "none", cursor: "pointer", padding: 2 }, children: /* @__PURE__ */ jsx(X, { size: 13, color: C.inkSoft }) })
    ] }, name)) }),
    /* @__PURE__ */ jsx(Field, { label: "Nieuwe naam toevoegen", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx("input", { style: inputStyle, placeholder: "Bijv. Pietje", value: newName, onChange: (e) => setNewName(e.target.value), onKeyDown: (e) => e.key === "Enter" && submitNew() }),
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
          padding: "5px 10px",
          borderRadius: 16,
          fontSize: 11,
          cursor: "pointer",
          border: `1.5px solid ${active.includes(tag) ? C.sage : C.borderTint}`,
          background: active.includes(tag) ? C.sage : "#fff",
          color: active.includes(tag) ? "#fff" : C.inkSoft
        },
        children: tag
      },
      tag
    )) })
  ] });
}
function SettingsModal({ household, members, preferences, cooks, onRename, onLogout, onOpenMagnet, onOpenTabletMode, onExportBackup, onToggleDarkMode, onMoveCategoryOrder, onUpdateCookDiets, onClose }) {
  const [name, setName] = useState(household?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const saveName = async () => {
    if (!onRename || !name.trim() || name.trim() === household?.name) return;
    setSavingName(true);
    try {
      await onRename(name.trim());
    } catch (e) {
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
    }
  };
  return /* @__PURE__ */ jsxs(Modal, { title: "Instellingen", onClose, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Naam van je huishouden" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("input", { style: inputStyle, value: name, onChange: (e) => setName(e.target.value), placeholder: "Bijv. Familie Jansen" }),
      /* @__PURE__ */ jsx(PrimaryButton, { onClick: saveName, disabled: savingName || !name.trim() || name.trim() === household?.name, children: savingName ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 16 }) : /* @__PURE__ */ jsx(Check, { size: 16 }) })
    ] }),
    household?.invite_code && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Uitnodigingscode voor huisgenoten" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: "10px 12px", marginBottom: 16 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 1, flex: 1 }, children: household.invite_code }),
        /* @__PURE__ */ jsx("button", { onClick: copyCode, style: { background: C.ceramic, border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }, children: /* @__PURE__ */ jsx(Copy, { size: 15, color: C.blueDeep }) })
      ] }),
      copied && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.sage, marginTop: -10, marginBottom: 14 }, children: "Gekopieerd!" })
    ] }),
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
          /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.ink }, children: [
            /* @__PURE__ */ jsx(Moon, { size: 15, color: C.blueDeep }),
            " Donkere modus"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { width: 40, height: 22, borderRadius: 20, background: preferences?.darkMode ? C.blue : C.ceramicDark, position: "relative", transition: "background 0.15s" }, children: /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 2, left: preferences?.darkMode ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.15s" } }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Volgorde boodschappenlijst" }),
    /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16 }, children: (preferences?.categoryOrder && preferences.categoryOrder.length === CATEGORIES.length ? preferences.categoryOrder : CATEGORIES).map((cat, idx, arr) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: idx < arr.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: C.ink, flex: 1 }, children: cat }),
      /* @__PURE__ */ jsx("button", { onClick: () => onMoveCategoryOrder(cat, -1), disabled: idx === 0, style: { background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, padding: 4 }, children: /* @__PURE__ */ jsx(ChevronUp, { size: 15, color: C.inkSoft }) }),
      /* @__PURE__ */ jsx("button", { onClick: () => onMoveCategoryOrder(cat, 1), disabled: idx === arr.length - 1, style: { background: "none", border: "none", cursor: idx === arr.length - 1 ? "default" : "pointer", opacity: idx === arr.length - 1 ? 0.3 : 1, padding: 4 }, children: /* @__PURE__ */ jsx(ChevronDown, { size: 15, color: C.inkSoft }) })
    ] }, cat)) }),
    cooks && cooks.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, margin: "0 0 8px" }, children: "Dieetwensen & allergie\xEBn" }),
      /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, padding: "4px 12px" }, children: cooks.map((cookName) => /* @__PURE__ */ jsx(CookDietRow, { name: cookName, preferences, onUpdate: onUpdateCookDiets }, cookName)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, borderRadius: 14, border: `1.5px solid ${C.borderTint}`, marginBottom: 16, overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onOpenMagnet,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(Printer, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 13.5, color: C.ink }, children: "Koelkastmagneet printen" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onOpenTabletMode,
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 12px", background: "none", border: "none", borderBottom: `1px solid ${C.ceramic}`, cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsx(ScanLine, { size: 16, color: C.blueDeep }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 13.5, color: C.ink }, children: "Tabletmodus starten" })
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
            /* @__PURE__ */ jsx("span", { style: { fontSize: 13.5, color: C.ink }, children: "Backup downloaden" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.ceramic}` }, children: !confirmLogout ? /* @__PURE__ */ jsxs(GhostButton, { danger: true, onClick: () => setConfirmLogout(true), children: [
      /* @__PURE__ */ jsx(LogOut, { size: 14 }),
      " Uitloggen"
    ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx(GhostButton, { danger: true, onClick: onLogout, children: "Zeker weten, uitloggen" }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: () => setConfirmLogout(false), children: "Annuleren" })
    ] }) })
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
        /* @__PURE__ */ jsx("span", { style: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19 }, children: "Pollepel \u2014 Tabletmodus" })
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
            ref: inputRef,
            value: code,
            onChange: (e) => setCode(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") handleScan(code);
            },
            inputMode: "numeric",
            autoFocus: true,
            style: { width: "100%", maxWidth: 380, fontSize: 26, textAlign: "center", padding: "18px", borderRadius: 18, border: "none", fontFamily: FONT_MONO },
            placeholder: "000000000000"
          }
        )
      ] }),
      phase === "found" && matchedItem && /* @__PURE__ */ jsxs("div", { style: { width: "100%", maxWidth: 440, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 27, fontWeight: 700, marginBottom: 6 }, children: matchedItem.name }),
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
        /* @__PURE__ */ jsx("input", { style: { ...inputStyle, marginBottom: 10, fontSize: 16 }, placeholder: "Productnaam", value: newName, onChange: (e) => setNewName(e.target.value) }),
        /* @__PURE__ */ jsx("select", { style: { ...inputStyle, marginBottom: 10, fontSize: 16 }, value: newCategory, onChange: (e) => setNewCategory(e.target.value), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }),
        /* @__PURE__ */ jsx("select", { style: { ...inputStyle, marginBottom: 18, fontSize: 16 }, value: newUnit, onChange: (e) => setNewUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }),
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
        /* @__PURE__ */ jsx(CheckCircle2, { size: 68, color: doneTone === "sage" ? C.sage : C.mustard, style: { marginBottom: 18 } }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 21, fontWeight: 700, maxWidth: 380 }, children: doneMsg })
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
function RecipePickerModal({ recipes, onPick, onClose }) {
  const [query, setQuery] = useState("");
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  return /* @__PURE__ */ jsxs(Modal, { title: "Kies een recept", onClose, children: [
    /* @__PURE__ */ jsxs("div", { style: { position: "relative", marginBottom: 10 }, children: [
      /* @__PURE__ */ jsx(Search, { size: 15, color: C.inkSoft, style: { position: "absolute", left: 10, top: 11 } }),
      /* @__PURE__ */ jsx("input", { style: { ...inputStyle, paddingLeft: 30 }, placeholder: "Zoek een gerecht\u2026", value: query, onChange: (e) => setQuery(e.target.value), autoFocus: true })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { maxHeight: 340, overflowY: "auto" }, children: [
      filtered.map((r) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onPick(r.id),
          style: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 12, padding: "8px 10px", marginBottom: 8, cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsx("div", { style: { width: 32, height: 32, borderRadius: 9, background: C.ceramic, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }, children: r.emoji || "\u{1F37D}\uFE0F" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13.5, color: C.ink, fontWeight: 500 }, children: r.name }),
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
function getExpirySuggestions(inventory, recipes) {
  return inventory.filter((item) => item.expiryDate).map((item) => ({ item, daysLeft: daysUntil(item.expiryDate) })).filter(({ daysLeft }) => daysLeft !== null && daysLeft <= 3).map(({ item, daysLeft }) => ({
    item,
    daysLeft,
    recipes: recipes.filter((r) => r.ingredients.some((ing) => namesMatch(ing.name, item.name) && ing.unit === item.unit))
  })).sort((a, b) => a.daysLeft - b.daysLeft);
}
function VoorraadView({ inventory, recipes, categories, onEdit, onNew, onDelete, onScan, onOpenRecipe }) {
  const cats = categories && categories.length ? categories : CATEGORIES;
  const byCategory = useMemo(() => {
    const map = {};
    cats.forEach((c) => map[c] = []);
    inventory.forEach((i) => {
      (map[i.category] || (map[i.category] = [])).push(i);
    });
    return map;
  }, [inventory, cats]);
  const expirySuggestions = useMemo(() => getExpirySuggestions(inventory, recipes), [inventory, recipes]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.inkSoft, marginTop: 0 }, children: "Stel per ingredi\xEBnt een minimum en maximum in. Zodra de voorraad onder het minimum komt, verschijnt het automatisch op de boodschappenlijst." }),
    expirySuggestions.length > 0 && /* @__PURE__ */ jsxs("div", { style: { background: "#FBF3E3", border: `1.5px solid ${C.mustard}`, borderRadius: 16, padding: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }, children: [
        /* @__PURE__ */ jsx(CalendarClock, { size: 15, color: C.mustardDeep }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, fontWeight: 700, color: C.mustardDeep }, children: "Bijna over de datum" })
      ] }),
      expirySuggestions.map(({ item, daysLeft, recipes: matches }) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.ink }, children: [
          /* @__PURE__ */ jsx("strong", { children: item.name }),
          " ",
          daysLeft < 0 ? "is al verlopen" : daysLeft === 0 ? "is vandaag over de datum" : `is over ${daysLeft} dag${daysLeft > 1 ? "en" : ""} over de datum`
        ] }),
        matches.length > 0 ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }, children: [
          /* @__PURE__ */ jsxs("span", { style: { fontSize: 11.5, color: C.inkSoft }, children: [
            "Maak ",
            daysLeft <= 0 ? "vandaag" : "op tijd",
            ":"
          ] }),
          matches.slice(0, 3).map((r) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => onOpenRecipe && onOpenRecipe(r.id),
              style: { background: C.cardBg, border: `1px solid ${C.mustard}`, borderRadius: 20, padding: "3px 10px", fontSize: 11.5, color: C.mustardDeep, fontWeight: 600, cursor: "pointer" },
              children: [
                r.emoji || "\u{1F37D}\uFE0F",
                " ",
                r.name
              ]
            },
            r.id
          ))
        ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 }, children: "Geen recept in je kookboek met dit ingredi\xEBnt." })
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
    cats.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.blueSoft, marginBottom: 6, textTransform: "uppercase" }, children: cat }),
        /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }, children: items.map((item, idx) => {
          const low = item.current < item.min;
          const expDays = item.expiryDate ? daysUntil(item.expiryDate) : null;
          return /* @__PURE__ */ jsxs("div", { onClick: () => onEdit(item), style: { padding: "10px 12px", borderBottom: idx < items.length - 1 ? `1px solid ${C.ceramic}` : "none", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxs("span", { style: { fontSize: 13.5, color: C.ink, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }, children: [
                item.name,
                item.onSale && /* @__PURE__ */ jsx(Tag, { size: 12, color: C.mustardDeep })
              ] }),
              low && /* @__PURE__ */ jsx(AlertTriangle, { size: 14, color: C.brick })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 4 }, children: [
              /* @__PURE__ */ jsxs("span", { style: { fontFamily: FONT_MONO, fontSize: 11.5, color: low ? C.brick : C.inkSoft }, children: [
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
function InventoryForm({ initial, onCancel, onSave }) {
  const [name, setName] = useState(initial.name || "");
  const [category, setCategory] = useState(initial.category || CATEGORIES[0]);
  const [unit, setUnit] = useState(initial.unit || "stuks");
  const [current, setCurrent] = useState(initial.current ?? "");
  const [min, setMin] = useState(initial.min ?? "");
  const [max, setMax] = useState(initial.max ?? "");
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
    !initial.id && searchError && !searching && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: -8, marginBottom: 12 }, children: searchError }),
    !initial.id && !searchError && /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: C.inkSoft, marginTop: -8, marginBottom: 12 }, children: "Productsuggesties komen uit Open Food Facts, een open database met o.a. veel Nederlandse supermarktproducten." }),
    /* @__PURE__ */ jsx(Field, { label: "Categorie", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: category, onChange: (e) => setCategory(e.target.value), children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
    /* @__PURE__ */ jsx(Field, { label: "Eenheid", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: unit, onChange: (e) => setUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Huidige voorraad", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: current, onChange: (e) => setCurrent(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Minimum", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: min, onChange: (e) => setMin(e.target.value) }) }) }),
      /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Maximum", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: max, onChange: (e) => setMax(e.target.value) }) }) })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Barcode (optioneel, voor scannen)", children: /* @__PURE__ */ jsx("input", { style: inputStyle, value: barcode, onChange: (e) => setBarcode(e.target.value), placeholder: "Bijv. 8710400123456" }) }),
    /* @__PURE__ */ jsx(Field, { label: "Houdbaar tot (THT, optioneel)", children: /* @__PURE__ */ jsx("input", { type: "date", style: inputStyle, value: expiryDate, onChange: (e) => setExpiryDate(e.target.value) }) }),
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
          background: onSale ? "#FBF3E3" : "#fff",
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
          onClick: () => onSave({ ...initial, name: name.trim(), category, unit, current: Number(current), min: Number(min), max: Number(max), barcode: barcode.trim(), expiryDate, onSale }),
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
function BoodschappenView({ list, categories, onToggle, onRemove, onAddManual, onProcess }) {
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
    return map;
  }, [list, cats]);
  const checkedCount = list.filter((i) => i.checked).length;
  const submitManual = () => {
    if (!newName.trim() || newAmount === "") return;
    onAddManual({ name: newName.trim(), amount: Number(newAmount), unit: newUnit, category: newCategory });
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
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
      /* @__PURE__ */ jsxs(GhostButton, { onClick: shareList, children: [
        /* @__PURE__ */ jsx(Share2, { size: 14 }),
        " Lijst delen / kopi\xEBren"
      ] }),
      shareMsg && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 6 }, children: shareMsg })
    ] }),
    cats.map((cat) => {
      const items = byCategory[cat];
      if (!items || !items.length) return null;
      return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color: C.blueSoft, marginBottom: 6, textTransform: "uppercase" }, children: cat }),
        /* @__PURE__ */ jsx("div", { style: { background: C.cardBg, borderRadius: 16, border: `1.5px solid ${C.borderTint}` }, children: items.map((item, idx) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: idx < items.length - 1 ? `1px solid ${C.ceramic}` : "none" }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => onToggle(item.id), style: {
            width: 20,
            height: 20,
            borderRadius: 5,
            border: `1.5px solid ${item.checked ? C.sage : C.ceramicDark}`,
            background: item.checked ? C.sage : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0
          }, children: item.checked && /* @__PURE__ */ jsx(Check, { size: 13, color: "#fff" }) }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1, textDecoration: item.checked ? "line-through" : "none", opacity: item.checked ? 0.55 : 1 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13.5, color: C.ink }, children: item.name }),
            /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT_MONO, fontSize: 11, color: C.inkSoft }, children: [
              item.amount,
              " ",
              item.unit
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
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.inkSoft, marginTop: 0 }, children: "Plak een receptlink, plak tekst, of maak/upload een foto \u2014 Pollepel zet het om naar het juiste format. Je krijgt het resultaat daarna te zien om te controleren voordat het wordt opgeslagen." }),
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
            background: mode === "url" ? C.blue : "#fff",
            color: mode === "url" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 12.5,
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
            background: mode === "text" ? C.blue : "#fff",
            color: mode === "text" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 12.5,
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
            background: mode === "photo" ? C.blue : "#fff",
            color: mode === "photo" ? "#fff" : C.ink,
            fontWeight: 600,
            fontSize: 12.5,
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
    mode === "url" && /* @__PURE__ */ jsx(Field, { label: "Link naar het recept", children: /* @__PURE__ */ jsx("input", { style: inputStyle, placeholder: "https://voorbeeld.nl/recept/spaghetti", value: url, onChange: (e) => setUrl(e.target.value) }) }),
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
      /* @__PURE__ */ jsx("input", { ref: cameraInputRef, type: "file", accept: "image/*", capture: "environment", onChange: handlePhotoSelected, style: { display: "none" } }),
      /* @__PURE__ */ jsx("input", { ref: galleryInputRef, type: "file", accept: "image/*", onChange: handlePhotoSelected, style: { display: "none" } }),
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
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(PrimaryButton, { full: true, onClick: () => cameraInputRef.current && cameraInputRef.current.click(), children: [
          /* @__PURE__ */ jsx(Camera, { size: 15 }),
          " Foto maken"
        ] }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxs(GhostButton, { onClick: () => galleryInputRef.current && galleryInputRef.current.click(), children: [
          /* @__PURE__ */ jsx(ImagePlus, { size: 15 }),
          " Uploaden"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: -2 }, children: "Zorg dat de tekst scherp en volledig in beeld is \u2014 bijv. een kookboekpagina, uitprint of handgeschreven kaart." })
    ] }),
    mode === "url" && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: -6 }, children: 'Sommige sites blokkeren automatisch ophalen \u2014 lukt het niet, kopieer dan de tekst en gebruik "Tekst".' }),
    error && /* @__PURE__ */ jsxs("div", { style: { background: "#F1DCC9", border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 12.5, color: C.brick, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 14, style: { flexShrink: 0, marginTop: 1 } }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 6 }, children: [
      /* @__PURE__ */ jsxs(PrimaryButton, { tone: "mustard", disabled: !canSubmit || importing, onClick: handleSubmit, children: [
        importing ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 16 }) : /* @__PURE__ */ jsx(Sparkles, { size: 16 }),
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
    /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.inkSoft, marginTop: 0 }, children: "Pollepel bedenkt per dag een avondeten (geen ontbijt of lunch) en houdt rekening met overlappende ingredi\xEBnten tussen de gerechten, zodat je boodschappenlijst compacter en scherper wordt." }),
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
          background: styleId === s.id ? C.blue : "#fff",
          color: styleId === s.id ? "#fff" : C.ink
        },
        children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 18, marginBottom: 3 }, children: s.icon }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 600 }, children: s.label })
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
            fontSize: 12.5,
            fontWeight: 600,
            border: `1.5px solid ${scope === "empty" ? C.blue : C.borderTint}`,
            background: scope === "empty" ? C.blue : "#fff",
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
            fontSize: 12.5,
            fontWeight: 600,
            border: `1.5px solid ${scope === "all" ? C.blue : C.borderTint}`,
            background: scope === "all" ? C.blue : "#fff",
            color: scope === "all" ? "#fff" : C.ink
          },
          children: "Hele week (overschrijven)"
        }
      )
    ] }),
    generating && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 12, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsx(Loader2, { className: "animate-spin", size: 16, color: C.blue }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: 12.5, color: C.ink }, children: progress || "Bezig\u2026" })
    ] }),
    error && !generating && /* @__PURE__ */ jsxs("div", { style: { background: "#F1DCC9", border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 12.5, color: C.brick, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }, children: [
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
  const streamRef = React.useRef(null);
  const supported = typeof window !== "undefined" && "BarcodeDetector" in window;
  const [phase, setPhase] = useState("manual");
  const [code, setCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [offName, setOffName] = useState("");
  const [amount, setAmount] = useState(1);
  const [doneMsg, setDoneMsg] = useState("");
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
    if (!supported || phase !== "scanning") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setCameraError("Geen toegang tot de camera in dit venster (dit gebeurt vaker binnen ingebedde app-schermen). Gebruik de handmatige invoer hieronder.");
        setPhase("manual");
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [supported, phase]);
  useEffect(() => {
    if (!supported || phase !== "scanning") return;
    let active = true;
    let detector;
    try {
      detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"] });
    } catch (e) {
      setPhase("manual");
      return;
    }
    const timer = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (active && codes && codes.length) {
          handleDetected(codes[0].rawValue);
        }
      } catch (e) {
      }
    }, 350);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [supported, phase]);
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
    setCode(c);
    setAmount(1);
    setPhase("found");
    const match = inventory.find((i) => i.barcode && i.barcode === c);
    if (!match) lookupProductName(c);
  };
  const backToScan = () => {
    setCode("");
    setOffName("");
    setNewName("");
    setDoneMsg("");
    setPhase("manual");
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
    phase === "scanning" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "3/4" }, children: [
        /* @__PURE__ */ jsx("video", { ref: videoRef, muted: true, playsInline: true, style: { width: "100%", height: "100%", objectFit: "cover" } }),
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", inset: "30% 10%", border: `2px solid ${C.mustard}`, borderRadius: 14, boxShadow: "0 0 0 999px rgba(0,0,0,0.25)" } })
      ] }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 12.5, color: C.inkSoft, textAlign: "center", margin: "10px 0" }, children: [
        /* @__PURE__ */ jsx(ScanLine, { size: 14, style: { verticalAlign: -2, marginRight: 4 } }),
        "Richt de camera op de barcode van het product."
      ] }),
      /* @__PURE__ */ jsx(GhostButton, { onClick: () => setPhase("manual"), children: "Terug naar handmatig invoeren" })
    ] }),
    phase === "manual" && /* @__PURE__ */ jsxs("div", { children: [
      cameraError && /* @__PURE__ */ jsx("div", { style: { background: "#F1DCC9", border: `1px solid ${C.brick}`, borderRadius: 12, padding: "8px 10px", fontSize: 12.5, color: C.brick, marginBottom: 10 }, children: cameraError }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 12.5, color: C.inkSoft, marginTop: 0 }, children: "Voer de barcode in (de cijfers onder de streepjescode op de verpakking)." }),
      /* @__PURE__ */ jsx(Field, { label: "Barcode", children: /* @__PURE__ */ jsx("input", { style: inputStyle, value: manualCode, onChange: (e) => setManualCode(e.target.value), placeholder: "Bijv. 8710400123456", inputMode: "numeric", autoFocus: true }) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs(PrimaryButton, { disabled: !manualCode.trim(), onClick: () => handleDetected(manualCode.trim()), children: [
          /* @__PURE__ */ jsx(Search, { size: 16 }),
          " Opzoeken"
        ] }),
        supported && /* @__PURE__ */ jsxs(GhostButton, { onClick: () => {
          setCameraError("");
          setPhase("scanning");
        }, children: [
          /* @__PURE__ */ jsx(Camera, { size: 14 }),
          " Camera proberen"
        ] })
      ] }),
      !supported && /* @__PURE__ */ jsx("p", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 10 }, children: "Automatisch scannen met de camera wordt niet ondersteund door dit toestel/deze browser \u2014 handmatig invoeren werkt overal." })
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
      /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsx(GhostButton, { onClick: backToScan, children: "Andere barcode scannen" }) })
    ] }),
    phase === "found" && !matchedItem && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, color: C.ink, marginTop: 0 }, children: [
        "Onbekende barcode (",
        code,
        "). ",
        lookupLoading ? "Productnaam opzoeken\u2026" : offName ? "Gevonden via Open Food Facts:" : "Niet gevonden \u2014 vul zelf de gegevens in:"
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Naam", children: /* @__PURE__ */ jsx("input", { style: inputStyle, value: newName, onChange: (e) => setNewName(e.target.value), placeholder: lookupLoading ? "Bezig met zoeken\u2026" : "Productnaam" }) }),
      /* @__PURE__ */ jsx(Field, { label: "Categorie", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: newCategory, onChange: (e) => {
        setNewCategory(e.target.value);
        setCategoryTouched(true);
      }, children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c)) }) }),
      /* @__PURE__ */ jsx(Field, { label: "Eenheid", children: /* @__PURE__ */ jsx("select", { style: inputStyle, value: newUnit, onChange: (e) => setNewUnit(e.target.value), children: UNITS.map((u) => /* @__PURE__ */ jsx("option", { value: u, children: u }, u)) }) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Huidige voorraad", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: newCurrent, onChange: (e) => setNewCurrent(e.target.value) }) }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Minimum", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: newMin, onChange: (e) => setNewMin(e.target.value) }) }) }),
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(Field, { label: "Maximum", children: /* @__PURE__ */ jsx("input", { type: "number", style: inputStyle, value: newMax, onChange: (e) => setNewMax(e.target.value) }) }) })
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
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13.5, color: C.ink }, children: doneMsg }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }, children: [
        /* @__PURE__ */ jsxs(PrimaryButton, { onClick: backToScan, children: [
          /* @__PURE__ */ jsx(ScanLine, { size: 16 }),
          " Nog een product scannen"
        ] }),
        /* @__PURE__ */ jsx(GhostButton, { onClick: onClose, children: "Klaar" })
      ] })
    ] })
  ] });
}
function ManualAddForm({ newName, setNewName, newAmount, setNewAmount, newUnit, setNewUnit, newCategory, setNewCategory, onCategoryTouched, submitManual, onCancel }) {
  return /* @__PURE__ */ jsxs("div", { style: { background: C.cardBg, border: `1.5px solid ${C.borderTint}`, borderRadius: 14, padding: 10, marginTop: 8 }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6 }, children: [
      /* @__PURE__ */ jsx("input", { style: { ...inputStyle, flex: 1 }, placeholder: "Naam", value: newName, onChange: (e) => setNewName(e.target.value) }),
      /* @__PURE__ */ jsx("input", { type: "number", style: { ...inputStyle, width: 64 }, placeholder: "Aantal", value: newAmount, onChange: (e) => setNewAmount(e.target.value) })
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
export {
  App as default
};
