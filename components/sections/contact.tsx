import { FileText, Mail, Phone } from "lucide-react";

import { ContactCards } from "@/components/contact/contact-cards";
import { RadioWave } from "@/components/contact/radio-wave";
import { CopyButton } from "@/components/ui/copy-button";
import { content, profile } from "@/data";
import { RESUME_HREF, hasResume } from "@/lib/resume";
import { SectionShell } from "./section-shell";

/**
 * Team radio.
 *
 * Phase 2 replaces the link row with the morphing contact cards and the
 * contribution graph, and Phase 3 adds the radio treatment. What's here is the
 * honest version: every channel reachable, nothing that pretends to send a
 * message the site has no backend to deliver.
 */
export function Contact() {
  const [before, accent] = content.contact.heading.split(
    content.contact.headingAccent
  );

  return (
    // Bottom padding clears the fixed dock, which would otherwise sit over the
    // last thing on the page.
    <SectionShell id="contact" className="pb-40 md:pb-48">
      <div className="flex max-w-[52ch] flex-col gap-6">
        <RadioWave />

        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {before}
          <span className="text-brand">{accent}</span>
        </h2>

        <p className="leading-relaxed text-muted-foreground">
          {content.contact.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <CopyButton value={profile.email} label="Copy email" />
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Open radio
          </a>
        </div>

        <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-8">
          <ContactLine
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            label="Email"
            value={profile.email}
            href={`mailto:${profile.email}`}
          />
          <ContactLine
            icon={<Phone className="h-4 w-4" aria-hidden="true" />}
            label="Phone"
            value={profile.phone}
            href={`tel:${profile.phone.replace(/\s/g, "")}`}
          />
          {hasResume && (
            <ContactLine
              icon={<FileText className="h-4 w-4" aria-hidden="true" />}
              label="Resume"
              value="Open PDF"
              href={RESUME_HREF}
              newTab
            />
          )}
        </ul>

        {/* GitHub and LinkedIn live in the cards rather than the list above, so
            they get the hover detail without being listed twice. Imported
            normally rather than dynamically: these are real links and belong in
            the server-rendered HTML for crawlers and no-JS visitors. */}
        <div className="mt-10 flex flex-col gap-3">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
            Elsewhere
          </span>
          <ContactCards />
        </div>
      </div>
    </SectionShell>
  );
}

function ContactLine({
  icon,
  label,
  value,
  href,
  newTab,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  newTab?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : null)}
        className="group flex items-center gap-4 rounded-md py-2 transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="text-muted-foreground transition-colors group-hover:text-brand">
          {icon}
        </span>
        <span className="w-20 shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-sm">{value}</span>
      </a>
    </li>
  );
}
