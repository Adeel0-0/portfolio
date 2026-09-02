import Image from "next/image";

/**
 * The About portrait. One photograph, sitting still.
 *
 * This replaces a slideshow that cycled the same face through five canvas
 * treatments — ASCII, halftone, 1-bit, duotone, riso — on a 3.8s timer, with a
 * row of chips to pick between them. It went because five redraws of one photo
 * is four photos of noise: the section is about who is in the car, and the
 * treatments were answering a question nobody asked on the way to that.
 *
 * Losing them makes this a server component. There is no state, no canvas, no
 * timer and no intersection observer left to need one, so the whole portrait
 * now ships as markup and the client bundle drops the sampler along with it.
 */
export function Portrait({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[20rem] lg:mx-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 320px, 80vw"
          className="object-cover"
          priority={false}
        />

        {/* Navy wash so the portrait sits in the palette rather than beside it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent"
        />
      </div>

      <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
        {caption}
      </p>
    </div>
  );
}
