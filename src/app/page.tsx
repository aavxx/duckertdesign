import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <hr style={{ margin: 0, border: "none", borderTop: "1px solid rgba(0,0,0,0.1)" }} />
      <CTA />
    </main>
  );
}
