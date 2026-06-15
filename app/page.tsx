import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import CapabilitySpheresClient from "@/components/CapabilitySpheresClient";
import ServicesHome from "@/components/ServicesHome";
import DepthDemo from "@/components/DepthDemo";
import Process from "@/components/Process";
import CtaSection from "@/components/CtaSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <CapabilitySpheresClient />
      <ServicesHome />
      <DepthDemo />
      <Process />
      <CtaSection />
    </main>
  );
}