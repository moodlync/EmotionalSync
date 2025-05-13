#!/bin/bash

# Create a test build only for specific files to check for errors

echo "Creating test build file..."

# Create temporary file that imports from emotion-bridge
cat > test-imports.js << EOF
import { 
  emotionColors,
  getEmotionColors,
  normalizeEmotion,
  getEmotionEmoji,
  primaryEmotionsList,
  syncMoodData,
  getCurrentMood
} from './client/src/lib/emotion-bridge';

console.log(emotionColors);
console.log(getEmotionColors('happy'));
console.log(normalizeEmotion('happy'));
console.log(getEmotionEmoji('happy'));
console.log(primaryEmotionsList);
console.log(getCurrentMood);
EOF

# Transpile it with tsx to check for errors
echo "Testing imports..."
npx tsx test-imports.js

if [ $? -eq 0 ]; then
  echo "✅ Imports from emotion-bridge are working correctly!"
else
  echo "❌ Import errors found in emotion-bridge"
  exit 1
fi

# Remove test file
rm test-imports.js

echo "Done testing!"