"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  Wind,
} from "lucide-react";
import { usePrana } from "@/context/PranaContext";
import { SIMULATOR_PRESETS } from "@/lib/prakriti";
import type { Biometrics, WeatherOverride } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";

interface EnvDraft {
  tempC: number;
  humidity: number;
  pm25: number;
  windKph: number;
  uvIndex: number;
  localHour: number;
  city: string;
  condition: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  color,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  color: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <label className={`block ${disabled ? "opacity-50" : ""}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-neutral-500">{label}</span>
        <span className="num text-[12px] font-medium text-neutral-800">
          {value}
          <span className="ml-0.5 text-[10px] font-normal text-neutral-500">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        className="prana-range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          color,
          background: `linear-gradient(90deg, ${color} ${pct}%, rgba(0,0,0,0.08) ${pct}%)`,
        }}
      />
    </label>
  );
}

function envFromContext(override: WeatherOverride | null, fallback?: { tempC: number; humidity: number; pm25: number | null; windKph: number; uvIndex: number; localHour: number; city: string; condition: string }): EnvDraft {
  if (override) {
    return {
      tempC: override.tempC ?? 28,
      humidity: override.humidity ?? 55,
      pm25: override.pm25 ?? 30,
      windKph: override.windKph ?? 10,
      uvIndex: override.uvIndex ?? 4,
      localHour: override.localHour ?? 12,
      city: override.city ?? "Simulated biome",
      condition: override.condition ?? "Simulated sky",
    };
  }
  return {
    tempC: fallback?.tempC ?? 28,
    humidity: fallback?.humidity ?? 55,
    pm25: fallback?.pm25 ?? 30,
    windKph: fallback?.windKph ?? 10,
    uvIndex: fallback?.uvIndex ?? 4,
    localHour: fallback?.localHour ?? 12,
    city: fallback?.city ?? "Live location",
    condition: fallback?.condition ?? "Live weather",
  };
}

export default function BioEnvSimulator() {
  const {
    biometrics,
    overrideWeather,
    result,
    updateBiometrics,
    setOverrideWeather,
    evaluate,
    loading,
    error,
    coords,
  } = usePrana();

  const [bio, setBio] = useState<Biometrics>(biometrics);
  const [env, setEnv] = useState<EnvDraft>(envFromContext(overrideWeather, result?.environment));
  const [useLive, setUseLive] = useState<boolean>(overrideWeather === null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const firstRun = useRef(true);
  const evaluatedRef = useRef<string>("");

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const signature = JSON.stringify({ bio, env, useLive });
    const timer = window.setTimeout(() => {
      if (evaluatedRef.current === signature) return;
      evaluatedRef.current = signature;
      updateBiometrics(bio);
      setOverrideWeather(useLive ? null : env);
      void evaluate({ biometrics: bio, overrideWeather: useLive ? null : env });
    }, 520);
    return () => window.clearTimeout(timer);
  }, [bio, env, useLive, evaluate, updateBiometrics, setOverrideWeather]);

  const applyPreset = (presetId: string) => {
    const preset = SIMULATOR_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    setUseLive(false);
    setBio({ ...preset.biometrics });
    setEnv(envFromContext(preset.override));
  };

  const switchToLive = () => {
    setActivePreset(null);
    setUseLive(true);
    setEnv(envFromContext(null, result?.environment));
  };

  const switchToSimulate = () => {
    setUseLive(false);
    setEnv(envFromContext(overrideWeather, result?.environment));
  };

  const patchBio = (patch: Partial<Biometrics>) => {
    setActivePreset(null);
    setBio((current) => ({ ...current, ...patch }));
  };

  const patchEnv = (patch: Partial<EnvDraft>) => {
    setActivePreset(null);
    setEnv((current) => ({ ...current, ...patch }));
  };

  const syncNow = () => {
    updateBiometrics(bio);
    setOverrideWeather(useLive ? null : env);
    void evaluate({
      biometrics: bio,
      overrideWeather: useLive ? null : env,
      coords: { lat: coords.lat, lon: coords.lon },
    });
  };

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-neutral-900/10 blur-3xl" />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            <SlidersHorizontal className="h-3 w-3" /> Your surroundings
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium tracking-tight text-neutral-900">
            Stress-test your biology
          </h3>
          <p className="mt-1 max-w-md text-[11px] leading-relaxed text-neutral-500">
            Move a slider to see how your harmony and your plan change.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] p-1">
          <button
            type="button"
            onClick={switchToLive}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              useLive ? "bg-neutral-900/10 text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Radio className="h-3 w-3" /> Live
          </button>
          <button
            type="button"
            onClick={switchToSimulate}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              !useLive ? "bg-neutral-900/10 text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Sparkles className="h-3 w-3" /> Simulate
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SIMULATOR_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`group shrink-0 rounded-xl border px-3 py-2 text-left transition-all ${
                active
                  ? "border-neutral-900/20 bg-neutral-900/[0.07]"
                  : "border-neutral-900/[0.06] bg-neutral-900/[0.02] hover:border-neutral-900/12 hover:bg-neutral-900/[0.04]"
              }`}
              style={active ? { boxShadow: `0 0 0 1px rgba(0,0,0,0.25)` } : undefined}
            >
              <div className="text-[11px] font-medium text-neutral-800">{preset.name}</div>
              <div className="mt-0.5 text-[9px] text-neutral-500">{preset.tagline}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <Thermometer className="h-3 w-3" /> Environment
            {useLive && (
              <span className="rounded-full bg-neutral-900/10 px-1.5 py-0.5 text-[8px] font-medium text-neutral-700">
                LIVE
              </span>
            )}
          </div>
          <div className="space-y-3.5">
            <Slider label="Temperature" value={env.tempC} min={-10} max={50} unit="°C" color="#444444" disabled={useLive} onChange={(tempC) => patchEnv({ tempC })} />
            <Slider label="Humidity" value={env.humidity} min={10} max={100} unit="%" color="#555555" disabled={useLive} onChange={(humidity) => patchEnv({ humidity })} />
            <Slider label="PM2.5" value={env.pm25} min={2} max={300} unit="µg/m³" color="#666666" disabled={useLive} onChange={(pm25) => patchEnv({ pm25 })} />
            <Slider label="Wind" value={env.windKph} min={0} max={70} unit="km/h" color="#888888" disabled={useLive} onChange={(windKph) => patchEnv({ windKph })} />
            <Slider label="UV index" value={env.uvIndex} min={0} max={12} step={0.5} unit="" color="#999999" disabled={useLive} onChange={(uvIndex) => patchEnv({ uvIndex })} />
            <Slider label="Local hour" value={env.localHour} min={0} max={23} unit=":00" color="#111111" disabled={useLive} onChange={(localHour) => patchEnv({ localHour })} />
          </div>
          {useLive && (
            <p className="mt-3 rounded-lg border border-neutral-900/10 bg-neutral-900/[0.04] px-2.5 py-2 text-[10px] leading-relaxed text-neutral-700/70">
              Using live weather and air quality for {result?.environment.city || "your area"}. Switch
              to Simulate to explore a different climate.
            </p>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <Activity className="h-3 w-3" /> Internal biometrics
          </div>
          <div className="space-y-3.5">
            <Slider label="Sleep" value={bio.sleepHours} min={0} max={12} step={0.5} unit="h" color="#111111" onChange={(sleepHours) => patchBio({ sleepHours })} />
            <Slider label="Resting HR" value={bio.restingHr} min={40} max={120} unit="bpm" color="#333333" onChange={(restingHr) => patchBio({ restingHr })} />
            <Slider label="HRV" value={bio.hrv} min={10} max={140} unit="ms" color="#777777" onChange={(hrv) => patchBio({ hrv })} />
            <Slider label="Steps" value={bio.steps} min={0} max={22000} step={100} unit="" color="#888888" onChange={(steps) => patchBio({ steps })} />
            <Slider label="Stress" value={bio.stressLevel} min={1} max={10} step={0.5} unit="/10" color="#444444" onChange={(stressLevel) => patchBio({ stressLevel })} />
            <Slider label="Hydration" value={bio.hydration} min={0} max={5} step={0.1} unit="L" color="#555555" onChange={(hydration) => patchBio({ hydration })} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-900/[0.06] pt-3">
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
          <span className={`h-1.5 w-1.5 rounded-full ${loading ? "animate-pulse bg-neutral-600" : "bg-neutral-900"}`} />
          {loading ? "Updating…" : error ? "Could not update — retry" : "Up to date"}
          {result && (
            <span className="hidden items-center gap-1 text-neutral-400 sm:inline-flex">
              · harmony <AnimatedNumber value={result.harmonyScore} className="text-neutral-600" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={syncNow}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/10 bg-neutral-900/[0.05] px-3 py-1.5 text-[10px] font-medium text-neutral-800 transition-colors hover:bg-neutral-900/[0.09] disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Re-evaluate
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 rounded-lg border border-neutral-600/20 bg-neutral-600/[0.06] px-2.5 py-2 text-[10px] text-neutral-700"
        >
          {error}
        </motion.p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
        <span className="inline-flex items-center gap-1"><Moon className="h-2.5 w-2.5" /> sleep</span>
        <span className="inline-flex items-center gap-1"><HeartPulse className="h-2.5 w-2.5" /> cardiac</span>
        <span className="inline-flex items-center gap-1"><Footprints className="h-2.5 w-2.5" /> movement</span>
        <span className="inline-flex items-center gap-1"><Brain className="h-2.5 w-2.5" /> stress</span>
        <span className="inline-flex items-center gap-1"><Droplets className="h-2.5 w-2.5" /> hydration</span>
        <span className="inline-flex items-center gap-1"><Wind className="h-2.5 w-2.5" /> air</span>
      </div>
    </div>
  );
}
