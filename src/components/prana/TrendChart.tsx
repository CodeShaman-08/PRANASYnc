"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { DOSHAS, DOSHA_ORDER, harmonyColor } from "@/lib/prakriti";
import type { HistoryEntry } from "@/lib/types";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string; dataKey?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-neutral-900/10 bg-white/95 px-3 py-2 shadow-xl backdrop-blur">
      <div className="mb-1 text-[9px] uppercase tracking-[0.14em] text-neutral-500">{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4 text-[10px]">
          <span className="capitalize text-neutral-600">{item.name}</span>
          <span className="num font-medium" style={{ color: item.color }}>
            {typeof item.value === "number" ? Math.round(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({ history }: { history: HistoryEntry[] }) {
  const [mode, setMode] = useState<"harmony" | "doshas">("harmony");
  const data = useMemo(
    () =>
      history.slice(-7).map((entry) => ({
        ...entry,
        day: new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
      })),
    [history],
  );

  const first = data[0]?.harmonyScore ?? 0;
  const last = data[data.length - 1]?.harmonyScore ?? 0;
  const delta = last - first;
  const improving = delta >= 0;

  if (data.length === 0) {
    return (
      <div className="glass flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl p-6 text-center">
        <div className="text-[11px] font-medium text-neutral-700">No history yet</div>
        <p className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-neutral-500">
          Your readings stay in this browser. Return on another day to see the trend.
        </p>
      </div>
    );
  }

  return (
    <div className="glass relative flex h-full flex-col overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-neutral-900/[0.07] blur-3xl" />
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Your history</div>
          <h3 className="mt-1.5 text-[15px] font-medium tracking-tight text-neutral-900">7-day harmony trend</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] p-0.5">
          {(["harmony", "doshas"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-2.5 py-1 text-[9px] font-medium capitalize transition-colors ${
                mode === item ? "bg-neutral-900/10 text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-end gap-3">
        <span className="num text-3xl font-semibold tracking-tight" style={{ color: harmonyColor(last) }}>
          {last}
        </span>
        <span
          className={`mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium ${
            improving
              ? "border-neutral-900/20 bg-neutral-900/[0.07] text-neutral-700"
              : "border-neutral-600/20 bg-neutral-600/[0.07] text-neutral-700"
          }`}
        >
          {improving ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {improving ? "+" : ""}
          {delta} points / 7 days
        </span>
        <span className="mb-1 ml-auto text-[9px] uppercase tracking-[0.12em] text-neutral-400">
          {data.length} readings
        </span>
      </div>

      <div className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "harmony" ? (
            <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -26 }}>
              <defs>
                <linearGradient id="harmony-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#111111" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.07)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#6b6b6b", fontSize: 9 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis domain={[0, 100]} tick={{ fill: "#4d4d4d", fontSize: 9 }} axisLine={false} tickLine={false} ticks={[0, 50, 100]} />
              <ReferenceLine y={60} stroke="rgba(0,0,0,0.18)" strokeDasharray="3 4" />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(0,0,0,0.18)" }} />
              <Area
                type="monotone"
                dataKey="harmonyScore"
                name="harmony"
                stroke="#111111"
                strokeWidth={2}
                fill="url(#harmony-grad)"
                dot={{ r: 2.5, fill: "#ffffff", stroke: "#111111", strokeWidth: 1.5 }}
                activeDot={{ r: 4, fill: "#111111" }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -26 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.07)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#6b6b6b", fontSize: 9 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis domain={[0, 100]} tick={{ fill: "#4d4d4d", fontSize: 9 }} axisLine={false} tickLine={false} ticks={[0, 50, 100]} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(0,0,0,0.18)" }} />
              {DOSHA_ORDER.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={DOSHAS[key].name}
                  stroke={DOSHAS[key].color}
                  strokeWidth={1.7}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {mode === "doshas" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex gap-3">
          {DOSHA_ORDER.map((key) => (
            <span key={key} className="inline-flex items-center gap-1 text-[9px] text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: DOSHAS[key].color }} /> {DOSHAS[key].name}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
