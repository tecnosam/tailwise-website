"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Tab = { label: string; file: string; html: string };

export function ConnectTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.3)]">
      <div className="flex gap-1 overflow-x-auto border-b border-line p-1.5 [scrollbar-width:none] max-md:[mask-image:linear-gradient(90deg,black_80%,transparent)]" data-lenis-prevent-horizontal>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActive(i)}
            className={`relative shrink-0 rounded-lg px-3.5 py-1.5 text-sm transition-colors ${
              i === active ? "text-ink" : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {i === active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-paper shadow-sm ring-1 ring-line"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-5 pt-4 font-mono text-[0.68rem] text-ink-faint">
        <span>{tab.file}</span>
        <span className="size-1.5 rounded-full bg-accent" />
      </div>
      <div className="relative min-h-[13rem] md:min-h-[19rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-x-auto px-5 pt-3 pb-6 font-mono text-[0.7rem] leading-[1.75] sm:text-[0.76rem] [&_pre]:!bg-transparent"
            data-lenis-prevent-horizontal
            dangerouslySetInnerHTML={{ __html: tab.html }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
