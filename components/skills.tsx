"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { skills } from "@/data/resume";

export default function Skills() {
  return (
    <section id="skills" className="container mx-auto scroll-mt-20 py-28 px-6">
      <SectionHeading index="02" title="Skills" />
      <div className="grid gap-6 md:grid-cols-2">
        {skills.map((g, index) => (
          <motion.div
            key={g.group}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-xl border border-white/10 bg-card/40 backdrop-blur-md p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 md:p-8"
          >
            <h3 className="font-mono text-sm tracking-widest text-primary font-medium uppercase">
              {g.group}
            </h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <Badge key={item} variant="default" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-normal">
                  {item}
                </Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
