import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Dummy favicon to stop 404
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  // Refined Proxy for games
  app.get('/api/game-proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL is required');

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        let body = await response.text();
        
        // Use the proxy as the base for relative assets
        const parsedUrl = new URL(targetUrl);
        const baseUrl = `${parsedUrl.origin}${parsedUrl.pathname.endsWith('/') ? parsedUrl.pathname : path.dirname(parsedUrl.pathname) + '/'}`;
        
        const proxyBase = `/api/game-proxy?url=${encodeURIComponent(baseUrl)}`;
        const baseTag = `<base href="${proxyBase}">`;
        
        if (body.includes('<head>')) {
          body = body.replace('<head>', `<head>${baseTag}`);
        } else if (body.includes('<html>')) {
          body = body.replace('<html>', `<html><head>${baseTag}</head>`);
        } else {
          body = baseTag + body;
        }
        
        res.set('Content-Type', 'text/html');
        return res.send(body);
      } else {
        const buffer = await response.arrayBuffer();
        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*');
        return res.send(Buffer.from(buffer));
      }
    } catch (error) {
      console.error('Proxy error for:', targetUrl, error);
      res.status(500).send('Failed to fetch game asset');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: process.cwd(), // Explicitly set root
    });
    
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // If the request looks like an asset that should have been caught by Vite, 
      // let it fall through instead of serving index.html
      if (url.includes('.') && !url.includes('?')) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
