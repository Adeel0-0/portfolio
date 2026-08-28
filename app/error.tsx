"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * Before this existed, a throw anywhere in the client tree — and this site is
 * mostly client tree: canvas fields, rAF loops, framer transitions, a mascot
 * with timers — surfaced in production as the bare string "Application error:
 * a client-side exception has occurred" over a white page.
 *
 * Kept deliberately dumb. It shares the site's palette but imports none of its
 * machinery: no motion, no providers, no data. An error page that depends on
 * the systems that just failed is not an error page.
 *
 * Note this still renders inside RootLayout, so the fixed chrome and the
 * preloader are mounted around it. That is Next's design, not a choice here.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The one place a console call earns its keep: this is an unexpected
    // throw, it is already visible in Vercel's logs via `digest`, and the
    // stack is the only way to act on it.
    console.error("Unhandled error boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-[46ch] flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-brand" aria-hidden="true" />
          {/* Braced string, not a bare text node: `//` at the start of JSX
              children parses as a comment. The sections dodge this by reading
              their eyebrow from lib/sections.ts as an expression. */}
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">
            {"// Red flag"}
          </p>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Something went off track.
        </h1>

        <p className="leading-relaxed text-muted-foreground">
          An unexpected error stopped this page from rendering. Retrying usually
          clears it.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Back to the grid
          </a>
        </div>

        {/* The digest is the only handle on a minified production stack, so it
            is worth showing rather than hiding — it is what makes a bug report
            actionable. */}
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Ref {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
