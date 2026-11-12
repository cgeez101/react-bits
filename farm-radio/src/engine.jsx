/* The simulated live hour + the shared audio player. */
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { STATION, SEGMENTS, PRICES, MOVES, isAd, AUDIO_SRC } from './data';

/* ---------- time helpers ---------- */
export const pad = n => String(n).padStart(2, '0');
export function clockAt(m) {
  const t = Math.min(3599, Math.max(0, Math.floor(m * 60)));
  return { h: STATION.hourStart + Math.floor(t / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}
export const hhmm = m => {
  const c = clockAt(m);
  return `${pad(c.h)}:${pad(c.m)}`;
};
export const curIndex = m => {
  let i = 0;
  SEGMENTS.forEach((s, k) => {
    if (s.s <= m + 1e-9) i = k;
  });
  return i;
};
export const lastShowIndex = m => {
  for (let k = curIndex(m); k >= 0; k--) if (!isAd(SEGMENTS[k])) return k;
  return 0;
};
export const nextShows = (m, n = 3) => SEGMENTS.filter(s => !isAd(s) && s.s > m + 1e-9).slice(0, n);

/* ---------- market prices: seeded random walk + story-driven moves ---------- */
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const WALK = PRICES.map(() => {
  const a = [0];
  for (let i = 1; i <= 61; i++) a.push(a[i - 1] + (rnd() - 0.5) * 2);
  return a;
});
export function priceAt(k, minute) {
  const p = PRICES[k];
  const i = Math.min(60, Math.max(0, Math.floor(minute)));
  let v = p[3] + WALK[k][i] * p[3] * 0.0012;
  MOVES.forEach(([idx, amt, at]) => {
    if (idx === k) v += amt / (1 + Math.exp(-(minute - at - 1) * 1.2));
  });
  return v;
}
export const fmtPrice = (v, dp) =>
  v.toLocaleString('en-ZA', { minimumFractionDigits: dp, maximumFractionDigits: dp }).replace(/ /g, ' ').replace(',', '.');

/* ---------- live hour context ---------- */
const HourCtx = createContext(null);
export function HourProvider({ children }) {
  const [minute, setMinute] = useState(STATION.startMinute);
  useEffect(() => {
    const step = 0.25;
    const id = setInterval(() => {
      setMinute(m => {
        const n = m + (step * STATION.speed) / 60;
        return n >= 60 ? 0 : n;
      });
    }, step * 1000);
    return () => clearInterval(id);
  }, []);
  return <HourCtx.Provider value={minute}>{children}</HourCtx.Provider>;
}
export const useMinute = () => useContext(HourCtx);
/* coarse minute: only re-renders consumers once per on-air minute */
export const useWholeMinute = () => Math.floor(useContext(HourCtx));

/* ---------- audio player ---------- */
const AudioCtx = createContext(null);
export function AudioProvider({ children }) {
  const el = useRef(null);
  const analyser = useRef(null);
  const [state, setState] = useState({ playing: false, label: '', kind: 'live', started: false });

  if (!el.current && typeof Audio !== 'undefined') {
    el.current = new Audio(AUDIO_SRC);
    el.current.loop = true;
    el.current.preload = 'auto';
  }

  const ensureAnalyser = () => {
    if (analyser.current || !window.AudioContext) return;
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaElementSource(el.current);
      const an = ctx.createAnalyser();
      an.fftSize = 64;
      an.smoothingTimeConstant = 0.8;
      src.connect(an);
      an.connect(ctx.destination);
      analyser.current = an;
    } catch {
      /* no analyser: VU meter falls back to a synthetic signal */
    }
  };

  const play = useCallback((label, kind = 'live') => {
    ensureAnalyser();
    el.current.play().catch(() => {});
    setState({ playing: true, label, kind, started: true });
  }, []);
  const pause = useCallback(() => {
    el.current.pause();
    setState(s => ({ ...s, playing: false }));
  }, []);
  const toggle = useCallback(
    (label, kind = 'live') => {
      setState(s => {
        if (s.playing && (s.label === label || !label)) {
          el.current.pause();
          return { ...s, playing: false };
        }
        ensureAnalyser();
        el.current.play().catch(() => {});
        return { playing: true, label: label || s.label, kind, started: true };
      });
    },
    []
  );

  const value = useMemo(() => ({ ...state, play, pause, toggle, analyser, el }), [state, play, pause, toggle]);
  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
export const useAudio = () => useContext(AudioCtx);
