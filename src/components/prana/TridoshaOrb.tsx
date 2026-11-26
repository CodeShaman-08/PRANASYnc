"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DOSHAS } from "@/lib/prakriti";

const OrbCanvas = dynamic(() => import("./OrbCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

interface TridoshaOrbProps {
  vata: number;
  pitta: number;
  kapha: number;
  harmony: number;
  className?: string;
  labels?: boolean;
  glow?: boolean;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export default function TridoshaOrb({
  vata,
  pitta,
  kapha,
  harmony,
  className = "",
  labels = false,
  glow = true,
}: TridoshaOrbProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const dominant = vata >= pitta && vata >= kapha ? "vata" : pitta >= kapha ? "pitta" : "kapha";
  const meta = DOSHAS[dominant];

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  return (
    <div className={`relative aspect-square ${className}`} aria-label={`Tridosha energy orb, ${meta.name} dominant, harmony ${harmony}`}>
      {glow && (
        <>
          <div
            className="pointer-events-none absolute inset-[8%] rounded-full blur-3xl opacity-45 animate-breathe"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${meta.color}66, transparent 65%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full border border-neutral-900/5" />
          <div className="pointer-events-none absolute inset-[14%] rounded-full border border-neutral-900/[0.045]" />
        </>
      )}

      <div className="absolute inset-0">
        {webgl === null ? (
          <div className="h-full w-full" />
        ) : webgl ? (
          <OrbCanvas vata={vata} pitta={pitta} kapha={kapha} harmony={harmony} />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              className="animate-breathe absolute h-[62%] w-[62%] rounded-full blur-[2px]"
              style={{
                background: `radial-gradient(circle at 34% 30%, #0002, transparent 38%), radial-gradient(circle at 65% 70%, ${DOSHAS.pitta.color}cc, transparent 58%), radial-gradient(circle at 40% 62%, ${DOSHAS.kapha.color}bb, transparent 55%), radial-gradient(circle at 55% 40%, ${DOSHAS.vata.color}dd, transparent 62%)`,
                boxShadow: `0 0 90px ${meta.color}55`,
              }}
            />
            <div
              className="animate-float absolute h-[74%] w-[74%] rounded-full border border-dashed opacity-40"
              style={{ borderColor: `${meta.color}66` }}
            />
          </div>
        )}
      </div>

      {labels && (
        <>
          <div className="pointer-events-none absolute left-0 top-[52%] -translate-x-2 -translate-y-1/2 sm:-translate-x-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700/25 bg-white/85 px-2 py-0.5 text-[8.5px] font-medium uppercase tracking-[0.12em] text-neutral-800 backdrop-blur">
              Vata {Math.round(vata)}%
            </span>
          </div>
          <div className="pointer-events-none absolute right-0 top-[20%] translate-x-2 sm:translate-x-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-600/25 bg-white/85 px-2 py-0.5 text-[8.5px] font-medium uppercase tracking-[0.12em] text-neutral-700 backdrop-blur">
              Pitta {Math.round(pitta)}%
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-[4%] left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-900/25 bg-white/85 px-2 py-0.5 text-[8.5px] font-medium uppercase tracking-[0.12em] text-neutral-700 backdrop-blur">
              Kapha {Math.round(kapha)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}
