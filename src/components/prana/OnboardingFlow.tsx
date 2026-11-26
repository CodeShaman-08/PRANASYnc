"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { usePrana } from "@/context/PranaContext";
import { computePrakriti, DOSHAS, DOSHA_ORDER, QUIZ_QUESTIONS } from "@/lib/prakriti";
import type { DoshaTriplet } from "@/lib/types";
import Brand from "@/components/prana/Brand";
import PrakritiRadar from "@/components/prana/PrakritiRadar";

const LETTERS = ["A", "B", "C"];

export default function OnboardingFlow() {
  const router = useRouter();
  const { savePrakriti, prakriti: saved, profileName } = usePrana();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState(profileName === "Seeker" ? "" : profileName);
  const timer = useRef<number | null>(null);

  const complete = step >= QUIZ_QUESTIONS.length;
  const current = QUIZ_QUESTIONS[Math.min(step, QUIZ_QUESTIONS.length - 1)];
  const live = useMemo(() => computePrakriti(answers), [answers]);
  const progress = Math.min(1, step / QUIZ_QUESTIONS.length);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const select = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setDirection(1);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setStep((value) => Math.min(QUIZ_QUESTIONS.length, value + 1));
    }, 240);
  };

  const back = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setDirection(-1);
    setStep((value) => Math.max(0, value - 1));
  };

  const finish = () => {
    savePrakriti(live, name || undefined);
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-neutral-900/[0.09] blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-neutral-800/[0.06] blur-[110px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="hidden text-[9px] uppercase tracking-[0.18em] text-neutral-500 sm:inline">
            Prakriti assessment
          </span>
          <Link
            href="/"
            className="rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2.5 py-1.5 text-[9.5px] text-neutral-600 transition-colors hover:text-neutral-800"
          >
            Exit
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl items-start gap-5 px-4 pb-10 pt-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
        <aside className="glass relative overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-neutral-900/10 blur-3xl" />
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Live constitution map
          </div>
          <h2 className="mt-1.5 text-[16px] font-medium tracking-tight text-neutral-900">
            Prakriti baseline
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-neutral-500">
            Your triangle updates with every answer. This becomes the static reference your daily
            Vikriti is measured against.
          </p>

          <PrakritiRadar
            vata={live.vata}
            pitta={live.pitta}
            kapha={live.kapha}
            className="mx-auto mt-1 w-full max-w-[290px]"
          />

          <div className="mt-2 space-y-2">
            {DOSHA_ORDER.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-10 text-[9px] font-medium uppercase tracking-[0.1em] text-neutral-500">
                  {DOSHAS[key].name}
                </span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-900/[0.05]">
                  <motion.div
                    initial={false}
                    animate={{ width: `${live[key]}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${DOSHAS[key].deep}, ${DOSHAS[key].color})` }}
                  />
                </div>
                <span className="num w-9 text-right text-[10px] text-neutral-700">{Math.round(live[key])}%</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.02] p-3">
            <div className="text-[8.5px] uppercase tracking-[0.16em] text-neutral-400">Current read</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[15px] font-medium text-neutral-950">{live.dominantType}</span>
              <span className="text-[9px] text-neutral-500">dominant constitution</span>
            </div>
          </div>

          {saved && (
            <p className="mt-3 text-[9px] text-neutral-400">
              Previous baseline: <span className="text-neutral-600">{saved.dominantType}</span> · completing this quiz will replace it.
            </p>
          )}
        </aside>

        <section className="relative">
          <div className="mb-3 flex items-center gap-2">
            {QUIZ_QUESTIONS.map((question, index) => (
              <button
                key={question.id}
                type="button"
                aria-label={`Go to question ${index + 1}`}
                onClick={() => {
                  if (index < step) {
                    setDirection(-1);
                    setStep(index);
                  }
                }}
                className="group relative h-1 flex-1 overflow-hidden rounded-full bg-neutral-900/[0.07]"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{ width: index < step ? "100%" : index === step ? "45%" : "0%" }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background:
                      index < step
                        ? "linear-gradient(90deg, #111111, #555555, #999999)"
                        : "rgba(0,0,0,0.35)",
                  }}
                />
              </button>
            ))}
          </div>

          <div className="relative min-h-[430px]">
            <AnimatePresence mode="wait" custom={direction}>
              {!complete ? (
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 32, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: direction * -32, filter: "blur(4px)" }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="glass relative overflow-hidden rounded-2xl p-5 sm:p-7"
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-neutral-800/[0.06] blur-3xl" />
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                      <span className="num text-neutral-700">{String(step + 1).padStart(2, "0")}</span>
                      / {String(QUIZ_QUESTIONS.length).padStart(2, "0")}
                      <span className="h-1 w-1 rounded-full bg-neutral-300" />
                      {current.trait}
                    </span>
                    <span className="text-[8.5px] uppercase tracking-[0.14em] text-neutral-400">{current.hint}</span>
                  </div>

                  <h1 className="mt-5 text-balance text-[23px] font-medium leading-[1.25] tracking-[-0.015em] text-neutral-950 sm:text-[27px]">
                    {current.prompt}
                  </h1>

                  <div className="mt-5 space-y-2.5">
                    {current.options.map((option, index) => {
                      const selected = answers[current.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => select(current.id, option.id)}
                          className={`group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                            selected
                              ? "border-neutral-700/40 bg-neutral-700/[0.09]"
                              : "border-neutral-900/[0.07] bg-neutral-900/[0.02] hover:border-neutral-900/15 hover:bg-neutral-900/[0.05]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[9px] font-semibold transition-colors ${
                              selected
                                ? "border-neutral-700/50 bg-neutral-700/20 text-neutral-800"
                                : "border-neutral-900/10 bg-neutral-900/[0.03] text-neutral-500 group-hover:text-neutral-700"
                            }`}
                          >
                            {selected ? <Check className="h-3 w-3" /> : LETTERS[index]}
                          </span>
                          <span className={`text-[12px] leading-relaxed ${selected ? "text-neutral-900" : "text-neutral-700"}`}>
                            {option.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={back}
                      disabled={step === 0}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-neutral-900/[0.02] px-3 py-1.5 text-[10px] font-medium text-neutral-600 transition-colors hover:text-neutral-800 disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                    <span className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                      Select one · auto-advances
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="glass relative overflow-hidden rounded-2xl p-5 sm:p-7"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
                  <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-700/70">
                    <Sparkles className="h-3 w-3" /> Baseline locked
                  </div>
                  <h1 className="mt-3 text-balance text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-neutral-950 sm:text-[30px]">
                    You are <span className="text-neutral-800">{live.dominantType}</span>.
                  </h1>
                  <p className="mt-2 max-w-lg text-[11.5px] leading-relaxed text-neutral-600">
                    A {live.dominantType} constitution reads the world through its own element mix.
                    PranaSync will now compare this baseline against live weather, air quality and
                    your biometrics to compute today&apos;s Vikriti.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {DOSHA_ORDER.map((key) => (
                      <div
                        key={key}
                        className="rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.02] p-3"
                        style={{ backgroundImage: `linear-gradient(160deg, ${DOSHAS[key].soft}, transparent)` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-neutral-700">{DOSHAS[key].name}</span>
                          <span className="num text-[15px] font-semibold" style={{ color: DOSHAS[key].color }}>
                            {Math.round(live[key])}%
                          </span>
                        </div>
                        <div className="mt-1 text-[8px] uppercase tracking-[0.1em] text-neutral-500">
                          {DOSHAS[key].element}
                        </div>
                        <div className="mt-1.5 text-[8.5px] leading-relaxed text-neutral-400">
                          {DOSHAS[key].qualities}
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="mt-5 block">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      What should we call you? (optional)
                    </span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value.slice(0, 40))}
                      placeholder="Seeker"
                      className="mt-1.5 w-full rounded-xl border border-neutral-900/10 bg-neutral-900/[0.03] px-3 py-2.5 text-[12px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-700/40"
                    />
                  </label>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={finish}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-[11.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
                    >
                      Open my dashboard <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnswers({});
                        setDirection(-1);
                        setStep(0);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/10 bg-neutral-900/[0.03] px-3.5 py-2.5 text-[10.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-900/[0.06]"
                    >
                      Retake quiz
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3 flex items-center justify-between text-[9px] text-neutral-400">
            <span>8 traits · Prakriti200-inspired</span>
            <span className="num">{Math.round(progress * 100)}% complete</span>
          </div>
        </section>
      </main>
    </div>
  );
}
