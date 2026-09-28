import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, X } from 'lucide-react';
import { useGameStore } from '../../game/store';
import { TIER_COLORS } from '../../game/achievements';
import { haptics } from '../../utils/haptics';

interface Props {
  onOpenAchievements?: () => void;
}

export function AchievementUnlockToast({ onOpenAchievements }: Props) {
  const { recentUnlockedAchievement, dismissAchievementToast } = useGameStore();

  useEffect(() => {
    if (recentUnlockedAchievement) {
      const timer = setTimeout(() => {
        dismissAchievementToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentUnlockedAchievement, dismissAchievementToast]);

  if (!recentUnlockedAchievement) return null;

  const tier = TIER_COLORS[recentUnlockedAchievement.tier];

  return (
    <AnimatePresence>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => {
            haptics.uiTap();
            dismissAchievementToast();
            if (onOpenAchievements) onOpenAchievements();
          }}
          className={`pointer-events-auto max-w-sm w-full bg-[#0d172b]/95 border-2 ${tier.border} rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-pointer flex items-center justify-between gap-3 ${tier.glow}`}
        >
          {/* Badge Icon Medallion */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.bg} border-2 ${tier.border} flex items-center justify-center text-2xl shrink-0 shadow-inner`}>
            {recentUnlockedAchievement.badgeIcon}
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                ACHIEVEMENT UNLOCKED
              </span>
            </div>
            <div className="text-xs font-black text-white uppercase tracking-wider truncate">
              {recentUnlockedAchievement.title}
            </div>
            <div className="text-[11px] text-white/70 line-clamp-1">
              {recentUnlockedAchievement.description}
            </div>
          </div>

          {/* Reward Pill */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
              <Coins className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>+{recentUnlockedAchievement.rewardCoins}</span>
            </div>
            <span className="text-[9px] text-white/40 font-mono underline">Tap to view</span>
          </div>

          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissAchievementToast();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
