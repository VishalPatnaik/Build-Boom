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

function ModeTile({ color, dark, title, sub, icon, onClick, dot }: { color: string; dark: string; title: string; sub: string; icon: React.ReactNode; onClick: () => void; dot?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="toon toon-shine relative rounded-[20px] px-1.5 pt-2.5 pb-2 flex flex-col items-center cursor-pointer"
      style={{ background: color }}
      aria-label={title}
    >
      {dot && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#7bd86a] border-2 border-[var(--ink)]" />}
      <span className="w-11 h-11 rounded-full bg-white/90 border-2 border-[var(--ink)] flex items-center justify-center" style={{ color: dark }}>{icon}</span>
      <span className="font-game toon-text-sm text-[17px] leading-none mt-1.5 whitespace-nowrap">{title}</span>
      <span className="text-[11px] font-bold mt-1 leading-tight text-center" style={{ color: dark }}>{sub}</span>
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
    { key: 'shop', label: 'Shop', icon: <ShoppingBag className="w-6 h-6" />, color: '#ffc93c', onClick: () => setMode('shop') },
    { key: 'arsenal', label: 'Arsenal', icon: <Zap className="w-6 h-6" />, color: '#5ad1ff', badge: totalCharges || undefined, onClick: () => setArmoryOpen(true) },
    { key: 'archive', label: 'Archive', icon: <Medal className="w-6 h-6" />, color: '#ff9f6b', badge: unclaimedCount || undefined, onClick: () => setAchievementsModalOpen(true) },
    { key: 'replay', label: 'Replay', icon: <Play className="w-6 h-6" />, color: '#8fe38a', onClick: () => setReplayModalOpen(true) },
    { key: 'lab', label: 'Shift Lab', icon: <FlaskConical className="w-6 h-6" />, color: '#b69cff', onClick: () => { useGameStore.getState().setState('idle'); setMode('academy'); } },
    { key: 'forge', label: 'Shift Forge', icon: <Hammer className="w-6 h-6" />, color: '#ff8fc2', onClick: () => setMode('workshop') },
  ];

  return (
    <motion.div 
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain flex flex-col items-center relative z-10 pt-[max(0.75rem,env(safe-area-inset-top,12px))] pb-[max(1.25rem,env(safe-area-inset-bottom,20px))] pl-[max(1rem,env(safe-area-inset-left,16px))] pr-[max(1rem,env(safe-area-inset-right,16px))]"
      style={{ scrollbarWidth: 'none', fontFamily: "'Fredoka', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md min-h-full flex flex-col items-center gap-3 [&>*]:shrink-0">

        {/* Top bar: cups, settings, coins */}
        <header className="w-full flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => { tap(); setMode('tournament'); }}
            className="toon-sm rounded-full bg-[var(--cream)] pl-1 pr-3 py-1 flex items-center gap-2 cursor-pointer"
            aria-label="Shift Arena cups"
          >
            <span className="w-8 h-8 rounded-full bg-[#ffb347] border-2 border-[var(--ink)] flex items-center justify-center text-base">{playerAvatar}</span>
            <Trophy className="w-4 h-4 text-[#e8a400] fill-[#ffd23f]" />
            <span className="font-game text-[var(--ink)] text-lg leading-none">{trophies.gold + trophies.silver + trophies.bronze}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { tap(); setSettingsModalOpen(true); }}
              className="toon-sm rounded-full bg-[var(--cream)] w-11 h-11 flex items-center justify-center text-[var(--ink)] cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </button>
            <button
              onClick={() => { tap(); setShowIAP(true); }}
              className="toon-sm rounded-full bg-[var(--cream)] pl-2 pr-1 py-1 flex items-center gap-1.5 cursor-pointer"
              aria-label={`${coins} coins, get more`}
            >
              <span className="w-7 h-7 rounded-full bg-[#ffd23f] border-2 border-[var(--ink)] flex items-center justify-center"><Coins className="w-4 h-4 text-[var(--ink)]" /></span>
              <span className="font-game text-[var(--ink)] text-lg leading-none tabular-nums">{coins.toLocaleString()}</span>
              <span className="w-7 h-7 rounded-full bg-[#7bd86a] border-2 border-[var(--ink)] flex items-center justify-center"><Plus className="w-4 h-4 text-[var(--ink)] stroke-[3.5]" /></span>
            </button>
          </div>
        </header>

        {/* Title */}
        <motion.div
          className="text-center mt-2 select-none"
          animate={{ rotate: [-1.2, 1.2, -1.2] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        >
          <h1 className="font-game toon-text text-[clamp(2.3rem,12vw,3.4rem)] leading-[0.95] whitespace-nowrap">
            TOWER<span className="text-[#ff8a3d]">//</span>SHIFT
          </h1>
          <p className="mt-1 text-[15px] font-bold text-[var(--ink)]/80">Build. Balance. Deflect. Ascend.</p>
        </motion.div>

        {/* Hero: the actual critters, wobbling on their plate */}
        <HeroStack skin={equippedCosmetic || 'skin-0'} plate={equippedPlate || 'plate-0'} />

        {/* PLAY: Shift Odyssey */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { tap(); setMode('campaign'); }}
          className="toon toon-shine w-full rounded-[26px] bg-[#6ad04a] py-3 flex flex-col items-center cursor-pointer"
          aria-label={`Play Shift Odyssey, level ${unlockedLevels}`}
        >
          <span className="font-game toon-text-sm text-[2.6rem] leading-none flex items-center gap-2">
            <Play className="w-9 h-9 fill-white text-white stroke-[var(--ink)] stroke-[2.5]" /> PLAY
          </span>
          <span className="mt-1 font-bold text-[15px] text-[#1f4a14]">Shift Odyssey · Level {unlockedLevels}</span>
        </motion.button>

        {/* Modes */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <ModeTile
            color="#ff9f1c" dark="#7a3d00" title="Shift Arena" sub={`${trophies.gold + trophies.silver + trophies.bronze} cups`}
            icon={<Trophy className="w-7 h-7" />}
            onClick={() => { tap(); setMode('tournament'); }}
          />
          <ModeTile
            color="#9b6bff" dark="#3a1a7a" title="Endless" sub={`Best ${highScores['tower-endless'] || 0} tall`}
            icon={<InfinityIcon className="w-7 h-7" />}
            onClick={() => {
              tap();
              useGameStore.getState().setLevel(0);
              useGameStore.getState().setState('playing');
              setMode('endless');
            }}
          />
          <ModeTile
            color="#ff5a5f" dark="#7a1418" title="Daily Ops" sub={`🔥 ${streakCount} day${streakCount === 1 ? '' : 's'} · ${activeMultiplier.toFixed(1)}x`}
            icon={<Flame className="w-7 h-7" />} dot={!streakClaimedToday}
            onClick={() => { tap(); setMode('daily'); }}
          />
        </div>

        {/* Dock */}
        <div className="w-full grid grid-cols-6 gap-1 mt-1">
          {dock.map((d) => (
            <button key={d.key} onClick={() => { tap(); d.onClick(); }} className="flex flex-col items-center gap-1 cursor-pointer" aria-label={d.label}>
              <span className="toon-sm relative w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--ink)]" style={{ background: d.color }}>
                {d.icon}
                {d.badge !== undefined && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-white border-2 border-[var(--ink)] text-[11px] font-game text-[var(--ink)] flex items-center justify-center">{d.badge}</span>
                )}
              </span>
              <span className="text-[11px] font-bold text-[var(--ink)] leading-tight text-center whitespace-nowrap">{d.label}</span>
            </button>
          ))}
        </div>

        {!adsRemoved && (
          <button
            onClick={() => { tap(); useGameStore.getState().setShowRemoveAds(true); }}
            className="mt-1 text-[13px] font-bold text-[var(--ink)]/70 underline decoration-2 underline-offset-4 cursor-pointer"
          >
            🚫 Remove ads
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
