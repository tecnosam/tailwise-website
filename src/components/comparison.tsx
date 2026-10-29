"use client";

import { motion } from "motion/react";
import { Logo } from "./logo";
import { Reveal } from "./reveal";

type Mark = "yes" | "part" | "no";

const columns = ["Scores every run", "Catches wrong answers", "Cheap at volume"];

const rows: { name: string; how: string; marks: [Mark, Mark, Mark]; us?: boolean }[] = [
  { name: "Random sampling", how: "misses 95% at a 5% rate", marks: ["no", "part", "yes"] },
  { name: "Tail sampling rules", how: "wrong answers raise no errors", marks: ["yes", "no", "yes"] },
  { name: "Evals on the sample", how: "only see what sampling kept", marks: ["no", "part", "part"] },
  { name: "LLM judge on every run", how: "slow and costly at volume", marks: ["yes", "yes", "no"] },
  { name: "Tailwise", how: "one short call per run", marks: ["yes", "yes", "yes"], us: true },
];

const label: Record<Mark, string> = { yes: "Yes", part: "Partly", no: "No" };

function MarkIcon({ mark, strong }: { mark: Mark; strong?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label[mark]}>
      {mark === "yes" && (
        <svg viewBox="0 0 16 16" className={`size-4 ${strong ? "text-accent" : "text-ink"}`} aria-hidden>
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {mark === "part" && (
        <svg viewBox="0 0 16 16" className="size-4 text-ink-soft" aria-hidden>
          <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3a5 5 0 0 1 0 10Z" fill="currentColor" />
        </svg>
      )}
      {mark === "no" && (
        <svg viewBox="0 0 16 16" className="size-4 text-ink-faint" aria-hidden>
          <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      <span className="sr-only">{label[mark]}</span>
    </span>
  );
}

export function Comparison() {
  return (
    <div className="mt-24 md:mt-32">
      <Reveal>
        <h3 className="max-w-3xl font-display text-2xl font-semibold tracking-[-0.03em] text-ink md:text-3xl">
          Every other option misses them, or costs too much.
        </h3>
      </Reveal>

      {/* Wide screens: a comparison table */}
      <Reveal delay={0.05}>
        <div className="mt-8 hidden overflow-hidden rounded-2xl border border-line md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-paper-2/60 font-mono text-[0.68rem] tracking-[0.12em] text-ink-faint uppercase">
                <th className="px-6 py-3.5 font-normal">Approach</th>
                {columns.map((c) => (
                  <th key={c} className="w-40 px-4 py-3.5 text-center font-normal">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className={r.us ? "bg-accent-wash" : "border-b border-line"}
                >
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.02em] ${r.us ? "text-accent" : "text-ink"}`}>
                      {r.us && <Logo className="size-5" />}
                      {r.name}
                      <span className="ml-2 font-sans text-sm font-normal tracking-normal text-ink-faint">{r.how}</span>
                    </span>
                  </td>
                  {r.marks.map((m, j) => (
                    <td key={j} className="px-4 py-4 text-center">
                      <MarkIcon mark={m} strong={r.us} />
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phones: one compact row per approach */}
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line md:hidden">
          {rows.map((r) => (
            <li key={r.name} className={`px-4 py-4 ${r.us ? "bg-accent-wash" : ""}`}>
              <div className={`flex items-center gap-2 font-display font-semibold tracking-[-0.02em] ${r.us ? "text-accent" : "text-ink"}`}>
                {r.us && <Logo className="size-4" />}
                {r.name}
              </div>
              <ul className="mt-2 grid grid-cols-3 gap-2 text-[0.68rem] leading-tight text-ink-soft">
                {r.marks.map((m, j) => (
                  <li key={j} className="flex items-center gap-1.5">
                    <MarkIcon mark={m} strong={r.us} />
                    {columns[j]}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
