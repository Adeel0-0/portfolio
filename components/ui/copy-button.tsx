"use client";

import { useEffect, useRef, useState } from "react";

import { useRaceControl } from "@/components/chrome/race-control";
import { cn } from "@/lib/utils";

/**
 * Copies text without ever leaving the page.
 *
 * Three tiers, because the async clipboard is not always there: navigator
 * .clipboard is undefined on non-secure origins, which includes dev over a LAN
 * IP and any sandboxed iframe. Falls back to the legacy execCommand path, and
 * if that fails too, shows the value so it can be copied by hand. A contact
 * button that silently does nothing is worse than one that shows you the email.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through */
  }

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  className,
}: {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const announce = useRaceControl();

  useEffect(() => () => clearTimeout(timeout.current), []);

  async function handleCopy() {
    const copied = await copyText(value);
    setState(copied ? "copied" : "manual");
    announce(copied ? "Message received" : "Radio failure — copy by hand");
    clearTimeout(timeout.current);
    // The manual fallback shows the raw value, so it needs long enough to
    // actually be read and retyped.
    timeout.current = setTimeout(() => setState("idle"), copied ? 2500 : 8000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
    >
      {/* No aria-live here: the race-control toast is already a live region and
          announces the outcome. Two would speak the same event twice. */}
      <span>
        {state === "idle" ? label : state === "copied" ? copiedLabel : value}
      </span>
    </button>
  );
}
