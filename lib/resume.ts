import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * The resume, if there is one.
 *
 * Drop a file at `public/resume.pdf` and every link to it appears; remove it
 * and they all disappear. That beats a hardcoded link that silently 404s on a
 * job-hunt site — a recruiter clicking "Resume" and landing on an error page is
 * worse than never showing the button.
 *
 * Checked with fs rather than fetched, so this resolves at build time. A resume
 * added after a build needs a rebuild, which is what deploying does anyway.
 *
 * Server-only, and now enforced rather than assumed. Without the `server-only`
 * import above, a client component importing this failed incidentally — a
 * webpack polyfill error about `node:fs` — instead of saying what was wrong.
 */

export const RESUME_HREF = "/resume.pdf";

export const hasResume = fs.existsSync(
  path.join(process.cwd(), "public", "resume.pdf")
);
