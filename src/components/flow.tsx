import { Logo } from "./logo";
import { Reveal, SectionLabel } from "./reveal";

const checks = [
  "answer_wrong",
  "unsupported_answer",
  "missing_tool_calls",
  "answered_on_failure",
  "ignored_instructions",
  "contradicts_knowledge",
];

// A connector with a dot travelling along it: horizontal from md, vertical on phones.
function Wire({ delay = 0, dashed = false, className = "" }: { delay?: number; dashed?: boolean; className?: string }) {
  const style = { "--packet-delay": `${delay}s` } as React.CSSProperties;
  return (
    <div className={`relative flex items-center justify-center ${className}`} aria-hidden>
      <div className={`relative h-10 w-px md:h-px md:w-full ${dashed ? "border-l border-dashed border-line-strong md:border-t md:border-l-0" : "bg-line-strong"}`}>
        {!dashed && (
          <div className="packet absolute inset-0" style={style}>
            <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)] md:top-1/2 md:left-0" />
          </div>
        )}
      </div>
    </div>
  );
}

function Node({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-paper-2 p-4 ${className}`}>
      <div className="font-mono text-[0.65rem] tracking-[0.16em] text-ink-faint uppercase">{title}</div>
      <div className="mt-2 text-sm leading-snug text-ink">{children}</div>
    </div>
  );
}

export function Flow() {
  return (
    <section id="how" className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      <SectionLabel>How it works</SectionLabel>
      <Reveal>
        <h2 className="mt-6 max-w-4xl font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
          Spans in. Six checks.{" "}
          <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">The failures out</span>.
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-16 grid grid-cols-1 items-center md:grid-cols-[9rem_2rem_minmax(0,1fr)_2rem_12rem] lg:grid-cols-[10rem_3rem_minmax(0,1fr)_3rem_13rem]">
          <Node title="Your agent">
            OpenTelemetry spans, over gRPC or HTTP, or JSON
          </Node>

          <Wire />

          {/* The engine */}
          <div className="relative rounded-3xl border border-accent/40 bg-accent-wash p-4 md:p-5">
            <div className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.03em] text-accent">
              <Logo className="size-5" /> Tailwise
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.25fr)_minmax(0,0.8fr)]">
              <div className="rounded-xl border border-line bg-paper p-3">
                <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">Queue</div>
                <p className="mt-1.5 text-[0.8rem] leading-snug text-ink">
                  NATS JetStream stores the trace before Tailwise replies
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-3">
                <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">
                  Score · one model call
                </div>
                <ul className="mt-1.5 grid grid-cols-1 gap-y-0.5 font-mono text-[0.66rem] text-ink-soft sm:grid-cols-2 md:grid-cols-1">
                  {checks.map((c) => (
                    <li key={c} className="flex min-w-0 items-center gap-1.5 break-all">
                      <span className="size-1 shrink-0 rounded-full bg-accent" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-line bg-paper p-3">
                <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">Decide</div>
                <p className="mt-1.5 text-[0.8rem] leading-snug text-ink">
                  Any check over its threshold keeps the trace
                </p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-[0.72rem] leading-snug text-ink-soft md:grid-cols-2">
              <div className="rounded-xl border border-dashed border-line-strong px-3 py-2">
                <span className="text-ink">Model down?</span> 5 deliveries over about 8 minutes, then the
                dead-letter stream. Nothing dropped silently.
              </div>
              <div className="rounded-xl border border-dashed border-line-strong px-3 py-2">
                <span className="text-ink">The model:</span> Jev by default, or any /v1/systemone endpoint,
                chosen per agent.
              </div>
            </div>
          </div>

          <Wire delay={1.2} />

          <div className="grid gap-3">
            <Node title="Kept · your back end" className="border-accent/40">
              Phoenix, Langfuse or any OTLP back end, with
              <span className="mt-2 block font-mono text-[0.68rem] text-accent">
                eval.flags answer_wrong
                <br />
                eval.severity 0.57
                <br />
                eval.reason …
              </span>
            </Node>
            <Node title="Dropped" className="opacity-70">
              Never sent. 2% kept at random as a check on the model.
            </Node>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
