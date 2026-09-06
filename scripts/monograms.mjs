// CNE monogram exploration: six marks built as exact geometry, shown on both grounds at four sizes
// plus the lockup. Run: node scripts/monograms.mjs  ->  dist/explore/monograms.png + per-mark SVGs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const tokens = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const L = Object.fromEntries(Object.entries(tokens.color.light).map(([k, v]) => [k, v.$value]));
const D = Object.fromEntries(Object.entries(tokens.color.dark).map(([k, v]) => [k, v.$value]));
const fonts = [
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-700.ttf"), weight: 700, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-400.ttf"), weight: 400, style: "normal" },
  { name: "Red Hat Mono", data: readFileSync("fonts/static/RedHatMono-500.ttf"), weight: 500, style: "normal" },
];
const h = (type, props = {}, ...kids) => ({ type, props: { ...props, children: kids.length === 1 ? kids[0] : kids } });

// --- geometry helpers (viewBox 0 0 140 140, centre 70,70; SVG y grows downward) ---
const P = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
const fmt = (n) => Math.round(n * 100) / 100;
/** Clockwise arc from startDeg to endDeg. */
function arc(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = P(cx, cy, r, startDeg);
  const [x2, y2] = P(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${fmt(x1)} ${fmt(y1)} A ${r} ${r} 0 ${large} 1 ${fmt(x2)} ${fmt(y2)}`;
}
const stroke = (d, color, w, cap = "round") => h("path", { d, fill: "none", stroke: color, strokeWidth: w, strokeLinecap: cap });
const bar = (x, y, w, hh, color) => h("rect", { x, y, width: w, height: hh, rx: hh / 2, fill: color });

// 1. Aperture C: the initial as an open ring, a lit core at the centre.
const apertureC = (ink, lens) => [stroke(arc(70, 70, 48, 42, 318), ink, 16), h("circle", { cx: 70, cy: 70, r: 13, fill: lens })];
// 2. C-stack: the open ring holds three layers, the middle one lit.
const cStack = (ink, lens) => [
  stroke(arc(70, 70, 52, 52, 308), ink, 14),
  bar(48, 55, 44, 9, ink),
  bar(40, 65.5, 60, 9, lens),
  bar(48, 76, 44, 9, ink),
];
// 3. Nested arcs: attention narrowing to a point.
const nested = (ink, lens) => [
  stroke(arc(70, 70, 54, 46, 314), ink, 11),
  stroke(arc(70, 70, 38, 56, 304), ink, 11),
  stroke(arc(70, 70, 22, 70, 290), lens, 11),
  h("circle", { cx: 70, cy: 70, r: 6, fill: lens }),
];
// 4. Augmented ring: part of the boundary is now intelligent.
const augmented = (ink, lens) => [
  stroke(arc(70, 70, 48, 42, 230), ink, 16),
  stroke(arc(70, 70, 48, 244, 318), lens, 16),
  h("circle", { cx: 70, cy: 70, r: 13, fill: ink }),
];
// 5. CNE monoline: the three letters on one geometric grid, the E's middle bar lit.
function monoline(ink, lens) {
  const w = 10;
  const top = 48;
  const bot = 92;
  const mid = (top + bot) / 2;
  return [
    stroke(arc(28, mid, 20, 48, 312), ink, w),
    stroke(`M 60 ${bot} L 60 ${top}`, ink, w),
    stroke(`M 60 ${top} L 86 ${bot}`, ink, w),
    stroke(`M 86 ${bot} L 86 ${top}`, ink, w),
    stroke(`M 108 ${top} L 108 ${bot}`, ink, w),
    stroke(`M 108 ${top} L 130 ${top}`, ink, w),
    stroke(`M 108 ${mid} L 126 ${mid}`, lens, w),
    stroke(`M 108 ${bot} L 130 ${bot}`, ink, w),
  ];
}
// 6. Block N: the middle initial in a solid tile, its diagonal the lit signal.
const blockN = (ink, lens, ground) => [
  h("rect", { x: 12, y: 12, width: 116, height: 116, rx: 28, fill: ink }),
  stroke(`M 48 94 L 48 46`, ground, 12),
  stroke(`M 92 94 L 92 46`, ground, 12),
  stroke(`M 48 46 L 92 94`, lens, 12),
];

const MARKS = [
  {
    key: "aperture-c",
    n: 1,
    name: "Aperture C",
    fn: apertureC,
    rec: true,
    why: "The initial as an open ring with a lit core. The boundary of a system that is watching and has decided. Simplest of the six and the strongest at 16 px.",
  },
  {
    key: "c-stack",
    n: 2,
    name: "C-stack",
    fn: cStack,
    rec: true,
    why: "The open C holds three layers, the middle one lit. Says the initial and the intelligence layer in one shape. The most on-message mark here.",
  },
  {
    key: "nested",
    n: 3,
    name: "Nested arcs",
    fn: nested,
    why: "Three arcs closing inward on a core: attention narrowing to a point. Reads as intelligence, but the arcs merge below 24 px.",
  },
  {
    key: "augmented",
    n: 4,
    name: "Augmented ring",
    fn: augmented,
    rec: true,
    why: "Part of the ring is ink, part is lens. Literally an existing business with a section now intelligent. Best story, needs both colours to work.",
  },
  {
    key: "monoline",
    n: 5,
    name: "CNE monoline",
    fn: monoline,
    why: "All three letters on one grid, the E's middle bar lit so the E reads as a layer stack. Explicit, but wide, so it fails as an avatar.",
  },
  {
    key: "block-n",
    n: 6,
    name: "Block N",
    fn: blockN,
    why: "The middle initial in a solid tile, its diagonal the lit signal. Reads as an app icon in the Linear and Vercel register. Least tied to the full name.",
  },
];

const Svg = (fn, size, ink, lens, ground) => h("svg", { width: size, height: size, viewBox: "0 0 140 140" }, ...fn(ink, lens, ground));
const label = (t, c) =>
  h(
    "div",
    { style: { fontFamily: "Red Hat Mono", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: c, display: "flex" } },
    t,
  );

const cell = (m, dark) => {
  const ink = dark ? D.ink : L.ink;
  const lens = dark ? D.lens : L.lens;
  const ground = dark ? D.surface : L.surface;
  return h(
    "div",
    { style: { width: 470, background: ground, display: "flex", flexDirection: "column" } },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 26, padding: "22px 24px" } },
      Svg(m.fn, 130, ink, lens, ground),
      h(
        "div",
        { style: { display: "flex", gap: 14, alignItems: "flex-end" } },
        Svg(m.fn, 48, ink, lens, ground),
        Svg(m.fn, 24, ink, lens, ground),
        Svg(m.fn, 16, ink, lens, ground),
      ),
    ),
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 12, padding: "0 24px 22px" } },
      Svg(m.fn, 38, ink, lens, ground),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h(
          "div",
          {
            style: { fontFamily: "Hanken Grotesk", fontWeight: 700, fontSize: 26, letterSpacing: "-0.035em", color: ink, display: "flex" },
          },
          "CNE Associates",
        ),
      ),
    ),
  );
};

const row = (m) =>
  h(
    "div",
    { style: { display: "flex", gap: 20, alignItems: "stretch" } },
    h(
      "div",
      { style: { width: 120, display: "flex", flexDirection: "column", gap: 6, paddingTop: 18 } },
      h("div", { style: { fontFamily: "Red Hat Mono", fontSize: 30, color: m.rec ? "#C4A46A" : "#7C8591", display: "flex" } }, `0${m.n}`),
      h("div", { style: { fontFamily: "Hanken Grotesk", fontWeight: 700, fontSize: 17, color: D.ink, display: "flex" } }, m.name),
    ),
    cell(m, false),
    cell(m, true),
    h(
      "div",
      { style: { flex: 1, display: "flex", paddingTop: 20 } },
      h("div", { style: { fontFamily: "Hanken Grotesk", fontSize: 17, lineHeight: 1.45, color: D.ink, display: "flex" } }, m.why),
    ),
  );

const sheet = h(
  "div",
  { style: { width: 2400, height: 1900, background: "#101215", display: "flex", flexDirection: "column", padding: 44, gap: 18 } },
  h(
    "div",
    { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
    h(
      "div",
      { style: { fontFamily: "Hanken Grotesk", fontWeight: 700, fontSize: 34, letterSpacing: "-0.03em", color: D.ink, display: "flex" } },
      "CNE Associates · monogram candidates",
    ),
    label("Round 5 · name settled · exact geometry, not traces", "#7C8591"),
  ),
  ...MARKS.map(row),
);

mkdirSync("dist/explore/monograms", { recursive: true });
const svg = await satori(sheet, { width: 2400, height: 1900, fonts });
writeFileSync("dist/explore/monograms.png", new Resvg(svg, { fitTo: { mode: "width", value: 2400 } }).render().asPng());

const toSvg = (fn, ink, lens, ground) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="CNE Associates mark">\n  ${fn(
    ink,
    lens,
    ground,
  )
    .map((el) => {
      const attrs = Object.entries(el.props)
        .filter(([k]) => k !== "children")
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${v}"`)
        .join(" ");
      return `<${el.type} ${attrs}/>`;
    })
    .join("\n  ")}\n</svg>\n`;
for (const m of MARKS) {
  writeFileSync(`dist/explore/monograms/${m.key}-light.svg`, toSvg(m.fn, L.ink, L.lens, L.surface));
  writeFileSync(`dist/explore/monograms/${m.key}-dark.svg`, toSvg(m.fn, D.ink, D.lens, D.surface));
}
console.log("wrote dist/explore/monograms.png and", MARKS.length * 2, "svgs");
