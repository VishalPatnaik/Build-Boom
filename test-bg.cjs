const { renderBackground } = require('./test.cjs');

const ctx = {
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  fill: () => {},
  stroke: () => {},
  arc: () => {},
  rect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  fillText: () => {},
  translate: () => {},
  rotate: () => {},
  scale: () => {},
  ellipse: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
};

for(let i=0; i<=20; i++) {
  try {
    renderBackground(ctx, 100, 100, 'bg-' + i, 100, true);
  } catch(e) {
    console.error('Error on bg-' + i + ':', e);
  }
}
console.log('Done testing backgrounds');
