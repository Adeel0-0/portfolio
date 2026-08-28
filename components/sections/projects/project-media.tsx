import Image from "next/image";

import type { Project } from "@/data";
import { TelemetryPanel } from "./telemetry-panel";

/**
 * The swappable media slot.
 *
 * This switch is the entire reason real screenshots and clips can arrive later
 * without touching the projects section. A project with no `media` renders the
 * generated telemetry panel; adding one line to data/projects.ts swaps in a
 * file from public/ and nothing else changes.
 */
export function ProjectMedia({ project }: { project: Project }) {
  const media = project.media ?? { kind: "telemetry" as const };

  if (media.kind === "image") {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface">
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* muted + playsInline are what let this autoplay at all on mobile;
            without them iOS blocks it and shows a blank frame. */}
        <video
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          // The panel is decorative; the description beside it carries the
          // meaning, so there is nothing to caption.
          aria-hidden="true"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    );
  }

  return <TelemetryPanel project={project} />;
}
