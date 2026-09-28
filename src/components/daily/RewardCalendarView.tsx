import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDayInfo, 
  MysteryChestDefinition, 
  getCalendarDays, 
  MYSTERY_CHESTS 
} from '../../game/dailyStore';
import { 
  Calendar, 
  Flame, 
  Coins, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  ChevronRight, 
  Clock, 
  Lock, 
  ShieldCheck, 
  HelpCircle,
  Info
} from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';

interface RewardCalendarViewProps {
  streakCount: number;
  streakClaimedToday: boolean;
  onClaimToday: () => void;
  onInspectChest: (chest: MysteryChestDefinition, daysRemaining: number) => void;
}

export const RewardCalendarView: React.FC<RewardCalendarViewProps> = ({
  streakCount,
  streakClaimedToday,
  onClaimToday,
  onInspectChest
}) => {
  const calendarDays = getCalendarDays(streakCount, streakClaimedToday);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const selectedDay = calendarDays.find((d) => d.offset === selectedDayOffset) || calendarDays[0];
  const upcomingChests = calendarDays.filter((d) => d.mysteryChest !== null);

  // Total potential coins achievable across next 7 days
  const total7DayPotentialCoins = calendarDays.reduce((acc, d) => acc + d.totalEstimatedCoins, 0);

  const handleSelectDay = (offset: number) => {
    haptics.uiTap();
    audio.playBuildSound(1.1);
    setSelectedDayOffset(offset);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* 7-Day Horizon Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-cyber-scanlines opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40">
              <Calendar className="w-3.5 h-3.5" /> 7-DAY REWARD HORIZON
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              {calendarDays[0].dateFormatted} — {calendarDays[6].dateFormatted}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide mt-1">
            CONSECUTIVE LOG-IN REWARDS SCHEDULE
          </h3>
          <p className="text-[11px] text-slate-300 font-sans mt-0.5">
            Log in daily without interruption to climb multipliers and unlock upcoming mystery vaults!
          </p>
        </div>

        {/* 7-Day Potential Coin Pool */}
        <div className="relative z-10 shrink-0 flex items-center gap-3 bg-slate-950/90 border border-amber-400/50 rounded-xl px-3.5 py-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              7-DAY MAX REWARDS
            </div>
            <div className="text-xs sm:text-sm font-black text-amber-300">
              ~{total7DayPotentialCoins.toLocaleString()} COINS + {upcomingChests.length} CHESTS
            </div>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* 7-DAY VISUAL CALENDAR GRID                               */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2 px-1">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span>UPCOMING 7-DAY TIMELINE</span>
            <span className="text-[9px] text-slate-400 font-sans normal-case">(Tap any day to inspect)</span>
          </div>
          <div className="text-amber-300 flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>MYSTERY CHESTS ON DAYS 3 & 7 (+SKINS)</span>
          </div>
        </div>

        {/* 7-Day Interactive Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const isSelected = selectedDayOffset === day.offset;
            const hasChest = day.mysteryChest !== null;
            const isToday = day.isToday;

            return (
              <motion.div
                key={day.offset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectDay(day.offset)}
                className={`
                  relative flex flex-col justify-between p-2.5 rounded-2xl border-2 cursor-pointer transition-all select-none overflow-hidden
                  ${isToday 
                    ? 'bg-gradient-to-b from-amber-950/70 via-slate-900 to-amber-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/50' 
                    : hasChest
                    ? day.mysteryChest?.rarity === 'legendary'
                      ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/50 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : day.mysteryChest?.rarity === 'epic'
                      ? 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-purple-950/50 border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-cyan-950/50 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'}
                  ${isSelected ? 'ring-2 ring-cyan-400' : ''}
                `}
              >
                {/* Tactical Accent Overlays */}
                <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />

                {/* Day Header */}
                <div className="flex items-center justify-between gap-1 relative z-10">
                  <span className={`text-[10px] font-black uppercase tracking-tight ${
                    isToday ? 'text-amber-300 font-extrabold' : 'text-slate-300'
                  }`}>
                    {day.dayLabel}
                  </span>

                  <span className="text-[9px] font-bold text-slate-400">
                    {day.dateFormatted}
                  </span>
                </div>

                {/* TODAY PULSING BEACON */}
                {isToday && (
                  <div className="mt-1 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/60 text-[8px] font-black uppercase tracking-widest animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      ACTIVE TODAY
                    </span>
                  </div>
                )}

                {/* Mystery Chest Special Visual or Standard Reward Icon */}
                <div className="my-2 flex flex-col items-center justify-center relative z-10">
                  {hasChest ? (
                    <motion.div
                      animate={{ 
                        y: [0, -3, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2.2, 
                        ease: 'easeInOut' 
                      }}
                      className="relative flex flex-col items-center"
                    >
                      <div className={`
                        w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl sm:text-3xl border-2 shadow-lg mb-1
                        ${day.mysteryChest?.rarity === 'legendary' 
                          ? 'bg-amber-950/90 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                          : day.mysteryChest?.rarity === 'epic' 
                          ? 'bg-purple-950/90 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                          : 'bg-cyan-950/90 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}
                      `}>
                        <span>{day.mysteryChest?.icon}</span>
                        <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-300" />
                      </div>

                      <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded border tracking-wider ${
                        day.mysteryChest?.rarity === 'legendary' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/60' 
                          : day.mysteryChest?.rarity === 'epic' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400/60' 
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
                      }`}>
                        {day.mysteryChest?.rarity === 'legendary' ? 'LEGENDARY' : day.mysteryChest?.rarity === 'epic' ? 'EPIC' : 'RARE'}
                      </span>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-base border mb-1
                        ${isToday 
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                          : 'bg-slate-900 border-slate-700 text-slate-400'}
                      `}>
                        <Coins className={`w-5 h-5 ${isToday ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">
                        DAY {day.projectedStreak}
                      </span>
                    </div>
                  )}
                </div>

                {/* Multiplier & Coins Preview */}
                <div className="mt-1 pt-1 border-t border-slate-800/80 text-center relative z-10">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-[10px] font-black ${isToday ? 'text-amber-300' : 'text-slate-300'}`}>
                      {day.multiplier.toFixed(2)}x
                    </span>
                    <span className="text-[8px] text-slate-500">•</span>
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                      +{Math.round(day.baseCoins * day.multiplier)}
                    </span>
                  </div>

                  {hasChest && (
                    <div className="text-[8px] font-black text-amber-300 mt-0.5 flex items-center justify-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>+Cosmetic Skin</span>
                    </div>
                  )}
                </div>

                {/* Footer Status Badge */}
                <div className="mt-2 text-center relative z-10">
                  {isToday ? (
                    day.claimed ? (
                      <div className="py-1 px-1.5 rounded-lg bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 text-[9px] font-black uppercase flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>CLAIMED</span>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClaimToday();
                        }}
                        className="w-full py-1 px-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.6)] cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Flame className="w-3 h-3 fill-slate-950" />
                        <span>CLAIM</span>
                      </motion.button>
                    )
                  ) : (
                    <div className="py-1 px-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[8px] font-bold uppercase flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{day.offset === 1 ? 'TOMORROW' : `IN ${day.offset}D`}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* UPCOMING MYSTERY CHESTS SPOTLIGHT SHOWCASE               */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              MYSTERY CHESTS (DAYS 3 & 7) — GUARANTEED COSMETIC SKINS
            </h4>
          </div>
          <span className="text-[10px] text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-400/40">
            {upcomingChests.length} VAULTS SCHEDULED
          </span>
        </div>

        {/* Chests Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {upcomingChests.map((day) => {
            const chest = day.mysteryChest!;
            const daysRemaining = day.offset;

            return (
              <motion.div
                key={chest.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => onInspectChest(chest, daysRemaining)}
                className={`
                  p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden
                  ${chest.borderClass}
                  bg-gradient-to-b ${chest.bgGradient}
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-white/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {chest.icon}
                    </div>
                    <div>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border tracking-wider ${
                        chest.rarity === 'legendary' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/60' 
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
                      }`}>
                        {chest.rarityLabel}
                      </span>
                      <h5 className="text-xs font-black text-white uppercase mt-0.5 truncate">
                        {chest.name}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 space-y-1 text-[10px] font-sans text-slate-300">
                  <div className="flex items-center justify-between text-amber-300 font-mono font-bold">
                    <span>Skin Drop:</span>
                    <span className="text-amber-200">🎁 Random Cosmetic Skin</span>
                  </div>
                  <div className="flex items-center justify-between text-yellow-300 font-mono font-bold">
                    <span>Jackpot:</span>
                    <span>+{chest.minBonusCoins} - {chest.maxBonusCoins} Coins</span>
                  </div>
                  {chest.guaranteedPowerup && (
                    <div className="flex items-center justify-between text-cyan-300 font-mono font-bold">
                      <span>Powerup:</span>
                      <span>+{chest.powerupCount}x {chest.guaranteedPowerup.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {daysRemaining === 0 ? '🟢 Unlocks Today!' : daysRemaining === 1 ? '⚡ Tomorrow' : `In ${daysRemaining} Days`}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectChest(chest, daysRemaining);
                    }}
                    className="text-[9px] font-bold uppercase text-white hover:text-cyan-300 flex items-center gap-0.5 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-md border border-slate-700 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* SELECTED DAY DOSSIER CARD                                */}
      {/* ======================================================== */}
      <motion.div
        key={selectedDay.offset}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black border-2 shrink-0
            ${selectedDay.isToday ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-300'}
          `}>
            {selectedDay.mysteryChest ? selectedDay.mysteryChest.icon : `D${selectedDay.projectedStreak}`}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {selectedDay.dayLabel} ({selectedDay.dateFormatted})
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.2 rounded border border-amber-400/40">
                {selectedDay.multiplier.toFixed(2)}x MULTIPLIER
              </span>
              <span className="text-[10px] text-slate-400 uppercase">
                RANK: {selectedDay.tierBadge}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {selectedDay.mysteryChest 
                ? `Includes ${selectedDay.mysteryChest.name} with up to +${selectedDay.mysteryChest.maxBonusCoins} coins & tactical powerups!`
                : `Base check-in bonus of ${selectedDay.baseCoins} coins boosted by your consecutive login streak.`}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end gap-2">
          {selectedDay.isToday ? (
            !selectedDay.claimed ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClaimToday}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>CLAIM DAY {selectedDay.projectedStreak} REWARDS</span>
              </motion.button>
            ) : (
              <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>TODAY CHECKED IN</span>
              </div>
            )
          ) : (
            selectedDay.mysteryChest && (
              <button
                onClick={() => onInspectChest(selectedDay.mysteryChest!, selectedDay.offset)}
                className="w-full sm:w-auto px-4 py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-400/60 text-purple-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Preview Vault Loot</span>
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};
