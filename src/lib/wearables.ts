import type { WearableProvider, WearableSnapshot } from "./types";

export const WEARABLE_PROVIDERS: {
  id: WearableProvider;
  name: string;
  short: string;
  note: string;
}[] = [
  {
    id: "fitbit",
    name: "Fitbit",
    short: "Fitbit connection",
    note:
      "Fitbit needs a secure sign-in that cannot happen directly in the browser. Use a private link you control that holds your token and shares your data.",
  },
  {
    id: "apple-watch",
    name: "Apple Watch",
    short: "Apple Health link",
    note:
      "Apple Health has no public web link. Use a Shortcuts or Health export that shares your watch data.",
  },
];

const FIELD_ALIASES: Record<keyof WearableSnapshot, string[]> = {
  sleepHours: ["sleepHours", "sleep", "sleep_hours", "totalSleepHours", "sleepDurationHours"],
  restingHr: ["restingHr", "restingHeartRate", "resting_hr", "heartRate", "restingHeartRateBpm"],
  hrv: ["hrv", "hrvMs", "heartRateVariability", "heart_rate_variability"],
  steps: ["steps", "stepCount", "totalSteps", "dailySteps"],
  stressLevel: ["stressLevel", "stress", "stress_level", "stressScore"],
  hydration: ["hydration", "waterLiters", "hydrationLiters", "waterIntakeLiters"],
};

const LIMITS: Record<keyof WearableSnapshot, [number, number]> = {
  sleepHours: [0, 16],
  restingHr: [30, 160],
  hrv: [5, 220],
  steps: [0, 60000],
  stressLevel: [1, 10],
  hydration: [0, 8],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const raw = source[key];
    const value = typeof raw === "string" && raw.trim() ? Number(raw) : raw;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

/**
 * Accepts either `{ biometrics: {...} }` or a flat health payload and maps it
 * onto the fields the body-and-environment reading understands. Unknown fields are ignored.
 */
export function normalizeWearablePayload(payload: unknown): WearableSnapshot {
  const root = asRecord(payload);
  if (!root) return {};
  const nested =
    asRecord(root.biometrics) ?? asRecord(root.data) ?? asRecord(root.metrics) ?? root;

  const snapshot: WearableSnapshot = {};
  (Object.keys(FIELD_ALIASES) as (keyof WearableSnapshot)[]).forEach((field) => {
    const value = readNumber(nested, FIELD_ALIASES[field]);
    if (value === undefined) return;
    const [min, max] = LIMITS[field];
    snapshot[field] = Math.round(clamp(value, min, max) * 10) / 10;
  });
  return snapshot;
}

export function hasWearableData(snapshot: WearableSnapshot) {
  return Object.values(snapshot).some((value) => typeof value === "number");
}

export function maskToken(token: string) {
  if (!token) return "no token";
  if (token.length <= 8) return "••••";
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}

export function bridgeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
