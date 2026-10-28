import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  Layers, 
  Coins, 
  Video, 
  Play, 
  RotateCcw, 
  Home, 
  Sparkles, 
  Star, 
  Flame, 
  Film,
  Award,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useGameStore } from '../../game/store';
import { ZONE_NAMES } from './WorldDefinitions';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';

export interface LevelPerformanceMetrics {
  level: number;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  accuracy: number;         // e.g. 95 (percentage)
  perfectHits: number;      // e.g. 19
  totalBlocks: number;      // e.g. 20
  timeTakenSeconds: number; // e.g. 14.8
  heightReached: number;    // e.g. 20
  heightMeters: number;     // e.g. 50.0
  maxCombo: number;         // e.g. 14
  coinsEarned: number;      // e.g. 150
  stars: number;            // 1 to 3
}

export interface EndOfLevelSummaryProps {
  metrics: LevelPerformanceMetrics;
  onNextLevel: () => void;
  onRetry: () => void;
  onHome: () => void;
  onWatchDoubleCoins?: () => void;
  onViewReplay?: () => void;
  hasReplay?: boolean;
}

export function EndOfLevelSummary({
  metrics,
  onNextLevel,
  onRetry,
  onHome,
  onWatchDoubleCoins,
  onViewReplay,
  hasReplay = false,
}: EndOfLevelSummaryProps) {
  const [revealedStars, setRevealedStars] = useState(0);
  const [claimedDouble, setClaimedDouble] = useState(false);
  const adsRemoved = useGameStore((s) => s.adsRemoved);

  // Biome name from level number
  const zoneIndex = Math.floor((Math.max(1, metrics.level) - 1) / 10) % ZONE_NAMES.length;
  const biomeName = ZONE_NAMES[zoneIndex] || 'The Frontier';

  // Precision rank rating
  const getRank = (accuracy: number) => {
    if (accuracy >= 92) return { label: 'S-RANK', sub: 'APEX PRECISION', color: 'text-amber-300', bg: 'from-amber-400 to-yellow-500', border: 'border-yellow-300' };
    if (accuracy >= 80) return { label: 'A-RANK', sub: 'MASTER BUILDER', color: 'text-cyan-300', bg: 'from-cyan-400 to-blue-500', border: 'border-cyan-300' };
    if (accuracy >= 65) return { label: 'B-RANK', sub: 'SOLID STRUCTURE', color: 'text-purple-300', bg: 'from-purple-400 to-fuchsia-500', border: 'border-purple-300' };
    return { label: 'PASS', sub: 'MISSION CLEARED', color: 'text-emerald-300', bg: 'from-emerald-400 to-teal-500', border: 'border-emerald-300' };
  };

  const rank = getRank(metrics.accuracy);

  // Sequential star animation
  useEffect(() => {
    const starCount = Math.max(1, Math.min(3, metrics.stars));
    const timers: NodeJS.Timeout[] = [];

    for (let i = 1; i <= starCount; i++) {
      const timer = setTimeout(() => {
        setRevealedStars(i);
        audio.playPerfectSound();
        haptics.vibrate([15, 25, 15]);
      }, 350 + i * 280);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [metrics.stars]);

  const formatSeconds = (sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return '0.0s';
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const mins = Math.floor(sec / 60);
    const remainder = (sec % 60).toFixed(1);
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-auto flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
      {/* Darkened Atmospheric Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onNextLevel}
      />

      {/* Main Summary Dialog Card */}
      <motion.div
        initial={{ y: '100%', opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '80%', opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#180d30] via-[#100722] to-[#0a0416] border-t-2 sm:border-2 border-yellow-400/60 rounded-t-3xl sm:rounded-3xl shadow-[0_-12px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(250,204,21,0.2)] p-4 sm:p-6 text-white flex flex-col max-h-[92vh] overflow-y-auto select-none z-10"
      >
        {/* Top Decorative Grab Handle (Mobile UX) */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

        {/* Level Header Banner */}
        <div className="text-center relative pb-3 border-b border-white/10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 font-mono bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              LEVEL {metrics.level} • {biomeName}
            </span>
          </div>

          <motion.h2 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 drop-shadow-[0_2px_10px_rgba(250,204,21,0.4)] font-mono"
          >
            LEVEL CLEARED!
          </motion.h2>

          {/* Rank Badge */}
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <div className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black tracking-wider uppercase bg-gradient-to-r ${rank.bg} text-black border ${rank.border} shadow-sm`}>
              {rank.label}
            </div>
            <span className="text-xs text-white/70 font-mono tracking-wider">
              {rank.sub}
            </span>
          </div>

          {/* 3-Star Rating Animation */}
          <div className="flex items-center justify-center gap-3 mt-3">
            {[1, 2, 3].map((starIndex) => {
              const isFilled = revealedStars >= starIndex;
              return (
                <motion.div
                  key={starIndex}
                  initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
                  animate={isFilled ? { scale: [0.5, 1.35, 1], rotate: 0, opacity: 1 } : { scale: 0.8, opacity: 0.35 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 350 }}
                  className="relative"
                >
                  <Star 
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-all ${
                      isFilled 
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]' 
                        : 'text-white/20 fill-white/5'
                    }`} 
                  />
                  {isFilled && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-yellow-300 rounded-full blur-xs pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Primary Performance Metrics Cards (Exact User Requirements) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
          {/* 1. Accuracy Metric Card */}
          <div className="bg-gradient-to-b from-[#1b253b] to-[#0e1726] border border-cyan-400/40 rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase font-mono">
                ACCURACY
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono leading-none">
                {metrics.accuracy}%
              </div>
              <div className="text-[10px] text-white/60 font-mono mt-1">
                {metrics.perfectHits} / {metrics.totalBlocks} Perfect
              </div>
            </div>
            {/* Visual accuracy progress micro-bar */}
            <div className="w-full bg-black/40 h-1 rounded-full mt-2 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(5, metrics.accuracy))}%` }}
              />
            </div>
          </div>

          {/* 2. Time Taken Metric Card */}
          <div className="bg-gradient-to-b from-[#2a1738] to-[#160c20] border border-purple-400/40 rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase font-mono">
                TIME TAKEN
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono leading-none">
                {formatSeconds(metrics.timeTakenSeconds)}
              </div>
              <div className="text-[10px] text-white/60 font-mono mt-1">
                {metrics.totalBlocks > 0 
                  ? `${(metrics.timeTakenSeconds / Math.max(1, metrics.totalBlocks)).toFixed(2)}s / block` 
                  : 'Fast Pace'}
              </div>
            </div>
            <div className="w-full bg-black/40 h-1 rounded-full mt-2 overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full w-full" />
            </div>
          </div>

          {/* 3. Height Reached Metric Card */}
          <div className="bg-gradient-to-b from-[#2d2110] to-[#181108] border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 text-center shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase font-mono">
                HEIGHT
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono leading-none">
                {metrics.heightReached} <span className="text-xs text-amber-400/80 font-normal">BLKS</span>
              </div>
              <div className="text-[10px] text-white/60 font-mono mt-1">
                {metrics.heightMeters.toFixed(1)}m Tower
              </div>
            </div>
            <div className="w-full bg-black/40 h-1 rounded-full mt-2 overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* Secondary Stats Row: Score & Streak */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-mono mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <div>
              <div className="text-[10px] text-white/50 uppercase">TOTAL SCORE</div>
              <div className="text-base font-black text-yellow-300">
                {metrics.score.toLocaleString()}
                {metrics.isNewHighScore && (
                  <span className="ml-2 text-[10px] bg-red-500 text-white px-1.5 py-0.2 rounded-md font-bold uppercase animate-pulse">
                    NEW RECORD!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-[10px] text-white/50 uppercase">MAX STREAK</div>
              <div className="text-base font-black text-orange-400 flex items-center justify-end gap-1">
                <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                {metrics.maxCombo}x COMBO
              </div>
            </div>
          </div>
        </div>

        {/* Coin Rewards & Double Coins Rewarded Ad Banner */}
        <div className="bg-gradient-to-r from-yellow-500/15 via-amber-500/20 to-yellow-500/15 border border-yellow-400/40 rounded-2xl p-3 sm:p-4 mb-4 text-center relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-left font-mono">
                <div className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider">
                  {claimedDouble ? 'REWARD DOUBLED (2X)' : 'REWARD EARNED'}
                </div>
                <div className="text-xl font-black text-white flex items-center gap-1.5">
                  <span>+{claimedDouble ? metrics.coinsEarned * 2 : metrics.coinsEarned} COINS</span>
                  {claimedDouble && (
                    <span className="text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full border border-yellow-200">
                      2X APPLIED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Rewarded Ad Double Button */}
            {onWatchDoubleCoins && !claimedDouble && (
              <button
                onClick={() => {
                  audio.playClickSound();
                  haptics.vibrate([20]);
                  setClaimedDouble(true);
                  onWatchDoubleCoins();
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-yellow-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-yellow-200"
              >
                {adsRemoved ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> : <Video className="w-3.5 h-3.5" />}
                <span>{adsRemoved ? 'VIP 2X FREE' : '2X COINS'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="space-y-2 pt-1">
          {/* Primary Action: NEXT LEVEL */}
          <button
            onClick={() => {
              audio.playClickSound();
              haptics.vibrate([25]);
              onNextLevel();
            }}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#0d9488,0_8px_20px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2 border-2 border-emerald-200 cursor-pointer active:translate-y-1 active:shadow-none transition-all"
          >
            <span>NEXT LEVEL</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* RETRY */}
            <button
              onClick={() => {
                audio.playClickSound();
                haptics.vibrate([15]);
                onRetry();
              }}
              className="py-2.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Retry for better score or 3 stars"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>

            {/* REPLAY */}
            {hasReplay && onViewReplay ? (
              <button
                onClick={() => {
                  audio.playClickSound();
                  haptics.vibrate([15]);
                  onViewReplay();
                }}
                className="py-2.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 text-cyan-300 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Watch Replay of this build"
              >
                <Film className="w-3.5 h-3.5" />
                <span>REPLAY</span>
              </button>
            ) : (
              <div className="py-2.5 px-2 bg-white/5 border border-white/5 text-white/30 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SAVED</span>
              </div>
            )}

            {/* HOME / MAP */}
            <button
              onClick={() => {
                audio.playClickSound();
                haptics.vibrate([15]);
                onHome();
              }}
              className="py-2.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Return to World Map"
            >
              <Home className="w-3.5 h-3.5" />
              <span>MAP</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
