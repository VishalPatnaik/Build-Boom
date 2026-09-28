import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { useDailyStore } from '../game/dailyStore';
import { generateLevel, generateEndless, generateTournament, generateSandboxLevel, generateTutorialBlocks, BlockDef, getBlockMass } from '../game/LevelGenerator';
import { createInitialPhysicsState, updateTowerPhysics, applyBlockImpact, TowerPhysicsState } from '../game/physicsEngine';
import { trackEvent } from '../game/eventDispatcher';
import { renderBlock, renderPlate, renderBoomParticle, getBoomColor } from '../game/themeRenderer';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';
import { ArrowLeft, RotateCcw, Play, Video, Home, Trophy, Crown, Medal, Zap, Shield, Compass, Plus, Coins, Vibrate, VibrateOff, Award, Sparkles, CheckCircle2, Hand, Target, Settings } from 'lucide-react';
import { TacticalRechargeModal } from './TacticalRechargeModal';
import { PowerupType } from '../game/techTree';
import { ComboStreakHUD, FloatingScoreMultiplierItem, FloatingMultiplierData } from './FloatingFeedback';
import { ComboMultiplierIndicator, ComboMultiplierState } from './ComboMultiplierIndicator';
import { ReplayRecorder } from '../game/replayEngine';
import { safeCreateRadialGradient } from '../utils/canvasUtils';

interface ActiveBlock extends BlockDef {
  distance: number; // 100 to 0 (center)
  spawnedAt: number;
  handled: boolean;
  success?: boolean;
  contactSoundPlayed?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type?: 'spark' | 'ring';
}

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
    unlockedPerks, 
    sandboxOptions, 
    coins, 
    hapticsEnabled, 
    toggleHaptics,
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
  
  let activeBoom = equippedBoomEffect || 'boom-0';
  if (mode === 'campaign') {
     const zone = Math.floor((level - 1) / 2);
     activeBoom = `boom-${zone}`;
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  
  const [builtCount, setBuiltCount] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
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
    rapidPerfectStreak: 0,
    lastPerfectTime: 0,
    rapidPerfectMultiplier: 1,
    lastMultiplierBroadcastTime: 0,
    shake: 0,
    hasRevived: false,
    physics: createInitialPhysicsState(unlockedPerks),
    lastWarningTime: 0,
    lastUiUpdateTime: 0,
  });

  const initGame = () => {
    recorderRef.current.reset();
    let queue: BlockDef[] = [];

    const isTutorialMode = isTutorialActive;
    if (isTutorialMode) {
      useGameStore.getState().setTutorialStep(1);
      queue = generateTutorialBlocks();
    } else if (mode === 'campaign') {
      queue = generateLevel(level);
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

    const initialMsg = isTutorialMode
      ? 'QUICK-START: STACK 3 BLOCKS'
      : mode === 'campaign' 
      ? (isBossLevel ? `TITAN SIEGE • LVL ${level}` : `LEVEL ${level}`)
      : mode === 'tournament'
      ? (useGameStore.getState().activeTournament?.title || 'TOURNAMENT')
      : mode === 'workshop'
      ? 'BLUEPRINT SIMULATION'
      : mode.toUpperCase();
    setMessage(initialMsg);

    const initialPhys = createInitialPhysicsState(unlockedPerks, useGameStore.getState().powerups);
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
      rapidPerfectStreak: 0,
      lastPerfectTime: 0,
      rapidPerfectMultiplier: 1,
      lastMultiplierBroadcastTime: 0,
      shake: 0,
      hasRevived: false,
      physics: initialPhys,
      lastWarningTime: 0,
      lastUiUpdateTime: 0,
    };
    
    setTimeout(() => setMessage(''), 1500);
  };

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
    setMessage('AIRDROP DELIVERED!');
    setTimeout(() => setMessage(''), 1200);
  };

  const triggerStasis = () => {
    if (state !== 'playing' || gameStateRef.current.isGameOver) return;
    const gs = gameStateRef.current;
    if (gs.physics.stasisCharges <= 0) {
      audio.playTiltWarning();
      setMessage('NO STASIS CHARGES! (TAP HUD TO RE-ARM)');
      setTimeout(() => setMessage(''), 900);
      return;
    }
    if (gs.physics.stasisActive) return;

    const stasisDuration = (unlockedPerks['chrono_stasis'] >= 2 ? 5.0 : 3.5) * 1000;
    gs.physics.stasisCharges--;
    useGameStore.getState().consumePowerup('stasis');
    useGameStore.getState().recordAchievementProgress('stasisUsed', 1);
    gs.physics.stasisActive = true;
    gs.physics.stasisEndTime = performance.now() + stasisDuration;
    setTacticalCharges((c) => ({ ...c, stasis: gs.physics.stasisCharges }));
    audio.playStasisSound(true);
    haptics.stasisActivated();
    setMessage('CHRONO STASIS!');
    setTimeout(() => setMessage(''), 1000);
  };

  const triggerEmp = () => {
    if (state !== 'playing' || gameStateRef.current.isGameOver) return;
    const gs = gameStateRef.current;
    if (gs.physics.empCharges <= 0) {
      audio.playTiltWarning();
      setMessage('NO EMP CHARGES! (TAP HUD TO RE-ARM)');
      setTimeout(() => setMessage(''), 900);
      return;
    }

    gs.physics.empCharges--;
    useGameStore.getState().consumePowerup('emp');
    setTacticalCharges((c) => ({ ...c, emp: gs.physics.empCharges }));
    audio.playEmpBlast();
    triggerHapticVibrate([32, 28, 50]);
    haptics.empDefuse();

    const w = canvasRef.current?.width || window.innerWidth;
    const h = canvasRef.current?.height || window.innerHeight;
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
    setMessage(`EMP DEFUSED! +${coinReward} COINS`);
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
        gameStateRef.current.blocks = [];
        
        // Add a 1.5 second buffer before they start coming again
        gameStateRef.current.lastSpawnTime = performance.now() + 1500;
        
        gameStateRef.current.hasRevived = true;
        setMessage(''); // Clear BOOM! text when resuming
        useGameStore.getState().clearReviveFlag();
      }
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      haptics.stop();
    };
  }, [state, level, mode]);

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
    
    const w = canvasRef.current?.width || window.innerWidth;
    const h = canvasRef.current?.height || window.innerHeight;
    const gameRadius = Math.min(w, h) * 0.45;
    
    const targetMass = getBlockMass(targetBlock);

    // Check too early (>15 distance)
    if (targetBlock.distance > 15) {
      if (isTutorialActive) {
        // QUICK-START GUIDE SAFETY CUSHION: PREVENT IMMEDIATE GAME-OVER!
        audio.playTiltWarning();
        triggerHapticVibrate([20, 35]);
        setTutorialMistakeAlert('TOO EARLY! ⚠️ Wait for the block to enter the green sweet spot circle!');
        setMessage('WAIT FOR GREEN CIRCLE!');
        setTimeout(() => {
          setTutorialMistakeAlert(null);
          setMessage('');
        }, 1100);
        return; // Safe cushion! Do not call gameOver
      }

      if (gs.physics.shieldActive) {
        targetBlock.handled = true;
        gs.physics.shieldActive = false;
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
        setMessage('AEGIS SHIELD ABSORBED MISCLICK!');
        setTimeout(() => setMessage(''), 1000);
        return;
      }
      targetBlock.handled = true;
      audio.playCollisionSound(targetMass, { type: 'glance' });
      triggerHapticVibrate([45, 30, 40]);
      haptics.tooEarly();
      recorderRef.current.logEvent('early', 'TOO EARLY MISCLICK', '#ef4444');
      gameOver(false, 'TOO EARLY!');
      createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
    } else if (targetBlock.distance < -15) {
      // Ignored, gameloop will catch it.
    } else {
      // Hit Zone!
      targetBlock.handled = true;
      if (targetBlock.type === 'boom') {
        if (gs.physics.shieldActive) {
          gs.physics.shieldActive = false;
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
          setMessage('AEGIS SHIELD ABSORBED BOMB!');
          setTimeout(() => setMessage(''), 1000);
          return;
        }
        audio.playCollisionSound(targetMass, { type: 'crash' });
        triggerHapticVibrate([70, 35, 110, 45, 175]);
        haptics.bombHit();
        recorderRef.current.logEvent('boom', 'BOMB DETONATED', '#ef4444', { mass: targetMass });
        gameOver(false, 'YOU BUILT A BOMB!');
        createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
      } else {
        // Successful Placement with Physics & Archetype calculation!
        targetBlock.success = true;
        setTutorialEmergencyHold(false);

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

        const impact = applyBlockImpact(
          gs.physics,
          targetBlock.distance,
          targetBlock.angle,
          targetBlock.archetype,
          unlockedPerks,
          targetMass
        );

        gs.builtCount++;
        gs.combo++;
        setBuiltCount(gs.builtCount);
        useGameStore.getState().setTowerHeight(gs.builtCount);
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
        const totalPoints = Math.round(basePoints * impact.scoreMultiplier * multiplierBoost);
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
        if (impact.isPerfect && currentMultiplier >= 2) {
          const tier = Math.min(5, Math.max(1, currentMultiplier - 1)) as 1 | 2 | 3 | 4 | 5;
          const bonusTag = currentMultiplier >= 5 ? 'APEX' : currentMultiplier >= 4 ? 'HYPER' : currentMultiplier >= 3 ? 'TRIPLE' : 'DUAL';
          const newFloater: FloatingMultiplierData = {
            id: `mult-${Date.now()}-${Math.random()}`,
            x: px,
            y: py,
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
        const placementShake = (basePlacementShake * heightScale) + comboShakeBonus;
        gs.shake = Math.max(gs.shake, Math.min(32, placementShake));

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
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#f59e0b');
          setMessage('TITAN ANCHOR LOCKED!');
          setTimeout(() => setMessage(''), 800);
        } else if (targetBlock.archetype === 'gold_ingot') {
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#eab308');
          setMessage('+50 GOLD BULLION!');
          setTimeout(() => setMessage(''), 800);
        } else if (targetBlock.archetype === 'prism') {
          audio.playComboSurge(3);
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00f2fe');
          setMessage('3X PRISM SURGE!');
          setTimeout(() => setMessage(''), 800);
        } else if (impact.isPerfect) {
          if (gs.rapidPerfectStreak < 2) {
            audio.playPerfectSound();
          }
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00f2fe');
          if (gs.rapidPerfectStreak >= 2) {
            setMessage(`RAPID PERFECT ${gs.rapidPerfectMultiplier}x MULTIPLIER! ⚡`);
          } else {
            setMessage('PERFECT ALIGNMENT!');
          }
          setTimeout(() => setMessage(''), 650);

          if (unlockedPerks['aegis_shield'] >= 2 && gs.combo % 20 === 0 && !gs.physics.shieldActive) {
            gs.physics.shieldActive = true;
            setTacticalCharges((c) => ({ ...c, shield: true }));
            setMessage('AEGIS SHIELD RECHARGED!');
          }
        } else {
          createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00ffcc');
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

  const createExplosionAtDistance = (block: ActiveBlock, gameRadius: number, w: number, h: number, baseColor: string) => {
      const px = w/2 + Math.cos(block.angle) * (block.distance / 100) * gameRadius;
      const py = h * 0.65 + Math.sin(block.angle) * (block.distance / 100) * gameRadius;
      
      let effectColor = baseColor;
      effectColor = getBoomColor(activeBoom);


      createExplosion(px, py, effectColor, 40);
      
      // Add Shockwave ring
      gameStateRef.current.particles.push({
          x: px, y: py, vx: 0, vy: 0, life: 1.0, color: effectColor, size: 10, type: 'ring'
      });
  };

  const gameOver = (win: boolean, reason?: string) => {
    gameStateRef.current.isGameOver = true;
    gameStateRef.current.rapidPerfectStreak = 0;
    gameStateRef.current.lastPerfectTime = 0;
    gameStateRef.current.rapidPerfectMultiplier = 1;
    setActiveCombo(0);
    setRapidComboData((prev) => ({ ...prev, active: false, timeRemaining: 0 }));
    setFloatingMultipliers([]);

    // Finalize 10-second physics replay recording
    try {
      const savedReplay = recorderRef.current.finalize({
        mode,
        level,
        finalOutcome: win ? 'won' : 'lost',
        finalReason: reason,
        equippedCosmetic,
        equippedPlate: useGameStore.getState().equippedPlate,
        equippedBackground: useGameStore.getState().equippedBackground,
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
        fetch(`/api/tournaments/${activeT.id}/submit`, {
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
              useGameStore.getState().setPendingCoins(earned);
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
              useGameStore.getState().setPendingCoins(earned);
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
            useGameStore.getState().setPendingCoins(earned);
          });
      }
    }

    if (win) {
      audio.playPerfectSound();
      haptics.levelWon();
      setMessage('PERFECT!');
      if (mode === 'campaign') {
        unlockNextLevel();
        useDailyStore.getState().updateProgress('LEVELS_PLAYED', 1);
        if (gameStateRef.current.hasRevived) {
           useDailyStore.getState().updateProgress('BOOM_RECOVERY', 1);
        } else {
           useDailyStore.getState().updateProgress('NO_BOOM', 1);
        }
        const baseCoins = 50 + (level * 10);
        const performanceCoins = gameStateRef.current.builtCount * 5;
        useGameStore.getState().setPendingCoins(baseCoins + performanceCoins);
      }
      else {
        updateHighScore(mode, gameStateRef.current.builtCount * 10);
        // Reward endless/daily based on performance
        const endlessCoins = Math.floor(gameStateRef.current.builtCount * 2);
        useGameStore.getState().setPendingCoins(endlessCoins);
      }
      
      setTimeout(() => {
        useGameStore.getState().checkAndTriggerAd();
        setState('won');
      }, 1500);
    } else {
      audio.playBoomSound();
      // Physical immersion: 'boom' event visceral detonation rumble
      triggerHapticVibrate([80, 40, 120, 50, 160]);
      if (reason && reason.includes('COLLAPSED')) {
        haptics.towerCollapsed();
      }
      // Dynamic boom detonation shake intensity-scaled with stack height
      const boomStackHeight = gameStateRef.current.builtCount;
      const boomHeightScale = 1 + Math.min(3.5, (boomStackHeight / 5) * 0.85);
      gameStateRef.current.shake = Math.min(65, 28 * boomHeightScale);
      setMessage(reason || 'BOOM!');
      if (mode !== 'campaign') {
        const finalScore = useGameStore.getState().score;
        updateHighScore(mode, finalScore);
        if (mode === 'endless' && finalScore > 0) {
          const s = useGameStore.getState();
          fetch('/api/leaderboard/endless/submit', {
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
      
      setTimeout(() => {
        // Trigger Revive logic once per run (except tournament where competitive purity is maintained)
        setState('lost');
        if (mode !== 'menu' && mode !== 'tournament' && !gameStateRef.current.hasRevived) {
           useGameStore.getState().showReviveAd();
        }
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

    const dt = time - gs.lastFrameTime;
    gs.lastFrameTime = time;

    if (rechargeModalOpenRef.current) {
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

    // Update Tower Tilt & Equilibrium
    const physResult = updateTowerPhysics(gs.physics, effectiveDt, unlockedPerks);
    if (physResult.warningAlert && time - gs.lastWarningTime > 1100) {
      gs.lastWarningTime = time;
      audio.playTiltWarning();
    }
    if (physResult.collapsed) {
      if (isTutorialActive) {
        gs.physics.tiltAngle = 0;
        gs.physics.tiltVelocity = 0;
        return;
      }
      audio.playCollisionSound(3.0, { type: 'crash' });
      triggerHapticVibrate([70, 35, 95, 45, 140]);
      haptics.towerCollapsed();
      recorderRef.current.logEvent('collapse', 'TOWER COLLAPSED', '#ef4444');
      gameOver(false, 'EQUILIBRIUM LOST! TOWER COLLAPSED');
      return;
    }

    // Sync HUD displays
    if (time - gs.lastUiUpdateTime > 70) {
      gs.lastUiUpdateTime = time;
      setTiltDisplay(gs.physics.tiltAngle);
      setStressDisplay(gs.physics.stressLevel);
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
      if (time - gs.lastSpawnTime > next.delay * 1000) {
        gs.queue.shift();
        gs.blocks.push({
          ...next,
          distance: 120, // start off-screen
          spawnedAt: time,
          handled: false
        });
        gs.lastSpawnTime = time;
      }
    }

    const w = canvasRef.current?.width || 800;
    const h = canvasRef.current?.height || 600;
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
          setMessage('SWEET SPOT! TAP NOW TO STACK');
          continue;
        }
        b.handled = true;
        const bMass = getBlockMass(b);
        audio.playCollisionSound(bMass, { type: 'crash' });
        triggerHapticVibrate([65, 35, 85]);
        haptics.tooEarly();
        recorderRef.current.logEvent('boom', 'MISSED BLOCK CRASH', '#f59e0b', { mass: bMass });
        gameOver(false, 'TOO LATE!');
        createExplosionAtDistance(b, gameRadius, w, h, '#f59e0b');
      }
      
      // Check cleared BOOM
      if (b.type === 'boom' && b.distance < -15) {
        b.handled = true; // safely passed
        const midasTier = unlockedPerks['midas_foundation'] || 0;
        if (midasTier >= 1) {
          useGameStore.getState().addCoins(2);
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

  const drawVisualHealthIndicator = (
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    time: number,
    hazard: HazardProximityResult,
    stressLevel: number,
    isTargetBlock: boolean,
    isHighContrast: boolean,
    blockSize: number = 30
  ) => {
    const { proximityRatio, distance, boomPx, boomPy, nearestBoom } = hazard;

    // Alert Levels
    const isCritical = proximityRatio >= 0.55;
    const isCaution = proximityRatio >= 0.20 && !isCritical;
    const isSafe = !isCaution && !isCritical;

    // Colors & Frequencies
    let primaryColor: string;
    let borderColor: string;
    let glowColor: string;
    let pulseSpeed: number;
    let statusText: string;

    if (isHighContrast) {
      if (isCritical) {
        primaryColor = '#ff0033';
        borderColor = '#ffffff';
        glowColor = 'rgba(255, 0, 51, 0.9)';
        pulseSpeed = 0.038;
        statusText = '🚨 BOOM HAZARD!';
      } else if (isCaution) {
        primaryColor = '#ffff00';
        borderColor = '#ffffff';
        glowColor = 'rgba(255, 255, 0, 0.75)';
        pulseSpeed = 0.018;
        statusText = '⚠️ CAUTION';
      } else {
        primaryColor = '#00ffcc';
        borderColor = '#ffffff';
        glowColor = 'rgba(0, 255, 204, 0.45)';
        pulseSpeed = 0.005;
        statusText = 'SECURE';
      }
    } else {
      if (isCritical) {
        primaryColor = '#ef4444';
        borderColor = '#f87171';
        glowColor = 'rgba(239, 68, 68, 0.95)';
        pulseSpeed = 0.038; // ~18 Hz rapid emergency pulse
        statusText = '🚨 BOOM HAZARD!';
      } else if (isCaution) {
        primaryColor = '#f59e0b';
        borderColor = '#fbbf24';
        glowColor = 'rgba(245, 158, 11, 0.75)';
        pulseSpeed = 0.016; // ~7 Hz warning pulse
        statusText = '⚠️ PROX CAUTION';
      } else {
        primaryColor = '#10b981';
        borderColor = '#34d399';
        glowColor = 'rgba(16, 185, 129, 0.45)';
        pulseSpeed = 0.005; // ~2 Hz calm breathing
        statusText = 'SECURE';
      }
    }

    // Dynamic health percentage based on base integrity and hazard proximity
    const baseHealth = Math.max(20, Math.round(100 - stressLevel * 0.35));
    const healthReduction = proximityRatio * 65;
    const currentHealth = Math.max(5, Math.round(baseHealth - healthReduction));

    const pulseCycle = Math.sin(time * pulseSpeed);
    const pulseScale = isCritical
      ? 1.0 + pulseCycle * 0.12
      : (isCaution ? 1.0 + pulseCycle * 0.06 : 1.0);
    const pulseAlpha = 0.7 + 0.3 * Math.abs(pulseCycle);

    ctx.save();

    // 1. Tactical Threat Vector Tether to nearby boom hazard
    if (nearestBoom && proximityRatio > 0.20) {
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = isCritical ? 2.0 : 1.2;
      ctx.globalAlpha = Math.min(0.85, 0.3 + proximityRatio * 0.55);
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -time * 0.05;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(boomPx, boomPy);
      ctx.stroke();

      // Threat Vector Midpoint Warning Pip
      const midX = (px + boomPx) * 0.5;
      const midY = (py + boomPy) * 0.5;
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(midX, midY, isCritical ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();

      // Distance telemetry label
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(distance)}px`, midX, midY - 6);
      ctx.restore();
    }

    // 2. Pulsing Perimeter Hazard Aura & Warning Beacons around the Block
    if (proximityRatio > 0.15) {
      ctx.save();
      const halfSize = (blockSize / 2) + 4;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = isCritical ? 2.5 : 1.5;
      ctx.globalAlpha = pulseAlpha * (isCritical ? 0.95 : 0.7);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isCritical ? 16 : 8;

      // Tactical Corner Brackets around Block
      const bracketLen = 7;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(px - halfSize, py - halfSize + bracketLen);
      ctx.lineTo(px - halfSize, py - halfSize);
      ctx.lineTo(px - halfSize + bracketLen, py - halfSize);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(px + halfSize - bracketLen, py - halfSize);
      ctx.lineTo(px + halfSize, py - halfSize);
      ctx.lineTo(px + halfSize, py - halfSize + bracketLen);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(px + halfSize, py + halfSize - bracketLen);
      ctx.lineTo(px + halfSize, py + halfSize);
      ctx.lineTo(px + halfSize - bracketLen, py + halfSize);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(px - halfSize + bracketLen, py + halfSize);
      ctx.lineTo(px - halfSize, py + halfSize);
      ctx.lineTo(px - halfSize, py + halfSize - bracketLen);
      ctx.stroke();

      // Critical Hazard: Expanding Shockwave Rings
      if (isCritical) {
        const ringOffset = ((time * 0.05) % 26);
        const ringR = halfSize + ringOffset;
        const ringAlpha = (1 - ringOffset / 26) * 0.8;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.arc(px, py, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Upright Holographic Visual Health Bar and Telemetry Badge
    ctx.save();
    ctx.translate(px, py - 30);
    ctx.scale(pulseScale, pulseScale);

    const barW = 46;
    const barH = 7;
    const barX = -barW / 2;
    const barY = -barH / 2;

    // Background Bezel
    ctx.fillStyle = 'rgba(6, 11, 24, 0.88)';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isCritical ? 14 : (isCaution ? 8 : 4);
    drawRoundRect(ctx, barX - 1.5, barY - 1.5, barW + 3, barH + 3, 4);
    ctx.fill();
    ctx.stroke();

    // Segmented Health Meter (4 Tactical Segments)
    const segments = 4;
    const segGap = 1.5;
    const segW = (barW - (segGap * (segments - 1))) / segments;
    const activeSegments = Math.round((currentHealth / 100) * segments);

    for (let s = 0; s < segments; s++) {
      const sx = barX + s * (segW + segGap);
      const isFilled = s < activeSegments;

      if (isFilled) {
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        drawRoundRect(ctx, sx, barY, segW, barH, 1.5);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.shadowBlur = 0;
        drawRoundRect(ctx, sx, barY, segW, barH, 1.5);
        ctx.fill();
      }
    }

    // Micro Status Telemetry Header
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isCritical ? '#ffdddd' : (isCaution ? '#fffbeb' : '#ecfdf5');
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isCritical ? 10 : 4;
    const labelY = barY - 4;
    ctx.fillText(`${statusText} • ${currentHealth}%`, 0, labelY);

    ctx.restore();
    ctx.restore();
  };

  const draw = (time: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h || w <= 0 || h <= 0 || !Number.isFinite(w) || !Number.isFinite(h)) return;

    const cx = w / 2;
    const cy = h * 0.65;
    const gameRadius = Math.min(w, h) * 0.45;
    const gs = gameStateRef.current;
    
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

      // Dynamically shake the HTML game board container for full physical immersion
      if (containerRef.current) {
        const boardDx = (Math.random() - 0.5) * (shakeFactor * 0.55);
        const boardDy = (Math.random() - 0.5) * (shakeFactor * 0.55);
        const boardRot = (Math.random() - 0.5) * (shakeFactor * 0.035);
        containerRef.current.style.transform = `translate3d(${boardDx.toFixed(1)}px, ${boardDy.toFixed(1)}px, 0) rotate(${boardRot.toFixed(2)}deg)`;
      }

      gs.shake *= 0.88;
      if (gs.shake < 0.4) {
        gs.shake = 0;
        if (containerRef.current) {
          containerRef.current.style.transform = '';
        }
      }
    } else if (containerRef.current && containerRef.current.style.transform) {
      containerRef.current.style.transform = '';
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
    const bounce = Math.sin(time / 200) * 3;

    // Landing Sweet-Spot Reticle
    const reticleRadius = (15 / 100) * gameRadius;
    const activeTargetBlock = gs.blocks.find(b => !b.handled);
    const inSweetSpot = activeTargetBlock && activeTargetBlock.distance <= 15 && activeTargetBlock.distance >= -15;

    const isHighContrastEnv = useGameStore.getState().visualTheme === 'high-contrast';

    ctx.save();
    if (inSweetSpot) {
      // Vivid Emerald Neon Pulsing Reticle Ring
      ctx.strokeStyle = isHighContrastEnv ? '#ffff00' : '#10b981';
      ctx.lineWidth = isHighContrastEnv ? 4.5 : 3.5;
      ctx.shadowColor = isHighContrastEnv ? '#ffff00' : '#00ffcc';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - 5, reticleRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing Sweet Spot Glow
      ctx.fillStyle = isHighContrastEnv ? 'rgba(255, 255, 0, 0.25)' : 'rgba(16, 185, 129, 0.16)';
      ctx.fill();

      // Corner Crosshair Nodes
      for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 2) {
        const bx = cx + Math.cos(ang) * reticleRadius;
        const by = cy + bounce - 5 + Math.sin(ang) * reticleRadius;
        ctx.fillStyle = isHighContrastEnv ? '#ffff00' : '#10b981';
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

    renderPlate(ctx, cx - 50, cy + bounce - 5, 100, 30, useGameStore.getState().equippedPlate || "plate-0", time);

    // Rapid Perfect Multiplier Dynamic Canvas Resonance
    if (gs.rapidPerfectStreak >= 2) {
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
    const towerLayers = Math.min(gs.builtCount, 30);
    const tiltRad = (gs.physics.tiltAngle * Math.PI) / 180;

    for (let i = 0; i < towerLayers; i++) {
        const progress = (i + 1) / Math.max(1, towerLayers);
        const layerTilt = tiltRad * progress;
        const layerOffsetX = Math.sin(layerTilt) * (i * 20);
        const layerOffsetY = - (i * 20) * Math.cos(layerTilt);

        const squash = (i === gs.builtCount - 1 && time - gs.lastSpawnTime < 200) ? 0.8 : 1;
        
        ctx.save();
        ctx.translate(cx + layerOffsetX, cy + bounce + layerOffsetY - 10);
        ctx.rotate(layerTilt);
        ctx.scale(1 / squash, squash);
        
        renderBlock(ctx, -30, -15, 60, 30, equippedCosmetic || "skin-0", true, time, undefined);
        
        ctx.restore();
    }

    // Visual Health Indicator on Active Tower Top Block (when boom hazards approach center)
    if (towerLayers > 0) {
      const topIdx = towerLayers - 1;
      const topProgress = (topIdx + 1) / Math.max(1, towerLayers);
      const topLayerTilt = tiltRad * topProgress;
      const topOffsetX = Math.sin(topLayerTilt) * (topIdx * 20);
      const topOffsetY = - (topIdx * 20) * Math.cos(topLayerTilt);
      const topPx = cx + topOffsetX;
      const topPy = cy + bounce + topOffsetY - 10;

      const towerHazard = findNearestBoomHazard(topPx, topPy, gs.blocks, cx, cy, gameRadius);
      if (towerHazard.proximityRatio > 0.18 || (gs.physics.stressLevel || 0) > 40) {
        drawVisualHealthIndicator(
          ctx,
          topPx,
          topPy - 12,
          time,
          towerHazard,
          gs.physics.stressLevel || 0,
          false,
          isHighContrastEnv,
          45
        );
      }
    }

    // Aegis Shield Kinetic Barrier Bubble
    if (gs.physics.shieldActive) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - (towerLayers * 10), 74, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulsing energy resonance
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy + bounce - (towerLayers * 10), 76 + Math.sin(time / 140) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Blocks
    gs.blocks.forEach(b => {
      if (b.handled && b.type === 'build') return;

      let apparentType = b.type;
      let opacity = 1.0;

      // Deceptive Modifiers
      if (b.modifier === 'fake-boom' && b.distance > 65) apparentType = 'boom';
      if (b.modifier === 'fake-build' && b.distance > 65) apparentType = 'build';
      if (b.modifier === 'ghost' && b.distance < 80 && b.distance > 20) opacity = 0.05;
      if (b.modifier === 'blink' && Math.floor(time / 80) % 2 === 0) opacity = 0.1;
      
      // Fade out passed bombs as they fly away
      if (b.handled && apparentType === 'boom') {
          opacity *= Math.max(0, 1 - ((-15 - b.distance) / 80));
      }

      const color = apparentType === 'build' ? '#00ffcc' : '#ff0055';
      const px = cx + Math.cos(b.angle) * (b.distance / 100) * gameRadius;
      const py = cy + Math.sin(b.angle) * (b.distance / 100) * gameRadius;

      ctx.globalAlpha = opacity;

      ctx.save();
      ctx.translate(px, py);
      
      // Speed-based squash and stretch
      const stretch = 1 + (b.speed * 0.1);
      ctx.rotate(b.angle);
      ctx.scale(stretch, 1 / stretch);
      
      if (apparentType === 'build') {
          renderBlock(ctx, -15, -15, 30, 30, equippedCosmetic || "skin-0", false, time, b.archetype);
          if (isHighContrastEnv) {
            ctx.save();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(-16, -16, 32, 32);
            ctx.restore();
          }
      } else {
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

      // Visual Health & Tactical Hazard Proximity Indicator for Active Building Block
      if (apparentType === 'build' && !b.handled && b.distance > -15) {
        const hazard = findNearestBoomHazard(px, py, gs.blocks, cx, cy, gameRadius);
        const isTarget = b === activeTargetBlock;
        drawVisualHealthIndicator(
          ctx,
          px,
          py,
          time,
          hazard,
          gs.physics.stressLevel || 0,
          isTarget,
          isHighContrastEnv,
          30
        );
      }

      // Spawning Trails
      if (Math.random() < 0.4 && opacity > 0.5) {
          gs.particles.push({
              x: px, y: py,
              vx: -Math.cos(b.angle) * 3 + (Math.random()-0.5),
              vy: -Math.sin(b.angle) * 3 + (Math.random()-0.5),
              life: 1.0, color, size: Math.random() * 3 + 1
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
      
      // Delegate particle rendering to themeRenderer
      renderBoomParticle(ctx, { x: p.x, y: p.y, rotation: Math.atan2(p.vy, p.vx), life: p.life, size: p.size, color: p.color, type: p.type }, time, activeBoom);
    }

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
        const topIdx = towerLayers - 1;
        const topProgress = (topIdx + 1) / Math.max(1, towerLayers);
        const topLayerTilt = tiltRad * topProgress;
        const topOffsetX = Math.sin(topLayerTilt) * (topIdx * 20);
        const topOffsetY = - (topIdx * 20) * Math.cos(topLayerTilt);
        const topPx = cx + topOffsetX;
        const topPy = cy + bounce + topOffsetY - 10;
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full flex flex-col select-none overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => {
              try {
                const replay = recorderRef.current.finalize({
                  mode,
                  level,
                  finalOutcome: 'aborted',
                  finalReason: 'EXITED RUN',
                  equippedCosmetic,
                  equippedPlate: useGameStore.getState().equippedPlate,
                  equippedBackground: useGameStore.getState().equippedBackground,
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
            className="p-3.5 bg-black/40 backdrop-blur-md border-2 border-white/20 rounded-2xl hover:bg-black/60 transition-all text-white shadow-lg active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Quick Haptic Toggle */}
          <button
            onClick={() => {
              toggleHaptics();
              if (!hapticsEnabled) {
                haptics.vibrate([18, 30, 25]);
              }
            }}
            className={`p-3.5 backdrop-blur-md border-2 rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer ${
              hapticsEnabled
                ? 'bg-black/40 border-cyan-400/50 text-cyan-300 hover:bg-cyan-950/40'
                : 'bg-black/30 border-white/10 text-white/40 hover:bg-black/50'
            }`}
            title={hapticsEnabled ? 'Haptic Feedback: ON' : 'Haptic Feedback: OFF'}
            aria-label="Toggle Haptic Feedback"
          >
            {hapticsEnabled ? <Vibrate className="w-6 h-6" /> : <VibrateOff className="w-6 h-6" />}
          </button>

          {/* Quick Settings Button */}
          <button
            onClick={() => {
              useGameStore.getState().setSettingsModalOpen(true);
            }}
            className="p-3.5 backdrop-blur-md border-2 border-white/20 hover:border-cyan-400/60 bg-black/40 hover:bg-black/60 rounded-2xl transition-all shadow-lg text-cyan-300 active:scale-95 cursor-pointer"
            title="Audio & Theme Settings"
            aria-label="Open Settings"
          >
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Center: Inclinometer Attitude Gyro & Boss Titan Gauge */}
        <div className="flex flex-col items-center pointer-events-auto max-w-[200px] sm:max-w-xs">
          {/* Boss Titan Bar if Boss Level */}
          {isBossLevel && (
            <div className="mb-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/50 backdrop-blur-md text-center shadow-lg animate-pulse">
              <div className="text-[9px] font-mono font-black tracking-widest text-red-400 uppercase flex items-center justify-center gap-1">
                <span>⚡ TITAN SIEGE • BOSS LVL {level}</span>
              </div>
              <div className="w-36 sm:w-44 h-2 bg-black/60 rounded-full mt-1 overflow-hidden border border-red-500/30">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, 100 - (builtCount / Math.max(1, totalBlocks)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Gyro Inclinometer Attitude Bar */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-center shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-wider text-cyan-300 uppercase">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>GYRO STABILITY</span>
              <span className={`font-black tabular-nums ${stressDisplay > 0.7 ? 'text-rose-400 animate-ping' : stressDisplay > 0.4 ? 'text-amber-300' : 'text-emerald-400'}`}>
                {tiltDisplay > 0 ? `+${tiltDisplay.toFixed(1)}°` : `${tiltDisplay.toFixed(1)}°`}
              </span>
            </div>

            {/* Attitude Horizon Line */}
            <div className="w-32 sm:w-40 h-2 bg-black/60 rounded-full mt-1 relative overflow-hidden border border-white/10">
              {/* Safe center bracket */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-emerald-500/20 border-x border-emerald-400/40" />
              {/* Horizon Pip */}
              <div 
                className={`absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-100 ${
                  stressDisplay > 0.7 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : stressDisplay > 0.4 ? 'bg-amber-400' : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
                style={{
                  left: `calc(50% + ${(tiltDisplay / 35) * 45}%)`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          </div>

          {/* Dynamic Active Combo Multiplier Indicator (Rapid Perfect Stacks) */}
          <div className="mt-2 w-full flex justify-center">
            {rapidComboData.active ? (
              <ComboMultiplierIndicator
                data={rapidComboData}
                isHighContrast={visualTheme === 'high-contrast'}
              />
            ) : (
              <ComboStreakHUD activeCombo={activeCombo} />
            )}
          </div>
        </div>
        
        {/* Right: Score & Level Header */}
        <div className="text-right pointer-events-none">
          <div className="text-white font-black uppercase tracking-wider text-xs md:text-sm flex items-center justify-end gap-1.5 drop-shadow">
            {mode === 'tournament' ? (
              <span className="flex items-center gap-1 text-yellow-300">
                <Trophy className="w-4 h-4 text-yellow-300" />
                {useGameStore.getState().activeTournament?.title || 'TOURNAMENT'}
              </span>
            ) : mode === 'workshop' ? (
              <span className="text-sky-300 font-mono text-xs">BLUEPRINT LAB</span>
            ) : mode === 'campaign' ? (
              `LEVEL ${level}`
            ) : (
              mode
            )}
          </div>
          <div className="text-4xl md:text-5xl font-black text-white tabular-nums drop-shadow-[0_4px_0_#b45309]" style={{ WebkitTextStroke: '1.5px #f59e0b' }}>
            {score}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full relative cursor-pointer touch-none select-none"
        style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={(e) => {
          if (e.cancelable) e.preventDefault();
          handleAction();
        }}
        onTouchStart={(e) => {
          if (e.cancelable) e.preventDefault();
          handleAction();
        }}
        onMouseDown={() => {
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
        
        {/* Floating Tactical Arsenal Pods (Bottom Corners) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none z-20">
          {/* Tactical Gadgets (Left) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* STASIS POD */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerStasis();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                triggerStasis();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`p-2.5 sm:px-3 sm:py-2 rounded-2xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                gameStateRef.current.physics.stasisActive
                  ? 'bg-cyan-500/30 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.5)] animate-pulse text-cyan-300'
                  : tacticalCharges.stasis > 0
                  ? 'bg-black/50 hover:bg-cyan-950/60 border-cyan-500/40 text-white'
                  : 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              }`}
              title="Chrono Stasis (Hotkey: Q)"
            >
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center text-sm font-black text-cyan-400">
                ⏳
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[9px] font-mono text-cyan-300 font-bold uppercase">STASIS [Q]</div>
                <div className="text-xs font-black text-white tabular-nums flex items-center gap-1">
                  {tacticalCharges.stasis > 0 ? (
                    `${tacticalCharges.stasis} Left`
                  ) : (
                    <span className="text-cyan-300 flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> RE-ARM
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* EMP POD */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerEmp();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                triggerEmp();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`p-2.5 sm:px-3 sm:py-2 rounded-2xl border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                tacticalCharges.emp > 0
                  ? 'bg-black/50 hover:bg-amber-950/60 border-amber-500/40 text-white'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              }`}
              title="EMP Defuser (Hotkey: W)"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-sm font-black text-amber-400">
                ⚡
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[9px] font-mono text-amber-300 font-bold uppercase">EMP [W]</div>
                <div className="text-xs font-black text-white tabular-nums flex items-center gap-1">
                  {tacticalCharges.emp > 0 ? (
                    `${tacticalCharges.emp} Left`
                  ) : (
                    <span className="text-amber-300 flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> RE-ARM
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* IN-GAME COINS HUD */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audio.playClickSound();
                useGameStore.getState().setShowIAP(true);
              }}
              className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 px-3 py-1.5 rounded-2xl border border-amber-400/60 backdrop-blur-md text-amber-300 shadow-md cursor-pointer transition-all active:scale-95"
              title="Architect Store - Buy Coins & Packages"
            >
              <Coins className="w-4 h-4 fill-current text-amber-400" />
              <span className="font-mono font-black text-xs tabular-nums text-white">
                {coins.toLocaleString()}
              </span>
              <div className="bg-amber-400 text-black rounded p-0.5 ml-0.5">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </button>
          </div>

          {/* AEGIS SHIELD STATUS POD (Right) */}
          <div className="pointer-events-auto">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (tacticalCharges.shield) {
                  setMessage('AEGIS BARRIER ACTIVE');
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
                  setMessage('AEGIS BARRIER ENGAGED!');
                  setTimeout(() => setMessage(''), 1000);
                } else {
                  audio.playTiltWarning();
                  setMessage('NO SHIELD CHARGES IN INVENTORY');
                  setTimeout(() => setMessage(''), 900);
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`px-3 py-2 rounded-2xl border backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                tacticalCharges.shield
                  ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] text-sky-300'
                  : 'bg-sky-950/40 hover:bg-sky-900/60 border-sky-500/50 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
              }`}
              title="Aegis Barrier"
            >
              <Shield className={`w-4 h-4 ${tacticalCharges.shield ? 'text-sky-400' : 'text-sky-300'}`} />
              <div className="text-left leading-tight">
                <div className="text-[9px] font-mono uppercase font-bold text-sky-300">AEGIS BARRIER</div>
                <div className="text-xs font-black text-white flex items-center gap-1">
                  {tacticalCharges.shield ? (
                    'ACTIVE'
                  ) : (
                    <span className="text-sky-300 font-mono text-[10px]">
                      OFFLINE
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Non-blocking in-game HUD feedback toasts (positioned cleanly at top, never covering the center playfield) */}
        <AnimatePresence>
          {message && state === 'playing' && (
            <motion.div 
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center max-w-[92vw]"
            >
              <div className="px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-[#FFD700] uppercase tracking-wider font-mono drop-shadow whitespace-nowrap">
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
                    QUICK-START FLIGHT TEST
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

      {/* Post Game Overlay - Bottom Center Sheet */}
      <AnimatePresence>
        {(state === 'won' || state === 'lost') && (
          <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden flex flex-col justify-end items-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto" />

            {/* Bottom Center Results Card - leaves upper tower and skyline visible */}
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#190E2D] p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-amber-400 shadow-[0_-12px_45px_rgba(0,0,0,0.9)] flex flex-col items-center pointer-events-auto z-10 touch-pan-y max-h-[85vh] overflow-y-auto"
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
                  className={`text-4xl sm:text-5xl font-black mb-1 uppercase tracking-wide ${
                    state === 'won' ? 'text-[#00ffcc] drop-shadow-[0_4px_0_#00aa88]' : 'text-[#FF4500] drop-shadow-[0_4px_0_#8B0000]'
                  }`}
                  style={{ WebkitTextStroke: '2px #fff' }}
                >
                  {state === 'won' ? 'CLEARED!' : 'BOOM!'}
                </motion.h2>
                
                <div className="text-2xl sm:text-3xl text-white font-black mb-5 drop-shadow-md" style={{ WebkitTextStroke: '1.5px #333' }}>
                  SCORE: {score}
                </div>

                {state === 'won' && pendingCoins > 0 ? (
                  <div className="flex flex-col space-y-3 w-full max-w-md">
                    <div className="text-xl text-[#FFD700] font-black text-center mb-1" style={{ WebkitTextStroke: '1px #333' }}>
                      +{pendingCoins} COINS EARNED!
                    </div>
                    <button
                      onClick={() => {
                        useGameStore.getState().showDoubleCoinsAd();
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#FFD700] border-3 border-white text-[#B8860B] rounded-2xl font-black text-lg uppercase transition-all shadow-[0_4px_0_#B8860B] active:translate-y-1 active:shadow-none cursor-pointer"
                    >
                      <Video className="w-6 h-6" />
                      <span>WATCH AD: 2X COINS</span>
                    </button>
                    <button
                      onClick={() => {
                        useGameStore.getState().addCoins(pendingCoins);
                        useGameStore.getState().setPendingCoins(0);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 border-2 border-white/50 text-white rounded-2xl font-black text-base uppercase transition-all shadow-md active:translate-y-1 cursor-pointer"
                    >
                      <span>CLAIM NORMAL</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-4 w-full max-w-md">
                    <button
                      onClick={() => {
                        useGameStore.getState().checkAndTriggerAd(false);
                        setState('idle');
                        if (mode !== 'campaign') {
                          useGameStore.getState().setMode('menu');
                        }
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3.5 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-2xl font-black text-base uppercase transition-all cursor-pointer shadow-md"
                    >
                      <Home className="w-5 h-5" strokeWidth={2.5} />
                      <span>HOME</span>
                    </button>

                    {(state === 'lost' || mode !== 'campaign') && (
                      <button
                        onClick={() => {
                          setScore(0);
                          setState('playing');
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 rounded-2xl font-black text-base uppercase transition-all shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none cursor-pointer"
                      >
                        <RotateCcw className="w-5 h-5" strokeWidth={3} />
                        <span>RETRY</span>
                      </button>
                    )}
                    
                    {state === 'won' && mode === 'campaign' && (
                      <button
                        onClick={() => {
                          useGameStore.getState().setLevel(useGameStore.getState().unlockedLevels);
                          setState('playing');
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3.5 bg-[#4facfe] hover:bg-[#3b9be8] border-2 border-white text-white rounded-2xl font-black text-base uppercase transition-all shadow-[0_4px_0_#2a82c9] active:translate-y-1 active:shadow-none cursor-pointer"
                      >
                        <Play className="w-5 h-5" fill="currentColor" />
                        <span>NEXT</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

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
