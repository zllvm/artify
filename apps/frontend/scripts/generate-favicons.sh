#!/usr/bin/env bash

set -e

# --- Configuration ---
SRC_LOGO=${1:-"logo.png"}           
OUTPUT_DIR=${2:-"public/favicons"}  


# --- Check dependencies ---
if ! command -v magick &> /dev/null; then
  echo "X ImageMagick ('magick') not found. Please install it first:"
  echo "   sudo apt install imagemagick"
  exit 1
fi

# --- Verify source image ---
if [ ! -f "$SRC_LOGO" ]; then
  echo "X Source image '$SRC_LOGO' not found!"
  echo "Usage: ./generate-favicons.sh path/to/logo.png [output-directory]"
  exit 1
fi

# --- Prepare output directory ---
mkdir -p "$OUTPUT_DIR"

echo "Generating favicons from: $SRC_LOGO"
echo "Output directory: $OUTPUT_DIR"

# --- Generate PNG versions ---
magick "$SRC_LOGO" -resize 16x16   "$OUTPUT_DIR/favicon-16x16.png"
magick "$SRC_LOGO" -resize 32x32   "$OUTPUT_DIR/favicon-32x32.png"
magick "$SRC_LOGO" -resize 180x180 "$OUTPUT_DIR/apple-touch-icon.png"
magick "$SRC_LOGO" -resize 192x192 "$OUTPUT_DIR/android-chrome-192x192.png"
magick "$SRC_LOGO" -resize 512x512 "$OUTPUT_DIR/android-chrome-512x512.png"

# --- Generate .ico (multi-resolution) ---
magick "$SRC_LOGO" -define icon:auto-resize "$OUTPUT_DIR/favicon.ico"

# --- Optional SVG optimization (if logo is SVG) ---
if [[ "$SRC_LOGO" == *.svg ]]; then
  cp "$SRC_LOGO" "$OUTPUT_DIR/favicon.svg"
fi

echo "✅ Favicons generated successfully:"
ls -1 "$OUTPUT_DIR"

cat <<EOF

Copy this into your app/layout.tsx:

export const metadata = {
  title: 'artify',
  description: 'art platform',
  icons: {
    icon: '/favicons/favicon.ico',
    shortcut: '/favicons/favicon-32x32.png',
    apple: '/favicons/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/favicons/favicon-16x16.png', sizes: '16x16' },
      { rel: 'icon', url: '/favicons/favicon-32x32.png', sizes: '32x32' },
      { rel: 'icon', url: '/favicons/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/favicons/android-chrome-512x512.png', sizes: '512x512' }
    ]
  }
};

EOF