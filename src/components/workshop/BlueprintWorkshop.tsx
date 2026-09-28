import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/store';
import { SandboxOptions } from '../../game/LevelGenerator';
import { ArrowLeft, Play, Sliders, Shield, Zap, Wind, RefreshCw, Sparkles, Flame } from 'lucide-react';
import { audio } from '../../audio/AudioEngine';

interface Preset {
  id: string;
  name: string;
  desc: string;
  icon: string;
  options: SandboxOptions;
}

const PRESETS: Preset[] = [
  {
    id: 'zen',
    name: 'Zen Architecture',
    desc: 'Pure structural harmony with 0% bombs and gentle approach velocity.',
    icon: '🧘',
    options: {
      speedMultiplier: 0.8,
      boomChance: 0.0,
      blockCount: 40,
      allowGhosts: false,
      allowBlinks: false,
      allowFakes: false,
      allowSpecialBlocks: true,
    },
  },
  {
    id: 'hurricane',
    name: 'Hurricane Gyro',
    desc: 'High velocity gale winds with intense structural tilt forces.',
    icon: '🌪️',
    options: {
      speedMultiplier: 1.35,
      boomChance: 0.28,
      blockCount: 60,
      allowGhosts: false,
      allowBlinks: true,
      allowFakes: false,
      allowSpecialBlocks: true,
    },
  },
  {
    id: 'bullet_hell',
    name: 'Neon Bullet Hell',
    desc: 'Extreme 50% bomb saturation with deceptive phantom and blinking hazards.',
    icon: '⚡',
    options: {
      speedMultiplier: 1.6,
      boomChance: 0.48,
      blockCount: 75,
      allowGhosts: true,
      allowBlinks: true,
      allowFakes: true,
      allowSpecialBlocks: true,
    },
  },
  {
    id: 'midas_rush',
    name: 'Midas Rush',
    desc: 'High concentration of rare Prism and Titan alloy blocks.',
    icon: '🪙',
    options: {
      speedMultiplier: 1.1,
      boomChance: 0.2,
      blockCount: 50,
      allowGhosts: false,
      allowBlinks: false,
      allowFakes: false,
      allowSpecialBlocks: true,
    },
  },
];

export function BlueprintWorkshop() {
  const { setMode, setState, setSandboxOptions, setScore } = useGameStore();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full flex flex-col bg-[#080d18] text-white select-none overflow-hidden"
    >
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
              PHYSICS & SIMULATION LAB
            </div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white uppercase flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Blueprint Workshop</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 shrink-0">
                SANDBOX
              </span>
            </h1>
          </div>
        </div>

        <button
          onClick={handleLaunch}
          className="hidden sm:flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] active:translate-y-0.5 cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Simulation</span>
        </button>
      </header>

      {/* Workspace Body: Responsive two-column on desktop, smooth single-scroll on mobile */}
      <div className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-y-auto lg:overflow-hidden min-h-0 overflow-x-hidden touch-pan-y overscroll-contain">
        {/* Left: Simulation Presets */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-6 space-y-4 bg-[#0a0f1d]/40 lg:overflow-y-auto overscroll-contain shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
              Architectural Presets
            </span>
            <span className="text-[10px] font-mono text-white/40">1-CLICK LOAD</span>
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
                        {p.options.speedMultiplier}x Speed • {Math.round(p.options.boomChance * 100)}% Hazards
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
              <span>Sandbox Telemetry Notes</span>
            </div>
            <p className="leading-relaxed">
              Custom simulations do not alter campaign level progression or consume tournament passes. Use this
              sandbox to master bullet-hell speeds, test structural tilt mechanics, and train reaction timing!
            </p>
          </div>
        </div>

        {/* Right: Fine-Grained Parameter Tuning Controls */}
        <div className="lg:col-span-8 p-4 sm:p-6 space-y-6 lg:overflow-y-auto overscroll-contain pb-28 lg:pb-12 min-w-0">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
              Vector & Ballistics Calibration
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">Physics Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Speed Multiplier Slider */}
            <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Wind className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-xs font-bold text-white uppercase truncate">Approach Velocity</span>
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
                <span>0.50x (Novice)</span>
                <span>1.0x (Standard)</span>
                <span>2.50x (Hypersonic)</span>
              </div>
            </div>

            {/* Bomb / Hazard Ratio Slider */}
            <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold text-white uppercase truncate">Hazard Density</span>
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
                <span>0% (Peaceful)</span>
                <span>25% (Standard)</span>
                <span>60% (Inferno)</span>
              </div>
            </div>

            {/* Block Length Selector */}
            <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-white uppercase truncate">Simulation Length</span>
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
                  <span className="text-xs font-bold text-white uppercase truncate">Rare Alloys</span>
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
                Prism & Titan Blocks: {options.allowSpecialBlocks ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Deceptive Modifiers Toggles */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-white/10 space-y-3 min-w-0">
            <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
              Deceptive Modifiers & Cloaking
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
                <div className="text-[10px] text-white/60 mt-1 leading-snug">Fades almost invisible mid-flight</div>
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
                <div className="text-[10px] text-white/60 mt-1 leading-snug">High-frequency optical strobing</div>
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
                <div className="text-[10px] text-white/60 mt-1 leading-snug">Swaps appearance until close range</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar on Mobile for Guaranteed Launch Access */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#080d18]/95 backdrop-blur-md border-t border-white/10 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <button
          onClick={handleLaunch}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_#0284c7] active:translate-y-1 active:shadow-none cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch Simulation</span>
        </button>
      </div>
    </motion.div>
  );
}
