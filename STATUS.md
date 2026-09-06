# Brand status

| Item | Status | Date |
|---|---|---|
| Brand name | **CNE Associates** (the legal name; no studio name) | 2026-09-06 |
| Studio name "Lenswright" | **retired**, rejected by the founder | 2026-09-06 |
| Class 42 trademark, India then US | not filed | |
| Mark | monogram candidates open, see below | 2026-09-06 |
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

## 2026-09-06 · Mark, round 6: CNE lettermark in Figma (open)

Anmol asked to try the lettermark route: "CNE" written with angular twists rather than a symbol. Built as live
vectors in the Figma file (LyH3kgyj4rlD9TAXFGpNVE, page "Marks"), set in Space Grotesk Bold, flattened, then cut
with boolean operations so everything stays editable. Six treatments on the "CNE lettermark studies" board:
01 geometric, 02 split shift, 03 stencil, 04 oblique, 05 oblique stencil, 06 chamfered tile. The "CNE lettermark
refined" board carries the recommendation, **oblique with lit seams**, at 168 / 64 / 32 / 18 px.

Two things learned the hard way and worth not repeating: a lens bar drawn across the whole wordmark reads as a
strikethrough, so every accent must be intersected with the letterforms; and `figma.intersect` takes the
intersection of *all* nodes passed, so two non-overlapping stripes in one call produce an empty result.
