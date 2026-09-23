# CopagoPA — Estimador agéntico de copago (Reto 3)
Web (HTML/JS) + función serverless que usa Claude para el triaje de síntomas. El copago lo calcula `motor.js` (determinista), nunca el LLM.

- `asistente.html`: chat guiado (síntoma → especialidad con Claude → plan → provincia → ranking de hospitales con desglose).
- `api/clasificar.js`: llama a la API de Anthropic. Requiere la variable `ANTHROPIC_API_KEY`.
- Si la IA no responde, el asistente usa el clasificador local por palabras clave.
- Datos ficticios. Es una estimación, no garantía de cobertura ni diagnóstico.

## Despliegue (Vercel)
1. Importar este repo en vercel.com.
2. Environment Variables: `ANTHROPIC_API_KEY`.
3. Deploy.
