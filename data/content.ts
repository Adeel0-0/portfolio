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
  url: "https://adeel-portfolio.vercel.app",
  locale: "en_US",
};

export const nav = {
  brand: "Adeel.",
  links: [
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#education", label: "Education" },
    { href: "#contact", label: "Contact" },
  ],
};

/**
 * The old layout numbered its sections 01–04. Kept for reference; a new design
 * that doesn't number its sections can ignore `index`.
 */
export const sections = {
  about: { eyebrow: "// About Me" },
  projects: { index: "01", title: "Projects" },
  skills: { index: "02", title: "Skills" },
  education: { index: "03", title: "Education", asideLabel: "Certifications & Activities" },
  contact: { index: "04", title: "Contact" },
};

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
  /** Stale on purpose — preserved verbatim. Three.js and shadcn/ui are both
   *  gone as of the teardown, so update this once the new stack is settled. */
  builtWith: "Built with Next.js · Three.js · shadcn/ui",
};
