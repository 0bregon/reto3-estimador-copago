// Función serverless (Vercel). La API key vive en la variable de entorno GEMINI_API_KEY.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "método no permitido" });
  const { texto, especialidades } = req.body || {};
  if (typeof texto !== "string" || !texto.trim() || texto.length > 300 || !Array.isArray(especialidades))
    return res.status(400).json({ error: "entrada inválida" });
  const lista = especialidades.slice(0, 40).map(e => `${e.id}: ${e.nombre}`).join("\n");
  const sistema = `Eres un asistente de orientación (triaje) en español. NUNCA diagnostiques. Responde SOLO un JSON: {"urgencia":boolean,"especialidad":"<id de la lista o null>","alternativas":["<id>"],"razon":"máx 20 palabras"}. urgencia=true si hay dolor de pecho, dificultad para respirar, sangrado abundante, pérdida de conciencia, ideas suicidas u otra emergencia. Usa solo ids de esta lista:\n${lista}`;
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: "user", parts: [{ text: texto }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 } }
      })
    });
    const data = await r.json();
    const t = data.candidates[0].content.parts.map(p => p.text || "").join("").replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(t));
  } catch (e) {
    return res.status(502).json({ error: "no se pudo clasificar" });
  }
};
