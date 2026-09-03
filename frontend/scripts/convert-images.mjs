import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const roots = ['public/assets/img'];
const patterns = roots.map((root) => `${root}/**/*.{jpg,jpeg,png,avif}`);

const files = await fg(patterns, { dot: false });

const toWebp = async (filePath) => {
  const outPath = filePath.replace(/\.(jpe?g|png|avif)$/i, '.webp');
  try {
    const [srcStat, outStat] = await Promise.all([
      fs.stat(filePath),
      fs.stat(outPath).catch(() => null),
    ]);

    if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) {
      return;
    }

    await sharp(filePath)
      .webp({ quality: 75 })
      .toFile(outPath);
  } catch (error) {
    console.error(`Failed converting ${filePath}:`, error.message);
  }
};

await Promise.all(files.map(toWebp));

console.log(`Converted ${files.length} images to WebP where needed.`);
