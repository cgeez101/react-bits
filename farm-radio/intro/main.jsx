/* FARM RADIO · 15-second investor intro.
   One GSAP timeline drives five scenes:
   0–3 s   ON AIR: the problem, part 1
   3–5 s   the problem, part 2, over a contour map of farmland (React Bits Topography)
   5–9 s   the 3D FARM RADIO logo (three.js, extruded from the real logo)
   9–12.5  what's on air: a split-flap market board (React Bits SplitFlapText), weather, news, sport
   12.5–15 end card: the logo again and the ask
   The page plays in real time in a browser, and render.cjs steps it frame by frame into an MP4. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Topography from '@bits/Backgrounds/Topography/Topography.jsx';
import SplitFlapText from '@bits/TextAnimations/SplitFlapText/SplitFlapText.jsx';
import { buildLogo } from '../src/sections/Logo3D.jsx';
import './intro.css';

gsap.registerPlugin(ScrambleTextPlugin);

const PRICES = [
  ['Beef', 'A2 grade', 'R60.00', '▼ −4.50', 'down'],
  ['Wheat', 'SAFEX', 'R5 467', '▲ +17', 'up'],
  ['Milk', 'Farm gate', 'R7.22', '▲ +0.02', 'up'],
  ['Yellow maize', 'SAFEX', 'R4 123', '▲ +3', 'up'],
  ['Lamb', 'A2 grade', 'R118.28', '▲ +0.28', 'up']
];
const STRIP = ['Live interviews', 'Farmer voices', 'Weather alerts', 'Song vote', 'On demand', 'Brand series', 'Live chat'];

/* ---------- the 3D logo, posed by the timeline ---------- */
const pose = { s: 0, ry: -Math.PI * 1.5, rx: 0.15, y: 0, x: 0 };
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
    let blank = false;
    const draw = () => {
      // skip WebGL work entirely while the logo is off screen
      if (pose.s < 0.001) {
        if (!blank) renderer.clear();
        blank = true;
        return;
      }
      blank = false;
      pivot.scale.setScalar(Math.max(0.0001, pose.s));
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

/* ---------- VU meter, a pure function of timeline time so every frame is repeatable ---------- */
const BARS = 64;
function setVU(el, t, level) {
  [...el.children].forEach((b, i) => {
    const v = level * (0.25 + 0.7 * Math.abs(Math.sin(t * 7.3 + i * 0.61) * Math.cos(t * 3.1 + i * 0.23)));
    b.style.transform = `scaleY(${Math.max(0.04, v).toFixed(3)})`;
    b.classList.toggle('hot', v > 0.8);
  });
}

const Lines = ({ lines, className = 'display big' }) =>
  lines.map((l, i) => (
    <div className="ln" key={i}>
      <div className={`${className} li`}>{l}</div>
    </div>
  ));

function Intro() {
  const root = useRef(null);
  const vu = useRef(null);
  const tc = useRef(null);
  const [flaps, setFlaps] = useState(false);
  const [topo, setTopo] = useState(false);

  useLayoutEffect(() => {
    const q = gsap.utils.selector(root);
    const vuLevel = { v: 0 };
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    gsap.set(q('.li'), { yPercent: 110 });
    gsap.set(q('.tally, .freq, .tagline .mono, .side .cell, .end .line, .end .url'), { autoAlpha: 0 });

    /* frame chrome + timecode */
    tl.from(q('.chrome'), { autoAlpha: 0, duration: 0.5 }, 0);
    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      const s = Math.floor(t);
      const f = Math.floor((t - s) * 30);
      tc.current.textContent = `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
      setVU(vu.current, t, vuLevel.v);
    });

    /* A · 0–3 s: ON AIR */
    tl.fromTo(q('.tally'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 0.3);
    tl.to(vuLevel, { v: 1, duration: 0.8 }, 0.4);
    tl.set(q('.freq'), { autoAlpha: 1 }, 0.6);
    tl.to(q('.freq'), { duration: 1.1, scrambleText: { text: '88.2 FM · South Africa · On air all day', chars: '0123456789ABCDEF·', speed: 0.6 }, ease: 'none' }, 0.6);
    tl.to(q('.sA .li'), { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power4.out' }, 1.15);

    /* B · 3–5 s: the gap, over farmland contours */
    tl.to(q('.sA .li'), { yPercent: -110, duration: 0.45, stagger: 0.05, ease: 'power3.in' }, 2.95);
    tl.call(() => setTopo(true), null, 2.7); // mount the contour map only while it can be seen
    tl.to(q('.topo'), { opacity: 0.7, duration: 1.4, ease: 'none' }, 3.0);
    tl.to(q('.sB .li'), { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'power4.out' }, 3.35);
    tl.to(q('.sB .li'), { yPercent: -110, duration: 0.45, stagger: 0.05, ease: 'power3.in' }, 4.9);
    tl.to(q('.tally, .freq'), { autoAlpha: 0, duration: 0.3 }, 4.9);
    tl.to(vuLevel, { v: 0, duration: 0.4 }, 4.9);

    /* C · 5–9 s: the logo */
    tl.to(pose, { s: 1, ry: 0.35, rx: 0.08, duration: 1.7, ease: 'expo.out' }, 5.2);
    tl.to(pose, { ry: 1.25, duration: 2.6, ease: 'none' }, 6.9);
    tl.to(pose, { y: 0.55, duration: 0.9, ease: 'power2.inOut' }, 6.2);
    tl.to(q('.tagline .li'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, 6.5);
    tl.to(q('.tagline .mono'), { autoAlpha: 1, duration: 0.5 }, 7.2);
    tl.to(q('.tagline .mono'), { duration: 0.9, scrambleText: { text: 'Markets · Weather · Agri news · Sport · Live interviews', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.8 }, ease: 'none' }, 7.2);

    /* D · 9–12.5 s: what's on air */
    tl.to(q('.desk'), { clipPath: 'inset(0% 0 0 0)', duration: 0.75, ease: 'power4.inOut' }, 9.0);
    tl.set(pose, { s: 0 }, 9.75);
    tl.set(q('.tagline'), { autoAlpha: 0 }, 9.75);
    tl.call(() => setTopo(false), null, 9.8);
    tl.to(q('.desk-top .li'), { yPercent: 0, duration: 0.7, stagger: 0.08, ease: 'power4.out' }, 9.45);
    tl.call(() => setFlaps(true), null, 9.6);
    tl.to(q('.side .cell'), { autoAlpha: 1, x: 0, duration: 0.55, stagger: 0.28 }, 9.8);
    tl.fromTo(q('.strip-track'), { x: 0 }, { x: -900, duration: 3.6, ease: 'none' }, 9.2);

    /* E · 12.5–15 s: end card */
    tl.to(q('.end'), { clipPath: 'inset(0 0 0% 0)', duration: 0.75, ease: 'power4.inOut' }, 12.45);
    tl.set(q('.logo-stage'), { zIndex: 11 }, 12.9);
    tl.set(pose, { y: 1.05, x: 0, ry: -1.4, rx: 0.06 }, 12.9);
    tl.to(pose, { s: 0.62, ry: 0.2, duration: 1.2, ease: 'expo.out' }, 12.9);
    tl.to(pose, { ry: 0.55, duration: 0.9, ease: 'none' }, 14.1);
    tl.to(q('.end .li'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, 13.25);
    tl.to(q('.end .line'), { autoAlpha: 1, y: 0, duration: 0.6 }, 13.75);
    tl.to(q('.end .url'), { autoAlpha: 1, duration: 0.5 }, 14.05);
    tl.to({}, { duration: 0.01 }, 15);

    gsap.set(q('.side .cell'), { x: 40 });
    gsap.set(q('.end .line'), { y: 12 });

    window.__tl = tl;
    window.__play = () => { tl.play(0); };
    if (!window.__capture) document.fonts.ready.then(() => setTimeout(() => tl.play(0), 400));
    return () => tl.kill();
  }, []);

  return (
    <div ref={root} style={{ position: 'absolute', inset: 0 }}>
      <div className="layer topo">
        {topo && <Topography dpr={0.6} color="#f4ebd6" lineCount={22} lineWidth={1.1} glow={0} speed={0.18} tilt={40} fog={0.5} elevation={1.2} foreground={0.15} depthOfField={0.2} opacity={0.9} mouseInteraction={false} clickEffect="none" intro={false} />}
      </div>

      <div className="layer stmt sA">
        <span className="tally">
          <i /> ON AIR
        </span>
        <span className="mono freq">&nbsp;</span>
        <div>
          <Lines lines={['Farmers work', 'sunrise to sunset.']} />
        </div>
      </div>
      <div className="layer stmt sB" style={{ paddingTop: 136 }}>
        <div>
          <Lines lines={['Yet no station', <span key="s">is <span className="sig">made for them.</span></span>]} />
        </div>
      </div>
      <div className="vu layer" style={{ inset: 'auto 160px 150px 160px' }} ref={vu}>
        {Array.from({ length: BARS }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      <LogoStage />
      <div className="layer tagline">
        <Lines className="display" lines={['Radio for the people', 'who work the land.']} />
        <span className="mono">&nbsp;</span>
      </div>

      <div className="layer desk">
        <div className="desk-top">
          <div>
            <Lines className="display" lines={['One station.', 'All day.']} />
          </div>
          <span className="mono">Live on air · online · on demand</span>
        </div>
        <div className="desk-grid">
          <div className="board">
            <h3>
              Market board <span className="live">■ LIVE</span>
            </h3>
            {PRICES.map(p => (
              <div className="brow" key={p[0]}>
                <span className="nm">
                  {p[0].toUpperCase()}
                  <small>{p[1].toUpperCase()}</small>
                </span>
                <SplitFlapText
                  text={flaps ? p[2] : ''}
                  padTo={8}
                  align="right"
                  loop={false}
                  intro
                  charset="0123456789"
                  flipsPerChar={5}
                  flipDuration={0.07}
                  stagger={0.04}
                  tileColor="#23271f"
                  textColor="#f4ebd6"
                  tileRadius={2}
                  gap={3}
                  depth={0.35}
                  fontSize={38}
                />
                <span className={`mv ${p[4]}`}>{p[3]}</span>
              </div>
            ))}
          </div>
          <div className="side">
            <div className="cell">
              <span className="k">Weather · your area</span>
              <span className="v">23° · clear</span>
              <span className="s">Spray window tomorrow 05:00–09:00</span>
            </div>
            <div className="cell">
              <span className="k hot">Breaking · agri wire</span>
              <span className="v">Export tariff hits beef</span>
              <span className="s">Reaction live from auction marts</span>
            </div>
            <div className="cell">
              <span className="k">Sport</span>
              <span className="v">Boks 45–0 Italy</span>
              <span className="s">Next up: France, Friday</span>
            </div>
          </div>
        </div>
        <div className="strip">
          <div className="strip-track">
            {[...STRIP, ...STRIP].map((s, i) => (
              <span key={i}>
                <b>■</b>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="layer end">
        <div style={{ height: 300 }} />
        <div>
          <Lines className="display" lines={['Join us on air.']} />
        </div>
        <span className="mono line">Radio for the people who work the land · South Africa</span>
        <span className="url">farmradio.co.za</span>
      </div>

      <div className="chrome">
        <span className="c tl">FARM RADIO</span>
        <span className="c tr">
          <span className="rec" />
          INVESTOR PREVIEW · 2026
        </span>
        <span className="c bl">88.2 FM · SOUTH AFRICA</span>
        <span className="c br" ref={tc}>
          00:00:00:00
        </span>
      </div>
    </div>
  );
}

// no StrictMode: its double-mounted effects would run the timeline's from() tweens twice
createRoot(document.getElementById('root')).render(<Intro />);
