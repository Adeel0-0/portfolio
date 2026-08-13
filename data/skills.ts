export type SkillGroup = {
  group: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    group: "AI / ML",
    items: [
      "Embeddings & Vector Search",
      "RAG Pipelines",
      "LLM API Integration",
      "Prompt Engineering & Evaluation",
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "OpenCV",
      "YOLOv5/v7",
    ],
  },
  {
    group: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "C/C++"],
  },
  {
    group: "Backend & APIs",
    items: [
      "FastAPI",
      "Flask",
      "Node/Express",
      "REST API Design",
      "Redis Caching",
      "Celery",
      "Rate Limiting & Pagination",
    ],
  },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    group: "Databases",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
  },
  {
    group: "Cloud & DevOps",
    items: ["AWS (EC2 · S3 · Lambda)", "Docker", "Git", "GitHub Actions CI/CD", "Linux"],
  },
  {
    group: "Testing",
    items: [
      "Automated Test Suites",
      "CI-Based Testing",
      "Structured Test-Case Design",
      "Data Logging",
    ],
  },
];
