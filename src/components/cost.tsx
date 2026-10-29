"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { cost, dollarsPerToken } from "@/lib/benchmark";
import { Reveal, SectionLabel } from "./reveal";

// Traces per day on a log scale, so the slider covers 1k to 10M evenly.
const MIN = Math.log10(1_000);
const MAX = Math.log10(10_000_000);

const fmtCount = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;

const fmtMoney = (d: number) =>
  d < 1 ? `$${d.toFixed(2)}` : d < 100 ? `$${d.toFixed(1)}` : `$${Math.round(d).toLocaleString("en-US")}`;

function Money({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, fmtMoney);
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [mv, value]);
  return <motion.span className={className}>{text}</motion.span>;
}

export function Cost() {
  const [exp, setExp] = useState(5); // 100k a day
  const [tokens, setTokens] = useState(cost.tokensPerTrace);
  const perDay = Math.round(10 ** exp / (exp >= 6 ? 100_000 : 1_000)) * (exp >= 6 ? 100_000 : 1_000);
  const daily = perDay * tokens * dollarsPerToken;
  const per1k = 1_000 * tokens * dollarsPerToken;

  return (
    <section id="cost" className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      <SectionLabel>Cost</SectionLabel>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        <div>
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              About{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">3¢ per 1,000</span> traces.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Tailwise is free and open source. You pay for the model calls. Jev scored {cost.traces} traces of
              about {cost.tokensPerTrace} tokens for ${cost.dollars.toFixed(2)}, because a System One model
              returns numbers instead of writing a verdict.
            </p>
            <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-5 py-4 text-sm leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">No spend cap yet.</span> Every scored trace is a billed call,
              and only server.workers limits the rate. Size your budget with the calculator.
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={32}>
          <div className="rounded-3xl border border-line bg-paper p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.3)] md:p-8">
            <label className="block">
              <div className="flex items-baseline justify-between font-mono text-[0.72rem]">
                <span className="text-ink-soft">Traces per day</span>
                <span className="text-ink tabular-nums">{fmtCount(perDay)}</span>
              </div>
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={0.01}
                value={exp}
                onChange={(e) => setExp(Number(e.target.value))}
                className="range mt-3"
                style={{ "--fill": `${((exp - MIN) / (MAX - MIN)) * 100}%` } as React.CSSProperties}
                aria-label="Traces per day"
              />
            </label>
            <label className="mt-7 block">
              <div className="flex items-baseline justify-between font-mono text-[0.72rem]">
                <span className="text-ink-soft">Tokens per trace</span>
                <span className="text-ink tabular-nums">{tokens.toLocaleString("en-US")}</span>
              </div>
              <input
                type="range"
                min={200}
                max={8_000}
                step={20}
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                className="range mt-3"
                style={{ "--fill": `${((tokens - 200) / 7_800) * 100}%` } as React.CSSProperties}
                aria-label="Tokens per trace"
              />
            </label>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-7">
              <div>
                <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">Per month</div>
                <Money
                  value={daily * 30}
                  className="mt-1 block font-display text-3xl font-semibold tracking-[-0.04em] text-accent tabular-nums sm:text-4xl"
                />
              </div>
              <div>
                <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">Per day</div>
                <Money value={daily} className="mt-1 block font-display text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums sm:text-4xl" />
              </div>
              <div>
                <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">Per 1,000</div>
                <span className="mt-1 block font-display text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums sm:text-4xl">
                  {(per1k * 100).toFixed(1)}¢
                </span>
              </div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-ink-faint">
              From one billed Jev run: {cost.traces} requests, {cost.tokens.toLocaleString("en-US")} tokens, $
              {cost.dollars.toFixed(2)} rounded to the cent, so treat results as ±20%. Your tokens per trace depend
              on trace length and on how many questions your manifest asks. Check TypeSafe for current pricing.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
