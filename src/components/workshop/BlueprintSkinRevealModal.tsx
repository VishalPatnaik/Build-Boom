import React, { useEffect, useRef } from 'react';
import { CosmeticDef } from '../../game/collections';
import { useGameStore } from '../../game/store';
import { renderBlock } from '../../game/themeRenderer';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';
import { audio } from '../../audio/AudioEngine';
import { haptics } from '../../utils/haptics';
import { 
  X, 
  Check, 
  Play, 
  Cpu, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Compass, 
  Maximize2 
} from 'lucide-react';

interface BlueprintSkinRevealModalProps {
  skin: CosmeticDef;
  worldName?: string;
  isOpen: boolean;
  onClose: () => void;
  onLaunchTrial?: (skinId: string) => void;
}

// Live interactive Canvas preview of the synthesized skin block
function BlueprintSkinCanvas({ skinId }: { skinId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      const time = now - startTime;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Holographic glowing base ring
      ctx.save();
      const cx = w / 2;
      const cy = h / 2 + 42;
      const ringGrad = safeCreateRadialGradient(ctx, cx, cy, 4, cx, cy, 54);
      if (ringGrad) {
        ringGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        ringGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)');
        ringGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 54, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();

      // 2. Render authentic high-fidelity skin block
      renderBlock(ctx, w / 2 - 36, h / 2 - 42, 72, 72, skinId, false, time);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skinId]);

  return (
    <canvas 
      ref={canvasRef} 
      width={140} 
      height={140} 
      className="w-32 h-32 mx-auto drop-shadow-[0_0_25px_rgba(56,189,248,0.7)]" 
    />
  );
}

export function BlueprintSkinRevealModal({
  skin,
  worldName,
  isOpen,
  onClose,
  onLaunchTrial
}: BlueprintSkinRevealModalProps) {
  const { equipCosmetic, equippedCosmetic } = useGameStore();
  const isCurrentlyEquipped = equippedCosmetic === skin.id;

  useEffect(() => {
    if (isOpen) {
      audio.playComboSurge(3);
      haptics.blockPlaced('titan_alloy');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEquip = () => {
    equipCosmetic(skin.id, 'skin');
    audio.playBuildSound(1.25);
    haptics.vibrate([20, 30, 20]);
  };

  const handleLaunchTrial = () => {
    equipCosmetic(skin.id, 'skin');
    if (onLaunchTrial) {
      onLaunchTrial(skin.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none">
      {/* Dynamic CSS Scanline sweeping down the screen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="w-full h-24 bg-gradient-to-b from-transparent via-sky-400/15 to-transparent animate-blueprint-scanline" />
      </div>

      {/* Rotating Blueprint Technical Grid Projector */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-sky-500/20 border-dashed pointer-events-none animate-blueprint-grid-spin opacity-30 flex items-center justify-center">
        <div className="w-[450px] h-[450px] rounded-full border border-sky-400/25" />
        <div className="w-[300px] h-[300px] rounded-full border border-sky-300/30 border-dashed" />
      </div>

      {/* Main Holographic Reveal Card */}
      <div className="relative z-10 w-full max-w-md bg-[#071120]/95 border-2 border-sky-400/80 rounded-3xl shadow-[0_0_60px_rgba(56,189,248,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] p-6 flex flex-col items-center text-center overflow-hidden">
        
        {/* Expanding Blueprint Shockwave Ring */}
        <div className="absolute top-36 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-sky-300 animate-blueprint-shockwave pointer-events-none" />

        {/* Blueprint Light Cone */}
        <div 
          className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none animate-blueprint-cone"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(56,189,248,0.35) 0%, transparent 70%)',
          }}
        />

        {/* Top Header Eyebrow */}
        <div className="flex items-center justify-between w-full mb-3 z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>BLUEPRINT SYNTHESIS // DECRYPTED</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Holographic Stage with CSS Reveal Rise */}
        <div className="relative my-2 py-4 flex flex-col items-center justify-center w-full">
          {/* Base Pedestal with CSS Pulsing Glow */}
          <div className="absolute bottom-6 w-36 h-8 rounded-full bg-sky-950/80 border border-sky-400/60 animate-blueprint-pedestal" />

          {/* Skin Block Rising with CSS Spring Overshoot */}
          <div className="relative z-10 animate-blueprint-reveal">
            <div className="animate-blueprint-hologram">
              <BlueprintSkinCanvas skinId={skin.id} />
            </div>
          </div>
        </div>

        {/* Skin Title & Specs (CSS Glitch / Decrypt Animation) */}
        <div className="w-full space-y-1.5 z-10 animate-blueprint-decrypt mt-1">
          <div className="text-[10px] font-mono text-sky-300/80 uppercase tracking-widest">
            {worldName ? `${worldName.toUpperCase()} ARCHETYPE` : 'TACTICAL SCHEMATIC'}
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.6)] font-mono">
            {skin.name}
          </h2>

          <p className="text-xs text-white/70 px-4 leading-relaxed max-w-sm mx-auto">
            {skin.desc}
          </p>
        </div>

        {/* Telemetry Matrix Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-2xl bg-[#030914] border border-sky-500/30 text-[10px] font-mono text-slate-300 z-10">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <div className="text-white/40 uppercase">Class</div>
            <div className="text-sky-300 font-bold truncate">STRUCTURAL</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <div className="text-white/40 uppercase">Alloy Index</div>
            <div className="text-amber-300 font-bold">#SK-{skin.themeIdx + 1}</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <div className="text-white/40 uppercase">Status</div>
            <div className="text-emerald-400 font-bold">SYNTHESIZED</div>
          </div>
        </div>

        {/* Interactive Action Controls */}
        <div className="w-full flex flex-col sm:flex-row gap-2.5 mt-5 z-10">
          <button
            onClick={handleEquip}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
              isCurrentlyEquipped
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
            }`}
          >
            {isCurrentlyEquipped ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Equipped in Arsenal</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Equip Block Skin</span>
              </>
            )}
          </button>

          <button
            onClick={handleLaunchTrial}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.5)] active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Sandbox Trial</span>
          </button>
        </div>
      </div>
    </div>
  );
}
