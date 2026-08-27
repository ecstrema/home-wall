import fs from 'node:fs/promises';
import path from 'node:path';

const sourcePath = path.resolve('src/lib/assets/blocs.svg');
const outputPath = path.resolve('src/lib/route-setter/wall.ts');
const source = await fs.readFile(sourcePath, 'utf8');
const paths = [...source.matchAll(/<path\b([^>]*)\/>/g)];

if (paths.length === 0) throw new Error('No SVG paths found');

const holds = paths.map(([, attributes], index) => {
  const pathData = attributes.match(/\bd="([^"]+)"/)?.[1];
  const transform = attributes.match(/\btransform="([^"]+)"/)?.[1];
  if (!pathData) throw new Error(`Path ${index + 1} has no d attribute`);
  return {
    id: `hold-${index + 1}`,
    path: pathData,
    ...(transform ? { transform } : {}),
  };
});

const output = `export interface Hold {\n\tid: string;\n\tpath: string;\n\ttransform?: string;\n}\n\nexport const holds: Hold[] = ${JSON.stringify(holds, null, '\t')};\n`;
await fs.writeFile(outputPath, output);
console.log(`Generated ${holds.length} holds from ${sourcePath}`);
