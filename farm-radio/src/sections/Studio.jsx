import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Topography from '@bits/Backgrounds/Topography/Topography.jsx';
import { CHANNELS, PRESENTERS, SEGMENTS, PRICES, TRENDS, isAd } from '../data';
import { curIndex, hhmm, lastShowIndex, nextShows, pad, priceAt, fmtPrice, useAudio, useMinute, useWholeMinute } from '../engine';
import { PauseIcon, PlayIcon, VU } from '../ui';
import Logo3D from './Logo3D';

gsap.registerPlugin(ScrambleTextPlugin);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* headline "tunes in" (scrambles) whenever the show changes */
function TunedTitle({ text }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    const el = ref.current;
    if (first.current || reduced()) {
      el.textContent = text;
      first.current = false;
      return;
    }
    const tw = gsap.to(el, {
      duration: 1.1,
      scrambleText: { text, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', revealDelay: 0.25, speed: 0.6 },
      ease: 'none'
    });
    return () => tw.kill();
  }, [text]);
  /* size the headline so its longest word always fits the column */
  const longest = Math.max(...text.split(/\s+/).map(w => w.length), 6);
  const fit = (100 / (longest * 0.9)).toFixed(2);
  const cap = text.length > 44 ? 9 : 11.5;
  return (
    <h1
      className="display"
      ref={ref}
      aria-live="polite"
      style={{ fontSize: `clamp(26px, min(${cap}cqi, ${fit}cqi), 92px)` }}
    />
  );
}

const mmss = min => {
  const t = Math.max(0, Math.round(min * 60));
  return `${Math.floor(t / 60)}:${pad(t % 60)}`;
};

function HourStrip() {
  const m = useMinute();
  const ci = curIndex(m);
  const box = useRef(null);
  /* keep the playhead in view: the current show sits a third of the way in */
  useEffect(() => {
    const el = box.current;
    const now = el?.querySelector('.hour-seg.now');
    if (!now) return;
    el.scrollTo({ left: Math.max(0, now.offsetLeft - el.clientWidth / 3), behavior: reduced() ? 'auto' : 'smooth' });
  }, [ci]);
  return (
    <div className="hour" aria-label="This hour on FARM RADIO" ref={box}>
      <div className="hour-track">
        {SEGMENTS.map((s, k) => {
          const ad = isAd(s);
          const cls = ['hour-seg', ad && 'ad', k < ci && 'past', k === ci && 'now'].filter(Boolean).join(' ');
          return (
            <div key={s.id} className={cls} style={{ flex: `${s.d} 0 0` }} title={ad ? 'Break' : s.t}>
              <span className="t">{hhmm(s.s)}</span>
              <span className="n">{ad ? '' : s.t}</span>
            </div>
          );
        })}
        <span className="hour-head" style={{ left: `${(m / 60) * 100}%` }} />
      </div>
    </div>
  );
}

export function Ticker() {
  const wm = useWholeMinute();
  const items = sfx => [
    ...PRICES.map((p, k) => {
      const v = priceAt(k, wm);
      const d = v - p[3];
      return (
        <span className="item" key={p[0] + sfx}>
          <b>{p[0]}</b> {p[1]}
          {fmtPrice(v, p[4])}
          {p[2]}{' '}
          <span className={d >= 0 ? 'up' : 'down'}>
            {d >= 0 ? '▲' : '▼'} {fmtPrice(Math.abs(d), p[4])}
          </span>
        </span>
      );
    }),
    ...TRENDS.map(t => (
      <span className="item" key={t[0] + sfx}>
        <b>{t[0]}</b> {t[1]}
      </span>
    ))
  ];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {items('a')}
        {items('b')}
      </div>
    </div>
  );
}

export default function Studio() {
  const m = useMinute();
  const { playing, kind, toggle } = useAudio();
  const ci = curIndex(m);
  const inBreak = isAd(SEGMENTS[ci]);
  const seg = SEGMENTS[lastShowIndex(m)];
  const host = PRESENTERS[seg.p[0]] || PRESENTERS.AL;
  const coHost = seg.p[1] && PRESENTERS[seg.p[1]];
  const into = Math.max(0, m - seg.s);
  const pct = Math.min(1, into / seg.d);
  const next = nextShows(m, 3);
  const liveOn = playing && kind === 'live';
  const listeners = 3400 + Math.round(600 * Math.sin(m / 7) + m * 14);

  return (
    <section className="studio blk" id="live" aria-labelledby="onair-title">
      <div className="studio-bg" aria-hidden="true">
        <Topography
          color="#f4ebd6"
          lineCount={20}
          lineWidth={1}
          glow={0}
          speed={reduced() ? 0 : 0.1}
          tilt={38}
          fog={0.55}
          elevation={1.1}
          foreground={0.15}
          depthOfField={0.2}
          opacity={0.75}
          clickEffect="none"
          hoverEffect="lift"
          mouseStrength={0.5}
        />
      </div>
      <div className="studio-grid">
        <div className="studio-main">
          <div className="onair-row">
            {inBreak ? (
              <span className="tally tally--break">
                <span className="dot" /> BACK IN A MOMENT
              </span>
            ) : (
              <span className="tally">
                <span className="dot" /> ON AIR
              </span>
            )}
            <span className="mono chan">
              {hhmm(seg.s)} · {CHANNELS[seg.ch].name}
            </span>
            {seg.video && <span className="tag tag--live">Live video</span>}
          </div>
          <span className="sr" id="onair-title">
            On air now: {seg.t}
          </span>
          <div className="stage">
            <div className="stage-text">
              <TunedTitle text={seg.t} />
              <p className="sub">{seg.u}</p>
            </div>
            <Logo3D />
          </div>
          <div className="deck">
            <button className="play" onClick={() => toggle(seg.t, 'live')} aria-label={liveOn ? 'Pause live radio' : 'Listen live'}>
              {liveOn ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="meter-wrap">
              <VU bars={48} />
              <div className="progress" aria-hidden="true">
                <i style={{ width: `${pct * 100}%` }} />
              </div>
              <div className="times mono">
                <span>
                  {mmss(into)} / {mmss(seg.d)}
                </span>
                <span>{liveOn ? 'You’re listening live' : 'Live now · replay later'}</span>
              </div>
            </div>
            <div className="listeners">
              <span className="mono">Tuned in</span>
              <b>{listeners.toLocaleString('en-ZA').replace(/ |,/g, ' ')}</b>
            </div>
          </div>
        </div>
        <aside className="studio-side" aria-label="Presenter and up next">
          <div className="host">
            <img src={host.img} alt={host.name} />
            <div>
              <span className="mono" style={{ color: 'var(--signal)' }}>
                On the mic
              </span>
              <span className="name">
                {host.name}
                {coHost ? ` & ${coHost.name}` : ''}
              </span>
              <span className="mono" style={{ color: 'var(--cream-2)' }}>
                {host.role}
              </span>
            </div>
          </div>
          <div className="upnext">
            <span className="lbl mono">Up next</span>
            {next.map(s => (
              <div className="row" key={s.id}>
                <span className="t">{hhmm(s.s)}</span>
                <div>
                  <b>{s.t}</b>
                  <span>{s.p.map(p => PRESENTERS[p]?.name).join(' & ')}</span>
                </div>
              </div>
            ))}
            {!next.length && (
              <div className="row">
                <span className="t">17:00</span>
                <div>
                  <b>Drive Time continues</b>
                  <span>The next hour starts shortly</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
      <HourStrip />
    </section>
  );
}
