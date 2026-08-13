import { Award, GraduationCap } from "lucide-react";
import SectionHeading from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { certifications, education } from "@/data/resume";

export default function Education() {
  return (
    <section id="education" className="container scroll-mt-20 py-28">
      <SectionHeading index="03" title="Education" />
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {education.period}
              </span>
            </div>
            <CardTitle className="pt-2">{education.school}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{education.degree}</p>
            <p className="mt-2 font-mono text-sm text-primary">{education.gpa}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Certifications & Activities
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {certifications.map((c) => (
                <li key={c} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-primary">▸</span> {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
