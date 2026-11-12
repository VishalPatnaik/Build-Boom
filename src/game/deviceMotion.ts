// Reads how the phone is being moved sideways, so a swing of the phone rocks the tower
// like a real stack in your hand. Uses the standard DeviceMotion sensor (Android WebView
// and mobile browsers; iOS asks for permission on the first tap).

export interface MotionReading {
  /** Sideways acceleration of the phone along the screen's x axis, m/s² (right is +). */
  lateral: number;
  /** True once real sensor data has arrived. */
  live: boolean;
}

const reading: MotionReading = { lateral: 0, live: false };
let listening = false;
let prevRaw: number | null = null;
let highPass = 0;
let smooth = 0;

/** Ignore hand tremor and walking jiggle below this, m/s². */
export const MOTION_DEADZONE = 0.6;
/** Largest acceleration fed to the physics, m/s² (a hard shake is clamped to this). */
export const MOTION_MAX = 16;

function screenAngle(): number {
  const a = (typeof screen !== 'undefined' && screen.orientation && typeof screen.orientation.angle === 'number')
    ? screen.orientation.angle
    : (typeof window !== 'undefined' ? Number((window as any).orientation) || 0 : 0);
  return ((a % 360) + 360) % 360;
}

/** Converts the device's x/y axes to the screen's horizontal axis for the current rotation. */
export function toScreenLateral(x: number, y: number, angle: number): number {
  if (angle === 90) return y;
  if (angle === 180) return -x;
  if (angle === 270) return -y;
  return x;
}

/** Turns a raw lateral reading into the filtered value the physics uses. */
export function filterLateral(raw: number, withGravity: boolean): number {
  let v = raw;
  if (withGravity) {
    // Remove the slow gravity part (how the phone is tilted) and keep the motion
    if (prevRaw === null) prevRaw = raw;
    highPass = 0.85 * (highPass + raw - prevRaw);
    prevRaw = raw;
    v = highPass;
  }
  smooth = smooth * 0.6 + v * 0.4;
  const mag = Math.abs(smooth);
  if (mag < MOTION_DEADZONE) return 0;
  return Math.sign(smooth) * Math.min(MOTION_MAX, mag - MOTION_DEADZONE);
}

function onMotion(e: DeviceMotionEvent) {
  const angle = screenAngle();
  const a = e.acceleration;
  if (a && a.x !== null && a.y !== null) {
    reading.lateral = filterLateral(toScreenLateral(a.x ?? 0, a.y ?? 0, angle), false);
    reading.live = true;
    return;
  }
  const g = e.accelerationIncludingGravity;
  if (g && g.x !== null && g.y !== null) {
    reading.lateral = filterLateral(toScreenLateral(g.x ?? 0, g.y ?? 0, angle), true);
    reading.live = true;
  }
}

/** Starts listening (safe to call repeatedly). */
export function startDeviceMotion() {
  if (listening || typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;
  window.addEventListener('devicemotion', onMotion);
  listening = true;
}

export function stopDeviceMotion() {
  if (!listening) return;
  window.removeEventListener('devicemotion', onMotion);
  listening = false;
  reading.lateral = 0;
  prevRaw = null;
  highPass = 0;
  smooth = 0;
}

/** iOS needs permission, asked from a tap. Elsewhere this resolves immediately. */
export async function requestMotionPermission(): Promise<boolean> {
  const DME = (typeof window !== 'undefined' ? (window as any).DeviceMotionEvent : undefined);
  if (DME && typeof DME.requestPermission === 'function') {
    try {
      return (await DME.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

export function getMotion(): MotionReading {
  return reading;
}
