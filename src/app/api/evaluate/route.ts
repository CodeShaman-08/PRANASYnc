import { NextResponse } from "next/server";
import { evaluateRequestSchema, formatZodError } from "@server/schema";
import { getEnvironment, composeSimulatedEnvironment } from "@server/services/openMeteo";
import { computeVikriti } from "@server/services/doshaFusion";
import { getAdvice } from "@server/services/aiAdvisor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON body" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = evaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid evaluation payload", issues: formatZodError(parsed.error) },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const { prakriti, lat, lon, biometrics, overrideWeather, profileName } = parsed.data;

  try {
    const environment = overrideWeather
      ? composeSimulatedEnvironment(overrideWeather, { lat, lon })
      : await getEnvironment({ lat, lon });

    const fusion = computeVikriti({ prakriti, biometrics, environment });
    const advisor = await getAdvice({ result: fusion, environment });

    return NextResponse.json(
      {
        profileName: profileName || "Seeker",
        generatedAt: new Date().toISOString(),
        environment,
        ...fusion,
        advisor,
        engine: {
          fusion: "doshaFusion/v1",
          weather: environment.source,
          advisor: advisor.source,
          advisorModel: advisor.model,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Evaluation engine failed",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
