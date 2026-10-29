"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { recall } from "@/lib/benchmark";

const ease = [0.16, 1, 0.3, 1] as const;

// Failures found in a 5% review budget. Plays on load, since it sits in the hero.
export function RecallChart({ delay = 0 }: { delay?: number }) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <figure>
      <figcaption className="font-mono text-[0.68rem] tracking-[0.16em] text-ink-faint uppercase">
        Failures found when you review 5% of traces
      </figcaption>

      <div className="mt-6 space-y-5" onMouseLeave={() => setHover(null)}>
        {recall.map((r, i) => {
          const us = "us" in r && r.us;
          return (
            <div
              key={r.name}
              className="relative outline-none"
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className={us ? "font-medium text-ink" : "text-ink-soft"}>{r.name}</span>
                <span className="font-mono text-ink tabular-nums">
                  {r.found}
                  <span className="text-ink-faint"> of 11</span>
                </span>
              </div>
              <div className="mt-2 h-3.5 rounded-r bg-paper-3/70">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, delay: delay + i * 0.12, ease }}
                  className={`h-full origin-left rounded-r-[4px] transition-opacity ${
                    us ? "bg-accent" : i === 0 ? "bg-ink-faint/45" : "bg-ink-faint"
                  } ${hover !== null && hover !== i ? "opacity-45" : ""}`}
                  style={{ width: `${(r.found / 11) * 100}%` }}
                />
              </div>
              {hover === i && (
                <div className="pointer-events-none absolute -top-9 right-0 z-10 rounded-lg border border-line bg-paper px-3 py-1.5 font-mono text-[0.7rem] whitespace-nowrap text-ink shadow-lg">
                  {r.found} of 11 failures · {r.normalized}% of the way from random to perfect
                </div>
              )}
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Failures found when reviewing 5% of traces, out of 11</caption>
        <thead>
          <tr>
            <th>Method</th>
            <th>Failures found</th>
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
