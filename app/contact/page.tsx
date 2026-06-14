import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Services from "@/components/ServicesPageContent";
import DepthDemo from "@/components/DepthDemo";
import Process from "@/components/Process";
import CtaSection from "@/components/CtaSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <Services />
      <DepthDemo />
      <Process />
      <CtaSection />
    </main>
  );
}