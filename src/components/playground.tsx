"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Reveal, SectionLabel } from "./reveal";

// The built-in questions in priority order: the decision question first, then
// decision.any_of as the engine ships it.
const questions = [
  { key: "answer_wrong", asks: "Is the final answer wrong or only partially correct?" },
  { key: "unsupported_answer", asks: "Does it make claims the evidence does not support?" },
  { key: "missing_tool_calls", asks: "Did the agent skip lookups the task needed?" },
  { key: "answered_on_failure", asks: "Did it answer despite a failed or partial tool call?" },
  { key: "ignored_instructions", asks: "Does it go against the user's instructions?" },
  { key: "contradicts_knowledge", asks: "Does it contradict general knowledge?" },
] as const;

type Key = (typeof questions)[number]["key"];

// Rank-order centroid weights: 0.41, 0.24, 0.16, 0.10, 0.06, 0.03 for six.
const weights = questions.map((_, k) => {
  let sum = 0;
  for (let i = k + 1; i <= questions.length; i++) sum += 1 / i;
  return sum / questions.length;
});

const presets: Record<string, Record<Key, number>> = {
  "Wrong answer": { answer_wrong: 0.91, unsupported_answer: 0.84, missing_tool_calls: 0.3, answered_on_failure: 0.12, ignored_instructions: 0.08, contradicts_knowledge: 0.62 },
  "One check fails": { answer_wrong: 0.22, unsupported_answer: 0.18, missing_tool_calls: 0.12, answered_on_failure: 0.86, ignored_instructions: 0.06, contradicts_knowledge: 0.05 },
  "Correct answer": { answer_wrong: 0.06, unsupported_answer: 0.1, missing_tool_calls: 0.08, answered_on_failure: 0.03, ignored_instructions: 0.05, contradicts_knowledge: 0.04 },
};

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => v.toFixed(2));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

export function Playground() {
  const [answers, setAnswers] = useState<Record<Key, number>>(presets["Wrong answer"]);
  const [keepThreshold, setKeepThreshold] = useState(0.5);
  // decision.thresholds, as in the manual's example: one check that flags too often, raised.
  const [ownThreshold, setOwnThreshold] = useState(true);

  const thresholdOf = (key: Key) => (ownThreshold && key === "contradicts_knowledge" ? 0.7 : keepThreshold);

  const flags: Key[] = questions.filter((q) => answers[q.key] >= thresholdOf(q.key)).map((q) => q.key);
  const pKeep = Math.max(...questions.map((q) => answers[q.key]));
  const severity = questions.reduce((s, q, i) => (flags.includes(q.key) ? s + weights[i] * answers[q.key] : s), 0);

  const keep = flags.length > 0;

  return (
    <section id="playground" className="relative mx-auto max-w-6xl px-6 py-24 md:py-44">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-20">
        <div>
          <SectionLabel>Playground</SectionLabel>
          <Reveal>
            <h2 className="mt-6 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              Any failed check{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">keeps</span> the trace.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              A wrong answer usually fails one check, not all six. Tailwise keeps the trace as soon as
              any check crosses its threshold. Drag the answers and watch the flags.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-2">
              {Object.keys(presets).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setAnswers(presets[name])}
                  className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  {name}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40}>
          <div className="rounded-3xl border border-line bg-paper p-5 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.3)] md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line pb-6">
              <div className="flex gap-6 sm:gap-8">
                <div>
                  <div className="font-mono text-[0.68rem] tracking-[0.2em] text-ink-faint uppercase">p_keep</div>
                  <div className="font-display text-[2.6rem] font-semibold tracking-[-0.05em] text-ink tabular-nums sm:text-5xl md:text-6xl">
                    <AnimatedNumber value={pKeep} />
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[0.68rem] tracking-[0.2em] text-ink-faint uppercase">severity</div>
                  <div
                    className={`font-display text-[2.6rem] font-semibold tracking-[-0.05em] tabular-nums transition-colors sm:text-5xl md:text-6xl ${
                      keep ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    {keep ? <AnimatedNumber value={severity} /> : "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:block sm:text-right">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={keep ? "keep" : "drop"}
                    initial={{ y: 16, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -16, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className={`inline-block rounded-full px-4 py-1.5 font-mono text-sm font-medium ${
                      keep ? "bg-accent text-accent-ink" : "bg-paper-3 text-ink-soft"
                    }`}
                  >
                    {keep ? "keep" : "drop"}
                  </motion.div>
                </AnimatePresence>
                <div className="font-mono text-[0.7rem] text-ink-faint sm:mt-2">
                  {keep ? "above_threshold" : "below_threshold*"}
                </div>
              </div>
            </div>

            {/* flags, as on the log line and eval.flags */}
            <div className="mt-5 flex min-h-7 flex-wrap items-center gap-1.5 font-mono text-[0.7rem]">
              <span className="mr-1 text-ink-faint">flags</span>
              <AnimatePresence initial={false} mode="popLayout">
                {flags.length === 0 ? (
                  <motion.span key="none" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ink-faint">
                    none
                  </motion.span>
                ) : (
                  flags.map((f) => (
                    <motion.span
                      key={f}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className="rounded-full border border-accent/30 bg-accent-wash px-2.5 py-0.5 text-accent"
                    >
                      {f}
                    </motion.span>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 space-y-4">
              {questions.map((q, i) => {
                const t = thresholdOf(q.key);
                const flagged = flags.includes(q.key);
                return (
                  <label key={q.key} className="block">
                    <div className="flex items-baseline justify-between gap-3 font-mono text-[0.72rem]">
                      <span className={`truncate transition-colors ${flagged ? "text-accent" : "text-ink"}`}>
                        <span className="text-ink-faint">{i + 1} </span>
                        {q.key}{" "}
                        <span className="hidden text-ink-faint sm:inline">w {weights[i].toFixed(2)}</span>
                      </span>
                      <span className="shrink-0 text-ink-soft tabular-nums">
                        {answers[q.key].toFixed(2)}
                        <span className="text-ink-faint"> / {t.toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="relative mt-2.5">
                      <input
                        type="range"
                        min={0.01}
                        max={0.99}
                        step={0.01}
                        value={answers[q.key]}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: Number(e.target.value) }))}
                        className={`range ${flagged ? "" : "range-quiet"}`}
                        style={{ "--fill": `${answers[q.key] * 100}%` } as React.CSSProperties}
                        aria-label={q.asks}
                        title={q.asks}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-ink transition-[left] duration-300"
                        style={{ left: `calc(${t * 100}% - 1px)` }}
                      />
                    </div>
                  </label>
                );
              })}

              <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <div className="flex items-baseline justify-between font-mono text-[0.72rem]">
                    <span className="text-ink">policy.keep_threshold</span>
                    <span className="text-ink-soft tabular-nums">{keepThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.95}
                    step={0.01}
                    value={keepThreshold}
                    onChange={(e) => setKeepThreshold(Number(e.target.value))}
                    className="range mt-2.5"
                    style={{ "--fill": `${keepThreshold * 100}%` } as React.CSSProperties}
                    aria-label="Keep threshold"
                  />
                </label>
                <button
                  type="button"
                  aria-pressed={ownThreshold}
                  onClick={() => setOwnThreshold((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 text-left font-mono text-[0.68rem] leading-snug transition-colors ${
                    ownThreshold ? "border-accent/40 bg-accent-wash text-accent" : "border-line text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  thresholds:
                  <br />
                  contradicts_knowledge 0.7
                </button>
              </div>
            </div>
            <p className="mt-5 font-mono text-[0.65rem] leading-relaxed text-ink-faint">
              * below every threshold, policy.random_floor still keeps 2% at random.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
