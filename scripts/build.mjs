import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';

const base = '/kawakawaflight/';

function removeStyleOnlyImports(source, specifier) {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.replace(new RegExp(`^\\s*import\\s+['\"]${escaped}['\"]\\s*;\\s*(?:\\r?\\n)?`, 'gm'), '');
}

await rm('dist/src', { recursive: true, force: true });
await rm('dist/assets', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });

await cp('dist/game', 'dist/assets/game', { recursive: true });
await rm('dist/game', { recursive: true, force: true });
let main = await readFile('dist/main.js', 'utf8');
main = removeStyleOnlyImports(main, './ui/styles.css');
await writeFile('dist/assets/main.js', main);
await cp('src/ui/styles.css', 'dist/assets/styles.css');

const fallback = `<div id="startup-error" style="display:none;margin:16px;padding:16px;border-radius:12px;background:#fff3cd;color:#18415a;font-family:sans-serif">ゲームの読み込みに失敗しました。ページを再読み込みしてください。</div>`;
const errorScript = `<script>window.addEventListener('error',function(){var e=document.getElementById('startup-error');if(e)e.style.display='block';});</script>`;
const moduleScript = `<script type="module" src="${base}assets/main.js" onerror="document.getElementById('startup-error').style.display='block'"></script>`;
const cssLink = `<link rel="stylesheet" href="${base}assets/styles.css">`;
const html = `<!doctype html><html lang="ja"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" /><meta name="theme-color" content="#8fe3ff" />${cssLink}<title>かわかわふらいと</title></head><body><main id="app" aria-label="かわかわふらいと ゲーム画面"><div id="game-container"></div>${fallback}</main>${errorScript}${moduleScript}</body></html>`;
await writeFile('dist/index.html', html);

await rm('dist/main.js', { force: true });
console.log('かわかわふらいと build complete');
