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

export default function Home() {
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
        <Cost />
        <Pilot />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
