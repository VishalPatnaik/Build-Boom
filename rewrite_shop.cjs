const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { ArrowLeft, Coins, Check, Lock, Video, Star } from 'lucide-react';
import { COLLECTIONS, ALL_COSMETICS, CosmeticCategory, CosmeticDef } from '../game/collections';

export function Shop() {
  const { setMode, coins, ownedCosmetics, unlockedLevels, buyCosmetic, equipCosmetic, showShopAd, equippedCosmetic, equippedBackground, equippedBoomEffect, equippedPlate } = useGameStore();
  
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('skin');
  const [notEnoughCoins, setNotEnoughCoins] = useState(false);
  
  // Initialize preview state to what is currently equipped, or default to first item
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
    if (item.req === 0 && item.price === 0 && !item.isAd) return true; // defaults
    if (item.req > 0 && unlockedLevels >= item.req) return true; // unlocked by level
    return ownedCosmetics.includes(item.id);
  };

  const activeItem = ALL_COSMETICS.find(c => c.id === previewState[activeCategory]) || ALL_COSMETICS[0];
  const allItemsInCategory = ALL_COSMETICS.filter(c => c.type === activeCategory);

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

  const getPreviewColors = (id: string) => {
    const col = COLLECTIONS.find(c => 
      c.world.id === id || c.block.id === id || c.boom.id === id || c.plate.id === id
    );
    return col ? col.colors : COLLECTIONS[0].colors;
  };
  
  const bgColors = getPreviewColors(previewState.background);
  const blockColors = getPreviewColors(previewState.skin);
  const plateColors = getPreviewColors(previewState.plate);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full h-full max-w-md bg-[#190E2D] p-4 relative z-10 mx-auto overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMode('menu')}
          className="p-3 bg-[#4facfe] border-4 border-white rounded-full shadow-[0_4px_0_#2a82c9] text-white z-50"
        >
          <ArrowLeft className="w-8 h-8" />
        </motion.button>
        <div className="flex-1 text-center font-black text-2xl text-white uppercase tracking-wider drop-shadow-md px-2">
          LOCKER
        </div>
        <div className="flex items-center gap-2 bg-[#FFD700] px-4 py-2 rounded-full border-4 border-white shadow-[0_4px_0_#B8860B] z-50">
          <span className="font-black text-xl text-[#B8860B]">{coins}</span>
          <Coins className="w-5 h-5 text-[#B8860B] fill-current" />
        </div>
      </div>

      <div className="flex flex-col flex-1 pb-2 h-full justify-between">
        
        {/* Live Preview Stage */}
        <div className="w-full aspect-square rounded-3xl border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.5)] mb-4 relative overflow-hidden flex items-center justify-center shrink-0"
             style={{ background: \`linear-gradient(180deg, \${bgColors[0]}, \${bgColors[1]})\` }}
        >
           {/* Dynamic Stage Rendering */}
           <div className="absolute bottom-10 w-48 h-12 rounded-[50%] border-4 border-white shadow-lg z-10" 
                style={{ backgroundColor: plateColors[2] || '#FFF' }} />
           
           <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-20 h-20 rounded-xl border-4 border-white shadow-lg z-20 relative -mt-10"
              style={{ backgroundColor: blockColors[1] || '#FFF' }}
           />
           
           <div className="absolute top-4 left-4 right-4 text-center z-30">
             <span className="text-white font-black text-xl tracking-widest drop-shadow-md opacity-80 uppercase">LIVE PREVIEW</span>
           </div>
        </div>

        {/* Category Tabs */}
        <div className="flex bg-black/40 p-2 rounded-2xl gap-2 mb-4 shrink-0">
          {(['world', 'block', 'boom', 'plate'] as const).map(cat => {
            const tabCategory = cat === 'world' ? 'background' : cat === 'block' ? 'skin' : cat;
            const isSelected = activeCategory === tabCategory;
            return (
              <button 
                key={cat}
                onClick={() => setActiveCategory(tabCategory)}
                className={\`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors \${isSelected ? 'bg-white text-[#190E2D]' : 'text-white/60 hover:bg-white/10'}\`}
              >
                {cat}
              </button>
            );
          })}
        </div>
        
        {/* Horizontal Item Selector */}
        <div className="w-full overflow-x-auto pb-4 shrink-0" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-3 px-2">
            {allItemsInCategory.map((item) => {
              const isSelected = previewState[activeCategory] === item.id;
              const itemColors = getPreviewColors(item.id);
              const colorToUse = activeCategory === 'background' ? itemColors[0] : activeCategory === 'skin' ? itemColors[1] : activeCategory === 'boom' ? itemColors[2] : itemColors[3];
              const owned = isItemOwned(item);
              const isEquipped = getEquippedId(activeCategory) === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewState(s => ({ ...s, [activeCategory]: item.id }))}
                  className={\`shrink-0 w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center relative overflow-hidden transition-all \${isSelected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105 z-10' : 'border-white/20 opacity-80'}\`}
                  style={{ backgroundColor: colorToUse }}
                >
                  {!owned && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-10">
                       <Lock className="w-6 h-6 text-white/80" />
                    </div>
                  )}
                  {isEquipped && (
                     <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white z-20 shadow-md">
                       <Check className="w-4 h-4 text-white" strokeWidth={4} />
                     </div>
                  )}
                  <div className="text-[10px] font-black text-white bg-black/60 px-1 py-0.5 rounded absolute bottom-1 truncate w-[90%] text-center uppercase z-20">
                    {item.name}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white/10 border-2 border-white/20 p-4 rounded-3xl shrink-0 mt-auto">
          <h3 className="text-2xl font-black text-white uppercase mb-1 drop-shadow-sm truncate">{activeItem.name}</h3>
          
          <div className="flex items-end justify-between mt-2">
            <div className="flex-1">
                <p className="text-white/80 font-bold text-sm leading-tight pr-2">{activeItem.desc}</p>
            </div>
            
            <div className="flex flex-col items-end justify-end">
              {getEquippedId(activeCategory) === activeItem.id ? (
                <div className="px-6 py-2.5 bg-[#7CFC00] border-4 border-white shadow-[0_4px_0_#228B22] rounded-full flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-[#228B22]" strokeWidth={3} />
                  <span className="font-black text-[#228B22] uppercase tracking-wider text-sm">Equipped</span>
                </div>
              ) : isItemOwned(activeItem) ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEquip}
                  className="px-6 py-2.5 bg-[#4facfe] border-4 border-white shadow-[0_4px_0_#2a82c9] rounded-full text-white font-black uppercase tracking-wider text-sm active:translate-y-1 active:shadow-none transition-all"
                >
                  Equip Now
                </motion.button>
              ) : activeItem.isAd ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatchAd}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 border-4 border-white shadow-[0_4px_0_#9333ea] rounded-full flex items-center justify-center gap-2 text-white font-black uppercase tracking-wider text-sm active:translate-y-1 active:shadow-none transition-all"
                >
                  <Video className="w-5 h-5" />
                  <span>Watch Ad</span>
                </motion.button>
              ) : activeItem.req > unlockedLevels ? (
                <div className="px-6 py-2.5 bg-gray-500/50 border-4 border-gray-400/50 rounded-full flex items-center justify-center gap-2 shadow-lg">
                  <Lock className="w-5 h-5 text-gray-300" />
                  <span className="font-black text-gray-300 uppercase tracking-wider text-sm">Lvl {activeItem.req} Req</span>
                </div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBuy}
                  className={\`px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm border-4 border-white transition-all active:translate-y-1 active:shadow-none \${
                    notEnoughCoins 
                      ? 'bg-red-500 shadow-[0_4px_0_#8B0000] text-white' 
                      : 'bg-[#FFD700] shadow-[0_4px_0_#B8860B] text-[#B8860B]'
                  }\`}
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
    </motion.div>
  );
}
`;

fs.writeFileSync('src/components/Shop.tsx', code);
