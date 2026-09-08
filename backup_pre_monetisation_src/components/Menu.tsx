import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Shield } from 'lucide-react';

export function Menu() {
  const setMode = useGameStore((s) => s.setMode);
  const adsRemoved = useGameStore((s) => s.adsRemoved);
  const removeAds = useGameStore((s) => s.removeAds);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center space-y-10 w-full max-w-lg p-6 relative z-10"
    >
      <div className="text-center space-y-2 relative w-full flex flex-col items-center">
        <motion.h1 
          animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="text-7xl md:text-[6rem] font-black tracking-wide uppercase text-[#FFD700] drop-shadow-[0_8px_0_#B8860B] leading-none"
          style={{ WebkitTextStroke: '3px #8B4513' }}
        >
          BUILD
        </motion.h1>
        
        <motion.div 
          animate={{ scale: [0.95, 1.1, 0.95] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-3xl font-black text-white italic tracking-widest relative z-10 drop-shadow-md bg-[#FF6347] px-4 py-1 rounded-full border-2 border-white transform -rotate-6"
        >
          OR
        </motion.div>
        
        <motion.h1 
          animate={{ y: [0, 8, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="text-7xl md:text-[7rem] font-black tracking-wide uppercase text-[#FF4500] drop-shadow-[0_10px_0_#8B0000] leading-none relative z-20 mt-2"
          style={{ WebkitTextStroke: '3px #FFFFFF' }}
        >
          BOOM
        </motion.h1>
      </div>

      <div className="flex flex-col space-y-4 w-full max-w-sm mt-8 relative z-30">
        <MenuButton onClick={() => setMode('campaign')} color="#4facfe" shadow="#2a82c9" delay={0.1}>
          PLAY CAMPAIGN
        </MenuButton>
        <MenuButton onClick={() => {
          useGameStore.getState().setLevel(0);
          useGameStore.getState().setState('playing');
          setMode('endless');
        }} color="#b224ef" shadow="#7814a6" delay={0.2}>
          ENDLESS MODE
        </MenuButton>
        <MenuButton onClick={() => {
          useGameStore.getState().setLevel(-1);
          useGameStore.getState().setState('playing');
          setMode('daily');
        }} color="#FF9A8B" shadow="#d97566" delay={0.3}>
          DAILY CHALLENGE
        </MenuButton>
      </div>
      
      {!adsRemoved && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => {
            // Mock purchase flow
            if (window.confirm("Remove all interstitial ads for $1.99?")) {
              removeAds();
            }
          }}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full font-bold shadow-[0_4px_0_#d1d5db] active:translate-y-1 active:shadow-[0_0px_0_#d1d5db] transition-all"
        >
          <Shield className="w-5 h-5 text-green-500" />
          Remove Ads
        </motion.button>
      )}
    </motion.div>
  );
}

function MenuButton({ children, onClick, color, shadow, delay }: { children: React.ReactNode; onClick: () => void; color: string, shadow: string, delay: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, y: 8, boxShadow: `0 0px 0 ${shadow}` }}
      onClick={onClick}
      className="group relative w-full py-5 rounded-3xl font-black text-2xl uppercase tracking-wider text-white border-4 border-white/20"
      style={{ 
        backgroundColor: color, 
        boxShadow: `0 8px 0 ${shadow}`,
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
    >
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </motion.button>
  );
}
