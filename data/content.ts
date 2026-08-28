/**
 * Copy that used to live hardcoded inside the section components.
 *
 * Those components were deleted in the pre-redesign teardown, so this file is
 * the rescue: prose, labels and SEO strings that exist nowhere else. The new
 * design is free to reword or drop any of it — the point is that nothing was
 * lost in the demolition.
 */

export type SiteMeta = {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  siteName: string;
  locale: string;
};

/**
 * A heading split into a plain part and an emphasised part.
 *
 * Carried as two fields rather than as prose plus a substring to slice on.
 * The previous shape stored the full sentence and the accent word, and the
 * component recovered the halves with `heading.split(headingAccent)` — but
 * String.split *removes* the separator, so the accent came back as "" and the
 * emphasised word never rendered at all. Splitting at render time was the bug;
 * the data should already be in the shape the component needs.
 */
export type SplitHeading = {
  before: string;
  accent: string;
};

/** Feeds `metadata` in app/layout.tsx. */
export const siteMeta: SiteMeta = {
  title: "Syed Mohammad Adeel — AI/ML & Software Engineer",
  description:
    "Portfolio of Syed Mohammad Adeel: AI-powered backend systems, embeddings & vector search, RAG pipelines, computer vision, and production APIs.",
  keywords: [
    "AI Engineer",
    "ML Engineer",
    "Backend Engineer",
    "RAG",
    "Vector Search",
    "Python",
    "FastAPI",
  ],
  author: "Syed Mohammad Adeel",
  siteName: "Syed Mohammad Adeel",
  // The canonical origin is environment, not content — it differs between
  // local, preview and production, and this file cannot know which it is in.
  // It lives in lib/env.ts as SITE_URL.
  locale: "en_US",
};

export const nav: { brand: string } = {
  brand: "Adeel.",
};

/**
 * Section ids, labels, eyebrows, nav icons and mascot radio lines all live in
 * lib/sections.ts now — one ordered array consumed by the dock, the scroll
 * observer, the track map and the mascot alike. A second list of sections here
 * would be a drift bug waiting to happen, so the old `nav.links` and `sections`
 * exports are gone rather than duplicated.
 */

export const about: { availability: string } = {
  availability: "Open to opportunities",
};

export type ContactContent = {
  heading: SplitHeading;
  body: string;
};

export const contact: ContactContent = {
  // Note the trailing space on `before`: the two halves are concatenated
  // directly, so the gap has to live in the data.
  heading: {
    before: "Let's build something ",
    accent: "intelligent.",
  },
  body: "Open to AI/ML Engineer and Software Engineer roles. If you're shipping AI-powered products, I'd like to hear about it.",
};

export type FooterContent = {
  copyright: (year?: number) => string;
  builtWith: string;
};

export const footer: FooterContent = {
  copyright: (year: number = new Date().getFullYear()) =>
    `© ${year} Syed Mohammad Adeel`,
  builtWith: "Built with Next.js · Tailwind · Framer Motion",
};
