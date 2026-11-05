import { Cost } from "@/components/cost";
import { DataFlow } from "@/components/data-flow";
import { Flow } from "@/components/flow";
import { CallToAction, Footer } from "@/components/footer";
import { Guarantees } from "@/components/guarantees";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Pilot } from "@/components/pilot";
import { Problem } from "@/components/problem";
import { Quickstart } from "@/components/quickstart";
import { getBenchmark, headline } from "@/lib/benchmark";

export default async function Home() {
  const b = await getBenchmark();
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Quickstart />
        <Flow />
        <Guarantees />
        <DataFlow />
        <Cost scenario={b.scenario} shown={headline(b)} usdPerMillion={b.usd_per_million_input_tokens} />
        <Pilot />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
