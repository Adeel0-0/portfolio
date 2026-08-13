import SectionHeading from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { skills } from "@/data/resume";

export default function Skills() {
  return (
    <section id="skills" className="container mx-auto scroll-mt-20 py-28 px-6">
      <SectionHeading index="02" title="Skills" />
      <div className="grid gap-6 md:grid-cols-2">
        {skills.map((g, index) => (
          <Reveal
            key={g.group}
            delay={index * 0.08}
            className="rounded-xl border border-white/10 bg-card/40 backdrop-blur-md p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 md:p-8"
          >
            <h3 className="font-mono text-sm tracking-widest text-primary font-medium uppercase">
              {g.group}
            </h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <Badge key={item} variant="default" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-normal">
                  {item}
                </Badge>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
