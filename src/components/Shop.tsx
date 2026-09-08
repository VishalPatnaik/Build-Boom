import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ArrowLeft, Coins, Check, Lock, Video, Plus } from 'lucide-react';
import { COLLECTIONS, ALL_COSMETICS, CosmeticCategory, CosmeticDef } from '../game/collections';
import { renderBlock, renderPlate, renderWorld, renderBoomParticle, getBoomColor } from '../game/themeRenderer';

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
  const { setMode, coins, ownedCosmetics, unlockedLevels, buyCosmetic, equipCosmetic, showShopAd, equippedCosmetic, equippedBackground, equippedBoomEffect, equippedPlate } = useGameStore();
  
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('skin');
  const [notEnoughCoins, setNotEnoughCoins] = useState(false);
  
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

  const activeItem = ALL_COSMETICS.find(c => c.id === previewState[activeCategory]) || ALL_COSMETICS[0];
  const allItemsInCategory = ALL_COSMETICS.filter(c => c.type === activeCategory);
  console.log("allItemsInCategory length:", activeCategory, allItemsInCategory.length);

  const handleBuy = () => {
    if (!activeItem) return;
    if (coins >= activeItem.price) {
      if (buyCosmetic(activeItem.id, activeItem.price)) {
        equipCosmetic(activeItem.id, activeCategory);
        setNotEnoughCoins(false);
      }
    } else {
      setNotEnoughCoins(true);
      setTimeout(() => setNotEnoughCoins(false), 2000);
    }
  };

  const handleEquip = () => {
    if (activeItem) {
      equipCosmetic(activeItem.id, activeCategory);
    }
  };

  const handleWatchAd = () => {
    if (activeItem) showShopAd(activeItem.id);
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMode('menu')}
          className="p-3 bg-[#4facfe] border-4 border-white rounded-full shadow-[0_4px_0_#2a82c9] text-white"
        >
          <ArrowLeft className="w-8 h-8" />
        </motion.button>
        <div className="flex-1 text-center font-black text-2xl text-white uppercase tracking-wider drop-shadow-md px-2" style={{ WebkitTextStroke: '1px black' }}>
          LOCKER
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => useGameStore.getState().setShowIAP(true)}
          className="flex items-center gap-1 bg-[#FFD700] pl-3 pr-2 py-2 rounded-full border-4 border-white shadow-[0_4px_0_#B8860B]"
        >
          <span className="font-black text-xl text-[#B8860B]">{coins}</span>
          <Coins className="w-5 h-5 text-[#B8860B] fill-current" />
          <div className="bg-[#B8860B] text-white rounded-full p-0.5 ml-1">
            <Plus className="w-4 h-4" strokeWidth={4} />
          </div>
        </motion.button>
      </div>

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-0 left-0 w-full z-50 flex flex-col pointer-events-none">
        
        {/* Gradient backing to ensure UI is readable */}
        <div className="w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-32 pb-6 px-4 flex flex-col pointer-events-auto">
          
          {/* Category Tabs */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1 mb-4 backdrop-blur-sm border border-white/10">
            {(['world', 'block', 'boom', 'plate'] as const).map(cat => {
              const tabCategory = cat === 'world' ? 'background' : cat === 'block' ? 'skin' : cat;
              const isSelected = activeCategory === tabCategory;
              return (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(tabCategory)}
                  className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${isSelected ? 'bg-white text-[#190E2D] shadow-lg scale-105' : 'text-white/70 hover:bg-white/20'}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          
          {/* Horizontal Item Selector */}
          <div className="w-full overflow-x-auto pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-3 px-2">
              {allItemsInCategory.map((item) => {
                const isSelected = previewState[activeCategory] === item.id;
                const owned = isItemOwned(item);
                const isEquipped = getEquippedId(activeCategory) === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreviewState(s => ({ ...s, [activeCategory]: item.id }))}
                    className={`shrink-0 w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center relative overflow-hidden transition-all bg-[#2D1B4E] ${isSelected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105 z-10' : 'border-white/20 opacity-80'}`}
                  >
                    <ItemPreviewCanvas item={item} activeCategory={activeCategory} />
                    
                    {!owned && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                         <Lock className="w-6 h-6 text-white/90" />
                      </div>
                    )}
                    {isEquipped && (
                       <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white z-20 shadow-md">
                         <Check className="w-4 h-4 text-white" strokeWidth={4} />
                       </div>
                    )}
                    <div className="text-[10px] font-black text-white bg-black/60 px-1 py-0.5 rounded absolute bottom-1 truncate w-[90%] text-center uppercase z-20" style={{ WebkitTextStroke: '0.5px black' }}>
                      {item.name}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Action Area */}
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 p-5 rounded-3xl shrink-0 shadow-xl">
            <h3 className="text-2xl font-black text-white uppercase mb-1 drop-shadow-sm truncate">{activeItem.name}</h3>
            
            <div className="flex items-end justify-between mt-2">
              <div className="flex-1">
                  <p className="text-white/90 font-bold text-sm leading-tight pr-2 drop-shadow-md">{activeItem.desc}</p>
              </div>
              
              <div className="flex flex-col items-end justify-end">
                {getEquippedId(activeCategory) === activeItem.id ? (
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
        </div>
      </div>
    </motion.div>
  );
}
