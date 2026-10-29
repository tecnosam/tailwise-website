import type { Metadata } from "next";
import { DocShell } from "@/components/doc-shell";
import { DownloadIcon } from "@/components/icons";
import { getDocsRef, fetchRepoFile } from "@/lib/docs-source";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Set up, configure and deploy the Tailwise inference engine.",
};

export default async function DocsPage() {
  const { ref, version } = await getDocsRef();
  const { html, toc } = await renderMarkdown(await fetchRepoFile(ref, "README.md"), "README.md", ref);

  return (
    <DocShell
      eyebrow={`${version ? `v${version}` : "main · unreleased"} · Documentation`}
      title={
        <>
          The Tailwise{" "}
          <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">manual</span>
        </>
      }
      links={[
        { label: "Download", href: "/download", icon: <DownloadIcon className="size-3.5" /> },
        { label: "Architecture", href: "/docs/architecture" },
        { label: "View on GitHub", href: `${site.links.github}/blob/${ref}/README.md` },
        { label: "Config schema", href: `${site.links.github}/blob/${ref}/tailwise.schema.yaml` },
        { label: "Examples", href: `${site.links.github}/tree/${ref}/examples` },
      ]}
      toc={toc}
      html={html}
    />
  );
}
