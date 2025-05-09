import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function resizeImage() {
  try {
    // Input and output paths
    const inputPath = 'attached_assets/fotor-ai-202505105223.jpg';
    const outputPath = 'client/public/assets/moodlync-logo-resized.jpg';
    
    // Get the original image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log('Original dimensions:', metadata.width, 'x', metadata.height);
    
    // Calculate new dimensions (50% of original)
    const newWidth = Math.round(metadata.width / 2);
    const newHeight = Math.round(metadata.height / 2);
    
    // Resize image and save
    await sharp(inputPath)
      .resize(newWidth, newHeight)
      .toFile(outputPath);
      
    console.log(`Image resized to ${newWidth}x${newHeight} and saved to ${outputPath}`);
    
    // Copy the resized file to netlify deploy
    const netlifyPath = 'netlify-deploy/client/public/assets/moodlync-logo-resized.jpg';
    fs.mkdirSync(path.dirname(netlifyPath), { recursive: true });
    fs.copyFileSync(outputPath, netlifyPath);
    console.log(`Copied resized image to ${netlifyPath}`);
    
  } catch (error) {
    console.error('Error resizing image:', error);
  }
}

resizeImage();