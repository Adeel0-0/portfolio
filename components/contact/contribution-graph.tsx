"use client";

import { Fragment, useMemo, useState } from "react";

import type { ContributionDay } from "@/app/api/contributions/route";

/**
 * A year of GitHub activity as a 7-row grid.
 *
 * Not green. Green is dropped site-wide outside the preloader terminal and the
 * rev strip, and a contribution graph is a measurement — so it takes the signal
 * ramp like every other measured thing on the page. It reads as a heat map
 * either way, and it stops the contact card from being the one place the
 * palette breaks.
 */

const LEVELS = [
  "bg-raised",
  "bg-signal/20",
  "bg-signal/40",
  "bg-signal/65",
  "bg-signal/90",
];

/** 53 weeks covers a year plus the partial weeks at each end. */
const SKELETON_WEEKS = 53;

function levelOf(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
}

export function ContributionGraph({
  days,
  locale,
}: {
  days: ContributionDay[];
  locale?: string;
}) {
  const [hovered, setHovered] = useState<ContributionDay>();

  const weeks = useMemo(() => {
    if (days.length === 0) return [];
    const result: (ContributionDay | undefined)[][] = [];
    // Pad the first week so the grid starts on the correct weekday row.
    let week: (ContributionDay | undefined)[] = Array.from({
      length: new Date(`${days[0].date}T00:00:00Z`).getUTCDay(),
    });

    for (const day of days) {
      week.push(day);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      result.push([...week, ...Array.from<undefined>({ length: 7 - week.length })]);
    }
    return result;
  }, [days]);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }),
    [locale]
  );

  // Reserves the grid's exact footprint before data lands, so the card never
  // resizes underneath the pointer.
  const columns = weeks.length || SKELETON_WEEKS;

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        onPointerOver={(event) => {
          const target = event.target as HTMLElement;
          const { date, count } = target.dataset;
          setHovered(date ? { date, count: Number(count) } : undefined);
        }}
        onPointerLeave={() => setHovered(undefined)}
        className="grid grid-flow-col grid-rows-7 gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {weeks.length > 0
          ? weeks.map((week, weekIndex) => (
              <Fragment key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    data-date={day?.date}
                    data-count={day?.count}
                    className={`aspect-square w-full rounded-[2px] ${
                      day ? LEVELS[day.level ?? levelOf(day.count)] : ""
                    }`}
                  />
                ))}
              </Fragment>
            ))
          : Array.from({ length: SKELETON_WEEKS * 7 }, (_, index) => (
              <div
                key={index}
                className="aspect-square w-full rounded-[2px] bg-raised/50"
              />
            ))}
      </div>

      {/* Fixed height so revealing the label doesn't shift the grid. */}
      <p className="h-4 font-mono text-[0.625rem] text-muted-foreground">
        {hovered
          ? `${hovered.count} contribution${
              hovered.count === 1 ? "" : "s"
            } · ${formatter.format(new Date(`${hovered.date}T00:00:00Z`))}`
          : ""}
      </p>
    </div>
  );
}
