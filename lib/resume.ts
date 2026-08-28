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
 * Server-only: importing this into a client component will fail to bundle.
 */

export const RESUME_HREF = "/resume.pdf";

export const hasResume = fs.existsSync(
  path.join(process.cwd(), "public", "resume.pdf")
);
