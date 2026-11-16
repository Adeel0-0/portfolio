import { profile } from "./profile";
import type { SkillName } from "./skills";

export const person = {
  ...profile,
  displayName: "Mohammad Adeel",
  headline: ["Engineering", "useful intelligence."],
  introduction:
    "I build AI systems, thoughtful APIs, and the software that connects them. From finding the right repository to making sense of aerial imagery.",
  bio: "I’m a Computer Science graduate from VIT-AP, based in Hyderabad. My work sits between applied machine learning and software engineering. I enjoy turning an interesting model into a system someone can actually use.",
};

/**
 * Copy for the Preprint look (the home page typeset as a research paper).
 * Lines marked NEW were written for this look and await the owner's approval.
 */
export const paper = {
  title: "Engineering Useful Intelligence",
  /** NEW */
  subtitle: "Retrieval, Vision and Control in Practice",
  affiliation: "AI/ML & Software Engineer, Hyderabad, India",
  abstract:
    "I build AI systems, thoughtful APIs, and the software that connects them. From finding the right repository to making sense of aerial imagery, my work sits between applied machine learning and software engineering: turning an interesting model into a system someone can actually use.",
  /** The one highlighted term on the home page; must occur in `abstract`. */
  highlight: "a system someone can actually use",
  workLead: "Three projects, from retrieval to vision to control.",
  /** NEW */
  marginNote: "→ three case studies, each with its pipeline and my role",
  /** Third-person bio, paraphrased from `person.bio`; follows the name. */
  bio: "is a Computer Science graduate from VIT-AP, based in Hyderabad. He enjoys turning an interesting model into a system someone can actually use.",
  figure: {
    project: "sefgh",
    /** Index of the stage the text discusses; drawn in the link colour. */
    focus: 1,
    annotations: [
      { stage: 0, text: "natural language", at: "above" },
      { stage: 2, text: "GitHub", at: "above" },
      { stage: 3, text: "evaluated", at: "below" },
    ],
    caption:
      "The SEFGH pipeline. A natural-language question is interpreted, sent to GitHub, and the results are ranked. The highlighted stage, query interpretation, links to the case study.",
  },
} as const;

export const capabilities = [
  {
    title: "Applied AI",
    description:
      "Retrieval, embeddings, and computer vision, connected to a clear problem.",
    skills: ["Python", "PyTorch", "Embeddings & Vector Search", "YOLOv5/v7"],
  },
  {
    title: "Backend engineering",
    description: "APIs, data pipelines, and the systems around the model.",
    skills: ["FastAPI", "PostgreSQL", "Redis Caching", "REST API Design"],
  },
  {
    title: "Build & evaluate",
    description:
      "Reproducible experiments, useful tests, and deliberate trade-offs.",
    skills: ["Automated Test Suites", "GitHub Actions CI/CD", "Docker"],
  },
] satisfies { title: string; description: string; skills: SkillName[] }[];
