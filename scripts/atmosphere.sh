#!/usr/bin/env bash
# Generates the Lenswright atmosphere set locally with FLUX.2 [klein] 4B via mflux (Apple Silicon, no API).
# Prompts follow the FLUX rules: one subject, natural language, explicit lighting and camera, hex colours,
# positive phrasing only. Run: pnpm build:atmosphere   (first run downloads the model, ~4.6 GB)
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
OUT="dist/atmosphere"; mkdir -p "$OUT"
MODEL="flux2-klein-4b"; Q=8; STEPS=4
gen() { # name seed width height prompt
  local name="$1" seed="$2" w="$3" h="$4" prompt="$5"
  echo "generating $name"
  mflux-generate-flux2 -m "$MODEL" -q "$Q" --steps "$STEPS" --seed "$seed" --width "$w" --height "$h" --output "$OUT/$name.png" --prompt "$prompt" >/dev/null 2>&1 && echo "wrote $OUT/$name.png"
}
gen light-through-slit 7 1344 768 "Extreme macro photograph of a single horizontal slit of soft light in lens blue #2F6DB5 passing through stacked panes of dark smoked glass, the light spreading into a gentle glow across the glass edges. Deep charcoal background #0A0D11, everything else in shadow. Cinematic studio lighting from within the slit only, shallow depth of field, subtle fine film grain. Shot on a 100mm macro lens at f/2.8. Minimal, quiet, precise."
gen layered-planes 11 1344 768 "Five thin translucent planes of dark glass stacked in perspective like layers of a system, receding into a charcoal void #0A0D11. The middle plane glows softly from inside in pale lens blue #6FA0E0 while the others stay dark and matte. Soft top light with a cool rim, mist between the planes, long depth. Architectural, calm, product-photography precision, 85mm lens."
gen horizon-band 23 1344 768 "A vast calm landscape of matte black dunes at night under a thin luminous band of pale blue light #6FA0E0 along the horizon, the band reflecting faintly on the dune ridges. Deep charcoal sky #0A0D11, no stars, gentle atmospheric haze. Wide 24mm lens, low camera, cinematic, restrained, film grain."
gen machined-edge 5 1024 1024 "Extreme close-up of the edge of a machined black anodised metal ring, fine brushed texture catching one long thin highlight of lens blue #2F6DB5 light along its bevel, the rest falling into deep charcoal shadow #0A0D11. Studio softbox reflection, macro lens at f/4, tactile and premium, quiet."
echo "atmosphere set done"
