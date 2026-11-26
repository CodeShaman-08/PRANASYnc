import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    service: "PranaSync evaluation engine",
    status: "ok",
    stateless: true,
    database: false,
    ai: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ? "gemini" : "deterministic-fallback",
    weather: "open-meteo (keyless)",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
}
