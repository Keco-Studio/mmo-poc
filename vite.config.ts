import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [{
    name: 'workbench',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/workbench', (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        // Redirect to the actual static file
        res.setHeader('Location', '/workbench.html');
        res.writeHead(302);
        res.end();
      });
    },
  }],
});
