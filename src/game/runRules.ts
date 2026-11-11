// Small, pure rules for a run, kept out of the React component so they can be tested.

/** Mistakes allowed per run before it ends (bombs and a toppled tower end it at once). */
export const MAX_LIVES = 3;
/** How long a joint can hang past its edge (from the sway) before that part of the tower falls. */
export const TEETER_GRACE_MS = 450;
/** At most this many objects in the air at once. */
export const MAX_IN_FLIGHT = 4;
/** Two objects never reach the tower top closer together than this. */
export const MIN_ARRIVAL_GAP_MS = 450;

/** Milliseconds until an object at `distance` (100 = edge of the play area) reaches the tower top. */
export const arrivalMs = (distance: number, speed: number) => distance * speed * 10;

/**
 * Whether a new object (entering at distance 120) may launch now: the sky must not be too
 * crowded and it must not reach the tower top too close to anything already on its way.
 */
export function canLaunch(inFlight: { distance: number; speed: number }[], nextSpeed: number): boolean {
  if (inFlight.length >= MAX_IN_FLIGHT) return false;
  const next = arrivalMs(120, nextSpeed);
  return inFlight.every((b) => Math.abs(arrivalMs(b.distance, b.speed) - next) >= MIN_ARRIVAL_GAP_MS);
}

/**
 * Teetering: a joint pushed past its edge only gives way once it has stayed past the edge
 * for TEETER_GRACE_MS. Returns the new teeter time and whether the tower falls now.
 */
export function teeterStep(teeterMs: number, dtMs: number, pastEdge: boolean): { teeterMs: number; falls: boolean; started: boolean } {
  if (!pastEdge) return { teeterMs: 0, falls: false, started: false };
  const next = teeterMs + dtMs;
  return { teeterMs: next, falls: next >= TEETER_GRACE_MS, started: teeterMs === 0 };
}

/** Campaign stars: 1 for clearing, +1 for keeping every heart, +1 for half the landings perfect. */
export function campaignStars(livesLeft: number, revived: boolean, accuracyPct: number): number {
  const heartsKept = livesLeft >= MAX_LIVES && !revived;
  return 1 + (heartsKept ? 1 : 0) + (accuracyPct >= 50 ? 1 : 0);
}
