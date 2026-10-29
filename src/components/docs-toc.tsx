"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/lib/markdown";

// Tags each heading with the h2 it sits under.
function withSections(toc: TocItem[]) {
  const items: (TocItem & { section?: string })[] = [];
  for (const t of toc) {
    const section = t.depth === 2 ? t.id : items.at(-1)?.section;
    items.push({ ...t, section });
  }
  return items;
}

export function DocsToc({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState(toc[0]?.id);

  // The active heading is the last one above a line 140px from the top. An
  // observer reports headings crossing that band, so scrolling never has to
  // measure the page.
  useEffect(() => {
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    const above = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.boundingClientRect.top < 140) above.add(e.target.id);
          else above.delete(e.target.id);
        }
        const current = headings.findLast((h) => above.has(h.id)) ?? headings[0];
        if (current) setActive(current.id);
      },
      { rootMargin: "-140px 0px 0px 0px", threshold: [0, 1] },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  // The section (h2) holding the active heading, so only its h3s expand.
  const activeSection = useMemo(() => {
    let section: string | undefined;
    for (const t of toc) {
      if (t.depth === 2) section = t.id;
      if (t.id === active) return section;
    }
    return section;
  }, [toc, active]);

  const items = useMemo(() => withSections(toc), [toc]);

  return (
    <nav aria-label="On this page" className="text-sm">
      <ul className="space-y-0.5 border-l border-line">
        {items.map((t) => {
          if (t.depth === 3 && t.section !== activeSection) return null;
          const on = t.id === active;
          return (
            <li key={t.id} className="relative">
              <span
                className={`absolute top-0 bottom-0 -left-px w-px bg-accent transition-opacity duration-300 ${
                  on ? "opacity-100" : "opacity-0"
                }`}
              />
              <a
                href={`#${t.id}`}
                aria-current={on ? "location" : undefined}
                className={`block py-1 leading-snug transition-colors ${t.depth === 3 ? "pl-7 text-[0.8rem]" : "pl-4"} ${
                  on ? "text-accent" : "text-ink-soft hover:text-ink"
                }`}
              >
                {t.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
