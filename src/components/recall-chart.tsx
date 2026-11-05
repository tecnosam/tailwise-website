"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { Benchmark, Shown } from "@/lib/benchmark";

const ease = [0.16, 1, 0.3, 1] as const;

const money = (d: number) => `$${d.toFixed(2)}`;

// Failures found in the scenario's reviews: random review, then Tailwise on
// each dataset, with its 95% interval and what Jev cost. The bar's full width
// is every review a failure. Plays on load, since it sits in the hero.
export function RecallChart({
  scenario,
  shown,
  delay = 0,
}: {
  scenario: Benchmark["scenario"];
  shown: Shown[];
  delay?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = scenario.reviews;
  const bars = [
    {
      key: "random",
      label: "Random review",
      detail: `1 in ${scenario.random_reviews_per_failure} reviews`,
      found: scenario.random_found,
      ci: null as number[] | null,
      cost: 0,
      rough: false,
      us: false,
    },
    ...shown.map((s) => ({
      key: s.key,
      label: s.label,
      detail: `1 in ${s.row.reviews_per_failure.toFixed(1)} · 95%: ${Math.round(s.row.found_ci95[0])}–${Math.round(s.row.found_ci95[1])}`,
      found: s.row.found,
      ci: s.row.found_ci95,
      cost: s.row.jev_usd,
      rough: s.row.rough,
      us: true,
    })),
  ];

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-4 font-mono text-[0.68rem] tracking-[0.16em] text-ink-faint uppercase">
        <span>Failures found in {scenario.reviews} reviews</span>
        <span className="tracking-[0.12em]">Model cost</span>
      </figcaption>

      <div className="mt-6 space-y-5" onMouseLeave={() => setHover(null)}>
        {bars.map((r, i) => (
          <div
            key={r.key}
            className="relative outline-none"
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          >
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className={r.us ? "font-medium text-ink" : "text-ink-soft"}>
                {r.label}
                {r.rough && <span className="text-ink-faint">†</span>}
              </span>
              <span className="flex items-baseline gap-3 font-mono tabular-nums">
                <span className="text-ink">{Math.round(r.found)}</span>
                <span className={`w-12 text-right text-xs ${r.cost ? "text-ink-soft" : "text-ink-faint"}`}>
                  {money(r.cost)}
                </span>
              </span>
            </div>
            <div className="relative mt-2 h-3.5 rounded-r bg-paper-3/70">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: delay + i * 0.12, ease }}
                className={`h-full origin-left rounded-r-[4px] transition-opacity ${
                  r.us ? (r.rough ? "bg-accent/55" : "bg-accent") : "bg-ink-faint"
                } ${hover !== null && hover !== i ? "opacity-45" : ""}`}
                style={{ width: `${(r.found / max) * 100}%` }}
              />
              {r.ci && (
                <motion.div
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: delay + 0.9 + i * 0.12 }}
                  className="absolute top-1/2 h-px -translate-y-1/2 bg-ink/45"
                  style={{ left: `${(r.ci[0] / max) * 100}%`, width: `${((r.ci[1] - r.ci[0]) / max) * 100}%` }}
                >
                  <span className="absolute -top-1 left-0 h-2 w-px bg-ink/45" />
                  <span className="absolute -top-1 right-0 h-2 w-px bg-ink/45" />
                </motion.div>
              )}
            </div>
            {hover === i && (
              <div className="pointer-events-none absolute -top-9 right-0 z-10 rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-[0.7rem] whitespace-nowrap text-ink shadow-lg">
                {Math.round(r.found)} found · {r.detail}
              </div>
            )}
          </div>
        ))}
      </div>

      <table className="sr-only">
        <caption>
          Failures found in {scenario.reviews} reviews of {scenario.traces.toLocaleString("en-US")} traces, and what
          the model calls cost
        </caption>
        <thead>
          <tr>
            <th>Method</th>
            <th>Failures found</th>
            <th>95% interval</th>
            <th>Model cost</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td>{Math.round(r.found)}</td>
              <td>{r.ci ? `${Math.round(r.ci[0])} to ${Math.round(r.ci[1])}` : "none"}</td>
              <td>{money(r.cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
