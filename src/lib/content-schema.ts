import { z } from "zod";
import { skills } from "../../data/skills";

const text = z.string().trim().min(1);
const knownSkills = new Set<string>(
  skills.flatMap((group) => group.items.map((item) => item.name)),
);
const skill = text.refine(
  (value) => knownSkills.has(value),
  "Unknown skill; add it to data/skills.ts first",
);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Use a real calendar date in YYYY-MM-DD format");
const webUrl = z.url({protocol: /^https?$/});
const localAsset = z
  .string()
  .regex(/^\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif|pdf)$/)
  .refine((value) => !value.includes("..") && !value.startsWith("//"));
const image = localAsset.refine(
  (value) => !value.endsWith(".pdf"),
  "Project media must be an image",
);
/** An 11-character YouTube video id, e.g. the part after `v=` in a watch URL. */
const youtubeId = z
  .string()
  .regex(/^[A-Za-z0-9_-]{11}$/, "Use the 11-character YouTube video id");
const galleryItem = z.discriminatedUnion("type", [
  z
    .object({ type: z.literal("image"), src: image, alt: text, caption: text.optional() })
    .strict(),
  z
    .object({
      type: z.literal("youtube"),
      id: youtubeId,
      title: text,
      caption: text.optional(),
      start: z.number().int().nonnegative().optional(),
    })
    .strict(),
]);
const metric = z
  .object({
    value: text,
    label: text,
    method: text,
    measuredAt: date,
    evidence: z.union([webUrl, localAsset]),
  })
  .strict();

export const projectSchema = z
  .object({
    title: text,
    summary: text,
    description: z.tuple([text, text]),
    role: text,
    status: z.enum(["in-progress", "completed", "archived"]),
    category: text,
    skills: z.array(skill).min(1),
    startedAt: date.optional(),
    completedAt: date.optional(),
    updatedAt: date,
    draft: z.boolean().default(true),
    featuredOrder: z.number().int().positive().optional(),
    repositoryUrl: webUrl.optional(),
    liveUrl: webUrl.optional(),
    videoUrl: webUrl.optional(),
    legacyId: z.enum(["project-01", "project-02", "project-03"]).optional(),
    visual: z.enum(["search", "vision", "control"]).default("search"),
    diagram: z.array(text).min(2).max(8),
    media: z
      .object({ src: image, alt: text })
      .optional(),
    /** Screenshots and YouTube videos shown on the case study, in order. */
    gallery: z.array(galleryItem).max(12).default([]),
    metrics: z.array(metric).default([]),
  })
  .strict()
  .refine(
    (p) => !p.startedAt || !p.completedAt || p.completedAt >= p.startedAt,
    "Completion cannot precede start",
  );

export const credentialSchema = z
  .object({
    title: text,
    issuer: text,
    kind: z.enum(["certification", "course-completion", "badge"]),
    issuedAt: date.optional(),
    expiresAt: date.optional(),
    credentialId: text.optional(),
    verificationUrl: webUrl.optional(),
    asset: localAsset.optional(),
    skills: z.array(skill),
    draft: z.boolean().default(true),
    relatedProjects: z.array(text).default([]),
  })
  .strict()
  .superRefine((credential, ctx) => {
    if (!credential.draft && !credential.issuedAt)
      ctx.addIssue({
        code: "custom",
        path: ["issuedAt"],
        message: "A published credential requires its real issue date",
      });
    if (
      credential.issuedAt &&
      credential.expiresAt &&
      credential.expiresAt < credential.issuedAt
    )
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiry cannot precede issue date",
      });
  });
