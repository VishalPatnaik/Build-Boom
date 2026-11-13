import { apiUrl } from '../native/platform';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { useDailyStore } from '../game/dailyStore';
import { startDeviceMotion, stopDeviceMotion, requestMotionPermission, getMotion } from '../game/deviceMotion';
import { MAX_LIVES, TEETER_GRACE_MS, canLaunch, teeterStep, campaignStars } from '../game/runRules';
import { generateLevel, generateEndless, generateTournament, generateSandboxLevel, generateTutorialBlocks, BlockDef, getBlockMass, levelTwist, TWIST_INFO } from '../game/LevelGenerator';
import { createInitialPhysicsState, updateTowerPhysics, applyBlockImpact, placeBlock, rebraceTower, landingSlip, flexOffset, topSway, blockHalfWidth, windStrengthFor, swayScaleFor, BLOCK_HALF_WIDTH, BASE_HALF_WIDTH, HIT_WINDOW, MAX_SLIP, VISUAL_LAYER, MAX_VISIBLE_LAYERS, StackedBlock, TowerPhysicsState } from '../game/physicsEngine';
import { trackEvent } from '../game/eventDispatcher';
import { renderBlock, renderPlate, renderBoomParticle, getBoomColor } from '../game/themeRenderer';
import { setTowerMood } from '../game/themedObjects';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { ArrowLeft, RotateCcw, Play, Video, Home, Trophy, Shield, Compass, Plus, Coins, Award, CheckCircle2, Settings } from 'lucide-react';
import { TacticalRechargeModal } from './TacticalRechargeModal';
import { PowerupType } from '../game/techTree';
import { FloatingScoreMultiplierItem, FloatingMultiplierData } from './FloatingFeedback';
import { ComboMultiplierState } from './ComboMultiplierIndicator';
import { ReplayRecorder, ReplayData } from '../game/replayEngine';
import { safeCreateRadialGradient } from '../utils/canvasUtils';
import { EndOfLevelSummary, LevelPerformanceMetrics } from './campaign/EndOfLevelSummary';
import { ReplayViewer } from './ReplayViewer';
import { autoSaveProgression } from '../utils/progressionStorage';
import { resolveActiveWorld } from '../game/EnvironmentRenderer';
import { triggerBlockStackParticles, triggerBombDestroyedParticles } from '../utils/particleEffects';
import { getThemePalette } from '../utils/themeAccents';
import { useWorldTheme } from '../hooks/useWorldTheme';
import { useWorldAmbience } from '../hooks/useWorldAmbience';
import { PerformanceMonitor } from './PerformanceMonitor';
import { drawForegroundTerrain, worldIndexFromBg } from '../game/backdrop/foregroundTerrain';
import { LevelIntroBanner, LevelWarpCurtain, LevelStageShutter } from './campaign/LevelTransitions';
import { screenFadeSlideVariants } from '../utils/screenTransitions';
import { useWakeLock } from '../hooks/useWakeLock';

interface ActiveBlock extends BlockDef {
  distance: number; // 100 to 0 (center)
  spawnedAt: number;
  handled: boolean;
  success?: boolean;
  contactSoundPlayed?: boolean;
  /** Time a disguised object flipped to its true identity (fake-boom / fake-build). */
  revealedAt?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type?: 'spark' | 'ring' | 'trail';
}

// A block that has physically fallen off the tower (rendered with gravity + spin)
interface Debris {
  halfWidth: number;
  archetype?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
}

/** Big floating "N IN A ROW" cards covered the tower top; the HUD combo meter shows the same thing. */
const SHOW_FLOATING_COMBO_CARDS = false;
/** Top edge of the play arena: incoming objects start 120% of the arena radius from the landing point. */
const arenaTopFor = (w: number, h: number) => h * 0.65 - Math.min(w, h) * 0.45 * 1.2 - 30;
/** Little cheers for a perfect landing, picked at random. */
const PERFECT_CHEERS = ['PERFECT!', 'NAILED IT!', "CHEF'S KISS! 🤌", 'BULLSEYE! 🎯', 'BUTTERY SMOOTH!', 'TEXTBOOK!'];
const SHOW_LANDING_RESONANCE = false;

/** Slow motion while a first-time tip is on screen. */
const TIP_SLOWMO_MS = 2600;
/** Minimum gap between two first-time tips. */
const TIP_SPACING_MS = 8000;

export function GameBoard() {
  const { 
    mode, 
    level, 
    state, 
    setState, 
    setLevel,
    unlockNextLevel, 
    setScore, 
    score, 
    updateHighScore, 
    highScores, 
    pendingCoins, 
    equippedCosmetic, 
    equippedBoomEffect, 
    equippedPlate,
    equippedBackground,
    activeTournament,
    unlockedPerks, 
    sandboxOptions, 
    coins, 
    hapticsEnabled, 
    toggleHaptics,
    sillyMode,
    motionSway,
    toggleSillyMode,
    visualTheme,
    hasCompletedCampaignTutorial,
    isTutorialActive,
    tutorialStep,
    setTutorialActive,
    setTutorialStep,
    completeCampaignTutorial,
    startCampaignTutorial,
  } = useGameStore();

  const [tutorialMistakeAlert, setTutorialMistakeAlert] = useState<string | null>(null);
  const [tutorialEmergencyHold, setTutorialEmergencyHold] = useState(false);
  const [tutorialCompletedSheet, setTutorialCompletedSheet] = useState(false);
  const [sweetSpotActive, setSweetSpotActive] = useState(false);
  
  // Unified Theme Hook: Maps active world to CSS variables, shader configurations, and particle presets
  const worldTheme = useWorldTheme();
  const activeWorldInfo = worldTheme.activeWorldInfo;
  const activePalette = worldTheme.palette;

  // Attach world-specific background ambience to the GameBoard (e.g. wind howling for Winter, city hums for Cyberpunk)
  const worldAmbience = useWorldAmbience();

  // Screen Wake Lock: Keeps mobile screen illuminated during active gameplay
  useWakeLock(state === 'playing');

  const worldThemeRef = useRef(worldTheme);
  worldThemeRef.current = worldTheme;

  const activeSkin = activeWorldInfo.isSpecialTheme
    ? activeWorldInfo.matchingSkinId
    : (equippedCosmetic || activeWorldInfo.matchingSkinId);

  const activePlate = activeWorldInfo.isSpecialTheme
    ? activeWorldInfo.matchingPlateId
    : (equippedPlate || activeWorldInfo.matchingPlateId);

  const activeBoom = activeWorldInfo.isSpecialTheme
    ? activeWorldInfo.matchingBoomId
    : (equippedBoomEffect || activeWorldInfo.matchingBoomId);

  // Real-time synchronization ref for immediate zero-reload visual asset & shader updates
  const activeCosmeticsRef = useRef({
    activeSkin,
    activePlate,
    activeBoom,
    activeWorldInfo,
  });
  activeCosmeticsRef.current = {
    activeSkin,
    activePlate,
    activeBoom,
    activeWorldInfo,
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  
  const [builtCount, setBuiltCount] = useState(0);
  // Hearts: a mistimed or missed piece costs one; bombs and a toppled tower still end the run
  const [livesLeft, setLivesLeft] = useState(MAX_LIVES);
  const [tipCard, setTipCard] = useState<{ title: string; body: string } | null>(null);
  // Top edge of the play arena (where incoming objects appear), px from the top of the board.
  // Text and pop-ups stay above it so they never cover the tower or anything flying at it.
  const [arenaTop, setArenaTop] = useState(9999);
  const [boardH, setBoardH] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [lostReason, setLostReason] = useState('');
  // Plain-language physics explanation shown when the tower falls
  const [gravityNote, setGravityNote] = useState('');
  const [message, setMessage] = useState('');
  const [tiltDisplay, setTiltDisplay] = useState(0);
  const [stressDisplay, setStressDisplay] = useState(0);
  const [tacticalCharges, setTacticalCharges] = useState({ stasis: 0, emp: 0, shield: false });
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeType, setRechargeType] = useState<PowerupType>('stasis');
  const rechargeModalOpenRef = useRef(false);
  rechargeModalOpenRef.current = rechargeModalOpen;
  const lastHazardAlertTimeRef = useRef(0);
  const lastHazardHapticTimeRef = useRef(0);
  const lastHazardTierRef = useRef<'safe' | 'caution' | 'critical' | 'imminent'>('safe');

  // Dynamic visual feedback: general stack combo & rapid perfect combo multiplier
  const [activeCombo, setActiveCombo] = useState(0);
  const [rapidComboData, setRapidComboData] = useState<ComboMultiplierState>({
    streak: 0,
    multiplier: 1,
    timeRemaining: 0,
    duration: 4200,
    active: false,
  });
  const [floatingMultipliers, setFloatingMultipliers] = useState<FloatingMultiplierData[]>([]);

  // Performance metrics for EndOfLevelSummary
  const [summaryMetrics, setSummaryMetrics] = useState<LevelPerformanceMetrics | null>(null);
  const [isViewingReplay, setIsViewingReplay] = useState(false);

  // Smooth Level Warp Transition state between campaign levels
  const [warpTransition, setWarpTransition] = useState<{
    isActive: boolean;
    fromLevel: number;
    toLevel: number;
  }>({
    isActive: false,
    fromLevel: 1,
    toLevel: 1,
  });

  const gameOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initGameRef = useRef<(customLevel?: number) => void>(() => {});
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  // Auto quality: if the phone struggles, render at 1x and trim effects (it never switches back mid-session)
  const lowFxRef = useRef(false);
  const resizeCanvasRef = useRef<() => void>(() => {});
  const frameStatsRef = useRef({ ema: 16.7, slowMs: 0 });
  // Phone motion: swinging the phone rocks the tower (Settings → Motion Sway)
  const motionPermissionAskedRef = useRef(false);
  const motionEnergyRef = useRef(0);
  useEffect(() => {
    if (motionSway && state === 'playing') {
      startDeviceMotion();
      return () => stopDeviceMotion();
    }
    stopDeviceMotion();
    return undefined;
  }, [motionSway, state]);

  const handleWarpComplete = useCallback(() => {
    setWarpTransition((prev) => {
      const targetLvl = prev.toLevel;
      setTimeout(() => {
        useGameStore.getState().setLevel(targetLvl);
        setScore(0);
        setSummaryMetrics(null);
        setState('playing');
        initGameRef.current(targetLvl);
      }, 0);
      return { ...prev, isActive: false };
    });
  }, []);
  const [savedReplayData, setSavedReplayData] = useState<ReplayData | null>(null);

  // Physical immersion haptic vibration trigger for collisions and boom events
  const triggerHapticVibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        const enabled = useGameStore.getState().hapticsEnabled;
        if (enabled !== false) {
          navigator.vibrate(pattern);
        }
      } catch {
        // Safe fallback
      }
    }
  };
  
  const isBossLevel = mode === 'campaign' && level % 10 === 0;

  // 10-second sliding window physics replay recorder
  const recorderRef = useRef<ReplayRecorder>(new ReplayRecorder());

  const gameStateRef = useRef({
    blocks: [] as ActiveBlock[],
    queue: [] as BlockDef[],
    lastSpawnTime: 0,
    lastFrameTime: 0,
    builtCount: 0,
    startTime: 0,
    isGameOver: false,
    particles: [] as Particle[],
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    rapidPerfectStreak: 0,
    lastPerfectTime: 0,
    rapidPerfectMultiplier: 1,
    lastMultiplierBroadcastTime: 0,
    shake: 0,
    hasRevived: false,
    physics: createInitialPhysicsState(unlockedPerks),
    lastWarningTime: 0,
    lastUiUpdateTime: 0,
    debris: [] as Debris[],
    lives: MAX_LIVES,
    swayHintShown: false,
    teeterMs: 0,
    slowUntil: 0,
    lastTipAt: -1e9,
    starHints: [] as string[],
    maxHeight: 0,
    recordAnnounced: false,
    floatTexts: [] as { text: string; x: number; y: number; life: number; color: string }[],
    camX: 0, // camera follows the tower's resting top (not its sway)
    towerSink: 0, // eases the tower down one layer after each landing
    freeStasisLeft: 0,
    freeEmpLeft: 0,
  });

  const initGame = (customLevel?: number) => {
    if (gameOverTimeoutRef.current) {
      clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = null;
    }
    recorderRef.current.reset();
    let queue: BlockDef[] = [];
    const activeLevel = customLevel !== undefined ? customLevel : (useGameStore.getState().level ?? 1);

    const isTutorialMode = isTutorialActive;
    if (isTutorialMode) {
      useGameStore.getState().setTutorialStep(1);
      queue = generateTutorialBlocks();
    } else if (mode === 'campaign') {
      queue = generateLevel(activeLevel);
    } else if (mode === 'endless') {
      queue = generateEndless(Math.random() * 1000000, 999, 1);
    } else if (mode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      let seed = 0;
      for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
      queue = generateEndless(seed, 100, 3);
    } else if (mode === 'tournament') {
      const activeT = useGameStore.getState().activeTournament;
      if (activeT) {
        queue = generateTournament(activeT.seed, activeT.blockCount, activeT.speedMultiplier, activeT.boomChance);
      } else {
        queue = generateTournament(12345, 60, 1.15, 0.3);
      }
    } else if (mode === 'workshop') {
      queue = generateSandboxLevel(sandboxOptions || {
        speedMultiplier: 1.0,
        boomChance: 0.25,
        blockCount: 50,
        allowGhosts: true,
        allowBlinks: true,
        allowFakes: true,
        allowSpecialBlocks: true,
      });
    }
    
    setTotalBlocks(queue.length);
    setBuiltCount(0);
    setLivesLeft(MAX_LIVES);
    setGravityNote('');
    useGameStore.getState().setTowerHeight(0);
    useGameStore.getState().setTowerTilt(0);
    setActiveCombo(0);
    setRapidComboData({
      streak: 0,
      multiplier: 1,
      timeRemaining: 0,
      duration: 4200,
      active: false,
    });
    setFloatingMultipliers([]);
    setTutorialMistakeAlert(null);
    setTutorialEmergencyHold(false);
    setTutorialCompletedSheet(false);
    setSweetSpotActive(false);
    setSummaryMetrics(null);
    setIsViewingReplay(false);

    const initialMsg = isTutorialMode
      ? 'QUICK-START: STACK 3 BLOCKS'
      : mode === 'campaign' 
      ? (activeLevel % 10 === 0
          ? `TITAN SIEGE • LVL ${activeLevel}`
          : TWIST_INFO[levelTwist(activeLevel)].intro
          ? `LEVEL ${activeLevel} · ${TWIST_INFO[levelTwist(activeLevel)].intro}`
          : `LEVEL ${activeLevel}`)
      : mode === 'tournament'
      ? (useGameStore.getState().activeTournament?.title || 'TOURNAMENT')
      : mode === 'workshop'
      ? 'BLUEPRINT SIMULATION'
      : mode.toUpperCase();
    setMessage(initialMsg);

    const initialPhys = createInitialPhysicsState(unlockedPerks, useGameStore.getState().powerups);
    // Upgrades give free power-ups every run: Slow-Mo and Bomb Clear 1/2/3 per tier, Shield starts switched on
    const freeStasis = isTutorialMode ? 0 : unlockedPerks['chrono_stasis'] || 0;
    const freeEmp = isTutorialMode ? 0 : unlockedPerks['emp_defuser'] || 0;
    initialPhys.stasisCharges += freeStasis;
    initialPhys.empCharges += freeEmp;
    if (!isTutorialMode && (unlockedPerks['aegis_shield'] || 0) >= 1) initialPhys.shieldActive = true;
    setTacticalCharges({
      stasis: initialPhys.stasisCharges,
      emp: initialPhys.empCharges,
      shield: initialPhys.shieldActive,
    });
    setTiltDisplay(0);
    setStressDisplay(0);
    
    gameStateRef.current = {
      blocks: [],
      queue,
      lastSpawnTime: 0,
      lastFrameTime: 0,
      builtCount: 0,
      startTime: 0,
      isGameOver: false,
      particles: [],
      combo: 0,
      maxCombo: 0,
      perfectCount: 0,
      rapidPerfectStreak: 0,
      lastPerfectTime: 0,
      rapidPerfectMultiplier: 1,
      lastMultiplierBroadcastTime: 0,
      shake: 0,
      hasRevived: false,
      physics: initialPhys,
      lastImpactTime: 0,
      sillyWobble: 0,
      lastWarningTime: 0,
      lastUiUpdateTime: 0,
      debris: [],
      lives: MAX_LIVES,
      swayHintShown: false,
      teeterMs: 0,
      slowUntil: 0,
      lastTipAt: -1e9,
      starHints: [],
      maxHeight: 0,
      recordAnnounced: false,
      floatTexts: [],
      camX: 0,
      towerSink: 0,
      freeStasisLeft: freeStasis,
      freeEmpLeft: freeEmp,
    };
    
    setTimeout(() => setMessage(''), mode === 'campaign' && levelTwist(activeLevel) !== 'none' ? 2600 : 1500);
  };
  initGameRef.current = initGame;

  const handleRechargePurchased = (type: PowerupType) => {
    const gs = gameStateRef.current;
    if (type === 'stasis') {
      gs.physics.stasisCharges += 2;
      haptics.stasisActivated();
    } else if (type === 'emp') {
      gs.physics.empCharges += 2;
      haptics.empDefuse();
    } else if (type === 'shield') {
      gs.physics.shieldActive = true;
      gs.physics.shieldCharges += 1;
      haptics.shieldActivated();
    } else if (type === 'bundle') {
      gs.physics.stasisCharges += 2;
      gs.physics.empCharges += 2;
      gs.physics.shieldActive = true;
      gs.physics.shieldCharges += 1;
      haptics.shieldActivated();
    }
    setTacticalCharges({
      stasis: gs.physics.stasisCharges,
      emp: gs.physics.empCharges,
      shield: gs.physics.shieldActive,
    });
    setMessage('AIRDROP! SPECIAL DELIVERY 📦');
    setTimeout(() => setMessage(''), 1200);
  };

  // Coin Bonus upgrade: end-of-run rewards +15% / +30% / +50%
  const withCoinBonus = (coins: number) => {
    const tier = unlockedPerks['midas_foundation'] || 0;
    const bonus = tier >= 3 ? 1.5 : tier === 2 ? 1.3 : tier === 1 ? 1.15 : 1;
    return Math.round(coins * bonus);
  };

  // Shield upgrade tier 3: when the shield breaks it gives 2 s of slow-mo and clears nearby bombs
  const onShieldBroken = () => {
    if ((unlockedPerks['aegis_shield'] || 0) < 3) return;
    const gs = gameStateRef.current;
    gs.physics.stasisActive = true;
    gs.physics.stasisEndTime = performance.now() + 2000;
    for (const b of gs.blocks) {
      if (!b.handled && b.type === 'boom' && b.distance < 60) b.handled = true;
    }
    audio.playStasisSound(true);
  };

  const triggerStasis = () => {
    if (state !== 'playing' || gameStateRef.current.isGameOver) return;
    const gs = gameStateRef.current;
    if (gs.physics.stasisCharges <= 0) {
      audio.playTiltWarning();
      setMessage('OUT OF STASIS! TAP THE HUD TO RE-ARM ⏳');
      setTimeout(() => setMessage(''), 900);
      return;
    }
    if (gs.physics.stasisActive) return;

    const stasisDuration = (unlockedPerks['chrono_stasis'] >= 2 ? 5.0 : 3.5) * 1000;
    gs.physics.stasisCharges--;
    if (gs.freeStasisLeft > 0) gs.freeStasisLeft--;
    else useGameStore.getState().consumePowerup('stasis');
    useGameStore.getState().recordAchievementProgress('stasisUsed', 1);
    gs.physics.stasisActive = true;
    gs.physics.stasisEndTime = performance.now() + stasisDuration;
    setTacticalCharges((c) => ({ ...c, stasis: gs.physics.stasisCharges }));
    audio.playStasisSound(true);
    haptics.stasisActivated();
    setMessage('CHRONO STASIS! TIME GOES ZZZ… 😴');
    setTimeout(() => setMessage(''), 1000);
  };

  const triggerEmp = () => {
    if (state !== 'playing' || gameStateRef.current.isGameOver) return;
    const gs = gameStateRef.current;
    if (gs.physics.empCharges <= 0) {
      audio.playTiltWarning();
      setMessage('OUT OF EMP! TAP THE HUD TO RE-ARM ⚡');
      setTimeout(() => setMessage(''), 900);
      return;
    }

    gs.physics.empCharges--;
    if (gs.freeEmpLeft > 0) gs.freeEmpLeft--;
    else useGameStore.getState().consumePowerup('emp');
    setTacticalCharges((c) => ({ ...c, emp: gs.physics.empCharges }));
    audio.playEmpBlast();
    triggerHapticVibrate([32, 28, 50]);
    haptics.empDefuse();

    const w = canvasSizeRef.current.w || window.innerWidth;
    const h = canvasSizeRef.current.h || window.innerHeight;
    const gameRadius = Math.min(w, h) * 0.45;

    let defusedCount = 0;
    const empTier = unlockedPerks['emp_defuser'] || 1;
    const clearAll = empTier >= 3;

    for (const b of gs.blocks) {
      if (!b.handled && b.type === 'boom' && b.distance > 0) {
        b.handled = true;
        defusedCount++;
        createExplosionAtDistance(b, gameRadius, w, h, '#eab308');
        if (!clearAll) break;
      }
    }

    const coinReward = (empTier >= 2 ? 60 : 30) * Math.max(1, defusedCount);
    useGameStore.getState().addCoins(coinReward);
    useGameStore.getState().recordAchievementProgress('empUsed', 1);
    if (defusedCount > 0) {
      useGameStore.getState().recordAchievementProgress('bombsDefused', defusedCount);
    }
    setMessage(`EMP! BOMBS FIZZLED +${coinReward} 🪙`);
    setTimeout(() => setMessage(''), 1100);
  };

  useEffect(() => {
    if (state === 'playing') {
      if (!useGameStore.getState().isReviving) {
        initGame();
      } else {
        // Resume game from where we left off!
        gameStateRef.current.isGameOver = false;
        
        // Re-queue unbuilt blocks so they come fresh
        const unbuiltBlocks = gameStateRef.current.blocks
          .filter(b => !b.success)
          .map(b => ({
            type: b.type,
            angle: b.angle,
            speed: b.speed,
            delay: b.delay,
            color: b.color,
            size: b.size
          }));
        
        gameStateRef.current.queue = [...unbuiltBlocks, ...gameStateRef.current.queue];
        if (gameStateRef.current.queue.length === 0) {
          gameStateRef.current.queue = generateLevel(level).slice(0, 4);
        }
        gameStateRef.current.blocks = [];
        
        // Add a 1.5 second buffer before they start coming again
        gameStateRef.current.lastSpawnTime = performance.now() + 1500;
        
        rebraceTower(gameStateRef.current.physics);
        gameStateRef.current.hasRevived = true;
        gameStateRef.current.lives = Math.max(gameStateRef.current.lives, 2);
        setLivesLeft(gameStateRef.current.lives);
        setMessage(''); // Clear BOOM! text when resuming
        setGravityNote('');
        useGameStore.getState().clearReviveFlag();
      }
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current);
        gameOverTimeoutRef.current = null;
      }
      haptics.stop();
    };
  }, [state, level, mode]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 300;
      // Render at the screen's real pixel density (capped for frame rate) so art stays sharp on phones
      const dpr = Math.min(lowFxRef.current ? 1 : 2, Math.max(1, window.devicePixelRatio || 1));
      canvasSizeRef.current = { w, h, dpr };
      setArenaTop(Math.round(arenaTopFor(w, h)));
      setBoardH(h);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
    };
    updateSize();
    resizeCanvasRef.current = updateSize;

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const lastActionTimeRef = useRef(0);

  const handleAction = () => {
    const now = performance.now();
    if (now - lastActionTimeRef.current < 180) return;
    lastActionTimeRef.current = now;

    if (state !== 'playing' || gameStateRef.current.isGameOver) return;
    
    const gs = gameStateRef.current;
    
    // Find closest unhandled block
    const targetBlock = gs.blocks.reduce((closest, b) => {
        if (b.handled) return closest;
        if (!closest) return b;
        return b.distance < closest.distance ? b : closest;
    }, null as ActiveBlock | null);
    
    if (!targetBlock) return;
    
    const w = canvasSizeRef.current.w || window.innerWidth;
    const h = canvasSizeRef.current.h || window.innerHeight;
    const gameRadius = Math.min(w, h) * 0.45;
    
    const targetMass = getBlockMass(targetBlock);

    // Check too early (>15 distance)
    if (targetBlock.distance > 15) {
      if (isTutorialActive) {
        // QUICK-START GUIDE SAFETY CUSHION: PREVENT IMMEDIATE GAME-OVER!
        audio.playTiltWarning();
        triggerHapticVibrate([20, 35]);
        setTutorialMistakeAlert('TOO EARLY! ⚠️ Wait for the block to enter the green sweet spot circle!');
        setMessage('PATIENCE! WAIT FOR THE GREEN CIRCLE 🟢');
        setTimeout(() => {
          setTutorialMistakeAlert(null);
          setMessage('');
        }, 1100);
        return; // Safe cushion! Do not call gameOver
      }

      if (gs.physics.shieldActive) {
        targetBlock.handled = true;
        gs.physics.shieldActive = false;
        onShieldBroken();
        useGameStore.getState().recordAchievementProgress('shieldUsed', 1);
        setTacticalCharges((c) => ({ ...c, shield: false }));
        gs.combo = 0;
        setActiveCombo(0);
        audio.playCollisionSound(targetMass, { type: 'deflect' });
        audio.playShieldBreak();
        triggerHapticVibrate([40, 30, 75]);
        haptics.bombAbsorbedByShield();
        recorderRef.current.logEvent('shield', 'AEGIS SHIELD ABSORBED MISCLICK', '#38bdf8');
        createExplosionAtDistance(targetBlock, gameRadius, w, h, '#38bdf8');
        setMessage('AEGIS SHIELD: OOPSIE FORGIVEN! 🛡️');
        setTimeout(() => setMessage(''), 1000);
        return;
      }
      // A piece grabbed too early is fumbled and lost; an early tap while a bomb is the
      // nearest object is just a wasted tap (the bomb keeps flying). Either costs a heart.
      if (targetBlock.type === 'build') targetBlock.handled = true;
      audio.playCollisionSound(targetMass, { type: 'glance' });
      triggerHapticVibrate([45, 30, 40]);
      haptics.tooEarly();
      recorderRef.current.logEvent('early', 'TOO EARLY MISCLICK', '#ef4444');
      if (loseLife('TOO EARLY! OOPSIE')) {
        if (targetBlock.type === 'build') createExplosionAtDistance(targetBlock, gameRadius, w, h, '#f59e0b', true);
        return;
      }
      gameOver(false, 'TOO EARLY! EAGER BEAVER 🦫');
      createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
    } else if (targetBlock.distance < -15) {
      // Ignored, gameloop will catch it.
    } else {
      // Hit Zone!
      targetBlock.handled = true;
      if (targetBlock.type === 'boom') {
        if (gs.physics.shieldActive) {
          gs.physics.shieldActive = false;
          onShieldBroken();
          useGameStore.getState().recordAchievementProgress('shieldUsed', 1);
          useGameStore.getState().recordAchievementProgress('bombsDefused', 1);
          setTacticalCharges((c) => ({ ...c, shield: false }));
          gs.combo = 0;
          setActiveCombo(0);
          audio.playCollisionSound(targetMass, { type: 'deflect' });
          audio.playShieldBreak();
          triggerHapticVibrate([45, 35, 85]);
          haptics.bombAbsorbedByShield();
          recorderRef.current.logEvent('shield', 'AEGIS SHIELD ABSORBED BOMB', '#38bdf8');
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#38bdf8');
          setMessage('AEGIS SHIELD ATE THAT BOMB! 🛡️');
          setTimeout(() => setMessage(''), 1000);
          return;
        }
        audio.playCollisionSound(targetMass, { type: 'crash' });
        triggerHapticVibrate([70, 35, 110, 45, 175]);
        haptics.bombHit();
        recorderRef.current.logEvent('boom', 'BOMB DETONATED', '#ef4444', { mass: targetMass });
        gameOver(false, 'YOU TAPPED A BOMB! KABOOM 💥');
        createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
      } else {
        // Successful Placement with Physics & Archetype calculation!
        targetBlock.success = true;
        setTutorialEmergencyHold(false);
        gs.lastImpactTime = performance.now();
        gs.sillyWobble = 1.0;

        if (isTutorialActive) {
          const currentStep = useGameStore.getState().tutorialStep;
          if (currentStep === 1) {
            useGameStore.getState().setTutorialStep(2);
            setMessage('PERFECT STACK 1/3! 🌟');
          } else if (currentStep === 2) {
            useGameStore.getState().setTutorialStep(3);
            setMessage('EXCELLENT ALIGNMENT 2/3! 🎯');
          } else if (currentStep >= 3) {
            useGameStore.getState().setTutorialStep(4);
            setMessage('3/3 STACKED! ARCHITECT CERTIFIED! 🏆');
            setTimeout(() => {
              setTutorialCompletedSheet(true);
            }, 600);
          }
        }

        // Where it really lands: tap timing plus wherever the swaying tower top is right now
        gs.physics.pushScale = isTutorialActive ? 0 : swayScaleFor(mode, level, gs.physics.stack.length);
        const landing = landingOffsetFor(targetBlock);
        const landingOffset = targetBlock.archetype === 'titan' ? 0 : landing.offset;
        const impact = applyBlockImpact(
          gs.physics,
          Math.max(-HIT_WINDOW, Math.min(HIT_WINDOW, (landingOffset / MAX_SLIP) * HIT_WINDOW)),
          targetBlock.angle,
          targetBlock.archetype,
          unlockedPerks,
          targetMass
        );

        // Physically land the block where it was when tapped
        const placement = placeBlock(gs.physics, {
          distance: targetBlock.distance,
          angle: targetBlock.angle,
          mass: targetMass,
          archetype: targetBlock.archetype,
          isPerfect: impact.isPerfect,
          perks: unlockedPerks,
          forgiving: isTutorialActive,
          landingOffset,
        });
        // The new piece lands at the arrival point; the tower then sinks one layer to make room
        gs.towerSink = -VISUAL_LAYER;
        const swayMiss = Math.abs(landing.sway) > Math.abs(landing.timing);

        if (placement.outcome !== 'stacked') {
          spawnDebris(placement.fallen, placement.toppleLevel, w, h);
          gs.shake = Math.max(gs.shake, placement.outcome === 'collapsed' ? 28 : 12);

          if (placement.outcome === 'collapsed' && !gs.physics.shieldActive) {
            audio.playCollisionSound(3.0, { type: 'crash' });
            triggerHapticVibrate([70, 35, 95, 45, 140]);
            haptics.towerCollapsed();
            recorderRef.current.logEvent('collapse', 'TOWER TOPPLED', '#ef4444');
            creditGravity('overhang', placement.toppleLevel, placement.slip, placement.fallen);
            gameOver(false, 'OVERHANG! TOWER TOPPLED 🫠');
            return;
          }

          if (placement.outcome === 'collapsed') {
            // Aegis shield catches the toppling section; the rest of the tower stands
            gs.physics.shieldActive = false;
            onShieldBroken();
            gs.physics.angularVelocity *= 0.3;
            useGameStore.getState().recordAchievementProgress('shieldUsed', 1);
            setTacticalCharges((c) => ({ ...c, shield: false }));
            audio.playShieldBreak();
            haptics.bombAbsorbedByShield();
            recorderRef.current.logEvent('shield', 'AEGIS SHIELD CAUGHT TOPPLE', '#38bdf8');
            setMessage(`AEGIS SHIELD SAVED THE DAY! -${placement.fallen.length} PIECES`);
          } else {
            audio.playCollisionSound(targetMass, { type: 'glance' });
            triggerHapticVibrate([30, 25, 45]);
            recorderRef.current.logEvent('slide', 'BLOCK SLID OFF', '#f59e0b');
            setMessage(swayMiss ? 'WHOOPS, IT SLID OFF! WAIT FOR THE SWING 🎢' : 'WHOOPS, IT SLID OFF THE EDGE!');
          }
          setTimeout(() => setMessage(''), 1100);

          // A lost block breaks the combo and the rapid-perfect chain
          gs.combo = 0;
          setActiveCombo(0);
          gs.rapidPerfectStreak = 0;
          gs.lastPerfectTime = 0;
          gs.rapidPerfectMultiplier = 1;
          useGameStore.getState().setTowerHeight(gs.physics.stack.length);
          return;
        }

        if (!impact.isPerfect && Math.abs(placement.slip) > BLOCK_HALF_WIDTH * 0.5 && !targetBlock.archetype?.match(/titan|gold_ingot|prism/)) {
          setMessage(swayMiss ? (placement.slip > 0 ? 'WOBBLY! IT LEANS ▶' : '◀ WOBBLY! IT LEANS') : placement.slip > 0 ? 'LEANING ▶ AIM A BIT LEFT' : '◀ LEANING, AIM A BIT RIGHT');
          setTimeout(() => setMessage(''), 800);
        }

        // One-time tip the first time the tower is tall enough to sway noticeably
        if (!isTutorialActive && gs.physics.stack.length === 6 && !gs.swayHintShown) {
          gs.swayHintShown = true;
          showTip('sway', 'THE TOWER WIGGLES!', 'Every landing rocks it. Tap when the top swings back under the piece. Green marker means go!');
        }

        // Trick pieces pay out: trusting a "bomb" that was really a piece, or catching a ghost
        if (!isTutorialActive && (targetBlock.modifier === 'fake-boom' || targetBlock.modifier === 'ghost')) {
          useGameStore.getState().addCoins(3);
          gs.floatTexts.push({ text: targetBlock.modifier === 'ghost' ? 'GHOST BUSTED! +3 🪙' : 'NERVES OF STEEL! +3 🪙', x: w / 2, y: Math.max(150, arenaTopFor(w, h) - 4), life: 1, color: targetBlock.modifier === 'ghost' ? '#c4b5fd' : '#5eead4' });
        }

        gs.builtCount++;
        gs.combo++;
        gs.maxHeight = Math.max(gs.maxHeight, gs.physics.stack.length);
        if (mode === 'endless' && !isTutorialActive) {
          const best = useGameStore.getState().highScores['tower-endless'] || 0;
          const n = gs.physics.stack.length;
          if (best >= 5 && n > best && !gs.recordAnnounced) {
            gs.recordAnnounced = true;
            gs.floatTexts.push({ text: '🎉 NEW RECORD! SKY-HIGH!', x: w / 2, y: Math.max(126, arenaTopFor(w, h) - 28), life: 1.8, color: '#fde047' });
            worldThemeRef.current.particles.triggerStackParticles(0.5, 0.55, true, 3);
            audio.playCheer();
          }
          if (n > 0 && n % 10 === 0) {
            useGameStore.getState().addCoins(5);
            audio.playComboSurge(2);
            gs.floatTexts.push({ text: `${n} TALL! WHEEE! +5 🪙`, x: w / 2, y: Math.max(150, arenaTopFor(w, h) - 4), life: 1.3, color: '#86efac' });
          }
        }
        gs.maxCombo = Math.max(gs.maxCombo || 0, gs.combo);
        if (impact.isPerfect) {
          gs.perfectCount = (gs.perfectCount || 0) + 1;
          setTowerMood(gs.physics.stressLevel, true);
        }
        setBuiltCount(gs.builtCount);
        useGameStore.getState().setTowerHeight(gs.physics.stack.length);
        setActiveCombo(gs.combo);
        trackEvent('BUILD_SUCCESS');

        // Record Achievements for blocks placed, perfect landing, and combo
        useGameStore.getState().recordAchievementProgress('totalBlocksPlaced', 1);
        if (impact.isPerfect) {
          useGameStore.getState().recordAchievementProgress('perfectLandings', 1);
        }
        useGameStore.getState().recordCombo(gs.combo);

        // Rapid Perfect Succession Stacking Logic
        const RAPID_WINDOW_MS = 4200;
        const currentTime = performance.now();
        let currentMultiplier = 1;

        if (impact.isPerfect) {
          const timeSinceLast = currentTime - (gs.lastPerfectTime || 0);
          if (gs.lastPerfectTime > 0 && timeSinceLast <= RAPID_WINDOW_MS) {
            // Consecutive perfect stack in rapid succession!
            gs.rapidPerfectStreak = (gs.rapidPerfectStreak || 0) + 1;
          } else {
            // First perfect in sequence
            gs.rapidPerfectStreak = 1;
          }
          gs.lastPerfectTime = currentTime;
          currentMultiplier = Math.min(10, gs.rapidPerfectStreak);
          gs.rapidPerfectMultiplier = currentMultiplier;

          if (currentMultiplier >= 2) {
            audio.playRapidPerfectCombo(gs.rapidPerfectStreak, currentMultiplier);
          }
        } else {
          // Off-center placement breaks rapid perfect sequence
          if (gs.rapidPerfectStreak >= 2) {
            audio.playRapidComboExpired();
          }
          gs.rapidPerfectStreak = 0;
          gs.lastPerfectTime = 0;
          gs.rapidPerfectMultiplier = 1;
        }

        // Tactile Haptic feedback pattern using Vibration API: modulated by archetype, center accuracy, combo, streak, and mass
        haptics.blockPlaced(
          targetBlock.archetype,
          impact.isPerfect,
          gs.combo,
          gs.rapidPerfectStreak || 0,
          targetMass
        );

        const previousScore = useGameStore.getState().score;
        const basePoints = gs.builtCount * 10 * gs.combo;
        const multiplierBoost = currentMultiplier >= 2 ? currentMultiplier : 1;
        // Aim Assist tier 3: double points while your combo is 10 or more
        const comboBoost = (unlockedPerks['precision_optics'] || 0) >= 3 && gs.combo >= 10 ? 2 : 1;
        if (comboBoost > 1 && gs.combo === 10) {
          setMessage('HYPERDRIVE! DOUBLE POINTS 🚀');
          setTimeout(() => setMessage(''), 900);
        }
        const totalPoints = Math.round(basePoints * impact.scoreMultiplier * multiplierBoost * comboBoost);
        setScore(totalPoints);
        const deltaPoints = Math.max(10, totalPoints - previousScore);

        // Update real-time visual combo multiplier state for the on-screen indicator
        setRapidComboData({
          streak: gs.rapidPerfectStreak,
          multiplier: currentMultiplier,
          timeRemaining: RAPID_WINDOW_MS,
          duration: RAPID_WINDOW_MS,
          active: gs.rapidPerfectStreak >= 2,
          pointsGained: deltaPoints,
        });

        const cx = w / 2;
        const cy = h * 0.65;
        const px = cx + Math.cos(targetBlock.angle) * (targetBlock.distance / 100) * gameRadius;
        const py = cy + Math.sin(targetBlock.angle) * (targetBlock.distance / 100) * gameRadius;

        // Floating multiplier badge spawned at contact location if rapid perfect combo active
        if (SHOW_FLOATING_COMBO_CARDS && impact.isPerfect && currentMultiplier >= 2) {
          const tier = Math.min(5, Math.max(1, currentMultiplier - 1)) as 1 | 2 | 3 | 4 | 5;
          const bonusTag = currentMultiplier >= 5 ? 'APEX' : currentMultiplier >= 4 ? 'HYPER' : currentMultiplier >= 3 ? 'TRIPLE' : 'DUAL';
          const newFloater: FloatingMultiplierData = {
            id: `mult-${Date.now()}-${Math.random()}`,
            // Shown well above the landing point so it never covers the swaying tower top
            x: cx + (px - cx) * 0.3,
            y: Math.max(70, cy - 170),
            multiplier: currentMultiplier,
            comboCount: gs.rapidPerfectStreak,
            points: deltaPoints,
            label: `${currentMultiplier}x MULTIPLIER`,
            bonusTag,
            tier,
            isPerfect: true,
            archetype: targetBlock.archetype,
            rotation: (Math.random() - 0.5) * 12,
          };
          setFloatingMultipliers((prev) => [...prev.slice(-6), newFloater]);
        }

        // Dynamic canvas feedback & visual impact (No popups over the plate)
        if (gs.combo >= 2 || impact.scoreMultiplier > 1) {
          const tier = Math.min(5, Math.max(1, Math.floor(gs.combo / 2))) as 1 | 2 | 3 | 4 | 5;
          const comboColors = ['#facc15', '#06b6d4', '#d946ef', '#f97316', '#ffd700'];
          const waveColor = comboColors[tier - 1];

          // Dynamic canvas expanding shockwave rings and sparkling sparks (non-intrusive)
          gs.particles.push({
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            life: 1.0,
            color: waveColor,
            size: 16 + gs.combo * 2,
            type: 'ring',
          });

          for (let i = 0; i < Math.min(12, 4 + gs.combo); i++) {
            const ang = (Math.PI * 2 * i) / (4 + gs.combo) + (Math.random() - 0.5) * 0.4;
            const spd = 2.5 + Math.random() * 3.5;
            gs.particles.push({
              x: px,
              y: py,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 1.2,
              life: 0.85 + Math.random() * 0.35,
              color: waveColor,
              size: Math.random() * 4 + 2,
              type: 'spark',
            });
          }
        }

        // Dynamic screen shake effect: intensity scales with the height of the stack
        const stackHeight = gs.builtCount;
        const heightScale = 1 + Math.min(4.5, (stackHeight / 5) * 0.85);
        const basePlacementShake = impact.isPerfect ? 5.5 : 3.8;
        const comboShakeBonus = Math.min(6, (gs.combo || 0) * 0.6);
        // Kept small: the tower's own physical sway is the landing feedback, and a big
        // screen shake would hide it
        const placementShake = (basePlacementShake * Math.min(1.6, heightScale)) * 0.45 + comboShakeBonus * 0.3;
        gs.shake = Math.max(gs.shake, Math.min(7, placementShake));

        // Lightweight library particle burst for successful block stacking
        const normStackX = px / Math.max(1, w);
        const normStackY = py / Math.max(1, h);
        // Confetti only for perfect landings, so it stays special and the tower stays visible
        if (impact.isPerfect && gs.combo % 5 === 0) worldThemeRef.current.particles.triggerStackParticles(normStackX, normStackY, true, Math.min(gs.combo, 3));

        if (impact.bonusCoins > 0) {
          useGameStore.getState().addCoins(impact.bonusCoins);
        }

        // 1. Kinetic Collision sound effect: physical impact on the tower deck, pitch varying with block mass
        audio.playCollisionSound(targetMass, {
          type: 'impact',
          speed: targetBlock.speed,
        });

        // 2. Harmonic Stacking sound effect: structural lock into the tower, with pitch determined by mass, combo escalation, and archetype timbre
        audio.playStackSound(targetMass, {
          archetype: targetBlock.archetype,
          isPerfect: impact.isPerfect,
          combo: gs.combo,
          height: gs.physics.stack.length,
        });

        // Log stack event to replay recorder
        recorderRef.current.logEvent(
          impact.isPerfect ? 'perfect' : 'stack',
          impact.isPerfect
            ? 'PERFECT ALIGNMENT'
            : targetBlock.archetype === 'titan'
            ? 'TITAN ANCHOR'
            : targetBlock.archetype === 'gold_ingot'
            ? '+50 GOLD INGOT'
            : targetBlock.archetype === 'prism'
            ? '3X PRISM SURGE'
            : 'BLOCK STACKED',
          targetBlock.archetype === 'titan'
            ? '#f59e0b'
            : targetBlock.archetype === 'gold_ingot'
            ? '#eab308'
            : targetBlock.archetype === 'prism'
            ? '#00f2fe'
            : '#00ffcc',
          { archetype: targetBlock.archetype, mass: targetMass }
        );

        if (targetBlock.archetype === 'titan') {
          audio.playTitanAnchor();
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#f59e0b', true);
          setMessage('TITAN ANCHOR: CLUNK! ROCK SOLID 🗿');
          setTimeout(() => setMessage(''), 800);
        } else if (targetBlock.archetype === 'gold_ingot') {
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#eab308', true);
          setMessage('+50 SHINY GOLD! ✨');
          setTimeout(() => setMessage(''), 800);
        } else if (targetBlock.archetype === 'prism') {
          audio.playComboSurge(3);
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00f2fe', true);
          setMessage('3X PRISM SURGE! SO SPARKLY 🌈');
          setTimeout(() => setMessage(''), 800);
        } else if (impact.isPerfect) {
          if (gs.rapidPerfectStreak < 2) {
            audio.playPerfectSound();
          }
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00f2fe', true);
          // The HUD chip tracks the streak; a toast only marks milestones so the screen stays calm
          const streakMilestone = gs.rapidPerfectStreak >= 2 && [3, 5, 7, 10].includes(gs.rapidPerfectMultiplier);
          if (streakMilestone) {
            setMessage(`${gs.rapidPerfectMultiplier}x PERFECT STREAK! ON FIRE 🔥`);
            setTimeout(() => setMessage(''), 650);
          } else if (gs.rapidPerfectStreak < 2) {
            setMessage(PERFECT_CHEERS[Math.floor(Math.random() * PERFECT_CHEERS.length)]);
            setTimeout(() => setMessage(''), 500);
          }

          if (unlockedPerks['aegis_shield'] >= 2 && gs.combo % 20 === 0 && !gs.physics.shieldActive) {
            gs.physics.shieldActive = true;
            setTacticalCharges((c) => ({ ...c, shield: true }));
            setMessage('AEGIS SHIELD RECHARGED! 🛡️');
          }
        } else {
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00ffcc', true);
          if (impact.message && impact.message !== 'GOOD!') {
            setMessage(impact.message);
            setTimeout(() => setMessage(''), 700);
          }
        }

        if (gs.combo % 5 === 0) {
          audio.playComboSurge(Math.floor(gs.combo / 5));
        }
      }
    }
  };

  /**
   * Gravity gets the credit when the tower falls: marks the joint that gave way and explains
   * why in plain words on the end screen.
   */
  const creditGravity = (cause: 'overhang' | 'sway' | 'lean', fromLevel: number, side: number, fallen: StackedBlock[]) => {
    const gs = gameStateRef.current;
    audio.playGravityWhomp();
    const w = canvasSizeRef.current.w || 400;
    const h = canvasSizeRef.current.h || 800;
    const whole = [...gs.physics.stack, ...fallen];
    const pose = whole.length ? towerPose(whole, Math.min(Math.max(0, fromLevel), whole.length - 1), gs.physics.tiltAngle, w / 2, h * 0.65) : { x: w / 2, y: h * 0.65 };
    gs.floatTexts.push({ text: '⬇ GRAVITY SAYS HI', x: pose.x, y: pose.y - 10, life: 1.6, color: '#fb923c' });
    const dir = side < 0 ? 'left' : 'right';
    const piece = fromLevel <= 0 ? 'the bottom piece' : `piece ${fromLevel}`;
    if (cause !== 'overhang' && motionEnergyRef.current > 1.2) {
      setGravityNote('You gave your phone a good swing and the tower swung with it. Gravity caught it mid-wobble! Hold steady when it gets tall.');
      return;
    }
    setGravityNote(
      cause === 'overhang'
        ? `The pieces above ${piece} leaned out too far ${dir}. Their centre of mass slipped past the edge and gravity went "nope!"`
        : cause === 'sway'
        ? `Your tower was leaning ${dir}, then it swayed. The weight above ${piece} swung past the edge and gravity took it for a ride.`
        : `It leaned more than it could handle and gravity won the tug of war. Gyro Stability upgrades help it bounce back.`
    );
  };

  /**
   * First-time tips: shown once per install, with a couple of seconds of slow motion so
   * there is time to read them mid-run.
   */
  const showTip = (key: string, title: string, body: string) => {
    if (isTutorialActive) return;
    // One tip at a time, with breathing room; a skipped tip comes back at its next trigger
    if (performance.now() - gameStateRef.current.lastTipAt < TIP_SPACING_MS) return;
    try {
      if (localStorage.getItem('ts_tip_' + key) === '1') return;
      localStorage.setItem('ts_tip_' + key, '1');
    } catch {
      return; // no storage (private mode): skip tips rather than repeat them every run
    }
    gameStateRef.current.slowUntil = performance.now() + TIP_SLOWMO_MS;
    gameStateRef.current.lastTipAt = performance.now();
    setTipCard({ title, body });
    setTimeout(() => setTipCard((t) => (t && t.title === title ? null : t)), TIP_SLOWMO_MS + 600);
  };

  /**
   * A mistake that is not fatal on its own: costs a heart and the combo. Returns true when
   * the run carries on, false when that was the last heart.
   */
  const loseLife = (label: string) => {
    const gs = gameStateRef.current;
    gs.lives = Math.max(0, gs.lives - 1);
    setLivesLeft(gs.lives);
    gs.combo = 0;
    setActiveCombo(0);
    gs.rapidPerfectStreak = 0;
    gs.lastPerfectTime = 0;
    gs.rapidPerfectMultiplier = 1;
    if (gs.lives <= 0) return false;
    audio.playHeartLost();
    showTip('hearts', 'OOPS, A HEART!', 'Early or missed taps cost a heart. Lose all 3 and the run ends. Tap a bomb? Instant kaboom!');
    gs.shake = Math.max(gs.shake, 6);
    setMessage(`${label} ${'♥'.repeat(gs.lives)}${'♡'.repeat(MAX_LIVES - gs.lives)}`);
    setTimeout(() => setMessage(''), 1100);
    return true;
  };

  /**
   * On-screen pose of tower level `idx`. The top of the tower sits just under the landing
   * point (cx, cy) where incoming objects arrive, so they land on whatever is actually there:
   * the tower flexes from its foundation and its top swings left and right under that point.
   */
  const towerPose = (stack: StackedBlock[], idx: number, tiltDeg: number, cx: number, cy: number) => {
    const gs = gameStateRef.current;
    const n = stack.length;
    const b = stack[idx];
    return {
      x: cx + ((b?.x ?? 0) - gs.camX) + flexOffset(tiltDeg, idx, n),
      y: cy + (n - idx) * VISUAL_LAYER + gs.towerSink,
      rot: ((tiltDeg * Math.PI) / 180) * ((idx + 1) / Math.max(1, n)),
      hw: b?.halfWidth || BLOCK_HALF_WIDTH,
    };
  };

  /** Where an object tapped right now lands relative to the centre of the top of the tower, px. */
  const landingOffsetFor = (b: ActiveBlock) => {
    const gs = gameStateRef.current;
    const st = gs.physics.stack;
    const timing = landingSlip(Math.max(-HIT_WINDOW, Math.min(HIT_WINDOW, b.distance)), b.angle, unlockedPerks['precision_optics'] || 0);
    // The object arrives at the camera centre; the top of the tower is wherever it has swung to
    const topScreen = st.length ? st[st.length - 1].x - gs.camX + topSway(gs.physics) : -gs.camX;
    return { timing, sway: topScreen, offset: timing - topScreen };
  };

  // Turns blocks that fell off the tower into tumbling debris at their on-screen positions
  const spawnDebris = (fallen: StackedBlock[], fromLevel: number, w: number, h: number) => {
    const gs = gameStateRef.current;
    const cx = w / 2;
    const cy = h * 0.65;
    const whole = [...gs.physics.stack, ...fallen];
    const lean = gs.physics.tiltAngle >= 0 ? 1 : -1;
    fallen.forEach((b, k) => {
      const level = fromLevel + k;
      const overhang = Math.sign(b.x - (level > 0 ? (whole[level - 1]?.x ?? b.x) : 0)) || lean;
      const pose = towerPose(whole, level, gs.physics.tiltAngle, cx, cy);
      gs.debris.push({
        halfWidth: b.halfWidth || BLOCK_HALF_WIDTH,
        archetype: b.archetype,
        x: pose.x,
        y: pose.y,
        vx: overhang * (1.5 + Math.random() * 2.5) + k * 0.15 * overhang,
        vy: -2 - Math.random() * 2,
        rot: (gs.physics.tiltAngle * Math.PI) / 180,
        vr: overhang * (0.04 + Math.random() * 0.08),
        life: 1,
      });
    });
    gs.debris = gs.debris.slice(-60);
  };

  const createExplosionAtDistance = (block: ActiveBlock, gameRadius: number, w: number, h: number, baseColor: string, celebrate = false) => {
      const px = w/2 + Math.cos(block.angle) * (block.distance / 100) * gameRadius;
      const py = h * 0.65 + Math.sin(block.angle) * (block.distance / 100) * gameRadius;
      const { activeBoom, activeWorldInfo } = activeCosmeticsRef.current;
      if (celebrate) {
        // A good landing: a light spark burst that keeps the swaying tower top visible
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 * i) / 12;
          gameStateRef.current.particles.push({ x: px, y: py, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 1, life: 0.8, color: baseColor, size: 2.5, type: 'spark' });
        }
        gameStateRef.current.particles.push({ x: px, y: py, vx: 0, vy: 0, life: 1.0, color: baseColor, size: 10, type: 'ring' });
        return;
      }
      
      let effectColor = baseColor;
      if (block.type === 'boom') {
        effectColor = getBoomColor(activeBoom);
      }

      createExplosion(px, py, effectColor, 40);

      // Lightweight particle library explosion burst
      const normX = px / Math.max(1, w);
      const normY = py / Math.max(1, h);
      const isDefused = baseColor === '#38bdf8' || baseColor === '#eab308';
      if (block.type === 'boom' || isDefused || baseColor === '#ef4444' || baseColor === '#f59e0b') {
        worldThemeRef.current.particles.triggerBombParticles(normX, normY, isDefused);
      }
      
      // Add Shockwave ring
      gameStateRef.current.particles.push({
          x: px, y: py, vx: 0, vy: 0, life: 1.0, color: effectColor, size: 10, type: 'ring'
      });
  };

  const gameOver = (win: boolean, reason?: string) => {
    if (gameStateRef.current.isGameOver) return;
    gameStateRef.current.isGameOver = true;
    if (mode === 'endless') useGameStore.getState().updateHighScore('tower-endless', gameStateRef.current.maxHeight);
    gameStateRef.current.rapidPerfectStreak = 0;
    gameStateRef.current.lastPerfectTime = 0;
    gameStateRef.current.rapidPerfectMultiplier = 1;
    setActiveCombo(0);
    setRapidComboData((prev) => ({ ...prev, active: false, timeRemaining: 0 }));
    setFloatingMultipliers([]);

    const { activeSkin, activePlate, activeBoom, activeWorldInfo } = activeCosmeticsRef.current;

    // Finalize 10-second physics replay recording
    try {
      const savedReplay = recorderRef.current.finalize({
        mode,
        level,
        finalOutcome: win ? 'won' : 'lost',
        finalReason: reason,
        equippedCosmetic: activeSkin,
        equippedPlate: activePlate,
        equippedBackground: activeWorldInfo.worldId,
        activeBoom,
      });
      if (savedReplay) {
        useGameStore.getState().setLastReplay(savedReplay);
      }
    } catch (err) {
      console.warn('Replay recording finalize error:', err);
    }

    // Handle Tournament score submission for both win and loss
    if (mode === 'tournament') {
      const activeT = useGameStore.getState().activeTournament;
      const currentScore = useGameStore.getState().score;
      const blocksBuilt = gameStateRef.current.builtCount;
      const maxCombo = gameStateRef.current.combo;
      useGameStore.getState().updateHighScore('tournament', currentScore);
      if (activeT) {
        fetch(apiUrl(`/api/tournaments/${activeT.id}/submit`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: useGameStore.getState().playerId,
            playerName: useGameStore.getState().playerName,
            avatar: useGameStore.getState().playerAvatar,
            country: useGameStore.getState().playerCountry,
            cosmeticId: useGameStore.getState().equippedCosmetic || undefined,
            score: currentScore,
            blocksBuilt,
            maxCombo,
          }),
        })
          .then(async r => {
            const ct = r.headers.get('content-type') || '';
            if (r.ok && ct.includes('application/json')) {
              return r.json();
            }
            return null;
          })
          .then(data => {
            if (data && data.success) {
              useGameStore.getState().setTournamentRunResult({
                rank: data.rank,
                score: currentScore,
                previousRank: data.previousRank,
                isNewBest: data.isNewBest,
                totalParticipants: data.totalParticipants,
              });
              if (data.rank === 1) useGameStore.getState().addTrophy('gold');
              else if (data.rank === 2) useGameStore.getState().addTrophy('silver');
              else if (data.rank === 3) useGameStore.getState().addTrophy('bronze');

              const earned = Math.max(15, Math.floor(blocksBuilt * 2));
              useGameStore.getState().setPendingCoins(withCoinBonus(earned));
            } else {
              // Local fallback rank calculation
              const total = activeT.totalParticipants || 250;
              const estRank = Math.max(1, Math.min(total, Math.floor(total * 0.25)));
              useGameStore.getState().setTournamentRunResult({
                rank: estRank,
                score: currentScore,
                isNewBest: true,
                totalParticipants: total + 1,
              });
              const earned = Math.max(15, Math.floor(blocksBuilt * 2));
              useGameStore.getState().setPendingCoins(withCoinBonus(earned));
            }
          })
          .catch(err => {
            console.warn('Tournament submit offline fallback:', err);
            const total = activeT.totalParticipants || 250;
            useGameStore.getState().setTournamentRunResult({
              rank: Math.max(1, Math.floor(total * 0.2)),
              score: currentScore,
              isNewBest: true,
              totalParticipants: total + 1,
            });
            const earned = Math.max(15, Math.floor(blocksBuilt * 2));
            useGameStore.getState().setPendingCoins(withCoinBonus(earned));
          });
      }
    }

    if (win) {
      audio.playPerfectSound();
      haptics.levelWon();
      setMessage('PERFECT!');
      if (mode === 'campaign') {
        unlockNextLevel();
        autoSaveProgression('level_complete', { levelCompleted: level });
        useDailyStore.getState().updateProgress('LEVELS_PLAYED', 1);
        if (gameStateRef.current.hasRevived) {
           useDailyStore.getState().updateProgress('BOOM_RECOVERY', 1);
        } else {
           useDailyStore.getState().updateProgress('NO_BOOM', 1);
        }
        const baseCoins = 50 + (level * 10);
        const performanceCoins = gameStateRef.current.builtCount * 5;
        const totalCoins = baseCoins + performanceCoins;
        useGameStore.getState().setPendingCoins(withCoinBonus(totalCoins));

        // Compute performance metrics for EndOfLevelSummary
        const gs = gameStateRef.current;
        // Read the live score: this runs inside the game loop, where the rendered value is stale
        const score = useGameStore.getState().score;
        const elapsedSec = gs.startTime > 0 ? (performance.now() - gs.startTime) / 1000 : 0;
        const built = gs.builtCount;
        const perfects = gs.perfectCount || 0;
        const accuracyPct = built > 0 ? Math.min(100, Math.round((perfects / built) * 100)) : 100;
        const heightMeters = built * 2.5;

        // Stars: clearing earns one, keeping every heart earns one, landing at least half the
        // pieces perfectly earns one. Best result per level is kept and shown on the map.
        const heartsKept = gs.lives >= MAX_LIVES && !gs.hasRevived;
        const starsEarned = campaignStars(gs.lives, gs.hasRevived, accuracyPct);
        updateHighScore(`stars-${level}`, starsEarned);
        gs.starHints = [
          !heartsKept ? 'keep all 3 hearts ♥' : '',
          accuracyPct < 50 ? `nail half your landings perfectly (you got ${accuracyPct}%)` : '',
        ].filter(Boolean);

        const currentHighScore = highScores[`campaign-${level}`] || 0;
        const isNewBest = score > currentHighScore;
        if (isNewBest) {
          updateHighScore(`campaign-${level}`, score);
        }

        const metricsData: LevelPerformanceMetrics = {
          level,
          score,
          highScore: Math.max(score, currentHighScore),
          isNewHighScore: isNewBest,
          accuracy: accuracyPct,
          perfectHits: perfects,
          totalBlocks: totalBlocks || built,
          timeTakenSeconds: Math.max(0.1, elapsedSec),
          heightReached: built,
          heightMeters,
          maxCombo: gs.maxCombo || 0,
          coinsEarned: totalCoins,
          stars: starsEarned,
          starHints: gs.starHints,
        };

        setSummaryMetrics(metricsData);

        // Capture replay data
        try {
          const replay = recorderRef.current.getReplayData();
          if (replay) {
            setSavedReplayData(replay);
            useGameStore.getState().setLastReplay(replay);
          }
        } catch (e) {}
      }
      else {
        updateHighScore(mode, gameStateRef.current.builtCount * 10);
        // Reward endless/daily based on performance
        const endlessCoins = Math.floor(gameStateRef.current.builtCount * 2);
        useGameStore.getState().setPendingCoins(withCoinBonus(endlessCoins));
      }
      
      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = setTimeout(() => {
        setState('won');
        gameOverTimeoutRef.current = null;
      }, 1500);
    } else {
      audio.playBoomSound();
      // Physical immersion: 'boom' event visceral detonation rumble
      triggerHapticVibrate([80, 40, 120, 50, 160]);
      if (reason && (reason.includes('COLLAPSED') || reason.includes('TOPPLED'))) {
        haptics.towerCollapsed();
      }
      // Dynamic boom detonation shake intensity-scaled with stack height
      const boomStackHeight = gameStateRef.current.builtCount;
      const boomHeightScale = 1 + Math.min(3.5, (boomStackHeight / 5) * 0.85);
      gameStateRef.current.shake = Math.min(65, 28 * boomHeightScale);
      setMessage(reason || 'BOOM!');
      setLostReason(reason || '');
      if (mode !== 'campaign') {
        const finalScore = useGameStore.getState().score;
        updateHighScore(mode, finalScore);
        if (mode === 'endless' && finalScore > 0) {
          const s = useGameStore.getState();
          fetch(apiUrl('/api/leaderboard/endless/submit'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: s.playerId,
              playerName: s.playerName,
              avatar: s.playerAvatar,
              country: s.playerCountry,
              score: finalScore,
              secondaryStat: `Endless Record • ${gameStateRef.current.builtCount} Blocks`,
            }),
          }).catch(() => {});
        }
      }
      
      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = setTimeout(() => {
        // Player defeated: transition cleanly to defeat score card with zero disruptive popups
        setState('lost');
        gameOverTimeoutRef.current = null;
      }, 1500);
    }
  };

  const createExplosion = (x: number, y: number, color: string, count: number = 30) => {
    // Dynamic explosion screen shake intensity-scaled with stack height
    const explosionHeight = gameStateRef.current.builtCount;
    const explosionHeightScale = 1 + Math.min(3.0, (explosionHeight / 5) * 0.75);
    gameStateRef.current.shake = Math.max(gameStateRef.current.shake, Math.min(50, 18 * explosionHeightScale));

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      
      let pColor = color;
      if (activeBoom === 'boom-confetti') {
        const confettiColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        pColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      }

      gameStateRef.current.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: pColor,
        size: Math.random() * 4 + 2
      });
    }
  };

  const gameLoop = (time: number) => {
    const gs = gameStateRef.current;

    if (gs.startTime === 0) {
      gs.startTime = time;
      gs.lastSpawnTime = time;
      gs.lastFrameTime = time;
    }

    // Clamp dt to maximum 33.3ms (approx 30fps minimum delta) to prevent physics jumps on frame hitches
    const rawDt = time - gs.lastFrameTime;
    const dt = Math.min(rawDt, 33.3);
    // Watch the frame rate; after ~3 s of struggling, switch to the lighter renderer
    if (!lowFxRef.current && Number.isFinite(rawDt) && rawDt > 0 && rawDt < 250 && !document.hidden) {
      const fs = frameStatsRef.current;
      fs.ema = fs.ema * 0.95 + rawDt * 0.05;
      fs.slowMs = fs.ema > 28 ? fs.slowMs + rawDt : 0;
      if (fs.slowMs > 3000) {
        lowFxRef.current = true;
        resizeCanvasRef.current();
      }
    }
    gs.lastFrameTime = time;

    if (rechargeModalOpenRef.current || (import.meta.env.DEV && (window as any).__freeze)) {
      draw(time);
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (gs.isGameOver) {
      draw(time);
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Chrono Stasis Temporal Slow Factor
    let effectiveDt = dt;
    if (gs.physics.stasisActive) {
      if (time > gs.physics.stasisEndTime) {
        gs.physics.stasisActive = false;
        audio.playStasisSound(false);
      } else {
        const stasisTier = unlockedPerks['chrono_stasis'] || 1;
        const speedFactor = stasisTier >= 3 ? 0.25 : stasisTier >= 2 ? 0.35 : 0.5;
        effectiveDt = dt * speedFactor;
      }
    }
    if (time < gs.slowUntil) effectiveDt *= 0.25;

    // Update Tower Tilt & Equilibrium
    // Dev-only hook so automated playtests can read the live game state
    if (import.meta.env.DEV) { (window as any).__gs = gs; (window as any).__store = useGameStore; }
    // Moving the phone moves the tower's base; a strong swing gets a one-time tip
    const baseAccel = motionSway && !rechargeModalOpenRef.current ? getMotion().lateral : 0;
    motionEnergyRef.current = motionEnergyRef.current * Math.exp(-dt / 600) + Math.abs(baseAccel) * (dt / 1000);
    if (Math.abs(baseAccel) > 4 && gs.physics.stack.length >= 3) {
      showTip('motion', 'WHOA, EASY THERE!', 'Your tower feels every move of your phone. Swing it and the stack swings too. Hold steady (or rock it on purpose)!');
    }
    const physResult = updateTowerPhysics(gs.physics, effectiveDt, unlockedPerks, {
      baseAccel,
      forgiving: isTutorialActive,
      wind: mode === 'workshop' ? Math.max(0, Math.min(1, sandboxOptions?.wind ?? 0)) : windStrengthFor(mode, level, gs.physics.stack.length),
    });
    // Camera eases after the tower's resting top; the sink animation settles the new piece
    {
      const st = gs.physics.stack;
      const restTop = st.length ? st[st.length - 1].x : 0;
      const camDt = Number.isFinite(dt) ? Math.max(0, dt) : 16;
      if (!Number.isFinite(gs.camX)) gs.camX = restTop;
      if (!Number.isFinite(gs.towerSink)) gs.towerSink = 0;
      gs.camX += (restTop - gs.camX) * Math.min(1, camDt * 0.004);
      gs.towerSink *= Math.exp(-camDt * 0.012);
      if (Math.abs(gs.towerSink) < 0.2) gs.towerSink = 0;
    }
    if (physResult.warningAlert && time - gs.lastWarningTime > 1100) {
      gs.lastWarningTime = time;
      audio.playTiltWarning();
    }
    // Teetering: a joint pushed past its edge by the sway only gives way if it stays past
    // the edge for a moment. If the swing comes back in time the tower survives.
    {
      const teeter = teeterStep(
        gs.teeterMs,
        Number.isFinite(dt) ? dt : 16,
        physResult.toppleLevel >= 0 && Math.abs(gs.physics.tiltAngle) < gs.physics.maxTiltAllowed && !isTutorialActive
      );
      gs.teeterMs = teeter.teeterMs;
      if (gs.teeterMs > 0 && !teeter.falls) {
        physResult.collapsed = false;
        if (teeter.started) {
          audio.playCreak();
          triggerHapticVibrate([25, 20, 25]);
          setMessage('TEETERING! HOLD YOUR BREATH… 😬');
          setTimeout(() => setMessage(''), 700);
          showTip('teeter', 'WOBBLE WARNING!', 'A crooked tower tips when it sways. Land the next pieces back over the centre to straighten it out.');
        }
      }
    }
    if (physResult.collapsed) {
      if (isTutorialActive) {
        gs.physics.tiltAngle = 0;
        gs.physics.angularVelocity = 0;
        return;
      }
      const cw = canvasSizeRef.current.w || 800;
      const ch = canvasSizeRef.current.h || 600;
      if (physResult.toppleLevel >= 0 && gs.physics.shieldActive) {
        // Aegis shield catches the section that tipped; the tower below survives
        const fallen = gs.physics.stack.splice(physResult.toppleLevel);
        spawnDebris(fallen, physResult.toppleLevel, cw, ch);
        gs.physics.shieldActive = false;
        onShieldBroken();
        gs.physics.angularVelocity = 0;
        gs.physics.tiltAngle *= 0.4;
        rebraceTower(gs.physics);
        useGameStore.getState().recordAchievementProgress('shieldUsed', 1);
        setTacticalCharges((c) => ({ ...c, shield: false }));
        audio.playShieldBreak();
        haptics.bombAbsorbedByShield();
        recorderRef.current.logEvent('shield', 'AEGIS SHIELD CAUGHT TOPPLE', '#38bdf8');
        useGameStore.getState().setTowerHeight(gs.physics.stack.length);
        setMessage(`AEGIS SHIELD SAVED THE DAY! -${fallen.length} PIECES`);
        setTimeout(() => setMessage(''), 1100);
      } else {
        // Everything above the failed joint (or the whole tower if it flexed too far) comes down
        const from = physResult.toppleLevel >= 0 ? physResult.toppleLevel : 0;
        const leanSide = gs.physics.comOffset !== 0 ? gs.physics.comOffset : gs.physics.tiltAngle;
        const fallen = gs.physics.stack.splice(from);
        creditGravity(physResult.toppleLevel >= 0 ? 'sway' : 'lean', from, leanSide, fallen);
        spawnDebris(fallen, from, cw, ch);
        gs.shake = Math.max(gs.shake, 30);
        audio.playCollisionSound(3.0, { type: 'crash' });
        triggerHapticVibrate([70, 35, 95, 45, 140]);
        haptics.towerCollapsed();
        recorderRef.current.logEvent('collapse', 'TOWER COLLAPSED', '#ef4444');
        gameOver(false, physResult.toppleLevel >= 0 ? 'TOWER TOPPLED! GRAVITY SAYS HI 👋' : 'TOWER COLLAPSED! TOO MUCH LEAN');
        return;
      }
    }

    // Sync HUD displays
    if (time - gs.lastUiUpdateTime > 70) {
      gs.lastUiUpdateTime = time;
      setTiltDisplay(gs.physics.tiltAngle);
      setStressDisplay(gs.physics.stressLevel);
      setTowerMood(gs.physics.stressLevel);
      useGameStore.getState().setTowerTilt(gs.physics.tiltAngle);
    }

    // Update Rapid Perfect Combo Multiplier Decay Timer
    if (gs.rapidPerfectStreak >= 2 && gs.lastPerfectTime > 0) {
      const elapsed = time - gs.lastPerfectTime;
      const remaining = Math.max(0, 4200 - elapsed);
      if (remaining <= 0) {
        audio.playRapidComboExpired();
        gs.rapidPerfectStreak = 0;
        gs.lastPerfectTime = 0;
        gs.rapidPerfectMultiplier = 1;
        setRapidComboData({
          streak: 0,
          multiplier: 1,
          timeRemaining: 0,
          duration: 4200,
          active: false,
        });
      } else if (time - (gs.lastMultiplierBroadcastTime || 0) > 40) {
        gs.lastMultiplierBroadcastTime = time;
        setRapidComboData((prev) => ({
          ...prev,
          timeRemaining: remaining,
          streak: gs.rapidPerfectStreak,
          multiplier: gs.rapidPerfectMultiplier,
          active: gs.rapidPerfectStreak >= 2,
        }));
      }
    }

    // Spawning logic
    if (gs.queue.length > 0) {
      const next = gs.queue[0];
      // Keep the sky readable: limit how many things are in the air and make sure no two
      // arrive at the tower top at nearly the same moment (they used to pile up in Endless)
      const inFlight = gs.blocks.filter((b) => !b.handled && b.distance > -HIT_WINDOW);
      const crowded = !canLaunch(inFlight, next.speed);
      if (!crowded && time - gs.lastSpawnTime > next.delay * 1000) {
        gs.queue.shift();
        gs.blocks.push({
          ...next,
          // Everything arrives from above or from the sides, never up from under the tower
          angle: Math.sin(next.angle) > 0.01 ? -next.angle : next.angle,
          distance: 120, // start off-screen
          spawnedAt: time,
          handled: false
        });
        if (next.modifier === 'fake-boom' || next.modifier === 'fake-build') {
          showTip('disguise', 'TRICKSTER ALERT!', 'Some bombs wear critter costumes (and critters dress up as bombs). Watch for the glitch: it shows the real face.');
        } else if (next.modifier === 'ghost') {
          showTip('ghost', 'SPOOKY GHOST!', 'It vanishes mid-flight but it is still coming. Tap when it pops back over the tower. Boo!');
        } else if (next.modifier === 'blink') {
          showTip('blink', 'BLINKY!', 'It flickers like a disco light. Look closely at what it really is before you tap.');
        }
        gs.lastSpawnTime = time;
      }
    }

    const w = canvasSizeRef.current.w || 800;
    const h = canvasSizeRef.current.h || 600;
    const gameRadius = Math.min(w, h) * 0.45;

    // Update blocks
    for (let i = gs.blocks.length - 1; i >= 0; i--) {
      const b = gs.blocks[i];
      
      const moveAmount = (100 / (b.speed * 1000)) * effectiveDt; 
      b.distance -= moveAmount;

      if (b.handled) continue;

      // In Quick-Start Guide: Bullet-time time dilation & sweet spot tracking
      if (isTutorialActive) {
        if (b.distance <= 15 && b.distance >= -6) {
          effectiveDt = dt * 0.22; // Comfortable bullet-time slow motion
          if (!sweetSpotActive) setSweetSpotActive(true);
        } else if (sweetSpotActive && (b.distance > 15 || b.distance < -6)) {
          setSweetSpotActive(false);
        }
      }

      // Subtle acoustic contact tick & haptic pulse when block enters landing perimeter
      if (!b.contactSoundPlayed && b.distance <= 15 && b.distance >= -5) {
        b.contactSoundPlayed = true;
        const bMass = getBlockMass(b);
        audio.playCollisionSound(bMass, { type: 'contact' });
        triggerHapticVibrate(10);
      }
      
      // Check missed BUILD
      if (b.type === 'build' && b.distance < -15) {
        if (isTutorialActive) {
          // QUICK-START GUIDE SAFETY EMERGENCY STASIS: Prevents Immediate Game-Over!
          b.distance = 0; // Hold at center sweet spot
          effectiveDt = 0; // Freeze motion until player taps
          setTutorialEmergencyHold(true);
          setSweetSpotActive(true);
          setMessage('SWEET SPOT! TAP NOW! 👆');
          continue;
        }
        b.handled = true;
        const bMass = getBlockMass(b);
        audio.playCollisionSound(bMass, { type: 'glance' });
        triggerHapticVibrate([65, 35, 85]);
        haptics.tooEarly();
        recorderRef.current.logEvent('boom', 'MISSED BLOCK', '#f59e0b', { mass: bMass });
        if (loseLife('MISSED! BYE BYE BUDDY 👋')) continue;
        gameOver(false, 'TOO LATE! THEY GOT AWAY 🏃');
        createExplosionAtDistance(b, gameRadius, w, h, '#f59e0b');
      }
      
      // Check cleared BOOM
      if (b.type === 'boom' && b.distance < -15) {
        b.handled = true; // safely passed
        const midasTier = unlockedPerks['midas_foundation'] || 0;
        if (midasTier >= 1) {
          useGameStore.getState().addCoins(2);
        }
        // Didn't fall for a bomb dressed up as a piece
        if (b.modifier === 'fake-build' && !isTutorialActive) {
          useGameStore.getState().addCoins(3);
          gs.floatTexts.push({ text: 'GOTCHA, SNEAKY BOMB! +3 🪙', x: w / 2, y: Math.max(150, arenaTopFor(w, h) - 4), life: 1, color: '#fb7185' });
        }
      }
    }
    
    // Cleanup handled blocks once they are well off screen
    gs.blocks = gs.blocks.filter(b => !b.handled || b.distance > -150);

    // Record continuous physics state frame for the rolling 10-second Game Replay
    recorderRef.current.record(
      time,
      gs.physics,
      gs.blocks,
      gs.builtCount,
      gs.combo,
      gs.shake,
      useGameStore.getState().score,
      message
    );

    // Check Win
    if (gs.queue.length === 0 && gs.blocks.every(b => b.handled)) {
      gameOver(true);
    }

    draw(time);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    }
  };

  interface HazardProximityResult {
    nearestBoom: ActiveBlock | null;
    distance: number;
    proximityRatio: number; // 0.0 (safe) to 1.0 (danger)
    boomPx: number;
    boomPy: number;
  }

  const findNearestBoomHazard = (
    blockPx: number,
    blockPy: number,
    allBlocks: ActiveBlock[],
    cx: number,
    cy: number,
    gameRadius: number
  ): HazardProximityResult => {
    let nearestBoom: ActiveBlock | null = null;
    let minDistance = Infinity;
    let nearestBoomPx = 0;
    let nearestBoomPy = 0;

    for (let i = 0; i < allBlocks.length; i++) {
      const other = allBlocks[i];
      if (other.handled) continue;
      // Real boom hazard check (standard boom or deceptive fake-build)
      const isRealBoom = (other.type === 'boom' && other.modifier !== 'fake-boom') || other.modifier === 'fake-build';
      if (!isRealBoom) continue;

      const boomPx = cx + Math.cos(other.angle) * (other.distance / 100) * gameRadius;
      const boomPy = cy + Math.sin(other.angle) * (other.distance / 100) * gameRadius;
      const dist = Math.hypot(blockPx - boomPx, blockPy - boomPy);

      if (dist < minDistance) {
        minDistance = dist;
        nearestBoom = other;
        nearestBoomPx = boomPx;
        nearestBoomPy = boomPy;
      }
    }

    // Detection threshold: 180px or 45% of gameRadius
    const hazardThreshold = Math.max(160, gameRadius * 0.45);
    const proximityRatio = minDistance < hazardThreshold
      ? Math.max(0, Math.min(1, 1 - (minDistance / hazardThreshold)))
      : 0;

    return {
      nearestBoom,
      distance: minDistance,
      proximityRatio,
      boomPx: nearestBoomPx,
      boomPy: nearestBoomPy,
    };
  };


  const draw = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d');
    }
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    const { w, h, dpr } = canvasSizeRef.current;
    if (!w || !h || w <= 0 || h <= 0 || !Number.isFinite(w) || !Number.isFinite(h)) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h * 0.65;
    const gameRadius = Math.min(w, h) * 0.45;
    const gs = gameStateRef.current;
    const { activeSkin, activePlate, activeBoom, activeWorldInfo } = activeCosmeticsRef.current;
    
    // Clear Canvas directly
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    
    // Dynamic Screen Shake (scales with stack height & boom impact)
    if (gs.shake > 0) {
      const shakeFactor = gs.shake;
      const dx = (Math.random() - 0.5) * shakeFactor;
      const dy = (Math.random() - 0.5) * shakeFactor;
      const rot = (Math.random() - 0.5) * (shakeFactor * 0.002);
      ctx.translate(dx, dy);
      ctx.rotate(rot);

      gs.shake *= 0.88;
      if (gs.shake < 0.4) {
        gs.shake = 0;
      }
    }

    // Chrono Stasis Chroma Overlay
    if (gs.physics.stasisActive && gameRadius > 5 && Number.isFinite(cx) && Number.isFinite(cy)) {
      ctx.save();
      const r0 = Math.max(0, gameRadius * 0.2);
      const r1 = Math.max(r0 + 5, gameRadius * 1.4);
      const stasisGrad = safeCreateRadialGradient(ctx, cx, cy, r0, cx, cy, r1);
      if (stasisGrad) {
        stasisGrad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
        stasisGrad.addColorStop(1, 'rgba(6, 182, 212, 0.28)');
        ctx.fillStyle = stasisGrad;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    }

    // Dynamic Combo Streak Energy Vignette Feedback
    if (gs.combo >= 3 && gameRadius > 5 && Number.isFinite(cx) && Number.isFinite(cy)) {
      ctx.save();
      const comboPulseAlpha = Math.min(0.22, (gs.combo - 2) * 0.035) * (0.8 + Math.sin(time / 120) * 0.2);
      const r0 = Math.max(0, gameRadius * 0.65);
      const r1 = Math.max(r0 + 5, gameRadius * 1.45);
      const vignetteGrad = safeCreateRadialGradient(ctx, cx, cy, r0, cx, cy, r1);
      if (vignetteGrad) {
        const comboHex = gs.combo >= 8 ? 'rgba(255, 215, 0,' : gs.combo >= 6 ? 'rgba(249, 115, 22,' : gs.combo >= 4 ? 'rgba(217, 70, 239,' : 'rgba(6, 182, 212,';
        vignetteGrad.addColorStop(0, `${comboHex} 0)`);
        vignetteGrad.addColorStop(1, `${comboHex} ${comboPulseAlpha})`);
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    }

    // Precision Optics & Tutorial: Trajectory Laser Alignment Guides
    const hasOptics = (unlockedPerks['precision_optics'] || 0) >= 1 || isTutorialActive;
    if (hasOptics) {
      gs.blocks.forEach((b) => {
        if (!b.handled && b.distance > 0) {
          ctx.save();
          ctx.strokeStyle = isTutorialActive 
            ? 'rgba(0, 255, 204, 0.75)' 
            : (b.type === 'boom' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.45)');
          ctx.lineWidth = isTutorialActive ? 2.5 : 1.5;
          ctx.setLineDash(isTutorialActive ? [8, 6] : [4, 6]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const px = cx + Math.cos(b.angle) * (b.distance / 100) * gameRadius;
          const py = cy + Math.sin(b.angle) * (b.distance / 100) * gameRadius;
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // Center Platform (Chunky Floating Island)
    let bounce = Math.sin(time / 200) * 3;
    const isSillyMode = useGameStore.getState().sillyMode;
    const impactElapsed = time - (gs.lastImpactTime || 0);

    // Silly Mode: Plate Trampoline Bounce on impact
    if (isSillyMode && gs.lastImpactTime > 0 && impactElapsed >= 0 && impactElapsed < 600) {
      const tNorm = impactElapsed / 600;
      const decay = Math.exp(-tNorm * 4.5);
      const plateDip = decay * Math.sin(tNorm * Math.PI * 4) * 12;
      bounce += plateDip;
    }

    // Landing Sweet-Spot Reticle
    const reticleRadius = (15 / 100) * gameRadius;
    const activeTargetBlock = gs.blocks.find(b => !b.handled);
    const inSweetSpot = activeTargetBlock && activeTargetBlock.distance <= 15 && activeTargetBlock.distance >= -15;

    const isHighContrastEnv = useGameStore.getState().visualTheme === 'high-contrast';
    const activePalette = getThemePalette(activeWorldInfo.worldIndex);

    ctx.save();
    if (inSweetSpot) {
      // Vivid Theme Accent Pulsing Reticle Ring
      ctx.strokeStyle = isHighContrastEnv ? '#ffff00' : (activePalette.accent || '#10b981');
      ctx.lineWidth = isHighContrastEnv ? 4.5 : 3.5;
      ctx.shadowColor = isHighContrastEnv ? '#ffff00' : (activePalette.glow || '#00ffcc');
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - 5, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing Sweet Spot Glow
      ctx.fillStyle = isHighContrastEnv ? 'rgba(255, 255, 0, 0.25)' : (activePalette.glow || 'rgba(16, 185, 129, 0.16)');
      ctx.fill();

      // Corner Crosshair Nodes
      for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 2) {
        const bx = cx + Math.cos(ang) * reticleRadius;
        const by = cy + bounce - 5 + Math.sin(ang) * reticleRadius;
        ctx.fillStyle = isHighContrastEnv ? '#ffff00' : (activePalette.accent || '#10b981');
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (isHighContrastEnv) {
      // High-Contrast Mode Target Crosshair & Circle
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - 5, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      const crossArm = reticleRadius + 10;
      ctx.beginPath();
      ctx.moveTo(cx - crossArm, cy + bounce - 5);
      ctx.lineTo(cx + crossArm, cy + bounce - 5);
      ctx.moveTo(cx, cy + bounce - 5 - crossArm);
      ctx.lineTo(cx, cy + bounce - 5 + crossArm);
      ctx.stroke();
    } else if (isTutorialActive) {
      // Instructional Animated Reticle Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - 5, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Contracting Countdown Timing Ring tracking incoming block
      if (activeTargetBlock && activeTargetBlock.distance > 15) {
        const countdownDist = Math.max(reticleRadius, (activeTargetBlock.distance / 100) * gameRadius);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy + bounce - 5, countdownDist, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // The plate is drawn the same width as the physical foundation the first object rests on.
    // It sits under the bottom of the tower and scrolls away below the screen as the tower grows.
    {
      const plateW = BASE_HALF_WIDTH * 2 + 16;
      const n = gs.physics.stack.length;
      const plateY = cy + (n + 1) * VISUAL_LAYER + gs.towerSink - BLOCK_HALF_WIDTH - 5;
      if (plateY < h + 10) {
        // The ground the plate stands on, so the tower lives in the world instead of floating in the sky
        drawForegroundTerrain(ctx, w, h, worldIndexFromBg(activeWorldInfo.worldId), plateY + bounce + 24, cx - gs.camX, time, plateW);
        renderPlate(ctx, cx - gs.camX - plateW / 2, plateY + bounce, plateW, 28, activePlate, time);
      }
    }

    // Rapid Perfect Multiplier Dynamic Canvas Resonance (off: the HUD streak chip shows this,
    // and rings around the landing point hid the swaying tower top)
    if (SHOW_LANDING_RESONANCE && gs.rapidPerfectStreak >= 2) {
      ctx.save();
      const multTier = Math.min(5, Math.max(2, gs.rapidPerfectMultiplier));
      const multColors: Record<number, string> = {
        2: '#22d3ee',
        3: '#facc15',
        4: '#e879f9',
        5: '#fb7185',
      };
      const resonanceColor = isHighContrastEnv ? '#ffff00' : (multColors[multTier] || '#22d3ee');
      const pulseRadius = reticleRadius + 16 + Math.sin(time / 140) * 5;

      ctx.strokeStyle = resonanceColor;
      ctx.lineWidth = isHighContrastEnv ? 3.5 : 2.5;
      ctx.shadowColor = resonanceColor;
      ctx.shadowBlur = isHighContrastEnv ? 0 : 22;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -time / 45;
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - 5, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Multiplier nodes orbiting plate
      const numNodes = multTier;
      for (let n = 0; n < numNodes; n++) {
        const nodeAngle = (time / 650) + (n * Math.PI * 2) / numNodes;
        const nx = cx + Math.cos(nodeAngle) * pulseRadius;
        const ny = cy + bounce - 5 + Math.sin(nodeAngle) * pulseRadius;
        ctx.fillStyle = resonanceColor;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Center Tower with Structural Dynamic Flexion
    // Each block is drawn where it physically rests, plus the tower's flex
    const stack = gs.physics.stack;
    const towerLayers = Math.min(stack.length, MAX_VISIBLE_LAYERS);
    const firstVisibleLayer = stack.length - towerLayers;
    const tiltRad = (gs.physics.tiltAngle * Math.PI) / 180;
    const weakLevel = gs.physics.weakestRatio > 0.7 ? gs.physics.weakestLevel : -1;

    for (let i = 0; i < towerLayers; i++) {
        const layerBlock = stack[firstVisibleLayer + i];
        const pose = towerPose(stack, firstVisibleLayer + i, gs.physics.tiltAngle, cx, cy);
        const hw = pose.hw;
        const layerTilt = pose.rot;
        if (pose.y - hw > h + 20) continue; // below the screen

        let squashX = 1;
        let squashY = (i === towerLayers - 1 && time - gs.lastSpawnTime < 200) ? 0.8 : 1;
        let wiggleAngle = 0;

        // Silly Mode: cartoon squish, stretch & wiggle on impact (visual only; physics is unaffected)
        if (isSillyMode && gs.lastImpactTime > 0 && impactElapsed >= 0 && impactElapsed < 750) {
          const tNorm = impactElapsed / 750;
          const decay = Math.exp(-tNorm * 4.2);
          const osc = Math.sin(tNorm * Math.PI * 6);
          const isTopBlock = i === towerLayers - 1;
          const layerInfluence = isTopBlock ? 1.0 : Math.pow(0.75, (towerLayers - 1 - i));
          squashX = 1 + (decay * osc * 0.42 * layerInfluence);
          squashY = 1 - (decay * osc * 0.38 * layerInfluence);
          wiggleAngle = decay * Math.sin(tNorm * Math.PI * 8) * 0.22 * layerInfluence;
        }
        
        ctx.save();
        ctx.translate(pose.x, pose.y + bounce);
        ctx.rotate(layerTilt + wiggleAngle);
        ctx.scale(squashX, squashY);
        
        // Soft contact shadow where this piece rests on the one below (grounds the stack visually)
        {
          const cs = ctx.createRadialGradient(0, hw * 0.92, 2, 0, hw * 0.92, hw * 0.95);
          cs.addColorStop(0, 'rgba(15,8,25,0.32)');
          cs.addColorStop(1, 'rgba(15,8,25,0)');
          ctx.fillStyle = cs;
          ctx.beginPath(); ctx.ellipse(0, hw * 0.92, hw * 0.95, hw * 0.28, 0, 0, Math.PI * 2); ctx.fill();
        }
        renderBlock(ctx, -hw, -hw, hw * 2, hw * 2, activeSkin, true, time, layerBlock?.archetype);

        // Glow the joint that is closest to giving way
        if (firstVisibleLayer + i === weakLevel && !gs.isGameOver) {
          const danger = Math.min(1, (gs.physics.weakestRatio - 0.7) / 0.3);
          ctx.strokeStyle = `rgba(255, ${Math.round(160 - danger * 120)}, 40, ${0.45 + 0.5 * Math.abs(Math.sin(time / 90))})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, hw + 3, hw + 3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
    }

    // Wind: streaks blowing across the screen plus a labelled arrow
    const windForce = gs.physics.wind.force;
    if (Math.abs(windForce) > 0.04) {
      const dir = windForce > 0 ? 1 : -1;
      const strength = Math.min(1, Math.abs(windForce));
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${0.12 + strength * 0.25})`;
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 14; k++) {
        const speed = 0.25 + strength * 0.9;
        const span = w + 200;
        const px = ((k * 137 + time * speed * (0.8 + (k % 3) * 0.2)) % span) - 100;
        const sx = dir > 0 ? px : w - px;
        const sy = h * 0.12 + ((k * 89) % Math.max(1, Math.floor(h * 0.7)));
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - dir * (24 + strength * 50), sy);
        ctx.stroke();
      }
      // label
      const label = `WIND ${dir > 0 ? '→' : '←'} ${strength > 0.66 ? 'STRONG' : strength > 0.33 ? 'MEDIUM' : 'LIGHT'}`;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const lw = ctx.measureText(label).width + 20;
      ctx.fillStyle = 'rgba(2,6,23,0.6)';
      ctx.beginPath();
      // Chip sits low on the left, beside the tower and clear of the toasts above the arena
      const wy = Math.min(h - 120, cy + 70);
      ctx.roundRect(12, wy - 14, lw, 24, 12);
      ctx.fill();
      ctx.fillStyle = strength > 0.66 ? '#fca5a5' : strength > 0.33 ? '#fde68a' : '#e2e8f0';
      ctx.fillText(label, 12 + lw / 2, wy + 3);
      ctx.restore();
    }

    // Debris from blocks that fell off: gravity, drag and spin
    for (let i = gs.debris.length - 1; i >= 0; i--) {
      const d = gs.debris[i];
      d.vy += 0.45;
      d.vx *= 0.995;
      d.x += d.vx;
      d.y += d.vy;
      d.rot += d.vr;
      if (d.y > h + 80) {
        gs.debris.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(d.x, d.y + bounce);
      ctx.rotate(d.rot);
      renderBlock(ctx, -d.halfWidth, -d.halfWidth, d.halfWidth * 2, d.halfWidth * 2, activeSkin, true, time, d.archetype, 'falling');
      ctx.restore();
    }

    // Aegis Shield Kinetic Barrier Bubble
    if (gs.physics.shieldActive) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.beginPath();
      ctx.arc(cx, cy + bounce + 30, 74, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulsing energy resonance
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy + bounce + 30, 76 + Math.sin(time / 140) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Blocks
    gs.blocks.forEach(b => {
      if (b.handled && b.type === 'build') return;

      let apparentType = b.type;
      let opacity = 1.0;

      // Disguised blocks (Slow-Mo tier 3 shows them as they really are while slow-mo is on)
      const trueSight = gs.physics.stasisActive && (unlockedPerks['chrono_stasis'] || 0) >= 3;
      const isDisguise = b.modifier === 'fake-boom' || b.modifier === 'fake-build';
      let flipScale = 1;
      let tellJitter = 0;
      if (!trueSight) {
        if (b.modifier === 'fake-boom' && b.distance > 65) apparentType = 'boom';
        if (b.modifier === 'fake-build' && b.distance > 65) apparentType = 'build';
        if (b.modifier === 'ghost' && b.distance < 80 && b.distance > 20) opacity = 0.05;
        if (b.modifier === 'blink' && Math.floor(time / 80) % 2 === 0) opacity = 0.1;
        // The tell: a disguise can't hold perfectly. Roughly once a second it glitches and
        // shows its true face for a split second; sharp-eyed players can call it early.
        if (isDisguise && b.distance > 65) {
          const phase = (time + (b.id ?? 0) * 397) % 1100;
          if (phase < 70) apparentType = b.type;
          if (phase < 160) tellJitter = Math.sin(time * 0.9) * 2.5;
        }
      }
      // The reveal: when a disguise drops it flips like a card, with a pop
      if (isDisguise && b.distance <= 65 && !b.handled) {
        if (b.revealedAt === undefined) {
          b.revealedAt = time;
          if (!trueSight) {
            const rx = cx + Math.cos(b.angle) * (b.distance / 100) * gameRadius;
            const ry = cy + Math.sin(b.angle) * (b.distance / 100) * gameRadius;
            gs.particles.push({ x: rx, y: ry, vx: 0, vy: 0, life: 1, color: b.type === 'boom' ? '#ff3355' : '#00ffcc', size: 14, type: 'ring' });
          }
        }
        const t = (time - b.revealedAt) / 260;
        if (t < 1 && !trueSight) {
          flipScale = Math.abs(Math.cos(t * Math.PI));
          if (t < 0.5) apparentType = b.type === 'boom' ? 'build' : 'boom';
        }
      }
      
      // Fade out passed bombs as they fly away
      if (b.handled && apparentType === 'boom') {
          opacity *= Math.max(0, 1 - ((-15 - b.distance) / 80));
      }

      const color = apparentType === 'build' ? '#00ffcc' : '#ff0055';
      const px = cx + Math.cos(b.angle) * (b.distance / 100) * gameRadius;
      const py = cy + Math.sin(b.angle) * (b.distance / 100) * gameRadius;

      ctx.globalAlpha = opacity;

      ctx.save();
      ctx.translate(px + tellJitter, py);
      if (flipScale !== 1) ctx.scale(Math.max(0.06, flipScale), 1);
      
      // Speed-based squash and stretch
      const stretch = 1 + (b.speed * 0.1);
      
      let flightWiggle = 0;
      let flightScalePulse = 1;
      if (isSillyMode && apparentType === 'build') {
        // Creative objects (bees, snowflakes) flutter & wiggle playfully in flight!
        flightWiggle = Math.sin((time * 0.02) + (b.angle * 3)) * 0.18;
        flightScalePulse = 1 + Math.sin(time * 0.015 + (b.angle * 2)) * 0.12;
      }

      if (apparentType === 'build') {
          ctx.rotate(flightWiggle);
          ctx.scale(flightScalePulse, flightScalePulse);
          renderBlock(ctx, -21, -21, 42, 42, activeSkin, false, time, b.archetype);
          if (isHighContrastEnv) {
            ctx.save();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
      } else {
          const stretch = 1 + (b.speed * 0.1);
          ctx.rotate(b.angle);
          ctx.scale(stretch, 1 / stretch);
          renderBoomParticle(ctx, { x: 0, y: 0, rotation: 0, life: 1, size: 18, type: 'projectile' }, time, activeBoom);
          if (isHighContrastEnv) {
            ctx.save();
            ctx.strokeStyle = '#ff0033';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
      }
      ctx.restore();

      ctx.globalAlpha = 1.0;

      // Spawning Trails
      if (Math.random() < (lowFxRef.current ? 0.12 : 0.4) && opacity > 0.5) {
          gs.particles.push({
              x: px, y: py,
              vx: -Math.cos(b.angle) * 3 + (Math.random()-0.5),
              vy: -Math.sin(b.angle) * 3 + (Math.random()-0.5),
              life: 1.0, color, size: Math.random() * 3 + 1, type: 'trail'
          });
      }
    });
    
    // Draw particles
    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const p = gs.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      
      if (p.life <= 0) {
        gs.particles.splice(i, 1);
        continue;
      }
      
      if (p.type === 'trail' || p.type === 'spark') {
        // Flight trails and landing sparks are simple glowing dots so they never hide the
        // swaying tower top, the landing guide or the bombs
        ctx.globalAlpha = Math.max(0, p.life) * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }
      if (p.type === 'ring') {
        // Shockwave rings stay as thin outlines so the landing point remains readable
        ctx.globalAlpha = Math.max(0, p.life) * 0.8;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (1 - p.life) * 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        continue;
      }
      // Bursts use the world's themed particle art
      renderBoomParticle(ctx, { x: p.x, y: p.y, rotation: Math.atan2(p.vy, p.vx), life: p.life, size: p.size, color: p.color, type: p.type }, time, activeBoom);
    }
    // Landing guide: where the incoming block would settle if tapped right now. The dashed line
    // is the centre of the top of the tower; it swings with the sway, so tap when the ghost is green.
    const guideTarget = gs.isGameOver ? null : gs.blocks.reduce<ActiveBlock | null>((c, b) => (!b.handled && (!c || b.distance < c.distance) ? b : c), null);
    if (guideTarget && guideTarget.type !== 'boom' && guideTarget.distance <= HIT_WINDOW + 25 && guideTarget.distance > -HIT_WINDOW) {
      const ghw = blockHalfWidth(guideTarget.archetype);
      const land = landingOffsetFor(guideTarget);
      const isTitan = guideTarget.archetype === 'titan';
      const offset = isTitan ? 0 : land.offset;
      const top = stack.length ? towerPose(stack, stack.length - 1, gs.physics.tiltAngle, cx, cy) : null;
      const topHalf = top ? top.hw : BASE_HALF_WIDTH;
      const surfaceX = cx + land.sway;
      const gy = cy + gs.towerSink + (top ? 0 : VISUAL_LAYER * 0.5);
      const inWindow = guideTarget.distance <= HIT_WINDOW;
      const risk = Math.abs(offset) / topHalf;
      const col = risk < 0.3 ? '0, 255, 204' : risk < 0.7 ? '250, 204, 21' : '255, 64, 64';
      ctx.save();
      // centre line of the surface below, following the swaying top
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(surfaceX, gy - ghw - 14);
      ctx.lineTo(surfaceX, gy + ghw + 10);
      ctx.stroke();
      ctx.setLineDash([]);
      // marker on the top of the tower: it rides the sway, so players can see it swing
      ctx.fillStyle = `rgb(${col})`;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const surfaceY = gy + (top ? VISUAL_LAYER - topHalf : ghw) + bounce;
      ctx.moveTo(surfaceX, surfaceY + 2);
      ctx.lineTo(surfaceX - 7, surfaceY - 9);
      ctx.lineTo(surfaceX + 7, surfaceY - 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // ghost of the predicted landing
      ctx.translate(surfaceX + offset, gy + bounce);
      ctx.rotate(top ? top.rot : 0);
      ctx.globalAlpha = inWindow ? 0.9 : 0.45;
      ctx.strokeStyle = `rgb(${col})`;
      ctx.fillStyle = `rgba(${col}, 0.14)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-ghw, -ghw, ghw * 2, ghw * 2, ghw * 0.45);
      ctx.fill();
      ctx.stroke();
      // Shape cue as well as colour, for colour-blind players: ✓ safe, ~ wobbly, ✕ will slide off
      ctx.font = `900 ${Math.round(ghw * 0.9)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      const glyph = risk < 0.3 ? '✓' : risk < 0.7 ? '~' : '✕';
      ctx.strokeText(glyph, 0, 1);
      ctx.fillStyle = `rgb(${col})`;
      ctx.fillText(glyph, 0, 1);
      ctx.restore();
    }

    // Your best endless tower: a flag line up ahead to chase
    if (mode === 'endless' && !gs.recordAnnounced) {
      const best = useGameStore.getState().highScores['tower-endless'] || 0;
      const n = gs.physics.stack.length;
      if (best >= 5 && best > n) {
        const y = cy + (n - best + 1) * VISUAL_LAYER + gs.towerSink - BLOCK_HALF_WIDTH;
        if (y > 90 && y < h - 40) {
          ctx.save();
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
          ctx.setLineDash([8, 6]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 90, y);
          ctx.lineTo(cx + 90, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '900 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(0,0,0,0.7)';
          ctx.strokeText(`🏆 YOUR BEST: ${best}`, cx, y - 7);
          ctx.fillStyle = '#fde047';
          ctx.fillText(`🏆 YOUR BEST: ${best}`, cx, y - 7);
          ctx.restore();
        }
      }
    }

    // Trick rewards float up from the landing point
    for (let i = gs.floatTexts.length - 1; i >= 0; i--) {
      const f = gs.floatTexts[i];
      f.life -= 0.014;
      f.y -= 0.6;
      if (f.life <= 0) { gs.floatTexts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.font = '900 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    // Keep the screen readable (and the frame rate steady): drop the oldest particles past a cap
    const particleCap = lowFxRef.current ? 60 : 140;
    if (gs.particles.length > particleCap) gs.particles.splice(0, gs.particles.length - particleCap);

    // Physical Tactile Response for Nearby Boom Hazards (Vibration API)
    if (state === 'playing' && !gs.isGameOver) {
      let maxHazardProximity = 0;

      // 1. Check proximity of boom hazards to active target building block
      if (activeTargetBlock && !activeTargetBlock.handled && activeTargetBlock.distance > -15) {
        const targetPx = cx + Math.cos(activeTargetBlock.angle) * (activeTargetBlock.distance / 100) * gameRadius;
        const targetPy = cy + Math.sin(activeTargetBlock.angle) * (activeTargetBlock.distance / 100) * gameRadius;
        const targetHazard = findNearestBoomHazard(targetPx, targetPy, gs.blocks, cx, cy, gameRadius);
        if (targetHazard.proximityRatio > maxHazardProximity) {
          maxHazardProximity = targetHazard.proximityRatio;
        }
      }

      // 2. Check proximity of boom hazards to the tower receptor top deck
      if (towerLayers > 0) {
        const topPose = towerPose(gs.physics.stack, gs.physics.stack.length - 1, gs.physics.tiltAngle, cx, cy);
        const topPx = topPose.x;
        const topPy = topPose.y - topPose.hw;
        const towerHazard = findNearestBoomHazard(topPx, topPy, gs.blocks, cx, cy, gameRadius);
        if (towerHazard.proximityRatio > maxHazardProximity) {
          maxHazardProximity = towerHazard.proximityRatio;
        }
      }

      let currentTier: 'safe' | 'caution' | 'critical' | 'imminent' = 'safe';
      let pulseInterval = 1200;

      if (maxHazardProximity >= 0.80) {
        currentTier = 'imminent';
        pulseInterval = 380;
      } else if (maxHazardProximity >= 0.55) {
        currentTier = 'critical';
        pulseInterval = 650;
      } else if (maxHazardProximity >= 0.25) {
        currentTier = 'caution';
        pulseInterval = 1100;
      }

      const tierEscalated = currentTier !== 'safe' && (
        (currentTier === 'imminent' && lastHazardTierRef.current !== 'imminent') ||
        (currentTier === 'critical' && lastHazardTierRef.current === 'caution') ||
        (currentTier === 'caution' && lastHazardTierRef.current === 'safe')
      );
      const intervalElapsed = time - lastHazardHapticTimeRef.current >= pulseInterval;

      if (currentTier !== 'safe' && (tierEscalated || intervalElapsed)) {
        lastHazardHapticTimeRef.current = time;
        lastHazardTierRef.current = currentTier;
        haptics.hazardNearby(maxHazardProximity);

        // Acoustic warning on critical or imminent entry
        if ((currentTier === 'critical' || currentTier === 'imminent') && time - lastHazardAlertTimeRef.current > 1400) {
          lastHazardAlertTimeRef.current = time;
          audio.playTiltWarning();
        }
      } else if (currentTier === 'safe' && lastHazardTierRef.current !== 'safe') {
        lastHazardTierRef.current = 'safe';
      }
    }
    
    ctx.globalAlpha = 1.0;
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        triggerStasis();
      } else if (e.code === 'KeyW') {
        e.preventDefault();
        triggerEmp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, unlockedPerks]);

  return (
    <motion.div 
      variants={screenFadeSlideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full h-full flex flex-col select-none overflow-hidden"
      style={worldTheme.cssVariables}
    >
      {/* Cinematic Stage Entry Shutter */}
      <LevelStageShutter />

      {/* Holographic Level Mission Intro Banner */}
      <LevelIntroBanner level={level} mode={mode} totalBlocks={totalBlocks} />

      {/* Cinematic Sci-Fi Level Warp Transition */}
      <LevelWarpCurtain
        isActive={warpTransition.isActive}
        fromLevel={warpTransition.fromLevel}
        toLevel={warpTransition.toLevel}
        onTransitionComplete={handleWarpComplete}
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280, delay: 0.08 }}
        className="absolute top-0 left-0 w-full pt-[max(0.75rem,env(safe-area-inset-top,12px))] px-3 sm:px-4 md:px-6 flex justify-between items-start z-10 pointer-events-none"
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => {
              try {
                const replay = recorderRef.current.finalize({
                  mode,
                  level,
                  finalOutcome: 'aborted',
                  finalReason: 'EXITED RUN',
                  equippedCosmetic: activeSkin,
                  equippedPlate: activePlate,
                  equippedBackground: activeWorldInfo.worldId,
                  activeBoom,
                });
                if (replay) {
                  useGameStore.getState().setLastReplay(replay);
                }
              } catch (e) {}

              useGameStore.getState().checkAndTriggerAd(false);
              setState('idle');
              if (mode === 'tournament') {
                useGameStore.getState().setMode('tournament');
              } else if (mode === 'workshop') {
                useGameStore.getState().setMode('workshop');
              } else if (mode !== 'campaign') {
                useGameStore.getState().setMode('menu');
              }
            }}
            className="toon-sm w-12 h-12 rounded-full bg-[var(--cream)] text-[var(--ink)] flex items-center justify-center cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Sound, vibration and Silly Mode toggles live in Settings, keeping the HUD to one row on phones */}
          {/* Quick Settings Button */}
          <button
            onClick={() => {
              useGameStore.getState().setSettingsModalOpen(true);
            }}
            className="toon-sm w-12 h-12 rounded-full bg-[var(--cream)] text-[var(--ink)] flex items-center justify-center cursor-pointer"
            aria-label="Open Settings"
          >
            <Settings className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Centre: boss bar and streak (the tower itself shows its lean, no gauge needed) */}
        <div className="flex flex-col items-center pointer-events-none min-w-0 max-w-[170px] sm:max-w-xs pt-1" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
          {isBossLevel && (
            <div className="toon-sm px-2.5 py-1 rounded-2xl bg-[#F47759] text-center">
              <div className="font-game text-[13px] text-white leading-none whitespace-nowrap">👑 Boss</div>
              <div className="w-20 sm:w-36 h-2.5 bg-[var(--ink)]/40 rounded-full mt-1 overflow-hidden border-2 border-[var(--ink)]">
                <div
                  className="h-full bg-[#E8BE70] transition-all duration-300"
                  style={{ width: `${Math.max(0, 100 - (builtCount / Math.max(1, totalBlocks)) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {(rapidComboData.active || activeCombo >= 3) && (
            <div className={`toon-sm mt-1.5 px-3 py-0.5 rounded-full font-game text-[15px] whitespace-nowrap text-[var(--ink)] ${rapidComboData.active ? 'bg-[#E8BE70]' : 'bg-[var(--cream)]'}`}>
              {rapidComboData.active ? `⚡ ${rapidComboData.multiplier}x streak!` : `🔥 ${activeCombo} combo`}
            </div>
          )}
        </div>

        {/* Right: Score, Level Header & Performance Telemetry Monitor */}
        <div className="text-right pointer-events-none flex flex-col items-end gap-1">
          {/* Lightweight Frame-Rate & Memory Telemetry Monitor */}
          <div className="pointer-events-auto">
            {import.meta.env.DEV && <PerformanceMonitor className="relative z-40" />}
          </div>

          <div className="font-game toon-text-sm text-[15px] flex items-center justify-end gap-1.5 mt-0.5 whitespace-nowrap">
            {mode === 'tournament' ? (
              <span className="flex items-center gap-1 text-yellow-300">
                <Trophy className="w-4 h-4 text-yellow-300" />
                {useGameStore.getState().activeTournament?.title || 'TOURNAMENT'}
              </span>
            ) : mode === 'workshop' ? (
              <span>Shift Forge</span>
            ) : mode === 'campaign' ? (
              TWIST_INFO[levelTwist(level)].label && levelTwist(level) !== 'boss' ? `Level ${level} · ${TWIST_INFO[levelTwist(level)].label}` : `Level ${level}`
            ) : mode === 'endless' ? 'Endless' : mode === 'daily' ? 'Daily Ops' : (
              mode
            )}
          </div>
          <div className="font-game toon-text text-5xl tabular-nums leading-none">
            {score}
          </div>
          {!isTutorialActive && (
            <div className="flex items-center gap-0.5 text-[22px] leading-none" aria-label={`${livesLeft} of ${MAX_LIVES} hearts left`}>
              {Array.from({ length: MAX_LIVES }, (_, i) => (
                <span key={i} style={{ WebkitTextStroke: '2.5px var(--ink)', paintOrder: 'stroke fill' }} className={i < livesLeft ? 'text-[#F47759]' : 'text-white/60'}>♥</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Game Area */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full relative cursor-pointer touch-none select-none"
        style={{ ...worldTheme.cssVariables, touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={(e) => {
          if (e.cancelable) e.preventDefault();
          if (motionSway && !motionPermissionAskedRef.current) {
            // iOS only lets a tap ask for the motion sensor; elsewhere this is a no-op
            motionPermissionAskedRef.current = true;
            requestMotionPermission().then((ok) => ok && startDeviceMotion());
          }
          handleAction();
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
        
        {/* Floating Multiplier Feedback Badges */}
        {floatingMultipliers.map((item) => (
          <FloatingScoreMultiplierItem
            key={item.id}
            item={item}
            onComplete={(id) => {
              setFloatingMultipliers((prev) => prev.filter((m) => m.id !== id));
            }}
          />
        ))}
        
        {/* Floating Tactical Arsenal Pods (Bottom Corners with Home Indicator Safe Area) */}
        <div className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,12px))] left-[max(0.75rem,env(safe-area-inset-left,12px))] right-[max(0.75rem,env(safe-area-inset-right,12px))] flex items-end justify-between pointer-events-none z-20">
          {/* Tactical Gadgets (Left) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Chrono Stasis */}
            <button
              onClick={(e) => { e.stopPropagation(); triggerStasis(); }}
              onTouchStart={(e) => { e.stopPropagation(); triggerStasis(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`toon-sm relative w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer ${gameStateRef.current.physics.stasisActive ? 'bg-[#35D6C1] animate-pulse' : 'bg-[#F5F0E6]'}`}
              title="Chrono Stasis (Q)"
              aria-label={`Chrono Stasis, ${tacticalCharges.stasis} left`}
            >
              ⏳
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-white border-2 border-[var(--ink)] font-game text-[12px] text-[var(--ink)] flex items-center justify-center">
                {tacticalCharges.stasis > 0 ? tacticalCharges.stasis : '+'}
              </span>
            </button>

            {/* EMP */}
            <button
              onClick={(e) => { e.stopPropagation(); triggerEmp(); }}
              onTouchStart={(e) => { e.stopPropagation(); triggerEmp(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="toon-sm relative w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer bg-[#F5F0E6]"
              title="EMP (W)"
              aria-label={`EMP, ${tacticalCharges.emp} left`}
            >
              ⚡
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-white border-2 border-[var(--ink)] font-game text-[12px] text-[var(--ink)] flex items-center justify-center">
                {tacticalCharges.emp > 0 ? tacticalCharges.emp : '+'}
              </span>
            </button>
          </div>

          {/* AEGIS SHIELD STATUS POD (Right), with the coin count stacked above it so the
              bottom centre stays clear for the tower */}
          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <div className="toon-sm pointer-events-none flex items-center gap-1.5 bg-[var(--cream)] pl-1 pr-3 py-0.5 rounded-full">
              <span className="w-6 h-6 rounded-full bg-[#E8BE70] border-2 border-[var(--ink)] flex items-center justify-center"><Coins className="w-3.5 h-3.5 text-[var(--ink)]" /></span>
              <span className="font-game text-[15px] tabular-nums text-[var(--ink)]">
                {coins.toLocaleString()}
              </span>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (tacticalCharges.shield) {
                  setMessage('AEGIS BARRIER IS ALREADY UP! 🛡️');
                  setTimeout(() => setMessage(''), 800);
                  return;
                }
                const storePowerups = useGameStore.getState().powerups;
                if (storePowerups.shield > 0) {
                  useGameStore.getState().consumePowerup('shield');
                  gameStateRef.current.physics.shieldActive = true;
                  gameStateRef.current.physics.shieldCharges += 1;
                  setTacticalCharges((c) => ({ ...c, shield: true }));
                  audio.playBuildSound(1.5);
                  haptics.shieldActivated();
                  setMessage('AEGIS BARRIER UP! 🛡️');
                  setTimeout(() => setMessage(''), 1000);
                } else {
                  audio.playTiltWarning();
                  setMessage('NO BARRIERS LEFT! GRAB ONE IN THE ARSENAL');
                  setTimeout(() => setMessage(''), 900);
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`toon-sm relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer ${tacticalCharges.shield ? 'bg-[#35D6C1]' : 'bg-[#F5F0E6]'}`}
              title="Aegis Barrier"
              aria-label={tacticalCharges.shield ? 'Aegis Barrier is up' : `Aegis Barrier, ${useGameStore.getState().powerups.shield} left`}
            >
              <Shield className="w-7 h-7 text-[var(--ink)] stroke-[2.5]" fill={tacticalCharges.shield ? '#ffffff' : 'none'} />
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-white border-2 border-[var(--ink)] font-game text-[12px] text-[var(--ink)] flex items-center justify-center">
                {tacticalCharges.shield ? '✓' : (useGameStore.getState().powerups.shield || '+')}
              </span>
            </button>
          </div>
        </div>

        {/* First-time tip card (the run plays in slow motion while it shows) */}
        <AnimatePresence>
          {tipCard && state === 'playing' && (
            <motion.div
              key={tipCard.title}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`absolute pointer-events-none z-30 ${
                arenaTop - 104 < 130
                  ? 'left-3 right-[92px]' // short screens: tuck it left so the score and hearts stay visible
                  : 'left-1/2 -translate-x-1/2 w-[min(320px,88vw)]'
              }`}
              // Bottom edge pinned just above the arena, so however tall the card wraps it grows upward
              style={{ bottom: Math.max(0, boardH - Math.min(arenaTop - 6, 268)) }}
            >
              <div className="toon-sm rounded-2xl bg-[var(--cream)] px-4 py-2.5 text-center" style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
                <div className="font-game text-[15px] text-[#F47759]">💡 {tipCard.title}</div>
                <div className="mt-0.5 text-[14px] font-semibold leading-snug text-[var(--ink)]">{tipCard.body}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-blocking in-game HUD feedback toasts (positioned cleanly at top, never covering the center playfield) */}
        <AnimatePresence>
          {message && state === 'playing' && (!tipCard || Math.min(132, arenaTop - 44) + 40 <= Math.min(172, arenaTop - 104)) && (
            <motion.div 
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center w-max max-w-[92vw]"
              style={{ top: Math.max(8, Math.min(132, arenaTop - 44)) }}
            >
              <div className="toon-sm px-4 py-1 rounded-full bg-[#E8BE70] flex items-center gap-2">
                <span className="font-game text-[15px] text-[var(--ink)] text-center">
                  {message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick-Start Guide Top HUD Progression */}
        {isTutorialActive && state === 'playing' && (
          <div className="absolute top-14 sm:top-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-3 z-30 pointer-events-none select-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#160E2A]/90 backdrop-blur-md border-2 border-amber-400/80 rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.85)] pointer-events-auto"
            >
              {/* Header with Step Dots */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-300">
                    CAMPAIGN FLIGHT TRAINING
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px]">
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-bold border transition-all ${
                    tutorialStep >= 1 
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/10 border-white/20 text-white/40'
                  }`}>
                    1: TIMING
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-bold border transition-all ${
                    tutorialStep >= 2 
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                      : 'bg-white/10 border-white/20 text-white/40'
                  }`}>
                    2: ANGLE
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-bold border transition-all ${
                    tutorialStep >= 3 
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                      : 'bg-white/10 border-white/20 text-white/40'
                  }`}>
                    3: STACK
                  </span>
                </div>
              </div>

              {/* Dynamic Guidance Instruction */}
              <p className="text-xs font-black text-white leading-snug drop-shadow">
                {tutorialStep === 1 && (
                  <>
                    <span className="text-emerald-300 font-bold">Step 1/3:</span> Watch the block descend. Tap anywhere on the screen <strong className="text-emerald-300 underline underline-offset-2">only</strong> when it enters the green circle!
                  </>
                )}
                {tutorialStep === 2 && (
                  <>
                    <span className="text-cyan-300 font-bold">Step 2/3:</span> Angled trajectory incoming! Follow the cyan laser line and tap inside the sweet spot.
                  </>
                )}
                {tutorialStep >= 3 && (
                  <>
                    <span className="text-amber-300 font-bold">Step 3 of 3:</span> Foundation equilibrium! Stack this final block cleanly to secure Architect Certification.
                  </>
                )}
              </p>

              {/* Status and Skip option */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
                <span className="text-[10px] text-amber-200/80 font-mono">
                  {tutorialEmergencyHold ? '⚡ Stasis locked! Tap to place' : '🛡️ Safety dampeners active'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    completeCampaignTutorial();
                    initGame();
                  }}
                  className="text-[10px] text-white/50 hover:text-white/80 font-mono uppercase underline cursor-pointer"
                >
                  Skip Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Post Game Overlay - Bottom Center Sheet or EndOfLevelSummary for Campaign */}
      <AnimatePresence>
        {state === 'won' && mode === 'campaign' && summaryMetrics ? (
          <EndOfLevelSummary
            metrics={summaryMetrics}
            canRetry={(useGameStore.getState().highScores[`stars-${level}`] || 0) < 3}
            onNextLevel={() => {
              if (gameOverTimeoutRef.current) {
                clearTimeout(gameOverTimeoutRef.current);
                gameOverTimeoutRef.current = null;
              }
              const currentLvl = level;
              const nextLvl = Math.min(200, currentLvl + 1);
              if (pendingCoins > 0) {
                useGameStore.getState().addCoins(pendingCoins);
                useGameStore.getState().setPendingCoins(0);
              }
              setSummaryMetrics(null);
              // Finishing a world goes back to the map, where the next world unlocks with fanfare
              if (currentLvl % 10 === 0 && currentLvl < 200) {
                useGameStore.getState().setState('idle');
                return;
              }
              setWarpTransition({
                isActive: true,
                fromLevel: currentLvl,
                toLevel: nextLvl,
              });
            }}
            onRetry={() => {
              if (gameOverTimeoutRef.current) {
                clearTimeout(gameOverTimeoutRef.current);
                gameOverTimeoutRef.current = null;
              }
              if (pendingCoins > 0) {
                useGameStore.getState().addCoins(pendingCoins);
                useGameStore.getState().setPendingCoins(0);
              }
              setScore(0);
              setSummaryMetrics(null);
              setState('playing');
              initGame(level);
            }}
            onHome={() => {
              if (gameOverTimeoutRef.current) {
                clearTimeout(gameOverTimeoutRef.current);
                gameOverTimeoutRef.current = null;
              }
              if (pendingCoins > 0) {
                useGameStore.getState().addCoins(pendingCoins);
                useGameStore.getState().setPendingCoins(0);
              }
              useGameStore.getState().checkAndTriggerAd(false);
              setSummaryMetrics(null);
              setState('idle');
            }}
            onWatchDoubleCoins={() => {
              useGameStore.getState().showDoubleCoinsAd();
            }}
            onViewReplay={() => {
              setIsViewingReplay(true);
            }}
            hasReplay={!!savedReplayData}
          />
        ) : !warpTransition.isActive && (state === 'won' || state === 'lost') && (
          <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto" />

            {/* Bottom Center Results Card - leaves upper tower and skyline visible */}
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`result-card ${state === 'lost' ? 'is-defeat' : 'is-victory'} relative w-full max-w-md p-5 sm:p-6 rounded-t-[28px] sm:rounded-[28px] flex flex-col items-center pointer-events-auto z-10 touch-pan-y max-h-[85vh] overflow-y-auto`}
            >
              {/* Grab Handle */}
              <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 shrink-0" />
            {mode === 'tournament' ? (
              <motion.div 
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="flex flex-col items-center w-full max-w-sm bg-[#190E2D] border-4 border-yellow-400 p-5 rounded-3xl shadow-2xl text-center text-white"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-7 h-7 text-yellow-400" />
                  <span className="text-xl font-black uppercase text-yellow-300">
                    TOURNAMENT FINISHED
                  </span>
                </div>

                <div className="text-[11px] text-white/80 font-bold uppercase tracking-wider mb-3">
                  {useGameStore.getState().activeTournament?.title}
                </div>

                {/* Rank & Placement Callout */}
                {useGameStore.getState().tournamentRunResult ? (
                  <div className="bg-yellow-400/20 border-2 border-yellow-400 px-4 py-2.5 rounded-2xl mb-3 w-full">
                    <div className="text-[10px] text-yellow-300 font-black uppercase tracking-wider">Tournament Placement</div>
                    <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
                      <span>#{useGameStore.getState().tournamentRunResult?.rank}</span>
                      <span className="text-xs font-bold text-white/70">
                        of {useGameStore.getState().tournamentRunResult?.totalParticipants}
                      </span>
                    </div>
                    {useGameStore.getState().tournamentRunResult?.isNewBest && (
                      <span className="inline-block mt-1 text-[10px] font-black uppercase bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                        ⭐ New Personal Best!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/10 px-4 py-2 rounded-2xl mb-3 text-xs font-bold text-white/70">
                    Updating tournament rank...
                  </div>
                )}

                {/* Score and Stats */}
                <div className="grid grid-cols-2 gap-2 w-full mb-3">
                  <div className="bg-black/40 p-2 rounded-2xl border border-white/15">
                    <div className="text-[10px] text-white/60 font-bold uppercase">Final Score</div>
                    <div className="text-2xl font-black text-yellow-300 tabular-nums">{score}</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-2xl border border-white/15">
                    <div className="text-[10px] text-white/60 font-bold uppercase">Coins Earned</div>
                    <div className="text-2xl font-black text-green-400 tabular-nums">+{pendingCoins || 15}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={() => {
                      if (pendingCoins > 0) {
                        useGameStore.getState().addCoins(pendingCoins);
                        useGameStore.getState().setPendingCoins(0);
                      }
                      setScore(0);
                      setState('playing');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-white text-black font-black text-sm uppercase rounded-2xl shadow-[0_4px_0_#b45309] flex items-center justify-center gap-2 cursor-pointer active:translate-y-1 active:shadow-none"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[3]" />
                    <span>Try Again (Beat Rank)</span>
                  </button>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        if (pendingCoins > 0) {
                          useGameStore.getState().addCoins(pendingCoins);
                          useGameStore.getState().setPendingCoins(0);
                        }
                        setState('idle');
                        useGameStore.getState().setMode('tournament');
                      }}
                      className="flex-1 py-2.5 bg-blue-500/80 hover:bg-blue-600 border-2 border-white/30 text-white font-black text-xs uppercase rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Standings</span>
                    </button>

                    <button
                      onClick={() => {
                        if (pendingCoins > 0) {
                          useGameStore.getState().addCoins(pendingCoins);
                          useGameStore.getState().setPendingCoins(0);
                        }
                        setState('idle');
                        useGameStore.getState().setMode('menu');
                      }}
                      className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-black text-xs uppercase rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Menu</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.h2 
                  initial={{ y: 20, scale: 0.8 }}
                  animate={{ y: 0, scale: 1 }}
                  className="font-game text-5xl mb-1 leading-none"
                  style={{ color: state === 'won' ? '#43B98C' : '#ff6b4a', WebkitTextStroke: '6px var(--ink)', paintOrder: 'stroke fill', textShadow: '0 5px 0 var(--ink)' }}
                >
                  {state === 'won' ? 'CLEARED!' : /TOPPLED|COLLAPSED/.test(lostReason) ? 'GRAVITY WINS!' : 'BOOM!'}
                </motion.h2>
                {state !== 'won' && lostReason && (
                  <div className="text-sm font-bold text-[var(--ink)]/75 mb-2">{lostReason}</div>
                )}
                {state !== 'won' && gravityNote && /TOPPLED|COLLAPSED/.test(lostReason) && (
                  <div className="max-w-xs mx-auto mb-3 px-3 py-2 rounded-xl bg-[#ffe3c7] text-[13px] leading-snug text-[#7a3d10] font-semibold">
                    ⬇ {gravityNote}
                  </div>
                )}
                
                <div className="mb-5 flex flex-col items-center">
                  <span className="text-[13px] font-bold text-[var(--ink)]/60 tracking-wide">SCORE</span>
                  <span className="font-game text-[44px] leading-none text-[var(--ink)] tabular-nums">{score}</span>
                </div>

                {state === 'won' && pendingCoins > 0 ? (
                  <div className="flex flex-col space-y-3 w-full max-w-md">
                    <div className="font-game text-2xl text-[#B88943] text-center mb-1">
                      +{pendingCoins} COINS EARNED!
                    </div>
                    <button
                      onClick={() => {
                        useGameStore.getState().showDoubleCoinsAd();
                      }}
                      className="toon flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E8BE70] text-[var(--ink)] rounded-2xl font-game text-xl cursor-pointer"
                    >
                      <Video className="w-6 h-6" />
                      <span>Double it · watch a video</span>
                    </button>
                    <button
                      onClick={() => {
                        useGameStore.getState().addCoins(pendingCoins);
                        useGameStore.getState().setPendingCoins(0);
                      }}
                      className="flex-1 flex items-center justify-center px-6 py-2.5 text-[var(--ink)]/70 font-bold text-[15px] underline underline-offset-4 decoration-2 cursor-pointer"
                    >
                      <span>No thanks, just collect</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2.5 w-full max-w-md">
                    {/* Rewarded Ad Revive Opportunity */}
                    {state === 'lost' && !gameStateRef.current.hasRevived && (
                      <button
                        onClick={() => {
                          audio.playClickSound();
                          haptics.vibrate([20]);
                          useGameStore.getState().showReviveAd();
                        }}
                        className="toon w-full py-3.5 px-4 bg-[#35D6C1] text-[var(--ink)] rounded-2xl font-game text-xl cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Video className="w-5 h-5 stroke-[2.5]" />
                        <span>Revive · watch a video</span>
                      </button>
                    )}

                    <div className="flex space-x-3 w-full">
                      <button
                        onClick={() => {
                          useGameStore.getState().checkAndTriggerAd(false);
                          setState('idle');
                          if (mode !== 'campaign') {
                            useGameStore.getState().setMode('menu');
                          }
                        }}
                        className="toon flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-[var(--ink)] rounded-2xl font-game text-lg cursor-pointer"
                      >
                        <Home className="w-5 h-5" strokeWidth={2.5} />
                        <span>Home</span>
                      </button>

                      {(state === 'lost' || mode !== 'campaign') && (
                        <button
                          onClick={() => {
                            setScore(0);
                            setState('playing');
                          }}
                          className="toon flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#E8BE70] text-[var(--ink)] rounded-2xl font-game text-lg cursor-pointer"
                        >
                          <RotateCcw className="w-5 h-5" strokeWidth={3} />
                          <span>Retry</span>
                        </button>
                      )}

                      {state === 'won' && mode === 'campaign' && (
                        <button
                          onClick={() => {
                            if (gameOverTimeoutRef.current) {
                              clearTimeout(gameOverTimeoutRef.current);
                              gameOverTimeoutRef.current = null;
                            }
                            const currentLvl = level;
                            const nextLvl = Math.min(200, currentLvl + 1);
                            if (pendingCoins > 0) {
                              useGameStore.getState().addCoins(pendingCoins);
                              useGameStore.getState().setPendingCoins(0);
                            }
                            setSummaryMetrics(null);
                            setWarpTransition({
                              isActive: true,
                              fromLevel: currentLvl,
                              toLevel: nextLvl,
                            });
                          }}
                          className="toon flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#43B98C] text-[var(--ink)] rounded-2xl font-game text-lg cursor-pointer"
                        >
                          <Play className="w-5 h-5" fill="currentColor" />
                          <span>Next</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* Post-Level Architect Tape Replay Viewer */}
      {isViewingReplay && savedReplayData && (
        <ReplayViewer
          isOpen={isViewingReplay}
          onClose={() => setIsViewingReplay(false)}
          replayData={savedReplayData}
        />
      )}

      {/* Quick-Start Guide Completion Celebration Sheet */}
      <AnimatePresence>
        {tutorialCompletedSheet && (
          <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-[#190E2D] p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-400 shadow-[0_-12px_45px_rgba(0,0,0,0.95)] flex flex-col pointer-events-auto z-10 touch-pan-y"
            >
              {/* Grab handle */}
              <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3 shrink-0" />

              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-8 h-8 text-[#FFD700] fill-[#FFD700]/30" />
                <h3 className="text-2xl font-black text-white uppercase tracking-wide drop-shadow text-center">
                  ARCHITECT CERTIFIED!
                </h3>
              </div>

              <p className="text-xs text-white/80 text-center mb-4 leading-relaxed">
                Outstanding! You successfully stacked your first <strong className="text-amber-300">3 blocks</strong> and stabilized the foundation against immediate collapse.
              </p>

              {/* Performance recap card */}
              <div className="bg-slate-900/80 border border-amber-400/40 rounded-2xl p-3.5 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Blocks Stacked:</span>
                  <span className="font-mono font-black text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 3 / 3 Clean Stacks
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Timing Sweet Spot:</span>
                  <span className="font-mono font-black text-cyan-300">Mastered (Green Ring)</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-amber-300 font-bold">Certification Bonus:</span>
                  <span className="font-mono font-black text-[#FFD700] flex items-center gap-1">
                    <Coins className="w-4 h-4 fill-current text-amber-400" />
                    +150 COINS
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    completeCampaignTutorial();
                    setTutorialCompletedSheet(false);
                    setLevel(1);
                    initGame();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_6px_0_#b45309,0_8px_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 border-2 border-amber-200 cursor-pointer active:translate-y-1 active:shadow-none transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START LEVEL 1 MISSION</span>
                </motion.button>

                <button
                  onClick={() => {
                    completeCampaignTutorial();
                    setTutorialCompletedSheet(false);
                    setState('idle');
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-white/60 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Return to Campaign Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TacticalRechargeModal
        isOpen={rechargeModalOpen}
        initialType={rechargeType}
        onClose={() => setRechargeModalOpen(false)}
        onPurchased={(type) => {
          handleRechargePurchased(type);
          setRechargeModalOpen(false);
        }}
      />
    </motion.div>
  );
}
