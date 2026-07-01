import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { watch } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProject } from './build.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, 'src');
const dist = join(__dirname, 'dist');

function contentType(filePath) {
  switch (extname(filePath)) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

function startServer() {
  const server = http.createServer((req, res) => {
    const requestedPath = req.url?.split('?')[0] || '/';
    const filePath = requestedPath === '/' ? join(dist, 'index.html') : join(dist, requestedPath);
    const resolvedPath = existsSync(filePath) ? filePath : join(dist, 'index.html');

    try {
      const data = readFileSync(resolvedPath);
      res.writeHead(200, { 'Content-Type': contentType(resolvedPath) });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  });

  server.listen(3000, () => {
    console.log('Serving dist at http://127.0.0.1:3000');
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  return server;
}

await buildProject({ dev: true });
const server = startServer();

console.log('Watching src/ for changes...');
let timeout;
const watcher = watch(src, { recursive: true }, () => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    try {
      await buildProject({ dev: true });
    } catch (error) {
      console.error('Rebuild failed:', error?.message || error);
    }
  }, 300);
});

watcher.on('error', (error) => {
  console.error('Watcher error:', error);
});

const keepAlive = setInterval(() => {}, 1000);

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('SIGINT', () => {
  watcher.close();
  server.close();
  clearInterval(keepAlive);
  process.exit();
});
