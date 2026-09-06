# Brand status

| Item | Status | Date |
|---|---|---|
| Brand name | **CNE Associates**, the legal name, set in full; no studio name | 2026-09-06 |
| Expansion of the initials | **"Creating Next Everything"**; descriptor "Enterprise AI Enablement" | 2026-09-06 |
| Mark | **Decided by Anmol**: the CNE lettermark and the C mark, drawn as exact geometry in `scripts/mark-geometry.mjs` | 2026-09-06 |
| Brand kit | built from that geometry: marks, lockups, avatars, LinkedIn banner, OG image, icon set, 3D renders, atmosphere set, brand board, mark sheet | 2026-09-06 |
| Figma | file `LyH3kgyj4rlD9TAXFGpNVE`: page "Brand kit" (components for logo, mark, avatar and the three lockups on both grounds; "CNE colour" variables in Light and Dark modes; four text styles) and page "Marks" (the editable geometry board) | 2026-09-06 |
| Tokens v0.1 | built; every core pair passes WCAG AA and CI proves it | 2026-09-06 |
| Class 42 trademark, India then US | not filed | |
| Canva brand kit | not created | |

Rules that follow from the table: "CNE" alone is allowed only on a surface where the full name already appears.
The legal line, "CNE Associates Private Limited · CIN U80903UP2021PTC148406 · GSTIN 09AAJCC6013D1ZY", stays on
legal, invoice and footer surfaces. The mark, the copy lines and the tokens change only by a decision recorded here.

## The mark

Cap 100, stroke 22, every terminal and chamfer cut at 45 degrees. The C is a true semicircle (R 50, r 28) whose
45-degree terminals form a bracket on the right; the N's stem is chamfered to slot into that bracket at a constant
5.7-unit gap; the N's diagonal (slope 1.075) fuses into the E's spine; the E's three arms are cut in the same
direction, the middle arm lens blue and 8 shorter. The square mark is the same C with a lens core. Soft C, hard N
and E. Every asset is generated from the one geometry file: `marks/`, the lockups, avatars, banner, OG image, icon
set, the 3D plates (`render3d.py` reads `dist/mark-polygons.json`), the brand board and the mark sheet.

Two rules of construction: the core inside the C is a dot, never a bar (a bar reads as a euro sign); and no
coloured bar ever crosses a wordmark (it reads as a strikethrough).

## Copy lines

`scripts/copy.mjs` is the only place the brand lines live: the name; the expansion "Creating Next Everything",
set in mono caps under the wordmark in every lockup and used as the essence line on the board; the descriptor
"Enterprise AI Enablement", paired with it on the banner; the hero "Put an intelligence layer into your business."
from the positioning work; the domain `cne-associates.com`; and the legal line.

## Figma

Code is the source of truth and Figma mirrors it, so anyone designing there uses the exact assets. Page "Brand
kit" carries components built from the same SVGs (`Logo / Light|Dark|Mono black|Mono white`, `Mark / …`,
`Avatar / …`, `Lockup horizontal / …`, `Lockup stacked / …`, `Logo lockup / …`; the lockups are auto-layout with
live text), the "CNE colour" variable collection (17 roles, Light and Dark modes, values from `tokens/tokens.json`)
and the text styles `Display / 48`, `Heading / 32`, `Body / 16`, `Label / 12 mono`. Change geometry or tokens
here, rebuild, then re-sync Figma; never export Figma back into this repo.

## Provenance

Anmol chose the lettermark on 2026-09-06 from a Recraft agent round (variant round1-r3) and it was redrawn as
exact geometry the same day; the original trace is in git history at `8d3b0e7`. Everything drawn or generated
before that decision, and the studio name considered before the brand became the legal name, was removed from
the tree on 2026-09-06 and exists only in git history before `fa81c57`.
