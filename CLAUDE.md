# brand — Claude Code guide

This repo is the source of truth for the CNE Associates identity. Invoke the `cne-brand` skill (workspace) before changing anything visual.

- `scripts/mark-geometry.mjs` is the only place mark geometry lives; `scripts/copy.mjs` is the only place the brand lines live; `tokens/tokens.json` is the only place colour, type, radius, shadow and motion values live. Everything in `dist/` and `marks/` is generated: run `make build`, never edit them.
- The mark and the copy lines change only by a brand decision recorded in STATUS.md.
- `make quality` (lint, typecheck, test) must pass before any commit. The contrast test is a hard gate.
- Renders are deterministic: fonts in `fonts/static` are the only fonts the renderer may use. `pnpm build:3d` and `pnpm build:atmosphere` are local-only (Blender, mflux) and their outputs are committed.
- Node 22+, pnpm only. Biome for lint and format. Python via ruff.
- Check STATUS.md before putting the name on anything that leaves this repo.
