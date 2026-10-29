import Link from "next/link";
import type { TocItem } from "@/lib/markdown";
import { DocsToc } from "./docs-toc";
import { Footer } from "./footer";
import { ArrowUpRight } from "./icons";
import { MermaidDiagrams } from "./mermaid-diagrams";
import { Nav } from "./nav";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  links: { label: string; href: string; icon?: React.ReactNode }[];
  toc: TocItem[];
  html: string;
  // Pages next to this one, listed above the table of contents.
  siblings?: { label: string; href: string; current: boolean }[];
  diagrams?: boolean;
};

// The layout every markdown page from the engine's repo shares.
export function DocShell({ eyebrow, title, links, toc, html, siblings, diagrams }: Props) {
  return (
    <>
      <Nav />
      <div className="mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-6 md:pt-36">
        <div className="enter max-w-3xl">
          <div className="font-mono text-[0.7rem] tracking-[0.2em] text-ink-faint uppercase">{eyebrow}</div>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[0.95] font-semibold tracking-[-0.05em] text-ink sm:text-5xl md:text-7xl">
            {title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {links.map(({ label, href, icon }) => {
              const external = href.startsWith("http");
              return (
                <Link
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex items-center gap-1 text-ink-soft transition-colors hover:text-accent"
                >
                  {label} {icon ?? (external ? <ArrowUpRight /> : null)}
                </Link>
              );
            })}
          </div>
        </div>

        {siblings && (
          <nav
            aria-label="Architecture"
            className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:hidden"
          >
            {siblings.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  s.current ? "border-accent/40 bg-accent-wash text-accent" : "border-line text-ink-soft"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Phones get the sections as a fold-out list in place of the sidebar */}
        <details className="group mt-6 rounded-2xl border border-line bg-paper-2 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm text-ink [&::-webkit-details-marker]:hidden">
            On this page
            <span className="font-mono text-ink-faint transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <ul className="max-h-[50svh] overflow-y-auto border-t border-line px-4 py-2 text-sm" data-lenis-prevent>
            {toc
              .filter((t) => t.depth === 2)
              .map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block py-1.5 text-ink-soft active:text-accent">
                    {t.text}
                  </a>
                </li>
              ))}
          </ul>
        </details>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 md:mt-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2" data-lenis-prevent>
              {siblings && (
                <ul className="mb-8 space-y-0.5 text-sm">
                  {siblings.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className={`block rounded-lg px-3 py-1.5 transition-colors ${
                          s.current ? "bg-accent-wash text-accent" : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <DocsToc toc={toc} />
            </div>
          </aside>
          <article className="prose-tw max-w-3xl min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
      {diagrams && <MermaidDiagrams />}
      <Footer />
    </>
  );
}
