import path from "node:path";
import type { Element, Root as HastRoot } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import type { Root as MdastRoot } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { shikiThemes } from "./highlight";
import { repo } from "./site";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

// The engine's docs that the site renders itself, by their path in the repo.
export const architectureDocs = [
  { slug: "", file: "architecture/architecture.md", label: "Overview" },
  { slug: "sequence-diagrams", file: "architecture/sequence-diagrams.md", label: "Sequence diagrams" },
  { slug: "dependency-graph", file: "architecture/dependency-graph.md", label: "Dependency graph" },
  { slug: "class-diagrams", file: "architecture/class-diagrams.md", label: "Class diagrams" },
] as const;

const siteRoutes: Record<string, string> = {
  "README.md": "/docs",
  "CHANGELOG.md": "/changelog",
  ...Object.fromEntries(
    architectureDocs.map((d) => [d.file, d.slug ? `/docs/architecture/${d.slug}` : "/docs/architecture"]),
  ),
};

// Relative links resolve against the file's own directory. Docs the site
// renders stay on the site; everything else goes to GitHub at the same ref.
function remarkRepoLinks(file: string, ref: string) {
  return () => (tree: MdastRoot) => {
    visit(tree, ["link", "image"], (node) => {
      const n = node as { url: string; type: string };
      if (/^(https?:|mailto:|#)/.test(n.url)) return;
      const [target, hash = ""] = n.url.split("#");
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target)).replace(/^\.\//, "");
      const route = siteRoutes[resolved.replace(/\/$/, "")];
      if (route && n.type === "link") {
        n.url = `${route}${hash ? `#${hash}` : ""}`;
        return;
      }
      const kind = n.type === "image" ? "raw" : target.endsWith("/") ? "tree" : "blob";
      n.url = `${repo}/${kind}/${ref}/${resolved}${hash ? `#${hash}` : ""}`;
    });
  };
}

// Takes the leading H1 off as the page's title: the page renders its own.
function remarkTakeTitle(out: { title?: string }) {
  return () => (tree: MdastRoot) => {
    const first = tree.children[0];
    if (first?.type === "heading" && first.depth === 1) {
      out.title = mdastToString(first);
      tree.children.shift();
    }
  };
}

// ```mermaid blocks become <div class="mermaid-diagram"><pre class="mermaid-source">,
// left for the browser to draw (see components/mermaid-diagrams.tsx). Without
// JS the source still reads.
function remarkMermaid() {
  return (tree: MdastRoot) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return;
      parent.children[index] = {
        type: "mermaid",
        value: node.value,
        data: {
          hName: "div",
          hProperties: { className: ["mermaid-diagram"] },
          hChildren: [
            {
              type: "element",
              tagName: "pre",
              properties: { className: ["mermaid-source"] },
              children: [{ type: "text", value: node.value }],
            },
          ],
        },
      } as unknown as (typeof parent.children)[number];
    });
  };
}

function rehypeCollectToc(toc: TocItem[]) {
  return () => (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        toc.push({
          id: String(node.properties.id),
          text: hastToString(node),
          depth: node.tagName === "h2" ? 2 : 3,
        });
      }
    });
  };
}

// Renders a markdown file from the engine's repo. `file` is its path in the
// repo and `ref` the git ref it was read at, both used to resolve its links.
export async function renderMarkdown(source: string, file: string, ref: string) {
  "use cache";
  const toc: TocItem[] = [];
  const meta: { title?: string } = {};
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkTakeTitle(meta))
    .use(remarkRepoLinks(file, ref))
    .use(remarkMermaid)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCollectToc(toc))
    .use(rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["anchor"] } })
    .use(rehypePrettyCode, { theme: shikiThemes, keepBackground: false, defaultLang: "plaintext" })
    .use(rehypeStringify)
    .process(source);
  return { html: String(html), toc, title: meta.title };
}
