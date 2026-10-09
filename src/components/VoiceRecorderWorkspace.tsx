import React, { useEffect, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Download, Mic, Pause, Play, ShieldCheck, Square, Trash2, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface VoiceRecorderWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type RecorderState = "idle" | "recording" | "paused" | "done";
type ErrorKind = "denied" | "notfound" | "unsupported" | "generic" | null;

// Formats are tried in order; the browser keeps the first one it truly
// supports, and that real MIME type is what we label and download.
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

function extensionFor(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "audio";
}

function friendlyFormat(mime: string): string {
  if (mime.includes("webm")) return "WebM (audio/webm)";
  if (mime.includes("mp4")) return "MP4 (audio/mp4, saved as .m4a)";
  if (mime.includes("ogg")) return "Ogg (audio/ogg)";
  return mime || "browser default";
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function VoiceRecorderWorkspace({ selectedLanguage = "en" }: VoiceRecorderWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const vr = (t as any).voiceRecorder || {};

  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<ErrorKind>(null);
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blobSize, setBlobSize] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [finalDuration, setFinalDuration] = useState(0);
  const [level, setLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startStampRef = useRef(0);
  const accumulatedRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopMeter = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setLevel(0);
  };

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const stopTimer = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const beginTimer = () => {
    startStampRef.current = Date.now();
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startStampRef.current) / 1000);
    }, 200);
  };

  const startMeter = (stream: MediaStream) => {
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return;
      const ctx: AudioContext = new Ctor();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is a nicety only — recording continues without it */
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      stopMeter();
      stopTracks();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") setError("denied");
      else if (err?.name === "NotFoundError" || err?.name === "OverconstrainedError") setError("notfound");
      else setError("generic");
      return;
    }
    streamRef.current = stream;
    const mime = MIME_CANDIDATES.find((m) => {
      try { return MediaRecorder.isTypeSupported(m); } catch { return false; }
    }) || "";
    let recorder: MediaRecorder;
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      stopTracks();
      setError("unsupported");
      return;
    }
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const finalMime = recorder.mimeType || mime || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: finalMime });
      setMimeType(finalMime);
      setBlobSize(blob.size);
      setFinalDuration(accumulatedRef.current + (Date.now() - startStampRef.current) / 1000);
      setBlobUrl(URL.createObjectURL(blob));
      stopTimer();
      stopMeter();
      stopTracks();
      setState("done");
    };
    recorder.onerror = () => {
      stopTimer();
      stopMeter();
      stopTracks();
      setError("generic");
      setState("idle");
    };
    accumulatedRef.current = 0;
    setElapsed(0);
    recorder.start(250);
    beginTimer();
    startMeter(stream);
    setState("recording");
  };

  const pauseRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.pause();
    accumulatedRef.current += (Date.now() - startStampRef.current) / 1000;
    setElapsed(accumulatedRef.current);
    stopTimer();
    stopMeter();
    setState("paused");
  };

  const resumeRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "paused") return;
    rec.resume();
    beginTimer();
    if (streamRef.current) startMeter(streamRef.current);
    setState("recording");
  };

  const stopRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    try { rec.stop(); } catch { /* onstop/onerror handles state */ }
  };

  const discard = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setBlobSize(0);
    setMimeType("");
    setFinalDuration(0);
    setElapsed(0);
    accumulatedRef.current = 0;
    setError(null);
    setState("idle");
  };

  const download = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `voice-recording.${extensionFor(mimeType)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const statusText =
    state === "recording" ? (vr.statusRecording || "Recording…")
    : state === "paused" ? (vr.statusPaused || "Paused")
    : state === "done" ? (vr.statusDone || "Your take is ready")
    : (vr.statusReady || "Ready when you are");

  const errorInfo = (title: string, text: string) => (
    <div className="bg-red-50 border border-red-300 rounded-2xl p-4 sm:p-5 flex gap-3">
      <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <h2 className="text-sm font-extrabold text-red-950">{title}</h2>
        <p className="text-xs sm:text-sm text-red-900/80 leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="voiceRecorder" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-rose-100 via-orange-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-rose-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(244,63,94,0.13),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              {vr.badge || "Online Voice Recorder"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {vr.pageTitle || "Record Your Voice in the Browser — Nothing Leaves Your Device"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {vr.subtitle || "Press record, pause whenever you need, play the take back, and download it as a file. No account, no upload, no app to install."}
          </p>
        </div>
      </div>

      {error === "denied" && errorInfo(vr.deniedTitle || "Microphone access was blocked", vr.deniedText || "The recorder cannot work without the microphone. Allow microphone access in your browser's site settings, then try again. Nothing was recorded.")}
      {error === "notfound" && errorInfo(vr.notFoundTitle || "No microphone found", vr.notFoundText || "No working microphone was detected on this device. Connect or enable a microphone, then try again.")}
      {error === "unsupported" && errorInfo(vr.unsupportedTitle || "This browser cannot record here", vr.unsupportedText || "This browser does not support in-browser recording (MediaRecorder). Try a current version of Chrome, Edge, Firefox or Safari.")}
      {error === "generic" && errorInfo(vr.errorTitle || "Recording stopped unexpectedly", vr.errorText || "Something interrupted the recording. Your partial take could not be saved — please try again.")}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
            {state === "recording" && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
            {statusText}
          </span>
          <span className="font-mono text-2xl font-extrabold text-stone-900 tabular-nums">{formatClock(state === "done" ? finalDuration : elapsed)}</span>
        </div>

        {(state === "recording" || state === "paused") && (
          <div>
            <div className="h-3 rounded-full bg-stone-100 border border-stone-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-100 ${state === "recording" ? "bg-gradient-to-r from-rose-500 to-orange-400" : "bg-stone-300"}`}
                style={{ width: `${Math.round(level * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 flex-wrap">
          {state === "idle" && (
            <button
              onClick={startRecording}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
            >
              <Mic className="w-4 h-4" /> {vr.recordBtn || "Record"}
            </button>
          )}
          {state === "recording" && (
            <>
              <button
                onClick={pauseRecording}
                className="px-4 py-3 rounded-2xl border-2 border-rose-400 bg-rose-50 text-rose-900 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Pause className="w-4 h-4" /> {vr.pauseBtn || "Pause"}
              </button>
              <button
                onClick={stopRecording}
                className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
              >
                <Square className="w-4 h-4" /> {vr.stopBtn || "Stop"}
              </button>
            </>
          )}
          {state === "paused" && (
            <>
              <button
                onClick={resumeRecording}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
              >
                <Play className="w-4 h-4" /> {vr.resumeBtn || "Resume"}
              </button>
              <button
                onClick={stopRecording}
                className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
              >
                <Square className="w-4 h-4" /> {vr.stopBtn || "Stop"}
              </button>
            </>
          )}
          {state === "done" && (
            <>
              <button
                onClick={download}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> {vr.downloadBtn || "Download recording"}
              </button>
              <button
                onClick={discard}
                className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> {vr.discardBtn || "Discard & re-record"}
              </button>
            </>
          )}
        </div>

        {state === "done" && blobUrl && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
            <p className="text-sm font-extrabold text-stone-900">{vr.playbackLabel || "Play back your take"}</p>
            <audio controls src={blobUrl} className="w-full" />
            <div className="flex gap-x-5 gap-y-1 flex-wrap text-xs text-stone-600 font-mono">
              <span>{vr.formatLabel || "Saved format"}: <strong className="text-stone-900">{friendlyFormat(mimeType)}</strong></span>
              <span>{vr.sizeLabel || "File size"}: <strong className="text-stone-900">{formatSize(blobSize)}</strong></span>
              <span>{vr.durationLabel || "Length"}: <strong className="text-stone-900">{formatClock(finalDuration)}</strong></span>
            </div>
          </div>
        )}

        <p className="text-xs text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {vr.localNote || "Your recording stays on this device — it is never uploaded, stored or shared by this tool."}
        </p>
        <p className="text-xs text-stone-500 leading-relaxed">
          {vr.formatNote || "Your browser chooses the recording format: Chrome and Firefox usually save WebM, Safari saves MP4. We show and save the real format — it is never converted to a fake MP3."}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{vr.consentTitle || "Record only with permission"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {vr.consentText || "Only record yourself, or other people who have agreed to be recorded. In many places recording a conversation without consent is against the law — when in doubt, ask first."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 flex gap-3">
        <Mic className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">{vr.tipTitle || "For a cleaner take"}</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
            {vr.tipText || "Record in a quiet room, keep the microphone 15–20 cm from your mouth, and do a 5-second test first. Closing other heavy tabs helps on older phones."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="voiceRecorder" selectedLanguage={selectedLanguage} />
    </div>
  );
}
