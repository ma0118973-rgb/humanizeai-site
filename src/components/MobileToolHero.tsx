import { LanguageCode } from "../types";

// Clear, app-like hero for every tool — mobile first
// Tells the user in 3 seconds: what is this, what does it do, is it free?

interface ToolHeroInfo {
  icon: string;
  name: string;
  tagline: string;
}

const HERO_DATA: Record<string, Record<LanguageCode, ToolHeroInfo>> = {
  humanizer: {
    en: { icon: "✨", name: "AI Text Humanizer", tagline: "Make robotic text sound natural and human" },
    es: { icon: "✨", name: "Humanizador de Texto", tagline: "Haz que el texto robótico suene natural" },
    ur: { icon: "✨", name: "AI Text Humanizer", tagline: "Robotic tehreer ko insani andaaz dein" },
    de: { icon: "✨", name: "Text-Humanizer", tagline: "Robotext natürlich klingen lassen" },
    fr: { icon: "✨", name: "Humaniseur de Texte", tagline: "Rendez le texte robotique naturel" },
    tr: { icon: "✨", name: "Metin İnsancıllaştırıcı", tagline: "Robotik metni doğal hale getirin" },
    pt: { icon: "✨", name: "Humanizador de Texto", tagline: "Torne o texto robótico natural" },
    ja: { icon: "✨", name: "テキストヒューマナイザー", tagline: "ロボット的な文章を自然に" },
    no: { icon: "✨", name: "Tekst-Humanizer", tagline: "Gjør robottekst naturlig" },
    nl: { icon: "✨", name: "Tekst-Humanizer", tagline: "Maak robottekst natuurlijk" },
    it: { icon: "✨", name: "Umanizzatore di Testo", tagline: "Rendi naturale il testo robotico" },
  },
  detector: {
    en: { icon: "🔍", name: "AI Content Detector", tagline: "Check which sentences sound AI-written" },
    es: { icon: "🔍", name: "Detector de IA", tagline: "Revisa qué frases suenan a IA" },
    ur: { icon: "🔍", name: "AI Content Detector", tagline: "Check karen konsa jumla AI jaisa lagta hai" },
    de: { icon: "🔍", name: "KI-Detektor", tagline: "Prüfen welche Sätze KI-like klingen" },
    fr: { icon: "🔍", name: "Détecteur IA", tagline: "Vérifiez les phrases qui sonnent IA" },
    tr: { icon: "🔍", name: "AI İçerik Dedektörü", tagline: "Hangi cümlelerin yapay olduğunu kontrol edin" },
    pt: { icon: "🔍", name: "Detector de IA", tagline: "Verifique frases com cara de IA" },
    ja: { icon: "🔍", name: "AI検出ツール", tagline: "AIっぽい文をチェック" },
    no: { icon: "🔍", name: "AI-Detektor", tagline: "Sjekk hvilke setninger som høres AI ut" },
    nl: { icon: "🔍", name: "AI-Detector", tagline: "Check welke zinnen AI-achtig klinken" },
    it: { icon: "🔍", name: "Rilevatore IA", tagline: "Controlla le frasi che sembrano IA" },
  },
  citation: {
    en: { icon: "📚", name: "Citation Generator", tagline: "Create APA, MLA, Chicago references in seconds" },
    es: { icon: "📚", name: "Generador de Citas", tagline: "Crea referencias APA, MLA en segundos" },
    ur: { icon: "📚", name: "Citation Generator", tagline: "APA, MLA hawale secondon mein banayen" },
    de: { icon: "📚", name: "Zitationsgenerator", tagline: "APA, MLA Referenzen in Sekunden" },
    fr: { icon: "📚", name: "Générateur de Citations", tagline: "Créez des références APA, MLA" },
    tr: { icon: "📚", name: "Kaynakça Oluşturucu", tagline: "Saniyeler içinde APA, MLA kaynakçası" },
    pt: { icon: "📚", name: "Gerador de Citações", tagline: "Crie referências APA, MLA em segundos" },
    ja: { icon: "📚", name: "引用ジェネレーター", tagline: "APA、MLA引用を数秒で作成" },
    no: { icon: "📚", name: "Siteringsgenerator", tagline: "Lag APA, MLA referanser på sekunder" },
    nl: { icon: "📚", name: "Citatiegenerator", tagline: "Maak APA, MLA referenties in seconden" },
    it: { icon: "📚", name: "Generatore di Citazioni", tagline: "Crea citazioni APA, MLA in secondi" },
  },
  expander: {
    en: { icon: "📝", name: "Sentence Expander", tagline: "Turn short sentences into detailed paragraphs" },
    es: { icon: "📝", name: "Expansor de Oraciones", tagline: "Convierte frases cortas en párrafos" },
    ur: { icon: "📝", name: "Sentence Expander", tagline: "Chhote jumlon ko tafseeli paragraph banayen" },
    de: { icon: "📝", name: "Satz-Expander", tagline: "Kurze Sätze zu Absätzen erweitern" },
    fr: { icon: "📝", name: "Expanseur de Phrases", tagline: "Développez des phrases en paragraphes" },
    tr: { icon: "📝", name: "Cümle Genişletici", tagline: "Kısa cümleleri paragrafa dönüştürün" },
    pt: { icon: "📝", name: "Expansor de Frases", tagline: "Transforme frases em parágrafos" },
    ja: { icon: "📝", name: "文拡張ツール", tagline: "短文を詳細な段落に" },
    no: { icon: "📝", name: "Setningsutvider", tagline: "Gjør korte setninger til avsnitt" },
    nl: { icon: "📝", name: "Zinsuitbreider", tagline: "Maak van zinnen alinea's" },
    it: { icon: "📝", name: "Espansore di Frasi", tagline: "Trasforma frasi in paragrafi" },
  },
  summarizer: {
    en: { icon: "📄", name: "Text Summarizer", tagline: "Shrink long articles into key points" },
    es: { icon: "📄", name: "Resumidor de Texto", tagline: "Resume artículos largos en puntos clave" },
    ur: { icon: "📄", name: "Text Summarizer", tagline: "Lambi tehreer ka khulasa banayen" },
    de: { icon: "📄", name: "Text-Zusammenfasser", tagline: "Lange Artikel zusammenfassen" },
    fr: { icon: "📄", name: "Résumeur de Texte", tagline: "Résumez les longs articles" },
    tr: { icon: "📄", name: "Metin Özetleyici", tagline: "Uzun yazıları özetleyin" },
    pt: { icon: "📄", name: "Resumidor de Texto", tagline: "Resuma textos longos" },
    ja: { icon: "📄", name: "要約ツール", tagline: "長文を要点にまとめる" },
    no: { icon: "📄", name: "Tekstsammendrag", tagline: "Forkort lange artikler" },
    nl: { icon: "📄", name: "Tekstsamentatter", tagline: "Vat lange teksten samen" },
    it: { icon: "📄", name: "Riassuntore", tagline: "Riassumi articoli lunghi" },
  },
  voiceTyping: {
    en: { icon: "🎙️", name: "Voice Typing", tagline: "Speak and watch your words become text" },
    es: { icon: "🎙️", name: "Dictado por Voz", tagline: "Habla y mira cómo tus palabras se escriben" },
    ur: { icon: "🎙️", name: "Voice Typing", tagline: "Bolen aur alfaz khud text ban jayen" },
    de: { icon: "🎙️", name: "Spracheingabe", tagline: "Sprechen statt tippen – Worte werden Text" },
    fr: { icon: "🎙️", name: "Saisie Vocale", tagline: "Parlez et vos mots deviennent du texte" },
    tr: { icon: "🎙️", name: "Sesli Yazma", tagline: "Konuşun, sözleriniz yazıya dönüşsün" },
    pt: { icon: "🎙️", name: "Digitação por Voz", tagline: "Fale e suas palavras viram texto" },
    ja: { icon: "🎙️", name: "音声入力", tagline: "話すだけで文字になる" },
    no: { icon: "🎙️", name: "Stemmeskriving", tagline: "Snakk og se ordene bli til tekst" },
    nl: { icon: "🎙️", name: "Spraaktypen", tagline: "Spreek en je woorden worden tekst" },
    it: { icon: "🎙️", name: "Dettatura Vocale", tagline: "Parla e le parole diventano testo" },
  },
  textToSpeech: {
    en: { icon: "🔊", name: "Text to Speech", tagline: "Hear your text read aloud by your device's voices" },
    es: { icon: "🔊", name: "Texto a Voz", tagline: "Escucha tu texto con las voces de tu dispositivo" },
    ur: { icon: "🔊", name: "Text to Speech", tagline: "Apna text apne device ki awaz mein sunain" },
    de: { icon: "🔊", name: "Text zu Sprache", tagline: "Lassen Sie sich Ihren Text vorlesen" },
    fr: { icon: "🔊", name: "Synthèse Vocale", tagline: "Écoutez vos textes lus à voix haute" },
    tr: { icon: "🔊", name: "Metinden Sese", tagline: "Metninizi cihazınızın sesiyle dinleyin" },
    pt: { icon: "🔊", name: "Texto para Fala", tagline: "Ouça seu texto com as vozes do aparelho" },
    ja: { icon: "🔊", name: "テキスト読み上げ", tagline: "端末の音声でテキストを聞けます" },
    no: { icon: "🔊", name: "Tekst til Tale", tagline: "Hør teksten lest høyt med enhetens stemmer" },
    nl: { icon: "🔊", name: "Tekst naar Spraak", tagline: "Hoor je tekst voorlezen met apparaatstemmen" },
    it: { icon: "🔊", name: "Sintesi Vocale", tagline: "Ascolta i tuoi testi con le voci del dispositivo" },
  },
  wordCounter: {
    en: { icon: "🔢", name: "Word Counter", tagline: "Count words, characters and reading time" },
    es: { icon: "🔢", name: "Contador de Palabras", tagline: "Cuenta palabras, caracteres y tiempo de lectura" },
    ur: { icon: "🔢", name: "Word Counter", tagline: "Alfaz, characters aur parhne ka waqt ginain" },
    de: { icon: "🔢", name: "Wortzähler", tagline: "Wörter, Zeichen und Lesezeit zählen" },
    fr: { icon: "🔢", name: "Compteur de Mots", tagline: "Comptez mots, caractères et temps de lecture" },
    tr: { icon: "🔢", name: "Kelime Sayacı", tagline: "Kelime, karakter ve okuma süresini sayın" },
    pt: { icon: "🔢", name: "Contador de Palavras", tagline: "Conte palavras, caracteres e tempo de leitura" },
    ja: { icon: "🔢", name: "ワードカウンター", tagline: "文字数・語数・読了時間を数える" },
    no: { icon: "🔢", name: "Ordteller", tagline: "Tell ord, tegn og lesetid" },
    nl: { icon: "🔢", name: "Woordenteller", tagline: "Tel woorden, tekens en leestijd" },
    it: { icon: "🔢", name: "Contatore di Parole", tagline: "Conta parole, caratteri e tempo di lettura" },
  },
  cvBuilder: {
    en: { icon: "💼", name: "CV Builder", tagline: "Make a professional CV in minutes" },
    es: { icon: "💼", name: "Creador de CV", tagline: "Crea un currículum profesional en minutos" },
    ur: { icon: "💼", name: "CV Builder", tagline: "Minutes mein professional CV banayen" },
    de: { icon: "💼", name: "Lebenslauf-Ersteller", tagline: "In Minuten zum professionellen Lebenslauf" },
    fr: { icon: "💼", name: "Créateur de CV", tagline: "Un CV professionnel en quelques minutes" },
    tr: { icon: "💼", name: "CV Oluşturucu", tagline: "Dakikalar içinde profesyonel CV" },
    pt: { icon: "💼", name: "Criador de Currículo", tagline: "Um currículo profissional em minutos" },
    ja: { icon: "💼", name: "CV作成", tagline: "数分でプロフェッショナルなCVを" },
    no: { icon: "💼", name: "CV-Bygger", tagline: "Profesjonell CV på minutter" },
    nl: { icon: "💼", name: "CV-Maker", tagline: "In minuten een professioneel CV" },
    it: { icon: "💼", name: "Creatore di CV", tagline: "Un CV professionale in pochi minuti" },
  },
  imageCompressor: {
    en: { icon: "🖼️", name: "Image Compressor", tagline: "Shrink photo size without losing quality" },
    es: { icon: "🖼️", name: "Compresor de Imágenes", tagline: "Reduce el tamaño sin perder calidad" },
    ur: { icon: "🖼️", name: "Image Compressor", tagline: "Tasveer chhoti karen, quality wahi" },
    de: { icon: "🖼️", name: "Bildkompressor", tagline: "Bilder verkleinern ohne Qualitätsverlust" },
    fr: { icon: "🖼️", name: "Compresseur d'Image", tagline: "Réduisez sans perdre en qualité" },
    tr: { icon: "🖼️", name: "Resim Sıkıştırıcı", tagline: "Kaliteden ödün vermeden küçültün" },
    pt: { icon: "🖼️", name: "Compressor de Imagem", tagline: "Reduza sem perder qualidade" },
    ja: { icon: "🖼️", name: "画像圧縮ツール", tagline: "画質を保って軽量化" },
    no: { icon: "🖼️", name: "Bildekompressor", tagline: "Forminsk bilder uten kvalitetstap" },
    nl: { icon: "🖼️", name: "Afbeeldingcompressor", tagline: "Verklein zonder kwaliteitsverlies" },
    it: { icon: "🖼️", name: "Compressore Immagini", tagline: "Riduci senza perdere qualità" },
  },
  pdfTools: {
    en: { icon: "📕", name: "PDF Tools", tagline: "Merge PDFs & turn images into PDF" },
    es: { icon: "📕", name: "Herramientas PDF", tagline: "Une PDFs y convierte imágenes" },
    ur: { icon: "📕", name: "PDF Tools", tagline: "PDF joren aur tasveer se PDF banayen" },
    de: { icon: "📕", name: "PDF-Tools", tagline: "PDFs zusammenführen & Bilder umwandeln" },
    fr: { icon: "📕", name: "Outils PDF", tagline: "Fusionnez PDFs et convertissez images" },
    tr: { icon: "📕", name: "PDF Araçları", tagline: "PDF birleştirin, resimden PDF yapın" },
    pt: { icon: "📕", name: "Ferramentas PDF", tagline: "Junte PDFs e converta imagens" },
    ja: { icon: "📕", name: "PDFツール", tagline: "PDF結合・画像からPDF作成" },
    no: { icon: "📕", name: "PDF-Verktøy", tagline: "Slå sammen PDF og lag PDF av bilder" },
    nl: { icon: "📕", name: "PDF-Tools", tagline: "Voeg PDFs samen, maak PDF van foto's" },
    it: { icon: "📕", name: "Strumenti PDF", tagline: "Unisci PDF e crea PDF da immagini" },
  },
  media: {
    en: { icon: "🎬", name: "Video Studio", tagline: "Remove watermarks from videos & photos" },
    es: { icon: "🎬", name: "Estudio de Video", tagline: "Elimina marcas de agua de videos" },
    ur: { icon: "🎬", name: "Video Studio", tagline: "Video se watermark hatayen" },
    de: { icon: "🎬", name: "Video-Studio", tagline: "Wasserzeichen aus Videos entfernen" },
    fr: { icon: "🎬", name: "Studio Vidéo", tagline: "Supprimez les filigranes des vidéos" },
    tr: { icon: "🎬", name: "Video Stüdyosu", tagline: "Videolardan filigran kaldırın" },
    pt: { icon: "🎬", name: "Estúdio de Vídeo", tagline: "Remova marcas d'água de vídeos" },
    ja: { icon: "🎬", name: "ビデオスタジオ", tagline: "動画から透かしを除去" },
    no: { icon: "🎬", name: "Videostudio", tagline: "Fjern vannmerker fra videoer" },
    nl: { icon: "🎬", name: "Videostudio", tagline: "Verwijder watermerken uit video's" },
    it: { icon: "🎬", name: "Studio Video", tagline: "Rimuovi filigrane dai video" },
  },
  seo: {
    en: { icon: "📈", name: "SEO & Hashtags", tagline: "Generate titles, keywords & viral hashtags" },
    es: { icon: "📈", name: "SEO y Hashtags", tagline: "Genera títulos, keywords y hashtags" },
    ur: { icon: "📈", name: "SEO aur Hashtags", tagline: "Title, keywords aur hashtags banayen" },
    de: { icon: "📈", name: "SEO & Hashtags", tagline: "Titel, Keywords & Hashtags generieren" },
    fr: { icon: "📈", name: "SEO et Hashtags", tagline: "Générez titres, mots-clés et hashtags" },
    tr: { icon: "📈", name: "SEO ve Hashtagler", tagline: "Başlık, anahtar kelime oluşturun" },
    pt: { icon: "📈", name: "SEO e Hashtags", tagline: "Gere títulos e hashtags" },
    ja: { icon: "📈", name: "SEO＆ハッシュタグ", tagline: "タイトルとハッシュタグを生成" },
    no: { icon: "📈", name: "SEO og Hashtagger", tagline: "Generer titler og hashtags" },
    nl: { icon: "📈", name: "SEO & Hashtags", tagline: "Genereer titels en hashtags" },
    it: { icon: "📈", name: "SEO e Hashtag", tagline: "Genera titoli e hashtag" },
  },
  cleaner: {
    en: { icon: "🧹", name: "Cliché Cleaner", tagline: "Remove AI buzzwords & robotic phrases" },
    es: { icon: "🧹", name: "Limpiador de Clichés", tagline: "Elimina frases robóticas de IA" },
    ur: { icon: "🧹", name: "Cliché Cleaner", tagline: "AI wale ghise pite lafz hatayen" },
    de: { icon: "🧹", name: "Klischee-Entferner", tagline: "KI-Floskeln entfernen" },
    fr: { icon: "🧹", name: "Nettoyeur de Clichés", tagline: "Supprimez les phrases robotiques" },
    tr: { icon: "🧹", name: "Klişe Temizleyici", tagline: "Yapay ifadeleri temizleyin" },
    pt: { icon: "🧹", name: "Limpador de Clichês", tagline: "Remova frases robóticas" },
    ja: { icon: "🧹", name: "クリシェ除去", tagline: "AIっぽい表現を除去" },
    no: { icon: "🧹", name: "Klisjéfjerner", tagline: "Fjern AI-klisjeer" },
    nl: { icon: "🧹", name: "Clichéverwijderaar", tagline: "Verwijder AI-clichés" },
    it: { icon: "🧹", name: "Pulitore di Cliché", tagline: "Rimuovi frasi robotiche" },
  },
  diff: {
    en: { icon: "⚖️", name: "Text Diff Checker", tagline: "Compare two texts side by side" },
    es: { icon: "⚖️", name: "Comparador de Texto", tagline: "Compara dos textos lado a lado" },
    ur: { icon: "⚖️", name: "Text Diff Checker", tagline: "Do tehreeron ka mawazna karen" },
    de: { icon: "⚖️", name: "Text-Vergleich", tagline: "Zwei Texte vergleichen" },
    fr: { icon: "⚖️", name: "Comparateur de Texte", tagline: "Comparez deux textes" },
    tr: { icon: "⚖️", name: "Metin Karşılaştırıcı", tagline: "İki metni karşılaştırın" },
    pt: { icon: "⚖️", name: "Comparador de Texto", tagline: "Compare dois textos" },
    ja: { icon: "⚖️", name: "テキスト比較", tagline: "2つの文章を比較" },
    no: { icon: "⚖️", name: "Tekstsammenligner", tagline: "Sammenlign to tekster" },
    nl: { icon: "⚖️", name: "Tekstvergelijker", tagline: "Vergelijk twee teksten" },
    it: { icon: "⚖️", name: "Confronto Testi", tagline: "Confronta due testi" },
  },
};

const FREE_BADGE: Record<LanguageCode, string> = {
  en: "Free", es: "Gratis", ur: "Muft", de: "Kostenlos",
  fr: "Gratuit", tr: "Ücretsiz", pt: "Grátis", ja: "無料",
  no: "Gratis", nl: "Gratis", it: "Gratis",
};

// Map tool to its guide article slug (Urdu guides exist for all)
const TOOL_ARTICLE_SLUG: Record<string, string> = {
  humanizer: "ai-text-ko-insani-banana-urdu-guide",
  detector: "ai-detector-urdu-guide",
  citation: "citation-generator-urdu-guide",
  expander: "sentence-expander-urdu-guide",
  summarizer: "text-summarizer-urdu-guide",
  voiceTyping: "voice-typing-urdu-guide",
  cvBuilder: "cv-builder-urdu-guide",
  wordCounter: "word-counter-urdu-guide",
  textToSpeech: "text-to-speech-urdu-guide",
  imageCompressor: "image-compressor-urdu-guide",
  pdfTools: "pdf-tools-urdu-guide",
  media: "video-tools-urdu-guide",
  seo: "seo-tools-urdu-guide",
  cleaner: "cliche-cleaner-urdu-guide",
  diff: "diff-checker-urdu-guide",
};

const GUIDE_TEXT: Record<LanguageCode, string> = {
  en: "📖 Read Guide", es: "📖 Leer Guía", ur: "📖 Guide Parhen",
  de: "📖 Anleitung", fr: "📖 Lire le Guide", tr: "📖 Rehberi Oku",
  pt: "📖 Ler Guia", ja: "📖 ガイドを読む", no: "📖 Les Guide",
  nl: "📖 Lees Gids", it: "📖 Leggi Guida",
};

const PRIVATE_BADGE: Record<LanguageCode, string> = {
  en: "Private", es: "Privado", ur: "Mehfooz", de: "Privat",
  fr: "Privé", tr: "Gizli", pt: "Privado", ja: "プライベート",
  no: "Privat", nl: "Privé", it: "Privato",
};

interface Props {
  toolId: string;
  selectedLanguage?: LanguageCode;
}

export function MobileToolHero({ toolId, selectedLanguage = "en" }: Props) {
  const data = HERO_DATA[toolId]?.[selectedLanguage] || HERO_DATA[toolId]?.en;
  if (!data) return null;

  return (
    <div className="w-full bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50 text-stone-900 px-4 pt-5 pb-6 sm:hidden shadow-lg relative overflow-hidden border-b border-amber-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
      <div className="flex items-center gap-3 relative">
        <div className="text-4xl">{data.icon}</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold leading-tight">{data.name}</h1>
          <p className="text-sm text-stone-600 leading-snug mt-0.5">{data.tagline}</p>
        </div>
      </div>
      <div className="flex gap-1.5 mt-3 relative flex-wrap">
        <span className="text-[11px] font-semibold bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">
          ✓ {FREE_BADGE[selectedLanguage]}
        </span>
        <span className="text-[11px] font-semibold bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">
          🔒 {PRIVATE_BADGE[selectedLanguage]}
        </span>
        {TOOL_ARTICLE_SLUG[toolId] && (
          <a
            href={`/${selectedLanguage}/blog/${TOOL_ARTICLE_SLUG[toolId]}/`}
            className="text-[11px] font-bold bg-white text-emerald-700 px-2.5 py-1 rounded-full hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            {GUIDE_TEXT[selectedLanguage]}
          </a>
        )}
      </div>
    </div>
  );
}
