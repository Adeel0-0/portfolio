# Legacy content inventory

Recorded 2026-10-24, before the retained Next.js app was deleted. Source: tag `legacy-next-final` (`6da43246`).

This file lists portfolio content that the old app held and the current site does not show, so nothing is lost with the deleted files. **None of it is verified.** The owner must confirm each claim before it returns to the site. A number goes back only together with how it was measured (see `docs/content-authoring.md`).

Restore any original file with `git checkout legacy-next-final -- <path>`.

## Project descriptions and metrics (`data/projects.ts`)

The current case studies in `src/content/projects/` are less specific than these descriptions. The technologies and numbers below appear nowhere on the current site.

### SEFGH

- Subtitle: "AI-Powered GitHub Search Engine"
- "AI search service that translates natural-language queries into optimized GitHub search expressions, integrating the GitHub REST API with rate limiting, Redis caching, and server-side pagination."
- "Semantic result ranking with embeddings and vector search; structured logging and a CI test suite (GitHub Actions) covering query parsing, ranking, and API fallbacks."
- Stack: Python, FastAPI, Embeddings, Vector Search, Redis, GitHub Actions
- Flow: query → parse → GitHub API → embed → rank → results
- Skills: Python, FastAPI, Embeddings & Vector Search, Redis Caching, GitHub Actions CI/CD, REST API Design, Rate Limiting & Pagination
- Metric: **−24%** response errors / fallbacks. Method, baseline and date are not recorded.

### Palm-tree detection

- Subtitle: "Scalable Computer-Vision Service"
- "Trained and compared YOLOv5/YOLOv7 object-detection models on aerial imagery, served via a Flask REST API."
- "Asynchronous batch processing with Celery for large image sets; PostgreSQL schema and ingestion pipeline with Amazon S3 image storage for an end-to-end scalable pipeline."
- Stack: YOLOv5/v7, OpenCV, Flask, Celery, PostgreSQL, AWS S3
- Flow: aerial imagery → YOLO → Celery queue → S3 → PostgreSQL
- Skills: YOLOv5/v7, OpenCV, Flask, Celery, PostgreSQL, AWS (EC2 · S3 · Lambda), Python
- Metric: **86% mAP@0.5**. Dataset, split and model variant are not recorded.

### Autonomous tiny drone

- Subtitle: "Flight Controller & Test Harness"
- "Embedded C/C++ firmware implementing PID control loops for autonomous flight stabilization with timing-critical sensor integration."
- "Python telemetry ground station over serial (UART) with live monitoring, plus automated test scripts validating stabilization and sensor readings across flight scenarios."
- Stack: Embedded C/C++, Arduino/ESP32, Python, UART, PID Control
- No metric. The original comment said it "shipped as firmware, not as a benchmark".

## Site copy and metadata (`data/content.ts`)

- Title: "Syed Mohammad Adeel — AI/ML & Software Engineer"
- Description: "Portfolio of Syed Mohammad Adeel: AI-powered backend systems, embeddings & vector search, RAG pipelines, computer vision, and production APIs."
- Keywords: AI Engineer, ML Engineer, Backend Engineer, RAG, Vector Search, Python, FastAPI
- Availability: "Open to opportunities"
- Contact heading: "Let's build something intelligent."
- Contact body: "Open to AI/ML Engineer and Software Engineer roles. If you're shipping AI-powered products, I'd like to hear about it."
- Footer: "© {year} Syed Mohammad Adeel"

## Education and certifications (`data/education.ts`, moved to `src/data/education.ts`)

The file is kept, but the site does not render these:

- GPA: "CGPA 8.14 / 10"
- Certification strings, since replaced by the typed credentials collection:
  - "NVIDIA Deep Learning Institute — Fundamentals of Deep Learning". Exists as a draft in `src/content/certifications/`.
  - "Open-source contributor to AI/ML projects"
  - "Regular hackathon participant in college tech communities"

## Profile fields not rendered (`data/profile.ts`, moved to `src/data/profile.ts`)

These stay in the moved file; nothing on the site renders them:

- `tagline`: "I build and ship AI-powered backend systems — embeddings, vector search, RAG pipelines, and production APIs."
- `summary`: mentions "computer-vision model training (YOLO, 86% mAP@0.5)" and "CI-tested deployments on AWS"
- `toolbelt`: Python, FastAPI, PyTorch, Redis, PostgreSQL, AWS, Docker, Next.js
- `stats`: "24%" API error/fallback reduction; "86%" mAP@0.5; "8.14" CGPA
- `phone`

## Skills (`data/skills.ts`, moved to `src/data/skills.ts`)

The full grouped list with its three grades (Daily / Regular / Foundational) is kept and still validates content. The site only shows skills attached to projects or capabilities. There is no skills overview.

## Other legacy interface copy

The following copy is recoverable from the tag but is not reproduced here, because it belongs to the F1 "Telemetry" design rather than to portfolio facts:

- Section eyebrows and mascot radio lines: `lib/sections.ts`
- Terminal command output: `lib/terminal/commands.ts`
- The hero, about, garage and contact wording inside `components/`

## Owner checklist

For each claim, mark whether it can be backed up: by a public repository, a measurement with method and date, or a document.

- [ ] −24% response errors / fallbacks (SEFGH)
- [ ] 86% mAP@0.5 (palm-tree detection)
- [ ] FastAPI, Redis caching, rate limiting and pagination in SEFGH
- [ ] Celery, PostgreSQL ingestion and S3 storage in palm-tree detection
- [ ] Arduino/ESP32 and automated flight-scenario test scripts (drone)
- [ ] CGPA 8.14 / 10
- [ ] Open-source contribution and hackathon participation
