/* Rasterize the OG SVG to a 1200×630 PNG using sharp (already
   available via Astro's image deps). Run: node scripts/make-og.mjs */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svg = readFileSync(resolve(root, "public/og-image.svg"));

await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: "fill" })
  .png()
  .toFile(resolve(root, "public/og-image.png"));

console.log("Wrote public/og-image.png");
