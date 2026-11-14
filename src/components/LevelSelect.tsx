import { atlasVignette } from '../game/backdrop/midground';
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../game/store';
import { ArrowLeft, Lock, GraduationCap } from 'lucide-react';
import { CampaignQuickStartModal } from './campaign/CampaignQuickStartModal';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { screenFadeSlideVariants } from '../utils/screenTransitions';
import { COLLECTIONS } from '../game/collections';
import { THEME_PALETTES, renderBlock } from '../game/themeRenderer';
import { levelTwist, LevelTwist } from '../game/LevelGenerator';

// ---------------------------------------------------------------------------------------
// SHIFT ODYSSEY map: one world at a time. Each world is a climb of 10 levels from its island
// sign at the bottom to a sky gate at the top. The gate stays padlocked until the world's
// last level is beaten; then it bursts open with fanfare and you fly up to the next world.
// Levels you've already finished with 3 stars are done for good (no replaying them).
// ---------------------------------------------------------------------------------------

const TOTAL_LEVELS = 200;
const LEVELS_PER_WORLD = 10;
const WORLDS = TOTAL_LEVELS / LEVELS_PER_WORLD;
const NODE_GAP = 96; // vertical distance between levels
const HEADER_H = 128; // fixed header overlay
const GATE_H = 250; // sky gate at the top of the world
const SIGN_H = 270; // island sign at the bottom of the world
const PAGE_H = HEADER_H + GATE_H + LEVELS_PER_WORLD * NODE_GAP + SIGN_H;
const SEEN_KEY = 'ts_seen_world';

function AtlasVignette({ world, width, height, tint, top, faint }: { world: number; width: number; height: number; tint: string; top: number; faint?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(width * dpr); c.height = Math.round(height * dpr);
    const v = atlasVignette(world, width * dpr, height * dpr, tint);
    if (v) ctx.drawImage(v, 0, 0);
  }, [world, width, height, tint]);
  return <canvas ref={ref} aria-hidden="true" className="absolute left-0 pointer-events-none" style={{ top, width, height, opacity: faint ? 0.45 : 0.95 }} />;
}

// Expedition-atlas palette (Shift Odyssey map)
const ATLAS = { paper: '#E9DDC5', paperDeep: '#DCCBAA', forest: '#456D57', ocean: '#4C7F9B', route: '#D5A653', ink: '#283746', ivory: '#F5F0E6', stone: '#CDBC9C' };
/** Each world is a region of the atlas: land (forest) or sea (ocean) tint. */
const REGION_TINT = (w: number) => (w % 3 === 1 ? ATLAS.ocean : ATLAS.forest);

/** Little scenery that floats beside each world (pure emoji, so it costs nothing to draw). */
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

const TWIST_BADGE: Partial<Record<LevelTwist, { icon: string; label: string }>> = {
  gusty: { icon: '💨', label: 'Gusty' },
  heavy: { icon: '🏋️', label: 'Heavy load' },
  tricksters: { icon: '🎭', label: 'Tricksters' },
  calm: { icon: '☁️', label: 'Calm skies' },
  'ghost-night': { icon: '👻', label: 'Ghost night' },
  'bomb-rush': { icon: '💣', label: 'Bomb rush' },
};

/** Vertical position of the k-th level (0-9) of a world page; the first level is lowest. */
const levelY = (k: number) => PAGE_H - SIGN_H - NODE_GAP * 0.5 - k * NODE_GAP;
/** Sideways position, % of the width: a playful zig-zag that stays clear of the edges. */
const levelX = (lvl: number) => 50 + Math.sin(lvl * 0.95) * 27;

/** Draws a world's critter once into a small canvas (the CSS animates it). */
function Critter({ world, size, live = false, className = '' }: { world: number; size: number; live?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      try {
        renderBlock(ctx, size * 0.12, size * 0.12, size * 0.76, size * 0.76, `skin-${world}`, true, t);
      } catch {
        /* art for this world unavailable: leave it blank */
      }
      if (live) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [world, size, live]);
  return <canvas ref={ref} style={{ width: size, height: size }} className={className} aria-hidden="true" />;
}

const MAP_CSS = `
@keyframes odys-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
@keyframes odys-spin3d { 0% { transform: translateY(0) rotateY(0deg) } 50% { transform: translateY(-12px) rotateY(180deg) } 100% { transform: translateY(0) rotateY(360deg) } }
@keyframes odys-hop { 0%,100% { transform: translateY(0) scale(1.08,0.92) } 45% { transform: translateY(-26px) scale(0.94,1.06) } 70% { transform: translateY(-18px) scale(1,1) } }
@keyframes odys-ring { 0% { transform: translate(-50%,-50%) rotateX(68deg) scale(0.6); opacity: .9 } 100% { transform: translate(-50%,-50%) rotateX(68deg) scale(1.9); opacity: 0 } }
@keyframes odys-trail { to { stroke-dashoffset: -44 } }
@keyframes odys-sway { 0%,100% { transform: perspective(700px) rotateX(14deg) rotateZ(-1.2deg) } 50% { transform: perspective(700px) rotateX(10deg) rotateZ(1.2deg) } }
@keyframes odys-cloud { 0% { transform: translateX(-8%) } 100% { transform: translateX(8%) } }
@keyframes odys-crown { 0%,100% { transform: translate(-50%, 0) rotate(-8deg) } 50% { transform: translate(-50%, -6px) rotate(8deg) } }
@keyframes odys-shake { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-14deg) } 40% { transform: rotate(12deg) } 60% { transform: rotate(-9deg) } 80% { transform: rotate(6deg) } }
@keyframes odys-glow { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.08) } }
.odys-bob { animation: odys-bob 3.6s ease-in-out infinite }
.odys-spin3d { animation: odys-spin3d 7s ease-in-out infinite; transform-style: preserve-3d }
.odys-hop { animation: odys-hop 1.1s cubic-bezier(.3,.7,.4,1) infinite; transform-origin: 50% 100% }
.odys-sway { animation: odys-sway 6s ease-in-out infinite; transform-origin: 50% 100% }
.odys-trail-live { animation: odys-trail 1.4s linear infinite }
.odys-cloud { animation: odys-cloud 14s ease-in-out infinite alternate }
.odys-crown { animation: odys-crown 2.4s ease-in-out infinite }
.odys-shake { animation: odys-shake 0.5s ease-in-out infinite }
.odys-glow { animation: odys-glow 1.4s ease-in-out infinite }
.atlas-chip { background: #F5F0E6; border: 1px solid rgba(40,55,70,0.28); box-shadow: 0 2px 0 rgba(40,55,70,0.18), 0 6px 12px rgba(40,55,70,0.12); }
.atlas-eyebrow { font-family: Manrope, sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #456D57; }
.atlas-cartouche { background: linear-gradient(170deg, #F5F0E6, #E4D6BA); border: 1.5px solid rgba(40,55,70,0.45); box-shadow: inset 0 0 0 4px #F5F0E6, inset 0 0 0 5px #D5A653, 0 10px 22px rgba(40,55,70,0.22); color: #283746; }
.odys-node { transition: transform 110ms ease, box-shadow 110ms ease, filter 160ms ease }
.odys-node:active:not(:disabled) { transform: translateY(7px) }
@media (prefers-reduced-motion: reduce) {
  .odys-bob, .odys-spin3d, .odys-hop, .odys-sway, .odys-trail-live, .odys-cloud, .odys-crown, .odys-shake, .odys-glow { animation: none !important }
}
`;

type UnlockPhase = null | 'celebrate' | 'burst' | 'arrive';

const readSeenWorld = (): number | null => {
  try {
    const v = localStorage.getItem(SEEN_KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
};
const writeSeenWorld = (w: number) => {
  try {
    localStorage.setItem(SEEN_KEY, String(w));
  } catch {
    /* storage unavailable: the unlock may replay next time, which is harmless */
  }
};

export function LevelSelect() {
  const { setMode, setLevel, unlockedLevels, setState, hasCompletedCampaignTutorial, startCampaignTutorial } = useGameStore();
  const highScores = useGameStore((st) => st.highScores);
  // Best star result per level (saved alongside high scores as "stars-<level>")
  const levelStars = useMemo(() => {
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(highScores || {})) if (k.startsWith('stars-')) out[Number(k.slice(6))] = v as number;
    return out;
  }, [highScores]);
  const totalStars = useMemo(() => Object.values(levelStars).reduce((a: number, b: number) => a + b, 0), [levelStars]);

  const reached = Math.min(TOTAL_LEVELS, Math.max(1, unlockedLevels));
  const maxWorld = Math.floor((reached - 1) / LEVELS_PER_WORLD);

  // Was a new world just unlocked since the map was last seen? Then play the unlock show.
  const [unlock, setUnlock] = useState<{ phase: UnlockPhase; to: number }>(() => {
    const seen = readSeenWorld();
    if (seen === null || seen >= maxWorld) {
      writeSeenWorld(maxWorld);
      return { phase: null, to: maxWorld };
    }
    return { phase: 'celebrate', to: maxWorld };
  });
  const [view, setView] = useState(() => (unlock.phase ? Math.max(0, maxWorld - 1) : maxWorld));
  const [direction, setDirection] = useState(1); // 1 = flying up, -1 = going back down

  const pal = THEME_PALETTES[view] || THEME_PALETTES[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [showQuickStartModal, setShowQuickStartModal] = useState(!hasCompletedCampaignTutorial);
  const [launchingLevel, setLaunchingLevel] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 400));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth || 400);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The unlock show: celebrate the finished world, burst the padlock, fly up to the new one
  useEffect(() => {
    if (!unlock.phase) return;
    let t: ReturnType<typeof setTimeout>;
    if (unlock.phase === 'celebrate') {
      audio.playCheer();
      haptics.vibrate([20, 40, 20]);
      t = setTimeout(() => setUnlock((u) => ({ ...u, phase: 'burst' })), 1700);
    } else if (unlock.phase === 'burst') {
      audio.playWorldUnlock();
      haptics.vibrate([60, 30, 120]);
      try {
        const col = THEME_PALETTES[unlock.to] || THEME_PALETTES[0];
        confetti({ particleCount: 90, spread: 100, startVelocity: 38, origin: { x: 0.5, y: 0.28 }, colors: [col.primary, col.accent, '#fde047', '#ffffff'], disableForReducedMotion: true });
      } catch {
        /* confetti is decoration only */
      }
      t = setTimeout(() => {
        setDirection(1);
        setView(unlock.to);
        setUnlock((u) => ({ ...u, phase: 'arrive' }));
      }, 1100);
    } else if (unlock.phase === 'arrive') {
      writeSeenWorld(unlock.to);
      t = setTimeout(() => setUnlock((u) => ({ ...u, phase: null })), 2600);
    }
    return () => clearTimeout(t);
  }, [unlock.phase, unlock.to]);

  // Scroll a page to the level you'd play next (or to the gate while unlocking)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      if (unlock.phase === 'celebrate' || unlock.phase === 'burst') {
        el.scrollTop = 0;
        return;
      }
      const first = view * LEVELS_PER_WORLD + 1;
      const k = view === maxWorld ? reached - first : direction > 0 ? 0 : LEVELS_PER_WORLD - 1;
      el.scrollTop = Math.max(0, levelY(Math.max(0, Math.min(9, k))) - el.clientHeight * 0.55);
    });
    return () => cancelAnimationFrame(id);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast((t) => (t === text ? '' : t)), 1800);
  };

  const handleLaunchLevel = (lvl: number) => {
    if (launchingLevel !== null || unlock.phase) return;
    if (lvl < reached && (levelStars[lvl] || 0) >= 3) {
      audio.playClickSound();
      showToast('Already perfect! ★★★ Nothing left to win here 🏆');
      return;
    }
    setLaunchingLevel(lvl);
    audio.playClickSound();
    haptics.vibrate(20);
    useGameStore.getState().triggerAssetTransition('Loading Zone Shaders & Atmosphere...', 400);
    setTimeout(() => {
      if (lvl === 1 && !hasCompletedCampaignTutorial) {
        startCampaignTutorial();
      } else {
        setLevel(lvl);
        setState('playing');
      }
    }, 420);
  };

  const goWorld = (w: number) => {
    if (w < 0 || w > maxWorld || w === view || unlock.phase) return;
    audio.playClickSound();
    haptics.vibrate(15);
    setDirection(w > view ? 1 : -1);
    setView(w);
  };

  // Clouds drift slower than the map for a sense of depth
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    const p = parallaxRef.current;
    if (!el || !p) return;
    p.style.transform = `translate3d(0, ${-(el.scrollTop * 0.35) % 900}px, 0)`;
  }, []);

  const first = view * LEVELS_PER_WORLD + 1;
  const last = first + LEVELS_PER_WORLD - 1;
  const col = COLLECTIONS[view] || COLLECTIONS[0];
  const next = COLLECTIONS[view + 1];
  const nextPal = THEME_PALETTES[view + 1] || pal;
  const worldStars = Array.from({ length: LEVELS_PER_WORLD }, (_, k) => levelStars[first + k] || 0).reduce((a, b) => a + b, 0);
  const gateOpen = view < maxWorld && unlock.phase !== 'celebrate';
  const gateBursting = unlock.phase === 'burst' && view === unlock.to - 1;
  const showComplete = (unlock.phase === 'celebrate' || unlock.phase === 'burst') && view === unlock.to - 1;
  const arriving = unlock.phase === 'arrive' && view === unlock.to;

  // The trail through this world's levels
  const trail = useMemo(() => {
    const pts = Array.from({ length: LEVELS_PER_WORLD }, (_, k) => ({ x: (levelX(first + k) / 100) * width, y: levelY(k) }));
    const toPath = (list: { x: number; y: number }[]) =>
      list.reduce((d, p, i) => {
        if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        const prev = list[i - 1];
        const my = (prev.y + p.y) / 2;
        return `${d} C ${prev.x.toFixed(1)} ${my.toFixed(1)}, ${p.x.toFixed(1)} ${my.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }, '');
    const doneCount = Math.max(1, Math.min(LEVELS_PER_WORLD, reached - first + 1));
    // up to the gate when the world is finished
    const toGate = view < maxWorld ? [...pts, { x: width / 2, y: HEADER_H + GATE_H - 40 }] : pts;
    return { all: toPath(view < maxWorld ? toGate : pts), done: reached >= first ? toPath(view < maxWorld ? toGate : pts.slice(0, doneCount)) : '' };
  }, [width, reached, first, view, maxWorld]);

  return (
    <motion.div
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col w-full h-full relative z-10 overflow-hidden"
      style={{ background: ATLAS.paper, color: ATLAS.ink }}
    >
      <style>{MAP_CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top,16px))] pb-6 absolute top-0 left-0 w-full z-40 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${ATLAS.paper} 0%, ${ATLAS.paper}ee 62%, ${ATLAS.paper}00)` }}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setMode('menu')}
          className="p-2.5 rounded-full pointer-events-auto cursor-pointer shrink-0 atlas-chip"
          style={{ color: ATLAS.ink }}
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="flex flex-col items-center min-w-0">
          <span className="atlas-eyebrow">Region {view + 1} of {WORLDS}</span>
          <h2 className="font-display text-[26px] sm:text-3xl leading-none whitespace-nowrap" style={{ color: ATLAS.ink, letterSpacing: '0.02em' }}>
            Shift Odyssey
          </h2>
          <span className="mt-1 num text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ color: ATLAS.ink, background: `${ATLAS.route}38`, border: `1px solid ${ATLAS.route}` }}>
            ★ {totalStars} / {TOTAL_LEVELS * 3}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickStartModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs pointer-events-auto cursor-pointer shrink-0 atlas-chip"
          style={{ color: ATLAS.ink }}
          aria-label="Quick-start guide"
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Guide</span>
        </motion.button>
      </div>

      {/* Far clouds, moved by the scroll handler for parallax depth */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div ref={parallaxRef} className="absolute inset-x-0 -top-[900px] h-[2700px] will-change-transform">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-[50%]"
              style={{ top: i * 300 + (i % 2) * 90, left: `${((i * 37) % 80) - 10}%`, width: 260 + (i % 3) * 80, height: 120 + (i % 2) * 50, border: `1px solid ${ATLAS.ink}14`, boxShadow: `0 0 0 14px ${ATLAS.paper}00, 0 0 0 15px ${ATLAS.ink}0f, 0 0 0 30px ${ATLAS.paper}00, 0 0 0 31px ${ATLAS.ink}0a` }}
            />
          ))}
        </div>
      </div>

      {/* One world at a time; flying between worlds is a 3D swoop */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overflow-x-hidden touch-pan-y relative w-full z-20" style={{ scrollbarWidth: 'none', perspective: 1200 }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={`world-${view}`}
            custom={direction}
            variants={{
              enter: (d: number) => ({ y: d > 0 ? -420 : 420, rotateX: d > 0 ? -35 : 35, opacity: 0, scale: 0.9 }),
              center: { y: 0, rotateX: 0, opacity: 1, scale: 1 },
              exit: (d: number) => ({ y: d > 0 ? 420 : -420, rotateX: d > 0 ? 35 : -35, opacity: 0, scale: 0.9 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full"
            style={{
              height: PAGE_H,
              transformOrigin: '50% 50%',
              background: `radial-gradient(120% 60% at 50% 55%, color-mix(in srgb, ${REGION_TINT(view)} 16%, ${ATLAS.paper}) 0%, color-mix(in srgb, ${REGION_TINT(view)} 9%, ${ATLAS.paper}) 55%, ${ATLAS.paper} 100%)`,
            }}
          >
            {/* Atlas relief: contour lines, a coastline wash and a compass rose */}
            <svg className="absolute inset-0 pointer-events-none" width={width} height={PAGE_H} aria-hidden="true">
              <defs>
                <pattern id="atlas-grain" width="6" height="6" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.6" fill={ATLAS.ink} opacity="0.05" />
                </pattern>
              </defs>
              <rect width={width} height={PAGE_H} fill="url(#atlas-grain)" />
              {[0, 1, 2, 3].map((r) => (
                <g key={`relief-${r}`} fill="none" stroke={REGION_TINT(view)} strokeOpacity={0.22 - r * 0.035} strokeWidth={1.2}>
                  {[0, 1, 2].map((ring) => (
                    <ellipse
                      key={ring}
                      cx={width * (r % 2 ? 0.86 : 0.12)}
                      cy={HEADER_H + GATE_H + 120 + r * ((LEVELS_PER_WORLD * NODE_GAP) / 4)}
                      rx={70 + ring * 26}
                      ry={44 + ring * 18}
                      transform={`rotate(${r % 2 ? -14 : 12} ${width * (r % 2 ? 0.86 : 0.12)} ${HEADER_H + GATE_H + 120 + r * ((LEVELS_PER_WORLD * NODE_GAP) / 4)})`}
                    />
                  ))}
                </g>
              ))}
              <rect x={0} y={0} width={width} height={PAGE_H} fill="none" stroke={ATLAS.ink} strokeOpacity={0.25} strokeWidth={10} />
              <rect x={9} y={0} width={width - 18} height={PAGE_H} fill="none" stroke={ATLAS.route} strokeOpacity={0.55} strokeWidth={1} />
              <g transform={`translate(${width - 46} ${PAGE_H - SIGN_H - 40})`} opacity={0.55}>
                <circle r={22} fill="none" stroke={ATLAS.ink} strokeWidth={1} />
                <circle r={16} fill="none" stroke={ATLAS.route} strokeWidth={1} />
                <path d="M0 -28 L4 0 L0 28 L-4 0 Z" fill={ATLAS.ink} />
                <path d="M-28 0 L0 -3 L28 0 L0 3 Z" fill={ATLAS.route} />
                <text y={-31} textAnchor="middle" fontSize={9} fontWeight={700} fill={ATLAS.ink} fontFamily="Sora, sans-serif">N</text>
              </g>
            </svg>

            {/* Landmarks of this region: the world's own scenery, inked onto the map.
                The next world's skyline shows faintly at the gate, so regions blend into each other. */}
            {view + 1 < WORLDS && (
              <AtlasVignette world={view + 1} width={width} height={170} tint={REGION_TINT(view + 1)} top={HEADER_H + 18} faint />
            )}
            <AtlasVignette world={view} width={width} height={210} tint={REGION_TINT(view)} top={PAGE_H - SIGN_H - 150} />

            {/* Trail */}
            <svg className="absolute top-0 left-0 pointer-events-none z-10" width={width} height={PAGE_H} aria-hidden="true">
              <path d={trail.all} fill="none" stroke={ATLAS.ink} strokeOpacity={0.45} strokeWidth={2.2} strokeDasharray="1 9" strokeLinecap="round" />
              {trail.done && <path d={trail.done} fill="none" stroke={ATLAS.ink} strokeOpacity={0.18} strokeWidth={9} strokeLinecap="round" />}
              {trail.done && <path d={trail.done} fill="none" stroke={ATLAS.route} strokeWidth={5} strokeLinecap="round" />}
              {trail.done && <path d={trail.done} className="odys-trail-live" fill="none" stroke={ATLAS.ivory} strokeOpacity={0.85} strokeWidth={1.4} strokeDasharray="6 10" strokeLinecap="round" />}
            </svg>

            {/* Sky gate at the top: padlocked until this world's last level is beaten */}
            <div className="absolute inset-x-0 flex justify-center z-30" style={{ top: HEADER_H + 12 }}>
              {view === WORLDS - 1 ? (
                <div className="text-center px-6 py-4 rounded-[18px] atlas-cartouche w-[min(320px,86vw)]">
                  <div className="text-3xl">☁️🏰☁️</div>
                  <div className="mt-1 font-display text-lg" style={{ color: ATLAS.ink }}>More worlds coming</div>
                  <div className="text-xs font-semibold" style={{ color: `${ATLAS.ink}b0` }}>The sky's not the limit. Keep stacking!</div>
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => (gateOpen ? goWorld(view + 1) : showToast(`Beat level ${last} to open the gate! 🔒`))}
                  whileTap={{ scale: 0.95 }}
                  animate={gateBursting ? { scale: [1, 1.12, 1], rotateX: [0, -18, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  className={`relative w-[min(320px,86vw)] rounded-[18px] px-4 pt-4 pb-3 text-center cursor-pointer ${gateOpen ? 'odys-glow' : ''}`}
                  style={{
                    transformPerspective: 800,
                    background: gateOpen ? `linear-gradient(170deg, #F0D79C, ${ATLAS.route} 70%)` : `linear-gradient(170deg, ${ATLAS.ivory}, ${ATLAS.paperDeep})`,
                    border: `1.5px solid ${gateOpen ? '#9C7434' : `${ATLAS.ink}55`}`,
                    boxShadow: `inset 0 0 0 4px ${gateOpen ? '#F7E5BA' : ATLAS.ivory}, inset 0 0 0 5px ${gateOpen ? '#9C7434' : `${ATLAS.ink}30`}, 0 10px 22px rgba(40,55,70,0.25)`,
                    color: ATLAS.ink,
                  }}
                  aria-label={gateOpen ? `Fly up to world ${view + 2}` : `World ${view + 2} is locked`}
                >
                  {/* Padlock: shakes while you celebrate, then bursts apart */}
                  <AnimatePresence>
                    {(!gateOpen || showComplete) && (
                      <motion.div
                        key="lock"
                        exit={{ scale: 2.4, rotate: 40, y: -60, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute -top-7 left-1/2 -ml-7 w-14 h-14 rounded-full border-2 flex items-center justify-center ${showComplete ? 'odys-shake' : ''}`}
                        style={{ background: ATLAS.ink, borderColor: showComplete ? ATLAS.route : '#8A99AA' }}
                      >
                        <Lock className="w-6 h-6" style={{ color: showComplete ? ATLAS.route : ATLAS.ivory }} strokeWidth={2.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {gateOpen && !showComplete && next && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 odys-bob">
                      <Critter world={view + 1} size={64} />
                    </div>
                  )}
                  <div className="mt-6 atlas-eyebrow">
                    {gateOpen ? `World ${view + 2} is open` : `World ${view + 2} · uncharted`}
                  </div>
                  <div className="font-display text-lg leading-tight" style={{ color: ATLAS.ink }}>
                    {gateOpen ? next?.name : '? ? ?'}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold" style={{ color: `${ATLAS.ink}c0` }}>
                    {gateOpen ? 'Tap to fly up ▲' : `Beat level ${last} to unlock`}
                  </div>
                </motion.button>
              )}
            </div>

            {/* "World complete" celebration while the next world unlocks */}
            <AnimatePresence>
              {showComplete && (
                <motion.div
                  key="complete"
                  initial={{ scale: 0.3, opacity: 0, rotateZ: -12 }}
                  animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 12 }}
                  className="absolute inset-x-0 z-40 flex justify-center pointer-events-none"
                  style={{ top: HEADER_H + GATE_H + 10 }}
                >
                  <div className="px-5 py-3 rounded-[18px] text-center btn-gold">
                    <div className="font-display text-2xl">🎉 World complete! 🎉</div>
                    <div className="text-xs font-bold">{col.name} conquered · ★ {worldStars}/30</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level blocks */}
            {Array.from({ length: LEVELS_PER_WORLD }, (_, k) => {
              const lvl = first + k;
              const isUnlocked = lvl <= reached;
              const isCurrent = lvl === reached;
              const isBoss = lvl % 10 === 0;
              const stars = levelStars[lvl] || 0;
              const isPerfect = lvl < reached && stars >= 3;
              const twist = TWIST_BADGE[levelTwist(lvl)];
              const size = isCurrent ? 74 : isBoss ? 70 : 60;
              const face = !isUnlocked
                ? `radial-gradient(circle at 35% 30%, #E4D7BD, ${ATLAS.stone})`
                : isCurrent
                  ? 'radial-gradient(circle at 35% 28%, #FBE7B4, #E8BE70 55%, #B88943)'
                  : isBoss
                    ? `radial-gradient(circle at 35% 28%, #3A4D66, ${ATLAS.ink})`
                    : `radial-gradient(circle at 35% 28%, #FFFFFF, ${ATLAS.ivory} 60%, #E6DCC8)`;
              const ring = !isUnlocked ? `${ATLAS.ink}40` : isBoss || isPerfect || isCurrent ? ATLAS.route : REGION_TINT(view);
              const numColor = isBoss && isUnlocked && !isCurrent ? ATLAS.ivory : ATLAS.ink;
              const launching = launchingLevel === lvl;

              return (
                <div
                  key={`lvl-${lvl}`}
                  id={`level-node-${lvl}`}
                  className="absolute"
                  style={{ top: levelY(k), left: `${levelX(lvl)}%`, transform: 'translate(-50%, -50%)', zIndex: isCurrent ? 35 : 25 }}
                >
                  <motion.div
                    initial={{ opacity: 0, rotateX: -80, scale: 0.6 }}
                    animate={launching ? { opacity: 1, rotateX: 0, rotateY: 360, scale: 1.18 } : { opacity: 1, rotateX: 0, scale: 1 }}
                    transition={launching ? { duration: 0.42 } : { type: 'spring', stiffness: 220, damping: 16, delay: 0.15 + k * 0.05 }}
                    style={{ transformPerspective: 600 }}
                    className="relative flex flex-col items-center"
                  >
                    {isCurrent && (
                      <>
                        <span className="absolute left-1/2 top-[62%] w-24 h-24 rounded-full border-2 pointer-events-none" style={{ borderColor: ATLAS.route, animation: 'odys-ring 1.8s ease-out infinite' }} />
                        <div className="absolute -top-[58px] left-1/2 -translate-x-1/2 pointer-events-none">
                          <div className="odys-hop">
                            <Critter world={view} size={58} live />
                          </div>
                        </div>
                      </>
                    )}
                    {isBoss && (
                      <span className={`absolute -top-7 left-1/2 text-2xl odys-crown pointer-events-none ${isUnlocked ? '' : 'opacity-50 grayscale'}`} aria-hidden="true">
                        👑
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => isUnlocked && handleLaunchLevel(lvl)}
                      disabled={!isUnlocked || launchingLevel !== null}
                      aria-label={`Level ${lvl}${isBoss ? ', boss level' : ''}${twist ? `, ${twist.label}` : ''}${
                        !isUnlocked ? ', locked' : isPerfect ? ', perfect, 3 stars' : stars ? `, ${stars} of 3 stars, play again for more` : ''
                      }`}
                      className="odys-node relative flex items-center justify-center rounded-full cursor-pointer disabled:cursor-default select-none"
                      style={{
                        width: size,
                        height: size,
                        background: face,
                        boxShadow: `0 0 0 3px ${ATLAS.paper}, 0 0 0 ${isCurrent || isBoss ? 5.5 : 4.5}px ${ring}, inset 0 -3px 0 rgba(40,55,70,0.14), 0 6px 0 rgba(40,55,70,${isUnlocked ? 0.28 : 0.14}), 0 12px 18px rgba(40,55,70,0.22)`,
                      }}
                    >
                      {isUnlocked ? (
                        <span
                          className={`font-display tabular-nums ${isCurrent ? 'text-[28px]' : 'text-[22px]'}`}
                          style={{ color: numColor }}
                        >
                          {lvl}
                        </span>
                      ) : (
                        <span className="flex flex-col items-center leading-none">
                          <Lock className="w-4 h-4" style={{ color: `${ATLAS.ink}80` }} strokeWidth={2.5} />
                          <span className="num text-[11px] font-semibold mt-0.5" style={{ color: `${ATLAS.ink}90` }}>{lvl}</span>
                        </span>
                      )}
                      {twist && (
                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md" style={{ background: ATLAS.ivory, border: `1px solid ${ATLAS.ink}55` }} title={twist.label} aria-hidden="true">
                          {twist.icon}
                        </span>
                      )}
                      {isPerfect && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 rounded-full text-[8px] font-extrabold whitespace-nowrap" style={{ background: ATLAS.route, color: ATLAS.ink, border: `1px solid ${ATLAS.ivory}` }} aria-hidden="true">
                          PERFECT
                        </span>
                      )}
                    </button>

                    {isCurrent ? (
                      <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide" style={{ background: ATLAS.ink, color: ATLAS.ivory, boxShadow: `0 0 0 1.5px ${ATLAS.route}, 0 3px 6px rgba(40,55,70,0.3)` }}>
                        ▶ Play{isBoss ? ' boss' : ''}
                      </span>
                    ) : isUnlocked ? (
                      <span className="mt-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: `${ATLAS.ivory}e6`, border: `1px solid ${ATLAS.route}` }} aria-hidden="true">
                        {[1, 2, 3].map((n) => (
                          <span key={n} className="text-[11px] leading-none" style={{ color: n <= stars ? '#C9962F' : `${ATLAS.ink}30` }}>
                            ★
                          </span>
                        ))}
                        {!isPerfect && <span className="text-[9px] font-black ml-0.5" style={{ color: `${ATLAS.ink}99` }}>↻</span>}
                      </span>
                    ) : null}
                  </motion.div>
                </div>
              );
            })}

            {/* This world's island sign at the bottom */}
            <div className="absolute inset-x-0 flex justify-center pointer-events-none z-20" style={{ top: PAGE_H - SIGN_H + 58 }}>
              <motion.div
                initial={{ opacity: 0, rotateX: 75, y: 40 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.2 }}
                style={{ transformPerspective: 800 }}
                className="w-[min(340px,88vw)]"
              >
                <div>
                  <div
                    className="relative rounded-[18px] px-4 pt-3 pb-4 text-center atlas-cartouche"
                  >
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 odys-bob">
                      <Critter world={view} size={72} />
                    </div>
                    {arriving && (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.5 }}
                        className="absolute -top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md" style={{ background: ATLAS.route, color: ATLAS.ink, border: `1.5px solid ${ATLAS.ivory}` }}
                      >
                        ✨ New world!
                      </motion.div>
                    )}
                    <div className="mt-6 atlas-eyebrow">
                      Chapter {ROMAN[view] || view + 1} · Levels {first}–{last}
                    </div>
                    <div className="font-display text-xl leading-tight" style={{ color: ATLAS.ink }}>{col.name}</div>
                    <div className="mt-1 text-[11px] font-semibold" style={{ color: `${ATLAS.ink}c0` }}>
                      Meet the <span style={{ color: REGION_TINT(view), fontWeight: 800 }}>{col.block.name}</span> · <span className="num" style={{ color: '#9C7434' }}>★ {worldStars}/30</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Back down to the previous world */}
            {view > 0 && (
              <div className="absolute inset-x-0 bottom-5 flex justify-center z-30">
                <button
                  type="button"
                  onClick={() => goWorld(view - 1)}
                  className="px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform atlas-chip" style={{ color: ATLAS.ink }}
                >
                  ▼ World {view}: {(COLLECTIONS[view - 1] || COLLECTIONS[0]).name}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Little messages (perfect levels, locked gate) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom,20px))] left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold shadow-lg whitespace-nowrap pointer-events-none" style={{ background: ATLAS.ink, color: ATLAS.ivory, border: `1px solid ${ATLAS.route}` }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <CampaignQuickStartModal
        isOpen={showQuickStartModal}
        onClose={() => setShowQuickStartModal(false)}
        onStart={() => {
          setShowQuickStartModal(false);
          startCampaignTutorial();
        }}
      />
    </motion.div>
  );
}
