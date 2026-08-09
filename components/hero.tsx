"use client";

import { motion, Variants } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile, stats } from "@/data/resume";
import { AnimatedText } from "@/components/ui/animated-text";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-transparent">

      <motion.div
        className="container mx-auto relative z-10 px-6 pt-24 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={itemVariants} className="font-mono text-sm tracking-widest text-primary">
          {profile.role}
        </motion.p>

        <motion.div variants={itemVariants} className="mt-6 flex flex-col items-start gap-2">
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
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-wrap gap-4"
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
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-24 flex max-w-3xl flex-wrap gap-12"
        >
          {stats.map((s) => (
            <div key={s.value} className="flex flex-col gap-1">
              <div className="text-4xl font-semibold text-primary tracking-tight text-glow">{s.value}</div>
              <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
