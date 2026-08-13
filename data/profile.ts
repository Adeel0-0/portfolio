export const profile = {
  name: "Syed Mohammad Adeel",
  firstName: "ADEEL",
  role: "AI/ML & Software Engineer",
  tagline:
    "I build and ship AI-powered backend systems — embeddings, vector search, RAG pipelines, and production APIs.",
  summary:
    "Computer Science graduate (VIT-AP, 2026) who builds and ships AI-powered backend systems in Python. Hands-on with LLM applications — embeddings, vector search, and retrieval (RAG) — plus computer-vision model training (YOLO, 86% mAP@0.5) and production practices: REST API design, Redis caching, and CI-tested deployments on AWS.",
  location: "Ananthapur, Andhra Pradesh, India",
  email: "mohammad.adeel.syed@gmail.com",
  phone: "+91 80917 79849",
  github: "https://github.com/Adeel0-0",
  linkedin: "https://www.linkedin.com/in/syed-mohammad-adeel-397b4b263/",
};

export type Stat = {
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { value: "24%", label: "API error/fallback reduction via structured testing" },
  { value: "86%", label: "mAP@0.5 — YOLO object-detection models" },
  { value: "8.14", label: "CGPA — B.Tech CSE, VIT-AP (2026)" },
];
