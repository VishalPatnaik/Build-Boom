import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import logoUrl from '../assets/vesyron-logo.webp';
import maskUrl from '../assets/vesyron-logo-mask.webp';

// Vesyron studio ident: the official logo, brought to life. Plays once per app launch; tap to skip.
// Timeline (s): 0 black → 0.2–1.4 logo focuses in → 1.4 flares ignite on V and S
// → 1.7–2.6 light sweeps across the gold → embers drift up → 4.2 fade into the game.
const T = 4.2;
const STUDIO_END = 3.5;   // studio ident hands over to the game title here
const TOTAL = 5.0;        // whole sequence, then the menu

// Flare positions as fractions of the logo image (1536×1024)
const FLARES = [
  { x: 0.153, y: 0.312, delay: 1.35, size: 1 },   // tip of the V
  { x: 0.456, y: 0.288, delay: 1.5, size: 1.1 },  // top of the S
  { x: 0.447, y: 0.628, delay: 1.65, size: 0.8 }, // tail of the S
];

function Flare({ x, y, delay, size }: { x: number; y: number; delay: number; size: number; key?: React.Key }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: 0, height: 0 }}
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: [0, 1, 0.75, 0.9], scale: [0.2, 1.25 * size, 0.95 * size, 1 * size] }}
      transition={{ delay, duration: 1.4, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
    >
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,247,214,1) 0%, rgba(248,184,74,0.65) 30%, rgba(248,184,74,0) 70%)' }} />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,240,200,0.95), transparent)' }} />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[2px] h-14"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(255,240,200,0.85), transparent)' }} />
    </motion.div>
  );
}

/** Warm embers drifting up from the gold once it's lit. */
function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.scale(dpr, dpr);
    const ps = Array.from({ length: 70 }, () => ({
      x: w * (0.12 + Math.random() * 0.76),
      y: h * (0.5 + Math.random() * 0.12),
      vx: (Math.random() - 0.5) * 12,
      vy: -(10 + Math.random() * 28),
      r: 0.6 + Math.random() * 1.6,
      born: 1.6 + Math.random() * 1.6,
      max: 1.2 + Math.random() * 1.4,
    }));
    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        const age = t - p.born;
        if (age < 0 || age > p.max) continue;
        ctx.globalAlpha = Math.sin((age / p.max) * Math.PI) * 0.9;
        ctx.fillStyle = '#ffc861';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x + p.vx * age, p.y + p.vy * age, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (t < T) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export function VesyronIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) return false; // automated tests
    try { return sessionStorage.getItem('vy_intro') !== '1'; } catch { return true; }
  });

  // Studio ident → TOWER//SHIFT title card → menu. Tap anywhere skips the rest.
  const [phase, setPhase] = useState<'studio' | 'title'>('studio');
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('vy_intro', '1'); } catch { /* ignore */ }
    const toTitle = setTimeout(() => setPhase('title'), (reduce ? 1.6 : STUDIO_END) * 1000);
    const end = setTimeout(() => setShow(false), (reduce ? 2.8 : TOTAL) * 1000);
    return () => { clearTimeout(toTitle); clearTimeout(end); };
  }, [show, reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="vesyron-intro"
          className="fixed inset-0 z-[500] bg-black select-none overflow-hidden flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          onPointerDown={() => setShow(false)}
          role="presentation"
          aria-label="Vesyron"
        >
          <AnimatePresence>
          {phase === 'studio' && (
          <motion.div key="studio" className="absolute inset-0 flex items-center justify-center" exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4 } }}>
          {/* logo box keeps the image's 3:2 shape so flares line up with the letters */}
          <motion.div
            className="relative w-[min(100vw,150vh)] aspect-[3/2]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12, filter: 'blur(10px) brightness(0.4)' }}
            animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 1], scale: [1.12, 1, 1.03], filter: ['blur(10px) brightness(0.4)', 'blur(0px) brightness(1)', 'blur(0px) brightness(1)'] }}
            transition={reduce ? { duration: 0.6 } : { duration: T, times: [0, 0.32, 1], ease: 'easeOut' }}
          >
            <img src={logoUrl} alt="Vesyron" draggable={false} className="absolute inset-0 w-full h-full object-contain" />

            {!reduce && (
              <>
                {/* light sweep, masked to the lettering so the black background stays black */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ WebkitMaskImage: `url(${maskUrl})`, maskImage: `url(${maskUrl})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
                >
                  <motion.div
                    className="absolute top-0 h-full w-[28%] -skew-x-[18deg]"
                    style={{ background: 'linear-gradient(90deg, rgba(255,200,120,0), rgba(255,244,214,0.95), rgba(255,200,120,0))' }}
                    initial={{ left: '-35%' }}
                    animate={{ left: '120%' }}
                    transition={{ delay: 1.7, duration: 0.9, ease: 'easeInOut' }}
                  />
                </div>
                {/* gentle glow breathing on the gold */}
                <motion.img
                  src={logoUrl} alt="" aria-hidden draggable={false}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ mixBlendMode: 'screen', filter: 'blur(14px) saturate(1.4)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0, 0.55, 0.3, 0.45] }}
                  transition={{ duration: T, times: [0, 0.3, 0.45, 0.7, 1] }}
                />
                {FLARES.map((f, i) => <Flare key={i} {...f} />)}
              </>
            )}
          </motion.div>

          {!reduce && <Embers />}
          </motion.div>
          )}
          {phase === 'title' && (
            <motion.div
              key="title"
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'radial-gradient(120% 70% at 50% 40%, #263B55 0%, #17243D 60%, #0E1729 100%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="font-display text-[44px] leading-none tracking-tight text-[var(--ivory)]"
                style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800 }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, letterSpacing: '0.12em' }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, letterSpacing: '-0.01em' }}
                transition={{ duration: 0.55, ease: [0.22, 0.8, 0.24, 1] }}
              >
                TOWER<span style={{ color: 'var(--gold)' }}>//</span>SHIFT
              </motion.div>
              <motion.div
                className="mt-3 h-px w-40"
                style={{ background: 'linear-gradient(90deg, transparent, #E8BE70, transparent)' }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25, duration: 0.45 }}
              />
              <motion.div className="mt-3 text-[11px] font-bold tracking-[0.3em] text-[var(--stone)]"
                initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.4, duration: 0.4 }}>
                BUILD · BALANCE · DEFLECT · ASCEND
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
