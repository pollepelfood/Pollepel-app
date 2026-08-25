// Pollepel — serverless tussenlaag voor AI-aanroepen.
// Houdt de Anthropic API-sleutel veilig aan de serverkant (nooit zichtbaar voor de browser
// of in de broncode). De app roept dit endpoint aan in plaats van rechtstreeks Anthropic.
//
// Vereist: omgevingsvariabele ANTHROPIC_API_KEY, in te stellen via
// Netlify → Project configuration → Environment variables.

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Alleen POST-verzoeken toegestaan." }), {
      status: 405,
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
