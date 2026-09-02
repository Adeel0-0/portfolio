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
 *
 * This used to be a two-column grid with a pit board — a mono card reading
 * P1 / #22 / ADEEL / status — held out to the left of the name. The card is
 * gone and the slot is deliberately empty; something else goes there later.
 * The layout is a single column rather than a grid with one filled track,
 * because an `auto` track holding nothing still collapses to zero width and
 * only reads as a grid in the source.
 */
export function Hero() {
  return (
    <SectionShell
      id="hero"
      className="flex min-h-screen items-center py-28"
      contentClassName="flex flex-col items-start gap-6"
    >
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
    </SectionShell>
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
