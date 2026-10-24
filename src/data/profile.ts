/** The portrait on the home page and the About page. */
export type Avatar = {
  /** Any file in public/. */
  src: string;
};

export type Profile = {
  name: string;
  firstName: string;
  role: string;
  /**
   * Race number, the way drivers carry one. Shown on the hero portrait label;
   * null means no number chosen, and the label then omits it.
   */
  raceNumber: number | null;
  avatar: Avatar;
  /** Not rendered by the current site. Listed in docs/legacy-content-inventory.md. */
  tagline: string;
  /** Not rendered by the current site. Listed in docs/legacy-content-inventory.md. */
  summary: string;
  /**
   * Short tool wordmarks, a hand-picked subset of src/data/skills.ts. Not
   * rendered by the current site.
   */
  toolbelt: string[];
  location: string;
  email: string;
  phone: string;
  github: string;
  /** The bare handle, held separately from the URL. Not currently read. */
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
  location: "Hyderabad, Telangana, India",
  email: "mohammad.adeel.syed@gmail.com",
  phone: "+91 80917 79849",
  github: "https://github.com/Adeel0-0",
  githubUsername: "Adeel0-0",
  linkedin: "https://www.linkedin.com/in/syed-mohammad-adeel-397b4b263/",
};

/**
 * Headline numbers from the resume. Not rendered by the current site; each
 * needs its method and date before it is shown (docs/content-authoring.md).
 */
export type Stat = {
  value: string;
  label: string;
  /** Marks the single strongest number, if it is ever highlighted. */
  best?: boolean;
};

export const stats: Stat[] = [
  { value: "24%", label: "API error/fallback reduction via structured testing" },
  // The one hard, externally-comparable benchmark number here.
  { value: "86%", label: "mAP@0.5 — YOLO object-detection models", best: true },
  { value: "8.14", label: "CGPA — B.Tech CSE, VIT-AP (2026)" },
];
