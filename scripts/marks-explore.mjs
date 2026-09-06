// Mark exploration sheet: candidate symbols with a stronger intelligence signal, rendered from SVG at several
// sizes in both themes. Run: node scripts/marks-explore.mjs  ->  dist/explore/mark-options.png + per-mark SVGs
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
const h = (type, props = {}, ...children) => ({ type, props: { ...props, children: children.length === 1 ? children[0] : children } });

// Geometry helpers (viewBox 0 0 140 140, centre 70,70)
const pt = (r, deg) => [70 + r * Math.cos((deg * Math.PI) / 180), 70 + r * Math.sin((deg * Math.PI) / 180)];

// 1. Iris: six aperture blades, each side of a hexagon extended past one vertex, opening lit.
function iris(ink, lens) {
  const inner = 30;
  const kids = [];
  for (let i = 0; i < 6; i++) {
    const a = i * 60 - 90;
    const [x1, y1] = pt(inner, a);
    const [x2, y2] = pt(inner, a + 60);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ex = x2 + (dx / len) * 34;
    const ey = y2 + (dy / len) * 34;
    kids.push(h("line", { x1, y1, x2: ex, y2: ey, stroke: ink, strokeWidth: 11, strokeLinecap: "round" }));
  }
  const hex = Array.from({ length: 6 }, (_, i) => pt(inner - 6, i * 60 - 90).join(",")).join(" ");
  return [h("polygon", { points: hex, fill: lens }), ...kids];
}
// 2. Focal: the ring with a lit core; the eye that has decided.
const focal = (ink, lens) => [
  h("circle", { cx: 70, cy: 70, r: 56, fill: "none", stroke: ink, strokeWidth: 12 }),
  h("circle", { cx: 70, cy: 70, r: 17, fill: lens }),
];
// 3. Prism: raw input enters, an ordered layer leaves.
const prism = (ink, lens) => [
  h("path", { d: "M70 14 L124 110 L16 110 Z", fill: "none", stroke: ink, strokeWidth: 11, strokeLinejoin: "round" }),
  h("line", { x1: 4, y1: 74, x2: 42, y2: 74, stroke: ink, strokeWidth: 8, strokeLinecap: "round" }),
  h("line", { x1: 100, y1: 60, x2: 136, y2: 52, stroke: lens, strokeWidth: 8, strokeLinecap: "round" }),
  h("line", { x1: 104, y1: 76, x2: 136, y2: 76, stroke: lens, strokeWidth: 8, strokeLinecap: "round" }),
  h("line", { x1: 100, y1: 92, x2: 136, y2: 100, stroke: lens, strokeWidth: 8, strokeLinecap: "round" }),
];
// 4. Pulse: the ring, with the slit resolved into a signal.
const pulse = (ink, lens) => [
  h("circle", { cx: 70, cy: 70, r: 56, fill: "none", stroke: ink, strokeWidth: 12 }),
  h("rect", { x: 34, y: 63, width: 14, height: 14, rx: 7, fill: lens }),
  h("rect", { x: 54, y: 52, width: 14, height: 36, rx: 7, fill: lens }),
  h("rect", { x: 74, y: 44, width: 14, height: 52, rx: 7, fill: lens }),
  h("rect", { x: 94, y: 60, width: 14, height: 20, rx: 7, fill: lens }),
];
// 5. Core: three layers seen edge-on, the middle one awake.
const core = (ink, lens) => [
  h("rect", { x: 22, y: 30, width: 96, height: 16, rx: 8, fill: ink }),
  h("rect", { x: 14, y: 62, width: 112, height: 16, rx: 8, fill: lens }),
  h("rect", { x: 22, y: 94, width: 96, height: 16, rx: 8, fill: ink }),
  h("circle", { cx: 126, cy: 70, r: 9, fill: lens }),
];

const marks = [
  {
    key: "iris",
    name: "Iris",
    why: "A real aperture: six blades, one lit opening. Reads focus, judgement, a system deciding what to let through. Owns the name.",
    fn: iris,
  },
  {
    key: "focal",
    name: "Focal",
    why: "The ring with a lit core. The eye that has already decided. Simplest, strongest at 16 px; must stay warm to avoid the camera-lens cliché.",
    fn: focal,
  },
  {
    key: "prism",
    name: "Prism",
    why: "Raw input enters, an ordered layer leaves. Transformation, not surveillance. The most 'intelligence at work' of the set.",
    fn: prism,
  },
  {
    key: "pulse",
    name: "Pulse",
    why: "The current ring, with the slit resolved into a signal. Keeps continuity; reads data and activity.",
    fn: pulse,
  },
  {
    key: "core",
    name: "Core",
    why: "Three layers edge-on, the middle one awake, with a node at its end. Literal to 'intelligence layer'; least ownable.",
    fn: core,
  },
];

const Svg = (fn, size, ink, lens) => h("svg", { width: size, height: size, viewBox: "0 0 140 140" }, ...fn(ink, lens));
const label = (t, c) =>
  h(
    "div",
    { style: { fontFamily: "Red Hat Mono", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: c, display: "flex" } },
    t,
  );

const row = (m, idx) =>
  h(
    "div",
    { style: { display: "flex", gap: 24, alignItems: "stretch" } },
    // dark cell
    h(
      "div",
      { style: { width: 760, background: D.surface, borderRadius: 10, padding: 28, display: "flex", alignItems: "center", gap: 28 } },
      Svg(m.fn, 160, D.ink, D.lens),
      h(
        "div",
        { style: { display: "flex", gap: 14, alignItems: "flex-end" } },
        Svg(m.fn, 64, D.ink, D.lens),
        Svg(m.fn, 32, D.ink, D.lens),
        Svg(m.fn, 16, D.ink, D.lens),
      ),
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 12, marginLeft: 16 } },
        Svg(m.fn, 40, D.ink, D.lens),
        h(
          "div",
          {
            style: {
              fontFamily: "Hanken Grotesk",
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "-0.035em",
              color: D.ink,
              display: "flex",
            },
          },
          "Lenswright",
        ),
      ),
    ),
    // light cell
    h(
      "div",
      { style: { width: 420, background: L.surface, borderRadius: 10, padding: 28, display: "flex", alignItems: "center", gap: 22 } },
      Svg(m.fn, 120, L.ink, L.lens),
      h(
        "div",
        { style: { display: "flex", gap: 12, alignItems: "flex-end" } },
        Svg(m.fn, 48, L.ink, L.lens),
        Svg(m.fn, 24, L.ink, L.lens),
        Svg(m.fn, 16, L.ink, L.lens),
      ),
    ),
    // text cell
    h(
      "div",
      { style: { flex: 1, display: "flex", flexDirection: "column", gap: 10, padding: "12px 8px" } },
      label(`0${idx + 1} · ${m.name}`, "#7C8591"),
      h(
        "div",
        { style: { fontFamily: "Hanken Grotesk", fontWeight: 400, fontSize: 19, lineHeight: 1.4, color: D.ink, display: "flex" } },
        m.why,
      ),
    ),
  );

const sheet = h(
  "div",
  { style: { width: 2400, height: 1800, background: "#101215", display: "flex", flexDirection: "column", padding: 48, gap: 22 } },
  h(
    "div",
    { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
    h(
      "div",
      { style: { fontFamily: "Hanken Grotesk", fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", color: D.ink, display: "flex" } },
      "Mark exploration · a stronger intelligence signal",
    ),
    label("Lenswright · round 3 · same palette, same type", "#7C8591"),
  ),
  ...marks.map(row),
);

mkdirSync("dist/explore", { recursive: true });
const svg = await satori(sheet, { width: 2400, height: 1800, fonts });
writeFileSync("dist/explore/mark-options.png", new Resvg(svg, { fitTo: { mode: "width", value: 2400 } }).render().asPng());
for (const m of marks) {
  const inner = m
    .fn(L.ink, L.lens)
    .map((el) => {
      const attrs = Object.entries(el.props)
        .filter(([k]) => k !== "children")
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${v}"`)
        .join(" ");
      return `<${el.type} ${attrs}/>`;
    })
    .join("\n  ");
  writeFileSync(
    `dist/explore/mark-${m.key}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">\n  ${inner}\n</svg>\n`,
  );
}
console.log("wrote dist/explore/mark-options.png and", marks.length, "svgs");
