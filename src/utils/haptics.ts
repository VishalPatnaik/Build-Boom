// Haptics Engine for Mobile & Touch tactile engagement
import { useGameStore } from '../game/store';

class HapticsEngine {
  private supported: boolean;

  constructor() {
    this.supported = typeof window !== 'undefined' && 
      typeof navigator !== 'undefined' && 
      'vibrate' in navigator && 
      typeof navigator.vibrate === 'function';
  }

  public isSupported(): boolean {
    return this.supported;
  }

  public vibrate(pattern: number | number[]): boolean {
    if (!this.supported) return false;
    
    // Check if user has enabled haptics in game settings
    try {
      const enabled = useGameStore.getState().hapticsEnabled;
      if (enabled === false) return false;
    } catch {
      // fallback to true if store not ready
    }

    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  /**
   * Tactile feedback when a block is successfully dropped/placed onto the tower.
   * Modulated by archetype, frame-perfect center alignment, combo streak, and mass.
   */
  public blockPlaced(
    archetype?: string,
    isPerfect?: boolean,
    combo: number = 0,
    rapidStreak: number = 0,
    mass: number = 1.0
  ) {
    if (isPerfect) {
      if (rapidStreak >= 3 || combo >= 8) {
        // High-velocity harmonic resonance cascade for master streaks
        this.vibrate([22, 24, 22, 24, 30, 26, 45]);
      } else if (rapidStreak >= 2 || combo >= 4) {
        // Double crescendo mechanical snap
        this.vibrate([20, 26, 24, 26, 36]);
      } else {
        // Crisp mechanical double-snap for perfect placement
        this.vibrate([18, 30, 26]);
      }
    } else if (archetype === 'titan' || mass >= 2.5) {
      // Solid heavy structural anchor thud
      this.vibrate([42, 22, 55]);
    } else if (archetype === 'gold_ingot' || mass >= 1.8) {
      // Lively golden double-pip with metallic resonance
      this.vibrate([16, 22, 20, 22, 28]);
    } else if (archetype === 'prism' || mass <= 0.7) {
      // High-energy optical prism harmonic burst
      this.vibrate([12, 16, 12, 16, 16, 20, 24]);
    } else {
      // Clean, immediate tactile lock confirmation
      if (combo >= 5) {
        this.vibrate([18, 22, 28]);
      } else {
        this.vibrate([22, 26, 18]);
      }
    }
  }

  /**
   * Tactile threat feedback when a boom hazard approaches the building block or tower receptor.
   * Modulated by proximityRatio (0.0 to 1.0) and urgency.
   * - 0.25 to 0.54: Proximity Caution (sonar radar ping)
   * - 0.55 to 0.79: Critical Danger (urgent double warning pulse)
   * - 0.80 to 1.00: Imminent Collision (high-frequency alarm chatter)
   */
  public hazardNearby(proximityRatio: number) {
    if (proximityRatio >= 0.80) {
      // Imminent collision: rapid high-intensity triple alarm
      this.vibrate([38, 22, 38, 22, 55]);
    } else if (proximityRatio >= 0.55) {
      // Critical danger zone: urgent double warning pulse
      this.vibrate([26, 24, 30]);
    } else if (proximityRatio >= 0.25) {
      // Proximity caution: subtle sonar radar ping
      this.vibrate([14, 28, 14]);
    }
  }

  /**
   * Visceral multi-stage detonation rumble when the player accidentally hits a bomb block.
   */
  public bombHit() {
    // Stage 1 initial detonation, Stage 2 secondary shockwave, Stage 3 full collapse blast
    this.vibrate([70, 35, 110, 45, 175]);
  }

  /**
   * Dynamic block collision haptic trigger modulated by mass and impact precision.
   */
  public blockCollision(mass: number = 1.0, isPerfect?: boolean, archetype?: string) {
    if (isPerfect) {
      this.vibrate([18, 30, 26]);
    } else if (mass >= 2.5 || archetype === 'titan') {
      this.vibrate([35, 20, 50]);
    } else if (mass >= 1.8 || archetype === 'gold_ingot') {
      this.vibrate([22, 25, 30]);
    } else if (mass <= 0.7 || archetype === 'prism') {
      this.vibrate([12, 16, 20]);
    } else {
      this.vibrate(24);
    }
  }

  /**
   * Visceral rumble for explosive 'boom' events.
   */
  public boomEvent(severity: 'minor' | 'defuse' | 'detonation' | 'critical' = 'detonation') {
    switch (severity) {
      case 'minor':
        this.vibrate([30, 20, 40]);
        break;
      case 'defuse':
        this.vibrate([35, 30, 60]);
        break;
      case 'critical':
        this.vibrate([85, 40, 130, 50, 180]);
        break;
      case 'detonation':
      default:
        this.vibrate([70, 35, 110, 45, 175]);
        break;
    }
  }

  /**
   * Aegis kinetic shield absorbs a bomb detonation without game over.
   */
  public bombAbsorbedByShield() {
    this.vibrate([40, 30, 75]);
  }

  /**
   * Tower structural equilibrium lost and tilts past failure threshold.
   */
  public towerCollapsed() {
    this.vibrate([55, 35, 55, 35, 85, 40, 120]);
  }

  /**
   * Block dropped way too early before reach zone.
   */
  public tooEarly() {
    this.vibrate([50, 40, 50]);
  }

  /**
   * EMP Bomb Defusal tactical charge detonated.
   */
  public empDefuse() {
    this.vibrate([28, 25, 42]);
  }

  /**
   * Chrono Stasis temporal slowdown activated.
   */
  public stasisActivated() {
    this.vibrate([20, 55, 30]);
  }

  /**
   * Aegis Shield barrier armed.
   */
  public shieldActivated() {
    this.vibrate([22, 28, 40]);
  }

  /**
   * Stage victory celebration rhythm.
   */
  public levelWon() {
    this.vibrate([30, 40, 35, 40, 70]);
  }

  /**
   * Achievement milestone reached tactile celebratory rhythm.
   */
  public achievementUnlocked() {
    this.vibrate([25, 30, 25, 30, 60]);
  }

  /**
   * Subtle micro-vibration for UI button taps.
   */
  public uiTap() {
    this.vibrate(12);
  }

  /**
   * Cancel any ongoing vibrations.
   */
  public stop() {
    if (this.supported) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
  }
}

export const haptics = new HapticsEngine();
