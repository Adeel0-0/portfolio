export type Theme = "professional" | "f1";
export const THEME_COLORS: Record<Theme, string> = {
  professional: "#f5f4f0",
  f1: "#0b0c0f",
};
export function parseTheme(value: string | null): Theme {
  return value === "f1" ? "f1" : "professional";
}
export class ThemeSession {
  desired: Theme;
  active = false;
  private generation = 0;
  constructor(theme: Theme) {
    this.desired = theme;
  }
  request(): { id: number; target: Theme; interrupted: boolean } {
    const interrupted = this.active;
    this.desired = this.desired === "professional" ? "f1" : "professional";
    this.active = true;
    return { id: ++this.generation, target: this.desired, interrupted };
  }
  isCurrent(id: number): boolean {
    return id === this.generation && this.active;
  }
  finish(): Theme {
    this.active = false;
    this.generation++;
    return this.desired;
  }
}
