import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Coins, ShoppingBag, Infinity as InfinityIcon, Calendar, Play, Plus, Trophy, ShieldCheck, Zap, Vibrate, VibrateOff, ChevronRight, Flame, Settings } from 'lucide-react';
import { useDailyStore, getStreakMultiplier } from '../game/dailyStore';
import { TacticalRechargeModal } from './TacticalRechargeModal';
import { AchievementsModal } from './achievements/AchievementsModal';
import { AchievementBadge } from './achievements/AchievementBadge';
import { ACHIEVEMENTS, getAchievementCurrentValue } from '../game/achievements';
import { haptics } from '../utils/haptics';
import { audio } from '../audio/AudioEngine';
import { ReplayViewer } from './ReplayViewer';

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
  } = useGameStore();

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedAchievements[a.id]?.unlocked).length;
  const unclaimedCount = ACHIEVEMENTS.filter(
    (a) => unlockedAchievements[a.id]?.unlocked && !unlockedAchievements[a.id]?.claimed
  ).length;

  const streakCount = useDailyStore((s) => s.streakCount);
  const streakClaimedToday = useDailyStore((s) => s.streakClaimedToday);
  const activeMultiplier = getStreakMultiplier(streakCount);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain flex flex-col items-center relative z-10 px-4 py-3"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="w-full max-w-md flex flex-col items-center space-y-3.5 pb-20 pt-1">
        
        {/* TOP HUD BAR */}
        <header className="w-full flex items-center justify-between z-30 pt-1 px-1 gap-2">
          {/* PLAYER PROFILE / TOURNAMENT BADGE */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode('tournament')}
            className="relative flex items-center gap-2 bg-gradient-to-r from-black/70 via-slate-900/80 to-black/70 hover:from-black/90 hover:to-slate-800/90 pl-2.5 pr-3.5 py-1.5 rounded-2xl border-2 border-yellow-400/50 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer transition-all active:scale-95 shrink-0 overflow-hidden"
            aria-label="Player Profile and Tournaments"
          >
            {/* Subtle dot texture */}
            <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />

            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-sm border border-white/60 shadow-md shrink-0 relative z-10">
              {playerAvatar}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-yellow-300 drop-shadow relative z-10 font-mono">
              <Trophy className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300/40" />
              <span>{trophies.gold + trophies.silver + trophies.bronze} Cups</span>
            </div>
          </motion.button>

          <div className="flex items-center gap-2">
            {/* SETTINGS OVERLAY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                haptics.uiTap();
                audio.playBuildSound(1.1);
                setSettingsModalOpen(true);
              }}
              className="p-2 rounded-2xl border-2 border-cyan-400/60 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer transition-all active:scale-95 flex items-center justify-center"
              title="Game Settings: Audio & Visual Themes"
              aria-label="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            {/* HAPTICS TOGGLE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                toggleHaptics();
                if (!hapticsEnabled) {
                  haptics.vibrate([18, 30, 25]);
                }
              }}
              className={`p-2 rounded-2xl border-2 backdrop-blur-md shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center ${
                hapticsEnabled
                  ? 'bg-cyan-950/70 border-cyan-400/70 text-cyan-300 hover:bg-cyan-900/70 shadow-[0_0_12px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-black/50 border-white/20 text-white/40 hover:bg-black/70 shadow-sm'
              }`}
              title={hapticsEnabled ? 'Haptic Feedback: ON' : 'Haptic Feedback: OFF'}
              aria-label="Toggle Haptic Feedback"
            >
              {hapticsEnabled ? <Vibrate className="w-4 h-4 text-cyan-300" /> : <VibrateOff className="w-4 h-4 text-white/40" />}
            </motion.button>

            {/* COINS HUD */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowIAP(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-black/70 via-slate-900/80 to-black/70 hover:from-black/90 hover:to-slate-800/90 pl-3 pr-2.5 py-1.5 rounded-2xl border-2 border-yellow-400/60 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer transition-all active:scale-95 shrink-0 overflow-hidden"
              aria-label="Coins Balance - Click to purchase coins"
              title="Get More Coins (Coin Purchase Vault)"
            >
              {/* Subtle dot texture */}
              <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />

              <Coins className="w-4 h-4 text-[#FFD700] fill-[#FFD700] drop-shadow relative z-10" />
              <span className="text-white font-black text-sm tabular-nums tracking-wide drop-shadow-md relative z-10 font-mono">
                {coins.toLocaleString()}
              </span>
              <div className="bg-gradient-to-tr from-[#FFD700] to-amber-300 text-amber-950 rounded-lg p-0.5 shadow-sm relative z-10 border border-amber-200">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </motion.button>
          </div>
        </header>

        {/* GAME TITLE */}
        <div className="text-center relative w-full flex flex-col items-center shrink-0 pt-1">
          <div className="flex items-center justify-center gap-2">
            <motion.h1 
              animate={{ y: [0, -3, 0], rotate: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-5xl sm:text-6xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-600 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] leading-none font-mono"
            >
              BUILD
            </motion.h1>
            
            <div className="text-xs font-black text-cyan-300 tracking-widest bg-slate-950/90 px-2.5 py-1 rounded-lg border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-mono">
              //
            </div>

            <motion.h1 
              animate={{ y: [0, 3, 0], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="text-5xl sm:text-6xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-500 to-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] leading-none font-mono"
            >
              BOOM
            </motion.h1>
          </div>
          <p className="text-cyan-400/80 text-[11px] font-mono uppercase tracking-[0.25em] font-bold mt-1.5 drop-shadow">
            TACTICAL TOWER PHYSICS
          </p>
        </div>

        {/* PRIMARY HERO: CAMPAIGN MODE */}
        <div className="w-full flex items-center justify-center relative z-20 pt-1">
          <motion.button 
            className="w-full max-w-sm relative flex flex-col items-center justify-center group cursor-pointer select-none"
            onClick={() => setMode('campaign')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Realistic Dimensional Staging Deck */}
            <div className="relative flex items-center justify-center w-52 h-36">
              {/* Soft Ambient Depth Glow underneath */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-44 h-8 bg-cyan-500/20 blur-xl rounded-full pointer-events-none" />

              {/* Base Heavy Alloy & Polished Platform */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-14 bg-gradient-to-b from-slate-800 to-slate-950 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] border-2 border-cyan-500/50" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-xl border border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center">
                <div className="w-full h-full bg-tactical-dots opacity-20 rounded-xl pointer-events-none" />
              </div>
              
              {/* Stacked Realistic Thematic Blocks: Amber Gem, Ruby Crystal, Amethyst Prism */}
              <div className="absolute bottom-8 left-[35%] w-11 h-11 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 rounded-lg border border-amber-200/80 shadow-[0_4px_12px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] transform -rotate-12 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]" />
              </div>
              <div className="absolute bottom-14 left-[47%] w-11 h-11 bg-gradient-to-br from-rose-400 via-pink-600 to-rose-900 rounded-lg border border-rose-300/80 shadow-[0_4px_12px_rgba(244,63,94,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] transform rotate-6 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-rose-200 shadow-[0_0_6px_#fbcfe8]" />
              </div>
              <div className="absolute bottom-22 left-[43%] w-11 h-11 bg-gradient-to-br from-purple-300 via-indigo-600 to-purple-950 rounded-lg border border-purple-300/80 shadow-[0_4px_12px_rgba(168,85,247,0.5),inset_0_1px_2px_rgba(255,255,255,0.6)] transform -rotate-3 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-purple-200 shadow-[0_0_6px_#e9d5ff]" />
              </div>
              
              {/* Center Holographic Play Emitter */}
              <motion.div 
                animate={{ scale: [1, 1.08, 1], rotate: [0, 180, 360] }}
                transition={{ scale: { repeat: Infinity, duration: 2.2 }, rotate: { repeat: Infinity, duration: 20, ease: 'linear' } }}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-14 bg-cyan-950/60 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                <div className="absolute inset-1 rounded-full border border-dashed border-cyan-300/40" />
                <Play className="w-6 h-6 text-cyan-300 fill-cyan-300 ml-0.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </motion.div>
            </div>

            {/* Campaign Action Pill */}
            <div className="relative bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 px-8 py-2.5 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] z-30 transform group-hover:scale-105 transition-all -mt-3 text-center">
              <span className="text-xl font-black text-cyan-300 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] font-mono">
                PLAY CAMPAIGN
              </span>
              <div className="text-[10px] font-bold text-cyan-200/80 uppercase tracking-widest font-mono">
                WORLD EXPEDITION • LEVEL {unlockedLevels} / 200
              </div>
            </div>
          </motion.button>
        </div>

        {/* TOURNAMENT LIVE BANNER */}
        <div className="w-full z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('tournament')}
            className="w-full relative bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-600 p-3 rounded-2xl border-3 border-amber-300 shadow-[0_6px_0_#9a3412,0_10px_25px_rgba(245,158,11,0.4)] flex items-center justify-between cursor-pointer group select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
          >
            {/* Tactical Dot Overlay */}
            <div className="absolute inset-0 bg-tactical-dots opacity-15 pointer-events-none" />

            {/* Corner Rivets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/50 border border-black/40 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/50 border border-black/40 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/50 border border-black/40 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-white/50 border border-black/40 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/50 flex items-center justify-center text-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] shrink-0">
                🏆
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white uppercase tracking-wider drop-shadow-md">
                    TOURNAMENTS
                  </span>
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse border border-white/40 shadow-xs">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] font-black text-amber-950/90 uppercase tracking-tight font-mono">
                  Global Ranked Arena • Cups & Rewards
                </span>
              </div>
            </div>
            <div className="bg-black/30 group-hover:bg-black/40 rounded-xl p-2.5 text-white transition-colors border border-white/30 relative z-10 shadow-sm">
              <Trophy className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>
          </motion.button>
        </div>

        {/* TACTICAL ARSENAL: BUY POWER-UPS WITH COINS & ADS */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setArmoryOpen(true)}
          className="relative w-full bg-gradient-to-r from-[#0c1a30] via-[#102447] to-[#0c1a30] border-2 border-cyan-400/80 rounded-2xl p-3 shadow-[0_5px_0_#0284c7,0_8px_20px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2.5 z-20 cursor-pointer select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
        >
          {/* Subtle Hazard Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-hazard-stripes opacity-40 pointer-events-none" />

          {/* Tactical Dot Underlay */}
          <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />

          {/* Rivets */}
          <div className="absolute top-1.5 right-2 w-1 h-1 rounded-full bg-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-1.5 right-2 w-1 h-1 rounded-full bg-cyan-400/60 pointer-events-none" />

          <div className="flex items-center gap-2.5 min-w-0 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-xl shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
              ⚡
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                <span>TACTICAL ARSENAL</span>
                <span className="text-amber-300">• MUNITIONS</span>
              </div>
              <div className="text-xs font-black text-white truncate flex items-center gap-2.5 mt-0.5 font-mono">
                <span className="bg-black/40 px-1.5 py-0.5 rounded border border-cyan-400/30">⏳ {powerups.stasis}</span>
                <span className="bg-black/40 px-1.5 py-0.5 rounded border border-cyan-400/30">⚡ {powerups.emp}</span>
                <span className="bg-black/40 px-1.5 py-0.5 rounded border border-cyan-400/30">🛡️ {powerups.shield}</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setArmoryOpen(true);
            }}
            className="relative z-10 px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_2px_0_#b45309] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all border border-amber-200 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 fill-current" />
            <span>Recharge</span>
          </button>
        </motion.div>

        {/* GAME REPLAY: 10-SECOND PHYSICS PLAYBACK */}
        <div className="w-full z-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              haptics.uiTap();
              setReplayModalOpen(true);
            }}
            className="w-full relative bg-gradient-to-r from-[#0d1f2d] via-[#132c3f] to-[#0a1824] p-3 rounded-2xl border-2 border-cyan-400/80 shadow-[0_5px_0_#0e7490,0_10px_25px_rgba(6,182,212,0.3)] flex items-center justify-between cursor-pointer group select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
          >
            {/* Cyber scanline & blueprint texture */}
            <div className="absolute inset-0 bg-cyber-scanlines opacity-15 pointer-events-none" />

            {/* Corner Rivets */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/70 flex items-center justify-center text-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] shrink-0">
                📼
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-white uppercase tracking-wider drop-shadow font-mono">
                    GAME REPLAY
                  </span>
                  <span className="bg-cyan-500/30 text-cyan-300 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase border border-cyan-400/40 font-mono">
                    LAST 10s
                  </span>
                  {lastReplay && (
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase font-mono border ${
                        lastReplay.finalOutcome === 'won'
                          ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300'
                          : 'bg-red-950/80 border-red-500/60 text-red-300'
                      }`}
                    >
                      {lastReplay.finalOutcome === 'won' ? 'CLEARED' : 'BOOM'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-cyan-200/80 truncate mt-0.5 flex items-center gap-1.5">
                  <span>Tilt: {lastReplay ? `${lastReplay.maxTilt}°` : '0°'}</span>
                  <span>•</span>
                  <span>{lastReplay ? `${lastReplay.blocksPlaced} Blocks` : '0 Blocks'}</span>
                  <span>•</span>
                  <span>{lastReplay ? `${lastReplay.finalScore} Pts` : '0 Pts'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                haptics.uiTap();
                setReplayModalOpen(true);
              }}
              className="relative z-10 px-3 py-2 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_2px_0_#0284c7] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all border border-white/60 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Watch</span>
            </button>
          </motion.div>
        </div>

        {/* DUAL SPECIALIST MODULES: ARCHITECT ACADEMY & BLUEPRINT LAB */}
        <div className="grid grid-cols-2 gap-2.5 w-full z-20">
          {/* ARCHITECT ACADEMY */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playBuildSound(1.2);
              haptics.uiTap();
              useGameStore.getState().setState('idle');
              setMode('academy');
            }}
            className="relative p-3 rounded-2xl bg-gradient-to-br from-[#0c1938] via-[#0f244c] to-[#0c1938] border-2 border-cyan-400/80 shadow-[0_4px_0_#0369a1,0_6px_15px_rgba(0,0,0,0.5)] text-left cursor-pointer flex items-center gap-2.5 select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
            aria-label="Architect Academy"
          >
            {/* Blueprint Grid Texture */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-15 pointer-events-none" />

            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-lg shrink-0 shadow-inner relative z-10">
              ⚡
            </div>
            <div className="min-w-0 relative z-10">
              <div className="text-[9px] font-mono text-cyan-300 font-bold tracking-wider uppercase flex items-center gap-1">
                <span>TECH MATRIX</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="text-xs font-black text-white uppercase tracking-tight truncate">
                Academy
              </div>
            </div>
          </motion.button>

          {/* BLUEPRINT LAB */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('workshop')}
            className="relative p-3 rounded-2xl bg-gradient-to-br from-[#18112e] via-[#24133d] to-[#18112e] border-2 border-fuchsia-400/80 shadow-[0_4px_0_#701a75,0_6px_15px_rgba(0,0,0,0.5)] text-left cursor-pointer flex items-center gap-2.5 select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
          >
            {/* Tactical Dots Texture */}
            <div className="absolute inset-0 bg-tactical-dots opacity-15 pointer-events-none" />

            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center text-lg shrink-0 shadow-inner relative z-10">
              🔬
            </div>
            <div className="min-w-0 relative z-10">
              <div className="text-[9px] font-mono text-fuchsia-300 font-bold tracking-wider uppercase flex items-center gap-1">
                <span>SANDBOX</span>
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              </div>
              <div className="text-xs font-black text-white uppercase tracking-tight truncate">
                Blueprint Lab
              </div>
            </div>
          </motion.button>
        </div>

        {/* MILESTONES & UNLOCK BADGES SHOWCASE */}
        <div className="w-full z-20">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative w-full bg-gradient-to-b from-[#141b2d] via-[#101625] to-[#141b2d] border-2 border-amber-400/80 rounded-2xl p-3 shadow-[0_5px_0_#b45309,0_8px_20px_rgba(0,0,0,0.6)] flex flex-col gap-2 select-none overflow-hidden"
          >
            {/* Blueprint Grid underlay */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />

            {/* Corner Rivets */}
            <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-amber-400/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-amber-400/60 pointer-events-none" />

            {/* Header: Title + Unlocked Count + View All */}
            <div className="flex items-center justify-between relative z-10">
              <button
                onClick={() => {
                  haptics.uiTap();
                  setAchievementsModalOpen(true);
                }}
                className="flex items-center gap-2 group cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-base shadow-inner shrink-0">
                  🏅
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-white uppercase tracking-wider group-hover:text-yellow-300 transition-colors drop-shadow">
                      Hall of Records & Badges
                    </span>
                    {unclaimedCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase animate-pulse border border-emerald-300">
                        +{unclaimedCount} Claim
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300/90">
                    {unlockedCount} / {totalAchievements} Unlocked
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  haptics.uiTap();
                  setAchievementsModalOpen(true);
                }}
                className="flex items-center gap-0.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors uppercase font-mono px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer border border-amber-400/30"
              >
                <span>View Vault</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Badges Horizontal Showcase */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 relative z-10 bg-black/40 rounded-xl border border-white/10 p-1.5">
              {ACHIEVEMENTS.map((ach) => {
                const status = unlockedAchievements[ach.id];
                const isUnlocked = !!status?.unlocked;
                const isClaimed = !!status?.claimed;
                const curVal = getAchievementCurrentValue(
                  ach.id,
                  achievementStats,
                  unlockedLevels,
                  highScores,
                  coins
                );
                const progressPercent = Math.min(100, Math.round((curVal / ach.target) * 100));

                return (
                  <div key={ach.id} className="shrink-0 flex flex-col items-center">
                    <AchievementBadge
                      achievement={ach}
                      isUnlocked={isUnlocked}
                      isClaimed={isClaimed}
                      progressPercent={progressPercent}
                      size="sm"
                      onClick={() => {
                        haptics.uiTap();
                        setSelectedAchievementId(ach.id);
                        setAchievementsModalOpen(true);
                      }}
                    />
                    <span className={`text-[9px] font-bold tracking-tight truncate max-w-[50px] text-center mt-0.5 ${
                      isUnlocked ? 'text-amber-300' : 'text-white/40'
                    }`}>
                      {ach.title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ARCADE MODES: ENDLESS & DAILY */}
        <div className="grid grid-cols-2 gap-2.5 w-full z-20">
          {/* ENDLESS */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              useGameStore.getState().setLevel(0);
              useGameStore.getState().setState('playing');
              setMode('endless');
            }}
            className="relative p-3 rounded-2xl bg-gradient-to-br from-purple-800 via-fuchsia-900 to-purple-950 border-2 border-purple-400/80 shadow-[0_4px_0_#581c87,0_6px_15px_rgba(0,0,0,0.5)] text-left cursor-pointer flex items-center gap-2.5 select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
          >
            {/* Scanlines texture */}
            <div className="absolute inset-0 bg-cyber-scanlines opacity-20 pointer-events-none" />

            <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-300/50 flex items-center justify-center shrink-0 shadow-inner relative z-10">
              <InfinityIcon className="w-5 h-5 text-purple-200" />
            </div>
            <div className="min-w-0 relative z-10">
              <div className="text-xs font-black text-white uppercase tracking-tight truncate drop-shadow">
                Endless Mode
              </div>
              <div className="text-[9px] font-mono font-bold text-purple-200/90 uppercase truncate">
                Record: {highScores['endless'] || 0}
              </div>
            </div>
          </motion.button>

          {/* DAILY MISSIONS */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode('daily')}
            className="relative p-3 rounded-2xl bg-gradient-to-br from-orange-700 via-amber-800 to-orange-950 border-2 border-amber-400/80 shadow-[0_4px_0_#78350f,0_6px_15px_rgba(0,0,0,0.5)] text-left cursor-pointer flex items-center gap-2.5 select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
          >
            {/* Scanlines texture */}
            <div className="absolute inset-0 bg-cyber-scanlines opacity-20 pointer-events-none" />

            <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-300/50 flex items-center justify-center shrink-0 shadow-inner relative z-10">
              <Flame className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
            </div>
            <div className="min-w-0 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white uppercase tracking-tight truncate drop-shadow">
                  Daily Ops
                </span>
                <span className="px-1 py-0.2 rounded bg-amber-400/30 text-amber-200 border border-amber-300/40 text-[8px] font-black">
                  {activeMultiplier.toFixed(2)}x
                </span>
                {!streakClaimedToday && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[8px] font-black uppercase animate-pulse border border-emerald-300">
                    🎁 REWARDS
                  </span>
                )}
              </div>
              <div className="text-[9px] font-mono font-bold text-amber-200/90 uppercase truncate flex items-center gap-1">
                <span>🔥 {streakCount}d Streak</span>
                <span>•</span>
                <span>7d Calendar</span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* BOTTOM UTILITY BAR: SHOP & AD CONTROLS */}
        <div className="w-full pt-1 flex items-center justify-between gap-3 z-20">
          {/* SHOP BUTTON */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode('shop')}
            className="relative flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-3 border-white shadow-[0_4px_0_#b45309,0_6px_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer select-none active:translate-y-1 active:shadow-none transition-all overflow-hidden"
            aria-label="Cosmetic Shop"
          >
            <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />
            <ShoppingBag className="w-5 h-5 text-amber-950 relative z-10" />
            <span className="font-black text-xs md:text-sm text-amber-950 uppercase tracking-wider relative z-10 font-mono">
              Locker & Shop
            </span>
          </motion.button>

          {/* REMOVE ADS / AD-FREE STATUS */}
          {!adsRemoved ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => useGameStore.getState().setShowRemoveAds(true)}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-700 border-3 border-white shadow-[0_4px_0_#8B0000,0_6px_15px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer select-none active:translate-y-1 active:shadow-none transition-all"
              aria-label="Remove Ads"
            >
              <span className="font-black text-white text-xs uppercase tracking-wide">
                🚫 No Ads
              </span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 py-2 px-3 rounded-2xl bg-black/60 border-2 border-emerald-400/50 text-white/90 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-300">
                VIP Ad-Free
              </span>
              <button 
                onClick={() => useGameStore.getState().restoreAds()}
                className="text-[9px] text-white/50 hover:text-white underline ml-1 cursor-pointer font-mono"
                title="Restore Ads for dev testing"
              >
                Reset
              </button>
            </div>
          )}
        </div>

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
