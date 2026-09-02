// Pollepel — serverless tussenlaag voor AI-aanroepen.
// Houdt de Anthropic API-sleutel veilig aan de serverkant (nooit zichtbaar voor de browser
// of in de broncode). De app roept dit endpoint aan in plaats van rechtstreeks Anthropic.
//
// Vereist: omgevingsvariabele ANTHROPIC_API_KEY, in te stellen via
// Netlify → Project configuration → Environment variables.
//
// Kostenbeheersing, in drie lagen:
//  1. Geldige login vereist (Supabase-sessietoken van een echt Pollepel-account).
//  2. Limiet per gebruiker: 30 aanroepen per uur, 150 per dag. Bijgehouden in de
//     database, want een serverless functie onthoudt zelf niets tussen aanroepen door.
//  3. Model en max_tokens worden hier vastgezet. De browser bepaalde die eerder zelf,
//     waardoor iemand met een geldig account een veel duurder verzoek kon sturen.

const SUPABASE_URL = "https://ucevkzircawpapsrywfv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_t0F12XeC1bPLzmZgvLWUeQ_CPat-lMn";

const TOEGESTAAN_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 2048;
const MAX_VERZOEK_BYTES = 200 * 1024; // ruim genoeg voor een recept met foto-tekst

function json(inhoud, status) {
  return new Response(JSON.stringify(inhoud), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Controleert de login en geeft het gebruikers-id terug.
async function getUser(authHeader) {
  if (!authHeader.startsWith("Bearer ")) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_ANON_KEY },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user && user.id ? user : null;
  } catch (e) {
    return null;
  }
}

// Telt de aanroep mee en zegt of hij nog binnen de limiet valt.
async function binnenLimiet(authHeader) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_and_log_ai_usage`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      // Kan de teller niet worden bijgewerkt, dan laten we het verzoek door:
      // de app onbruikbaar maken door een storing in de telling is erger.
      console.error("Verbruikstelling mislukt:", res.status);
      return { toegestaan: true };
    }
    return await res.json();
  } catch (e) {
    console.error("Verbruikstelling onbereikbaar:", e.message);
    return { toegestaan: true };
  }
}

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Alleen POST-verzoeken toegestaan." }, 405);
  }

  const authHeader = req.headers.get("authorization") || "";
  const user = await getUser(authHeader);
  if (!user) {
    return json({ error: "Niet ingelogd — dit endpoint is alleen voor ingelogde Pollepel-gebruikers." }, 401);
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json({ error: "Geen ANTHROPIC_API_KEY ingesteld op de server." }, 500);
  }

  const ruweTekst = await req.text();
  if (ruweTekst.length > MAX_VERZOEK_BYTES) {
    return json({ error: "Verzoek te groot." }, 413);
  }

  let body;
  try {
    body = JSON.parse(ruweTekst);
  } catch (e) {
    return json({ error: "Ongeldig verzoek (geen geldige JSON)." }, 400);
  }

  const limiet = await binnenLimiet(authHeader);
  if (!limiet.toegestaan) {
    const melding = limiet.reden === "uurlimiet"
      ? "Je hebt de AI-hulp dit uur veel gebruikt. Probeer het over een uur opnieuw."
      : "Je hebt de AI-hulp vandaag veel gebruikt. Morgen kun je weer verder.";
    return json({ error: melding, reden: limiet.reden }, 429);
  }

  // Model en omvang liggen hier vast; wat de browser meestuurt telt niet mee.
  const veiligBody = {
    ...body,
    model: TOEGESTAAN_MODEL,
    max_tokens: Math.min(Number(body.max_tokens) || MAX_TOKENS, MAX_TOKENS),
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(veiligBody),
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return json({ error: "Kon Anthropic niet bereiken: " + e.message }, 502);
  }
};

export const config = {
  path: "/api/ask-claude",
};
