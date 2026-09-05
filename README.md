# Lenswright by CNE Associates — brand

The source of truth for the Lenswright identity: marks, tokens, fonts and the templates that render every asset from code. The website and every other repo import from here.

> Status: the name Lenswright is pending a formal trademark search. Until `STATUS.md` says cleared, do not print it on anything external.

## What is here

| Path | What | Edit? |
|---|---|---|
| `marks/` | The aperture mark as SVG: light, dark, mono black, mono white, accent-only, avatars, favicon cut | Only by a brand decision |
| `tokens/tokens.json` | Every colour, type, radius, shadow and motion value, in DTCG format | Yes, this is the source |
| `tokens/build.mjs` | Builds `dist/tokens/` from the source | Rarely |
| `fonts/` | Hanken Grotesk and Red Hat Mono, variable TTF (OFL), static instances for renderers, subset woff2 for the web | Only on a font change |
| `scripts/render.mjs` | Renders wordmark, lockups, avatars, LinkedIn banner and the default OG image | When an asset layout changes |
| `scripts/icons.mjs` | Favicon and app icon set plus `site.webmanifest` | Rarely |
| `email/signature.html` | The HTML email signature | When contact details change |
| `dist/` | Generated. Never edit; run `make build` | No |

## Use it

```bash
pnpm install
make build      # tokens, assets, icons -> dist/
make test       # contrast and token hygiene
make lint       # biome
```

In a website or app:

```css
@import "@cne/brand/dist/tokens/tokens.css";  /* CSS variables, light default, dark twin */
@import "@cne/brand/dist/tokens/theme.css";   /* Tailwind v4 @theme mapping onto the variables */
```

Fonts: `fonts/web/*.woff2` are subset variable fonts, self-host them. Or use `@fontsource-variable/hanken-grotesk` and `@fontsource/red-hat-mono`.

## The identity in one screen

- **Mark.** A ring with one horizontal slit: the layer a business sees through. Ring r 56, stroke 12; slit 72 × 18, fully rounded; viewBox 0 0 140 140. The ring is ink or reversed ink. The slit is lens, ink, or the ground colour. Never rotate, narrow, recolour, gradient, glow or outline it. Clear space half the ring diameter. Minimum 16 px; below 24 px use `marks/favicon.svg`.
- **Name.** Lenswright, one word, capital L. "by CNE Associates" in mono caps beneath or after. The legal line, "CNE Associates Private Limited · CIN U80903UP2021PTC148406 · GSTIN 09AAJCC6013D1ZY", only on legal, invoice and footer surfaces.
- **Colour.** Ground and surface carry the page. Ink for text and the ring. Lens for the slit, links, one primary button and one highlighted number. Sand is the rare warm counterweight. Both themes are designed with equal care; every core pair passes WCAG AA and CI proves it.
- **Type.** Hanken Grotesk for display and body, Red Hat Mono for anything measured. Scale 1.25 from 16 px. Headlines 600 or 700, tight tracking, sentence case, full stop. Body 400, never below 14 px, never justified. Mono caps with 0.08 em tracking for labels.
- **Voice.** Precise, calm, senior. Say what was built, what it scored, what it costs. Banned: transform, unlock, empower, journey, game-changing, 10x, cutting-edge, seamless, revolutionary.

The full brand book, with the rejected directions for context, lives on the design canvas linked from the launch plan.

## Licence

Code and build scripts: MIT. Fonts: SIL Open Font License, see `fonts/*-OFL.txt`. The Lenswright and CNE Associates names, the aperture mark and the wordmark are trademarks of CNE Associates Private Limited and are not covered by the MIT licence; see `LICENSE`.
