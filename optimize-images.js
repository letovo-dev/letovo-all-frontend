import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = 'public'; // Папка с исходными PNG
const outputDir = 'public/images'; // Папка для оптимизированных файлов

async function optimizeImages() {
  await fs.mkdir(outputDir, { recursive: true });
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file.replace('.png', '.webp')); // Преобразуем в WebP
      await sharp(inputPath)
        .webp({ quality: 80 }) // Настройте качество
        .toFile(outputPath);
    }
  }
}

optimizeImages().catch(console.error);
