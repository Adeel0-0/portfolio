/**
 * Projects, shaped for the timing tower and the telemetry panel.
 *
 * `description` is a two-element contract, not a free-form list: [0] is what
 * the project IS, [1] is how it WORKS. The Projects section labels them
 * "ABOUT" and "HOW IT WORKS" and renders nothing else, so keep it to two.
 */

/**
 * What slams in beside the text.
 *
 * `telemetry` is the default and needs no assets — the panel is drawn from the
 * project's own `flow`, `stack` and `metric`. Dropping a real screenshot or
 * screen recording in later is a one-line change here and nothing else:
 * components/sections/projects/project-media.tsx switches on `kind`.
 */
export type ProjectMedia =
  | { kind: "telemetry" }
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string };

export type ProjectMetric = {
  /** Short form for the tower's delta column: "86%", "−24%". */
  value: string;
  /** Expanded in the panel: "mAP@0.5". */
  label: string;
  /** Renders in timing purple. Reserved for a genuine personal best. */
  best?: boolean;
};

export type Project = {
  index: string;
  title: string;
  subtitle: string;
  /** [0] = what it is. [1] = how it works. */
  description: string[];
  stack: string[];
  /**
   * Architecture nodes for the telemetry panel's flow diagram. Kept separate
   * from `stack` because the diagram is about data movement, not tooling.
   */
  flow?: string[];
  /**
   * Names matching `SkillItem.name` in data/skills.ts. Drives the attention
   * connectors and pre-highlights the matching chips in the Garage section.
   */
  skills?: string[];
  /** Absent means no time set — the tower renders an em dash, like a DNF. */
  metric?: ProjectMetric;
  media?: ProjectMedia;
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
    flow: ["query", "parse", "GitHub API", "embed", "rank", "results"],
    skills: [
      "Python",
      "FastAPI",
      "Embeddings & Vector Search",
      "Redis Caching",
      "GitHub Actions CI/CD",
      "REST API Design",
      "Rate Limiting & Pagination",
    ],
    metric: { value: "−24%", label: "response errors / fallbacks" },
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
    flow: ["aerial imagery", "YOLO", "Celery queue", "S3", "PostgreSQL"],
    skills: [
      "YOLOv5/v7",
      "OpenCV",
      "Flask",
      "Celery",
      "PostgreSQL",
      "AWS (EC2 · S3 · Lambda)",
      "Python",
    ],
    metric: { value: "86%", label: "mAP@0.5", best: true },
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
    flow: ["sensors", "PID loop", "actuators", "UART", "ground station"],
    skills: ["C/C++", "Python", "Automated Test Suites", "Data Logging"],
    // No metric by design. This one shipped as firmware, not as a benchmark —
    // the tower shows an em dash rather than inventing a number.
  },
];
