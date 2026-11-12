import { useMemo, useState } from 'react';
import { CHANNELS, FILTERS, MORNING, SEGMENTS, VIDEOS, isAd } from '../data';
import { hhmm, lastShowIndex, useAudio, useWholeMinute, useMinute, curIndex } from '../engine';
import { Faces, Modal, PlayIcon, SectionHead, useToast } from '../ui';

const morningTime = s => {
  const t = Math.floor(s.s * 60);
  return `07:${String(Math.floor(t / 60)).padStart(2, '0')}`;
};

export function VideoModal({ vid, live, onClose }) {
  const { play } = useAudio();
  const v = VIDEOS[vid];
  return (
    <Modal open={!!vid} onClose={onClose} title={live ? 'Live video · FARM RADIO studio' : 'Video replay'} wide>
      {v && (
        <>
          <div className="video-stage">
            <img src={v.img} alt={v.title} />
            <span className={`tag ${live ? 'tag--live' : 'tag--ink'}`}>{live ? '● Live' : 'Replay'}</span>
          </div>
          <div className="video-bar">
            <div style={{ flex: 1 }}>
              <h3 className="display" style={{ margin: '0 0 8px', fontSize: 'clamp(22px,2.6vw,34px)' }}>
                {v.title}
              </h3>
              <p>{v.desc}</p>
            </div>
            <button className="btn btn--signal" onClick={() => play(v.title, live ? 'live' : 'replay')}>
              <PlayIcon /> Listen along
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function Feed() {
  const wm = useWholeMinute();
  const m = useMinute();
  const inBreak = isAd(SEGMENTS[curIndex(m)]);
  const liveIdx = lastShowIndex(m);
  const { play, toggle, playing, kind } = useAudio();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [all, setAll] = useState(false);
  const [mine, setMine] = useState(() => new Set());
  const [video, setVideo] = useState(null);

  const rows = useMemo(() => {
    const shows = SEGMENTS.filter(s => !isAd(s));
    const up = shows.filter(s => s.s > wm + 0.001).slice(0, 2).map(s => ({ ...s, state: 'next', time: hhmm(s.s) }));
    const live = inBreak ? [] : [{ ...SEGMENTS[liveIdx], state: 'live', time: hhmm(SEGMENTS[liveIdx].s) }];
    const aired = shows
      .filter(s => s.s < SEGMENTS[liveIdx].s || (inBreak && s.id === SEGMENTS[liveIdx].id))
      .reverse()
      .map(s => ({ ...s, state: 'replay', when: 'This afternoon', time: hhmm(s.s) }));
    const morning = [...MORNING].reverse().map(s => ({ ...s, state: 'replay', when: 'This morning', time: morningTime(s) }));
    return { up, live, past: [...aired, ...morning] };
  }, [wm, liveIdx, inBreak]);

  const match = f => s => f === 'all' || f.split(',').includes(s.ch);
  const everything = [...rows.up, ...rows.live, ...rows.past];
  const counts = Object.fromEntries(FILTERS.map(([f]) => [f, everything.filter(match(f)).length]));

  const up = rows.up.filter(match(filter));
  const live = rows.live.filter(match(filter));
  const past = rows.past.filter(match(filter));
  const LIMIT = 7;
  const pastShown = all ? past : past.slice(0, LIMIT);

  /* featured video: live now › latest this hour › this morning */
  const liveSeg = rows.live[0];
  const featured =
    (liveSeg?.video && { ...liveSeg, live: true }) ||
    rows.past.find(s => s.video && s.when === 'This afternoon') ||
    rows.past.find(s => s.video);
  const fv = featured && VIDEOS[featured.video];

  const action = s => {
    if (s.video && s.state !== 'next')
      return (
        <button className="btn" onClick={() => setVideo({ vid: s.video, live: s.state === 'live' })}>
          ▶ {s.state === 'live' ? 'Watch live' : 'Watch'}
        </button>
      );
    if (s.state === 'live') {
      const on = playing && kind === 'live';
      return (
        <button className="btn" onClick={() => toggle(s.t, 'live')}>
          <span className="dot dot--live" style={{ background: 'var(--ink)' }} /> {on ? 'Listening' : 'Live'}
        </button>
      );
    }
    if (s.state === 'next') {
      const has = mine.has(s.id);
      return (
        <button
          className={`btn${has ? ' btn--ink' : ''}`}
          onClick={() => {
            setMine(prev => {
              const n = new Set(prev);
              has ? n.delete(s.id) : n.add(s.id);
              return n;
            });
            toast(has ? 'Removed from your list' : `Added: we'll remind you at ${s.time}`);
          }}
        >
          {has ? '✓ On my list' : '+ My list'}
        </button>
      );
    }
    return (
      <button
        className="btn"
        onClick={() => {
          play(s.t, 'replay');
          toast(`Replaying: ${s.t}`);
        }}
      >
        ▶ Replay
      </button>
    );
  };

  const Row = s => (
    <div className={`feed-row${s.state === 'live' ? ' live' : ''}`} key={`${s.id}-${s.state}`}>
      <span className="t">{s.time}</span>
      <span className={`ch mono${s.ch === 'news' ? ' brk' : ''}`}>
        {s.state === 'next' ? 'Up next · ' : ''}
        {CHANNELS[s.ch].name}
        {s.th ? ' · Thread' : ''}
      </span>
      <span className="ti">
        <b>{s.t}</b>
        <span className="muted">{s.u}</span>
      </span>
      <Faces ids={s.p} />
      <span className="act">{action(s)}</span>
    </div>
  );

  return (
    <section className="blk" id="feed" aria-labelledby="feed-h">
      <SectionHead
        id="feed-h"
        idx="02"
        label="The feed · on demand"
        title="The feed"
        lede="What's live, what's coming up, and everything we've aired today, ready when you are."
        aside={
          <>
            <span className="mono">{rows.past.length} ready to replay</span>
            <span className="mono muted">{rows.up.length} coming up</span>
          </>
        }
      />
      <div className="filters" role="tablist" aria-label="Filter by channel">
        {FILTERS.map(([f, label]) => (
          <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {label}
            <sup>{counts[f]}</sup>
          </button>
        ))}
      </div>

      {fv && filter === 'all' && (
        <div className="feature">
          <button className="feature-media" onClick={() => setVideo({ vid: featured.video, live: !!featured.live })} aria-label={`Watch ${fv.title}`}>
            <img src={fv.img} alt="" loading="lazy" />
            <span className="playbig">
              <PlayIcon /> {featured.live ? 'Watch live' : 'Watch the replay'}
            </span>
          </button>
          <div className="feature-text">
            <span className="mono muted">
              {featured.live ? 'On air now' : `${featured.when} · ${featured.time}`} · {CHANNELS[featured.ch].name}
            </span>
            <h3 className="display">{fv.title}</h3>
            <p>{fv.desc}</p>
            <button className="btn btn--ink" onClick={() => setVideo({ vid: featured.video, live: !!featured.live })}>
              ▶ {featured.live ? 'Watch live' : 'Watch the replay'} <span className="arr">→</span>
            </button>
          </div>
        </div>
      )}

      {(up.length > 0 || live.length > 0) && (
        <>
          <div className="rows-lbl mono">
            <span>Live & coming up</span>
            <span className="muted">Tap + to get a reminder</span>
          </div>
          {[...up].reverse().map(Row)}
          {live.map(Row)}
        </>
      )}
      {past.length > 0 && (
        <div className="rows-lbl mono">
          <span>On demand · today</span>
          <span className="muted">Replay any item</span>
        </div>
      )}
      {pastShown.map(Row)}
      {!up.length && !live.length && !past.length && (
        <p className="cell muted" style={{ margin: 0 }}>
          Nothing in this channel yet today. Check back after the next hour.
        </p>
      )}
      {past.length > LIMIT && (
        <div className="feed-more">
          <button className="btn" onClick={() => setAll(a => !a)}>
            {all ? 'Show less' : `Show all ${past.length}`}
          </button>
        </div>
      )}
      <VideoModal vid={video?.vid} live={video?.live} onClose={() => setVideo(null)} />
    </section>
  );
}
