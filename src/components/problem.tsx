"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { Comparison } from "./comparison";
import { Reveal, SectionLabel } from "./reveal";

const ease = [0.16, 1, 0.3, 1] as const;

// Counts up to the figure once it scrolls into view.
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => Math.round(v).toString());
  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, to, value]);
  return <motion.span ref={ref}>{text}</motion.span>;
}


function Line({ i, show, children, className = "" }: { i: number; show: boolean; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={show ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// One agent run that passes every health check and still gets the answer wrong.
function TraceCard() {
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, margin: "-120px" });
  const verdict = 0.15 + 6 * 0.12 + 0.7;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.25)]"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[0.68rem] text-ink-faint">
        <span>one agent run · trace 7f3a91</span>
        <span className="flex items-center gap-1.5 text-good">
          <span className="size-1.5 rounded-full bg-good" /> healthy
        </span>
      </div>
      <div className="space-y-2.5 px-5 py-5 font-mono text-[0.74rem] leading-relaxed text-ink sm:text-[0.8rem]">
        <Line i={0} show={show}>
          <span className="text-ink-faint">question </span>Which magazine started first, Arthur&apos;s Magazine or
          First for Women?
        </Line>
        <Line i={1} show={show}>
          <span className="text-ink-faint">tool </span>search(&quot;First for Women&quot;)
        </Line>
        <Line i={2} show={show} className="text-ink-faint">
          <span>tool </span>(stopped, never searched the other)
        </Line>
        <Line i={3} show={show}>
          <span className="text-ink-faint">answer </span>
          <span className="relative">
            First for Women
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={show ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: verdict, ease }}
              className="absolute top-1/2 right-0 left-0 h-[1.5px] origin-left bg-accent"
            />
          </span>
        </Line>
        <Line i={4} show={show} className="text-good">
          <span className="text-ink-faint">status </span>200 OK · no errors · normal speed
        </Line>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: verdict, ease }}
          className="mt-4 border-t border-dashed border-line-strong pt-4"
        >
          <div className="text-accent">
            <span className="text-ink-faint">truth </span>Arthur&apos;s Magazine (1844)
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.7rem]">
            <span className="rounded bg-accent px-1.5 py-px font-medium text-accent-ink">keep</span>
            <span className="text-ink-faint">flags</span>
            <span className="rounded-full border border-accent/30 bg-accent-wash px-2 py-px text-accent">answer_wrong</span>
            <span className="rounded-full border border-accent/30 bg-accent-wash px-2 py-px text-accent">missing_tool_calls</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Problem() {
  return (
    <section id="why" className="relative mx-auto max-w-6xl px-6 py-24 md:py-40">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-20">
        <div>
          <SectionLabel>The problem</SectionLabel>
          <Reveal>
            <h2 className="mt-6 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink md:text-[3.4rem]">
              Your dashboards say{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-good italic">healthy</span>. The
              answer is wrong.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              A wrong answer throws no error and runs at normal speed, so your monitoring never sees
              it. Your users do.
            </p>
            <div className="mt-10 flex items-end gap-5">
              <div className="font-display text-[clamp(5rem,14vw,8.5rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-accent tabular-nums">
                <CountUp to={95} />%
              </div>
              <p className="max-w-[14rem] pb-1.5 leading-snug text-ink-soft">
                of wrong answers go unseen when your team reviews a random 5% of runs.
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} y={40} className="md:pt-14">
          <TraceCard />
        </Reveal>
      </div>
      <Comparison />
    </section>
  );
}
