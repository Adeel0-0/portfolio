import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../src/pages/api/contributions';

afterEach(() => vi.unstubAllGlobals());
describe('public contribution endpoint', () => {
  it('returns the existing JSON and CDN contract', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ contributions: [{ date: '2026-01-01', count: 3, level: 2 }] })));
    vi.stubGlobal('fetch', fetcher);
    const result = await GET();
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('public, s-maxage=3600, stale-while-revalidate');
    expect(await result.json()).toEqual({ contributions: [{ date: '2026-01-01', count: 3, level: 2 }] });
    expect(fetcher.mock.calls[0][0]).toBe('https://github-contributions-api.jogruber.de/v4/Adeel0-0?y=last');
    expect(fetcher.mock.calls[0][1]).not.toHaveProperty('next');
  });
  it.each(['non-ok', 'bad-json', 'timeout', 'malformed'])('degrades %s into a 200 empty array', async (mode) => {
    vi.stubGlobal('fetch', async () => {
      if (mode === 'timeout') throw new DOMException('timeout', 'TimeoutError');
      if (mode === 'non-ok') return new Response('', { status: 503 });
      if (mode === 'bad-json') return new Response('not-json');
      return new Response(JSON.stringify({ contributions: [{ date: '2026-01-01', count: 'bad' }] }));
    });
    const result = await GET();
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ contributions: [] });
  });
});
