import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { advisorSchema } from "../schema.js";

const clampText = (value, max) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);

const PROTOCOL_LIBRARY = {
  vata: {
    aharaDiet: [
      {
        title: "Warm, oily, grounding breakfast",
        detail:
          "Steel-cut oats cooked with ghee, dates and a pinch of cinnamon. Warm, unctuous food directly counters Vata's cold-dry mobility and steadies morning cortisol.",
        timing: "Within 60 min of waking · 7:00–8:30",
      },
      {
        title: "Sweet–sour–salty lunch",
        detail:
          "Mung dal khichdi with ghee, roasted root vegetables and a squeeze of lime. Favour sweet, sour and salty tastes; minimise raw salads, crackers and iced drinks.",
        timing: "Largest meal · 12:00–13:30",
      },
      {
        title: "Hydrate with warmth",
        detail:
          "Sip warm water with a slice of ginger through the day. Avoid cold water with meals — it dims agni and amplifies dryness in the colon.",
        timing: "Every 90 min · 1.8–2.2 L total",
      },
    ],
    viharaRoutine: [
      {
        title: "Ground before you accelerate",
        detail:
          "Ten minutes of slow, weighted movement — cat-cow, forward folds, legs-up-the-wall — before opening email. This settles the nervous system before stimulus arrives.",
        timing: "Morning · 6:30",
      },
      {
        title: "Abhyanga with warm sesame oil",
        detail:
          "Self-massage with warmed sesame oil, long strokes on the limbs and circles at the joints. The oil barrier reduces Vata's dryness and calms tactile over-arousal.",
        timing: "Before bathing · 10 min",
      },
      {
        title: "Nadi shodhana + extended exhale",
        detail:
          "Alternate-nostril breathing for 6 minutes, with the exhale twice as long as the inhale. This raises vagal tone and is the fastest lever on a suppressed HRV.",
        timing: "Morning + 18:30 · 6 min",
      },
    ],
    herbalSupport: [
      {
        title: "Ashwagandha (Withania somnifera)",
        detail:
          "Traditionally used as a rasayana to buffer stress and support sleep depth. Typical traditional dose 300–600 mg root extract with warm milk. Avoid in acute congestion.",
        timing: "Evening · 30 min before sleep",
      },
      {
        title: "Brahmi (Bacopa monnieri)",
        detail:
          "A medhya herb used to settle a racing mind and support memory under strain. Traditionally taken with ghee. Not for use with sedatives without guidance.",
        timing: "Morning · after food",
      },
      {
        title: "Warm sesame oil nasya",
        detail:
          "Two drops of warm sesame oil in each nostril after a steam rinse. Traditional nasya practice for dry air, wind exposure and scattered prana.",
        timing: "Morning · after cleansing",
      },
    ],
  },
  pitta: {
    aharaDiet: [
      {
        title: "Cooling, non-sour breakfast",
        detail:
          "Cooked pear or apple with cardamom, or a room-temperature chia-coconut bowl. Skip chilli, vinegar, fermented foods and coffee on an empty stomach — all add Pitta heat.",
        timing: "Within 60 min of waking · 7:00–8:30",
      },
      {
        title: "Sweet–bitter–astringent lunch",
        detail:
          "Basmati rice, moong dal, cucumber, coriander and a spoon of ghee. Keep lunch the largest meal, but make it cooling and mildly spiced rather than pungent.",
        timing: "Largest meal · 12:00–13:30",
      },
      {
        title: "Coconut water + mint infusion",
        detail:
          "Rehydrate with coconut water or fennel-mint-coriander tea. Aim for pale-yellow urine; concentrated urine is a direct dehydration signal under heat load.",
        timing: "Mid-morning & 16:00 · 2.4–3 L total",
      },
    ],
    viharaRoutine: [
      {
        title: "Shade the peak-Pitta hours",
        detail:
          "Move strenuous training to 06:00–09:00 or after 18:00. Between 10:00 and 14:00, Pitta peaks — direct sun plus intense work multiplies heat and irritability.",
        timing: "Daily · 10:00–14:00 protected",
      },
      {
        title: "Sheetali / sheetkari cooling breath",
        detail:
          "Five minutes of rolled-tongue cooling breath, followed by a slow exhale. This measurably lowers sympathetic arousal and counters the hot, sharp Pitta state.",
        timing: "Midday · 5 min",
      },
      {
        title: "Moonlight walk, no screens",
        detail:
          "A slow 15-minute walk after sunset with no phone. It discharges accumulated heat and prevents the 22:00 Pitta window from turning into late-night productivity.",
        timing: "Evening · 19:30",
      },
    ],
    herbalSupport: [
      {
        title: "Shatavari (Asparagus racemosus)",
        detail:
          "A cooling, moistening rasayana traditionally used for Pitta excess, heat and depleted ojas. Typical traditional dose 500 mg–1 g with milk. Avoid with high oestrogen conditions.",
        timing: "Evening · with warm milk",
      },
      {
        title: "Coriander–fennel–rose infusion",
        detail:
          "A cooling tridoshic tea that soothes acidity and tempers heat in the digestive tract. Steep 1 tsp each for 7 minutes; sip at room temperature.",
        timing: "After lunch & 16:00",
      },
      {
        title: "Amalaki (Emblica officinalis)",
        detail:
          "Vitamin-C rich and traditionally used to cool Pitta and support the liver. Take 1 tsp powder with water; avoid on a very sensitive stomach.",
        timing: "Morning · after breakfast",
      },
    ],
  },
  kapha: {
    aharaDiet: [
      {
        title: "Light, warm, spiced breakfast",
        detail:
          "Ginger-turmeric tea with a small bowl of millet porridge. Skip yoghurt, smoothies and cold cereal — cold-heavy foods directly increase Kapha's density.",
        timing: "After movement · 8:00–9:00",
      },
      {
        title: "Pungent–bitter–astringent lunch",
        detail:
          "Roasted vegetables, lentils, black pepper, ginger and a little ghee. Keep grains to one cupped handful; fill half the plate with bitter greens to cut mucus.",
        timing: "Largest meal · 12:00–13:30",
      },
      {
        title: "Early, broth-based dinner",
        detail:
          "A thin vegetable-lentil soup before 19:00. Kapha digestion is slow; a late heavy dinner compounds morning grogginess and congestion.",
        timing: "Early · 18:00–19:00",
      },
    ],
    viharaRoutine: [
      {
        title: "Wake before the Kapha window ends",
        detail:
          "Alarm at 05:45, out of bed by 06:00. Sleeping into the 06:00–10:00 Kapha window is the single fastest way to manufacture heaviness for the rest of the day.",
        timing: "Daily · 05:45",
      },
      {
        title: "Vigorous morning movement",
        detail:
          "20–30 minutes of brisk walking, sun salutations or interval work until you break a light sweat. Heat, dryness and movement are the antidotes to Kapha's cold-moist inertia.",
        timing: "Morning · 06:15",
      },
      {
        title: "Dry brushing + kapalabhati",
        detail:
          "Garshana (dry brushing) before bathing, then 3 rounds of 30 kapalabhati breaths. Both traditionally mobilise lymph and clear the respiratory channels.",
        timing: "Morning · 8 min",
      },
    ],
    herbalSupport: [
      {
        title: "Trikatu (ginger, black pepper, pippali)",
        detail:
          "A classic Kapha-reducing blend that kindles agni and dries excess mucus. Typical traditional dose ¼–½ tsp with honey. Avoid with active ulcers or reflux.",
        timing: "Before lunch · with honey",
      },
      {
        title: "Tulsi + ginger infusion",
        detail:
          "Steep 8–10 tulsi leaves and crushed ginger for 8 minutes. Traditionally used to clear the lungs and counter damp, heavy air and particulate exposure.",
        timing: "Morning & 16:00",
      },
      {
        title: "Punarnava (Boerhavia diffusa)",
        detail:
          "Traditionally used to support fluid balance and reduce Kapha-type swelling. Typical traditional dose 300–500 mg extract; avoid in pregnancy.",
        timing: "Morning · after food",
      },
    ],
  },
};

const EXTRA_PROTOCOLS = {
  sleepDebt: {
    aharaDiet: {
      title: "No caffeine after 12:00",
      detail:
        "Caffeine has a 5–6 hour half-life. A 16:00 coffee still blocks adenosine at 22:00, deepening the sleep debt that is already destabilising Vata.",
      timing: "Cutoff · 12:00",
    },
    viharaRoutine: {
      title: "Yogic sleep hygiene protocol",
      detail:
        "Screens off 60 minutes before bed, room at 18–20°C, feet warm, and a fixed wake time even after a poor night. Consistency rebuilds the circadian amplitude faster than extra hours.",
      timing: "Nightly · 21:30",
    },
  },
  pollution: {
    aharaDiet: {
      title: "Antioxidant-dense plate",
      detail:
        "Add amalaki, citrus, beetroot and leafy greens. Under high PM2.5, polyphenols and vitamin C support the body's own phase-II detox pathways.",
      timing: "Lunch & dinner",
    },
    viharaRoutine: {
      title: "Indoor air + nasal rinse",
      detail:
        "Keep windows shut during the AQI peak, run a HEPA filter if available, and irrigate the nose with saline after outdoor exposure. Avoid outdoor cardio until PM2.5 drops.",
      timing: "Daily · after exposure",
    },
  },
  heat: {
    aharaDiet: {
      title: "Electrolytes, not just water",
      detail:
        "Add a pinch of pink salt and lime to water, or drink coconut water. Sweat loss under heat is sodium-rich; plain water alone can dilute electrolytes.",
      timing: "Through the day",
    },
    viharaRoutine: {
      title: "Pre-cool before peak heat",
      detail:
        "Close blinds and pre-cool the room before 11:00. Cool the wrists, neck and ankles — the fastest surface areas for lowering core temperature.",
      timing: "10:30 · 10 min",
    },
  },
  sedentary: {
    aharaDiet: {
      title: "Protein-forward, low-glycaemic meals",
      detail:
        "Anchor each meal with dal, paneer or eggs plus fibre. Low movement reduces glucose uptake, so stacking refined carbs accelerates Kapha weight gain.",
      timing: "Every meal",
    },
    viharaRoutine: {
      title: "Post-meal 12-minute walk",
      detail:
        "A short walk after each meal lowers post-prandial glucose and counters Kapha stagnation. Set a timer; consistency beats intensity here.",
      timing: "After meals · 12 min",
    },
  },
  stress: {
    aharaDiet: {
      title: "Magnesium-rich evening meal",
      detail:
        "Include pumpkin seeds, spinach or sesame in dinner. Magnesium supports parasympathetic tone and muscle relaxation under high perceived stress.",
      timing: "Dinner",
    },
    viharaRoutine: {
      title: "4-7-8 breath before decisions",
      detail:
        "Four rounds of inhale 4, hold 7, exhale 8 before stressful meetings. It interrupts the Vata-Pitta stress loop at the level of the vagus nerve.",
      timing: "As needed · 3 min",
    },
  },
};

function pickExtras(result) {
  const extras = [];
  const bio = result.biometrics;
  if (bio.sleepHours < 6.5) extras.push(EXTRA_PROTOCOLS.sleepDebt);
  if (Number(result.environment?.pm25) > 55) extras.push(EXTRA_PROTOCOLS.pollution);
  if (Number(result.environment?.tempC) > 33) extras.push(EXTRA_PROTOCOLS.heat);
  if (bio.steps < 4000) extras.push(EXTRA_PROTOCOLS.sedentary);
  if (bio.stressLevel >= 7) extras.push(EXTRA_PROTOCOLS.stress);
  return extras;
}

function ensureThree(base, extras, key) {
  const situational = extras.map((extra) => extra[key]).filter(Boolean);
  const merged = [...base.slice(0, 2), ...situational, ...base.slice(2)];
  const seen = new Set();
  return merged
    .filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    })
    .slice(0, 3);
}

export function buildDeterministicAdvice(result, environment) {
  const meta = result.aggravatedMeta;
  const name = meta.name;
  const top = result.drivers.slice(0, 3);
  const second = result.drivers[1] || top[0];
  const bio = result.biometrics;
  const extras = pickExtras({ ...result, environment });
  const library = PROTOCOL_LIBRARY[result.aggravatedDosha];

  const headline = clampText(
    `${name} leads the disturbance — ${top[0]?.label || "environmental load"} on ${result.prakriti.dominantType} terrain`,
    155,
  );

  const rootCauseSummary = clampText(
    `Your baseline is ${result.prakriti.dominantType} (Vata ${result.prakriti.vata}% · Pitta ${result.prakriti.pitta}% · Kapha ${result.prakriti.kapha}%). ` +
      `Right now the body reads ${result.vikriti.vata}% Vata / ${result.vikriti.pitta}% Pitta / ${result.vikriti.kapha}% Kapha, and the harmony index sits at ${result.harmonyScore}/100 (${result.harmonyLabel}). ` +
      `The strongest collision is between ${top[0]?.factor?.toLowerCase() || "environmental stress"} (${top[0]?.label}) and ${second?.factor?.toLowerCase() || "internal load"} (${second?.label}), landing inside the ${result.circadian.label.toLowerCase()}. ` +
      `In Ayurvedic terms, ${top[0]?.detail || "repeated exposure is accumulating one dosha"} This is an accumulation pattern (sanchaya), not a fixed constitution — the protocol below is designed to reverse the trend before it reaches tissue-level disturbance.`,
    880,
  );

  const triggerSeeds = [...top];
  if (triggerSeeds.length < 3) {
    triggerSeeds.push({
      title: "Circadian window",
      evidence: `${result.circadian.label} (${result.circadian.startHour}:00–${result.circadian.endHour}:00) naturally accumulates ${result.circadian.dosha}.`,
      dosha: result.circadian.dosha,
    });
  }
  if (triggerSeeds.length < 3) {
    triggerSeeds.push({
      title: "Baseline constitution",
      evidence: `Your ${result.prakriti.dominantType} baseline makes you more sensitive to ${result.aggravatedDosha} qualities.`,
      dosha: result.aggravatedDosha,
    });
  }

  const keyTriggers = triggerSeeds.slice(0, 3).map((driver) => ({
    title: clampText(driver.title || driver.factor || "Load factor", 78),
    evidence: clampText(`${driver.label ? `${driver.label}. ` : ""}${driver.evidence || driver.detail || ""}`, 270),
    dosha: ["vata", "pitta", "kapha"].includes(driver.dosha) ? driver.dosha : result.aggravatedDosha,
  }));

  return {
    headline,
    rootCauseSummary,
    keyTriggers,
    protocols: {
      aharaDiet: ensureThree(library.aharaDiet, extras, "aharaDiet"),
      viharaRoutine: ensureThree(library.viharaRoutine, extras, "viharaRoutine"),
      herbalSupport: library.herbalSupport.slice(0, 3),
    },
    source: "deterministic",
    model: "pranasync-rules-v1",
    safetyNote:
      "Ayurvedic guidance is educational, not medical advice. Herbs can interact with medication — consult a qualified practitioner.",
    context: {
      dominant: result.prakriti.dominantType,
      harmony: result.harmonyScore,
      aggravated: result.aggravatedDosha,
      sleep: bio.sleepHours,
      stress: bio.stressLevel,
    },
  };
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    headline: { type: SchemaType.STRING },
    rootCauseSummary: { type: SchemaType.STRING },
    keyTriggers: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          evidence: { type: SchemaType.STRING },
          dosha: { type: SchemaType.STRING, enum: ["vata", "pitta", "kapha"] },
        },
        required: ["title", "evidence", "dosha"],
      },
    },
    protocols: {
      type: SchemaType.OBJECT,
      properties: {
        aharaDiet: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              detail: { type: SchemaType.STRING },
              timing: { type: SchemaType.STRING },
            },
            required: ["title", "detail", "timing"],
          },
        },
        viharaRoutine: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              detail: { type: SchemaType.STRING },
              timing: { type: SchemaType.STRING },
            },
            required: ["title", "detail", "timing"],
          },
        },
        herbalSupport: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              detail: { type: SchemaType.STRING },
              timing: { type: SchemaType.STRING },
            },
            required: ["title", "detail", "timing"],
          },
        },
      },
      required: ["aharaDiet", "viharaRoutine", "herbalSupport"],
    },
  },
  required: ["headline", "rootCauseSummary", "keyTriggers", "protocols"],
};

function buildPrompt(result, environment) {
  const context = {
    prakriti_baseline: result.prakriti,
    vikriti_current: result.vikriti,
    deltas: {
      vata: result.deltaVata,
      pitta: result.deltaPitta,
      kapha: result.deltaKapha,
    },
    harmony_score: result.harmonyScore,
    harmony_label: result.harmonyLabel,
    aggravated_dosha: result.aggravatedDosha,
    dosha_states: result.doshaState,
    drivers: result.drivers,
    circadian_window: {
      label: result.circadian.label,
      dosha: result.circadian.dosha,
      start_hour: result.circadian.startHour,
      end_hour: result.circadian.endHour,
      local_hour: result.circadian.localHour,
    },
    biometrics: result.biometrics,
    environment: {
      city: environment.city,
      condition: environment.condition,
      temp_c: environment.tempC,
      feels_like_c: environment.feelsLikeC,
      humidity: environment.humidity,
      pm25: environment.pm25,
      us_aqi: environment.usAqi,
      aqi_label: environment.aqi?.label,
      uv_index: environment.uvIndex,
      wind_kph: environment.windKph,
      season: environment.season,
      source: environment.source,
    },
  };

  return `You are a senior Ayurvedic physician and environmental physiologist building a decision-support protocol.

Use the structured assessment below. Apply the Ayurvedic principle "like increases like" (samanya vishesha) to explain how the external environment and internal biometrics are disturbing the user's baseline constitution (Prakriti).

ASSESSMENT JSON:
${JSON.stringify(context, null, 2)}

Rules:
- Write for an intelligent adult. Be specific, cite the actual numbers from the data, and connect cause to mechanism.
- headline: one punchy sentence, max 140 characters, naming the aggravated dosha and the dominant collision.
- rootCauseSummary: 3-5 sentences. Explain the accumulation pattern, name the top two drivers with their measured values, and reference the current Dinacharya window. Avoid alarmism and never diagnose disease.
- keyTriggers: exactly 3. Each must cite a measured value from the data (temperature, PM2.5, sleep hours, HRV, stress, steps, circadian window). Each dosha must be one of vata/pitta/kapha.
- protocols: exactly 3 items each. Give practical, specific Ayurvedic actions with quantities/timings. aharaDiet = food, viharaRoutine = lifestyle/breath/movement, herbalSupport = traditional herbs with typical doses and a safety caution where relevant.
- Do not claim to cure or treat medical conditions. Return only the JSON object.`;
}

export async function getAdvice({ result, environment }) {
  const fallback = buildDeterministicAdvice(result, environment);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return { ...fallback, reason: "no-api-key" };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 1800,
        responseMimeType: "application/json",
        responseSchema,
      },
      systemInstruction:
        "You are PranaSync's Ayurvedic intelligence engine. You output only strict JSON that matches the requested schema. You never give disease diagnoses or replace medical care.",
    });

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("gemini-timeout")), 15000),
    );
    const request = model.generateContent(buildPrompt(result, environment));
    const response = await Promise.race([request, timeout]);
    const text = response.response.text();
    const parsed = advisorSchema.parse(JSON.parse(text));

    return {
      ...parsed,
      source: "gemini",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      safetyNote:
        "AI-generated Ayurvedic guidance is educational, not medical advice. Herbs can interact with medication — consult a qualified practitioner.",
      context: fallback.context,
    };
  } catch (error) {
    return {
      ...fallback,
      reason: error instanceof Error ? error.message : "ai-unavailable",
    };
  }
}

export { PROTOCOL_LIBRARY };
