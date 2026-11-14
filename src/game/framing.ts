/**
 * Vertical framing of the gameplay camera: where the landing point (top of the tower) sits, as a
 * fraction of screen height. Purely visual composition: physics works in its own units and input is
 * tap-anywhere, so this changes what you see, not how the game plays. 0.68 keeps the orbit of incoming
 * blocks fully on screen above the power-up buttons while giving less dead ground at the bottom.
 * GameBoard and ReplayViewer must use the same value so replays frame like live play.
 */
export const TOWER_ANCHOR_Y = 0.68;
