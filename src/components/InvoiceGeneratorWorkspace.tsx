import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, FileText, Info, Plus, Printer, ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface InvoiceGeneratorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface LineItem {
  id: number;
  description: string;
  qty: number;
  rate: number;
}

interface InvoiceData {
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  fromTaxId: string;
  toName: string;
  toAddress: string;
  toEmail: string;
  toPhone: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxLabel: string;
  discountPct: number;
  taxPct: number;
  notes: string;
  items: LineItem[];
}

const STORAGE_KEY = "invoice_generator_v1";

const CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "PKR", label: "PKR — Pakistani Rupee" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "TRY", label: "TRY — Turkish Lira" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "BDT", label: "BDT — Bangladeshi Taka" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "PHP", label: "PHP — Philippine Peso" },
  { code: "IDR", label: "IDR — Indonesian Rupiah" },
  { code: "MYR", label: "MYR — Malaysian Ringgit" },
];

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function plusDaysISO(base: string, days: number): string {
  const d = new Date(base + "T00:00:00");
  if (Number.isNaN(d.getTime())) return base;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const EMPTY: InvoiceData = {
  fromName: "",
  fromAddress: "",
  fromEmail: "",
  fromPhone: "",
  fromTaxId: "",
  toName: "",
  toAddress: "",
  toEmail: "",
  toPhone: "",
  invoiceNumber: "INV-0001",
  invoiceDate: todayISO(),
  dueDate: plusDaysISO(todayISO(), 14),
  currency: "USD",
  taxLabel: "Tax",
  discountPct: 0,
  taxPct: 0,
  notes: "",
  items: [{ id: 1, description: "", qty: 1, rate: 0 }],
};

const SAMPLE: InvoiceData = {
  fromName: "Ahmed Studio",
  fromAddress: "Main Boulevard, Lahore",
  fromEmail: "hello@example.com",
  fromPhone: "+92 300 0000000",
  fromTaxId: "",
  toName: "Client Company",
  toAddress: "Karachi",
  toEmail: "client@example.com",
  toPhone: "",
  invoiceNumber: "INV-0001",
  invoiceDate: todayISO(),
  dueDate: plusDaysISO(todayISO(), 14),
  currency: "USD",
  taxLabel: "VAT",
  discountPct: 5,
  taxPct: 10,
  notes: "Thank you for your business. Please pay within 14 days.",
  items: [
    { id: 1, description: "Website design — homepage", qty: 1, rate: 800 },
    { id: 2, description: "Logo design", qty: 2, rate: 150 },
  ],
};

export function InvoiceGeneratorWorkspace({ selectedLanguage = "en" }: InvoiceGeneratorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const iv = (t as any).invoiceGenerator || {};

  const [data, setData] = useState<InvoiceData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InvoiceData;
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
          return { ...EMPTY, ...parsed, items: parsed.items.length ? parsed.items : EMPTY.items };
        }
      }
    } catch { /* fresh start */ }
    return EMPTY;
  });
  const [saved, setSaved] = useState(false);
  const idRef = useRef(100);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      const tmr = setTimeout(() => setSaved(false), 1200);
      return () => clearTimeout(tmr);
    } catch { /* storage full or unavailable */ }
  }, [data]);

  const set = (patch: Partial<InvoiceData>) => setData((d) => ({ ...d, ...patch }));
  const nextId = () => ++idRef.current;

  const updateItem = (id: number, patch: Partial<LineItem>) =>
    set({ items: data.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  const fmt = (n: number): string => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: data.currency || "USD",
      }).format(Number.isFinite(n) ? n : 0);
    } catch {
      const v = Number.isFinite(n) ? n : 0;
      return `${data.currency || "USD"} ${v.toFixed(2)}`;
    }
  };

  const totals = useMemo(() => {
    const subtotal = data.items.reduce(
      (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
      0
    );
    const disc = Math.min(100, Math.max(0, Number(data.discountPct) || 0));
    const taxR = Math.min(100, Math.max(0, Number(data.taxPct) || 0));
    const discountAmt = (subtotal * disc) / 100;
    const taxable = subtotal - discountAmt;
    const taxAmt = (taxable * taxR) / 100;
    const total = taxable + taxAmt;
    return { subtotal, disc, taxR, discountAmt, taxable, taxAmt, total };
  }, [data.items, data.discountPct, data.taxPct]);

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-teal-600 bg-white";
  const labelCls = "block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1";

  const numVal = (v: string, fallback: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="invoiceGenerator" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-teal-100 via-teal-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-teal-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.14),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              {iv.badge || "Invoice Generator"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
            {saved && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {iv.savedNote || "Saved on this device"}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {iv.title || "Make a Clean Invoice in Minutes"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {iv.subtitle ||
              "Add who is billing, who is being billed, and what you charged for. Totals update live, then print or save as PDF. Nothing is uploaded — your invoice stays in this browser."}
          </p>
        </div>
      </div>

      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-700 text-white rounded-xl shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-teal-950">
              {iv.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {iv.quickAnswer ||
                "It builds a printable invoice from your business details, your client's details and your line items. It works out subtotal, discount, tax and total step by step in the currency you pick, saves your draft only on this device, and prints only the invoice when you press Print / Save as PDF. It is a document maker, not accounting or tax advice."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ---- FORM ---- */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 mb-4">{iv.fromSection || "From — Your Details"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>{iv.businessName || "Business / Your Name"}</label>
                <input className={inputCls} value={data.fromName} onChange={(e) => set({ fromName: e.target.value })} placeholder="Your Studio" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{iv.address || "Address"}</label>
                <textarea className={`${inputCls} h-16 resize-none`} value={data.fromAddress} onChange={(e) => set({ fromAddress: e.target.value })} placeholder="Street, City, Country" />
              </div>
              <div>
                <label className={labelCls}>{iv.email || "Email"}</label>
                <input className={inputCls} value={data.fromEmail} onChange={(e) => set({ fromEmail: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <label className={labelCls}>{iv.phone || "Phone"}</label>
                <input className={inputCls} value={data.fromPhone} onChange={(e) => set({ fromPhone: e.target.value })} placeholder="+00 000 0000000" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{iv.taxIdLabel || "Tax / Registration Number (if you have one)"}</label>
                <input className={inputCls} value={data.fromTaxId} onChange={(e) => set({ fromTaxId: e.target.value })} placeholder={iv.taxIdPlaceholder || "Only if you are registered — check your country's rules"} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 mb-4">{iv.toSection || "Bill To — Client Details"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>{iv.clientName || "Client Name / Company"}</label>
                <input className={inputCls} value={data.toName} onChange={(e) => set({ toName: e.target.value })} placeholder="Client Company" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{iv.address || "Address"}</label>
                <textarea className={`${inputCls} h-16 resize-none`} value={data.toAddress} onChange={(e) => set({ toAddress: e.target.value })} placeholder="Street, City, Country" />
              </div>
              <div>
                <label className={labelCls}>{iv.email || "Email"}</label>
                <input className={inputCls} value={data.toEmail} onChange={(e) => set({ toEmail: e.target.value })} placeholder="client@example.com" />
              </div>
              <div>
                <label className={labelCls}>{iv.phone || "Phone"}</label>
                <input className={inputCls} value={data.toPhone} onChange={(e) => set({ toPhone: e.target.value })} placeholder="+00 000 0000000" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 mb-4">{iv.detailsSection || "Invoice Details"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{iv.invoiceNumber || "Invoice Number"}</label>
                <input className={inputCls} value={data.invoiceNumber} onChange={(e) => set({ invoiceNumber: e.target.value })} placeholder="INV-0001" />
              </div>
              <div>
                <label className={labelCls}>{iv.currencyLabel || "Currency"}</label>
                <select className={inputCls} value={data.currency} onChange={(e) => set({ currency: e.target.value })}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{iv.invoiceDate || "Invoice Date"}</label>
                <input type="date" className={inputCls} value={data.invoiceDate} onChange={(e) => set({ invoiceDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{iv.dueDate || "Due Date"}</label>
                <input type="date" className={inputCls} value={data.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>{iv.taxLabelField || "Tax Label"}</label>
                <input className={inputCls} value={data.taxLabel} onChange={(e) => set({ taxLabel: e.target.value })} placeholder="Tax, VAT, GST…" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 mb-4">{iv.itemsSection || "Line Items"}</h3>
            <div className="space-y-3">
              {data.items.map((it, idx) => {
                const lineTotal = (Number(it.qty) || 0) * (Number(it.rate) || 0);
                return (
                  <div key={it.id} className="border border-stone-200 rounded-2xl p-3.5 space-y-2.5 relative">
                    {data.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set({ items: data.items.filter((x) => x.id !== it.id) })}
                        className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 cursor-pointer"
                        aria-label={iv.removeItem || "Remove item"}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <label className={labelCls}>{iv.description || "Description"}</label>
                      <input
                        className={inputCls}
                        value={it.description}
                        onChange={(e) => updateItem(it.id, { description: e.target.value })}
                        placeholder={idx === 0 ? iv.descPlaceholder || "e.g. Logo design" : ""}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className={labelCls}>{iv.qty || "Qty"}</label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className={inputCls}
                          value={String(it.qty)}
                          onChange={(e) => updateItem(it.id, { qty: numVal(e.target.value, 0) })}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{iv.rate || "Rate"}</label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className={inputCls}
                          value={String(it.rate)}
                          onChange={(e) => updateItem(it.id, { rate: numVal(e.target.value, 0) })}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{iv.amount || "Amount"}</label>
                        <div className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-stone-800 truncate">
                          {fmt(lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => set({ items: [...data.items, { id: nextId(), description: "", qty: 1, rate: 0 }] })}
              className="mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> {iv.addItem || "Add Item"}
            </button>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className={labelCls}>{iv.discountLabel || "Discount %"}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  className={inputCls}
                  value={String(data.discountPct)}
                  onChange={(e) => set({ discountPct: Math.min(100, Math.max(0, numVal(e.target.value, 0))) })}
                />
              </div>
              <div>
                <label className={labelCls}>{iv.taxRateLabel || "Tax %"}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  className={inputCls}
                  value={String(data.taxPct)}
                  onChange={(e) => set({ taxPct: Math.min(100, Math.max(0, numVal(e.target.value, 0))) })}
                />
              </div>
            </div>

            <div className="mt-4 bg-stone-50 rounded-2xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>{iv.subtotal || "Subtotal"}</span>
                <span className="font-semibold text-stone-800">{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{(iv.discountLine || "Discount ({pct}%)").replace("{pct}", String(totals.disc))}</span>
                <span className="font-semibold text-stone-800">− {fmt(totals.discountAmt)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{iv.afterDiscount || "After discount"}</span>
                <span className="font-semibold text-stone-800">{fmt(totals.taxable)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>
                  {(iv.taxLine || "{label} ({pct}%)")
                    .replace("{label}", data.taxLabel || iv.taxLabelFallback || "Tax")
                    .replace("{pct}", String(totals.taxR))}
                </span>
                <span className="font-semibold text-stone-800">+ {fmt(totals.taxAmt)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-extrabold text-stone-900">
                <span>{iv.total || "Total"}</span>
                <span>{fmt(totals.total)}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed pt-1">
                {iv.mathNote ||
                  "How this is worked out: subtotal = quantity × rate for each line, added together. Discount comes off the subtotal first. Tax is then charged on the amount after discount. Check the rates against your country's rules before you send."}
              </p>
            </div>

            <div className="mt-4">
              <label className={labelCls}>{iv.notesLabel || "Notes / Payment Terms"}</label>
              <textarea
                className={`${inputCls} h-24 resize-none`}
                value={data.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder={iv.notesPlaceholder || "Payment details, terms, or a short thank-you."}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-teal-700 text-white hover:bg-teal-600 cursor-pointer shadow"
              >
                <Printer className="w-4 h-4" /> {iv.printBtn || "Print / Save as PDF"}
              </button>
              <button
                type="button"
                onClick={() => setData({ ...SAMPLE })}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-teal-400 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> {iv.sampleBtn || "Fill Sample Data"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setData(EMPTY);
                  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-red-300 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> {iv.clearBtn || "Clear All"}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-stone-500 leading-relaxed flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-teal-600" />
              {iv.privacyNote ||
                "Everything you type stays on this device. Your draft is saved only in this browser so you can come back to it; we never receive, upload, or store your invoice. Clearing browser data or using Clear All removes it."}
            </p>
          </div>
        </div>

        {/* ---- PREVIEW ---- */}
        <div className="lg:sticky lg:top-24">
          <div id="invoice-print-area" className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800">
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-3 flex-wrap border-b-2 border-teal-700 pb-4">
                <div className="min-w-0">
                  <div className="text-xl font-extrabold tracking-tight text-stone-900">{iv.documentTitle || "INVOICE"}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {(iv.numberLabel || "#{number}").replace("{number}", data.invoiceNumber || "INV-0001")}
                  </div>
                </div>
                <div className="text-right text-xs text-stone-600 space-y-0.5">
                  <div>
                    <span className="font-bold text-stone-700">{iv.dateLabel || "Date"}: </span>
                    {data.invoiceDate || "—"}
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">{iv.dueLabel || "Due"}: </span>
                    {data.dueDate || "—"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5 text-[13px]">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 mb-1">{iv.fromHeading || "From"}</div>
                  <div className="font-bold text-stone-900 break-words">{data.fromName || "—"}</div>
                  {data.fromAddress && <div className="text-stone-600 whitespace-pre-wrap break-words">{data.fromAddress}</div>}
                  {data.fromEmail && <div className="text-stone-600 break-words">{data.fromEmail}</div>}
                  {data.fromPhone && <div className="text-stone-600 break-words">{data.fromPhone}</div>}
                  {data.fromTaxId && <div className="text-stone-500 break-words">{data.fromTaxId}</div>}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 mb-1">{iv.toHeading || "Bill To"}</div>
                  <div className="font-bold text-stone-900 break-words">{data.toName || "—"}</div>
                  {data.toAddress && <div className="text-stone-600 whitespace-pre-wrap break-words">{data.toAddress}</div>}
                  {data.toEmail && <div className="text-stone-600 break-words">{data.toEmail}</div>}
                  {data.toPhone && <div className="text-stone-600 break-words">{data.toPhone}</div>}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-stone-300 text-left text-stone-500">
                      <th className="py-2 pr-2 font-bold">{iv.colDescription || "Description"}</th>
                      <th className="py-2 px-2 font-bold text-right w-16">{iv.colQty || "Qty"}</th>
                      <th className="py-2 px-2 font-bold text-right w-24">{iv.colRate || "Rate"}</th>
                      <th className="py-2 pl-2 font-bold text-right w-28">{iv.colAmount || "Amount"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((it) => (
                      <tr key={it.id} className="border-b border-stone-100 align-top">
                        <td className="py-2 pr-2 text-stone-800 whitespace-pre-wrap break-words">{it.description || "—"}</td>
                        <td className="py-2 px-2 text-right text-stone-700">{Number(it.qty) || 0}</td>
                        <td className="py-2 px-2 text-right text-stone-700">{fmt(Number(it.rate) || 0)}</td>
                        <td className="py-2 pl-2 text-right font-semibold text-stone-900">
                          {fmt((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-[13px]">
                <div className="flex justify-between text-stone-600">
                  <span>{iv.subtotal || "Subtotal"}</span>
                  <span className="font-semibold text-stone-800">{fmt(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{(iv.discountLine || "Discount ({pct}%)").replace("{pct}", String(totals.disc))}</span>
                  <span className="font-semibold text-stone-800">− {fmt(totals.discountAmt)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>
                    {(iv.taxLine || "{label} ({pct}%)")
                      .replace("{label}", data.taxLabel || iv.taxLabelFallback || "Tax")
                      .replace("{pct}", String(totals.taxR))}
                  </span>
                  <span className="font-semibold text-stone-800">+ {fmt(totals.taxAmt)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-stone-800 pt-2 text-base font-extrabold text-stone-900">
                  <span>{iv.total || "Total"}</span>
                  <span>{fmt(totals.total)}</span>
                </div>
              </div>

              {data.notes.trim() && (
                <div className="mt-5 border-t border-stone-200 pt-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 mb-1">{iv.notesHeading || "Notes"}</div>
                  <p className="text-[13px] text-stone-700 whitespace-pre-wrap break-words">{data.notes}</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 text-center">
            {iv.printHint || "Print or “Save as PDF” — only this invoice prints, nothing else from the page."}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-amber-900 mb-1">{iv.honestTitle || "Honest limits — please read"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {iv.honestText ||
              "This tool makes the document and does the arithmetic. It is not accounting, tax, or legal advice. Whether you must charge tax, which rate applies, what registration number to show, and how invoices must be numbered all depend on your country and your registration status. Check those with your tax authority or an accountant before you send, and double-check names, amounts, and dates yourself."}
          </p>
        </div>
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {iv.privacyTitle || "Private by design"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {iv.privacyNote ||
              "Everything you type stays on this device. Your draft is saved only in this browser so you can come back to it; we never receive, upload, or store your invoice. Clearing browser data or using Clear All removes it."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="invoiceGenerator" selectedLanguage={selectedLanguage} />
    </div>
  );
}
