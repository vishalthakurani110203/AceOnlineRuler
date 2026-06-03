/* Generates /sitemap.xml automatically from the pages in
   src/pages. Adding or removing a page updates the sitemap on
   the next build — no manual editing needed. Error pages and
   non-HTML endpoints are excluded. */
import type { APIRoute } from "astro";
import { SITE } from "../config";

// Enumerate every .astro page at build time (keys only).
const pageModules = import.meta.glob("./**/*.astro");

const EXCLUDE = new Set(["404", "403", "500", "503"]);

/** Map a glob key like "./cm-ruler.astro" to a site route "/cm-ruler/". */
function toRoute(filePath: string): string | null {
  const slug = filePath.replace(/^\.\//, "").replace(/\.astro$/, "");
  if (EXCLUDE.has(slug)) return null;
  if (slug === "index") return "/";
  return `/${slug}/`;
}

/** Per-route priority + change frequency hints. */
function meta(route: string): { priority: string; changefreq: string } {
  if (route === "/") return { priority: "1.0", changefreq: "weekly" };
  if (
    [
      "/cm-ruler/",
      "/inch-ruler/",
      "/mm-ruler/",
      "/converter/",
      "/size-visualizer/",
      "/compare-sizes/",
      "/calibrate/",
      "/ppi-calculator/",
      "/print/",
    ].includes(route)
  ) {
    return { priority: "0.9", changefreq: "weekly" };
  }
  if (["/features/", "/how-to-use/", "/faq/"].includes(route)) {
    return { priority: "0.7", changefreq: "monthly" };
  }
  // about, contact, privacy, terms, and anything else
  return { priority: "0.4", changefreq: "yearly" };
}

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().split("T")[0];

  const routes = Object.keys(pageModules)
    .map(toRoute)
    .filter((r): r is string => r !== null)
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

  const urls = routes
    .map((route) => {
      const { priority, changefreq } = meta(route);
      const loc = `${SITE.url}${route}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
