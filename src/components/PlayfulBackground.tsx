import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../game/store';
import { 
  environmentRenderer, 
  resolveActiveWorld, 
  ActiveWorldInfo, 
  EnvironmentPerformanceMetrics,
  EnvironmentalLightSourceType,
  DEFAULT_PARALLAX_LAYERS
} from '../game/EnvironmentRenderer';
import { 
  Activity, 
  Gauge, 
  ShieldCheck, 
  Sparkles, 
  CloudFog, 
  Sun, 
  Moon, 
  Flame, 
  Zap, 
  Waves, 
  Radio, 
  Compass, 
  Lightbulb,
  Wind,
  Snowflake,
  CloudRain,
  Layers,
  ArrowUp,
  Mountain,
  Move
} from 'lucide-react';

export function PlayfulBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPerfStats, setShowPerfStats] = useState(false);
  const [perfMetrics, setPerfMetrics] = useState<EnvironmentPerformanceMetrics | null>(null);
  const [activeWorld, setActiveWorld] = useState<ActiveWorldInfo | null>(null);

  // Subscribe to changes in mode, level, tournament, equipped cosmetics, and tower height
  const mode = useGameStore((s) => s.mode);
  const gameState = useGameStore((s) => s.state);
  const level = useGameStore((s) => s.level);
  const towerHeight = useGameStore((s) => s.towerHeight);
  const equippedBackground = useGameStore((s) => s.equippedBackground);
  const activeTournament = useGameStore((s) => s.activeTournament);
  const visualTheme = useGameStore((s) => s.visualTheme);

  useEffect(() => {
    // Keyboard shortcuts: 'p' panel, 'b' bloom, 'h' depth haze, 'l' lighting pass, 'w' weather, 't' parallax
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'p' || e.key === 'P') {
        setShowPerfStats((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        environmentRenderer.setBloomEnabled(!environmentRenderer.bloomEnabled);
      } else if (e.key === 'h' || e.key === 'H') {
        environmentRenderer.setDepthHazeEnabled(!environmentRenderer.depthHazeEnabled);
      } else if (e.key === 'l' || e.key === 'L') {
        environmentRenderer.setLightingPassEnabled(!environmentRenderer.lightingPassEnabled);
      } else if (e.key === 'w' || e.key === 'W') {
        environmentRenderer.setWeatherEnabled(!environmentRenderer.weatherEnabled);
      } else if (e.key === 't' || e.key === 'T') {
        environmentRenderer.setParallaxEnabled(!environmentRenderer.parallaxEnabled);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number = 0;
    const startTime = performance.now();
    let time = 0;
    let lastMetricUpdate = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal fill-rate performance
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Interactive pointer movement tracking for organic stereoscopic parallax tilt
    const handlePointerMove = (e: PointerEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      environmentRenderer.updatePointer(normX, normY);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    resize();

    const render = (now: number) => {
      time = now - startTime;

      // 1. Resolve dynamic cinematic world based on active level, tournament, and mode
      const currentState = useGameStore.getState();
      const worldInfo = resolveActiveWorld({
        mode: currentState.mode,
        state: currentState.state,
        level: currentState.level,
        equippedBackground: currentState.equippedBackground,
        activeTournament: currentState.activeTournament,
        visualTheme: currentState.visualTheme,
      });

      const logicalW = Math.max(1, Math.floor(window.innerWidth || 1));
      const logicalH = Math.max(1, Math.floor(window.innerHeight || 1));

      // 2. Render dynamic environment through EnvironmentRenderer with verticality and multi-layered parallax
      environmentRenderer.render(
        ctx,
        logicalW,
        logicalH,
        time,
        worldInfo,
        currentState.towerHeight || 0,
        currentState.mode,
        currentState.state,
        currentState.towerTilt || 0
      );

      // 3. Update performance, lighting & parallax metrics at controlled intervals
      if (now - lastMetricUpdate > 250) {
        lastMetricUpdate = now;
        setActiveWorld(worldInfo);
        setPerfMetrics(environmentRenderer.getPerformanceMetrics(logicalW, logicalH));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mode, gameState, level, towerHeight, equippedBackground, activeTournament, visualTheme]);

  // Helper to render appropriate light source icon based on active identity
  const renderLightSourceIcon = (type?: EnvironmentalLightSourceType) => {
    switch (type) {
      case 'lava-thermal':
        return <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />;
      case 'neon-emissive':
        return <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />;
      case 'lunar-directional':
      case 'moonlit-nautical':
        return <Moon className="w-3.5 h-3.5 text-blue-200" />;
      case 'solar-radiance':
      case 'desert-blaze':
      case 'sunset-rim':
      case 'dusty-solar':
      case 'sky-aether':
        return <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '18s' }} />;
      case 'hydro-caustic':
      case 'aurora-ionization':
        return <Waves className="w-3.5 h-3.5 text-teal-300" />;
      case 'toxic-radiant':
        return <Radio className="w-3.5 h-3.5 text-lime-400 animate-pulse" />;
      case 'celestial-gilded':
      case 'sugar-prismatic':
      case 'stellar-nebula':
      case 'geode-fluorescent':
      case 'bioluminescent-canopy':
        return <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-amber-200" />;
    }
  };

  const lighting = perfMetrics?.lightingState;
  const currentLightIntensityPct = lighting ? Math.round(lighting.currentIntensity * 100) : 75;
  const currentShadowHardnessPct = lighting ? Math.round(lighting.shadowHardness * 100) : 50;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0 block"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Discrete Performance & Light Identity button in bottom-left */}
      <div className="fixed bottom-2 left-2 z-30 pointer-events-auto flex items-center gap-1.5">
        <button
          onClick={() => setShowPerfStats((prev) => !prev)}
          title="Toggle Cinematic Environment Lighting & Performance Tool (Shortcut: P)"
          className="opacity-40 hover:opacity-100 transition-all p-1.5 rounded-lg bg-black/70 border border-white/10 text-white/80 hover:text-cyan-300 text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-sm shadow-lg"
          style={{
            borderColor: lighting?.effectiveColor ? `${lighting.effectiveColor}40` : undefined,
          }}
        >
          {renderLightSourceIcon(lighting?.identity.type)}
          <span className="hidden sm:inline">
            {perfMetrics ? `${perfMetrics.fps} FPS` : 'LIGHT'}
          </span>
          {lighting && (
            <span
              className="text-[9px] px-1 py-0.2 rounded font-bold"
              style={{
                backgroundColor: `${lighting.effectiveColor}25`,
                color: lighting.effectiveColor,
              }}
            >
              {currentLightIntensityPct}%
            </span>
          )}
          {perfMetrics && (
            <span
              className="text-[9px] px-1 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 flex items-center gap-0.5"
              title="Camera Altitude & Multi-layered Parallax Verticality"
            >
              <Layers className="w-2.5 h-2.5" />
              {perfMetrics.parallaxAltitudeMeters}m
            </span>
          )}
        </button>
      </div>

      {/* Cinematic Environment Performance & Light Identity Tool Overlay */}
      {showPerfStats && perfMetrics && activeWorld && lighting && (
        <div className="fixed top-16 left-3 z-40 bg-black/90 border border-cyan-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-white font-mono text-[11px] pointer-events-auto max-w-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase text-[10px]">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              ENVIRONMENTAL LIGHT & TELEMETRY
            </span>
            <button
              onClick={() => setShowPerfStats(false)}
              className="text-white/50 hover:text-white px-1 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            {/* World Identification */}
            <div className="flex justify-between items-center text-white/80">
              <span className="text-white/50">Active World:</span>
              <span className="font-bold text-amber-300 truncate max-w-[150px]">
                {activeWorld.worldName}
              </span>
            </div>

            <div className="flex justify-between items-center text-white/80">
              <span className="text-white/50">World Identifier:</span>
              <span className="text-cyan-300">{activeWorld.worldId}</span>
            </div>

            <div className="flex justify-between items-center text-white/80">
              <span className="text-white/50">Game Mode:</span>
              <span className="text-emerald-400 capitalize">{mode}</span>
            </div>

            <div className="flex justify-between items-center text-white/80">
              <span className="text-white/50">Active Level:</span>
              <span className="text-yellow-400">Level {level}</span>
            </div>

            {/* Environmental Light Source Identity Card */}
            <div className="border-t border-white/15 pt-2 mt-1.5 bg-white/5 p-2 rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/70">
                  {renderLightSourceIcon(lighting.identity.type)}
                  <span className="truncate max-w-[170px]" style={{ color: lighting.effectiveColor }}>
                    {lighting.identity.sourceName}
                  </span>
                </span>
                <button
                  onClick={() => environmentRenderer.setLightingPassEnabled(!environmentRenderer.lightingPassEnabled)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                    perfMetrics.lightingPassActive
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/20 text-white/40'
                  }`}
                  title="Toggle Environmental Lighting Pass [L]"
                >
                  {perfMetrics.lightingPassActive ? 'LIGHT [L]' : 'OFF [L]'}
                </button>
              </div>

              <p className="text-[9.5px] text-white/60 leading-tight mb-1.5">
                {lighting.identity.description}
              </p>

              {/* Dynamic Light Intensity Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/50">Light Intensity:</span>
                  <span className="font-bold" style={{ color: lighting.effectiveColor }}>
                    {currentLightIntensityPct}% ({lighting.identity.frequencyLabel})
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${currentLightIntensityPct}%`,
                      backgroundColor: lighting.effectiveColor,
                      boxShadow: `0 0 8px ${lighting.effectiveColor}`,
                    }}
                  />
                </div>
              </div>

              {/* Shadow Hardness & Source Angle */}
              <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9.5px]">
                <div className="flex justify-between items-center text-white/70">
                  <span className="text-white/40">Shadow:</span>
                  <span className={currentShadowHardnessPct > 80 ? 'text-cyan-300 font-bold' : 'text-white/80'}>
                    {currentShadowHardnessPct}% {currentShadowHardnessPct > 80 ? '(Vacuum)' : '(Soft)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span className="text-white/40">Direction:</span>
                  <span className="text-white/80">{lighting.identity.directionalAngleDeg}°</span>
                </div>
              </div>
            </div>

            {/* Performance Framerate */}
            <div className="border-t border-white/10 pt-1.5 mt-1 flex justify-between items-center">
              <span className="text-white/50">Rendering Framerate:</span>
              <span
                className={`font-black ${
                  perfMetrics.fps >= 55
                    ? 'text-emerald-400'
                    : perfMetrics.fps >= 40
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {perfMetrics.fps} FPS
              </span>
            </div>

            <div className="flex justify-between items-center text-white/80">
              <span className="text-white/50">Frame Render Time:</span>
              <span className="text-white">{perfMetrics.frameTimeMs} ms</span>
            </div>

            {/* Post-Processing Bloom Control */}
            <div className="border-t border-white/10 pt-1.5 mt-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-white/70">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Emissive Bloom:</span>
                </span>
                <button
                  onClick={() => environmentRenderer.setBloomEnabled(!environmentRenderer.bloomEnabled)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    perfMetrics.bloomActive
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/20 text-white/40'
                  }`}
                >
                  {perfMetrics.bloomActive ? 'ACTIVE [B]' : 'OFF [B]'}
                </button>
              </div>

              {perfMetrics.bloomActive && (
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-white/40">Glow Intensity:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={perfMetrics.bloomIntensity}
                    onChange={(e) => environmentRenderer.setBloomIntensity(parseFloat(e.target.value))}
                    className="w-24 h-1.5 accent-amber-400 bg-white/10 rounded cursor-pointer"
                  />
                  <span className="text-amber-300 w-6 text-right">
                    {Math.round(perfMetrics.bloomIntensity * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Depth-Dependent Haze Control */}
            <div className="border-t border-white/10 pt-1.5 mt-1 flex items-center justify-between">
              <span className="flex items-center gap-1 text-white/70">
                <CloudFog className="w-3 h-3 text-cyan-300" />
                <span>Depth Haze:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: perfMetrics.activeHazeColor }}
                  title="Atmospheric optical scattering color"
                />
                <button
                  onClick={() => environmentRenderer.setDepthHazeEnabled(!environmentRenderer.depthHazeEnabled)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    perfMetrics.depthHazeActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/20 text-white/40'
                  }`}
                >
                  {perfMetrics.depthHazeActive ? 'ACTIVE [H]' : 'OFF [H]'}
                </button>
              </div>
            </div>

            {/* Dynamic Weather Particle Control */}
            <div className="border-t border-white/10 pt-1.5 mt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  {perfMetrics.weatherCategory === 'snow' ? (
                    <Snowflake className="w-3 h-3 text-cyan-300 animate-spin" style={{ animationDuration: '10s' }} />
                  ) : perfMetrics.weatherCategory === 'rain' || perfMetrics.weatherCategory === 'storm' ? (
                    <CloudRain className="w-3 h-3 text-blue-300" />
                  ) : (
                    <Wind className="w-3 h-3 text-teal-300" />
                  )}
                  <span className="truncate max-w-[130px]" title={perfMetrics.weatherName}>
                    {perfMetrics.weatherName}
                  </span>
                </span>
                <button
                  onClick={() => environmentRenderer.setWeatherEnabled(!environmentRenderer.weatherEnabled)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    perfMetrics.weatherActive
                      ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                      : 'bg-white/5 border-white/20 text-white/40'
                  }`}
                  title="Toggle Dynamic Weather Particles [W]"
                >
                  {perfMetrics.weatherActive ? 'ACTIVE [W]' : 'OFF [W]'}
                </button>
              </div>

              {perfMetrics.weatherActive && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-white/60">
                    <span>Particles ({perfMetrics.activeParticleCount}):</span>
                    <span className="text-teal-300 font-bold">
                      {Math.round(perfMetrics.weatherIntensity * 100)}%
                      {perfMetrics.weatherHeightMultiplier && perfMetrics.weatherHeightMultiplier > 1.05 && (
                        <span className="text-emerald-400 ml-1 font-mono text-[9px]" title="Tower Altitude Intensity Escalation">
                          (x{perfMetrics.weatherHeightMultiplier} climb)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="text-white/40">Density:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="1.5"
                      step="0.05"
                      value={perfMetrics.weatherIntensity}
                      onChange={(e) => environmentRenderer.setWeatherIntensity(parseFloat(e.target.value))}
                      className="w-24 h-1.5 accent-teal-400 bg-white/10 rounded cursor-pointer"
                    />
                    <span className="text-teal-300 w-6 text-right">
                      {perfMetrics.weatherIntensity}x
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Layered Parallax & Altitude Verticality System */}
            <div className="border-t border-white/10 pt-1.5 mt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span className="font-bold text-cyan-300">Multi-Layer Parallax:</span>
                </span>
                <button
                  onClick={() => environmentRenderer.setParallaxEnabled(!environmentRenderer.parallaxEnabled)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    perfMetrics.parallaxActive
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/20 text-white/40'
                  }`}
                  title="Toggle Multi-Layer Parallax System [T]"
                >
                  {perfMetrics.parallaxActive ? 'ACTIVE [T]' : 'OFF [T]'}
                </button>
              </div>

              {perfMetrics.parallaxActive && (
                <div className="space-y-1.5 bg-white/5 p-2 rounded-lg border border-cyan-500/20">
                  {/* Altitude & Verticality Telemetry */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/50 flex items-center gap-1">
                      <ArrowUp className="w-2.5 h-2.5 text-emerald-400" />
                      Camera Altitude:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-yellow-300">{perfMetrics.parallaxAltitudeMeters}m</span>
                      <span className="text-[8.5px] px-1 py-0.2 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                        {perfMetrics.activeAltitudeTier}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9.5px] text-white/70">
                    <span className="text-white/40">Tower Height:</span>
                    <span className="text-emerald-300 font-mono font-bold">
                      {towerHeight || 0} Blocks
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9.5px] text-white/70">
                    <span className="text-white/40">Ascent Rate:</span>
                    <span className="font-mono text-cyan-200">
                      {perfMetrics.parallaxVerticalVelocity > 0 ? '+' : ''}
                      {perfMetrics.parallaxVerticalVelocity} px/s
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-amber-200/90 pt-0.5 border-t border-white/10">
                    <span className="text-white/40">Milestone:</span>
                    <span className="truncate max-w-[150px] font-bold">
                      {perfMetrics.activeMilestoneTitle}
                    </span>
                  </div>

                  {/* 6-Plane Parallax Layer Disparity Visualizer */}
                  <div className="pt-1 border-t border-white/10 space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-white/50">
                      <span>Depth Plane Separation:</span>
                      <span className="text-cyan-300">{perfMetrics.parallaxLayersCount} Layers</span>
                    </div>
                    <div className="grid grid-cols-6 gap-0.5 h-3 bg-black/60 p-0.5 rounded border border-white/10">
                      {DEFAULT_PARALLAX_LAYERS.map((layer, idx) => (
                        <div
                          key={layer.id}
                          className="h-full rounded-sm relative group cursor-help transition-all"
                          style={{
                            backgroundColor: idx === 0 ? '#3b82f6' : (idx === 1 ? '#06b6d4' : (idx === 2 ? '#10b981' : (idx === 3 ? '#eab308' : (idx === 4 ? '#f97316' : '#ec4899')))),
                            opacity: 0.6 + (layer.speedRatio / 1.45) * 0.4,
                          }}
                          title={`Plane ${idx}: ${layer.name} (${layer.speedRatio}x Speed)`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] text-white/40 px-0.5">
                      <span>Celestial (0.05x)</span>
                      <span>Cloud (1.15x)</span>
                      <span>Milestones (1.45x)</span>
                    </div>
                  </div>

                  {/* Parallax Multiplier Slider */}
                  <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-2 text-[10px]">
                    <span className="text-white/40">Depth Scale:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.05"
                      value={perfMetrics.parallaxIntensity}
                      onChange={(e) => environmentRenderer.setParallaxIntensity(parseFloat(e.target.value))}
                      className="w-24 h-1.5 accent-cyan-400 bg-white/10 rounded cursor-pointer"
                    />
                    <span className="text-cyan-300 w-6 text-right">
                      {perfMetrics.parallaxIntensity}x
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-white/40">
            <span>[P] HUD • [L] Light • [B] Bloom • [H] Haze • [W] Weather • [T] Parallax</span>
            <span className="flex items-center gap-1 text-cyan-400/80">
              <ShieldCheck className="w-3 h-3" /> 60 FPS Target
            </span>
          </div>
        </div>
      )}
    </>
  );
}
