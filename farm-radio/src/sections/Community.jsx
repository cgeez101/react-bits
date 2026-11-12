import { useState } from 'react';
import { ALBUM_IMG, BRANDS, TRACKS } from '../data';
import { Modal, SectionHead, useToast } from '../ui';

/* ---------------- Your voice ---------------- */
function SendForm({ mode, onClose }) {
  const toast = useToast();
  const photo = mode === 'photo';
  return (
    <Modal open={!!mode} onClose={onClose} title={photo ? 'Send your pic to the album' : 'Wat sê jy alles? · Send to the studio'}>
      <form
        className="form"
        onSubmit={e => {
          e.preventDefault();
          onClose();
          toast(photo ? 'Thanks! Your pic is with the studio' : 'Sent! Listen out for your name on air');
        }}
      >
        <label>
          <span className="mono">Your name and farm</span>
          <input required placeholder="e.g. Koos, Boplaas, Swartland" />
        </label>
        <label>
          <span className="mono">{photo ? 'Tell us about the pic' : 'Your message'}</span>
          <textarea placeholder={photo ? 'Harvest day, new calves, the view from the tractor…' : "What's happening on your farm?"} />
        </label>
        <label>
          <span className="mono">{photo ? 'Photo' : 'Voice note, photo or clip (optional)'}</span>
          <input type="file" accept={photo ? 'image/*' : 'audio/*,image/*,video/*'} required={photo} />
        </label>
        <div className="form-foot">
          <span className="mono muted">Demo: nothing leaves your device</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--signal">
              Send to the studio
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

const WAVE = Array.from({ length: 44 }, (_, i) => 10 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 54));

export function Voice() {
  const [mode, setMode] = useState(null);
  return (
    <section className="blk" id="voice" aria-labelledby="voice-h">
      <SectionHead
        id="voice-h"
        idx="03"
        label="Your voice"
        title="Your voice"
        lede="Get your farming life on the air. Voice notes, clips and photos from the farm, read out and shared on the feed."
      />
      <div className="grid voice-grid">
        <div className="voice-card" style={{ background: 'var(--paper-2)' }}>
          <span className="mono">Voice notes · phone-ins</span>
          <h3 className="display">Wat sê jy alles?</h3>
          <div className="wave" aria-hidden="true">
            {WAVE.map((h, i) => (
              <i key={i} style={{ height: h }} />
            ))}
          </div>
          <p>Change the view. Edify. Staan op! Send us a voice note and we’ll play the best ones on air.</p>
          <button className="btn btn--ink" onClick={() => setMode('voice')}>
            <span className="dot" style={{ background: 'var(--signal)' }} /> Send a voice note
          </button>
        </div>
        <div className="voice-card voice-card--photo">
          <img src={ALBUM_IMG} alt="" loading="lazy" />
          <span className="mono">The FARM RADIO album</span>
          <h3 className="display">En hoe lyk jou boerdery?</h3>
          <p>Send us your pic and join our album today.</p>
          <button className="btn btn--signal" onClick={() => setMode('photo')}>
            Send your pic <span className="arr">→</span>
          </button>
        </div>
      </div>
      <SendForm mode={mode} onClose={() => setMode(null)} />
    </section>
  );
}

/* ---------------- Song vote ---------------- */
export function Vote() {
  const [vote, setVote] = useState(null);
  const toast = useToast();
  const total = TRACKS.reduce((a, t) => a + t[2], 0) + (vote !== null ? 4 : 0);
  const share = i => ((TRACKS[i][2] + (vote === i ? 4 : 0)) / total) * 100;
  const leader = TRACKS.map((_, i) => i).sort((a, b) => share(b) - share(a))[0];
  return (
    <section className="blk" id="vote" aria-labelledby="vote-h">
      <SectionHead
        id="vote-h"
        idx="04"
        label="Farmer-driven radio"
        title="Pick the next song"
        lede="Tap a song to vote. The most-voted track plays next on FARM RADIO."
        aside={
          <>
            <span className="tag tag--live">Vote open</span>
            <span className="mono muted">Leading: {TRACKS[leader][0]}</span>
          </>
        }
      />
      <div className="grid vote-grid">
        {TRACKS.map((t, i) => (
          <button
            key={t[0]}
            className={`track${vote === i ? ' mine' : ''}`}
            aria-pressed={vote === i}
            onClick={() => {
              setVote(i);
              toast(`Vote counted: ${t[0]}`);
            }}
          >
            <span className="cover">
              <img src={t[3]} alt="" loading="lazy" />
              <span className="rank">#{String(i + 1).padStart(2, '0')}</span>
            </span>
            <span className="info">
              <b>{t[0]}</b>
              <span>{t[1]}</span>
              <span className="share">
                <span className="bar">
                  <i style={{ width: `${share(i) * 4}%` }} />
                </span>
                <span className="mono" style={{ color: 'var(--ink)' }}>
                  {Math.round(share(i))}%
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Brand series ---------------- */
const STATUS = { live: ['Coming up live', 'tag--live'], next: ['Next episode', ''], od: ['On demand', ''] };
export function Brands() {
  return (
    <section className="blk" id="brands" aria-labelledby="brands-h">
      <SectionHead
        id="brands-h"
        idx="05"
        label="Brand series"
        title="Brand series"
        lede="Shows made with the brands that farm with you: live features, field visits and masterclasses from the names behind South African farming. On air, in the feed and on demand."
      />
      <div className="grid brand-grid">
        {BRANDS.map(b => (
          <article className="brand" key={b[0]}>
            <span className="bn">{b[0]}</span>
            <p>{b[1]}</p>
            <div className="brand-foot">
              <span className="mono muted">{b[2]}</span>
              <span className={`tag ${STATUS[b[3]][1]}`}>{STATUS[b[3]][0]}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
