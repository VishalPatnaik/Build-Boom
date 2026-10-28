import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/store';
import { SandboxOptions } from '../../game/LevelGenerator';
import { COLLECTIONS, CosmeticDef } from '../../game/collections';
import { renderBlock } from '../../game/themeRenderer';
import { BlueprintSkinRevealModal } from './BlueprintSkinRevealModal';
import { 
  ArrowLeft, 
  Play, 
  Sliders, 
  Shield, 
  Zap, 
  Wind, 
  RefreshCw, 
  Sparkles, 
  Flame, 
  Layers, 
  Check, 
  Lock, 
  Eye, 
  Cpu 
} from 'lucide-react';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';
import { screenFadeSlideVariants } from '../../utils/screenTransitions';

interface Preset {
  id: string;
  name: string;
  desc: string;
  icon: string;
  options: SandboxOptions;
}

// Live animated mini canvas preview for skin schematics cards
function SchematicMiniCanvas({ skinId }: { skinId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      const time = now - startTime;
      ctx.clearRect(0, 0, 56, 56);
      renderBlock(ctx, 4, 4, 48, 48, skinId, false, time);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skinId]);

  return (
    <canvas 
      ref={canvasRef} 
      width={56} 
      height={56} 
      className="w-14 h-14 shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]" 
    />
  );
}

const PRESETS: Preset[] = [
  {
    id: 'zen',
    name: 'Calm',
    desc: 'No bombs, slower blocks and no wind. Practise landing and balancing.',
    icon: '🧘',
    options: {
      speedMultiplier: 0.8,
      boomChance: 0.0,
      blockCount: 40,
      allowGhosts: false,
      allowBlinks: false,
      allowFakes: false,
      allowSpecialBlocks: true,
      wind: 0,
    },
  },
  {
    id: 'hurricane',
    name: 'Windy',
    desc: 'Fast blocks and strong wind gusts pushing your tower sideways.',
    icon: '🌪️',
    options: {
      speedMultiplier: 1.35,
      boomChance: 0.28,
      blockCount: 60,
      allowGhosts: false,
      allowBlinks: true,
      allowFakes: false,
      allowSpecialBlocks: true,
      wind: 0.9,
    },
  },
  {
    id: 'bullet_hell',
    name: 'Bomb Storm',
    desc: 'Almost half the blocks are bombs, some disguised or flickering.',
    icon: '⚡',
    options: {
      speedMultiplier: 1.6,
      boomChance: 0.48,
      blockCount: 75,
      allowGhosts: true,
      allowBlinks: true,
      allowFakes: true,
      allowSpecialBlocks: true,
      wind: 0.3,
    },
  },
  {
    id: 'midas_rush',
    name: 'Special Blocks',
    desc: 'Wide anchors, heavy gold and light crystal blocks mixed in, with a light breeze.',
    icon: '🪙',
    options: {
      speedMultiplier: 1.1,
      boomChance: 0.2,
      blockCount: 50,
      allowGhosts: false,
      allowBlinks: false,
      allowFakes: false,
      allowSpecialBlocks: true,
      wind: 0.2,
    },
  },
];

export function BlueprintWorkshop() {
  const { 
    setMode, 
    setState, 
    setSandboxOptions, 
    setScore,
    ownedCosmetics,
    equippedCosmetic,
    equipCosmetic,
    unlockCosmetic
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'sandbox' | 'schematics'>('sandbox');
  const [revealSkin, setRevealSkin] = useState<{ skin: CosmeticDef; worldName: string } | null>(null);

  const [options, setOptions] = useState<SandboxOptions>({
    speedMultiplier: 1.0,
    boomChance: 0.25,
    blockCount: 50,
    allowGhosts: true,
    allowBlinks: true,
    allowFakes: true,
    allowSpecialBlocks: true,
  });

  const [activePreset, setActivePreset] = useState<string>('custom');

  const applyPreset = (preset: Preset) => {
    audio.playBuildSound(1.15);
    setActivePreset(preset.id);
    setOptions({ ...preset.options });
  };

  const handleLaunch = () => {
    audio.playComboSurge(2);
    setSandboxOptions(options);
    setScore(0);
    setMode('workshop');
    setState('playing');
  };

  const handleSynthesizeOrInspect = (skin: CosmeticDef, worldName: string) => {
    const isOwned = ownedCosmetics.includes(skin.id);
    if (!isOwned) {
      unlockCosmetic(skin.id);
    }
    setRevealSkin({ skin, worldName });
  };

  const handleLaunchSandboxTrial = (skinId: string) => {
    setRevealSkin(null);
    equipCosmetic(skinId, 'skin');
    audio.playComboSurge(2);
    setSandboxOptions(options);
    setScore(0);
    setMode('workshop');
    setState('playing');
  };

  return (
    <motion.div
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full h-full flex flex-col bg-[#080d18] text-white select-none overflow-hidden"
    >
      {/* CSS-based Blueprint Skin Reveal Modal */}
      {revealSkin && (
        <BlueprintSkinRevealModal
          isOpen={true}
          skin={revealSkin.skin}
          worldName={revealSkin.worldName}
          onClose={() => setRevealSkin(null)}
          onLaunchTrial={handleLaunchSandboxTrial}
        />
      )}

      {/* Blueprint Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, #0369a1 0%, transparent 70%),
                            linear-gradient(to right, rgba(56,189,248,0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(56,189,248,0.08) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 28px 28px, 28px 28px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 bg-[#0c1324]/85 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              audio.playBuildSound(1.2);
              setMode('menu');
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
            aria-label="Back to Menu"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-mono tracking-widest text-sky-400 uppercase truncate">
              CUSTOM GAME
            </div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white uppercase flex items-center gap-1.5 sm:gap-2 truncate font-mono">
              <span className="truncate">Practice</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 shrink-0">
                NO PRESSURE
              </span>
            </h1>
          </div>
        </div>

        <button
          onClick={handleLaunch}
          className="hidden sm:flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] active:translate-y-0.5 cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start practice</span>
        </button>
      </header>

      {/* Workspace Navigation Tabs */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#09101f] px-4 sm:px-6 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audio.playClickSound();
              haptics.uiTap();
              setActiveTab('sandbox');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'sandbox'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-white/50 hover:text-white border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              audio.playClickSound();
              haptics.uiTap();
              setActiveTab('schematics');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'schematics'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'text-white/50 hover:text-white border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Block skins</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/50">
          <span>PRACTICE</span>
        </div>
      </div>

      {activeTab === 'schematics' ? (
        /* ================================================================= */
        /* SCHEMATICS & SKIN BLUEPRINTS SYNTHESIS VIEW                       */
        /* ================================================================= */
        <div className="relative z-10 flex-1 p-4 sm:p-6 overflow-y-auto overscroll-contain pb-28 lg:pb-12 min-w-0">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1426] p-4 sm:p-5 rounded-2xl border border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
              <div>
                <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Block skins</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Unlock and equip block skins
                </h2>
                <p className="text-xs text-white/60 mt-1 max-w-xl leading-relaxed">
                  Analyze technical blueprints recovered from expeditions. Synthesize new structural alloys with CSS-accelerated holographic projection, then deploy their aerodynamic weight and friction directly in sandbox simulations!
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center font-mono">
                  <div className="text-[10px] text-white/40 uppercase">Owned</div>
                  <div className="text-sm font-black text-sky-300">
                    {COLLECTIONS.filter(c => ownedCosmetics.includes(c.block.id)).length} / {COLLECTIONS.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of Schematics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {COLLECTIONS.map((col) => {
                const skin = col.block;
                const isOwned = ownedCosmetics.includes(skin.id);
                const isEquipped = equippedCosmetic === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${
                      isEquipped
                        ? 'from-[#0d2238] to-[#071322] border-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.3)]'
                        : isOwned
                        ? 'from-[#0e1628] to-[#080e1c] border-white/15 hover:border-sky-400/50'
                        : 'from-[#0b101c] to-[#060912] border-white/10 opacity-85'
                    }`}
                  >
                    {/* Subtle Blueprint grid texture */}
                    <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                        <span className="text-[10px] font-mono font-bold text-sky-400/80 uppercase tracking-widest truncate">
                          WORLD {String(col.world.themeIdx + 1).padStart(2, '0')} // {col.name.toUpperCase()}
                        </span>
                        
                        {isEquipped ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-500/30 text-sky-300 border border-sky-400/60 shrink-0 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>EQUIPPED</span>
                          </span>
                        ) : isOwned ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            READY
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/10 text-white/50 border border-white/10 shrink-0 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>SCHEMATIC</span>
                          </span>
                        )}
                      </div>

                      {/* Canvas Preview & Skin Info */}
                      <div className="flex items-center gap-3.5 mb-3 relative z-10">
                        <div className="p-1 rounded-xl bg-black/60 border border-white/15 relative overflow-hidden">
                          <SchematicMiniCanvas skinId={skin.id} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-white font-mono truncate">
                            {skin.name}
                          </h3>
                          <div className="text-[10px] font-mono text-sky-300/80 mt-0.5">
                            Alloy ID: #SK-{skin.themeIdx + 1}
                          </div>
                          <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed mt-1">
                            {skin.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-2 pt-3 border-t border-white/10 relative z-10">
                      <button
                        onClick={() => handleSynthesizeOrInspect(skin, col.name)}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                          !isOwned
                            ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                            : isEquipped
                            ? 'bg-sky-950/60 text-sky-300 border border-sky-400/60 hover:bg-sky-900/60'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        {!isOwned ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span>Synthesize Blueprint</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect & Sandbox Trial</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* STANDARD PHYSICS SANDBOX VIEW                                     */
        /* ================================================================= */
        <div className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-y-auto lg:overflow-hidden min-h-0 overflow-x-hidden touch-pan-y overscroll-contain">
          {/* Left: Simulation Presets */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-6 space-y-4 bg-[#0a0f1d]/40 lg:overflow-y-auto overscroll-contain shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                Quick setups
              </span>
              <span className="text-[10px] font-mono text-white/40">TAP TO LOAD</span>
            </div>

            <div className="space-y-3">
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.2)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5 min-w-0">
                      <span className="text-2xl shrink-0">{p.icon}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-white truncate">{p.name}</h3>
                        <div className="text-[10px] font-mono text-sky-300 truncate">
                          {p.options.speedMultiplier}x speed • {Math.round(p.options.boomChance * 100)}% bombs • {(p.options.wind ?? 0) > 0.6 ? 'strong wind' : (p.options.wind ?? 0) > 0 ? 'light wind' : 'no wind'}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 pl-9 leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 sm:mt-6 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/60 space-y-2">
              <div className="font-mono text-white/80 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>How practice works</span>
              </div>
              <p className="leading-relaxed">
                Practice games don't affect your campaign or tournaments. Pick the speed, bombs and wind you want
                and train your timing and balance.
              </p>
            </div>
          </div>

          {/* Right: Fine-Grained Parameter Tuning Controls */}
          <div className="lg:col-span-8 p-4 sm:p-6 space-y-6 lg:overflow-y-auto overscroll-contain pb-28 lg:pb-12 min-w-0">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                Your settings
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">Game settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Speed Multiplier Slider */}
              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wind className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase truncate">Block speed</span>
                  </div>
                  <span className="font-mono font-black text-sky-400 text-sm tabular-nums shrink-0">
                    {options.speedMultiplier.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={options.speedMultiplier}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setOptions({ ...options, speedMultiplier: parseFloat(e.target.value) });
                  }}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>0.5x (slow)</span>
                  <span>1x (normal)</span>
                  <span>2.5x (very fast)</span>
                </div>
              </div>

              {/* Bomb / Hazard Ratio Slider */}
              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase truncate">Bombs</span>
                  </div>
                  <span className="font-mono font-black text-rose-400 text-sm tabular-nums shrink-0">
                    {Math.round(options.boomChance * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.60"
                  step="0.02"
                  value={options.boomChance}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setOptions({ ...options, boomChance: parseFloat(e.target.value) });
                  }}
                  className="w-full accent-rose-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>0% (none)</span>
                  <span>25% (normal)</span>
                  <span>60% (lots)</span>
                </div>
              </div>

              {/* Wind Slider */}
              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase truncate">Wind</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-sm tabular-nums shrink-0">
                    {(options.wind ?? 0) === 0 ? 'Off' : `${Math.round((options.wind ?? 0) * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={options.wind ?? 0}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setOptions({ ...options, wind: parseFloat(e.target.value) });
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>Off</span>
                  <span>Gusty</span>
                  <span>Strong</span>
                </div>
              </div>

              {/* Block Length Selector */}
              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase truncate">Blocks per game</span>
                  </div>
                  <span className="font-mono font-black text-amber-400 text-sm tabular-nums shrink-0">
                    {options.blockCount} Blocks
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[25, 50, 100, 200].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setActivePreset('custom');
                        setOptions({ ...options, blockCount: count });
                      }}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        options.blockCount === count
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                          : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Blocks Toggle */}
              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase truncate">Special blocks</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs shrink-0">
                    {options.allowSpecialBlocks ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActivePreset('custom');
                    setOptions({ ...options, allowSpecialBlocks: !options.allowSpecialBlocks });
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border truncate ${
                    options.allowSpecialBlocks
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  Anchor, gold & crystal blocks: {options.allowSpecialBlocks ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            {/* Deceptive Modifiers Toggles */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-white/10 space-y-3 min-w-0">
              <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                Tricky blocks
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  onClick={() => {
                    setActivePreset('custom');
                    setOptions({ ...options, allowGhosts: !options.allowGhosts });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                    options.allowGhosts
                      ? 'bg-purple-950/30 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  <div className="text-sm font-black flex items-center gap-1.5 truncate">
                    <span>👻</span> Ghost Cloaking
                  </div>
                  <div className="text-[10px] text-white/60 mt-1 leading-snug">Turns almost invisible mid-flight</div>
                </button>

                <button
                  onClick={() => {
                    setActivePreset('custom');
                    setOptions({ ...options, allowBlinks: !options.allowBlinks });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                    options.allowBlinks
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  <div className="text-sm font-black flex items-center gap-1.5 truncate">
                    <span>👁️</span> Strobe Blink
                  </div>
                  <div className="text-[10px] text-white/60 mt-1 leading-snug">Flickers on and off</div>
                </button>

                <button
                  onClick={() => {
                    setActivePreset('custom');
                    setOptions({ ...options, allowFakes: !options.allowFakes });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                    options.allowFakes
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  <div className="text-sm font-black flex items-center gap-1.5 truncate">
                    <span>🎭</span> Mimic Traps
                  </div>
                  <div className="text-[10px] text-white/60 mt-1 leading-snug">Looks like a bomb (or a block) until it gets close</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar on Mobile for Guaranteed Launch Access */}
      {activeTab === 'sandbox' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#080d18]/95 backdrop-blur-md border-t border-white/10 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_#0284c7] active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start practice</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
