"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Benchmark, Shown } from "@/lib/benchmark";
import { ArrowUpRight } from "./icons";
import { Reveal, SectionLabel } from "./reveal";

// Traces per day on a log scale, so the slider covers 1k to 1M evenly.
const MIN = Math.log10(1_000);
const MAX = Math.log10(1_000_000);

const fmtCount = (n: number) =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}k` : `${n}`;

const fmtMoney = (d: number) =>
  d < 1 ? `$${d.toFixed(2)}` : d < 100 ? `$${d.toFixed(1)}` : `$${Math.round(d).toLocaleString("en-US")}`;

const fmtWhole = (n: number) => Math.round(n).toLocaleString("en-US");

function Animated({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, format);
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [mv, value]);
  return <motion.span className={className}>{text}</motion.span>;
}

function Slider({
  label,
  value,
  shown,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  shown: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between text-[0.8rem]">
        <span className="text-ink-soft">{label}</span>
        <span className="text-ink tabular-nums">{shown}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-3"
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
        aria-label={label}
      />
    </label>
  );
}

export function Cost({
  scenario,
  shown,
  usdPerMillion,
}: {
  scenario: Benchmark["scenario"];
  shown: Shown[];
  usdPerMillion: number;
}) {
  const [pick, setPick] = useState(0);
  const [exp, setExp] = useState(4); // 10k a day
  const [tokens, setTokens] = useState(Math.round(shown[0].row.input_tokens_per_run / 100) * 100);
  const [minutes, setMinutes] = useState(5);
  const row = shown[pick].row;

  const choose = (i: number) => {
    setPick(i);
    setTokens(Math.round(shown[i].row.input_tokens_per_run / 100) * 100);
  };

  const step = exp >= 5 ? 10_000 : 1_000;
  const perMonth = Math.round(10 ** exp / step) * step * 30;
  const reviews = perMonth * scenario.review_budget;
  const randomFound = reviews * scenario.failure_rate;
  const found = reviews * row.precision;
  const scoring = (perMonth * tokens * usdPerMillion) / 1_000_000;
  const hours = (n: number) => (n * minutes) / 60;
  // Hours random review would need to find as many failures as Tailwise.
  const saved = hours(found / scenario.failure_rate) - hours(reviews);
  const per1k = (1_000 * tokens * usdPerMillion) / 1_000_000;

  const cells: [string, React.ReactNode, React.ReactNode][] = [
    ["Model calls", "$0", <Animated key="c" value={scoring} format={fmtMoney} />],
    ["Failures found", fmtWhole(randomFound), <Animated key="f" value={found} format={fmtWhole} />],
    [
      `Hours to find ${fmtWhole(found)}`,
      <Animated key="r" value={hours(found / scenario.failure_rate)} format={fmtWhole} />,
      <Animated key="t" value={hours(reviews)} format={fmtWhole} />,
    ],
  ];

  return (
    <section id="cost" className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      <SectionLabel>Cost against accuracy</SectionLabel>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        <div>
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.03em] text-ink md:text-[3.4rem]">
              Pay{" "}
              cents per 1,000{" "}
              traces. Get back hours of review.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Random review is free to choose, but it finds failures only as often as they happen. Tailwise is free and
              open source; you pay for one short model call per trace, about{" "}
              {(per1k * 100).toFixed(0)}¢ per 1,000 traces of {tokens.toLocaleString("en-US")} tokens. In exchange,
              the traces your team reads are the likely failures.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
              The numbers on the right come from the benchmark: the share of reviewed traces that failed when{" "}
              {Math.round(scenario.failure_rate * 100)}% of traces fail and a team reviews{" "}
              {Math.round(scenario.review_budget * 100)}%. Your agents will differ.
            </p>
            <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-5 py-4 text-sm leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">No spend cap yet.</span> Every scored trace is a billed call,
              and only server.workers limits the rate. Heuristic rules that keep a trace skip the call.
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={32}>
          <div className="rounded-3xl border border-line bg-paper p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.3)] md:p-8">
            <div className="text-[0.8rem] text-ink-soft">Agents like</div>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Benchmark to project from">
              {shown.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={pick === i}
                  onClick={() => choose(i)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    pick === i
                      ? "border-accent bg-accent-wash text-accent"
                      : "border-line text-ink-soft hover:border-line-strong"
                  }`}
                >
                  {s.label}
                  {s.row.rough && "†"}
                </button>
              ))}
            </div>

            <div className="mt-7 space-y-7">
              <Slider
                label="Traces per day"
                value={exp}
                shown={fmtCount(perMonth / 30)}
                min={MIN}
                max={MAX}
                step={0.01}
                onChange={setExp}
              />
              <Slider
                label="Tokens per trace"
                value={tokens}
                shown={tokens.toLocaleString("en-US")}
                min={500}
                max={20_000}
                step={100}
                onChange={setTokens}
              />
              <Slider
                label="Minutes per review"
                value={minutes}
                shown={`${minutes}`}
                min={1}
                max={30}
                step={1}
                onChange={setMinutes}
              />
            </div>

            <table className="mt-8 w-full border-t border-line text-left">
              <caption className="sr-only">Per month, reviewing {Math.round(scenario.review_budget * 100)}% of traces</caption>
              <thead>
                <tr className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">
                  <th className="pt-5 pb-2 font-normal">Per month</th>
                  <th className="pt-5 pb-2 text-right font-normal">Random</th>
                  <th className="pt-5 pb-2 text-right font-normal text-accent">Tailwise</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {cells.map(([k, a, b]) => (
                  <tr key={k} className="border-t border-line">
                    <th className="py-3 pr-2 text-sm font-normal text-ink-soft">{k}</th>
                    <td className="py-3 text-right font-display text-xl font-semibold tracking-[-0.03em] text-ink-soft sm:text-2xl">
                      {a}
                    </td>
                    <td className="py-3 text-right font-display text-xl font-semibold tracking-[-0.03em] text-accent sm:text-2xl">
                      {b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-5 text-sm leading-relaxed text-ink">
              To find as many failures at random, your team would review for about{" "}
              <Animated value={saved} format={fmtWhole} className="font-medium text-accent" /> more hours a month.
              Tailwise costs <Animated value={scoring} format={fmtMoney} /> of model calls instead.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              {fmtWhole(reviews)} reviews ({Math.round(scenario.review_budget * 100)}% of traces), with{" "}
              {Math.round(scenario.failure_rate * 100)}% of traces failing; Tailwise&apos;s share of failures among
              them is the benchmark&apos;s ({Math.round(row.precision * 100)}%, 95% interval{" "}
              {Math.round(row.precision_ci95[0] * 100)}–{Math.round(row.precision_ci95[1] * 100)}%).
              {row.rough && " † Rough: few successful runs in this dataset."} Jev at ${usdPerMillion} per million
              input tokens; output is not billed. Check TypeSafe for current pricing.{" "}
              <Link href="/benchmark" className="inline-flex items-center gap-0.5 text-ink-soft hover:text-accent">
                The benchmark <ArrowUpRight className="size-3" />
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
