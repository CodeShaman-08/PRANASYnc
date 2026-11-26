import { z } from "zod";

export const doshaTriplet = z.object({
  vata: z.number().min(0).max(100),
  pitta: z.number().min(0).max(100),
  kapha: z.number().min(0).max(100),
  dominantType: z.string().optional(),
});

export const biometricsSchema = z.object({
  sleepHours: z.number().min(0).max(16),
  restingHr: z.number().min(30).max(160),
  hrv: z.number().min(5).max(220),
  steps: z.number().min(0).max(60000),
  stressLevel: z.number().min(1).max(10),
  hydration: z.number().min(0).max(8).optional().default(2.2),
});

export const overrideWeatherSchema = z
  .object({
    tempC: z.number().min(-30).max(58).optional(),
    humidity: z.number().min(0).max(100).optional(),
    pm25: z.number().min(0).max(600).optional(),
    windKph: z.number().min(0).max(200).optional(),
    uvIndex: z.number().min(0).max(15).optional(),
    isDay: z.boolean().optional(),
    localHour: z.number().min(0).max(23).optional(),
    city: z.string().max(80).optional(),
    condition: z.string().max(80).optional(),
    season: z.enum(["spring", "summer", "autumn", "winter", "monsoon"]).optional(),
  })
  .partial();

export const evaluateRequestSchema = z.object({
  prakriti: doshaTriplet,
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  biometrics: biometricsSchema,
  overrideWeather: overrideWeatherSchema.nullish(),
  profileName: z.string().max(60).optional(),
});

const protocolItem = z.object({
  title: z.string().min(2).max(90),
  detail: z.string().min(8).max(420),
  timing: z.string().min(2).max(80),
});

export const advisorSchema = z.object({
  headline: z.string().min(8).max(160),
  rootCauseSummary: z.string().min(40).max(900),
  keyTriggers: z
    .array(
      z.object({
        title: z.string().min(3).max(80),
        evidence: z.string().min(8).max(280),
        dosha: z.enum(["vata", "pitta", "kapha"]),
      }),
    )
    .min(3)
    .max(3),
  protocols: z.object({
    aharaDiet: z.array(protocolItem).min(2).max(5),
    viharaRoutine: z.array(protocolItem).min(2).max(5),
    herbalSupport: z.array(protocolItem).min(2).max(5),
  }),
});

export function formatZodError(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",
    message: issue.message,
  }));
}
