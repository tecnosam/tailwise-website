"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Sieve = dynamic(() => import("./sieve"), { ssr: false });

// The WebGL sieve behind a section. It downloads only once the section nears
// the viewport and the browser is idle, so it never competes with first paint.
export function SieveBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let idle = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        idle = window.requestIdleCallback
          ? window.requestIdleCallback(() => setLoad(true), { timeout: 800 })
          : window.setTimeout(() => setLoad(true), 200);
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none ${className}`}>
      <div
        className={`size-full transition-[opacity,transform] duration-[1600ms] ease-out-expo ${
          ready ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
        }`}
      >
        {load && <Sieve onReady={() => setReady(true)} />}
      </div>
    </div>
  );
}
