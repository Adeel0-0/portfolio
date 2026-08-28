"use client";

import { Github, Linkedin } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ContributionDay } from "@/lib/contributions";
import { profile } from "@/data";
import { AnimatePresence, m } from "@/lib/motion";
import { ContributionGraph } from "./contribution-graph";

/**
 * Social links whose cards morph into one another.
 *
 * Moving between the icons cross-fades the cards in the direction of travel
 * while the container animates between their sizes and positions, so the whole
 * row reads as one object rather than a set of independent popovers.
 *
 * Adapted from the original in three ways: the hand-rolled keyframes are
 * replaced with framer (which the site already ships, and which gets the
 * reduced-motion behaviour from MotionConfig for free), the Tailwind v4
 * utilities are translated to v3, and the contribution fetch goes through this
 * app's own cached route instead of hitting a third-party API from the browser.
 */

type CardLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
  card: React.ReactNode;
};

export function ContactCards() {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/contributions")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { contributions: ContributionDay[] }) => {
        if (cancelled) return;
        if (data.contributions.length === 0) setFailed(true);
        else setDays(data.contributions);
      })
      // The graph is decorative. Hiding it beats showing an error on a
      // portfolio, so a failure just collapses that half of the card.
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, []);

  const total = days.reduce((sum, day) => sum + day.count, 0);

  const links: CardLink[] = [
    {
      label: "GitHub",
      href: profile.github,
      icon: <Github className="h-5 w-5" aria-hidden="true" />,
      card: (
        <div className="flex w-[min(22rem,calc(100vw-4rem))] flex-col gap-3 p-4">
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold text-foreground">
              {profile.githubUsername}
            </span>
            <span className="text-xs text-muted-foreground">
              {failed
                ? "github.com"
                : `${total.toLocaleString()} contributions in the last year`}
            </span>
          </div>
          {!failed && <ContributionGraph days={days} />}
        </div>
      ),
    },
    {
      label: "LinkedIn",
      href: profile.linkedin,
      icon: <Linkedin className="h-5 w-5" aria-hidden="true" />,
      card: (
        <div className="flex w-[min(18rem,calc(100vw-4rem))] flex-col gap-1 p-4">
          <span className="font-mono text-sm font-bold text-foreground">
            {profile.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {profile.role} · {profile.location.split(",").slice(-1)[0].trim()}
          </span>
        </div>
      ),
    },
  ];

  return <CardRow links={links} />;
}

function CardRow({ links }: { links: CardLink[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [box, setBox] = useState({ left: 0, width: 0, height: 0 });

  const contentRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const link = linkRefs.current[index];
    if (!open || !content || !link) return;
    setBox({
      left: link.offsetLeft + link.offsetWidth / 2,
      width: content.offsetWidth,
      height: content.offsetHeight,
    });
  }, [open, index]);

  function handleEnter(next: number) {
    if (open && next === index) return;
    setDirection(Math.sign(next - index) || 1);
    setIndex(next);
    setOpen(true);
  }

  return (
    <div
      className="relative flex w-fit"
      onMouseLeave={() => setOpen(false)}
    >
      {links.map((link, linkIndex) => (
        <a
          key={link.label}
          ref={(node) => {
            linkRefs.current[linkIndex] = node;
          }}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          onMouseEnter={() => handleEnter(linkIndex)}
          onFocus={() => handleEnter(linkIndex)}
          className="relative z-10 p-3 text-muted-foreground transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {link.icon}
        </a>
      ))}

      <m.div
        aria-hidden={!open}
        animate={{
          left: box.left,
          width: box.width,
          height: box.height,
          opacity: open ? 1 : 0,
          y: open ? 0 : 4,
        }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        // `contain: paint` keeps the rounded clip on the compositor. The cards
        // animate with a blur, and without it Chrome lets the filtered layer
        // paint outside the corners while the container is still resizing.
        style={{ contain: "paint" }}
        className={`absolute bottom-[calc(100%+0.5rem)] flex -translate-x-1/2 items-end overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/50 ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={index}
            ref={contentRef}
            custom={direction}
            initial={{ opacity: 0, x: direction * 56, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: direction * -56, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="absolute"
          >
            {links[index]?.card}
          </m.div>
        </AnimatePresence>
      </m.div>

      {/* Pointer bridge, so the card survives the gap on the way to it. */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-2 h-2" />
    </div>
  );
}
