import { useEffect, useRef, useState } from 'react';
import SplitFlapText from '@bits/TextAnimations/SplitFlapText/SplitFlapText.jsx';
import { PRICES, SEGMENTS, SPORT, TRENDS, weatherAt } from '../data';
import { fmtPrice, hhmm, priceAt, useMinute, useWholeMinute } from '../engine';

function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return seen;
}

const SHORT = n => n.replace(' (SAFEX)', '').replace(' (A2)', '');
const SUBN = n => (n.includes('SAFEX') ? 'SAFEX' : n.includes('A2') ? 'A2 grade' : 'Farm gate');

export function Board({ title = 'Market board' }) {
  const wm = useWholeMinute();
  const ref = useRef(null);
  const seen = useSeen(ref);
  const tariffLive = wm >= 16;
  return (
    <div className="board" ref={ref}>
      <div className="cell-h">
        <h3>{title}</h3>
        <span className="tag tag--live">
          <span className="dot dot--live" style={{ background: 'var(--ink)' }} /> Live
        </span>
      </div>
      <div role="table" aria-label="Market prices">
        {PRICES.map((p, k) => {
          const v = priceAt(k, wm);
          const d = v - p[3];
          const up = d >= 0;
          const txt = `${p[1]}${fmtPrice(v, p[4])}`;
          return (
            <div className={`board-row${k === 0 && tariffLive ? ' hot' : ''}`} role="row" key={p[0]}>
              <span className="nm" role="cell">
                {SHORT(p[0])}
                <small>{SUBN(p[0])}</small>
              </span>
              <span role="cell">
                <SplitFlapText
                  text={seen ? txt : ''}
                  padTo={8}
                  align="right"
                  loop={false}
                  intro
                  charset="0123456789"
                  flipsPerChar={4}
                  flipDuration={0.07}
                  stagger={0.035}
                  tileColor="#23271f"
                  textColor="#f4ebd6"
                  tileRadius={2}
                  gap={2}
                  depth={0.35}
                  style={{ '--split-flap-font-size': 'var(--flap-size, 22px)' }}
                />
              </span>
              <span className="unit" role="cell">
                {p[2]}
              </span>
              <span className={`mv ${up ? 'up' : 'down'}`} role="cell">
                {up ? '▲ +' : '▼ −'}
                {fmtPrice(Math.abs(d), p[4])}
              </span>
            </div>
          );
        })}
      </div>
      <div className="board-foot mono">
        <span>Change since open · {hhmm(0).slice(0, 2)}:00 – now</span>
        <span>Updated every on-air minute</span>
      </div>
    </div>
  );
}

export function Weather({ title = 'Weather' }) {
  const w = weatherAt(useWholeMinute());
  return (
    <div className="cell">
      <div className="cell-h">
        <h3>{title}</h3>
        <span className="mono muted">Your area</span>
      </div>
      <div className="wx-big">
        <b className="num">{w.temp}°</b>
        <span>
          {w.summary}
          <br />
          Field access: <strong className="up">{w.fieldAccess}</strong>
        </span>
      </div>
      <div className="kv">
        <span>Chance of rain</span>
        <span className="v">{w.rain}%</span>
      </div>
      <div className="kv">
        <span>Wind</span>
        <span className="v">{w.wind} km/h</span>
      </div>
      <div className="kv">
        <span>Overnight low</span>
        <span className="v">{w.low}°C</span>
      </div>
      <div className="kv">
        <span>Spray window tomorrow</span>
        <span className="v">{w.spray}</span>
      </div>
      <div className="kv">
        <span>Tomorrow</span>
        <span className="v">{w.tomorrow}</span>
      </div>
      <div className="alert" role="note">
        <b>⚠ ALERT</b>
        <span>{w.alert}</span>
      </div>
    </div>
  );
}

function Expandable({ items, n = 4, more, render }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ul className="plain wire">{(open ? items : items.slice(0, n)).map(render)}</ul>
      {items.length > n && (
        <button className="more-btn" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? 'Show less' : more}
        </button>
      )}
    </>
  );
}

export function Wire({ all = false, title = 'Agri wire' }) {
  const m = useWholeMinute();
  const thread = SEGMENTS.filter(s => s.th && s.s <= m)
    .reverse()
    .map(s => [`FARM RADIO · ${hhmm(s.s)}`, s.t.replace(/^BREAKING:\s*/i, ''), true]);
  const items = [...thread, ...TRENDS.filter(t => !t[2]).map(t => ['SA agri · today', t[1], false])];
  return (
    <div className="cell">
      <div className="cell-h">
        <h3>{title}</h3>
        <span className="mono muted">{thread.length ? 'Developing' : 'Today'}</span>
      </div>
      <Expandable
        items={items}
        n={all ? 99 : 4}
        more="More stories"
        render={(x, i) => (
          <li key={i}>
            <span className={`k mono${x[2] ? ' hot' : ''}`}>{x[0]}</span>
            <p>{x[1]}</p>
          </li>
        )}
      />
    </div>
  );
}

export function Sport({ all = false, title = 'Sport' }) {
  return (
    <div className="cell">
      <div className="cell-h">
        <h3>{title}</h3>
        <span className="mono muted">Boks · Proteas · Bafana</span>
      </div>
      <Expandable
        items={SPORT}
        n={all ? 99 : 4}
        more="More sport"
        render={(x, i) => (
          <li key={i}>
            <span className="k mono">
              {x[0]} · {x[1]}
            </span>
            <p>{x[2]}</p>
          </li>
        )}
      />
    </div>
  );
}

export function Pulse({ title = 'Topic pulse' }) {
  const m = useMinute();
  const scored = TRENDS.map((t, k) => {
    const v = t[2] ? (m < 16 ? 6 : 40 + 60 * Math.min(1, (m - 16) / 4)) : 70 - k * 9 + 6 * Math.sin(m / 4 + k);
    return [t[0], Math.max(4, v), !!t[2]];
  }).sort((a, b) => b[1] - a[1]);
  return (
    <div className="cell">
      <div className="cell-h">
        <h3>{title}</h3>
        <span className="mono muted">Mentions / hr</span>
      </div>
      {scored.map(([tag, v, hot]) => {
        const c = Math.round(v * 31);
        return (
          <div className={`pulse-row${hot ? ' hot' : ''}`} key={tag}>
            <b>{tag}</b>
            <span className="bar">
              <i style={{ width: `${Math.min(100, v)}%` }} />
            </span>
            <span className="c">{c >= 1000 ? `${(c / 1000).toFixed(1)}k` : c}</span>
          </div>
        );
      })}
      <p className="mono muted" style={{ marginTop: 14 }}>
        What farmers are talking about online right now
      </p>
    </div>
  );
}
