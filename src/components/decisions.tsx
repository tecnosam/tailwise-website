"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal, SectionLabel } from "./reveal";

type Row = {
  id: string;
  label: "wrong" | "partial" | "correct";
  decision: "keep" | "drop";
  p: number;
  rule: string;
  reason: string;
};

// The shape `make samples` prints: one decision per trace, with Jev's reason.
const rows: Row[] = [
  { id: "a57d9106a210b9f56fba917038ea3be2", label: "wrong", decision: "keep", p: 0.98, rule: "above_threshold", reason: "The final answer contradicts the evidence the agent gathered." },
  { id: "d5ca6bb1e89aa96b4290758d031c7716", label: "correct", decision: "drop", p: 0.04, rule: "below_threshold", reason: "The final answer is correct, complete and supported by the evidence." },
  { id: "3c1e0f7b92d44a8e9b6a51c0de7f2a19", label: "partial", decision: "keep", p: 0.81, rule: "above_threshold", reason: "The final answer leaves out part of what the question asked." },
  { id: "8f20b4d6e1a9437cb05e2f9a6d13c7e4", label: "wrong", decision: "keep", p: 0.93, rule: "above_threshold", reason: "A tool call failed and the agent answered anyway without the information it needed." },
  { id: "b7e93a0c5d1f4e2a8c6b09d4f1e27a35", label: "correct", decision: "drop", p: 0.07, rule: "below_threshold", reason: "The final answer is correct, complete and supported by the evidence." },
];

function Line({ row, index }: { row: Row; index: number }) {
  const keep = row.decision === "keep";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="py-2.5"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-ink-faint">
          {row.id.slice(0, 8)}
          <span className="hidden sm:inline">{row.id.slice(8, 16)}</span>…
        </span>
        <span className="text-ink-soft">
          label=<span className="text-ink">{row.label.padEnd(7, " ")}</span>
        </span>
        <span
          className={`rounded px-1.5 py-px text-[0.7rem] font-medium ${
            keep ? "bg-accent text-accent-ink" : "bg-paper-3 text-ink-soft"
          }`}
        >
          {row.decision}
        </span>
        <span className="text-ink-soft">
          p_keep=<span className={keep ? "text-accent" : "text-ink"}>{row.p.toFixed(3)}</span>
        </span>
        <span className="text-ink-faint">{row.rule}</span>
      </div>
      <div className={`mt-1 pl-4 ${keep ? "text-ink" : "text-ink-faint"}`}>{row.reason}</div>
    </motion.div>
  );
}

export function Decisions() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState("");
  const command = "make samples";

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const type = setInterval(() => {
      i++;
      setTyped(command.slice(0, i));
      if (i >= command.length) {
        clearInterval(type);
        let n = 0;
        const out = setInterval(() => {
          n++;
          setShown(n);
          if (n >= rows.length) clearInterval(out);
        }, 520);
      }
    }, 65);
    return () => clearInterval(type);
  }, [inView]);

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-44">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-20">
        <div className="md:pt-10">
          <SectionLabel>The decision</SectionLabel>
          <Reveal>
            <h2 className="mt-6 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              Skip the triage. Every kept trace says{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">why</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Open a flagged trace and read what went wrong in one sentence, with the checks it failed.
              You fix the agent instead of hunting for the bug.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-8">
              {[
                ["6", "checks on every run, each with its own threshold"],
                ["1", "plain sentence per kept trace, from the same call"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-display text-3xl font-semibold tracking-tight text-ink">{k}</dt>
                  <dd className="mt-1 text-sm leading-snug text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40}>
          <div
            ref={ref}
            className="relative overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.25)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="ml-3 font-mono text-[0.7rem] text-ink-faint">~/tailwise</span>
            </div>
            <div className="min-h-[29rem] px-5 py-4 font-mono text-[0.74rem] leading-relaxed md:text-[0.78rem]">
              <div className="text-ink">
                <span className="text-accent">❯ </span>
                {typed}
                {shown === 0 && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ml-px inline-block h-[1.05em] w-[0.5em] translate-y-[2px] bg-accent"
                  />
                )}
              </div>
              <div className="mt-2 divide-y divide-line">
                {rows.slice(0, shown).map((row, i) => (
                  <Line key={row.id} row={row} index={i} />
                ))}
              </div>
              {shown >= rows.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 text-ink-faint"
                >
                  3 kept · 2 dropped · open http://localhost:6006 →{" "}
                  <span className="text-ink">project tailwise</span>
                </motion.div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
