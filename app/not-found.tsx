/**
 * 404. A server component — nothing here needs interactivity.
 *
 * Renders inside RootLayout, so the nav dock and the rest of the chrome stay
 * available and a visitor who mistyped a hash can navigate out normally.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-[46ch] flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-brand" aria-hidden="true" />
          {/* Braced string, not a bare text node: `//` at the start of JSX
              children parses as a comment. */}
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
            {"// 404"}
          </p>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          This page isn&apos;t on the grid.
        </h1>

        <p className="leading-relaxed text-muted-foreground">
          The address you followed doesn&apos;t match anything here. Everything
          on this site lives on one page.
        </p>

        <div className="mt-2">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Back to the grid
          </a>
        </div>
      </div>
    </main>
  );
}
