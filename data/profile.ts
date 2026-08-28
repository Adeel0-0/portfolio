export const profile = {
  name: "Syed Mohammad Adeel",
  firstName: "ADEEL",
  role: "AI/ML & Software Engineer",
  /**
   * Race number, the way drivers carry one. Threads through the pit board, the
   * nav corner and the footer; every one of those renders conditionally, so
   * null simply means the number is omitted everywhere. Pick one and set it.
   */
  raceNumber: 22 as number | null,

  /**
   * The portrait in the Developer Profile section.
   *
   * Swap `src` for any file in public/. Set `pixelated: true` for pixel art —
   * without it the browser smooth-scales the image and a 64px sprite blown up
   * to 320px turns to mush; with it, every pixel stays a hard square.
   */
  avatar: {
    src: "/profile.jpg",
    pixelated: false,
  },
  tagline:
    "I build and ship AI-powered backend systems — embeddings, vector search, RAG pipelines, and production APIs.",
  summary:
    "Computer Science graduate (VIT-AP, 2026) who builds and ships AI-powered backend systems in Python. Hands-on with LLM applications — embeddings, vector search, and retrieval (RAG) — plus computer-vision model training (YOLO, 86% mAP@0.5) and production practices: REST API design, Redis caching, and CI-tested deployments on AWS.",
  /**
   * The sponsor bar along the base of the hero — your tools as livery decals.
   *
   * Short wordmarks only. This is deliberately a hand-picked subset rather than
   * a slice of data/skills.ts, because the headline skills there are phrases
   * ("Embeddings & Vector Search") and a decal has to read at a glance.
   */
  toolbelt: [
    "Python",
    "FastAPI",
    "PyTorch",
    "Redis",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Next.js",
  ],
  location: "Ananthapur, Andhra Pradesh, India",
  email: "mohammad.adeel.syed@gmail.com",
  phone: "+91 80917 79849",
  github: "https://github.com/Adeel0-0",
  /** Held separately from the URL: the contributions API wants the bare handle,
   *  and slicing it back out of a URL breaks the first time the URL changes. */
  githubUsername: "Adeel0-0",
  linkedin: "https://www.linkedin.com/in/syed-mohammad-adeel-397b4b263/",
};

export type Stat = {
  value: string;
  label: string;
  /**
   * Renders in timing purple — F1's session-best colour.
   *
   * Exactly one stat may carry this. Purple only reads as "personal best"
   * while it stays rare; marking two makes it just another accent colour.
   */
  best?: boolean;
};

export const stats: Stat[] = [
  { value: "24%", label: "API error/fallback reduction via structured testing" },
  // The one hard, externally-comparable benchmark number here.
  { value: "86%", label: "mAP@0.5 — YOLO object-detection models", best: true },
  { value: "8.14", label: "CGPA — B.Tech CSE, VIT-AP (2026)" },
];
