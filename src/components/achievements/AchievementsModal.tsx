import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Coins, CheckCircle2, Lock, Gift, Sparkles, Filter } from 'lucide-react';
import { useGameStore } from '../../game/store';
import { ACHIEVEMENTS, getAchievementCurrentValue, TIER_COLORS, Achievement } from '../../game/achievements';
import { AchievementBadge } from './AchievementBadge';
import { haptics } from '../../utils/haptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedAchievementId?: string | null;
}

export function AchievementsModal({ isOpen, onClose, selectedAchievementId }: Props) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'stacking' | 'precision' | 'hazard' | 'career'>('all');
  
  const {
    achievementStats,
    unlockedAchievements,
    unlockedLevels,
    highScores,
    coins,
    claimAchievement,
  } = useGameStore();

  if (!isOpen) return null;

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedAchievements[a.id]?.unlocked).length;
  const unclaimedCount = ACHIEVEMENTS.filter(
    (a) => unlockedAchievements[a.id]?.unlocked && !unlockedAchievements[a.id]?.claimed
  ).length;

  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    if (activeCategory === 'all') return true;
    return ach.category === activeCategory;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
        {/* Backdrop Overlay */}
        <div 
          onClick={onClose}
          onTouchStart={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto cursor-pointer"
        />

        {/* Bottom Center Modal Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#141b2e] via-[#0d1322] to-[#141b2e] border-t-3 sm:border-2 border-amber-400/80 rounded-t-3xl sm:rounded-3xl shadow-[0_-12px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col pointer-events-auto z-50 touch-pan-y max-h-[85vh]"
        >
          {/* Top Grab Handle */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mt-2.5 mb-1 shrink-0 cursor-pointer" onClick={onClose} />
          {/* Blueprint Grid underlay */}
          <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />

          {/* Corner Rivets */}
          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 pointer-events-none" />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-white/40 border border-black/50 pointer-events-none" />

          {/* Header Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/25 via-transparent to-transparent pointer-events-none" />

          {/* Modal Header */}
          <div className="relative p-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center text-amber-950 font-black border-2 border-white/40 shrink-0">
                <Trophy className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 drop-shadow">
                  <span>Hall of Records & Badges</span>
                </h2>
                <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5 font-mono">
                  <span>{unlockedCount} of {totalAchievements} Unlocked</span>
                  {unclaimedCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse border border-emerald-300">
                      {unclaimedCount} REWARDS READY
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                haptics.uiTap();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="px-5 pt-3 pb-2 shrink-0 z-10">
            <div className="flex justify-between items-center text-[11px] font-mono font-bold text-white/70 mb-1">
              <span>ARCHITECT MASTERY</span>
              <span>{Math.round((unlockedCount / totalAchievements) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/15 p-0.5 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-b border-white/10 z-10 bg-black/30">
            {[
              { id: 'all', label: 'All' },
              { id: 'stacking', label: '🧱 Stacking' },
              { id: 'precision', label: '🎯 Precision' },
              { id: 'hazard', label: '💣 Hazards' },
              { id: 'career', label: '👑 Career' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.uiTap();
                  setActiveCategory(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer font-mono ${
                  activeCategory === tab.id
                    ? 'bg-amber-400 text-amber-950 shadow-md scale-102 border border-white/40'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Achievement Cards Scrollable List */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 z-10 custom-scrollbar">
            {filteredAchievements.map((ach) => {
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
              const tierTheme = TIER_COLORS[ach.tier];

              return (
                <div
                  key={ach.id}
                  className={`relative p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 overflow-hidden ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-[#17223b] to-[#121c2e] border-amber-400/60 shadow-[0_4px_15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  {/* Subtle scanline overlay */}
                  <div className="absolute inset-0 bg-cyber-scanlines opacity-10 pointer-events-none" />

                  {/* Left: Badge Icon */}
                  <div className="relative z-10">
                    <AchievementBadge
                      achievement={ach}
                      isUnlocked={isUnlocked}
                      isClaimed={isClaimed}
                      progressPercent={progressPercent}
                      size="md"
                    />
                  </div>

                  {/* Middle: Details & Progress Bar */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                        {ach.title}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${tierTheme.ribbon}`}
                      >
                        {tierTheme.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/70 line-clamp-2 leading-tight mb-2">
                      {ach.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full">
                      <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mb-1">
                        <span>
                          {Math.min(curVal, ach.target)} / {ach.target}
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                              : 'bg-amber-400/80'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Reward or Claim Button */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5 pl-1 relative z-10">
                    {/* Unlocked & Unclaimed: Actionable Claim Button */}
                    {isUnlocked && !isClaimed ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => claimAchievement(ach.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300 flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Claim +{ach.rewardCoins}</span>
                      </motion.button>
                    ) : isClaimed ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300/80 font-mono bg-amber-950/30 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>+{ach.rewardCoins}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-white/60 shrink-0 z-10">
            <span className="font-mono text-[11px]">Keep stacking towers to unlock elite badges!</span>
            <button
              onClick={() => {
                haptics.uiTap();
                onClose();
              }}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 rounded-xl font-black uppercase transition-all cursor-pointer text-xs shadow-md font-mono"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
