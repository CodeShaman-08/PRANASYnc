export type DoshaKey = "vata" | "pitta" | "kapha";

export interface DoshaTriplet {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface Prakriti extends DoshaTriplet {
  dominantType: string;
}

export interface Biometrics {
  sleepHours: number;
  restingHr: number;
  hrv: number;
  steps: number;
  stressLevel: number;
  hydration: number;
}

export type WearableProvider = "fitbit" | "apple-watch";

export interface WearableConnection {
  id: string;
  provider: WearableProvider;
  label: string;
  token: string;
  bridgeUrl: string;
  connectedAt: string;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface WearableSnapshot {
  sleepHours?: number;
  restingHr?: number;
  hrv?: number;
  steps?: number;
  stressLevel?: number;
  hydration?: number;
}

export interface AqiInfo {
  label: string;
  tone: string;
  level: number;
}

export interface Environment {
  source: "open-meteo" | "simulator" | "estimated" | string;
  city: string;
  timezone: string;
  localHour: number;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  uvIndex: number;
  isDay: boolean;
  weatherCode: number;
  condition: string;
  icon: string;
  pm25: number | null;
  usAqi: number | null;
  aqi: AqiInfo;
  season: string;
  reason?: string | null;
}

export interface WeatherOverride {
  tempC?: number;
  humidity?: number;
  pm25?: number;
  windKph?: number;
  uvIndex?: number;
  isDay?: boolean;
  localHour?: number;
  city?: string;
  condition?: string;
  season?: string;
}

export interface CircadianWindow {
  startHour: number;
  endHour: number;
  dosha: DoshaKey;
  label: string;
  guidance: string;
  localHour: number;
  progress: number;
}

export interface Driver {
  factor: string;
  label: string;
  detail: string;
  dosha: DoshaKey;
  weight: number;
  kind: "environment" | "internal" | "circadian" | string;
}

export interface DoshaState {
  key: DoshaKey;
  name: string;
  percent: number;
  baseline: number;
  delta: number;
  state: "aggravated" | "depleted" | "balanced";
  raw: number;
}

export interface ProtocolItem {
  title: string;
  detail: string;
  timing: string;
}

export interface Advisor {
  headline: string;
  rootCauseSummary: string;
  keyTriggers: { title: string; evidence: string; dosha: DoshaKey }[];
  protocols: {
    aharaDiet: ProtocolItem[];
    viharaRoutine: ProtocolItem[];
    herbalSupport: ProtocolItem[];
  };
  source: "gemini" | "deterministic" | string;
  model: string;
  safetyNote: string;
  reason?: string;
}

export interface Evaluation {
  profileName: string;
  generatedAt: string;
  environment: Environment;
  prakriti: Prakriti;
  vikriti: DoshaTriplet;
  deltaVata: number;
  deltaPitta: number;
  deltaKapha: number;
  aggravatedDosha: DoshaKey;
  aggravatedMeta: {
    key: DoshaKey;
    name: string;
    element: string;
    color: string;
    deep: string;
    qualities: string;
  };
  doshaState: DoshaState[];
  harmonyScore: number;
  harmonyLabel: string;
  harmonyTone: string;
  drivers: Driver[];
  primaryDriver: Driver | null;
  internalLoad: number;
  environmentLoad: number;
  load: { internal: number; environment: number; total: number };
  circadian: CircadianWindow;
  biometrics: Biometrics;
  advisor: Advisor;
  engine: {
    fusion: string;
    weather: string;
    advisor: string;
    advisorModel: string;
  };
}

export interface HistoryEntry {
  date: string;
  harmonyScore: number;
  vata: number;
  pitta: number;
  kapha: number;
  aggravatedDosha: DoshaKey;
  label: string;
}

export interface SimulatorPreset {
  id: string;
  name: string;
  place: string;
  tagline: string;
  tone: DoshaKey;
  override: WeatherOverride;
  biometrics: Biometrics;
}
