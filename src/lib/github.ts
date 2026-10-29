import { cacheLife } from "next/cache";
import { getReleases } from "./releases";
import { site } from "./site";

const api = site.links.github.replace("https://github.com/", "https://api.github.com/repos/");

export type Health = {
  license?: string;
  lastCommit?: string;
  maintainers?: number;
  ci?: "passing" | "failing";
  release: { version: string; published: boolean; checksums: boolean };
};

async function get<T>(path: string): Promise<T | undefined> {
  try {
    const res = await fetch(`${api}${path}`, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    return res.ok ? ((await res.json()) as T) : undefined;
  } catch {
    return undefined;
  }
}

// The signals an engineer checks first, read live from GitHub. Each one is
// left out when GitHub cannot be reached, never guessed.
export async function getHealth(): Promise<Health> {
  "use cache";
  cacheLife("hours");
  const [repo, commits, contributors, runs, releases] = await Promise.all([
    get<{ license?: { spdx_id?: string } }>(""),
    get<{ commit: { committer: { date: string } } }[]>("/commits?per_page=1"),
    get<unknown[]>("/contributors?per_page=100"),
    get<{ workflow_runs: { name: string; status: string; conclusion: string | null }[] }>(
      "/actions/runs?branch=main&per_page=10",
    ),
    getReleases(),
  ]);
  const ci = runs?.workflow_runs.find((r) => r.name === "CI" && r.status === "completed");
  const latest = releases.find((r) => !r.prerelease) ?? releases[0];
  return {
    license: repo?.license?.spdx_id,
    lastCommit: commits?.[0]?.commit.committer.date.slice(0, 10),
    maintainers: contributors?.length,
    ci: ci ? (ci.conclusion === "success" ? "passing" : "failing") : undefined,
    release: { version: latest.version, published: latest.published, checksums: Boolean(latest.checksums) },
  };
}
