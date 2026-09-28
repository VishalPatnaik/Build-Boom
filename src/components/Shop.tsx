import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ArrowLeft, Coins, Check, Lock, Video, Plus, Shield, Zap } from 'lucide-react';
import { COLLECTIONS, ALL_COSMETICS, CosmeticCategory, CosmeticDef } from '../game/collections';
import { renderBlock, renderPlate, renderWorld, renderBoomParticle, getBoomColor } from '../game/themeRenderer';
import { POWERUP_CONFIG, PowerupType } from '../game/techTree';
import { audio } from '../audio/AudioEngine';

function LivePreviewCanvas({ previewState }: { previewState: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number = 0;
    let startTime = performance.now();
    let time = 0;

    const render = (now: number) => {
      time = now - startTime;
      // Sync canvas dimensions with container
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);

      const logicalW = rect.width;
      const logicalH = rect.height;

      // Render World
      renderWorld(ctx, logicalW, logicalH, previewState.background, time, true);

      // We want the plate and block to sit centered in the visible area above the bottom UI.
      // The bottom UI is roughly 320px tall on mobile.
      const visibleH = Math.max(logicalH - 320, logicalH * 0.4);
      const groundY = visibleH / 2 + 60;

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
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
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

    // Use a static frame (time = 5000) for shop thumbnails.
    // Animating 20+ canvases simultaneously causes massive frame drops.
    const time = 5000;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (activeCategory === 'background') {
      renderWorld(ctx, w, h, item.id, time, true);
    } else if (activeCategory === 'skin') {
      renderBlock(ctx, w/2 - 25, h/2 - 25, 50, 50, item.id, false, time);
    } else if (activeCategory === 'plate') {
      renderPlate(ctx, w/2 - 40, h/2 - 10, 80, 20, item.id, time);
    } else if (activeCategory === 'boom') {
      renderBoomParticle(ctx, { x: w/2, y: h/2, rotation: time*0.01, life: 1, size: 20, color: getBoomColor(item.id), type: 'main' }, time, item.id);
    }
  }, [item, activeCategory]);

  return (
    <canvas 
      ref={canvasRef}
      width={100}
      height={100}
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
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
  } = useGameStore();
  
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory | 'powerups'>('skin');
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

  const isItemOwned = (item: CosmeticDef) => {
    if (item.req === 0 && item.price === 0 && !item.isAd) return true;
    return ownedCosmetics.includes(item.id);
  };

  const cosmeticCat = activeCategory === 'powerups' ? 'skin' : activeCategory;
  const activeItem = ALL_COSMETICS.find(c => c.id === previewState[cosmeticCat]) || ALL_COSMETICS[0];
  const allItemsInCategory = ALL_COSMETICS.filter(c => c.type === cosmeticCat);
  const activePowerupDef = POWERUP_CONFIG[selectedPowerup];

  const handleBuy = () => {
    if (!activeItem) return;
    if (coins >= activeItem.price) {
      if (buyCosmetic(activeItem.id, activeItem.price)) {
        equipCosmetic(activeItem.id, cosmeticCat);
        setNotEnoughCoins(false);
      }
    } else {
      setNotEnoughCoins(true);
      setTimeout(() => setNotEnoughCoins(false), 2000);
    }
  };

  const handleEquip = () => {
    if (activeItem) {
      equipCosmetic(activeItem.id, cosmeticCat);
    }
  };

  const handleWatchAd = () => {
    if (activeItem) showShopAd(activeItem.id);
  };

  const handleBuyPowerupCoins = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    const success = buyPowerupWithCoins(selectedPowerup);
    if (success) {
      audio.playComboSurge(2);
      setPowerupPurchaseMsg(`Acquired ${activePowerupDef.name} (${activePowerupDef.highlight})!`);
      setTimeout(() => setPowerupPurchaseMsg(null), 2500);
    } else {
      audio.playBuildSound(0.4);
      setNotEnoughCoins(true);
      setTimeout(() => setNotEnoughCoins(false), 2000);
    }
  };

  const handleWatchPowerupAd = () => {
    showPowerupAd(selectedPowerup);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full h-full bg-[#190E2D] relative mx-auto overflow-hidden shadow-2xl"
      style={{ maxWidth: '600px' }}
    >
      {/* Absolute Full-Screen Live Preview */}
      <div className="absolute inset-0 w-full h-full bg-black z-0">
        <LivePreviewCanvas previewState={previewState} />
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-50 pointer-events-auto">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('menu')}
          className="p-2.5 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 border-white/40 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-white cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex flex-col items-center">
          <div className="font-black text-xl text-yellow-400 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono">
            ARMORY & LOCKER
          </div>
          <span className="text-[10px] text-cyan-300 font-mono tracking-wider uppercase font-bold">
            Tactical Customization
          </span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => useGameStore.getState().setShowIAP(true)}
          className="relative flex items-center gap-1.5 bg-gradient-to-r from-black/70 via-slate-900/80 to-black/70 pl-3 pr-2 py-1.5 rounded-2xl border-2 border-yellow-400/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <Coins className="w-4 h-4 text-[#FFD700] fill-current" />
          <span className="font-black text-base text-yellow-300 font-mono">{coins}</span>
          <div className="bg-[#FFD700] text-amber-950 rounded-lg p-0.5 ml-1 border border-yellow-200">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </motion.button>
      </div>

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-0 left-0 w-full z-50 flex flex-col pointer-events-none">
        
        {/* Gradient backing to ensure UI is readable */}
        <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-28 pb-6 px-4 flex flex-col pointer-events-auto">
          
          {/* Category Tabs */}
          <div className="flex bg-[#0f172a]/90 p-1.5 rounded-2xl gap-1 mb-4 backdrop-blur-md border-2 border-white/15 shadow-xl">
            {(['world', 'block', 'boom', 'plate', 'powerups'] as const).map(cat => {
              const tabCategory = cat === 'world' ? 'background' : cat === 'block' ? 'skin' : cat;
              const isSelected = activeCategory === tabCategory;
              return (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(tabCategory)}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 font-mono cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md scale-102 border border-white/40' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat === 'powerups' ? '⚡ BOOST' : cat}
                </button>
              );
            })}
            <button 
              onClick={() => useGameStore.getState().setShowIAP(true)}
              className="px-2.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 font-mono cursor-pointer bg-gradient-to-r from-yellow-500/20 to-amber-500/30 text-yellow-300 border border-yellow-400/50 hover:bg-yellow-400/30 shadow-xs flex items-center gap-1"
            >
              <span>🛒 PACKS</span>
            </button>
          </div>
          
          {activeCategory === 'powerups' ? (
            /* Tactical Powerups Horizontal Selector */
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mb-2 px-1">
                <span className="font-bold tracking-wider uppercase text-white/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  TACTICAL MUNITIONS
                </span>
                <span className="bg-black/60 px-2.5 py-1 rounded-xl border border-cyan-400/30 text-white font-mono">
                  ⏳ {powerups.stasis} • ⚡ {powerups.emp} • 🛡️ {powerups.shield}
                </span>
              </div>
              <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 touch-pan-x no-scrollbar">
                <div className="flex gap-3 px-2">
                  {(['stasis', 'emp', 'shield', 'bundle'] as PowerupType[]).map((pType) => {
                    const cfg = POWERUP_CONFIG[pType];
                    const isSelected = selectedPowerup === pType;
                    const inventoryCount = pType === 'stasis' ? powerups.stasis : pType === 'emp' ? powerups.emp : pType === 'shield' ? powerups.shield : 0;
                    
                    return (
                      <motion.button
                        key={pType}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPowerup(pType)}
                        className={`shrink-0 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all bg-gradient-to-b from-[#1e293b] to-[#0f172a] cursor-pointer shadow-lg ${
                          isSelected ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105 z-10' : 'border-white/20 opacity-80'
                        }`}
                      >
                        <div className="text-3xl mb-1">{cfg.icon}</div>
                        {pType !== 'bundle' && (
                          <div className="absolute top-1.5 right-1.5 bg-cyan-500/90 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold text-white border border-white/40 shadow-xs">
                            x{inventoryCount}
                          </div>
                        )}
                        <div className="text-[10px] font-mono font-bold text-white bg-black/70 px-1 py-0.5 rounded-md absolute bottom-1.5 truncate w-[90%] text-center uppercase z-20 border border-white/10">
                          {cfg.name}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Cosmetics Horizontal Item Selector */
            <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 touch-pan-x no-scrollbar">
              <div className="flex gap-3 px-2">
                {allItemsInCategory.map((item) => {
                  const isSelected = previewState[cosmeticCat] === item.id;
                  const owned = isItemOwned(item);
                  const isEquipped = getEquippedId(cosmeticCat) === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewState(s => ({ ...s, [cosmeticCat]: item.id }))}
                      className={`shrink-0 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all bg-gradient-to-b from-[#1e293b] to-[#0f172a] cursor-pointer shadow-lg ${isSelected ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105 z-10' : 'border-white/20 opacity-80'}`}
                    >
                      <ItemPreviewCanvas item={item} activeCategory={cosmeticCat} />
                      
                      {!owned && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px] z-10">
                           <Lock className="w-6 h-6 text-white/90 drop-shadow" />
                        </div>
                      )}
                      {isEquipped && (
                         <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-1 border-2 border-white z-20 shadow-md">
                           <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                         </div>
                      )}
                      <div className="text-[10px] font-mono font-bold text-white bg-black/75 px-1 py-0.5 rounded-md absolute bottom-1.5 truncate w-[90%] text-center uppercase z-20 border border-white/10">
                        {item.name}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Area */}
          <div className="relative bg-gradient-to-b from-[#1e293b]/95 to-[#0f172a]/95 backdrop-blur-xl border-2 border-white/20 p-5 rounded-3xl shrink-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-tactical-dots opacity-10 pointer-events-none" />
            <div className="absolute top-2 right-3 w-1 h-1 rounded-full bg-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-3 w-1 h-1 rounded-full bg-cyan-400 pointer-events-none" />
            {activeCategory === 'powerups' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-2xl font-black text-white uppercase drop-shadow-sm flex items-center gap-2">
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
                
                <p className="text-white/90 font-bold text-sm leading-tight mb-4 drop-shadow-md">
                  {activePowerupDef.description} No free starter charges — acquire tactical superiority with coins or sponsor ads!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBuyPowerupCoins}
                    className={`flex-1 w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-xs border-4 border-white transition-all active:translate-y-1 ${
                      notEnoughCoins 
                        ? 'bg-red-500 shadow-[0_4px_0_#8B0000] text-white' 
                        : 'bg-[#FFD700] shadow-[0_4px_0_#B8860B] text-[#B8860B]'
                    }`}
                  >
                    {notEnoughCoins ? 'Not Enough Coins' : (
                      <>
                        <span>Buy with Coins</span>
                        <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
                          {activePowerupDef.coinPrice} <Coins className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleWatchPowerupAd}
                    className="flex-1 w-full py-3.5 px-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 border-4 border-white shadow-[0_4px_0_#9333ea] rounded-2xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-wider text-xs active:translate-y-1 active:shadow-none transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Watch Ad (Free +{activePowerupDef.adReward})</span>
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
                    <span>Upgrade in Architect Academy &rarr;</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-white uppercase mb-1 drop-shadow-sm truncate">{activeItem.name}</h3>
                
                <div className="flex items-end justify-between mt-2">
                  <div className="flex-1">
                      <p className="text-white/90 font-bold text-sm leading-tight pr-2 drop-shadow-md">{activeItem.desc}</p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-end">
                    {getEquippedId(cosmeticCat) === activeItem.id ? (
                      <div className="px-6 py-3 bg-[#7CFC00] border-4 border-white shadow-[0_4px_0_#228B22] rounded-full flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-[#228B22]" strokeWidth={3} />
                        <span className="font-black text-[#228B22] uppercase tracking-wider text-sm">Equipped</span>
                      </div>
                    ) : isItemOwned(activeItem) ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEquip}
                        className="px-6 py-3 bg-[#4facfe] border-4 border-white shadow-[0_4px_0_#2a82c9] rounded-full text-white font-black uppercase tracking-wider text-sm active:translate-y-1 active:shadow-none transition-all"
                      >
                        Equip Now
                      </motion.button>
                    ) : activeItem.isAd ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleWatchAd}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 border-4 border-white shadow-[0_4px_0_#9333ea] rounded-full flex items-center justify-center gap-2 text-white font-black uppercase tracking-wider text-sm active:translate-y-1 active:shadow-none transition-all"
                      >
                        <Video className="w-5 h-5" />
                        <span>Watch Ad</span>
                      </motion.button>
                    ) : activeItem.req > unlockedLevels ? (
                      <div className="px-6 py-3 bg-gray-500/80 border-4 border-gray-400/50 rounded-full flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm">
                        <Lock className="w-5 h-5 text-gray-200" />
                        <span className="font-black text-gray-200 uppercase tracking-wider text-sm">Lvl {activeItem.req} Req</span>
                      </div>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBuy}
                        className={`px-6 py-3 rounded-full flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm border-4 border-white transition-all active:translate-y-1 active:shadow-none ${
                          notEnoughCoins 
                            ? 'bg-red-500 shadow-[0_4px_0_#8B0000] text-white' 
                            : 'bg-[#FFD700] shadow-[0_4px_0_#B8860B] text-[#B8860B]'
                        }`}
                      >
                        {notEnoughCoins ? 'Not Enough Coins' : (
                          <>
                            <span>Buy</span>
                            <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
                              {activeItem.price} <Coins className="w-4 h-4 fill-current" />
                            </div>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
