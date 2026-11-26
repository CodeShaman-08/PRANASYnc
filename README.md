# PranaSync

**Real-Time Bio-Environmental Ayurvedic Intelligence.**  
Your constitution, your climate, your biometrics — fused into one live harmony signal, with an AI protocol engine that tells you what to do in the next four hours.

No accounts. No database. No paid APIs required.

**▶ Live demo:** https://pranasync.vercel.app

---

## What it does

PranaSync treats Ayurveda as a **context engine**, not a horoscope:

1. **Prakriti (static baseline)** — an 8-trait quiz inspired by the Prakriti200 dataset produces a normalized Vata / Pitta / Kapha vector. It is stored only in the browser via `localStorage`.
2. **Vikriti (dynamic disturbance)** — the stateless API accepts `{ prakriti, lat, lon, biometrics }`, pulls live weather + PM2.5 from **Open-Meteo** (keyless), locates the current 4-hour *Dinacharya* window, and applies the Ayurvedic *“like increases like”* fusion math.
3. **Protocol** — **Gemini 2.5 Flash** returns strict JSON (`headline`, `rootCauseSummary`, 3 data-backed `keyTriggers`, and `aharaDiet` / `viharaRoutine` / `herbalSupport`). If no API key is present, a deterministic generator produces the same shape from the fusion drivers.

The result is a monochrome, living command dashboard — white canvas, black interface, zero chromatic accents: a GLSL Tridosha orb that destabilises as harmony falls, a client × environment collision view, an interactive bio-environment simulator, a 24-hour circadian wheel, a protocol deck, and a 7-day localStorage trend.

### Personal device APIs

The dashboard includes a **Devices** panel for personal Fitbit and Apple Watch data. Direct browser access is not possible for either platform, so you provide a small bridge you control that holds the OAuth token (Fitbit) or exports HealthKit data (Apple Watch) and returns normalized JSON. PranaSync sends the optional bearer token to that endpoint, maps fields such as `sleepHours`, `restingHr`, `hrv`, `steps`, `stressLevel` and `hydration`, clamps them to the fusion-engine ranges, and re-evaluates. Connections and tokens stay in `localStorage`; the server never sees them.

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, Next.js App Router, Tailwind CSS v4, Framer Motion, GSAP ScrollTrigger |
| 3D | Three.js + React Three Fiber, custom vertex/fragment shaders |
| API | Node.js + Express (ESM), Zod validation, CORS |
| Weather / AQI | Open-Meteo forecast + air-quality APIs (no key, no cost) |
| AI | `@google/generative-ai` · `gemini-2.5-flash`, strict response schema, deterministic fallback |
| Persistence | Browser `localStorage` through a React context store |
| Charts | Recharts |

### A note on structure

This repository ships as **one Next.js app** so the whole product runs with a single command and deploys free to Vercel. The entire server-side domain layer lives in the requested **`/server`** folder as framework-agnostic ESM:

- `server/services/openMeteo.js` — live weather + air quality with graceful estimation
- `server/services/doshaFusion.js` — deterministic Vikriti + harmony engine
- `server/services/aiAdvisor.js` — Gemini structured output + deterministic fallback
- `server/schema.js` — Zod request/advisor schemas
- `server/routes/evaluateRoutes.js` — Express route
- `server/app.js` / `server/index.js` — standalone Express API

The Next.js route handler (`src/app/api/evaluate/route.ts`) imports those exact same modules, so the browser app and the standalone Render API share one implementation. UI components live in `src/components/prana/` using the requested names (`PranaContext`, `TridoshaOrb`, `StreamCollision`, `BioEnvSimulator`, `CircadianClock`, `ProtocolDeck`) with TypeScript extensions.

```
.
├── server/                     # stateless API domain layer (ESM, Express-ready)
│   ├── app.js
│   ├── index.js
│   ├── schema.js
│   ├── routes/evaluateRoutes.js
│   └── services/
│       ├── openMeteo.js
│       ├── doshaFusion.js
│       └── aiAdvisor.js
├── src/
│   ├── app/
│   │   ├── page.tsx            # landing (GSAP scrollytelling)
│   │   ├── onboarding/page.tsx # animated 8-question quiz
│   │   ├── dashboard/page.tsx  # command dashboard
│   │   └── api/
│   │       ├── evaluate/route.ts
│   │       └── health/route.ts
│   ├── components/prana/
│   │   ├── LandingPage.tsx
│   │   ├── OnboardingFlow.tsx
│   │   ├── DashboardView.tsx
│   │   ├── TridoshaOrb.tsx / OrbCanvas.tsx
│   │   ├── StreamCollision.tsx
│   │   ├── BioEnvSimulator.tsx
│   │   ├── CircadianClock.tsx
│   │   ├── ProtocolDeck.tsx
│   │   ├── AdvisorPanel.tsx
│   │   ├── TrendChart.tsx
│   │   ├── WearableApiPanel.tsx
│   │   └── PrakritiRadar.tsx
│   ├── context/PranaContext.tsx  # localStorage persistence + evaluation state
│   ├── hooks/useGeolocation.ts
│   └── lib/                      # types, quiz, presets, wearable normalizer
└── .env.example
```

---

## Run locally

Requires **Node 20+** and **Bun** (npm/pnpm also work).

```bash
bun install
cp .env.example .env      # optional: add GEMINI_API_KEY
bun run dev               # Next.js full-stack app on http://localhost:4000
```

That is the complete app: UI + `/api/evaluate` on the same origin.

To run the **standalone Express API** (used for the Render deployment path):

```bash
bun run server            # http://localhost:4001
curl http://localhost:4001/api/health
```

To point a separately deployed frontend at that API:

```bash
# .env.local
NEXT_PUBLIC_API_BASE=https://your-api.onrender.com
```

### Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Next.js app (UI + API) on port 4000 |
| `bun run server` | Standalone Express API on port 4001 |
| `bun run dev:server` | Express API with `--watch` |
| `bun run typecheck` | TypeScript type check |
| `bun run build` | Production Next.js build |

---

## API contract

### `POST /api/evaluate`

```json
{
  "prakriti": { "vata": 36, "pitta": 40, "kapha": 24, "dominantType": "Pitta-Vata" },
  "lat": 28.6139,
  "lon": 77.209,
  "biometrics": {
    "sleepHours": 4.5,
    "restingHr": 82,
    "hrv": 38,
    "steps": 5200,
    "stressLevel": 8,
    "hydration": 1.4
  },
  "overrideWeather": {
    "tempC": 42, "humidity": 28, "pm25": 180,
    "windKph": 8, "uvIndex": 9, "localHour": 14,
    "city": "New Delhi", "condition": "Hazy heatwave", "season": "summer"
  }
}
```

`overrideWeather` is optional — omit it and the server fetches live Open-Meteo data for `lat/lon`. Simulator presets use it to make evaluations deterministic.

Response (abridged):

```json
{
  "environment": { "tempC": 42, "humidity": 28, "pm25": 180, "usAqi": 378, "source": "simulator", "city": "New Delhi" },
  "prakriti": { "vata": 36, "pitta": 40, "kapha": 24, "dominantType": "Pitta-Vata" },
  "vikriti": { "vata": 38.4, "pitta": 49.8, "kapha": 11.8 },
  "deltaVata": 2.4,
  "deltaPitta": 9.8,
  "deltaKapha": -12.2,
  "aggravatedDosha": "pitta",
  "harmonyScore": 23,
  "harmonyLabel": "Critical Drift",
  "drivers": [{ "factor": "Heat load", "label": "42°C ambient heat", "dosha": "pitta", "weight": 11.3, "kind": "environment" }],
  "circadian": { "label": "Vata window", "dosha": "vata", "startHour": 14, "endHour": 18 },
  "internalLoad": 61,
  "environmentLoad": 74,
  "advisor": {
    "headline": "Pitta leads the disturbance — 42°C ambient heat on Pitta-Vata terrain",
    "rootCauseSummary": "…",
    "keyTriggers": [{ "title": "Heat load", "evidence": "42°C ambient heat…", "dosha": "pitta" }],
    "protocols": {
      "aharaDiet": [{ "title": "Cooling, non-sour breakfast", "detail": "…", "timing": "07:00–08:30" }],
      "viharaRoutine": [{ "title": "Shade the peak-Pitta hours", "detail": "…", "timing": "10:00–14:00" }],
      "herbalSupport": [{ "title": "Shatavari", "detail": "…", "timing": "Evening" }]
    },
    "source": "gemini",
    "model": "gemini-2.5-flash"
  },
  "engine": { "fusion": "doshaFusion/v1", "weather": "simulator", "advisor": "gemini" }
}
```

### `GET /api/health`

Returns engine status, whether Gemini is configured, and confirms `stateless: true`, `database: false`.

---

## Domain logic

**Prakriti.** Eight trait questions (frame, skin, appetite, digestion, sleep, thermal preference, mind pace, stress response) each add weighted evidence to the three doshas, then normalize to 100%. The dominant type is label-blended when the top two are within 6 points.

**Vikriti.** A deterministic score is accumulated from the environment (heat, cold, humidity, dryness, PM2.5, UV, wind, season, circadian window) and from biometrics (sleep debt/oversleep, resting HR, HRV, steps, stress, hydration). Each contribution is exposed as a `driver` with a measured label and mechanism. The raw loads are centered and applied to the baseline, so one dosha aggravating necessarily depletes the others:

```
vikriti = normalize(prakriti + (raw[dosha] − mean(raw)) × 1.45)
```

`aggravatedDosha` is the dosha with the largest raw load. `harmonyScore` is `100 − totalRaw × 1.62 − AQI penalty`, clamped to 8–98, and mapped to a label from *Critical Drift* to *Optimal Flow*.

**Dinacharya.** Six 4-hour windows (Kapha 06–10, Pitta 10–14, Vata 14–18, Kapha 18–22, Pitta 22–02, Vata 02–06) with guidance; the current window contributes to the fusion and drives the 24-hour wheel.

**AI + fallback.** Gemini is called with a compact assessment JSON and a strict `responseSchema`; the response is parsed with Zod. Any failure — missing key, timeout, invalid JSON, quota — silently falls back to `pranasync-rules-v1`, which builds a personalized narrative and protocol from the same drivers. Herbal guidance always carries a safety note.

---

## Cost & privacy constraints

- **$0 architecture.** Open-Meteo needs no key. Gemini free tier is optional. No database, no object storage, no auth provider.
- **No database.** The API never writes or reads persistent state. `localStorage` (`pranasync:v1`) holds the baseline, biometrics, simulator override and 14-day history.
- **No personal data leaves the browser** except the anonymized numeric payload sent to `/api/evaluate` (and, only if you configure a key, to Gemini).
- **No login walls.** Finish the 8-question quiz and the dashboard opens immediately; the baseline is stored only in your browser.

---

## Deploy free

### Option A — Vercel (recommended, one project)

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project → import the repo**. Framework preset: **Next.js**. Root directory: repository root.
3. Add environment variable `GEMINI_API_KEY` (optional). Do **not** set `NEXT_PUBLIC_API_BASE` — the API route is deployed with the app.
4. Deploy. The landing page, quiz and dashboard are live, and `/api/evaluate` is served by the same Vercel deployment.

### Option B — Render (standalone Express API) + Vercel frontend

1. On **Render**: **New → Web Service**, connect the repo.
   - Runtime: **Node**
   - Build command: `bun install` (or `npm install`)
   - Start command: `bun run server` (or `node server/index.js`)
   - Health check path: `/api/health`
   - Environment: `GEMINI_API_KEY` (optional), `PORT` is injected by Render.
2. Copy the Render URL (e.g. `https://pranasync-api.onrender.com`).
3. On **Vercel**, import the same repo, add `NEXT_PUBLIC_API_BASE=https://pranasync-api.onrender.com`, and deploy. Rebuild after changing the variable.
4. CORS is enabled on the Express app (`origin: true`), so the browser can call the API directly.

> Render’s free instance sleeps after inactivity; the first evaluation may take a few seconds to wake.

---

## Design notes

- White canvas with a black interface: neutral grayscale tokens only, no chromatic accents.
- The orb is a displaced icosahedron rendered with a custom GLSL shader: noise amplitude rises and pulse frequency accelerates as harmony falls; intensity weights spring toward live Vikriti ratios.
- Framer Motion drives layout/spring transitions, number counters, the quiz card stack and accordion protocols. GSAP ScrollTrigger handles landing-page reveals and parallax.
- All metrics, the orb, the collision view, the circadian hand and the protocol deck animate from the same evaluation object.

## Disclaimer

PranaSync is an educational portfolio project. Ayurvedic guidance is not medical advice, and herbs can interact with medication. Consult a qualified practitioner before changing treatment.
