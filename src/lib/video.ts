/** Privacy-enhanced YouTube embed URL for a validated 11-character video id. */
export function buildEmbedUrl(id: string, start = 0): string {
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error("Invalid YouTube id");
  const url = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("rel", "0");
  if (start > 0) url.searchParams.set("start", String(Math.floor(start)));
  return url.toString();
}
