"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NowPlaying } from "@/lib/types";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async (autoplay = false) => {
    try {
      const response = await fetch("/api/v1/now-playing", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const nextState = (await response.json()) as NowPlaying;
      setState(nextState);
      setError(null);

      const audio = audioRef.current;
      if (!audio || !nextState.track) return;

      if (audio.src !== nextState.track.audioUrl) {
        audio.src = nextState.track.audioUrl;
        audio.load();
      }

      const applyPosition = () => {
        if (Math.abs(audio.currentTime - nextState.positionSeconds) > 2) {
          audio.currentTime = nextState.positionSeconds;
        }
      };

      if (audio.readyState >= 1) applyPosition();
      else audio.addEventListener("loadedmetadata", applyPosition, { once: true });

      if (autoplay) {
        await audio.play();
        setPlaying(true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sync radio");
    }
  }, []);

  useEffect(() => {
    void sync(false);
    const interval = window.setInterval(() => void sync(false), 30_000);
    return () => window.clearInterval(interval);
  }, [sync]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !state?.track) return;

    if (audio.paused) {
      await sync(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="player-card" aria-label="eulr radio preview">
      <audio
        ref={audioRef}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onEnded={() => void sync(true)}
      />
      <div className="eyebrow">LIVE · SYNCHRONIZED</div>
      <h2>{state?.station.name ?? "eulr focus radio"}</h2>

      {state?.track ? (
        <>
          <div className="track-row">
            <div className="cover-placeholder">e</div>
            <div>
              <strong>{state.track.title}</strong>
              <span>{state.track.artist}</span>
            </div>
          </div>
          <div className="progress-copy">
            <span>{formatTime(state.positionSeconds)}</span>
            <span>{formatTime(state.track.durationSeconds)}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (state.positionSeconds / state.track.durationSeconds) * 100)}%`,
              }}
            />
          </div>
          <button type="button" onClick={() => void togglePlayback()}>
            {playing ? "Pause" : "Listen live"}
          </button>
          <p className="small-copy">Next: {state.nextTrack?.title ?? state.track.title}</p>
        </>
      ) : (
        <div className="empty-state">
          <p>No tracks have been uploaded yet.</p>
          <code>pnpm upload:track -- --help</code>
        </div>
      )}

      {error ? <p className="error-copy">Sync error: {error}</p> : null}
    </section>
  );
}
