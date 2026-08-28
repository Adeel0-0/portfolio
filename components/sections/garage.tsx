import { TyreChip, TyreLegend } from "@/components/ui/tyre-chip";
import { certifications, education, skills } from "@/data";
import { SectionShell } from "./section-shell";

export function Garage() {
  return (
    <SectionShell id="garage">
      <div className="flex flex-col gap-12">
        <TyreLegend />

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div key={group.group} className="flex flex-col gap-4">
              <h3 className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-foreground">
                {group.group}
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <TyreChip name={item.name} grade={item.grade} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <SetupSheet />
      </div>
    </SectionShell>
  );
}

/** Education and certifications, laid out like a car's setup sheet. */
function SetupSheet() {
  return (
    <div className="grid gap-10 border-t border-border pt-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-4">
        <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted-foreground">
          Education
        </h3>
        <div className="flex flex-col gap-1.5">
          <p className="text-xl font-bold tracking-tight">{education.degree}</p>
          <p className="text-muted-foreground">{education.school}</p>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {education.period} · {education.gpa}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted-foreground">
          Certifications &amp; activity
        </h3>
        <ul className="flex flex-col gap-3">
          {certifications.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
              />
              <span className="leading-relaxed text-muted-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
