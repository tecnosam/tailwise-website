import { cacheLife } from "next/cache";
import { getReleases } from "./releases";
import { repo } from "./site";

const raw = repo.replace("https://github.com/", "https://raw.githubusercontent.com/");

export type DocsRef = {
  // A git ref: the latest release's tag, or main before the first release.
  ref: string;
  // The release's version, or undefined when reading main.
  version?: string;
};

// The docs follow the latest published release, so they always describe the
// binary on the download page. Before the first release there is no tag to
// read, so they come from main.
export async function getDocsRef(): Promise<DocsRef> {
  const releases = await getReleases();
  const latest = releases.find((r) => r.published && !r.prerelease);
  return latest ? { ref: `v${latest.version}`, version: latest.version } : { ref: "main" };
}

// A file from the engine's repo at a ref, e.g. "architecture/architecture.md".
export async function fetchRepoFile(ref: string, file: string) {
  "use cache";
  cacheLife("hours");
  const url = `${raw}/${ref}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}
