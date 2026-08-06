import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fetchThroughProxy } from './corsProxy';

const distDir = path.resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT) || 3000;

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res: http.ServerResponse, filePath: string, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] ?? 'application/octet-stream';
  res.writeHead(status, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

function sendText(res: http.ServerResponse, status: number, body: string, contentType: string) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (requestUrl.pathname === '/proxy') {
    const targetUrl = requestUrl.searchParams.get('url');

    if (!targetUrl) {
      sendText(res, 400, 'Falta el parámetro url', 'text/plain; charset=utf-8');
      return;
    }

    try {
      const result = await fetchThroughProxy(targetUrl);
      sendText(res, result.status, result.body, result.contentType);
    } catch (error) {
      console.error('Proxy', error);
      sendText(res, 502, 'No se pudo obtener el recurso', 'text/plain; charset=utf-8');
    }

    return;
  }

  const safePath = path.normalize(requestUrl.pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(distDir, safePath === '/' ? 'index.html' : safePath);

  if (filePath.startsWith(distDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  // SPA: rutas limpias → index.html
  sendFile(res, path.join(distDir, 'index.html'));
});

server.listen(port, () => {
  console.log(`Sirviendo dist (+ /proxy) en http://localhost:${port}`);
});
