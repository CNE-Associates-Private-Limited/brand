# Brand status

| Item | Status | Date |
|---|---|---|
| Brand name | **CNE Associates** (the legal name; no studio name) | 2026-09-06 |
| Studio name "Lenswright" | **retired**, rejected by the founder | 2026-09-06 |
| Expansion of the initials | **"Creating Next Everything"**, with the descriptor "Enterprise AI Enablement" (Anmol's line; replaces the interim "Capability, Not Experiments") | 2026-09-06 |
| Mark | **DECIDED by Anmol: Recraft round1-r3, redrawn as exact geometry** | 2026-09-06 |
| Brand kit | rebuilt on the decided mark; every exploration removed from the tree | 2026-09-06 |
| Class 42 trademark, India then US | not filed | |
| Tokens v0.1 | built, contrast passes AA | 2026-09-06 |
| Canva brand kit | not created | |
| Figma | file `LyH3kgyj4rlD9TAXFGpNVE`, board "R3 final, exact geometry" holds the editable vectors; library not built | 2026-09-06 |

The brand is the legal entity name, so nothing is gated on a naming decision any more. "CNE" alone is allowed
only on a surface where the full name already appears. The legal line, "CNE Associates Private Limited ·
CIN U80903UP2021PTC148406 · GSTIN 09AAJCC6013D1ZY", stays on legal, invoice and footer surfaces.

## 2026-09-06 · The mark: decided

**Anmol chose Recraft round1-r3.** It is redrawn as exact geometry in `scripts/mark-geometry.mjs` (cap 100,
stroke 22): a semicircle C (R 50, r 28) with 45-degree bracket terminals; the N's stem chamfered to slot into that
bracket at a constant 5.7-unit gap; the N's diagonal (slope 1.075) fused into the E's spine; the E's arms cut at
45 degrees in one direction, the middle arm lens blue and 8 shorter. The square mark is that C with a lens core.
Every asset is generated from that one file: `marks/`, the lockups, avatars, banner, OG image, icon set, the 3D
plates (`render3d.py` reads `dist/mark-polygons.json`), the brand board and the mark sheet.

Same day, on Anmol's instruction, every other mark and study was removed from the tree: the aperture ring, the
Iris/Focal/Prism/Pulse/Core round, the FLUX-generated candidates and their traces, the six monograms, the Figma
lettermark studies, the softened and heavy hand-built lettermarks, and the Recraft rounds. They remain in git
history up to `a3d5c1d`; the Recraft originals, including the R3 trace the geometry was measured from, are at
`8d3b0e7` under `dist/explore/recraft/`. The 3D script now knows only `cne` and `mark-c`.

Two traps recorded so they are not repeated: a horizontal bar inside the square C reads as a euro sign, so the
core is a dot; and a coloured bar across a whole wordmark reads as a strikethrough.

## 2026-09-06 · Copy lines

`scripts/copy.mjs` is the only place the brand lines live. Expansion "Creating Next Everything" (set under the
wordmark in every lockup and as the essence line on the board), descriptor "Enterprise AI Enablement" (paired with
it on the banner), hero "Put an intelligence layer into your business." (from the positioning work), domain
`cne-associates.com`, and the legal line. "Capability, Not Experiments" was an interim line and is withdrawn.

## History

Name: two studio-name rounds (50 names, then 69 domains checked) found nothing worth a second trademark;
Lenswright was rejected on 2026-09-06 and the brand became the legal name. Mark: the aperture ring (rounds 1
and 2, the dimensional direction was liked), five abstract candidates (rounds 3 and 4, all rejected as "lens, not
intelligence"), open-source generation with FLUX.2 klein and potrace (references only), six CNE monograms (round
5), angular lettermark studies in Figma (round 6), a softened monoline (rejected as "a logo for a blog page"), a
heavy cut lettermark, then a Recraft agent round with the same brief in which R2 independently converged on the
heavy lettermark and Anmol chose R3. The full decision trail is in the PR history of this repo.
