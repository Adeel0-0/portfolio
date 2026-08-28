"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AnimatePresence, m } from "@/lib/motion";

/**
 * Notifications, in the voice of FIA race control.
 *
 * This is a real toast system — the site needs one anyway for copy-to-clipboard
 * feedback — that happens to be dressed as the black-and-yellow message board.
 * The joke costs nothing because the mechanism was required regardless.
 */

type Message = { id: number; text: string };

const RaceControlContext = createContext<((text: string) => void) | null>(null);

const DISMISS_MS = 3600;

export function RaceControlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const announce = useCallback((text: string) => {
    const id = nextId.current;
    nextId.current += 1;
    setMessages((current) => [...current, { id, text }]);

    const timer = setTimeout(() => {
      setMessages((current) => current.filter((m) => m.id !== id));
      timers.current.delete(timer);
    }, DISMISS_MS);
    timers.current.add(timer);
  }, []);

  // Tracked rather than fired-and-forgotten: an unmount mid-flight would
  // otherwise leave timers calling setState on a dead component.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      // forEach rather than for..of: tsconfig targets ES5 here, and iterating a
      // Set directly would need downlevelIteration.
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  return (
    <RaceControlContext.Provider value={announce}>
      {children}
      <div
        // Top-right: the rev strip owns top-centre and the dock owns the bottom.
        className="pointer-events-none fixed right-4 top-4 z-toast flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2"
        // The toast is the only announcement of a copy result, so it has to
        // reach screen readers rather than just appearing.
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <m.div
              key={message.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="rounded border-l-2 border-signal bg-surface px-4 py-3 shadow-lg shadow-black/40"
            >
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.24em] text-signal">
                Race control
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-foreground">
                {message.text}
              </p>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </RaceControlContext.Provider>
  );
}

/**
 * Returns the announcer, or a no-op when there is no provider above.
 *
 * Falling back rather than throwing keeps components that use it — the copy
 * button, most obviously — droppable anywhere without dragging the toast
 * system along as a hard dependency.
 */
export function useRaceControl(): (text: string) => void {
  const announce = useContext(RaceControlContext);
  return announce ?? noop;
}

function noop() {}
