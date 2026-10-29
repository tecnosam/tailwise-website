import Link from "next/link";
import { ArrowUpRight } from "./icons";
import { Reveal, SectionLabel } from "./reveal";

const leaves = [
  {
    to: "The model endpoint",
    where: "Jev at api.typesafe.ai, unless you set scorer.endpoint",
    what: "The full text of every scored trace: the user's question, each tool call, the evidence and the answer.",
    when: "Every trace",
    loud: true,
  },
  {
    to: "Your exporters",
    where: "Phoenix, Langfuse or the OTLP back ends you list",
    what: "Kept traces, with the decision as eval.* attributes. Each back end gets only its own headers.",
    when: "Kept traces only",
  },
  {
    to: "Your metrics endpoint",
    where: "Only if you set observability.metrics.endpoint",
    what: "The engine's own counters and timings.",
    when: "Off by default",
  },
];

const notYet = [
  ["Redaction before the model call", "No hook strips personal data from a trace before Tailwise sends it to the model."],
  ["Authentication on intake", "The API and OTLP receivers have no auth or TLS. Run Tailwise inside your VPC and put a mesh or load balancer in front."],
];

export function DataFlow() {
  return (
    <section id="data" className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      <SectionLabel>Data and security</SectionLabel>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
        <Reveal>
          <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
            Where your{" "}
            <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">traces go</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-lg leading-relaxed text-ink-soft md:pt-3">
            Tailwise runs inside your network. Three things leave it, and you configure each one. With the
            defaults, every scored trace goes to TypeSafe&apos;s hosted Jev, a third party. A dropped trace
            goes nowhere after scoring.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <ol className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {leaves.map((l, i) => (
            <li
              key={l.to}
              className={`relative rounded-2xl border p-6 ${l.loud ? "border-accent/40 bg-accent-wash" : "border-line bg-paper-2/60"}`}
            >
              <div className="flex items-center justify-between font-mono text-[0.65rem] tracking-[0.14em] uppercase">
                <span className={l.loud ? "text-accent" : "text-ink-faint"}>Leaves → {i + 1}</span>
                <span className="text-ink-faint normal-case tracking-normal">{l.when}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.03em] text-ink">{l.to}</h3>
              <div className="mt-1 font-mono text-[0.7rem] text-ink-faint">{l.where}</div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{l.what}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">Keep traces in your network</h3>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Tailwise talks to models over the System One API. Set scorer.endpoint to a server you run, for
            every agent or one at a time, and trace text never reaches TypeSafe. Before you send
            production traces to Jev, review TypeSafe&apos;s terms for retention, training use and hosting
            region.
          </p>
          <Link
            href="/docs#deploying"
            className="mt-5 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
          >
            Deploying, in the docs <ArrowUpRight />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">Not built yet</h3>
          <ul className="mt-4 space-y-4">
            {notYet.map(([t, b]) => (
              <li key={t} className="rounded-xl border border-dashed border-line-strong px-4 py-3">
                <div className="text-sm font-medium text-ink">{t}</div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{b}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
