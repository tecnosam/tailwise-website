import { cacheLife } from "next/cache";
import snapshot from "./benchmark-snapshot.json";
import { getDocsRef } from "./docs-source";
import { repo } from "./site";

// The published benchmark: bench/published/benchmark.json in the engine's
// repo, written by `bench publish`. Every number on the site that claims
// accuracy or cost comes from here.

export type Dataset = "tau" | "swe" | "trail";

export type Row = {
  dataset: Dataset;
  // "all" runs, or the "detectable" ones: those whose label the trace can show.
  slice: "all" | "detectable";
  // "builtin" questions, or a manifest's ("tau-actions": the action checks).
  setup: string;
  rules: boolean;
  runs: number;
  failed: number;
  // Few successful runs behind the figure: shown, marked as rough.
  rough: boolean;
  precision: number;
  precision_ci95: number[];
  found: number;
  found_ci95: number[];
  multiple: number;
  reviews_per_failure: number;
  random_reviews_for_same: number;
  jev_usd: number;
  jev_usd_per_extra_failure: number | null;
  input_tokens_per_run: number;
  roc_auc: number | null;
  vs_baseline: { against: string; gain: number; ci95: number[] } | null;
  run: string;
};

export type Benchmark = {
  schema: number;
  date: string;
  jev_model: string;
  source: string;
  usd_per_million_input_tokens: number;
  // The deployment every row describes.
  scenario: {
    traces: number;
    failure_rate: number;
    review_budget: number;
    reviews: number;
    random_found: number;
    random_reviews_per_failure: number;
  };
  datasets: Record<Dataset, { name: string; agent: string }>;
  results: Row[];
};

const file = "bench/published/benchmark.json";

// The file at a ref, or undefined. A miss is kept for a minute only, so a
// release that adds the file shows up on the next request.
async function fetchPublished(ref: string): Promise<Benchmark | undefined> {
  "use cache";
  try {
    const res = await fetch(`${repo.replace("https://github.com/", "https://raw.githubusercontent.com/")}/${ref}/${file}`);
    if (res.ok) {
      const b = (await res.json()) as Benchmark;
      if (b.schema === 1 && b.results?.length) {
        cacheLife("hours");
        return b;
      }
    }
  } catch {}
  cacheLife("minutes");
  return undefined;
}

// The figures at the latest release's tag, so they describe the binary on the
// download page. Before a release carries the file, or when GitHub cannot be
// reached, the snapshot bundled with the site.
export async function getBenchmark(): Promise<Benchmark> {
  const { ref } = await getDocsRef();
  return (await fetchPublished(ref)) ?? (snapshot as Benchmark);
}

export function find(b: Benchmark, dataset: Dataset, slice: Row["slice"], setup = "builtin", rules = false) {
  return b.results.find((r) => r.dataset === dataset && r.slice === slice && r.setup === setup && r.rules === rules);
}

export type Shown = { key: string; label: string; detail: string; row: Row };

// The rows the site leads with: the built-in questions on each dataset, and
// τ-bench's action checks on the runs a trace can judge.
export function headline(b: Benchmark): Shown[] {
  const shown = [
    pick(b, "tau", "all", "builtin", "τ-bench", "Customer-service agents, built-in checks"),
    pick(b, "tau", "detectable", "tau-actions", "τ-bench, action checks", "Runs whose outcome the trace shows"),
    pick(b, "swe", "all", "builtin", "SWE-agent", "Coding agents, built-in checks"),
    pick(b, "trail", "all", "builtin", "TRAIL", "Research and coding agents, built-in checks"),
  ];
  return shown.filter((s): s is Shown => Boolean(s));
}

function pick(b: Benchmark, ds: Dataset, slice: Row["slice"], setup: string, label: string, detail: string) {
  const row = find(b, ds, slice, setup);
  return row && { key: `${ds}-${slice}-${setup}`, label, detail, row };
}

// The range of "N× the failures" over the firm (not rough) headline rows.
export function multiples(b: Benchmark) {
  const firm = headline(b)
    .filter((s) => !s.row.rough)
    .map((s) => s.row.multiple);
  return { low: Math.floor(Math.min(...firm)), high: Math.round(Math.max(...firm)) };
}

// The range of Jev cost per scenario (10,000 traces) over the headline rows.
export function costs(b: Benchmark) {
  const usd = headline(b).map((s) => s.row.jev_usd);
  return { low: Math.min(...usd), high: Math.max(...usd) };
}

export const usd = (d: number) => (d < 0.1 ? `${(d * 100).toFixed(1)}¢` : `$${d.toFixed(2)}`);
export const count = (n: number) => Math.round(n).toLocaleString("en-US");
export const pct = (v: number) => `${Math.round(v * 100)}%`;

export function month(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
