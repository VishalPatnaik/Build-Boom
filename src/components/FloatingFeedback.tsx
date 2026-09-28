import React from 'react';
import { motion } from 'framer-motion';

export interface FloatingMultiplierData {
  id: string;
  x: number;
  y: number;
  multiplier: number;
  comboCount: number;
  points: number;
  label: string;
  bonusTag?: string;
  tier: 1 | 2 | 3 | 4 | 5;
  isPerfect: boolean;
  archetype?: string;
  rotation: number;
}

interface FloatingFeedbackProps {
  items: FloatingMultiplierData[];
  onItemComplete: (id: string) => void;
  activeCombo: number;
}

// Color palettes and styles by tier
const TIER_STYLES = {
  1: {
    badgeGrad: 'from-amber-400 via-yellow-400 to-amber-500',
    textColor: 'text-yellow-300',
    textGlow: 'rgba(250, 204, 21, 0.7)',
    border: 'border-yellow-400/80',
    boxShadow: '0 0 20px rgba(234, 179, 8, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    accentBg: 'bg-yellow-400',
    icon: '⚡',
    title: 'STREAK',
  },
  2: {
    badgeGrad: 'from-cyan-400 via-sky-400 to-blue-500',
    textColor: 'text-cyan-200',
    textGlow: 'rgba(6, 182, 212, 0.8)',
    border: 'border-cyan-300',
    boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    accentBg: 'bg-cyan-400',
    icon: '🌀',
    title: 'COMBO',
  },
  3: {
    badgeGrad: 'from-fuchsia-500 via-pink-500 to-purple-600',
    textColor: 'text-fuchsia-200',
    textGlow: 'rgba(217, 70, 239, 0.85)',
    border: 'border-fuchsia-300',
    boxShadow: '0 0 30px rgba(217, 70, 239, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    accentBg: 'bg-fuchsia-400',
    icon: '🔥',
    title: 'SURGE',
  },
  4: {
    badgeGrad: 'from-orange-500 via-amber-500 to-rose-600',
    textColor: 'text-orange-200',
    textGlow: 'rgba(249, 115, 22, 0.9)',
    border: 'border-orange-300',
    boxShadow: '0 0 35px rgba(249, 115, 22, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    accentBg: 'bg-orange-400',
    icon: '💥',
    title: 'HYPER',
  },
  5: {
    badgeGrad: 'from-amber-300 via-rose-400 to-indigo-500',
    textColor: 'text-white',
    textGlow: 'rgba(255, 215, 0, 1)',
    border: 'border-amber-200',
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    accentBg: 'bg-gradient-to-r from-amber-300 to-yellow-400',
    icon: '👑',
    title: 'GODLIKE',
  },
};

export function FloatingScoreMultiplierItem({
  item,
  onComplete,
}: {
  key?: React.Key;
  item: FloatingMultiplierData;
  onComplete: (id: string) => void;
}) {
  const style = TIER_STYLES[item.tier];
  const multDisplay = item.multiplier % 1 === 0 ? `${item.multiplier}x` : `${item.multiplier.toFixed(1)}x`;

  return (
    <motion.div
      key={item.id}
      initial={{
        opacity: 0,
        scale: 0.35,
        y: 10,
        x: '-50%',
        rotate: item.rotation,
      }}
      animate={{
        opacity: [0, 1, 1, 0.95, 0],
        scale: [0.35, 1.3, 1.05, 0.98, 0.8],
        y: [0, -28, -60, -90, -120],
        rotate: [item.rotation, item.rotation * 0.4, 0, -item.rotation * 0.2, 0],
      }}
      transition={{
        duration: 1.35,
        times: [0, 0.14, 0.45, 0.8, 1.0],
        ease: 'easeOut',
      }}
      onAnimationComplete={() => onComplete(item.id)}
      style={{
        left: item.x,
        top: item.y,
      }}
      className="absolute pointer-events-none select-none z-30 flex flex-col items-center"
    >
      {/* Outer Tactical Badge Chassis */}
      <div
        className={`relative px-3.5 py-1.5 rounded-2xl bg-gradient-to-b from-[#111927]/95 via-[#0b101c]/95 to-[#111927]/95 border-2 ${style.border} backdrop-blur-md flex flex-col items-center gap-0.5`}
        style={{
          boxShadow: style.boxShadow,
        }}
      >
        {/* Subtle dot texture */}
        <div className="absolute inset-0 bg-tactical-dots opacity-20 pointer-events-none rounded-2xl" />

        {/* Top Header: Streak Tag + Icon */}
        <div className="flex items-center gap-1 relative z-10">
          <span className="text-sm">{style.icon}</span>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/90 drop-shadow">
            {item.comboCount} IN A ROW • {style.title}
          </span>
          <span className="text-sm">{style.icon}</span>
        </div>

        {/* Primary Multiplier Pop */}
        <div className="relative z-10 flex items-baseline gap-1 my-0.5">
          <span
            className={`font-black font-mono text-3xl sm:text-4xl tracking-tighter bg-gradient-to-b ${style.badgeGrad} bg-clip-text text-transparent`}
            style={{
              filter: `drop-shadow(0 2px 8px ${style.textGlow})`,
            }}
          >
            {multDisplay}
          </span>
          <span className="text-[10px] font-black font-mono uppercase tracking-wider text-white/80">
            BOOST
          </span>
        </div>

        {/* Secondary: Points Gained & Archetype Bonus Tag */}
        <div className="relative z-10 flex items-center gap-1.5 mt-0.5">
          <div className="bg-black/80 px-2 py-0.5 rounded-full border border-yellow-400/40 text-[11px] font-mono font-black text-yellow-300 tracking-wide flex items-center gap-0.5 shadow-sm">
            <span>+{item.points}</span>
            <span className="text-[9px] text-white/60">PTS</span>
          </div>

          {item.bonusTag && (
            <div className="bg-cyan-500/20 px-1.5 py-0.5 rounded-full border border-cyan-400/50 text-[9px] font-mono font-black text-cyan-200 tracking-tight">
              {item.bonusTag}
            </div>
          )}
        </div>

        {/* Floating Light Flare Diode */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/80 blur-xs" />
      </div>

      {/* Mini Decorative Star Sparks */}
      <div className="absolute -top-2 -left-2 text-xs animate-ping opacity-75">✨</div>
      <div className="absolute -bottom-2 -right-2 text-xs animate-pulse opacity-75">⚡</div>
    </motion.div>
  );
}

/**
 * Dynamic Active Combo HUD Pill
 * Appears below the gyro/inclinometer when a player has landed 2 or more consecutive blocks!
 */
export function ComboStreakHUD({ activeCombo }: { activeCombo: number }) {
  if (activeCombo < 2) return null;

  const tier = Math.min(5, Math.max(1, Math.floor(activeCombo / 2))) as 1 | 2 | 3 | 4 | 5;
  const style = TIER_STYLES[tier];
  const multiplierVal = activeCombo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -10 }}
      className="pointer-events-none select-none flex flex-col items-center"
    >
      <motion.div
        key={`combo-pulse-${activeCombo}`}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
        className={`px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-black/85 via-[#0e1726]/90 to-black/85 border-2 ${style.border} backdrop-blur-md shadow-2xl flex items-center gap-2`}
        style={{
          boxShadow: style.boxShadow,
        }}
      >
        <span className="text-base animate-bounce">{style.icon}</span>

        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black font-mono text-sm tracking-wide bg-gradient-to-r ${style.badgeGrad} bg-clip-text text-transparent`}
            >
              {multiplierVal}x STREAK MULTIPLIER
            </span>
            <span className="bg-red-600/90 text-white text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full uppercase animate-pulse border border-white/40">
              HOT
            </span>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider mt-0.5">
            +{((multiplierVal - 1) * 100)}% SCORE ACCELERATION
          </span>
        </div>

        {/* Pulse indicator ring */}
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping ml-1" />
      </motion.div>
    </motion.div>
  );
}
