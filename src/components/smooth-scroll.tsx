"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let instance: Lenis | undefined;

// Freezes the page behind an overlay, smooth scrolling or not.
export function lockScroll(locked: boolean) {
  if (locked) instance?.stop();
  else instance?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // lerp, not a fixed duration: each frame closes 28% of the gap, so the
    // page tracks the wheel closely and only the tail of a scroll is eased.
    // Touch keeps the platform's own scrolling, which phones already do well.
    const lenis = new Lenis({
      lerp: 0.28,
      wheelMultiplier: 1,
      anchors: { offset: -88, duration: 0.9 },
      autoRaf: true,
    });
    instance = lenis;
    return () => {
      instance = undefined;
      lenis.destroy();
    };
  }, []);
  return null;
}
