// Generates public/sitemap.xml and public/robots.txt with ABSOLUTE URLs.
// Domain comes from SITE_URL (or Netlify's automatic URL variable).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// tiny .env reader (no extra dependency)
for (const f of [".env", ".env.local"]) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"#]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

let site = (process.env.SITE_URL || process.env.URL || "").trim().replace(/\/+$/, "");
if (!site) {
  console.warn("\n[seo] WARNING: SITE_URL is not set. Using a placeholder domain.");
  console.warn("[seo] Set SITE_URL=https://your-domain.com before the final build.\n");
  site = "https://YOUR-DOMAIN.com";
}

const languages = ["en", "es", "ur", "de", "fr", "pt", "tr", "ja"];
const blogSrc = fs.readFileSync(path.join(root, "src/data/blogArticles.ts"), "utf8");
const blogSlugs = [...blogSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const routes = [
  ["/ai-humanizer/", "1.0", "daily"],
  ["/ai-detector/", "0.95", "daily"],
  ["/citation-generator/", "0.90", "daily"],
  ["/sentence-expander/", "0.90", "daily"],
  ["/cliche-cleaner/", "0.90", "daily"],
  ["/diff-checker/", "0.90", "daily"],
  ["/video-tools/", "0.85", "weekly"],
  ["/seo-tools/", "0.85", "weekly"],
  ["/blog/", "0.80", "weekly"],
  ...blogSlugs.map((s) => [`/blog/${s}/`, "0.75", "monthly"]),
  ["/about/", "0.50", "monthly"],
  ["/privacy/", "0.50", "monthly"],
  ["/terms/", "0.50", "monthly"],
  ["/disclaimer/", "0.50", "monthly"],
  ["/contact/", "0.50", "monthly"],
];

const today = new Date().toISOString().slice(0, 10);
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
for (const [p, priority, freq] of routes) {
  for (const lang of languages) {
    xml += `  <url>\n    <loc>${site}/${lang}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n`;
    for (const alt of languages) {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt}" href="${site}/${alt}${p}" />\n`;
    }
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/en${p}" />\n  </url>\n`;
  }
}
xml += `</urlset>\n`;

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
fs.writeFileSync(path.join(root, "public/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`[seo] ${routes.length * languages.length} URLs written for ${site}`);
