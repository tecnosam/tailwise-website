import { highlight } from "@/lib/highlight";
import { ConnectTabs } from "./connect-tabs";
import { Reveal, SectionLabel } from "./reveal";

const snippets = [
  {
    label: "Environment",
    lang: "bash",
    file: "shell",
    code: `
# Any OpenTelemetry SDK: point it at Tailwise instead of your back end.
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# or gRPC
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:14317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc`,
  },
  {
    label: "Python",
    lang: "python",
    file: "agent.py",
    code: `
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

provider = TracerProvider()
provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="http://localhost:4318/v1/traces"))
)
trace.set_tracer_provider(provider)
# then instrument as usual, e.g. GoogleADKInstrumentor().instrument(tracer_provider=provider)`,
  },
  {
    label: "JSON API",
    lang: "bash",
    file: "curl",
    code: `
curl -X POST localhost:8080/v1/traces:score -d '{
  "agent": "support-bot",
  "question": "Which river flows through the capital of France?",
  "tool_calls": [{"name": "search", "args": {"query": "capital of France"}}],
  "evidence": ["Paris is the capital of France.", "The Seine flows through Paris."],
  "final_answer": "The Rhône"
}'`,
  },
  {
    label: "Response",
    lang: "json",
    file: "200 OK",
    code: `
{
  "trace_id": "wrong-river-001",
  "decision": "keep",
  "p_keep": 0.98,
  "rule": "above_threshold",
  "reason": "The final answer contradicts the evidence the agent gathered.",
  "cause": "contradicts_evidence",
  "model": "jev-1.14.0",
  "latency_ms": 357.8,
  "exported": true
}`,
  },
];

export async function Connect() {
  const tabs = await Promise.all(
    snippets.map(async (s) => ({ label: s.label, file: s.file, html: await highlight(s.code, s.lang) })),
  );

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-40">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-20">
        <div>
          <SectionLabel>Connect</SectionLabel>
          <Reveal>
            <h2 className="mt-6 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              Point your exporter at{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">Tailwise</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Change one endpoint. Your agent code, your instrumentation and your back end stay as they
              are. OpenInference instrumentors already send everything Tailwise reads.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.1} y={40}>
          <ConnectTabs tabs={tabs} />
        </Reveal>
      </div>
    </section>
  );
}
