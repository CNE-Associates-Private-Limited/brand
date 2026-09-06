// The single source of truth for the CNE Associates mark geometry.
//
// Two forms, one construction: every turn is 45 or 90 degrees, one stroke weight throughout, and every join and
// cap is round at a consistent radius. That rounding is the whole point — it is what makes the angular cut read
// as smooth rather than sharp.
//
//   logo  — the CNE lettermark, wide, used wherever there is horizontal room.
//   mark  — the chamfered C alone, square, for the favicon, avatar and app icon.
//
// Consumers build their own elements from PATHS; `markElements` and `logoElements` return satori-compatible nodes.

/** Wide CNE lettermark. viewBox 0 0 420 160, stroke 22. */
export const LOGO = {
  viewBox: "0 0 420 160",
  width: 420,
  height: 160,
  stroke: 22,
  // C, N and E each drawn as one open route so joins never spike.
  ink: [
    "M 140 20 L 50 20 L 20 50 L 20 110 L 50 140 L 140 140",
    "M 175 140 L 175 20 L 270 140 L 270 20",
    "M 400 20 L 305 20 L 305 140 L 400 140",
  ],
  // The E's middle arm carries the accent: the layer, inside the letter.
  accent: ["M 305 80 L 375 80"],
};

/** Square chamfered C with the layer bar inside it. viewBox 0 0 140 140, stroke 20. */
export const MARK = {
  viewBox: "0 0 140 140",
  width: 140,
  height: 140,
  stroke: 20,
  ink: ["M 116 24 L 48 24 L 24 48 L 24 92 L 48 116 L 116 116"],
  // A dot, not a bar: a horizontal bar inside a C reads as a euro sign. A zero-length round-capped
  // subpath renders as a disc the width of the stroke.
  accent: ["M 78 70 L 78 70"],
};

const strokeAttrs = (color, width) => ({
  fill: "none",
  stroke: color,
  strokeWidth: width,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

/** Satori-compatible children for a shape, given an element factory `h`. */
export function elements(shape, h, ink, accent) {
  return [
    ...shape.ink.map((d) => h("path", { d, ...strokeAttrs(ink, shape.stroke) })),
    ...shape.accent.map((d) => h("path", { d, ...strokeAttrs(accent ?? ink, shape.stroke) })),
  ];
}

/** A complete standalone SVG string for a shape. */
export function toSvg(shape, ink, accent, { label = "CNE Associates", size = null } = {}) {
  const w = size ?? shape.width;
  const h = size ? Math.round((size * shape.height) / shape.width) : shape.height;
  const paths = [...shape.ink.map((d) => ({ d, c: ink })), ...shape.accent.map((d) => ({ d, c: accent ?? ink }))]
    .map(
      ({ d, c }) =>
        `  <path d="${d}" fill="none" stroke="${c}" stroke-width="${shape.stroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${shape.viewBox}" width="${w}" height="${h}" role="img" aria-label="${label}">\n${paths}\n</svg>\n`;
}
