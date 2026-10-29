"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal, SectionLabel } from "./reveal";

const ease = [0.16, 1, 0.3, 1] as const;

// Failures found when reviewing 5% of 456 held-out traces, 1 in 10 of them wrong.
const recall = [
  { name: "Perfect reviewer", found: 11, detail: "every failure fits in the 5%" },
  { name: "Jev, Tailwise's default model", found: 8.4, detail: "74% of the way from random to perfect", us: true },
  { name: "Six simple rules", found: 6.9, detail: "59% of the way from random to perfect" },
  { name: "Random sampling", found: 1.1, detail: "the baseline: 0%" },
];

const verdict =
  "The answer appears to be incorrect because the agent searched for only one of the two magazines and never compared their founding dates, so…";

// A chat model writes its verdict word by word; a System One model returns numbers.
function DecideVsWrite() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [typed, setTyped] = useState(0);
  const [scored, setScored] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const score = setTimeout(() => setScored(true), 350);
    const type = setInterval(() => setTyped((n) => (n >= verdict.length ? n : n + 1)), 38);
    return () => {
      clearTimeout(score);
      clearInterval(type);
    };
  }, [inView]);

  return (
    <div ref={ref} className="grid grid-cols-[minmax(0,1fr)] gap-3 font-mono text-[0.74rem] leading-relaxed sm:text-[0.78rem]">
      <div className="rounded-2xl border border-line bg-paper-2/60 p-5">
        <div className="flex items-center justify-between text-[0.68rem] tracking-[0.12em] text-ink-faint uppercase">
          <span>Chat model (LLM)</span>
          <span className="normal-case tracking-normal">writes a verdict, token by token</span>
        </div>
        <p className="mt-3 min-h-[4.5em] text-ink-soft">
          {verdict.slice(0, typed)}
          {typed < verdict.length && <span className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[2px] animate-pulse bg-ink-faint" />}
        </p>
      </div>
      <div className="rounded-2xl border border-accent/40 bg-accent-wash p-5">
        <div className="flex items-center justify-between text-[0.68rem] tracking-[0.12em] text-accent uppercase">
          <span>System One model</span>
          <span className="normal-case tracking-normal text-ink-soft">reads the trace once, decides</span>
        </div>
        <div className="mt-3 flex min-h-[1.75em] flex-wrap gap-x-5 gap-y-1 text-ink">
          {[
            ["answer_wrong", "0.91"],
            ["missing_tool_calls", "0.88"],
            ["why_wrong", "wrong_lookup"],
          ].map(([k, v], i) => (
            <motion.span
              key={k}
              initial={{ opacity: 0, y: 6 }}
              animate={scored ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05, ease }}
            >
              <span className="text-ink-faint">{k} </span>
              <span className="text-accent">{v}</span>
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecallChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hover, setHover] = useState<number | null>(null);

  return (
    <figure ref={ref}>
      <figcaption className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">
        Failures found when you review 5% of traces
      </figcaption>
      <p className="mt-1 text-sm text-ink-faint">Out of the 11 failures a perfect reviewer would find in that 5%</p>

      <div className="mt-8 space-y-5" onMouseLeave={() => setHover(null)}>
        {recall.map((r, i) => (
          <div
            key={r.name}
            className="relative"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
          >
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className={r.us ? "font-medium text-ink" : "text-ink-soft"}>{r.name}</span>
              <span className="font-mono text-ink tabular-nums">
                {r.found}
                <span className="text-ink-faint"> of 11</span>
              </span>
            </div>
            <div className="mt-2 h-3.5 rounded-r bg-paper-3/70">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease }}
                className={`h-full origin-left rounded-r-[4px] ${
                  r.us ? "bg-accent" : i === 0 ? "bg-ink-faint/50" : "bg-ink-faint"
                } ${hover !== null && hover !== i ? "opacity-50" : ""} transition-opacity`}
                style={{ width: `${(r.found / 11) * 100}%` }}
              />
            </div>
            {hover === i && (
              <div className="pointer-events-none absolute -top-9 right-0 z-10 rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-[0.7rem] whitespace-nowrap text-ink shadow-lg">
                {r.found} of 11 · {r.detail}
              </div>
            )}
          </div>
        ))}
      </div>

      <table className="sr-only">
        <caption>Failures found when reviewing 5% of traces</caption>
        <thead>
          <tr>
            <th>Method</th>
            <th>Failures found, of 11</th>
          </tr>
        </thead>
        <tbody>
          {recall.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.found}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const stats = [
  ["7×", "more failures caught", "than a random sample of the same size: 8.4 of 11 against 1.1."],
  ["0 ms", "added to your agent", "Scoring runs after your user has the answer."],
  ["~3¢", "per 1,000 traces", "Cheap enough to score every run, at 100k traces a day for about $100 a month."],
];

export function Results() {
  return (
    <section id="results" className="relative mx-auto max-w-6xl px-6 py-24 md:py-40">
      <SectionLabel>Results</SectionLabel>
      <Reveal>
        <h2 className="mt-6 max-w-4xl font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
          Review the same number of traces. Find{" "}
          <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">7× the failures</span>.
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="mt-14 grid grid-cols-[minmax(0,1fr)] border-y border-line md:grid-cols-3 md:divide-x md:divide-line">
          {stats.map(([n, title, body], i) => (
            <li key={n} className={`py-7 md:px-8 md:first:pl-0 ${i ? "border-t border-line md:border-t-0" : ""}`}>
              <div className="font-display text-6xl font-semibold tracking-[-0.05em] text-accent md:text-7xl">{n}</div>
              <div className="mt-2 font-medium text-ink">{title}</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-20">
        <Reveal>
          <RecallChart />
        </Reveal>
        <Reveal delay={0.1} y={32}>
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">
            Why every run costs so little
          </h3>
          <p className="mt-1 mb-6 text-sm text-ink-faint">
            A System One model returns numbers in one read. A chat model writes a paragraph.
          </p>
          <DecideVsWrite />
        </Reveal>
      </div>

      <p className="mt-14 max-w-4xl text-xs leading-relaxed text-ink-faint">
        Benchmark: 456 held-out traces from a ReAct agent on HotpotQA questions, 1 in 10 wrong, averaged
        over 20 resampled test sets. Jev, the default model, scored on its answer_wrong question alone.
        The five extra checks Tailwise now runs are not yet benchmarked. Jev ranks a wrong trace above a
        right one 81% of the time (simple rules: 70%). Cost: Jev usage on 13 Oct 2026, 901 traces of
        about 820 tokens for $0.03.
      </p>
    </section>
  );
}
