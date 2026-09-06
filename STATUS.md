# Brand status

| Item | Status | Date |
|---|---|---|
| Identity direction (Aperture mark) | decided | 2026-09-06 |
| Studio name "Lenswright" | chosen, **trademark search pending** | 2026-09-06 |
| lenswright.ai / lenswright.in | not registered | |
| Tokens v0.1 | built, contrast passes AA | 2026-09-06 |
| Canva brand kit | not created | |
| Figma / Penpot library | not created | |

Nothing carrying the Lenswright name goes external until the trademark line says cleared.

## 2026-09-06 · Mark, round 3 (open)

Anmol likes the dimensional direction but the aperture mark reads "lens", not "intelligence". Five candidates were explored (`pnpm explore:marks` → `dist/explore/`): Iris, Focal, Prism, Pulse, Core. Iris and Focal were built as objects with `scripts/render3d.py` (mark kinds `aperture | iris | focal`). Recommendation: Iris. Decision pending; `marks/` and all rendered assets still carry the aperture until it is made.

Open-source generation route (2026-09-06): `pnpm explore:logos` generates 40 candidates locally with FLUX.2 [klein] 4B via mflux from palette-driven prompts (`scripts/logo-gen.sh`, `scripts/logo-gen-pass2.sh`); `scripts/trace-logo.sh` traces a pick to a two-colour SVG with potrace. Top eight ranked in `dist/explore/generated-top8.png`. Any generated mark chosen must be redrawn by hand as clean geometry in `marks/` before use; the trace is a reference, not the asset.
