"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  CloudFog,
  Droplets,
  Footprints,
  HeartPulse,
  MapPin,
  Moon,
  Radio,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import type { Evaluation } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";

function MetricRow({
  icon: Icon,
  label,
  value,
  unit,
  fill,
  accent,
}: {
  icon: typeof Moon;
  label: string;
  value: ReactNode;
  unit?: string;
  fill: number;
  accent: string;
}) {
  return (
    <div className="group flex items-center gap-3 py-[7px]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-900/5 bg-neutral-900/[0.03] text-neutral-600 transition-colors group-hover:text-neutral-800">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[11px] font-medium uppercase tracking-[0.13em] text-neutral-500">
            {label}
          </span>
          <span className="num shrink-0 text-[13px] font-medium text-neutral-900">
            {value}
            {unit && <span className="ml-0.5 text-[10px] font-normal text-neutral-500">{unit}</span>}
          </span>
        </div>
        <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-neutral-900/[0.06]">
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: `${Math.max(4, Math.min(100, fill * 100))}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
            style={{ background: accent }}
          />
        </div>
      </div>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  badge,
  tone,
}: {
  eyebrow: string;
  title: string;
  badge: string;
  tone: string;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: tone }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-medium tracking-tight text-neutral-900">{title}</h3>
      </div>
      <span className="shrink-0 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-600">
        {badge}
      </span>
    </div>
  );
}

export default function StreamCollision({
  result,
  children,
}: {
  result: Evaluation;
  children: ReactNode;
}) {
  const bio = result.biometrics;
  const env = result.environment;
  const sourceLabel = env.source === "simulator" ? "Simulator" : env.source === "open-meteo" ? "Live weather" : "Approx.";
  const aqiTone =
    env.aqi.tone === "kapha" ? "#777777" : env.aqi.tone === "pitta" ? "#444444" : env.aqi.tone === "vata" ? "#111111" : "#999999";

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-x-[28%] top-[46%] hidden h-[2px] lg:block">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-neutral-900/0 via-neutral-700/30 to-neutral-600/40"
          animate={{ opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-neutral-700 shadow-[0_0_8px_2px_rgba(0,0,0,0.25)]"
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.9, ease: "linear" }}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.02fr_1.12fr_1.02fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5"
        >
          <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-neutral-900/10 blur-3xl" />
          <PanelHeader eyebrow="Your body" title="Internal biometrics" badge="You" tone="#111111" />
          <div className="divide-y divide-neutral-900/[0.04]">
            <MetricRow icon={Moon} label="Sleep" value={<AnimatedNumber value={bio.sleepHours} digits={1} />} unit="h" fill={bio.sleepHours / 9} accent="#111111" />
            <MetricRow icon={HeartPulse} label="Resting HR" value={<AnimatedNumber value={bio.restingHr} />} unit="bpm" fill={(bio.restingHr - 40) / 65} accent="#666666" />
            <MetricRow icon={Activity} label="HRV" value={<AnimatedNumber value={bio.hrv} />} unit="ms" fill={bio.hrv / 120} accent="#777777" />
            <MetricRow icon={Footprints} label="Steps" value={<AnimatedNumber value={bio.steps} />} unit="" fill={bio.steps / 12000} accent="#777777" />
            <MetricRow icon={Brain} label="Stress" value={<AnimatedNumber value={bio.stressLevel} digits={1} />} unit="/10" fill={bio.stressLevel / 10} accent="#444444" />
            <MetricRow icon={Droplets} label="Hydration" value={<AnimatedNumber value={bio.hydration} digits={1} />} unit="L" fill={bio.hydration / 4} accent="#555555" />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-700/10 bg-neutral-700/[0.04] px-3 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-700/70">Body load</span>
            <span className="num text-sm font-semibold text-neutral-800">
              <AnimatedNumber value={result.internalLoad} />
              <span className="text-[10px] font-normal text-neutral-500"> / 100</span>
            </span>
          </div>
        </motion.div>

        <div className="order-first flex flex-col items-center justify-center lg:order-none">{children}</div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5"
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-neutral-900/10 blur-3xl" />
          <PanelHeader eyebrow="Your surroundings" title={env.city || "Your area"} badge={sourceLabel} tone="#444444" />
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {env.condition}
            </span>
            <span className="inline-flex items-center gap-1">
              <Sun className="h-3 w-3" /> {String(env.localHour).padStart(2, "0")}:00 local
            </span>
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3" /> {env.season}
            </span>
          </div>
          <div className="divide-y divide-neutral-900/[0.04]">
            <MetricRow icon={Thermometer} label="Temperature" value={<AnimatedNumber value={env.tempC} digits={1} />} unit="°C" fill={(env.tempC + 10) / 60} accent="#444444" />
            <MetricRow icon={Droplets} label="Humidity" value={<AnimatedNumber value={env.humidity} />} unit="%" fill={env.humidity / 100} accent="#555555" />
            <MetricRow icon={CloudFog} label="PM2.5" value={<AnimatedNumber value={env.pm25 ?? 0} digits={1} />} unit="µg/m³" fill={(env.pm25 ?? 0) / 200} accent={aqiTone} />
            <MetricRow icon={Wind} label="Wind" value={<AnimatedNumber value={env.windKph} digits={1} />} unit="km/h" fill={env.windKph / 60} accent="#999999" />
            <MetricRow icon={Sun} label="UV index" value={<AnimatedNumber value={env.uvIndex} digits={1} />} unit="" fill={env.uvIndex / 12} accent="#888888" />
            <MetricRow icon={Activity} label="US AQI" value={env.usAqi ?? "—"} unit="" fill={(env.usAqi ?? 0) / 300} accent={aqiTone} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-600/10 bg-neutral-600/[0.04] px-3 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-700/70">
              {env.aqi.label}
            </span>
            <span className="num text-sm font-semibold text-neutral-700">
              <AnimatedNumber value={result.environmentLoad} />
              <span className="text-[10px] font-normal text-neutral-500"> / 100</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
