import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('src/lib/assets/wall.png');
const output = path.resolve('src/lib/assets/wall.webp');

await fs.access(source);
await sharp(source)
  .webp({ quality: 82, effort: 6 })
  .toFile(output);

const [sourceStats, outputStats] = await Promise.all([
  fs.stat(source),
  fs.stat(output),
]);

console.log(`Optimized ${sourceStats.size} bytes -> ${outputStats.size} bytes`);
console.log(output);
