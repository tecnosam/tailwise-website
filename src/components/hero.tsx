import Link from "next/link";
import { multiple } from "@/lib/benchmark";
import { getVersion } from "@/lib/releases";
import { ArrowIcon, ArrowUpRight } from "./icons";
import { RecallChart } from "./recall-chart";

const delay = (d: number) => ({ "--d": `${d}s` }) as React.CSSProperties;

// Words rise out of a mask on first paint: CSS, so they never wait for JS.
// The space sits between the masks: inside an inline-block it would collapse.
function Words({ text, at, step = 0.05 }: { text: string; at: number; step?: number }) {
  return text.split(" ").map((word, i) => (
    <span key={i}>
      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <span className="enter-word inline-block" style={delay(at + i * step)}>
          {word}
        </span>
      </span>{" "}
    </span>
  ));
}

export async function Hero() {
  const version = await getVersion();
  return (
    <section className="relative isolate overflow-hidden">
      <div className="bloom pointer-events-none absolute top-[10%] right-[-25%] -z-10 size-[60rem] md:right-[-10%]" />
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_40%,black_10%,transparent_60%)]" />

      <div className="mx-auto grid min-h-[100svh] max-w-6xl grid-cols-[minmax(0,1fr)] content-center gap-14 px-6 pt-32 pb-20 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-16">
        <div className="self-center">
          <Link
            href="/download"
            style={delay(0.05)}
            className="enter group mb-8 flex w-fit items-center gap-2.5 rounded-full border border-line bg-paper/80 py-1 pr-3 pl-1 text-xs text-ink-soft transition-colors hover:border-line-strong"
          >
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[0.65rem] font-medium text-accent-ink">
              v{version}
            </span>
            Open source, Apache-2.0
            <ArrowIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="font-display text-[clamp(2.6rem,5.2vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-ink">
            <Words text="Find" at={0.08} />
            <span className="font-serif text-[1.06em] font-normal tracking-[-0.03em] text-accent italic">
              <Words text={`${Math.floor(multiple)}× the failures`} at={0.14} />
            </span>
            <br className="hidden lg:block" />
            <Words text="in the same review budget." at={0.3} />
          </h1>

          <p style={delay(0.45)} className="enter mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-[1.2rem]">
            Tailwise scores every agent trace and keeps the likely wrong answers for your team. On 456
            held-out agent runs,{" "}
            <span className="text-ink">it found 8.4 failures where random sampling found 1.1</span>.
          </p>

          <div style={delay(0.55)} className="enter mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="#quickstart"
              className="group flex h-12 shrink-0 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium whitespace-nowrap text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Try it in 60 seconds
              <ArrowIcon className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/benchmark"
              className="flex h-12 shrink-0 items-center gap-2 rounded-full border border-line-strong bg-paper/80 px-6 text-sm font-medium whitespace-nowrap text-ink transition-colors hover:bg-paper-2"
            >
              Read the benchmark
            </Link>
          </div>
        </div>

        <div
          style={delay(0.35)}
          className="enter self-center rounded-3xl border border-line bg-paper-2/90 p-6 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.35)] md:p-8"
        >
          <RecallChart delay={0.6} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs text-ink-faint">
            <span>456 held-out traces · 1 in 10 wrong · 20 resamples</span>
            <Link href="/benchmark" className="flex items-center gap-1 text-ink-soft transition-colors hover:text-accent">
              How we measured <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
