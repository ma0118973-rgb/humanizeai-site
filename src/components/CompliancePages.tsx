import { useState } from "react";
import { Mail, Phone, Shield, Clock, AlertTriangle } from "lucide-react";
import { ActivePage } from "../types";

interface CompliancePagesProps {
  page: ActivePage;
  onNavigateHome: () => void;
}

const ALL_TOOLS = [
  "AI Humanizer",
  "AI Detector",
  "Citation Generator",
  "Sentence Expander",
  "Text Summarizer",
  "Image Compressor",
  "PDF Tools",
  "Video Reels Studio",
  "SEO Optimizer",
  "Cliché Cleaner",
  "Diff Checker",
];

export function CompliancePages({ page, onNavigateHome }: CompliancePagesProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const contactEmail = "yaretmyservin7@gmail.com";
  const contactPhone = "+1 2535006555";

  const toolsList = ALL_TOOLS.join(", ");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={onNavigateHome} className="hover:text-emerald-600 transition-colors font-medium">
          Home
        </button>
        <span>/</span>
        <span className="capitalize font-semibold text-stone-800">
          {page === "privacy" ? "Privacy Policy"
            : page === "terms" ? "Terms of Service"
            : page === "disclaimer" ? "Disclaimer"
            : page === "about" ? "About Us" : "Contact Us"}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8">
        {page === "privacy" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Your Privacy Matters</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Privacy Policy</h1>
              <p className="text-xs text-stone-500 mt-1">Last updated: October 2026</p>
            </div>

            <p>
              Hey there! Thanks for using HumanizeAI. We know privacy policies are usually boring walls of legal text,
              so we'll keep this simple and honest. Here's exactly what happens with your data when you use our tools —
              the {toolsList}.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">What We Collect (Spoiler: Almost Nothing)</h2>
              <p>
                Here's the good news: <strong>most of our tools run entirely in your browser</strong>. When you use the
                Image Compressor, PDF Tools, Diff Checker, or the built-in offline engines — nothing you paste or upload
                leaves your device. We don't see it, we don't store it, we don't sell it. When you close the tab,
                it's gone.
              </p>
              <p>
                <strong>Optional AI features:</strong> some tools offer AI-powered buttons (like "Enhance with AI", "AI
                Summary", or "AI Suggestions") and the AI Humanizer can use an AI mode. When you click one of these,
                the text you entered is sent securely to our server, which forwards it to Google's Gemini AI service so
                it can generate the result. Google processes that text under{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-emerald-600 underline">
                  Google's Privacy Policy
                </a>. We don't store your text on our servers — it's forwarded, processed, and discarded. If you'd
                rather not send anything anywhere, just use the built-in offline engines instead; they work without
                any network AI calls.
              </p>
              <p>
                The only things we automatically receive are the basics every website gets: your IP address, browser type,
                and which pages you visit. We use this for simple analytics (like "how many people visited today?") and
                to keep the site running smoothly.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Google AdSense & Cookies</h2>
              <p>
                To keep all our tools free, we show ads through Google AdSense. Google may use cookies (including the
                DART cookie) to show you relevant ads based on your visits to our site and others. You can opt out of
                personalized ads anytime by visiting{" "}
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-emerald-600 underline">
                  Google's Ad Settings
                </a>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Your Rights (GDPR & CCPA)</h2>
              <p>
                If you're in the EU or California, you have the right to know what data we have about you, ask us to
                delete it, or opt out of data collection. Since we barely collect anything, there's not much to delete —
                but if you ever want to exercise these rights, just email us. We respond within a few days, not months.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Kids' Privacy</h2>
              <p>
                Our tools are designed for general audiences — students, writers, professionals. We don't knowingly
                collect information from children under 13. If you're a parent and think your child shared info with us,
                email us and we'll sort it out right away.
              </p>
            </section>

            <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Questions About Privacy?</h3>
              <p className="text-xs text-stone-600">
                Email us anytime: <a href={`mailto:${contactEmail}`} className="text-emerald-700 font-semibold">{contactEmail}</a>
              </p>
              <p className="text-xs text-stone-600">
                Phone/WhatsApp: <a href={`tel:${contactPhone}`} className="text-emerald-700 font-semibold">{contactPhone}</a>
              </p>
            </section>
          </div>
        )}

        {page === "terms" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">The Fine Print, In Plain English</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Terms of Service</h1>
              <p className="text-xs text-stone-500 mt-1">Effective: October 2026</p>
            </div>

            <p>
              Welcome to HumanizeAI! By using our free tools — {toolsList} — you agree to these
              terms. We've written them in normal human language, not lawyer-speak.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">What You Can Do</h2>
              <p>
                Use all our tools freely for personal, educational, or professional work. Humanize your essays, check
                text with our AI Detector, generate citations, compress images, merge PDFs, optimize your content for
                SEO — it's all free, no account needed. <strong>Everything you create with our tools is 100% yours.</strong> We
                claim zero ownership over your rewritten text, generated citations, compressed images, or merged PDFs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">What You Can't Do</h2>
              <p>
                Please don't use our tools for anything harmful — no spam, no fraud, no harassing others, no trying to
                break the site. Also, don't try to copy our entire website or resell our tools as your own. That's not cool.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Honest Expectations</h2>
              <p>
                Our tools are genuinely useful, but they're not magic. The AI Detector gives heuristic estimates, not
                official verdicts. The AI Humanizer rewrites text using smart rules, not a real AI model. The Citation
                Generator follows standard formats but you should double-check against official style guides for critical
                work. We do our best to keep everything accurate and running, but we can't guarantee perfection.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Changes to These Terms</h2>
              <p>
                If we ever update these terms, we'll post the new version here with a fresh date. Continued use of the
                site means you're okay with the updates.
              </p>
            </section>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-xs text-stone-600">
                Questions about these terms? <strong>{contactEmail}</strong> • <strong>{contactPhone}</strong>
              </p>
            </div>
          </div>
        )}

        {page === "disclaimer" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Please Read
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Disclaimer</h1>
              <p className="text-xs text-stone-500 mt-1">Being upfront about what our tools can and can't do</p>
            </div>

            <p>
              We believe in honesty. Here's what you should know about our tools: the {toolsList}.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">AI Detector Is an Estimate</h2>
              <p>
                Our AI Detector uses pattern analysis to estimate whether text looks AI-generated. It's a helpful writing
                feedback tool, but it's <strong>not</strong> Turnitin, GPTZero, or any official detection system. Scores
                are estimates, not verdicts. Don't use them to accuse anyone of anything.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">How the AI Humanizer Works</h2>
              <p>
                Our Humanizer offers two modes: an optional AI mode (powered by Google's Gemini, when you choose it)
                and a built-in offline engine that rewrites text using linguistic rules. Neither mode makes text
                "undetectable" or guarantees any specific outcome. Always review the output and add your own voice.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Academic Integrity</h2>
              <p>
                We support honest academic work. Our tools are meant to help you write better — not to replace your own
                thinking. Always follow your school or institution's guidelines about AI-assisted writing. When in doubt, ask
                your teacher.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Other Tools</h2>
              <p>
                The Citation Generator follows APA, MLA, and Chicago styles but always verify critical citations against
                official guides. The Image Compressor works in your browser (note: PNG quality slider has limited effect
                due to browser encoding). PDF Tools merge and create PDFs locally but don't do true PDF compression.
                The SEO Optimizer gives suggestions, not ranking guarantees.
              </p>
            </section>
          </div>
        )}

        {page === "about" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Our Story</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">About HumanizeAI</h1>
              <p className="text-xs text-stone-500 mt-1">Free tools for better writing, in 11 languages</p>
            </div>

            <p>
              Hi! We're the team behind HumanizeAI. We started this project with a simple frustration: good writing
              tools were either expensive, required signups, or uploaded your private documents to random servers.
              We thought — why not build tools that are <strong>free, private, and actually work in your browser</strong>?
            </p>

            <p>So we built 11 tools that cover the full writing workflow:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["AI Humanizer", "Makes robotic text sound natural and human"],
                ["AI Detector", "Estimates whether text looks AI-generated"],
                ["Citation Generator", "APA, MLA, Chicago references in seconds"],
                ["Sentence Expander", "Turns short text into detailed writing"],
                ["Text Summarizer", "Condenses long documents instantly"],
                ["Image Compressor", "Shrinks photos without visible quality loss"],
                ["PDF Tools", "Merge PDFs or create them from images"],
                ["Video Reels Studio", "Filters and tools for viral short videos"],
                ["SEO Optimizer", "Keywords, meta tags, and hashtags"],
                ["Cliché Cleaner", "Removes overused AI phrases"],
                ["Diff Checker", "Compares two texts side by side"],
              ].map(([name, desc]) => (
                <div key={name} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-900 text-xs">{name}</div>
                  <div className="text-xs text-stone-600">{desc}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-center space-y-1">
                <div className="text-2xl font-bold text-emerald-800">Free to Use</div>
                <p className="text-xs text-emerald-700">No paywalls, no signups</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                <div className="text-2xl font-bold text-stone-900">11 Languages</div>
                <p className="text-xs text-stone-600">Urdu, English, Spanish & more</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                <div className="text-2xl font-bold text-stone-900">Private by Design</div>
                <p className="text-xs text-stone-600">Offline engines keep your text on your device</p>
              </div>
            </div>

            <p>
              We've also written <strong>in-depth guides</strong> for our tools in multiple languages to help you
              get the most out of every feature. Whether you're a student, blogger, freelancer, or just someone who
              wants to write better — we're here to help.
            </p>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Get In Touch</h2>
              <p className="text-xs text-stone-600">
                Email: <strong>{contactEmail}</strong> • Phone/WhatsApp: <strong>{contactPhone}</strong>
              </p>
            </section>
          </div>
        )}

        {page === "contact" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">We'd Love To Hear From You</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Contact Us</h1>
              <p className="text-xs text-stone-500 mt-1">Questions, feedback, or just want to say hi? Reach out!</p>
            </div>

            <p>
              Whether you need help with the {toolsList}, found a bug, have a feature
              suggestion, or want to talk about advertising — we're here. We actually read every message.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href={`mailto:${contactEmail}`} className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Email Us</span>
                  <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-700 break-all">{contactEmail}</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">We read every message</p>
                </div>
              </a>

              <a href={`tel:${contactPhone}`} className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Call / WhatsApp</span>
                  <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-700">{contactPhone}</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Leave a message any time</p>
                </div>
              </a>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs text-stone-600">
                  <strong className="text-stone-900">What can we help with?</strong> Tool support, bug reports,
                  guide requests, translation help, advertising inquiries, or partnership ideas — all welcome!
                </p>
              </div>
            </div>

            {!isSubmitted ? (
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const name = String(fd.get("cf-name") || ""); const from = String(fd.get("cf-email") || ""); const msg = String(fd.get("cf-message") || ""); const subject = encodeURIComponent("ToolVena contact from " + name); const body = encodeURIComponent(msg + "\n\n— " + name + " (" + from + ")"); window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`; setIsSubmitted(true); }} className="space-y-4 p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <h3 className="font-bold text-stone-900">Send Us a Message</h3>
                <input name="cf-name" type="text" placeholder="Your name" required className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input name="cf-email" type="email" placeholder="Your email" required className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <textarea name="cf-message" placeholder="What's on your mind?" rows={4} required className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors">
                  Send Message
                </button>
                <p className="text-[11px] text-stone-500 text-center">This form opens your email app — we don't store form submissions.</p>
              </form>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <div className="text-3xl mb-2">✓</div>
                <h3 className="font-bold text-emerald-900">Thanks for reaching out!</h3>
                <p className="text-sm text-stone-600 mt-1">Your email app should have opened with your message ready — just press Send there.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-stone-500 justify-center">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        <span>Your privacy is protected • Offline engines keep your text on your device</span>
      </div>
    </div>
  );
}
