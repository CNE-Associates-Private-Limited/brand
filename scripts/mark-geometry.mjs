// The single source of truth for the CNE Associates mark geometry.
//
// Decided by Anmol on 2026-09-06 and drawn here as exact geometry. Cap height 100, stroke 22.
// The C is a true semicircle on the left with 45-degree terminals that form a bracket on the right; the N's
// stem is chamfered at 45 degrees to slot into that bracket with a constant 5.7-unit gap; the N's diagonal fuses
// into the E's spine; all three E arms are cut at 45 degrees in the same direction. Soft C, hard N and E.
//
//   logo  — the CNE lettermark, wide, used wherever there is horizontal room.
//   mark  — the C alone with a lens core, square, for the favicon, avatar and app icon.
//
// Shapes are filled paths. `elements` returns satori-compatible nodes; `toSvg` returns a standalone file.
// `POLYGONS` is point data for the 3D pipeline (arcs sampled), written to dist/mark-polygons.json by marks.mjs.

const r1 = (n) => Math.round(n * 10) / 10;
const poly = (pts, dx = 0, dy = 0) => `M ${pts.map(([x, y]) => `${r1(x + dx)} ${r1(y + dy)}`).join(" L ")} Z`;
const circle = (cx, cy, r) => `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
const arcPts = (cx, cy, r, a0, a1, n) =>
  Array.from({ length: n - 1 }, (_, i) => {
    const t = ((a0 + ((a1 - a0) * (i + 1)) / n) * Math.PI) / 180;
    return [r1(cx + r * Math.cos(t)), r1(cy + r * Math.sin(t))];
  });

// --- C: semicircle centre (50,50), outer R 50, inner r 28; bars y 0..22 and 78..100; terminals cut at 45.
const cPath = (dx, dy) =>
  `M ${102 + dx} ${0 + dy} L ${50 + dx} ${0 + dy} A 50 50 0 0 0 ${50 + dx} ${100 + dy} L ${102 + dx} ${100 + dy} ` +
  `L ${80 + dx} ${78 + dy} L ${50 + dx} ${78 + dy} A 28 28 0 0 1 ${50 + dx} ${22 + dy} L ${80 + dx} ${22 + dy} Z`;
const C_PTS = [
  [102, 0],
  [50, 0],
  ...arcPts(50, 50, 50, -90, -270, 24),
  [50, 100],
  [102, 100],
  [80, 78],
  [50, 78],
  ...arcPts(50, 50, 28, 90, 270, 16),
  [50, 22],
  [80, 22],
];

// --- N and E as one outline. Stem x 88..110 with 45-degree chamfers at (88,22)->(106,4) and (88,78)->(110,100).
// Diagonal band: upper-right edge (106,4)->(159,61), lower-left edge 30 to its left, so (110,40.6)->(159,93.3).
// Spine x 159..181. Arms y 0..22 and 78..100 to x 242, terminals cut (242,0)->(220,22) and (242,78)->(220,100).
const NE = [
  [159, 0],
  [242, 0],
  [220, 22],
  [181, 22],
  [181, 78],
  [242, 78],
  [220, 100],
  [159, 100],
  [159, 93.3],
  [110, 40.6],
  [110, 100],
  [88, 78],
  [88, 22],
  [106, 4],
  [159, 61],
];
// The E's middle arm carries the accent. It crosses the spine and is 8 shorter than the other arms.
const ARM = [
  [159, 39],
  [234, 39],
  [212, 61],
  [159, 61],
];

/** Wide CNE lettermark. viewBox 0 0 262 120, letters inset by 10. */
export const LOGO = {
  viewBox: "0 0 262 120",
  width: 262,
  height: 120,
  ink: [cPath(10, 10), poly(NE, 10, 10)],
  accent: [poly(ARM, 10, 10)],
};

/** Square: the C alone with a lens core. viewBox 0 0 140 140. */
export const MARK = {
  viewBox: "0 0 140 140",
  width: 140,
  height: 140,
  ink: [cPath(19, 20)],
  // A dot, never a bar: a bar inside a C reads as a euro sign.
  accent: [circle(93, 70, 13)],
};

/** Satori-compatible children for a shape, given an element factory `h`. */
export function elements(shape, h, ink, accent) {
  return [...shape.ink.map((d) => h("path", { d, fill: ink })), ...shape.accent.map((d) => h("path", { d, fill: accent ?? ink }))];
}

/** A complete standalone SVG string for a shape. */
export function toSvg(shape, ink, accent, { label = "CNE Associates", size = null } = {}) {
  const w = size ?? shape.width;
  const h = size ? Math.round((size * shape.height) / shape.width) : shape.height;
  const paths = [...shape.ink.map((d) => ({ d, c: ink })), ...shape.accent.map((d) => ({ d, c: accent ?? ink }))]
    .map(({ d, c }) => `  <path d="${d}" fill="${c}"/>`)
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${shape.viewBox}" width="${w}" height="${h}" role="img" aria-label="${label}">\n${paths}\n</svg>\n`;
}

/** Point data on the 0..242 x 0..100 grid (arcs sampled), plus the square mark's dot. */
export const POLYGONS = { C: C_PTS, NE, ARM, MARK_C_OFFSET: [19, 20], MARK_DOT: { cx: 93, cy: 70, r: 13 } };
