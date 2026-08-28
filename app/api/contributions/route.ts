import { NextResponse } from "next/server";

import { profile } from "@/data";
import {
  CONTRIBUTIONS_REVALIDATE,
  fetchContributions,
} from "@/lib/contributions";

/**
 * Server-side proxy for the GitHub contribution graph.
 *
 * The page no longer needs this: Contact is a Server Component and awaits
 * fetchContributions() directly, so the graph is in the prerendered HTML. The
 * route is kept as the addressable fallback — it costs nothing, it shares the
 * same cached fetch, and deleting a public endpoint that something might be
 * pointed at is not worth the tidiness.
 *
 * All the interesting logic (validation, timeout, quiet failure) lives in
 * lib/contributions.ts, where it is unit-testable without an HTTP layer.
 */

export const revalidate = CONTRIBUTIONS_REVALIDATE;

export async function GET() {
  const contributions = await fetchContributions(profile.githubUsername);

  return NextResponse.json(
    { contributions },
    {
      headers: {
        // The Next data cache already prevents an upstream call, but without
        // this every visitor still pays a round trip to the function.
        "cache-control": `public, s-maxage=${CONTRIBUTIONS_REVALIDATE}, stale-while-revalidate`,
      },
    }
  );
}
