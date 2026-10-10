import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = {...loadEnv(mode, process.cwd(), ''), ...process.env};
  // Netlify sets URL automatically; locally use SITE_URL in .env
  const siteUrl = (env.SITE_URL || env.URL || '').trim().replace(/\/+$/, '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-site-url',
        transformIndexHtml: (html: string) => html.replace(/__SITE_URL__/g, siteUrl),
      },
    ],
    // F5 (2026-10-10): vendor code into stable long-lived chunks so app-code
    // changes don't bust the browser cache for react/motion/icons. Route and
    // data chunks (workspaces, i18n, blog bodies) split via dynamic import.
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
            )
              return 'vendor-react';
            if (id.includes('/motion/')) return 'vendor-motion';
            if (id.includes('/lucide-react/')) return 'vendor-icons';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {'@': path.resolve(__dirname, '.')},
    },
  };
});
