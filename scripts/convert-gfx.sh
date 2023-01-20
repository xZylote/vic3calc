#!/bin/bash
set -e

# Convert all asset dds to webp
echo "Converting dds to webp"
echo

SOURCE=src/assets/vic3
DEST=public
IMAGE_VARIANT_SIZES=(64x64 40x40 32x32 25x25)

# read the dds files into an array
readarray -t DDS_FILES < <(cd $SOURCE && find gfx -type f -name '*.dds' | grep -v unused)

# iterate the dds files
for dds in "${DDS_FILES[@]}"; do
  echo "Converting $dds"
  for size in "${IMAGE_VARIANT_SIZES[@]}" ; do
    # create the webp file
    folder=$(dirname $dds)
    file=$(basename $dds | sed -r 's/\.dds/\.webp/g')
    webp=$DEST/$folder/$size/$file
    mkdir -p $(dirname $webp)
    convert -resize $size $SOURCE/$dds $webp
  done
done