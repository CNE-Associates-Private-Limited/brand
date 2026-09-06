# Brand status

| Item | Status | Date |
|---|---|---|
| Brand name | **CNE Associates** (the legal name; no studio name) | 2026-09-06 |
| Studio name "Lenswright" | **retired**, rejected by the founder | 2026-09-06 |
| Class 42 trademark, India then US | not filed | |
| Mark | **decided: the heavy CNE lettermark** (superseded the softened monoline the same day) | 2026-09-06 |
| Expansion | "Capability, Not Experiments" | 2026-09-06 |
| Tokens v0.1 | built, contrast passes AA | 2026-09-06 |
| Canva brand kit | not created | |
| Figma library | file created (Lenswright brand, to rename), library not built | 2026-09-06 |

The brand is the legal entity name, so nothing is gated on a naming decision any more. "CNE" alone is allowed
only on a surface where the full name already appears. The legal line, "CNE Associates Private Limited ·
CIN U80903UP2021PTC148406 · GSTIN 09AAJCC6013D1ZY", stays on legal, invoice and footer surfaces.

## 2026-09-06 · Mark, round 5: CNE monograms (open)

The name was settled as CNE Associates, so the mark brief changed from an abstract symbol to a monogram.
Six were drawn as exact geometry (`pnpm explore:monograms` → `dist/explore/monograms.png` and
`dist/explore/monograms/*.svg`): Aperture C, C-stack, Nested arcs, Augmented ring, CNE monoline, Block N.
Aperture C and C-stack were built as machined objects (`render3d.py` mark kinds `aperture-c` and `c-stack`,
which use a brushed-steel alloy so a stroked form separates from the black studio).
Recommendation: **C-stack**. Decision pending; `marks/` still carries the old aperture until it is made.

## 2026-09-06 · Mark, rounds 3 and 4 (closed, all rejected)

Anmol likes the dimensional direction but the aperture mark reads "lens", not "intelligence". Five candidates were explored (`pnpm explore:marks` → `dist/explore/`): Iris, Focal, Prism, Pulse, Core. Iris and Focal were built as objects with `scripts/render3d.py` (mark kinds `aperture | iris | focal`). Recommendation: Iris. Decision pending; `marks/` and all rendered assets still carry the aperture until it is made.

Open-source generation route (2026-09-06): `pnpm explore:logos` generates 40 candidates locally with FLUX.2 [klein] 4B via mflux from palette-driven prompts (`scripts/logo-gen.sh`, `scripts/logo-gen-pass2.sh`); `scripts/trace-logo.sh` traces a pick to a two-colour SVG with potrace. Top eight ranked in `dist/explore/generated-top8.png`. Any generated mark chosen must be redrawn by hand as clean geometry in `marks/` before use; the trace is a reference, not the asset.

## 2026-09-06 · Mark: DECIDED (heavy)

Anmol rejected the softened monoline as "a logo for a blog or documentation page". Correct: monoline with round
caps is the default look of developer docs, and a stroke has no mass. Replaced the same day with heavy solid cut
letterforms: cap 100, stem 26, every outer corner and terminal at 45 degrees, N and E fused on one stem. The NE
outline is traced as a single polygon (the two notches are the N's counters) so the SVG is one path and the 3D
extrusion has no overlapping faces. 3D is now a true extruded plate (`extruded()` in render3d.py, 2D curve with
fill, extrude and bevel), fed from `dist/mark-polygons.json` so Blender never carries its own copy.

## 2026-09-06 · Mark: first decision, softened monoline (superseded above)

The softened CNE lettermark is the mark. Two forms from one construction, both in `scripts/mark-geometry.mjs`:
the wide `LOGO` (420 x 160, stroke 22) and the square `MARK`, the chamfered C with a lens core (140, stroke 20).
Every turn is 45 or 90 degrees; every join and cap is round, which is what makes the angular cut read as smooth.
`marks/` is regenerated with `pnpm build:marks`, and `render.mjs` and `board.mjs` now import the same geometry, so
the mark can only ever change in one place. 3D is a solid plate sweep (`render3d.py` kinds `cne` and `mark-c`),
not a round tube.

Two traps found and worth not repeating: a horizontal bar inside the square C reads as a euro sign, so the accent
there is a dot; and a coloured bar drawn across the whole wordmark reads as a strikethrough.

Open: the plate sweep still pinches slightly at the sharpest corners, and the wordmark lockup with
"Capability, Not Experiments" is not drawn yet.

## 2026-09-06 · Mark, round 6: CNE lettermark in Figma (superseded by the decision above)

Anmol asked to try the lettermark route: "CNE" written with angular twists rather than a symbol. Built as live
vectors in the Figma file (LyH3kgyj4rlD9TAXFGpNVE, page "Marks"), set in Space Grotesk Bold, flattened, then cut
with boolean operations so everything stays editable. Six treatments on the "CNE lettermark studies" board:
01 geometric, 02 split shift, 03 stencil, 04 oblique, 05 oblique stencil, 06 chamfered tile. The "CNE lettermark
refined" board carries the recommendation, **oblique with lit seams**, at 168 / 64 / 32 / 18 px.

Two things learned the hard way and worth not repeating: a lens bar drawn across the whole wordmark reads as a
strikethrough, so every accent must be intersected with the letterforms; and `figma.intersect` takes the
intersection of *all* nodes passed, so two non-overlapping stripes in one call produce an empty result.
