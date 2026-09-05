// Renders the wordmark, lockups, avatars, LinkedIn banner and default OG image from code.
// Deterministic: same tokens + same fonts = same pixels. Run: pnpm build:assets

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";

async function dataUri(path, width) {
  if (!existsSync(path)) return null;
  const buf = await sharp(path).trim().resize({ width, withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}
const front3d = await dataUri("dist/3d/aperture-3d-front.png", 900);
const hero3d = await dataUri("dist/3d/aperture-3d-hero.png", 1000);
const tilt3d = await dataUri("dist/3d/aperture-3d-tilt.png", 900);
const Img = (src, w, hgt, extra = {}) => h("img", { src, width: w, height: hgt, style: { width: w, height: hgt, ...extra } });

const tokens = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const L = Object.fromEntries(Object.entries(tokens.color.light).map(([k, v]) => [k, v.$value]));
const D = Object.fromEntries(Object.entries(tokens.color.dark).map(([k, v]) => [k, v.$value]));

const fonts = [
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-700.ttf"), weight: 700, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-600.ttf"), weight: 600, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-400.ttf"), weight: 400, style: "normal" },
  { name: "Red Hat Mono", data: readFileSync("fonts/static/RedHatMono-500.ttf"), weight: 500, style: "normal" },
];

const h = (type, props = {}, ...children) => ({ type, props: { ...props, children: children.length === 1 ? children[0] : children } });

// The aperture mark as a satori-compatible SVG element.
const Mark = ({ size, ring, slit }) =>
  h(
    "svg",
    { width: size, height: size, viewBox: "0 0 140 140" },
    h("circle", { cx: 70, cy: 70, r: 56, fill: "none", stroke: ring, strokeWidth: 12 }),
    h("rect", { x: 34, y: 61, width: 72, height: 18, rx: 9, fill: slit }),
  );

const Wordmark = ({ size, color }) =>
  h(
    "div",
    {
      style: {
        fontFamily: "Hanken Grotesk",
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.035em",
        color,
        lineHeight: 1,
        display: "flex",
      },
    },
    "Lenswright",
  );

const Byline = ({ size, color }) =>
  h(
    "div",
    {
      style: {
        fontFamily: "Red Hat Mono",
        fontWeight: 500,
        fontSize: size,
        letterSpacing: "0.1em",
        color,
        textTransform: "uppercase",
        display: "flex",
      },
    },
    "by CNE Associates",
  );

async function svg(el, width, height) {
  return satori(el, { width, height, fonts });
}
function png(svgStr, width) {
  const r = new Resvg(svgStr, { fitTo: { mode: "width", value: width } });
  return r.render().asPng();
}
async function out(name, el, width, height, { alsoPng = false, pngWidth = width } = {}) {
  const s = await svg(el, width, height);
  writeFileSync(`${name}.svg`, s);
  if (alsoPng) writeFileSync(`${name}.png`, png(s, pngWidth));
  console.log("wrote", `${name}${alsoPng ? " .svg .png" : " .svg"}`);
}

mkdirSync("dist/wordmark", { recursive: true });
mkdirSync("dist/social", { recursive: true });

// Wordmark and lockups, light and dark, as SVG with glyphs as paths (no font dependency for consumers).
for (const [theme, T] of [
  ["light", L],
  ["dark", D],
]) {
  const bg = theme === "light" ? "transparent" : "transparent";
  await out(
    `dist/wordmark/wordmark-${theme}`,
    h("div", { style: { display: "flex", padding: 8, background: bg } }, Wordmark({ size: 96, color: T.ink })),
    560,
    120,
  );
  await out(
    `dist/wordmark/lockup-horizontal-${theme}`,
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 22, padding: 12 } },
      Mark({ size: 96, ring: T.ink, slit: T.lens }),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        Wordmark({ size: 72, color: T.ink }),
        Byline({ size: 15, color: T.muted }),
      ),
    ),
    560,
    140,
  );
  await out(
    `dist/wordmark/lockup-stacked-${theme}`,
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 16 } },
      Mark({ size: 120, ring: T.ink, slit: T.lens }),
      Wordmark({ size: 56, color: T.ink }),
      Byline({ size: 13, color: T.muted }),
    ),
    360,
    300,
  );
}

// Avatars: dark disc with reversed mark (primary), light variant.
await out(
  "dist/social/avatar-dark",
  h(
    "div",
    { style: { width: 500, height: 500, display: "flex", alignItems: "center", justifyContent: "center", background: D.ground } },
    Mark({ size: 300, ring: D.ink, slit: D.lens }),
  ),
  500,
  500,
  { alsoPng: true },
);
await out(
  "dist/social/avatar-light",
  h(
    "div",
    { style: { width: 500, height: 500, display: "flex", alignItems: "center", justifyContent: "center", background: L.ground } },
    Mark({ size: 300, ring: L.ink, slit: L.lens }),
  ),
  500,
  500,
  { alsoPng: true },
);

// LinkedIn banner 1584x396.
await out(
  "dist/social/linkedin-banner",
  h(
    "div",
    {
      style: {
        width: 1584,
        height: 396,
        display: "flex",
        background: D.ground,
        padding: "56px 72px",
        justifyContent: "space-between",
        alignItems: "center",
      },
    },
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 22, maxWidth: 1000 } },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 16 } },
        Mark({ size: 44, ring: D.ink, slit: D.lens }),
        Wordmark({ size: 34, color: D.ink }),
      ),
      h(
        "div",
        {
          style: {
            fontFamily: "Hanken Grotesk",
            fontWeight: 600,
            fontSize: 54,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: D.ink,
            display: "flex",
          },
        },
        "Put an intelligence layer into your business.",
      ),
      h(
        "div",
        {
          style: {
            fontFamily: "Red Hat Mono",
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: "0.08em",
            color: D.muted,
            textTransform: "uppercase",
            display: "flex",
          },
        },
        "Any domain, any stage · by CNE Associates",
      ),
    ),
    hero3d ? Img(hero3d, 460, 460, { marginRight: -60 }) : Mark({ size: 260, ring: "#1D222B", slit: D.lens }),
  ),
  1584,
  396,
  { alsoPng: true },
);

// Default OG image 1200x630 (the website generates per-page variants with the same layout).
await out(
  "dist/social/og-default",
  h(
    "div",
    {
      style: {
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: L.ground,
        padding: 64,
      },
    },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 14 } },
      Mark({ size: 40, ring: L.ink, slit: L.lens }),
      Wordmark({ size: 30, color: L.ink }),
    ),
    h(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 } },
      h(
        "div",
        {
          style: {
            fontFamily: "Hanken Grotesk",
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: "-0.035em",
            lineHeight: 1.02,
            color: L.ink,
            display: "flex",
            maxWidth: 720,
          },
        },
        "Put an intelligence layer into your business.",
      ),
      tilt3d ? Img(tilt3d, 300, 300) : Mark({ size: 220, ring: L.ink, slit: L.lens }),
    ),
    h(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" } },
      h(
        "div",
        { style: { fontFamily: "Hanken Grotesk", fontWeight: 400, fontSize: 24, color: L["ink-2"], display: "flex" } },
        "Any domain, any stage. Evals and a cost ceiling in every contract.",
      ),
      Byline({ size: 14, color: L.muted }),
    ),
  ),
  1200,
  630,
  { alsoPng: true },
);
