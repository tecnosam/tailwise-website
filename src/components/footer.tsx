import Link from "next/link";
import { site } from "@/lib/site";
import { GitHubIcon } from "./icons";
import { Logo } from "./logo";
import { Reveal } from "./reveal";
import { SieveBackdrop } from "./sieve-backdrop";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quickstart", href: "/#quickstart" },
      { label: "Benchmark", href: "/benchmark" },
      { label: "Download", href: "/download" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: site.links.github },
      { label: "Releases", href: site.links.releases },
      { label: "Issues", href: site.links.issues },
      { label: "Contributing", href: site.links.contributing },
    ],
  },
  {
    title: "Reference",
    links: [
      { label: "Config schema", href: site.links.schema },
      { label: "Examples", href: site.links.examples },
      { label: "Known limitations", href: "/docs#known-limitations" },
      { label: "Helm chart", href: site.links.helm },
      { label: "Architecture", href: site.links.architecture },
    ],
  },
];

export function CallToAction() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-48">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-x-1/2 -translate-y-1/2 bloom-soft" />
      <SieveBackdrop className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_70%)]" />
      <Reveal className="mx-auto max-w-4xl text-center">
        <Logo className="mx-auto size-14 text-ink" />
        <h2 className="mt-10 font-display text-[clamp(2.6rem,7vw,5.6rem)] text-balance leading-[0.95] font-semibold tracking-[-0.055em] text-ink">
          Find the wrong answers{" "}
          <span className="font-serif font-normal tracking-[-0.03em] text-accent italic">before your users do</span>.
        </h2>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/#quickstart"
            className="flex h-12 items-center rounded-full bg-accent px-7 text-sm font-medium text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)] transition-transform hover:scale-[1.03]"
          >
            Try it in 60 seconds
          </Link>
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center gap-2 rounded-full border border-line-strong px-7 text-sm font-medium text-ink transition-colors hover:bg-paper-2"
          >
            <GitHubIcon /> Star on GitHub
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-16 sm:grid-cols-3 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-12">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <div className="flex items-center gap-2 text-ink">
            <Logo className="size-6" />
            <span className="font-display text-lg font-semibold tracking-[-0.04em]">tailwise</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            An open-source inference engine for LLM agent traces. Written in Go, built on
            OpenTelemetry and NATS JetStream.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-mono text-[0.68rem] tracking-[0.2em] text-ink-faint uppercase">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => {
                const external = l.href.startsWith("http");
                return (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-sm text-ink-soft transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl overflow-hidden px-6">
        <div
          aria-hidden
          className="translate-y-[18%] text-center font-display text-[22vw] leading-none font-bold tracking-[-0.07em] text-transparent select-none md:text-[15rem]"
          style={{ WebkitTextStroke: "1px var(--line-strong)" }}
        >
          tailwise
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 font-mono text-[0.7rem] text-ink-faint">
          <span>
            v{site.version} ·{" "}
            <a href={site.links.license} target="_blank" rel="noreferrer" className="hover:text-ink">
              {site.license}
            </a>
          </span>
          <span>Keep the traces worth reviewing.</span>
        </div>
      </div>
    </footer>
  );
}
