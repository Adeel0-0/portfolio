import { FileText } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import { profile } from "@/data";
import { RESUME_HREF, hasResume } from "@/lib/resume";
import { SectionShell } from "./section-shell";
import { TokenStream } from "./token-stream";

/**
 * The grid slot.
 *
 * The tagline is plain server-rendered text on purpose. Phase 2 layers a
 * token-stream reveal over it, but the words must exist in the HTML for
 * crawlers, for no-JS visitors, for reduced-motion visitors, and for the LCP
 * measurement. Streaming them in from client state would fail all four.
 */
export function Hero() {
  return (
    <SectionShell
      id="hero"
      className="flex min-h-screen items-center py-28"
      contentClassName="grid items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-16"
    >
      <PitBoard />

      <div className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {profile.name}
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-brand sm:text-sm">
            {profile.role}
          </p>
        </div>

        <TokenStream
          text={profile.tagline}
          className="max-w-[52ch] text-lg leading-relaxed text-muted-foreground"
        />

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View race history
          </a>
          {/* Opens the PDF itself in a new tab rather than a wrapper route.
              A React page under app/ would inherit the root layout, so opening
              it in a new tab would replay the whole preloader before a
              recruiter could read anything. The raw file loads instantly in the
              browser's own viewer and downloads cleanly. */}
          {hasResume && (
            <a
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Resume
            </a>
          )}
          <CopyButton value={profile.email} label="Copy email" />
        </div>

        <SponsorBar />
      </div>
    </SectionShell>
  );
}

/**
 * The board held out over the pit wall. Identity block and de-facto logo.
 *
 * Every field is mono because every field is something you'd read off a
 * timing screen. The race number renders only once one is chosen — until then
 * `profile.raceNumber` is null and the slot simply isn't there.
 */
function PitBoard() {
  return (
    <div className="w-full max-w-[19rem] rounded-lg border border-border bg-surface p-6 font-mono shadow-2xl shadow-black/40">
      <div className="flex items-baseline justify-between">
        <span className="text-5xl font-bold leading-none tracking-tighter text-foreground">
          P1
        </span>
        {profile.raceNumber !== null && (
          <span className="rounded border border-brand px-2 py-0.5 text-lg font-bold text-brand">
            {profile.raceNumber}
          </span>
        )}
      </div>

      <div className="my-5 h-px bg-border" />

      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold tracking-[0.1em] text-foreground">
          {profile.firstName}
        </span>
        <span className="text-[0.6875rem] uppercase tracking-[0.22em] text-muted-foreground">
          AI · ML · Backend
        </span>
      </div>

      <div className="my-5 h-px bg-border" />

      <div className="flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Status</span>
        <span className="flex items-center gap-2 text-signal">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-signal"
          />
          In the garage
        </span>
      </div>
    </div>
  );
}

/** Your tools as livery decals. */
function SponsorBar() {
  return (
    <div className="mt-6 w-full border-t border-border pt-5">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {profile.toolbelt.map((tool) => (
          <li
            key={tool}
            className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}
