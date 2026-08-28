import { NextResponse } from "next/server";

import { profile } from "@/data";
import type { ContributionDay } from "@/lib/contributions";

/**
 * Server-side proxy for the GitHub contribution graph.
 *
 * The component this feeds originally fetched jogruber.de straight from the
 * browser, which puts a free community service on the critical path of a job
 * -hunt portfolio with no caching, a CORS dependency, and an uncached round
 * trip per visitor. Going through a route handler fixes all three at once:
 * responses are cached for an hour, there is no cross-origin request, and the
 * upstream shape is normalised here rather than in the render path.
 *
 * Failure is deliberately quiet. A contribution graph is a nice-to-have; an
 * error message where one should be is worse than no graph at all, so this
 * returns an empty set and lets the component render nothing.
 */

export const revalidate = 3600;

const UPSTREAM = "https://github-contributions-api.jogruber.de/v4";

export async function GET() {
  const empty = NextResponse.json({ contributions: [] as ContributionDay[] });

  try {
    const response = await fetch(
      `${UPSTREAM}/${encodeURIComponent(profile.githubUsername)}?y=last`,
      {
        // Matches `revalidate` above; without it fetch would opt the whole
        // route out of caching and hit upstream on every request.
        next: { revalidate },
        headers: { accept: "application/json" },
      }
    );

    if (!response.ok) return empty;

    const data = (await response.json()) as {
      contributions?: ContributionDay[];
    };

    if (!Array.isArray(data.contributions)) return empty;

    return NextResponse.json({ contributions: data.contributions });
  } catch {
    return empty;
  }
}
