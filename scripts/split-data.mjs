// One-off split (2026-10-10, F5): heavy data literals out of the entry bundle.
// blogArticles.ts  -> BLOG_POSTS metadata-only + src/data/blogContent/<lang>.ts
// translations.ts  -> registry + src/data/i18n/<lang>.ts
// Kept in repo for reproducibility; NOT part of the build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function extractBalanced(src, i) {
  const open = src[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0, j = i, str = null;
  while (j < src.length) {
    const ch = src[j];
    if (str) {
      if (ch === "\\") { j += 2; continue; }
      if (ch === str) str = null;
    } else if (ch === '"' || ch === "'" || ch === "`") str = ch;
    else if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) return src.slice(i, j + 1); }
    j++;
  }
  throw new Error("Unbalanced literal");
}
function loadConst(tsPath, constName) {
  const raw = fs.readFileSync(tsPath, "utf8");
  const marker = `export const ${constName}`;
  let i = raw.indexOf(marker);
  if (i === -1) throw new Error(`const ${constName} not found in ${tsPath}`);
  i = raw.indexOf("=", i);
  while (raw[i] !== "{" && raw[i] !== "[") i++;
  return new Function(`return (${extractBalanced(raw, i)})`)();
}

const I18N_LANGS = ["en", "es", "ur", "de", "fr", "pt", "tr", "ja", "no", "nl", "it", "ru", "ur-pk"];
const BLOG_LANGS = ["en", "es", "ur", "de", "fr", "pt", "tr", "ja", "no", "nl", "it", "ur-pk"];

// ---------- translations ----------
const trSrc = fs.readFileSync(path.join(root, "src/data/translations.ts"), "utf8");
const TRANSLATIONS = loadConst(path.join(root, "src/data/translations.ts"), "TRANSLATIONS");
fs.mkdirSync(path.join(root, "src/data/i18n"), { recursive: true });
for (const code of I18N_LANGS) {
  const dict = TRANSLATIONS[code];
  if (!dict) throw new Error(`missing dict ${code}`);
  fs.writeFileSync(
    path.join(root, "src/data/i18n", `${code}.ts`),
    `// Auto-split from translations.ts (F5, 2026-10-10). Pure literal — the\n// static generator reads this file directly. Do not add imports here.\nexport const DICT = ${JSON.stringify(dict, null, 1)};\n`
  );
}
const trMarker = trSrc.indexOf("export const TRANSLATIONS");
let trHeadEnd = trSrc.lastIndexOf("// Note: the literal also carries", trMarker);
if (trHeadEnd === -1) trHeadEnd = trMarker;
const trHead = trSrc.slice(0, trHeadEnd);
const loaders = I18N_LANGS.filter((c) => c !== "en")
  .map((c) => `  ${JSON.stringify(c)}: () => import("./i18n/${c}"),`)
  .join("\n");
const newTranslations = `${trHead}// F5 (2026-10-10): per-language dictionaries live in ./i18n/<lang>.ts and are
// code-split chunks. English stays in the entry bundle as the instant default
// and universal fallback; other languages load on demand (see App gate).
import enDict from "./i18n/en";

export const TRANSLATIONS = { en: enDict } as unknown as Record<
  LanguageCode,
  TranslationDict
> & { expander?: TranslationDict["expander"] };

// Legacy top-level section (never selected as a language) — preserved verbatim.
TRANSLATIONS.expander = ${JSON.stringify(TRANSLATIONS.expander ?? null)} as TranslationDict["expander"];

const DICT_LOADERS: Partial<
  Record<LanguageCode, () => Promise<{ DICT: TranslationDict }>>
> = {
${loaders}
};

/** Load a language dictionary chunk into the registry (no-op when present). */
export async function ensureTranslations(lang: LanguageCode): Promise<void> {
  if (TRANSLATIONS[lang]) return;
  const loader = DICT_LOADERS[lang];
  if (!loader) return;
  const mod = await loader();
  (TRANSLATIONS as unknown as Record<string, unknown>)[lang] = mod.DICT;
}
`;
fs.writeFileSync(path.join(root, "src/data/translations.ts"), newTranslations);

// ---------- blog ----------
const blogPath = path.join(root, "src/data/blogArticles.ts");
const blogSrc = fs.readFileSync(blogPath, "utf8");
const POSTS = loadConst(blogPath, "BLOG_POSTS").filter((p) => p && typeof p === "object");
fs.mkdirSync(path.join(root, "src/data/blogContent"), { recursive: true });
const byLang = new Map(BLOG_LANGS.map((l) => [l, {}]));
let bodies = 0;
for (const p of POSTS) {
  const map = byLang.get(p.language) ?? byLang.get("en");
  map[p.id] = p.content || [];
  bodies++;
}
for (const [lang, map] of byLang) {
  fs.writeFileSync(
    path.join(root, "src/data/blogContent", `${lang}.ts`),
    `// Auto-split from blogArticles.ts (F5, 2026-10-10). Article bodies keyed by\n// post id. Pure literal — the static generator reads this file directly.\nexport const BLOG_CONTENT = ${JSON.stringify(map)};\n`
  );
}
const header = blogSrc.slice(0, blogSrc.indexOf("export const BLOG_POSTS"));
const tailStart = blogSrc.indexOf("export function findBlogPostBySlug");
const tail = blogSrc.slice(tailStart);
const meta = POSTS.map((p) => ({ ...p, content: [] }));
const blogLoaders = BLOG_LANGS.map(
  (l) => `  ${JSON.stringify(l)}: () => import("./blogContent/${l}"),`
).join("\n");
const newBlog = `${header}export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(meta, null, 2)} as BlogPost[];

${tail}
// F5 (2026-10-10): article bodies live in ./blogContent/<lang>.ts chunks and
// load on demand. Metadata above stays synchronous for routing/listing/SEO.
const BLOG_CONTENT_LOADERS: Record<
  string,
  () => Promise<{ BLOG_CONTENT: Record<string, string[]> }>
> = {
${blogLoaders}
};

export async function loadBlogContent(
  post: BlogPost
): Promise<string[]> {
  if (post.content && post.content.length) return post.content;
  const loader = BLOG_CONTENT_LOADERS[post.language];
  if (!loader) return [];
  try {
    const mod = await loader();
    return mod.BLOG_CONTENT[post.id] ?? [];
  } catch {
    return [];
  }
}
`;
fs.writeFileSync(blogPath, newBlog);
console.log("split done:", I18N_LANGS.length, "i18n,", bodies, "blog bodies, meta posts", meta.length);
