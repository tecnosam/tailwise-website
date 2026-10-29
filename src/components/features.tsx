"use client";

import { motion } from "motion/react";
import { Reveal, SectionLabel } from "./reveal";

const causes = [
  "correct",
  "contradicts_evidence",
  "unsupported",
  "incomplete",
  "wrong_lookup",
  "ignored_tool_failure",
  "no_answer",
];

function Card({
  className = "",
  title,
  body,
  children,
  delay = 0,
}: {
  className?: string;
  title: string;
  body: string;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper-2/50 p-7 transition-colors hover:border-line-strong"
      >
        <div className="bloom pointer-events-none absolute -top-32 -right-32 size-72 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
        <p className="mt-2 max-w-sm leading-relaxed text-ink-soft">{body}</p>
        {children && <div className="mt-auto pt-8">{children}</div>}
      </motion.div>
    </Reveal>
  );
}

export function Features() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-40">
      <SectionLabel>Features</SectionLabel>
      <Reveal>
        <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
          Built to run in{" "}
          <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">production</span>.
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-6">
        <Card
          className="md:col-span-4"
          title="Reasons you act on"
          body="The model picks the cause from a fixed list, so your team sorts failures by type in Phoenix or Langfuse."
        >
          <div className="flex flex-wrap gap-2">
            {causes.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
                className={`rounded-full border px-3 py-1 font-mono text-[0.72rem] ${
                  c === "correct"
                    ? "border-line text-ink-faint"
                    : "border-accent/30 bg-accent-wash text-accent"
                }`}
              >
                {c}
              </motion.span>
            ))}
          </div>
        </Card>

        <Card
          className="md:col-span-2"
          delay={0.08}
          title="Starts with one variable"
          body="Set JEV_API_KEY and run the binary. No config file."
        >
          <div className="rounded-xl border border-line bg-paper px-4 py-3 font-mono text-[0.78rem] text-ink">
            <span className="text-accent">JEV_API_KEY</span>=…
          </div>
        </Card>

        <Card
          className="md:col-span-3"
          delay={0.04}
          title="Never loses a trace"
          body="JetStream stores every trace before Tailwise replies. Failed scores retry after 5s, 30s, 2m and 5m."
        >
          <div className="flex items-center gap-1.5">
            {[5, 30, 120, 300].map((s, i) => (
              <motion.div
                key={s}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full origin-bottom rounded-md bg-accent/80"
                style={{ height: `${12 + Math.sqrt(s) * 3}px`, opacity: 0.35 + i * 0.2 }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[0.65rem] text-ink-faint">
            <span>5s</span>
            <span>30s</span>
            <span>2m</span>
            <span>5m</span>
          </div>
        </Card>

        <Card
          className="md:col-span-3"
          delay={0.1}
          title="A model per agent"
          body="Give each agent its own questions, model or key. One model going down only pauses its own agent's traces."
        />


        <Card
          className="md:col-span-3"
          delay={0.04}
          title="Your back end, unchanged"
          body="Kept traces reach Phoenix, Langfuse, an OpenTelemetry Collector or all three, each with its own queue."
        >
          <div className="flex flex-wrap gap-2 font-mono text-[0.75rem] text-ink-soft">
            {["Arize Phoenix", "Langfuse", "OTel Collector", "any OTLP/HTTP"].map((b) => (
              <span key={b} className="rounded-lg border border-line bg-paper px-3 py-1.5">
                {b}
              </span>
            ))}
          </div>
        </Card>

        <Card
          className="md:col-span-3"
          delay={0.1}
          title="Ships your way"
          body="Docker Compose on a laptop, Helm on Kubernetes, or one static binary. tailwise -check validates a config before you deploy."
        >
          <div className="rounded-xl border border-line bg-paper px-4 py-3 font-mono text-[0.78rem] text-ink-soft">
            <span className="text-accent">❯</span> tailwise -check -config prod.yaml
            <div className="text-ink-faint">tailwise: prod.yaml is valid</div>
          </div>
        </Card>
      </div>
    </section>
  );
}
