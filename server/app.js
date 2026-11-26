import express from "express";
import cors from "cors";
import evaluateRoutes from "./routes/evaluateRoutes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      maxAge: 86400,
    }),
  );
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      service: "PranaSync evaluation engine",
      status: "ok",
      stateless: true,
      database: false,
      ai: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ? "gemini" : "deterministic-fallback",
      weather: "open-meteo (keyless)",
      version: "1.0.0",
      time: new Date().toISOString(),
    });
  });

  app.use("/api", evaluateRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((error, _req, res, _next) => {
    if (error?.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Malformed JSON body" });
    }
    return res.status(500).json({ error: "Unexpected server error" });
  });

  return app;
}
