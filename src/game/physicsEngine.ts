// ---------------------------------------------------------------------------
// Tower physics
//
// The tower is modelled as a stack of rigid blocks, each resting at its own
// horizontal offset. Where a block lands depends on where it physically was
// when the player tapped (early taps land short on its approach side, late
// taps overshoot). Every frame the stack is checked level by level: if the
// centre of mass of everything above a block falls outside that block's
// footprint, the stack above it topples.
//
// On top of that the tower flexes (tiltAngle). Gravity acting on an
// off-centre centre of mass leans it further, the structure springs back,
// and taller towers get progressively less stiff. The lean shifts the upper
// blocks sideways, so sway can itself tip a badly built tower over.
// ---------------------------------------------------------------------------

/** Half width of a tower block, in tower-space pixels (blocks render 60 wide). */
export const BLOCK_HALF_WIDTH = 30;
/** Half width of the foundation plate the first block rests on. */
export const BASE_HALF_WIDTH = 42;
/** Vertical spacing between stacked layers, matching the renderer. */
export const LAYER_HEIGHT = 20;
/** Tap window: blocks can be stacked from distance +HIT_WINDOW to -HIT_WINDOW. */
export const HIT_WINDOW = 15;
/** Sideways slip (px) when a block is tapped at the very edge of the window. */
export const MAX_SLIP = 26;

export interface StackedBlock {
  x: number; // horizontal offset from the foundation centre, tower-space px
  mass: number;
}

export interface TowerPhysicsState {
  tiltAngle: number; // in degrees, e.g. -35 to +35
  angularVelocity: number;
  maxTiltAllowed: number;
  stressLevel: number; // 0 to 100%
  isUnstable: boolean;
  prismSurgeRemaining: number; // blocks remaining with 3x surge
  shieldActive: boolean;
  stasisActive: boolean;
  stasisEndTime: number;
  empCharges: number;
  stasisCharges: number;
  shieldCharges: number;
  /** Physical stack, bottom (index 0) to top. */
  stack: StackedBlock[];
  /** Mass-weighted centre of the whole tower relative to the foundation, px. */
  comOffset: number;
  /** Lowest level that is closest to tipping, and how close (0..1+). */
  weakestLevel: number;
  weakestRatio: number;
}

export function createInitialPhysicsState(
  perks: Record<string, number>,
  powerups?: { stasis?: number; emp?: number; shield?: number }
): TowerPhysicsState {
  const gyroTier = perks['structural_gyro'] || 0;
  let maxTilt = 25;
  if (gyroTier >= 3) maxTilt = 45;
  else if (gyroTier === 2) maxTilt = 38;
  else if (gyroTier === 1) maxTilt = 32;

  // Strict consumable inventory: powerups are NOT free; they must be purchased with coins or ads
  const stasisAvailable = powerups?.stasis ?? 0;
  const empAvailable = powerups?.emp ?? 0;
  const shieldAvailable = powerups?.shield ?? 0;

  return {
    tiltAngle: 0,
    angularVelocity: 0,
    maxTiltAllowed: maxTilt,
    stressLevel: 0,
    isUnstable: false,
    prismSurgeRemaining: 0,
    shieldActive: false,
    stasisActive: false,
    stasisEndTime: 0,
    empCharges: empAvailable,
    stasisCharges: stasisAvailable,
    shieldCharges: shieldAvailable,
    stack: [],
    comOffset: 0,
    weakestLevel: -1,
    weakestRatio: 0,
  };
}

/** Sideways displacement of layer `index` caused by the tower's flex, matching the renderer. */
export function flexOffset(tiltDeg: number, index: number, layers: number): number {
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const progress = (index + 1) / Math.max(1, layers);
  return Math.sin(tiltRad * progress) * (index * LAYER_HEIGHT);
}

/** Top surface x the next block will rest on. */
export function supportX(state: TowerPhysicsState): number {
  const s = state.stack;
  return s.length ? s[s.length - 1].x : 0;
}

/**
 * Where a tapped block lands relative to the block below it.
 * `distance` is the block's position along its approach path at tap time
 * (+ = still approaching, - = already past the centre); `angle` is its
 * approach direction. Vertical approaches still slip a little so timing
 * always matters.
 */
export function landingSlip(distance: number, angle: number, opticsTier = 0): number {
  const lateral = Math.cos(angle);
  const lateralEff = Math.abs(lateral) < 0.4 ? (lateral >= 0 ? 0.4 : -0.4) : lateral;
  const precision = 1 - Math.min(0.3, opticsTier * 0.1);
  const t = Math.max(-1, Math.min(1, distance / HIT_WINDOW));
  return lateralEff * t * MAX_SLIP * precision;
}

/**
 * Finds the lowest level whose supported load has its centre of mass outside
 * the supporting footprint. Returns -1 when the whole tower is standing.
 * Also records how close the weakest level is to tipping.
 */
export function findToppleLevel(state: TowerPhysicsState): number {
  const s = state.stack;
  const n = s.length;
  state.weakestLevel = -1;
  state.weakestRatio = 0;
  if (n === 0) return -1;

  // Effective positions including the flex lean
  const ex = new Array<number>(n);
  for (let j = 0; j < n; j++) ex[j] = s[j].x + flexOffset(state.tiltAngle, j, n);

  // Suffix sums let us get the centre of mass above every level in one pass
  let mass = 0;
  let moment = 0;
  let topple = -1;
  for (let i = n - 1; i >= 0; i--) {
    mass += s[i].mass;
    moment += s[i].mass * ex[i];
    const com = moment / mass;
    const support = i === 0 ? 0 : ex[i - 1];
    const half = i === 0 ? BASE_HALF_WIDTH : BLOCK_HALF_WIDTH;
    const ratio = Math.abs(com - support) / half;
    if (ratio > state.weakestRatio) {
      state.weakestRatio = ratio;
      state.weakestLevel = i;
    }
    if (ratio > 1) topple = i; // keep scanning down: lowest failure wins
  }
  return topple;
}

function recomputeCom(state: TowerPhysicsState) {
  let m = 0;
  let mx = 0;
  for (const b of state.stack) {
    m += b.mass;
    mx += b.mass * b.x;
  }
  state.comOffset = m > 0 ? mx / m : 0;
}

export type PlacementOutcome = 'stacked' | 'slid' | 'collapsed';

export interface PlacementResult {
  outcome: PlacementOutcome;
  slip: number; // px relative to the block below
  toppleLevel: number;
  fallen: StackedBlock[];
}

/**
 * Lands a block on the tower. A lone block hanging past the edge slides off;
 * if the new weight tips a lower level, everything above it collapses.
 * `forgiving` (tutorial) keeps every block on the tower.
 */
export function placeBlock(
  state: TowerPhysicsState,
  opts: {
    distance: number;
    angle: number;
    mass: number;
    archetype?: string;
    isPerfect: boolean;
    perks: Record<string, number>;
    forgiving?: boolean;
  }
): PlacementResult {
  const opticsTier = opts.perks['precision_optics'] || 0;
  let slip = landingSlip(opts.distance, opts.angle, opticsTier);
  if (opts.archetype === 'titan') slip = 0; // anchors lock dead centre
  else if (opts.isPerfect) slip *= 0.15; // perfect taps settle almost flush

  const base = supportX(state);
  if (opts.forgiving) slip = Math.max(-BLOCK_HALF_WIDTH * 0.6, Math.min(BLOCK_HALF_WIDTH * 0.6, slip));

  state.stack.push({ x: base + slip, mass: opts.mass });

  // Landing off-centre rocks the tower towards the overhang
  const massMomentum = Math.sqrt(Math.max(0.2, opts.mass));
  state.angularVelocity += (slip / BLOCK_HALF_WIDTH) * 1.6 * massMomentum;

  const level = opts.forgiving ? -1 : findToppleLevel(state);
  if (level === -1) {
    recomputeCom(state);
    return { outcome: 'stacked', slip, toppleLevel: -1, fallen: [] };
  }

  const fallen = state.stack.splice(level);
  recomputeCom(state);
  return {
    outcome: fallen.length <= 1 ? 'slid' : 'collapsed',
    slip,
    toppleLevel: level,
    fallen,
  };
}

/** Straightens the tower (used by revive): keeps height, removes overhang and sway. */
export function rebraceTower(state: TowerPhysicsState) {
  for (const b of state.stack) b.x *= 0.25;
  state.tiltAngle = 0;
  state.angularVelocity = 0;
  recomputeCom(state);
  findToppleLevel(state);
}

export function updateTowerPhysics(
  state: TowerPhysicsState,
  dtMs: number,
  perks: Record<string, number>,
  opts: { forgiving?: boolean } = {}
): { collapsed: boolean; warningAlert: boolean; toppleLevel: number } {
  // Clamp delta time to avoid large physics steps on mobile frame hitches or tab resumption
  const dt = Math.min(0.064, Math.max(0.001, (Number.isFinite(dtMs) ? dtMs : 16.67) / 1000));
  const gyroTier = perks['structural_gyro'] || 0;
  const n = state.stack.length;

  // Dampening coefficient increases with gyro tech
  const dampFactor = 0.9 + gyroTier * 0.025;
  // Taller towers are less stiff: the restoring spring weakens with height
  const baseSpring = 1.8 + gyroTier * 0.4;
  const spring = Math.max(0.55, baseSpring - n * 0.016);

  // Gravity on an off-centre mass leans the tower further, more so the taller it is
  const heightFactor = 1 + n / 22;
  const gravityTorque = 10 * (state.comOffset / BLOCK_HALF_WIDTH) * heightFactor;

  state.angularVelocity += (gravityTorque - state.tiltAngle * spring) * dt;
  state.angularVelocity *= Math.pow(dampFactor, dt * 60);
  state.tiltAngle += state.angularVelocity * dt * 20;

  const toppleLevel = opts.forgiving ? -1 : findToppleLevel(state);

  // Stress reflects whichever is closer to failing: the flex limit or the weakest joint
  const absTilt = Math.abs(state.tiltAngle);
  const tiltStress = absTilt / state.maxTiltAllowed;
  const jointStress = opts.forgiving ? 0 : state.weakestRatio;
  state.stressLevel = Math.min(100, Math.round(Math.max(tiltStress, jointStress) * 100));
  state.isUnstable = state.stressLevel > 75;

  const warningAlert = state.stressLevel > 80;
  const collapsed = absTilt >= state.maxTiltAllowed || toppleLevel !== -1;

  return { collapsed, warningAlert, toppleLevel };
}

export function applyBlockImpact(
  state: TowerPhysicsState,
  timingOffset: number, // 0 is dead center perfect, -15 to +15 is early/late
  arrivalAngle: number,
  archetype: 'standard' | 'prism' | 'titan' | 'gold_ingot' | 'toxic' = 'standard',
  perks: Record<string, number>,
  mass: number = 1.0
): {
  isPerfect: boolean;
  scoreMultiplier: number;
  bonusCoins: number;
  message: string;
} {
  const opticsTier = perks['precision_optics'] || 0;
  const gyroTier = perks['structural_gyro'] || 0;
  const midasTier = perks['midas_foundation'] || 0;

  // Perfect threshold expanded by optics tier
  const perfectThreshold = 3.5 * (1 + (opticsTier * 0.2));
  const isPerfect = Math.abs(timingOffset) <= perfectThreshold;

  let scoreMultiplier = 1.0;
  let bonusCoins = 0;
  let message = 'GOOD!';

  // Special archetype handling
  if (archetype === 'titan') {
    // Titan anchors cancel the sway outright (the stack's balance still matters afterwards)
    state.tiltAngle = 0;
    state.angularVelocity = 0;
    message = 'TITAN ANCHOR LOCKED!';
  } else if (archetype === 'gold_ingot') {
    bonusCoins += Math.round(50 * (1 + midasTier * 0.25));
    message = '+50 GOLD INGOT!';
  } else if (archetype === 'prism') {
    state.prismSurgeRemaining = 5;
    bonusCoins += Math.round(100 * (1 + midasTier * 0.25));
    message = '3X PRISM SURGE!';
  }

  if (state.prismSurgeRemaining > 0) {
    scoreMultiplier *= 3.0;
    state.prismSurgeRemaining--;
  }

  if (isPerfect) {
    message = archetype === 'titan' ? 'PERFECT! TITAN ANCHOR LOCKED!' : 'PERFECT!';
    scoreMultiplier *= opticsTier >= 2 ? 2.0 : 1.5;

    // Perfect hit damps existing sway (it cannot fix an off-centre stack)
    if (gyroTier >= 3) {
      state.angularVelocity = 0;
    } else {
      state.angularVelocity *= 0.5;
    }
  } else if (archetype !== 'titan') {
    // Off-centre hit imparts a jolt based on arrival angle, timing, and block mass
    const direction = Math.sin(arrivalAngle) >= 0 ? 1 : -1;
    const timingTorque = (timingOffset / 10) * (gyroTier >= 2 ? 0.6 : 1.0);
    const massMomentum = Math.sqrt(Math.max(0.2, mass));
    state.angularVelocity += timingTorque * 1.5 * direction * massMomentum;
  }

  return {
    isPerfect,
    scoreMultiplier,
    bonusCoins,
    message,
  };
}
