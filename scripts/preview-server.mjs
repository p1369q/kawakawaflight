import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const base = '/kawakawaflight/';

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const pathname = url.pathname === '/' ? base : url.pathname;
    const relative = pathname.startsWith(base) ? pathname.slice(base.length) || 'index.html' : pathname.slice(1);
    const safePath = normalize(relative).replace(/^\.\.(\/|\\|$)/, '');
    const file = join(process.cwd(), 'dist', safePath);
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(4173, '0.0.0.0', () => console.log('preview: http://localhost:4173/kawakawaflight/'));
