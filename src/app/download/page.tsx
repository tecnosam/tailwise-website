import type { Metadata } from "next";
import Link from "next/link";
import { ConnectTabs } from "@/components/connect-tabs";
import { DownloadPicker } from "@/components/download-picker";
import { Footer } from "@/components/footer";
import { ArrowUpRight, DownloadIcon } from "@/components/icons";
import { Nav } from "@/components/nav";
import { Reveal, SectionLabel } from "@/components/reveal";
import { highlight } from "@/lib/highlight";
import { formatSize, platforms } from "@/lib/platforms";
import { getReleases } from "@/lib/releases";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download",
  description: "Tailwise binaries for Linux, macOS and Windows, on amd64 and arm64, with checksums.",
};

function installSnippets(version: string) {
  const base = `${site.links.releases}/download/v${version}`;
  return [
    {
      label: "Linux",
      lang: "bash",
      file: "bash",
      code: `
VERSION=${version} ARCH=amd64        # or arm64
curl -fsSLO ${base}/tailwise_\${VERSION}_linux_\${ARCH}.tar.gz
curl -fsSLO ${base}/checksums.txt
sha256sum --ignore-missing -c checksums.txt
tar -xzf tailwise_\${VERSION}_linux_\${ARCH}.tar.gz tailwise
sudo install tailwise /usr/local/bin/

export JEV_API_KEY=...
tailwise -check && tailwise`,
    },
    {
      label: "macOS",
      lang: "bash",
      file: "zsh",
      code: `
VERSION=${version} ARCH=arm64        # amd64 on an Intel Mac
curl -fsSLO ${base}/tailwise_\${VERSION}_darwin_\${ARCH}.tar.gz
curl -fsSLO ${base}/checksums.txt
shasum -a 256 --ignore-missing -c checksums.txt
tar -xzf tailwise_\${VERSION}_darwin_\${ARCH}.tar.gz tailwise
# Downloaded in a browser instead? Clear the quarantine first:
# xattr -d com.apple.quarantine tailwise

export JEV_API_KEY=...
./tailwise -check && ./tailwise`,
    },
    {
      label: "Windows",
      lang: "powershell",
      file: "PowerShell",
      code: `
$v = "${version}"; $arch = "amd64"   # or arm64
Invoke-WebRequest "${base}/tailwise_$($v)_windows_$arch.zip" -OutFile tailwise.zip
(Get-FileHash tailwise.zip -Algorithm SHA256).Hash   # compare with checksums.txt
Expand-Archive tailwise.zip -DestinationPath tailwise

$env:JEV_API_KEY = "..."
.\\tailwise\\tailwise.exe -check
.\\tailwise\\tailwise.exe`,
    },
    {
      label: "Docker Compose",
      lang: "bash",
      file: "bash",
      code: `
git clone ${site.links.github}.git && cd tailwise
export JEV_API_KEY=...
make up        # the engine, NATS JetStream and Phoenix
make samples   # send the bundled traces, print each decision`,
    },
    {
      label: "From source",
      lang: "bash",
      file: "Go 1.26+",
      code: `
go install github.com/tecnosam/tailwise/cmd/tailwise@latest

# or, stamped with its version:
git clone ${site.links.github}.git && cd tailwise
make build     # bin/tailwise`,
    },
  ];
}

const firstRun = [
  ["Check the config", "tailwise -check validates the built-in defaults, or your file with -config my.yaml, confirms the secrets it names are set, and exits."],
  ["Run on the defaults", "With no config file, Tailwise scores with Jev, runs NATS inside the process, and sends kept traces to Phoenix at localhost:6006."],
  ["Point an agent at it", "Set your OpenTelemetry exporter to localhost:4318, or POST traces to localhost:8080/v1/traces."],
];

export default async function DownloadPage() {
  const releases = await getReleases();
  const latest = releases.find((r) => !r.prerelease) ?? releases[0];
  const tabs = await Promise.all(
    installSnippets(latest.version).map(async (s) => ({ label: s.label, file: s.file, html: await highlight(s.code, s.lang) })),
  );

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pt-28 pb-24 sm:px-6 md:pt-36">
        <div className="enter max-w-3xl" style={{ "--d": "0.05s" } as React.CSSProperties}>
          <div className="font-mono text-[0.7rem] tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-accent">v{latest.version}</span> · Download
          </div>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[0.95] sm:text-5xl font-semibold tracking-[-0.05em] text-ink md:text-7xl">
            Download{" "}
            <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">Tailwise</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Each release has one static binary per platform. The queues run inside the binary, so you
            need only a Jev API key to start.
          </p>
        </div>

        {!latest.published && (
          <div
            className="enter mt-10 flex max-w-3xl gap-3 rounded-2xl border border-dashed border-accent/40 bg-accent-wash px-5 py-4 text-sm leading-relaxed text-ink-soft"
            style={{ "--d": "0.12s" } as React.CSSProperties}
          >
            <span className="mt-1.5 size-2 shrink-0 animate-pulse rounded-full bg-accent" />
            <p>
  The v{latest.version} binaries are not on GitHub Releases yet. They will show up on this
  page when the release is published. Until then, run Tailwise with{" "}
  <a href="#install" className="text-accent underline underline-offset-2">Docker Compose or from source</a>.
</p>
          </div>
        )}

        <div className="enter mt-12" style={{ "--d": "0.15s" } as React.CSSProperties}>
          <DownloadPicker release={latest} />
        </div>

        {/* Every archive */}
        <section className="mt-20 md:mt-28">
          <SectionLabel>All platforms</SectionLabel>
          <Reveal>
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
              {platforms.map((p) => (
                <div key={p.os} className="rounded-2xl border border-line bg-paper-2/60 p-5">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">{p.label}</h3>
                  <ul className="mt-4 divide-y divide-line">
                    {p.archs.map(({ arch, label }) => {
                      const asset = latest.assets.find((a) => a.os === p.os && a.arch === arch);
                      if (!asset) return null;
                      const size = formatSize(asset.size);
                      const body = (
                        <>
                          <span className="min-w-0">
                            <span className="block text-sm text-ink">
                              {label} <span className="font-mono text-[0.7rem] text-ink-faint">{arch}</span>
                            </span>
                            <span className="block truncate font-mono text-[0.68rem] text-ink-faint">
                              {asset.name}
                              {size && ` · ${size}`}
                            </span>
                          </span>
                          <DownloadIcon className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent" />
                        </>
                      );
                      return (
                        <li key={arch}>
                          {latest.published ? (
                            <a href={asset.url} className="group flex items-center justify-between gap-3 py-3">
                              {body}
                            </a>
                          ) : (
                            <div className="flex items-center justify-between gap-3 py-3 opacity-60">{body}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-faint">
              Each archive contains the binary, LICENSE, README and CHANGELOG. Windows archives are .zip
              files with tailwise.exe, and the rest are .tar.gz. Check any archive against{" "}
              <code className="font-mono text-[0.85em] text-ink-soft">checksums.txt</code>, which ships with
              every release.
            </p>
          </Reveal>
        </section>

        {/* Install */}
        <section id="install" className="mt-20 scroll-mt-28 md:mt-28">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-14">
            <div>
              <SectionLabel>Install</SectionLabel>
              <Reveal>
                <h2 className="mt-6 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-ink">
                  Install from the{" "}
                  <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">terminal</span>.
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <ol className="mt-8 space-y-5">
                  {firstRun.map(([title, body], i) => (
                    <li key={title} className="flex gap-4">
                      <span className="font-serif text-2xl leading-none text-accent italic">{i + 1}</span>
                      <div>
                        <div className="font-medium text-ink">{title}</div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/docs#from-a-release-binary"
                  className="mt-8 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  Setup in the manual <ArrowUpRight />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={0.1} y={32}>
              <ConnectTabs tabs={tabs} />
            </Reveal>
          </div>
        </section>

        {/* History */}
        <section className="mt-20 md:mt-28">
          <SectionLabel>Release history</SectionLabel>
          <Reveal>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {releases.map((r) => (
                <li key={r.version}>
                  <a
                    href={r.published ? r.url : site.links.releases}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5"
                  >
                    <span className="font-display text-2xl font-semibold tracking-[-0.04em] text-ink transition-colors group-hover:text-accent">
                      v{r.version}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] text-ink-faint">
                      {r.date}
                      {r === latest && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-accent-ink">latest</span>
                      )}
                      {r.prerelease && <span className="rounded-full border border-line px-2 py-0.5">pre-release</span>}
                      {!r.published && <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5">not yet published</span>}
                    </span>
                    <ArrowUpRight className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/changelog"
              className="mt-6 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
            >
              What changed in each release <ArrowUpRight />
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
