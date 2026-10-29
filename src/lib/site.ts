export const repo = "https://github.com/tecnosam/tailwise";

export const site = {
  name: "Tailwise",
  version: "0.1.0",
  released: "2026-10-27",
  license: "Apache-2.0",
  tagline: "Keep the agent traces worth reviewing.",
  description:
    "Tailwise is an open-source engine that scores your LLM agent traces and keeps the ones where the final answer looks wrong. Kept traces go to Phoenix, Langfuse or any OTLP back end, with the checks they failed and a one-line reason.",
  links: {
    github: repo,
    releases: `${repo}/releases`,
    latest: `${repo}/releases/latest`,
    issues: `${repo}/issues`,
    changelog: `${repo}/blob/main/CHANGELOG.md`,
    contributing: `${repo}/blob/main/CONTRIBUTING.md`,
    license: `${repo}/blob/main/LICENSE`,
    helm: `${repo}/tree/main/deploy/helm/tailwise`,
    examples: `${repo}/tree/main/examples`,
    architecture: "/docs/architecture",
    schema: `${repo}/blob/main/tailwise.schema.yaml`,
  },
} as const;
