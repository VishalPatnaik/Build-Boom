import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Sparkles, Crown, Timer, Target } from 'lucide-react';

export interface ComboMultiplierState {
  streak: number;
  multiplier: number;
  timeRemaining: number;
  duration: number;
  active: boolean;
  pointsGained?: number;
}

interface ComboMultiplierIndicatorProps {
  data: ComboMultiplierState;
  isHighContrast?: boolean;
}

interface TierConfig {
  title: string;
  subtitle: string;
  badgeGrad: string;
  textGrad: string;
  borderColor: string;
  glowShadow: string;
  barGrad: string;
  icon: typeof Zap;
  colorName: string;
}

const COMBO_TIERS: Record<number, TierConfig> = {
  2: {
    title: 'DUAL SYNC',
    subtitle: 'RAPID PERFECT COMBO',
    badgeGrad: 'from-cyan-950/90 via-sky-900/90 to-blue-950/90',
    textGrad: 'from-cyan-300 via-sky-200 to-blue-300',
    borderColor: 'border-cyan-400',
    glowShadow: '0 0 25px rgba(6, 182, 212, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    barGrad: 'from-cyan-400 to-sky-300',
    icon: Zap,
    colorName: '#22d3ee',
  },
  3: {
    title: 'TRIPLE HARMONY',
    subtitle: 'RAPID PERFECT CHAIN',
    badgeGrad: 'from-amber-950/90 via-yellow-900/90 to-orange-950/90',
    textGrad: 'from-yellow-300 via-amber-200 to-orange-300',
    borderColor: 'border-yellow-400',
    glowShadow: '0 0 30px rgba(234, 179, 8, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    barGrad: 'from-yellow-400 to-amber-300',
    icon: Flame,
    colorName: '#facc15',
  },
  4: {
    title: 'QUAD RESONANCE',
    subtitle: 'HYPER RAPID STACK',
    badgeGrad: 'from-purple-950/90 via-fuchsia-900/90 to-indigo-950/90',
    textGrad: 'from-fuchsia-300 via-pink-200 to-purple-300',
    borderColor: 'border-fuchsia-400',
    glowShadow: '0 0 35px rgba(217, 70, 239, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    barGrad: 'from-fuchsia-400 to-pink-300',
    icon: Sparkles,
    colorName: '#e879f9',
  },
  5: {
    title: 'APEX OVERDRIVE',
    subtitle: 'GODLIKE RAPID CADENCE',
    badgeGrad: 'from-rose-950/95 via-amber-950/95 to-indigo-950/95',
    textGrad: 'from-rose-300 via-amber-200 to-cyan-200',
    borderColor: 'border-rose-400',
    glowShadow: '0 0 45px rgba(244, 63, 94, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    barGrad: 'from-rose-400 via-amber-300 to-cyan-300',
    icon: Crown,
    colorName: '#fb7185',
  },
};

export const ComboMultiplierIndicator: React.FC<ComboMultiplierIndicatorProps> = ({
  data,
  isHighContrast = false,
}) => {
  const { streak, multiplier, timeRemaining, duration, active } = data;

  if (!active || streak < 2) {
    return null;
  }

  const tierKey = Math.min(5, Math.max(2, multiplier));
  const config = COMBO_TIERS[tierKey] || COMBO_TIERS[2];
  const IconComponent = config.icon;

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / Math.max(1, duration)) * 100));
  const isCriticalTime = progressPercent < 28;
  const secondsLeft = (Math.max(0, timeRemaining) / 1000).toFixed(1);
  const bonusPercent = (multiplier - 1) * 100;

  return (
    <AnimatePresence>
      <motion.div
        key="combo-multiplier-hud-panel"
        initial={{ opacity: 0, scale: 0.65, y: -24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -16, transition: { duration: 0.22 } }}
        transition={{ type: 'spring', stiffness: 450, damping: 24 }}
        className="pointer-events-none select-none flex flex-col items-center z-25 max-w-[92vw]"
      >
        {/* Main Indicator Pill Chassis */}
        <motion.div
          key={`tier-pulse-${streak}-${multiplier}`}
          initial={{ scale: 1.22 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-2 backdrop-blur-md flex flex-col items-center gap-1 transition-colors ${
            isHighContrast
              ? 'bg-black border-yellow-400 text-yellow-300 shadow-[0_0_0_3px_#000000,0_0_20px_#facc15]'
              : `bg-gradient-to-b ${config.badgeGrad} ${config.borderColor}`
          }`}
          style={{
            boxShadow: isHighContrast ? undefined : config.glowShadow,
          }}
        >
          {/* Subtle Cyber scanline & grid texture */}
          {!isHighContrast && (
            <div className="absolute inset-0 bg-tactical-dots opacity-25 pointer-events-none rounded-2xl" />
          )}

          {/* Top Banner Tag: Title & Rapid Streak count */}
          <div className="flex items-center justify-between w-full gap-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className={`p-0.5 rounded-md ${isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}>
                <IconComponent className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-mono font-black tracking-widest uppercase ${
                  isHighContrast ? 'text-yellow-300' : 'text-white/90 drop-shadow'
                }`}
              >
                {config.title}
              </span>
            </div>

            {/* Streak Pips Chain */}
            <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-white/15">
              <Target className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] font-mono font-bold text-white/90">
                {streak} PERFECT IN A ROW
              </span>
            </div>
          </div>

          {/* Center Multiplier Hero Row */}
          <div className="flex items-center justify-center gap-2.5 my-0.5 relative z-10">
            {/* Bold Pulsing Multiplier Value */}
            <div className="flex items-baseline gap-1">
              <motion.span
                animate={{
                  scale: isCriticalTime ? [1, 1.06, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className={`text-3xl sm:text-4xl font-mono font-black tracking-tighter ${
                  isHighContrast
                    ? 'text-yellow-300 drop-shadow-[0_2px_0_#000000]'
                    : `bg-gradient-to-b ${config.textGrad} bg-clip-text text-transparent`
                }`}
                style={{
                  filter: isHighContrast ? undefined : `drop-shadow(0 2px 10px ${config.colorName})`,
                }}
              >
                {multiplier}x
              </motion.span>
              <span
                className={`text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider ${
                  isHighContrast ? 'text-white' : 'text-white/90'
                }`}
              >
                MULTIPLIER
              </span>
            </div>

            {/* Acceleration Tag */}
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-tight flex items-center gap-1 ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border border-white'
                  : 'bg-red-500/25 border border-red-400/50 text-red-200 shadow-sm'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              <span>+{bonusPercent}% SCORE</span>
            </div>
          </div>

          {/* Rapid Decay Countdown Progress Bar */}
          <div className="w-full mt-1 relative z-10 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-wider text-white/70">
              <span className="flex items-center gap-1">
                <Timer className={`w-3 h-3 ${isCriticalTime ? 'text-rose-400 animate-spin' : 'text-cyan-300'}`} />
                <span>RAPID SUCCESSION WINDOW</span>
              </span>
              <span className={isCriticalTime ? 'text-rose-400 font-black animate-pulse' : 'text-cyan-200'}>
                {secondsLeft}s {isCriticalTime && '• QUICK!'}
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-black/60 border border-white/20 p-0.5 overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full transition-all duration-75 ${
                  isHighContrast
                    ? isCriticalTime
                      ? 'bg-rose-500'
                      : 'bg-yellow-400'
                    : isCriticalTime
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse'
                    : `bg-gradient-to-r ${config.barGrad}`
                }`}
                style={{
                  width: `${progressPercent}%`,
                  boxShadow: isHighContrast ? undefined : `0 0 10px ${isCriticalTime ? '#f43f5e' : config.colorName}`,
                }}
              />
              {/* Runner Spark */}
              {progressPercent > 5 && (
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full blur-[1px]"
                  style={{ left: `calc(${progressPercent}% - 3px)` }}
                />
              )}
            </div>
          </div>

          {/* Flare diode indicator at top */}
          <div
            className={`absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full ${
              isHighContrast ? 'bg-yellow-400' : 'bg-white/80 blur-xs'
            }`}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
