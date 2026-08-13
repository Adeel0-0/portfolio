import Nav from "@/components/nav";
import Hero from "@/components/hero";
import About from "@/components/about";
import Projects from "@/components/projects";
import Skills from "@/components/skills";
import Education from "@/components/education";
import Contact from "@/components/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
    </>
  );
}
