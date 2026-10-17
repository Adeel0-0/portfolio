import { profile } from '../../../data/profile';
import { CONTRIBUTIONS_REVALIDATE, fetchContributions } from '../../../lib/contributions';

export const prerender = false;
export async function GET(): Promise<Response> {
  return Response.json({ contributions: await fetchContributions(profile.githubUsername) }, {
    headers: { 'cache-control': `public, s-maxage=${CONTRIBUTIONS_REVALIDATE}, stale-while-revalidate` },
  });
}
