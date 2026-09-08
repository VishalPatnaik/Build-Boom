import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Shield, Coins, ShoppingBag, Infinity as InfinityIcon, Calendar, Play, Plus } from 'lucide-react';

export function Menu() {
  const { setMode, adsRemoved, removeAds, coins, highScores, setShowIAP } = useGameStore();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-between w-full h-full max-w-md mx-auto p-4 relative z-10 pb-12 pt-10"
    >
      {/* COINS HUD */}
      <div className="absolute top-6 right-6 z-50">
        <motion.button 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowIAP(true)}
          className="flex items-center gap-1.5 bg-black/30 pl-3 pr-2 py-1.5 rounded-full border-2 border-white/20 backdrop-blur-md shadow-xl"
        >
          <motion.div animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
            <Coins className="w-5 h-5 text-[#FFD700] fill-[#FFD700] drop-shadow-sm" />
          </motion.div>
          <span className="text-white font-black text-lg tabular-nums tracking-wide drop-shadow-md">{coins}</span>
          <div className="bg-[#FFD700] text-[#B8860B] rounded-full p-0.5 ml-0.5 shadow-sm">
            <Plus className="w-4 h-4" strokeWidth={4} />
          </div>
        </motion.button>
      </div>

      {/* SHOP ICON */}
      <div className="absolute bottom-6 left-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -3, 0] }}
          transition={{ y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
          onClick={() => setMode('shop')}
          onPointerDown={() => setMode('shop')}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-4 border-white shadow-[0_6px_0_#B8860B] flex items-center justify-center relative overflow-hidden group cursor-pointer touch-none select-none"
        >
          <ShoppingBag className="w-7 h-7 text-white drop-shadow-md relative z-10" />
          <motion.div 
            className="absolute inset-0 bg-white/40"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          />
        </motion.button>
      </div>

      {/* REMOVE ADS ICON */}
      {!adsRemoved ? (
        <div className="absolute bottom-6 right-6 z-50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ y: { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.5 } }}
            onClick={() => {
              useGameStore.getState().setShowRemoveAds(true);
            }}
            onPointerDown={() => {
              useGameStore.getState().setShowRemoveAds(true);
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-700 border-4 border-white shadow-[0_6px_0_#8B0000] flex items-center justify-center relative overflow-hidden cursor-pointer touch-none select-none"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <span className="font-black text-white text-[12px] opacity-90 leading-none mr-1 drop-shadow-sm">AD</span>
              <div className="absolute w-10 h-1 bg-white rotate-45 rounded-full shadow-sm z-10" />
            </div>
          </motion.button>
        </div>
      ) : (
        <div className="absolute bottom-6 right-6 z-50">
          <button 
            onClick={() => useGameStore.getState().restoreAds()}
            className="text-white/50 text-xs underline font-bold uppercase cursor-pointer hover:text-white"
          >
            Restore Ads (Dev Test)
          </button>
        </div>
      )}

      {/* TITLE */}
      <div className="text-center relative w-full flex flex-col items-center shrink-0 mt-4">
        <motion.h1 
          animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="text-6xl md:text-[5rem] font-black tracking-wide uppercase text-[#FFD700] drop-shadow-[0_6px_0_#B8860B] leading-none"
          style={{ WebkitTextStroke: '2px #8B4513' }}
        >
          BUILD
        </motion.h1>
        <motion.div 
          animate={{ scale: [0.95, 1.1, 0.95] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-black text-white italic tracking-widest relative z-10 drop-shadow-md bg-[#FF6347] px-4 py-1 rounded-full border-2 border-white transform -rotate-6 -my-2"
        >
          OR
        </motion.div>
        <motion.h1 
          animate={{ y: [0, 4, 0], scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="text-6xl md:text-[5.5rem] font-black tracking-wide uppercase text-[#FF4500] drop-shadow-[0_8px_0_#8B0000] leading-none relative z-20"
          style={{ WebkitTextStroke: '2px #FFFFFF' }}
        >
          BOOM
        </motion.h1>
      </div>

      {/* CAMPAIGN - HERO SCENE */}
      <div className="flex-1 w-full flex items-center justify-center relative z-20 my-2">
        <motion.button 
          className="relative flex flex-col items-center justify-center group cursor-pointer touch-none select-none"
          onClick={() => setMode('campaign')}
          onPointerDown={() => setMode('campaign')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Miniature World / Island */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotateZ: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative flex items-center justify-center w-56 h-48 mb-2"
          >
            {/* Base Island */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#8B4513] rounded-[50%] shadow-[0_16px_0_#5C2E00] border-4 border-[#A0522D]" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 h-20 bg-[#7CFC00] rounded-[50%] shadow-[inset_0_-8px_0_rgba(0,0,0,0.1)] border-4 border-[#228B22]" />
            
            {/* Blocks stacked */}
            <div className="absolute bottom-12 left-[35%] w-14 h-14 bg-[#4facfe] rounded-xl border-4 border-white shadow-[0_6px_0_#2a82c9] transform -rotate-12" />
            <div className="absolute bottom-20 left-[50%] w-14 h-14 bg-[#FF9A8B] rounded-xl border-4 border-white shadow-[0_6px_0_#d97566] transform rotate-6" />
            <div className="absolute bottom-32 left-[45%] w-14 h-14 bg-[#FFD700] rounded-xl border-4 border-white shadow-[0_6px_0_#B8860B] transform -rotate-3" />
            
            {/* Play Button */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            >
              <Play className="w-8 h-8 text-white fill-white ml-1 drop-shadow-sm" />
            </motion.div>
          </motion.div>

          {/* Label */}
          <div className="relative bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-2.5 rounded-full border-4 border-white shadow-[0_8px_0_#0284c7] z-30 transform -rotate-2 group-hover:rotate-0 transition-transform -mt-6">
            <span className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">
              Campaign
            </span>
          </div>
        </motion.button>
      </div>

      {/* SECONDARY MODES */}
      <div className="flex flex-row items-center justify-center gap-8 w-full shrink-0 z-20 mb-8">
        
        {/* ENDLESS */}
        <motion.button 
          className="relative flex flex-col items-center justify-center group cursor-pointer touch-none select-none"
          onClick={() => {
            useGameStore.getState().setLevel(0);
            useGameStore.getState().setState('playing');
            setMode('endless');
          }}
          onPointerDown={() => {
            useGameStore.getState().setLevel(0);
            useGameStore.getState().setState('playing');
            setMode('endless');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            animate={{ y: [0, -8, 0], rotateZ: [1, -1, 1] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="relative flex items-center justify-center w-28 h-28 mb-2"
          >
            {/* Portal / Infinity Loop */}
            <div className="absolute w-24 h-24 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full shadow-[0_0_20px_#c026d3] border-4 border-white opacity-90" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute w-28 h-28 border-4 border-dashed border-white/50 rounded-full"
            />
            <InfinityIcon className="w-12 h-12 text-white drop-shadow-lg z-10" />
          </motion.div>
          
          <div className="relative bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-1.5 rounded-full border-4 border-white shadow-[0_6px_0_#9333ea] z-30 -mt-6">
            <span className="text-lg font-black text-white tracking-widest uppercase drop-shadow-md">
              Endless
            </span>
            <div className="text-[10px] font-bold text-white/80 -mt-1 text-center">BEST: {useGameStore.getState().highScores['endless'] || 0}</div>
          </div>
        </motion.button>

        {/* DAILY */}
        <motion.button 
          className="relative flex flex-col items-center justify-center group cursor-pointer touch-none select-none"
          onClick={() => {
             
             
            setMode('daily');
          }}
          onPointerDown={() => {
             
             
            setMode('daily');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            animate={{ y: [0, -8, 0], rotateZ: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }}
            className="relative flex items-center justify-center w-28 h-28 mb-2"
          >
            {/* Floating Trophy/Calendar scene */}
            <div className="absolute w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-[0_10px_0_#b45309] border-4 border-white transform rotate-6" />
            <motion.div 
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Calendar className="w-10 h-10 text-white drop-shadow-lg relative z-10 -mt-2" />
            </motion.div>
          </motion.div>

          <div className="relative bg-gradient-to-r from-orange-400 to-red-500 px-5 py-1.5 rounded-full border-4 border-white shadow-[0_6px_0_#c2410c] z-30 -mt-6">
            <span className="text-lg font-black text-white tracking-widest uppercase drop-shadow-md">
              Daily
            </span>
            <div className="text-[10px] font-bold text-white/80 -mt-1 text-center">5 MISSIONS</div>
          </div>
        </motion.button>
      </div>

    </motion.div>
  );
}

