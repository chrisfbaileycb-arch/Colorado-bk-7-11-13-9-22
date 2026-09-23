import { defineConfig } from 'vite';

// Bind to localhost only. This app is never served publicly from a dev/preview server;
// production hosting is Cloudflare Pages behind Cloudflare Access.
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  preview: {
    host: '127.0.0.1',
    port: 3000,
  },
});
