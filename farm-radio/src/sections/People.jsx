import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import LogoLoop from '@bits/Animations/LogoLoop/LogoLoop.jsx';
import { BRANDS, PRESENTERS, PRESENTER_ORDER, SEGMENTS, SPONSORS } from '../data';
import { curIndex, lastShowIndex, nextShows, useMinute } from '../engine';
import { SectionHead, useToast } from '../ui';

/* ---------------- Partners ---------------- */
const WORDMARKS = [...new Set([...SPONSORS.map(s => s[0]), ...BRANDS.map(b => b[0].replace(' Agritech', '').toUpperCase())])];
const SLIDE_MS = 6500;

export function Partners() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const bar = useRef(null);
  const img = useRef(null);
  const toast = useToast();
  const go = d => setI(v => (v + d + SPONSORS.length) % SPONSORS.length);

  useEffect(() => {
    if (paused) return;
    const tw = gsap.fromTo(bar.current, { width: '0%' }, { width: '100%', duration: SLIDE_MS / 1000, ease: 'none', onComplete: () => go(1) });
    return () => tw.kill();
  }, [i, paused]);

  useEffect(() => {
    gsap.fromTo(img.current, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'power3.inOut' });
  }, [i]);

  const s = SPONSORS[i];
  return (
    <section className="blk" id="partners" aria-labelledby="partners-h">
      <SectionHead
        id="partners-h"
        idx="105.3 FM"
        label="Partners in agriculture"
        title="Our partners"
        lede="FARM RADIO programming is resourced by our partners in agriculture."
      />
      <div className="logos">
        <LogoLoop
          logos={WORDMARKS.map(w => ({ node: <span className="wm">{w}</span>, title: w }))}
          speed={60}
          gap={64}
          logoHeight={30}
          fadeOut
          pauseOnHover
          ariaLabel="Partner brands"
        />
      </div>
      <div className="partner" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="partner-media">
          <img ref={img} src={s[2]} alt={`${s[0]} campaign artwork`} key={s[0]} />
        </div>
        <div className="partner-text">
          <div className="top">
            <span className="mono muted">{i === 0 ? 'Presenting partner' : 'Partner'}</span>
            <span className="display bn">{s[0]}</span>
            <p>{s[1]}</p>
            <button className="btn" style={{ alignSelf: 'flex-start', marginTop: 'auto' }} onClick={() => toast(`Demo: this would open ${s[0]}'s site`)}>
              Find out more <span className="arr">→</span>
            </button>
          </div>
          <div className="partner-nav">
            <div className="count mono">
              <span>
                {String(i + 1).padStart(2, '0')} / {String(SPONSORS.length).padStart(2, '0')}
              </span>
              <span className="progress">
                <i ref={bar} />
              </span>
            </div>
            <button onClick={() => go(-1)} aria-label="Previous partner">
              ←
            </button>
            <button onClick={() => go(1)} aria-label="Next partner">
              →
            </button>
          </div>
        </div>
      </div>
      <div className="pitch">
        <div>
          <span className="mono" style={{ color: 'var(--signal)' }}>
            Advertise
          </span>
          <h3 className="display" style={{ marginTop: 14 }}>
            Want your brand on FARM RADIO?
          </h3>
        </div>
        <div>
          <p>We keep it premium: one presenting online agri partner at a time, plus brand experiences that live on air, in the feed and on demand.</p>
          <div className="ctas">
            <button className="btn btn--signal" onClick={() => toast('Demo: media kit request sent')}>
              Request the media kit <span className="arr">→</span>
            </button>
            <button className="btn btn--ghost-dark" onClick={() => toast('Demo: our sales team will call you')}>
              Talk to sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Presenters ---------------- */
export function Team() {
  const m = useMinute();
  const on = SEGMENTS[curIndex(m)].c === 'STOP' ? [] : SEGMENTS[lastShowIndex(m)].p;
  const next = nextShows(m, 1)[0]?.p || [];
  return (
    <section className="blk" id="team" aria-labelledby="team-h">
      <SectionHead
        id="team-h"
        idx="101.3 FM"
        label="On-air team"
        title="Our presenters"
        lede="FARM RADIO is live, and our team jumps on air whenever there's something you need to hear."
      />
      <div className="grid team-grid">
        {PRESENTER_ORDER.map(id => {
          const p = PRESENTERS[id];
          const live = on.includes(id);
          const soon = !live && next.includes(id);
          return (
            <article className={`person${live ? ' live' : ''}`} key={id}>
              <div className="ph">
                <img src={p.img} alt={p.name} loading="lazy" />
                <span className={`tag ${live ? 'tag--live' : ''}`}>{live ? '● On air' : soon ? 'Up next' : 'Back soon'}</span>
              </div>
              <div className="meta">
                <div className="nm">{p.name}</div>
                <span className="mono muted">{p.role}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
