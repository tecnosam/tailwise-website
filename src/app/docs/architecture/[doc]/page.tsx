import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { architectureDocs } from "@/lib/markdown";
import { ArchitecturePage } from "../architecture-page";

const pages = architectureDocs.filter((d) => d.slug);

export function generateStaticParams() {
  return pages.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/architecture/[doc]">): Promise<Metadata> {
  const { doc: slug } = await params;
  const doc = pages.find((d) => d.slug === slug);
  return { title: doc ? `${doc.label} · Architecture` : "Architecture" };
}

export default async function Page({ params }: PageProps<"/docs/architecture/[doc]">) {
  const { doc: slug } = await params;
  const doc = pages.find((d) => d.slug === slug);
  if (!doc) notFound();
  return <ArchitecturePage doc={doc} />;
}
