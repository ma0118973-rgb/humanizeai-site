import { Trash2, Copy, Check, ArrowUpRight, X, Clock, FileText } from "lucide-react";
import { useState } from "react";
import { SavedDraft } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedDraft[];
  onRestoreDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  drafts,
  onRestoreDraft,
  onDeleteDraft,
  onClearAll,
}: HistoryDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Revision History</h2>
                <p className="text-xs text-stone-500">
                  {drafts.length} saved {drafts.length === 1 ? "draft" : "drafts"} in browser storage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {drafts.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium mr-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drafts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {drafts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
                <FileText className="w-10 h-10 stroke-1 text-stone-600" />
                <p className="text-sm font-semibold text-stone-700">No Drafts Saved Yet</p>
                <p className="text-xs text-stone-500 max-w-xs">
                  Whenever you click "Humanize", your transformed text is automatically saved here for quick reference.
                </p>
              </div>
            ) : (
              drafts.map((draft) => {
                const dateStr = new Date(draft.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-300 bg-stone-50/40 hover:bg-white transition-all space-y-2 group shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 font-semibold uppercase text-[10px] tracking-wider">
                          {draft.tone}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-500 font-mono text-[11px]">{dateStr}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(draft.id, draft.humanizedText)}
                          title="Copy humanized text"
                          className="p-1 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                        >
                          {copiedId === draft.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteDraft(draft.id)}
                          title="Delete draft"
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed font-sans bg-white p-2 rounded-lg border border-stone-100">
                      {draft.humanizedText}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                      <span>{draft.humanizedWordCount} words</span>
                      <button
                        onClick={() => {
                          onRestoreDraft(draft);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        <span>Load to Editor</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 text-center">
            Saved securely in your browser's private local storage. Never sent to third parties.
          </div>
        </div>
      </div>
    </div>
  );
}
