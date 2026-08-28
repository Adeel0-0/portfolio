import type { Stat } from "@/data";
import { cn } from "@/lib/utils";

/**
 * A headline number.
 *
 * `stat.best` renders it in timing purple — F1's session-best colour. Exactly
 * one stat on the page carries it; purple only reads as "personal best" while
 * it stays rare, and a second one turns it into just another accent.
 */
export function StatBlock({ stat }: { stat: Stat }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={cn(
          "font-mono text-4xl font-bold tracking-tight md:text-5xl",
          stat.best ? "text-best" : "text-foreground"
        )}
      >
        {stat.value}
      </span>
      {stat.best && (
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-best">
          Personal best
        </span>
      )}
      <span className="max-w-[22ch] text-sm leading-relaxed text-muted-foreground">
        {stat.label}
      </span>
    </div>
  );
}
