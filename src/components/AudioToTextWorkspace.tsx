import React, { useEffect, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AlertTriangle, Check, Copy, Download, Eraser, FileAudio, Info,
  ListMusic, Play, ShieldCheck, UploadCloud,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface AudioToTextWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface TranscriptChunk {
  text: string;
  timestamp: [number | null, number | null];
}

interface FileProgressInfo {
  loaded: number;
  total: number;
  progress: number;
}

type Phase =
  | "idle"
  | "reading"
  | "decoding"
  | "preparing"
  | "starting"
  | "downloading"
  | "analyzing"
  | "done"
  | "error";

const MAX_FILE_BYTES = 500 * 1024 * 1024;

// The speech engine (Transformers.js + ONNX runtime) is self-hosted under
// /transformers/ so the page never depends on a third-party JS CDN. Only the
// Whisper model files come from the public Hugging Face model library —
// they are a one-time download that the browser then caches. No audio,
// transcript or user data is ever sent anywhere.
function buildWorkerCode(): string {
  const origin = window.location.origin;
  const libUrl = `${origin}/transformers/transformers.esm.js`;
  const libDir = `${origin}/transformers/`;
  return `
    import { pipeline, env } from '${libUrl}';

    // Model files download once from the Hugging Face model library and are
    // cached by the browser; the JS/WASM inference runtime is self-hosted.
    env.allowRemoteModels = true;
    env.allowLocalModels = false;
    env.backends.onnx.wasm.wasmPaths = '${libDir}';

    let transcriber = null;

    async function getTranscriber(progressCallback) {
      if (!transcriber) {
        transcriber = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-tiny', {
          dtype: 'q8',
          progress_callback: progressCallback
        });
      }
      return transcriber;
    }

    self.onmessage = async (e) => {
      const { type, audioData } = e.data;
      if (type !== 'transcribe') return;
      try {
        const pipe = await getTranscriber((data) => {
          if (!data || !data.status) return;
          if (data.status === 'initiate' || data.status === 'download' || data.status === 'progress' || data.status === 'done') {
            self.postMessage({ type: 'progress', data: {
              status: data.status,
              file: data.file || null,
              name: data.name || null,
              loaded: data.loaded || 0,
              total: data.total || 0,
              progress: data.progress || 0
            } });
          } else if (data.status === 'ready') {
            self.postMessage({ type: 'ready', file: data.file || null });
          }
        });
        self.postMessage({ type: 'status', code: 'analyzing' });
        const response = await pipe(audioData, {
          chunk_length_s: 30,
          stride_length_s: 5,
          return_timestamps: true
        });
        self.postMessage({ type: 'result', response });
      } catch (err) {
        self.postMessage({ type: 'error', error: (err && err.message) || String(err) });
      }
    };
  `;
}

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatClock(seconds: number, separator: "," | "."): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  const ms = Math.floor((safe - Math.floor(safe)) * 1000);
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}${separator}${pad(ms, 3)}`;
}

export function AudioToTextWorkspace({ selectedLanguage = "en" }: AudioToTextWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const at = (t as any).audioToText || {};

  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusText, setStatusText] = useState<string>("");
  const [percent, setPercent] = useState<number | null>(null);
  const [fileLines, setFileLines] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const progressRef = useRef<Record<string, FileProgressInfo>>({});

  const busy =
    phase === "reading" || phase === "decoding" || phase === "preparing" ||
    phase === "starting" || phase === "downloading" || phase === "analyzing";

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = transcript.length;

  const setStage = (next: Phase, text: string) => {
    setPhase(next);
    setStatusText(text);
  };

  const handleFile = (picked: File | undefined) => {
    if (!picked) return;
    setError("");
    if (picked.size > MAX_FILE_BYTES) {
      setError(
        at.errorTooLarge ||
          "That file is very large for an on-device tool. Please trim it or split it into shorter parts first."
      );
      return;
    }
    setFile(picked);
    if (phase === "done" || phase === "error") {
      setPhase("idle");
      setStatusText("");
      setPercent(null);
      setFileLines([]);
    }
  };

  const renderModelProgress = (downloadingText: string) => {
    const entries = Object.entries(progressRef.current);
    let totalLoaded = 0;
    let totalSize = 0;
    const lines = entries.map(([name, info]) => {
      totalLoaded += info.loaded || 0;
      totalSize += info.total || 0;
      const pct = info.total > 0 ? Math.round((info.loaded / info.total) * 100) : Math.round(info.progress || 0);
      const size = info.total > 0 ? ` (${formatMB(info.loaded)} / ${formatMB(info.total)})` : "";
      return `${name.split("/").pop()}: ${pct}%${size}`;
    });
    setFileLines(lines);
    if (totalSize > 0) {
      const overall = (totalLoaded / totalSize) * 100;
      setPercent(overall);
      setPhase("downloading");
      setStatusText(`${downloadingText} ${Math.round(overall)}% (${formatMB(totalLoaded)} / ${formatMB(totalSize)})`);
    } else {
      setPhase("downloading");
      setStatusText(downloadingText);
    }
  };

  const getWorker = (): Worker | null => {
    if (workerRef.current) return workerRef.current;
    let created: Worker;
    try {
      const blob = new Blob([buildWorkerCode()], { type: "application/javascript" });
      created = new Worker(URL.createObjectURL(blob), { type: "module" });
    } catch {
      setStage("error", "");
      setError(at.errorBrowser || "This browser could not start the on-device speech engine.");
      return null;
    }

    created.onmessage = (e: MessageEvent) => {
      const msg = e.data || {};
      if (msg.type === "progress") {
        const d = msg.data || {};
        const key = d.file || d.name;
        if (key) {
          const prev = progressRef.current[key] || { loaded: 0, total: 0, progress: 0 };
          progressRef.current[key] =
            d.status === "done"
              ? { loaded: prev.total || prev.loaded || 0, total: prev.total || prev.loaded || 0, progress: 100 }
              : {
                  loaded: d.loaded || prev.loaded || 0,
                  total: d.total || prev.total || 0,
                  progress: d.progress || prev.progress || 0,
                };
          renderModelProgress(at.statusDownloading || "Downloading the speech model (first time only)…");
        }
      } else if (msg.type === "ready") {
        setPercent(100);
        setStage("downloading", at.statusModelReady || "Speech model ready.");
      } else if (msg.type === "status" && msg.code === "analyzing") {
        setStage("analyzing", at.statusAnalyzing || "Listening and writing your transcript…");
      } else if (msg.type === "result") {
        const response = msg.response || {};
        setTranscript(String(response.text || "").trim());
        setChunks(Array.isArray(response.chunks) ? response.chunks : []);
        setEdited(false);
        setPercent(100);
        setStage("done", at.statusDone || "Transcript ready.");
      } else if (msg.type === "error") {
        setStage("error", "");
        setError(
          (at.errorFailed || "Transcription stopped before it finished.") +
            (msg.error ? ` (${String(msg.error).slice(0, 160)})` : "")
        );
      }
    };
    created.onerror = () => {
      // A module worker that fails to load previously stalled in silence —
      // surface it so the visitor always gets an honest message.
      setStage("error", "");
      setError(at.errorBrowser || "This browser could not start the on-device speech engine.");
    };
    workerRef.current = created;
    return created;
  };

  const processAudio = async (audioFile: File): Promise<Float32Array> => {
    setStage("reading", at.statusReading || "Reading your audio file…");
    const arrayBuffer = await audioFile.arrayBuffer();
    setStage("decoding", at.statusDecoding || "Decoding audio…");
    const AudioCtx: typeof AudioContext | undefined =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      throw new Error(at.errorBrowser || "This browser could not start the on-device speech engine.");
    }
    const ctx = new AudioCtx();
    let decoded: AudioBuffer;
    try {
      decoded = await ctx.decodeAudioData(arrayBuffer);
    } catch {
      void ctx.close().catch(() => undefined);
      throw new Error(at.errorDecode || "That file could not be decoded as audio. Please try an MP3, WAV or M4A file.");
    }
    void ctx.close().catch(() => undefined);
    setStage("preparing", at.statusPreparing || "Preparing audio for the speech model…");
    const offline = new OfflineAudioContext(1, Math.max(1, Math.round(decoded.duration * 16000)), 16000);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  };

  const handleTranscribe = async () => {
    if (!file || busy) return;
    setError("");
    setTranscript("");
    setChunks([]);
    setEdited(false);
    setFileLines([]);
    setPercent(null);
    progressRef.current = {};
    try {
      const audioData = await processAudio(file);
      const worker = getWorker();
      if (!worker) return;
      setStage("starting", at.statusStarting || "Starting the on-device speech engine…");
      worker.postMessage({ type: "transcribe", audioData });
    } catch (err) {
      setStage("error", "");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const cues = (): { start: number; end: number; text: string }[] => {
    if (chunks.length && !edited) {
      return chunks.map((chunk, i) => {
        const start = typeof chunk.timestamp?.[0] === "number" ? (chunk.timestamp[0] as number) : i * 5;
        const endRaw = chunk.timestamp?.[1];
        const end = typeof endRaw === "number" ? endRaw : start + 5;
        return { start, end, text: chunk.text.trim() };
      }).filter((c) => c.text);
    }
    return transcript.trim() ? [{ start: 0, end: 10, text: transcript.trim() }] : [];
  };

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseName = file ? file.name.replace(/\.[^.]+$/, "") : "transcript";

  const handleCopy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadTxt = () => {
    if (transcript.trim()) download(transcript, `${baseName}_transcript.txt`, "text/plain");
  };

  const handleDownloadSrt = () => {
    const list = cues();
    if (!list.length) return;
    const body = list
      .map((c, i) => `${i + 1}\n${formatClock(c.start, ",")} --> ${formatClock(c.end, ",")}\n${c.text}\n`)
      .join("\n");
    download(body, `${baseName}.srt`, "text/srt");
  };

  const handleDownloadVtt = () => {
    const list = cues();
    if (!list.length) return;
    const body =
      "WEBVTT\n\n" +
      list.map((c) => `${formatClock(c.start, ".")} --> ${formatClock(c.end, ".")}\n${c.text}\n`).join("\n");
    download(body, `${baseName}.vtt`, "text/vtt");
  };

  const handleClear = () => {
    setTranscript("");
    setChunks([]);
    setEdited(false);
    setError("");
    if (!busy) {
      setPhase("idle");
      setStatusText("");
      setPercent(null);
      setFileLines([]);
    }
  };

  const showProgress = phase !== "idle" && phase !== "done" && phase !== "error";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="audioToText" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-cyan-100 via-sky-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-cyan-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.18),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 flex items-center gap-1.5">
              <FileAudio className="w-3.5 h-3.5 text-cyan-600" />
              {at.badge || "Audio to Text Converter"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up • On-device</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {at.title || "Turn Audio Into Text, Right in Your Browser"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {at.subtitle ||
              "Choose an MP3, WAV, M4A or MP4 file and get a transcript from a speech model that runs on your own device. Your audio is never uploaded — after a one-time model download of about 40 MB, this even works offline."}
          </p>
        </div>
      </div>

      <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-600 text-white rounded-xl font-bold shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-cyan-950">
              {at.quickAnswerTitle || "Quick Answer: How Does This Audio to Text Converter Work?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {at.quickAnswer ||
                "You pick an audio file, this page decodes it in your browser, resamples it to the 16 kHz mono the speech model expects, and a compact Whisper model transcribes it locally. You can then copy the text or download it as TXT, SRT or VTT subtitles. The first transcription downloads the model files once (about 40 MB); later visits reuse the cached copy, and no audio or transcript ever leaves your device."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-6 space-y-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-colors ${
            dragOver ? "border-cyan-500 bg-cyan-50" : "border-stone-300 hover:border-cyan-400 hover:bg-cyan-50/50"
          }`}
        >
          <UploadCloud className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
          <p className="text-sm sm:text-base font-bold text-stone-800">
            {at.dropTitle || "Click to choose an audio file, or drop it here"}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {at.dropHint || "MP3, WAV, M4A, MP4 and other formats your browser can play"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.ogg,.webm,.flac"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {file && (
          <p className="text-xs sm:text-sm text-stone-700 bg-cyan-50 border border-cyan-200 rounded-xl px-3 py-2">
            <strong>{at.selectedLabel || "Selected file"}:</strong> {file.name} ({formatMB(file.size)})
          </p>
        )}

        {error && (
          <p className="text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </p>
        )}

        {showProgress && (
          <div className="space-y-2" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="font-semibold text-stone-700">{statusText}</span>
              {percent !== null && <span className="font-bold text-cyan-700">{Math.round(percent)}%</span>}
            </div>
            <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
              {percent !== null ? (
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              ) : (
                // No honest number exists for decoding/inference — pulse only,
                // never an invented percentage.
                <div className="h-full w-full bg-cyan-300 rounded-full animate-pulse" />
              )}
            </div>
            {fileLines.length > 0 && (
              <pre className="text-[11px] leading-relaxed text-stone-500 whitespace-pre-wrap font-mono">{fileLines.join("\n")}</pre>
            )}
          </div>
        )}

        <button
          onClick={handleTranscribe}
          disabled={!file || busy}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4" /> {at.transcribeBtn || "Transcribe audio"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2 mr-auto">
            <ListMusic className="w-5 h-5 text-cyan-600" /> {at.outputTitle || "Your transcript"}
          </h2>
          <button
            onClick={handleCopy}
            disabled={!transcript}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{" "}
            {copied ? (at.copied || "Copied!") : (at.copyBtn || "Copy transcript")}
          </button>
          <button
            onClick={handleDownloadTxt}
            disabled={!transcript.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" /> {at.downloadTxt || "Download .txt"}
          </button>
          <button
            onClick={handleDownloadSrt}
            disabled={!transcript.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" /> {at.downloadSrt || "Download .srt"}
          </button>
          <button
            onClick={handleDownloadVtt}
            disabled={!transcript.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" /> {at.downloadVtt || "Download .vtt"}
          </button>
          <button
            onClick={handleClear}
            disabled={!transcript && !error}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
          >
            <Eraser className="w-4 h-4" /> {at.clearBtn || "Clear"}
          </button>
        </div>
        <textarea
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setEdited(true);
          }}
          placeholder={at.outputPlaceholder || "Your transcript will appear here. You can edit it before copying or downloading."}
          className="w-full h-56 sm:h-72 rounded-2xl border border-stone-300 p-4 text-sm sm:text-base leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-cyan-500 resize-y"
        />
        <div className="flex flex-wrap gap-2 text-xs text-stone-600">
          <span className="px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 font-semibold">
            {wordCount} {at.wordsLabel || "words"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200 font-semibold">
            {charCount} {at.charsLabel || "characters"}
          </span>
          {phase === "done" && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
              {at.statusDone || "Transcript ready."}
            </span>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-2xl p-4 sm:p-6">
        <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-cyan-600" /> {at.modelNoteTitle || "One small download, then it is yours"}
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          {at.modelNoteText ||
            "The speech model (about 40 MB) downloads once from a public model library and is cached by your browser. After that, transcriptions run entirely on your device — even with the internet switched off. Nothing about your audio is sent anywhere by this tool."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-cyan-600" /> {at.limitsTitle || "Honest limits"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {at.limitsText ||
              "This tool uses a compact speech model so it can run on ordinary phones and laptops. It is at its best with short, clear recordings — roughly a few minutes, one speaker, little background noise. Long meetings, overlapping voices, heavy accents and noisy rooms will produce more mistakes, and names or technical words are often the first to go wrong. Always proofread the transcript before you rely on it."}
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" /> {at.privacyTitle || "Private by design"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {at.privacyNote ||
              "Your audio file is decoded and transcribed inside this browser tab. It is not uploaded to ToolVena or any transcription service, and the transcript exists only in this tab until you copy or download it. Closing the tab forgets everything."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="audioToText" selectedLanguage={selectedLanguage} />
    </div>
  );
}
