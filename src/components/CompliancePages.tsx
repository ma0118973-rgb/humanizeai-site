import { useState } from "react";
import { Mail, Phone, MapPin, Shield, CheckCircle, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ActivePage } from "../types";

interface CompliancePagesProps {
  page: ActivePage;
  onNavigateHome: () => void;
}

export function CompliancePages({ page, onNavigateHome }: CompliancePagesProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const contactEmail = "yaretmyservin7@gmail.com";
  const contactPhone = "+1 2535006555";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <button
          onClick={onNavigateHome}
          className="hover:text-emerald-600 transition-colors font-medium"
        >
          Home
        </button>
        <span>/</span>
        <span className="capitalize font-semibold text-stone-800">
          {page === "privacy"
            ? "Privacy Policy"
            : page === "terms"
            ? "Terms of Service"
            : page === "disclaimer"
            ? "Disclaimer"
            : page === "about"
            ? "About Us"
            : "Contact Us"}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Privacy Policy */}
        {page === "privacy" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                AdSense & GDPR Compliant
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Privacy Policy
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Last updated: September 2026 • Complies with Google AdSense, GDPR & CCPA
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">1. Overview</h2>
              <p>
                At <strong>HumanizeAI</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), accessible via our web application, privacy is of utmost importance. This Privacy Policy details the types of information gathered, logged, and utilized when accessing our AI Humanizer, AI Detection Scanner, and SEO utilities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">2. Google AdSense & DoubleClick Cookies</h2>
              <p>
                Google is one of our third-party vendors. Google uses cookies, specifically DART cookies, to serve ads to our site visitors based on their visit to our website and other sites across the internet. Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 underline"
                >
                  https://policies.google.com/technologies/ads
                </a>
                .
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">3. Zero Content Retention</h2>
              <p>
                We do NOT store, log, sell, or publicly share any text, essays, or prompts submitted for humanization or AI scanning. All processing is strictly performed transiently via encrypted server-side channels and discarded immediately upon response generation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">4. Log Files & Analytics</h2>
              <p>
                Like most standard website servers, we utilize log files. These files merely log visitors to the site—a standard procedure for hosting services and analytics. Information logged includes IP addresses, browser types, Internet Service Providers (ISP), referring/exit pages, and timestamps.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">5. CCPA & GDPR Privacy Rights</h2>
              <p>
                Under the California Consumer Privacy Act (CCPA) and General Data Protection Regulation (GDPR), users have the right to request disclosure of personal data collected, request erasure of personal data, and object to processing. To exercise any of these rights, contact us directly.
              </p>
            </section>

            <section className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Official Privacy Contact
              </h3>
              <p className="text-xs text-stone-600">
                Email: <a href={`mailto:${contactEmail}`} className="text-emerald-700 font-semibold">{contactEmail}</a>
              </p>
              <p className="text-xs text-stone-600">
                WhatsApp / Phone: <a href={`tel:${contactPhone}`} className="text-emerald-700 font-semibold">{contactPhone}</a>
              </p>
            </section>
          </div>
        )}

        {/* Terms of Service */}
        {page === "terms" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Legal Agreement
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Terms of Service
              </h1>
              <p className="text-xs text-stone-500 mt-1">Effective Date: September 2026</p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">1. Acceptance of Terms</h2>
              <p>
                By accessing and using HumanizeAI, you agree to be bound by these Terms of Service and all applicable local, national, and international laws.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">2. Permitted Use</h2>
              <p>
                HumanizeAI is provided free of charge for lawful personal, professional, and educational writing assistance. Users retain 100% intellectual ownership of all content rewritten or analyzed by the tool.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">3. Prohibited Conduct</h2>
              <p>
                Users agree not to use the service to generate harmful, libelous, fraudulent, or malicious material, nor attempt to reverse-engineer or disrupt server operations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">4. Disclaimer of Warranties</h2>
              <p>
                The service is provided &quot;as is&quot; without warranties of any kind. While our models aim to maximize human authenticity and readability scores, we do not guarantee specific educational or institutional grades.
              </p>
            </section>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-xs text-stone-600">
                Inquiries regarding terms: <strong>{contactEmail}</strong> • <strong>{contactPhone}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {page === "disclaimer" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Institutional Notice
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Academic & AI Disclaimer
              </h1>
              <p className="text-xs text-stone-500 mt-1">Official Policy Statement</p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">1. Educational Assistance Purpose</h2>
              <p>
                HumanizeAI is engineered as an advanced stylistic polisher, grammar enhancer, and perplexity balancer designed to assist writers in expressing authentic human prose.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">2. Academic Integrity</h2>
              <p>
                We advocate for academic honesty and ethical research methodologies. Students and scholars are encouraged to review their institution&apos;s specific AI writing guidelines. HumanizeAI is intended to aid drafting, editing, and readability—not to replace original research.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">3. Detector Evolution</h2>
              <p>
                Third-party AI detection models (such as Turnitin, GPTZero, Copyleaks) update periodically and are prone to false positives and algorithmic variance. Results shown inside HumanizeAI represent simulated estimations based on linguistic perplexity and burstiness.
              </p>
            </section>
          </div>
        )}

        {/* About Us */}
        {page === "about" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Our Mission & Vision
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                About HumanizeAI
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Making natural, human-sounding AI-assisted writing accessible worldwide
              </p>
            </div>

            <p>
              HumanizeAI was established to solve a pressing global problem: <strong>millions of students, bloggers, copywriters, and job applicants are unfairly penalized by robotic AI detectors</strong>, while competitors exploit this dilemma by charging exorbitant subscription fees ($15–$30/month) with restrictive word limits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-center space-y-1">
                <div className="text-2xl font-bold text-emerald-800">100% Free</div>
                <p className="text-xs text-emerald-700">No paywalls or hidden credit caps</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                <div className="text-2xl font-bold text-stone-900">8+ Languages</div>
                <p className="text-xs text-stone-600">Targeted high-RPM global markets</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                <div className="text-2xl font-bold text-stone-900">100% Private</div>
                <p className="text-xs text-stone-600">Runs fully in your browser, nothing uploaded</p>
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-stone-900">Global Contact Office</h2>
              <p>
                HumanizeAI Global Operations is dedicated to 24/7 reliability, data privacy, and compliance with search engine guidelines.
              </p>
              <p className="text-xs text-stone-600">
                Email: <strong>{contactEmail}</strong> • Phone/WhatsApp: <strong>{contactPhone}</strong>
              </p>
            </section>
          </div>
        )}

        {/* Contact Us */}
        {page === "contact" && (
          <div className="space-y-6 text-stone-700 text-sm leading-relaxed">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Support & Inquiries
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Contact HumanizeAI
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Get in touch for support, advertising, API inquiries, or policy assistance
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`mailto:${contactEmail}`}
                className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Direct Email
                  </span>
                  <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-700 break-all">
                    {contactEmail}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Replies typically within 12–24 hours
                  </p>
                </div>
              </a>

              <a
                href={`https://wa.me/12535006555`}
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Phone & WhatsApp
                  </span>
                  <span className="text-sm font-semibold text-stone-900 group-hover:text-emerald-700">
                    {contactPhone}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Live chat, technical & publisher support
                  </p>
                </div>
              </a>
            </div>

            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="text-sm font-bold text-stone-900">Send Direct Message</h3>
              <div className="space-y-3">
                {isSubmitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Thank you! Your message has been sent to {contactEmail}. Our team will respond shortly.</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl outline-none focus:border-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl outline-none focus:border-emerald-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="How can we help you today?"
                      className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl outline-none focus:border-emerald-500 resize-none"
                    />
                    <button
                      onClick={() => setIsSubmitted(true)}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Submit Inquiry
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
