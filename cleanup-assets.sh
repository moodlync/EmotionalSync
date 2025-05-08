#!/bin/bash

# Make a backup directory for essential assets
mkdir -p essential_assets

# Copy only the needed assets
cp attached_assets/individual\ Emotional\ NFt\ 1.jpg essential_assets/
cp attached_assets/individual\ bad\ mood\ Emotional\ NFt\ 2.jpg essential_assets/
cp attached_assets/individual\ for\ Anger\ Emotional\ NFt.jpg essential_assets/
cp attached_assets/individual\ for\ Surprise\ Emotional\ NFt.jpg essential_assets/
cp attached_assets/Create\ a\ very\ unique\ image\ for\ Emotional\ NFTs_Exclusive\ Digital\ Collectibles_Premium\ members\ earn\ unique\ NFTs\ that\ evolve\ with\ your\ emotional\ journey.jpg essential_assets/
cp attached_assets/logo-transparent-png.png essential_assets/
cp attached_assets/logo-png.png essential_assets/

# Optimize the images (compress them)
echo "Compressing essential images..."
for img in essential_assets/*.jpg essential_assets/*.jpeg essential_assets/*.png; do
  if [ -f "$img" ]; then
    echo "Compressing $img..."
    convert "$img" -strip -quality 85% "$img"
  fi
done

# Remove the original attached_assets directory
# Note: We're backing up to essential_assets first for safety
# mv attached_assets attached_assets_backup
# mkdir attached_assets
# cp essential_assets/* attached_assets/

echo "Essential assets copied and compressed to 'essential_assets' directory"
echo "Please review the contents of 'essential_assets' and when satisfied,"
echo "manually replace the 'attached_assets' directory with these optimized files."