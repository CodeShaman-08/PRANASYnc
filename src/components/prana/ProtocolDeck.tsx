"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Leaf, Salad, ShieldAlert, Sparkles, Sunrise } from "lucide-react";
import type { Advisor, DoshaKey, ProtocolItem } from "@/lib/types";
import { DOSHAS } from "@/lib/prakriti";

type DeckKey = "aharaDiet" | "viharaRoutine" | "herbalSupport";

const DECKS: {
  key: DeckKey;
  title: string;
  sanskrit: string;
  description: string;
  icon: typeof Salad;
  color: string;
  soft: string;
}[] = [
  {
    key: "aharaDiet",
    title: "Diet",
    sanskrit: "Āhāra",
    description: "Taste, timing and thermal quality of what enters the body.",
    icon: Salad,
    color: "#111111",
    soft: "rgba(17,17,17,0.04)",
  },
  {
    key: "viharaRoutine",
    title: "Routine",
    sanskrit: "Vihāra",
    description: "Movement, breath and sleep anchored to the circadian window.",
    icon: Sunrise,
    color: "#555555",
    soft: "rgba(85,85,85,0.05)",
  },
  {
    key: "herbalSupport",
    title: "Herbal support",
    sanskrit: "Auṣadha",
    description: "Traditional rasayanas and infusions matched to the current state.",
    icon: Leaf,
    color: "#888888",
    soft: "rgba(136,136,136,0.06)",
  },
];

function DeckCard({
  deck,
  items,
  defaultOpen,
}: {
  deck: (typeof DECKS)[number];
  items: ProtocolItem[];
  defaultOpen: number;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const Icon = deck.icon;

  return (
    <motion.div
      layout
      className="glass relative flex flex-col overflow-hidden rounded-2xl p-4"
      style={{ backgroundImage: `linear-gradient(160deg, ${deck.soft}, transparent 55%)` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl border"
            style={{ borderColor: `${deck.color}33`, background: `${deck.color}14`, color: deck.color }}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[13px] font-medium text-neutral-900">{deck.title}</div>
            <div className="text-[9px] uppercase tracking-[0.18em]" style={{ color: `${deck.color}aa` }}>
              {deck.sanskrit}
            </div>
          </div>
        </div>
        <span className="num rounded-full border border-neutral-900/8 px-2 py-0.5 text-[9px] text-neutral-500">
          {items.length} steps
        </span>
      </div>

      <p className="mt-2.5 text-[10px] leading-relaxed text-neutral-500">{deck.description}</p>

      <div className="mt-3 flex-1 space-y-1.5">
        {items.map((item, index) => {
          const isOpen = open === index;
          return (
            <div
              key={`${item.title}-${index}`}
              className={`rounded-xl border transition-colors ${
                isOpen ? "border-neutral-900/10 bg-neutral-900/[0.04]" : "border-transparent hover:border-neutral-900/[0.06] hover:bg-neutral-900/[0.02]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-start gap-2.5 px-2.5 py-2 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className="num mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold"
                  style={{ background: `${deck.color}1f`, color: deck.color }}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11.5px] font-medium leading-snug text-neutral-800">{item.title}</span>
                  <span className="mt-0.5 block text-[9px] uppercase tracking-[0.1em] text-neutral-500">{item.timing}</span>
                </span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="mt-1 text-neutral-500">
                  <ChevronDown className="h-3 w-3" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-2.5 pb-2.5 pl-8 text-[10.5px] leading-relaxed text-neutral-600">{item.detail}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function ProtocolDeck({ advisor, aggravated }: { advisor: Advisor; aggravated: DoshaKey }) {
  const meta = DOSHAS[aggravated];
  const isAI = advisor.source === "gemini";

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            <Sparkles className="h-3 w-3" /> Ayurvedic protocol deck
          </div>
          <h2 className="mt-1 text-lg font-medium tracking-tight text-neutral-900">
            Reverse the {meta.name.toLowerCase()} accumulation
          </h2>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em]"
          style={{
            borderColor: isAI ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.15)",
            background: isAI ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)",
            color: isAI ? "#111111" : "#555555",
          }}
          title="Guidance for your current state"
        >
          {isAI ? <Sparkles className="h-2.5 w-2.5" /> : <Leaf className="h-2.5 w-2.5" />}
          Personalized plan
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {DECKS.map((deck, index) => (
          <DeckCard key={deck.key} deck={deck} items={advisor.protocols[deck.key]} defaultOpen={index === 0 ? 0 : -1} />
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-neutral-600/10 bg-neutral-600/[0.03] px-3 py-2">
        <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-neutral-600/70" />
        <p className="text-[9.5px] leading-relaxed text-neutral-700/50">{advisor.safetyNote}</p>
      </div>
    </section>
  );
}
