#!/usr/bin/env bash
# Recapture the two project screenshots.
#
# Both are captured at ONE viewport, and that is the whole point. The
# frames on the page take whatever height their image needs — a
# screenshot is evidence and is never cropped — so two images captured
# at different viewports produce two frames of different heights sitting
# side by side in the same section. Equal heights come from equal
# captures, not from a CSS crop.
#
# Keep VIEWPORT the same for every shot that appears in Selected work.
# If you change it, recapture all of them.
#
#   bash design/capture-shots.sh
#
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
VIEWPORT="1280,800"     # 16:10. Doubled below for a retina capture.
OUT_W=1440              # delivered width; height follows the viewport ratio
QUALITY=82

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

shoot () {            # shoot <url> <output-basename>
  local url="$1" name="$2"
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-prefers-reduced-motion --force-device-scale-factor=2 \
    --user-data-dir="$tmp/profile-$name" \
    --window-size="$VIEWPORT" \
    --screenshot="$tmp/$name.png" \
    --virtual-time-budget=12000 "$url"
  magick "$tmp/$name.png" -resize "${OUT_W}x" -quality "$QUALITY" \
    "$root/public/assets/$name.webp"
  echo "  $name.webp  $(magick identify -format '%wx%h' "$root/public/assets/$name.webp")"
}

echo "capturing at $VIEWPORT (2x) -> ${OUT_W}px wide webp"
shoot "https://contractledger.selinaq.com/" "contractledger-dashboard"
shoot "https://asylumcompass.com/"          "asylumcompass-home"

echo
echo "Now update the width/height attributes on both <img> in"
echo "public/index.html if the delivered size changed, and re-check the"
echo "alt text still describes what the new capture actually shows."
