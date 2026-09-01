import { PortraitSlideshow } from "@/components/portrait/portrait-slideshow";
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

        {/* The portrait cycles through scan treatments of the same photograph.
            It used to be a static image here plus a separate /ascii route that
            nothing linked to; the treatments say more in the slot where a
            portfolio already puts a face than they ever did on their own page. */}
        <PortraitSlideshow
          src={profile.avatar.src}
          alt={`${profile.name}, ${profile.role}`}
          caption={`${profile.firstName} · ${profile.location.split(",")[0]}`}
        />
      </div>

      <div className="mt-16 grid gap-10 border-t border-border pt-12 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatBlock key={stat.value} stat={stat} />
        ))}
      </div>
    </SectionShell>
  );
}
