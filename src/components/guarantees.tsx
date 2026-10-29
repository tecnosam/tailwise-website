import Link from "next/link";
import { ArrowUpRight } from "./icons";
import { Reveal, SectionLabel } from "./reveal";

const guarantees = [
  {
    title: "Stored before acknowledged",
    body: "The API answers 202 only after NATS JetStream has stored the trace. Delivery is at least once, from a durable stream, not an in-memory queue.",
  },
  {
    title: "Model down: retried, then parked",
    body: "A trace the model fails to score goes back on the queue after 5s, 30s, 2m and 5m. After 5 deliveries it moves to a dead-letter stream, with headers saying why, ready to replay.",
  },
  {
    title: "Model rejects a trace: a random fallback",
    body: "A trace the model refuses (400, 413, 422) is kept at the random-floor rate with rule fallback, so you still get a review sample.",
  },
  {
    title: "Tested against a real NATS",
    body: "The test suite starts a NATS server inside the test process and runs go test -race. No fakes for the queue.",
  },
  {
    title: "Golden files pin what the model reads",
    body: "The text the model reads for each test trace is checked in. The tests fail if that text changes, until someone rewrites the files and reviews the diff.",
  },
  {
    title: "Configs checked before rollout",
    body: "tailwise -check validates the config, its manifests and the secrets it names, then exits 1 on any problem.",
  },
];

const limits = [
  "Dead letters wait for a manual replay, and nothing alerts on their count yet.",
  "Nothing redacts fields or caps spend before the call to Jev.",
  "Delivery is at least once, so a trace can reach your back end twice.",
  "Embedded NATS without queue.store_dir loses queued work on a crash.",
];

export function Guarantees() {
  return (
    <section id="guarantees" className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      <SectionLabel>Failure modes</SectionLabel>
      <Reveal>
        <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
          What happens{" "}
          <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">when it breaks</span>.
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <Reveal delay={0.05}>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-8 sm:grid-cols-2">
            {guarantees.map((g) => (
              <li key={g.title} className="border-t border-line pt-5">
                <h3 className="flex items-start gap-2.5 font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                  <svg viewBox="0 0 16 16" className="mt-1.5 size-3.5 shrink-0 text-good" aria-hidden>
                    <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{g.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-3xl border border-dashed border-line-strong bg-paper-2/60 p-6 md:p-7">
            <div className="font-mono text-[0.68rem] tracking-[0.16em] text-ink-faint uppercase">Where it breaks</div>
            <p className="mt-3 leading-relaxed text-ink">
              The README lists every open problem in this version. A few you should know before a pilot:
            </p>
            <ul className="mt-5 space-y-3">
              {limits.map((l) => (
                <li key={l} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" />
                  {l}
                </li>
              ))}
            </ul>
            <Link
              href="/docs#known-limitations"
              className="mt-7 flex h-11 w-fit items-center gap-1.5 rounded-full border border-line-strong px-5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Read every known limitation <ArrowUpRight />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
