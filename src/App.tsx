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
import { UnifiedLoadingOverlay } from './components/UnifiedLoadingOverlay';
import { autoSaveProgression } from './utils/progressionStorage';
import { resolveActiveWorld } from './game/EnvironmentRenderer';
import { applyThemeCSSVariables, getThemePalette } from './utils/themeAccents';
import { getProductById } from './billing/catalog';
import { EntitlementGranter } from './billing/BillingService';

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

  // Handle Checkout Success Callback (Stripe, Cards, PayPal, GPay)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      const productId = query.get("productId");
      const coins = parseInt(query.get("coins") || "0", 10);

      if (productId) {
        const product = getProductById(productId);
        if (product) {
          EntitlementGranter.grantEntitlements(product.rewards);
          audio.playPerfectSound();
          useGameStore.getState().triggerAssetTransition(`✓ ${product.name} Verified & Granted!`, 2200);
        } else if (coins > 0) {
          useGameStore.getState().addCoins(coins);
          audio.playPerfectSound();
          useGameStore.getState().triggerAssetTransition(`✓ +${coins.toLocaleString()} Coins Granted!`, 2200);
          autoSaveProgression('purchase_finalized', { coins: useGameStore.getState().coins + coins });
        }
      } else if (coins > 0) {
        useGameStore.getState().addCoins(coins);
        audio.playPerfectSound();
        useGameStore.getState().triggerAssetTransition(`✓ +${coins.toLocaleString()} Coins Granted!`, 2200);
        autoSaveProgression('purchase_finalized', { coins: useGameStore.getState().coins + coins });
      }
      window.history.replaceState({}, document.title, "/");
    }
    if (query.get("canceled")) {
      window.history.replaceState({}, document.title, "/");
    }
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
        {settingsModalOpen && <SettingsOverlay key="settings-overlay" />}
      </AnimatePresence>

      <UnifiedLoadingOverlay />

      <AchievementUnlockToast />
    </div>
  );
}
