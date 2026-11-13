/* The desk, split into one page per panel: markets, weather, wire, sport, pulse. */
import { FIXTURES, OUTLOOK, PLANNER, PRICES, SEGMENTS, TRENDS } from '../data';
import { hhmm, priceAt, useAudio, useWholeMinute, lastShowIndex, useMinute } from '../engine';
import { SectionHead, go } from '../ui';
import { pageById } from '../pages';
import { Board, Pulse, Sport, Weather, Wire } from './Desk';

const Head = ({ id, title, lede, aside }) => {
  const p = pageById(id);
  return <SectionHead id={`${id}-h`} idx={`${p.freq} FM`} label={`The desk · ${p.label}`} title={title} lede={lede} aside={aside} />;
};

/* ---------------- markets ---------------- */
function Movers() {
  const wm = useWholeMinute();
  const { play } = useAudio();
  const rows = PRICES.map((p, k) => {
    const v = priceAt(k, wm);
    return { name: p[0], pct: ((v - p[3]) / p[3]) * 100 };
  }).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  return (
    <div className="cell">
      <div className="cell-h">
        <h3>Biggest moves</h3>
        <span className="mono muted">% since open</span>
      </div>
      {rows.slice(0, 5).map(r => (
        <div className="kv" key={r.name}>
          <span>{r.name}</span>
          <span className={`v ${r.pct >= 0 ? 'up' : 'down'}`}>
            {r.pct >= 0 ? '▲ +' : '▼ −'}
            {Math.abs(r.pct).toFixed(2)}%
          </span>
        </div>
      ))}
      <div className="note">
        <span className="mono" style={{ color: 'var(--signal)' }}>
          Why beef is down
        </span>
        <p>The export tariff announcement at 16:16 hit beef straight away. Johnny has reaction from auction marts around the country.</p>
        <button className="btn btn--ink" onClick={() => play('Live Reaction: Beef Prices Respond', 'live')}>
          ▶ Hear it live
        </button>
      </div>
    </div>
  );
}
export function MarketsPage() {
  return (
    <section className="blk page-desk" aria-labelledby="markets-h">
      <Head
        id="markets"
        title="Market board"
        lede="Grain from SAFEX, livestock at A2 grade and milk at the farm gate. Every price moves live through the hour."
        aside={
          <>
            <span className="tag tag--live">Live</span>
            <span className="mono muted">Demo feed</span>
          </>
        }
      />
      <div className="grid split-2-1 board-xl">
        <Board title="Prices now" />
        <Movers />
      </div>
    </section>
  );
}

/* ---------------- weather ---------------- */
export function WeatherPage() {
  return (
    <section className="blk page-desk" aria-labelledby="weather-h">
      <Head id="weather" title="Weather" lede="A field-level forecast for your area, updated through the day, with the windows that matter for the work." />
      <div className="grid split-1-2">
        <Weather title="Right now" />
        <div className="cell">
          <div className="cell-h">
            <h3>Five-day outlook</h3>
            <span className="mono muted">Your area</span>
          </div>
          <div className="outlook">
            {OUTLOOK.map(d => (
              <div className="day" key={d[0]}>
                <span className="mono">{d[0]}</span>
                <b className="num">{d[2]}°</b>
                <span className="lo num">{d[3]}°</span>
                <span className="sum">{d[1]}</span>
                <span className="mono muted">
                  Rain {d[4]}% · {d[5]} km/h
                </span>
                <span className="rain" aria-hidden="true">
                  <i style={{ height: `${d[4]}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className="cell-h" style={{ marginTop: 28 }}>
            <h3>Field planner</h3>
          </div>
          {PLANNER.map(p => (
            <div className="kv" key={p[0]}>
              <span>
                <strong>{p[0]}</strong> <span className="muted">· {p[2]}</span>
              </span>
              <span className={`v ${p[3] ? 'up' : 'down'}`}>{p[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- wire ---------------- */
function Thread() {
  const m = useMinute();
  const live = SEGMENTS[lastShowIndex(m)];
  const items = SEGMENTS.filter(s => s.th === 'TARIFF');
  return (
    <div className="cell">
      <div className="cell-h">
        <h3>The tariff story</h3>
        <span className="mono muted">Live thread</span>
      </div>
      <ol className="plain thread">
        {items.map(s => {
          const state = s.id === live.id ? 'now' : s.s <= m ? 'done' : 'next';
          return (
            <li key={s.id} className={state}>
              <span className="mono">
                {hhmm(s.s)} · {state === 'now' ? 'On air' : state === 'done' ? 'Aired' : 'Coming up'}
              </span>
              <p>{s.t.replace(/^BREAKING:\s*/i, '')}</p>
              <span className="muted">{s.u}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
export function WirePage() {
  return (
    <section className="blk page-desk" aria-labelledby="wire-h">
      <Head id="wire" title="Agri wire" lede="Breaking stories from the FARM RADIO newsroom and the day's top South African agri headlines." />
      <div className="grid split-2-1">
        <Wire all title="Latest" />
        <Thread />
      </div>
    </section>
  );
}

/* ---------------- sport ---------------- */
export function SportPage() {
  return (
    <section className="blk page-desk" aria-labelledby="sport-h">
      <Head id="sport" title="Sport" lede="The Springboks, the Proteas and Bafana Bafana: results, squads and what's coming up." />
      <div className="grid split-2-1">
        <Sport all title="Results & news" />
        <div className="cell">
          <div className="cell-h">
            <h3>Coming up</h3>
            <span className="mono muted">Fixtures</span>
          </div>
          {FIXTURES.map(f => (
            <div className="fixture" key={f[2]}>
              <span className="mono muted">
                {f[0]} · {f[1]}
              </span>
              <b>{f[2]}</b>
              <span className="muted">{f[3]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- pulse ---------------- */
export function PulsePage() {
  return (
    <section className="blk page-desk" aria-labelledby="pulse-h">
      <Head id="pulse" title="Topic pulse" lede="What farmers are talking about online right now, ranked by mentions per hour. We read the best of it on air." />
      <div className="grid split-1-1">
        <Pulse title="Trending now" />
        <div className="cell">
          <div className="cell-h">
            <h3>Behind the tags</h3>
          </div>
          <ul className="plain wire">
            {TRENDS.map(t => (
              <li key={t[0]}>
                <span className={`k mono${t[2] ? ' hot' : ''}`}>{t[0]}</span>
                <p>{t[1]}</p>
              </li>
            ))}
          </ul>
          <button className="more-btn" onClick={() => go('feed')}>
            Hear the reaction in the feed →
          </button>
        </div>
      </div>
    </section>
  );
}
