import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
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
import { AchievementUnlockToast } from './components/achievements/AchievementUnlockToast';
import { UnifiedLoadingOverlay } from './components/UnifiedLoadingOverlay';

// Secondary screens load on demand so the first launch downloads less
const Shop = lazy(() => import('./components/Shop').then((m) => ({ default: m.Shop })));
const DailyMissions = lazy(() => import('./components/daily/DailyMissions').then((m) => ({ default: m.DailyMissions })));
const TournamentHub = lazy(() => import('./components/tournaments/TournamentHub').then((m) => ({ default: m.TournamentHub })));
const TechAcademy = lazy(() => import('./components/academy/TechAcademy').then((m) => ({ default: m.TechAcademy })));
const BlueprintWorkshop = lazy(() => import('./components/workshop/BlueprintWorkshop').then((m) => ({ default: m.BlueprintWorkshop })));
const SettingsOverlay = lazy(() => import('./components/SettingsOverlay').then((m) => ({ default: m.SettingsOverlay })));
import { resolveActiveWorld } from './game/EnvironmentRenderer';
import { applyThemeCSSVariables, getThemePalette } from './utils/themeAccents';

export default function App() {
  const { 
    mode, 
    state, 
    level, 
    equippedBackground, 
    activeTournament, 
    adState, 
    visualTheme, 
    highContrastMode, 
    settingsModalOpen 
  } = useGameStore();
  
  // Sync document root theme, CSS variables, and accessibility class in real-time
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', visualTheme || 'default');
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }

    const worldInfo = resolveActiveWorld({
      mode,
      state,
      level,
      equippedBackground,
      activeTournament,
      visualTheme,
    });
    const palette = getThemePalette(worldInfo.worldIndex);
    applyThemeCSSVariables(palette, worldInfo.worldIndex);
  }, [visualTheme, highContrastMode, mode, state, level, equippedBackground, activeTournament]);

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

  const showGame = (mode === 'endless') || (mode === 'campaign' && state !== 'idle') || (mode === 'tournament' && state !== 'idle') || (mode === 'workshop' && state !== 'idle');
  const showDaily = mode === 'daily';
  const showMenu = mode === 'menu';
  const showLevelSelect = mode === 'campaign' && state === 'idle';
  const showShop = mode === 'shop';
  const showTournamentHub = mode === 'tournament' && state === 'idle';
  const showAcademy = mode === 'academy';
  const showWorkshop = mode === 'workshop' && state === 'idle';

  return (
    <div className="w-full h-full bg-[#030712] flex items-center justify-center overflow-hidden relative font-display text-slate-100">
      <PlayfulBackground />

      <AnimatePresence mode="wait">
        {showMenu && <Menu key="menu" />}
        {showLevelSelect && <LevelSelect key="levelselect" />}
        {showShop && <Suspense key="shop" fallback={null}><Shop /></Suspense>}
        {showDaily && <Suspense key="daily" fallback={null}><DailyMissions /></Suspense>}
        {showTournamentHub && <Suspense key="tournament-hub" fallback={null}><TournamentHub /></Suspense>}
        {showAcademy && <Suspense key="academy" fallback={null}><TechAcademy /></Suspense>}
        {showWorkshop && <Suspense key="workshop" fallback={null}><BlueprintWorkshop /></Suspense>}
        {showGame && <GameBoard key="gameboard" />}
      </AnimatePresence>

      <AnimatePresence>
        {adState !== 'none' && <AdOverlay key="ad-overlay" />}
        <IAPOverlay key="iap-overlay" />
        <RemoveAdsOverlay key="remove-ads-overlay" />
        {settingsModalOpen && <Suspense key="settings-overlay" fallback={null}><SettingsOverlay /></Suspense>}
      </AnimatePresence>

      <UnifiedLoadingOverlay />

      <AchievementUnlockToast />
    </div>
  );
}
