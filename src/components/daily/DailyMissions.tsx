import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useDailyStore, 
  STREAK_TIERS, 
  getStreakTier, 
  getStreakMultiplier,
  MysteryChestDefinition,
  CosmeticSkinReward
} from '../../game/dailyStore';
import { useGameStore } from '../../game/store';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Coins, 
  Gift, 
  Zap, 
  Flame, 
  Sparkles, 
  Calendar,
  ChevronRight,
  RotateCcw,
  ListTodo
} from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';
import { RewardCalendarView } from './RewardCalendarView';
import { MysteryChestModal } from './MysteryChestModal';
import { ChestUnboxingCelebration } from './ChestUnboxingCelebration';
import { StreakResetTimer } from './StreakResetTimer';

export function DailyMissions() {
  const { setMode } = useGameStore();
  const { 
    tasks, 
    bonusClaimed, 
    streakCount, 
    maxStreak, 
    streakClaimedToday,
    initDaily, 
    claimReward, 
    claimBonus,
    claimStreakReward,
    simulateOpenChest,
    debugAdvanceStreak,
    debugResetStreak
  } = useDailyStore();

  const [activeTab, setActiveTab] = useState<'calendar' | 'directives'>('calendar');
  const [claimFeedback, setClaimFeedback] = useState<{ text: string; coins: number } | null>(null);
  const [showDevControls, setShowDevControls] = useState(false);

  // Mystery Chest Modal & Celebration State
  const [inspectChest, setInspectChest] = useState<{
    chest: MysteryChestDefinition;
    daysRemaining?: number;
  } | null>(null);

  const [unboxingPayload, setUnboxingPayload] = useState<{
    chest: MysteryChestDefinition;
    bonusCoins: number;
    powerup?: { type: 'stasis' | 'emp' | 'shield'; count: number };
    cosmeticSkin?: CosmeticSkinReward;
  } | null>(null);

  useEffect(() => {
    initDaily();
  }, [initDaily]);

  const currentMultiplier = getStreakMultiplier(streakCount);
  const currentTier = getStreakTier(streakCount);
  const currentCycleDay = ((streakCount - 1) % 7) + 1;
  const todayCheckinCoins = Math.round(currentTier.baseReward * currentMultiplier);

  const allCompleted = tasks.length > 0 && tasks.every((t) => t.completed);
  const completedCount = tasks.filter((t) => t.completed).length;

  const showRewardToast = (text: string, coins: number) => {
    setClaimFeedback({ text, coins });
    setTimeout(() => {
      setClaimFeedback(null);
    }, 2400);
  };

  const handleClaimStreak = () => {
    if (streakClaimedToday) return;
    const result = claimStreakReward();
    if (result.totalCoins > 0) {
      if (result.chestAwarded) {
        // Today was a mystery chest milestone! Trigger celebratory unboxing
        setUnboxingPayload({
          chest: result.chestAwarded.chest,
          bonusCoins: result.chestAwarded.bonusCoins,
          powerup: result.chestAwarded.powerup,
          cosmeticSkin: result.chestAwarded.cosmeticSkin
        });
      } else {
        audio.playComboSurge(3);
        haptics.blockPlaced('gold_ingot');
        showRewardToast(`Day ${streakCount} Check-In Claimed!`, result.totalCoins);
      }
    }
  };

  const handleClaimTask = (taskId: string, title: string) => {
    const coins = claimReward(taskId);
    if (coins > 0) {
      audio.playBuildSound(1.3);
      haptics.blockPlaced('gold_ingot');
      showRewardToast(`Directive Met: ${title}`, coins);
    }
  };

  const handleClaimBonus = () => {
    const coins = claimBonus();
    if (coins > 0) {
      audio.playPerfectSound();
      haptics.blockPlaced('prism');
      showRewardToast('Orbital Bounty Claimed!', coins);
    }
  };

  const handleInspectChest = (chest: MysteryChestDefinition, daysRemaining: number) => {
    haptics.uiTap();
    audio.playBuildSound(1.1);
    setInspectChest({ chest, daysRemaining });
  };

  const handleTestUnboxFromInspector = (chestId: string) => {
    setInspectChest(null);
    const unboxed = simulateOpenChest(chestId);
    setUnboxingPayload(unboxed);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="flex flex-col w-full h-full max-w-2xl p-4 sm:p-6 py-6 sm:py-8 relative z-10 mx-auto font-mono text-slate-100"
    >
      {/* Floating Claim Feedback Toast */}
      <AnimatePresence>
        {claimFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] text-white text-xs font-black uppercase tracking-wider backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>{claimFeedback.text}</span>
            <div className="flex items-center gap-1 text-amber-300 font-black ml-1 bg-amber-900/60 px-2 py-0.5 rounded-lg border border-amber-400/50">
              +{claimFeedback.coins} <Coins className="w-4 h-4 fill-amber-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystery Chest Modal */}
      <MysteryChestModal
        isOpen={inspectChest !== null}
        chest={inspectChest?.chest || null}
        daysRemaining={inspectChest?.daysRemaining}
        onClose={() => setInspectChest(null)}
        onTestUnbox={handleTestUnboxFromInspector}
      />

      {/* Chest Unboxing Celebration */}
      {unboxingPayload && (
        <ChestUnboxingCelebration
          isOpen={true}
          chest={unboxingPayload.chest}
          bonusCoins={unboxingPayload.bonusCoins}
          powerup={unboxingPayload.powerup}
          cosmeticSkin={unboxingPayload.cosmeticSkin}
          onClose={() => {
            const skinNotice = unboxingPayload.cosmeticSkin ? ` & Unlocked ${unboxingPayload.cosmeticSkin.name}` : '';
            setUnboxingPayload(null);
            showRewardToast(`${unboxingPayload.chest.name} Claimed${skinNotice}!`, unboxingPayload.bonusCoins);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMode('menu')}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border-2 border-cyan-400/60 rounded-2xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            aria-label="Back to Menu"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </motion.button>
          <div>
            <div className="text-[10px] font-bold text-cyan-400 tracking-[0.25em] uppercase flex items-center gap-1.5">
              <span>PROTOCOL OPS</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 uppercase tracking-wider drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              DAILY DIRECTIVES
            </h2>
          </div>
        </div>

        {/* Live Streak Counter Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-slate-950/90 to-amber-950/60 border-2 border-amber-400/70 rounded-2xl px-3 sm:px-4 py-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <div className="relative">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-black text-amber-300 tracking-tight leading-none">
              {streakCount} {streakCount === 1 ? 'DAY' : 'DAYS'}
            </div>
            <div className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest mt-0.5">
              STREAK
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Streak Reset Countdown Timer with Progress Bar UI */}
      <div className="mb-3.5">
        <StreakResetTimer
          streakClaimedToday={streakClaimedToday}
          streakCount={streakCount}
        />
      </div>

      {/* High-Tech View Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/80 p-1.5 rounded-2xl border-2 border-slate-800">
        <button
          onClick={() => {
            haptics.uiTap();
            audio.playBuildSound(1.2);
            setActiveTab('calendar');
          }}
          className={`
            py-2.5 px-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all
            ${activeTab === 'calendar'
              ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
          `}
        >
          <Calendar className="w-4 h-4" />
          <span>7-Day Calendar</span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-950/30 text-[9px]">
            Schedule
          </span>
        </button>

        <button
          onClick={() => {
            haptics.uiTap();
            audio.playBuildSound(1.2);
            setActiveTab('directives');
          }}
          className={`
            py-2.5 px-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all
            ${activeTab === 'directives'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
          `}
        >
          <ListTodo className="w-4 h-4" />
          <span>Directives</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded ${
            activeTab === 'directives' ? 'bg-slate-950/30' : 'bg-slate-900 text-slate-300 border border-slate-700'
          }`}>
            {completedCount}/{tasks.length}
          </span>
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4 touch-pan-y" style={{ scrollbarWidth: 'none' }}>
        
        {/* ======================================================== */}
        {/* TAB 1: VISUAL 7-DAY REWARD CALENDAR VIEW                 */}
        {/* ======================================================== */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <RewardCalendarView
              streakCount={streakCount}
              streakClaimedToday={streakClaimedToday}
              onClaimToday={handleClaimStreak}
              onInspectChest={handleInspectChest}
            />

            {/* Quick jump to directives button */}
            <div className="pt-1">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveTab('directives')}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 hover:border-cyan-400/60 flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    Complete Today's Operational Directives ({completedCount}/{tasks.length})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-cyan-300 group-hover:translate-x-0.5 transition-transform">
                  <span className="font-bold uppercase text-[10px]">Open Tasks</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: OPERATIONAL DIRECTIVES & BOUNTY                   */}
        {/* ======================================================== */}
        {activeTab === 'directives' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* DAILY STREAK MULTIPLIER HERO CHAMBER */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                relative p-4 sm:p-5 rounded-2xl border-2 backdrop-blur-md overflow-hidden transition-all
                ${streakCount >= 5 
                  ? 'bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.3)]' 
                  : 'bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-950 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.25)]'}
              `}
            >
              {/* Ambient Cyber Scanlines & Glow */}
              <div className="absolute inset-0 bg-cyber-scanlines opacity-15 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Chamber Header: Multiplier Spotlight & Check-in Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                      RANK: {currentTier.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      RECORD: {maxStreak}d
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                      ⚡ {currentMultiplier.toFixed(2)}x
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      COIN MULTIPLIER ACTIVE
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                    {currentMultiplier > 1.0 
                      ? `Active streak boost: +${Math.round((currentMultiplier - 1) * 100)}% coin payout on all directives & bonuses!`
                      : 'Log in daily to scale your multiplier up to 3.0x maximum rewards!'}
                  </p>
                </div>

                {/* Daily Check-in Action */}
                <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                  {!streakClaimedToday ? (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleClaimStreak}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-2 border-amber-200 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:translate-y-0.5"
                    >
                      <Flame className="w-4 h-4 text-slate-950 fill-current animate-bounce" />
                      <span>CLAIM DAY {streakCount} CHECK-IN</span>
                      <div className="flex items-center gap-0.5 ml-1 bg-slate-950/20 px-2 py-0.5 rounded text-[11px]">
                        +{todayCheckinCoins} <Coins className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </motion.button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-950/70 border border-emerald-400/60 rounded-xl text-emerald-300 text-xs font-bold uppercase shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>CHECKED IN TODAY (+{todayCheckinCoins})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 7-DAY STREAK TRACK VISUALIZER */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Calendar className="w-3.5 h-3.5" /> 7-DAY STREAK MULTIPLIER TRACK
                  </span>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="text-amber-300 hover:text-amber-200 flex items-center gap-0.5 cursor-pointer uppercase underline text-[10px]"
                  >
                    <span>View Calendar View</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 7 Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {STREAK_TIERS.map((tier) => {
                    const isPast = tier.day < currentCycleDay;
                    const isCurrent = tier.day === currentCycleDay;

                    return (
                      <div
                        key={tier.day}
                        className={`
                          relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl border text-center transition-all
                          ${isCurrent
                            ? 'bg-gradient-to-b from-amber-500/25 to-amber-950/50 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/40'
                            : isPast
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'}
                        `}
                      >
                        {/* Top Day indicator */}
                        <div className="text-[9px] sm:text-[10px] font-black tracking-tight">
                          D{tier.day}
                        </div>

                        {/* Multiplier Badge */}
                        <div className={`
                          text-[10px] sm:text-xs font-black my-1 px-1 rounded
                          ${isCurrent 
                            ? 'text-amber-300 font-extrabold scale-105' 
                            : isPast 
                            ? 'text-emerald-400' 
                            : 'text-slate-400'}
                        `}>
                          {tier.multiplier}x
                        </div>

                        {/* Status Icon / Coin Preview */}
                        <div className="text-[8px] sm:text-[9px] font-bold flex items-center justify-center gap-0.5">
                          {isPast ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <span>+{tier.baseReward}</span>
                          )}
                        </div>

                        {/* Active Pulsing Indicator for Current Day */}
                        {isCurrent && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* DIRECTIVES SECTION HEADER */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span>OPERATIONAL DIRECTIVES</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-md text-slate-300">
                  {completedCount} / {tasks.length} COMPLETED
                </span>
              </div>

              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{currentMultiplier.toFixed(2)}x MULTIPLIER APPLIED</span>
              </div>
            </div>

            {/* Directives List */}
            {tasks.map((task) => {
              const finalReward = Math.round(task.reward * currentMultiplier);

              return (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    relative p-4 rounded-2xl border-2 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md transition-all
                    ${task.completed 
                      ? 'bg-gradient-to-r from-slate-950/95 via-emerald-950/40 to-slate-950/95 border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none rounded-2xl" />

                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${task.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {task.completed ? 'DIRECTIVE MET' : 'IN PROGRESS'}
                      </span>
                      {currentMultiplier > 1.0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                          {currentMultiplier.toFixed(2)}x STREAK BOOST
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-black uppercase mt-0.5 tracking-wide ${task.completed ? 'text-white' : 'text-slate-200'}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans">
                      {task.description}
                    </p>
                    
                    {!task.completed && (
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                            style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs font-bold text-cyan-300 tabular-nums">
                          {task.progress} / {task.target}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reward / Claim Action */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end relative z-10 shrink-0">
                    {task.completed ? (
                      task.rewardClaimed ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-400/50 rounded-xl text-emerald-300 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>CLAIMED (+{finalReward})</span>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleClaimTask(task.id, task.title)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-amber-200 rounded-xl font-black text-xs uppercase shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer"
                        >
                          <span>CLAIM</span>
                          <div className="flex items-center gap-1 font-black">
                            +{finalReward} <Coins className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </motion.button>
                      )
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-400 text-xs font-bold">
                        <span>+{finalReward}</span>
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        {currentMultiplier > 1.0 && (
                          <span className="text-[10px] text-amber-300/80">({task.reward} × {currentMultiplier.toFixed(2)})</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* COMPLETION BOUNTY CARD */}
            {(() => {
              const baseBonus = 30;
              const multipliedBonus = Math.round(baseBonus * currentMultiplier);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    relative p-5 mt-2 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2.5 backdrop-blur-md transition-all
                    ${allCompleted 
                      ? 'bg-gradient-to-r from-slate-950/95 via-amber-950/50 to-slate-950/95 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                      : 'bg-slate-950/60 border-slate-800 opacity-80'}
                  `}
                >
                  <Gift className={`w-8 h-8 ${allCompleted ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse' : 'text-slate-500'}`} />
                  <div>
                    <h3 className={`text-base font-black uppercase tracking-wider ${allCompleted ? 'text-amber-300' : 'text-slate-400'}`}>
                      ALL DIRECTIVES COMPLETED
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Complete all daily directives to claim the orbital bonus bounty with your active streak multiplier!
                    </p>
                    <div className="mt-1 text-[11px] font-bold text-amber-300">
                      Reward: {baseBonus} Base × {currentMultiplier.toFixed(2)}x Multiplier = <span className="text-amber-200 font-black">+{multipliedBonus} COINS</span>
                    </div>
                  </div>
                  
                  {allCompleted && !bonusClaimed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClaimBonus}
                      className="mt-1 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.6)] rounded-xl font-black uppercase text-xs cursor-pointer"
                    >
                      <span>CLAIM BOUNTY +{multipliedBonus}</span>
                      <Coins className="w-4 h-4 fill-current" />
                    </motion.button>
                  )}
                  {allCompleted && bonusClaimed && (
                    <div className="mt-1 flex items-center gap-2 px-4 py-1.5 bg-emerald-950/60 border border-emerald-400/50 rounded-xl text-emerald-300 text-xs font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4" /> BOUNTY CLAIMED (+{multipliedBonus})
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </motion.div>
        )}

        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMode('campaign');
              useGameStore.getState().setState('playing');
            }}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-400/60 rounded-xl text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <span>🚀 Launch Campaign</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              useGameStore.getState().setLevel(0);
              useGameStore.getState().setState('playing');
              setMode('endless');
            }}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 border-2 border-purple-400/60 rounded-xl text-purple-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            <span>♾️ Endless Protocol</span>
          </motion.button>
        </div>

        {/* Streak Simulator & Testing Utility */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowDevControls(!showDevControls)}
            className="text-[10px] font-mono text-slate-600 hover:text-slate-400 cursor-pointer uppercase tracking-wider transition-colors"
          >
            {showDevControls ? 'Hide Testing Utilities' : '⚙️ Test Calendar Streaks & Mystery Chests'}
          </button>

          {showDevControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-center gap-2 text-xs"
            >
              <button
                onClick={() => {
                  debugAdvanceStreak();
                  audio.playBuildSound(1.2);
                }}
                className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 rounded-lg text-cyan-300 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Advance Streak (+1 Day)
              </button>
              <button
                onClick={() => {
                  debugResetStreak();
                  audio.playBuildSound(0.8);
                }}
                className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 rounded-lg text-red-300 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Streak (Day 1)
              </button>

              <button
                onClick={() => handleTestUnboxFromInspector('chest-day3')}
                className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 rounded-lg text-cyan-300 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ Test Day 3 Mystery Chest (+Skin)</span>
              </button>

              <button
                onClick={() => handleTestUnboxFromInspector('chest-day7')}
                className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-400/50 rounded-lg text-amber-300 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <span>👑 Test Day 7 Grand Vault (+Skin)</span>
              </button>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
