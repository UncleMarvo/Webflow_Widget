// Simple HTTP server on port 8888 to test cross-origin embed behavior
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  // Map URL to file path (serve from project root)
  let filePath = path.join(__dirname, '..', req.url === '/' ? '/test/cross-origin-test.html' : req.url);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + req.url);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in browser to run cross-origin tests`);
});
