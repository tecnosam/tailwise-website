"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

const commands = [
  `git clone ${site.links.github.replace("https://", "")} && cd tailwise`,
  "export JEV_API_KEY=…",
  "make up && make samples",
];

// The shape `make samples` prints: one decision per trace, with Jev's reason.
const rows = [
  { id: "a57d9106", label: "wrong", keep: true, p: "0.980", reason: "The final answer contradicts the evidence the agent gathered." },
  { id: "d5ca6bb1", label: "correct", keep: false, p: "0.040", reason: "The final answer is correct, complete and supported by the evidence." },
  { id: "3c1e0f7b", label: "partial", keep: true, p: "0.810", reason: "The final answer leaves out part of what the question asked." },
  { id: "8f20b4d6", label: "wrong", keep: true, p: "0.930", reason: "A tool call failed and the agent answered anyway." },
];

export function QuickstartTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (line < commands.length) {
      if (chars < commands[line].length) {
        const t = setTimeout(() => setChars((c) => c + 1), 22);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setLine((l) => l + 1);
        setChars(0);
      }, 260);
      return () => clearTimeout(t);
    }
    if (shown < rows.length) {
      const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 500 : 380);
      return () => clearTimeout(t);
    }
  }, [inView, line, chars, shown]);

  const done = shown >= rows.length;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.3)]"
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 font-mono text-[0.7rem] text-ink-faint">~</span>
      </div>
      <div className="min-h-[24rem] overflow-x-auto px-5 py-4 font-mono text-[0.72rem] leading-relaxed sm:text-[0.78rem]" data-lenis-prevent-horizontal>
        {commands.map((cmd, i) =>
          i > line ? null : (
            <div key={cmd} className="whitespace-nowrap text-ink">
              <span className="text-accent">❯ </span>
              {i < line ? cmd : cmd.slice(0, chars)}
              {i === line && (
                <span className="ml-px inline-block h-[1.05em] w-[0.5em] translate-y-[2px] animate-pulse bg-accent" />
              )}
            </div>
          ),
        )}
        <div className="mt-3 divide-y divide-line">
          {rows.slice(0, shown).map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="py-2"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-ink-faint">{r.id}…</span>
                <span className="text-ink-soft">
                  label=<span className="text-ink">{r.label}</span>
                </span>
                <span
                  className={`rounded px-1.5 py-px text-[0.7rem] font-medium ${
                    r.keep ? "bg-accent text-accent-ink" : "bg-paper-3 text-ink-soft"
                  }`}
                >
                  {r.keep ? "keep" : "drop"}
                </span>
                <span className="text-ink-soft">
                  p_keep=<span className={r.keep ? "text-accent" : "text-ink"}>{r.p}</span>
                </span>
              </div>
              <div className={`mt-0.5 pl-4 ${r.keep ? "text-ink" : "text-ink-faint"}`}>{r.reason}</div>
            </motion.div>
          ))}
        </div>
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-ink-faint">
            kept traces → <span className="text-ink">http://localhost:6006</span>, project tailwise
          </motion.div>
        )}
      </div>
    </div>
  );
}
