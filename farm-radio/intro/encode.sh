#!/usr/bin/env bash
# Joins the rendered frames and the station sound into the final MP4.
# Usage: intro/encode.sh <frames-dir> <out.mp4>
set -euo pipefail
FR="$1"; OUT="$2"
HERE="$(cd "$(dirname "$0")" && pwd)"
ffmpeg -y -loglevel error -framerate 30 -i "$FR/f%04d.jpg" \
  -ss 0 -t 15 -i "$HERE/../src/assets/live-audio.mp3" \
  -filter_complex "[1:a]afade=t=in:st=0:d=0.6,afade=t=out:st=13.4:d=1.6,volume=0.85[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 160k -ar 44100 -movflags +faststart -t 15 "$OUT"
