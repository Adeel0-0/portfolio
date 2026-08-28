import { cn } from "@/lib/utils";
import { SECTIONS, sectionById, type SectionId } from "@/lib/sections";
import { SectorSweep } from "./sector-sweep";

/**
 * Shared wrapper for the five page sections.
 *
 * Owns the things every section must get right and none should restate: the id
 * the scroll observer watches, the scroll-margin that keeps the eyebrow clear
 * of the rev strip when the dock jumps here, and the eyebrow itself.
 *
 * A server component — sections ship no JavaScript of their own.
 */
export function SectionShell({
  id,
  children,
  className,
  contentClassName,
}: {
  id: SectionId;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const section = sectionById(id);
  // 1-indexed position in the lap, for the sector marker.
  const sector = SECTIONS.findIndex((s) => s.id === id) + 1;

  return (
    <section
      id={id}
      aria-label={section.label}
      // scroll-mt clears the fixed rev strip; without it a dock jump lands the
      // eyebrow underneath the strip.
      className={cn("scroll-mt-16 py-24 md:py-32", className)}
    >
      <div className="container">
        <div className="mb-10 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span aria-hidden="true" className="h-px w-6 bg-brand" />
          <h2 className="whitespace-nowrap">{section.eyebrow}</h2>
          <SectorSweep sector={sector} />
        </div>
        {/* Children get their own wrapper rather than sharing the container, so
            a section passing a grid or flex contentClassName doesn't turn the
            eyebrow into one of its tracks. */}
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
}
