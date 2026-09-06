# brand — Claude Code guide

This repo is the source of truth for the CNE Associates identity. Invoke the `cne-brand` skill (workspace) before changing anything visual.

- `tokens/tokens.json` is the only place colour, type, radius, shadow and motion values live. Everything in `dist/` is generated: run `make build`, never edit dist.
- `marks/*.svg` change only by a brand decision recorded in STATUS.md.
- `make quality` (lint, typecheck, test) must pass before any commit. The contrast test is a hard gate.
- Renders are deterministic: fonts in `fonts/static` are the only fonts the renderer may use.
- Node 22+, pnpm only. Biome for lint and format.
- Check STATUS.md before putting the name on anything that leaves this repo.
