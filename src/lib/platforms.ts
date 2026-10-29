import { site } from "./site";

export type Os = "linux" | "darwin" | "windows";
export type Arch = "amd64" | "arm64";

export type Asset = {
  os: Os;
  arch: Arch;
  name: string;
  url: string;
  size?: number;
  sha256?: string;
};

export type Release = {
  version: string;
  date: string;
  url: string;
  prerelease: boolean;
  // false until the tag's GitHub release exists: the assets are what
  // GoReleaser will publish, not yet downloadable.
  published: boolean;
  assets: Asset[];
  checksums?: string;
};

export const platforms: { os: Os; label: string; archs: { arch: Arch; label: string }[] }[] = [
  {
    os: "linux",
    label: "Linux",
    archs: [
      { arch: "amd64", label: "x86-64" },
      { arch: "arm64", label: "ARM64" },
    ],
  },
  {
    os: "darwin",
    label: "macOS",
    archs: [
      { arch: "arm64", label: "Apple silicon" },
      { arch: "amd64", label: "Intel" },
    ],
  },
  {
    os: "windows",
    label: "Windows",
    archs: [
      { arch: "amd64", label: "x86-64" },
      { arch: "arm64", label: "ARM64" },
    ],
  },
];

// GoReleaser's default archive name: tailwise_0.1.0_linux_amd64.tar.gz, .zip on Windows.
export function archiveName(version: string, os: Os, arch: Arch) {
  return `tailwise_${version}_${os}_${arch}.${os === "windows" ? "zip" : "tar.gz"}`;
}

export function downloadUrl(version: string, file: string) {
  return `${site.links.releases}/download/v${version}/${file}`;
}

export function formatSize(bytes?: number) {
  if (!bytes) return undefined;
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} kB`;
}
