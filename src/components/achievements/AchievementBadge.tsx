import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Sparkles } from 'lucide-react';
import { Achievement, TIER_COLORS } from '../../game/achievements';

interface Props {
  achievement: Achievement;
  isUnlocked: boolean;
  isClaimed?: boolean;
  progressPercent: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showTooltip?: boolean;
}

export function AchievementBadge({
  achievement,
  isUnlocked,
  isClaimed = false,
  progressPercent,
  size = 'md',
  onClick,
}: Props) {
  const tierStyle = TIER_COLORS[achievement.tier];

  const sizeClasses = {
    sm: 'w-11 h-11 text-base',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const containerSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center cursor-pointer select-none rounded-2xl transition-all ${containerSizes[size]}`}
      title={`${achievement.title} (${isUnlocked ? 'Unlocked' : `${Math.round(progressPercent)}%`})`}
      aria-label={`${achievement.title} badge`}
    >
      {/* Badge Medallion */}
      <div
        className={`relative ${sizeClasses[size]} rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
          isUnlocked
            ? `bg-gradient-to-br ${tierStyle.bg} ${tierStyle.border} ${tierStyle.glow}`
            : 'bg-black/60 border-white/15 opacity-70 grayscale hover:grayscale-0 hover:opacity-90'
        }`}
      >
        {/* Tier shimmer highlight for unlocked badges */}
        {isUnlocked && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />
        )}

        {/* Center Icon */}
        <span className={`relative z-10 drop-shadow-md select-none transform ${isUnlocked ? 'scale-100 group-hover:scale-110 transition-transform' : 'scale-90 opacity-60'}`}>
          {achievement.badgeIcon}
        </span>

        {/* Lock Overlay if locked */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-[0.5px]">
            <Lock className="w-3.5 h-3.5 text-white/70 drop-shadow" />
          </div>
        )}

        {/* Checkmark or Sparkle on unlocked */}
        {isUnlocked && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-sm">
            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
          </div>
        )}

        {/* Unclaimed Sparkle Ping */}
        {isUnlocked && !isClaimed && (
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400 border border-white"></span>
          </span>
        )}
      </div>

      {/* Mini Progress Ring / Indicator for Small Display if Locked */}
      {!isUnlocked && size === 'sm' && (
        <div className="w-full mt-1 bg-white/10 h-1 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </motion.button>
  );
}
