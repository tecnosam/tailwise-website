import { cacheLife } from "next/cache";
import { type Arch, type Asset, type Os, type Release, archiveName, downloadUrl, platforms } from "./platforms";
import { site } from "./site";

export type { Arch, Asset, Os, Release };

const repoPath = site.links.github.replace("https://github.com/", "");

function expected(version: string, date: string): Release {
  return {
    version,
    date,
    url: `${site.links.releases}/tag/v${version}`,
    prerelease: false,
    published: false,
    assets: platforms.flatMap((p) =>
      p.archs.map(({ arch }) => {
        const name = archiveName(version, p.os, arch);
        return { os: p.os, arch, name, url: downloadUrl(version, name) };
      }),
    ),
  };
}

type GitHubRelease = {
  tag_name: string;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  assets: { name: string; size: number; browser_download_url: string; digest?: string | null }[];
};

const assetPattern = /^tailwise_(.+)_(linux|darwin|windows)_(amd64|arm64)\.(tar\.gz|zip)$/;

function fromGitHub(r: GitHubRelease): Release {
  const version = r.tag_name.replace(/^v/, "");
  const assets: Asset[] = [];
  let checksums: string | undefined;
  for (const a of r.assets) {
    if (a.name === "checksums.txt") checksums = a.browser_download_url;
    const m = assetPattern.exec(a.name);
    if (!m) continue;
    assets.push({
      os: m[2] as Os,
      arch: m[3] as Arch,
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
      sha256: a.digest?.startsWith("sha256:") ? a.digest.slice(7) : undefined,
    });
  }
  return {
    version,
    date: (r.published_at ?? "").slice(0, 10),
    url: r.html_url,
    prerelease: r.prerelease,
    published: true,
    assets,
    checksums,
  };
}

// Every published release, newest first; when there is none yet (or GitHub
// cannot be reached), the current version's expected assets, unpublished.
// The fallback is kept for a minute only, so a new release shows up on the
// next request instead of after the hour a found list is kept for.
export async function getReleases(): Promise<Release[]> {
  "use cache";
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}/releases?per_page=20`, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (res.ok) {
      const list = ((await res.json()) as GitHubRelease[]).filter((r) => !r.draft).map(fromGitHub);
      if (list.length) {
        cacheLife("hours");
        return list;
      }
    }
  } catch {}
  cacheLife("minutes");
  return [expected(site.version, site.released)];
}

// The latest stable release's version, shown on the site's version labels.
// Before the first release, the version in site.ts.
export async function getVersion() {
  const releases = await getReleases();
  return releases.find((r) => r.published && !r.prerelease)?.version ?? site.version;
}
