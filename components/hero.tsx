"use client";

import { ArrowDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile, stats } from "@/data/resume";
import { AnimatedText } from "@/components/ui/animated-text";

// Entrance stagger, in seconds — was framer-motion's staggerChildren.
const STEP = 0.1;
const START = 0.3;

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-transparent">

      <div className="container mx-auto relative z-10 px-6 pt-24 pb-20">
        <p
          className="animate-fade-up font-mono text-sm tracking-widest text-primary"
          style={{ animationDelay: `${START}s` }}
        >
          {profile.role}
        </p>

        <div
          className="animate-fade-up mt-6 flex flex-col items-start gap-2"
          style={{ animationDelay: `${START + STEP}s` }}
        >
          <AnimatedText
            text="Syed"
            textClassName="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-foreground"
            className="items-start gap-0"
            underlineClassName="hidden"
          />
          <AnimatedText
            text="Mohammad"
            textClassName="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-foreground"
            className="items-start gap-0"
            underlineClassName="hidden"
          />
          <AnimatedText
            text="Adeel."
            textClassName="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-primary text-glow"
            className="items-start gap-0"
            underlineGradient="from-primary/50 via-primary to-primary/50"
          />
        </div>

        <p
          className="animate-fade-up mt-8 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed"
          style={{ animationDelay: `${START + STEP * 2}s` }}
        >
          {profile.tagline}
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-wrap gap-4"
          style={{ animationDelay: `${START + STEP * 3}s` }}
        >
          <Button
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full px-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          >
            View Projects <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = `mailto:${profile.email}`)}
            className="rounded-full px-6 transition-all hover:scale-105 border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
          >
            <Mail className="mr-2 h-4 w-4" /> Contact
          </Button>
        </div>

        <div
          className="animate-fade-up mt-24 flex max-w-3xl flex-wrap gap-12"
          style={{ animationDelay: `${START + STEP * 4}s` }}
        >
          {stats.map((s) => (
            <div key={s.value} className="flex flex-col gap-1">
              <div className="text-4xl font-semibold text-primary tracking-tight text-glow">{s.value}</div>
              <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
