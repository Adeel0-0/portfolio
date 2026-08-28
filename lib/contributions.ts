/**
 * The GitHub contribution graph: its shape, its parser, and its fetch.
 *
 * The type used to be declared in app/api/contributions/route.ts and imported
 * from there by two client components, which pointed the dependency graph at a
 * route handler. A route is a delivery mechanism; the shared contract belongs
 * in a layer both sides can depend on.
 *
 * Fetching lives here too so that a Server Component can call it directly.
 * ContactCards previously fetched /api/contributions from a useEffect — from a
 * component the server had already rendered, against data the server already
 * had. The route stays as the fallback path and is still cached.
 */

export type ContributionDay = {
  date: string;
  count: number;
  level?: 0 | 1 | 2 | 3 | 4;
};

const UPSTREAM = "https://github-contributions-api.jogruber.de/v4";

/** Matches `revalidate` in the route handler. */
export const CONTRIBUTIONS_REVALIDATE = 3600;

/** Upstream is a free community service; don't hold a function open on it. */
const TIMEOUT_MS = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * One day, or null if it is not usable.
 *
 * `level` is treated as optional enrichment rather than required data: an
 * out-of-range value is dropped and ContributionGraph recomputes it from
 * `count`, which is a better outcome than indexing its LEVELS array with 7 and
 * rendering `className="undefined"`.
 */
function parseDay(value: unknown): ContributionDay | null {
  if (!isRecord(value)) return null;

  const { date, count, level } = value;
  if (typeof date !== "string" || date.length === 0) return null;
  if (typeof count !== "number" || !Number.isFinite(count)) return null;

  const hasLevel =
    typeof level === "number" && Number.isInteger(level) && level >= 0 && level <= 4;

  return hasLevel
    ? { date, count, level: level as 0 | 1 | 2 | 3 | 4 }
    : { date, count };
}

/**
 * Validate an upstream payload into days, or return none.
 *
 * All-or-nothing on purpose. The array is *positional*: ContributionGraph pads
 * the first week from days[0].date and then chunks sequentially into weeks of
 * seven, so dropping a malformed entry from the middle shifts every day after
 * it onto the wrong weekday. A silently misaligned graph is worse than no
 * graph, and no graph is already a handled state.
 *
 * Written by hand rather than with a schema library: one upstream, three
 * fields, server-side only. A dependency would be larger than the code.
 */
export function parseContributions(input: unknown): ContributionDay[] {
  if (!isRecord(input)) return [];
  if (!Array.isArray(input.contributions)) return [];

  const days: ContributionDay[] = [];
  for (const entry of input.contributions) {
    const day = parseDay(entry);
    if (!day) return [];
    days.push(day);
  }

  return days;
}

/**
 * Fetch and validate the contribution history.
 *
 * Never throws and never rejects. The graph is decorative; on a portfolio, an
 * error where a nice-to-have should be is worse than the nice-to-have simply
 * not appearing. Callers treat an empty array as "no graph".
 */
export async function fetchContributions(
  username: string
): Promise<ContributionDay[]> {
  try {
    const response = await fetch(
      `${UPSTREAM}/${encodeURIComponent(username)}?y=last`,
      {
        next: { revalidate: CONTRIBUTIONS_REVALIDATE },
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

    if (!response.ok) return [];

    return parseContributions(await response.json());
  } catch {
    // Network failure, timeout, or malformed JSON. All the same outcome.
    return [];
  }
}
