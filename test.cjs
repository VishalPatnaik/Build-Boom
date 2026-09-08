var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var themeRenderer_exports = {};
__export(themeRenderer_exports, {
  getBoomColor: () => getBoomColor,
  renderBackground: () => renderBackground,
  renderBlock: () => renderBlock,
  renderBoom: () => renderBoom,
  renderBoomParticle: () => renderBoomParticle,
  renderPlate: () => renderPlate,
  renderWorld: () => renderWorld
});
module.exports = __toCommonJS(themeRenderer_exports);
const hsl = (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`;
function renderBlock(ctx, x, y, w, h, id, isCenter, time) {
  const t = parseInt((id || "").replace("skin-", "")) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  const bounce = Math.sin(time / 200) * 4;
  const squash = 1 + Math.sin(time / 150) * 0.1;
  ctx.translate(0, bounce);
  ctx.scale(1 / squash, squash);
  const circle = (cx, cy, r, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const rect = (cx, cy, rw, rh, fill) => {
    ctx.fillStyle = fill;
    ctx.fillRect(cx - rw / 2, cy - rh / 2, rw, rh);
  };
  switch (t) {
    case 0:
    // Spring Bee
    case 1:
    // Autumn Bee
    case 2:
    // Winter Bee
    case 3:
      const beeBody = t === 1 ? "#FF8C00" : t === 2 ? "#ADD8E6" : t === 3 ? "#FF4500" : "#FFD700";
      const stripe = t === 2 ? "#113355" : "#000";
      circle(0, 0, w * 0.4, beeBody);
      rect(-w * 0.1, 0, w * 0.08, h * 0.8, stripe);
      rect(w * 0.1, 0, w * 0.08, h * 0.7, stripe);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.ellipse(-w * 0.2, -h * 0.3, w * 0.3, h * 0.15, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.2, -h * 0.3, w * 0.3, h * 0.15, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      circle(w * 0.2, -h * 0.1, 4, "#FFF");
      circle(w * 0.2, -h * 0.1, 2, stripe);
      break;
    case 4:
      circle(0, 0, w * 0.4, "#FFF");
      rect(0, h * 0.35, w * 0.4, h * 0.1, "#CCC");
      circle(0, -h * 0.05, w * 0.3, "#111");
      circle(w * 0.1, -h * 0.1, w * 0.05, "rgba(255,255,255,0.3)");
      ctx.strokeStyle = "#CCC";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, -h * 0.2);
      ctx.lineTo(w * 0.5, -h * 0.4);
      ctx.stroke();
      circle(w * 0.5, -h * 0.4, 3, "#F00");
      break;
    case 5:
      rect(0, h * 0.2, w * 0.6, h * 0.4, "#CCC");
      circle(-w * 0.3, h * 0.4, w * 0.15, "#333");
      circle(w * 0.3, h * 0.4, w * 0.15, "#333");
      circle(-w * 0.3, h * 0.4, w * 0.05, "#888");
      circle(w * 0.3, h * 0.4, w * 0.05, "#888");
      rect(0, -h * 0.1, w * 0.2, h * 0.3, "#AAA");
      rect(0, -h * 0.3, w * 0.4, h * 0.2, "#DDD");
      circle(w * 0.1, -h * 0.3, w * 0.08, "#0FF");
      break;
    case 6:
      circle(0, h * 0.1, w * 0.3, "#0FF");
      ctx.fillStyle = "#F0F";
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.lineTo(-w * 0.2, 0);
      ctx.lineTo(w * 0.2, 0);
      ctx.fill();
      circle(-w * 0.4, h * 0.1, w * 0.15, "#F0F");
      circle(w * 0.4, h * 0.1, w * 0.15, "#F0F");
      break;
    case 7:
      ctx.fillStyle = "#FF4500";
      ctx.beginPath();
      ctx.ellipse(0, h * 0.2, w * 0.4, h * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, h * 0.2);
      ctx.quadraticCurveTo(0, -h * 0.5, w * 0.3, h * 0.2);
      ctx.fill();
      circle(-w * 0.1, 0, 4, "#FFD700");
      circle(w * 0.1, 0, 4, "#FFD700");
      break;
    case 8:
      rect(0, h * 0.1, w * 0.5, h * 0.5, "#AAA");
      rect(0, -h * 0.2, w * 0.4, h * 0.4, "#888");
      rect(0, -h * 0.2, w * 0.3, h * 0.1, "#111");
      ctx.fillStyle = "#F00";
      ctx.beginPath();
      ctx.moveTo(-w * 0.1, -h * 0.4);
      ctx.lineTo(w * 0.1, -h * 0.4);
      ctx.lineTo(0, -h * 0.6);
      ctx.fill();
      break;
    case 9:
      ctx.fillStyle = "#A9A9A9";
      ctx.beginPath();
      ctx.ellipse(0, h * 0.1, w * 0.4, h * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,255,127,0.7)";
      ctx.beginPath();
      ctx.arc(0, h * 0.05, w * 0.2, Math.PI, 0);
      ctx.fill();
      circle(-w * 0.2, h * 0.1, 3, "#FFF");
      circle(0, h * 0.1, 3, "#FFF");
      circle(w * 0.2, h * 0.1, 3, "#FFF");
      break;
    case 10:
      ctx.fillStyle = "#FFF";
      rect(0, h * 0.2, w * 0.2, h * 0.4, "#FFF");
      ctx.fillStyle = "#DC143C";
      ctx.beginPath();
      ctx.arc(0, h * 0.1, w * 0.4, Math.PI, 0);
      ctx.fill();
      circle(-w * 0.2, -h * 0.1, 5, "#FFF");
      circle(0, -h * 0.2, 7, "#FFF");
      circle(w * 0.2, -h * 0.1, 4, "#FFF");
      break;
    case 11:
      circle(0, 0, w * 0.3, "#F00");
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, -h * 0.1);
      ctx.lineTo(w * 0.4, 0);
      ctx.lineTo(w * 0.2, h * 0.1);
      ctx.fill();
      circle(w * 0.1, -h * 0.1, 4, "#000");
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, -h * 0.1);
      ctx.lineTo(-w * 0.1, -h * 0.1);
      ctx.lineTo(-w * 0.2, h * 0.1);
      ctx.fill();
      ctx.fillStyle = "#00F";
      ctx.beginPath();
      ctx.ellipse(-w * 0.2, h * 0.1, w * 0.1, h * 0.3, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 12:
      ctx.fillStyle = "rgba(255, 105, 180, 0.8)";
      circle(0, h * 0.1, w * 0.35, "");
      circle(0, -h * 0.2, w * 0.25, "");
      circle(-w * 0.2, -h * 0.35, w * 0.1, "");
      circle(w * 0.2, -h * 0.35, w * 0.1, "");
      circle(-w * 0.25, h * 0.3, w * 0.12, "");
      circle(w * 0.25, h * 0.3, w * 0.12, "");
      break;
    case 13:
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, h * 0.4);
      ctx.lineTo(w * 0.3, h * 0.4);
      ctx.lineTo(w * 0.2, -h * 0.3);
      ctx.lineTo(-w * 0.2, -h * 0.3);
      ctx.fill();
      circle(w * 0.1, -h * 0.1, 5, "#000");
      circle(-w * 0.1, -h * 0.1, 5, "#000");
      break;
    case 14:
      rect(0, 0, w * 0.5, h * 0.6, "#222");
      ctx.fillStyle = "#0FF";
      ctx.fillRect(-w * 0.2, -h * 0.1, w * 0.4, h * 0.1);
      ctx.fillStyle = "#F0F";
      ctx.fillRect(-w * 0.2, h * 0.1, w * 0.4, h * 0.1);
      if (Math.random() > 0.8) ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
      circle(0, -h * 0.4, w * 0.2, "#0FF");
      break;
    case 15:
      ctx.fillStyle = "#32CD32";
      ctx.beginPath();
      ctx.ellipse(0, h * 0.2, w * 0.4, h * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, h * 0.2);
      ctx.quadraticCurveTo(0, -h * 0.5, w * 0.3, h * 0.2);
      ctx.fill();
      circle(-w * 0.2, 0, 6, "#FFF");
      circle(-w * 0.2, 0, 2, "#000");
      circle(w * 0.1, -h * 0.1, 8, "#FFF");
      circle(w * 0.1, -h * 0.1, 2, "#000");
      circle(w * 0.2, h * 0.1, 5, "#FFF");
      circle(w * 0.2, h * 0.1, 1, "#000");
      break;
    case 16:
      circle(0, 0, w * 0.4, "#191970");
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, -h * 0.1);
      ctx.lineTo(w * 0.4, 0);
      ctx.lineTo(w * 0.2, h * 0.1);
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.quadraticCurveTo(w * 0.3, -h * 0.6, w * 0.5, -h * 0.2);
      ctx.stroke();
      circle(w * 0.5, -h * 0.2, 6, "#0FF");
      break;
    case 17:
      ctx.fillStyle = "#FFF";
      circle(0, h * 0.1, w * 0.3, "");
      circle(-w * 0.2, h * 0.2, w * 0.2, "");
      circle(w * 0.2, h * 0.2, w * 0.2, "");
      circle(0, -h * 0.1, w * 0.25, "");
      circle(-w * 0.1, -h * 0.1, 4, "#0FF");
      circle(w * 0.1, -h * 0.1, 4, "#0FF");
      break;
    case 18:
      rect(0, h * 0.2, w * 0.5, h * 0.3, "#777");
      circle(-w * 0.3, h * 0.35, w * 0.1, "#333");
      circle(w * 0.3, h * 0.35, w * 0.1, "#333");
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.2);
      ctx.lineTo(w * 0.5, h * 0.35);
      ctx.lineTo(w * 0.25, h * 0.5);
      ctx.fill();
      ctx.strokeStyle = "#DAA520";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-w * 0.3, -h * 0.1, w * 0.15, 0, Math.PI);
      ctx.stroke();
      break;
    case 19:
      circle(0, 0, w * 0.3, "#111");
      ctx.strokeStyle = "#F00";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.4, time / 100, time / 100 + Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#0F0";
      ctx.fillText(Math.random() > 0.5 ? "1" : "0", -5, 5);
      break;
    case 20:
      ctx.fillStyle = "#0F0";
      ctx.fillRect(-w * 0.1, -h * 0.4, w * 0.2, h * 0.8);
      ctx.fillRect(-w * 0.2, h * 0.2, w * 0.4, h * 0.2);
      ctx.fillRect(-w * 0.2, -h * 0.4, w * 0.4, h * 0.2);
      break;
    default:
      circle(0, 0, w * 0.4, "#CCC");
      break;
  }
  ctx.restore();
}
function renderPlate(ctx, x, y, w, h, id, time) {
  const t = parseInt((id || "").replace("plate-", "")) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  const bob = Math.sin(time / 300 + t) * (h * 0.05);
  ctx.translate(0, bob);
  const drawRock = (color, shadow) => {
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.moveTo(-w * 0.4, h * 0.2);
    ctx.lineTo(w * 0.4, h * 0.2);
    ctx.lineTo(0, h * 0.4);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-w * 0.4, h * 0.2);
    ctx.lineTo(-w * 0.2, -h * 0.3);
    ctx.lineTo(w * 0.2, -h * 0.3);
    ctx.lineTo(w * 0.4, h * 0.2);
    ctx.fill();
  };
  const drawCirclePlate = (fill, rim) => {
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.1, w * 0.45, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.4, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  switch (t) {
    case 0:
      drawCirclePlate("#90EE90", "#3CB371");
      ctx.fillStyle = "#228B22";
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(i * w * 0.15, -h * 0.1, 4, -h * 0.2 - Math.abs(i) * 5);
      }
      break;
    case 1:
      drawCirclePlate("#D2B48C", "#8B4513");
      ctx.fillStyle = "#FF4500";
      ctx.beginPath();
      ctx.arc(w * 0.2, -h * 0.1, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(-w * 0.2, -h * 0.15, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 2:
      ctx.fillStyle = "#E0FFFF";
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.lineTo(w * 0.4, 0);
      ctx.lineTo(0, h * 0.4);
      ctx.lineTo(-w * 0.4, 0);
      ctx.fill();
      ctx.fillStyle = "#ADD8E6";
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.lineTo(w * 0.4, 0);
      ctx.lineTo(0, 0);
      ctx.fill();
      break;
    case 3:
      drawRock("#CD5C5C", "#8B0000");
      break;
    case 4:
      drawCirclePlate("#D3D3D3", "#808080");
      ctx.fillStyle = "#A9A9A9";
      ctx.beginPath();
      ctx.arc(-w * 0.1, -h * 0.05, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#808080";
      ctx.beginPath();
      ctx.arc(w * 0.2, h * 0.05, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 5:
      drawRock("#CD5C5C", "#8B0000");
      ctx.fillStyle = "#B22222";
      ctx.beginPath();
      ctx.moveTo(-w * 0.2, -h * 0.3);
      ctx.lineTo(0, -h * 0.4);
      ctx.lineTo(w * 0.2, -h * 0.3);
      ctx.fill();
      break;
    case 6:
      drawRock("#4682B4", "#191970");
      ctx.fillStyle = "#0FF";
      ctx.beginPath();
      ctx.moveTo(-w * 0.1, h * 0.2);
      ctx.lineTo(-w * 0.2, -h * 0.4);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.fillStyle = "#E0FFFF";
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.2);
      ctx.lineTo(w * 0.3, -h * 0.3);
      ctx.lineTo(0, 0);
      ctx.fill();
      break;
    case 7:
      drawRock("#2F4F4F", "#000000");
      ctx.fillStyle = "#FF4500";
      ctx.beginPath();
      ctx.moveTo(-w * 0.1, h * 0.2);
      ctx.lineTo(0, -h * 0.1);
      ctx.lineTo(w * 0.1, h * 0.2);
      ctx.fill();
      break;
    case 8:
      ctx.fillStyle = "#808080";
      ctx.fillRect(-w * 0.4, -h * 0.2, w * 0.8, h * 0.4);
      ctx.strokeStyle = "#696969";
      ctx.lineWidth = 2;
      ctx.strokeRect(-w * 0.4, -h * 0.2, w * 0.8, h * 0.2);
      ctx.strokeRect(-w * 0.4, 0, w * 0.4, h * 0.2);
      ctx.strokeRect(0, 0, w * 0.4, h * 0.2);
      ctx.fillStyle = "#555";
      ctx.fillRect(-w * 0.5, -h * 0.3, w * 0.2, h * 0.2);
      ctx.fillRect(w * 0.3, -h * 0.3, w * 0.2, h * 0.2);
      break;
    case 9:
      ctx.fillStyle = "rgba(138,43,226,0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.45, h * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 10:
      ctx.fillStyle = "#FFF";
      ctx.fillRect(-w * 0.1, 0, w * 0.2, h * 0.4);
      ctx.fillStyle = "#FF69B4";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.4, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(-w * 0.2, -h * 0.1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.2, -h * 0.15, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 11:
      drawCirclePlate("#DEB887", "#8B4513");
      ctx.strokeStyle = "#A0522D";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, -h * 0.1);
      ctx.lineTo(w * 0.3, -h * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-w * 0.35, h * 0.1);
      ctx.lineTo(w * 0.35, h * 0.1);
      ctx.stroke();
      break;
    case 12:
      drawCirclePlate("#FFC0CB", "#FF69B4");
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(-w * 0.1, -h * 0.1, w * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.15, 0, w * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, h * 0.1, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 13:
      ctx.fillStyle = "#DAA520";
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, h * 0.2);
      ctx.lineTo(w * 0.4, h * 0.2);
      ctx.lineTo(w * 0.2, -h * 0.2);
      ctx.lineTo(-w * 0.2, -h * 0.2);
      ctx.fill();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, h * 0.2);
      ctx.lineTo(w * 0.4, h * 0.2);
      ctx.lineTo(0, 0);
      ctx.fill();
      break;
    case 14:
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, -h * 0.2);
      ctx.lineTo(w * 0.4, -h * 0.2);
      ctx.lineTo(w * 0.2, h * 0.2);
      ctx.lineTo(-w * 0.2, h * 0.2);
      ctx.fill();
      ctx.strokeStyle = "#0FF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, -h * 0.2);
      ctx.lineTo(w * 0.4, -h * 0.2);
      ctx.lineTo(w * 0.2, h * 0.2);
      ctx.lineTo(-w * 0.2, h * 0.2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-w * 0.1, -h * 0.2);
      ctx.lineTo(0, h * 0.2);
      ctx.stroke();
      break;
    case 15:
      drawCirclePlate("#32CD32", "#006400");
      ctx.fillStyle = "#0F0";
      ctx.beginPath();
      ctx.arc(-w * 0.1, h * 0.1, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 16:
      drawCirclePlate("#000080", "#000033");
      ctx.fillStyle = "#4169E1";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-w * 0.2, -h * 0.2);
      ctx.lineTo(w * 0.2, -h * 0.2);
      ctx.fill();
      break;
    case 17:
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.arc(-w * 0.2, 0, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.2, 0, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -h * 0.1, w * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 18:
      ctx.fillStyle = "#B8860B";
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-w * 0.05, -h * 0.4, w * 0.1, h * 0.8);
      }
      ctx.fillStyle = "#DAA520";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 19:
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#F00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#F00";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 20:
      ctx.fillStyle = "#000";
      ctx.fillRect(-w * 0.4, -h * 0.4, w * 0.8, h * 0.8);
      ctx.strokeStyle = "#0F0";
      ctx.lineWidth = 2;
      ctx.strokeRect(-w * 0.4, -h * 0.4, w * 0.8, h * 0.8);
      break;
    default:
      drawCirclePlate("#FFF", "#CCC");
      break;
  }
  ctx.restore();
}
function renderBoom(ctx, x, y, w, h, id, time) {
  const t = parseInt((id || "").replace("boom-", "")) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(time / 200);
  const circle = (cx, cy, r, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  switch (t) {
    case 0:
      circle(0, 0, w * 0.4, "#F00");
      ctx.fillStyle = "#0A0";
      ctx.beginPath();
      ctx.ellipse(w * 0.1, -h * 0.3, w * 0.2, h * 0.1, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 1:
      ctx.fillStyle = "#8B4513";
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w * 0.2, -h * 0.4);
        ctx.lineTo(w * 0.2, -h * 0.4);
        ctx.fill();
      }
      circle(0, 0, w * 0.2, "#5C4033");
      break;
    case 2:
      circle(0, 0, w * 0.4, "#FFF");
      circle(w * 0.1, -h * 0.1, w * 0.1, "#EEF");
      break;
    case 3:
      ctx.fillStyle = "#FFA500";
      ctx.fillRect(-w * 0.3, -h * 0.4, w * 0.6, h * 0.8);
      ctx.fillStyle = "#FF4500";
      ctx.fillRect(-w * 0.3, -h * 0.4, w * 0.6, h * 0.1);
      ctx.fillRect(-w * 0.3, h * 0.3, w * 0.6, h * 0.1);
      break;
    case 4:
      circle(0, 0, w * 0.4, "#888");
      circle(-w * 0.1, -h * 0.1, w * 0.1, "#555");
      circle(w * 0.2, h * 0.1, w * 0.15, "#555");
      break;
    case 5:
      ctx.fillStyle = "#F00";
      ctx.fillRect(-w * 0.4, -h * 0.1, w * 0.8, h * 0.2);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(-w * 0.3, -h * 0.05, w * 0.6, h * 0.1);
      break;
    case 6:
      ctx.fillStyle = "#0FF";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4);
      ctx.lineTo(-w * 0.2, -h * 0.3);
      ctx.lineTo(w * 0.2, -h * 0.3);
      ctx.fill();
      break;
    case 7:
      ctx.fillStyle = "#FF4500";
      circle(0, 0, w * 0.3, "");
      ctx.fillStyle = "#FFA500";
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, 0);
      ctx.lineTo(0, -h * 0.5);
      ctx.lineTo(w * 0.3, 0);
      ctx.fill();
      break;
    case 8:
      circle(0, 0, w * 0.4, "#777");
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.3, 0, Math.PI);
      ctx.stroke();
      break;
    case 9:
      circle(0, 0, w * 0.4, "rgba(255,0,255,0.5)");
      circle(0, 0, w * 0.2, "#FFF");
      break;
    case 10:
      circle(0, 0, w * 0.3, "rgba(0,255,255,0.8)");
      ctx.fillStyle = "#FFF";
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-2, -h * 0.4, 4, h * 0.8);
      }
      break;
    case 11:
      circle(0, 0, w * 0.35, "#222");
      circle(w * 0.1, -h * 0.1, w * 0.1, "#555");
      break;
    case 12:
      circle(0, 0, w * 0.4, "#FFF");
      ctx.fillStyle = "#F00";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.4, 0, Math.PI / 2);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.fillStyle = "#00F";
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.4, Math.PI, Math.PI * 1.5);
      ctx.lineTo(0, 0);
      ctx.fill();
      break;
    case 13:
      circle(0, 0, w * 0.4, "#FFD700");
      circle(0, 0, w * 0.3, "#DAA520");
      ctx.fillStyle = "#B8860B";
      ctx.font = `${w * 0.4}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 0);
      break;
    case 14:
      circle(0, 0, w * 0.4, "rgba(0,255,255,0.3)");
      ctx.strokeStyle = "#0FF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.3, 0, Math.PI * 1.5);
      ctx.stroke();
      break;
    case 15:
      ctx.fillStyle = "#32CD32";
      ctx.fillRect(-w * 0.3, -h * 0.4, w * 0.6, h * 0.8);
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 4;
      ctx.strokeRect(-w * 0.3, -h * 0.4, w * 0.6, h * 0.8);
      ctx.fillStyle = "#111";
      circle(0, 0, w * 0.1, "");
      break;
    case 16:
      circle(0, 0, w * 0.3, "#444");
      ctx.fillStyle = "#222";
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        circle(0, -h * 0.35, 4, "");
      }
      break;
    case 17:
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.4);
      ctx.lineTo(w * 0.3, 0);
      ctx.lineTo(0, h * 0.1);
      ctx.lineTo(0, h * 0.4);
      ctx.lineTo(-w * 0.2, 0);
      ctx.lineTo(0, -h * 0.1);
      ctx.fill();
      break;
    case 18:
      circle(0, 0, w * 0.3, "#A0522D");
      circle(0, 0, w * 0.1, "#000");
      ctx.fillStyle = "#A0522D";
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-w * 0.05, -h * 0.4, w * 0.1, h * 0.2);
      }
      break;
    case 19:
      ctx.fillStyle = "#F00";
      ctx.font = `${w * 0.6}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", 0, 0);
      ctx.strokeStyle = "#F00";
      ctx.lineWidth = 3;
      ctx.strokeRect(-w * 0.4, -h * 0.4, w * 0.8, h * 0.8);
      break;
    case 20:
      circle(0, 0, w * 0.3, "#0F0");
      ctx.strokeStyle = "#0F0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, -h * 0.2);
      ctx.lineTo(w * 0.4, h * 0.2);
      ctx.stroke();
      break;
    default:
      circle(0, 0, w * 0.4, "#F00");
      break;
  }
  ctx.restore();
}
function renderBackground(ctx, w, h, id, time, withUI) {
  const t = parseInt((id || "").replace("bg-", "")) || 0;
  ctx.save();
  const drawSky = (top, bot) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  const drawPlanet = (cx, cy, r, fill, glow) => {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 30;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  const drawStars = (count, speedMult, sizeMult = 1) => {
    ctx.fillStyle = "#FFF";
    for (let i = 0; i < count; i++) {
      const x = ((i * 73.123 + time * 0.01 * speedMult) % 1.2 - 0.1) * w;
      const y = ((i * 89.321 + time * 5e-3 * speedMult) % 1.2 - 0.1) * h;
      const r = i % 3 * sizeMult;
      ctx.globalAlpha = 0.3 + 0.7 * Math.sin(time / 500 + i);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  const drawMountains = (color, offset, heightMult, parallax) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= 10; i++) {
      const px = i * w / 10;
      const py = h - Math.sin(i * 1.5 + offset + time * parallax) * h * heightMult - h * 0.2;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  };
  switch (t) {
    case 0:
      drawSky("#87CEEB", "#E0F6FF");
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(w * 0.2 + Math.sin(time / 2e3) * 50, h * 0.2, w * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.8 - Math.sin(time / 1500) * 50, h * 0.3, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      drawMountains("#98FB98", 0, 0.1, 0);
      ctx.fillStyle = "#3CB371";
      ctx.beginPath();
      ctx.arc(w * 0.3, h, w * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#228B22";
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 1.1, w * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFF";
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc((time * 0.05 + i * 37) % w, h - (time * 0.02 + i * 41) % (h * 0.5), 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 1:
      drawSky("#FF8C00", "#FFD700");
      drawMountains("#CD853F", 5, 0.15, 1e-4);
      ctx.fillStyle = "#8B4513";
      ctx.beginPath();
      ctx.arc(w * 0.1, h * 0.8, w * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#D2691E";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 1.2, w, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FF4500";
      for (let i = 0; i < 40; i++) {
        const lx = (time * 0.08 + i * 53 + Math.sin(time / 500 + i) * 20) % w;
        const ly = (time * 0.15 + i * 31) % h;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(time / 200 + i);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      }
      break;
    case 2:
      drawSky("#B0E0E6", "#F0F8FF");
      drawMountains("#ADD8E6", 0, 0.3, 0);
      drawMountains("#FFF", 2, 0.4, 0);
      ctx.fillStyle = "#FFF";
      for (let i = 0; i < 80; i++) {
        ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc((time * 0.05 + Math.sin(time / 1e3 + i) * 30 + i * 17) % w, (time * 0.1 + i * 23) % h, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    case 3:
      drawSky("#4B0082", "#FF4500");
      drawPlanet(w * 0.5, h * 0.5, w * 0.2, "#FFD700", "#FF8C00");
      drawMountains("#8B0000", 3, 0.1, 0);
      drawMountains("#111", 1, 0.15, 0);
      break;
    case 4:
      drawSky("#000011", "#111122");
      drawStars(100, 0.1, 0.5);
      drawPlanet(w * 0.2, h * 0.2, w * 0.08, "#4169E1", "#0000FF");
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(w * 0.23, h * 0.23, w * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 1.5, w * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.ellipse(w * 0.3, h * 0.7, w * 0.15, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.7, h * 0.8, w * 0.2, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 5:
      drawSky("#4A0404", "#B22222");
      drawMountains("#8B0000", 2, 0.2, 1e-4);
      drawMountains("#A52A2A", 4, 0.1, 2e-4);
      ctx.fillStyle = "#D2691E";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 1.1, w * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,140,0,0.1)";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect((time * 0.5 + i * 100) % w, 0, w * 0.5, h);
      }
      break;
    case 6:
      drawSky("#000022", "#004466");
      drawMountains("#001133", 0, 0.3, 0);
      ctx.fillStyle = "#0FF";
      for (let i = 0; i < 15; i++) {
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(time / 500 + i);
        ctx.beginPath();
        ctx.moveTo(w * 0.1 * i, h);
        ctx.lineTo(w * 0.1 * i + 20, h * 0.5 - Math.sin(i) * h * 0.2);
        ctx.lineTo(w * 0.1 * i + 40, h);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    case 7:
      drawSky("#220000", "#660000");
      drawMountains("#330000", 0, 0.4, 0);
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.2, h * 0.6);
      ctx.lineTo(w * 0.4, h * 0.7);
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillStyle = "#FF4500";
      ctx.shadowColor = "#FF0000";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.6);
      ctx.lineTo(w * 0.4, h * 0.7);
      ctx.lineTo(w * 0.6, h);
      ctx.lineTo(w * 0.1, h);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#FFD700";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(w * 0.5 + Math.sin(time / 200 + i) * w * 0.4, h - (time * 0.1 + i * 20) % h, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 8:
      drawSky("#4682B4", "#87CEEB");
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.3, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#777";
      ctx.fillRect(w * 0.1, h * 0.4, w * 0.8, h);
      ctx.fillStyle = "#555";
      ctx.fillRect(w * 0.05, h * 0.3, w * 0.2, h);
      ctx.fillRect(w * 0.75, h * 0.3, w * 0.2, h);
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.5, w * 0.05, Math.PI, 0);
      ctx.fillRect(w * 0.1, h * 0.5, w * 0.1, h * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.5, w * 0.05, Math.PI, 0);
      ctx.fillRect(w * 0.8, h * 0.5, w * 0.1, h * 0.1);
      ctx.fill();
      break;
    case 9:
      drawSky("#050515", "#2B003B");
      drawStars(200, 0.05, 1.5);
      const neb = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
      neb.addColorStop(0, "rgba(0, 255, 255, 0.4)");
      neb.addColorStop(0.5, "rgba(138, 43, 226, 0.2)");
      neb.addColorStop(1, "transparent");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, w * 0.4 + Math.sin(time / 1e3 + i) * 50, h * 0.2 + Math.cos(time / 1e3 + i) * 50, time / 2e3 + i, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 10:
      drawSky("#001A00", "#004411");
      ctx.fillStyle = "#002200";
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(i * w * 0.2 + Math.sin(i) * 20, 0, w * 0.08, h);
      }
      ctx.fillStyle = "#005511";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * w * 0.3 + 20, -50, w * 0.12, h + 100);
      }
      ctx.fillStyle = "#ADFF2F";
      for (let i = 0; i < 40; i++) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time / 200 + i);
        ctx.beginPath();
        ctx.arc((time * 0.02 + i * 67) % w, h * 0.5 + Math.sin(time / 300 + i) * h * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    case 11:
      drawSky("#FF7F50", "#87CEEB");
      drawMountains("#2E8B57", 0, 0.2, 0);
      ctx.fillStyle = "#1E90FF";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let j = 0; j <= 10; j++) {
          ctx.lineTo(j * w / 10, h * 0.6 + i * h * 0.1 + Math.sin(time / 300 + j + i) * 20);
        }
        ctx.lineTo(w, h);
        ctx.fill();
        ctx.fillStyle = i === 0 ? "#4169E1" : "#0000CD";
      }
      break;
    case 12:
      drawSky("#FFB6C1", "#FFC0CB");
      drawMountains("#FF69B4", 0, 0.15, 0);
      drawMountains("#FF1493", 3, 0.1, 0);
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.quadraticCurveTo(w * 0.25, h * 0.8, w * 0.5, h * 0.7);
      ctx.quadraticCurveTo(w * 0.75, h * 0.6, w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(w * 0.2, h * 0.8, 10, 20);
      ctx.fillStyle = "#FFFF00";
      ctx.fillRect(w * 0.5, h * 0.85, 20, 10);
      ctx.fillStyle = "#FF00FF";
      ctx.fillRect(w * 0.8, h * 0.75, 10, 20);
      break;
    case 13:
      drawSky("#DAA520", "#FFD700");
      drawMountains("#B8860B", 0, 0.2, 0);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5, -h * 0.2);
        ctx.lineTo(w * 0.2 * i, h);
        ctx.lineTo(w * 0.2 * i + w * 0.1, h);
        ctx.fill();
      }
      ctx.fillStyle = "#FFF8DC";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 1.1, w * 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 14:
      drawSky("#050515", "#1A0033");
      ctx.fillStyle = "#111";
      for (let i = 0; i < 10; i++) {
        const bh = h * 0.3 + Math.sin(i * 7) * h * 0.3;
        ctx.fillRect(i * w / 10, h - bh, w / 10 + 2, bh);
        ctx.fillStyle = "#0FF";
        ctx.fillRect(i * w / 10 + 5, h - bh, w / 10 - 10, 2);
        ctx.fillStyle = "#F0F";
        ctx.fillRect(i * w / 10 + w / 20, h - bh + 20, 2, bh - 20);
        ctx.fillStyle = "#111";
      }
      ctx.strokeStyle = "#F0F";
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.8 + i * 20 + time * 0.05 % 20);
        ctx.lineTo(w, h * 0.8 + i * 20 + time * 0.05 % 20);
        ctx.stroke();
      }
      break;
    case 15:
      drawSky("#0A1A0A", "#1A331A");
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.2, h * 0.5);
      ctx.lineTo(w * 0.4, h * 0.6);
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillStyle = "#32CD32";
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      ctx.fillStyle = "#7CFC00";
      for (let i = 0; i < 20; i++) {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time / 100 + i);
        ctx.beginPath();
        ctx.arc(w * 0.05 * i, h * 0.7 + Math.random() * h * 0.3 - Math.sin(time / 150 + i) * 30, Math.random() * 8 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    case 16:
      drawSky("#000011", "#000044");
      ctx.fillStyle = "#000022";
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      ctx.strokeStyle = "#2E8B57";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.1 * i + 20, h);
        ctx.quadraticCurveTo(w * 0.1 * i + 20 + Math.sin(time / 400 + i) * 40, h * 0.6, w * 0.1 * i + 20 + Math.sin(time / 300 + i) * 60, h * 0.4);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 0);
      ctx.lineTo(w * 0.7, 0);
      ctx.lineTo(w * 0.9, h);
      ctx.lineTo(w * 0.1, h);
      ctx.fill();
      ctx.fillStyle = "#E0FFFF";
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc((w * 0.1 * i + Math.sin(time / 200 + i) * 20) % w, h - (time * 0.05 + i * 40) % h, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 17:
      drawSky("#87CEEB", "#4169E1");
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.arc(w * 0.2 + time * 0.01 % w, h * 0.3, w * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.7 + time * 0.015 % w, h * 0.5, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#228B22";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.6 + Math.sin(time / 500) * 20, w * 0.3, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#8B4513";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.6 + Math.sin(time / 500) * 20);
      ctx.lineTo(w * 0.8, h * 0.6 + Math.sin(time / 500) * 20);
      ctx.lineTo(w * 0.5, h * 0.8 + Math.sin(time / 500) * 20);
      ctx.fill();
      break;
    case 18:
      drawSky("#3E2723", "#4E342E");
      ctx.strokeStyle = "rgba(218,165,32,0.3)";
      ctx.lineWidth = 20;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(w * (i * 0.4), h * (0.3 + i * 0.2), w * 0.3, time / 1e3 * (i % 2 === 0 ? 1 : -1), time / 1e3 * (i % 2 === 0 ? 1 : -1) + Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * (i * 0.4) - Math.cos(time / 1e3) * w * 0.3, h * (0.3 + i * 0.2) - Math.sin(time / 1e3) * w * 0.3);
        ctx.lineTo(w * (i * 0.4) + Math.cos(time / 1e3) * w * 0.3, h * (0.3 + i * 0.2) + Math.sin(time / 1e3) * w * 0.3);
        ctx.stroke();
      }
      ctx.fillStyle = "#222";
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      break;
    case 19:
      drawSky("#000000", "#110000");
      const core = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
      core.addColorStop(0, "rgba(255, 0, 0, 0.4)");
      core.addColorStop(0.5, "rgba(255, 100, 0, 0.1)");
      core.addColorStop(1, "transparent");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#F00";
      for (let i = 0; i < 50; i++) {
        const d = (time * 0.1 + i * 13) % w;
        const ang = i * Math.PI * 2 / 50;
        ctx.beginPath();
        ctx.arc(w / 2 + Math.cos(ang) * d, h / 2 + Math.sin(ang) * d, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#111";
      ctx.fillRect(0, h * 0.9, w, h * 0.1);
      break;
    case 20:
      drawSky("#000000", "#001100");
      ctx.fillStyle = "#0F0";
      ctx.font = `${Math.max(10, h * 0.05)}px monospace`;
      for (let i = 0; i < 10; i++) {
        ctx.fillText("01010101", (Math.sin(i * 7) * 0.5 + 0.5) * w, (time * 0.5 + i * h * 0.1) % h);
      }
      break;
    default:
      drawSky("#000", "#333");
      break;
  }
  ctx.restore();
}
function getBoomColor(id) {
  const t = parseInt((id || "").replace("boom-", "")) || 0;
  const colors = [
    "#F00",
    "#8B4513",
    "#FFF",
    "#FFA500",
    "#888",
    "#F00",
    "#0FF",
    "#FF4500",
    "#777",
    "#F0F",
    "#0FF",
    "#222",
    "#FFF",
    "#FFD700",
    "#0FF",
    "#32CD32",
    "#444",
    "#FFD700",
    "#A0522D",
    "#F00",
    "#0F0"
  ];
  return colors[t] || "#FFF";
}
function renderBoomParticle(ctx, p, time, id) {
  const t = parseInt((id || "").replace("boom-", "")) || 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation + time * 0.01);
  ctx.globalAlpha = Math.max(0, p.life);
  if (p.type === "ring") {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = p.color;
    if (t === 19 || t === 20) {
      ctx.font = `${p.size}px monospace`;
      ctx.fillText(Math.random() > 0.5 ? "0" : "1", 0, 0);
    } else if (t % 2 === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }
  }
  ctx.restore();
}
const renderWorld = renderBackground;
