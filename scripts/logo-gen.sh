#!/usr/bin/env bash
# Generates logo-mark candidates locally with FLUX.2 [klein] 4B via mflux, from prompts built on the Lenswright
# palette and metaphors (lens, layer, focus, intelligence). Open weights, no API. Run: pnpm explore:logos
# Output: dist/explore/logos/<concept>-<seed>.png
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
OUT="dist/explore/logos"; mkdir -p "$OUT"
MODEL="flux2-klein-4b"; Q=8; STEPS=4; SIZE=768
STYLE="Flat vector logo mark, a single abstract geometric symbol centred on a plain off-white background #F4F5F7, drawn in deep ink #0E1116 with one accent in lens blue #2F6DB5. Clean edges, even stroke weight, generous margins, symmetrical construction, symbol only with no lettering. The quality of a senior identity studio: reduced, ownable, memorable."
gen() { # concept seed prompt
  local name="$1" seed="$2" prompt="$3"
  mflux-generate-flux2 -m "$MODEL" -q "$Q" --steps "$STEPS" --seed "$seed" --width "$SIZE" --height "$SIZE" \
    --output "$OUT/$name-$seed.png" --prompt "$prompt $STYLE" >/dev/null 2>&1 && echo "wrote $name-$seed"
}
C=(
"iris|An aperture iris of six overlapping blades leaving a small hexagonal opening at the centre, the opening filled with lens blue."
"focal-lens|Two concentric rings like a lens seen face on, with a single small filled circle at the exact centre in lens blue: focus resolved."
"layers-iso|Three thin rounded planes stacked in isometric perspective, the middle plane in lens blue as the intelligence layer between two ink planes."
"eye-arcs|An abstract eye formed by two overlapping arcs with a lens-blue circle in the negative space between them, calm and geometric."
"split-ring|A thick ring split by one horizontal band of empty space, a small lens-blue dot sitting at the centre of the gap."
"lit-prism|A hexagonal prism seen from above in thin ink outline where one internal face is filled in lens blue: a structure with an intelligent layer inside."
"fold-L|A monogram letter L made from one folded ribbon with a single crease, the inner face of the fold in lens blue."
"signal-ring|A ring with three short concentric arcs radiating from a single lens-blue node on its right side, like a quiet signal."
"hex-in-circle|A hexagon nested inside a circle, joined by six short spokes, the hexagon filled in lens blue."
"orbit-node|A ring with one small lens-blue node on its edge and one larger ink node at its centre, connected by a single thin line."
"lens-slit|A circle with a lens-shaped horizontal slit through it, the slit edges slightly parted, light in lens blue inside the slit."
"layer-path|Five short horizontal bars rising diagonally like steps, the top bar in lens blue, forming the silhouette of an ascending path."
)
for entry in "${C[@]}"; do
  name="${entry%%|*}"; prompt="${entry#*|}"
  for seed in 3 17; do gen "$name" "$seed" "$prompt"; done
done
echo "logo candidates done: $(find "$OUT" -name "*.png" | wc -l | tr -d " ") files"
