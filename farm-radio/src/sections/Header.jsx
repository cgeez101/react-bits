import { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PRESENTING, SEGMENTS } from '../data';
import { clockAt, hhmm, pad, useAudio, useMinute, lastShowIndex } from '../engine';
import { go } from '../ui';
import { GROUPS, PAGES, pageById } from '../pages';
import Logo3D from './Logo3D';

function Clock() {
  const m = useMinute();
  const c = clockAt(m);
  return (
    <div className="head-clock">
      <span className="dot dot--live" aria-hidden="true" />
      <span className="t num" aria-label={`Studio time ${pad(c.h)}:${pad(c.m)}`}>
        {pad(c.h)}:{pad(c.m)}
        <small>:{pad(c.s)}</small>
      </span>
      <span className="mono muted">SAST</span>
    </div>
  );
}

/* the station menu: every page, grouped, behind the button at the top right */
function Menu({ open, page, onClose }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    panel.current?.querySelector('a.on, a')?.focus({ preventScroll: true });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      gsap.fromTo(panel.current.querySelectorAll('.menu-item'), { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.025, ease: 'power3.out' });
    return () => {
      window.removeEventListener('keydown', k);
      window.__lenis?.start();
    };
  }, [open, onClose]);
  return (
    <>
      <div className={`scrim${open ? ' on' : ''}`} onClick={onClose} />
      <nav className={`menu${open ? ' open' : ''}`} ref={panel} aria-label="Pages" aria-hidden={!open} id="site-menu">
        <div className="menu-h">
          <span className="mono">Tune in · {PAGES.length} stations</span>
          <button onClick={onClose} aria-label="Close menu" tabIndex={open ? 0 : -1}>
            ×
          </button>
        </div>
        <div className="menu-body" data-lenis-prevent>
          {GROUPS.map(g => (
            <div className="menu-group" key={g}>
              <span className="menu-g mono">{g}</span>
              {PAGES.filter(p => p.group === g).map(p => (
                <a
                  key={p.id}
                  href={`#${p.id}`}
                  className={`menu-item${page === p.id ? ' on' : ''}`}
                  aria-current={page === p.id ? 'page' : undefined}
                  tabIndex={open ? 0 : -1}
                  onClick={e => {
                    e.preventDefault();
                    onClose();
                    go(p.id);
                  }}
                >
                  <span className="f mono">{p.freq}</span>
                  <span className="l">{p.label}</span>
                  <span className="b muted">{p.blurb}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

export function Breaking() {
  const m = useMinute();
  const aired = SEGMENTS.filter(s => s.th && s.s <= m);
  if (!aired.length) return null;
  const open = aired.find(s => s.r === 'open') || aired[0];
  const latest = aired[aired.length - 1];
  return (
    <div className="breaking" role="region" aria-label="Breaking news">
      <span className="tag">Breaking</span>
      <strong>{open.t.replace(/^BREAKING:\s*/i, '')}</strong>
      <span className="meta">
        Developing story · updated {hhmm(latest.s)}
        {latest !== open && ` · ${latest.t.replace(/^.*?:\s*/, '')}`}
      </span>
      <a
        href="#wire"
        className="mono"
        onClick={e => {
          e.preventDefault();
          go('wire');
        }}
      >
        Follow the story →
      </a>
    </div>
  );
}

export default function Header({ page, menuOpen, setMenuOpen }) {
  const { toggle, playing, kind } = useAudio();
  const m = useMinute();
  const seg = SEGMENTS[lastShowIndex(m)];
  const liveOn = playing && kind === 'live';
  const here = pageById(page);
  const close = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  return (
    <>
      <div className="sponsor-strip">
        <span className="mono muted">Presented by</span>
        <span className="who">{PRESENTING.brand}</span>
        <span className="line">
          {PRESENTING.line} · {PRESENTING.sub}
        </span>
        <a
          href="#partners"
          className="mono"
          onClick={e => {
            e.preventDefault();
            go('partners');
          }}
        >
          Find out more →
        </a>
      </div>
      <header className="head">
        <div className="head-row">
          <a
            className="logo"
            href="#live"
            aria-label="FARM RADIO: go to On air"
            onClick={e => {
              e.preventDefault();
              go('live');
            }}
          >
            <Logo3D variant="mini" />
          </a>
          <div className="head-where">
            <span className="mono crumb">
              <b>{here.freq} FM</b> · {here.group === 'Studio' ? 'On air' : `${here.group} · ${here.label}`}
            </span>
            {page !== 'live' && (
              <button className="mono now" onClick={() => go('live')}>
                <span className="dot dot--live" /> On air: <b>{seg.t}</b>
              </button>
            )}
          </div>
          <Clock />
          <div className="head-listen">
            <button className="btn btn--signal" onClick={() => toggle(seg.t, 'live')} aria-pressed={liveOn}>
              <span className={`dot${liveOn ? ' dot--live' : ''}`} style={liveOn ? { background: 'var(--ink)' } : null} />
              {liveOn ? 'Listening' : 'Listen live'}
            </button>
          </div>
          <button
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span className="mono">Menu</span>
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>
      <Menu open={menuOpen} page={page} onClose={close} />
      <Breaking />
    </>
  );
}
