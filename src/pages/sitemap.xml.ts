import type { APIRoute } from "astro";
import { getPublishedProjects } from "../lib/content";
export const GET: APIRoute = async ({ site }) => {
  const paths = [
    "/",
    "/projects/",
    "/about/",
    "/certifications/",
    ...(await getPublishedProjects()).map(
      (project) => `/projects/${project.id}/`,
    ),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${new URL(path, site).href.replaceAll("&", "&amp;")}</loc></url>`).join("")}</urlset>`,
    { headers: { "content-type": "application/xml" } },
  );
};
