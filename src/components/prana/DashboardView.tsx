"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Cpu,
  Gauge,
  MapPin,
  RefreshCw,
  RotateCcw,
  Satellite,
  Wind,
  Zap,
} from "lucide-react";
import { usePrana } from "@/context/PranaContext";
import { DOSHAS, harmonyColor } from "@/lib/prakriti";
import type { Evaluation } from "@/lib/types";
import Brand, { BrandMark } from "./Brand";
import TridoshaOrb from "./TridoshaOrb";
import StreamCollision from "./StreamCollision";
import AdvisorPanel from "./AdvisorPanel";
import BioEnvSimulator from "./BioEnvSimulator";
import CircadianClock from "./CircadianClock";
import ProtocolDeck from "./ProtocolDeck";
import TrendChart from "./TrendChart";
import WearableApiPanel from "./WearableApiPanel";
import AnimatedNumber from "./AnimatedNumber";

function OrbCenter({ result }: { result: Evaluation }) {
  const aggravated = result.doshaState.find((item) => item.key === result.aggravatedDosha);
  const meta = DOSHAS[result.aggravatedDosha];
  return (
    <div className="relative flex w-full flex-col items-center">
      <TridoshaOrb
        vata={result.vikriti.vata}
        pitta={result.vikriti.pitta}
        kapha={result.vikriti.kapha}
        harmony={result.harmonyScore}
        labels
        className="w-[238px] sm:w-[300px]"
      />
      <div className="relative z-10 -mt-1 text-center">
        <div className="text-[8.5px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Harmony index
        </div>
        <div className="mt-1 flex items-baseline justify-center gap-1">
          <AnimatedNumber
            value={result.harmonyScore}
            className="text-[52px] font-semibold leading-none tracking-[-0.04em]"
          />
          <span className="text-[11px] text-neutral-500">/100</span>
        </div>
        <motion.div
          key={result.harmonyLabel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{ color: harmonyColor(result.harmonyScore) }}
        >
          {result.harmonyLabel}
        </motion.div>
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium"
          style={{ borderColor: `${meta.color}33`, background: meta.soft, color: meta.color }}
        >
          <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
          {meta.name} aggravated
          {aggravated && aggravated.delta > 0 ? ` +${aggravated.delta.toFixed(1)}` : ""}
        </div>
      </div>
    </div>
  );
}

function DriversPanel({ result }: { result: Evaluation }) {
  const top = result.drivers.slice(0, 5);
  const max = Math.max(...top.map((driver) => driver.weight), 1);
  return (
    <div className="glass relative flex h-full flex-col overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-neutral-800/[0.06] blur-3xl" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            <Gauge className="h-3 w-3" /> Signal drivers
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium tracking-tight text-neutral-900">
            What is moving your biology
          </h3>
        </div>
        <span className="rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-neutral-500">
          live
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {top.map((driver, index) => {
          const meta = DOSHAS[driver.dosha];
          return (
            <motion.div
              key={`${driver.factor}-${index}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-neutral-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                  <span className="truncate">{driver.factor}</span>
                </span>
                <span className="num shrink-0 text-[10px] text-neutral-500">+{driver.weight.toFixed(1)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-neutral-900/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(driver.weight / max) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + index * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${meta.deep}, ${meta.color})` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-[8px] uppercase tracking-[0.1em] text-neutral-400">
                  {driver.kind}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {result.primaryDriver && (
        <p className="mt-3 rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.02] p-2.5 text-[9.5px] leading-relaxed text-neutral-500">
          <span className="text-neutral-700">Dominant collision:</span> {result.primaryDriver.detail}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[9px] uppercase tracking-[0.12em] text-neutral-400">
        <span className="inline-flex items-center gap-1">
          <Cpu className="h-2.5 w-2.5" /> body + environment
        </span>
        <span>{result.load.total.toFixed(1)} total load</span>
      </div>
    </div>
  );
}

function ResetControl() {
  const { resetAll } = usePrana();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  return (
    <button
      type="button"
      onClick={() => {
        if (!confirming) {
          setConfirming(true);
          return;
        }
        resetAll();
        router.push("/");
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9.5px] font-medium transition-colors ${
        confirming
          ? "border-neutral-600/30 bg-neutral-600/10 text-neutral-700"
          : "border-neutral-900/8 bg-neutral-900/[0.03] text-neutral-600 hover:text-neutral-800"
      }`}
    >
      <RotateCcw className="h-3 w-3" /> {confirming ? "Confirm reset" : "Reset"}
    </button>
  );
}

function LocationControl() {
  const { geoStatus, requestGeolocation, coords } = usePrana();
  const label =
    geoStatus === "granted"
      ? coords.accuracy
        ? `±${coords.accuracy} m`
        : "Located"
      : geoStatus === "prompting"
        ? "Locating…"
        : geoStatus === "denied"
          ? "Location off"
          : "Use location";

  return (
    <button
      type="button"
      onClick={requestGeolocation}
      title="Refresh your location"
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1.5 text-[9.5px] font-medium text-neutral-600 transition-colors hover:text-neutral-800"
    >
      <MapPin className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
      {(geoStatus === "denied" || geoStatus === "unsupported") && <RefreshCw className="h-3 w-3" />}
    </button>
  );
}

function DashboardHeader() {
  const { prakriti } = usePrana();
  const nav = [
    { href: "#signal", label: "Signal" },
    { href: "#simulator", label: "Simulator" },
    { href: "#devices", label: "Devices" },
    { href: "#protocol", label: "Protocol" },
    { href: "#history", label: "History" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900/[0.06] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[10.5px] font-medium text-neutral-500 transition-colors hover:bg-neutral-900/[0.04] hover:text-neutral-800"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {prakriti && (
            <div className="hidden items-center gap-2 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1.5 sm:flex">
              <span className="flex gap-1">
                {(["vata", "pitta", "kapha"] as const).map((key) => (
                  <span key={key} className="h-1.5 w-1.5 rounded-full" style={{ background: DOSHAS[key].color }} />
                ))}
              </span>
              <span className="text-[9.5px] font-medium text-neutral-700">{prakriti.dominantType}</span>
            </div>
          )}
          <ResetControl />
          <LocationControl />
        </div>
      </div>
    </header>
  );
}

function BootState() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="h-28 w-28 animate-breathe rounded-full bg-gradient-to-br from-neutral-900/40 via-neutral-800/30 to-neutral-900/30 blur-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-neutral-700" />
        </div>
      </div>
      <h1 className="mt-7 text-xl font-medium tracking-tight text-neutral-950">Reading your body and your surroundings</h1>
      <p className="mt-2 text-[11.5px] leading-relaxed text-neutral-500">
        Checking the weather and air around you, finding your current Ayurvedic window, and
        comparing both with your constitution.
      </p>
      <div className="mt-6 flex gap-2 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
        <span className="rounded-full border border-neutral-900/8 px-2.5 py-1">weather</span>
        <span className="rounded-full border border-neutral-900/8 px-2.5 py-1">biometrics</span>
        <span className="rounded-full border border-neutral-900/8 px-2.5 py-1">vikriti</span>
        <span className="rounded-full border border-neutral-900/8 px-2.5 py-1">protocol</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex min-h-[72vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <BrandMark className="h-12 w-12" />
      <div className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
        No baseline in this browser
      </div>
      <h1 className="mt-2 text-balance text-2xl font-medium tracking-tight text-neutral-950 sm:text-3xl">
        PranaSync needs your constitution to read your day.
      </h1>
      <p className="mt-3 max-w-md text-[12px] leading-relaxed text-neutral-500">
        Your constitution stays in this browser — there is no account and no copy on a server.
        Take the 8-question quiz to build your baseline and unlock the dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-[11.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Take the quiz <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <Link href="/" className="mt-5 text-[10px] text-neutral-400 transition-colors hover:text-neutral-600">
        ← Back to landing
      </Link>
    </div>
  );
}

export default function DashboardView() {
  const {
    hydrated,
    prakriti,
    result,
    loading,
    error,
    evaluate,
    requestGeolocation,
    geoStatus,
    coords,
    overrideWeather,
    history,
    profileName,
  } = usePrana();
  const booted = useRef(false);
  const lastGeoKey = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !prakriti || booted.current) return;
    booted.current = true;
    if (overrideWeather === null) requestGeolocation();
    if (!result) void evaluate();
  }, [hydrated, prakriti, result, evaluate, overrideWeather, requestGeolocation]);

  useEffect(() => {
    if (!hydrated || !prakriti || geoStatus !== "granted" || overrideWeather !== null) return;
    const key = `${coords.lat},${coords.lon}`;
    if (lastGeoKey.current === key) return;
    lastGeoKey.current = key;
    void evaluate({ coords: { lat: coords.lat, lon: coords.lon } });
  }, [hydrated, prakriti, geoStatus, overrideWeather, coords, evaluate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-900/10 border-t-neutral-700" />
      </div>
    );
  }

  if (!prakriti) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        <EmptyState />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        {error ? (
          <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
            <div className="text-[11px] font-medium text-neutral-700">We could not update your reading</div>
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">{error}</p>
            <button
              type="button"
              onClick={() => void evaluate()}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-900/12 bg-neutral-900/[0.05] px-4 py-2 text-[11px] font-medium text-neutral-800"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry evaluation
            </button>
          </div>
        ) : (
          <BootState />
        )}
      </div>
    );
  }

  const generated = new Date(result.generatedAt);
  const dateLabel = generated.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeLabel = generated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const aggravated = DOSHAS[result.aggravatedDosha];

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <main className="mx-auto max-w-[1240px] px-4 pb-14 pt-5 sm:px-6">
        {overrideWeather === null && geoStatus !== "granted" && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-900/[0.08] bg-neutral-900/[0.03] px-3 py-2">
            <div className="flex items-center gap-2 text-[10px] leading-relaxed text-neutral-600">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>
                {geoStatus === "prompting"
                  ? "Finding your exact location…"
                  : geoStatus === "denied"
                    ? "Location is off, so the weather is approximate. Allow location for a reading for your area."
                    : "Using an approximate location for the weather reading."}
              </span>
            </div>
            <button
              type="button"
              onClick={requestGeolocation}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/10 bg-white/70 px-2.5 py-1 text-[9.5px] font-medium text-neutral-700 transition-colors hover:bg-white"
            >
              <RefreshCw className="h-2.5 w-2.5" /> Use my location
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              <CalendarDays className="h-3 w-3" /> {dateLabel} · {timeLabel}
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="inline-flex items-center gap-1">
                <Satellite className="h-3 w-3" /> {result.environment.source === "simulator" ? "simulated conditions" : "live conditions"}
              </span>
            </div>
            <h1 className="mt-2 text-balance text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-neutral-950 sm:text-[32px]">
              {profileName}, your {aggravated.name.toLowerCase()} signal is{" "}
              <span style={{ color: aggravated.color }}>{result.harmonyLabel.toLowerCase()}</span>.
            </h1>
            <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-neutral-500">
              {result.primaryDriver?.label} is the strongest collision against your{" "}
              {result.prakriti.dominantType} baseline. Harmony moved to{" "}
              <span className="text-neutral-700">{result.harmonyScore}/100</span> inside the{" "}
              {result.circadian.label.toLowerCase()}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1 text-[9.5px] text-neutral-600">
              <MapPin className="h-2.5 w-2.5" /> {result.environment.city}
              {result.environment.source === "open-meteo" && coords.source === "gps" && coords.accuracy
                ? ` · ±${coords.accuracy} m`
                : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1 text-[9.5px] text-neutral-600">
              <Wind className="h-2.5 w-2.5" /> {result.environment.tempC}°C · PM2.5 {result.environment.pm25 ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1 text-[9.5px] text-neutral-600">
              <Cpu className="h-2.5 w-2.5" /> {result.engine.advisor === "gemini" ? "AI-guided" : "PranaSync guidance"}
            </span>
            {loading && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600/20 bg-neutral-600/[0.07] px-2.5 py-1 text-[9.5px] text-neutral-700">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" /> syncing
              </span>
            )}
          </div>
        </div>

        <section id="signal" className="mt-5 scroll-mt-20">
          <StreamCollision result={result}>
            <OrbCenter result={result} />
          </StreamCollision>
        </section>

        <div className="mt-4">
          <AdvisorPanel
            advisor={result.advisor}
            generatedAt={result.generatedAt}
            harmonyScore={result.harmonyScore}
          />
        </div>

        <section id="simulator" className="mt-4 grid scroll-mt-20 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BioEnvSimulator />
          </div>
          <div className="lg:col-span-5">
            <CircadianClock circadian={result.circadian} />
          </div>
        </section>

        <section id="devices" className="mt-4 scroll-mt-20">
          <WearableApiPanel />
        </section>

        <section id="protocol" className="mt-9 scroll-mt-20">
          <ProtocolDeck advisor={result.advisor} aggravated={result.aggravatedDosha} />
        </section>

        <section id="history" className="mt-9 grid scroll-mt-20 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TrendChart history={history} />
          </div>
          <div className="lg:col-span-5">
            <DriversPanel result={result} />
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900/[0.06] pt-5">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" />
            <span className="text-[10px] text-neutral-500">
              PranaSync · private by default · no account · your data stays in this browser
            </span>
          </div>
          <div className="flex items-center gap-3 text-[9.5px] text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" /> educational guidance, not a diagnosis
            </span>
            <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-neutral-600">
              About <ArrowUpRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
