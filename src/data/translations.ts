import { LanguageCode } from "../types";

export interface TranslationDict {
  nav?: {
    brandSubtitle: string;
    humanizerTab: string;
    detectorTab: string;
    mediaTab: string;
    blogTab: string;
    installBtn: string;
    historyBtn: string;
    blueprintBtn: string;
  };
  seo?: {
    humanizerTitle?: string;
    humanizerDesc?: string;
    detectorTitle?: string;
    detectorDesc?: string;
    mediaTitle?: string;
    mediaDesc?: string;
    seoTitle?: string;
    seoDesc?: string;
    blogTitle?: string;
    blogDesc?: string;
    citationTitle?: string;
    citationDesc?: string;
    expanderTitle?: string;
    expanderDesc?: string;
    cleanerTitle?: string;
    cleanerDesc?: string;
    diffTitle?: string;
    diffDesc?: string;
    summarizerTitle?: string;
    summarizerDesc?: string;
    imageCompressorTitle?: string;
    imageCompressorDesc?: string;
    pdfToolsTitle?: string;
    pdfToolsDesc?: string;
  };
  humanizer?: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    inputPlaceholder: string;
    humanizeBtn: string;
    processingBtn: string;
    outputTitle: string;
    outputEmpty: string;
    tones: Record<string, string>;
    levels: Record<string, string>;
    sampleSelectLabel: string;
    wordCountLabel: string;
    stages: { title: string; desc: string }[];
  };
  summarizer?: {
    badge: string;
    title: string;
    brief: string;
    balanced: string;
    detailed: string;
  };
  pdfTools?: {
    badge?: string;
    title?: string;
  };
  imageCompressor?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    dropTitle?: string;
    dropSubtitle?: string;
    qualityLabel?: string;
    formatLabel?: string;
    download?: string;
    processing?: string;
    original?: string;
    compressed?: string;
    saved?: string;
    smaller?: string;
    better?: string;
    private?: string;
    instant?: string;
    free?: string;
    quickAnswerTitle?: string;
    quickAnswer?: string;
  };
  detector?: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    inputPlaceholder: string;
    scanBtn: string;
    scanningBtn: string;
    samplesLabel: string;
    legendHuman: string;
    legendMixed: string;
    legendAi: string;
    sendToHumanizerBtn: string;
  };
  media?: {
    badge: string;
    title: string;
    subtitle: string;
    tabSeo: string;
    tabVideo: string;
    tabImage: string;
  };
  seoTool?: {
    badge: string;
    title: string;
    subtitle: string;
    topicLabel: string;
    topicPlaceholder: string;
    generateBtn: string;
  };
  otherTools?: {
    badge: string;
    title: string;
    subtitle: string;
    launchBtn: string;
    tools: {
      humanizer: { title: string; subtitle: string; desc: string; bullets: string[] };
      detector: { title: string; subtitle: string; desc: string; bullets: string[] };
      media: { title: string; subtitle: string; desc: string; bullets: string[] };
      seo: { title: string; subtitle: string; desc: string; bullets: string[] };
    };
  };

}

export const SUPPORTED_LANGUAGES: {
  code: LanguageCode;
  label: string;
  flag: string;
  region: string;
}[] = [
  { code: "en", label: "English", flag: "🇺🇸", region: "US, UK, CA, AU" },
  { code: "es", label: "Español", flag: "🇪🇸", region: "España y Latinoamérica" },
  { code: "ur", label: "Urdu", flag: "🇵🇰", region: "Pakistan aur Junubi Asia" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", region: "Deutschland, Österreich, CH" },
  { code: "fr", label: "Français", flag: "🇫🇷", region: "France et Canada" },
  { code: "pt", label: "Português", flag: "🇧🇷", region: "Brasil e Portugal" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", region: "Türkiye ve Avrasya" },
  { code: "ja", label: "日本語", flag: "🇯🇵", region: "日本" },
  { code: "no", label: "Norsk", flag: "🇳🇴", region: "Norge" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", region: "Nederland en België" },
  { code: "it", label: "Italiano", flag: "🇮🇹", region: "Italia" },
];

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  // ==========================================
  // ENGLISH (Targeting High-Volume Low-Competition Search Intent)
  // ==========================================
  en: {
    nav: {
      brandSubtitle: "Turn AI Text into Natural, Human-Sounding Writing",
      humanizerTab: "AI Humanizer",
      detectorTab: "AI Detector",
      mediaTab: "Reels Studio",
      blogTab: "Guides",
      installBtn: "Install App",
      historyBtn: "History",
      blueprintBtn: "Blueprint",
    },
    seo: {
      pdfToolsTitle: "Free PDF Tools Online – Merge PDF & Images to PDF (2026)",
      pdfToolsDesc: "Free PDF tools. Merge multiple PDFs into one, or convert JPG/PNG images to PDF. 100% in-browser, no upload, no signup.",
      imageCompressorTitle: "Free Image Compressor Online – Compress JPG, PNG, WebP (2026)",
      imageCompressorDesc: "Free image compressor. Compress JPG, PNG & WebP right in your browser. No upload, no signup. 100% private.",
      humanizerTitle: "Free AI Text Humanizer – Natural-Sounding AI Text (2026)",
      humanizerDesc: "Free AI Humanizer. Convert ChatGPT, Claude & Gemini text into natural, human-sounding writing with zero word limits.",
      detectorTitle: "Free AI Content Detector – No Sign-Up, Sentence Heatmap Scanner",
      detectorDesc: "Scan documents with our own pattern-based writing analyzer. Pinpoint robotic sentences with line-by-line visual heatmaps. Independent estimate — not an official detector result.",
      mediaTitle: "AI Video Reels & Watermark Remover Studio – TikTok & Shorts Safe",
      mediaDesc: "Strip corner logos and watermarks from AI reels and videos. Enhance frame pacing, optical film grain, and voiceover naturalness.",
      seoTitle: "High-RPM Viral SEO & Hashtag Generator – Google Rank #1",
      seoDesc: "Generate high-CTR Google meta titles, descriptions, and trending hashtags for YouTube Shorts, TikTok, and blogs without paying subscriptions.",
      blogTitle: "AI Detection & Humanization Guides (2026 Edition)",
      blogDesc: "In-depth guides on perplexity, burstiness, readability metrics, and ethical AI-assisted writing workflows for students and creators.",
      citationTitle: "Free Citation Generator – APA 7, MLA 9, Chicago & Harvard (No Sign-Up)",
      citationDesc: "Generate APA 7th, MLA 9th, Chicago and Harvard citations instantly for academic essays and dissertations.",
      expanderTitle: "Free Sentence Expander – No Word Limit, Academic Depth Enhancer",
      expanderDesc: "Expand short sentences into scholarly paragraphs with causal reasoning, high perplexity, and natural burstiness. 100% free with no word limits.",
      summarizerTitle: "Free AI Text Summarizer – Summarize Articles in Seconds (2026)",
      summarizerDesc: "Free text summarizer. Paste long articles, papers & documents — get instant extractive summaries in 8 languages. No sign-up.",
      cleanerTitle: "AI Cliché & Buzzword Purger – De-AI Polish & Hallmark Remover",
      cleanerDesc: "Scan and strip dead-giveaway AI clichés ('delve', 'tapestry', 'testament') with 1-click organic human vocabulary replacements.",
      diffTitle: "Paraphrase Similarity & Text Diff Checker – Word Change Analysis",
      diffDesc: "Compare original AI draft vs rewritten human text side-by-side with color-coded word diff and % similarity score.",
    },
    pdfTools: {
      badge: "PDF Tools",
      title: "Merge PDF & Convert Images to PDF — Free",
    },
    imageCompressor: {
      badge: "Image Compressor",
      title: "Compress Images Online — Free, Private, Instant",
    },
    summarizer: {
      badge: "AI Text Summarizer",
      title: "Summarize Any Text in Seconds",
      brief: "Brief",
      balanced: "Balanced",
      detailed: "Detailed",
    },
    humanizer: {
      badge: "⭐ 100% Free Forever • Zero Word Limits • No Sign-Up",
      heroTitle: "Transform Robotic AI Text Into Natural Human Prose",
      heroSubtitle: "Add natural sentence variety and an organic human cadence. Completely free forever.",
      inputPlaceholder: "Paste your AI-generated text here (from ChatGPT, Claude, Gemini, DeepSeek, Jasper)...",
      humanizeBtn: "Humanize Text",
      processingBtn: "Synthesizing Organic Human Cadence...",
      outputTitle: "Humanized Output & Live Authenticity Metrics",
      outputEmpty: "Click 'Humanize Text' to see your rewritten text and readability metrics.",
      tones: {
        conversational: "Conversational & Natural",
        academic: "Academic (Formal Tone)",
        professional: "Executive Professional",
        creative: "Creative & Engaging",
        balanced: "Balanced & Versatile",
      },
      levels: {
        standard: "Standard Polish",
        stealth: "Stealth (Natural Rewrite)",
        ultraStealth: "Ultra Stealth (Max Burstiness)",
      },
      sampleSelectLabel: "Or try a pre-loaded sample:",
      wordCountLabel: "words",
      stages: [
        { title: "Analyzing Sentence Entropy", desc: "Evaluating token predictability and repetitive AI patterns..." },
        { title: "Breaking Robotic Cadence", desc: "Injecting authentic human pacing & dynamic burstiness..." },
        { title: "Purging Synthetic Hallmarks", desc: "Removing sterile vocabulary cliches ('delve', 'tapestry', 'testament')..." },
        { title: "Final Review", desc: "Final readability and flow check..." },
      ],
    },
    detector: {
      badge: "Pattern-Based Writing Analyzer",
      heroTitle: "Free AI Content Detector & Sentence Heatmap Scanner",
      heroSubtitle: "Analyze writing patterns with our own heuristic scanner. Instant sentence-by-sentence visual analysis. Our independent estimate — not an official Turnitin or GPTZero result.",
      inputPlaceholder: "Paste your essay, article, or document here to scan across 4 AI detection models...",
      scanBtn: "Scan For AI Indicators",
      scanningBtn: "Analyzing writing patterns...",
      samplesLabel: "Quick Test Samples:",
      legendHuman: "Human Writing",
      legendMixed: "Mixed / Borderline",
      legendAi: "High AI Risk",
      sendToHumanizerBtn: "1-Click Fix: Humanize This Text Now",
    },
    media: {
      badge: "Creator Media & Watermark Studio",
      title: "AI Video Reels & Watermark Removal Studio",
      subtitle: "Clean corner watermarks, strip synthetic metadata, and humanize frame pacing for YouTube Shorts & TikTok.",
      tabSeo: "Viral Video SEO & Hook Script",
      tabVideo: "Video Watermark & Pacing",
      tabImage: "Image Metadata & C2PA Cleaner",
    },
    seoTool: {
      badge: "High-RPM Growth Engine",
      title: "Viral SEO Meta Generator & Trending Hashtags",
      subtitle: "Generate high-CTR Google search metadata, targeted buyer keywords, and viral TikTok/Shorts hashtags.",
      topicLabel: "Topic, Article Draft, or Keyword Niche",
      topicPlaceholder: "e.g. Free AI text humanizer for natural-sounding writing...",
      generateBtn: "Generate High-RPM SEO Assets",
    },
    otherTools: {
      badge: "Creator Power Suite",
      title: "Explore Other High-Performance Tools",
      subtitle: "Switch between tools with one tap — everything you need for human writing, AI verification, and viral reach.",
      launchBtn: "Launch Tool",
      tools: {
        humanizer: {
          title: "AI Text Humanizer",
          subtitle: "Natural, Human-Sounding Rewrites",
          desc: "Turn robotic ChatGPT, Claude, and Gemini text into natural human writing with high perplexity and burstiness.",
          bullets: ["Natural-Sounding Rewrites", "5 Human Writing Tone Styles", "1-Click Word (.docx) & TXT Export"],
        },
        detector: {
          title: "Enterprise AI Content Detector 4.0",
          subtitle: "Sentence-by-Sentence AI Heatmap",
          desc: "Scan any document or essay against Turnitin, GPTZero, Copyleaks, and Quillbot. Highlights robotic sentences in red and human sentences in green.",
          bullets: ["Vivid Red & Green Heatmap", "Simulated Institutional Models", "1-Click Send to Humanizer"],
        },
        media: {
          title: "AI Video Reels & Watermark Studio",
          subtitle: "Corner Watermark & Logo Stripper",
          desc: "Remove annoying logos and watermarks from downloaded videos using smart corner masking and edge punch zoom. Perfect for viral Reels & Shorts.",
          bullets: ["Corner Watermark & Logo Remover", "Viral Pacing & Humanized Frame Rate", "Monetization & Copyright Safe"],
        },
        seo: {
          title: "High-RPM SEO & Viral Hashtags",
          subtitle: "Rank #1 on Google & YouTube",
          desc: "Generate high-paying search keywords, viral TikTok/YouTube hashtags, and meta tags engineered to boost traffic and ad earnings.",
          bullets: ["High RPM/CPC Keyword Suggestions", "Viral YouTube & TikTok Hashtags", "1-Click Copy to Clipboard"],
        },
      },
    },

  },

  // ==========================================
  // SPANISH (Español - Keywords: humanizar texto IA online gratis, evitar detección IA universidad)
  // ==========================================
  es: {
    nav: {
      brandSubtitle: "Convierte Texto de IA en Escritura Humana Natural",
      humanizerTab: "Humanizador IA",
      detectorTab: "Detector de IA",
      mediaTab: "Estudio de Reels",
      blogTab: "Guías y Artículos",
      installBtn: "Instalar App",
      historyBtn: "Historial",
      blueprintBtn: "Estrategia",
    },
    seo: {
      pdfToolsTitle: "Herramientas PDF Gratis Online – Unir PDF e Imágenes a PDF (2026)",
      pdfToolsDesc: "Herramientas PDF gratuitas. Une varios PDF en uno o convierte imágenes JPG/PNG a PDF. 100% en el navegador, sin subir archivos.",
      imageCompressorTitle: "Compresor de Imágenes Gratis Online – JPG, PNG, WebP (2026)",
      imageCompressorDesc: "Compresor de imágenes gratuito. Comprime JPG, PNG y WebP en tu navegador. Sin subir, sin registro. 100% privado.",
      humanizerTitle: "Humanizar Texto IA Gratis Sin Registro – Escritura Natural (2026)",
      humanizerDesc: "Herramienta gratuita para humanizar textos de IA. Transforma ChatGPT en contenido humano más natural, sin límites.",
      detectorTitle: "Detector de IA Gratis para Textos en Español – Mapa de Calor",
      detectorDesc: "Escanea textos con nuestro analizador de patrones de escritura. Descubre frases robóticas con mapa visual en tiempo real. Estimación propia, no un resultado oficial.",
      mediaTitle: "Eliminar Marcas de Agua en Videos IA – Reels de TikTok y Shorts",
      mediaDesc: "Quita logos y marcas de agua de videos de IA. Ajusta ritmo de fotogramas, grano analógico y modula voces sintéticas sin programas de pago.",
      seoTitle: "Generador de SEO y Hashtags Virales Gratis – Posiciona en Google",
      seoDesc: "Genera títulos SEO de alto CTR, meta descripciones y hashtags virales para YouTube Shorts, TikTok y blogs en español sin suscripciones.",
      blogTitle: "Guías de Detección de IA y Humanización (Edición 2026)",
      blogDesc: "Tutoriales y análisis para mejorar textos de IA, lograr una escritura natural y optimizar contenidos para Google Helpful Content.",
      citationTitle: "Generador de Citas Académicas Gratis – Formato APA 7, MLA 9 y Chicago",
      citationDesc: "Genera referencias bibliográficas en formato APA 7, MLA 9 y Chicago online gratis. Ideal para tesis universitarias y referencias correctas.",
      expanderTitle: "Expansor de Frases Académicas – Aumenta Perplejidad y Longitud",
      expanderDesc: "Expande frases cortas y notas en párrafos académicos rigurosos con alta perplejidad y variedad sintáctica. 100% gratis sin límite.",
      summarizerTitle: "Resumidor de Texto IA Gratis – Resume Artículos en Segundos (2026)",
      summarizerDesc: "Resumidor de texto gratuito. Pega artículos largos y obtén resúmenes instantáneos en 8 idiomas. Sin registro.",
      cleanerTitle: "Limpiador de Clichés y Palabras Típicas de IA – Pulido Humano",
      cleanerDesc: "Detecta y elimina palabras delatoras de ChatGPT ('crucial', 'tapiz', 'testimonio') sustituyéndolas por vocabulario humano natural.",
      diffTitle: "Comparador de Similitud y Diferencias de Texto – Análisis de Cambios",
      diffDesc: "Compara el borrador original de IA con el texto humanizado en tiempo real. Diferencias visuales palabra por palabra y porcentaje de similitud.",
    },
    pdfTools: {
      badge: "Herramientas PDF",
      title: "Unir PDF y Convertir Imágenes a PDF — Gratis",
    },
    imageCompressor: {
      badge: "Compresor de Imágenes",
      title: "Comprime Imágenes Online — Gratis, Privado, Instantáneo",
    },
    summarizer: {
      badge: "Resumidor de Texto IA",
      title: "Resume Cualquier Texto en Segundos",
      brief: "Breve",
      balanced: "Equilibrado",
      detailed: "Detallado",
    },
    humanizer: {
      badge: "⭐ 100% Gratis Para Siempre • Sin Límite de Palabras • Sin Registro",
      heroTitle: "Humanizar Texto IA Online Gratis: Hazlo Sonar Natural",
      heroSubtitle: "Mejora textos de IA con variación sintáctica y ritmo humano natural. Sin tarjetas de crédito ni suscripciones mensuales.",
      inputPlaceholder: "Pega aquí tu texto generado por IA (ChatGPT, Claude, Gemini, DeepSeek, Jasper)...",
      humanizeBtn: "Humanizar Texto Ahora",
      processingBtn: "Sintetizando Redacción Humana Natural...",
      outputTitle: "Texto Humanizado y Métricas de Autenticidad",
      outputEmpty: "Haz clic en 'Humanizar Texto' para eludir detectores de IA y verificar en vivo.",
      tones: {
        conversational: "Conversacional y Cercano",
        academic: "Académico (Tono Formal)",
        professional: "Profesional Ejecutivo",
        creative: "Creativo y Narrativo",
        balanced: "Equilibrado y Versátil",
      },
      levels: {
        standard: "Pulido Estándar",
        stealth: "Sigilo (Evade Detectores)",
        ultraStealth: "Ultra Sigilo (Máxima Variación)",
      },
      sampleSelectLabel: "O prueba un ejemplo precargado:",
      wordCountLabel: "palabras",
      stages: [
        { title: "Analizando Entropía del Texto", desc: "Evaluando previsibilidad de palabras y patrones robóticos..." },
        { title: "Rompiendo Cadencia Artificial", desc: "Inyectando variación de longitud de frases y ritmo humano..." },
        { title: "Eliminando Clichés de IA", desc: "Sustituyendo palabras mecánicas y transiciones forzadas..." },
        { title: "Verificación de Sigilo", desc: "Comprobando 0% de detección en modelos Turnitin y GPTZero..." },
      ],
    },
    detector: {
      badge: "Escáner Institucional Multi-Modelo",
      heroTitle: "Detector de IA Gratis con Mapa de Calor por Frases",
      heroSubtitle: "Analiza la escritura con nuestro propio analizador de patrones. Detección visual línea por línea en tiempo real. Estimación propia, no un resultado oficial.",
      inputPlaceholder: "Pega tu ensayo, artículo o documento para escanearlo contra 4 detectores de IA...",
      scanBtn: "Escanear Contenido IA (0% Falsos Positivos)",
      scanningBtn: "Analizando 4 Modelos Neuronales...",
      samplesLabel: "Ejemplos de Prueba Rápida:",
      legendHuman: "Escritura Humana",
      legendMixed: "Señal Mixta / Dudosa",
      legendAi: "Alto Riesgo de IA",
      sendToHumanizerBtn: "1 Clic: Humanizar Este Texto Ahora",
    },
    media: {
      badge: "Estudio Audiovisual Creadores",
      title: "Eliminador de Marcas de Agua y Ritmo de Reels",
      subtitle: "Limpia logos de esquinas, elimina metadatos C2PA y humaniza la cadencia de video para YouTube Shorts y TikTok.",
      tabSeo: "SEO Viral y Guión de Gancho",
      tabVideo: "Marca de Agua y Fotogramas",
      tabImage: "Limpiador de Metadatos C2PA",
    },
    seoTool: {
      badge: "Motor de Alto Rendimiento",
      title: "Generador de SEO Viral, Meta Tags y Hashtags",
      subtitle: "Crea títulos de alto CTR, palabras clave de compradores y hashtags en tendencia para posicionar #1 en Google.",
      topicLabel: "Tema, Borrador del Artículo o Nicho",
      topicPlaceholder: "Ej: Cómo humanizar texto de IA online gratis para la universidad...",
      generateBtn: "Generar Activos SEO de Alto RPM",
    },
    otherTools: {
      badge: "Suite Completa para Creadores",
      title: "Explora Nuestras Otras Herramientas Gratuitas",
      subtitle: "Cambia entre utilidades con un toque: todo lo necesario para redactar, verificar y posicionar en buscadores.",
      launchBtn: "Abrir Herramienta",
      tools: {
        humanizer: {
          title: "Humanizador de Texto IA",
          subtitle: "Evita Turnitin, GPTZero y Copyleaks",
          desc: "Transforma textos artificiales en redacción humana natural con alta perplejidad y variedad estructural.",
          bullets: ["Reescritura más natural", "5 Estilos de Redacción Humana", "Exportación Rápida a Word y TXT"],
        },
        detector: {
          title: "Detector de Contenido IA Empresarial 4.0",
          subtitle: "Mapa de Calor Frase a Frase",
          desc: "Escanea cualquier documento frente a los 4 detectores institucionales más usados. Resalta frases robóticas en rojo y humanas en verde.",
          bullets: ["Mapa Visual Rojo y Verde", "Modelos Universitarios Simulados", "Envío Directo al Humanizador"],
        },
        media: {
          title: "Estudio de Video Reels y Marcas de Agua",
          subtitle: "Limpia Logos y Metadatos de IA",
          desc: "Elimina marcas de agua molestas de videos descargados con recorte óptico inteligente. Apto para monetización en Shorts y TikTok.",
          bullets: ["Quita Marcas de Agua en Esquinas", "Ritmo y Fotogramas Humanizados", "Seguro para Monetización"],
        },
        seo: {
          title: "Optimizador SEO de Alto RPM y Hashtags",
          subtitle: "Posiciona #1 en Google y YouTube",
          desc: "Genera palabras clave de alto CPC, etiquetas virales y meta etiquetas para maximizar visitas y ganancias orgánicas.",
          bullets: ["Palabras Clave de Alto CPC", "Hashtags Virales para Redes", "Copia Rápida al Portapapeles"],
        },
      },
    },

  },

  // ==========================================
  // URDU (Roman Urdu - Keywords: AI text ko insani banana, qudrati tehreer ke tareeqe)
  // ==========================================
  ur: {
    nav: {
      brandSubtitle: "AI ke text ko qudrati insani andaz ki tehreer mein badlein",
      humanizerTab: "AI Humanizer",
      detectorTab: "AI Detector",
      mediaTab: "Reels Studio",
      blogTab: "Rehnuma Guides",
      installBtn: "App Install Karein",
      historyBtn: "History",
      blueprintBtn: "Market Blueprint",
    },
    seo: {
      pdfToolsTitle: "Free PDF Tools Online – PDF Merge Karen Aur Images Se PDF (2026)",
      pdfToolsDesc: "Muft PDF tools. Kayi PDFs ko ek mein merge karen ya JPG/PNG images se PDF banayen. Browser mein, koi upload nahi.",
      imageCompressorTitle: "Free Image Compressor Online – JPG, PNG Compress Karen (2026)",
      imageCompressorDesc: "Muft image compressor. JPG, PNG aur WebP ko browser mein compress karen. Koi upload nahi, koi signup nahi.",
      humanizerTitle: "AI Text Ko Insani Banana \u2013 Muft Qudrati Tehreer Ka Tool (2026)",
      humanizerDesc: "100% muft Urdu aur English AI humanizer. ChatGPT aur Gemini ki machinei tehreer ko zyada qudrati insani andaz ki tehreer mein tabdeel karein.",
      detectorTitle: "Muft AI Content Detector \u2013 Jumla Ba Jumla Risk Heatmap Scanner",
      detectorDesc: "Apne mazameen aur tehreeron ka hamare apne pattern analyzer se muft tajziya karein. Har machinei jumle ko rangeen heatmap ke saath pehchanein. Ye hamara apna takhmeena hai, sarkari nateeja nahi.",
      mediaTitle: "AI Video Reels Aur Watermark Hatane Ka Studio \u2013 Shorts o TikTok",
      mediaDesc: "Videos se watermark aur logo saaf karein. Video ke frame rate aur awaz ko behtar bana kar YouTube Shorts ke liye tayyar karein.",
      seoTitle: "High RPM Viral SEO Aur Hashtag Generator \u2013 Muft Meta Tags Tool (2026)",
      seoDesc: "High CTR Google meta titles, descriptions aur YouTube Shorts ke viral hashtags muft mein hasil karein baghair kisi paid tool ke.",
      blogTitle: "AI Detection Aur Humanization Guides (2026 Edition)",
      blogDesc: "University students aur bloggers ke liye qudrati tehreer, Google helpful content aur machinei tehreer ko behtar banane ke mukammal tareeqe aur rehnuma mazameen.",
      citationTitle: "Muft Taleemi Hawala Jaat Generator \u2013 APA 7 Aur MLA 9 Formatter",
      citationDesc: "Tehqeeqi maqalon aur thesis ke liye APA 7, MLA 9 aur Chicago format mein muft hawala jaat aur kitabiyaat tayyar karein. Har hawale ko durust academic format mein likhein.",
      expanderTitle: "Academic Jumla Expander \u2013 Fiqron Ki Tawalat Aur Gehraai Mein Izafa",
      expanderDesc: "Mukhtasir aur machinei jumlon ko ilmi aur jamey paragraph mein tabdeel karein. Jumlon ke tanawwu aur rawani mein izafa.",
      summarizerTitle: "Free AI Text Summarizer – Articles Ko Seconds Mein Summarize Karen (2026)",
      summarizerDesc: "Muft text summarizer. Lambe articles paste karen — 8 languages mein fori summary payein. Koi sign-up nahi.",
      cleanerTitle: "AI Cliche Aur Rawayati Alfaz Ki Safai \u2013 Machinei Naqoosh Ka Khatma",
      cleanerDesc: "Machinei alfaz ('delve', 'tapestry', 'testament') ki fori nishandahi aur 1 click mein qudrati insani mutabadil alfaz se tabdeeli.",
      diffTitle: "Text Mushabihat Aur Farq Checker \u2013 Similarity Risk Score",
      diffDesc: "Asal aur humanized text ka aamne saamne jaiza lein. Rangeen lafz ba lafz farq aur mushabihat ka feesad score check karein.",
    },
    pdfTools: {
      badge: "PDF Tools",
      title: "PDF Merge Karen Aur Images Se PDF Banayen — Muft",
    },
    imageCompressor: {
      badge: "Image Compressor",
      title: "Images Ko Online Compress Karen — Muft, Private, Fori",
    },
    summarizer: {
      badge: "AI Text Summarizer",
      title: "Kisi Bhi Text Ko Seconds Mein Summarize Karen",
      brief: "Mukhtasar",
      balanced: "Mutawazin",
      detailed: "Tafseeli",
    },
    humanizer: {
      badge: "\u2b50 Hamesha ke liye 100% muft \u2022 Baghair kisi lafz ki had \u2022 Baghair login",
      heroTitle: "Machinei AI Tehreer Ko Qudrati Insani Andaz Ki Tehreer Mein Tabdeel Karein",
      heroSubtitle: "Ghair mamooli rawani, jumlon ke qudrati tanawwu aur baghair kisi credit card ke.",
      inputPlaceholder: "Yahan apna AI ka tayyar karda text paste karein (ChatGPT, Claude, Gemini, DeepSeek waghera)...",
      humanizeBtn: "Text Ko Abhi Humanize Karein",
      processingBtn: "Insani lehja aur rawani shamil ki ja rahi hai...",
      outputTitle: "Humanized Nateeja Aur Barah-e-Rast Sadaqat Ke Metrics",
      outputEmpty: "Qudrati insani tehreer ke liye 'Text Ko Abhi Humanize Karein' par click karein.",
      tones: {
        conversational: "Guftagu ka rawayati andaz (Conversational)",
        academic: "Taleemi aur tehqeeqi (rasmi andaz)",
        professional: "Pesha warana aur daftari (Professional)",
        creative: "Takhleeqi aur dilchasp (Creative)",
        balanced: "Mutawazin aur aam fehm (Balanced)",
      },
      levels: {
        standard: "Mayari behtari (Standard)",
        stealth: "Stealth Mode (Zyada Qudrati Tehreeri Andaz)",
        ultraStealth: "Ultra Stealth (Zyada Se Zyada Tanawwu)",
      },
      sampleSelectLabel: "Ya tayyar shuda namuna tehreer muntakhib karein:",
      wordCountLabel: "Alfaz",
      stages: [
        { title: "Jumlon Ki Sakht Ka Tajziya", desc: "Machinei alfaz ki takrar aur ghair lachakdar fiqron ki jaanch..." },
        { title: "Robotic Andaz Ka Khatma", desc: "Jumlon ki lambai mein fitri insani utar charhao shamil karna..." },
        { title: "Masnoi Alfaz Ki Safai", desc: "Machinei lage bandhe fiqron aur rawayati AI cliches ki tatheer..." },
        { title: "Hatmi Jaiza", desc: "Rawani aur parhne ki aasani ki aakhri jaanch..." },
      ],
    },
    detector: {
      badge: "Tehreeri Pattern Check Karne Wala AI Scanner",
      heroTitle: "Muft AI Content Detector Aur Rangeen Jumla Ba Jumla Heatmap",
      heroSubtitle: "Apne document ka fori andaza lagayein. Ye hamara apna takhmeena hai, Turnitin ya kisi aur detector ka sarkari nateeja nahi.",
      inputPlaceholder: "Apna mazmoon, research paper ya blog post yahan paste karein taake hamare pattern analyzer se scan kiya ja sake...",
      scanBtn: "AI Ke Liye Scan Karein (Tehreeri Pattern Check)",
      scanningBtn: "Scanning jari hai...",
      samplesLabel: "Fori Test Ke Namune:",
      legendHuman: "Mukammal Insani Tehreer (Sabz)",
      legendMixed: "Mashkook Jumla (Peela)",
      legendAi: "Machinei AI Tehreer (Surkh)",
      sendToHumanizerBtn: "1 Click Mein Hal: Is Tehreer Ko Abhi Humanize Karein",
    },
    media: {
      badge: "Video o Media Takhleeq Kar Studio",
      title: "AI Video Reels Aur Watermark Hatane Ka Studio",
      subtitle: "Videos se kone ke watermark aur logo hatayein, metadata saaf karein aur YouTube Shorts ke liye frame rate durust karein.",
      tabSeo: "Viral Video SEO Aur Hook Script",
      tabVideo: "Video Watermark Aur Frame Rate",
      tabImage: "Tasaveer Se C2PA Metadata Safai",
    },
    seoTool: {
      badge: "High RPM Growth Engine",
      title: "Viral SEO Meta Tags Aur Trending Hashtag Generator",
      subtitle: "High CTR meta titles, search keywords aur TikTok o Shorts ke viral hashtags banayein.",
      topicLabel: "Mauzu, Mazmoon Ka Draft Ya Keyword Niche",
      topicPlaceholder: "Misaal: AI text ko qudrati insani andaz mein likhna...",
      generateBtn: "High RPM SEO Mawad Hasil Karein",
    },
    otherTools: {
      badge: "Creators Ke Liye Power Suite",
      title: "Hamare Deegar Tez Tareen Aur Muft Tools Aazmayein",
      subtitle: "Sirf ek click par tools tabdeel karein \u2014 insani tehreer, tasdeeq aur YouTube ranking ke liye tamam zaroori sahuliyaat.",
      launchBtn: "Tool Kholein",
      tools: {
        humanizer: {
          title: "AI Text Humanizer",
          subtitle: "Machinei Tehreer Ko Qudrati Banayein",
          desc: "ChatGPT aur deegar tools ke machinei mawad ko qudrati insani tehreer mein badlein. Qudrati insani rawani ke saath.",
          bullets: ["Qudrati insani tehreeri andaz", "5 mukhtalif insani tehreeri andaz", "1 click mein Word aur TXT download"],
        },
        detector: {
          title: "AI Content Detector",
          subtitle: "Jumla Ba Jumla Rangeen Heatmap",
          desc: "Kisi bhi dastavez ko hamare tehreeri pattern analyzer par parkhein. Robotic jumle surkh aur insani jumle sabz rang mein dekhein.",
          bullets: ["Wazeh surkh aur sabz rangeen heatmap", "Jumla ba jumla pattern tajziya", "1 click mein humanizer ko bhejein"],
        },
        media: {
          title: "Video Reels Aur Watermark Studio",
          subtitle: "Logo Aur Watermark Hatane Ka Tool",
          desc: "Download karda videos se ghair zaroori watermark saaf karein. YouTube Shorts aur TikTok ke liye behtareen.",
          bullets: ["Kone ke watermark ki safai", "Fitri video frame rate aur raftaar", "Monetization-friendly video tayyari"],
        },
        seo: {
          title: "High RPM SEO Aur Viral Hashtags",
          subtitle: "Google Aur YouTube Par Behtar Dikhein",
          desc: "Zyada aamdani wale keywords, search tags aur social hashtags hasil karein taake aap ki website ki traffic mein izafa ho.",
          bullets: ["Zyada CPC wale keywords", "Viral YouTube aur TikTok tags", "1 click mein fori copy karein"],
        },
      },
    },

  },

  // ==========================================
  // GERMAN (Deutsch - Keywords: KI-Texte menschlicher machen kostenlos, KI-Detektor umgehen)
  // ==========================================
  de: {
    nav: {
      brandSubtitle: "KI-Texte in natürlich klingende menschliche Schrift umwandeln",
      humanizerTab: "KI-Humanisierer",
      detectorTab: "KI-Detektor",
      mediaTab: "Reels Studio",
      blogTab: "Ratgeber",
      installBtn: "App installieren",
      historyBtn: "Verlauf",
      blueprintBtn: "Blueprint",
    },
    seo: {
      pdfToolsTitle: "Kostenlose PDF-Tools Online – PDF Zusammenführen & Bilder zu PDF (2026)",
      pdfToolsDesc: "Kostenlose PDF-Tools. Mehrere PDFs zusammenführen oder JPG/PNG-Bilder in PDF umwandeln. 100% im Browser, kein Upload.",
      imageCompressorTitle: "Kostenloser Bildkompressor Online – JPG, PNG, WebP (2026)",
      imageCompressorDesc: "Kostenloser Bildkompressor. JPG, PNG & WebP direkt im Browser komprimieren. Kein Upload, keine Anmeldung. 100% privat.",
      humanizerTitle: "KI Text Umschreiben Kostenlos Ohne Anmeldung – Natürlicher Stil (2026)",
      humanizerDesc: "100% kostenloser KI-Humanizer. ChatGPT-Texte in natürliche menschliche Sprache umwandeln – ganz ohne Wortbegrenzung.",
      detectorTitle: "KI Detektor für Deutsche Texte Kostenlos – Sätze Farbig Markiert",
      detectorDesc: "Überprüfen Sie Texte auf KI-Spuren mit simulierten Modellen von Turnitin, GPTZero und Copyleaks. Präzise Heatmap ohne Fehlalarme.",
      mediaTitle: "KI-Video Reels & Wasserzeichen-Entferner Studio",
      mediaDesc: "Wasserzeichen und Logos von KI-generierten Videos entfernen. Natürliche Bildraten und authentische Stimmführung für YouTube Shorts.",
      seoTitle: "SEO & Virale Hashtags Generator – Google Ranking #1",
      seoDesc: "Generieren Sie klickstarke Meta-Titel, Beschreibungen und Trend-Hashtags für YouTube Shorts und Blogs ohne teure Abonnements.",
      blogTitle: "KI-Erkennung & Humanisierung Leitfaden (2026)",
      blogDesc: "Praxis-Tipps zur Umgehung von Turnitin an Universitäten, Perplexitäts-Algorithmen und E-E-A-T Richtlinien für Google.",
      citationTitle: "Kostenloser Zitationsgenerator – APA, MLA & Chicago",
      citationDesc: "Kostenlose Zitationen in APA, MLA und Chicago – ohne Anmeldung, direkt im Browser.",
      expanderTitle: "Kostenloser Satz-Expander – Texte Verlängern Ohne Wortlimit",
      expanderDesc: "Kurze Sätze zu ausführlichen Absätzen erweitern – kostenlos und ohne Wortlimit.",
      summarizerTitle: "Kostenloser KI-Text-Zusammenfasser – Artikel in Sekunden (2026)",
      summarizerDesc: "Kostenloser Text-Zusammenfasser. Lange Artikel einfügen — sofortige Zusammenfassungen in 8 Sprachen. Keine Anmeldung.",
      cleanerTitle: "KI-Klischee-Entferner – Floskeln Kostenlos Bereinigen",
      cleanerDesc: "KI-Floskeln und Buzzwords finden und durch natürliche Formulierungen ersetzen.",
    },
    pdfTools: {
      badge: "PDF-Tools",
      title: "PDF Zusammenführen & Bilder zu PDF — Kostenlos",
    },
    imageCompressor: {
      badge: "Bildkompressor",
      title: "Bilder Online Komprimieren — Kostenlos, Privat, Sofort",
    },
    summarizer: {
      badge: "KI-Text-Zusammenfasser",
      title: "Jeden Text in Sekunden Zusammenfassen",
      brief: "Kurz",
      balanced: "Ausgewogen",
      detailed: "Ausführlich",
    },
    humanizer: {
      badge: "⭐ 100% Dauerhaft Kostenlos • Keine Wortlimits • Ohne Anmeldung",
      heroTitle: "KI-Texte menschlicher machen",
      heroSubtitle: "Natürlicher Satzrhythmus und flüssiger Lesefluss für KI-Texte. Komplett kostenlos.",
      inputPlaceholder: "Fügen Sie hier Ihren KI-generierten Text ein (aus ChatGPT, Claude, Gemini)...",
      humanizeBtn: "Text Jetzt Humanisieren",
      processingBtn: "Menschlicher Schreibstil wird generiert...",
      outputTitle: "Humanisierter Text & Echtheits-Metriken",
      outputEmpty: "Klicken Sie auf 'Text Jetzt Humanisieren' für natürlichere Texte.",
      tones: {
        conversational: "Umgangssprachlich & Natürlich",
        academic: "Akademisch (Turnitin-Sicher)",
        professional: "Professionell Sachlich",
        creative: "Kreativ & Lebendig",
        balanced: "Ausgewogen",
      },
      levels: {
        standard: "Standard-Verfeinerung",
        stealth: "Stealth (Natürliches Umschreiben)",
        ultraStealth: "Ultra Stealth (Maximale Variation)",
      },
      sampleSelectLabel: "Oder Beispieltext wählen:",
      wordCountLabel: "Wörter",
      stages: [
        { title: "Satzentropie analysieren", desc: "Überprüfung von KI-typischen Wortfolgen..." },
        { title: "Roboterhafte Rhythmen aufbrechen", desc: "Einfügen natürlicher Satzlängen-Variationen..." },
        { title: "KI-Floskeln entfernen", desc: "Ersetzen mechanischer Signalwörter..." },
        { title: "Stealth-Prüfung", desc: "Bestätigung von 0% KI-Erkennung..." },
      ],
    },
    detector: {
      badge: "Multi-Modell Analysewerkzeug",
      heroTitle: "Kostenloser KI-Detektor mit visueller Satz-Heatmap",
      heroSubtitle: "Analysieren Sie Texte mit unserem eigenen Muster-Analyzer. Verdächtige Sätze werden in Echtzeit farblich hervorgehoben. Eigene Einschätzung, kein offizielles Ergebnis.",
      inputPlaceholder: "Fügen Sie Ihre Arbeit oder Ihren Text hier ein...",
      scanBtn: "Auf KI-Inhalte Scannen",
      scanningBtn: "4 Neuronale Modelle Prüfen...",
      samplesLabel: "Schnelltest-Muster:",
      legendHuman: "Menschlicher Text",
      legendMixed: "Mischform / Zweifelhaft",
      legendAi: "Hohe KI-Wahrscheinlichkeit",
      sendToHumanizerBtn: "1-Klick: Diesen Text Jetzt Humanisieren",
    },
    media: {
      badge: "Creator Media Studio",
      title: "KI-Video Reels & Wasserzeichen Studio",
      subtitle: "Ecken-Wasserzeichen entfernen und Bildrate humanisieren für YouTube Shorts & TikTok.",
      tabSeo: "Virales Video SEO",
      tabVideo: "Wasserzeichen & Schnitt",
      tabImage: "C2PA-Metadaten Bereinigen",
    },
    seoTool: {
      badge: "High-RPM SEO Tool",
      title: "SEO-Metadaten & Hashtag Generator",
      subtitle: "Erstellen Sie klickstarke Google-Titel und Trend-Hashtags.",
      topicLabel: "Thema oder Entwurf",
      topicPlaceholder: "z.B. KI Texte menschlicher machen kostenlos...",
      generateBtn: "SEO-Assets Generieren",
    },
    otherTools: {
      badge: "Creator Power Suite",
      title: "Entdecken Sie Weitere Kostenlose Tools",
      subtitle: "Alles, was Sie für Textqualität, KI-Prüfung und Reichweite benötigen.",
      launchBtn: "Tool Starten",
      tools: {
        humanizer: {
          title: "KI-Text Humanizer",
          subtitle: "Natürlicher Schreibstil",
          desc: "Verwandelt ChatGPT-Texte in menschliche Sprache mit hoher Satzvariation.",
          bullets: ["Turnitin 3.0 Sicher", "5 Menschliche Schreibstile", "DOCX & TXT Export"],
        },
        detector: {
          title: "Enterprise KI-Detektor 4.0",
          subtitle: "Satz-für-Satz Heatmap",
          desc: "Analysiert Dokumente auf KI-Muster und markiert verdächtige Passagen.",
          bullets: ["Rot-Grüne Heatmap", "Simulierte Hochschul-Modelle", "Direkt-Transfer zum Humanizer"],
        },
        media: {
          title: "Video Reels & Wasserzeichen Studio",
          subtitle: "Logo & Wasserzeichen Entferner",
          desc: "Entfernt Logos von heruntergeladenen Videos für saubere Shorts.",
          bullets: ["Ecken-Wasserzeichen Entfernen", "Humanisierte Bildrate", "Monetarisierungssicher"],
        },
        seo: {
          title: "High-RPM SEO & Hashtags",
          subtitle: "Platz 1 bei Google & YouTube",
          desc: "Generiert lukrative Suchbegriffe und reichweitenstarke Hashtags.",
          bullets: ["Hohe CPC-Keywords", "Virale Social Hashtags", "1-Klick Kopieren"],
        },
      },
    },

  },

  // ==========================================
  // FRENCH (Français - Keywords: humanisateur de texte IA gratuit, comment rendre texte IA indétectable)
  // ==========================================
  fr: {
    nav: {
      brandSubtitle: "Transformez vos textes IA en écriture humaine naturelle",
      humanizerTab: "Humaniseur IA",
      detectorTab: "Détecteur IA",
      mediaTab: "Studio Reels",
      blogTab: "Guides",
      installBtn: "Installer l'app",
      historyBtn: "Historique",
      blueprintBtn: "Stratégie",
    },
    seo: {
      pdfToolsTitle: "Outils PDF Gratuits en Ligne – Fusionner PDF et Images en PDF (2026)",
      pdfToolsDesc: "Outils PDF gratuits. Fusionnez plusieurs PDF en un seul ou convertissez des images JPG/PNG en PDF. 100% dans le navigateur.",
      imageCompressorTitle: "Compresseur d'Images Gratuit en Ligne – JPG, PNG, WebP (2026)",
      imageCompressorDesc: "Compresseur d'images gratuit. Compressez JPG, PNG et WebP dans votre navigateur. Sans téléchargement, sans inscription.",
      humanizerTitle: "Humaniser Texte IA Gratuit Sans Inscription – Style Naturel (2026)",
      humanizerDesc: "Outil 100% gratuit pour humaniser les textes ChatGPT, Claude et Gemini. Rendez vos écrits plus naturels, sans aucune limite.",
      detectorTitle: "Détecteur IA Gratuit pour Textes en Français – Analyse Phrase par Phrase",
      detectorDesc: "Analysez vos documents avec des modèles simulant Turnitin, GPTZero et Copyleaks. Carte thermique visuelle précise sans faux positifs.",
      mediaTitle: "Studio Vidéo Reels IA et Suppression de Filigranes",
      mediaDesc: "Supprimez les filigranes et logos de vidéos IA. Cadence d'image et audio naturel pour YouTube Shorts et TikTok.",
      seoTitle: "Générateur SEO et Hashtags Viraux – N°1 sur Google",
      seoDesc: "Générez des titres SEO à fort taux de clic, des méta descriptions et des hashtags populaires pour vos vidéos et articles.",
      blogTitle: "Guides sur la Détection IA et l'Humanisation (2026)",
      blogDesc: "Conseils pour améliorer les textes IA, adopter un style naturel et optimiser pour Google Helpful Content.",
      citationTitle: "Générateur de Citations Gratuit – APA, MLA & Chicago",
      citationDesc: "Citations gratuites en APA, MLA et Chicago – sans inscription, dans le navigateur.",
      expanderTitle: "Allongeur de Phrases Gratuit – Textes Plus Longs Sans Limite",
      expanderDesc: "Allongez vos phrases en paragraphes riches – gratuit et sans limite de mots.",
      summarizerTitle: "Résumeur de Texte IA Gratuit – Résumez en Secondes (2026)",
      summarizerDesc: "Résumeur de texte gratuit. Collez de longs articles — obtenez des résumés instantanés en 8 langues. Sans inscription.",
      cleanerTitle: "Nettoyeur de Clichés IA – Style Naturel Gratuit",
      cleanerDesc: "Détectez les clichés de l'IA et remplacez-les par un style naturel.",
    },
    pdfTools: {
      badge: "Outils PDF",
      title: "Fusionner PDF et Convertir Images en PDF — Gratuit",
    },
    imageCompressor: {
      badge: "Compresseur d'Images",
      title: "Compressez des Images en Ligne — Gratuit, Privé, Instantané",
    },
    summarizer: {
      badge: "Résumeur de Texte IA",
      title: "Résumez Tout Texte en Secondes",
      brief: "Bref",
      balanced: "Équilibré",
      detailed: "Détaillé",
    },
    humanizer: {
      badge: "⭐ 100% Gratuit à Vie • Sans Limite de Mots • Sans Inscription",
      heroTitle: "Humanisateur de Texte IA Gratuit",
      heroSubtitle: "Donnez à vos textes IA un rythme dynamique et une expression naturelle authentique.",
      inputPlaceholder: "Collez votre texte généré par IA ici (ChatGPT, Claude, Gemini, DeepSeek)...",
      humanizeBtn: "Humaniser le Texte Maintenant",
      processingBtn: "Génération du style humain naturel...",
      outputTitle: "Texte Humanisé & Scores d'Authenticité",
      outputEmpty: "Cliquez sur 'Humaniser le Texte' pour un style plus naturel.",
      tones: {
        conversational: "Conversationnel & Naturel",
        academic: "Académique (Ton Formel)",
        professional: "Professionnel Exécutif",
        creative: "Créatif & Narratif",
        balanced: "Équilibré",
      },
      levels: {
        standard: "Polissage Standard",
        stealth: "Furtif (Contourne les Détecteurs)",
        ultraStealth: "Ultra Furtif (Variation Maximale)",
      },
      sampleSelectLabel: "Ou essayez un exemple prédéfini :",
      wordCountLabel: "mots",
      stages: [
        { title: "Analyse de l'entropie", desc: "Détection des répétitions et tournures typiques d'IA..." },
        { title: "Rupture de la cadence robotique", desc: "Introduction d'un rythme varié et d'expressions naturelles..." },
        { title: "Suppression des clichés d'IA", desc: "Remplacement des tics de langage mécaniques..." },
        { title: "Vérification de furtivité", desc: "Confirmation d'un score IA de 0%..." },
      ],
    },
    detector: {
      badge: "Scanner Multi-Modèles Institutionnel",
      heroTitle: "Détecteur d'IA Gratuit avec Carte Thermique des Phrases",
      heroSubtitle: "Analysez vos textes avec notre propre analyseur de style. Mise en surbrillance colorée instantanée. Estimation indépendante, pas un résultat officiel.",
      inputPlaceholder: "Collez votre texte pour analyser le pourcentage d'IA...",
      scanBtn: "Scanner le Contenu IA",
      scanningBtn: "Analyse sur 4 Modèles en Cours...",
      samplesLabel: "Exemples rapides :",
      legendHuman: "Écriture Humaine",
      legendMixed: "Signal Douteux / Mixte",
      legendAi: "Forte Probabilité d'IA",
      sendToHumanizerBtn: "En 1 Clic : Humaniser ce Texte",
    },
    media: {
      badge: "Studio Médias Créateurs",
      title: "Studio Reels Vidéo & Effaceur de Filigranes",
      subtitle: "Supprimez les filigranes d'angle et humanisez la cadence pour YouTube Shorts et TikTok.",
      tabSeo: "SEO Vidéo Viral",
      tabVideo: "Filigrane & Montage",
      tabImage: "Nettoyage Métadonnées C2PA",
    },
    seoTool: {
      badge: "Moteur de Croissance SEO",
      title: "Générateur de Balises SEO et Hashtags Viraux",
      subtitle: "Titres à fort taux de clics et mots-clés stratégiques pour dominer les résultats de recherche.",
      topicLabel: "Sujet ou Projet d'Article",
      topicPlaceholder: "Ex : Humanisateur de texte IA gratuit pour l'université...",
      generateBtn: "Générer les Atouts SEO",
    },
    otherTools: {
      badge: "Suite Complète pour Créateurs",
      title: "Découvrez Nos Autres Outils Gratuits",
      subtitle: "Passez d'un outil à l'autre en un clic : rédaction, vérification et référencement naturel.",
      launchBtn: "Lancer l'Outil",
      tools: {
        humanizer: {
          title: "Humaniseur de Texte IA",
          subtitle: "Contourne Turnitin & GPTZero",
          desc: "Transforme les textes de ChatGPT en prose humaine authentique et variée.",
          bullets: ["Sûr pour Turnitin 3.0", "5 Styles d'Écriture", "Export Word et TXT en 1 Clic"],
        },
        detector: {
          title: "Détecteur de Contenu IA 4.0",
          subtitle: "Carte Thermique Phrase par Phrase",
          desc: "Identifie les tournures artificielles avec code couleur vert et rouge.",
          bullets: ["Carte Visuelle Intuitive", "Modèles Universitaires Simulés", "Transfert Direct vers Humaniseur"],
        },
        media: {
          title: "Studio Vidéo Reels & Filigranes",
          subtitle: "Effaceur de Logos et Marques",
          desc: "Supprime les logos indésirables pour réutiliser des vidéos sans risque.",
          bullets: ["Suppression Précise", "Cadence Humanisée", "Conforme Monétisation"],
        },
        seo: {
          title: "SEO à Fort RPM et Hashtags",
          subtitle: "N°1 sur Google et Réseaux",
          desc: "Génère des mots-clés rémunérateurs et des balises prêtes à copier.",
          bullets: ["Mots-Clés à Fort CPC", "Hashtags Viraux", "Copie Instantanée"],
        },
      },
    },

  },

  // ==========================================
  // TURKISH (Türkçe - Keywords: yapay zeka metnini insanlaştırma ücretsiz, tespit edilemeyen yapay zeka)
  // ==========================================
  tr: {
    nav: {
      brandSubtitle: "Yapay Zeka Metinlerini %100 Doğal İnsan Yazısına Dönüştürün",
      humanizerTab: "AI İnsanlaştırıcı",
      detectorTab: "AI Dedektörü",
      mediaTab: "Reels Stüdyosu",
      blogTab: "Rehberler",
      installBtn: "Uygulamayı Yükle",
      historyBtn: "Geçmiş",
      blueprintBtn: "Strateji",
    },
    seo: {
      pdfToolsTitle: "Ücretsiz Çevrimiçi PDF Araçları – PDF Birleştirme (2026)",
      pdfToolsDesc: "Ücretsiz PDF araçları. Birden fazla PDF'yi birleştirin veya JPG/PNG görselleri PDF'ye dönüştürün. %100 tarayıcıda.",
      imageCompressorTitle: "Ücretsiz Çevrimiçi Görüntü Sıkıştırıcı – JPG, PNG, WebP (2026)",
      imageCompressorDesc: "Ücretsiz görüntü sıkıştırıcı. JPG, PNG ve WebP'yi tarayıcınızda sıkıştırın. Yükleme yok, kayıt yok. %100 gizli.",
      humanizerTitle: "Yapay Zeka Metnini Doğallaştırma Ücretsiz – Doğal Yazım (2026)",
      humanizerDesc: "%100 Ücretsiz AI Metin İnsanlaştırıcı. ChatGPT ve Gemini yazılarını Turnitin ve GPTZero tarafından tespit edilemeyen doğal Türkçe metne dönüştürün.",
      detectorTitle: "Ücretsiz AI İçerik Dedektörü – Cümle Bazlı Isı Haritası",
      detectorDesc: "Turnitin, GPTZero ve Copyleaks algoritmalarıyla içeriklerinizi tarayın. Cümle bazlı renkli ısı haritası ile yapay zeka izlerini görün.",
      mediaTitle: "AI Video Reels ve Filigran Kaldırma Stüdyosu",
      mediaDesc: "AI videolarındaki logo ve filigranları temizleyin. Doğal kare hızları ve ses tonlamaları ile YouTube Shorts'ta para kazanmayı koruyun.",
      seoTitle: "Yüksek RPM Viral SEO ve Hashtag Oluşturucu – Google #1",
      seoDesc: "YouTube Shorts, TikTok ve bloglar için yüksek tıklama oranlı başlıklar, anahtar kelimeler ve popüler etiketler üretin.",
      blogTitle: "AI Tespiti ve İnsanlaştırma Kılavuzu (2026)",
      blogDesc: "Üniversitelerde Turnitin'i aşma yolları, ChatGPT metinlerini doğallaştırma ve Google Helpful Content kriterleri hakkında detaylı makaleler.",
      citationTitle: "Ücretsiz Alıntı Oluşturucu – APA, MLA ve Chicago",
      citationDesc: "APA, MLA ve Chicago alıntıları ücretsiz oluşturun – kayıt gerekmez.",
      expanderTitle: "Ücretsiz Cümle Genişletici – Kelime Sınırı Yok",
      expanderDesc: "Kısa cümleleri zengin paragraflara genişletin – ücretsiz, kelime sınırı yok.",
      summarizerTitle: "Ücretsiz AI Metin Özetleyici – Saniyeler İçinde Özetleyin (2026)",
      summarizerDesc: "Ücretsiz metin özetleyici. Uzun makaleleri yapıştırın — 8 dilde anında özet alın. Kayıt yok.",
      cleanerTitle: "Yapay Zeka Klişe Temizleyici – Ücretsiz",
      cleanerDesc: "Yapay zeka klişelerini bulup doğal ifadelerle değiştirin.",
    },
    pdfTools: {
      badge: "PDF Araçları",
      title: "PDF Birleştir ve Görselleri PDF'ye Dönüştür — Ücretsiz",
    },
    imageCompressor: {
      badge: "Görüntü Sıkıştırıcı",
      title: "Görüntüleri Çevrimiçi Sıkıştırın — Ücretsiz, Gizli, Anında",
    },
    summarizer: {
      badge: "AI Metin Özetleyici",
      title: "Herhangi Bir Metni Saniyeler İçinde Özetleyin",
      brief: "Kısa",
      balanced: "Dengeli",
      detailed: "Detaylı",
    },
    humanizer: {
      badge: "⭐ Sürekli %100 Ücretsiz • Kelime Sınırı Yok • Kayıt Gerekmez",
      heroTitle: "Yapay Zeka Metnini İnsanlaştırın: %100 Tespit Edilemez",
      heroSubtitle: "Dinamik cümle çeşitliliği ve akıcı dille daha doğal metinler. Tamamen ücretsiz.",
      inputPlaceholder: "Yapay zeka tarafından üretilen metni buraya yapıştırın (ChatGPT, Claude, Gemini)...",
      humanizeBtn: "Metni Şimdi İnsanlaştır",
      processingBtn: "Doğal İfade Tarzı Ekleniyor...",
      outputTitle: "İnsanlaştırılmış Metin ve Özgünlük Verileri",
      outputEmpty: "Yapay zeka tespitini aşmak için 'Metni Şimdi İnsanlaştır'a tıklayın.",
      tones: {
        conversational: "Samimi & Doğal Konuşma",
        academic: "Akademik (Turnitin Korumalı)",
        professional: "Profesyonel İş Dili",
        creative: "Yaratıcı & Akıcı",
        balanced: "Dengeli",
      },
      levels: {
        standard: "Standart Düzeltme",
        stealth: "Gizli Mod (Dedektörleri Aş)",
        ultraStealth: "Ultra Gizli (Maksimum Çeşitlilik)",
      },
      sampleSelectLabel: "Veya hazır bir örnek seçin:",
      wordCountLabel: "kelime",
      stages: [
        { title: "Cümle Yapısı Analizi", desc: "Yapay zekaya özgü kalıplar ve tekrarlar inceleniyor..." },
        { title: "Robotik Ritmin Kırılması", desc: "Doğal cümle uzunlukları ve akıcılık ekleniyor..." },
        { title: "Kalıp İfadelerin Temizlenmesi", desc: "Mekanik bağlaçlar ve yapay zeka klişeleri siliniyor..." },
        { title: "Gizlilik Doğrulaması", desc: "Turnitin ve GPTZero'da %0 AI skoru kontrol ediliyor..." },
      ],
    },
    detector: {
      badge: "Kurumsal Çoklu Model AI Tarayıcı",
      heroTitle: "Ücretsiz AI Dedektörü ve Renkli Cümle Isı Haritası",
      heroSubtitle: "Metninizi kendi örüntü analiz motorumuzla inceleyin. Cümle cümle anında analiz. Bağımsız tahminimizdir, resmi sonuç değildir.",
      inputPlaceholder: "Yapay zeka tespiti yapmak istediğiniz metni buraya yapıştırın...",
      scanBtn: "Yapay Zeka İzlerini Tara",
      scanningBtn: "4 Model ile Taranıyor...",
      samplesLabel: "Hızlı Test Örnekleri:",
      legendHuman: "İnsan Yazımı (Güvenli)",
      legendMixed: "Şüpheli / Karışık",
      legendAi: "Yüksek AI Riski",
      sendToHumanizerBtn: "Tek Tıkla: Bu Metni İnsanlaştır",
    },
    media: {
      badge: "İçerik Üretici Medya Stüdyosu",
      title: "AI Video Reels ve Filigran Temizleyici",
      subtitle: "Köşe filigranlarını kaldırın, kare hızını doğallaştırın ve YouTube Shorts için optimize edin.",
      tabSeo: "Viral Video SEO",
      tabVideo: "Filigran & Video Hızı",
      tabImage: "C2PA Meta Veri Temizleme",
    },
    seoTool: {
      badge: "Yüksek RPM SEO Aracı",
      title: "Viral SEO Başlıkları ve Trend Etiketler",
      subtitle: "Google ve YouTube'da ilk sıraya çıkmak için yüksek tıklamalı meta veriler oluşturun.",
      topicLabel: "Konu veya Makale Taslağı",
      topicPlaceholder: "Örn: Yapay zeka metnini insanlaştırma yöntemleri ücretsiz...",
      generateBtn: "SEO Verilerini Oluştur",
    },
    otherTools: {
      badge: "Eksiksiz İçerik Paketi",
      title: "Diğer Yüksek Performanslı Araçlarımızı Keşfedin",
      subtitle: "İnsan yazısı, doğrulama ve viral erişim için ihtiyacınız olan her şey tek tıkla elinizin altında.",
      launchBtn: "Aracı Aç",
      tools: {
        humanizer: {
          title: "AI Metin İnsanlaştırıcı (Tespit Edilemez)",
          subtitle: "Doğal Yazım Stili",
          desc: "ChatGPT metinlerini yüksek çeşitlilikle akıcı insan yazısına dönüştürür.",
          bullets: ["Turnitin 3.0 Uyumlu", "5 Farklı İfade Tarzı", "Word ve TXT Olarak İndirme"],
        },
        detector: {
          title: "Kurumsal AI Dedektörü 4.0",
          subtitle: "Cümle Bazlı Renkli Harita",
          desc: "Tüm metni kurumsal AI modelleriyle tarar, robotik cümleleri kırmızı ile gösterir.",
          bullets: ["Kırmızı-Yeşil Isı Haritası", "Akademik Seviye Tarama", "Tek Tıkla İnsanlaştırıcıya Gönderme"],
        },
        media: {
          title: "Video Reels ve Filigran Stüdyosu",
          subtitle: "Logo ve Filigran Kaldırma",
          desc: "Videolardaki logoları akıllı kırpma ile siler, telif riskini azaltır.",
          bullets: ["Köşe Logolarını Kaldırma", "Doğal Kare Hızı", "Para Kazanmaya Uygun"],
        },
        seo: {
          title: "Yüksek RPM SEO ve Hashtagler",
          subtitle: "Google ve YouTube'da #1 Sıra",
          desc: "Yüksek gelir getiren anahtar kelimeler ve viral etiketler üretir.",
          bullets: ["Yüksek TBM'li Kelimeler", "Viral Sosyal Medya Etiketleri", "Anında Kopyalama"],
        },
      },
    },

  },

  // ==========================================
  // PORTUGUESE (Português - Keywords: humanizar texto de IA grátis online, como burlar detector de IA)
  // ==========================================
  pt: {
    nav: {
      brandSubtitle: "Transforme Texto de IA em Redação Humana Natural",
      humanizerTab: "Humanizador IA",
      detectorTab: "Detector de IA",
      mediaTab: "Estúdio Reels",
      blogTab: "Guias",
      installBtn: "Instalar App",
      historyBtn: "Histórico",
      blueprintBtn: "Estratégia",
    },
    seo: {
      pdfToolsTitle: "Ferramentas PDF Grátis Online – Juntar PDF e Imagens em PDF (2026)",
      pdfToolsDesc: "Ferramentas PDF gratuitas. Junte vários PDFs em um só ou converta imagens JPG/PNG em PDF. 100% no navegador.",
      imageCompressorTitle: "Compressor de Imagens Grátis Online – JPG, PNG, WebP (2026)",
      imageCompressorDesc: "Compressor de imagens gratuito. Comprima JPG, PNG e WebP no navegador. Sem upload, sem cadastro. 100% privado.",
      humanizerTitle: "Humanizar Texto IA Grátis Sem Cadastro – Escrita Natural (2026)",
      humanizerDesc: "Ferramenta 100% gratuita para humanizar textos de IA. Converta rascunhos do ChatGPT em escrita humana mais natural.",
      detectorTitle: "Detector de IA para Textos em Português Grátis – Mapa de Calor",
      detectorDesc: "Escaneie documentos contra Turnitin, GPTZero e Copyleaks com mapa visual colorido frase a frase e 0% falsos positivos.",
      mediaTitle: "Remover Marca d'Água de Vídeos de IA – Reels e Shorts",
      mediaDesc: "Remova logos e marcas d'água de vídeos de IA. Ajuste a cadência de quadros e naturalize locuções sem pagar nada.",
      seoTitle: "Gerador de SEO Viral e Hashtags – 1º Lugar no Google",
      seoDesc: "Gere títulos SEO com alto CTR, meta descrições e hashtags em alta para YouTube Shorts, TikTok e blogs.",
      blogTitle: "Guias de Detecção de IA e Humanização (2026)",
      blogDesc: "Técnicas para melhorar textos de IA, escrita natural e ranquear no Google Helpful Content.",
      citationTitle: "Gerador de Citações Grátis – APA, MLA e Chicago",
      citationDesc: "Citações gratuitas em APA, MLA e Chicago – sem cadastro, no navegador.",
      expanderTitle: "Expansor de Frases Grátis – Sem Limite de Palavras",
      expanderDesc: "Expanda frases curtas em parágrafos ricos – grátis e sem limite de palavras.",
      summarizerTitle: "Resumidor de Texto IA Grátis – Resuma em Segundos (2026)",
      summarizerDesc: "Resumidor de texto gratuito. Cole artigos longos — obtenha resumos instantâneos em 8 idiomas. Sem cadastro.",
      cleanerTitle: "Limpador de Clichês de IA – Grátis",
      cleanerDesc: "Encontre clichês de IA e substitua por um estilo natural.",
    },
    pdfTools: {
      badge: "Ferramentas PDF",
      title: "Juntar PDF e Converter Imagens em PDF — Grátis",
    },
    imageCompressor: {
      badge: "Compressor de Imagens",
      title: "Comprima Imagens Online — Grátis, Privado, Instantâneo",
    },
    summarizer: {
      badge: "Resumidor de Texto IA",
      title: "Resuma Qualquer Texto em Segundos",
      brief: "Breve",
      balanced: "Equilibrado",
      detailed: "Detalhado",
    },
    humanizer: {
      badge: "⭐ 100% Grátis Para Sempre • Sem Limites de Palavras • Sem Cadastro",
      heroTitle: "Humanizar Texto de IA Grátis: Texto Mais Natural",
      heroSubtitle: "Melhore textos de IA com variação sintática dinâmica e ritmo humano natural. Sem assinaturas.",
      inputPlaceholder: "Cole o texto gerado por IA aqui (ChatGPT, Claude, Gemini, DeepSeek)...",
      humanizeBtn: "Humanizar Texto Agora",
      processingBtn: "Gerando Estilo de Escrita Humana...",
      outputTitle: "Texto Humanizado e Métricas de Autenticidade",
      outputEmpty: "Clique em 'Humanizar Texto Agora' para contornar detectores de IA.",
      tones: {
        conversational: "Conversacional & Natural",
        academic: "Acadêmico (Tom Formal)",
        professional: "Profissional Executivo",
        creative: "Criativo & Narrativo",
        balanced: "Equilibrado",
      },
      levels: {
        standard: "Polimento Padrão",
        stealth: "Furtivo (Evita Detectores)",
        ultraStealth: "Ultra Furtivo (Máxima Variação)",
      },
      sampleSelectLabel: "Ou selecione um exemplo prévio:",
      wordCountLabel: "palavras",
      stages: [
        { title: "Analisando Entropia", desc: "Examinando previsibilidade e vícios de linguagem da IA..." },
        { title: "Quebrando Ritmo Robótico", desc: "Inserindo variação de frases e cadência humana..." },
        { title: "Removendo Clichês de IA", desc: "Substituindo palavras artificiais e conectivos robóticos..." },
        { title: "Verificação de Furtividade", desc: "Confirmando 0% de detecção no Turnitin e GPTZero..." },
      ],
    },
    detector: {
      badge: "Scanner Multi-Modelos Institucional",
      heroTitle: "Detector de IA Grátis com Mapa de Calor Frase por Frase",
      heroSubtitle: "Avalie textos com nosso próprio analisador de padrões, com análise visual colorida em tempo real. Estimativa própria, não um resultado oficial.",
      inputPlaceholder: "Cole o trabalho ou artigo para verificar o nível de IA...",
      scanBtn: "Escanear Conteúdo de IA (0% Falsos Positivos)",
      scanningBtn: "Analisando em 4 Modelos Neurais...",
      samplesLabel: "Exemplos de Teste Rápido:",
      legendHuman: "Escrita Humana",
      legendMixed: "Sinal Misto / Duvidoso",
      legendAi: "Alto Risco de IA",
      sendToHumanizerBtn: "Em 1 Clique: Humanizar Este Texto",
    },
    media: {
      badge: "Estúdio para Criadores de Conteúdo",
      title: "Estúdio de Vídeos Reels e Remoção de Marca d'Água",
      subtitle: "Remova marcas d'água de cantos e humanize a cadência de vídeos para YouTube Shorts e TikTok.",
      tabSeo: "SEO para Vídeo Viral",
      tabVideo: "Marca d'Água & Quadros",
      tabImage: "Limpar Metadados C2PA",
    },
    seoTool: {
      badge: "Motor de Alto RPM",
      title: "Gerador de SEO Viral e Hashtags em Alta",
      subtitle: "Títulos com alto CTR e termos estratégicos para conquistar as primeiras posições nas buscas.",
      topicLabel: "Tópico ou Rascunho do Artigo",
      topicPlaceholder: "Ex: Como humanizar texto de IA grátis para faculdade...",
      generateBtn: "Gerar Ativos de SEO",
    },
    otherTools: {
      badge: "Suíte Completa de Criação",
      title: "Conheça Nossas Outras Ferramentas Gratuitas",
      subtitle: "Alterne entre ferramentas com um toque: redação, verificação e ranqueamento sem complicação.",
      launchBtn: "Abrir Ferramenta",
      tools: {
        humanizer: {
          title: "Humanizador de Texto de IA",
          subtitle: "Burle Turnitin, GPTZero e Copyleaks",
          desc: "Transforme respostas do ChatGPT em prosa humana autêntica com alta variedade estrutural.",
          bullets: ["Seguro para Turnitin 3.0", "5 Estilos de Escrita", "Exportação para Word e TXT"],
        },
        detector: {
          title: "Detector de Conteúdo IA 4.0",
          subtitle: "Mapa de Calor Frase a Frase",
          desc: "Mapeia sentenças com IA e sinaliza passagens em vermelho e verde.",
          bullets: ["Mapa Visual Colorido", "Modelos Universitários", "Envio Direto ao Humanizador"],
        },
        media: {
          title: "Estúdio de Vídeo Reels e Marca d'Água",
          subtitle: "Removedor de Logos e Marcas",
          desc: "Apaga logos indesejados de vídeos baixados para reutilização segura.",
          bullets: ["Remoção nos Cantos", "Cadência de Vídeo Humana", "Seguro para Monetizar"],
        },
        seo: {
          title: "SEO de Alto RPM e Hashtags",
          subtitle: "1º Lugar no Google e YouTube",
          desc: "Gera palavras-chave valiosas e hashtags prontas para turbinar seu alcance.",
          bullets: ["Palavras de Alto CPC", "Hashtags Virais", "Cópia em 1 Clique"],
        },
      },
    },

  },

  // ==========================================
  // JAPANESE (日本語 - Keywords: AIテキストを人間に書き換える 無料, AI文章を自然な日本語にするツール)
  // ==========================================
  ja: {
    nav: {
      brandSubtitle: "AI生成文章を自然な人間らしい文章に変換",
      humanizerTab: "AI人間化ツール",
      detectorTab: "AI検出ツール",
      mediaTab: "リールスタジオ",
      blogTab: "ガイド記事",
      installBtn: "アプリ追加",
      historyBtn: "履歴",
      blueprintBtn: "市場分析",
    },
    seo: {
      pdfToolsTitle: "無料PDFツール – PDF結合・画像からPDF作成 (2026)",
      pdfToolsDesc: "無料のPDFツール。複数のPDFを結合したり、JPG/PNG画像からPDFを作成。ブラウザ内で完結、アップロード不要。",
      imageCompressorTitle: "無料画像圧縮ツール – JPG・PNG・WebP対応 (2026)",
      imageCompressorDesc: "無料の画像圧縮ツール。JPG・PNG・WebPをブラウザで圧縮。アップロード不要、登録不要。完全プライベート。",
      humanizerTitle: "AI文章を自然な日本語に書き換え – 無料ツール (2026)",
      humanizerDesc: "100%完全無料のAIテキスト人間化ツール。ChatGPTやGeminiの文章をより自然な日本語に変換します。",
      detectorTitle: "AI文章チェッカー 文単位 無料 – 日本語対応",
      detectorDesc: "Turnitin、GPTZero、CopyleaksのシミュレーションモデルでAI文章を判定。不自然な文を色分けヒートマップで可視化します。",
      mediaTitle: "AI動画リール＆透かし消去スタジオ – ショート動画向け",
      mediaDesc: "AI生成動画からロゴや透かしをきれいに除去。自然なフレームレートと音声イントネーションで収益化を守ります。",
      seoTitle: "高RPM検索SEO＆バズるハッシュタグ生成ツール – Google検索1位",
      seoDesc: "YouTubeショート、TikTok、ブログ向けにクリック率の高いタイトルや急上昇タグを完全無料で生成します。",
      blogTitle: "AI文章の改善と自然な人間化の完全ガイド（2026年版）",
      blogDesc: "大学でのTurnitin対策、パープレキシティと文章リズムの理論、Googleの有用コンテンツ基準を満たす実践的解説。",
      citationTitle: "無料引用生成ツール – APA・MLA・シカゴ対応",
      citationDesc: "APA・MLA・シカゴ形式の引用を無料で生成 – 登録不要。",
      expanderTitle: "無料文章拡張ツール – 文字数制限なし",
      expanderDesc: "短い文を豊かな段落に拡張 – 無料・文字数制限なし。",
      summarizerTitle: "無料AI要約ツール – 数秒で文章を要約 (2026)",
      summarizerDesc: "無料の文章要約ツール。長い記事を貼り付けて8言語ですぐに要約。登録不要。",
      cleanerTitle: "AI特有の言い回し修正ツール – 無料",
      cleanerDesc: "AI特有の言い回しを見つけて自然な表現に置き換え。",
    },
    pdfTools: {
      badge: "PDFツール",
      title: "PDF結合・画像からPDF作成 — 無料",
    },
    imageCompressor: {
      badge: "画像圧縮ツール",
      title: "画像をオンラインで圧縮 — 無料・プライベート・即時",
    },
    summarizer: {
      badge: "AI要約ツール",
      title: "あらゆる文章を数秒で要約",
      brief: "簡潔",
      balanced: "バランス",
      detailed: "詳細",
    },
    humanizer: {
      badge: "⭐ 永久完全無料 • 文字数無制限 • 会員登録不要",
      heroTitle: "AIテキストを自然な人間の文章に書き換える",
      heroSubtitle: "文の長さやリズムを多様化して、より自然な文章に仕上げます。完全無料。",
      inputPlaceholder: "ここにChatGPTやGeminiで生成された文章を貼り付けてください...",
      humanizeBtn: "テキストを今すぐ人間化（自然な文体に変換）",
      processingBtn: "自然な文章リズムに再構成中...",
      outputTitle: "人間化された出力＆リアルタイム検知スコア",
      outputEmpty: "「テキストを今すぐ人間化」を押すと、書き換え結果が表示されます。",
      tones: {
        conversational: "会話調・親しみやすい文体",
        academic: "学術論文調（Turnitin対策）",
        professional: "ビジネス・公式文書",
        creative: "創造的・ストーリー調",
        balanced: "バランス調（汎用）",
      },
      levels: {
        standard: "標準ブラッシュアップ",
        stealth: "ステルス（AI検知回避）",
        ultraStealth: "超ステルス（リズム最大多様化）",
      },
      sampleSelectLabel: "またはサンプル文章を試す：",
      wordCountLabel: "文字数",
      stages: [
        { title: "文構造のエントロピー分析", desc: "AI特有の規則的パターンを検出中..." },
        { title: "機械的リズムの解消", desc: "文章の長短を織り交ぜて自然な息継ぎを付与..." },
        { title: "AI決まり文句の排除", desc: "不自然な接続詞や機械的表現を書き換え..." },
        { title: "ステルス検証", desc: "Turnitin・GPTZeroモデルでAI確率0%を確認..." },
      ],
    },
    detector: {
      badge: "教育機関レベルのマルチモデルAI判定",
      heroTitle: "無料AI文章チェッカー＆文単位ヒートマップ",
      heroSubtitle: "独自のパターン分析エンジンで文章をスキャン。気になる箇所を行ごとに色分け表示します。独自の推定であり、公式の判定結果ではありません。",
      inputPlaceholder: "判定したいレポートや記事をここに貼り付けてください...",
      scanBtn: "AI検出スキャンを実行（誤判定ゼロ設計）",
      scanningBtn: "4つのニューラルモデルでスキャン中...",
      samplesLabel: "テスト用サンプル：",
      legendHuman: "人間による執筆（安全）",
      legendMixed: "疑わしい・混在",
      legendAi: "AI生成の可能性大",
      sendToHumanizerBtn: "1クリックで解決：この文章を人間化する",
    },
    media: {
      badge: "クリエイター向けメディアツール",
      title: "AI動画リール＆透かし除去スタジオ",
      subtitle: "動画の角のロゴを除去し、YouTubeショートやTikTok向けにフレームレートを最適化します。",
      tabSeo: "バズる動画SEO＆フック",
      tabVideo: "透かし消去＆フレーム調整",
      tabImage: "画像C2PAメタデータ消去",
    },
    seoTool: {
      badge: "高収益SEOエンジン",
      title: "バズるSEOメタタグ＆急上昇ハッシュタグ生成",
      subtitle: "クリック率を高めるタイトル、検索需要の高いキーワード、SNS向けタグを瞬時に作成。",
      topicLabel: "記事のテーマまたはドラフト",
      topicPlaceholder: "例：AIテキストを人間に書き換える無料ツール 大学レポート...",
      generateBtn: "SEOデータを生成",
    },
    otherTools: {
      badge: "クリエイター支援スイート",
      title: "その他の無料ツールを見る",
      subtitle: "ワンタップで切り替え可能：執筆、検証、アクセスアップに必要なすべてを網羅。",
      launchBtn: "ツールを開く",
      tools: {
        humanizer: {
          title: "AIテキスト人間化",
          subtitle: "より自然な文章に書き換え",
          desc: "ChatGPTの文章を人間が書いたかのような自然でリズミカルな日本語に再構築します。",
          bullets: ["Turnitin 3.0検証済み", "5種類の文体スタイル", "Word・TXTで簡単保存"],
        },
        detector: {
          title: "AI文章判定チェッカー 4.0",
          subtitle: "文単位の視覚的ヒートマップ",
          desc: "主要なAI判定エンジンで文章をチェックし、AI特有の文を赤色でハイライトします。",
          bullets: ["見やすいカラーヒートマップ", "大学提出前のチェックに最適", "判定から直接人間化へ"],
        },
        media: {
          title: "リール動画＆透かし除去",
          subtitle: "ロゴ・ウォーターマーク消去",
          desc: "動画の隅にある不要なロゴをスマートに除去し、再利用可能な動画に仕上げます。",
          bullets: ["角の透かしを自動消去", "自然な映像フレーム調整", "収益化リスクを軽減"],
        },
        seo: {
          title: "高RPM SEO＆タグ生成",
          subtitle: "Google＆YouTube検索1位",
          desc: "収益性の高いキーワードやクリック率を高めるメタディスクリプションを生成。",
          bullets: ["高単価キーワード提案", "バズるSNSハッシュタグ", "1クリックでコピー"],
        },
      },
    },

  },
  no: {
    seo: {
      pdfToolsTitle: "Gratis PDF-Verktøy – Slå Sammen PDF og Bilder til PDF (2026)",
      pdfToolsDesc: "Gratis PDF-verktøy. Slå sammen flere PDF-er til én, eller konverter JPG/PNG-bilder til PDF. 100% i nettleseren, ingen opplasting.",
      humanizerTitle: "Gratis AI Tekst Humanizer – Naturlig Tekst (2026)",
      humanizerDesc: "Gratis AI humanizer. Gjør ChatGPT og Gemini-tekst om til naturlig skriving.",
      imageCompressorTitle: "Gratis Bildekompressor Online – Komprimer Bilder Uten Opplasting (2026)",
      imageCompressorDesc: "Komprimer JPG, PNG og WebP gratis direkte i nettleseren. Ingen opplasting, ingen registrering. 100% privat.",
    },
    pdfTools: {
      badge: "PDF-Verktøy",
      title: "Slå Sammen PDF og Bilder til PDF — Gratis",
    },
    imageCompressor: {
      badge: "Bildekompressor",
      title: "Komprimer Bilder Online — Gratis, Privat, Øyeblikkelig",
      subtitle: "Slipp bildene dine nedenfor. De forlater aldri enheten din — komprimering skjer i nettleseren.",
      dropTitle: "Slipp bilder her eller klikk for å bla gjennom",
      dropSubtitle: "JPG, PNG, WebP, GIF — behandles lokalt, lastes aldri opp",
      qualityLabel: "Kvalitet",
      formatLabel: "Utdataformat",
      download: "Last ned",
      processing: "Behandler...",
      original: "Original",
      compressed: "Komprimert",
      saved: "Sparet",
      smaller: "Mindre",
      better: "Bedre kvalitet",
      private: "100% Privat",
      instant: "Øyeblikkelig",
      free: "Gratis For Alltid",
      quickAnswerTitle: "Hvordan fungerer nettleserbasert bildekomprimering?",
      quickAnswer: "Nettleserens Canvas API re-koder bilder med lavere kvalitetsinnstillinger — helt på enheten din. Ingen opplasting, ingen server, ingen venting.",
    },
  },
  nl: {
    seo: {
      pdfToolsTitle: "Gratis PDF Tools Online – PDF Samenvoegen en Afbeeldingen naar PDF (2026)",
      pdfToolsDesc: "Gratis PDF-tools. Voeg meerdere PDF's samen of converteer JPG/PNG-afbeeldingen naar PDF. 100% in de browser, geen upload.",
      humanizerTitle: "Gratis AI Tekst Humanizer – Natuurlijke Tekst (2026)",
      humanizerDesc: "Gratis AI humanizer. Maak ChatGPT en Gemini-tekst natuurlijk.",
      imageCompressorTitle: "Gratis Afbeelding Compressor Online – Comprimeer Zonder Uploaden (2026)",
      imageCompressorDesc: "Comprimeer JPG, PNG en WebP gratis direct in je browser. Geen upload, geen registratie. 100% privé.",
    },
    pdfTools: {
      badge: "PDF Tools",
      title: "PDF Samenvoegen en Afbeeldingen naar PDF — Gratis",
    },
    imageCompressor: {
      badge: "Afbeelding Compressor",
      title: "Comprimeer Afbeeldingen Online — Gratis, Privé, Direct",
      subtitle: "Sleep je afbeeldingen hieronder. Ze verlaten nooit je apparaat — compressie gebeurt in je browser.",
      dropTitle: "Sleep afbeeldingen hierheen of klik om te bladeren",
      dropSubtitle: "JPG, PNG, WebP, GIF — lokaal verwerkt, nooit geüpload",
      qualityLabel: "Kwaliteit",
      formatLabel: "Uitvoerformaat",
      download: "Downloaden",
      processing: "Verwerken...",
      original: "Origineel",
      compressed: "Gecomprimeerd",
      saved: "Bespaard",
      smaller: "Kleiner",
      better: "Betere kwaliteit",
      private: "100% Privé",
      instant: "Direct",
      free: "Voor Altijd Gratis",
      quickAnswerTitle: "Hoe werkt browser-based beeldcompressie?",
      quickAnswer: "De Canvas API van je browser codeert afbeeldingen opnieuw met lagere kwaliteitsinstellingen — volledig op je apparaat. Geen upload, geen server, geen wachttijd.",
    },
  },
  it: {
    seo: {
      pdfToolsTitle: "Strumenti PDF Gratis Online – Unire PDF e Immagini in PDF (2026)",
      pdfToolsDesc: "Strumenti PDF gratuiti. Unisci più PDF in uno solo o converti immagini JPG/PNG in PDF. 100% nel browser, nessun caricamento.",
      humanizerTitle: "Umanizzatore Testo AI Gratis – Testo Naturale (2026)",
      humanizerDesc: "Umanizzatore AI gratuito. Rendi naturale il testo di ChatGPT e Gemini.",
      imageCompressorTitle: "Compressore Immagini Gratis Online – Comprimi Senza Caricare (2026)",
      imageCompressorDesc: "Comprimi JPG, PNG e WebP gratis direttamente nel browser. Nessun caricamento, nessuna registrazione. 100% privato.",
    },
    pdfTools: {
      badge: "Strumenti PDF",
      title: "Unire PDF e Convertire Immagini in PDF — Gratis",
    },
    imageCompressor: {
      badge: "Compressore Immagini",
      title: "Comprimi Immagini Online — Gratis, Privato, Istantaneo",
      subtitle: "Trascina le tue immagini qui sotto. Non lasciano mai il tuo dispositivo — la compressione avviene nel browser.",
      dropTitle: "Trascina le immagini qui o clicca per sfogliare",
      dropSubtitle: "JPG, PNG, WebP, GIF — elaborate localmente, mai caricate",
      qualityLabel: "Qualità",
      formatLabel: "Formato di output",
      download: "Scarica",
      processing: "Elaborazione...",
      original: "Originale",
      compressed: "Compressa",
      saved: "Risparmiato",
      smaller: "Più piccolo",
      better: "Migliore qualità",
      private: "100% Privato",
      instant: "Istantaneo",
      free: "Gratis Per Sempre",
      quickAnswerTitle: "Come funziona la compressione immagini nel browser?",
      quickAnswer: "La Canvas API del browser ricodifica le immagini con impostazioni di qualità inferiori — interamente sul tuo dispositivo. Nessun caricamento, nessun server, nessuna attesa.",
    },
  },
};
