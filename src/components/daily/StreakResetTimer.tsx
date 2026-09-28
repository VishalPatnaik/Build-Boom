import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, Flame, ShieldAlert, Sparkles, Timer } from 'lucide-react';

interface StreakResetTimerProps {
  streakClaimedToday: boolean;
  streakCount: number;
}

export const StreakResetTimer: React.FC<StreakResetTimerProps> = ({
  streakClaimedToday,
  streakCount
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    percentElapsed: number;
    percentRemaining: number;
    diffMs: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    percentElapsed: 0,
    percentRemaining: 100,
    diffMs: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next 00:00:00

      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      const totalDayMs = 24 * 60 * 60 * 1000;
      const elapsedMs = totalDayMs - diffMs;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const percentElapsed = Math.min(100, Math.max(0, (elapsedMs / totalDayMs) * 100));
      const percentRemaining = Math.min(100, Math.max(0, (diffMs / totalDayMs) * 100));

      setTimeLeft({
        hours,
        minutes,
        seconds,
        percentElapsed,
        percentRemaining,
        diffMs
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isUrgent = timeLeft.hours < 2; // Under 2 hours remaining
  const isCritical = timeLeft.hours === 0 && timeLeft.minutes < 30; // Under 30 mins remaining

  const formattedHours = String(timeLeft.hours).padStart(2, '0');
  const formattedMinutes = String(timeLeft.minutes).padStart(2, '0');
  const formattedSeconds = String(timeLeft.seconds).padStart(2, '0');

  return (
    <div className={`
      relative p-3 sm:p-3.5 rounded-2xl border-2 backdrop-blur-md font-mono overflow-hidden transition-all shadow-lg
      ${!streakClaimedToday && isCritical
        ? 'bg-gradient-to-r from-red-950/90 via-slate-950 to-red-950/90 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
        : !streakClaimedToday && isUrgent
        ? 'bg-gradient-to-r from-amber-950/85 via-slate-950 to-amber-950/85 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
        : 'bg-gradient-to-r from-slate-950/90 via-slate-900 to-slate-950/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'}
    `}>
      {/* Background Cyber Texture */}
      <div className="absolute inset-0 bg-cyber-scanlines opacity-10 pointer-events-none" />

      {/* Top Header Row: Label & Digital Countdown */}
      <div className="flex items-center justify-between gap-2 relative z-10 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`
            w-7 h-7 rounded-lg flex items-center justify-center border shrink-0
            ${!streakClaimedToday && isCritical 
              ? 'bg-red-500/20 border-red-400 text-red-400 animate-bounce' 
              : !streakClaimedToday && isUrgent 
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse' 
              : 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'}
          `}>
            {!streakClaimedToday && isUrgent ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Timer className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">
                DAILY STREAK RESET
              </span>
              <span className="text-[8px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase">
                MIDNIGHT (00:00)
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">
              {streakClaimedToday ? (
                <span className="text-emerald-300 flex items-center gap-1 font-mono font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Streak Secured • Next check-in unlocks in:
                </span>
              ) : (
                <span className={isUrgent ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                  {isUrgent ? '⚠️ Claim check-in before timer expires to preserve streak!' : 'Complete today\'s check-in before reset'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Digital Countdown Display */}
        <div className="flex items-center gap-1 shrink-0 text-right">
          <div className={`
            px-2.5 py-1 rounded-xl border flex items-baseline gap-1 font-mono
            ${!streakClaimedToday && isCritical
              ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
              : !streakClaimedToday && isUrgent
              ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900 border-cyan-500/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'}
          `}>
            {/* Hours */}
            <div className="text-center">
              <span className="text-sm sm:text-base font-black tracking-tight">{formattedHours}</span>
              <span className="text-[8px] text-slate-400 block -mt-1 font-bold">HR</span>
            </div>

            <span className="text-xs font-black animate-pulse opacity-70">:</span>

            {/* Minutes */}
            <div className="text-center">
              <span className="text-sm sm:text-base font-black tracking-tight">{formattedMinutes}</span>
              <span className="text-[8px] text-slate-400 block -mt-1 font-bold">MIN</span>
            </div>

            <span className="text-xs font-black animate-pulse opacity-70">:</span>

            {/* Seconds */}
            <div className="text-center">
              <span className="text-sm sm:text-base font-black tracking-tight tabular-nums">{formattedSeconds}</span>
              <span className="text-[8px] text-slate-400 block -mt-1 font-bold">SEC</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 24-HOUR CYCLE PROGRESS BAR UI                             */}
      {/* ======================================================== */}
      <div className="relative z-10 mt-1">
        {/* Progress Track */}
        <div className="relative h-2.5 sm:h-3 w-full bg-slate-950/90 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
          {/* Progress Fill */}
          <motion.div
            initial={false}
            animate={{ width: `${timeLeft.percentRemaining}%` }}
            transition={{ ease: 'linear', duration: 1 }}
            className={`
              h-full rounded-full relative transition-all
              ${!streakClaimedToday && isCritical
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                : !streakClaimedToday && isUrgent
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                : 'bg-gradient-to-r from-cyan-600 via-sky-400 to-blue-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'}
            `}
          >
            {/* Glowing head pulse */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full opacity-75 animate-ping" />
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
          </motion.div>

          {/* 6h Interval Grid Ticks */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-40">
            <div className="w-px h-full bg-white/50" />
            <div className="w-px h-full bg-white/50" />
            <div className="w-px h-full bg-white/50" />
            <div className="w-px h-full bg-white/50" />
          </div>
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-slate-500 mt-1 px-0.5">
          <span>00:00 (START)</span>
          <span>06:00</span>
          <span>12:00 (NOON)</span>
          <span>18:00</span>
          <span className={isUrgent ? 'text-amber-400 font-black' : 'text-slate-400'}>
            24:00 (RESET)
          </span>
        </div>
      </div>
    </div>
  );
};
