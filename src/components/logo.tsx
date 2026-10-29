// The mark: a sieve. Three strands fall in, one passes through.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M8 4v8M16 4v8M24 4v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
      <path d="M4 15h24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 18v10" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="16" cy="28" r="2.4" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-ink">
      <Logo className="size-6" />
      <span className="font-display text-[1.15rem] font-semibold tracking-[-0.04em]">tailwise</span>
    </span>
  );
}
