#!/bin/bash

# Create a backup directory if it doesn't exist
mkdir -p backups/logos

# Move all logo files to the backup directory
for logo_file in $(find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | grep -i logo); do
    echo "Moving $logo_file to backups/logos/"
    cp "$logo_file" "backups/logos/$(basename "$logo_file")"
    rm "$logo_file"
done

echo "All logo files have been backed up to backups/logos/ and removed from the public directory."