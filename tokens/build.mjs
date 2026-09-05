// Builds every export of the Lenswright tokens from tokens/tokens.json.
// Outputs: dist/tokens/tokens.css (CSS variables, light + dark), theme.css (Tailwind v4),
// tokens.flat.json, figma.tokens.json (Tokens Studio), canva.json (brand kit values).

import { mkdirSync, writeFileSync } from "node:fs";
import StyleDictionary from "style-dictionary";

const OUT = "dist/tokens/";
mkdirSync(OUT, { recursive: true });

const themeVars = (tokens, theme) =>
  Object.entries(tokens.color[theme])
    .map(([name, t]) => `  --cne-${name}: ${t.$value};`)
    .join("\n");

const sharedVars = (tokens) => {
  const lines = [];
  for (const [k, t] of Object.entries(tokens.font.family))
    lines.push(`  --cne-font-${k}: ${t.$value.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")};`);
  for (const [k, t] of Object.entries(tokens.font.size)) lines.push(`  --cne-text-${k}: ${t.$value};`);
  for (const [k, t] of Object.entries(tokens.font.leading)) lines.push(`  --cne-leading-${k}: ${t.$value};`);
  for (const [k, t] of Object.entries(tokens.font.tracking)) lines.push(`  --cne-tracking-${k}: ${t.$value};`);
  for (const [k, t] of Object.entries(tokens.radius)) lines.push(`  --cne-radius-${k}: ${t.$value};`);
  for (const [k, t] of Object.entries(tokens.color.chart)) lines.push(`  --cne-chart-${k}: ${t.$value};`);
  lines.push(`  --cne-ease: cubic-bezier(${tokens.motion.ease.$value.join(",")});`);
  lines.push(`  --cne-dur-fast: ${tokens.motion["duration-fast"].$value};`);
  lines.push(`  --cne-dur: ${tokens.motion.duration.$value};`);
  return lines.join("\n");
};

StyleDictionary.registerFormat({
  name: "cne/css",
  format: ({ dictionary }) => {
    const t = dictionary.tokens;
    return `/* Lenswright by CNE Associates. Generated from tokens/tokens.json; do not edit. */
:root {
${themeVars(t, "light")}
  --cne-shadow: ${t.shadow.light.$value};
${sharedVars(t)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${themeVars(t, "dark")}
    --cne-shadow: ${t.shadow.dark.$value};
  }
}
:root[data-theme="dark"] {
${themeVars(t, "dark")}
  --cne-shadow: ${t.shadow.dark.$value};
}
`;
  },
});

StyleDictionary.registerFormat({
  name: "cne/tailwind",
  format: ({ dictionary }) => {
    const t = dictionary.tokens;
    const colors = Object.keys(t.color.light)
      .map((n) => `  --color-${n}: var(--cne-${n});`)
      .join("\n");
    const chart = Object.keys(t.color.chart)
      .map((n) => `  --color-chart-${n}: var(--cne-chart-${n});`)
      .join("\n");
    const sizes = Object.keys(t.font.size)
      .map((n) => `  --text-${n}: var(--cne-text-${n});`)
      .join("\n");
    const radii = Object.keys(t.radius)
      .map((n) => `  --radius-${n}: var(--cne-radius-${n});`)
      .join("\n");
    return `/* Tailwind v4 theme for Lenswright. Import tokens.css first, then this file. Generated; do not edit. */
@theme inline {
${colors}
${chart}
  --font-display: var(--cne-font-display);
  --font-body: var(--cne-font-body);
  --font-mono: var(--cne-font-mono);
${sizes}
${radii}
  --shadow-cne: var(--cne-shadow);
  --ease-cne: var(--cne-ease);
}
`;
  },
});

StyleDictionary.registerFormat({
  name: "cne/figma",
  format: ({ dictionary }) => {
    const t = dictionary.tokens;
    const set = (theme) => Object.fromEntries(Object.entries(t.color[theme]).map(([n, v]) => [n, { value: v.$value, type: "color" }]));
    const out = {
      light: set("light"),
      dark: set("dark"),
      global: {
        fontFamilies: Object.fromEntries(Object.entries(t.font.family).map(([n, v]) => [n, { value: v.$value[0], type: "fontFamilies" }])),
        fontSizes: Object.fromEntries(Object.entries(t.font.size).map(([n, v]) => [n, { value: v.$value, type: "fontSizes" }])),
        borderRadius: Object.fromEntries(Object.entries(t.radius).map(([n, v]) => [n, { value: v.$value, type: "borderRadius" }])),
      },
      $themes: [],
      $metadata: { tokenSetOrder: ["global", "light", "dark"] },
    };
    return JSON.stringify(out, null, 2);
  },
});

StyleDictionary.registerFormat({
  name: "cne/canva",
  format: ({ dictionary }) => {
    const t = dictionary.tokens;
    return JSON.stringify(
      {
        name: "Lenswright by CNE Associates",
        colors: [
          ...Object.entries(t.color.light).map(([n, v]) => ({ name: `light/${n}`, hex: v.$value })),
          ...Object.entries(t.color.dark).map(([n, v]) => ({ name: `dark/${n}`, hex: v.$value })),
        ],
        fonts: { heading: "Hanken Grotesk", body: "Hanken Grotesk", mono: "Red Hat Mono" },
        logos: [
          "marks/mark-light.svg",
          "marks/mark-dark.svg",
          "dist/wordmark/lockup-horizontal-light.svg",
          "dist/wordmark/lockup-horizontal-dark.svg",
        ],
      },
      null,
      2,
    );
  },
});

const sd = new StyleDictionary({
  usesDtcg: true,
  source: ["tokens/tokens.json"],
  platforms: {
    css: { buildPath: OUT, files: [{ destination: "tokens.css", format: "cne/css" }] },
    tailwind: { buildPath: OUT, files: [{ destination: "theme.css", format: "cne/tailwind" }] },
    json: { transformGroup: "js", buildPath: OUT, files: [{ destination: "tokens.flat.json", format: "json/flat" }] },
    figma: { buildPath: OUT, files: [{ destination: "figma.tokens.json", format: "cne/figma" }] },
    canva: { buildPath: OUT, files: [{ destination: "canva.json", format: "cne/canva" }] },
  },
});

await sd.buildAllPlatforms();
writeFileSync(`${OUT}README.md`, "Generated from tokens/tokens.json by `pnpm build:tokens`. Do not edit by hand.\n");
console.log("tokens built ->", OUT);
