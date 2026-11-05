import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * CONSOLE-GRADE 3D STANDALONE OBJECT RENDERING (20 DISTINCT 3D OBJECTS)
 * Every item is a true standalone 3D object with organic silhouette, 3D volumetric shading,
 * specular highlights, contact shadows, and animated life — NEVER a rectangular block.
 */
export function renderCinematicBlock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  isCenter: boolean,
  time: number,
  archetype?: string
) {
  // Enforce uniform 1:1 3D object proportions so objects never stretch into flat bricks
  const r = Math.min(w, h) * 0.52;
  const hw = r;
  const hh = r;
  const t = Math.abs(parseInt((id || '').replace('skin-', '')) || 0) % 20;

  ctx.save();

  switch (t) {
    // 0: Spring Meadow — 3D Realistic Bumblebee ("bee fly")
    case 0: {
      const flapSpeed = 0.085;
      const wingFlap = Math.sin((time || 0) * flapSpeed);
      const bodyHover = Math.sin((time || 0) * 0.007) * 2;
      const eyeShimmer = Math.sin((time || 0) * 0.003) * 0.5 + 0.5;

      ctx.save();
      ctx.translate(0, bodyHover);

      // 1. Soft Elliptical Contact Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.92, hw * 0.68, hh * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Realistic 3D Jointed Insect Legs Underneath
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const legSway = Math.sin((time || 0) * 0.012) * 1.5;

      // Forelegs
      ctx.beginPath();
      ctx.moveTo(-hw * 0.35, -hh * 0.1);
      ctx.lineTo(-hw * 0.68 + legSway, hh * 0.18);
      ctx.lineTo(-hw * 0.78 + legSway, hh * 0.55);
      ctx.moveTo(hw * 0.35, -hh * 0.1);
      ctx.lineTo(hw * 0.68 - legSway, hh * 0.18);
      ctx.lineTo(hw * 0.78 - legSway, hh * 0.55);
      ctx.stroke();

      // Midlegs
      ctx.beginPath();
      ctx.moveTo(-hw * 0.32, hh * 0.15);
      ctx.lineTo(-hw * 0.74, hh * 0.48 + legSway);
      ctx.lineTo(-hw * 0.84, hh * 0.82);
      ctx.moveTo(hw * 0.32, hh * 0.15);
      ctx.lineTo(hw * 0.74, hh * 0.48 - legSway);
      ctx.lineTo(hw * 0.84, hh * 0.82);
      ctx.stroke();

      // Hindlegs with golden pollen baskets (corbiculae)
      ctx.beginPath();
      ctx.moveTo(-hw * 0.22, hh * 0.38);
      ctx.lineTo(-hw * 0.52, hh * 0.82 - legSway);
      ctx.lineTo(-hw * 0.62, hh * 1.05);
      ctx.moveTo(hw * 0.22, hh * 0.38);
      ctx.lineTo(hw * 0.52, hh * 0.82 + legSway);
      ctx.lineTo(hw * 0.62, hh * 1.05);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.52, hh * 0.8 - legSway, 3.2, 2, 0.4, 0, Math.PI * 2);
      ctx.ellipse(hw * 0.52, hh * 0.8 + legSway, 3.2, 2, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // 3. 3D Plump Abdomen (Segmented Oval Body with Tergites)
      const abdY = hh * 0.2;
      const abdRadiusX = hw * 0.68;
      const abdRadiusY = hh * 0.72;

      ctx.save();
      ctx.translate(0, abdY);

      // Chitinous Stinger at Posterior Apex
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-2.5, abdRadiusY * 0.85);
      ctx.lineTo(0, abdRadiusY + 6.5);
      ctx.lineTo(2.5, abdRadiusY * 0.85);
      ctx.closePath();
      ctx.fill();

      // Base 3D Shaded Oval Body
      const abdGrad = safeCreateRadialGradient(ctx, -abdRadiusX * 0.25, -abdRadiusY * 0.25, 2, 0, 0, abdRadiusX);
      if (abdGrad) {
        abdGrad.addColorStop(0, '#fef08a');
        abdGrad.addColorStop(0.35, '#facc15');
        abdGrad.addColorStop(0.7, '#d97706');
        abdGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = abdGrad;
      } else {
        ctx.fillStyle = '#facc15';
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, abdRadiusX, abdRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Clip to abdomen for authentic 3D curved abdominal stripes
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, abdRadiusX, abdRadiusY, 0, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.ellipse(0, -abdRadiusY * 0.45, abdRadiusX * 1.05, abdRadiusY * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(0, -abdRadiusY * 0.1, abdRadiusX * 1.05, abdRadiusY * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.ellipse(0, abdRadiusY * 0.28, abdRadiusX * 1.05, abdRadiusY * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(0, abdRadiusY * 0.65, abdRadiusX * 0.9, abdRadiusY * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D Spherical Volume Highlight across Dorsum
      const dorsumGlint = ctx.createLinearGradient(-abdRadiusX, 0, abdRadiusX, 0);
      dorsumGlint.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      dorsumGlint.addColorStop(0.22, 'rgba(255, 255, 255, 0.38)');
      dorsumGlint.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      dorsumGlint.addColorStop(0.85, 'rgba(0, 0, 0, 0.35)');
      dorsumGlint.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = dorsumGlint;
      ctx.fillRect(-abdRadiusX, -abdRadiusY, abdRadiusX * 2, abdRadiusY * 2);
      ctx.restore();

      // Fine Fur Fringe Stippling along Abdomen Rim
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
      ctx.lineWidth = 0.8;
      for (let a = 0; a < Math.PI * 2; a += 0.28) {
        const px = Math.cos(a) * abdRadiusX;
        const py = Math.sin(a) * abdRadiusY;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(a) * 2.4, py + Math.sin(a) * 2.4);
        ctx.stroke();
      }
      ctx.restore();

      // 4. 3D Compact Rounded Thorax
      const thY = -hh * 0.26;
      const thRadiusX = hw * 0.56;
      const thRadiusY = hh * 0.42;

      const thGrad = safeCreateRadialGradient(ctx, -thRadiusX * 0.25, thY - thRadiusY * 0.3, 2, 0, thY, thRadiusX);
      if (thGrad) {
        thGrad.addColorStop(0, '#fef08a');
        thGrad.addColorStop(0.32, '#f59e0b');
        thGrad.addColorStop(0.72, '#78350f');
        thGrad.addColorStop(1, '#18181b');
        ctx.fillStyle = thGrad;
      } else {
        ctx.fillStyle = '#b45309';
      }
      ctx.beginPath();
      ctx.ellipse(0, thY, thRadiusX, thRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. 3D Head & Faceted Compound Eyes
      const headY = -hh * 0.68;
      const headRadiusX = hw * 0.38;
      const headRadiusY = hh * 0.3;

      const headGrad = safeCreateRadialGradient(ctx, -headRadiusX * 0.3, headY - headRadiusY * 0.2, 2, 0, headY, headRadiusX);
      if (headGrad) {
        headGrad.addColorStop(0, '#3f3f46');
        headGrad.addColorStop(0.6, '#18181b');
        headGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = headGrad;
      } else {
        ctx.fillStyle = '#18181b';
      }
      ctx.beginPath();
      ctx.ellipse(0, headY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      const eyeR_X = headRadiusX * 0.42;
      const eyeR_Y = headRadiusY * 0.58;
      const eyeY = headY + 1;

      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(dir * headRadiusX * 0.72, eyeY);
        ctx.rotate(dir * 0.25);
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.ellipse(0, 0, eyeR_X, eyeR_Y, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + eyeShimmer * 0.25})`;
        ctx.beginPath();
        ctx.ellipse(-eyeR_X * 0.3, -eyeR_Y * 0.3, eyeR_X * 0.35, eyeR_Y * 0.25, dir * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Curved Sensor Antennae
      const antWiggle = Math.sin((time || 0) * 0.015) * 2;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-headRadiusX * 0.3, headY - headRadiusY * 0.7);
      ctx.quadraticCurveTo(-headRadiusX * 0.7 + antWiggle, headY - headRadiusY * 1.5, -headRadiusX * 1.1 + antWiggle, headY - headRadiusY * 1.4);
      ctx.moveTo(headRadiusX * 0.3, headY - headRadiusY * 0.7);
      ctx.quadraticCurveTo(headRadiusX * 0.7 - antWiggle, headY - headRadiusY * 1.5, headRadiusX * 1.1 - antWiggle, headY - headRadiusY * 1.4);
      ctx.stroke();

      // 6. Realistic 3D Gossamer Veined Wings (Dual Pairs)
      const wingSweep = 0.35 + wingFlap * 0.55;
      const wingLength = hw * 1.15;
      const wingBreadth = hh * 0.82;

      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * thRadiusX * 0.65, thY - 2);
        ctx.rotate(side * wingSweep);

        // Hindwing
        ctx.fillStyle = 'rgba(224, 242, 254, 0.52)';
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(side * wingLength * 0.35, -wingBreadth * 0.2, wingLength * 0.38, wingBreadth * 0.28, side * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Forewing
        const foreGrad = ctx.createLinearGradient(side * wingLength, -wingBreadth, 0, 0);
        foreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        foreGrad.addColorStop(0.35, 'rgba(224, 242, 254, 0.82)');
        foreGrad.addColorStop(0.75, 'rgba(186, 230, 253, 0.52)');
        foreGrad.addColorStop(1, 'rgba(125, 211, 252, 0.25)');
        ctx.fillStyle = foreGrad;
        ctx.beginPath();
        ctx.ellipse(side * wingLength * 0.55, -wingBreadth * 0.45, wingLength * 0.55, wingBreadth * 0.38, side * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Chitin Wing Veins
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.92)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(side * wingLength * 0.6, -wingBreadth * 0.9, side * wingLength * 1.05, -wingBreadth * 0.6);
        ctx.moveTo(0, 0);
        ctx.lineTo(side * wingLength * 0.75, -wingBreadth * 0.4);
        ctx.moveTo(side * wingLength * 0.35, -wingBreadth * 0.22);
        ctx.lineTo(side * wingLength * 0.6, -wingBreadth * 0.15);
        ctx.stroke();
        ctx.restore();
      });

      ctx.restore();
      break;
    }

    // 1: Lunar Surface — 3D Chibi Moon Astronaut Bunny (Round Bubble Helmet & Sculpted Ears)
    case 1: {
      const eyeBlink = Math.sin((time || 0) * 0.0016) > 0.94 ? 0.1 : 1;
      const earWiggle = Math.sin((time || 0) * 0.012) * 0.12;

      // Contact shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.92, hw * 0.65, hh * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Long Sculpted 3D Bunny Ears on Top
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * hw * 0.42, -hh * 0.65);
        ctx.rotate(side * (0.22 + earWiggle));
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.35, hw * 0.22, hh * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.ellipse(0, -hh * 0.35, hw * 0.11, hh * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Little Round Space Boots at Bottom
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.35, hh * 0.78, hw * 0.22, hh * 0.16, -0.2, 0, Math.PI * 2);
      ctx.ellipse(hw * 0.35, hh * 0.78, hw * 0.22, hh * 0.16, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Spherical 3D Space Helmet Dome
      const helmetGrad = safeCreateRadialGradient(ctx, -hw * 0.28, -hh * 0.28, 2, 0, 0, hw * 0.88);
      if (helmetGrad) {
        helmetGrad.addColorStop(0, '#ffffff');
        helmetGrad.addColorStop(0.55, '#e2e8f0');
        helmetGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = helmetGrad;
      } else {
        ctx.fillStyle = '#e2e8f0';
      }
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Curved Cosmic Visor Bowl
      const visorGrad = ctx.createLinearGradient(-hw * 0.6, -hh * 0.5, hw * 0.6, hh * 0.5);
      visorGrad.addColorStop(0, '#0c4a6e');
      visorGrad.addColorStop(0.5, '#0284c7');
      visorGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = visorGrad;
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.04, hw * 0.68, hh * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cute Bunny Eyes & Pink Nose inside Visor
      const eyeR = hw * 0.16;
      [-hw * 0.28, hw * 0.28].forEach((ex) => {
        ctx.save();
        ctx.translate(ex, -hh * 0.08);
        ctx.scale(1, eyeBlink);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, eyeR * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-eyeR * 0.3, -eyeR * 0.3, eyeR * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Visor glass curved highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.28, -hh * 0.3, hw * 0.26, hh * 0.13, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 2: Martian Canyon — 3D Sculpted Martian Meteorite Geode Boulder
    case 2: {
      const grad = safeCreateRadialGradient(ctx, -hw * 0.25, -hh * 0.25, 2, 0, 0, hw);
      if (grad) {
        grad.addColorStop(0, '#fdba74');
        grad.addColorStop(0.4, '#ea580c');
        grad.addColorStop(0.8, '#9a3412');
        grad.addColorStop(1, '#431407');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#ea580c';
      }

      // Organic Multi-Faceted 3D Asteroid Silhouette
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.92);
      ctx.lineTo(hw * 0.68, -hh * 0.62);
      ctx.lineTo(hw * 0.95, -hh * 0.05);
      ctx.lineTo(hw * 0.72, hh * 0.68);
      ctx.lineTo(hw * 0.12, hh * 0.92);
      ctx.lineTo(-hw * 0.65, hh * 0.72);
      ctx.lineTo(-hw * 0.92, hh * 0.1);
      ctx.lineTo(-hw * 0.68, -hh * 0.58);
      ctx.closePath();
      ctx.fill();

      // 3D Impact Craters & Glowing Iron-Oxide Crystal Fissures
      ctx.fillStyle = '#431407';
      [[-hw * 0.32, -hh * 0.22, hw * 0.18], [hw * 0.28, hh * 0.25, hw * 0.22], [-hw * 0.1, hh * 0.42, hw * 0.14]].forEach(([cx, cy, cr]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.4, -hh * 0.1);
      ctx.lineTo(0, hh * 0.1);
      ctx.lineTo(hw * 0.35, -hh * 0.25);
      ctx.stroke();
      break;
    }

    // 3: Deep Space Nebula — 3D Ringed Cosmic Planet & Orbiting Moons
    case 3: {
      const ringTilt = 0.32;

      // Back half of planetary rings
      ctx.save();
      ctx.rotate(-ringTilt);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw * 1.18, hh * 0.34, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3D Spherical Gas-Giant Planet Core
      const planetGrad = safeCreateRadialGradient(ctx, -hw * 0.25, -hh * 0.25, 2, 0, 0, hw * 0.72);
      if (planetGrad) {
        planetGrad.addColorStop(0, '#f0abfc');
        planetGrad.addColorStop(0.35, '#a855f7');
        planetGrad.addColorStop(0.75, '#4c1d95');
        planetGrad.addColorStop(1, '#09021a');
        ctx.fillStyle = planetGrad;
      } else {
        ctx.fillStyle = '#9333ea';
      }
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Front half of planetary rings overlapping planet
      ctx.save();
      ctx.rotate(-ringTilt);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw * 1.18, hh * 0.34, 0, 0, Math.PI);
      ctx.stroke();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw * 1.0, hh * 0.26, 0, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
      break;
    }

    // 4: Abyssal Coral Reef — 3D Realistic Baby Sea Turtle
    case 4: {
      const paddle = Math.sin((time || 0) * 0.018) * 0.28;
      const eyeBlink = Math.sin((time || 0) * 0.0017) > 0.94 ? 0.1 : 1;

      // 1. Sculpted Turtle Head at Top
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.78, hw * 0.3, hh * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute Eyes on Head
      [-hw * 0.14, hw * 0.14].forEach((ex) => {
        ctx.save();
        ctx.translate(ex, -hh * 0.85);
        ctx.scale(1, eyeBlink);
        ctx.fillStyle = '#042f2e';
        ctx.beginPath();
        ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-0.8, -0.8, 1.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Four Animated Paddling Flippers
      [-1, 1].forEach((side) => {
        // Front Flippers
        ctx.save();
        ctx.translate(side * hw * 0.62, -hh * 0.25);
        ctx.rotate(side * (0.45 + paddle));
        ctx.fillStyle = '#0d9488';
        ctx.strokeStyle = '#5eead4';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(side * hw * 0.28, 0, hw * 0.36, hh * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Hind Flippers
        ctx.save();
        ctx.translate(side * hw * 0.48, hh * 0.55);
        ctx.rotate(side * (-0.5 - paddle * 0.6));
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.ellipse(side * hw * 0.16, hh * 0.1, hw * 0.22, hh * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Domed 3D Oval Carapace Shell (Never a rectangle!)
      const shellGrad = safeCreateRadialGradient(ctx, -hw * 0.2, -hh * 0.15, 2, 0, hh * 0.08, hw * 0.78);
      if (shellGrad) {
        shellGrad.addColorStop(0, '#5eead4');
        shellGrad.addColorStop(0.4, '#0d9488');
        shellGrad.addColorStop(0.85, '#115e59');
        shellGrad.addColorStop(1, '#042f2e');
        ctx.fillStyle = shellGrad;
      } else {
        ctx.fillStyle = '#0d9488';
      }
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.08, hw * 0.68, hh * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hexagonal Carapace Scute Pattern
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3;
        const px = Math.cos(ang) * hw * 0.32;
        const py = hh * 0.08 + Math.sin(ang) * hh * 0.32;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }

    // 5: Tropical Sunset Beach — 3D Iridescent Scallop Seashell & Glowing Pearl
    case 5: {
      const shellGrad = safeCreateRadialGradient(ctx, 0, -hh * 0.2, 2, 0, 0, hw);
      if (shellGrad) {
        shellGrad.addColorStop(0, '#fef08a');
        shellGrad.addColorStop(0.4, '#fb923c');
        shellGrad.addColorStop(0.8, '#f43f5e');
        shellGrad.addColorStop(1, '#881337');
        ctx.fillStyle = shellGrad;
      } else {
        ctx.fillStyle = '#fb7185';
      }

      // Fluted Scallop Shell Fan Lobes
      ctx.beginPath();
      ctx.moveTo(0, hh * 0.85);
      for (let i = -4; i <= 4; i++) {
        const ang = -Math.PI * 0.5 + (i * Math.PI) / 9;
        const lobeR = hw * (0.98 - Math.abs(i) * 0.05);
        ctx.lineTo(Math.cos(ang) * lobeR, hh * 0.2 + Math.sin(ang) * lobeR);
      }
      ctx.closePath();
      ctx.fill();

      // Shell Fluted Rib Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      for (let i = -3; i <= 3; i++) {
        const ang = -Math.PI * 0.5 + (i * Math.PI) / 9;
        ctx.beginPath();
        ctx.moveTo(0, hh * 0.78);
        ctx.lineTo(Math.cos(ang) * hw * 0.82, hh * 0.2 + Math.sin(ang) * hw * 0.82);
        ctx.stroke();
      }

      // 3D Iridescent Mother-of-Pearl Sphere inside Shell
      const pearlGrad = safeCreateRadialGradient(ctx, -hw * 0.1, hh * 0.1, 1, 0, hh * 0.22, hw * 0.34);
      if (pearlGrad) {
        pearlGrad.addColorStop(0, '#ffffff');
        pearlGrad.addColorStop(0.5, '#e0f2fe');
        pearlGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = pearlGrad;
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.beginPath();
      ctx.arc(0, hh * 0.22, hw * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 6: Volcanic Caldera — 3D Molten Lava Bomb Sphere
    case 6: {
      const lavaPulse = 0.85 + 0.15 * Math.sin((time || 0) * 0.006);
      const coreGrad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, hw * 0.95);
      if (coreGrad) {
        coreGrad.addColorStop(0, '#fef08a');
        coreGrad.addColorStop(0.4, '#ef4444');
        coreGrad.addColorStop(0.75, '#7f1d1d');
        coreGrad.addColorStop(1, '#1c0a07');
        ctx.fillStyle = coreGrad;
      } else {
        ctx.fillStyle = '#dc2626';
      }

      // Jagged 3D Volcanic Magma Orb Silhouette
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 14 * lavaPulse;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI * 2) / 12;
        const rad = hw * (i % 2 === 0 ? 0.94 : 0.78);
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Glowing Incandescent Magma Veins
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.45, -hh * 0.35);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw * 0.48, hh * 0.32);
      ctx.moveTo(0, 0);
      ctx.lineTo(hw * 0.35, -hh * 0.42);
      ctx.stroke();
      break;
    }

    // 7: Ancient Stone Citadel — 3D Royal Knight Heater Shield & Golden Crest
    case 7: {
      const shieldGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      shieldGrad.addColorStop(0, '#cbd5e1');
      shieldGrad.addColorStop(0.45, '#475569');
      shieldGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = shieldGrad;

      // Classic Curved Medieval Knight Shield Silhouette
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.9);
      ctx.quadraticCurveTo(hw * 0.6, -hh * 0.9, hw * 0.85, -hh * 0.65);
      ctx.quadraticCurveTo(hw * 0.88, hh * 0.25, 0, hh * 0.95);
      ctx.quadraticCurveTo(-hw * 0.88, hh * 0.25, -hw * 0.85, -hh * 0.65);
      ctx.quadraticCurveTo(-hw * 0.6, -hh * 0.9, 0, -hh * 0.9);
      ctx.closePath();
      ctx.fill();

      // Gold Forged Shield Rim & Royal Cross Crest
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.45);
      ctx.lineTo(hw * 0.25, 0);
      ctx.lineTo(0, hh * 0.45);
      ctx.lineTo(-hw * 0.25, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // 8: Enchanted Redwood — 3D Bioluminescent Magic Forest Toadstool Mushroom
    case 8: {
      // Curved Ivory Mushroom Stalk
      const stalkGrad = ctx.createLinearGradient(-hw * 0.3, 0, hw * 0.3, 0);
      stalkGrad.addColorStop(0, '#d6d3d1');
      stalkGrad.addColorStop(0.4, '#fafaf9');
      stalkGrad.addColorStop(1, '#78716c');
      ctx.fillStyle = stalkGrad;
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.42, hw * 0.32, hh * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Plump 3D Bioluminescent Emerald Mushroom Cap
      const capGrad = safeCreateRadialGradient(ctx, -hw * 0.25, -hh * 0.35, 2, 0, -hh * 0.15, hw * 0.95);
      if (capGrad) {
        capGrad.addColorStop(0, '#86efac');
        capGrad.addColorStop(0.45, '#10b981');
        capGrad.addColorStop(0.85, '#047857');
        capGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = capGrad;
      } else {
        ctx.fillStyle = '#10b981';
      }
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.15, hw * 0.92, hh * 0.58, 0, Math.PI, Math.PI * 2);
      ctx.ellipse(0, -hh * 0.15, hw * 0.92, hh * 0.22, 0, 0, Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Glowing Spores / Cap Spots
      ctx.fillStyle = '#fef08a';
      [[-hw * 0.42, -hh * 0.3], [0, -hh * 0.48], [hw * 0.42, -hh * 0.28], [-hw * 0.15, -hh * 0.18], [hw * 0.22, -hh * 0.15]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 9: Golden Desert Oasis — 3D Royal Winged Golden Scarab Beetle
    case 9: {
      // Jointed Golden Scarab Legs
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.8;
      [-1, 1].forEach((side) => {
        [-0.3, 0.05, 0.4].forEach((ly) => {
          ctx.beginPath();
          ctx.moveTo(side * hw * 0.4, hh * ly);
          ctx.lineTo(side * hw * 0.85, hh * (ly + 0.15));
          ctx.stroke();
        });
      });

      // Solar Ruby Orb held at Top
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -hh * 0.78, hw * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 3D Iridescent Gold & Lapis Carapace Oval
      const scarabGrad = safeCreateRadialGradient(ctx, -hw * 0.2, -hh * 0.1, 2, 0, hh * 0.1, hw * 0.75);
      if (scarabGrad) {
        scarabGrad.addColorStop(0, '#fef08a');
        scarabGrad.addColorStop(0.45, '#eab308');
        scarabGrad.addColorStop(0.85, '#a16207');
        scarabGrad.addColorStop(1, '#422006');
        ctx.fillStyle = scarabGrad;
      } else {
        ctx.fillStyle = '#eab308';
      }
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.12, hw * 0.62, hh * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elytra Wing Seam & Turquoise Inlay
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.55, -hh * 0.15);
      ctx.quadraticCurveTo(0, 0, hw * 0.55, -hh * 0.15);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, hh * 0.8);
      ctx.stroke();
      break;
    }

    // 10: Frozen Arctic Tundra — 3D Realistic Crystalline Snowflake ("snow flake")
    case 10: {
      const rot = (time || 0) * 0.0006;
      const pulse = Math.sin((time || 0) * 0.003) * 0.06;
      const crystalR = Math.min(hw, hh) * (1.08 + pulse);

      ctx.save();

      // 1. Soft Frosted Contact Shadow
      ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.9, hw * 0.72, hh * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Crystalline Ice Core Glow Aura
      const auraGrad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, crystalR * 1.15);
      if (auraGrad) {
        auraGrad.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
        auraGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.4)');
        auraGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.15)');
        auraGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, crystalR * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.rotate(rot);

      // 3. Six-Fold Radial Dendritic Crystal Arms (True 3D Snowflake)
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-2.2, -crystalR * 0.85);
        ctx.lineTo(0, -crystalR * 0.98);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(2.2, -crystalR * 0.85);
        ctx.lineTo(0, -crystalR * 0.98);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -crystalR);
        ctx.stroke();

        const branchY1 = -crystalR * 0.45;
        const branchLen1 = crystalR * 0.38;
        const branchAng = Math.PI / 3;

        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(0, branchY1);
          ctx.rotate(side * branchAng);
          ctx.fillStyle = side === -1 ? '#ffffff' : '#7dd3fc';
          ctx.beginPath();
          ctx.moveTo(0, -1);
          ctx.lineTo(branchLen1, 0);
          ctx.lineTo(0, 1);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        });

        const branchY2 = -crystalR * 0.72;
        const branchLen2 = crystalR * 0.24;
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(0, branchY2);
          ctx.rotate(side * branchAng);
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(branchLen2, 0);
          ctx.stroke();
          ctx.restore();
        });

        ctx.save();
        ctx.translate(0, -crystalR * 0.95);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2.2, -2.2, 4.4, 4.4);
        ctx.restore();

        ctx.restore();
      }

      // 4. Central 3D Hexagonal Ice Prism
      ctx.fillStyle = 'rgba(240, 249, 255, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const hexR = crystalR * 0.28;
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3;
        const px = Math.cos(ang) * hexR;
        const py = Math.sin(ang) * hexR;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    // 11: Pirate Corsair Cove — 3D Nautical Ship's Helm Steering Wheel
    case 11: {
      const wheelRot = (time || 0) * 0.0005;
      ctx.save();
      ctx.rotate(wheelRot);

      // 8 Turned Mahogany Spokes & Outer Handles
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.0;
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * hw * 0.98, Math.sin(ang) * hh * 0.98);
        ctx.stroke();

        // Brass Handle Tip
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * hw * 0.98, Math.sin(ang) * hh * 0.98, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Carved Mahogany Wheel Rim
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.68, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.68, 0, Math.PI * 2);
      ctx.stroke();

      // Central Brass Cap Hub
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // 12: Candyland Confection — 3D Sculpted Translucent Strawberry Gummy Bear
    case 12: {
      const eyeBlink = Math.abs(Math.sin((time || 0) * 0.003 + 1)) < 0.08 ? 0.1 : 1;

      // Round Bear Ears
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(-hw * 0.48, -hh * 0.68, hw * 0.26, 0, Math.PI * 2);
      ctx.arc(hw * 0.48, -hh * 0.68, hw * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(-hw * 0.48, -hh * 0.68, hw * 0.13, 0, Math.PI * 2);
      ctx.arc(hw * 0.48, -hh * 0.68, hw * 0.13, 0, Math.PI * 2);
      ctx.fill();

      // Chubby Gummy Bear Belly & Limbs (True Bear Silhouette, No Box!)
      const gummyGrad = safeCreateRadialGradient(ctx, -hw * 0.2, -hh * 0.25, 2, 0, 0, hw);
      if (gummyGrad) {
        gummyGrad.addColorStop(0, '#fda4af');
        gummyGrad.addColorStop(0.4, '#f43f5e');
        gummyGrad.addColorStop(0.85, '#be123c');
        gummyGrad.addColorStop(1, '#881337');
        ctx.fillStyle = gummyGrad;
      } else {
        ctx.fillStyle = '#f43f5e';
      }

      // Lower Chubby Torso & Feet
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.35, hw * 0.65, hh * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      // Round Head
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.22, hw * 0.62, hh * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute Muzzle & Nose
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.08, hw * 0.28, hh * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.13, 3, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shiny Gummy Eyes
      [-hw * 0.26, hw * 0.26].forEach((ex) => {
        ctx.save();
        ctx.translate(ex, -hh * 0.32);
        ctx.scale(1, eyeBlink);
        ctx.fillStyle = '#4c0519';
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-1, -1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Candy Gloss Highlight on Belly & Forehead
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.28, hh * 0.25, hw * 0.16, hh * 0.25, -0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 13: Golden El Dorado — 3D Incan Solar Sun God Medallion Idol
    case 13: {
      // Radiant 12-Rayed Golden Sunburst Perimeter
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const ang = (i * Math.PI) / 12;
        const rad = i % 2 === 0 ? hw * 0.98 : hw * 0.72;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Inner 24K Gold Medallion Disc
      const goldGrad = safeCreateRadialGradient(ctx, -hw * 0.2, -hh * 0.2, 2, 0, 0, hw * 0.72);
      if (goldGrad) {
        goldGrad.addColorStop(0, '#fef9c3');
        goldGrad.addColorStop(0.45, '#facc15');
        goldGrad.addColorStop(0.85, '#ca8a04');
        goldGrad.addColorStop(1, '#713f12');
        ctx.fillStyle = goldGrad;
      } else {
        ctx.fillStyle = '#facc15';
      }
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Turquoise Gem Inlays & Embossed Solar Eyes
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(-hw * 0.24, -hh * 0.12, 2.8, 0, Math.PI * 2);
      ctx.arc(hw * 0.24, -hh * 0.12, 2.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 14: Cyberpunk Megacity — 3D Cyber Mecha-Kitty Drone Sphere
    case 14: {
      const earTwitch = Math.sin((time || 0) * 0.035) * 0.12;
      const eyeBlink = Math.abs(Math.sin((time || 0) * 0.003 + 2)) < 0.07 ? 0.1 : 1;

      // Pointed Robotic Cat Ears
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * hw * 0.55, -hh * 0.55);
        ctx.rotate(side * (0.25 + earTwitch));
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-hw * 0.26, hh * 0.2);
        ctx.lineTo(0, -hh * 0.48);
        ctx.lineTo(hw * 0.26, hh * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(-hw * 0.14, hh * 0.15);
        ctx.lineTo(0, -hh * 0.3);
        ctx.lineTo(hw * 0.14, hh * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Spherical Obsidian Cyber Drone Head (No Box!)
      const droneGrad = safeCreateRadialGradient(ctx, -hw * 0.25, -hh * 0.25, 2, 0, 0, hw * 0.85);
      if (droneGrad) {
        droneGrad.addColorStop(0, '#312e81');
        droneGrad.addColorStop(0.55, '#09090b');
        droneGrad.addColorStop(1, '#020617');
        ctx.fillStyle = droneGrad;
      } else {
        ctx.fillStyle = '#09090b';
      }
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, hh * 0.05, hw * 0.82, hh * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Cyan Digital LED Eyes
      [-hw * 0.32, hw * 0.32].forEach((ex) => {
        ctx.save();
        ctx.translate(ex, -hh * 0.08);
        ctx.scale(1, eyeBlink);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, hw * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Pink Neon Kitty Nose & Whiskers
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, hh * 0.12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 15: Toxic Wasteland — 3D Glowing Plasma Bio-Orb Sphere
    case 15: {
      // Outer Glass Containment Sphere
      const orbGrad = safeCreateRadialGradient(ctx, -hw * 0.25, -hh * 0.25, 2, 0, 0, hw * 0.88);
      if (orbGrad) {
        orbGrad.addColorStop(0, '#ecfccb');
        orbGrad.addColorStop(0.4, '#84cc16');
        orbGrad.addColorStop(0.8, '#3f6212');
        orbGrad.addColorStop(1, '#18181b');
        ctx.fillStyle = orbGrad;
      } else {
        ctx.fillStyle = '#84cc16';
      }
      ctx.shadowColor = '#bef264';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rotating Trefoil Core inside Sphere
      ctx.save();
      ctx.rotate((time || 0) * 0.0015);
      ctx.fillStyle = '#18181b';
      for (let b = 0; b < 3; b++) {
        const ang = (b * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, hw * 0.48, ang - 0.38, ang + 0.38);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Glass Specular Glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.32, -hh * 0.35, hw * 0.22, hh * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 16: Floating Sky Islands — 3D Winged Celestial Aether Crystal
    case 16: {
      const wingFlap = Math.sin((time || 0) * 0.012) * 0.22;

      // Feathered White Angelic Wings on Left & Right
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * hw * 0.35, 0);
        ctx.rotate(side * (-0.2 + wingFlap));
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(side * hw * 0.42, -hh * 0.15, hw * 0.45, hh * 0.24, side * -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Central Faceted Diamond Aether Crystal
      const crysGrad = ctx.createLinearGradient(0, -hh, 0, hh);
      crysGrad.addColorStop(0, '#ffffff');
      crysGrad.addColorStop(0.45, '#38bdf8');
      crysGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = crysGrad;
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.92);
      ctx.lineTo(hw * 0.52, 0);
      ctx.lineTo(0, hh * 0.92);
      ctx.lineTo(-hw * 0.52, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // 17: Chrono Clockwork — 3D Steampunk Brass Cogwheel & Ruby Chronometer
    case 17: {
      ctx.save();
      ctx.rotate((time || 0) * 0.0012);

      // 10 Machined Brass Gear Teeth
      ctx.fillStyle = '#d97706';
      for (let i = 0; i < 10; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 10);
        ctx.beginPath();
        ctx.roundRect(-hw * 0.14, -hh * 0.96, hw * 0.28, hh * 0.28, 2);
        ctx.fill();
        ctx.restore();
      }

      // Circular Brushed Brass Gear Body
      const gearGrad = safeCreateRadialGradient(ctx, -hw * 0.2, -hh * 0.2, 2, 0, 0, hw * 0.8);
      if (gearGrad) {
        gearGrad.addColorStop(0, '#fef08a');
        gearGrad.addColorStop(0.5, '#d97706');
        gearGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = gearGrad;
      } else {
        ctx.fillStyle = '#d97706';
      }
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.76, 0, Math.PI * 2);
      ctx.fill();

      // Inner Spokes & Ruby Pivot Jewel
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // 18: Sakura Blossom Shrine — 3D Sculpted Kitsune Fox Spirit
    case 18: {
      const earTwitch = Math.sin((time || 0) * 0.03) * 0.08;

      // Tall Fluffy Kitsune Ears with Vermilion Tips
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * hw * 0.52, -hh * 0.48);
        ctx.rotate(side * (0.22 + earTwitch));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-hw * 0.26, hh * 0.2);
        ctx.lineTo(0, -hh * 0.58);
        ctx.lineTo(hw * 0.26, hh * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.moveTo(-hw * 0.12, -hh * 0.22);
        ctx.lineTo(0, -hh * 0.58);
        ctx.lineTo(hw * 0.12, -hh * 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Sculpted Tapered Fox Face Silhouette (Cheeks tapering to snout — No Box!)
      const foxGrad = safeCreateRadialGradient(ctx, 0, -hh * 0.1, 2, 0, 0, hw * 0.9);
      if (foxGrad) {
        foxGrad.addColorStop(0, '#ffffff');
        foxGrad.addColorStop(0.75, '#fff1f2');
        foxGrad.addColorStop(1, '#fecdd3');
        ctx.fillStyle = foxGrad;
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.65);
      ctx.quadraticCurveTo(hw * 0.85, -hh * 0.55, hw * 0.88, hh * 0.05);
      ctx.quadraticCurveTo(hw * 0.55, hh * 0.65, 0, hh * 0.88);
      ctx.quadraticCurveTo(-hw * 0.55, hh * 0.65, -hw * 0.88, hh * 0.05);
      ctx.quadraticCurveTo(-hw * 0.85, -hh * 0.55, 0, -hh * 0.65);
      ctx.closePath();
      ctx.fill();

      // Vermilion Forehead Shrine Diamond & Fox Eyeliner
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.45);
      ctx.lineTo(hw * 0.12, -hh * 0.28);
      ctx.lineTo(0, -hh * 0.12);
      ctx.lineTo(-hw * 0.12, -hh * 0.28);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 2.0;
      [-hw * 0.34, hw * 0.34].forEach((ex) => {
        ctx.beginPath();
        ctx.arc(ex, hh * 0.02, hw * 0.16, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      });

      // Black Fox Nose Tip
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, hh * 0.62, 3.0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 19: The Crystalline Core — 3D Multi-Pointed Amethyst Crystal Cluster
    case 19:
    default: {
      const spires = [
        { ang: -0.55, len: 0.78, w: 0.26, col1: '#e9d5ff', col2: '#7e22ce' },
        { ang: 0.55, len: 0.82, w: 0.26, col1: '#f3e8ff', col2: '#6b21a8' },
        { ang: -0.22, len: 0.92, w: 0.3, col1: '#f5d0fe', col2: '#9333ea' },
        { ang: 0.24, len: 0.88, w: 0.28, col1: '#e9d5ff', col2: '#7e22ce' },
        { ang: 0, len: 1.05, w: 0.36, col1: '#ffffff', col2: '#a855f7' },
      ];

      spires.forEach((sp) => {
        ctx.save();
        ctx.translate(0, hh * 0.45);
        ctx.rotate(sp.ang);
        const sw = hw * sp.w;
        const sh = hh * sp.len * 1.25;

        // Left lit crystal facet
        ctx.fillStyle = sp.col1;
        ctx.beginPath();
        ctx.moveTo(0, -sh);
        ctx.lineTo(-sw, -sh * 0.72);
        ctx.lineTo(-sw * 0.8, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Right shaded crystal facet
        ctx.fillStyle = sp.col2;
        ctx.beginPath();
        ctx.moveTo(0, -sh);
        ctx.lineTo(sw, -sh * 0.72);
        ctx.lineTo(sw * 0.8, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      break;
    }
  }

  ctx.restore();
}
