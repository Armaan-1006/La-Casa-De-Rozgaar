"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface LandingAudioOptions {
  /** Custom URL or path for the walkie-talkie turning on sound (defaults to "/audio/walkie-talkie.wav") */
  walkieTalkieSrc?: string;
  /** Custom URL or path for the Bella Ciao instrumental soundtrack (defaults to "/audio/bella-ciao-instrumental.wav") */
  bellaCiaoSrc?: string;
  /** Base public URL where audio assets are hosted (e.g. "/audio" or "https://cdn.example.com/audio") */
  audioBasePath?: string;
}

// Ultra-subtle background volume capped at 1.5% (30% of previous 5%)
const AMBIENT_BG_VOLUME = 0.5;

/**
 * Audio manager for La Casa De Rozgaar landing experience.
 * On user confirmation ('I'm in'):
 * 1. Plays tactical walkie-talkie power-on squelch / radio handshake chirp.
 * 2. Instantly after, gradually fades in the instrumental 'Bella Ciao' theme at a whisper-soft background volume.
 */
export function useLandingAudio(options: LandingAudioOptions = {}) {
  const {
    walkieTalkieSrc = "/audio/walkie-talkie.wav",
    bellaCiaoSrc = "/audio/bella-ciao-instrumental.wav",
    audioBasePath,
  } = options;

  const sfxPath = audioBasePath
    ? `${audioBasePath.replace(/\/$/, "")}/walkie-talkie.wav`
    : walkieTalkieSrc;

  const musicPath = audioBasePath
    ? `${audioBasePath.replace(/\/$/, "")}/bella-ciao-instrumental.wav`
    : bellaCiaoSrc;

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    // Preload walkie talkie SFX for zero-latency instant response (50% reduced volume)
    try {
      const sfx = new Audio(sfxPath);
      sfx.preload = "auto";
      sfx.volume = 0.32;
      sfxRef.current = sfx;
    } catch {
      // Audio not supported in this environment
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      if (sfxRef.current) {
        sfxRef.current.pause();
        sfxRef.current = null;
      }
    };
  }, [sfxPath]);

  const fade = useCallback((to: number, ms: number, onDone?: () => void) => {
    const el = musicRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    const from = el.volume;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / ms, 1);
      // Smooth cosine ease for cinematic fade-in
      const ease = 0.5 * (1 - Math.cos(p * Math.PI));
      el.volume = Math.max(0, Math.min(1, from + (to - from) * ease));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(() => {
    // 1. Play Walkie-Talkie turning on sound immediately
    if (sfxRef.current) {
      sfxRef.current.currentTime = 0;
      sfxRef.current.play().catch(() => {
        // Fallback or autoplay policy catch
      });
    }

    // 2. Start Bella Ciao instrumental and gradually fade it in as ambient background music
    if (!musicRef.current) {
      const music = new Audio(musicPath);
      music.loop = true;
      music.volume = 0;
      music.addEventListener("error", () => {
        setAvailable(false);
        setPlaying(false);
      });
      musicRef.current = music;
    }

    const music = musicRef.current;
    if (!music) return;

    // Trigger music fade-in as the walkie-talkie squelch connects (~280ms)
    setTimeout(() => {
      music
        .play()
        .then(() => {
          setPlaying(true);
          setAvailable(true);
          fade(AMBIENT_BG_VOLUME, 4200); // Light, gradual fade-in to subtle background volume
        })
        .catch(() => {
          setAvailable(false);
          setPlaying(false);
        });
    }, 280);
  }, [fade, musicPath]);

  const toggle = useCallback(() => {
    const el = musicRef.current;
    if (!el) return;
    if (playing) {
      fade(0, 600, () => {
        el.pause();
        setPlaying(false);
      });
    } else {
      el.play()
        .then(() => {
          setPlaying(true);
          fade(AMBIENT_BG_VOLUME, 900);
        })
        .catch(() => setAvailable(false));
    }
  }, [fade, playing]);

  const fadeOut = useCallback(() => fade(0, 800), [fade]);

  return { start, toggle, fadeOut, playing, available, hasAudio: () => !!musicRef.current };
}
