import { content, profile } from "@/data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container flex flex-wrap items-center justify-between gap-4 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{content.footer.copyright()}</span>
        {profile.raceNumber !== null && (
          <span className="text-brand">No. {profile.raceNumber}</span>
        )}
        <span>{content.footer.builtWith}</span>
      </div>
    </footer>
  );
}
