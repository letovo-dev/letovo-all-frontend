import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = 'public';
const outputDir = 'public/images';

async function optimizeImages() {
  await fs.mkdir(outputDir, { recursive: true });
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file.replace('.png', '.webp'));
      await sharp(inputPath).webp({ lossless: true }).toFile(outputPath);
    }
  }
}

optimizeImages().catch(console.error);
