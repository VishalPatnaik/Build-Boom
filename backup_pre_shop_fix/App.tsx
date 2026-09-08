import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './game/store';
import { generateLevel, BlockDef } from './game/LevelGenerator';
import { audio } from './audio/AudioEngine';

// Subcomponents
import { Menu } from './components/Menu';
import { GameBoard } from './components/GameBoard';
import { LevelSelect } from './components/LevelSelect';
import { PlayfulBackground } from './components/PlayfulBackground';
import { AdOverlay } from './components/AdOverlay';
import { Shop } from './components/Shop';

export default function App() {
  const { mode, state, adState } = useGameStore();
  
  // Initialize audio on first interaction
  useEffect(() => {
    const initAudio = () => audio.init();
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const showGame = (mode === 'endless' || mode === 'daily') || (mode === 'campaign' && state !== 'idle');
  const showMenu = mode === 'menu';
  const showLevelSelect = mode === 'campaign' && state === 'idle';
  const showShop = mode === 'shop';

  return (
    <div className="w-full h-full bg-[#87CEEB] flex items-center justify-center overflow-hidden relative font-display">
      <PlayfulBackground />

      <AnimatePresence mode="wait">
        {showMenu && <Menu key="menu" />}
        {showLevelSelect && <LevelSelect key="levelselect" />}
        {showShop && <Shop key="shop" />}
        {showGame && <GameBoard key="gameboard" />}
      </AnimatePresence>

      <AnimatePresence>
        {adState !== 'none' && <AdOverlay key="ad-overlay" />}
      </AnimatePresence>
    </div>
  );
}
