"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, VolumeX, Loader2, MicOff } from "lucide-react";

type State = "idle" | "loading" | "playing" | "paused" | "error";

interface PageVoiceReaderProps {
  /** The script to be spoken. Write in natural, spoken-word prose — not UI copy. */
  script: string;
  /** Optional page label for ARIA / tooltip. */
  label?: string;
  /** Show as floating sticky bar (default) or inline button */
  variant?: "floating" | "inline";
}

export default function PageVoiceReader({ script, label, variant = "floating" }: PageVoiceReaderProps) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobRef = useRef<string | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setState("idle");
    setProgress(0);
  }, []);

  const play = useCallback(async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }
    if (state === "paused" && audioRef.current) {
      await audioRef.current.play();
      setState("playing");
      return;
    }

    setState("loading");
    setProgress(0);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script }),
      });

      if (!res.ok) throw new Error(`TTS error ${res.status}`);

      const blob = await res.blob();
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      const url = URL.createObjectURL(blob);
      blobRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      };
      audio.onended = () => {
        setState("idle");
        setProgress(0);
      };
      audio.onerror = () => setState("error");

      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }, [state, script]);

  const pageLabel = label ?? "this page";

  if (variant === "inline") {
    return (
      <InlineButton state={state} play={play} stop={stop} label={pageLabel} progress={progress} />
    );
  }

  return (
    <FloatingBar state={state} play={play} stop={stop} label={pageLabel} progress={progress} />
  );
}

// ─── Floating sticky bar ────────────────────────────────────────────────────
function FloatingBar({
  state, play, stop, label, progress,
}: {
  state: State;
  play: () => void;
  stop: () => void;
  label: string;
  progress: number;
}) {
  return (
    <div
      role="region"
      aria-label={`Voice reader for ${label}`}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-navy-700 bg-navy-900/95 px-4 py-3 shadow-2xl backdrop-blur-sm"
      style={{ minWidth: 220 }}
    >
      {/* Progress track */}
      {state === "playing" || state === "paused" ? (
        <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-2xl overflow-hidden bg-navy-700">
          <div
            className="h-full bg-gold-400 transition-all duration-200"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}

      {/* Icon */}
      <button
        onClick={play}
        disabled={state === "loading"}
        aria-label={
          state === "playing" ? "Pause narration" :
          state === "paused"  ? "Resume narration" :
          state === "loading" ? "Loading narration…" :
          "Listen to this page"
        }
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-navy-950 hover:bg-gold-400 disabled:opacity-60 transition-colors shrink-0"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === "error" ? (
          <MicOff className="h-4 w-4" />
        ) : state === "playing" ? (
          <PauseIcon />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* Label */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-white leading-tight">
          {state === "loading" ? "Preparing narration…" :
           state === "playing" ? "Now reading aloud" :
           state === "paused"  ? "Paused — tap to resume" :
           state === "error"   ? "Narration unavailable" :
           "Listen to this page"}
        </span>
        <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
          {state === "error" ? "Check your connection" : "Deepgram · aura-2-luna"}
        </span>
      </div>

      {/* Stop button — only when active */}
      {(state === "playing" || state === "paused") && (
        <button
          onClick={stop}
          aria-label="Stop narration"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-navy-600 text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-colors shrink-0"
        >
          <VolumeX className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Inline button ───────────────────────────────────────────────────────────
function InlineButton({
  state, play, stop, label, progress,
}: {
  state: State;
  play: () => void;
  stop: () => void;
  label: string;
  progress: number;
}) {
  return (
    <div className="flex items-center gap-2" aria-label={`Voice reader for ${label}`}>
      <button
        onClick={play}
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400 hover:bg-gold-500/20 disabled:opacity-60 transition-colors"
      >
        {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
         state === "playing" ? <PauseIcon className="h-3.5 w-3.5" /> :
         <Volume2 className="h-3.5 w-3.5" />}
        {state === "loading" ? "Loading…" :
         state === "playing" ? "Pause" :
         state === "paused"  ? "Resume" :
         "Listen"}
      </button>
      {(state === "playing" || state === "paused") && (
        <>
          <div className="h-1 flex-1 rounded-full bg-navy-700 max-w-[80px] overflow-hidden">
            <div
              className="h-full bg-gold-400 transition-all duration-200 rounded-full"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <button
            onClick={stop}
            aria-label="Stop"
            className="rounded p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <VolumeX className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

function PauseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <rect x="3" y="2" width="3.5" height="12" rx="1" />
      <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
    </svg>
  );
}
