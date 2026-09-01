import { content } from "@/data";

/**
 * One line, centred: the name and the year.
 *
 * The bottom padding is not decoration. The nav dock is position:fixed at the
 * bottom of the viewport, so without it the dock parks on top of this line for
 * the entire time the end of the page is on screen. It clears the dock's own
 * height plus the gap it holds off the bottom edge, and it is applied here
 * rather than on <main> so it stays next to the thing it protects.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <div className="container text-center font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
        {content.footer.copyright()}
      </div>
    </footer>
  );
}
