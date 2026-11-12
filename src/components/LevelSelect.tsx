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

/** Little scenery that floats beside each world (pure emoji, so it costs nothing to draw). */
const WORLD_DECOR: string[][] = [
  ['🌼', '🐝', '🌷', '🍃'],
  ['🌙', '⭐', '🛰️', '🪐'],
  ['🪨', '🌵', '🔴', '☄️'],
  ['🌌', '✨', '🪐', '🌠'],
  ['🐠', '🫧', '🐚', '🪸'],
  ['🌴', '🌅', '🥥', '🦀'],
  ['🌋', '🔥', '🪨', '💥'],
  ['🏛️', '⚱️', '🗿', '🕯️'],
  ['🌲', '🍄', '🦉', '🌿'],
  ['🐪', '🌵', '🏜️', '💧'],
  ['❄️', '🐧', '🧊', '☃️'],
  ['🏴‍☠️', '⚓', '🦜', '💰'],
  ['🍭', '🧁', '🍬', '🍩'],
  ['👑', '💎', '🏺', '🪙'],
  ['🌃', '🤖', '💾', '⚡'],
  ['☢️', '🛢️', '🧪', '⚙️'],
  ['☁️', '🏝️', '🎈', '🕊️'],
  ['⏰', '⚙️', '⌛', '🔩'],
  ['🌸', '⛩️', '🎐', '🍡'],
  ['💎', '🔮', '✨', '💠'],
];

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
@keyframes odys-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(253,224,71,0.0) } 50% { box-shadow: 0 0 34px 8px rgba(253,224,71,0.55) } }
.odys-bob { animation: odys-bob 3.6s ease-in-out infinite }
.odys-spin3d { animation: odys-spin3d 7s ease-in-out infinite; transform-style: preserve-3d }
.odys-hop { animation: odys-hop 1.1s cubic-bezier(.3,.7,.4,1) infinite; transform-origin: 50% 100% }
.odys-sway { animation: odys-sway 6s ease-in-out infinite; transform-origin: 50% 100% }
.odys-trail-live { animation: odys-trail 1.4s linear infinite }
.odys-cloud { animation: odys-cloud 14s ease-in-out infinite alternate }
.odys-crown { animation: odys-crown 2.4s ease-in-out infinite }
.odys-shake { animation: odys-shake 0.5s ease-in-out infinite }
.odys-glow { animation: odys-glow 1.4s ease-in-out infinite }
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
      style={{ background: pal.dark, transition: 'background 600ms ease' }}
    >
      <style>{MAP_CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top,16px))] pb-6 absolute top-0 left-0 w-full z-40 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${pal.dark}f5, ${pal.dark}b0 70%, transparent)` }}>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setMode('menu')}
          className="p-2.5 bg-slate-900/80 border-2 rounded-2xl pointer-events-auto cursor-pointer shrink-0"
          style={{ borderColor: `${pal.accent}80`, boxShadow: `0 0 16px ${pal.glow}`, color: pal.accent }}
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase" style={{ color: pal.accent }}>
            WORLD {view + 1} OF {WORLDS}
          </span>
          <h2
            className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text uppercase tracking-widest font-mono whitespace-nowrap"
            style={{ backgroundImage: `linear-gradient(to right, ${pal.accent}, ${pal.primary})`, filter: `drop-shadow(0 0 15px ${pal.glow})` }}
          >
            SHIFT ODYSSEY
          </h2>
          <span className="mt-0.5 text-[11px] font-black text-yellow-300 bg-black/50 border border-yellow-400/40 rounded-full px-2.5 py-0.5 tabular-nums">
            ★ {totalStars} / {TOTAL_LEVELS * 3}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickStartModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border rounded-2xl font-mono font-bold text-xs uppercase pointer-events-auto cursor-pointer shrink-0"
          style={{ borderColor: `${pal.accent}60`, boxShadow: `0 0 12px ${pal.glow}`, color: pal.accent }}
          aria-label="Quick-start guide"
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">GUIDE</span>
        </motion.button>
      </div>

      {/* Far clouds, moved by the scroll handler for parallax depth */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div ref={parallaxRef} className="absolute inset-x-0 -top-[900px] h-[2700px] will-change-transform">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="absolute odys-cloud rounded-full bg-white/[0.07] blur-2xl"
              style={{ top: i * 300 + (i % 2) * 90, left: `${((i * 37) % 80) - 10}%`, width: 260 + (i % 3) * 80, height: 90 + (i % 2) * 40, animationDelay: `${-i * 2.3}s` }}
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
              background: `linear-gradient(to bottom, ${nextPal.dark} 0%, color-mix(in srgb, ${pal.secondary} 38%, ${pal.dark}) 32%, color-mix(in srgb, ${pal.primary} 24%, ${pal.dark}) 72%, ${pal.dark} 100%)`,
            }}
          >
            {/* Floating scenery */}
            {(WORLD_DECOR[view] || WORLD_DECOR[0]).map((emoji, k) => (
              <span
                key={`decor-${k}`}
                className={`absolute pointer-events-none select-none ${k % 2 ? 'odys-spin3d' : 'odys-bob'}`}
                style={{
                  top: HEADER_H + GATE_H + 40 + k * ((LEVELS_PER_WORLD * NODE_GAP - 80) / 4),
                  [k % 2 === 0 ? 'left' : 'right']: `${4 + ((k * 7) % 9)}%`,
                  fontSize: 28 + (k % 3) * 8,
                  opacity: 0.6,
                  animationDelay: `${-k * 0.9}s`,
                  filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))',
                } as React.CSSProperties}
                aria-hidden="true"
              >
                {emoji}
              </span>
            ))}

            {/* Trail */}
            <svg className="absolute top-0 left-0 pointer-events-none z-10" width={width} height={PAGE_H} aria-hidden="true">
              <path d={trail.all} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={16} strokeLinecap="round" />
              <path d={trail.all} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
              {trail.done && <path d={trail.done} fill="none" stroke="#fde047" strokeWidth={7} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(253,224,71,0.8))' }} />}
              {trail.done && <path d={trail.done} className="odys-trail-live" fill="none" stroke="#fff7d6" strokeWidth={3} strokeDasharray="10 12" strokeLinecap="round" />}
            </svg>

            {/* Sky gate at the top: padlocked until this world's last level is beaten */}
            <div className="absolute inset-x-0 flex justify-center z-30" style={{ top: HEADER_H + 12 }}>
              {view === WORLDS - 1 ? (
                <div className="odys-bob text-center px-6 py-4 rounded-[28px] bg-white/10 border-2 border-white/30 backdrop-blur-sm w-[min(320px,86vw)]">
                  <div className="text-3xl">☁️🏰☁️</div>
                  <div className="mt-1 font-black text-lg uppercase tracking-widest text-yellow-200">More worlds coming</div>
                  <div className="text-xs font-bold text-white/75">The sky's not the limit. Keep stacking!</div>
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => (gateOpen ? goWorld(view + 1) : showToast(`Beat level ${last} to open the gate! 🔒`))}
                  whileTap={{ scale: 0.95 }}
                  animate={gateBursting ? { scale: [1, 1.12, 1], rotateX: [0, -18, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  className={`relative w-[min(320px,86vw)] rounded-[28px] px-4 pt-4 pb-3 border-2 text-center cursor-pointer ${gateOpen ? 'odys-glow' : ''}`}
                  style={{
                    transformPerspective: 800,
                    background: gateOpen
                      ? `linear-gradient(160deg, ${nextPal.primary}f0, ${nextPal.secondary}f0 60%, ${nextPal.dark}f5)`
                      : 'linear-gradient(160deg, #334155f0, #1e293bf5)',
                    borderColor: gateOpen ? nextPal.accent : 'rgba(148,163,184,0.5)',
                    boxShadow: `0 12px 0 ${gateOpen ? nextPal.dark : '#0f172a'}, 0 22px 36px rgba(0,0,0,0.5)`,
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
                        className={`absolute -top-7 left-1/2 -ml-7 w-14 h-14 rounded-2xl bg-slate-900 border-2 flex items-center justify-center ${showComplete ? 'odys-shake' : ''}`}
                        style={{ borderColor: showComplete ? '#fde047' : '#94a3b8' }}
                      >
                        <Lock className={`w-7 h-7 ${showComplete ? 'text-yellow-300' : 'text-slate-300'}`} strokeWidth={2.75} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {gateOpen && !showComplete && next && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 odys-bob">
                      <Critter world={view + 1} size={64} />
                    </div>
                  )}
                  <div className="mt-6 text-[10px] font-mono font-black tracking-[0.25em] text-white/80">
                    {gateOpen ? `WORLD ${view + 2} IS OPEN` : `WORLD ${view + 2} · LOCKED`}
                  </div>
                  <div className="text-lg font-black uppercase tracking-wide text-white leading-tight">
                    {gateOpen ? next?.name : '? ? ?'}
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-white/85">
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
                  <div className="px-5 py-3 rounded-3xl bg-yellow-300 text-slate-950 border-4 border-white shadow-[0_8px_0_#a16207,0_18px_30px_rgba(0,0,0,0.5)] text-center">
                    <div className="text-2xl font-black tracking-wide">🎉 WORLD COMPLETE! 🎉</div>
                    <div className="text-xs font-black">{col.name} conquered · ★ {worldStars}/30</div>
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
              const face = isUnlocked
                ? isBoss
                  ? 'linear-gradient(160deg, #fde68a, #f59e0b 55%, #b45309)'
                  : `linear-gradient(160deg, ${pal.accent}, ${pal.primary} 55%, ${pal.secondary})`
                : 'linear-gradient(160deg, #475569, #334155 60%, #1e293b)';
              const edge = isUnlocked ? (isBoss ? '#92400e' : pal.dark) : '#0f172a';
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
                        <span className="absolute left-1/2 top-[62%] w-24 h-24 rounded-full border-4 pointer-events-none" style={{ borderColor: pal.accent, animation: 'odys-ring 1.6s ease-out infinite' }} />
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
                      className="odys-node relative flex items-center justify-center rounded-[22px] cursor-pointer disabled:cursor-default select-none"
                      style={{
                        width: size,
                        height: size,
                        background: face,
                        filter: isPerfect ? 'saturate(0.85) brightness(0.92)' : undefined,
                        boxShadow: `inset 0 3px 0 rgba(255,255,255,0.45), inset 0 -4px 0 rgba(0,0,0,0.18), 0 8px 0 ${edge}, 0 16px 22px rgba(0,0,0,0.5)${
                          isCurrent ? `, 0 0 28px ${pal.glow}` : isPerfect ? ', 0 0 16px rgba(253,224,71,0.55)' : ''
                        }`,
                        border: `2px solid ${isPerfect ? '#fde047' : isUnlocked ? 'rgba(255,255,255,0.55)' : 'rgba(148,163,184,0.35)'}`,
                      }}
                    >
                      {isUnlocked ? (
                        <span
                          className={`font-black tabular-nums ${isCurrent ? 'text-3xl' : 'text-2xl'} text-white`}
                          style={{ textShadow: `0 2px 0 ${edge}, 0 3px 6px rgba(0,0,0,0.5)`, WebkitTextStroke: '1px rgba(0,0,0,0.25)' }}
                        >
                          {lvl}
                        </span>
                      ) : (
                        <span className="flex flex-col items-center leading-none">
                          <Lock className="w-4 h-4 text-slate-300/80" strokeWidth={2.75} />
                          <span className="text-[11px] font-black text-slate-300/70 mt-0.5 tabular-nums">{lvl}</span>
                        </span>
                      )}
                      {twist && (
                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-950/85 border border-white/40 flex items-center justify-center text-sm shadow-md" title={twist.label} aria-hidden="true">
                          {twist.icon}
                        </span>
                      )}
                      {isPerfect && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 rounded-full bg-yellow-300 text-[8px] font-black text-slate-950 border border-white whitespace-nowrap" aria-hidden="true">
                          PERFECT
                        </span>
                      )}
                    </button>

                    {isCurrent ? (
                      <span className="mt-3 px-3 py-0.5 rounded-full text-[11px] font-black text-slate-950 bg-yellow-300 border-2 border-white shadow-[0_3px_0_#a16207] tracking-wide">
                        ▶ PLAY{isBoss ? ' BOSS' : ''}
                      </span>
                    ) : isUnlocked ? (
                      <span className="mt-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/55 border border-yellow-400/40" aria-hidden="true">
                        {[1, 2, 3].map((n) => (
                          <span key={n} className={`text-[11px] leading-none ${n <= stars ? 'text-yellow-300' : 'text-white/25'}`}>
                            ★
                          </span>
                        ))}
                        {!isPerfect && <span className="text-[9px] font-black text-white/70 ml-0.5">↻</span>}
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
                <div className="odys-sway">
                  <div
                    className="relative rounded-[28px] px-4 pt-3 pb-4 border-2 text-center"
                    style={{
                      background: `linear-gradient(160deg, ${pal.primary}ee, ${pal.secondary}ee 55%, ${pal.dark}f2)`,
                      borderColor: `${pal.accent}cc`,
                      boxShadow: `0 14px 0 ${pal.dark}, 0 24px 40px rgba(0,0,0,0.55), 0 0 30px ${pal.glow}`,
                    }}
                  >
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 odys-bob">
                      <Critter world={view} size={72} />
                    </div>
                    {arriving && (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.5 }}
                        className="absolute -top-3 left-3 px-2.5 py-1 rounded-full bg-yellow-300 text-slate-950 text-[11px] font-black border-2 border-white shadow-md"
                      >
                        ✨ NEW WORLD!
                      </motion.div>
                    )}
                    <div className="mt-6 text-[10px] font-mono font-black tracking-[0.25em] text-white/80">
                      WORLD {String(view + 1).padStart(2, '0')} · LEVELS {first}–{last}
                    </div>
                    <div className="text-xl font-black uppercase tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight">{col.name}</div>
                    <div className="mt-1 text-[11px] font-bold text-white/85">
                      Meet the <span style={{ color: pal.accent }}>{col.block.name}</span> · <span className="text-yellow-300">★ {worldStars}/30</span>
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
                  className="px-4 py-2 rounded-full bg-black/50 border border-white/30 text-white text-xs font-black tracking-wide backdrop-blur-sm active:scale-95 transition-transform"
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
            className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom,20px))] left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-950/90 border border-yellow-300/60 text-yellow-100 text-xs font-black shadow-lg whitespace-nowrap pointer-events-none"
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
