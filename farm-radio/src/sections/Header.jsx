import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRESENTING, SEGMENTS } from '../data';
import { clockAt, hhmm, pad, useAudio, useMinute, lastShowIndex } from '../engine';
import { Logo, goTo } from '../ui';

gsap.registerPlugin(ScrollTrigger);

export const STATIONS = [
  ['live', 'On air', '88.2'],
  ['desk', 'Desk', '91.6'],
  ['feed', 'Feed', '94.8'],
  ['voice', 'Your voice', '97.4'],
  ['vote', 'Vote', '99.9'],
  ['partners', 'Partners', '102.5'],
  ['team', 'Team', '105.3']
];

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

function Tuner() {
  const [active, setActive] = useState('live');
  const wrap = useRef(null);
  const needle = useRef(null);

  useEffect(() => {
    const triggers = STATIONS.map(([id]) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: self => self.isActive && setActive(id)
      })
    );
    return () => triggers.forEach(t => t.kill());
  }, []);

  useLayoutEffect(() => {
    const move = (instant = false) => {
      const a = wrap.current?.querySelector(`a[data-id="${active}"]`);
      if (!a) return;
      const x = a.offsetLeft + a.offsetWidth / 2;
      gsap.to(needle.current, { left: x, duration: instant ? 0 : 0.9, ease: 'elastic.out(1, 0.6)' });
    };
    move();
    const r = () => move(true);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, [active]);

  return (
    <nav className="tuner" aria-label="Sections" ref={wrap}>
      <div className="tuner-scale" aria-hidden="true" />
      <div className="tuner-stations">
        {STATIONS.map(([id, label, f]) => (
          <a
            key={id}
            href={`#${id}`}
            data-id={id}
            className={active === id ? 'on' : ''}
            aria-current={active === id ? 'true' : undefined}
            onClick={e => {
              e.preventDefault();
              goTo(id);
            }}
          >
            <small>{f}</small>
            {label}
          </a>
        ))}
      </div>
      <div className="tuner-needle" ref={needle} aria-hidden="true" />
    </nav>
  );
}

function Breaking() {
  const m = useMinute();
  const aired = SEGMENTS.filter(s => s.th && s.s <= m);
  if (!aired.length) return null;
  const open = aired.find(s => s.r === 'open') || aired[0];
  const latest = aired[aired.length - 1];
  const head = open.t.replace(/^BREAKING:\s*/i, '');
  return (
    <div className="breaking" role="region" aria-label="Breaking news">
      <span className="tag">Breaking</span>
      <strong>{head}</strong>
      <span className="meta">
        Developing story · updated {hhmm(latest.s)}
        {latest !== open && ` · ${latest.t.replace(/^.*?:\s*/, '')}`}
      </span>
      <a
        href="#feed"
        className="mono"
        onClick={e => {
          e.preventDefault();
          goTo('feed');
        }}
      >
        Follow the story →
      </a>
    </div>
  );
}

export default function Header() {
  const [menu, setMenu] = useState(false);
  const { toggle, playing, kind } = useAudio();
  const m = useMinute();
  const seg = SEGMENTS[lastShowIndex(m)];
  const liveOn = playing && kind === 'live';

  useEffect(() => {
    if (menu) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [menu]);

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
            goTo('partners');
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
            aria-label="FARM RADIO home"
            onClick={e => {
              e.preventDefault();
              goTo('live');
            }}
          >
            <Logo />
          </a>
          <Tuner />
          <span className="spacer head-now mono">
            <span className="dot dot--live" />
            <span>
              On air · <b>{seg.t}</b>
            </span>
          </span>
          <Clock />
          <div className="head-listen">
            <button className="btn btn--signal" onClick={() => toggle(seg.t, 'live')} aria-pressed={liveOn}>
              <span className={`dot${liveOn ? ' dot--live' : ''}`} style={liveOn ? { background: 'var(--ink)' } : null} />
              {liveOn ? 'Listening' : 'Listen live'}
            </button>
          </div>
          <button className="menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(v => !v)}>
            <span />
          </button>
        </div>
      </header>
      <nav className={`mnav${menu ? ' open' : ''}`} aria-label="Sections">
        {STATIONS.map(([id, label, f]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={e => {
              e.preventDefault();
              setMenu(false);
              setTimeout(() => goTo(id), 30);
            }}
          >
            {label}
            <small>{f} FM</small>
          </a>
        ))}
      </nav>
      <Breaking />
    </>
  );
}
