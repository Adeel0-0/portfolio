import Image from "next/image";
import { profile } from "@/data/resume";
import { Reveal } from "@/components/ui/reveal";

export default function About() {
  return (
    <section id="about" className="relative">
      <div className="container grid gap-12 py-24 md:grid-cols-[auto_1fr] md:gap-16 md:items-center">
        {/* Profile Image */}
        <Reveal className="flex justify-center md:justify-start">
          <div className="relative group">
            {/* Animated glow ring */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-primary/40 to-primary/80 opacity-60 blur-md group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />
            <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-primary/30 md:h-56 md:w-56">
              <Image
                src="/profile.jpg"
                alt={profile.name}
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 176px, 224px"
              />
            </div>
          </div>
        </Reveal>

        {/* Text Content */}
        <Reveal delay={0.15}>
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
            {"// About Me"}
</span>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/85 md:text-xl">
            {profile.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-mono text-xs text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Open to opportunities
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 font-mono text-xs text-muted-foreground">
              📍 {profile.location}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
