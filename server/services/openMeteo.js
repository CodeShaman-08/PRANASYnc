const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "rain" },
  53: { label: "Drizzle", icon: "rain" },
  55: { label: "Dense drizzle", icon: "rain" },
  56: { label: "Freezing drizzle", icon: "rain" },
  57: { label: "Freezing drizzle", icon: "rain" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Freezing rain", icon: "rain" },
  67: { label: "Freezing rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Violent showers", icon: "rain" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Storm with hail", icon: "storm" },
  99: { label: "Storm with hail", icon: "storm" },
};

export function aqiCategory(pm25) {
  if (pm25 == null || Number.isNaN(pm25)) return { label: "Unknown", tone: "neutral", level: 0 };
  if (pm25 <= 12) return { label: "Pristine", tone: "kapha", level: 1 };
  if (pm25 <= 35) return { label: "Moderate", tone: "kapha", level: 2 };
  if (pm25 <= 55) return { label: "Unhealthy (sensitive)", tone: "pitta", level: 3 };
  if (pm25 <= 150) return { label: "Unhealthy", tone: "pitta", level: 4 };
  if (pm25 <= 250) return { label: "Very unhealthy", tone: "vata", level: 5 };
  return { label: "Hazardous", tone: "vata", level: 6 };
}

function cityFromTimezone(timezone) {
  if (!timezone || typeof timezone !== "string") return "Your sky";
  const last = timezone.split("/").pop() || "";
  return last.replace(/_/g, " ") || "Your sky";
}

function seasonFor(latitude, month) {
  const north = latitude >= 0;
  const m = north ? month : (month + 6) % 12;
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

function fallbackEnvironment({ lat, lon, reason }) {
  const now = new Date();
  const month = now.getMonth();
  const absLat = Math.abs(lat);
  const base = 30 - absLat * 0.32 + (month >= 4 && month <= 8 ? 7 : -6);
  const tempC = Math.round((base + 3) * 10) / 10;
  const humidity = Math.round(58 + (absLat > 45 ? 12 : 0) + (month >= 5 && month <= 8 ? 14 : -6));
  const pm25 = 38;
  const category = aqiCategory(pm25);
  return {
    source: "estimated",
    city: cityFromTimezone(""),
    timezone: "auto",
    localHour: now.getHours(),
    tempC,
    feelsLikeC: tempC + 1.5,
    humidity: Math.max(18, Math.min(96, humidity)),
    windKph: 11,
    uvIndex: month >= 4 && month <= 8 ? 6 : 3,
    isDay: now.getHours() >= 6 && now.getHours() < 19,
    weatherCode: 2,
    condition: "Partly cloudy",
    icon: "cloud-sun",
    pm25,
    usAqi: Math.round(pm25 * 2.1),
    aqi: category,
    season: seasonFor(lat, month),
    reason,
  };
}

const timeout = (ms) => AbortSignal.timeout(ms);

/**
 * Open-Meteo only exposes a timezone (e.g. Asia/Kolkata), which is too coarse
 * to name the user's actual city. Reverse-geocode the GPS coordinates so the
 * dashboard shows the place the reading belongs to.
 */
async function reverseGeocode(lat, lon) {
  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}` +
      "&localityLanguage=en";
    const response = await fetch(url, {
      signal: timeout(3500),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const city = data.city || data.locality || data.principalSubdivision;
    return city ? String(city) : null;
  } catch {
    return null;
  }
}

export async function getEnvironment({ lat, lon }) {
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return fallbackEnvironment({ lat: 20, lon: 78, reason: "invalid-coordinates" });
  }

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,uv_index" +
    "&timezone=auto&forecast_days=1";

  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latNum}&longitude=${lonNum}` +
    "&current=pm2_5,us_aqi,european_aqi&timezone=auto";

  const [forecastResult, airResult, placeResult] = await Promise.allSettled([
    fetch(forecastUrl, { signal: timeout(6500), headers: { accept: "application/json" } }).then((r) => {
      if (!r.ok) throw new Error(`forecast ${r.status}`);
      return r.json();
    }),
    fetch(airUrl, { signal: timeout(6500), headers: { accept: "application/json" } }).then((r) => {
      if (!r.ok) throw new Error(`air ${r.status}`);
      return r.json();
    }),
    reverseGeocode(latNum, lonNum),
  ]);

  if (forecastResult.status === "rejected") {
    return fallbackEnvironment({
      lat: latNum,
      lon: lonNum,
      reason: forecastResult.reason?.message || "forecast-unavailable",
    });
  }

  const forecast = forecastResult.value;
  const current = forecast.current || {};
  const air = airResult.status === "fulfilled" ? airResult.value.current || {} : {};
  const place = placeResult.status === "fulfilled" ? placeResult.value : null;
  const timezone = forecast.timezone || "auto";
  const localHour = Number((current.time || "").slice(11, 13));
  const weatherCode = Number(current.weather_code ?? 2);
  const meta = WEATHER_CODES[weatherCode] || { label: "Mixed sky", icon: "cloud-sun" };
  const pm25 = Number.isFinite(Number(air.pm2_5)) ? Math.round(Number(air.pm2_5) * 10) / 10 : null;
  const category = aqiCategory(pm25);

  return {
    source: "open-meteo",
    city: place || cityFromTimezone(timezone),
    timezone,
    localHour: Number.isFinite(localHour) ? localHour : new Date().getHours(),
    tempC: Math.round(Number(current.temperature_2m ?? 26) * 10) / 10,
    feelsLikeC: Math.round(Number(current.apparent_temperature ?? current.temperature_2m ?? 26) * 10) / 10,
    humidity: Math.round(Number(current.relative_humidity_2m ?? 55)),
    windKph: Math.round(Number(current.wind_speed_10m ?? 10) * 10) / 10,
    uvIndex: Math.round(Number(current.uv_index ?? 3) * 10) / 10,
    isDay: current.is_day === 1 || current.is_day === true,
    weatherCode,
    condition: meta.label,
    icon: meta.icon,
    pm25,
    usAqi: Number.isFinite(Number(air.us_aqi)) ? Math.round(Number(air.us_aqi)) : pm25 != null ? Math.round(pm25 * 2.1) : null,
    aqi: category,
    season: seasonFor(latNum, new Date().getMonth()),
    reason: null,
  };
}

export { cityFromTimezone, seasonFor };

export function composeSimulatedEnvironment(override = {}, { lat = 20, lon = 78 } = {}) {
  const hour = Number.isFinite(Number(override.localHour)) ? Number(override.localHour) : new Date().getHours();
  const tempC = Number.isFinite(Number(override.tempC)) ? Number(override.tempC) : 28;
  const humidity = Number.isFinite(Number(override.humidity)) ? Number(override.humidity) : 55;
  const pm25 = Number.isFinite(Number(override.pm25)) ? Number(override.pm25) : 28;
  const uvIndex = Number.isFinite(Number(override.uvIndex)) ? Number(override.uvIndex) : 4;
  const category = aqiCategory(pm25);
  return {
    source: "simulator",
    city: override.city || "Simulated biome",
    timezone: "simulated",
    localHour: hour,
    tempC,
    feelsLikeC: Number.isFinite(Number(override.feelsLikeC)) ? Number(override.feelsLikeC) : Math.round((tempC + 1.5) * 10) / 10,
    humidity,
    windKph: Number.isFinite(Number(override.windKph)) ? Number(override.windKph) : 10,
    uvIndex,
    isDay: typeof override.isDay === "boolean" ? override.isDay : hour >= 6 && hour < 19,
    weatherCode: 2,
    condition: override.condition || (pm25 > 90 ? "Hazy" : "Simulated sky"),
    icon: pm25 > 90 ? "fog" : "cloud-sun",
    pm25,
    usAqi: Math.round(pm25 * 2.1),
    aqi: category,
    season: override.season || seasonFor(lat, new Date().getMonth()),
    reason: null,
  };
}
