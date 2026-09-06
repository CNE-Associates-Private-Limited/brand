#!/usr/bin/env bash
# Pass 2 of local logo generation: negative-space and single-stroke constructions, monoline, the intelligence
# read carried by one lit element. Same model and palette as logo-gen.sh. Output: dist/explore/logos/p2-*.png
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
OUT="dist/explore/logos"; mkdir -p "$OUT"
MODEL="flux2-klein-4b"; Q=8; STEPS=4; SIZE=768
STYLE="Flat vector logo mark, one abstract symbol centred on a plain off-white background #F4F5F7, deep ink #0E1116 with a single lens blue #2F6DB5 element. Monoline construction with uniform stroke weight and rounded terminals, crisp negative space, perfectly balanced, symbol only with no lettering. Reduced and ownable, the standard of a senior identity studio."
gen() { local name="$1" seed="$2" prompt="$3"
  mflux-generate-flux2 -m "$MODEL" -q "$Q" --steps "$STEPS" --seed "$seed" --width "$SIZE" --height "$SIZE" \
    --output "$OUT/p2-$name-$seed.png" --prompt "$prompt $STYLE" >/dev/null 2>&1 && echo "wrote p2-$name-$seed"; }
C=(
"lens-L|A single continuous line that draws a lens-shaped oval and then turns into the vertical stem of a letter L, with one lens-blue dot where the line begins."
"gap-eye|A circle drawn as one stroke with a deliberate gap on the right side, a lens-blue dot sitting just inside the gap like a pupil catching light."
"layer-cut|A solid ink circle with two parallel diagonal cuts of negative space through it, the thin band between the cuts filled in lens blue."
"stacked-arcs|Three concentric arcs opening upward like layers of a bowl, the smallest arc in lens blue, one small dot floating above them."
"corner-focus|Four L-shaped corner brackets framing empty space, with a single lens-blue circle at the centre, the frame of a viewfinder locking on."
"half-ring|A thick ring where the right half is ink and the left half is drawn as three thin parallel lines, one lens-blue dot at the centre."
"knot-loop|A single stroke loop that crosses itself once to form a lens shape in its middle, the overlap region in lens blue."
"tilted-planes|Three thin rounded bars stacked with a slight tilt, receding like pages, the middle bar in lens blue and slightly longer than the others."
)
for entry in "${C[@]}"; do name="${entry%%|*}"; prompt="${entry#*|}"; for seed in 5 29; do gen "$name" "$seed" "$prompt"; done; done
echo "pass 2 done"
