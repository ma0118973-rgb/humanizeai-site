import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Download, Eraser, FileText, Plus, ShieldCheck, Trash2, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface OnlineNotepadWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = "toolvena_online_notepad_v1";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `n-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}

function countStats(text: string): { words: number; chars: number; charsNoSpaces: number; lines: number } {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  return { words, chars, charsNoSpaces, lines };
}

function safeFileName(title: string, fallback: string): string {
  const base = title.trim().toLowerCase().replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return `${base || fallback}.txt`;
}

function loadStored(untitled: string, welcome: string): { notes: NoteItem[]; activeId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.notes) && parsed.notes.length > 0) {
        const notes = parsed.notes
          .filter((n: any) => n && typeof n.content === "string")
          .map((n: any) => ({
            id: typeof n.id === "string" ? n.id : newId(),
            title: typeof n.title === "string" ? n.title : untitled,
            content: n.content,
            updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now(),
          }));
        if (notes.length > 0) {
          const activeId = notes.some((n: NoteItem) => n.id === parsed.activeId) ? parsed.activeId : notes[0].id;
          return { notes, activeId };
        }
      }
    }
  } catch {
    /* storage blocked or corrupt — start fresh below */
  }
  const first: NoteItem = { id: newId(), title: untitled, content: welcome, updatedAt: Date.now() };
  return { notes: [first], activeId: first.id };
}

export function OnlineNotepadWorkspace({ selectedLanguage = "en" }: OnlineNotepadWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const np = (t as any).onlineNotepad || {};

  const untitled = np.untitled || "Untitled note";
  const welcome = np.welcomeText || "Start typing here. Everything is saved automatically in this browser.";

  const [initial] = useState(() => loadStored(untitled, welcome));
  const [notes, setNotes] = useState<NoteItem[]>(initial.notes);
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [copied, setCopied] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [storageError, setStorageError] = useState(false);
  const firstSave = useRef(true);

  const active = notes.find((n) => n.id === activeId) || notes[0];
  const stats = useMemo(() => countStats(active ? active.content : ""), [active]);

  // Instant autosave: persist the whole notebook on every change. A short
  // debounce keeps very fast typing from thrashing storage, and the visible
  // saved time updates so the user can see it worked.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, activeId }));
        setSavedAt(Date.now());
        setStorageError(false);
        firstSave.current = false;
      } catch {
        if (!firstSave.current) setStorageError(true);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [notes, activeId]);

  const updateActive = (content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, content, updatedAt: Date.now() } : n)));
  };

  const updateTitle = (title: string) => {
    setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, title, updatedAt: Date.now() } : n)));
  };

  const addNote = () => {
    const item: NoteItem = { id: newId(), title: untitled, content: "", updatedAt: Date.now() };
    setNotes((prev) => [item, ...prev]);
    setActiveId(item.id);
  };

  const deleteActive = () => {
    if (!active) return;
    const ok = window.confirm(np.deleteConfirm || "Delete this note? This cannot be undone.");
    if (!ok) return;
    setNotes((prev) => {
      const rest = prev.filter((n) => n.id !== active.id);
      if (rest.length === 0) {
        const fresh: NoteItem = { id: newId(), title: untitled, content: "", updatedAt: Date.now() };
        setActiveId(fresh.id);
        return [fresh];
      }
      setActiveId(rest[0].id);
      return rest;
    });
  };

  const clearAll = () => {
    const ok = window.confirm(np.clearAllConfirm || "Delete ALL notes in this browser? This cannot be undone. Download anything you need first.");
    if (!ok) return;
    const fresh: NoteItem = { id: newId(), title: untitled, content: "", updatedAt: Date.now() };
    setNotes([fresh]);
    setActiveId(fresh.id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes: [fresh], activeId: fresh.id }));
    } catch {
      /* visible storage note covers this */
    }
  };

  const copyActive = async () => {
    if (!active || !active.content) return;
    try {
      await navigator.clipboard.writeText(active.content);
    } catch {
      const area = document.createElement("textarea");
      area.value = active.content;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const downloadActive = () => {
    if (!active) return;
    const blob = new Blob([active.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFileName(active.title, "note");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 800);
  };

  const savedLabel = savedAt
    ? `${np.savedLabel || "Saved"} ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
    : np.savedLabel || "Saved in this browser";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="onlineNotepad" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-emerald-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {np.badge || "Online Notepad"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {np.pageTitle || "A Notepad That Is Ready the Second You Open It"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {np.subtitle || "Open the page and type. Notes save themselves in this browser, counts update as you write, and one tap downloads a plain text file. No account, no upload, nothing to install."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{np.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {np.quickAnswer || "It is a plain-text scratch pad that lives in your browser tab. Every change is saved to this browser's local storage, so closing and reopening the page brings your notes back on this device. Keep several titled notes, watch the live counts, then copy or download any note as a .txt file."}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{np.secretTitle || "Please do not keep secrets here"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {np.secretText || "Never store passwords, recovery codes, bank or card details, or other secrets in this notepad. Anyone who can open this browser on this device can read what is saved here, and browser storage is not a password manager."}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-stone-900">{np.notesTitle || "Your notes (this browser only)"}</h2>
            <button
              onClick={addNote}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> {np.newNoteBtn || "New note"}
            </button>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {notes.map((n) => {
              const s = countStats(n.content);
              const isActive = active && n.id === active.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveId(n.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${isActive ? "border-emerald-500 bg-emerald-50" : "border-stone-200 bg-stone-50 hover:border-emerald-300"}`}
                >
                  <span className="block text-sm font-bold text-stone-900 truncate">{n.title.trim() || untitled}</span>
                  <span className="block text-[11px] text-stone-500 mt-0.5 truncate">
                    {(n.content.trim().split(/\r\n|\r|\n/)[0] || np.emptyHint || "Nothing here yet — tap New note and just type.").slice(0, 60)}
                  </span>
                  <span className="block text-[11px] text-stone-400 font-mono mt-1">
                    {s.words} {np.wordsLabel || "Words"} · {s.chars} {np.charsLabel || "Characters"}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={clearAll}
            className="w-full px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eraser className="w-3.5 h-3.5" /> {np.clearAllBtn || "Clear all notes"}
          </button>
          <p className="text-[11px] text-stone-500 leading-relaxed">{np.emptyHint || "Nothing here yet — tap New note and just type."}</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="notepad-title">
              {np.titleLabel || "Note title"}
            </label>
            <input
              id="notepad-title"
              value={active ? active.title : ""}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder={np.titlePlaceholder || "Give this note a title"}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="notepad-editor">
              {np.editorLabel || "Your note"}
            </label>
            <textarea
              id="notepad-editor"
              value={active ? active.content : ""}
              onChange={(e) => updateActive(e.target.value)}
              placeholder={np.editorPlaceholder || "Type or paste here. It saves itself — no Save button needed."}
              rows={14}
              spellCheck
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
            <div className="flex gap-x-5 gap-y-1 flex-wrap text-xs text-stone-600 font-mono mt-2">
              <span>{np.wordsLabel || "Words"}: <strong className="text-stone-900">{stats.words}</strong></span>
              <span>{np.charsLabel || "Characters"}: <strong className="text-stone-900">{stats.chars}</strong></span>
              <span>{np.charsNoSpacesLabel || "Without spaces"}: <strong className="text-stone-900">{stats.charsNoSpaces}</strong></span>
              <span>{np.linesLabel || "Lines"}: <strong className="text-stone-900">{stats.lines}</strong></span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {storageError ? (np.storageError || "This browser would not save just now (storage full or blocked). Download this note to keep it.") : savedLabel}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={copyActive}
              disabled={!active || !active.content}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? (np.copied || "Copied!") : (np.copyBtn || "Copy note")}
            </button>
            <button
              onClick={downloadActive}
              disabled={!active}
              className="px-4 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-900 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> {np.downloadBtn || "Download .txt"}
            </button>
            <button
              onClick={deleteActive}
              disabled={!active}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-800 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" /> {np.deleteNoteBtn || "Delete this note"}
            </button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {np.localTitle || "Saved here, and only here"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {np.localText || "Your notes are saved in this browser on this device only. They do not sync to your phone, another browser or another computer, and they are not a cloud backup. Clearing browser site data, using private browsing or switching browsers will leave them behind — download anything important as a .txt file."}
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              {np.privacyNote || "Nothing you type is uploaded, stored on a server or shared by this tool. The text lives in this browser's local storage until you delete it or clear site data."}
            </p>
          </div>

          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">{np.tipTitle || "A good scratch-pad habit"}</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
                {np.tipText || "Use short, honest titles (Shopping list, Essay draft 2, Meeting points) so the note list stays useful, and download a .txt copy of anything you would be upset to lose. A browser notepad is for speed, not for archiving."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToolGuideSection toolId="onlineNotepad" selectedLanguage={selectedLanguage} />
    </div>
  );
}
