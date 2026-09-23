// Función serverless (Vercel). La API key vive en la variable de entorno ANTHROPIC_API_KEY.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "método no permitido" });
  const { texto, especialidades } = req.body || {};
  if (typeof texto !== "string" || !texto.trim() || texto.length > 300 || !Array.isArray(especialidades))
    return res.status(400).json({ error: "entrada inválida" });
  const lista = especialidades.slice(0, 40).map(e => `${e.id}: ${e.nombre}`).join("\n");
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-5", max_tokens: 300,
        system: `Eres un asistente de orientación (triaje) en español. NUNCA diagnostiques. Responde SOLO un JSON sin texto extra: {"urgencia":boolean,"especialidad":"<id de la lista o null>","alternativas":["<id>"],"razon":"máx 20 palabras"}. urgencia=true si hay dolor de pecho, dificultad para respirar, sangrado abundante, pérdida de conciencia, ideas suicidas u otra emergencia. Usa solo ids de esta lista:\n${lista}`,
        messages: [{ role: "user", content: texto }]
      })
    });
    const data = await r.json();
    const t = (data.content || []).map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(t));
  } catch (e) {
    return res.status(502).json({ error: "no se pudo clasificar" });
  }
};
