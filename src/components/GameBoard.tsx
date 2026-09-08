import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/store';
import { useDailyStore } from '../game/dailyStore';
import { generateLevel, generateEndless, BlockDef } from '../game/LevelGenerator';
import { trackEvent } from '../game/eventDispatcher';
import { renderBlock, renderPlate, renderBoomParticle, getBoomColor } from '../game/themeRenderer';
import { audio } from '../audio/AudioEngine';
import { ArrowLeft, RotateCcw, Play, Video, Home } from 'lucide-react';

interface ActiveBlock extends BlockDef {
  distance: number; // 100 to 0 (center)
  spawnedAt: number;
  handled: boolean;
  success?: boolean;
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
  const { mode, level, state, setState, unlockNextLevel, setScore, score, updateHighScore, highScores, pendingCoins, equippedCosmetic, equippedBoomEffect } = useGameStore();
  
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
    shake: 0,
      hasRevived: false
  });

  const initGame = () => {
    let queue: BlockDef[] = [];
    if (mode === 'campaign') {
      queue = generateLevel(level);
    } else if (mode === 'endless') {
      queue = generateEndless(Math.random() * 1000000, 999, 1);
    } else if (mode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      let seed = 0;
      for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
      queue = generateEndless(seed, 100, 3);
    }
    
    setTotalBlocks(queue.length);
    setBuiltCount(0);
    setMessage(mode === 'campaign' ? `LEVEL ${level}` : mode.toUpperCase());
    
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
      shake: 0,
      hasRevived: false
    };
    
    setTimeout(() => setMessage(''), 1500);
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
    };
  }, [state, level, mode]);

  const lastActionTimeRef = useRef(0);

  const handleAction = () => {
    const now = performance.now();
    if (now - lastActionTimeRef.current < 200) return; // Prevent double-firing from simultaneous touch/pointer events
    lastActionTimeRef.current = now;

    if (state !== 'playing' || gameStateRef.current.isGameOver) return;
    
    const gs = gameStateRef.current;
    
    // Find the closest unhandled block
    const targetBlock = gs.blocks.reduce((closest, b) => {
        if (b.handled) return closest;
        if (!closest) return b;
        return b.distance < closest.distance ? b : closest;
    }, null as ActiveBlock | null);
    
    if (!targetBlock) return;
    
    const w = canvasRef.current?.width || window.innerWidth;
    const h = canvasRef.current?.height || window.innerHeight;
    const gameRadius = Math.min(w, h) * 0.45;
    
    // Convert distance percentage to actual distance context
    // Target zone is distance 12 to -10
    if (targetBlock.distance > 25) {
        targetBlock.handled = true;
        gameOver(false, 'TOO EARLY!');
        createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
    } else if (targetBlock.distance < -15) {
        // Ignored, gameloop will catch it.
    } else {
        if (targetBlock.distance > 15) {
            targetBlock.handled = true;
            gameOver(false, 'TOO EARLY!');
            createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
        } else {
            // Perfect hit zone!
            targetBlock.handled = true;
            if (targetBlock.type === 'boom') {
                gameOver(false, 'YOU BUILT A BOMB!');
                createExplosionAtDistance(targetBlock, gameRadius, w, h, '#ef4444');
            } else {
                // Success!
                targetBlock.success = true;
                gs.builtCount++;
                gs.combo++;
                setBuiltCount(gs.builtCount);
                trackEvent('BUILD_SUCCESS');
                setScore(gs.builtCount * 10 * gs.combo);
                
                audio.playBuildSound(1 + (gs.combo * 0.05));
                createExplosionAtDistance(targetBlock, gameRadius, w, h, '#00ffcc');
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
    if (win) {
      audio.playPerfectSound();
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
      gameStateRef.current.shake = 30; // Massive camera shake
      setMessage(reason || 'BOOM!');
      if (mode !== 'campaign') updateHighScore(mode, useGameStore.getState().score);
      
      setTimeout(() => {
        // Trigger Revive logic once per run
        setState('lost');
        if (mode !== 'menu' && !gameStateRef.current.hasRevived) {
           useGameStore.getState().showReviveAd();
        }
      }, 1500);
    }
  };

  const createExplosion = (x: number, y: number, color: string, count: number = 30) => {
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

    if (gs.isGameOver) {
      draw(time);
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
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
      
      const moveAmount = (100 / (b.speed * 1000)) * dt; 
      b.distance -= moveAmount;

      if (b.handled) continue;
      
      // Check missed BUILD
      if (b.type === 'build' && b.distance < -15) {
        b.handled = true;
        gameOver(false, 'TOO LATE!');
        createExplosionAtDistance(b, gameRadius, w, h, '#f59e0b');
      }
      
      // Check cleared BOOM
      if (b.type === 'boom' && b.distance < -15) {
        b.handled = true; // safely passed
      }
    }
    
    // Cleanup handled blocks once they are well off screen
    gs.blocks = gs.blocks.filter(b => !b.handled || b.distance > -150);

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
    const cx = w / 2;
    const cy = h * 0.65;
    const gameRadius = Math.min(w, h) * 0.45;
    const gs = gameStateRef.current;
    
    // Clear Canvas directly
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    
    // Screen Shake
    if (gs.shake > 0) {
      const dx = (Math.random() - 0.5) * gs.shake;
      const dy = (Math.random() - 0.5) * gs.shake;
      ctx.translate(dx, dy);
      gs.shake *= 0.9;
      if (gs.shake < 0.5) gs.shake = 0;
    }

    // Center Platform (Chunky Floating Island)
    const bounce = Math.sin(time / 200) * 3;
    
    renderPlate(ctx, cx - 50, cy + bounce - 5, 100, 30, useGameStore.getState().equippedPlate || "plate-0", time);

    // Center Tower (Built Playful Blocks)
    const towerLayers = Math.min(gs.builtCount, 30);
    for (let i = 0; i < towerLayers; i++) {
        const offset = i * 20;
        const squash = (i === gs.builtCount - 1 && time - gs.lastSpawnTime < 200) ? 0.8 : 1;
        
        ctx.save();
        ctx.translate(cx, cy + bounce - offset - 10);
        ctx.scale(1 / squash, squash);
        
        const colors = ['#FFD700', '#FF9A8B', '#A8E6CF', '#59C1FF'];
        const color = colors[i % colors.length];
        
        renderBlock(ctx, -30, -15, 60, 30, equippedCosmetic || "skin-0", true, time);
        
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
          renderBlock(ctx, -15, -15, 30, 30, equippedCosmetic || "skin-0", false, time);
      } else {
          renderBoomParticle(ctx, { x: 0, y: 0, rotation: 0, life: 1, size: 18, type: 'projectile' }, time, activeBoom);
      }
      ctx.restore();

      ctx.globalAlpha = 1.0;

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
    
    ctx.globalAlpha = 1.0;
    ctx.restore();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <button 
          onClick={() => {
            useGameStore.getState().checkAndTriggerAd(false);
            setState('idle');
            if (mode !== 'campaign') {
              useGameStore.getState().setMode('menu');
            }
          }}
          className="pointer-events-auto p-4 bg-white border-4 border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-[0_4px_0_#d1d5db] active:translate-y-1 active:shadow-[0_0px_0_#d1d5db]"
        >
          <ArrowLeft className="w-8 h-8 text-gray-700" strokeWidth={3} />
        </button>
        
        <div className="text-right">
          <div className="text-white font-black uppercase tracking-widest text-lg" style={{ WebkitTextStroke: '1px #3FA1DF', textShadow: '0 2px 0 #3FA1DF' }}>
            {mode === 'campaign' ? `LEVEL ${level}` : mode}
          </div>
          <div className="text-5xl font-black text-white tabular-nums" style={{ WebkitTextStroke: '2px #FFD700', textShadow: '0 4px 0 #B8860B' }}>
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
        onMouseDown={(e) => {
          handleAction();
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
        
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: -20, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, rotate: 5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <h2 className="text-5xl md:text-8xl font-black text-[#FFD700] uppercase tracking-wide drop-shadow-[0_8px_0_#B8860B]" style={{ WebkitTextStroke: '3px #8B4513' }}>
                {message}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post Game Overlay */}
      <AnimatePresence>
        {(state === 'won' || state === 'lost') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
          >
            <motion.h2 
              initial={{ y: 20, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              className={`text-6xl md:text-[6rem] font-black mb-4 uppercase tracking-wide ${
                state === 'won' ? 'text-[#00ffcc] drop-shadow-[0_8px_0_#00aa88]' : 'text-[#FF4500] drop-shadow-[0_8px_0_#8B0000]'
              }`}
              style={{ WebkitTextStroke: '3px #fff' }}
            >
              {state === 'won' ? 'CLEARED' : 'BOOM!'}
            </motion.h2>
            
            <div className="text-4xl text-white font-black mb-12 drop-shadow-md" style={{ WebkitTextStroke: '2px #333' }}>
              SCORE: {score}
            </div>

            {state === 'won' && pendingCoins > 0 ? (
              <div className="flex flex-col space-y-4 w-full max-w-md">
                <div className="text-2xl text-[#FFD700] font-black text-center mb-4" style={{ WebkitTextStroke: '1px #333' }}>
                  +{pendingCoins} COINS EARNED!
                </div>
                <button
                  onClick={() => {
                    useGameStore.getState().showDoubleCoinsAd();
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-8 py-5 bg-[#FFD700] border-4 border-white text-[#B8860B] rounded-3xl font-black text-2xl uppercase transition-all shadow-[0_6px_0_#B8860B] active:translate-y-2 active:shadow-[0_0px_0_#B8860B]"
                >
                  <Video className="w-8 h-8" />
                  <span>WATCH AD: 2X COINS</span>
                </button>
                <button
                  onClick={() => {
                    useGameStore.getState().addCoins(pendingCoins);
                    useGameStore.getState().setPendingCoins(0);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-8 py-5 bg-gray-400 border-4 border-white text-white rounded-3xl font-black text-xl uppercase transition-all shadow-[0_6px_0_#6b7280] active:translate-y-2 active:shadow-[0_0px_0_#6b7280]"
                >
                  <span>CLAIM NORMAL</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md">
                <button
                  onClick={() => {
                    useGameStore.getState().checkAndTriggerAd(false);
                    setState('idle');
                    if (mode !== 'campaign') {
                      useGameStore.getState().setMode('menu');
                    }
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-5 bg-gray-200 border-4 border-white text-gray-800 rounded-3xl font-black text-xl uppercase transition-all shadow-[0_6px_0_#9ca3af] active:translate-y-2 active:shadow-[0_0px_0_#9ca3af]"
                >
                  <Home className="w-6 h-6" strokeWidth={3} />
                  <span>HOME</span>
                </button>

                {(state === 'lost' || mode !== 'campaign') && (
                  <button
                    onClick={() => {
                      setScore(0);
                      setState('playing');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-5 bg-white border-4 border-gray-200 text-gray-800 rounded-3xl font-black text-xl uppercase transition-all shadow-[0_6px_0_#d1d5db] active:translate-y-2 active:shadow-[0_0px_0_#d1d5db]"
                  >
                    <RotateCcw className="w-6 h-6" strokeWidth={3} />
                    <span>RETRY</span>
                  </button>
                )}
                
                {state === 'won' && mode === 'campaign' && (
                  <button
                    onClick={() => {
                      useGameStore.getState().setLevel(useGameStore.getState().unlockedLevels);
                      setState('playing');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-5 bg-[#4facfe] border-4 border-white text-white rounded-3xl font-black text-xl uppercase transition-all shadow-[0_6px_0_#2a82c9] active:translate-y-2 active:shadow-[0_0px_0_#2a82c9]"
                  >
                    <Play className="w-6 h-6" fill="currentColor" />
                    <span>NEXT</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
