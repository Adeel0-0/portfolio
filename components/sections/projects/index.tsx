import { projects } from "@/data";
import { SectionShell } from "../section-shell";
import { ProjectRow } from "./project-row";

export function Projects() {
  return (
    <SectionShell id="projects">
      <TimingTower />

      <div className="mt-20">
        {projects.map((project, index) => (
          <ProjectRow key={project.index} project={project} index={index} />
        ))}
      </div>
    </SectionShell>
  );
}

/**
 * The whole body of work in one screen, as a live timing tower.
 *
 * Position, name, stack in the gap column, metric in the delta column. Each row
 * is an anchor down to its detail below, so the tower works as a summary and as
 * navigation at once.
 */
function TimingTower() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[36rem]">
        <div
          aria-hidden="true"
          className="grid grid-cols-[2.5rem_minmax(9rem,1fr)_minmax(10rem,1.4fr)_6rem] gap-4 border-b border-border pb-3 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground"
        >
          <span>Pos</span>
          <span>Project</span>
          <span>Gap</span>
          <span className="text-right">Delta</span>
        </div>

        <ol>
          {projects.map((project, index) => (
            <li key={project.index}>
              <a
                href={`#project-${project.index}`}
                className="grid grid-cols-[2.5rem_minmax(9rem,1fr)_minmax(10rem,1.4fr)_6rem] items-center gap-4 border-b border-border py-4 transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span className="font-mono text-lg font-bold text-foreground">
                  {index + 1}
                </span>

                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                    {project.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {project.subtitle}
                  </span>
                </span>

                <span className="font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
                  {project.stack.join(" · ")}
                </span>

                {/* No metric renders an em dash, exactly as a timing screen
                    shows a driver who hasn't set a lap. */}
                <span
                  className={`text-right font-mono text-sm font-bold ${
                    project.metric
                      ? project.metric.best
                        ? "text-best"
                        : "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {project.metric?.value ?? "—"}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
