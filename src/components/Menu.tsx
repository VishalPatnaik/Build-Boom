import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Coins, ShoppingBag, Infinity as InfinityIcon, Play, Plus, Trophy, Flame, Settings, Zap, Medal, FlaskConical, Hammer } from 'lucide-react';
import { renderBlock, renderPlate } from '../game/themeRenderer';
import { useDailyStore, getStreakMultiplier } from '../game/dailyStore';
import { TacticalRechargeModal } from './TacticalRechargeModal';
import { AchievementsModal } from './achievements/AchievementsModal';
import { AchievementBadge } from './achievements/AchievementBadge';
import { ACHIEVEMENTS, getAchievementCurrentValue } from '../game/achievements';
import { haptics } from '../utils/haptics';
import { audio } from '../audio/AudioEngine';
import { ReplayViewer } from './ReplayViewer';

import { screenFadeSlideVariants } from '../utils/screenTransitions';

function ModePlaque({ accent, title, sub, icon, onClick, dot }: { accent: string; title: string; sub: string; icon: React.ReactNode; onClick: () => void; dot?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="mode-plaque relative rounded-[14px] pl-2 pr-2.5 py-2 flex items-center gap-2.5 text-left cursor-pointer overflow-hidden"
      style={{ ['--plaque' as string]: accent }}
      aria-label={title}
    >
      {dot && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--emerald)', boxShadow: '0 0 0 2px #17243D' }} />}
      <span className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ color: accent, background: 'rgba(255,255,255,0.06)', border: `1px solid ${accent}66` }}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[14px] font-extrabold text-[var(--ivory)] leading-tight whitespace-nowrap" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>{title}</span>
        <span className="block mt-0.5 text-[11px] font-semibold text-[var(--stone)]/85 leading-tight truncate">{sub}</span>
      </span>
    </motion.button>
  );
}

/** The real in-game critters stacked on the equipped plate, gently wobbling. */
function HeroStack({ skin, plate }: { skin: string; plate: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 220, H = 150;
    canvas.width = W * dpr; canvas.height = H * dpr;
    let raf = 0;
    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const lean = Math.sin(t / 900) * 0.05;
      ctx.fillStyle = 'rgba(42,26,60,0.25)';
      ctx.beginPath(); ctx.ellipse(W / 2, H - 10, 70, 8, 0, 0, Math.PI * 2); ctx.fill();
      renderPlate(ctx, W / 2 - 62, H - 34, 124, 26, plate, t);
      const s = 40;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        const y = H - 30 - s * (i + 1) + 2 * (i + 1);
        ctx.translate(W / 2 + Math.sin(lean) * (i + 1) * 14, y + s / 2);
        ctx.rotate(lean * (i + 1) * 0.6);
        renderBlock(ctx, -s / 2, -s / 2, s, s, skin, false, t + i * 400);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [skin, plate]);
  return <canvas ref={ref} style={{ width: 220, height: 150 }} aria-hidden />;
}

export function Menu() {
  const [armoryOpen, setArmoryOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);

  const { 
    setMode, 
    adsRemoved, 
    coins, 
    highScores, 
    setShowIAP, 
    playerAvatar, 
    trophies,
    unlockedLevels,
    powerups,
    hapticsEnabled,
    toggleHaptics,
    achievementStats,
    unlockedAchievements,
    lastReplay,
    replayModalOpen,
    setReplayModalOpen,
    setSettingsModalOpen,
    equippedCosmetic,
    equippedPlate,
  } = useGameStore();

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedAchievements[a.id]?.unlocked).length;
  const unclaimedCount = ACHIEVEMENTS.filter(
    (a) => unlockedAchievements[a.id]?.unlocked && !unlockedAchievements[a.id]?.claimed
  ).length;

  const streakCount = useDailyStore((s) => s.streakCount);
  const streakClaimedToday = useDailyStore((s) => s.streakClaimedToday);
  const activeMultiplier = getStreakMultiplier(streakCount);

  const totalCharges = (powerups?.stasis || 0) + (powerups?.emp || 0) + (powerups?.shield || 0);
  const tap = () => { haptics.uiTap(); audio.playClickSound(); };

  const dock: Array<{ key: string; label: string; icon: React.ReactNode; color: string; badge?: string | number; onClick: () => void }> = [
    { key: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" />, color: 'var(--gold)', onClick: () => setMode('shop') },
    { key: 'arsenal', label: 'Arsenal', icon: <Zap className="w-5 h-5" />, color: 'var(--teal)', badge: totalCharges || undefined, onClick: () => setArmoryOpen(true) },
    { key: 'lab', label: 'Lab', icon: <FlaskConical className="w-5 h-5" />, color: 'var(--lilac)', onClick: () => { useGameStore.getState().setState('idle'); setMode('academy'); } },
    { key: 'forge', label: 'Forge', icon: <Hammer className="w-5 h-5" />, color: '#C68A57', onClick: () => setMode('workshop') },
    { key: 'archive', label: 'Archive', icon: <Medal className="w-5 h-5" />, color: 'var(--gold)', badge: unclaimedCount || undefined, onClick: () => setAchievementsModalOpen(true) },
    { key: 'replay', label: 'Replay', icon: <Play className="w-5 h-5" />, color: 'var(--azure)', onClick: () => setReplayModalOpen(true) },
  ];

  const stars = Object.keys(highScores).filter((k) => k.startsWith('stars-')).reduce((sum, k) => sum + (highScores[k] || 0), 0);
  const worldNo = Math.min(20, Math.floor((Math.max(1, unlockedLevels) - 1) / 10) + 1);

  return (
    <motion.div 
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain flex flex-col items-center relative z-10 pt-[max(0.75rem,env(safe-area-inset-top,12px))] pb-[max(1rem,env(safe-area-inset-bottom,16px))] pl-[max(1rem,env(safe-area-inset-left,16px))] pr-[max(1rem,env(safe-area-inset-right,16px))]"
      style={{ scrollbarWidth: 'none', fontFamily: "'Manrope', system-ui, sans-serif" }}
    >
      {/* soft shade at the bottom so the controls sit on the world, not on top of a bright sky */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[58%] -z-10" style={{ background: 'linear-gradient(180deg, rgba(23,36,61,0) 0%, rgba(23,36,61,0.55) 45%, rgba(23,36,61,0.88) 100%)' }} />

      <div className="w-full max-w-md min-h-full flex flex-col items-center gap-3 [&>*]:shrink-0">

        {/* Top bar: player progress and currency */}
        <header className="w-full flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => { tap(); setMode('tournament'); }}
            className="panel-metal rounded-full pl-1 pr-3 py-1 flex items-center gap-2 cursor-pointer"
            aria-label={`Player progress: world ${worldNo}, ${stars} stars`}
          >
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: 'linear-gradient(180deg,#F3D493,#D5A453)', border: '1px solid var(--gold-deep)' }}>{playerAvatar}</span>
            <span className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-bold text-[var(--stone)]/80 tracking-wide">WORLD {worldNo}</span>
              <span className="num text-[13px] font-semibold text-[var(--gold)]">★ {stars}</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { tap(); setShowIAP(true); }}
              className="panel-metal rounded-full pl-1.5 pr-1 py-1 flex items-center gap-1.5 cursor-pointer"
              aria-label={`${coins} coins, get more`}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#F3D493,#D5A453)' }}><Coins className="w-3.5 h-3.5 text-[var(--ink)]" /></span>
              <span className="num text-[14px] font-semibold text-[var(--ivory)]">{coins.toLocaleString()}</span>
              <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--emerald)' }}><Plus className="w-3.5 h-3.5 text-white stroke-[3]" /></span>
            </button>
            <button
              onClick={() => { tap(); setSettingsModalOpen(true); }}
              className="panel-metal rounded-full w-10 h-10 flex items-center justify-center text-[var(--ivory)] cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Logo */}
        <div className="text-center mt-3 select-none">
          <h1 className="toon-text text-[clamp(2.1rem,11vw,3rem)] leading-none whitespace-nowrap" style={{ fontWeight: 800 }}>
            TOWER<span style={{ color: 'var(--gold)' }}>//</span>SHIFT
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[var(--ivory)]/85">
            <span className="h-px w-6" style={{ background: 'var(--gold)' }} />
            BUILD · BALANCE · DEFLECT · ASCEND
            <span className="h-px w-6" style={{ background: 'var(--gold)' }} />
          </div>
        </div>

        {/* Hero: the player's tower in the active world */}
        <div className="flex-1 min-h-[120px] flex items-end justify-center">
          <HeroStack skin={equippedCosmetic || 'skin-0'} plate={equippedPlate || 'plate-0'} />
        </div>

        {/* Campaign progress + PLAY */}
        <div className="w-full">
          <div className="flex items-center justify-between px-1 mb-1.5 text-[12px] font-semibold text-[var(--ivory)]/85">
            <span>Shift Odyssey · World {worldNo}</span>
            <span className="num text-[var(--gold)]">Level {unlockedLevels} / 200</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(245,240,230,0.18)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (unlockedLevels / 200) * 100)}%`, background: 'linear-gradient(90deg,#D5A453,#F3D493)' }} />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            onClick={() => { tap(); setMode('campaign'); }}
            className="btn-gold toon-shine w-full rounded-[16px] py-3.5 flex items-center justify-center gap-3 cursor-pointer"
            aria-label={`Play Shift Odyssey, level ${unlockedLevels}`}
          >
            <Play className="w-7 h-7 fill-[var(--ink)] text-[var(--ink)]" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[26px] font-extrabold tracking-tight" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>Play</span>
              <span className="text-[12px] font-bold opacity-75 mt-1">Continue level {unlockedLevels}</span>
            </span>
          </motion.button>
        </div>

        {/* Modes: a championship banner and two plaques, not three identical tiles */}
        <div className="grid grid-cols-[1.05fr_1fr] grid-rows-2 gap-2 w-full">
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            onClick={() => { tap(); setMode('tournament'); }}
            className="arena-banner row-span-2 relative rounded-[16px] overflow-hidden text-left px-3.5 pt-3 pb-3 flex flex-col justify-between cursor-pointer"
            aria-label="Shift Arena"
          >
            <span className="eyebrow" style={{ color: '#C8D5E2' }}>Championship</span>
            <Trophy className="absolute right-2.5 top-2.5 w-9 h-9" style={{ color: 'var(--gold)', filter: 'drop-shadow(0 2px 0 rgba(8,14,30,0.6))' }} />
            <span>
              <span className="block text-[19px] font-extrabold text-[var(--ivory)] leading-none" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>Shift Arena</span>
              <span className="mt-1.5 flex items-center gap-2 num text-[12px]">
                <span style={{ color: '#EBC16F' }}>● {trophies.gold}</span>
                <span style={{ color: '#C8D5E2' }}>● {trophies.silver}</span>
                <span style={{ color: '#C98B5B' }}>● {trophies.bronze}</span>
              </span>
            </span>
          </motion.button>
          <ModePlaque
            accent="var(--teal)" title="Endless" sub={`Best ${highScores['tower-endless'] || 0} tall`} icon={<InfinityIcon className="w-5 h-5" />}
            onClick={() => {
              tap();
              useGameStore.getState().setLevel(0);
              useGameStore.getState().setState('playing');
              setMode('endless');
            }}
          />
          <ModePlaque accent="var(--coral)" title="Daily Shift" sub={`${streakCount}-day streak · ${activeMultiplier.toFixed(1)}x`} icon={<Flame className="w-5 h-5" />} dot={!streakClaimedToday} onClick={() => { tap(); setMode('daily'); }} />
        </div>

        {/* Navigation: the Shop as a gold medallion, everything else on one engraved rail */}
        <div className="w-full flex items-center gap-2 mt-0.5">
          {(() => { const d = dock[0]; return (
            <button onClick={() => { tap(); d.onClick(); }} className="shop-medallion shrink-0 w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform duration-100" aria-label={d.label}>
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10.5px] font-extrabold leading-none mt-0.5">{d.label}</span>
            </button>
          ); })()}
          <nav className="home-rail flex-1 grid grid-cols-5 rounded-full px-1 py-1.5">
            {dock.slice(1).map((d, i) => (
              <button key={d.key} onClick={() => { tap(); d.onClick(); }} className={`relative flex flex-col items-center gap-0.5 py-0.5 cursor-pointer active:scale-95 transition-transform duration-100 ${i ? 'home-rail-sep' : ''}`} aria-label={d.label}>
                <span className="relative w-6 h-6 flex items-center justify-center text-[var(--ivory)]">
                  {d.icon}
                  {d.badge !== undefined && (
                    <span className="num absolute -top-1.5 -right-3 min-w-[17px] h-[15px] px-1 rounded-full text-[9.5px] font-semibold flex items-center justify-center" style={{ background: 'var(--coral)', color: '#fff' }}>{d.badge}</span>
                  )}
                </span>
                <span className="text-[10px] font-bold leading-tight whitespace-nowrap text-[var(--stone)]">{d.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {!adsRemoved && (
          <button
            onClick={() => { tap(); useGameStore.getState().setShowRemoveAds(true); }}
            className="text-[12px] font-semibold text-[var(--stone)]/80 underline underline-offset-4 cursor-pointer"
          >
            Remove ads
          </button>
        )}
      </div>

      <TacticalRechargeModal
        isOpen={armoryOpen}
        onClose={() => setArmoryOpen(false)}
      />

      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
        selectedAchievementId={selectedAchievementId}
      />

      <ReplayViewer
        isOpen={replayModalOpen}
        onClose={() => setReplayModalOpen(false)}
        replayData={lastReplay}
      />
    </motion.div>
  );
}
