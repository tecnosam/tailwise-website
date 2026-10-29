import type { Metadata } from "next";
import { architectureDocs } from "@/lib/markdown";
import { ArchitecturePage } from "./architecture-page";

export const metadata: Metadata = {
  title: "Architecture",
  description: "How the Tailwise inference engine is built: packages, patterns, and a trace's path through the code.",
};

export default function Page() {
  return <ArchitecturePage doc={architectureDocs[0]} />;
}
