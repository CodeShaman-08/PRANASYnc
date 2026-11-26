"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CloudFog,
  HeartPulse,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import Brand from "@/components/prana/Brand";
import TridoshaOrb from "@/components/prana/TridoshaOrb";
import { DOSHA_DATASET, DOSHAS, DOSHA_ORDER } from "@/lib/prakriti";

function QuizButton({
  label = "Start your assessment",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href="/onboarding"
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-[12px] font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-8px_rgba(0,0,0,0.18)] ${className}`}
    >
      <Play className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

const STORY = [
  {
    number: "01",
    title: "Your constitution is the constant",
    body: "Eight simple questions reveal your natural balance of Vata, Pitta and Kapha. It stays in your browser — no account, no sign-up, and no personal data sent anywhere.",
    icon: ShieldCheck,
    color: "#111111",
    readouts: ["8 traits", "private by default", "no login"],
  },
  {
    number: "02",
    title: "The environment is the variable",
    body: "Your local weather, air quality and the time of day are added to the picture. Each four-hour window of the Ayurvedic clock carries its own dosha — and your body tends to mirror it.",
    icon: CloudFog,
    color: "#444444",
    readouts: ["local weather", "air quality", "4-hour windows"],
  },
  {
    number: "03",
    title: "Like increases like",
    body: "Heat builds Pitta. Dryness and broken sleep build Vata. Heavy, damp conditions build Kapha. PranaSync compares what is happening inside you with what is happening around you, then shows where the imbalance is forming.",
    icon: Zap,
    color: "#777777",
    readouts: ["everyday signals", "clear explanation", "one harmony score"],
  },
  {
    number: "04",
    title: "The protocol is the output",
    body: "You get a short, readable plan for the next few hours: what to eat, how to move, and which herbs and routines support your current state. Guidance is educational, never a diagnosis.",
    icon: BrainCircuit,
    color: "#9a9a9a",
    readouts: ["food · routine · herbs", "plain language", "safety note included"],
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      const gsap = gsapModule.gsap ?? gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default;
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        gsap.from(".hero-reveal", {
          y: 34,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.15,
        });
        gsap.from(".hero-orb-wrap", {
          scale: 0.82,
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
        });
        gsap.to(".hero-orb-wrap", {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero-glow", {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((element) => {
          gsap.from(element, {
            y: 44,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%" },
          });
        });

        gsap.utils.toArray<HTMLElement>(".story-card").forEach((element) => {
          gsap.from(element, {
            y: 60,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 86%" },
          });
        });

        gsap.to(".marquee-track", {
          xPercent: -50,
          duration: 30,
          ease: "none",
          repeat: -1,
        });
      }, pageRef);
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <div ref={pageRef} className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-900/[0.05] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "#collision", label: "The collision" },
              { href: "#tridoshas", label: "Tridoshas" },
            ].map((item) => (
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
            <Link
              href="/onboarding"
              className="hidden rounded-full px-3 py-1.5 text-[10.5px] font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:inline-flex"
            >
              Take the quiz
            </Link>
          </div>
        </div>
      </header>

      <section ref={heroRef} className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pb-24 lg:pt-36">
        <div className="hero-glow pointer-events-none absolute right-[-10%] top-0 h-[520px] w-[520px] rounded-full bg-neutral-900/[0.12] blur-[110px]" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6">
          <div>
            <div className="hero-reveal inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-neutral-900/[0.03] px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-900 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neutral-900" />
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-600">
                Real-time bio-environmental ayurvedic intelligence
              </span>
            </div>

            <h1 className="hero-reveal mt-5 text-balance text-[42px] font-medium leading-[1.02] tracking-[-0.035em] text-neutral-950 sm:text-[58px] lg:text-[64px]">
              Your biology.
              <br />
              The sky.
              <br />
              <span className="bg-gradient-to-r from-neutral-950 via-neutral-500 to-neutral-950 bg-clip-text font-serif italic text-transparent">
                One signal.
              </span>
            </h1>

            <p className="hero-reveal mt-5 max-w-lg text-[12.5px] leading-[1.8] text-neutral-600">
              PranaSync fuses your Ayurvedic constitution with live climate, air quality and
              biometrics — then tells you exactly which dosha is drifting, why, and what to do in
              the next four hours.
            </p>

            <div className="hero-reveal mt-7 flex flex-wrap items-center gap-2.5">
              <QuizButton label="Start your assessment" />
              <a
                href="#tridoshas"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-900/12 bg-neutral-900/[0.03] px-5 py-3 text-[12px] font-medium text-neutral-800 transition-colors hover:bg-neutral-900/[0.07]"
              >
                Meet the three doshas <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="hero-reveal mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> private by default</span>
              <span className="inline-flex items-center gap-1.5"><HeartPulse className="h-3 w-3" /> built around your body</span>
              <span className="inline-flex items-center gap-1.5"><Moon className="h-3 w-3" /> follows your day</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> works without AI</span>
            </div>
          </div>

          <div className="hero-orb-wrap relative mx-auto w-full max-w-[440px]">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-neutral-800/[0.07] blur-3xl" />
            <TridoshaOrb vata={38} pitta={50} kapha={12} harmony={31} className="w-full" labels />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-soft absolute -left-2 top-[16%] rounded-xl px-2.5 py-2 sm:left-0"
            >
              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                <Moon className="h-2.5 w-2.5 text-neutral-700" /> sleep
              </div>
              <div className="num mt-0.5 text-[13px] font-medium text-neutral-900">4.5 h</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="glass-soft absolute -right-1 top-[34%] rounded-xl px-2.5 py-2 sm:right-0"
            >
              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                <CloudFog className="h-2.5 w-2.5 text-neutral-700" /> pm2.5
              </div>
              <div className="num mt-0.5 text-[13px] font-medium text-neutral-900">180</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
              className="glass-soft absolute bottom-[13%] left-[4%] rounded-xl px-2.5 py-2"
            >
              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                <Thermometer className="h-2.5 w-2.5 text-neutral-700" /> delhi
              </div>
              <div className="num mt-0.5 text-[13px] font-medium text-neutral-900">42.0°C</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="glass-soft absolute bottom-[22%] right-0 rounded-xl px-2.5 py-2"
            >
              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                <HeartPulse className="h-2.5 w-2.5 text-neutral-700" /> harmony
              </div>
              <div className="num mt-0.5 text-[13px] font-medium text-neutral-700">23 / 100</div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative border-y border-neutral-900/[0.05] bg-neutral-900/[0.01] py-3">
        <div className="flex overflow-hidden">
          {[0, 1].map((track) => (
            <div
              key={track}
              className="marquee-track flex shrink-0 items-center gap-8 pr-8"
              aria-hidden={track === 1}
            >
              {Array.from({ length: 3 })
                .flatMap(() => [
                  "Vata · air + ether · mobile",
                  "Pitta · fire + water · transforming",
                  "Kapha · earth + water · stable",
                  "Prakriti · your constant",
                  "Vikriti · your current state",
                  "Dinacharya · the 4-hour clock",
                  "Like increases like",
                ])
                .map((text, index) => (
                  <span
                    key={`${track}-${index}`}
                    className="flex shrink-0 items-center gap-8 whitespace-nowrap text-[9px] uppercase tracking-[0.24em] text-neutral-400"
                  >
                    {text}
                    <span className="h-1 w-1 rounded-full bg-neutral-300" />
                  </span>
                ))}
            </div>
          ))}
        </div>
      </div>

      <section id="collision" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="reveal-up text-[9px] font-semibold uppercase tracking-[0.24em] text-neutral-700/60">
              The collision model
            </div>
            <h2 className="reveal-up mt-3 text-balance text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-neutral-950 sm:text-[38px]">
              Ayurveda already knew:
              <br />
              <span className="text-neutral-600">context is biology.</span>
            </h2>
            <p className="reveal-up mt-4 max-w-sm text-[12px] leading-[1.8] text-neutral-500">
              Most wellness apps track one stream. PranaSync models the collision between two —
              your internal state and the environment pressing on it — then resolves both into a
              single signal you can act on.
            </p>
            <div className="reveal-up mt-6 flex items-center gap-3">
              <div className="flex -space-x-1">
                {DOSHA_ORDER.map((key) => (
                  <span
                    key={key}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white text-[9px]"
                    style={{ background: DOSHAS[key].soft, color: DOSHAS[key].color }}
                  >
                    {DOSHAS[key].glyph}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-neutral-500">Based on the Prakriti200 trait model</span>
            </div>
          </div>

          <div className="space-y-3">
            {STORY.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.number}
                  className="story-card glass group relative overflow-hidden rounded-2xl p-5 transition-colors hover:border-neutral-900/20 sm:p-6"
                >
                  <div
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-[0.12] blur-3xl transition-opacity group-hover:opacity-25"
                    style={{ background: item.color }}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                      style={{ borderColor: `${item.color}30`, background: `${item.color}12`, color: item.color }}
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="num text-[9px] font-semibold tracking-[0.16em]" style={{ color: `${item.color}aa` }}>
                          {item.number}
                        </span>
                        <span className="h-px w-6" style={{ background: `${item.color}44` }} />
                      </div>
                      <h3 className="mt-1.5 text-[16px] font-medium tracking-tight text-neutral-900">{item.title}</h3>
                      <p className="mt-2 text-[11.5px] leading-[1.75] text-neutral-500">{item.body}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.readouts.map((readout) => (
                          <span
                            key={readout}
                            className="rounded-full border border-neutral-900/[0.07] bg-neutral-900/[0.025] px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-neutral-500"
                          >
                            {readout}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="tridoshas" className="relative border-y border-neutral-900/[0.05] bg-neutral-900/[0.012] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="reveal-up max-w-2xl">
            <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-neutral-700/60">
              The three doshas
            </div>
            <h2 className="mt-3 text-balance text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-neutral-950 sm:text-[38px]">
              Vata, Pitta, Kapha —
              <span className="text-neutral-600"> three patterns, one body.</span>
            </h2>
            <p className="mt-3 text-[12px] leading-[1.8] text-neutral-600">
              Every body carries all three. The Prakriti200 trait model reads eight observable
              patterns — build, skin, appetite, digestion, sleep, climate, mind and stress — to
              show your natural mix and where it is shifting.
            </p>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {DOSHA_ORDER.map((key) => {
              const meta = DOSHAS[key];
              const data = DOSHA_DATASET[key];
              return (
                <article
                  key={key}
                  className="reveal-up glass-soft group relative overflow-hidden rounded-2xl p-5 transition-all hover:border-neutral-900/20"
                >
                  <div
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-[0.1] blur-3xl"
                    style={{ background: meta.color }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-xl border text-[12px]"
                        style={{ borderColor: `${meta.color}30`, background: `${meta.color}12`, color: meta.color }}
                      >
                        {meta.glyph}
                      </span>
                      <div>
                        <h3 className="text-[15px] font-medium tracking-tight text-neutral-900">{meta.name}</h3>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-500">{meta.element}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-neutral-500">{meta.qualities}</p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
                    {data.traits.map((trait) => (
                      <div key={trait.label}>
                        <dt className="text-[8px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                          {trait.label}
                        </dt>
                        <dd className="mt-0.5 text-[10px] leading-relaxed text-neutral-700">{trait.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 grid gap-2 border-t border-neutral-900/[0.06] pt-3">
                    <p className="text-[10px] leading-relaxed text-neutral-600">
                      <span className="font-medium text-neutral-800">In balance</span> — {data.balanced}
                    </p>
                    <p className="text-[10px] leading-relaxed text-neutral-500">
                      <span className="font-medium text-neutral-700">Out of balance</span> — {data.aggravated}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-4 text-[9px] leading-relaxed text-neutral-400">
            Trait model: Prakriti200. Educational guidance, not medical advice.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="reveal-up relative overflow-hidden rounded-3xl border border-neutral-900/[0.08] bg-gradient-to-br from-neutral-900/[0.08] via-neutral-50 to-neutral-900/[0.06] p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neutral-800/[0.12] blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                <Sparkles className="h-3 w-3" /> what-if simulator
              </div>
              <h2 className="mt-3 text-balance text-[30px] font-medium leading-[1.1] tracking-[-0.025em] text-neutral-950 sm:text-[40px]">
                See a Pitta crash
                <span className="font-serif italic text-neutral-700"> before you feel it.</span>
              </h2>
              <p className="mt-3 max-w-md text-[12px] leading-[1.8] text-neutral-600">
                The simulator ships with a Delhi heatwave preset — 42°C, polluted air, 4.5 hours of
                sleep. Once you have a baseline, open the dashboard and load it to watch your
                harmony shift and the plan update in real time.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <QuizButton label="Build my baseline" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Thermometer, label: "Ambient", value: "42.0°C", tone: "#444444" },
                { icon: CloudFog, label: "PM2.5", value: "180", tone: "#444444" },
                { icon: Moon, label: "Sleep", value: "4.5 h", tone: "#111111" },
                { icon: HeartPulse, label: "HRV", value: "38 ms", tone: "#666666" },
                { icon: Activity, label: "Stress", value: "8 / 10", tone: "#444444" },
                { icon: Wind, label: "Harmony", value: "23 / 100", tone: "#666666" },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-xl border border-neutral-900/[0.07] bg-neutral-100 p-3">
                    <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.14em] text-neutral-500">
                      <Icon className="h-2.5 w-2.5" style={{ color: metric.tone }} /> {metric.label}
                    </div>
                    <div className="num mt-1 text-[15px] font-medium text-neutral-900">{metric.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="reveal-up relative overflow-hidden rounded-3xl border border-neutral-900/[0.08] bg-neutral-900/[0.02] px-6 py-12 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-[420px] -translate-x-1/2 rounded-full bg-neutral-900/[0.1] blur-[80px]" />
          <div className="relative">
            <div className="text-[9px] font-semibold uppercase tracking-[0.26em] text-neutral-500">
              Your next four hours are already written in the weather
            </div>
            <h2 className="mx-auto mt-3 max-w-2xl text-balance text-[30px] font-medium leading-[1.1] tracking-[-0.025em] text-neutral-950 sm:text-[42px]">
              Stop guessing.
              <span className="font-serif italic text-neutral-600"> Start syncing.</span>
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <QuizButton label="Start the 8-question quiz" />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] text-neutral-400">
              {["No sign-up", "No account", "Private by default", "Works without AI"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-2.5 w-2.5 text-neutral-900/70" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-900/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <Brand />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[9px] uppercase tracking-[0.12em] text-neutral-400">
            <span>Local weather & air quality</span>
            <span>Optional AI guidance</span>
            <span>Your data stays in this browser</span>
          </div>
          <p className="max-w-[220px] text-center text-[8.5px] leading-relaxed text-neutral-400 sm:text-right">
            Educational Ayurvedic guidance, not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
