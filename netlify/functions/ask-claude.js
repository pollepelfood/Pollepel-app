// Pollepel — serverless tussenlaag voor AI-aanroepen.
// Houdt de Anthropic API-sleutel veilig aan de serverkant (nooit zichtbaar voor de browser
// of in de broncode). De app roept dit endpoint aan in plaats van rechtstreeks Anthropic.
//
// Vereist: omgevingsvariabele ANTHROPIC_API_KEY, in te stellen via
// Netlify → Project configuration → Environment variables.
//
// Beveiliging: dit endpoint eist een geldig, actief inlogbewijs (Supabase-sessietoken) van
// een echt Pollepel-account. Zonder geldige login wordt het verzoek geweigerd, vóórdat er
// iets naar Anthropic (en dus jouw tegoed) wordt doorgestuurd.

const SUPABASE_URL = "https://ucevkzircawpapsrywfv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_t0F12XeC1bPLzmZgvLWUeQ_CPat-lMn";

async function isAuthenticated(req) {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_ANON_KEY },
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Alleen POST-verzoeken toegestaan." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!(await isAuthenticated(req))) {
    return new Response(JSON.stringify({ error: "Niet ingelogd — dit endpoint is alleen voor ingelogde Pollepel-gebruikers." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Geen ANTHROPIC_API_KEY ingesteld op de server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Ongeldig verzoek (geen geldige JSON)." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Kon Anthropic niet bereiken: " + e.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/ask-claude",
};
