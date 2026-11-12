import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import '@fontsource/cinzel/700.css';

// Vesyron studio ident, played once per app launch (tap to skip). Follows the brand storyboard:
// 1 full gold wordmark → 2 E·Y·R·O·N dissolve to sparks → 3 V and S glide to centre
// → 4 they lock into the VS monogram → 5 "VISION | STRENGTH" → 6 back to the full wordmark.
const T = 6.2; // seconds for the whole sequence
const at = (s: number) => s / T; // keyframe time helper

const GOLD = ['#fff7d6', '#f8cf6a', '#d98e1c', '#8a4b07', '#f6c453'];
const LETTERS: { ch: string; x: number; keep?: boolean }[] = [
  { ch: 'V', x: 112, keep: true },
  { ch: 'E', x: 246 },
  { ch: 'S', x: 372, keep: true },
  { ch: 'Y', x: 500 },
  { ch: 'R', x: 628 },
  { ch: 'O', x: 764 },
  { ch: 'N', x: 900 },
];
const BASE_Y = 250;
// Where V and S sit inside the monogram
const MONO = { V: 455, S: 532, scale: 1.35 };

/** Ribbon "S" from the Vesyron mark, drawn about its centre (≈150 tall). */
function RibbonS() {
  return (
    <g transform="translate(-48 -96)">
      <path
        d="M86 6 C54 -6 12 8 18 42 C22 64 58 70 70 88 C56 74 28 66 24 42 C20 18 52 4 86 6 Z"
        fill="url(#vyGoldSoft)"
      />
      <path
        d="M70 88 C92 112 76 150 30 154 C16 155 4 150 -4 140 C30 146 56 128 54 106 C52 94 40 84 28 74 C50 76 64 80 70 88 Z"
        fill="url(#vyGoldSoft)"
      />
      <path
        d="M96 14 C70 4 40 14 40 38 C40 52 62 60 76 72 C62 64 46 56 44 40 C42 22 66 10 96 14 Z"
        fill="url(#vyGoldSoft)"
        opacity="0.85"
      />
    </g>
  );
}

/** Gold sparks: letters dissolving, then streaks rushing into the centre. */
function Sparks({ start }: { start: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.scale(dpr, dpr);
    // the SVG (viewBox 1000×420) is centred and fits the width
    const k = Math.min(w / 1000, h / 420);
    const ox = (w - 1000 * k) / 2;
    const oy = (h - 420 * k) / 2;
    const toX = (x: number) => ox + x * k;
    const toY = (y: number) => oy + y * k;

    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; born: number };
    const ps: P[] = [];
    let raf = 0;
    let spawnedDissolve = false;
    let spawnedStreak = false;

    const loop = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      if (!spawnedDissolve && t > 1.05) {
        spawnedDissolve = true;
        for (const L of LETTERS.filter((l) => !l.keep)) {
          for (let i = 0; i < 46; i++) {
            ps.push({
              x: toX(L.x + (Math.random() - 0.5) * 90),
              y: toY(BASE_Y - Math.random() * 120),
              vx: (Math.random() - 0.3) * 40 * k * 2,
              vy: (-Math.random() * 50 - 10) * k * 2,
              life: 0, max: 0.9 + Math.random() * 0.9, r: 0.8 + Math.random() * 1.8, born: t,
            });
          }
        }
      }
      if (!spawnedStreak && t > 1.9) {
        spawnedStreak = true;
        for (let i = 0; i < 90; i++) {
          const side = i % 2 ? 1 : -1;
          const y = toY(190 + (Math.random() - 0.5) * 140);
          ps.push({
            x: side > 0 ? w + Math.random() * 40 : -Math.random() * 40,
            y, vx: -side * (280 + Math.random() * 260) * k * 2, vy: (toY(200) - y) * 1.4,
            life: 0, max: 0.55 + Math.random() * 0.35, r: 0.8 + Math.random() * 1.4, born: t,
          });
        }
      }
      for (const p of ps) {
        const age = t - p.born;
        if (age < 0 || age > p.max) continue;
        const dt = 1 / 60;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 6 * dt;
        const a = 1 - age / p.max;
        ctx.globalAlpha = a;
        ctx.fillStyle = Math.random() > 0.8 ? '#fff7d6' : '#f8b84a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t < 3.2) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [start]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export function VesyronIntro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) return false; // automated tests
    try { return sessionStorage.getItem('vy_intro') !== '1'; } catch { return true; }
  });
  const [start] = useState(() => performance.now());

  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('vy_intro', '1'); } catch { /* ignore */ }
    const t = setTimeout(() => setShow(false), (reduce ? 2.2 : T) * 1000);
    return () => clearTimeout(t);
  }, [show, reduce]);

  const ease = 'easeInOut' as const;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="vesyron-intro"
          className="fixed inset-0 z-[500] bg-black select-none overflow-hidden"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          onPointerDown={() => setShow(false)}
          role="presentation"
        >
          {/* warm haze and reflective floor */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 35% at 50% 50%, rgba(217,142,28,0.18), rgba(0,0,0,0) 70%)' }} />
          <div className="absolute inset-x-0 top-1/2 h-1/2" style={{ background: 'linear-gradient(180deg, rgba(248,184,74,0.10), rgba(0,0,0,0) 40%)' }} />

          {!reduce && <Sparks start={start} />}

          <svg viewBox="0 0 1000 420" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="vyGold" x1="0" y1="0" x2="0" y2="1">
                {GOLD.map((c, i) => <stop key={i} offset={i / (GOLD.length - 1)} stopColor={c} />)}
              </linearGradient>
              <linearGradient id="vyGoldSoft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff7d6" />
                <stop offset="1" stopColor="#d98e1c" />
              </linearGradient>
              <filter id="vyGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="vyFlare">
                <stop offset="0" stopColor="#fff7d6" stopOpacity="1" />
                <stop offset="0.25" stopColor="#f8b84a" stopOpacity="0.6" />
                <stop offset="1" stopColor="#f8b84a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* horizon light line */}
            <motion.line
              x1="40" x2="960" y1={BASE_Y + 14} y2={BASE_Y + 14} stroke="#f8b84a" strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.7, 0.7, 0.35, 0.7] }}
              transition={{ duration: T, times: [0, at(0.5), at(2.5), at(3.2), at(5)], ease }}
            />

            {/* monogram rings (phase 4–5) */}
            {[70, 120, 165].map((r, i) => (
              <motion.circle
                key={r} cx="500" cy="190" r={r} fill="none" stroke="#f8b84a" strokeWidth={i === 1 ? 1.4 : 0.8}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0, 0.7, 0.5, 0], scale: [0.4, 0.4, 1, 1.05, 1.2] }}
                transition={{ duration: T, times: [0, at(2.55 + i * 0.08), at(3.0 + i * 0.08), at(4.4), at(5.0)], ease }}
              />
            ))}

            {/* letters */}
            <g filter="url(#vyGlow)">
              {LETTERS.map((L, i) => {
                if (L.ch === 'S' || L.ch === 'V') {
                  const tx = L.ch === 'V' ? MONO.V : MONO.S;
                  const dx = tx - L.x;
                  return (
                    <motion.g
                      key={L.ch}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
                      animate={{
                        opacity: [0, 1, 1, 1, 1, 1],
                        x: [0, 0, 0, dx, dx, 0],
                        y: [0, 0, 0, -50, -50, 0],
                        scale: [1, 1, 1, MONO.scale, MONO.scale, 1],
                      }}
                      transition={{ duration: T, times: [0, at(0.6), at(1.8), at(2.6), at(4.5), at(5.3)], ease }}
                    >
                      {L.ch === 'V' ? (
                        <text x={L.x} y={BASE_Y} textAnchor="middle" fontFamily="Cinzel, serif" fontWeight={700} fontSize="168" fill="url(#vyGold)">V</text>
                      ) : (
                        <g transform={`translate(${L.x} ${BASE_Y - 50}) scale(0.82)`}><RibbonS /></g>
                      )}
                    </motion.g>
                  );
                }
                return (
                  <motion.text
                    key={L.ch}
                    x={L.x} y={BASE_Y} textAnchor="middle" fontFamily="Cinzel, serif" fontWeight={700} fontSize="132"
                    fill="url(#vyGold)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0, 0, 1] }}
                    transition={{ duration: T, times: [0, at(0.5 + i * 0.04), at(1.05), at(1.6), at(4.6), at(5.3)], ease }}
                  >
                    {L.ch}
                  </motion.text>
                );
              })}
            </g>

            {/* lens flares */}
            {[{ x: 112, y: 90, t: 0.6 }, { x: 500, y: 190, t: 3.0 }, { x: 900, y: 120, t: 5.3 }].map((f, i) => (
              <motion.g key={i} initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 0] }}
                transition={{ duration: T, times: [0, at(f.t - 0.15), at(f.t), at(f.t + 0.6)] }}>
                <circle cx={f.x} cy={f.y} r="46" fill="url(#vyFlare)" />
                <rect x={f.x - 180} y={f.y - 1} width="360" height="2" fill="#fff7d6" opacity="0.7" />
                <rect x={f.x - 1} y={f.y - 60} width="2" height="120" fill="#fff7d6" opacity="0.5" />
              </motion.g>
            ))}

            {/* tagline (phase 5) */}
            <motion.g initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: T, times: [0, at(3.2), at(3.6), at(4.5), at(4.9)] }}>
              <text x="378" y="372" textAnchor="end" fontFamily="Cinzel, serif" fontWeight={700} fontSize="40" letterSpacing="6" fill="url(#vyGold)">VISION</text>
              <text x="622" y="372" textAnchor="start" fontFamily="Cinzel, serif" fontWeight={700} fontSize="40" letterSpacing="6" fill="url(#vyGold)">STRENGTH</text>
              <line x1="500" y1="310" x2="486" y2="392" stroke="#f8cf6a" strokeWidth="3" />
              <line x1="120" y1="360" x2="250" y2="360" stroke="#f8b84a" strokeWidth="1.2" opacity="0.7" />
              <line x1="880" y1="360" x2="750" y2="360" stroke="#f8b84a" strokeWidth="1.2" opacity="0.7" />
            </motion.g>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
