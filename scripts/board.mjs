// Composes the CNE Associates brand board (3 x 3, 2400 x 1800) and the mark handoff sheet (2400 x 1350) from real
// assets: the mark geometry, 3D renders, an atmosphere image, tokens and type. Run after build and build:3d:
// pnpm build:board  ->  dist/board/brand-board.png, dist/board/mark-sheet.png
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import { DOMAIN, EXPANSION, HERO, NAME } from "./copy.mjs";
import { elements, LOGO, MARK } from "./mark-geometry.mjs";

const tokens = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const L = Object.fromEntries(Object.entries(tokens.color.light).map(([k, v]) => [k, v.$value]));
const D = Object.fromEntries(Object.entries(tokens.color.dark).map(([k, v]) => [k, v.$value]));
const CANVAS = "#101215";
const PANEL = "#15181D";
const GUIDE = "#2A3038";
const LABEL = "#7C8591";

const fonts = [
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-700.ttf"), weight: 700, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-600.ttf"), weight: 600, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-400.ttf"), weight: 400, style: "normal" },
  { name: "Red Hat Mono", data: readFileSync("fonts/static/RedHatMono-500.ttf"), weight: 500, style: "normal" },
];

const h = (type, props = {}, ...children) => ({ type, props: { ...props, children: children.length === 1 ? children[0] : children } });

async function dataUri(path, width) {
  if (!existsSync(path)) return null;
  const buf = await sharp(path).trim().resize({ width, withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

// Both forms come from the shared geometry so the mark can only ever change in one place.
const Mark = ({ size, ink, accent }) => h("svg", { width: size, height: size, viewBox: MARK.viewBox }, ...elements(MARK, h, ink, accent));
const Logo = ({ width, ink, accent }) =>
  h("svg", { width, height: Math.round((width * LOGO.height) / LOGO.width), viewBox: LOGO.viewBox }, ...elements(LOGO, h, ink, accent));

const mono = (text, { size = 13, color = LABEL, tracking = "0.12em", upper = true } = {}) =>
  h(
    "div",
    {
      style: {
        fontFamily: "Red Hat Mono",
        fontWeight: 500,
        fontSize: size,
        letterSpacing: tracking,
        textTransform: upper ? "uppercase" : "none",
        color,
        display: "flex",
      },
    },
    text,
  );
const label = (text) => mono(text);
const display = (text, { size, weight = 700, color = D.ink, tracking = "-0.035em", leading = 1, maxWidth } = {}) =>
  h(
    "div",
    {
      style: {
        fontFamily: "Hanken Grotesk",
        fontWeight: weight,
        fontSize: size,
        letterSpacing: tracking,
        lineHeight: leading,
        color,
        display: "flex",
        ...(maxWidth ? { maxWidth } : {}),
      },
    },
    text,
  );
const panel = (children, extra = {}) =>
  h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        background: PANEL,
        borderRadius: 10,
        padding: 32,
        overflow: "hidden",
        position: "relative",
        ...extra,
      },
    },
    ...children,
  );
const wordRow = ({ markSize, wordSize, ink, accent, gap = 12 }) =>
  h(
    "div",
    { style: { display: "flex", alignItems: "center", gap } },
    Mark({ size: markSize, ink, accent }),
    display(NAME, { size: wordSize, color: ink }),
  );

const hero3d = await dataUri("dist/3d/cne-3d-hero.png", 1400);
const tilt3d = await dataUri("dist/3d/mark-c-3d-tilt.png", 900);
const atmosphere = await dataUri("dist/atmosphere/lit-arm.png", 1344);

// The construction drawing: the R3 geometry over its guides, in the logo's own coordinates (letters inset 10).
const dash = (el) => h(el.type, { ...el.props, fill: "none", stroke: GUIDE, strokeWidth: 0.6, strokeDasharray: "2 3" });
const construction = (width) =>
  h(
    "svg",
    { width, height: Math.round((width * LOGO.height) / LOGO.width), viewBox: LOGO.viewBox },
    dash(h("circle", { cx: 60, cy: 60, r: 50 })),
    dash(h("circle", { cx: 60, cy: 60, r: 28 })),
    ...[10, 32, 88, 110].map((y) => dash(h("line", { x1: 0, y1: y, x2: 262, y2: y }))),
    ...[60, 98, 120, 169, 191].map((x) => dash(h("line", { x1: x, y1: 0, x2: x, y2: 120 }))),
    dash(h("line", { x1: 124, y1: 0, x2: 74, y2: 50 })),
    dash(h("line", { x1: 86, y1: 44, x2: 130, y2: 0 })),
    dash(h("line", { x1: 262, y1: 2, x2: 214, y2: 50 })),
    dash(h("line", { x1: 108, y1: 6, x2: 180, y2: 84 })),
    ...elements(LOGO, h, D.ink, D.lens),
  );

const board = h(
  "div",
  { style: { width: 2400, height: 1800, background: CANVAS, display: "flex", flexDirection: "column", padding: 48, gap: 24 } },
  h(
    "div",
    { style: { display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 } },
    wordRow({ markSize: 26, wordSize: 20, ink: D.ink, accent: D.lens }),
    label(`Brand system · v0.3 · ${EXPANSION}`),
  ),
  h(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 24, flex: 1 } },
    // 1 cover: the lettermark as an object
    panel(
      [
        hero3d
          ? h("img", {
              src: hero3d,
              width: 780,
              height: 420,
              style: { position: "absolute", right: 24, top: 55, width: 780, height: 420, objectFit: "contain" },
            })
          : Logo({ width: 700, ink: D.ink, accent: D.lens }),
        h(
          "div",
          { style: { position: "absolute", left: 32, bottom: 32, display: "flex", flexDirection: "column", gap: 10 } },
          display(NAME, { size: 40 }),
          mono(EXPANSION, { size: 14, color: D.lens, tracking: "0.16em" }),
          label("01 · The mark"),
        ),
      ],
      { width: 1152, height: 530 },
    ),
    // 2 construction
    panel(
      [
        label("02 · Construction"),
        h("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1 } }, construction(470)),
        h(
          "div",
          { style: { display: "flex", justifyContent: "space-between" } },
          label("cap 100 · stroke 22 · every cut 45°"),
          label("C: R 50 · r 28"),
        ),
      ],
      { width: 552, height: 530 },
    ),
    // 3 essence
    panel(
      [
        label("03 · Essence"),
        h(
          "div",
          { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 22 } },
          h(
            "div",
            { style: { display: "flex", gap: 18 } },
            ...["C", "N", "E"].map((c) => display(c, { size: 64, color: D.lens, tracking: "-0.02em" })),
          ),
          display(`${EXPANSION}.`, { size: 46, weight: 600, tracking: "-0.03em", leading: 1.06 }),
        ),
      ],
      { width: 552, height: 530 },
    ),
    // 4 digital application: browser chrome
    panel(
      [
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", background: L.ground, borderRadius: 8, overflow: "hidden", flex: 1 } },
          h(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#E6E9ED" } },
            ...[0, 1, 2].map(() => h("div", { style: { width: 10, height: 10, borderRadius: 5, background: "#C9CDD3", display: "flex" } })),
            h(
              "div",
              {
                style: {
                  marginLeft: 12,
                  flex: 1,
                  height: 22,
                  borderRadius: 6,
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  fontFamily: "Red Hat Mono",
                  fontSize: 11,
                  color: L.muted,
                },
              },
              DOMAIN,
            ),
          ),
          h(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: `1px solid ${L.line}`,
              },
            },
            wordRow({ markSize: 20, wordSize: 16, ink: L.ink, accent: L.lens, gap: 8 }),
            h(
              "div",
              {
                style: {
                  background: L.ink,
                  color: "#FFFFFF",
                  padding: "7px 12px",
                  borderRadius: 999,
                  fontFamily: "Hanken Grotesk",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                },
              },
              "Book a discovery call",
            ),
          ),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 10, padding: "28px 24px" } },
            display(HERO, { size: 30, color: L.ink, leading: 1.04, maxWidth: 420 }),
            mono("eval 0.94 · cost INR 0.4 per query · p95 1.8s", { size: 11, color: L.lens, tracking: "0", upper: false }),
          ),
        ),
        h("div", { style: { marginTop: 16, display: "flex" } }, label("04 · Site")),
      ],
      { width: 800, height: 530 },
    ),
    // 5 colour
    panel(
      [
        label("05 · Colour"),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" } },
          ...[L, D].map((T) =>
            h(
              "div",
              { style: { display: "flex", gap: 10 } },
              ...["ground", "surface", "surface-2", "line", "ink", "muted", "lens", "sand"].map((k) =>
                h("div", {
                  style: {
                    flex: 1,
                    height: 70,
                    borderRadius: 6,
                    background: T[k],
                    border: `1px solid ${T === L ? L.line : "#262C36"}`,
                    display: "flex",
                  },
                }),
              ),
            ),
          ),
          h(
            "div",
            { style: { display: "flex", gap: 10 } },
            ...["ground", "surface", "surface-2", "line", "ink", "muted", "lens", "sand"].map((k) =>
              h("div", { style: { flex: 1, fontFamily: "Red Hat Mono", fontSize: 11, color: LABEL, display: "flex" } }, k),
            ),
          ),
        ),
      ],
      { width: 728, height: 530 },
    ),
    // 6 type
    panel(
      [
        label("06 · Type"),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "center" } },
          display("Aa", { size: 96, tracking: "-0.04em" }),
          display("Hanken Grotesk", { size: 22, weight: 600, tracking: "0" }),
          mono("Red Hat Mono 0123456789", { size: 16, color: D.lens, tracking: "0", upper: false }),
        ),
      ],
      { width: 728, height: 530 },
    ),
    // 7 physical: card
    panel(
      [
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: D.ground,
              borderRadius: 10,
              padding: 22,
              width: 488,
              height: 316,
              alignSelf: "center",
              marginTop: 40,
              border: "1px solid #262C36",
            },
          },
          h(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            wordRow({ markSize: 22, wordSize: 16, ink: D.ink, accent: D.lens, gap: 8 }),
            Logo({ width: 78, ink: "#262C36", accent: D.lens }),
          ),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 3 } },
            display("Anmol Jaiswal", { size: 15, tracking: "0" }),
            mono(`Founder · ${DOMAIN}`, { size: 10, color: D.muted, tracking: "0.08em" }),
          ),
        ),
        h("div", { style: { marginTop: 16, display: "flex" } }, label("07 · Card")),
      ],
      { width: 552, height: 530 },
    ),
    // 8 image direction
    panel(
      [
        atmosphere
          ? h("img", {
              src: atmosphere,
              width: 1344,
              height: 768,
              style: { position: "absolute", left: 0, top: 0, width: 1224, height: 530, objectFit: "cover" },
            })
          : h("div", { style: { flex: 1, background: "#0B0E12", display: "flex" } }),
        tilt3d
          ? h("img", {
              src: tilt3d,
              width: 470,
              height: 470,
              style: { position: "absolute", right: 70, top: 30, width: 470, height: 470, objectFit: "contain" },
            })
          : null,
        h("div", { style: { position: "absolute", left: 32, bottom: 32, display: "flex" } }, label("08 · Image direction")),
      ],
      { width: 1224, height: 530, padding: 0 },
    ),
    // 9 system detail
    panel(
      [
        label("09 · System"),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 14, flex: 1, justifyContent: "center" } },
          h(
            "div",
            { style: { display: "flex", gap: 8 } },
            ...[
              ["LIVE", D.lens],
              ["PLANNED", D.sand],
              ["DOWN", D.danger],
            ].map(([t, c]) =>
              h(
                "div",
                {
                  style: {
                    fontFamily: "Red Hat Mono",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: c,
                    border: `1px solid ${c}`,
                    padding: "4px 10px",
                    borderRadius: 999,
                    display: "flex",
                  },
                },
                t,
              ),
            ),
          ),
          h(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#0B0E12",
                borderRadius: 8,
                padding: "12px 14px",
                fontFamily: "Red Hat Mono",
                fontSize: 13,
                color: D.ink,
              },
            },
            h("div", { style: { color: D.lens, display: "flex" } }, "$"),
            h("div", { style: { display: "flex" } }, "pnpm add @cne/brand"),
          ),
          h(
            "div",
            { style: { display: "flex", gap: 12, alignItems: "flex-end" } },
            Logo({ width: 150, ink: D.ink, accent: D.lens }),
            Logo({ width: 72, ink: D.ink, accent: D.lens }),
          ),
          h(
            "div",
            { style: { display: "flex", gap: 10, alignItems: "flex-end" } },
            ...[40, 28, 18, 14].map((s) => Mark({ size: s, ink: D.ink, accent: D.lens })),
          ),
        ),
      ],
      { width: 480, height: 530 },
    ),
  ),
);

// The handoff sheet: every form of the mark on both grounds, at the sizes it will be used.
const column = (T, dark) => {
  const lbl = (t) => mono(t, { size: 12, color: dark ? LABEL : L.muted });
  const row = (title, ...kids) =>
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 12 } },
      lbl(title),
      h("div", { style: { display: "flex", alignItems: "flex-end", gap: 28 } }, ...kids),
    );
  return h(
    "div",
    { style: { flex: 1, background: T.ground, borderRadius: 10, padding: 44, display: "flex", flexDirection: "column", gap: 40 } },
    row("Logo · primary", Logo({ width: 620, ink: T.ink, accent: T.lens })),
    row(
      "Logo · mono, and at 240 / 120 / 72",
      Logo({ width: 300, ink: T.ink, accent: T.ink }),
      Logo({ width: 240, ink: T.ink, accent: T.lens }),
      Logo({ width: 120, ink: T.ink, accent: T.lens }),
      Logo({ width: 72, ink: T.ink, accent: T.lens }),
    ),
    row("Mark · 160 / 96 / 48 / 24 / 16", ...[160, 96, 48, 24, 16].map((s) => Mark({ size: s, ink: T.ink, accent: T.lens }))),
    row(
      "Lockups",
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 18 } },
        Mark({ size: 84, ink: T.ink, accent: T.lens }),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          display(NAME, { size: 60, color: T.ink }),
          mono(EXPANSION, { size: 13, color: T.muted, tracking: "0.1em" }),
        ),
      ),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, marginLeft: 40 } },
        Logo({ width: 260, ink: T.ink, accent: T.lens }),
        h("div", { style: { display: "flex", paddingLeft: 10 } }, mono(EXPANSION, { size: 12, color: T.muted, tracking: "0.16em" })),
      ),
    ),
  );
};
const sheet = h(
  "div",
  { style: { width: 2400, height: 1350, background: CANVAS, display: "flex", flexDirection: "column", padding: 48, gap: 24 } },
  h(
    "div",
    { style: { display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 } },
    display(`${NAME} · mark sheet`, { size: 26, tracking: "-0.03em" }),
    label("scripts/mark-geometry.mjs is the only source · marks/ is generated from it"),
  ),
  h("div", { style: { display: "flex", gap: 24, flex: 1 } }, column(L, false), column(D, true)),
);

mkdirSync("dist/board", { recursive: true });
const render = async (el, width, height, path) => {
  const svg = await satori(el, { width, height, fonts });
  writeFileSync(path, new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng());
  console.log("wrote", path);
};
await render(board, 2400, 1800, "dist/board/brand-board.png");
await render(sheet, 2400, 1350, "dist/board/mark-sheet.png");
console.log(hero3d ? "(with 3D)" : "(flat fallback)", atmosphere ? "(with atmosphere)" : "(no atmosphere yet)");
