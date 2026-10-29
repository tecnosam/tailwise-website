"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { type Arch, type Os, type Release, formatSize, platforms } from "@/lib/platforms";
import { site } from "@/lib/site";
import { ArrowUpRight, DownloadIcon } from "./icons";

type NavigatorUAData = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
};

// A best guess from the browser. Client hints give the architecture on
// Chromium; elsewhere a Mac is taken to be Apple silicon, everything else x86-64.
async function detect(): Promise<{ os: Os; arch: Arch }> {
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  const ua = navigator.userAgent;
  const platform = (uaData?.platform || navigator.platform || ua).toLowerCase();
  const os: Os = /win/.test(platform) ? "windows" : /mac|iphone|ipad/.test(platform) ? "darwin" : "linux";
  let arch: Arch = os === "darwin" ? "arm64" : "amd64";
  if (/aarch64|arm64/i.test(ua)) arch = "arm64";
  try {
    const hints = await uaData?.getHighEntropyValues?.(["architecture"]);
    if (hints?.architecture === "arm") arch = "arm64";
    else if (hints?.architecture === "x86") arch = "amd64";
  } catch {}
  return { os, arch };
}

function CopyHash({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hash);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="group flex min-w-0 items-center gap-2 font-mono text-[0.7rem] text-ink-faint transition-colors hover:text-ink"
      title="Copy SHA-256"
    >
      <span className="shrink-0">sha256</span>
      <span className="truncate">{hash}</span>
      <span className={`shrink-0 ${copied ? "text-accent" : ""}`}>{copied ? "copied" : "copy"}</span>
    </button>
  );
}

export function DownloadPicker({ release }: { release: Release }) {
  const [os, setOs] = useState<Os>("linux");
  const [arch, setArch] = useState<Arch>("amd64");
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    let live = true;
    detect().then((d) => {
      if (!live) return;
      setOs(d.os);
      setArch(d.arch);
      setDetected(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const platform = platforms.find((p) => p.os === os)!;
  const archLabel = platform.archs.find((a) => a.arch === arch)?.label;
  const asset = release.assets.find((a) => a.os === os && a.arch === arch);
  const size = formatSize(asset?.size);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper-2 p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.3)] md:p-9">
      <div className="bloom pointer-events-none absolute -top-48 -right-48 size-[34rem] opacity-80" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-full border border-line bg-paper p-1" role="tablist" aria-label="Operating system">
          {platforms.map((p) => (
            <button
              key={p.os}
              type="button"
              role="tab"
              aria-selected={p.os === os}
              onClick={() => {
                setOs(p.os);
                if (!p.archs.some((a) => a.arch === arch)) setArch(p.archs[0].arch);
              }}
              className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                p.os === os ? "text-accent-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.os === os && (
                <motion.span
                  layoutId="os-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1 font-mono text-[0.72rem]" role="radiogroup" aria-label="Architecture">
          {platform.archs.map((a) => (
            <button
              key={a.arch}
              type="button"
              role="radio"
              aria-checked={a.arch === arch}
              onClick={() => setArch(a.arch)}
              className={`rounded-md border px-2.5 py-1 transition-colors ${
                a.arch === arch ? "border-accent/50 bg-accent-wash text-accent" : "border-line text-ink-faint hover:text-ink-soft"
              }`}
            >
              {a.arch} <span className="opacity-70">· {a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8 min-h-[8.5rem] md:mt-10 md:min-h-[11.5rem]">
        <div className="font-mono text-[0.68rem] tracking-[0.2em] text-ink-faint uppercase">
          {detected ? "Detected for this machine" : "Choose a platform"}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${os}-${arch}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="mt-3 font-display text-4xl leading-none font-semibold tracking-[-0.045em] text-ink md:text-5xl">
              {platform.label}{" "}
              <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">{archLabel}</span>
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.78rem] text-ink-soft">
              <span className="text-ink">{asset?.name}</span>
              {size && <span className="text-ink-faint">{size}</span>}
            </div>
            {asset?.sha256 && (
              <div className="mt-2 max-w-md">
                <CopyHash hash={asset.sha256} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-3">
        {release.published && asset ? (
          <a
            href={asset.url}
            className="group flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-ink shadow-[0_10px_40px_-10px_var(--accent)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <DownloadIcon className="size-4 transition-transform group-hover:translate-y-0.5" />
            Download v{release.version}
          </a>
        ) : (
          <span
            aria-disabled
            className="flex h-12 cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-line-strong px-6 text-sm font-medium text-ink-faint"
          >
            <DownloadIcon /> v{release.version} binaries not published yet
          </span>
        )}
        {release.checksums && (
          <a
            href={release.checksums}
            className="flex h-12 items-center gap-1.5 rounded-full border border-line-strong px-5 text-sm font-medium text-ink transition-colors hover:bg-paper"
          >
            checksums.txt
          </a>
        )}
        <a
          href={release.published ? release.url : site.links.releases}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center gap-1.5 px-2 text-sm text-ink-soft transition-colors hover:text-accent"
        >
          On GitHub <ArrowUpRight />
        </a>
      </div>
    </div>
  );
}
