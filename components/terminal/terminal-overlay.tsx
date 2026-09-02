"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePreloaderDone } from "@/lib/hooks/use-preloader-done";
import { AnimatePresence, m } from "@/lib/motion";
import { runCommand } from "@/lib/terminal/commands";
import { profile } from "@/data";

/**
 * Press ` and the boot terminal drops back down as a command palette.
 *
 * Styled after the preloader rather than sharing code with it. The preloader is
 * frozen, and extracting a shared chrome component out of it would be exactly
 * the kind of refactor "keep it as-is" rules out — so the handful of classes
 * are copied and re-indented to this file's conventions.
 *
 * Not green, either. Green is the preloader's, and that terminal is its own
 * black world; this one sits on the site and uses the site's palette.
 */

type Line = { id: number; text: string; kind: "input" | "output" };

const PROMPT = `C:\\Users\\${profile.firstName}>`;

export function TerminalOverlay({
  resumeHref,
}: {
  resumeHref: string | null;
}) {
  const ready = usePreloaderDone();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const nextId = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const append = useCallback((text: string, kind: Line["kind"]) => {
    setLines((current) => [
      ...current,
      { id: nextId.current++, text, kind },
    ]);
  }, []);

  useEffect(() => {
    // Gated on the preloader: while it runs it has its own global keydown that
    // dismisses it, so an ungated backtick would skip the intro AND open this.
    if (!ready) return;

    const handleKey = (event: KeyboardEvent) => {
      // e.code, not e.key: backtick is a dead key on many non-US layouts, so
      // matching the character would make this unreachable for those users.
      if (event.code !== "Backquote") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      // Typing a backtick into any field — including this terminal's own
      // prompt — must insert it, not toggle the overlay.
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [ready]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (lines.length === 0) {
      append("Type `help` for available commands.", "output");
    }
  }, [open, lines.length, append]);

  // Keep the newest line in view as output accumulates.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const input = value;
    setValue("");

    const command = input.trim().toLowerCase();
    append(`${PROMPT} ${input}`, "input");

    if (command === "clear") {
      setLines([]);
      return;
    }
    if (command === "exit") {
      setOpen(false);
      return;
    }

    for (const line of runCommand(input, { resumeHref })) append(line, "output");
  }

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.3, 1] }}
          className="fixed inset-x-0 top-0 z-terminal mx-auto w-[min(46rem,calc(100vw-2rem))] pt-6"
          role="dialog"
          aria-modal="false"
          aria-label="Terminal"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              <span className="h-2.5 w-2.5 rounded-full bg-signal" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
              <span className="ml-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                sys_query.sh
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand"
              >
                esc
              </button>
            </div>

            <div
              ref={scrollRef}
              className="max-h-[50vh] overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {lines.map((line) => (
                <p
                  key={line.id}
                  className={`whitespace-pre-wrap ${
                    line.kind === "input"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {/* A non-breaking space keeps blank spacer lines from
                      collapsing to zero height. */}
                  {line.text || "\u00A0"}
                </p>
              ))}

              <form onSubmit={handleSubmit} className="mt-1 flex gap-2">
                <label htmlFor="terminal-input" className="sr-only">
                  Terminal command
                </label>
                <span className="shrink-0 text-signal">{PROMPT}</span>
                <input
                  id="terminal-input"
                  ref={inputRef}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-foreground outline-none"
                />
              </form>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
