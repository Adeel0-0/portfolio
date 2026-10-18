import { profile } from "../../data/profile";

export const person = {
  ...profile,
  displayName: "Mohammad Adeel",
  headline: "Engineering useful intelligence.",
  introduction:
    "I build AI systems, thoughtful APIs, and the software that connects them. From finding the right repository to making sense of aerial imagery.",
  bio: "I’m a Computer Science graduate from VIT-AP, based in Hyderabad. My work sits between applied machine learning and software engineering. I enjoy turning an interesting model into a system someone can actually use.",
};

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
];
