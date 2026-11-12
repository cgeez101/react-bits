import { useEffect, useRef, useState } from 'react';
import { CHAT, SEGMENTS, STATION } from '../data';
import { lastShowIndex, useAudio, useMinute } from '../engine';
import { Logo, PauseIcon, PlayIcon, VU, goTo } from '../ui';
import { STATIONS } from './Header';

/* ---------------- sticky player ---------------- */
export function PlayerBar() {
  const { playing, started, kind, label, toggle, pause } = useAudio();
  const m = useMinute();
  const [dismissed, setDismissed] = useState(false);
  const liveTitle = SEGMENTS[lastShowIndex(m)].t;
  const show = started && !dismissed;
  useEffect(() => {
    if (playing) setDismissed(false);
  }, [playing]);
  useEffect(() => {
    document.body.classList.toggle('has-player', show);
  }, [show]);
  const title = kind === 'live' ? liveTitle : label;
  return (
    <div className={`playerbar${show ? ' show' : ''}`} role="region" aria-label="Player" aria-hidden={!show}>
      <button className="pb-play" onClick={() => toggle(title, kind)} aria-label={playing ? 'Pause' : 'Play'} tabIndex={show ? 0 : -1}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="pb-info">
        <span className="mono">{kind === 'live' ? '● Live on FARM RADIO' : 'Replay'}</span>
        <b>{title}</b>
      </div>
      <VU bars={22} />
      <button
        className="pb-x mono"
        tabIndex={show ? 0 : -1}
        onClick={() => {
          pause();
          setDismissed(true);
        }}
      >
        Close ×
      </button>
    </div>
  );
}

/* ---------------- live room (demo chat) ---------------- */
const TOPIC = { agri: 'Agri', news: 'News', sport: 'Sport', lifestyle: 'Farm life' };
export function Room() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState(() => CHAT.slice(0, 6).map((c, i) => ({ id: i, who: c[0], topic: c[1], text: c[2] })));
  const [text, setText] = useState('');
  const [count, setCount] = useState(STATION.roomCount);
  const next = useRef(6);
  const list = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      const c = CHAT[next.current % CHAT.length];
      next.current += 1;
      setMsgs(ms => [...ms.slice(-40), { id: Date.now(), who: c[0], topic: c[1], text: c[2] }]);
      setCount(n => n + Math.round(Math.random() * 4 - 1));
    }, 4500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (open && list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [msgs, open]);
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const k = e => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  return (
    <>
      <button className="room-btn" onClick={() => setOpen(true)} aria-expanded={open}>
        <span className="dot dot--live" />
        <span className="lbl">Live room</span> · {count}
      </button>
      <div className={`scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`room${open ? ' open' : ''}`} aria-label="Live chat" aria-hidden={!open}>
        <div className="room-h">
          <div>
            <h3 className="display">Live room</h3>
            <span className="mono muted">{count} listeners in the room</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat" tabIndex={open ? 0 : -1}>
            ×
          </button>
        </div>
        <div className="room-list" ref={list} data-lenis-prevent>
          {msgs.map(mm => (
            <div className={`msg${mm.me ? ' me' : ''}`} key={mm.id}>
              <div className="who">
                <b>{mm.who}</b>
                <span className="tag">{mm.me ? 'You' : TOPIC[mm.topic]}</span>
              </div>
              <p>{mm.text}</p>
            </div>
          ))}
        </div>
        <form
          className="room-form"
          onSubmit={e => {
            e.preventDefault();
            if (!text.trim()) return;
            setMsgs(ms => [...ms, { id: Date.now(), who: 'You', me: true, text: text.trim() }]);
            setText('');
          }}
        >
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Say something to the room…" aria-label="Message" tabIndex={open ? 0 : -1} />
          <button className="btn btn--ink" type="submit" tabIndex={open ? 0 : -1}>
            Send
          </button>
        </form>
      </aside>
    </>
  );
}

/* ---------------- footer ---------------- */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-top">
        <div>
          <Logo className="foot-logo" />
          <p className="where">
            Live on our app <em>/</em> online <em>/</em> dash <em>/</em> socials
          </p>
        </div>
        <div className="foot-links">
          <a className="btn btn--ghost-dark" href="#" onClick={e => e.preventDefault()}>
            Download on the App Store <span className="arr">→</span>
          </a>
          <a className="btn btn--ghost-dark" href="#" onClick={e => e.preventDefault()}>
            Get it on Google Play <span className="arr">→</span>
          </a>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            {['Facebook', 'Instagram', 'TikTok', 'WhatsApp'].map(s => (
              <a key={s} className="mono" href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--cream-2)' }}>
                {s} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="foot-base mono">
        <span>© 2026 FARM RADIO · Demo website: brand names, prices, guests and stories are for demonstration only.</span>
        <nav aria-label="Footer">
          {STATIONS.slice(1).map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={e => {
                e.preventDefault();
                goTo(id);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
