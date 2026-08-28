"use client";

import { AnimatePresence, m } from "@/lib/motion";

/**
 * What the engineer says, in a team-radio bubble.
 *
 * This is the mascot's accessible surface. The sprite beside it is aria-hidden
 * decoration; the words are real content, so they live in the DOM as text and
 * get announced when they change.
 */
export function RadioBubble({
  line,
  onDismiss,
}: {
  line: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="relative max-w-[13rem] rounded-lg rounded-br-none border border-border bg-surface px-3 py-2 shadow-lg shadow-black/40">
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.24em] text-brand">
          Radio
        </p>
        {/* aria-live so a section change is spoken, not just drawn. */}
        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <m.p
              key={line}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-0.5 text-xs leading-snug text-foreground"
            >
              {line}
            </m.p>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss the race engineer"
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-raised font-mono text-[0.625rem] leading-none text-muted-foreground transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ×
        </button>
      </div>
    </div>
  );
}
