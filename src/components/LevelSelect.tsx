import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ArrowLeft, Lock, GraduationCap } from 'lucide-react';
import { CampaignQuickStartModal } from './campaign/CampaignQuickStartModal';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { screenFadeSlideVariants } from '../utils/screenTransitions';
import { useWorldTheme } from '../hooks/useWorldTheme';
import { COLLECTIONS } from '../game/collections';
import { THEME_PALETTES, renderBlock } from '../game/themeRenderer';
import { levelTwist, LevelTwist } from '../game/LevelGenerator';

// ---------------------------------------------------------------------------------------
// SHIFT ODYSSEY map: a climb up into the sky. Level 1 sits at the bottom and every world
// floats above the last one, like the tower you build. Worlds are floating 3D islands with
// their own colours and critter; levels are chunky 3D blocks you press like real buttons.
// ---------------------------------------------------------------------------------------

const TOTAL_LEVELS = 200;
const LEVELS_PER_WORLD = 10;
const WORLDS = TOTAL_LEVELS / LEVELS_PER_WORLD;
const NODE_GAP = 96; // vertical distance between levels
const HEADER_GAP = 250; // room for each world's island sign
const WORLD_H = HEADER_GAP + LEVELS_PER_WORLD * NODE_GAP;
const TOP_PAD = 260; // "more worlds above the clouds" sign
const BOTTOM_PAD = 170;
const MAP_H = TOP_PAD + WORLDS * WORLD_H + BOTTOM_PAD;

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

/** Vertical position of a level's centre, px from the top of the map (level 1 is lowest). */
const levelY = (lvl: number) => {
  const w = Math.floor((lvl - 1) / LEVELS_PER_WORLD);
  const k = (lvl - 1) % LEVELS_PER_WORLD;
  const worldBottom = MAP_H - BOTTOM_PAD - w * WORLD_H;
  // Each world's island sign sits at the bottom of its stretch, so you meet it on the way up
  return worldBottom - HEADER_GAP - NODE_GAP * 0.5 - k * NODE_GAP;
};
/** Sideways position, % of the width: a playful zig-zag that stays clear of the edges. */
const levelX = (lvl: number) => 50 + Math.sin(lvl * 0.95) * 27;
/** Top of a world's band. */
const worldTop = (w: number) => MAP_H - BOTTOM_PAD - (w + 1) * WORLD_H;
/** Where a world's island sign sits: at the bottom of its band, below its first level. */
const signTop = (w: number) => worldTop(w) + WORLD_H - HEADER_GAP + 52;

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
.odys-bob { animation: odys-bob 3.6s ease-in-out infinite }
.odys-spin3d { animation: odys-spin3d 7s ease-in-out infinite; transform-style: preserve-3d }
.odys-hop { animation: odys-hop 1.1s cubic-bezier(.3,.7,.4,1) infinite; transform-origin: 50% 100% }
.odys-sway { animation: odys-sway 6s ease-in-out infinite; transform-origin: 50% 100% }
.odys-trail-live { animation: odys-trail 1.4s linear infinite }
.odys-cloud { animation: odys-cloud 14s ease-in-out infinite alternate }
.odys-crown { animation: odys-crown 2.4s ease-in-out infinite }
.odys-node { transition: transform 110ms ease, box-shadow 110ms ease, filter 160ms ease }
.odys-node:active:not(:disabled) { transform: translateY(7px) }
@media (prefers-reduced-motion: reduce) {
  .odys-bob, .odys-spin3d, .odys-hop, .odys-sway, .odys-trail-live, .odys-cloud, .odys-crown { animation: none !important }
}
`;

export function LevelSelect() {
  const { setMode, setLevel, unlockedLevels, setState, hasCompletedCampaignTutorial, startCampaignTutorial } = useGameStore();
  const highScores = useGameStore((st) => st.highScores);
  // Best star result per level (saved alongside high scores as "stars-<level>")
  const levelStars = useMemo(() => {
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(highScores || {})) if (k.startsWith('stars-')) out[Number(k.slice(6))] = v;
    return out;
  }, [highScores]);
  const totalStars = useMemo(() => Object.values(levelStars).reduce((a: number, b: number) => a + b, 0), [levelStars]);

  const worldTheme = useWorldTheme();
  const themePalette = worldTheme.palette;
  const scrollRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [showQuickStartModal, setShowQuickStartModal] = useState(!hasCompletedCampaignTutorial);
  const [launchingLevel, setLaunchingLevel] = useState<number | null>(null);
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 400));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth || 400);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLaunchLevel = (lvl: number) => {
    if (launchingLevel !== null) return;
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

  // Start the view on the current level
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.min(Math.max(1, unlockedLevels), TOTAL_LEVELS);
    el.scrollTop = Math.max(0, levelY(target) - el.clientHeight * 0.55);
  }, []);

  // Clouds drift at a slower speed than the map for a sense of depth
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    const p = parallaxRef.current;
    if (!el || !p) return;
    p.style.transform = `translate3d(0, ${-(el.scrollTop * 0.35) % 900}px, 0)`;
  }, []);

  // The trail through every level, as a smooth curve
  const trail = useMemo(() => {
    const pts = Array.from({ length: TOTAL_LEVELS }, (_, i) => ({ x: (levelX(i + 1) / 100) * width, y: levelY(i + 1) }));
    const toPath = (list: { x: number; y: number }[]) =>
      list.reduce((d, p, i) => {
        if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        const prev = list[i - 1];
        const my = (prev.y + p.y) / 2;
        return `${d} C ${prev.x.toFixed(1)} ${my.toFixed(1)}, ${p.x.toFixed(1)} ${my.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }, '');
    const reached = Math.min(TOTAL_LEVELS, Math.max(1, unlockedLevels));
    return { all: toPath(pts), done: toPath(pts.slice(0, reached)) };
  }, [width, unlockedLevels]);

  return (
    <motion.div
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col w-full h-full relative z-10 overflow-hidden bg-slate-950"
      style={worldTheme.cssVariables}
    >
      <style>{MAP_CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top,16px))] pb-6 absolute top-0 left-0 w-full z-40 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setMode('menu')}
          className="p-2.5 bg-slate-900/80 border-2 rounded-2xl pointer-events-auto cursor-pointer shrink-0"
          style={{ borderColor: `${themePalette.accent}80`, boxShadow: `0 0 16px ${themePalette.glow}`, color: themePalette.accent }}
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase" style={{ color: themePalette.accent }}>
            CLIMB TO THE SKY
          </span>
          <h2
            className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text uppercase tracking-widest font-mono whitespace-nowrap"
            style={{ backgroundImage: `linear-gradient(to right, ${themePalette.accent}, ${themePalette.primary})`, filter: `drop-shadow(0 0 15px ${themePalette.glow})` }}
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
          style={{ borderColor: `${themePalette.accent}60`, boxShadow: `0 0 12px ${themePalette.glow}`, color: themePalette.accent }}
          aria-label="Quick-start guide"
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">GUIDE</span>
        </motion.button>
      </div>

      {/* Far clouds: fixed layer moved by the scroll handler for parallax depth */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div ref={parallaxRef} className="absolute inset-x-0 -top-[900px] h-[2700px] will-change-transform">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="absolute odys-cloud rounded-full bg-white/[0.07] blur-2xl"
              style={{ top: i * 300 + (i % 2) * 90, left: `${(i * 37) % 80 - 10}%`, width: 260 + (i % 3) * 80, height: 90 + (i % 2) * 40, animationDelay: `${-i * 2.3}s` }}
            />
          ))}
        </div>
      </div>

      {/* The map */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overflow-x-hidden touch-pan-y relative w-full z-20" style={{ scrollbarWidth: 'none' }}>
        <div className="relative w-full" style={{ height: MAP_H }}>
          {/* Sky bands: each world tints its stretch of the climb, blending into the next */}
          {Array.from({ length: WORLDS }, (_, w) => {
            const pal = THEME_PALETTES[w] || THEME_PALETTES[0];
            const above = THEME_PALETTES[w + 1] || pal;
            return (
              <div
                key={`band-${w}`}
                className="absolute inset-x-0"
                style={{
                  top: worldTop(w),
                  height: WORLD_H + 2,
                  // Solid colours that meet the neighbouring bands exactly, so there are no seams
                  background: `linear-gradient(to bottom, ${above.dark} 0%, color-mix(in srgb, ${pal.secondary} 38%, ${pal.dark}) 40%, color-mix(in srgb, ${pal.primary} 22%, ${pal.dark}) 75%, ${pal.dark} 100%)`,
                }}
              />
            );
          })}
          <div className="absolute inset-x-0 top-0" style={{ height: TOP_PAD + 40, background: 'linear-gradient(to bottom, #0b1026, transparent)' }} />

          {/* Floating scenery beside each world */}
          {Array.from({ length: WORLDS }, (_, w) =>
            (WORLD_DECOR[w] || WORLD_DECOR[0]).map((emoji, k) => {
              const side = k % 2 === 0 ? 'left' : 'right';
              const y = worldTop(w) + 50 + k * ((WORLD_H - HEADER_GAP - 100) / 4);
              return (
                <span
                  key={`decor-${w}-${k}`}
                  className={`absolute pointer-events-none select-none ${k % 2 ? 'odys-spin3d' : 'odys-bob'}`}
                  style={{ top: y, [side]: `${4 + (k * 7) % 9}%`, fontSize: 26 + ((w + k) % 3) * 8, opacity: 0.55, animationDelay: `${-(w + k) * 0.7}s`, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))' } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {emoji}
                </span>
              );
            })
          )}

          {/* Trail: the whole climb faintly, the part you have conquered glowing and flowing */}
          <svg className="absolute top-0 left-0 pointer-events-none z-10" width={width} height={MAP_H} aria-hidden="true">
            <path d={trail.all} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={16} strokeLinecap="round" />
            <path d={trail.all} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
            <path d={trail.done} fill="none" stroke="#fde047" strokeWidth={7} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(253,224,71,0.8))' }} />
            <path d={trail.done} className="odys-trail-live" fill="none" stroke="#fff7d6" strokeWidth={3} strokeDasharray="10 12" strokeLinecap="round" />
          </svg>

          {/* World island signs */}
          {Array.from({ length: WORLDS }, (_, w) => {
            const pal = THEME_PALETTES[w] || THEME_PALETTES[0];
            const col = COLLECTIONS[w] || COLLECTIONS[0];
            const first = w * LEVELS_PER_WORLD + 1;
            const unlocked = first <= unlockedLevels;
            const stars = Array.from({ length: LEVELS_PER_WORLD }, (_, k) => levelStars[first + k] || 0).reduce((a, b) => a + b, 0);
            return (
              <div key={`sign-${w}`} className="absolute inset-x-0 flex justify-center pointer-events-none z-20" style={{ top: signTop(w) }}>
                <motion.div
                  initial={{ opacity: 0, rotateX: 75, y: 40 }}
                  whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
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
                        filter: unlocked ? undefined : 'grayscale(0.75) brightness(0.7)',
                      }}
                    >
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 odys-bob" style={{ animationDelay: `${-w * 0.4}s` }}>
                        <Critter world={w} size={72} />
                      </div>
                      <div className="mt-6 text-[10px] font-mono font-black tracking-[0.25em] text-white/80">
                        WORLD {String(w + 1).padStart(2, '0')} · LEVELS {first}–{first + 9}
                      </div>
                      <div className="text-xl font-black uppercase tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight">
                        {col.name}
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-white/85">
                        {unlocked ? (
                          <>
                            Meet the <span style={{ color: pal.accent }}>{col.block.name}</span> · <span className="text-yellow-300">★ {stars}/30</span>
                          </>
                        ) : (
                          <>🔒 Clear level {first - 1} to fly up here!</>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* Level blocks */}
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
            const lvl = i + 1;
            const w = Math.floor(i / LEVELS_PER_WORLD);
            const pal = THEME_PALETTES[w] || THEME_PALETTES[0];
            const isUnlocked = lvl <= unlockedLevels;
            const isCurrent = lvl === unlockedLevels;
            const isBoss = lvl % 10 === 0;
            const stars = levelStars[lvl] || 0;
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
                style={{ top: levelY(lvl), left: `${levelX(lvl)}%`, transform: 'translate(-50%, -50%)', zIndex: isCurrent ? 35 : 25 }}
              >
                <motion.div
                  initial={{ opacity: 0, rotateX: -80, scale: 0.6 }}
                  whileInView={{ opacity: 1, rotateX: 0, scale: 1 }}
                  viewport={{ once: true, margin: '80px' }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  animate={launching ? { rotateY: 360, scale: 1.18 } : undefined}
                  style={{ transformPerspective: 600 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Current level: pulsing landing ring and your critter hopping on top */}
                  {isCurrent && (
                    <>
                      <span className="absolute left-1/2 top-[62%] w-24 h-24 rounded-full border-4 pointer-events-none" style={{ borderColor: pal.accent, animation: 'odys-ring 1.6s ease-out infinite' }} />
                      <div className="absolute -top-[58px] left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className="odys-hop">
                          <Critter world={w} size={58} live />
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
                    aria-label={`Level ${lvl}${isBoss ? ', boss level' : ''}${twist ? `, ${twist.label}` : ''}${isUnlocked ? (stars ? `, ${stars} of 3 stars` : '') : ', locked'}`}
                    className="odys-node relative flex items-center justify-center rounded-[22px] cursor-pointer disabled:cursor-default select-none"
                    style={{
                      width: size,
                      height: size,
                      background: face,
                      boxShadow: `inset 0 3px 0 rgba(255,255,255,0.45), inset 0 -4px 0 rgba(0,0,0,0.18), 0 8px 0 ${edge}, 0 16px 22px rgba(0,0,0,0.5)${isCurrent ? `, 0 0 28px ${pal.glow}` : ''}`,
                      border: `2px solid ${isUnlocked ? 'rgba(255,255,255,0.55)' : 'rgba(148,163,184,0.35)'}`,
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
                      <span
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-950/85 border border-white/40 flex items-center justify-center text-sm shadow-md"
                        title={twist.label}
                        aria-hidden="true"
                      >
                        {twist.icon}
                      </span>
                    )}
                  </button>

                  {/* Stars or the play prompt under the block */}
                  {isCurrent ? (
                    <span className="mt-3 px-3 py-0.5 rounded-full text-[11px] font-black text-slate-950 bg-yellow-300 border-2 border-white shadow-[0_3px_0_#a16207] tracking-wide">
                      ▶ PLAY{isBoss ? ' BOSS' : ''}
                    </span>
                  ) : isUnlocked ? (
                    <span className="mt-3 flex gap-px px-1.5 py-0.5 rounded-full bg-black/55 border border-yellow-400/40" aria-hidden="true">
                      {[1, 2, 3].map((k) => (
                        <span key={k} className={`text-[11px] leading-none ${k <= stars ? 'text-yellow-300' : 'text-white/25'}`}>
                          ★
                        </span>
                      ))}
                    </span>
                  ) : null}
                </motion.div>
              </div>
            );
          })}

          {/* The top of the climb */}
          <div className="absolute inset-x-0 flex justify-center pointer-events-none" style={{ top: 118 }}>
            <div className="odys-bob text-center px-6 py-4 rounded-[28px] bg-white/10 border-2 border-white/30 backdrop-blur-sm w-[min(320px,86vw)]">
              <div className="text-3xl">☁️🏰☁️</div>
              <div className="mt-1 font-black text-lg uppercase tracking-widest text-yellow-200">More worlds coming</div>
              <div className="text-xs font-bold text-white/75">The sky's not the limit. Keep stacking!</div>
            </div>
          </div>

          {/* Ground at the very bottom */}
          <div
            className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none"
            style={{ height: BOTTOM_PAD + 2, background: `linear-gradient(to bottom, ${THEME_PALETTES[0].dark}, #1f1405 70%, #120b02)` }}
          >
            <div className="mt-10 text-center">
              <div className="text-2xl">🌱 🏗️ 🌱</div>
              <div className="text-[11px] font-black tracking-[0.3em] text-white/70 uppercase mt-1">Every tower starts here</div>
            </div>
          </div>
        </div>
      </div>

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
