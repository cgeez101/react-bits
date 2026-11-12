import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { AudioProvider, HourProvider } from './engine';
import { ToastProvider } from './ui';
import Header from './sections/Header';
import Studio, { Ticker } from './sections/Studio';
import Desk from './sections/Desk';
import Feed from './sections/Feed';
import { Voice, Vote, Brands } from './sections/Community';
import { Partners, Team } from './sections/People';
import { Footer, PlayerBar, Room } from './sections/Shell';

gsap.registerPlugin(ScrollTrigger, SplitText);

function useMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    /* Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync */
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = t => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      /* studio: quick power-on */
      gsap.from('.studio-main > *, .studio-side > *', { opacity: 0, y: 18, duration: 0.8, stagger: 0.07, ease: 'power3.out', delay: 0.1 });
      gsap.from('.hour-seg', { scaleY: 0, transformOrigin: 'bottom', duration: 0.6, stagger: 0.012, ease: 'power2.out', delay: 0.35 });

      /* section titles: lines rise out of a mask */
      document.querySelectorAll('[data-split]').forEach(el => {
        const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
        gsap.from(split.lines, {
          yPercent: 105,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });

      /* ruled cells fade up in batches */
      const cells = gsap.utils.toArray('.grid > *, .feature, .partner, .pitch > div, .blk-head .lede, .blk-head .aside, .filters');
      gsap.set(cells, { opacity: 0, y: 26 });
      ScrollTrigger.batch(cells, {
        start: 'top 90%',
        once: true,
        onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', overwrite: true })
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
      window.removeEventListener('load', refresh);
    };
  }, []);
}

export default function App() {
  useMotion();
  return (
    <HourProvider>
      <AudioProvider>
        <ToastProvider>
          <Header />
          <main className="frame">
            <Studio />
            <Ticker />
            <Desk />
            <Feed />
            <Voice />
            <Vote />
            <Brands />
            <Partners />
            <Team />
          </main>
          <div className="frame">
            <Footer />
          </div>
          <PlayerBar />
          <Room />
        </ToastProvider>
      </AudioProvider>
    </HourProvider>
  );
}
