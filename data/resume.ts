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
  // TODO: replace with your real profile URLs
  github: "https://github.com/Adeel0-0",
  linkedin: "https://www.linkedin.com/in/syed-mohammad-adeel-397b4b263/",
};

export const stats = [
  { value: "24%", label: "API error/fallback reduction via structured testing" },
  { value: "86%", label: "mAP@0.5 — YOLO object-detection models" },
  { value: "8.14", label: "CGPA — B.Tech CSE, VIT-AP (2026)" },
];

export type Project = {
  index: string;
  title: string;
  subtitle: string;
  description: string[];
  stack: string[];
  metric?: string;
};

export const projects: Project[] = [
  {
    index: "01",
    title: "SEFGH",
    subtitle: "AI-Powered GitHub Search Engine",
    description: [
      "AI search service that translates natural-language queries into optimized GitHub search expressions, integrating the GitHub REST API with rate limiting, Redis caching, and server-side pagination.",
      "Semantic result ranking with embeddings and vector search; structured logging and a CI test suite (GitHub Actions) covering query parsing, ranking, and API fallbacks.",
    ],
    stack: ["Python", "FastAPI", "Embeddings", "Vector Search", "Redis", "GitHub Actions"],
    metric: "−24% response errors/fallbacks",
  },
  {
    index: "02",
    title: "Palm-Tree Detection",
    subtitle: "Scalable Computer-Vision Service",
    description: [
      "Trained and compared YOLOv5/YOLOv7 object-detection models on aerial imagery, served via a Flask REST API.",
      "Asynchronous batch processing with Celery for large image sets; PostgreSQL schema and ingestion pipeline with Amazon S3 image storage for an end-to-end scalable pipeline.",
    ],
    stack: ["YOLOv5/v7", "OpenCV", "Flask", "Celery", "PostgreSQL", "AWS S3"],
    metric: "86% mAP@0.5",
  },
  {
    index: "03",
    title: "Autonomous Tiny Drone",
    subtitle: "Flight Controller & Test Harness",
    description: [
      "Embedded C/C++ firmware implementing PID control loops for autonomous flight stabilization with timing-critical sensor integration.",
      "Python telemetry ground station over serial (UART) with live monitoring, plus automated test scripts validating stabilization and sensor readings across flight scenarios.",
    ],
    stack: ["Embedded C/C++", "Arduino/ESP32", "Python", "UART", "PID Control"],
  },
];

export const skills: { group: string; items: string[] }[] = [
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

export const education = {
  school: "Vellore Institute of Technology — AP",
  degree: "B.Tech, Computer Science and Engineering",
  period: "2022 — 2026",
  gpa: "CGPA 8.14 / 10",
};

export const certifications = [
  "NVIDIA Deep Learning Institute — Fundamentals of Deep Learning",
  "Open-source contributor to AI/ML projects",
  "Regular hackathon participant in college tech communities",
];
