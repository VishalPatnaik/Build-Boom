import { TowerPhysicsState } from './physicsEngine';
import { BlockDef, BlockArchetype } from './LevelGenerator';
import { audio } from '../audio/AudioEngine';

export interface ReplayBlockSnapshot {
  id: number;
  type: 'build' | 'boom';
  speed: number;
  angle: number;
  distance: number;
  handled: boolean;
  success?: boolean;
  archetype?: BlockArchetype;
  modifier?: 'ghost' | 'fake-boom' | 'fake-build' | 'blink';
  mass?: number;
}

export interface ReplayEventMarker {
  id: string;
  timeMs: number; // millisecond timestamp relative to replay start (0 to 10000ms)
  type: 'stack' | 'boom' | 'shield' | 'collapse' | 'perfect' | 'early' | 'powerup';
  label: string;
  color: string;
  archetype?: string;
  mass?: number;
}

export interface ReplayFrame {
  timeMs: number; // 0 to ~10,000 ms
  rawTime: number; // timestamp from requestAnimationFrame
  physics: {
    tiltAngle: number;
    angularVelocity: number;
    maxTiltAllowed: number;
    stressLevel: number;
    isUnstable: boolean;
    shieldActive: boolean;
    stasisActive: boolean;
    prismSurgeRemaining: number;
  };
  blocks: ReplayBlockSnapshot[];
  builtCount: number;
  combo: number;
  shake: number;
  score: number;
  message?: string;
  event?: ReplayEventMarker;
}

export interface ReplayData {
  id: string;
  recordedAt: number; // Unix timestamp Date.now()
  mode: string;
  level: number;
  durationMs: number; // e.g. 10,000 ms
  finalOutcome: 'won' | 'lost' | 'aborted' | 'active';
  finalReason?: string;
  finalScore: number;
  maxCombo: number;
  blocksPlaced: number;
  maxTilt: number;
  maxStress: number;
  equippedCosmetic: string | null;
  equippedPlate: string | null;
  equippedBackground: string | null;
  activeBoom: string;
  frames: ReplayFrame[];
  events: ReplayEventMarker[];
}

const STORAGE_KEY = 'build_or_boom_last_replay';
const WINDOW_DURATION_MS = 10000; // 10 seconds of physics history

/**
 * High-performance sliding ring buffer that records the last 10 seconds of game state.
 */
export class ReplayRecorder {
  private buffer: Array<{ rawTime: number; frame: Omit<ReplayFrame, 'timeMs'> }> = [];
  private pendingEvents: ReplayEventMarker[] = [];
  private lastRecordTime = 0;
  private readonly targetInterval = 25; // ~40 fps sampling rate (10s = 400 frames, lightweight & fluid)

  public reset() {
    this.buffer = [];
    this.pendingEvents = [];
    this.lastRecordTime = 0;
  }

  public logEvent(
    type: ReplayEventMarker['type'],
    label: string,
    color: string = '#00f2fe',
    meta?: { archetype?: string; mass?: number }
  ) {
    const rawTime = performance.now();
    this.pendingEvents.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timeMs: 0, // will be normalized during finalize
      type,
      label,
      color,
      archetype: meta?.archetype,
      mass: meta?.mass,
    });
  }

  public record(
    rawTime: number,
    physics: TowerPhysicsState,
    blocks: Array<BlockDef & { distance: number; handled: boolean; success?: boolean }>,
    builtCount: number,
    combo: number,
    shake: number,
    score: number,
    message?: string
  ) {
    // Throttle to steady sampling interval
    if (rawTime - this.lastRecordTime < this.targetInterval) {
      return;
    }
    this.lastRecordTime = rawTime;

    // Deep clone active blocks
    const blockSnapshots: ReplayBlockSnapshot[] = blocks.map((b) => ({
      id: b.id,
      type: b.type,
      speed: b.speed,
      angle: b.angle,
      distance: b.distance,
      handled: b.handled,
      success: b.success,
      archetype: b.archetype,
      modifier: b.modifier,
      mass: b.mass,
    }));

    // Attach latest pending event if any
    const event = this.pendingEvents.shift();

    this.buffer.push({
      rawTime,
      frame: {
        rawTime,
        physics: {
          tiltAngle: Number(physics.tiltAngle.toFixed(2)),
          angularVelocity: Number(physics.angularVelocity.toFixed(3)),
          maxTiltAllowed: physics.maxTiltAllowed,
          stressLevel: physics.stressLevel,
          isUnstable: physics.isUnstable,
          shieldActive: physics.shieldActive,
          stasisActive: physics.stasisActive,
          prismSurgeRemaining: physics.prismSurgeRemaining,
        },
        blocks: blockSnapshots,
        builtCount,
        combo,
        shake: Number(shake.toFixed(2)),
        score,
        message: message || undefined,
        event,
      },
    });

    // Prune frames older than 10 seconds relative to current rawTime
    const cutoffTime = rawTime - WINDOW_DURATION_MS;
    while (this.buffer.length > 0 && this.buffer[0].rawTime < cutoffTime) {
      this.buffer.shift();
    }
  }

  public finalize(meta: {
    mode: string;
    level: number;
    finalOutcome: 'won' | 'lost' | 'aborted' | 'active';
    finalReason?: string;
    equippedCosmetic: string | null;
    equippedPlate: string | null;
    equippedBackground: string | null;
    activeBoom: string;
  }): ReplayData | null {
    if (this.buffer.length < 2) {
      return null;
    }

    const startTime = this.buffer[0].rawTime;
    const endTime = this.buffer[this.buffer.length - 1].rawTime;
    const totalDuration = Math.max(100, endTime - startTime);

    let maxCombo = 0;
    let maxTilt = 0;
    let maxStress = 0;
    let finalScore = 0;
    let blocksPlaced = 0;
    const allEvents: ReplayEventMarker[] = [];

    // Normalize timestamps from 0 to totalDuration
    const normalizedFrames: ReplayFrame[] = this.buffer.map((item) => {
      const timeMs = Math.round(item.rawTime - startTime);
      const f = item.frame;

      if (f.combo > maxCombo) maxCombo = f.combo;
      if (Math.abs(f.physics.tiltAngle) > maxTilt) maxTilt = Math.abs(f.physics.tiltAngle);
      if (f.physics.stressLevel > maxStress) maxStress = f.physics.stressLevel;
      if (f.score > finalScore) finalScore = f.score;
      if (f.builtCount > blocksPlaced) blocksPlaced = f.builtCount;

      if (f.event) {
        f.event.timeMs = timeMs;
        allEvents.push(f.event);
      }

      return {
        ...f,
        timeMs,
      };
    });

    const replay: ReplayData = {
      id: `replay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      recordedAt: Date.now(),
      mode: meta.mode,
      level: meta.level,
      durationMs: totalDuration,
      finalOutcome: meta.finalOutcome,
      finalReason: meta.finalReason,
      finalScore,
      maxCombo,
      blocksPlaced,
      maxTilt: Number(maxTilt.toFixed(1)),
      maxStress,
      equippedCosmetic: meta.equippedCosmetic,
      equippedPlate: meta.equippedPlate,
      equippedBackground: meta.equippedBackground,
      activeBoom: meta.activeBoom,
      frames: normalizedFrames,
      events: allEvents,
    };

    saveLastReplay(replay);
    return replay;
  }
}

/**
 * Persist the latest replay to localStorage with size protection
 */
export function saveLastReplay(replay: ReplayData): void {
  try {
    const serialized = JSON.stringify(replay);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('Unable to persist replay to localStorage:', err);
  }
}

/**
 * Retrieve the saved replay from localStorage
 */
export function loadLastReplay(): ReplayData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.frames) && parsed.frames.length > 0) {
      return parsed as ReplayData;
    }
  } catch (err) {
    console.warn('Error loading replay from localStorage:', err);
  }
  return null;
}

/**
 * Generates an engaging synthetic demo replay (10 seconds) of high-tier tower physics
 * so players can immediately experience the Game Replay feature right from the menu!
 */
export function generateDemoReplay(): ReplayData {
  const durationMs = 10000;
  const fps = 40;
  const frameCount = Math.floor((durationMs / 1000) * fps);
  const frames: ReplayFrame[] = [];
  const events: ReplayEventMarker[] = [];

  let currentScore = 480;
  let currentCombo = 2;
  let builtCount = 8;
  let tilt = 4.2;
  let angularVel = 0.5;

  const stackMoments = [
    { frameIndex: 30, archetype: 'standard' as BlockArchetype, label: 'STANDARD LOCK', color: '#00ffcc', mass: 1.0 },
    { frameIndex: 75, archetype: 'gold_ingot' as BlockArchetype, label: '+50 GOLD INGOT', color: '#eab308', mass: 2.2 },
    { frameIndex: 120, archetype: 'prism' as BlockArchetype, label: '3X PRISM SURGE', color: '#00f2fe', mass: 0.6 },
    { frameIndex: 165, archetype: 'titan' as BlockArchetype, label: 'TITAN ANCHOR LOCKED', color: '#f59e0b', mass: 3.0 },
    { frameIndex: 215, archetype: 'standard' as BlockArchetype, label: 'PERFECT ALIGNMENT', color: '#00f2fe', mass: 1.0, isPerfect: true },
    { frameIndex: 280, archetype: 'standard' as BlockArchetype, label: 'COMBO 7X STREAK', color: '#ffd700', mass: 1.0 },
  ];

  for (let i = 0; i < frameCount; i++) {
    const timeMs = Math.round((i / frameCount) * durationMs);
    const progress = i / frameCount;

    // Simulate subtle natural pendulum oscillation
    angularVel += (-tilt * 0.08 + Math.sin(i * 0.12) * 0.25) * 0.04;
    angularVel *= 0.96;
    tilt += angularVel;

    let event: ReplayEventMarker | undefined;
    const stack = stackMoments.find((s) => s.frameIndex === i);
    if (stack) {
      builtCount++;
      currentCombo++;
      currentScore += builtCount * 25 * currentCombo;
      tilt = stack.archetype === 'titan' ? 0 : tilt * 0.4; // Titan stabilizes!
      angularVel = 0;

      event = {
        id: `demo-evt-${i}`,
        timeMs,
        type: stack.isPerfect ? 'perfect' : 'stack',
        label: stack.label,
        color: stack.color,
        archetype: stack.archetype,
        mass: stack.mass,
      };
      events.push(event);
    }

    // Active incoming projectiles
    const activeBlocks: ReplayBlockSnapshot[] = [];
    if (i < 30) {
      activeBlocks.push({
        id: 101,
        type: 'build',
        speed: 1.1,
        angle: -Math.PI / 2,
        distance: Math.max(0, 100 - (i / 30) * 100),
        handled: i >= 30,
        archetype: 'standard',
        mass: 1.0,
      });
    } else if (i < 75) {
      activeBlocks.push({
        id: 102,
        type: 'build',
        speed: 1.2,
        angle: Math.PI / 4,
        distance: Math.max(0, 100 - ((i - 30) / 45) * 100),
        handled: i >= 75,
        archetype: 'gold_ingot',
        mass: 2.2,
      });
    } else if (i < 120) {
      activeBlocks.push({
        id: 103,
        type: 'build',
        speed: 1.0,
        angle: Math.PI,
        distance: Math.max(0, 100 - ((i - 75) / 45) * 100),
        handled: i >= 120,
        archetype: 'prism',
        mass: 0.6,
      });
    } else if (i < 165) {
      activeBlocks.push({
        id: 104,
        type: 'build',
        speed: 1.3,
        angle: -Math.PI / 4,
        distance: Math.max(0, 100 - ((i - 120) / 45) * 100),
        handled: i >= 165,
        archetype: 'titan',
        mass: 3.0,
      });
    } else if (i < 215) {
      activeBlocks.push({
        id: 105,
        type: 'build',
        speed: 0.9,
        angle: Math.PI / 2,
        distance: Math.max(0, 100 - ((i - 165) / 50) * 100),
        handled: i >= 215,
        archetype: 'standard',
        mass: 1.0,
      });
    } else {
      activeBlocks.push({
        id: 106,
        type: 'build',
        speed: 1.15,
        angle: -Math.PI / 3,
        distance: Math.max(0, 100 - ((i - 215) / 65) * 100),
        handled: i >= 280,
        archetype: 'standard',
        mass: 1.0,
      });
    }

    const stressLevel = Math.min(100, Math.round((Math.abs(tilt) / 25) * 100));

    frames.push({
      timeMs,
      rawTime: i * (1000 / fps),
      physics: {
        tiltAngle: Number(tilt.toFixed(2)),
        angularVelocity: Number(angularVel.toFixed(3)),
        maxTiltAllowed: 25,
        stressLevel,
        isUnstable: stressLevel > 70,
        shieldActive: i > 200,
        stasisActive: i > 130 && i < 160,
        prismSurgeRemaining: i > 120 && i < 180 ? 4 : 0,
      },
      blocks: activeBlocks,
      builtCount,
      combo: currentCombo,
      shake: stack ? (stack.archetype === 'titan' ? 8 : 4) : 0,
      score: currentScore,
      message: stack?.label,
      event,
    });
  }

  return {
    id: 'demo-tactical-replay',
    recordedAt: Date.now() - 3600000,
    mode: 'campaign',
    level: 15,
    durationMs,
    finalOutcome: 'won',
    finalReason: 'STAGE CLEARED',
    finalScore: currentScore,
    maxCombo: currentCombo,
    blocksPlaced: builtCount,
    maxTilt: 12.8,
    maxStress: 51,
    equippedCosmetic: 'skin-0',
    equippedPlate: 'plate-0',
    equippedBackground: 'bg-0',
    activeBoom: 'boom-0',
    frames,
    events,
  };
}
