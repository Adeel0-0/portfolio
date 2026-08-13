import { Zap } from "lucide-react";
import SectionHeading from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/data/resume";

export default function Projects() {
  return (
    <section id="projects" className="container mx-auto scroll-mt-20 py-28 px-6">
      <SectionHeading index="01" title="Projects" />
      <div className="space-y-8">
        {projects.map((p, index) => (
          <Reveal key={p.index} delay={index * 0.1}>
            <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-md border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50">
              <div className="pointer-events-none absolute -right-6 top-2 select-none font-mono text-[9rem] font-bold leading-none text-muted/20 transition-colors group-hover:text-primary/5">
                {p.index}
              </div>
              <CardHeader className="relative">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <CardTitle className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
                    {p.title}
                  </CardTitle>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {p.subtitle}
                  </span>
                </div>
                {p.metric && (
                  <div className="flex items-center gap-2 pt-2 font-mono text-sm text-primary font-medium">
                    <Zap className="h-4 w-4" /> {p.metric}
                  </div>
                )}
              </CardHeader>
              <CardContent className="relative max-w-3xl space-y-3">
                {p.description.map((d, i) => (
                  <p key={i} className="text-base leading-relaxed text-muted-foreground">
                    {d}
                  </p>
                ))}
                <div className="flex flex-wrap gap-2 pt-3">
                  {p.stack.map((s) => (
                    <Badge key={s} variant="default" className="rounded-md font-normal text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
