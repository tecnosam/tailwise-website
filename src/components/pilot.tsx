import Link from "next/link";
import { highlight } from "@/lib/highlight";
import { getHealth } from "@/lib/github";
import { getVersion } from "@/lib/releases";
import { site } from "@/lib/site";
import { ArrowUpRight } from "./icons";
import { Reveal, SectionLabel } from "./reveal";

const shadow = `
# tailwise.yaml: a shadow pilot. Kept traces go to a scratch
# project, so nothing changes for your team until you decide.
exporters:
  - name: shadow
    endpoint: http://phoenix:6006/v1/traces
    resource_attributes:
      openinference.project.name: tailwise-shadow`;

const steps = [
  ["Add a second exporter", "Send a copy of your spans to Tailwise from your OTel SDK or Collector. Your current pipeline keeps running."],
  ["Keep into a scratch project", "Point every exporter at a separate Phoenix or Langfuse project."],
  ["Compare for a week", "Check what Tailwise kept against what your team flagged, and watch which checks fire."],
];

export async function Pilot() {
  const [health, html, version] = await Promise.all([getHealth(), highlight(shadow, "yaml"), getVersion()]);

  const signals = [
    { k: "Licence", v: health.license ?? "Apache-2.0", href: site.links.license },
    { k: "Last commit", v: health.lastCommit, href: `${site.links.github}/commits/main` },
    { k: "Maintainers", v: health.maintainers?.toString(), href: `${site.links.github}/graphs/contributors` },
    {
      k: "CI on main",
      v: health.ci,
      good: health.ci === "passing",
      href: `${site.links.github}/actions/workflows/ci.yml`,
    },
    {
      k: "Release",
      v: health.release.published
        ? `v${health.release.version}${health.release.checksums ? ", with checksums" : ""}`
        : `v${health.release.version}, not published yet`,
      href: "/download",
    },
    { k: "Changelog", v: "Keep a Changelog", href: "/changelog" },
  ].filter((s) => s.v);

  return (
    <section id="pilot" className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
      <SectionLabel>Adopting it</SectionLabel>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
        <div>
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              Start with a{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">shadow pilot</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Tailwise is at v{version} with one maintainer. Run it beside what you have before you
              let it decide what your team never sees.
            </p>
            <ol className="mt-8 space-y-5">
              {steps.map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="font-serif text-2xl leading-none text-accent italic">{i + 1}</span>
                  <div>
                    <div className="font-medium text-ink">{t}</div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        <div className="space-y-4">
          <Reveal delay={0.1} y={32}>
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-2">
              <div className="border-b border-line px-5 py-2.5 font-mono text-[0.68rem] text-ink-faint">tailwise.yaml</div>
              <div
                className="overflow-x-auto px-5 py-4 font-mono text-[0.72rem] leading-[1.75] sm:text-[0.76rem] [&_pre]:!bg-transparent"
                data-lenis-prevent-horizontal
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line sm:grid-cols-3">
              {signals.map((s) => (
                <Link
                  key={s.k}
                  href={s.href}
                  {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group -mt-px -ml-px border-t border-l border-line px-4 py-3.5 transition-colors hover:bg-paper-2"
                >
                  <div className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{s.k}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                    {"good" in s && <span className={`size-1.5 rounded-full ${s.good ? "bg-good" : "bg-accent"}`} />}
                    {s.v}
                    <ArrowUpRight className="size-3 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-faint">Read live from GitHub, refreshed every few hours.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
