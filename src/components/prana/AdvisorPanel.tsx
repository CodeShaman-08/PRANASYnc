"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Quote, Sparkles, TriangleAlert } from "lucide-react";
import { DOSHAS } from "@/lib/prakriti";
import type { Advisor } from "@/lib/types";

export default function AdvisorPanel({
  advisor,
  generatedAt,
  harmonyScore,
}: {
  advisor: Advisor;
  generatedAt: string;
  harmonyScore: number;
}) {
  const isAI = advisor.source === "gemini";
  const time = new Date(generatedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.section
      layout
      className="glass relative overflow-hidden rounded-2xl p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neutral-900/[0.08] blur-3xl" />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-700/70">
              <BrainCircuit className="h-3 w-3" /> What is happening
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-300" />
            <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-400">
              {isAI ? "Personalized" : "PranaSync guidance"} · {time}
            </span>
          </div>

          <motion.h2
            key={advisor.headline}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-3 text-balance text-[22px] font-medium leading-[1.2] tracking-[-0.015em] text-neutral-950 sm:text-[26px]"
          >
            {advisor.headline}
          </motion.h2>

          <motion.p
            key={advisor.rootCauseSummary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-3 max-w-xl text-[12px] leading-[1.75] text-neutral-600"
          >
            {advisor.rootCauseSummary}
          </motion.p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1 text-[9.5px] text-neutral-600">
              <Sparkles className="h-2.5 w-2.5 text-neutral-700" /> Harmony {harmonyScore}/100
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1 text-[9.5px] text-neutral-600">
              <Quote className="h-2.5 w-2.5 text-neutral-500" /> {advisor.keyTriggers.length} key triggers
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <TriangleAlert className="h-3 w-3" /> Key triggers
          </div>
          {advisor.keyTriggers.map((trigger, index) => {
            const meta = DOSHAS[trigger.dosha] ?? DOSHAS.vata;
            return (
              <motion.div
                key={`${trigger.title}-${index}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className="rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.022] p-3 transition-colors hover:border-neutral-900/10 hover:bg-neutral-900/[0.04]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[11.5px] font-medium text-neutral-800">
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[7px]"
                      style={{ background: meta.soft, color: meta.color }}
                    >
                      {meta.glyph}
                    </span>
                    {trigger.title}
                  </span>
                  <span
                    className="text-[8px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: `${meta.color}bb` }}
                  >
                    {meta.name}
                  </span>
                </div>
                <p className="mt-1.5 pl-6 text-[10px] leading-relaxed text-neutral-500">{trigger.evidence}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
