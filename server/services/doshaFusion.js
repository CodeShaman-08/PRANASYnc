const DOSHA_KEYS = ["vata", "pitta", "kapha"];

export const DOSHA_META = {
  vata: {
    key: "vata",
    name: "Vata",
    element: "Air + Ether",
    color: "#818cf8",
    deep: "#6366f1",
    qualities: "light · dry · mobile · cold",
  },
  pitta: {
    key: "pitta",
    name: "Pitta",
    element: "Fire + Water",
    color: "#fb923c",
    deep: "#f43f5e",
    qualities: "hot · sharp · intense · liquid",
  },
  kapha: {
    key: "kapha",
    name: "Kapha",
    element: "Earth + Water",
    color: "#34d399",
    deep: "#14b8a6",
    qualities: "heavy · cold · stable · moist",
  },
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round1 = (value) => Math.round(value * 10) / 10;

export function normalizeDoshas(input = {}) {
  const raw = DOSHA_KEYS.map((key) => Math.max(0, Number(input[key]) || 0));
  const sum = raw.reduce((total, value) => total + value, 0);
  if (sum <= 0) {
    return { vata: 33.3, pitta: 33.3, kapha: 33.4, dominantType: "Tridoshic" };
  }
  const vata = round1((raw[0] / sum) * 100);
  const pitta = round1((raw[1] / sum) * 100);
  const kapha = round1(100 - vata - pitta);
  const sorted = Object.entries({ vata, pitta, kapha }).sort((a, b) => b[1] - a[1]);
  const dominantType =
    sorted[0][1] - sorted[1][1] < 6
      ? `${DOSHA_META[sorted[0][0]].name}-${DOSHA_META[sorted[1][0]].name}`
      : DOSHA_META[sorted[0][0]].name;
  return { vata, pitta, kapha, dominantType };
}

const CIRCADIAN_WINDOWS = [
  {
    startHour: 6,
    endHour: 10,
    dosha: "kapha",
    label: "Kapha window",
    guidance: "Slow, grounding energy. Wake before 6, move the body, keep breakfast light and warm.",
  },
  {
    startHour: 10,
    endHour: 14,
    dosha: "pitta",
    label: "Pitta window",
    guidance: "Peak digestion and focus. Make lunch the largest meal, avoid direct heat and conflict.",
  },
  {
    startHour: 14,
    endHour: 18,
    dosha: "vata",
    label: "Vata window",
    guidance: "Creative, mobile energy. Best for ideation and breathwork — not for overstimulation.",
  },
  {
    startHour: 18,
    endHour: 22,
    dosha: "kapha",
    label: "Kapha window",
    guidance: "Cooling, settling energy. Eat a light dinner, dim the lights, wind down by 22:00.",
  },
  {
    startHour: 22,
    endHour: 2,
    dosha: "pitta",
    label: "Pitta window",
    guidance: "Internal repair. Sleep here — staying awake in this window overheats the system.",
  },
  {
    startHour: 2,
    endHour: 6,
    dosha: "vata",
    label: "Vata window",
    guidance: "Subtle, airy energy. Light sleep is common; a warm, quiet room protects the nervous system.",
  },
];

export function getCircadianWindow(localHour) {
  const hour = ((Math.floor(Number(localHour) || 0) % 24) + 24) % 24;
  const window = CIRCADIAN_WINDOWS.find((item) =>
    item.startHour < item.endHour
      ? hour >= item.startHour && hour < item.endHour
      : hour >= item.startHour || hour < item.endHour,
  );
  return {
    ...window,
    localHour: hour,
    nextWindow: CIRCADIAN_WINDOWS[(CIRCADIAN_WINDOWS.indexOf(window) + 1) % CIRCADIAN_WINDOWS.length],
    progress: round1(((hour - window.startHour + 24) % 24) / ((window.endHour - window.startHour + 24) % 24 || 4)),
  };
}

function pushDriver(list, driver) {
  if (driver.weight <= 0.05) return;
  list.push({ ...driver, weight: round1(driver.weight) });
}

export function computeVikriti({ prakriti, biometrics, environment }) {
  const base = normalizeDoshas(prakriti);
  const bio = {
    sleepHours: Number(biometrics?.sleepHours ?? 7),
    restingHr: Number(biometrics?.restingHr ?? 62),
    hrv: Number(biometrics?.hrv ?? 58),
    steps: Number(biometrics?.steps ?? 7500),
    stressLevel: Number(biometrics?.stressLevel ?? 4),
    hydration: Number(biometrics?.hydration ?? 2.2),
  };
  const env = environment || {};
  const raw = { vata: 0, pitta: 0, kapha: 0 };
  const drivers = [];

  const temp = Number(env.tempC ?? 26);
  const humidity = Number(env.humidity ?? 55);
  const pm25 = Number(env.pm25 ?? 20);
  const uv = Number(env.uvIndex ?? 3);
  const wind = Number(env.windKph ?? 10);
  const localHour = Number(env.localHour ?? new Date().getHours());

  if (temp >= 27) {
    const weight = (temp - 27) * 0.75;
    raw.pitta += weight;
    pushDriver(drivers, {
      factor: "Heat load",
      label: `${round1(temp)}°C ambient heat`,
      detail: "Heat is a Pitta quality — like increases like. It accelerates metabolism, irritability and inflammation.",
      dosha: "pitta",
      weight,
      kind: "environment",
    });
  }
  if (temp <= 14) {
    const weight = (14 - temp) * 0.5;
    raw.vata += weight * 0.8;
    raw.kapha += weight * 0.7;
    pushDriver(drivers, {
      factor: "Cold exposure",
      label: `${round1(temp)}°C ambient cold`,
      detail: "Cold constricts channels, aggravating Vata's mobility and thickening Kapha's congestion.",
      dosha: "vata",
      weight,
      kind: "environment",
    });
  }
  if (humidity >= 68) {
    const weight = (humidity - 68) * 0.22;
    raw.kapha += weight;
    pushDriver(drivers, {
      factor: "Humidity",
      label: `${Math.round(humidity)}% relative humidity`,
      detail: "Damp, heavy air increases Kapha — sluggishness, mucus and water retention.",
      dosha: "kapha",
      weight,
      kind: "environment",
    });
  }
  if (humidity <= 32) {
    const weight = (32 - humidity) * 0.2;
    raw.vata += weight;
    pushDriver(drivers, {
      factor: "Dry air",
      label: `${Math.round(humidity)}% relative humidity`,
      detail: "Dryness is a Vata quality — it roughens the respiratory tract, skin and nervous system.",
      dosha: "vata",
      weight,
      kind: "environment",
    });
  }
  if (pm25 > 30) {
    const weight = Math.min(9, (pm25 - 30) * 0.045);
    raw.kapha += weight;
    raw.pitta += Math.min(2.5, (pm25 - 30) * 0.012);
    pushDriver(drivers, {
      factor: "Particulate load",
      label: `PM2.5 at ${round1(pm25)} µg/m³`,
      detail: "Inhaled particulates settle in the channels (srotas), burdening Kapha and provoking low-grade Pitta inflammation.",
      dosha: "kapha",
      weight,
      kind: "environment",
    });
  }
  if (uv >= 6) {
    const weight = (uv - 6) * 0.45;
    raw.pitta += weight;
    pushDriver(drivers, {
      factor: "Solar intensity",
      label: `UV index ${round1(uv)}`,
      detail: "Strong sun adds Pitta heat and depletes Ojas (vitality) through dehydration.",
      dosha: "pitta",
      weight,
      kind: "environment",
    });
  }
  if (wind >= 24) {
    const weight = (wind - 24) * 0.14;
    raw.vata += weight;
    pushDriver(drivers, {
      factor: "Wind exposure",
      label: `${round1(wind)} km/h wind`,
      detail: "Wind amplifies Vata's mobile, dry quality and can scatter the mind.",
      dosha: "vata",
      weight,
      kind: "environment",
    });
  }

  if (env.season === "summer") raw.pitta += 1.4;
  if (env.season === "winter") {
    raw.vata += 1.1;
    raw.kapha += 0.9;
  }
  if (env.season === "monsoon") raw.kapha += 1.6;
  if (env.season === "autumn") raw.vata += 1.2;

  const circadian = getCircadianWindow(localHour);
  raw[circadian.dosha] += 2.4;
  pushDriver(drivers, {
    factor: "Dinacharya",
    label: `${circadian.label} · ${String(circadian.startHour).padStart(2, "0")}:00–${String(circadian.endHour).padStart(2, "0")}:00`,
    detail: "The body mirrors the dosha of the current 4-hour clock window. This is the moment its qualities naturally accumulate.",
    dosha: circadian.dosha,
    weight: 2.4,
    kind: "circadian",
  });

  if (bio.sleepHours < 6.5) {
    const weight = (6.5 - bio.sleepHours) * 3.0;
    raw.vata += weight;
    if (bio.sleepHours < 5) raw.pitta += (5 - bio.sleepHours) * 0.9;
    pushDriver(drivers, {
      factor: "Sleep debt",
      label: `${round1(bio.sleepHours)} h sleep`,
      detail: "Short sleep dries and destabilises the nervous system (Vata) while blunting overnight Pitta repair.",
      dosha: "vata",
      weight,
      kind: "internal",
    });
  }
  if (bio.sleepHours > 9) {
    const weight = (bio.sleepHours - 9) * 2.2;
    raw.kapha += weight;
    pushDriver(drivers, {
      factor: "Oversleep",
      label: `${round1(bio.sleepHours)} h sleep`,
      detail: "Excess sleep increases Kapha inertia — heaviness, grogginess and slower metabolism.",
      dosha: "kapha",
      weight,
      kind: "internal",
    });
  }
  if (bio.restingHr > 72) {
    const weight = (bio.restingHr - 72) * 0.2;
    raw.pitta += weight;
    raw.vata += weight * 0.35;
    pushDriver(drivers, {
      factor: "Elevated resting HR",
      label: `${Math.round(bio.restingHr)} bpm at rest`,
      detail: "A hot, fast pulse signals Pitta activation and sympathetic overdrive.",
      dosha: "pitta",
      weight,
      kind: "internal",
    });
  }
  if (bio.restingHr < 55) {
    const weight = (55 - bio.restingHr) * 0.3;
    raw.kapha += weight;
    pushDriver(drivers, {
      factor: "Low resting HR",
      label: `${Math.round(bio.restingHr)} bpm at rest`,
      detail: "Very low resting rate with low drive can reflect Kapha sluggishness rather than fitness.",
      dosha: "kapha",
      weight,
      kind: "internal",
    });
  }
  if (bio.hrv < 45) {
    const weight = (45 - bio.hrv) * 0.22;
    raw.vata += weight;
    pushDriver(drivers, {
      factor: "Suppressed HRV",
      label: `${Math.round(bio.hrv)} ms HRV`,
      detail: "Low heart-rate variability means the vagus nerve is under strain — a classic Vata instability marker.",
      dosha: "vata",
      weight,
      kind: "internal",
    });
  }
  if (bio.steps < 4000) {
    const weight = (4000 - bio.steps) / 900;
    raw.kapha += weight;
    pushDriver(drivers, {
      factor: "Sedentary load",
      label: `${Math.round(bio.steps).toLocaleString()} steps`,
      detail: "Low movement lets Kapha accumulate — stagnation in lymph, digestion and mood.",
      dosha: "kapha",
      weight,
      kind: "internal",
    });
  }
  if (bio.steps > 14000) {
    const weight = (bio.steps - 14000) / 2600;
    raw.vata += weight;
    pushDriver(drivers, {
      factor: "Overtraining",
      label: `${Math.round(bio.steps).toLocaleString()} steps`,
      detail: "Excessive movement depletes Vata's reserves and can dry out joints and sleep.",
      dosha: "vata",
      weight,
      kind: "internal",
    });
  }
  if (bio.stressLevel > 5) {
    const weight = (bio.stressLevel - 5) * 1.6;
    raw.vata += weight;
    raw.pitta += weight * 0.5;
    pushDriver(drivers, {
      factor: "Stress load",
      label: `Stress ${round1(bio.stressLevel)}/10`,
      detail: "Perceived stress scatters Vata and heats Pitta — the fight-or-flight signature.",
      dosha: "vata",
      weight,
      kind: "internal",
    });
  }
  if (bio.hydration < 2) {
    const weight = (2 - bio.hydration) * 1.4;
    raw.pitta += weight;
    raw.vata += weight * 0.35;
    pushDriver(drivers, {
      factor: "Dehydration",
      label: `${round1(bio.hydration)} L water`,
      detail: "Insufficient fluids concentrate Pitta's heat and dry Vata's channels.",
      dosha: "pitta",
      weight,
      kind: "internal",
    });
  }

  const totalRaw = raw.vata + raw.pitta + raw.kapha;
  const mean = totalRaw / 3;
  const centered = {
    vata: raw.vata - mean,
    pitta: raw.pitta - mean,
    kapha: raw.kapha - mean,
  };
  const gain = 1.45;
  const shifted = normalizeDoshas({
    vata: base.vata + centered.vata * gain,
    pitta: base.pitta + centered.pitta * gain,
    kapha: base.kapha + centered.kapha * gain,
  });

  const vikriti = { vata: shifted.vata, pitta: shifted.pitta, kapha: shifted.kapha };
  const delta = {
    vata: round1(vikriti.vata - base.vata),
    pitta: round1(vikriti.pitta - base.pitta),
    kapha: round1(vikriti.kapha - base.kapha),
  };

  const rawByDosha = { ...raw };
  const aggravatedDosha = DOSHA_KEYS.reduce((best, key) => (rawByDosha[key] > rawByDosha[best] ? key : best), "vata");

  const envRaw = drivers.filter((d) => d.kind !== "internal").reduce((sum, d) => sum + d.weight, 0);
  const internalRaw = drivers.filter((d) => d.kind === "internal").reduce((sum, d) => sum + d.weight, 0);
  const aqiPenalty = pm25 > 55 ? 5 : pm25 > 35 ? 2.5 : 0;
  const harmonyScore = Math.round(clamp(100 - totalRaw * 1.62 - aqiPenalty, 8, 98));

  const harmonyLabel =
    harmonyScore >= 80
      ? "Optimal Flow"
      : harmonyScore >= 66
        ? "Stable"
        : harmonyScore >= 52
          ? "Compensating"
          : harmonyScore >= 36
            ? "Strained"
            : "Critical Drift";

  const harmonyTone =
    harmonyScore >= 80 ? "kapha" : harmonyScore >= 60 ? "pitta" : harmonyScore >= 40 ? "pitta" : "vata";

  const doshaState = DOSHA_KEYS.map((key) => {
    const value = delta[key];
    return {
      key,
      name: DOSHA_META[key].name,
      percent: vikriti[key],
      baseline: base[key],
      delta: value,
      state: value >= 2.2 ? "aggravated" : value <= -2.2 ? "depleted" : "balanced",
      raw: round1(rawByDosha[key]),
    };
  });

  const primaryDriver = [...drivers].sort((a, b) => b.weight - a.weight)[0];

  return {
    prakriti: base,
    vikriti,
    deltaVata: delta.vata,
    deltaPitta: delta.pitta,
    deltaKapha: delta.kapha,
    aggravatedDosha,
    aggravatedMeta: DOSHA_META[aggravatedDosha],
    doshaState,
    harmonyScore,
    harmonyLabel,
    harmonyTone,
    drivers: drivers.sort((a, b) => b.weight - a.weight).slice(0, 8),
    primaryDriver: primaryDriver || null,
    internalLoad: Math.round(clamp(internalRaw * 3.2, 0, 100)),
    environmentLoad: Math.round(clamp(envRaw * 2.6, 0, 100)),
    load: {
      internal: round1(internalRaw),
      environment: round1(envRaw),
      total: round1(totalRaw),
    },
    circadian,
    biometrics: bio,
  };
}
