/* Renders intro/ to an MP4, frame by frame.
   Every clock the page uses (requestAnimationFrame, performance.now, Date.now) is replaced
   by a virtual clock that advances exactly 1/30 s per frame, so GSAP, the React Bits
   components and three.js all land on the same frame every time, however slow the machine.
   Usage: node intro/render.cjs dist-intro/index.html out-dir */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [, , file, outDir, fpsArg, secArg] = process.argv;
const FPS = +(fpsArg || 30);
const SECONDS = +(secArg || 15);

const clock = () => {
  let now = 0;
  let id = 0;
  const cbs = new Map();
  const d0 = Date.now();
  Object.defineProperty(performance, 'now', { value: () => now });
  Date.now = () => d0 + now;
  window.requestAnimationFrame = cb => (cbs.set(++id, cb), id);
  window.cancelAnimationFrame = i => cbs.delete(i);
  window.__capture = true;
  window.__advance = ms => {
    now += ms;
    const run = [...cbs.entries()];
    cbs.clear();
    for (const [, cb] of run) {
      try { cb(now); } catch (e) { console.error(e); }
    }
  };
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.addInitScript(clock);
  await page.goto('file://' + path.resolve(file));
  await page.waitForTimeout(1500); // let React mount and fonts settle (real time, before the virtual clock starts)
  await page.evaluate(() => document.fonts.ready.then(() => true));
  console.log('loaded');
  // warm up: let React mount and WebGL compile before time starts
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.__advance(1000 / 30));
    console.log('warm', i);
  }
  await page.evaluate(() => { window.__play(); });
  console.log('playing');
  const total = Math.round(FPS * SECONDS);
  const only = process.env.FRAMES ? +process.env.FRAMES : total;
  for (let f = 0; f < Math.min(total, only); f++) {
    const t0 = Date.now();
    await page.evaluate(ms => window.__advance(ms), 1000 / FPS);
    await page.evaluate(() => new Promise(r => setTimeout(r, 0))); // let React commit any state change
    if (f < +(process.env.START || 0)) continue; // re-render only the tail: time still advances, nothing is written
    await page.screenshot({ path: path.join(outDir, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 });
    if (f % 30 === 0 || process.env.FRAMES) console.log(`frame ${f}/${total} ${Date.now() - t0}ms`);
  }
  await browser.close();
})();
