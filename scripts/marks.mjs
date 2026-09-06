// Writes every mark file in marks/ from the shared geometry. Run: node scripts/marks.mjs
// marks/ is committed art, not dist: it changes only by a brand decision recorded in STATUS.md.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LOGO, MARK, POLYGONS, toSvg } from "./mark-geometry.mjs";

const tokens = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const L = Object.fromEntries(Object.entries(tokens.color.light).map(([k, v]) => [k, v.$value]));
const D = Object.fromEntries(Object.entries(tokens.color.dark).map(([k, v]) => [k, v.$value]));

const files = [
  // The wide lettermark: the primary logo.
  ["marks/logo-light.svg", LOGO, L.ink, L.lens],
  ["marks/logo-dark.svg", LOGO, D.ink, D.lens],
  ["marks/logo-mono-black.svg", LOGO, L.ink, L.ink],
  ["marks/logo-mono-white.svg", LOGO, D.ink, D.ink],
  // The square C: favicon, avatar, app icon.
  ["marks/mark-light.svg", MARK, L.ink, L.lens],
  ["marks/mark-dark.svg", MARK, D.ink, D.lens],
  ["marks/mark-mono-black.svg", MARK, L.ink, L.ink],
  ["marks/mark-mono-white.svg", MARK, D.ink, D.ink],
  ["marks/mark-accent-only.svg", MARK, L.lens, L.lens],
];

for (const [path, shape, ink, accent] of files) {
  writeFileSync(path, toSvg(shape, ink, accent));
}

// The favicon carries no accent: at 16 px a second colour only muddies it.
writeFileSync("marks/favicon.svg", toSvg(MARK, L.ink, L.ink, { label: "CNE" }));

/** Avatar: the reversed mark on a filled disc, so it holds as a circular profile picture. */
const avatar = (bg, ink, accent) => {
  const inner = toSvg(MARK, ink, accent)
    .split("\n")
    .filter((l) => l.trim().startsWith("<path"))
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="CNE Associates">\n  <circle cx="70" cy="70" r="70" fill="${bg}"/>\n${inner}\n</svg>\n`;
};
writeFileSync("marks/avatar-dark.svg", avatar(D.ground, D.ink, D.lens));
writeFileSync("marks/avatar-light.svg", avatar(L.ground, L.ink, L.lens));

// Raw points for the Blender pipeline, so render3d.py never carries its own copy of the geometry.
mkdirSync("dist", { recursive: true });
writeFileSync("dist/mark-polygons.json", `${JSON.stringify(POLYGONS, null, 2)}\n`);
console.log("wrote", files.length + 3, "mark files and dist/mark-polygons.json");
