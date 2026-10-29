import { DocShell } from "@/components/doc-shell";
import { fetchRepoFile, getDocsRef } from "@/lib/docs-source";
import { architectureDocs, renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export type ArchitectureDoc = (typeof architectureDocs)[number];

export async function ArchitecturePage({ doc }: { doc: ArchitectureDoc }) {
  const { ref, version } = await getDocsRef();
  const { html, toc, title } = await renderMarkdown(await fetchRepoFile(ref, doc.file), doc.file, ref);
  // "Architecture of the inference engine" → the accent on its last word.
  const words = (title ?? doc.label).split(" ");
  const last = words.pop();

  return (
    <DocShell
      eyebrow={`${version ? `v${version}` : "main · unreleased"} · Architecture`}
      title={
        <>
          {words.join(" ")}{" "}
          <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">{last}</span>
        </>
      }
      links={[
        { label: "Documentation", href: "/docs" },
        { label: "View on GitHub", href: `${site.links.github}/blob/${ref}/${doc.file}` },
      ]}
      siblings={architectureDocs.map((d) => ({
        label: d.label,
        href: d.slug ? `/docs/architecture/${d.slug}` : "/docs/architecture",
        current: d.slug === doc.slug,
      }))}
      toc={toc}
      html={html}
      diagrams
    />
  );
}
