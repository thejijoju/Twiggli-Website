#!/usr/bin/env bash
# Email-sized stills for the weekly newsletter (WeeklyEmail.astro): each
# reel poster is a 9:16 frame, too tall for an inbox, so this cuts a 4:3
# 560x420 middle out of it into site/public/img/mail/<name>.jpg. Mail
# clients ignore object-fit, so the crop has to exist as a file. Existing
# crops are kept; run again after adding a reel.
set -euo pipefail
cd "$(dirname "$0")/../site/public"
mkdir -p img/mail
for poster in video/*-poster.jpg; do
  name=$(basename "$poster" -poster.jpg)
  out="img/mail/$name.jpg"
  [ -f "$out" ] && continue
  ffmpeg -loglevel error -y -i "$poster" -vf "scale=560:-2,crop=560:420" -q:v 5 "$out"
done
