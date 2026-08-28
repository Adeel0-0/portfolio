import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { SiteFooter } from "@/components/sections/footer";
import { Garage } from "@/components/sections/garage";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";

/**
 * One page, five sections, in the order lib/sections.ts declares them — the
 * same array the nav dock and the scroll observer read.
 *
 * Every section here is a server component and ships no JavaScript of its own.
 * The client boundary is <SiteProviders> in app/layout.tsx, which wraps this
 * tree without becoming part of it.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Projects />
      <Garage />
      <Contact />
      <SiteFooter />
    </main>
  );
}
