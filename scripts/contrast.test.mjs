// Fails the build if any core text/background pair in either theme drops below WCAG AA.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const theme = (name) => Object.fromEntries(Object.entries(tokens.color[name]).map(([k, v]) => [k, v.$value]));

function luminance(hex) {
  const c = [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const pairs = [
  ["ink", "ground", 4.5],
  ["ink-2", "ground", 4.5],
  ["muted", "ground", 4.5],
  ["lens", "ground", 4.5],
  ["lens-ink", "lens", 4.5],
  ["ink", "surface", 4.5],
  ["ink-2", "surface", 4.5],
  ["danger", "ground", 4.5],
  ["ok", "ground", 3],
  ["warn", "ground", 3],
];

for (const name of ["light", "dark"]) {
  const t = theme(name);
  describe(`${name} theme contrast`, () => {
    for (const [fg, bg, min] of pairs) {
      it(`${fg} on ${bg} >= ${min}:1`, () => {
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  });
}

describe("token hygiene", () => {
  it("light and dark expose the same colour roles", () => {
    expect(Object.keys(tokens.color.light).sort()).toEqual(Object.keys(tokens.color.dark).sort());
  });
  it("every colour is a 6-digit hex", () => {
    for (const set of ["light", "dark", "chart"])
      for (const v of Object.values(tokens.color[set])) expect(v.$value).toMatch(/^#[0-9A-F]{6}$/);
  });
});
