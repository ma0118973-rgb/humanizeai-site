# HumanizeAI

100% client-side React + Vite app. No API keys, no backend, no paid services.

## Run locally
    npm install
    npm run dev

## Deploy on Netlify
1. Push this folder to GitHub and import it in Netlify (build settings come from `netlify.toml`).
2. Netlify sets the site URL automatically; sitemap, robots.txt, canonical and hreflang use it.
   For a custom domain, add the environment variable `SITE_URL=https://your-domain.com`.
3. Optional AdSense: set `VITE_ADSENSE_CLIENT` and `VITE_ADSENSE_SLOT`. Ads stay hidden until both exist.
