import { mkdir, cp, copyFile, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
await copyFile('index.html','dist/index.html');
const html=await readFile('dist/index.html','utf8');
await writeFile('dist/index.html', html.replace('/src/main.ts','./src/main.js'));
console.log('かわかわふらいと build complete');
