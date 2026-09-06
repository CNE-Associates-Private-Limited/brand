// Generates the favicon and app-icon set from marks/favicon.svg and marks/avatar-dark.svg.
// Run: pnpm build:icons  (needs ImageMagick `magick` on PATH for the .ico)

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "dist/icons/";
mkdirSync(OUT, { recursive: true });

const favicon = readFileSync("marks/favicon.svg");
const appIcon = readFileSync("marks/avatar-dark.svg");

for (const size of [16, 32, 48]) {
  await sharp(favicon, { density: 600 }).resize(size, size).png().toFile(`${OUT}favicon-${size}.png`);
}
for (const size of [180, 192, 512]) {
  await sharp(appIcon, { density: 600 }).resize(size, size).png().toFile(`${OUT}icon-${size}.png`);
}
await sharp(appIcon, { density: 600 }).resize(180, 180).png().toFile(`${OUT}apple-touch-icon.png`);
writeFileSync(`${OUT}favicon.svg`, favicon);

try {
  execFileSync("magick", [`${OUT}favicon-16.png`, `${OUT}favicon-32.png`, `${OUT}favicon-48.png`, `${OUT}favicon.ico`]);
  console.log("wrote favicon.ico");
} catch {
  console.warn("magick not found: favicon.ico skipped (PNG and SVG favicons still written)");
}

writeFileSync(
  `${OUT}site.webmanifest`,
  JSON.stringify(
    {
      name: "CNE Associates",
      short_name: "CNE",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#0E1116",
      background_color: "#F4F5F7",
      display: "standalone",
    },
    null,
    2,
  ),
);
console.log("icons built ->", OUT);
