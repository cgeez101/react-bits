import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAudio } from './engine';
import { PRESENTERS } from './data';
import logoSvg from './assets/logo.svg?raw';

/* ---------- logo (recolours with currentColor) ---------- */
export const Logo = ({ className }) => (
  <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: logoSvg }} />
);

/* ---------- icons ---------- */
export const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3.5v17L20.5 12z" fill="currentColor" />
  </svg>
);
export const PauseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 3h5v18H5zM14 3h5v18h-5z" fill="currentColor" />
  </svg>
);

/* ---------- VU meter: real analyser when available, synthetic otherwise ---------- */
export function VU({ bars = 28, className = '' }) {
  const { playing, analyser } = useAudio();
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current ? [...ref.current.children] : [];
    if (!playing) {
      els.forEach(e => (e.style.transform = 'scaleY(0.08)'));
      return;
    }
    const data = new Uint8Array(32);
    const smooth = new Array(bars).fill(0.1);
    let raf;
    const loop = t => {
      const an = analyser.current;
      if (an) an.getByteFrequencyData(data);
      els.forEach((e, i) => {
        let v;
        if (an && data.some(Boolean)) {
          v = data[Math.floor((i / bars) * 24)] / 255;
        } else {
          v = 0.25 + 0.55 * Math.abs(Math.sin(t / 220 + i * 0.7) * Math.cos(t / 530 + i * 0.31));
        }
        smooth[i] += (v - smooth[i]) * 0.35;
        const s = Math.max(0.06, Math.min(1, smooth[i]));
        e.style.transform = `scaleY(${s})`;
        e.classList.toggle('hot', s > 0.82);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, bars, analyser]);
  return (
    <div className={`vu ${className}`} ref={ref} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

/* ---------- section header ---------- */
export function SectionHead({ idx, label, title, lede, aside, id }) {
  return (
    <header className="blk-head">
      <div className="idx">
        <b>{idx}</b>
        <span className="mono muted">{label}</span>
      </div>
      <div>
        <h2 className="display" id={id} data-split>
          {title}
        </h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {aside && <div className="aside">{aside}</div>}
    </header>
  );
}

/* ---------- presenter faces ---------- */
export const Faces = ({ ids = [] }) => (
  <div className="faces">
    {ids.map(id => (
      <img key={id} src={PRESENTERS[id].img} alt={PRESENTERS[id].name} title={PRESENTERS[id].name} loading="lazy" />
    ))}
  </div>
);

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, wide, children }) {
  useEffect(() => {
    if (!open) return;
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener('keydown', k);
      window.__lenis?.start();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="scrim on" onClick={onClose} />
      <div className={`modal-box${wide ? ' modal-box--wide' : ''}`} style={{ zIndex: 1 }}>
        <div className="modal-h">
          <span className="mono">{title}</span>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- toast ---------- */
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [on, setOn] = useState(false);
  const timer = useRef(0);
  const show = useCallback(m => {
    setMsg(m);
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast${on ? ' on' : ''}`} role="status" aria-live="polite">
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------- go to a page (each section is its own page, linked by #id) ---------- */
export const go = id => {
  if (location.hash.replace('#', '') === id) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = id;
};
