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
    resolve: {
      alias: {'@': path.resolve(__dirname, '.')},
    },
  };
});
