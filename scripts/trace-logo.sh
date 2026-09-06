#!/usr/bin/env bash
# Traces a generated logo PNG to a two-colour SVG with potrace (open source): one path set for ink, one for lens.
# Usage: scripts/trace-logo.sh <in.png> <out.svg>
set -euo pipefail
in="$1"; out="$2"; tmp="$(mktemp -d)"
# Ink mask: anything dark. Lens mask: anything clearly blue (hue window), regardless of brightness.
magick "$in" -colorspace Gray -threshold 45% "$tmp/ink.pbm"
magick "$in" -colorspace HSB -channel R -separate +channel -threshold 50% "$tmp/hue-hi.pbm"
magick "$in" -colorspace HSB -channel R -separate +channel -threshold 70% -negate "$tmp/hue-lo.pbm"
magick "$in" -colorspace HSB -channel G -separate +channel -threshold 30% "$tmp/sat.pbm"
magick "$in" -colorspace HSB -channel B -separate +channel -threshold 35% "$tmp/bright.pbm"
magick "$tmp/hue-hi.pbm" "$tmp/hue-lo.pbm" -compose multiply -composite "$tmp/sat.pbm" -compose multiply -composite \
  "$tmp/bright.pbm" -compose multiply -composite -negate "$tmp/lens.pbm"
potrace "$tmp/ink.pbm" -s -t 40 -a 1.2 -O 0.6 -o "$tmp/ink.svg" -C '#0E1116'
potrace "$tmp/lens.pbm" -s -t 40 -a 1.2 -O 0.6 -o "$tmp/lens.svg" -C '#2F6DB5'
w=$(magick identify -format '%w' "$in"); h=$(magick identify -format '%h' "$in")
{
  echo "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 $w $h\">"
  sed -n '/<g/,/<\/g>/p' "$tmp/ink.svg"
  sed -n '/<g/,/<\/g>/p' "$tmp/lens.svg"
  echo "</svg>"
} > "$out"
rm -rf "$tmp"
echo "traced $out ($(wc -c < "$out" | tr -d ' ') bytes)"
