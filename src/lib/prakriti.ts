import type {
  Biometrics,
  DoshaKey,
  DoshaTriplet,
  Prakriti,
  SimulatorPreset,
} from "./types";

export const DOSHAS: Record<
  DoshaKey,
  {
    name: string;
    element: string;
    color: string;
    deep: string;
    soft: string;
    rgb: string;
    qualities: string;
    glyph: string;
  }
> = {
  vata: {
    name: "Vata",
    element: "Air + Ether",
    color: "#111111",
    deep: "#000000",
    soft: "rgba(17,17,17,0.10)",
    rgb: "17,17,17",
    qualities: "light · dry · mobile · cold",
    glyph: "◈",
  },
  pitta: {
    name: "Pitta",
    element: "Fire + Water",
    color: "#555555",
    deep: "#333333",
    soft: "rgba(85,85,85,0.10)",
    rgb: "85,85,85",
    qualities: "hot · sharp · intense · liquid",
    glyph: "▲",
  },
  kapha: {
    name: "Kapha",
    element: "Earth + Water",
    color: "#9a9a9a",
    deep: "#777777",
    soft: "rgba(154,154,154,0.14)",
    rgb: "154,154,154",
    qualities: "heavy · cold · stable · moist",
    glyph: "●",
  },
};

export const DOSHA_ORDER: DoshaKey[] = ["vata", "pitta", "kapha"];

/**
 * Trait summaries taken from the eight Prakriti200-style observations used by
 * the quiz (build, skin, appetite, digestion, sleep, climate, mind, stress).
 * The landing page uses these to explain each dosha in the dataset's language
 * instead of exposing the scoring machinery.
 */
export const DOSHA_DATASET: Record<
  DoshaKey,
  {
    balanced: string;
    aggravated: string;
    traits: { label: string; value: string }[];
  }
> = {
  vata: {
    balanced: "Quick, creative and adaptable.",
    aggravated: "Anxious, restless, dry and irregular.",
    traits: [
      { label: "Build", value: "Light, thin, prominent joints" },
      { label: "Skin", value: "Dry, rough, cool to touch" },
      { label: "Appetite", value: "Irregular, easy to skip meals" },
      { label: "Digestion", value: "Variable — gas or bloating" },
      { label: "Sleep", value: "Light and broken" },
      { label: "Climate", value: "Thrives in warm, humid air" },
      { label: "Mind", value: "Fast and associative" },
      { label: "Stress", value: "Anxiety and racing thoughts" },
    ],
  },
  pitta: {
    balanced: "Sharp, decisive and focused.",
    aggravated: "Irritable, overheated and controlling.",
    traits: [
      { label: "Build", value: "Medium, athletic, well-proportioned" },
      { label: "Skin", value: "Warm, sensitive, prone to flushing" },
      { label: "Appetite", value: "Strong and sharp" },
      { label: "Digestion", value: "Fast — acidity or urgency" },
      { label: "Sleep", value: "Moderate, wakes warm or alert" },
      { label: "Climate", value: "Thrives in cool, crisp air" },
      { label: "Mind", value: "Sharp and decisive" },
      { label: "Stress", value: "Irritability and heat" },
    ],
  },
  kapha: {
    balanced: "Calm, steady and enduring.",
    aggravated: "Heavy, congested and slow to move.",
    traits: [
      { label: "Build", value: "Broad, solid, softer edges" },
      { label: "Skin", value: "Soft, smooth, sometimes oily" },
      { label: "Appetite", value: "Steady and low" },
      { label: "Digestion", value: "Slow and heavy" },
      { label: "Sleep", value: "Deep and long" },
      { label: "Climate", value: "Thrives in warm, dry air" },
      { label: "Mind", value: "Calm and steady" },
      { label: "Stress", value: "Withdrawal and heaviness" },
    ],
  },
};

export interface QuizOption {
  id: string;
  text: string;
  weights: DoshaTriplet;
}

export interface QuizQuestion {
  id: string;
  trait: string;
  prompt: string;
  hint: string;
  options: QuizOption[];
}

const option = (id: string, text: string, weights: Partial<DoshaTriplet>): QuizOption => ({
  id,
  text,
  weights: { vata: 0.12, pitta: 0.12, kapha: 0.12, ...weights },
});

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "frame",
    trait: "Body frame",
    prompt: "How would you describe your natural build?",
    hint: "Prakriti200 · deha prakriti",
    options: [
      option("frame-v", "Light, thin, prominent joints — I gain weight with difficulty.", { vata: 1 }),
      option("frame-p", "Medium, athletic, well-proportioned — I build and lose muscle easily.", { pitta: 1 }),
      option("frame-k", "Broad, solid, softer edges — I gain weight easily and hold it.", { kapha: 1 }),
    ],
  },
  {
    id: "skin",
    trait: "Skin moisture",
    prompt: "Between moisturisers, your skin tends to feel…",
    hint: "Prakriti200 · twak",
    options: [
      option("skin-v", "Dry, rough or cool to touch, especially in winter.", { vata: 1 }),
      option("skin-p", "Warm, sensitive, prone to flushing or breakouts.", { pitta: 1 }),
      option("skin-k", "Soft, smooth, sometimes oily or cool-damp.", { kapha: 1 }),
    ],
  },
  {
    id: "appetite",
    trait: "Appetite",
    prompt: "Your appetite is best described as…",
    hint: "Prakriti200 · agni",
    options: [
      option("appetite-v", "Irregular — I forget meals and energy crashes when I do.", { vata: 1 }),
      option("appetite-p", "Strong and sharp — I get irritable if a meal is late.", { pitta: 1 }),
      option("appetite-k", "Steady and low — I can skip a meal without much drama.", { kapha: 1 }),
    ],
  },
  {
    id: "digestion",
    trait: "Digestion",
    prompt: "After a normal meal, your digestion feels…",
    hint: "Prakriti200 · koshtha",
    options: [
      option("digestion-v", "Variable — gas, bloating or irregular bowel movements.", { vata: 1 }),
      option("digestion-p", "Fast and intense — acidity, heat or urgency after eating.", { pitta: 1 }),
      option("digestion-k", "Slow and heavy — I feel full for hours and need coffee to move.", { kapha: 1 }),
    ],
  },
  {
    id: "sleep",
    trait: "Sleep depth",
    prompt: "Your sleep is usually…",
    hint: "Prakriti200 · nidra",
    options: [
      option("sleep-v", "Light and broken — I wake at 2–4 am with a busy mind.", { vata: 1 }),
      option("sleep-p", "Moderate — I fall asleep fast but wake warm or alert.", { pitta: 1 }),
      option("sleep-k", "Deep and long — waking up is genuinely hard.", { kapha: 1 }),
    ],
  },
  {
    id: "thermal",
    trait: "Thermal preference",
    prompt: "Which climate do you actually thrive in?",
    hint: "Prakriti200 · heat tolerance",
    options: [
      option("thermal-v", "Warm and humid — cold, windy days make me stiff and anxious.", { vata: 1 }),
      option("thermal-p", "Cool and crisp — heat makes me irritable and flushed.", { pitta: 1 }),
      option("thermal-k", "Warm and dry — damp cold makes me heavy and congested.", { kapha: 1 }),
    ],
  },
  {
    id: "mind",
    trait: "Mind pace",
    prompt: "Under normal conditions your mind is…",
    hint: "Prakriti200 · manas",
    options: [
      option("mind-v", "Fast and associative — many tabs open, creative but scattered.", { vata: 1 }),
      option("mind-p", "Sharp and decisive — I like precision, argument and outcomes.", { pitta: 1 }),
      option("mind-k", "Calm and steady — I take time, then I do not forget.", { kapha: 1 }),
    ],
  },
  {
    id: "stress",
    trait: "Stress response",
    prompt: "When pressure spikes, your first reaction is…",
    hint: "Prakriti200 · stress response",
    options: [
      option("stress-v", "Anxiety, racing thoughts, poor sleep.", { vata: 1 }),
      option("stress-p", "Irritability, heat, wanting to control everything.", { pitta: 1 }),
      option("stress-k", "Withdrawal, heaviness, procrastination.", { kapha: 1 }),
    ],
  },
];

export function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function normalizeTriplet(input: Partial<DoshaTriplet>): DoshaTriplet {
  const vata = Math.max(0, Number(input.vata) || 0);
  const pitta = Math.max(0, Number(input.pitta) || 0);
  const kapha = Math.max(0, Number(input.kapha) || 0);
  const sum = vata + pitta + kapha;
  if (sum <= 0) return { vata: 33.3, pitta: 33.3, kapha: 33.4 };
  const v = round1((vata / sum) * 100);
  const p = round1((pitta / sum) * 100);
  return { vata: v, pitta: p, kapha: round1(100 - v - p) };
}

export function dominantLabel(triplet: DoshaTriplet): string {
  const sorted = DOSHA_ORDER.map((key) => ({ key, value: triplet[key] })).sort(
    (a, b) => b.value - a.value,
  );
  if (sorted[0].value - sorted[1].value < 6) {
    return `${DOSHAS[sorted[0].key].name}-${DOSHAS[sorted[1].key].name}`;
  }
  return DOSHAS[sorted[0].key].name;
}

export function computePrakriti(answers: Record<string, string>): Prakriti {
  const scores: DoshaTriplet = { vata: 0, pitta: 0, kapha: 0 };
  for (const question of QUIZ_QUESTIONS) {
    const chosen = question.options.find((item) => item.id === answers[question.id]);
    if (!chosen) continue;
    scores.vata += chosen.weights.vata;
    scores.pitta += chosen.weights.pitta;
    scores.kapha += chosen.weights.kapha;
  }
  const answered = Object.keys(answers).length;
  if (answered === 0) {
    return { vata: 33.3, pitta: 33.3, kapha: 33.4, dominantType: "Tridoshic" };
  }
  const normalized = normalizeTriplet(scores);
  return { ...normalized, dominantType: dominantLabel(normalized) };
}

export const DEFAULT_BIOMETRICS: Biometrics = {
  sleepHours: 7.2,
  restingHr: 63,
  hrv: 62,
  steps: 8200,
  stressLevel: 4,
  hydration: 2.4,
};

const HEATWAVE_BIOMETRICS: Biometrics = {
  sleepHours: 4.5,
  restingHr: 82,
  hrv: 38,
  steps: 5200,
  stressLevel: 8,
  hydration: 1.4,
};

export const SIMULATOR_PRESETS: SimulatorPreset[] = [
  {
    id: "delhi-heat",
    name: "Delhi Heatwave",
    place: "New Delhi, IN",
    tagline: "42°C + PM2.5 180 + 4.5h sleep",
    tone: "pitta",
    override: {
      tempC: 42,
      humidity: 28,
      pm25: 180,
      windKph: 8,
      uvIndex: 9,
      isDay: true,
      localHour: 14,
      city: "New Delhi",
      condition: "Hazy heatwave",
      season: "summer",
    },
    biometrics: { ...HEATWAVE_BIOMETRICS },
  },
  {
    id: "london-damp",
    name: "London Damp Cold",
    place: "London, UK",
    tagline: "7°C + 86% humidity + sedentary",
    tone: "kapha",
    override: {
      tempC: 7,
      humidity: 86,
      pm25: 12,
      windKph: 18,
      uvIndex: 0.4,
      isDay: true,
      localHour: 9,
      city: "London",
      condition: "Damp overcast",
      season: "winter",
    },
    biometrics: {
      sleepHours: 8.8,
      restingHr: 58,
      hrv: 54,
      steps: 2100,
      stressLevel: 5,
      hydration: 1.9,
    },
  },
  {
    id: "bengaluru-monsoon",
    name: "Bengaluru Monsoon",
    place: "Bengaluru, IN",
    tagline: "24°C + 88% humidity + stress 9",
    tone: "vata",
    override: {
      tempC: 24,
      humidity: 88,
      pm25: 42,
      windKph: 24,
      uvIndex: 2,
      isDay: false,
      localHour: 19,
      city: "Bengaluru",
      condition: "Monsoon rain",
      season: "monsoon",
    },
    biometrics: {
      sleepHours: 5.2,
      restingHr: 76,
      hrv: 34,
      steps: 4300,
      stressLevel: 9,
      hydration: 2,
    },
  },
  {
    id: "desert-dry",
    name: "Desert Dry Heat",
    place: "Jaisalmer, IN",
    tagline: "39°C + 18% humidity + dehydrated",
    tone: "pitta",
    override: {
      tempC: 39,
      humidity: 18,
      pm25: 95,
      windKph: 30,
      uvIndex: 10,
      isDay: true,
      localHour: 15,
      city: "Jaisalmer",
      condition: "Dry desert wind",
      season: "summer",
    },
    biometrics: {
      sleepHours: 6.8,
      restingHr: 88,
      hrv: 41,
      steps: 11200,
      stressLevel: 6,
      hydration: 1.1,
    },
  },
  {
    id: "kerala-calm",
    name: "Kerala Coastal Calm",
    place: "Kochi, IN",
    tagline: "29°C + clean air + 7.6h sleep",
    tone: "kapha",
    override: {
      tempC: 29,
      humidity: 74,
      pm25: 18,
      windKph: 12,
      uvIndex: 5,
      isDay: true,
      localHour: 8,
      city: "Kochi",
      condition: "Coastal humid",
      season: "monsoon",
    },
    biometrics: {
      sleepHours: 7.6,
      restingHr: 62,
      hrv: 68,
      steps: 8600,
      stressLevel: 3,
      hydration: 2.6,
    },
  },
];

export function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function harmonyColor(score: number) {
  if (score >= 80) return "#111111";
  if (score >= 60) return "#444444";
  if (score >= 45) return "#777777";
  return "#9a9a9a";
}
