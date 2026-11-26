import { Router } from "express";
import { evaluateRequestSchema, formatZodError } from "../schema.js";
import { getEnvironment, composeSimulatedEnvironment } from "../services/openMeteo.js";
import { computeVikriti } from "../services/doshaFusion.js";
import { getAdvice } from "../services/aiAdvisor.js";

const router = Router();

router.post("/evaluate", async (req, res) => {
  const parsed = evaluateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid evaluation payload",
      issues: formatZodError(parsed.error),
    });
  }

  const { prakriti, lat, lon, biometrics, overrideWeather, profileName } = parsed.data;

  try {
    const environment = overrideWeather
      ? composeSimulatedEnvironment(overrideWeather, { lat, lon })
      : await getEnvironment({ lat, lon });

    const fusion = computeVikriti({ prakriti, biometrics, environment });
    const advisor = await getAdvice({ result: fusion, environment });

    return res.status(200).json({
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
    });
  } catch (error) {
    return res.status(500).json({
      error: "Evaluation engine failed",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
});

export default router;
