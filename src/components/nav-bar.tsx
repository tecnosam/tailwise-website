"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { site } from "@/lib/site";
import { ArrowUpRight, DownloadIcon, GitHubIcon } from "./icons";
import { Logo, Wordmark } from "./logo";
import { lockScroll } from "./smooth-scroll";
import { ThemeToggle } from "./theme-toggle";

const items = [
  { href: "/docs", label: "Docs" },
  { href: "/benchmark", label: "Benchmark" },
  { href: "/#how", label: "How it works" },
  { href: "/#data", label: "Data" },
  { href: "/#cost", label: "Cost" },
  { href: "/download", label: "Download" },
];

const ease = [0.16, 1, 0.3, 1] as const;

// Two lines that cross into an X.
function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className="relative grid size-9 place-items-center rounded-full border border-line text-ink md:hidden"
    >
      <span
        className={`absolute h-px w-4 bg-current transition-transform duration-500 ease-out-expo ${
          open ? "rotate-45" : "-translate-y-[3px]"
        }`}
      />
      <span
        className={`absolute h-px w-4 bg-current transition-transform duration-500 ease-out-expo ${
          open ? "-rotate-45" : "translate-y-[3px]"
        }`}
      />
    </button>
  );
}

function isCurrent(pathname: string, href: string) {
  return !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
}

function MobileMenu({ version, onClose }: { version: string; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
      animate={{ clipPath: "circle(150% at calc(100% - 2.6rem) 2.6rem)" }}
      exit={{ clipPath: "circle(0% at calc(100% - 2.6rem) 2.6rem)" }}
      transition={{ duration: 0.7, ease }}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-paper px-6 pt-28 pb-[max(2rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="bloom pointer-events-none absolute -right-48 -bottom-48 size-[40rem]" />
      <Logo className="pointer-events-none absolute -right-16 bottom-28 size-72 text-ink opacity-[0.04]" />

      <nav className="relative">
        <ul>
          {items.map((item, i) => {
            const on = isCurrent(pathname, item.href);
            return (
              <li key={item.href} className="overflow-hidden border-b border-line">
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "110%", transition: { duration: 0.3, ease } }}
                  transition={{ duration: 0.8, delay: 0.12 + i * 0.05, ease }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-4 py-3.5"
                  >
                    <span className="w-6 font-mono text-[0.65rem] text-accent">0{i + 1}</span>
                    <span
                      className={`text-[2.35rem] leading-none tracking-[-0.045em] transition-colors ${
                        on
                          ? "font-serif font-normal tracking-[-0.02em] text-accent italic"
                          : "font-display font-semibold text-ink group-active:text-accent"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.7, delay: 0.45, ease }}
        className="relative mt-auto"
      >
        <div className="flex gap-2">
          <Link
            href="/download"
            onClick={onClose}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)]"
          >
            <DownloadIcon /> Download v{version}
          </Link>
          <a
            href={site.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="Tailwise on GitHub"
            className="grid size-12 place-items-center rounded-full border border-line-strong text-ink"
          >
            <GitHubIcon />
          </a>
        </div>
        <div className="mt-5 flex items-center justify-between font-mono text-[0.68rem] text-ink-faint">
          <span>v{version} · {site.license}</span>
          <a href={site.links.issues} target="_blank" rel="noreferrer" className="flex items-center gap-1">
            Issues <ArrowUpRight className="size-3" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function NavBar({ version }: { version: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <>
      <header className="enter fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
        <nav
          className={`flex w-full max-w-6xl items-center justify-between rounded-full border py-2 pr-2 pl-4 transition-all duration-500 sm:px-3 sm:pl-5 ${
            scrolled && !open
              ? "border-line bg-paper/90 shadow-[0_8px_40px_-12px_rgb(0_0_0/0.12)] backdrop-blur-md"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" aria-label="Tailwise home" onClick={close}>
            <Wordmark />
          </Link>
          <ul className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="Tailwise on GitHub"
              className="hidden h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper transition-transform hover:scale-[1.03] active:scale-[0.98] sm:flex"
            >
              <GitHubIcon />
              GitHub
            </a>
            <MenuButton open={open} onClick={() => setOpen((v) => !v)} />
          </div>
        </nav>
      </header>
      <AnimatePresence>{open && <MobileMenu version={version} onClose={close} />}</AnimatePresence>
    </>
  );
}
