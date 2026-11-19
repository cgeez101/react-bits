#!/usr/bin/env bash
# Joins the rendered frames and the station track into the final MP4.
# Usage: intro/encode.sh <frames-dir> <out.mp4> [seconds]   (default: the full 96.4 s film)
set -euo pipefail
FR="$1"; OUT="$2"; DUR="${3:-96.4}"
HERE="$(cd "$(dirname "$0")" && pwd)"
FADE_AT=$(python3 -c "print(round($DUR - 1.4, 2))")
ffmpeg -y -loglevel error -framerate 30 -i "$FR/f%04d.jpg" \
  -t "$DUR" -i "$HERE/../src/assets/live-audio.mp3" \
  -filter_complex "[1:a]afade=t=in:st=0:d=0.3,afade=t=out:st=${FADE_AT}:d=1.4[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -ar 44100 -movflags +faststart -t "$DUR" "$OUT"
