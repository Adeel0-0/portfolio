"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { profile } from "@/data/resume";
import { cn } from "@/lib/utils";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    links.forEach((link) => {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <header className="flex h-14 items-center gap-6 rounded-full border border-white/10 bg-card/40 px-6 backdrop-blur-xl shadow-lg shadow-black/20">
        <Link href="#" className="font-mono text-sm tracking-widest text-foreground font-semibold">
          Adeel.
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors hover:text-foreground",
                activeSection === l.href ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4 border-l border-border/50 pl-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </header>
    </div>
  );
}
