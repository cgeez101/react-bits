/* FARM RADIO · investor film, cut to the full station track (96.5 s, ~96 BPM).
   Every scene starts on a bar line of the music. One GSAP timeline drives everything;
   React Bits supplies the contour map (Topography) and the flip board (SplitFlapText);
   the 3D logo is the site's own three.js logo. render.cjs steps it frame by frame.

   Scenes (bar → seconds):
    0  cold open: ON AIR, "Farmers work sunrise to sunset."      0.0
    4  the gap: "No station is made for them."                     10.6
    6  the 3D logo + "Radio for the people who work the land."     15.6
   10  scattered → one station                                     25.6
   12  live all day (the studio)                                   30.6
   16  markets, live (flip board)                                  40.7
   19  weather for the work                                        48.2
   22  news and sport                                              55.7
   25  the presenters                                              63.2
   28  their voices on air (voice notes, song vote)                70.8
   31  built for brands                                            78.3
   34  on air, online, on demand (tuner)                           85.8
   36  end card                                                    90.8 → 96.4 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Topography from '@bits/Backgrounds/Topography/Topography.jsx';
import SplitFlapText from '@bits/TextAnimations/SplitFlapText/SplitFlapText.jsx';
import { buildLogo } from '../src/sections/Logo3D.jsx';
import { PRESENTERS, PRESENTER_ORDER, BRANDS, TRACKS, OUTLOOK } from '../src/data.js';
import './intro.css';

gsap.registerPlugin(ScrambleTextPlugin);

/* ---------- music grid ---------- */
const BEAT = 0.6269; // seconds per beat (95.7 BPM)
const FIRST = 0.534; // first downbeat
const bar = k => FIRST + 4 * BEAT * k;
const END = 96.4;
const S = { open: 0, gap: bar(4), logo: bar(6), scatter: bar(10), studio: bar(12), markets: bar(16), weather: bar(19), news: bar(22), team: bar(25), voice: bar(28), brands: bar(31), tuner: bar(34), end: bar(36) };

/* ---------- 3D logo, posed by the timeline ---------- */
const pose = { s: 0, ry: -Math.PI * 1.5, rx: 0.12, y: 0, x: 0 };
function LogoStage() {
  const wrap = useRef(null);
  useEffect(() => {
    const el = wrap.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(1920, 1080, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1920 / 1080, 0.1, 100);
    camera.position.set(0, 0, 10.5);
    scene.add(new THREE.HemisphereLight('#fff6e6', '#2a1a10', 1.1));
    const key = new THREE.DirectionalLight('#ffffff', 2.8);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ff7a3d', 2.4);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    const fill = new THREE.PointLight('#f4ebd6', 20, 22);
    fill.position.set(-3, 2, 4);
    scene.add(fill);
    const pivot = new THREE.Group();
    pivot.add(buildLogo(false));
    scene.add(pivot);
    let hidden = true;
    el.style.visibility = 'hidden';
    const draw = () => {
      if (pose.s < 0.001) {
        if (!hidden) el.style.visibility = 'hidden';
        hidden = true;
        return;
      }
      if (hidden) el.style.visibility = 'visible';
      hidden = false;
      pivot.scale.setScalar(pose.s);
      pivot.rotation.set(pose.rx, pose.ry, 0);
      pivot.position.set(pose.x, pose.y, 0);
      renderer.render(scene, camera);
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div className="layer logo-stage" ref={wrap} />;
}

/* ---------- helpers ---------- */
const Lines = ({ lines, className = 'display' }) =>
  lines.map((l, i) => (
    <div className="ln" key={i}>
      <div className={`${className} li`}>{l}</div>
    </div>
  ));
const Bars = ({ n, className }) => (
  <div className={className}>
    {Array.from({ length: n }, (_, i) => (
      <i key={i} />
    ))}
  </div>
);
/* level meter driven by timeline time; pulses on the beat so it dances with the track */
function meter(el, t, level, seed = 0) {
  if (!el) return;
  el.style.opacity = Math.min(1, level * 3).toFixed(3); // gone when at rest
  const beat = ((t - FIRST) / BEAT) % 1;
  const kick = Math.exp(-((beat < 0 ? beat + 1 : beat) * 5));
  [...el.children].forEach((b, i) => {
    const v = level * (0.18 + 0.5 * kick + 0.4 * Math.abs(Math.sin(t * 6.1 + i * 0.57 + seed) * Math.cos(t * 2.3 + i * 0.21)));
    b.style.transform = `scaleY(${Math.max(0.04, Math.min(1, v)).toFixed(3)})`;
    b.classList.toggle('hot', v > 0.85);
  });
}
const Feat = ({ id, tone, eyebrow, lines, sub, children }) => (
  <div className={`scene ${tone} ${id}`}>
    <div className="feat">
      <div className="copy">
        <span className="eyebrow">&nbsp;</span>
        <div>
          <Lines lines={lines} />
        </div>
        <p className="sub" style={{ margin: 0 }}>
          {sub}
        </p>
      </div>
      <div className={`visual ${tone === 'night' ? 'panel-night' : ''}`}>{children}</div>
    </div>
    <span className="sr-eyebrow" data-text={eyebrow} hidden />
  </div>
);
const PLAY = (
  <svg viewBox="0 0 24 24">
    <path d="M6 3.5v17L20.5 12z" fill="#13150f" />
  </svg>
);

const BOARD = [
  ['Beef', 'A2 grade', ['R64.50', 'R60.00'], ['▲ +0.12', '▼ −4.50']],
  ['Wheat', 'SAFEX', ['R5 450', 'R5 467'], ['▲ +4', '▲ +17']],
  ['Milk', 'Farm gate', ['R7.20', 'R7.22'], ['▲ +0.01', '▲ +0.02']],
  ['Yellow maize', 'SAFEX', ['R4 120', 'R4 123'], ['▲ +1', '▲ +3']],
  ['Soybeans', 'SAFEX', ['R8 240', 'R8 257'], ['▲ +6', '▲ +17']],
  ['Lamb', 'A2 grade', ['R118.00', 'R118.28'], ['▲ +0.05', '▲ +0.28']]
];
const HOUR = [
  ['16:00', 'Briefing', 1.5], ['16:01', 'Market close', 2], ['16:03', 'Weather', 2], ['16:05', 'Trendsetter', 3], ['16:08', 'Drive-time', 2.5],
  ['16:11', 'Voices', 2], ['', '', 3], ['16:16', 'Breaking', 1.5], ['16:17', 'Beef prices', 2.5], ['16:20', 'RPO', 3], ['16:23', 'Near you', 2], ['16:25', 'Training', 2]
];
const CHIPS = [['Prices', 380, 440, -6], ['Weather', 1260, 420, 5], ['Agri news', 820, 520, -3], ['Sport', 1460, 600, 7], ['Policy', 300, 660, 4], ['Auctions', 1020, 720, -5], ['Interviews', 560, 820, 3], ['Music', 1500, 830, -4]];
const WORDMARKS = ['TOYOTA', 'TELKOM', 'FNB', 'SYNGENTA', 'CASE IH', 'SAMSUNG', 'GRAIN SA', 'WH AUCTIONS', 'JOHN DEERE', 'VKB', 'NWK', 'CORTEVA'];

function Film() {
  const root = useRef(null);
  const vu = useRef(null);
  const wave = useRef(null);
  const tc = useRef(null);
  const prog = useRef(null);
  const [flap, setFlap] = useState(0);
  const [topo, setTopo] = useState(false);

  useLayoutEffect(() => {
    const q = gsap.utils.selector(root);
    const lv = { open: 0, studio: 0, wave: 0 };
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    const scenes = ['.s1', '.s2', '.s3', '.s4', '.s5', '.s6', '.s7', '.s8', '.s9', '.s10', '.s11', '.s12', '.s13'];

    gsap.set(q('.li'), { yPercent: 110 });
    gsap.set(q('.sub, .s1 .tally, .s1 .freq, .s1 .note, .tagline .mono, .chip, .s4 .head2'), { autoAlpha: 0 });
    scenes.slice(1).forEach(s => gsap.set(q(s), { autoAlpha: 0 }));

    /* chrome: timecode, progress, record light on the beat */
    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      const s = Math.floor(t);
      const f = Math.floor((t - s) * 30);
      tc.current.textContent = `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
      prog.current.style.transform = `scaleX(${(t / END).toFixed(4)})`;
      meter(vu.current, t, lv.open);
      meter(q('.vu2')[0], t, lv.studio, 2);
      meter(wave.current, t, lv.wave, 5);
    });
    tl.from(q('.chrome'), { autoAlpha: 0, duration: 0.6 }, 0);

    /* scene change: the new scene wipes over the old one, landing on the bar */
    const wipe = (sel, at, dir) => {
      const from = { up: 'inset(100% 0% 0% 0%)', down: 'inset(0% 0% 100% 0%)', left: 'inset(0% 0% 0% 100%)', right: 'inset(0% 100% 0% 0%)' }[dir];
      tl.set(q(sel), { autoAlpha: 1, clipPath: from }, at - 0.6);
      tl.to(q(sel), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.inOut' }, at - 0.6);
    };
    /* standard entrance for a feature scene's copy */
    const copyIn = (sel, at) => {
      const eb = q(`${sel} .eyebrow`)[0];
      const text = q(`${sel} .sr-eyebrow`)[0]?.dataset.text || '';
      tl.to(eb, { duration: 0.9, scrambleText: { text, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', speed: 0.7 }, ease: 'none' }, at + 0.05);
      tl.to(q(`${sel} .copy .li`), { yPercent: 0, duration: 0.85, stagger: 0.1, ease: 'power4.out' }, at + 0.1);
      tl.to(q(`${sel} .sub`), { autoAlpha: 1, y: 0, duration: 0.7 }, at + 0.8);
    };
    gsap.set(q('.sub'), { y: 14 });

    /* ---------------- 1 · cold open ---------------- */
    tl.fromTo(q('.s1 .tally'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, FIRST - 0.1);
    tl.to(lv, { open: 1, duration: 1.2 }, FIRST);
    tl.set(q('.s1 .freq'), { autoAlpha: 1 }, bar(0.5));
    tl.to(q('.s1 .freq'), { duration: 1.2, scrambleText: { text: '88.2 FM · South Africa · On air all day', chars: '0123456789ABCDEF·', speed: 0.6 }, ease: 'none' }, bar(0.5));
    tl.to(q('.s1 .li'), { yPercent: 0, duration: 0.9, stagger: 0.14, ease: 'power4.out' }, bar(1));
    tl.to(q('.s1 .note'), { autoAlpha: 1, duration: 0.6 }, bar(2));
    tl.to(q('.s1 .note'), { duration: 1.4, scrambleText: { text: 'Out before dawn. In after dark. On the tractor, in the dairy, at the auction pen.', chars: 'abcdefghijklmnopqrstuvwxyz', speed: 0.9 }, ease: 'none' }, bar(2));
    tl.to(q('.s1 .li, .s1 .note'), { yPercent: -110, autoAlpha: 0, duration: 0.5, stagger: 0.04, ease: 'power3.in' }, S.gap - 0.55);
    tl.to(lv, { open: 0, duration: 0.5 }, S.gap - 0.55);

    /* ---------------- 2 · the gap ---------------- */
    tl.set(q('.s2'), { autoAlpha: 1 }, S.gap - 0.6);
    tl.call(() => setTopo(true), null, S.gap - 1.2);
    tl.to(q('.topo'), { opacity: 0.7, duration: 1.6, ease: 'none' }, S.gap - 0.4);
    tl.to(q('.s2 .li'), { yPercent: 0, duration: 0.9, stagger: 0.14, ease: 'power4.out' }, S.gap);
    tl.to(q('.s1 .tally, .s1 .freq'), { autoAlpha: 0, duration: 0.4 }, S.logo - 0.6);
    tl.to(q('.s2 .li'), { yPercent: -110, duration: 0.5, stagger: 0.05, ease: 'power3.in' }, S.logo - 0.6);

    /* ---------------- 3 · the logo ---------------- */
    tl.set(q('.s3'), { autoAlpha: 1 }, S.logo - 0.1);
    tl.to(pose, { s: 1, ry: 0.35, rx: 0.08, duration: 2.0, ease: 'expo.out' }, S.logo - 0.1);
    tl.to(pose, { ry: 2.2, duration: S.scatter - S.logo - 1.9, ease: 'none' }, S.logo + 1.9);
    tl.to(pose, { y: 0.55, duration: 1.0, ease: 'power2.inOut' }, bar(7.5));
    tl.to(q('.tagline .li'), { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power4.out' }, bar(8));
    tl.to(q('.tagline .mono'), { autoAlpha: 1, duration: 0.4 }, bar(9));
    tl.to(q('.tagline .mono'), { duration: 1.1, scrambleText: { text: 'Markets · Weather · Agri news · Sport · Live interviews', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.8 }, ease: 'none' }, bar(9));

    /* ---------------- 4 · scattered → together ---------------- */
    wipe('.s4', S.scatter, 'up');
    tl.set(pose, { s: 0 }, S.scatter);
    tl.set(q('.tagline'), { autoAlpha: 0 }, S.scatter);
    tl.call(() => setTopo(false), null, S.scatter + 0.1);
    tl.to(q('.s4 .head .li'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, S.scatter + 0.05);
    CHIPS.forEach((c, i) => {
      tl.fromTo(q('.chip')[i], { autoAlpha: 0, scale: 0.6, rotation: c[3] * 3 }, { autoAlpha: 1, scale: 1, rotation: c[3], duration: 0.5, ease: 'back.out(2)' }, S.scatter + 0.3 + i * (BEAT / 2));
    });
    // on the next bar the chips snap into one ruled row
    CHIPS.forEach((c, i) => {
      tl.to(q('.chip')[i], { left: 160 + (i % 4) * 400, top: 450 + Math.floor(i / 4) * 100, rotation: 0, duration: 0.7, ease: 'power4.inOut' }, bar(11) - 0.1 + i * 0.03);
    });
    tl.to(q('.chip'), { backgroundColor: '#ff5b1f', color: '#13150f', borderColor: '#ff5b1f', duration: 0.3, stagger: 0.04 }, bar(11) + 0.6);
    tl.to(q('.s4 .head .li'), { yPercent: -110, duration: 0.4, ease: 'power3.in' }, bar(11) - 0.2);
    tl.to(q('.s4 .head2'), { autoAlpha: 1, duration: 0.01 }, bar(11) + 0.3);
    tl.to(q('.s4 .head2 .li'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, bar(11) + 0.3);

    /* ---------------- 5 · studio ---------------- */
    wipe('.s5', S.studio, 'left');
    copyIn('.s5', S.studio);
    tl.to(lv, { studio: 1, duration: 0.8 }, S.studio + 0.5);
    tl.from(q('.s5 .visual > *'), { autoAlpha: 0, y: 24, duration: 0.7 }, S.studio + 0.3);
    tl.fromTo(q('.s5 .deck .bar i'), { width: '18%' }, { width: '96%', duration: 4.6, ease: 'none' }, S.studio + 0.3);
    tl.fromTo(q('.hour .head'), { left: '57%' }, { left: '66%', duration: S.markets - S.studio, ease: 'none' }, S.studio);
    // the show changes live, halfway through
    const swap = bar(14);
    tl.to(q('.s5 h3'), { duration: 1.1, scrambleText: { text: 'Stakeholder interview: RPO responds', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.7 }, ease: 'none' }, swap);
    tl.to(q('.s5 .chan'), { duration: 0.8, scrambleText: { text: '16:20 · Unions & associations · Live video', chars: '0123456789ABCDEF', speed: 0.7 }, ease: 'none' }, swap);
    tl.to(q('.h-a'), { autoAlpha: 0, duration: 0.4 }, swap);
    tl.fromTo(q('.h-b'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, swap + 0.2);
    tl.to(q('.next-a'), { autoAlpha: 0, duration: 0.3 }, swap);
    tl.fromTo(q('.next-b'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, swap + 0.2);
    tl.fromTo(q('.s5 .deck .bar i'), { width: '0%' }, { width: '42%', duration: S.markets - swap, ease: 'none', immediateRender: false }, swap);
    tl.to(q('.hour .now'), { backgroundColor: '#1b1e18', color: '#b9b4a4', duration: 0.2 }, swap);
    tl.to(q('.hour .now2'), { backgroundColor: '#f4ebd6', color: '#121410', duration: 0.2 }, swap);
    tl.to(lv, { studio: 0, duration: 0.4 }, S.markets);

    /* ---------------- 6 · markets ---------------- */
    wipe('.s6', S.markets, 'up');
    copyIn('.s6', S.markets);
    tl.from(q('.s6 .board2 h3, .s6 .brow2'), { autoAlpha: 0, x: 30, duration: 0.5, stagger: 0.08 }, S.markets + 0.2);
    tl.call(() => setFlap(1), null, S.markets + 0.7);
    tl.call(() => setFlap(2), null, bar(17.5));
    tl.to(q('.brow2 .dot'), { opacity: 1, duration: 0.2 }, bar(17.5));
    tl.fromTo(q('.why'), { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power4.out' }, bar(17.5) + 0.6);

    /* ---------------- 7 · weather ---------------- */
    wipe('.s7', S.weather, 'left');
    copyIn('.s7', S.weather);
    const temp = { v: 9 };
    tl.to(temp, { v: 23, duration: 1.4, ease: 'power2.out', onUpdate: () => (q('.wx .temp')[0].textContent = `${Math.round(temp.v)}°`) }, S.weather + 0.3);
    tl.from(q('.wx .kv'), { autoAlpha: 0, x: 24, duration: 0.5, stagger: 0.1 }, S.weather + 0.5);
    tl.from(q('.days > div'), { autoAlpha: 0, y: 30, duration: 0.5, stagger: BEAT / 2 }, S.weather + 1.0);
    OUTLOOK.forEach((d, i) => tl.to(q('.days .rain')[i], { scaleY: d[4] / 100, duration: 0.8 }, S.weather + 1.4 + i * (BEAT / 2)));
    tl.fromTo(q('.alert2'), { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power4.out' }, bar(20.5));

    /* ---------------- 8 · news & sport ---------------- */
    wipe('.s8', S.news, 'up');
    copyIn('.s8', S.news);
    tl.fromTo(q('.brk'), { xPercent: -100 }, { xPercent: 0, duration: 0.6, ease: 'power4.out' }, S.news + 0.2);
    tl.from(q('.thread2 .it'), { autoAlpha: 0, x: 20, duration: 0.5, stagger: BEAT * 2 }, S.news + 0.7);
    q('.thread2 .it').forEach((el, i) => tl.call(() => el.classList.add('on'), null, S.news + 0.9 + i * BEAT * 2));
    tl.from(q('.score'), { autoAlpha: 0, y: 30, duration: 0.6, stagger: BEAT * 2 }, bar(23));

    /* ---------------- 9 · presenters ---------------- */
    wipe('.s9', S.team, 'left');
    copyIn('.s9', S.team);
    tl.from(q('.team .p'), { autoAlpha: 0, scale: 1.08, duration: 0.6, stagger: BEAT / 2 }, S.team + 0.2);
    // the ON AIR light hands from presenter to presenter, two beats each
    q('.team .p').forEach((p, i) => {
      const at = S.team + 2.2 + i * BEAT * 2;
      tl.to(p.querySelector('.c'), { opacity: 1, duration: 0.25 }, at);
      tl.to(p.querySelector('.tag'), { opacity: 1, duration: 0.15 }, at);
      if (i < 5) {
        tl.to(p.querySelector('.c'), { opacity: 0, duration: 0.25 }, at + BEAT * 2);
        tl.to(p.querySelector('.tag'), { opacity: 0, duration: 0.15 }, at + BEAT * 2);
      }
    });

    /* ---------------- 10 · voices ---------------- */
    wipe('.s10', S.voice, 'up');
    copyIn('.s10', S.voice);
    tl.to(lv, { wave: 1, duration: 0.6 }, S.voice + 0.6);
    tl.from(q('.comm > div > *'), { autoAlpha: 0, y: 20, duration: 0.5, stagger: 0.08 }, S.voice + 0.2);
    TRACKS.slice(0, 4).forEach((t, i) => tl.fromTo(q('.voter .bar i')[i], { width: '0%' }, { width: `${t[2] * 4.5}%`, duration: 1.2, ease: 'power2.out' }, S.voice + 0.9 + i * 0.15));
    tl.to(q('.voter .yours')[1], { opacity: 1, duration: 0.2 }, bar(30));
    tl.to(q('.voter .bar i')[1], { width: `${(14 + 6) * 4.5}%`, backgroundColor: '#ff5b1f', duration: 0.8 }, bar(30));
    tl.to(lv, { wave: 0, duration: 0.4 }, S.brands);

    /* ---------------- 11 · brands ---------------- */
    wipe('.s11', S.brands, 'left');
    copyIn('.s11', S.brands);
    tl.from(q('.pres'), { autoAlpha: 0, duration: 0.5 }, S.brands + 0.2);
    tl.from(q('.bgrid > div'), { autoAlpha: 0, y: 18, duration: 0.45, stagger: BEAT / 2 }, S.brands + 0.4);
    tl.fromTo(q('.marq .tr'), { x: 0 }, { x: -1500, duration: S.tuner - S.brands, ease: 'none' }, S.brands);

    /* ---------------- 12 · tuner ---------------- */
    wipe('.s12', S.tuner, 'up');
    tl.to(q('.s12 .title .li'), { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power4.out' }, S.tuner);
    tl.from(q('.dial .scale, .dial .base, .dial .st'), { autoAlpha: 0, y: 20, duration: 0.5, stagger: 0.08 }, S.tuner + 0.3);
    const stops = [12.5, 37.5, 62.5, 87.5];
    stops.forEach((x, i) => {
      const at = S.tuner + 0.9 + i * BEAT * 2;
      tl.to(q('.dial .needle'), { left: `${x}%`, duration: 0.5, ease: 'back.out(1.6)' }, at);
      tl.call(() => q('.dial .st').forEach((s, k) => s.classList.toggle('on', k === i)), null, at + 0.25);
    });

    /* ---------------- 13 · end card ---------------- */
    wipe('.s13', S.end, 'down');
    tl.set(q('.logo-stage'), { zIndex: 40 }, S.end);
    tl.set(pose, { y: 1.05, x: 0, ry: -2.2, rx: 0.06, s: 0 }, S.end);
    tl.to(pose, { s: 0.62, ry: -0.75, duration: 1.4, ease: 'expo.out' }, S.end + 0.1);
    tl.to(pose, { ry: -0.05, duration: END - S.end - 1.5, ease: 'sine.out' }, S.end + 1.5); // keeps turning the same way and settles facing camera
    tl.to(q('.s13 .li'), { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, S.end + 0.6);
    tl.from(q('.s13 .line, .s13 .url'), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.3 }, bar(37));
    tl.to(q('.fade'), { opacity: 1, duration: 1.0, ease: 'none' }, END - 1.0);
    tl.to({}, { duration: 0.01 }, END);

    window.__tl = tl;
    window.__play = () => {
      tl.play(0);
    };
    if (!window.__capture) document.fonts.ready.then(() => setTimeout(() => tl.play(0), 400));
    return () => tl.kill();
  }, []);

  const flapText = i => (flap === 0 ? '' : BOARD[i][2][flap - 1]);
  const mv = i => BOARD[i][3][Math.max(0, flap - 1)];

  return (
    <div ref={root} style={{ position: 'absolute', inset: 0 }}>
      <div className="layer topo">
        {topo && <Topography dpr={0.6} color="#f4ebd6" lineCount={22} lineWidth={1.1} glow={0} speed={0.18} tilt={40} fog={0.5} elevation={1.2} foreground={0.15} depthOfField={0.2} opacity={0.9} mouseInteraction={false} clickEffect="none" intro={false} />}
      </div>

      {/* 1 · cold open */}
      <div className="layer stmt s1">
        <span className="tally">
          <i /> ON AIR
        </span>
        <span className="mono freq">&nbsp;</span>
        <div>
          <Lines className="display big" lines={['Farmers work', 'sunrise to sunset.']} />
        </div>
        <span className="mono note" style={{ fontSize: 22, color: 'var(--cream-2)', letterSpacing: '0.06em', textTransform: 'none' }}>
          &nbsp;
        </span>
      </div>
      <div className="vu layer" style={{ inset: 'auto 160px 150px 160px' }} ref={vu}>
        {Array.from({ length: 64 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      {/* 2 · the gap */}
      <div className="layer stmt s2">
        <span className="tally-ghost" />
        <span className="freq-ghost" />
        <div>
          <Lines className="display big" lines={['No station', 'is made', <span key="s" className="sig">for them.</span>]} />
        </div>
      </div>

      {/* 3 · logo (canvas lives in LogoStage) */}
      <div className="layer tagline s3">
        <Lines className="display" lines={['Radio for the people', 'who work the land.']} />
        <span className="mono">&nbsp;</span>
      </div>

      {/* 4 · scattered → together */}
      <div className="scene night s4">
        <div className="head">
          <Lines className="display" lines={['Prices. Weather. News.', 'Scattered everywhere.']} />
        </div>
        <div className="chips">
          {CHIPS.map(c => (
            <span key={c[0]} className="chip" style={{ left: c[1], top: c[2] }}>
              {c[0]}
            </span>
          ))}
        </div>
        <div className="head2">
          <Lines className="display" lines={['One station', <span key="b" className="sig">brings it together.</span>]} />
        </div>
      </div>

      {/* 5 · studio */}
      <Feat id="s5" tone="night" eyebrow="On air · 88.2 FM" lines={['Live', 'all day.']} sub="Presenters who know the land, on air from sunrise to sunset, switching to the story the moment it breaks.">
        <div className="studio">
          <div className="main">
            <div className="row">
              <span className="tally">
                <i /> ON AIR
              </span>
              <span className="mono chan" style={{ fontSize: 16, color: 'var(--cream-2)' }}>
                16:17 · Markets &amp; prices
              </span>
            </div>
            <h3 className="display">Live reaction: beef prices respond</h3>
            <div className="deck">
              <div className="play">{PLAY}</div>
              <div className="mid">
                <Bars n={44} className="vu2" />
                <div className="bar">
                  <i />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="lower">
              <div className="host">
                <div className="h h-a">
                  <img src={PRESENTERS.JvM.img} alt="" />
                  <div className="t">
                    <span className="k" style={{ color: 'var(--signal)' }}>On the mic</span>
                    <span className="n">Johnny</span>
                  </div>
                </div>
                <div className="h h-b" style={{ opacity: 0 }}>
                  <img src={PRESENTERS.CH.img} alt="" />
                  <div className="t">
                    <span className="k" style={{ color: 'var(--signal)' }}>On the mic</span>
                    <span className="n">Christie</span>
                  </div>
                </div>
              </div>
              <div className="next" style={{ position: 'relative' }}>
                <div className="next-a" style={{ position: 'absolute', inset: '18px 22px' }}>
                  <span className="k">Up next · 16:20</span>
                  <b style={{ display: 'block', marginTop: 8 }}>Stakeholder interview: RPO responds</b>
                </div>
                <div className="next-b" style={{ position: 'absolute', inset: '18px 22px', opacity: 0 }}>
                  <span className="k">Up next · 16:23</span>
                  <b style={{ display: 'block', marginTop: 8 }}>Near you: how local auction marts are affected</b>
                </div>
              </div>
            </div>
            <div className="hour">
              {HOUR.map((h, i) => (
                <span key={i} className={i === 8 ? 'now' : i === 9 ? 'now2' : ''} style={{ flex: `${h[2]} 0 0` }}>
                  {h[0]}
                  <br />
                  {h[1]}
                </span>
              ))}
              <i className="head" />
            </div>
          </div>
        </div>
      </Feat>

      {/* 6 · markets */}
      <Feat id="s6" tone="paper" eyebrow="The desk · Market board" lines={['Markets,', 'live.']} sub="SAFEX grain, A2 livestock and farm-gate milk, read on air and shown on screen as they move.">
        <div className="board2 panel-night">
          <h3>
            Market board <span className="live">■ LIVE</span>
          </h3>
          {BOARD.map((b, i) => (
            <div className="brow2" key={b[0]}>
              <span className="nm">
                {i === 0 && <span className="dot" />}
                {b[0]}
                <small>{b[1]}</small>
              </span>
              <SplitFlapText text={flapText(i)} padTo={8} align="right" loop={false} intro charset="0123456789" flipsPerChar={5} flipDuration={0.07} stagger={0.04} tileColor="#23271f" textColor="#f4ebd6" tileRadius={2} gap={3} depth={0.35} fontSize={40} />
              <span className={`mv ${mv(i).startsWith('▼') ? 'down' : 'up'}`}>{flap ? mv(i) : ''}</span>
            </div>
          ))}
          <div className="why">
            <b>WHY BEEF IS DOWN</b> Export tariff announced at 16:16. Reaction live from auction marts.
          </div>
        </div>
      </Feat>

      {/* 7 · weather */}
      <Feat id="s7" tone="night" eyebrow="The desk · Weather" lines={['Weather', 'for the', 'work.']} sub="Spray windows, frost risk and storm alerts for their own area, not just the weekend.">
        <div className="wx">
          <div className="now">
            <span className="temp">9°</span>
            <div>
              <div className="kv">
                <span>Chance of rain</span>
                <b>17%</b>
              </div>
              <div className="kv">
                <span>Wind</span>
                <b>13 km/h</b>
              </div>
              <div className="kv">
                <span>Spray window tomorrow</span>
                <b>05:00–09:00</b>
              </div>
              <div className="kv">
                <span>Field access</span>
                <b style={{ color: 'var(--up)' }}>Good</b>
              </div>
            </div>
          </div>
          <div className="days">
            {OUTLOOK.map(d => (
              <div key={d[0]}>
                <span className="rain" />
                <span className="k">{d[0]}</span>
                <b>{d[2]}°</b>
                <span className="s">{d[1]}</span>
                <span className="k" style={{ fontSize: 13 }}>
                  Rain {d[4]}%
                </span>
              </div>
            ))}
          </div>
          <div className="alert2">
            <b>⚠ ALERT</b> Wind alert tonight: secure loose material and check stock water.
          </div>
        </div>
      </Feat>

      {/* 8 · news & sport */}
      <Feat id="s8" tone="paper" eyebrow="The desk · Agri wire & sport" lines={['News that', 'moves the', 'market.']} sub="Breaking agri stories followed as they develop, plus the scores they actually care about.">
        <div className="news">
          <div className="brk">
            <span className="tg">BREAKING</span> Export tariff announcement hits beef trade
          </div>
          <div className="cols">
            <div>
              <span className="k">The tariff story · live thread</span>
              <div className="thread2">
                {[
                  ['16:16 · Breaking', 'Export tariff hits beef trade', 'Developing story'],
                  ['16:30 · Update 1', 'Government statement: AGBIZ', 'What the government said'],
                  ['16:48 · Update 2', 'Beef market closes lower', 'Closing prices']
                ].map(t => (
                  <div className="it" key={t[0]}>
                    <span className="dot" />
                    <div>
                      <span className="k">{t[0]}</span>
                      <b>{t[1]}</b>
                      <span className="s">{t[2]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="k">Sport</span>
              <div className="score">
                <span className="k">Rugby · 9 Nov</span>
                <div className="v">Boks 45–0 Italy</div>
                <div className="s">Nine tries. Next up: France, Friday.</div>
              </div>
              <div className="score">
                <span className="k">Cricket · from 15 Nov</span>
                <div className="v">Proteas v Bangladesh</div>
                <div className="s">First Test at the Wanderers.</div>
              </div>
            </div>
          </div>
        </div>
      </Feat>

      {/* 9 · presenters */}
      <Feat id="s9" tone="night" eyebrow="The on-air team" lines={['Voices', 'they trust.']} sub="Six presenters across markets, weather, policy, community and the field, live whenever it matters.">
        <div className="team">
          {PRESENTER_ORDER.map(id => (
            <div className="p" key={id}>
              <img src={PRESENTERS[id].img} alt="" />
              <img className="c" src={PRESENTERS[id].img} alt="" />
              <span className="tag">● ON AIR</span>
              <div className="lab">
                <div className="n">{PRESENTERS[id].name}</div>
                <div className="r">{PRESENTERS[id].role}</div>
              </div>
            </div>
          ))}
        </div>
      </Feat>

      {/* 10 · voices */}
      <Feat id="s10" tone="paper" eyebrow="Community" lines={['Their voices', 'on air.']} sub="Voice notes and farm photos from the app, and a vote on the next song we play.">
        <div className="comm">
          <div>
            <span className="k">Voice note · from the app</span>
            <span className="display">Wat sê jy alles?</span>
            <div ref={wave} className="wave2">
              {Array.from({ length: 34 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <span className="k">Hanno · sheep farmer · Karoo</span>
            <span style={{ fontFamily: 'Archivo', fontSize: 22 }}>“Wie’s bang vir skaapkop? Not me, made potjie last night.”</span>
          </div>
          <div>
            <span className="k">Song vote · you pick the next song</span>
            {TRACKS.slice(0, 4).map(t => (
              <div className="voter" key={t[0]}>
                <img src={t[3]} alt="" />
                <div>
                  <b>{t[0]}</b>
                  <div className="ar">{t[1]}</div>
                  <div className="row2">
                    <div className="bar">
                      <i />
                    </div>
                    <span className="pc">{t[2]}%</span>
                  </div>
                </div>
                <span className="yours">YOUR VOTE</span>
              </div>
            ))}
          </div>
        </div>
      </Feat>

      {/* 11 · brands */}
      <Feat id="s11" tone="night" eyebrow="The business" lines={['Built for', 'brands that', 'farm.']} sub="One presenting partner at a time, and brand series that live on air, in the feed and on demand.">
        <div className="brands">
          <div className="pres">
            <span className="k">Presented by</span>
            <span className="w">TOYOTA</span>
          </div>
          <div className="bgrid">
            {BRANDS.map(b => (
              <div key={b[0]}>
                <span className="bn">{b[0]}</span>
                <span className="sh">{b[1]}</span>
              </div>
            ))}
          </div>
          <div className="marq" style={{ borderTop: '1px solid var(--night-3)' }}>
            <div className="tr">
              {[...WORDMARKS, ...WORDMARKS].map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </Feat>

      {/* 12 · tuner */}
      <div className="scene paper s12">
        <div className="title">
          <Lines className="display" lines={['On air. Online.', <span key="o" className="sig">On demand.</span>]} />
        </div>
        <div className="dial">
          {['App', 'Online', 'Dash', 'Socials'].map((s, i) => (
            <div className="st" key={s} style={{ left: `${12.5 + i * 25}%` }}>
              <b>{s}</b>
              <span>{['88.2', '91.6', '97.4', '105.3'][i]} FM</span>
            </div>
          ))}
          <div className="scale" />
          <div className="base" />
          <div className="needle" style={{ left: '2%' }} />
        </div>
      </div>

      {/* 13 · end card */}
      <div className="scene night s13">
        <div className="end" style={{ clipPath: 'none', position: 'absolute', inset: 0 }}>
          <div style={{ height: 300 }} />
          <div>
            <Lines className="display" lines={['Join us on air.']} />
          </div>
          <span className="mono line">Radio for the people who work the land · South Africa</span>
          <span className="url">farmradio.co.za · Investor preview 2026</span>
        </div>
      </div>

      <LogoStage />

      <div className="chrome" style={{ zIndex: 45 }}>
        <span className="c tl">FARM RADIO</span>
        <span className="c tr">
          <span className="rec" />
          INVESTOR PREVIEW · 2026
        </span>
        <span className="c bl">88.2 FM · SOUTH AFRICA</span>
        <span className="c br" ref={tc}>
          00:00:00:00
        </span>
        <span className="prog" ref={prog} />
      </div>
      <div className="fade" />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Film />);
