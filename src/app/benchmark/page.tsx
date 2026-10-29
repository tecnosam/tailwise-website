import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ArrowUpRight } from "@/components/icons";
import { Nav } from "@/components/nav";
import { RecallChart } from "@/components/recall-chart";
import { Reveal, SectionLabel } from "@/components/reveal";
import { auroc, dataset, multiple } from "@/lib/benchmark";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Benchmark",
  description: "How well Tailwise's default model picks the wrong agent answers, measured against random sampling and simple rules.",
};

const notYet = [
  ["Several keep rates", "Recall and precision at 1%, 10% and 20%, as well as 5%."],
  ["Each check on its own", "Which of the six checks find failures the others miss, and which only add noise."],
  ["The current decision", "Any of six checks keeping a trace. The published run scored one question."],
  ["Other agents", "Agents beyond a ReAct agent on HotpotQA, with real production failures."],
  ["A script for your data", "One command that reports these numbers on your labelled traces."],
];

const yours = `
# Prints each decision next to its label.
# Rows: traces in the JSON API's shape, plus "label".
python3 scripts/send_samples.py --sync --dataset my-traces.jsonl -n 200`;

export default async function BenchmarkPage() {
  const html = await highlight(yours, "bash");

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pt-28 pb-24 sm:px-6 md:pt-36">
        <div className="enter max-w-3xl" style={{ "--d": "0.05s" } as React.CSSProperties}>
          <div className="font-mono text-[0.7rem] tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-accent">October 2026</span> · Benchmark
          </div>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[0.95] font-semibold tracking-[-0.05em] text-ink sm:text-5xl md:text-7xl">
            Does it pick the{" "}
            <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">right traces</span>?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Review 5% of your traces with Jev, Tailwise&apos;s default model, and you find {multiple}× the failures
            random sampling finds. It also beats six hand-written rules, by 15 points of normalized recall.
          </p>
        </div>

        <div
          className="enter mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2"
          style={{ "--d": "0.15s" } as React.CSSProperties}
        >
          <div className="rounded-3xl border border-line bg-paper-2 p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">Does it catch them?</h2>
            <p className="mt-1 mb-6 text-sm leading-relaxed text-ink-soft">
              Normalized recall: review the top 5% of traces. 0% is random sampling, 100% is a perfect
              reviewer. Jev scores 74%.
            </p>
            <RecallChart delay={0.4} />
          </div>
          <div className="rounded-3xl border border-line bg-paper-2 p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">Does it rank them?</h2>
            <p className="mt-1 mb-6 text-sm leading-relaxed text-ink-soft">
              AUROC: shown one right and one wrong trace, how often a method rates the wrong one as more
              likely wrong. 50% is a coin flip.
            </p>
            <div className="space-y-4">
              {auroc.map((r) => {
                const us = "us" in r && r.us;
                return (
                  <div key={r.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className={us ? "font-medium text-ink" : "text-ink-soft"}>{r.name}</span>
                      <span className="font-mono text-ink tabular-nums">{r.value}%</span>
                    </div>
                    <div className="mt-1.5 h-3 rounded-r bg-paper-3/70">
                      <div
                        className={`h-full rounded-r-[4px] ${us ? "bg-accent" : "bg-ink-faint"}`}
                        style={{ width: `${r.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-ink-faint">
              Kev and Laya are open System One models, scored on their keep_or_drop question.
            </p>
          </div>
        </div>

        <section className="mt-24">
          <SectionLabel>The dataset</SectionLabel>
          <Reveal>
            <dl className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 md:grid-cols-2">
              {[
                ["Questions", dataset.questions],
                ["Agent", dataset.agent],
                ["Labels", dataset.runs],
                ["Test set", dataset.heldOut],
                ["Model", dataset.question],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-line pt-4">
                  <dt className="font-mono text-[0.68rem] tracking-[0.14em] text-ink-faint uppercase">{k}</dt>
                  <dd className="mt-1.5 leading-relaxed text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        <section className="mt-24 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <SectionLabel>Not measured yet</SectionLabel>
            <Reveal>
              <p className="mt-6 leading-relaxed text-ink-soft">
                The published run answers one question well. These answer the rest, and they come next.
              </p>
              <ul className="mt-6 space-y-3">
                {notYet.map(([t, b]) => (
                  <li key={t} className="rounded-xl border border-dashed border-line-strong px-4 py-3">
                    <div className="text-sm font-medium text-ink">{t}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{b}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div>
            <SectionLabel>Try it on your traces</SectionLabel>
            <Reveal>
              <p className="mt-6 leading-relaxed text-ink-soft">
                Until the benchmark script ships, the sample sender in the repo scores a labelled JSONL file
                and prints every decision next to your label, so you can count hits and misses yourself.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-2">
                <div
                  className="overflow-x-auto px-5 py-4 font-mono text-[0.72rem] leading-[1.75] sm:text-[0.76rem] [&_pre]:!bg-transparent"
                  data-lenis-prevent-horizontal
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
              <Link
                href="/docs#sending-traces"
                className="mt-5 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
              >
                Sending traces, in the docs <ArrowUpRight />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
