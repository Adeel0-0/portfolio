/**
 * Copy that used to live hardcoded inside the section components.
 *
 * Those components were deleted in the pre-redesign teardown, so this file is
 * the rescue: prose, labels and SEO strings that exist nowhere else. The new
 * design is free to reword or drop any of it — the point is that nothing was
 * lost in the demolition.
 */

/** Feeds `metadata` in app/layout.tsx. */
export const siteMeta = {
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

export const nav = {
  brand: "Adeel.",
};

/**
 * Section ids, labels, eyebrows, nav icons and mascot radio lines all live in
 * lib/sections.ts now — one ordered array consumed by the dock, the scroll
 * observer, the track map and the mascot alike. A second list of sections here
 * would be a drift bug waiting to happen, so the old `nav.links` and `sections`
 * exports are gone rather than duplicated.
 */

export const about = {
  availability: "Open to opportunities",
};

export const contact = {
  heading: "Let's build something intelligent.",
  /** The word given emphasis inside `heading` in the old design. */
  headingAccent: "intelligent.",
  body: "Open to AI/ML Engineer and Software Engineer roles. If you're shipping AI-powered products, I'd like to hear about it.",
};

export const footer = {
  copyright: (year: number = new Date().getFullYear()) =>
    `© ${year} Syed Mohammad Adeel`,
  builtWith: "Built with Next.js · Tailwind · Framer Motion",
};
