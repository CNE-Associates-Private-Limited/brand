// The single source of truth for the CNE Associates mark geometry.
//
// Heavy, solid, cut letterforms. Cap height 100, stem 26. Every outer corner and every terminal is cut at
// 45 degrees, and the N and E share one stem so the mark reads as one built object rather than three letters.
//
//   logo  — the CNE lettermark, wide, used wherever there is horizontal room.
//   mark  — the chamfered C alone with a lens core, square, for the favicon, avatar and app icon.
//
// Shapes are filled polygons. `elements` returns satori-compatible nodes; `toSvg` returns a standalone file.
// `POLYGONS` is the raw point data for the 3D pipeline (written to dist/mark-polygons.json by marks.mjs).

const poly = (pts, dx = 0, dy = 0) => `M ${pts.map(([x, y]) => `${x + dx} ${y + dy}`).join(" L ")} Z`;
const circle = (cx, cy, r) => `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;

// Letterforms on the 0..320 x 0..100 grid.
const C = [
  [78, 0],
  [24, 0],
  [0, 24],
  [0, 76],
  [24, 100],
  [78, 100],
  [104, 74],
  [35, 74],
  [26, 65],
  [26, 35],
  [35, 26],
  [104, 26],
];
// N and E as one outline: the N's right stem is the E's spine. Traced clockwise; the two notches are the N's
// counters. The diagonal (124,0)->(226,100) meets the spine at y 60.6 and the stem at y 39.4.
const NE = [
  [124, 0],
  [160, 0],
  [200, 60.6],
  [200, 0],
  [294, 0],
  [320, 26],
  [226, 26],
  [226, 74],
  [320, 74],
  [294, 100],
  [190, 100],
  [150, 39.4],
  [150, 100],
  [138, 100],
  [124, 86],
];
// The E's middle arm carries the accent: the layer, inside the letter.
const ARM = [
  [200, 37],
  [274, 37],
  [300, 63],
  [200, 63],
];

/** Wide CNE lettermark. viewBox 0 0 340 120, letters inset by 10. */
export const LOGO = {
  viewBox: "0 0 340 120",
  width: 340,
  height: 120,
  ink: [poly(C, 10, 10), poly(NE, 10, 10)],
  accent: [poly(ARM, 10, 10)],
};

/** Square: the heavy C with a lens core. viewBox 0 0 140 140. */
export const MARK = {
  viewBox: "0 0 140 140",
  width: 140,
  height: 140,
  ink: [poly(C, 18, 20)],
  // A dot, never a bar: a bar inside a C reads as a euro sign.
  accent: [circle(90, 70, 13)],
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

/** Raw polygons on the 0..320 x 0..100 grid, plus the square mark's dot. */
export const POLYGONS = { C, NE, ARM, MARK_C_OFFSET: [18, 20], MARK_DOT: { cx: 90, cy: 70, r: 13 } };
