"use client";

import { useEffect } from "react";

type Mermaid = typeof import("mermaid").default;

let loading: Promise<Mermaid> | undefined;
const load = () => (loading ??= import("mermaid").then((m) => m.default));

function css(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Mermaid's theme, taken from the site's own palette for the current theme.
function configure(mermaid: Mermaid) {
  const dark = document.documentElement.classList.contains("dark");
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: getComputedStyle(document.body).fontFamily,
    themeVariables: {
      darkMode: dark,
      background: css("--paper"),
      primaryColor: css("--paper-2"),
      primaryTextColor: css("--ink"),
      primaryBorderColor: css("--ink-faint"),
      secondaryColor: css("--paper-3"),
      tertiaryColor: css("--paper"),
      lineColor: css("--ink-faint"),
      textColor: css("--ink"),
      noteBkgColor: css("--paper-3"),
      noteTextColor: css("--ink"),
      noteBorderColor: css("--accent"),
      actorBkg: css("--paper-2"),
      actorBorder: css("--accent"),
      signalColor: css("--ink-soft"),
      signalTextColor: css("--ink"),
      clusterBkg: css("--paper-2"),
      clusterBorder: css("--ink-faint"),
      fontSize: "14px",
    },
  });
}

let counter = 0;

async function draw(el: HTMLElement) {
  const source = el.querySelector<HTMLElement>(".mermaid-source")?.textContent;
  if (!source) return;
  const mermaid = await load();
  try {
    const { svg } = await mermaid.render(`mermaid-${++counter}`, source);
    let out = el.querySelector<HTMLElement>(".mermaid-svg");
    if (!out) {
      out = document.createElement("div");
      out.className = "mermaid-svg";
      out.setAttribute("data-lenis-prevent-horizontal", "");
      el.append(out);
    }
    out.innerHTML = svg;
    // Never shrink a wide diagram past legibility: scroll it sideways instead.
    const graphic = out.querySelector("svg");
    const width = graphic?.viewBox.baseVal?.width;
    if (graphic && width) graphic.style.minWidth = `${Math.min(width, 680)}px`;
    el.dataset.rendered = "";
  } catch {
    // A diagram that does not parse stays as its source.
  }
}

// Draws every .mermaid-diagram on the page, nearest to the viewport first,
// and redraws the drawn ones when the theme changes. Drawing a diagram blocks
// the main thread for tens of milliseconds, so it waits until scrolling has
// paused and the browser is idle, then draws one diagram per idle slot.
// Mermaid itself is only downloaded once a diagram is close.
export function MermaidDiagrams() {
  useEffect(() => {
    const blocks = [...document.querySelectorAll<HTMLElement>(".mermaid-diagram")];
    if (!blocks.length) return;

    let stopped = false;
    let lastScroll = 0;
    let timer = 0;
    let busy = false;
    const queue = new Set<HTMLElement>();
    const onScroll = () => (lastScroll = performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });

    const distance = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom < 0 ? -r.bottom : Math.max(0, r.top - window.innerHeight);
    };

    const pump = () => {
      timer = 0;
      if (stopped || busy || !queue.size) return;
      const quiet = performance.now() - lastScroll;
      if (quiet < 180) {
        timer = window.setTimeout(pump, 180 - quiet);
        return;
      }
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
      idle(async () => {
        if (stopped) return;
        // Scrolling may have started while this waited for an idle slot.
        if (performance.now() - lastScroll < 180) {
          timer = window.setTimeout(pump, 180);
          return;
        }
        const next = [...queue].sort((a, b) => distance(a) - distance(b))[0];
        queue.delete(next);
        busy = true;
        configure(await load());
        await draw(next);
        busy = false;
        if (!timer) timer = window.setTimeout(pump, 16);
      });
    };
    const schedule = (els: HTMLElement[]) => {
      els.forEach((el) => queue.add(el));
      if (!timer) timer = window.setTimeout(pump, 0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const near = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        near.forEach((el) => observer.unobserve(el));
        if (near.length) schedule(near);
      },
      { rootMargin: "1200px 0px" },
    );
    blocks.forEach((b) => observer.observe(b));

    const theme = new MutationObserver(() => schedule(blocks.filter((b) => "rendered" in b.dataset)));
    theme.observe(document.documentElement, { attributeFilter: ["class"] });

    return () => {
      stopped = true;
      clearTimeout(timer);
      observer.disconnect();
      theme.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
