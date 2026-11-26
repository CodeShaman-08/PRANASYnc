import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 4001);
const app = createApp();

app.listen(port, () => {
  const ai = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ? "Gemini 2.5 Flash" : "deterministic fallback";
  console.log(`PranaSync engine listening on :${port}`);
  console.log(`  AI provider : ${ai}`);
  console.log(`  Weather     : Open-Meteo (keyless)`);
  console.log(`  Persistence : none (stateless)`);
});
