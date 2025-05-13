#!/bin/bash
# Script to fix path imports for components that might be causing issues in the build

# Create a backup of the App.tsx file
cp client/src/App.tsx client/src/App.tsx.bak

# Replace potentially problematic imports with relative paths
sed -i 's|from "@/components/ui/tooltip"|from "../components/ui/tooltip"|g' client/src/App.tsx

echo "Fixed import paths in App.tsx"