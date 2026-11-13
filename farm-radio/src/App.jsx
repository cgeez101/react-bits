import { useEffect, useLayoutEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { AudioProvider, HourProvider } from './engine';
import { ToastProvider, go } from './ui';
import { GROUPS, PAGES, currentPageId, pageById } from './pages';
import Header from './sections/Header';
import Studio, { Ticker } from './sections/Studio';
import { MarketsPage, PulsePage, SportPage, WeatherPage, WirePage } from './sections/DeskPages';
import Feed from './sections/Feed';
import { Voice, Vote, Brands } from './sections/Community';
import { Partners, Team } from './sections/People';
import { Footer, PlayerBar, Room } from './sections/Shell';

gsap.registerPlugin(ScrollTrigger, SplitText);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- home: the studio plus an index of every station ---------- */
function StationIndex() {
  return (
    <section className="blk" aria-label="All pages">
      <div className="rows-lbl mono">
        <span>Tune in</span>
        <span className="muted">Every page is also in the menu, top right</span>
      </div>
      <div className="grid index-grid">
        {GROUPS.filter(g => g !== 'Studio').map(g => (
          <div className="index-col" key={g}>
            <span className="menu-g mono">{g}</span>
            {PAGES.filter(p => p.group === g).map(p => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="index-item"
                onClick={e => {
                  e.preventDefault();
                  go(p.id);
                }}
              >
                <span className="f mono">{p.freq}</span>
                <span className="l">{p.label}</span>
                <span className="arr">→</span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
function Home() {
  return (
    <>
      <Studio />
      <Ticker />
      <StationIndex />
    </>
  );
}

const VIEWS = {
  live: Home,
  markets: MarketsPage,
  weather: WeatherPage,
  wire: WirePage,
  sport: SportPage,
  pulse: PulsePage,
  feed: Feed,
  vote: Vote,
  voice: Voice,
  team: Team,
  brands: Brands,
  partners: Partners
};

/* ---------- previous / next, so a demo can be clicked through like a deck ---------- */
function PageNav({ page }) {
  const i = PAGES.findIndex(p => p.id === page);
  const prev = PAGES[(i - 1 + PAGES.length) % PAGES.length];
  const next = PAGES[(i + 1) % PAGES.length];
  const Link = ({ p, dir }) => (
    <a
      href={`#${p.id}`}
      className={`pnav-${dir}`}
      onClick={e => {
        e.preventDefault();
        go(p.id);
      }}
    >
      <span className="mono muted">
        {dir === 'prev' ? '← Previous' : 'Next →'} · {p.freq} FM
      </span>
      <span className="l">{p.label}</span>
    </a>
  );
  return (
    <nav className="pnav" aria-label="Previous and next page">
      <Link p={prev} dir="prev" />
      <Link p={next} dir="next" />
    </nav>
  );
}

/* ---------- page routing on the URL hash ---------- */
function usePage() {
  const [page, setPage] = useState(currentPageId);
  useEffect(() => {
    const on = () => {
      setPage(currentPageId());
      if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  useEffect(() => {
    const p = pageById(page);
    document.title = page === 'live' ? 'FARM RADIO' : `${p.label} · FARM RADIO`;
  }, [page]);
  return page;
}

/* ---------- smooth scroll (Lenis, driven by GSAP's ticker) ---------- */
function useSmoothScroll() {
  useEffect(() => {
    if (reduced()) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = t => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
}

/* ---------- each page arrives with one short, orchestrated entrance ---------- */
function usePageEntrance(page) {
  useLayoutEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      if (page === 'live') {
        gsap.from('.studio-main > *, .studio-side > *', { opacity: 0, y: 18, duration: 0.8, stagger: 0.07, ease: 'power3.out' });
        gsap.from('.hour-seg', { scaleY: 0, transformOrigin: 'bottom', duration: 0.6, stagger: 0.012, ease: 'power2.out', delay: 0.25 });
        gsap.from('.index-col', { opacity: 0, y: 20, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.3 });
        return;
      }
      document.querySelectorAll('.page [data-split]').forEach(el => {
        const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
        gsap.from(split.lines, { yPercent: 105, duration: 0.85, stagger: 0.08, ease: 'power4.out' });
      });
      gsap.from('.page .blk-head .lede, .page .blk-head .aside', { opacity: 0, y: 14, duration: 0.6, delay: 0.15, ease: 'power3.out' });
      gsap.from('.page .grid > *, .page .filters, .page .feature, .page .logos, .page .partner, .page .pitch', {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.05,
        delay: 0.2,
        ease: 'power3.out'
      });
    });
    return () => ctx.revert();
  }, [page]);
}

export default function App() {
  const page = usePage();
  const [menuOpen, setMenuOpen] = useState(false);
  useSmoothScroll();
  usePageEntrance(page);
  const View = VIEWS[page] || Home;
  return (
    <HourProvider>
      <AudioProvider>
        <ToastProvider>
          <Header page={page} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <main className={`frame page page--${page}`} key={page}>
            <View />
            <PageNav page={page} />
          </main>
          <div className="frame">
            <Footer compact={page !== 'live'} />
          </div>
          <PlayerBar />
          <Room />
        </ToastProvider>
      </AudioProvider>
    </HourProvider>
  );
}
