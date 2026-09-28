import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/store';
import { PERK_DEFINITIONS, PerkCategory, PerkDefinition } from '../../game/techTree';
import { ArrowLeft, Zap, Shield, Compass, Coins, Check, Lock, ChevronRight, Sparkles, AlertCircle, Video } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';

const CATEGORIES: { id: PerkCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Disciplines', icon: Sparkles },
  { id: 'tactical', label: 'Tactical Arsenal', icon: Zap },
  { id: 'engineering', label: 'Structural Gyro', icon: Compass },
  { id: 'precision', label: 'Optics & Guidance', icon: Shield },
  { id: 'economics', label: 'Midas Economics', icon: Coins },
];

export function TechAcademy() {
  const { coins, unlockedPerks, upgradePerk, showPerkAd, setMode, previousMode } = useGameStore();
  const [activeCategory, setActiveCategory] = useState<PerkCategory | 'all'>('all');
  const [selectedPerkId, setSelectedPerkId] = useState<string>('chrono_stasis');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  const perks = Object.values(PERK_DEFINITIONS).filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  const activePerk: PerkDefinition = PERK_DEFINITIONS[selectedPerkId] || perks[0] || PERK_DEFINITIONS.chrono_stasis;
  const currentTier = unlockedPerks[activePerk.id] || 0;
  const isMaxed = currentTier >= activePerk.tiers.length;
  const nextTier = !isMaxed ? activePerk.tiers[currentTier] : null;
  const canAfford = nextTier ? coins >= nextTier.cost : false;

  const handleUpgrade = () => {
    if (!nextTier) return;
    const success = upgradePerk(activePerk.id);
    if (success) {
      audio.playComboSurge(3);
      setPurchaseNotice(`Upgraded to ${nextTier.title}!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
    } else {
      audio.playTiltWarning();
      setPurchaseNotice(`Insufficient coins for upgrade!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
    }
  };

  const handleResearchWithAd = () => {
    if (!nextTier) return;
    showPerkAd(activePerk.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full flex flex-col bg-[#0b0f19] text-white select-none overflow-hidden"
    >
      {/* Ambient Blueprint Background Mesh */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, #1e3a8a 0%, transparent 60%),
                            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 bg-[#0d1322]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              audio.playBuildSound(1.2);
              const target = previousMode && previousMode !== 'academy' ? previousMode : 'menu';
              useGameStore.getState().setState('idle');
              setMode(target);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-mono tracking-widest text-cyan-400 uppercase truncate">
              R&D DIVISION • SPEC V3.4
            </div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white uppercase flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Architect Academy</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 shrink-0">
                TECH MATRIX
              </span>
            </h1>
          </div>
        </div>

        {/* Player Vault Balance */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-[#141b2d] border border-amber-500/30 shadow-inner">
            <span className="text-sm sm:text-base">🪙</span>
            <span className="font-mono font-black text-amber-300 tabular-nums text-xs sm:text-sm">
              {coins.toLocaleString()}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-amber-500/80">Coins</span>
          </div>
        </div>
      </header>

      {/* Category Nav Strip */}
      <div className="relative z-10 px-4 sm:px-6 py-2 border-b border-white/5 bg-[#090d16] flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x shrink-0">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                audio.playBuildSound(1.1);
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Tab Toggle Bar (visible only on small screens < md) */}
      <div className="md:hidden relative z-10 px-4 py-2 bg-[#0a0f1d] border-b border-white/10 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer ${
            mobileTab === 'list'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'bg-white/5 text-white/50'
          }`}
        >
          Tech List ({perks.length})
        </button>
        <button
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase transition-all truncate cursor-pointer ${
            mobileTab === 'detail'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'bg-white/5 text-white/50'
          }`}
        >
          {activePerk.name}
        </button>
      </div>

      {/* Notice Banner */}
      <AnimatePresence>
        {purchaseNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 px-4 sm:px-6 py-2 bg-gradient-to-r from-cyan-950 to-blue-900 border-b border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{purchaseNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Responsive split-view on desktop, clean full-view on mobile */}
      <div className="relative z-10 flex-1 md:grid md:grid-cols-12 gap-0 overflow-hidden min-h-0">
        {/* Left List of Tech Nodes */}
        <div
          className={`md:col-span-5 lg:col-span-5 border-r border-white/10 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-2.5 touch-pan-y overflow-x-hidden ${
            mobileTab === 'list' ? 'block h-full' : 'hidden md:block'
          }`}
        >
          {perks.map((perk) => {
            const tier = unlockedPerks[perk.id] || 0;
            const max = perk.tiers.length;
            const isSelected = selectedPerkId === perk.id;

            return (
              <div
                key={perk.id}
                onClick={() => {
                  audio.playBuildSound(1.05);
                  setSelectedPerkId(perk.id);
                  setMobileTab('detail');
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 min-w-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#172554]/60 to-[#1e1b4b]/50 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-[#111726]/60 hover:bg-[#161f33]/80 border-white/10'
                }`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                  {perk.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-semibold truncate">
                      {perk.badge}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-white/50 shrink-0">
                      TIER {tier}/{max}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white truncate tracking-tight">{perk.name}</h3>
                  <p className="text-xs text-white/60 line-clamp-1 mt-0.5">{perk.summary}</p>

                  {/* Tier Indicator Blocks */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {perk.tiers.map((t, idx) => {
                      const unlocked = idx < tier;
                      return (
                        <div
                          key={idx}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            unlocked
                              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                              : 'bg-white/10'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="self-center shrink-0">
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-white/30'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Inspection & Upgrade Terminal */}
        <div
          className={`md:col-span-7 lg:col-span-7 bg-[#0d1322]/50 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto overscroll-contain overflow-x-hidden min-w-0 ${
            mobileTab === 'detail' ? 'block h-full' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-5 sm:space-y-6 min-w-0">
            {/* Mobile Back Button to Tech List */}
            <div className="md:hidden pb-1">
              <button
                onClick={() => setMobileTab('list')}
                className="text-xs font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer py-1"
              >
                ← Back to Tech List
              </button>
            </div>

            {/* Header info */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400/40 flex items-center justify-center text-2xl sm:text-3xl shadow-[0_0_24px_rgba(6,182,212,0.2)] shrink-0">
                  {activePerk.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-mono text-cyan-400 tracking-wider uppercase font-semibold truncate">
                    {activePerk.badge}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{activePerk.name}</h2>
                  <p className="text-xs text-white/70 mt-1 max-w-md leading-relaxed">{activePerk.summary}</p>
                </div>
              </div>

              {activePerk.hotkey && (
                <div className="hidden sm:flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-white/5 border border-white/15 shrink-0">
                  <span className="text-[10px] font-mono text-white/50">HOTKEY</span>
                  <span className="font-mono font-black text-base text-cyan-300">[{activePerk.hotkey}]</span>
                </div>
              )}
            </div>

            {/* Progression Tiers Detailed Breakdown */}
            <div className="space-y-3 min-w-0">
              <div className="text-xs font-mono font-bold tracking-wider text-white/50 uppercase">
                Schematic Tiers & Upgrades
              </div>

              <div className="space-y-2.5">
                {activePerk.tiers.map((t, idx) => {
                  const isUnlocked = idx < currentTier;
                  const isNext = idx === currentTier;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all min-w-0 ${
                        isUnlocked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : isNext
                          ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'bg-black/20 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isUnlocked
                                ? 'bg-emerald-500 text-black'
                                : isNext
                                ? 'bg-cyan-400 text-black'
                                : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {isUnlocked ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                          </span>
                          <span className="text-sm font-black text-white truncate">{t.title}</span>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                            {t.highlightStat}
                          </span>
                          {!isUnlocked && (
                            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                              🪙 {t.cost}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-white/70 pl-7 leading-relaxed">{t.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Upgrade Footer */}
          <div className="pt-5 sm:pt-6 border-t border-white/10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
            <div className="w-full sm:w-auto">
              <div className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase">Current Status</div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                {isMaxed ? (
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-4 h-4" /> FULLY MAXED (TIER {currentTier})
                  </span>
                ) : (
                  <span className="text-cyan-300 font-mono">
                    Tier {currentTier} Active • Ready for Tier {currentTier + 1}
                  </span>
                )}
              </div>
            </div>

            {!isMaxed && nextTier ? (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleUpgrade}
                  disabled={!canAfford}
                  className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none'
                      : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 fill-current" />
                  <span>Authorize ({nextTier.cost} 🪙)</span>
                </button>

                <button
                  onClick={handleResearchWithAd}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_4px_0_#0369a1] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Research via Ad (Free)</span>
                </button>
              </div>
            ) : (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                COMPLETED SPECIFICATION
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
