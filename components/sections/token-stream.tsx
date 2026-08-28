"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Text that arrives the way a model emits it — token by token, each one
 * flaring as it lands.
 *
 * Token-wise rather than character-wise on purpose: a typewriter reads as a
 * 1980s terminal, whereas whole words appearing in sequence is what watching an
 * LLM stream actually looks like. The preloader already owns the terminal idea;
 * this is the other half of the theme.
 *
 * Three constraints shape the implementation:
 *
 *   1. The text ships in the HTML. It renders as one plain string on the server
 *      and on the first client render, so crawlers, no-JS visitors and the LCP
 *      measurement all get real content. Splitting only happens after mount.
 *
 *   2. No flash of fully-visible text. The tokens mount with animation-fill-mode
 *      `both`, so each holds its `from` state through its delay — the split and
 *      the hidden state land in the same commit rather than one frame apart.
 *
 *   3. Screen readers get the sentence, not 20 fragments. The token spans are
 *      aria-hidden behind a single sr-only copy.
 */

/** Roughly LLM-ish: whole words, spaces preserved by rendering them back. */
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean);
}

const STAGGER_MS = 42;

export function TokenStream({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    // useReducedMotion() resolves to a boolean after mount; until then it is
    // null, which is exactly why this waits rather than branching on render.
    if (reduced) return;
    setStreaming(true);
  }, [reduced]);

  if (!streaming) {
    return <p className={className}>{text}</p>;
  }

  const tokens = tokenize(text);

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {tokens.map((token, index) => (
          <span
            key={`${index}-${token}`}
            className={cn(
              "animate-token-land",
              // Whitespace tokens must keep their width or the sentence
              // collapses into one long word.
              /^\s+$/.test(token) && "whitespace-pre"
            )}
            style={{ animationDelay: `${index * STAGGER_MS}ms` }}
          >
            {token}
          </span>
        ))}
      </span>
    </p>
  );
}
