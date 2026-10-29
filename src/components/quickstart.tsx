import Link from "next/link";
import { highlight } from "@/lib/highlight";
import { ConnectTabs } from "./connect-tabs";
import { ArrowUpRight } from "./icons";
import { QuickstartTerminal } from "./quickstart-terminal";
import { Reveal, SectionLabel } from "./reveal";

const snippets = [
  {
    label: "Any OTel SDK",
    lang: "bash",
    file: "shell",
    code: `
# Before: your exporter points at Phoenix or Langfuse.
# After: it points at Tailwise, which forwards the traces worth keeping.
export OTEL_EXPORTER_OTLP_ENDPOINT=http://tailwise:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`,
  },
  {
    label: "Python",
    lang: "python",
    file: "agent.py",
    code: `
provider.add_span_processor(BatchSpanProcessor(
    OTLPSpanExporter(endpoint="http://tailwise:4318/v1/traces")
))`,
  },
  {
    label: "Back out",
    lang: "bash",
    file: "shell",
    code: `
# Standard OTLP in, standard OTLP out. To remove Tailwise,
# point the exporter back at your back end. Nothing else changes.
export OTEL_EXPORTER_OTLP_ENDPOINT=http://phoenix:6006`,
  },
];

export async function Quickstart() {
  const tabs = await Promise.all(
    snippets.map(async (s) => ({ label: s.label, file: s.file, html: await highlight(s.code, s.lang) })),
  );

  return (
    <section id="quickstart" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-24 md:py-36">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16">
        <div>
          <SectionLabel>Quickstart</SectionLabel>
          <Reveal>
            <h2 className="mt-6 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              Three commands to your{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">first decisions</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              You need Docker and a Jev API key. Compose starts the engine, NATS and Phoenix, then scores a
              dozen sample runs and prints each decision with its reason.
            </p>
            <Link
              href="/docs#quickstart"
              className="mt-5 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
            >
              Quickstart in the docs <ArrowUpRight />
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1} y={32}>
          <QuickstartTerminal />
        </Reveal>
      </div>

      <div className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16">
        <Reveal>
          <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink md:text-3xl">
            Already instrumented? Change one endpoint.
          </h3>
          <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
            Tailwise reads standard OpenTelemetry spans and forwards kept traces to the Phoenix or
            Langfuse you already run. Your agent code stays the same, and backing out is the same
            one-line change in reverse.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ConnectTabs tabs={tabs} />
        </Reveal>
      </div>
    </section>
  );
}
