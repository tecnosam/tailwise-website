"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { SectionLabel } from "./reveal";

const steps = [
  {
    key: "ingest",
    title: "Ingest",
    body: "Send OpenTelemetry spans over gRPC or HTTP, or post JSON. No SDK to add.",
    detail: ["OTLP gRPC :4317", "OTLP HTTP :4318", "POST /v1/traces :8080"],
  },
  {
    key: "queue",
    title: "Queue",
    body: "Every trace lands in NATS JetStream before Tailwise replies, so a crash never loses one.",
    detail: ["TAILWISE_TRACES", "redelivery + backoff", "dead-letter stream"],
  },
  {
    key: "slice",
    title: "Slice",
    body: "Tailwise turns the run into the question, the tool calls, the evidence and the answer.",
    detail: ["question", "tool_calls[]", "evidence[]", "final_answer"],
  },
  {
    key: "score",
    title: "Score",
    body: "Six questions go to a System One model in one call. Jev by default, or your own model per agent.",
    detail: ["answer_wrong 0.91", "unsupported_answer 0.84", "why_wrong → cause"],
  },
  {
    key: "decide",
    title: "Decide",
    body: "One failed check keeps the trace. A 2% random sample of the rest shows you what the checks missed.",
    detail: ["any answer ≥ its threshold → keep", "flags + severity", "random_floor 0.02, else drop"],
  },
  {
    key: "export",
    title: "Export",
    body: "Kept traces reach Phoenix, Langfuse or any OTLP back end, with flags and a reason attached.",
    detail: ["Arize Phoenix", "Langfuse", "OTel Collector"],
  },
];

export function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)))),
  );
  const width = useTransform(progress, [0, 1], ["0%", "100%"]);
  const step = steps[active];

  return (
    <section
      id="how"
      ref={ref}
      className="relative h-[calc(var(--steps)*55svh+50svh)] md:h-[calc(var(--steps)*70vh+60vh)]"
      style={{ "--steps": steps.length } as React.CSSProperties}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 max-w-2xl font-display text-[2rem] leading-[1.02] sm:mt-6 sm:text-4xl font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
            Drops in beside your agent.{" "}
            <span className="font-serif font-normal tracking-[-0.02em] text-ink-faint italic">Never in its way.</span>
          </h2>

          {/* Track */}
          <div className="relative mt-10 sm:mt-14 md:mt-20">
            <div className="absolute top-[11px] right-0 left-0 h-px bg-line-strong" />
            <motion.div style={{ width }} className="absolute top-[11px] left-0 h-px bg-accent" />
            <ol className="relative grid grid-cols-6">
              {steps.map((s, i) => {
                const on = i <= active;
                return (
                  <li key={s.key} className="flex flex-col items-start">
                    <span className="relative grid size-[23px] place-items-center">
                      <motion.span
                        animate={{
                          scale: i === active ? 1 : 0.55,
                          backgroundColor: on ? "var(--accent)" : "var(--paper-3)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="absolute inset-0 rounded-full"
                      />
                      {i === active && (
                        <motion.span
                          className="absolute -inset-2 rounded-full border border-accent/40"
                          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        />
                      )}
                    </span>
                    <span
                      className={`mt-4 font-mono text-[0.62rem] tracking-[0.15em] uppercase transition-colors md:text-[0.7rem] ${
                        on ? "text-ink" : "text-ink-faint"
                      }`}
                    >
                      <span className="hidden sm:inline">0{i + 1} · </span>
                      {s.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Active step */}
          <div className="mt-8 grid min-h-[16rem] grid-cols-[minmax(0,1fr)] gap-6 sm:mt-12 sm:gap-8 md:mt-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-5xl text-accent italic sm:text-6xl md:text-8xl">{active + 1}</span>
                  <h3 className="font-display text-[1.75rem] font-semibold sm:text-3xl tracking-[-0.04em] text-ink md:text-5xl">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:mt-5 sm:text-lg">{step.body}</p>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.ul
                key={step.key}
                className="flex flex-wrap gap-1.5 self-center font-mono text-[0.72rem] md:flex-col md:gap-2 md:text-sm"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ show: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
              >
                {step.detail.map((d) => (
                  <motion.li
                    key={d}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-center gap-2 rounded-full border border-line bg-paper/90 px-3 py-1.5 text-ink md:gap-3 md:rounded-xl md:px-4 md:py-3"
                  >
                    <span className="size-1.5 rounded-full bg-accent" />
                    {d}
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
