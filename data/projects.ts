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
