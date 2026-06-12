"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, VolumeX, Loader2, MicOff, Pause, Play, Minus } from "lucide-react";

export type VoiceNarratorVariant = "floating" | "inline" | "panel";
type State = "idle" | "loading" | "playing" | "paused" | "error";

interface VoiceNarratorProps {
  page: string;
  title?: string;
  pageContext?: string;
  variant?: VoiceNarratorVariant;
  className?: string;
}

export default function VoiceNarrator({
  page,
  title,
  pageContext = "",
  variant = "floating",
  className = "",
}: VoiceNarratorProps) {
  const [state, setState]     = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef  = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setState("idle");
    setProgress(0);
    setErrorMsg(null);
  }, []);

  const togglePlay = useCallback(async () => {
    setErrorMsg(null);

    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }

    if (state === "paused" && audioRef.current) {
      try {
        await audioRef.current.play();
        setState("playing");
      } catch {
        setState("error");
        setErrorMsg("Playback blocked. Tap again.");
      }
      return;
    }

    // Fresh load — generate via Grok + Deepgram
    setState("loading");
    setProgress(0);

    try {
      const res = await fetch("/api/voice/page-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          pageTitle:   title ?? document.title ?? page,
          pageContext,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      const url = URL.createObjectURL(blob);
      blobRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      };
      audio.onended = () => { setState("idle"); setProgress(0); };
      audio.onerror = () => { setState("error"); setErrorMsg("Audio playback error."); };

      await audio.play();
      setState("playing");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Voice unavailable.");
    }
  }, [state, page, title, pageContext]);

  const [minimized, setMinimized] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const val = localStorage.getItem("voice-narrator-minimized");
      if (val === "0") setMinimized(false);
    }
  }, []);

  const handleMinimize = (val: boolean) => {
    setMinimized(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("voice-narrator-minimized", val ? "1" : "0");
    }
  };

  const props = { state, progress, title, errorMsg, onToggle: togglePlay, onStop: stop, className };

  if (variant === "floating") {
    if (minimized) {
      return (
        <button
          onClick={() => handleMinimize(false)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-amber-600 text-white shadow-2xl hover:bg-amber-700 transition-all hover:scale-105"
          aria-label="Expand Voice Guide"
        >
          <Volume2 className="h-6 w-6 animate-pulse" />
        </button>
      );
    }
    return <FloatingBar {...props} onMinimize={() => handleMinimize(true)} />;
  }
  if (variant === "panel")    return <PanelBar    {...props} />;
  return <InlineButton {...props} />;
}

// ── Floating bar ──────────────────────────────────────────────────────────────
function FloatingBar({ state, progress, title, errorMsg, onToggle, onStop, onMinimize, className }: {
  state: State; progress: number; title?: string; errorMsg: string | null;
  onToggle: () => void; onStop: () => void; onMinimize: () => void; className: string;
}) {
  const isActive = state === "playing" || state === "paused";

  return (
    <div
      role="region"
      aria-label="Legacy Voice Guide"
      className={`fixed bottom-6 right-6 z-50 rounded-2xl border border-amber-200 bg-white shadow-2xl shadow-estate-900/10 backdrop-blur-sm transition-all ${className}`}
      style={{ minWidth: 256 }}
    >
      {/* Progress strip */}
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-b-2xl bg-amber-100">
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Play/pause */}
        <button
          onClick={onToggle}
          disabled={state === "loading"}
          aria-label={
            state === "playing" ? "Pause narration" :
            state === "paused"  ? "Resume narration" :
            state === "loading" ? "Loading narration" :
            "Listen to this page"
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> :
           state === "error"   ? <MicOff  className="h-4 w-4" /> :
           state === "playing" ? <Pause   className="h-4 w-4" /> :
           state === "paused"  ? <Play    className="h-4 w-4" /> :
                                  <Volume2 className="h-4 w-4" />}
        </button>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold leading-tight text-estate-900">
            {state === "loading" ? "Generating narration with Grok..." :
             state === "playing" ? (title ? `Listening: ${title}` : "Now reading aloud") :
             state === "paused"  ? "Paused — tap to resume" :
             state === "error"   ? (errorMsg ?? "Voice unavailable") :
             "Listen to this page"}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-estate-400">
            Legacy Voice Guide powered by Grok + Deepgram
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {isActive && (
            <button
              onClick={onStop}
              aria-label="Stop narration"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-estate-200 text-estate-400 transition-colors hover:border-red-300 hover:text-red-500"
            >
              <VolumeX className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onMinimize}
            aria-label="Minimize narration"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-estate-200 text-estate-400 transition-colors hover:border-amber-300 hover:text-amber-600"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Panel (embedded in page) ──────────────────────────────────────────────────
function PanelBar({ state, progress, title, errorMsg, onToggle, onStop, className }: {
  state: State; progress: number; title?: string; errorMsg: string | null;
  onToggle: () => void; onStop: () => void; className: string;
}) {
  const isActive = state === "playing" || state === "paused";

  return (
    <div
      role="region"
      aria-label="Legacy Voice Guide"
      className={`rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          disabled={state === "loading"}
          aria-label={state === "playing" ? "Pause" : "Listen to this page"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/20 transition-all hover:bg-amber-700 hover:scale-105 disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> :
           state === "error"   ? <MicOff  className="h-5 w-5" /> :
           state === "playing" ? <Pause   className="h-5 w-5" /> :
           state === "paused"  ? <Play    className="h-5 w-5" /> :
                                  <Volume2 className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-estate-900 leading-tight">
            {state === "idle"    ? "Listen to this page" :
             state === "loading" ? "Generating with Grok AI..." :
             state === "playing" ? (title ?? "Now reading aloud") :
             state === "paused"  ? "Paused" :
             errorMsg ?? "Voice unavailable"}
          </p>
          <p className="mt-0.5 text-xs text-estate-500">
            Hear a warm, personal explanation. Powered by Grok and Deepgram Aura.
          </p>

          {isActive && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300 ease-linear"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
        </div>

        {isActive && (
          <button
            onClick={onStop}
            aria-label="Stop narration"
            className="shrink-0 rounded-lg p-2 text-estate-400 transition-colors hover:text-red-500"
          >
            <VolumeX className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-amber-200/60 pt-3">
        <span className="rounded-full border border-amber-400/40 bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-700">
          LEGACY VOICE GUIDE
        </span>
        <span className="text-[10px] text-estate-400">Grok AI + Deepgram Aura</span>
      </div>
    </div>
  );
}

// ── Inline button ─────────────────────────────────────────────────────────────
function InlineButton({ state, progress, errorMsg, onToggle, onStop, className }: {
  state: State; progress: number; errorMsg: string | null;
  onToggle: () => void; onStop: () => void; className: string;
}) {
  const isActive = state === "playing" || state === "paused";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onToggle}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
         state === "playing" ? <Pause   className="h-3.5 w-3.5" /> :
         state === "paused"  ? <Play    className="h-3.5 w-3.5" /> :
         state === "error"   ? <MicOff  className="h-3.5 w-3.5" /> :
                                <Volume2 className="h-3.5 w-3.5" />}
        {state === "loading" ? "Generating..." :
         state === "playing" ? "Pause" :
         state === "paused"  ? "Resume" :
         state === "error"   ? (errorMsg ?? "Error") :
         "Listen"}
      </button>

      {isActive && (
        <>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <button onClick={onStop} aria-label="Stop" className="rounded p-1 text-estate-400 transition-colors hover:text-red-500">
            <VolumeX className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
