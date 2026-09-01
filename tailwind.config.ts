import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  // `./data` is deliberately absent: content there is prose, not markup. Any
  // Tailwind class name written into a data file would be purged silently, so
  // value->class mapping (skill grade -> tyre colour, etc.) lives in components.
  // Tests are excluded for the same reason: assertion strings are data, and
  // the scanner is loose enough that a fixture could quietly emit a utility.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "!./**/*.test.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Declared in globals.css since the beginning but never mapped here, so
        // `bg-popover` / `text-destructive` silently did nothing until now.
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Domain colours. Deliberately NOT mapped onto shadcn's `accent`, which
        // is a subtle hover surface — see the trap noted in globals.css.
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        signal: "hsl(var(--signal))",
        best: "hsl(var(--best))",
        surface: "hsl(var(--surface))",
        raised: "hsl(var(--raised))",
        tyre: {
          soft: "hsl(var(--tyre-soft))",
          medium: "hsl(var(--tyre-medium))",
          hard: "hsl(var(--tyre-hard))",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        // Was the literal string "JetBrains Mono" with nothing loading the font,
        // so every `font-mono` glyph fell back to the OS default. layout.tsx now
        // loads the variable font behind this var.
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      // The pasted ContactCards uses `duration-400`, which is in Tailwind v4's
      // scale but not v3's. Adding it keeps that component a 1:1 paste.
      transitionDuration: {
        400: "400ms",
      },
      // Every fixed layer on the site, in one auditable place. The preloader
      // hardcodes z-50 and is frozen, so it is the fixed point the rest are
      // arranged around: chrome sits below it, terminal above.
      zIndex: {
        field: "0",
        content: "10",
        mascot: "35",
        dock: "40",
        strip: "45",
        toast: "55",
        terminal: "60",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // --- still used by the preloader ---
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },

        // --- redesign ---
        // A token arriving from the stream: it lands, flares, settles. The
        // flare is what sells it as generated rather than merely revealed.
        "token-land": {
          from: { opacity: "0", filter: "brightness(2.4)" },
          "60%": { opacity: "1", filter: "brightness(1.6)" },
          to: { opacity: "1", filter: "brightness(1)" },
        },
        // The car marker pulsing on the track map. Opacity only, so it
        // inherits whatever fill the element already carries.
        "led-flash": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        // Team-radio bubble opening. Overshoot, because radio clicks on.
        "radio-pop": {
          from: { opacity: "0", transform: "scale(0.86) translateY(6px)" },
          "70%": { opacity: "1", transform: "scale(1.03) translateY(0)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        // Mascot idle. CSS rather than JS so the reduced-motion kill switch at
        // the bottom of globals.css stops it without the engine checking.
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        // Telemetry trace drawing itself. Pairs with stroke-dasharray on the
        // path; the consumer sets the dash length to the measured path length.
        trace: {
          from: { strokeDashoffset: "var(--trace-len, 1000)" },
          to: { strokeDashoffset: "0" },
        },
        // Sector split line wiping across on section entry.
        sweep: {
          from: { transform: "scaleX(0)", opacity: "1" },
          to: { transform: "scaleX(1)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        blink: "blink 1.1s step-end infinite",
        "token-land": "token-land 380ms ease-out both",
        "led-flash": "led-flash 640ms ease-in-out infinite",
        "radio-pop": "radio-pop 320ms cubic-bezier(0.2, 0.8, 0.3, 1) both",
        bob: "bob 3.2s ease-in-out infinite",
        trace: "trace 1.4s ease-out both",
        sweep: "sweep 720ms cubic-bezier(0.2, 0.8, 0.3, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
