import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Per-letter entrance heading, driven entirely by CSS animation-delay.
 *
 * Previously this wrapped every character in its own framer-motion component
 * and set `staggerChildren` to the per-letter *duration*, so a single word took
 * several seconds to finish spelling itself. The CSS version renders as plain
 * spans — no runtime, no JS on the main thread — and respects the global
 * prefers-reduced-motion rule in app/globals.css.
 */

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  /** Seconds between each letter. */
  stagger?: number;
  /** Seconds before the first letter starts. */
  delay?: number;
  className?: string;
  textClassName?: string;
  underlineClassName?: string;
  underlineGradient?: string;
  underlineHeight?: string;
  underlineOffset?: string;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      stagger = 0.035,
      delay = 0,
      className,
      textClassName,
      underlineClassName,
      underlineGradient = "from-blue-500 via-purple-500 to-pink-500",
      underlineHeight = "h-1",
      underlineOffset = "-bottom-2",
      ...props
    },
    ref
  ) => {
    const letters = Array.from(text);
    const underlineDelay = delay + letters.length * stagger;

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", className)}
        {...props}
      >
        <div className="relative">
          <div
            className={cn(
              "flex flex-wrap justify-center overflow-hidden text-center text-4xl font-bold",
              textClassName
            )}
            // The visible text is the letters below; this keeps it as one
            // pronounceable string for screen readers and copy/paste.
            aria-label={text}
          >
            {letters.map((letter, index) => (
              <span
                key={index}
                aria-hidden="true"
                className="animate-fade-up-fast inline-block"
                style={{ animationDelay: `${delay + index * stagger}s` }}
              >
                {letter === " " ? " " : letter}
              </span>
            ))}
          </div>

          <div
            className={cn(
              "animate-underline-in absolute left-0",
              underlineHeight,
              underlineOffset,
              "bg-gradient-to-r",
              underlineGradient,
              underlineClassName
            )}
            style={{ animationDelay: `${underlineDelay}s` }}
          />
        </div>
      </div>
    );
  }
);
AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
