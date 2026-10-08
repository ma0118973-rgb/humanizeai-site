export interface SampleItem {
  id: string;
  title: string;
  category: string;
  text: string;
  expectedScore?: "ai" | "human";
}

export const SAMPLE_TEXTS: SampleItem[] = [
  {
    id: "raw-ai-essay",
    title: "Raw AI Essay (Robotic)",
    category: "AI Generated",
    expectedScore: "ai",
    text: "In the contemporary epoch, the proliferation of artificial intelligence technologies has fundamentally revolutionized the pedagogical paradigm. It is imperative to delve into the ethical implications of algorithmic decision-making. Furthermore, machine learning serves as a testament to human ingenuity, fostering a transformative tapestry of socioeconomic possibilities. In conclusion, educators must embrace digital transformation while vigilantly mitigating biases.",
  },
  {
    id: "humanized-sample",
    title: "Humanized Sample Article",
    category: "Human Touch",
    expectedScore: "human",
    text: "AI in schools isn't just changing how students turn in homework—it's forcing teachers to rethink grading altogether. That shouldn't come as a shock. When algorithms can spin up a five-paragraph history essay in seconds, the old multiple-choice and take-home rubrics fall flat. But here's what actually matters: instead of banning software in panic, top educators are having frank conversations with their classrooms about truth, source verification, and independent reasoning.",
  },
  {
    id: "tech-blog",
    title: "Tech Blog (Quantum Computing)",
    category: "Blog / SEO",
    expectedScore: "ai",
    text: "Quantum computing stands at the forefront of digital disruption, acting as a beacon of unprecedented computational speed. Delving into the realm of qubits reveals a transformative architecture that empowers cryptographers and data scientists alike. Moreover, it is crucial to recognize that harnessing quantum supremacy will reshape cybersecurity forever. Ultimately, this technological revolution paves the way for a future of infinite possibilities.",
  },
  {
    id: "job-cover-letter",
    title: "Executive Cover Letter",
    category: "Career",
    expectedScore: "ai",
    text: "I am writing to enthusiastically express my interest in the Senior Product Strategist role. Throughout my career, I have continually spearheaded cross-functional initiatives and leveraged data-driven insights to maximize stakeholder synergy. It is my firm belief that fostering collaboration is pivotal to driving sustainable revenue streams. I welcome the opportunity to delve deeper into how my skill set aligns with your visionary mission.",
  },
  {
    id: "urdu-article",
    title: "Urdu AI Essay (اردو مضمون)",
    category: "Urdu",
    expectedScore: "ai",
    text: "جدید دور میں مصنوعی ذہانت نے روزمرہ زندگی کو انقلابی انداز میں تبدیل کر دیا ہے۔ تعلیمی اور تحقیقی اداروں میں اس ٹیکنالوجی کے اثرات گہرے اور دور رس ہیں۔ ضرورت اس بات کی ہے کہ ہم ان وسائل کا مثبت اور اخلاقی استعمال یقینی بنائیں تاکہ انسانی صلاحیتوں کو مزید نکھارا جا سکے۔",
  },
];

export const COMPETITOR_DATA = [
  {
    name: "Undetectable AI",
    price: "$14.99 / mo",
    freeLimit: "250 words only",
    turnitinBypass: "Varies by text",
    stealthEngine: "Standard Paraphrase",
    ourAdvantage: "100% Free, Unlimited Words, No Sign-Up Needed",
  },
  {
    name: "StealthGPT",
    price: "$19.99 / mo",
    freeLimit: "No free tier",
    turnitinBypass: "Varies by text",
    stealthEngine: "Ghost Mode",
    ourAdvantage: "Zero Paywall, Real-time Detector Scoring, Instant Diff view",
  },
  {
    name: "Walter Writes AI",
    price: "$25.00 / mo",
    freeLimit: "Credit based",
    turnitinBypass: "Varies by text",
    stealthEngine: "Syntactic Restructure",
    ourAdvantage: "Multi-tone customization, SEO Hashtags + Meta tag generator included free",
  },
  {
    name: "QuillBot Premium",
    price: "$9.95 / mo",
    freeLimit: "125 words basic",
    turnitinBypass: "Varies by text",
    stealthEngine: "Simple Synonym Swapping",
    ourAdvantage: "Deep contextual rewrite, high burstiness & natural perplexity",
  },
];
