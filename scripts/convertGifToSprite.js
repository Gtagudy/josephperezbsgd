import gifFrames from 'gif-frames';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to convert stream to buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function convertGifToSprite(gifPath, outputPath) {
  console.log(`\nProcessing GIF: ${gifPath}`);
  
  try {
    // Check if input file exists
    if (!fs.existsSync(gifPath)) {
      throw new Error(`Input file not found: ${gifPath}`);
    }

    console.log('Extracting frames...');
    // Extract frames from GIF
    const frameData = await gifFrames({ 
      url: gifPath, 
      frames: 'all', 
      outputType: 'png',
      cumulative: false // Don't accumulate frames
    });
    
    console.log(`Extracted ${frameData.length} frames`);
    
    // Get frame dimensions from the first frame
    const firstFrameBuffer = await streamToBuffer(frameData[0].getImage());
    const { width, height } = await sharp(firstFrameBuffer).metadata();
    console.log(`Frame dimensions: ${width}x${height}`);
    
    // Create a new image with all frames side by side
    const spriteWidth = width * frameData.length;
    const spriteHeight = height;
    
    console.log('Creating sprite sheet...');
    // Create a new image with the combined width
    const sprite = sharp({
      create: {
        width: spriteWidth,
        height: spriteHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    // Process each frame and create composites
    const composites = [];
    for (let i = 0; i < frameData.length; i++) {
      console.log(`Processing frame ${i + 1}/${frameData.length}`);
      const frameBuffer = await streamToBuffer(frameData[i].getImage());
      
      // Process the frame with sharp to ensure proper transparency
      const processedFrame = await sharp(frameBuffer)
        .ensureAlpha()
        .removeAlpha() // Remove any existing alpha channel
        .toColorspace('srgb') // Ensure proper color space
        .toBuffer()
        .then(buffer => 
          sharp(buffer)
            .ensureAlpha() // Add a fresh alpha channel
            .toBuffer()
        );
      
      composites.push({
        input: processedFrame,
        left: width * i,
        top: 0
      });
    }

    console.log('Saving sprite sheet...');
    // Save the sprite sheet with proper transparency
    await sprite
      .composite(composites)
      .png({
        compressionLevel: 9,
        palette: true,
        quality: 100,
        effort: 10
      })
      .toFile(outputPath);

    console.log(`Created sprite sheet at ${outputPath}`);
    console.log(`Sprite sheet dimensions: ${spriteWidth}x${spriteHeight}`);

    // Save frame count and dimensions as JSON
    const metadata = {
      frameCount: frameData.length,
      frameWidth: width,
      frameHeight: height,
      spriteWidth,
      spriteHeight
    };

    const jsonPath = outputPath.replace('.png', '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
    console.log(`Saved metadata to ${jsonPath}`);

  } catch (error) {
    console.error('Error converting GIF to sprite sheet:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Convert all GIFs in the resources directory
const resourcesDir = path.join(__dirname, '../public/resources');
console.log(`\nLooking for GIFs in: ${resourcesDir}`);

try {
  const gifFiles = fs.readdirSync(resourcesDir).filter(file => file.endsWith('.gif'));
  console.log(`Found ${gifFiles.length} GIF files:`, gifFiles);

  for (const gifFile of gifFiles) {
    const gifPath = path.join(resourcesDir, gifFile);
    const outputPath = path.join(resourcesDir, gifFile.replace('.gif', '-sprite.png'));
    await convertGifToSprite(gifPath, outputPath);
  }
} catch (error) {
  console.error('Error processing directory:', error);
  console.error('Stack trace:', error.stack);
} 