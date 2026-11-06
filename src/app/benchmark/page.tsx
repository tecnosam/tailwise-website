import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ArrowUpRight } from "@/components/icons";
import { Nav } from "@/components/nav";
import { RecallChart } from "@/components/recall-chart";
import { Reveal, SectionLabel } from "@/components/reveal";
import { type Row, count, find, getBenchmark, headline, month, multiples, pct } from "@/lib/benchmark";
import { highlight } from "@/lib/highlight";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Benchmark",
  description:
    "What upgrading from random review to Tailwise costs, and how many more failures the same reviews find, on τ-bench, SWE-agent and TRAIL.",
};

const notYet = [
  ["An LLM judge", "The same runs scored by a chat model, to put a price on the accuracy a slower, costlier judge adds."],
  ["Agents the checks were not built on", "The action checks were designed on τ-bench. They need confirming on other agents."],
  ["Production traces", "Real failures at real failure rates, rather than benchmark runs resampled to 10% failing."],
  ["More successful runs", "SWE-agent and TRAIL have few, so their figures are rough."],
];

const yours = `
git clone ${site.links.github}.git && cd tailwise/bench
uv run bench run --dry-run              # projected tokens and cost, no calls
uv run bench run --datasets tau,swe     # τ-bench and SWE-agent, under $1`;

const setupName = (r: Row) =>
  `${r.setup === "builtin" ? "Built-in checks" : "Action checks"}${r.slice === "detectable" ? ", trace-detectable runs" : ""}`;

const money = (d: number) => `$${d.toFixed(2)}`;
const range = (ci: number[]) => `${Math.round(ci[0])}–${Math.round(ci[1])}`;

export default async function BenchmarkPage() {
  const [b, html] = await Promise.all([getBenchmark(), highlight(yours, "bash")]);
  const { scenario } = b;
  const shown = headline(b);
  const times = multiples(b);
  const failing = pct(scenario.failure_rate);

  // The cost table: every dataset's built-in row, then τ-bench's other setups.
  const table = (["tau", "swe", "trail"] as const).flatMap((ds) =>
    [find(b, ds, "all"), find(b, ds, "detectable"), find(b, ds, "all", "tau-actions"), find(b, ds, "detectable", "tau-actions")]
      .filter((r): r is Row => Boolean(r)),
  );

  const tauAll = find(b, "tau", "all");
  const tauDetectable = find(b, "tau", "detectable");
  const tauActions = find(b, "tau", "all", "tau-actions");
  const tauBest = find(b, "tau", "detectable", "tau-actions");
  const rough = b.results.filter((r) => r.rough && !r.rules && r.setup === "builtin");
  const tokens = b.results.filter((r) => !r.rules).map((r) => r.input_tokens_per_run);

  const withRules = b.results
    .filter((r) => r.rules)
    .map((r) => ({ r, before: find(b, r.dataset, r.slice, r.setup) }))
    .filter((x): x is { r: Row; before: Row } => Boolean(x.before));
  const swe = withRules.find((x) => x.r.dataset === "swe");

  const caveats: [string, React.ReactNode][] = [
    [
      "The intervals are wide",
      tauBest && (
        <>
          Every figure is an average over 100 draws that resample whole tasks. The best one, {count(tauBest.found)}{" "}
          failures in {scenario.reviews} reviews, has a 95% interval of {range(tauBest.found_ci95)}.
          {tauBest.found_ci95[0] > scenario.random_found &&
            ` Even its lower end is above random review's ${count(scenario.random_found)}.`}
        </>
      ),
    ],
    [
      "Some τ-bench labels can't be judged from a trace",
      tauDetectable && tauAll && (
        <>
          Some τ-bench runs fail on things no trace shows, such as an item the simulated user wanted but never
          named, and some tasks&apos; recorded answers disagree with runs scored as successes. Leaving those out
          leaves {count(tauDetectable.runs)} of {count(tauAll.runs)} runs. With the built-in checks, Tailwise finds{" "}
          {count(tauAll.found)} failures on all runs and {count(tauDetectable.found)} on those.
        </>
      ),
    ],
    [
      "The action checks were built on τ-bench",
      tauActions && tauAll && (
        <>
          On all τ-bench runs they find {count(tauActions.found)} failures against {count(tauAll.found)} with the
          built-in checks, at {(tauActions.jev_usd / tauAll.jev_usd).toFixed(1)}× the cost. Their gain shows on
          trace-detectable runs, and they still need confirming on agents they were not designed on.
        </>
      ),
    ],
    [
      "SWE-agent and TRAIL are rough",
      <>
        {rough
          .map((r) => `${b.datasets[r.dataset].name}: ${pct(r.failed / r.runs)} of ${count(r.runs)} runs failed`)
          .join("; ")}
        . Resampling them to {failing} failing leaves few successful runs to rank against, so those figures are
        marked † and their intervals run wide.
      </>,
    ],
    [
      "Cost grows with trace length",
      <>
        These traces average {count(Math.min(...tokens))} to {count(Math.max(...tokens))} input tokens. Longer traces
        cost proportionally more. Reviewer time is still the larger cost: every review Tailwise saves is minutes of
        an engineer.
      </>,
    ],
    [
      "No LLM judge in the comparison yet",
      <>
        The baseline is random review, the free option most teams use. A chat-model judge on every run would cost
        far more per trace; how much accuracy it buys on these runs is not measured yet.
      </>,
    ],
  ];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pt-28 pb-24 sm:px-6 md:pt-36">
        <div className="enter max-w-3xl" style={{ "--d": "0.05s" } as React.CSSProperties}>
          <div className="text-[0.7rem] tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-accent">{month(b.date)}</span> · Benchmark
          </div>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[0.95] font-semibold tracking-[-0.03em] text-ink sm:text-5xl md:text-7xl">
            What it costs to stop{" "}
            reviewing at random.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Take {count(scenario.traces)} agent traces, {failing} of them failures, and a team that reviews{" "}
            {count(scenario.reviews)}. Random review costs nothing to choose them and finds about{" "}
            {count(scenario.random_found)} failures. Tailwise pays Jev, a small model, to score every
            trace, and its {count(scenario.reviews)} find {times.low} to {times.high} times as
            many. The scoring costs a few dollars.
          </p>
        </div>

        <div
          className="enter mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
          style={{ "--d": "0.15s" } as React.CSSProperties}
        >
          <div className="rounded-3xl border border-line bg-paper-2 p-6 md:p-8">
            <RecallChart scenario={scenario} shown={shown} delay={0.4} />
            <p className="mt-6 text-xs leading-relaxed text-ink-faint">
              Bars are the mean over 100 resamples; lines are 95% intervals. The full width is every review a
              failure. † Rough: few successful runs.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-paper-2 p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">Reviews per failure found</h2>
            <p className="mt-1 mb-6 text-sm leading-relaxed text-ink-soft">
              Random review reads {scenario.random_reviews_per_failure} traces for every failure it finds. With
              Tailwise ranking the queue:
            </p>
            <ul className="space-y-4">
              {shown.map((s) => (
                <li key={s.key} className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <span className="text-sm text-ink">
                    {s.label}
                    {s.row.rough && <span className="text-ink-faint">†</span>}
                    <span className="block text-xs text-ink-faint">{s.detail}</span>
                  </span>
                  <span className="shrink-0 font-display text-3xl font-semibold tracking-[-0.03em] text-accent tabular-nums">
                    {s.row.reviews_per_failure.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-24">
          <SectionLabel>Cost against accuracy</SectionLabel>
          <Reveal>
            <h2 className="mt-6 max-w-3xl font-display text-3xl leading-[1.05] font-semibold tracking-[-0.03em] text-ink md:text-4xl">
              Per {count(scenario.traces)} traces, {failing} failing, {count(scenario.reviews)} reviewed
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-ink-soft">
              &ldquo;Random reviews to match&rdquo; is how many traces random review would read to find as many
              failures as Tailwise&apos;s {count(scenario.reviews)}. &ldquo;Per extra failure&rdquo; is the model cost
              divided by the failures found beyond random review&apos;s {count(scenario.random_found)}. Jev bills $
              {b.usd_per_million_input_tokens} per million input tokens; output is free.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line" data-lenis-prevent-horizontal>
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60 text-[0.66rem] tracking-[0.1em] text-ink-faint uppercase">
                    <th className="px-5 py-3 font-normal">Dataset</th>
                    <th className="px-3 py-3 text-right font-normal">Model cost</th>
                    <th className="px-3 py-3 text-right font-normal">Failures found (95%)</th>
                    <th className="px-3 py-3 text-right font-normal">Reviews per failure</th>
                    <th className="px-3 py-3 text-right font-normal">Random reviews to match</th>
                    <th className="px-5 py-3 text-right font-normal">Per extra failure</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr className="border-b border-line text-ink-soft">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-ink">Random review</span>
                      <span className="block text-xs text-ink-faint">Any dataset</span>
                    </td>
                    <td className="px-3 py-3.5 text-right">$0.00</td>
                    <td className="px-3 py-3.5 text-right">{count(scenario.random_found)}</td>
                    <td className="px-3 py-3.5 text-right">{scenario.random_reviews_per_failure}</td>
                    <td className="px-3 py-3.5 text-right">{count(scenario.reviews)}</td>
                    <td className="px-5 py-3.5 text-right">–</td>
                  </tr>
                  {table.map((r) => (
                    <tr key={`${r.dataset}-${r.slice}-${r.setup}`} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-ink">
                          {b.datasets[r.dataset].name}
                          {r.rough && <span className="text-ink-faint">†</span>}
                        </span>
                        <span className="block text-xs text-ink-faint">{setupName(r)}</span>
                      </td>
                      <td className="px-3 py-3.5 text-right text-ink">{money(r.jev_usd)}</td>
                      <td className="px-3 py-3.5 text-right text-accent">
                        {count(r.found)} <span className="text-ink-faint">({range(r.found_ci95)})</span>
                      </td>
                      <td className="px-3 py-3.5 text-right text-ink">{r.reviews_per_failure.toFixed(1)}</td>
                      <td className="px-3 py-3.5 text-right text-ink">{count(r.random_reviews_for_same)}</td>
                      <td className="px-5 py-3.5 text-right text-ink">
                        {r.jev_usd_per_extra_failure === null ? "no gain" : `$${r.jev_usd_per_extra_failure.toFixed(3)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        <section className="mt-24">
          <SectionLabel>Read this with care</SectionLabel>
          <Reveal>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-soft">
              The direction is clear on every dataset: a ranked queue finds more failures than a random one, for
              little money. How many more is less certain than a single number suggests.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
              {caveats
                .filter(([, body]) => body)
                .map(([t, body]) => (
                  <li key={t} className="rounded-2xl border border-line bg-paper-2/60 px-5 py-4">
                    <div className="font-medium text-ink">{t}</div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                  </li>
                ))}
            </ul>
          </Reveal>
        </section>

        {withRules.length > 0 && (
          <section className="mt-24">
            <SectionLabel>Heuristic rules</SectionLabel>
            <Reveal>
              <p className="mt-6 max-w-3xl leading-relaxed text-ink-soft">
                Rules are free, certain checks, such as &ldquo;the agent never submitted a patch&rdquo;, written for
                each agent before looking at any result. A rule that keeps a trace skips the model call. On these
                datasets they did not improve the ranking on the whole
                {swe &&
                  `, but SWE-agent's no_submit rule decided a third of runs without the model, cutting its cost from ${money(swe.before.jev_usd)} to ${money(swe.r.jev_usd)}`}
                .
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-line" data-lenis-prevent-horizontal>
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-paper-2/60 text-[0.66rem] tracking-[0.1em] text-ink-faint uppercase">
                      <th className="px-5 py-3 font-normal">Dataset</th>
                      <th className="px-3 py-3 text-right font-normal">Failures found: model → + rules</th>
                      <th className="px-5 py-3 text-right font-normal">Model cost: model → + rules</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {withRules.map(({ r, before }) => (
                      <tr key={`${r.dataset}-${r.slice}-${r.setup}`} className="border-b border-line last:border-b-0">
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-ink">
                            {b.datasets[r.dataset].name}
                            {r.rough && <span className="text-ink-faint">†</span>}
                          </span>
                          <span className="block text-xs text-ink-faint">{setupName(r)}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right text-ink">
                          {count(before.found)} → {count(r.found)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-ink">
                          {money(before.jev_usd)} → {money(r.jev_usd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-3xl text-xs leading-relaxed text-ink-faint">
                Every change in failures found has a 95% interval that includes no change. Rules are most useful where a
                failure has a plain signature, and as free filters before the model.
              </p>
            </Reveal>
          </section>
        )}

        <section className="mt-24">
          <SectionLabel>The datasets</SectionLabel>
          <Reveal>
            <dl className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 md:grid-cols-2">
              {(["tau", "swe", "trail"] as const).map((ds) => {
                const r = find(b, ds, "all");
                return (
                  r && (
                    <div key={ds} className="border-t border-line pt-4">
                      <dt className="text-[0.68rem] tracking-[0.14em] text-ink-faint uppercase">
                        {b.datasets[ds].name}
                      </dt>
                      <dd className="mt-1.5 leading-relaxed text-ink">
                        {b.datasets[ds].agent}. {count(r.runs)} runs, {pct(r.failed / r.runs)} failed.
                      </dd>
                    </div>
                  )
                );
              })}
              <div className="border-t border-line pt-4">
                <dt className="text-[0.68rem] tracking-[0.14em] text-ink-faint uppercase">Method</dt>
                <dd className="mt-1.5 leading-relaxed text-ink">
                  {b.jev_model} on Tailwise&apos;s built-in checks (and τ-bench&apos;s action checks), traces ranked by
                  severity. Failed runs are dropped at random until {failing} fail, and whole tasks are resampled, 100
                  times.
                </dd>
              </div>
            </dl>
          </Reveal>
        </section>

        <section className="mt-24 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <SectionLabel>Not measured yet</SectionLabel>
            <Reveal>
              <ul className="mt-6 space-y-3">
                {notYet.map(([t, body]) => (
                  <li key={t} className="rounded-xl border border-dashed border-line-strong px-4 py-3">
                    <div className="text-sm font-medium text-ink">{t}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div>
            <SectionLabel>Run it yourself</SectionLabel>
            <Reveal>
              <p className="mt-6 leading-relaxed text-ink-soft">
                The harness is in the repo. It downloads the datasets, scores them through Tailwise and writes every
                table on this page, with the plots, to a results folder.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-2">
                <div
                  className="overflow-x-auto px-5 py-4 font-mono text-[0.72rem] leading-[1.75] sm:text-[0.76rem] [&_pre]:!bg-transparent"
                  data-lenis-prevent-horizontal
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
              <a
                href={`${site.links.github}/tree/main/bench`}
                className="mt-5 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
              >
                The benchmark harness <ArrowUpRight />
              </a>
              <Link
                href="/docs#heuristic-rules"
                className="mt-2 ml-6 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
              >
                Heuristic rules, in the docs <ArrowUpRight />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
