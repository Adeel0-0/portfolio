import Image from "next/image";

import { StatBlock } from "@/components/ui/stat-block";
import { content, profile, stats } from "@/data";
import { SectionShell } from "./section-shell";

export function About() {
  return (
    <SectionShell id="about">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <p className="max-w-[62ch] text-lg leading-relaxed text-foreground">
            {profile.summary}
          </p>

          <dl className="flex flex-col gap-4 font-mono text-xs uppercase tracking-[0.18em]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <dt className="w-24 text-muted-foreground">Based</dt>
              <dd className="text-foreground">{profile.location}</dd>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <dt className="w-24 text-muted-foreground">Status</dt>
              <dd className="flex items-center gap-2 text-signal">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-signal"
                />
                {content.about.availability}
              </dd>
            </div>
          </dl>
        </div>

        <HaloPortrait />
      </div>

      <div className="mt-16 grid gap-10 border-t border-border pt-12 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatBlock key={stat.value} stat={stat} />
        ))}
      </div>
    </SectionShell>
  );
}

/**
 * The portrait, framed by a cockpit halo.
 *
 * The halo is drawn as an SVG overlay rather than used as a clip-path: clipping
 * the photo to that silhouette crops straight through the face. Overlaying it
 * keeps the likeness intact and still reads unmistakably as F1 — the shape is
 * doing the work, not the crop.
 *
 * `sizes` matters here. The source is 768x1024 and the slot is never wider than
 * about 320px, so without it Next would serve the full-resolution file.
 */
function HaloPortrait() {
  return (
    <div className="relative mx-auto w-full max-w-[20rem] lg:mx-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src={profile.avatar.src}
          alt={`${profile.name}, ${profile.role}`}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 320px, 80vw"
          className="object-cover"
          priority={false}
          style={
            profile.avatar.pixelated
              ? { imageRendering: "pixelated" }
              : undefined
          }
          // Next's optimiser resamples and re-encodes, which is exactly wrong
          // for pixel art — it softens the hard edges before the browser ever
          // sees the file. Serving the original bytes preserves them.
          unoptimized={profile.avatar.pixelated}
        />
        {/* Navy wash so the photo sits in the palette rather than beside it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent"
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 100 130"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {/* The hoop, sweeping from each shoulder over the top. */}
          <path
            d="M2,120 C2,42 22,14 50,14 C78,14 98,42 98,120"
            fill="none"
            stroke="hsl(var(--brand))"
            strokeWidth="3.5"
            opacity="0.85"
          />
          {/* The central pillar down to the chassis. */}
          <path
            d="M50,14 L50,34"
            stroke="hsl(var(--brand))"
            strokeWidth="3.5"
            opacity="0.85"
          />
        </svg>
      </div>

      <p className="mt-3 text-center font-mono text-[0.625rem] uppercase tracking-[0.22em] text-muted-foreground lg:text-left">
        {profile.firstName} · {profile.location.split(",")[0]}
      </p>
    </div>
  );
}
