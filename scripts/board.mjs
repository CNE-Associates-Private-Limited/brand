// Composes the Lenswright brand board (3 x 3, 2400 x 1800) from real assets: 3D renders, atmosphere image,
// marks, tokens and type. Run after build:assets and render3d: pnpm build:board
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";

const tokens = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const L = Object.fromEntries(Object.entries(tokens.color.light).map(([k, v]) => [k, v.$value]));
const D = Object.fromEntries(Object.entries(tokens.color.dark).map(([k, v]) => [k, v.$value]));
const CANVAS = "#101215";
const PANEL = "#15181D";

const fonts = [
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-700.ttf"), weight: 700, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-600.ttf"), weight: 600, style: "normal" },
  { name: "Hanken Grotesk", data: readFileSync("fonts/static/HankenGrotesk-400.ttf"), weight: 400, style: "normal" },
  { name: "Red Hat Mono", data: readFileSync("fonts/static/RedHatMono-500.ttf"), weight: 500, style: "normal" },
];

const h = (type, props = {}, ...children) => ({ type, props: { ...props, children: children.length === 1 ? children[0] : children } });

async function dataUri(path, width) {
  if (!existsSync(path)) return null;
  const buf = await sharp(path).resize({ width, withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const Mark = ({ size, ring, slit }) =>
  h(
    "svg",
    { width: size, height: size, viewBox: "0 0 140 140" },
    h("circle", { cx: 70, cy: 70, r: 56, fill: "none", stroke: ring, strokeWidth: 12 }),
    h("rect", { x: 34, y: 61, width: 72, height: 18, rx: 9, fill: slit }),
  );
const label = (text) =>
  h(
    "div",
    {
      style: {
        fontFamily: "Red Hat Mono",
        fontWeight: 500,
        fontSize: 13,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#7C8591",
        display: "flex",
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

const tilt = await dataUri("dist/3d/aperture-3d-tilt.png", 900);
const hero3d = await dataUri("dist/3d/aperture-3d-hero.png", 1000);
const atmosphere = await dataUri("dist/atmosphere/light-through-slit.png", 1100);

const board = h(
  "div",
  { style: { width: 2400, height: 1800, background: CANVAS, display: "flex", flexDirection: "column", padding: 48, gap: 24 } },
  // header strip
  h(
    "div",
    { style: { display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 } },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 12 } },
      Mark({ size: 26, ring: D.ink, slit: D.lens }),
      h(
        "div",
        { style: { fontFamily: "Hanken Grotesk", fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em", color: D.ink, display: "flex" } },
        "Lenswright",
      ),
    ),
    label("Brand system · v0.2 · by CNE Associates"),
  ),
  h(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 24, flex: 1 } },
    // 1 cover: 3D mark
    panel(
      [
        tilt
          ? h("img", { src: tilt, width: 620, height: 620, style: { position: "absolute", right: 60, top: -30, width: 620, height: 620 } })
          : Mark({ size: 320, ring: D.ink, slit: D.lens }),
        h(
          "div",
          { style: { position: "absolute", left: 32, bottom: 32, display: "flex", flexDirection: "column", gap: 8 } },
          h(
            "div",
            {
              style: {
                fontFamily: "Hanken Grotesk",
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: "-0.035em",
                color: D.ink,
                display: "flex",
              },
            },
            "Lenswright",
          ),
          label("01 · The aperture"),
        ),
      ],
      { width: 1152, height: 530 },
    ),
    // 2 construction
    panel(
      [
        label("02 · Construction"),
        h(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1 } },
          h(
            "svg",
            { width: 300, height: 300, viewBox: "0 0 140 140" },
            h("circle", { cx: 70, cy: 70, r: 62, fill: "none", stroke: "#2A3038", strokeWidth: 0.6, strokeDasharray: "2 3" }),
            h("circle", { cx: 70, cy: 70, r: 50, fill: "none", stroke: "#2A3038", strokeWidth: 0.6, strokeDasharray: "2 3" }),
            h("line", { x1: 4, y1: 70, x2: 136, y2: 70, stroke: "#2A3038", strokeWidth: 0.6, strokeDasharray: "2 3" }),
            h("line", { x1: 70, y1: 4, x2: 70, y2: 136, stroke: "#2A3038", strokeWidth: 0.6, strokeDasharray: "2 3" }),
            h("circle", { cx: 70, cy: 70, r: 56, fill: "none", stroke: D.ink, strokeWidth: 12 }),
            h("rect", { x: 34, y: 61, width: 72, height: 18, rx: 9, fill: D.lens }),
          ),
        ),
        h(
          "div",
          { style: { display: "flex", justifyContent: "space-between" } },
          label("r 56 · stroke 12"),
          label("slit 72 × 18 · 0.64 d"),
        ),
      ],
      { width: 552, height: 530 },
    ),
    // 3 tagline
    panel(
      [
        label("03 · Essence"),
        h(
          "div",
          { style: { flex: 1, display: "flex", alignItems: "flex-end" } },
          h(
            "div",
            {
              style: {
                fontFamily: "Hanken Grotesk",
                fontWeight: 600,
                fontSize: 44,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: D.ink,
                display: "flex",
              },
            },
            "Put an intelligence layer into your business.",
          ),
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
            h("div", { style: { width: 10, height: 10, borderRadius: 5, background: "#C9CDD3", display: "flex" } }),
            h("div", { style: { width: 10, height: 10, borderRadius: 5, background: "#C9CDD3", display: "flex" } }),
            h("div", { style: { width: 10, height: 10, borderRadius: 5, background: "#C9CDD3", display: "flex" } }),
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
              "lenswright.ai",
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
            h(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              Mark({ size: 20, ring: L.ink, slit: L.lens }),
              h(
                "div",
                {
                  style: {
                    fontFamily: "Hanken Grotesk",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "-0.03em",
                    color: L.ink,
                    display: "flex",
                  },
                },
                "Lenswright",
              ),
            ),
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
            h(
              "div",
              {
                style: {
                  fontFamily: "Hanken Grotesk",
                  fontWeight: 700,
                  fontSize: 30,
                  lineHeight: 1.04,
                  letterSpacing: "-0.035em",
                  color: L.ink,
                  display: "flex",
                  maxWidth: 420,
                },
              },
              "Put an intelligence layer into your business.",
            ),
            h(
              "div",
              { style: { fontFamily: "Red Hat Mono", fontSize: 11, color: L.lens, display: "flex" } },
              "eval 0.94 · cost INR 0.4 per query · p95 1.8s",
            ),
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
          h(
            "div",
            { style: { display: "flex", gap: 10 } },
            ...["ground", "surface", "surface-2", "line", "ink", "muted", "lens", "sand"].map((k) =>
              h("div", {
                style: { flex: 1, height: 70, borderRadius: 6, background: L[k], border: `1px solid ${L.line}`, display: "flex" },
              }),
            ),
          ),
          h(
            "div",
            { style: { display: "flex", gap: 10 } },
            ...["ground", "surface", "surface-2", "line", "ink", "muted", "lens", "sand"].map((k) =>
              h("div", { style: { flex: 1, height: 70, borderRadius: 6, background: D[k], border: "1px solid #262C36", display: "flex" } }),
            ),
          ),
          h(
            "div",
            { style: { display: "flex", gap: 10 } },
            ...["ground", "surface", "surface-2", "line", "ink", "muted", "lens", "sand"].map((k) =>
              h("div", { style: { flex: 1, fontFamily: "Red Hat Mono", fontSize: 11, color: "#7C8591", display: "flex" } }, k),
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
          h(
            "div",
            {
              style: {
                fontFamily: "Hanken Grotesk",
                fontWeight: 700,
                fontSize: 96,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: D.ink,
                display: "flex",
              },
            },
            "Aa",
          ),
          h(
            "div",
            { style: { fontFamily: "Hanken Grotesk", fontWeight: 600, fontSize: 22, color: D.ink, display: "flex" } },
            "Hanken Grotesk",
          ),
          h(
            "div",
            { style: { fontFamily: "Red Hat Mono", fontWeight: 500, fontSize: 16, color: D.lens, display: "flex" } },
            "Red Hat Mono 0123456789",
          ),
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
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            Mark({ size: 22, ring: D.ink, slit: D.lens }),
            h(
              "div",
              {
                style: {
                  fontFamily: "Hanken Grotesk",
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: "-0.03em",
                  color: D.ink,
                  display: "flex",
                },
              },
              "Lenswright",
            ),
          ),
          h(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 3 } },
            h(
              "div",
              { style: { fontFamily: "Hanken Grotesk", fontWeight: 700, fontSize: 15, color: D.ink, display: "flex" } },
              "Anmol Jaiswal",
            ),
            h(
              "div",
              { style: { fontFamily: "Red Hat Mono", fontSize: 10, letterSpacing: "0.08em", color: D.muted, display: "flex" } },
              "FOUNDER · BY CNE ASSOCIATES",
            ),
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
              width: 1100,
              height: 630,
              style: { position: "absolute", left: 0, top: 0, width: 1224, height: 530, objectFit: "cover" },
            })
          : h("div", { style: { flex: 1, background: "#0B0E12", display: "flex" } }),
        hero3d
          ? h("img", { src: hero3d, width: 500, height: 500, style: { position: "absolute", right: 60, top: 15, width: 500, height: 500 } })
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
          { style: { display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" } },
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
            { style: { display: "flex", gap: 10, alignItems: "center" } },
            Mark({ size: 40, ring: D.ink, slit: D.lens }),
            Mark({ size: 28, ring: D.ink, slit: D.lens }),
            Mark({ size: 18, ring: D.ink, slit: D.lens }),
            Mark({ size: 14, ring: D.ink, slit: D.lens }),
          ),
        ),
      ],
      { width: 480, height: 530 },
    ),
  ),
);

mkdirSync("dist/board", { recursive: true });
const svg = await satori(board, { width: 2400, height: 1800, fonts });
const png = new Resvg(svg, { fitTo: { mode: "width", value: 2400 } }).render().asPng();
writeFileSync("dist/board/brand-board.png", png);
console.log(
  "wrote dist/board/brand-board.png",
  tilt ? "(with 3D)" : "(flat fallback)",
  atmosphere ? "(with atmosphere)" : "(no atmosphere yet)",
);
