import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { 
  ArrowLeft, 
  Coins, 
  Check, 
  Lock, 
  Video, 
  Plus, 
  Shield, 
  Zap, 
  Trophy, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { COLLECTIONS, ALL_COSMETICS, CosmeticCategory, CosmeticDef } from '../game/collections';
import { renderBlock, renderPlate, renderWorld, renderBoomParticle, getBoomColor } from '../game/themeRenderer';
import { EnvironmentRenderer, environmentRenderer, ActiveWorldInfo, WORLD_NAMES } from '../game/EnvironmentRenderer';
import { getThemePalette, applyThemeCSSVariables } from '../utils/themeAccents';
import { useWorldTheme, WorldThemeResult } from '../hooks/useWorldTheme';
import { POWERUP_CONFIG, PowerupType } from '../game/techTree';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { screenFadeSlideVariants } from '../utils/screenTransitions';

function formatCompactCoins(amount: number): string {
  if (!amount || amount <= 0) return 'FREE';
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

function LivePreviewCanvas({ previewState, worldTheme }: { previewState: any; worldTheme: WorldThemeResult }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<EnvironmentRenderer | null>(null);

  if (!rendererRef.current && typeof document !== 'undefined') {
    rendererRef.current = new EnvironmentRenderer();
  }

  useEffect(() => {
    if (rendererRef.current && previewState.background) {
      rendererRef.current.setTargetWorld(previewState.background, performance.now());
    }
  }, [previewState.background]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number = 0;
    let startTime = performance.now();
    let time = 0;

    let rawW = Math.max(1, Math.floor(container.clientWidth || 300));
    let rawH = Math.max(1, Math.floor(container.clientHeight || 300));
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const updateDimensions = () => {
      if (!container) return;
      rawW = Math.max(1, Math.floor(container.clientWidth || 300));
      rawH = Math.max(1, Math.floor(container.clientHeight || 300));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.max(1, Math.floor(rawW * dpr));
      const targetH = Math.max(1, Math.floor(rawH * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };
    updateDimensions();

    const ro = new ResizeObserver(() => {
      updateDimensions();
    });
    ro.observe(container);

    const render = (now: number) => {
      time = now - startTime;
      const w = canvas.width;
      const h = canvas.height;

      if (w <= 0 || h <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);

      const logicalW = rawW;
      const logicalH = rawH;

      // Render World with full environmental assets, lighting, particles, and shaders from unified worldTheme
      const worldInfo = worldTheme.activeWorldInfo;

      try {
        if (rendererRef.current) {
          rendererRef.current.render(
            ctx,
            logicalW,
            logicalH,
            time,
            worldInfo,
            0,
            'shop',
            'idle',
            0
          );
        } else {
          renderWorld(ctx, logicalW, logicalH, previewState.background, time, true);
        }
      } catch {
        // Guard against transient canvas sizing
      }

      // Plate and block centered in visible area above bottom UI
      const visibleH = Math.max(logicalH - 340, logicalH * 0.4);
      const groundY = visibleH / 2 + 50;

      // Render Plate
      renderPlate(ctx, logicalW/2 - 60, groundY, 120, 30, previewState.plate, time);

      // Render Block (bouncing)
      const bounceY = Math.abs(Math.sin(time / 200)) * 40;
      renderBlock(ctx, logicalW/2 - 40, groundY - 60 - bounceY, 80, 80, previewState.skin, false, time);
      
      // Render Boom attacking
      const cycle = Math.floor(time / 15) % 150;
      let boomX = logicalW/2 + 120;
      let boomY = groundY - 150;
      let boomLife = 1;
      let type = 'projectile';
      
      if (cycle < 80) { // Charging / approaching
         const t = Math.pow(cycle / 80, 2); // accelerate
         boomX = logicalW/2 + 120 - t * 120;
         boomY = groundY - 150 + t * 150;
      } else if (cycle < 110) { // Impact explosion
         const t = (cycle - 80) / 30;
         boomX = logicalW/2;
         boomY = groundY;
         boomLife = 1 - t; // fade out
         type = 'impact';
      } else {
         boomLife = 0;
      }
      
      if (boomLife > 0) {
         renderBoomParticle(ctx, { x: boomX, y: boomY, rotation: cycle*0.1, life: boomLife, size: type === 'impact' ? 60 + (1-boomLife)*60 : 30, color: getBoomColor(previewState.boom), type }, time, previewState.boom);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [previewState]);

  return (
    <div ref={containerRef} style={worldTheme.cssVariables} className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
      <canvas 
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}

function ItemPreviewCanvas({ item, activeCategory }: { item: CosmeticDef, activeCategory: CosmeticCategory }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = 5000;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (activeCategory === 'background') {
      renderWorld(ctx, w, h, item.id, time, true);
    } else if (activeCategory === 'skin') {
      renderBlock(ctx, w/2 - 22, h/2 - 22, 44, 44, item.id, false, time);
    } else if (activeCategory === 'plate') {
      renderPlate(ctx, w/2 - 34, h/2 - 10, 68, 20, item.id, time);
    } else if (activeCategory === 'boom') {
      renderBoomParticle(ctx, { x: w/2, y: h/2, rotation: time*0.01, life: 1, size: 20, color: getBoomColor(item.id), type: 'main' }, time, item.id);
    }
  }, [item, activeCategory]);

  return (
    <canvas 
      ref={canvasRef}
      width={120}
      height={80}
      className="w-full h-full object-cover z-0 block"
    />
  );
}

export function Shop() {
  const { 
    setMode, 
    coins, 
    ownedCosmetics, 
    unlockedLevels, 
    buyCosmetic, 
    equipCosmetic, 
    showShopAd, 
    equippedCosmetic, 
    equippedBackground, 
    equippedBoomEffect, 
    equippedPlate,
    powerups,
    buyPowerupWithCoins,
    showPowerupAd,
    triggerAssetTransition,
    adsRemoved,
  } = useGameStore();
  
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory | 'powerups'>('background');
  const [selectedPowerup, setSelectedPowerup] = useState<PowerupType>('stasis');
  const [notEnoughCoins, setNotEnoughCoins] = useState(false);
  const [powerupPurchaseMsg, setPowerupPurchaseMsg] = useState<string | null>(null);
  
  const getEquippedId = (cat: CosmeticCategory) => {
    if (cat === 'skin') return equippedCosmetic || COLLECTIONS[0].block.id;
    if (cat === 'background') return equippedBackground || COLLECTIONS[0].world.id;
    if (cat === 'boom') return equippedBoomEffect || COLLECTIONS[0].boom.id;
    if (cat === 'plate') return equippedPlate || COLLECTIONS[0].plate.id;
    return '';
  };

  const [previewState, setPreviewState] = useState({
    skin: getEquippedId('skin'),
    background: getEquippedId('background'),
    boom: getEquippedId('boom'),
    plate: getEquippedId('plate')
  });

  // Keep preview state aligned when store equipped items update
  useEffect(() => {
    setPreviewState({
      skin: getEquippedId('skin'),
      background: getEquippedId('background'),
      boom: getEquippedId('boom'),
      plate: getEquippedId('plate'),
    });
  }, [equippedBackground, equippedCosmetic, equippedBoomEffect, equippedPlate]);

  const isItemOwned = (item: CosmeticDef) => {
    if (item.req === 0 && item.price === 0 && !item.isAd) return true;
    return ownedCosmetics.includes(item.id);
  };

  const cosmeticCat = activeCategory === 'powerups' ? 'skin' : activeCategory;
  const activeItem = ALL_COSMETICS.find(c => c.id === previewState[cosmeticCat]) || ALL_COSMETICS[0];
  const allItemsInCategory = ALL_COSMETICS.filter(c => c.type === cosmeticCat);
  const activePowerupDef = POWERUP_CONFIG[selectedPowerup];

  const currentWorldId = previewState.background || equippedBackground || 'bg-0';
  const worldTheme = useWorldTheme(currentWorldId);
  const themePalette = worldTheme.palette;

  const handleSelectCosmetic = (item: CosmeticDef, cat: CosmeticCategory) => {
    audio.playClickSound();
    haptics.uiTap();
    if (cat === 'background') {
      // Independent live preview: updates preview canvas & theme styling without altering equipped items
      setPreviewState(s => ({
        ...s,
        background: item.id,
      }));
    } else {
      setPreviewState(s => ({ ...s, [cat]: item.id }));
    }
  };

  const handleBuy = () => {
    if (!activeItem) return;
    if (coins >= activeItem.price) {
      triggerAssetTransition('Authorizing Transaction...', 450);
      if (buyCosmetic(activeItem.id, activeItem.price)) {
        audio.playPerfectSound();
        haptics.vibrate([20, 35, 20]);
        if (cosmeticCat === 'background') {
          worldTheme.switchWorldTheme(activeItem.id, {
            transitionMessage: 'Unlocking & Compiling Shaders...',
          });
        } else {
          equipCosmetic(activeItem.id, cosmeticCat);
        }
        setNotEnoughCoins(false);
      }
    } else {
      audio.playBuildSound(0.5);
      haptics.vibrate(40);
      setNotEnoughCoins(true);
      setTimeout(() => setNotEnoughCoins(false), 2500);
    }
  };

  const handleEquip = () => {
    if (activeItem) {
      audio.playClickSound();
      haptics.uiTap();
      if (cosmeticCat === 'background') {
        worldTheme.switchWorldTheme(activeItem.id, {
          transitionMessage: 'Compiling Environment Shaders...',
        });
      } else {
        triggerAssetTransition('Applying Cosmetic Asset...', 420);
        equipCosmetic(activeItem.id, cosmeticCat);
      }
    }
  };

  const handleWatchAd = () => {
    if (!activeItem) return;
    audio.playClickSound();
    haptics.vibrate(15);
    showShopAd(activeItem.id);
  };

  const handleBuyPowerupCoins = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    triggerAssetTransition(`Authorizing Tactical ${activePowerupDef.name}...`, 450);
    const success = buyPowerupWithCoins(selectedPowerup);
    if (success) {
      audio.playComboSurge(2);
      haptics.vibrate([20, 30]);
      setPowerupPurchaseMsg(`Acquired ${activePowerupDef.name} (${activePowerupDef.highlight})!`);
      setTimeout(() => setPowerupPurchaseMsg(null), 2500);
    } else {
      audio.playBuildSound(0.4);
      haptics.vibrate(40);
      setNotEnoughCoins(true);
      setTimeout(() => setNotEnoughCoins(false), 2000);
    }
  };

  const handleWatchPowerupAd = () => {
    audio.playClickSound();
    haptics.vibrate(15);
    showPowerupAd(selectedPowerup);
  };

  const isEquipped = getEquippedId(cosmeticCat) === activeItem.id;
  const isOwned = isItemOwned(activeItem);

  return (
    <motion.div 
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col w-full h-full bg-[#190E2D] relative mx-auto overflow-hidden shadow-2xl"
      style={{ ...worldTheme.cssVariables, maxWidth: '600px' }}
    >
      {/* Absolute Full-Screen Live Preview */}
      <div className="absolute inset-0 w-full h-full bg-black z-0">
        <LivePreviewCanvas previewState={previewState} worldTheme={worldTheme} />
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-50 pointer-events-auto">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('menu')}
          className="p-2.5 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-white cursor-pointer active:scale-95 transition-all"
          style={{
            borderColor: `${themePalette.accent}80`,
            boxShadow: `0 0 15px ${themePalette.glow}`,
            color: themePalette.accent,
          }}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <div 
            className="font-black text-xl uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono transition-colors duration-300"
            style={{ color: themePalette.accent }}
          >
            ARMORY & LOCKER
          </div>
          <span 
            className="text-[10px] font-mono tracking-wider uppercase font-bold transition-colors duration-300"
            style={{ color: themePalette.primary }}
          >
            {activeCategory === 'background' ? `${worldTheme.worldName} • World Environment` : 'Tactical Customization'}
          </span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => useGameStore.getState().setShowIAP(true)}
          className="relative flex items-center gap-1.5 bg-gradient-to-r from-black/70 via-slate-900/80 to-black/70 pl-3 pr-2 py-1.5 rounded-2xl border-2 border-yellow-400/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <Coins className="w-4 h-4 text-[#FFD700] fill-current" />
          <span className="font-black text-base text-yellow-300 font-mono">{coins.toLocaleString()}</span>
          <div className="bg-[#FFD700] text-amber-950 rounded-lg p-0.5 ml-1 border border-yellow-200">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </motion.button>
      </div>

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-0 left-0 w-full z-50 flex flex-col pointer-events-none">
        
        {/* Gradient backing to ensure UI is readable */}
        <div className="w-full bg-gradient-to-t from-black/98 via-black/90 to-transparent pt-20 pb-5 px-3 sm:px-4 flex flex-col pointer-events-auto">
          
          {/* Category Tabs */}
          <div className="flex bg-[#0f172a]/95 p-1 rounded-2xl gap-1 mb-3 backdrop-blur-md border-2 border-white/15 shadow-xl">
            {(['world', 'block', 'boom', 'plate', 'powerups'] as const).map(cat => {
              const tabCategory = cat === 'world' ? 'background' : cat === 'block' ? 'skin' : cat;
              const isSelected = activeCategory === tabCategory;
              return (
                <button 
                  key={cat}
                  onClick={() => {
                    audio.playClickSound();
                    setActiveCategory(tabCategory);
                  }}
                  className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 font-mono cursor-pointer ${
                    isSelected 
                      ? 'shadow-md scale-102 border border-white/40' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  style={isSelected ? {
                    background: `linear-gradient(to right, ${themePalette.primary}, ${themePalette.accent})`,
                    boxShadow: `0 0 12px ${themePalette.glow}`,
                    color: '#0f172a',
                  } : undefined}
                >
                  {cat === 'powerups' ? '⚡ BOOST' : cat}
                </button>
              );
            })}
            <button 
              onClick={() => {
                audio.playClickSound();
                useGameStore.getState().setShowIAP(true);
              }}
              className="px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 font-mono cursor-pointer bg-gradient-to-r from-yellow-500/20 to-amber-500/30 text-yellow-300 border border-yellow-400/50 hover:bg-yellow-400/30 shadow-xs flex items-center gap-1 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>PACKS</span>
            </button>
          </div>
          
          {activeCategory === 'powerups' ? (
            /* Tactical Powerups Grid */
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mb-2 px-1">
                <span className="font-bold tracking-wider uppercase text-white/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  TACTICAL MUNITIONS
                </span>
                <span className="bg-black/60 px-2.5 py-1 rounded-xl border border-cyan-400/30 text-white font-mono">
                  ⏳ {powerups.stasis} • ⚡ {powerups.emp} • 🛡️ {powerups.shield}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['stasis', 'emp', 'shield', 'bundle'] as PowerupType[]).map((pType) => {
                  const cfg = POWERUP_CONFIG[pType];
                  const isSelected = selectedPowerup === pType;
                  const inventoryCount = pType === 'stasis' ? powerups.stasis : pType === 'emp' ? powerups.emp : pType === 'shield' ? powerups.shield : 0;
                  
                  return (
                    <motion.button
                      key={pType}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        audio.playClickSound();
                        setSelectedPowerup(pType);
                      }}
                      className={`h-22 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all bg-gradient-to-b from-[#1e293b] to-[#0f172a] cursor-pointer shadow-lg p-1 ${
                        isSelected ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-102 z-10' : 'border-white/20 opacity-80'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cfg.icon}</div>
                      {pType !== 'bundle' && (
                        <div className="absolute top-1 right-1 bg-cyan-500/90 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold text-white border border-white/40 shadow-xs">
                          x{inventoryCount}
                        </div>
                      )}
                      <div className="text-[9px] font-mono font-bold text-white bg-black/75 px-1 py-0.5 rounded-md truncate w-full text-center uppercase z-20 border border-white/10">
                        {cfg.name}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CLEAN PREMIUM ITEM SELECTOR CAROUSEL */
            <div className="w-full mb-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/70 mb-1.5 px-1">
                <span className="font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themePalette.accent }} />
                  {activeCategory === 'background' ? 'WORLD CATALOGUE (20 BIOMES)' : `${activeCategory.toUpperCase()} CATALOGUE`}
                </span>
                <span className="text-[10px] text-white/50">
                  {allItemsInCategory.filter(isItemOwned).length}/{allItemsInCategory.length} Unlocked
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto touch-pan-x no-scrollbar py-1 px-1">
                {allItemsInCategory.map((item) => {
                  const isSelected = previewState[cosmeticCat] === item.id;
                  const owned = isItemOwned(item);
                  const isEquippedCurrent = getEquippedId(cosmeticCat) === item.id;
                  const isAvailable = !owned && unlockedLevels >= item.req;
                  const isLockedByLvl = !owned && unlockedLevels < item.req;

                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectCosmetic(item, cosmeticCat)}
                      className={`relative w-32 sm:w-36 shrink-0 rounded-2xl border-2 flex flex-col justify-between overflow-hidden transition-all text-left cursor-pointer p-2 ${
                        isSelected 
                          ? 'scale-[1.03] z-10 shadow-xl' 
                          : isEquippedCurrent
                          ? 'border-emerald-500/60 bg-[#0f172a]/95'
                          : owned
                          ? 'border-cyan-500/40 bg-[#0f172a]/90'
                          : isAvailable
                          ? 'border-amber-400/60 bg-[#0f172a]/90'
                          : 'border-white/15 bg-[#0f172a]/75 hover:border-white/30 opacity-80'
                      }`}
                      style={isSelected ? {
                        borderColor: themePalette.accent,
                        boxShadow: `0 0 18px ${themePalette.glow}`,
                        backgroundColor: '#0f172a',
                      } : undefined}
                    >
                      {/* Top Bar with Name and Status Badge */}
                      <div className="flex items-center justify-between gap-1 w-full mb-1 z-10">
                        <span className="text-[10px] font-mono font-black text-white/95 truncate uppercase tracking-tight">
                          {activeCategory === 'background' ? `W#${item.themeIdx + 1}` : item.name.split(' ')[0]}
                        </span>
                        
                        {isEquippedCurrent ? (
                          <span className="shrink-0 bg-emerald-500 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-white/60 shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                            <span>EQUIPPED</span>
                          </span>
                        ) : owned ? (
                          <span className="shrink-0 bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[8px] px-1.5 py-0.2 rounded-full border border-cyan-400/40">
                            OWNED
                          </span>
                        ) : isAvailable ? (
                          <span className="shrink-0 bg-amber-400 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded-full border border-yellow-200">
                            AVAILABLE
                          </span>
                        ) : (
                          <span className="shrink-0 bg-rose-950/80 text-rose-300 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-rose-500/30">
                            <Lock className="w-2 h-2" />
                            <span>LVL {item.req}</span>
                          </span>
                        )}
                      </div>

                      {/* Canvas Thumbnail Preview */}
                      <div className="w-full h-18 rounded-xl overflow-hidden relative border border-white/10 bg-black/60 mb-1">
                        <ItemPreviewCanvas item={item} activeCategory={cosmeticCat} />
                        {isLockedByLvl && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[0.5px]">
                            <Lock className="w-4 h-4 text-rose-300/80 drop-shadow" />
                            <span className="text-[8px] font-mono font-bold text-rose-300/80 mt-0.5">LVL {item.req}</span>
                          </div>
                        )}
                        {isEquippedCurrent && (
                          <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-0.5 border border-white shadow-md">
                            <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Name Label & Unlock Method Indicator */}
                      <div className="w-full mt-1 flex flex-col gap-0.5">
                        <div className="text-[9px] font-mono text-white/90 truncate font-bold">
                          {item.name}
                        </div>
                        
                        {/* Unlock Method Strip */}
                        <div className="flex items-center justify-between text-[8px] font-mono pt-0.5 border-t border-white/10">
                          {isEquippedCurrent ? (
                            <span className="text-emerald-400 font-black tracking-tight flex items-center gap-0.5">
                              <Check className="w-2 h-2 stroke-[3]" /> EQUIPPED
                            </span>
                          ) : owned ? (
                            <span className="text-cyan-300 font-bold tracking-tight">
                              UNLOCKED
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-[8px] text-white/70 w-full justify-between">
                              <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                                {item.price.toLocaleString()} <Coins className="w-2 h-2 fill-current" />
                              </span>
                              <span className="text-[7.5px] text-purple-300 font-bold bg-purple-900/50 px-1 py-0.2 rounded border border-purple-500/30">
                                AD / LVL {item.req}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Area & Detailed Button Controls */}
          <div 
            className="relative bg-gradient-to-b from-[#1e293b]/98 to-[#0f172a]/98 backdrop-blur-xl border-2 p-4 sm:p-5 rounded-3xl shrink-0 shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              borderColor: `${themePalette.accent}55`,
              boxShadow: `0 -10px 40px -10px ${themePalette.glow}`,
            }}
          >
            <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />
            <div className="absolute top-2 right-3 w-1 h-1 rounded-full bg-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-3 w-1 h-1 rounded-full bg-cyan-400 pointer-events-none" />

            {activeCategory === 'powerups' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase drop-shadow-sm flex items-center gap-2">
                    <span>{activePowerupDef.icon}</span>
                    <span>{activePowerupDef.name}</span>
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {activePowerupDef.highlight}
                  </span>
                </div>
                
                {powerupPurchaseMsg && (
                  <div className="text-emerald-300 font-mono text-xs font-bold mb-2 animate-pulse">
                    ✓ {powerupPurchaseMsg}
                  </div>
                )}
                
                <p className="text-white/90 font-bold text-xs sm:text-sm leading-tight mb-3 drop-shadow-md">
                  {activePowerupDef.description} No free starter charges — acquire tactical superiority with coins or sponsor ads!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyPowerupCoins}
                    className={`flex-1 w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs border-2 border-white transition-all active:translate-y-0.5 ${
                      notEnoughCoins 
                        ? 'bg-red-500 shadow-[0_3px_0_#8B0000] text-white' 
                        : 'bg-[#FFD700] shadow-[0_3px_0_#B8860B] text-[#B8860B]'
                    }`}
                  >
                    {notEnoughCoins ? 'Not Enough Coins' : (
                      <>
                        <span>Buy with Coins</span>
                        <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full font-mono">
                          {activePowerupDef.coinPrice} <Coins className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWatchPowerupAd}
                    className="flex-1 w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 border-2 border-white shadow-[0_3px_0_#9333ea] rounded-2xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-wider text-xs active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {adsRemoved ? <ShieldCheck className="w-4 h-4 text-emerald-300" /> : <Video className="w-4 h-4" />}
                    <span>{adsRemoved ? 'VIP Free (+3 Charges)' : `Watch Ad (+${activePowerupDef.adReward})`}</span>
                  </motion.button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300/80 uppercase">Tactical Research Matrix</span>
                  <button
                    type="button"
                    onClick={() => {
                      audio.playBuildSound(1.2);
                      setMode('academy');
                    }}
                    className="text-xs font-mono font-bold text-amber-300 hover:text-amber-200 cursor-pointer flex items-center gap-1 active:underline"
                  >
                    <span>Upgrade in Shift Lab &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Active Item Title & Category Info */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase drop-shadow-sm truncate flex items-center gap-2">
                    <span>{activeItem.name}</span>
                    {activeCategory === 'background' && (
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${themePalette.accent}25`, color: themePalette.accent, borderColor: `${themePalette.accent}60`, borderWidth: 1 }}
                      >
                        WORLD #{worldTheme.worldIndex + 1}
                      </span>
                    )}
                  </h3>
                  
                  {isEquipped ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> EQUIPPED
                    </span>
                  ) : isOwned ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-mono text-[10px] font-bold">
                      READY TO EQUIP
                    </span>
                  ) : null}
                </div>
                
                <p className="text-white/80 font-medium text-xs leading-tight mb-3">
                  {activeItem.desc}
                </p>

                {/* State & Multi-Pathway Action Buttons */}
                {isEquipped ? (
                  /* 1. EQUIPPED STATE */
                  <div className="w-full py-3.5 px-4 bg-emerald-500/15 border-2 border-emerald-400 text-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-0.5 font-mono shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                    <div className="flex items-center gap-2 font-black text-sm tracking-wider text-emerald-300">
                      <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                      <span>CURRENTLY EQUIPPED</span>
                    </div>
                    <span className="text-[10px] text-emerald-300/80 font-sans font-medium">
                      {activeCategory === 'background' ? 'Active Environment in Shift Odyssey, Orbital Shift & Shift Arena' : 'Active Tactical Cosmetic'}
                    </span>
                  </div>
                ) : isOwned ? (
                  /* 2. OWNED STATE (EQUIP BUTTON) */
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEquip}
                    className="w-full py-3.5 px-4 border-2 border-white rounded-2xl text-slate-950 font-black uppercase tracking-wider text-sm active:translate-y-0.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer font-mono"
                    style={{
                      background: `linear-gradient(135deg, ${themePalette.primary}, ${themePalette.accent})`,
                      boxShadow: `0 4px 20px ${themePalette.glow}`,
                    }}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{activeCategory === 'background' ? 'EQUIP WORLD ENVIRONMENT' : 'EQUIP NOW'}</span>
                  </motion.button>
                ) : (
                  /* 3. NOT OWNED STATE: DUAL ACQUISITION PATHWAYS WITH OPTIONAL CAMPAIGN MILESTONE */
                  (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-0.5 px-1">
                        {unlockedLevels >= activeItem.req ? (
                          <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" /> CAMPAIGN GATE CLEARED • LEVEL {activeItem.req}
                          </span>
                        ) : (
                          <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> CAMPAIGN LVL {activeItem.req} (OR UNLOCK EARLY)
                          </span>
                        )}
                        <span className="text-white/60">Your Level: {unlockedLevels}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Option 1: BUY WITH COINS */}
                        {coins >= activeItem.price ? (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBuy}
                            className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs border-2 border-white bg-[#FFD700] text-amber-950 shadow-[0_3px_0_#B8860B] active:translate-y-0.5 cursor-pointer font-mono"
                          >
                            <span>BUY WITH COINS</span>
                            <div className="flex items-center gap-1 bg-black/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                              {activeItem.price.toLocaleString()} <Coins className="w-3.5 h-3.5 fill-current text-amber-900" />
                            </div>
                          </motion.button>
                        ) : (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              audio.playClickSound();
                              useGameStore.getState().setShowIAP(true);
                            }}
                            className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border-2 border-amber-500/50 bg-amber-950/40 text-amber-200 cursor-pointer active:scale-98 font-mono"
                          >
                            <span className="font-black text-[11px] text-yellow-300">NEED COINS</span>
                            <span className="text-[10px] text-yellow-400/90 underline">
                              +{(activeItem.price - coins).toLocaleString()} • Buy Credits
                            </span>
                          </motion.button>
                        )}

                        {/* Option 2: REWARDED AD ALTERNATIVE */}
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleWatchAd}
                          className="py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs border-2 border-white bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_3px_0_#701a75] active:translate-y-0.5 cursor-pointer font-mono"
                        >
                          {adsRemoved ? <ShieldCheck className="w-4 h-4 text-emerald-300" /> : <Video className="w-4 h-4" />}
                          <span>{adsRemoved ? 'VIP AD-FREE CLAIM' : 'WATCH SPONSOR AD'}</span>
                        </motion.button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

