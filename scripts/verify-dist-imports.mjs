import { access, readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const basePath = '/kawakawaflight/';
const distDir = resolve('dist');
const indexHtml = resolve(distDir, 'index.html');
const importPattern = /\bimport\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const htmlAssetPattern = /\b(?:src|href)=['"]([^'"]+)['"]/g;

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function isRelativeSpecifier(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

function resolveImport(importer, specifier) {
  return normalize(resolve(dirname(importer), specifier));
}

function formatDistPath(path) {
  return relative(process.cwd(), path).split('\\').join('/');
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function htmlAssetToDistPath(asset) {
  const path = asset.split('?')[0].split('#')[0];
  if (path.startsWith(basePath)) return resolve(distDir, path.slice(basePath.length));
  if (path.startsWith('/')) return null;
  return resolve(dirname(indexHtml), path);
}

const failures = [];

const html = await readFile(indexHtml, 'utf8');
const htmlAssets = [...html.matchAll(htmlAssetPattern)].map((match) => match[1]);
const versionedAssetPattern = new RegExp(`^${basePath}assets/([^/?#]+)/`);
const assetVersions = new Set(htmlAssets.map((asset) => asset.match(versionedAssetPattern)?.[1]).filter(Boolean));
if (assetVersions.size !== 1) {
  failures.push(`index.html must reference exactly one versioned asset directory, found: ${[...assetVersions].join(', ') || 'none'}`);
}
const [assetVersion] = assetVersions;
const assetRoot = assetVersion ? resolve(distDir, 'assets', assetVersion) : null;
const mainAsset = assetRoot ? resolve(assetRoot, 'main.js') : null;
const requiredFiles = assetRoot ? [
  'index.html',
  `assets/${assetVersion}/main.js`,
  `assets/${assetVersion}/styles.css`,
  `assets/${assetVersion}/game/data/planeParts.js`,
  `assets/${assetVersion}/game/systems/SaveSystem.js`,
  `assets/${assetVersion}/game/systems/AudioSystem.js`,
  `assets/${assetVersion}/game/systems/ResultSystem.js`,
] : ['index.html'];

for (const file of requiredFiles) {
  const target = resolve(distDir, file);
  if (await exists(target)) console.log(`OK required ${formatDistPath(target)}`);
  else failures.push(`Required artifact file is missing: ${formatDistPath(target)}`);
}

for (const match of html.matchAll(htmlAssetPattern)) {
  const asset = match[1];
  const target = htmlAssetToDistPath(asset);
  if (!target) {
    console.log(`SKIP external or root asset ${asset}`);
    continue;
  }
  if (await exists(target)) console.log(`OK index.html -> ${asset} -> ${formatDistPath(target)}`);
  else failures.push(`index.html references ${asset}, but ${formatDistPath(target)} does not exist`);
}

const jsFiles = (await listFiles(distDir)).filter((file) => extname(file) === '.js');
const checked = [];
let mainSource = '';

for (const file of jsFiles) {
  const source = await readFile(file, 'utf8');
  if (file === mainAsset) mainSource = source;
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];
    if (!isRelativeSpecifier(specifier)) continue;

    const target = resolveImport(file, specifier);
    checked.push({ importer: file, specifier, target });
    if (!(await exists(target))) {
      failures.push(`${formatDistPath(file)} imports ${specifier}, but ${formatDistPath(target)} does not exist`);
    }
    if (assetRoot && !relative(assetRoot, target).startsWith('..')) {
      continue;
    }
    failures.push(`${formatDistPath(file)} imports ${specifier} outside the versioned asset directory`);
  }
}

if (mainSource.includes('styles.css')) {
  failures.push('versioned main.js still references styles.css');
}

for (const legacyAsset of ['assets/main.js', 'assets/styles.css', 'assets/game', 'assets/generated']) {
  if (await exists(resolve(distDir, legacyAsset))) {
    failures.push(`Legacy fixed asset path remains: dist/${legacyAsset}`);
  }
}

for (const file of jsFiles) {
  if (assetRoot && relative(assetRoot, file).startsWith('..')) {
    failures.push(`JavaScript asset is outside the versioned asset directory: ${formatDistPath(file)}`);
  }
}

for (const item of checked) {
  console.log(`OK ${formatDistPath(item.importer)} -> ${item.specifier} -> ${formatDistPath(item.target)}`);
}

if (failures.length > 0) {
  console.error('Dist import verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified ${checked.length} relative JavaScript import(s) in dist.`);
