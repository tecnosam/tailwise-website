import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { ArrowUpRight } from "@/components/icons";
import { Nav } from "@/components/nav";
import { fetchRepoFile, getDocsRef } from "@/lib/docs-source";
import { renderMarkdown } from "@/lib/markdown";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every notable change to Tailwise, release by release.",
};

export default async function ChangelogPage() {
  // Read from the latest release's tag, like the docs.
  const { ref } = await getDocsRef();
  const { html } = await renderMarkdown(await fetchRepoFile(ref, "CHANGELOG.md"), "CHANGELOG.md", ref);

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-6 md:pt-36">
        <div className="enter">
          <div className="font-mono text-[0.7rem] tracking-[0.2em] text-ink-faint uppercase">
            <span className="text-accent">Releases</span> · Changelog
          </div>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[0.95] sm:text-5xl font-semibold tracking-[-0.05em] text-ink md:text-7xl">
            What&apos;s{" "}
            <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">new</span>
          </h1>
          <Link
            href="/download"
            className="mt-6 inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-accent"
          >
            Download the binaries <ArrowUpRight />
          </Link>
        </div>
        <article
          className="enter prose-tw mt-16"
          style={{ "--d": "0.1s" } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <Footer />
    </>
  );
}
