import http from 'node:http';
import path from 'node:path';
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.ico':'image/x-icon'};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!target.startsWith(directory)) {res.writeHead(403);res.end();return;}
    if (!(await stat(target)).isFile()) throw new Error('not a file');
    const content = await readFile(target);
    res.writeHead(200, {'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {res.writeHead(404, {'Content-Type':'text/plain'});res.end('File not found');}
});
server.listen(port, '127.0.0.1', () => console.log(`Lanka ICT is ready at http://localhost:${port}`));
