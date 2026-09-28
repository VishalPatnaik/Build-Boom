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
  };
}

export function updateTowerPhysics(
  state: TowerPhysicsState,
  dtMs: number,
  perks: Record<string, number>
): { collapsed: boolean; warningAlert: boolean } {
  const dt = dtMs / 1000;
  const gyroTier = perks['structural_gyro'] || 0;
  
  // Dampening coefficient increases with gyro tech
  const dampFactor = 0.88 + (gyroTier * 0.03); 
  const centeringSpring = 1.8 + (gyroTier * 0.4);

  // Restoring torque toward 0
  state.angularVelocity -= state.tiltAngle * centeringSpring * dt;
  state.angularVelocity *= Math.pow(dampFactor, dt * 60);

  state.tiltAngle += state.angularVelocity * dt * 20;

  // Calculate stress level
  const absTilt = Math.abs(state.tiltAngle);
  state.stressLevel = Math.min(100, Math.round((absTilt / state.maxTiltAllowed) * 100));
  state.isUnstable = state.stressLevel > 75;

  const warningAlert = state.stressLevel > 80;
  const collapsed = absTilt >= state.maxTiltAllowed;

  return { collapsed, warningAlert };
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
    state.tiltAngle = 0;
    state.angularVelocity = 0;
    message = 'TITAN ANCHOR LOCKED!';
  } else if (archetype === 'gold_ingot') {
    bonusCoins += 50;
    message = '+50 GOLD INGOT!';
  } else if (archetype === 'prism') {
    state.prismSurgeRemaining = 5;
    bonusCoins += 100;
    message = '3X PRISM SURGE!';
  }

  if (state.prismSurgeRemaining > 0) {
    scoreMultiplier *= 3.0;
    state.prismSurgeRemaining--;
  }

  if (isPerfect) {
    message = 'PERFECT!';
    scoreMultiplier *= opticsTier >= 2 ? 2.0 : 1.5;

    // Perfect hit stabilizes existing sway!
    if (gyroTier >= 3) {
      state.tiltAngle *= 0.1;
      state.angularVelocity = 0;
    } else {
      state.tiltAngle *= 0.5;
      state.angularVelocity *= 0.3;
    }
  } else {
    // Off-center hit imparts angular torque based on arrival angle, timing, and block mass
    const direction = Math.sin(arrivalAngle) >= 0 ? 1 : -1;
    const timingTorque = (timingOffset / 10) * (gyroTier >= 2 ? 0.6 : 1.0);
    const massMomentum = Math.sqrt(Math.max(0.2, mass));
    state.angularVelocity += timingTorque * 3.5 * direction * massMomentum;
  }

  return {
    isPerfect,
    scoreMultiplier,
    bonusCoins,
    message,
  };
}
