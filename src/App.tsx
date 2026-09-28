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
import { IAPOverlay } from './components/IAPOverlay';
import { RemoveAdsOverlay } from './components/RemoveAdsOverlay';
import { Shop } from './components/Shop';
import { DailyMissions } from './components/daily/DailyMissions';
import { TournamentHub } from './components/tournaments/TournamentHub';
import { TechAcademy } from './components/academy/TechAcademy';
import { BlueprintWorkshop } from './components/workshop/BlueprintWorkshop';
import { AchievementUnlockToast } from './components/achievements/AchievementUnlockToast';
import { SettingsOverlay } from './components/SettingsOverlay';

export default function App() {
  const { mode, state, adState, visualTheme, highContrastMode } = useGameStore();
  
  // Sync document root theme and accessibility class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', visualTheme || 'default');
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [visualTheme, highContrastMode]);

  // Initialize audio & background music on first user interaction
  useEffect(() => {
    const initAudio = () => {
      audio.init();
      audio.resume();
      if (useGameStore.getState().musicEnabled) {
        audio.startMusic();
      }
    };
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Handle Stripe Success Callback
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      const coins = parseInt(query.get("coins") || "0", 10);
      if (coins > 0) {
        useGameStore.getState().addCoins(coins);
      }
      window.history.replaceState({}, document.title, "/");
    }
    if (query.get("canceled")) {
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const showGame = (mode === 'endless') || (mode === 'campaign' && state !== 'idle') || (mode === 'tournament' && state === 'playing') || (mode === 'workshop' && state === 'playing');
  const showDaily = mode === 'daily';
  const showMenu = mode === 'menu';
  const showLevelSelect = mode === 'campaign' && state === 'idle';
  const showShop = mode === 'shop';
  const showTournamentHub = mode === 'tournament' && state !== 'playing';
  const showAcademy = mode === 'academy';
  const showWorkshop = mode === 'workshop' && state !== 'playing';

  return (
    <div className="w-full h-full bg-[#030712] flex items-center justify-center overflow-hidden relative font-display text-slate-100">
      <PlayfulBackground />

      <AnimatePresence mode="wait">
        {showMenu && <Menu key="menu" />}
        {showLevelSelect && <LevelSelect key="levelselect" />}
        {showShop && <Shop key="shop" />}
        {showDaily && <DailyMissions key="daily" />}
        {showTournamentHub && <TournamentHub key="tournament-hub" />}
        {showAcademy && <TechAcademy key="academy" />}
        {showWorkshop && <BlueprintWorkshop key="workshop" />}
        {showGame && <GameBoard key="gameboard" />}
      </AnimatePresence>

      <AnimatePresence>
        {adState !== 'none' && <AdOverlay key="ad-overlay" />}
        <IAPOverlay key="iap-overlay" />
        <RemoveAdsOverlay key="remove-ads-overlay" />
        <SettingsOverlay key="settings-overlay" />
      </AnimatePresence>

      <AchievementUnlockToast />
    </div>
  );
}
