"use client";

import { motion } from "framer-motion";
import { DOSHAS, DOSHA_ORDER } from "@/lib/prakriti";
import type { DoshaTriplet } from "@/lib/types";

const SIZE = 300;
const CX = 150;
const CY = 152;
const R = 96;
const ANGLES: Record<"vata" | "pitta" | "kapha", number> = {
  vata: -90,
  pitta: 30,
  kapha: 150,
};

function pointFor(value: number, angle: number, radiusScale = 1) {
  const radians = (angle * Math.PI) / 180;
  const r = (Math.max(0, Math.min(100, value)) / 100) * R * radiusScale;
  return { x: CX + Math.cos(radians) * r, y: CY + Math.sin(radians) * r };
}

function polygonPoints(values: DoshaTriplet, radiusScale = 1) {
  return DOSHA_ORDER.map((key) => {
    const { x, y } = pointFor(values[key], ANGLES[key], radiusScale);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export default function PrakritiRadar({
  vata,
  pitta,
  kapha,
  className = "",
  compact = false,
}: {
  vata: number;
  pitta: number;
  kapha: number;
  className?: string;
  compact?: boolean;
}) {
  const values = { vata, pitta, kapha };
  const dominant = DOSHA_ORDER.reduce((best, key) => (values[key] > values[best] ? key : best), "vata");
  const points = polygonPoints(values);

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={DOSHAS[dominant].color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={DOSHAS[dominant].color} stopOpacity="0.08" />
          </radialGradient>
          <filter id="radar-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={polygonPoints({ vata: 100, pitta: 100, kapha: 100 }, scale)}
            fill="none"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={scale === 1 ? 1.2 : 0.7}
            strokeDasharray={scale === 1 ? "0" : "2 5"}
          />
        ))}

        {DOSHA_ORDER.map((key) => {
          const axisEnd = pointFor(100, ANGLES[key]);
          return (
            <line
              key={key}
              x1={CX}
              y1={CY}
              x2={axisEnd.x}
              y2={axisEnd.y}
              stroke="rgba(0,0,0,0.10)"
              strokeWidth="0.8"
            />
          );
        })}

        <motion.polygon
          initial={false}
          animate={{ points }}
          transition={{ type: "spring", stiffness: 90, damping: 16 }}
          fill="url(#radar-fill)"
          stroke={DOSHAS[dominant].color}
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#radar-glow)"
        />

        {DOSHA_ORDER.map((key) => {
          const dot = pointFor(values[key], ANGLES[key]);
          return (
            <g key={key}>
              <motion.circle
                initial={false}
                animate={{ cx: dot.x, cy: dot.y }}
                transition={{ type: "spring", stiffness: 90, damping: 16 }}
                r={4.2}
                fill={DOSHAS[key].color}
                stroke="#ffffff"
                strokeWidth="1.6"
              />
            </g>
          );
        })}

        {DOSHA_ORDER.map((key) => {
          const label = pointFor(118, ANGLES[key]);
          const anchor = key === "vata" ? "middle" : key === "pitta" ? "start" : "end";
          return (
            <g key={`label-${key}`}>
              <text
                x={label.x}
                y={label.y - 2}
                textAnchor={anchor}
                className="fill-neutral-500 text-[9px] font-medium uppercase"
                style={{ letterSpacing: "0.14em" }}
              >
                {DOSHAS[key].name}
              </text>
              {!compact && (
                <text
                  x={label.x}
                  y={label.y + 11}
                  textAnchor={anchor}
                  fill={DOSHAS[key].color}
                  className="text-[11px] font-semibold"
                >
                  {Math.round(values[key])}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
