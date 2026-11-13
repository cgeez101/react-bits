/* The FARM RADIO logo as a solid 3D badge: cream face, deep signal-orange sides.
   It turns slowly on its own; drag (mouse or finger) to spin it, and it tilts toward the pointer. */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import logoSvg from '../assets/logo.svg?raw';
import { Logo } from '../ui';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildLogo(mini) {
  const data = new SVGLoader().parse(logoSvg);
  const shapes = data.paths.flatMap(p => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 320,
    bevelEnabled: true,
    bevelThickness: 36,
    bevelSize: 18,
    bevelSegments: 4,
    curveSegments: 8
  });
  geo.center();
  geo.computeVertexNormals();
  // header badge sits on paper, so it gets an ink face; the big one sits in the dark studio, so cream
  const face = mini
    ? new THREE.MeshStandardMaterial({ color: '#1b1d17', roughness: 0.5, metalness: 0.1 })
    : new THREE.MeshStandardMaterial({ color: '#fbf3e0', emissive: '#4a3418', emissiveIntensity: 0.35, roughness: 0.38, metalness: 0.05 });
  const side = new THREE.MeshStandardMaterial({ color: '#ff5b1f', roughness: 0.32, metalness: 0.25 });
  const mesh = new THREE.Mesh(geo, [face, side]);
  const s = 1 / 3600; // viewBox width → 1 unit
  mesh.scale.set(s * 4, -s * 4, s * 4); // flip SVG's downward y axis
  return mesh;
}

export default function Logo3D({ variant = 'hero' }) {
  const mini = variant === 'mini';
  const wrap = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    scene.add(new THREE.HemisphereLight('#fff6e6', '#2a1a10', 1.1));
    const key = new THREE.DirectionalLight('#ffffff', 2.6);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ff7a3d', 2.2);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    const fill = new THREE.PointLight('#f4ebd6', 18, 20);
    fill.position.set(-3, 2, 4);
    scene.add(fill);

    const pivot = new THREE.Group();
    const logo = buildLogo(mini);
    pivot.add(logo);
    scene.add(pivot);

    /* --- motion state --- */
    const still = reducedMotion();
    // a slow, steady turn: about 20 s per spin for the big logo, 14 s for the header badge
    const AUTO = still ? 0 : mini ? 0.0075 : 0.0052; // radians per frame
    let rotY = mini ? 0 : -0.5;
    let velY = AUTO;
    let tiltX = 0;
    let tiltTarget = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let intro = still ? 1 : 0;

    const canvas = renderer.domElement;
    const onDown = e => {
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      canvas.setPointerCapture?.(e.pointerId);
      el.classList.add('grabbing');
    };
    const onMove = e => {
      const r = el.getBoundingClientRect();
      tiltTarget = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const d = dx * 0.012;
      rotY += d;
      velY = d / Math.max(1, (now - lastT) / 16.7);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = e => {
      dragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
      el.classList.remove('grabbing');
    };
    const onLeave = () => (tiltTarget = 0);
    if (!mini) {
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', onLeave);
    }

    /* --- sizing --- */
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the whole badge in frame whatever the box shape
      const fitW = 4.9 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      const fitH = 3.3 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.position.z = Math.max(fitW, fitH);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    /* --- render only while on screen --- */
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(el);

    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      if (!dragging) {
        velY += (AUTO - velY) * 0.025; // inertia settles back to the idle spin
        rotY += velY;
      }
      tiltX += (tiltTarget - tiltX) * 0.08;
      intro = Math.min(1, intro + 0.018);
      const e = 1 - Math.pow(1 - intro, 3);
      pivot.rotation.set(tiltX + (1 - e) * 0.6, rotY - (1 - e) * 2.2, 0);
      pivot.scale.setScalar(0.6 + 0.4 * e);
      pivot.position.y = Math.sin(performance.now() / 1400) * (still || mini ? 0 : 0.05);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      logo.geometry.dispose();
      logo.material.forEach(m => m.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  if (mini)
    return (
      <div className="logo3d logo3d--mini" ref={wrap} aria-hidden="true">
        {failed && <Logo className="logo3d-flat" />}
      </div>
    );
  return (
    <div className="logo3d" ref={wrap} role="img" aria-label="FARM RADIO logo in 3D. Drag to spin it.">
      {failed && <Logo className="logo3d-flat" />}
      {!failed && (
        <span className="logo3d-hint mono" aria-hidden="true">
          ↔ Drag to spin
        </span>
      )}
    </div>
  );
}
