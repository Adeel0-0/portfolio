import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import SectionHeading from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/resume";

export default function Contact() {
  return (
    <section id="contact" className="container scroll-mt-20 py-28">
      <SectionHeading index="04" title="Contact" />
      <div className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-bold uppercase tracking-tight md:text-3xl">
            Let&apos;s build something
            <span className="text-primary text-glow"> intelligent.</span>
          </h3>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Open to AI/ML Engineer and Software Engineer roles. If you&apos;re
            shipping AI-powered products, I&apos;d like to hear about it.
          </p>
          <a href={`mailto:${profile.email}`}>
            <Button className="mt-8">
              <Mail className="h-4 w-4" /> {profile.email}
            </Button>
          </a>
        </div>
        <div className="space-y-4 font-mono text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" /> {profile.phone}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" /> {profile.location}
          </div>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
          >
            <Github className="h-4 w-4 text-primary" /> GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
          >
            <Linkedin className="h-4 w-4 text-primary" /> LinkedIn
          </a>
        </div>
      </div>
      <footer className="mt-24 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} Syed Mohammad Adeel</span>
        <span>
          Built with Next.js · Three.js · shadcn/ui
        </span>
      </footer>
    </section>
  );
}
