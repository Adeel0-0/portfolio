import { AttentionGlow } from "@/components/effects/attention-glow";
import type { Project } from "@/data";
import { cn } from "@/lib/utils";
import { ProjectMedia } from "./project-media";
import { SlamIn } from "./slam-in";

/**
 * One project: the three line-groups on one side, the media on the other,
 * alternating which side each lands on.
 *
 * The media is statically docked here. Phase 2 wraps it in the scroll-linked
 * slam; the layout is already the landed state, so that change is additive and
 * this stays the correct render for reduced-motion visitors either way.
 */
export function ProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  // Even projects put the media on the right, odd on the left — and it arrives
  // from whichever side it lands on.
  const mediaFirst = index % 2 === 1;
  const direction: 1 | -1 = mediaFirst ? -1 : 1;

  return (
    <article
      id={`project-${project.index}`}
      // Clips the media while it is still off to the side, so the slam never
      // widens the document and triggers a horizontal scrollbar mid-flight.
      className="scroll-mt-20 overflow-x-clip border-t border-border py-14 md:py-20"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <AttentionGlow
          skills={project.skills}
          className={cn("flex flex-col gap-8", mediaFirst && "lg:order-2")}
        >
          <header className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.2em] text-brand">
              {project.index}
            </span>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {project.title}
            </h3>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {project.subtitle}
            </p>
          </header>

          <LineGroup label="Stack">
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li
                  key={item}
                  className="rounded border border-border bg-surface px-2 py-1 font-mono text-[0.6875rem] text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </LineGroup>

          <LineGroup label="About">
            <p className="max-w-[58ch] leading-relaxed text-muted-foreground">
              {project.description[0]}
            </p>
          </LineGroup>

          <LineGroup label="How it works">
            <p className="max-w-[58ch] leading-relaxed text-muted-foreground">
              {project.description[1]}
            </p>
          </LineGroup>
        </AttentionGlow>

        <div className={cn(mediaFirst && "lg:order-1")}>
          <SlamIn direction={direction}>
            <ProjectMedia project={project} />
          </SlamIn>
        </div>
      </div>
    </article>
  );
}

/** A labelled band. Mono label, hairline, content — repeated three times. */
function LineGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}
