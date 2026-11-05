/**
 * Every skill the portfolio may name. src/lib/content-schema.ts validates
 * project and credential skills against this list, so add a skill here before
 * using it in content.
 *
 * Grades are named after tyre compounds. The current site does not show them:
 *
 *   soft   — daily driver. Current, deep, and evidenced in the projects.
 *   medium — regular use. Solid, reached for often.
 *   hard   — foundational. Real, but occasional or further back.
 *
 * Grades below are a first pass inferred from the resume and the three
 * projects. They are meant to be corrected — nobody knows this but you.
 */

export type SkillGrade = "soft" | "medium" | "hard";

export type SkillItem = {
  name: string;
  grade: SkillGrade;
};

export type SkillGroup = {
  group: string;
  items: SkillItem[];
};

/**
 * `as const satisfies` rather than a `SkillGroup[]` annotation. The annotation
 * would widen every name to `string`; this keeps the literals so `SkillName`
 * below can be derived from them, while `satisfies` still checks the shape.
 */
export const skills = [
  {
    group: "AI / ML",
    items: [
      { name: "Embeddings & Vector Search", grade: "soft" },
      { name: "RAG Pipelines", grade: "soft" },
      { name: "LLM API Integration", grade: "soft" },
      { name: "YOLOv5/v7", grade: "soft" },
      { name: "Prompt Engineering & Evaluation", grade: "medium" },
      { name: "PyTorch", grade: "medium" },
      { name: "OpenCV", grade: "medium" },
      { name: "TensorFlow", grade: "hard" },
      { name: "scikit-learn", grade: "hard" },
    ],
  },
  {
    group: "Languages",
    items: [
      { name: "Python", grade: "soft" },
      { name: "TypeScript", grade: "medium" },
      { name: "JavaScript", grade: "medium" },
      { name: "SQL", grade: "medium" },
      { name: "C/C++", grade: "medium" },
      { name: "Java", grade: "hard" },
    ],
  },
  {
    group: "Backend & APIs",
    items: [
      { name: "FastAPI", grade: "soft" },
      { name: "REST API Design", grade: "soft" },
      { name: "Flask", grade: "medium" },
      { name: "Redis Caching", grade: "medium" },
      { name: "Celery", grade: "medium" },
      { name: "Rate Limiting & Pagination", grade: "medium" },
      { name: "Node/Express", grade: "hard" },
    ],
  },
  {
    group: "Frontend",
    items: [
      { name: "React", grade: "medium" },
      { name: "Next.js", grade: "medium" },
      { name: "Tailwind CSS", grade: "medium" },
    ],
  },
  {
    group: "Databases",
    items: [
      { name: "PostgreSQL", grade: "medium" },
      { name: "Redis", grade: "medium" },
      { name: "MySQL", grade: "hard" },
      { name: "MongoDB", grade: "hard" },
    ],
  },
  {
    group: "Cloud & DevOps",
    items: [
      { name: "Git", grade: "soft" },
      { name: "AWS (EC2 · S3 · Lambda)", grade: "medium" },
      { name: "Docker", grade: "medium" },
      { name: "GitHub Actions CI/CD", grade: "medium" },
      { name: "Linux", grade: "medium" },
    ],
  },
  {
    group: "Testing",
    items: [
      { name: "Automated Test Suites", grade: "medium" },
      { name: "CI-Based Testing", grade: "medium" },
      { name: "Structured Test-Case Design", grade: "medium" },
      { name: "Data Logging", grade: "hard" },
    ],
  },
] as const satisfies readonly SkillGroup[];

/**
 * Every skill name that exists, as a union.
 *
 * src/data/site.ts types capability skills with it, so a typo there is a
 * compile error rather than a filter link that matches nothing.
 */
export type SkillName = (typeof skills)[number]["items"][number]["name"];

export const GRADE_LABEL: Record<SkillGrade, string> = {
  soft: "Daily",
  medium: "Regular",
  hard: "Foundational",
};
