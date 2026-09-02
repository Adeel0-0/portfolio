/** The portrait in the Developer Profile section. */
export type Avatar = {
  /** Any file in public/. */
  src: string;
};

export type Profile = {
  name: string;
  firstName: string;
  role: string;
  /**
   * Race number, the way drivers carry one.
   *
   * Currently rendered nowhere: its only reader was the hero's pit board, which
   * is gone. Kept because the empty hero slot is meant to be filled and this is
   * the kind of thing that fills it. Anything that picks it up again must
   * handle null — that is what "no number chosen" means.
   */
  raceNumber: number | null;
  avatar: Avatar;
  tagline: string;
  summary: string;
  /**
   * The sponsor bar along the base of the hero — your tools as livery decals.
   *
   * Short wordmarks only. Deliberately a hand-picked subset rather than a slice
   * of data/skills.ts, because the headline skills there are phrases
   * ("Embeddings & Vector Search") and a decal has to read at a glance.
   */
  toolbelt: string[];
  location: string;
  email: string;
  phone: string;
  github: string;
  /**
   * Held separately from the URL: the contributions API wants the bare handle,
   * and slicing it back out of a URL breaks the first time the URL changes.
   */
  githubUsername: string;
  linkedin: string;
};

export const profile: Profile = {
  name: "Syed Mohammad Adeel",
  firstName: "ADEEL",
  role: "AI/ML & Software Engineer",
  raceNumber: 22,

  avatar: {
    src: "/portrait.png",
  },
  tagline:
    "I build and ship AI-powered backend systems — embeddings, vector search, RAG pipelines, and production APIs.",
  summary:
    "Computer Science graduate (VIT-AP, 2026) who builds and ships AI-powered backend systems in Python. Hands-on with LLM applications — embeddings, vector search, and retrieval (RAG) — plus computer-vision model training (YOLO, 86% mAP@0.5) and production practices: REST API design, Redis caching, and CI-tested deployments on AWS.",
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
