"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Moon, Sunrise } from "lucide-react";
import { DOSHAS } from "@/lib/prakriti";
import type { CircadianWindow, DoshaKey } from "@/lib/types";

const SEGMENTS: { startHour: number; endHour: number; dosha: DoshaKey; label: string; guidance: string }[] = [
  { startHour: 6, endHour: 10, dosha: "kapha", label: "Kapha window", guidance: "Slow, grounding energy. Wake early, move the body, keep breakfast light and warm." },
  { startHour: 10, endHour: 14, dosha: "pitta", label: "Pitta window", guidance: "Peak digestion and focus. Largest meal at lunch, avoid direct heat and conflict." },
  { startHour: 14, endHour: 18, dosha: "vata", label: "Vata window", guidance: "Creative, mobile energy. Best for ideation and breathwork — not overstimulation." },
  { startHour: 18, endHour: 22, dosha: "kapha", label: "Kapha window", guidance: "Cooling, settling energy. Light dinner, dim lights, wind down by 22:00." },
  { startHour: 22, endHour: 2, dosha: "pitta", label: "Pitta window", guidance: "Internal repair. Sleep here — staying awake overheats the system." },
  { startHour: 2, endHour: 6, dosha: "vata", label: "Vata window", guidance: "Subtle, airy energy. Light sleep is common; a warm, quiet room protects the nerves." },
];

const CX = 130;
const CY = 130;
const R = 92;

function polar(radius: number, hour: number) {
  const angle = ((hour / 24) * 360 - 90) * (Math.PI / 180);
  return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
}

function arcPath(startHour: number, endHour: number, radius: number) {
  const start = polar(radius, startHour);
  const end = polar(radius, endHour);
  const largeArc = endHour - startHour > 12 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function CircadianClock({ circadian }: { circadian: CircadianWindow }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeSegment = SEGMENTS.findIndex(
    (segment) =>
      segment.startHour === circadian.startHour && segment.endHour === circadian.endHour,
  );
  const displayIndex = hovered ?? (activeSegment >= 0 ? activeSegment : 0);
  const display = SEGMENTS[displayIndex];
  const meta = DOSHAS[display.dosha];

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-neutral-900/[0.07] blur-3xl" />
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            <Clock className="h-3 w-3" /> Dinacharya · 24h
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium tracking-tight text-neutral-900">Circadian wheel</h3>
        </div>
        <span className="rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-neutral-600">
          {String(circadian.localHour).padStart(2, "0")}:00
        </span>
      </div>

      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[260px]">
        <svg viewBox="0 0 260 260" className="h-full w-full">
          <defs>
            <filter id="clock-glow">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="13" />

          {SEGMENTS.map((segment, index) => {
            const active = index === displayIndex;
            const color = DOSHAS[segment.dosha].color;
            return (
              <g
                key={`${segment.startHour}-${segment.dosha}`}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={arcPath(segment.startHour + 0.25, segment.endHour - 0.25, R)}
                  fill="none"
                  stroke={color}
                  strokeOpacity={active ? 0.95 : 0.26}
                  strokeWidth={active ? 14 : 11}
                  strokeLinecap="round"
                  filter={active ? "url(#clock-glow)" : undefined}
                  style={{ transition: "stroke-opacity 0.25s ease, stroke-width 0.25s ease" }}
                />
              </g>
            );
          })}

          {[0, 6, 12, 18].map((hour) => {
            const outer = polar(R + 17, hour);
            return (
              <text
                key={hour}
                x={outer.x}
                y={outer.y + 3}
                textAnchor="middle"
                className="fill-neutral-400 text-[8px] font-medium"
              >
                {hour === 0 ? "00" : String(hour).padStart(2, "0")}
              </text>
            );
          })}

          <motion.g initial={false} transition={{ type: "spring", stiffness: 45, damping: 14 }}>
            <motion.line
              initial={false}
              animate={{ x2: polar(R - 16, circadian.localHour).x, y2: polar(R - 16, circadian.localHour).y }}
              transition={{ type: "spring", stiffness: 45, damping: 14 }}
              x1={CX}
              y1={CY}
              stroke={DOSHAS[circadian.dosha]?.color ?? "#111111"}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <motion.circle
              initial={false}
              animate={{ cx: polar(R - 16, circadian.localHour).x, cy: polar(R - 16, circadian.localHour).y }}
              transition={{ type: "spring", stiffness: 45, damping: 14 }}
              r="3.4"
              fill="#111111"
            />
          </motion.g>

          <circle cx={CX} cy={CY} r="5" fill="#ffffff" stroke="rgba(0,0,0,0.25)" strokeWidth="1.4" />
          <text x={CX} y={CY + 34} textAnchor="middle" className="fill-neutral-950 text-[24px] font-semibold" style={{ letterSpacing: "-0.02em" }}>
            {String(circadian.localHour).padStart(2, "0")}:00
          </text>
          <text x={CX} y={CY + 49} textAnchor="middle" fill={meta.color} className="text-[8px] font-semibold uppercase" style={{ letterSpacing: "0.16em" }}>
            {meta.name} window
          </text>
        </svg>
      </div>

      <motion.div
        key={displayIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.025] p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-neutral-800">{display.label}</span>
          <span className="num text-[9px] uppercase tracking-[0.1em] text-neutral-500">
            {String(display.startHour).padStart(2, "0")}:00 – {String(display.endHour).padStart(2, "0")}:00
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-neutral-500">{display.guidance}</p>
      </motion.div>

      <div className="mt-3 flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
        <span className="inline-flex items-center gap-1"><Sunrise className="h-2.5 w-2.5" /> 06 · kapha</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> 10 · pitta</span>
        <span className="inline-flex items-center gap-1"><Moon className="h-2.5 w-2.5" /> 22 · pitta</span>
      </div>
    </div>
  );
}
