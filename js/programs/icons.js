// Flat round icons drawn on a canvas: one per course group and one per career. Used as sprite textures on the
// stage and as <img> data URLs in the panel, so the two always match.
import * as THREE from 'three';

export const FONT = '"IBM Plex Sans Thai", system-ui, sans-serif';

// glyphs drawn in white on a 256 px canvas centred at (128,128)
const G = {
  pi(c) { c.font = `600 150px ${FONT}`; c.fillText('π', 128, 140); },
  code(c) { c.font = `700 104px ui-monospace, Consolas, monospace`; c.fillText('</>', 128, 132); },
  chip(c) {
    c.lineWidth = 12; c.strokeRect(78, 78, 100, 100); c.fillRect(104, 104, 48, 48);
    for (let i = 0; i < 3; i++) for (const [x, y, dx, dy] of [[98 + i * 30, 78, 0, -24], [98 + i * 30, 178, 0, 24], [78, 98 + i * 30, -24, 0], [178, 98 + i * 30, 24, 0]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx, y + dy); c.stroke(); }
  },
  network(c) {
    const P = [[128, 70], [70, 170], [186, 170], [128, 140]];
    c.lineWidth = 10; for (const [a, b] of [[0, 3], [1, 3], [2, 3], [0, 1], [0, 2], [1, 2]]) { c.beginPath(); c.moveTo(...P[a]); c.lineTo(...P[b]); c.stroke(); }
    for (const [x, y] of P) { c.beginPath(); c.arc(x, y, 20, 0, Math.PI * 2); c.fill(); }
  },
  shield(c) {
    c.beginPath(); c.moveTo(128, 56); c.lineTo(192, 80); c.quadraticCurveTo(192, 168, 128, 204); c.quadraticCurveTo(64, 168, 64, 80); c.closePath(); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.lineWidth = 16; c.beginPath(); c.moveTo(98, 128); c.lineTo(120, 152); c.lineTo(162, 104); c.stroke(); c.globalCompositeOperation = 'source-over';
  },
  ai(c) {
    const L = [[70, [96, 160]], [128, [70, 128, 186]], [186, [110, 146]]];
    c.lineWidth = 6;
    for (let i = 0; i < 2; i++) for (const y0 of L[i][1]) for (const y1 of L[i + 1][1]) { c.beginPath(); c.moveTo(L[i][0], y0); c.lineTo(L[i + 1][0], y1); c.stroke(); }
    for (const [x, ys] of L) for (const y of ys) { c.beginPath(); c.arc(x, y, 17, 0, Math.PI * 2); c.fill(); }
  },
  leaf(c) {
    c.beginPath(); c.moveTo(70, 190); c.bezierCurveTo(60, 100, 120, 60, 196, 62); c.bezierCurveTo(196, 140, 150, 196, 70, 190); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.lineWidth = 9; c.beginPath(); c.moveTo(78, 182); c.quadraticCurveTo(130, 130, 176, 84); c.stroke(); c.globalCompositeOperation = 'source-over';
  },
  speech(c) {
    c.beginPath(); c.roundRect(52, 64, 152, 104, 26); c.fill(); c.beginPath(); c.moveTo(92, 160); c.lineTo(80, 200); c.lineTo(124, 164); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.font = `700 64px ${FONT}`; c.fillText('Aa', 128, 120); c.globalCompositeOperation = 'source-over';
  },
  team(c) {
    for (const [x, y, r] of [[80, 104, 22], [176, 104, 22], [128, 88, 28]]) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
    for (const [x, y, r] of [[80, 176, 38], [176, 176, 38], [128, 178, 48]]) { c.beginPath(); c.arc(x, y, r, Math.PI, 0); c.fill(); }
  },
  gear(c) {
    c.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 62 : 80; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
    c.closePath(); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(128, 128, 26, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'source-over';
  },
  star(c) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, r = i % 2 ? 34 : 78; c.lineTo(128 + Math.cos(a) * r, 136 + Math.sin(a) * r); } c.closePath(); c.fill(); },
  monitor(c) { c.beginPath(); c.roundRect(58, 66, 140, 96, 10); c.fill(); c.fillRect(116, 162, 24, 22); c.fillRect(90, 182, 76, 12); c.globalCompositeOperation = 'destination-out'; c.fillRect(72, 80, 112, 68); c.globalCompositeOperation = 'source-over'; c.font = `700 40px ui-monospace, Consolas, monospace`; c.fillText('01', 128, 116); },
  server(c) { for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(64, 62 + i * 46, 128, 36, 8); c.fill(); } c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(170, 80 + i * 46, 7, 0, Math.PI * 2); c.fill(); c.fillRect(80, 76 + i * 46, 50, 8); } c.globalCompositeOperation = 'source-over'; },
  loop(c) { c.lineWidth = 20; c.beginPath(); for (let i = 0; i <= 64; i++) { const t = (i / 64) * Math.PI * 2, d = 1 + Math.sin(t) ** 2; c.lineTo(128 + (76 * Math.cos(t)) / d, 128 + (76 * Math.sin(t) * Math.cos(t)) / d); } c.stroke(); },
  book(c) { c.beginPath(); c.moveTo(128, 84); c.quadraticCurveTo(90, 64, 52, 72); c.lineTo(52, 180); c.quadraticCurveTo(90, 172, 128, 192); c.quadraticCurveTo(166, 172, 204, 180); c.lineTo(204, 72); c.quadraticCurveTo(166, 64, 128, 84); c.fill(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = 8; c.beginPath(); c.moveTo(128, 88); c.lineTo(128, 186); c.stroke(); c.globalCompositeOperation = 'source-over'; },
};

// course groups (the "kind" of each course) and careers: colour + glyph
export const GROUP_ICONS = {
  math: ['#3c3489', 'pi'], code: ['#0f6e56', 'code'], hw: ['#3b6d11', 'chip'], net: ['#185fa5', 'network'],
  sec: ['#534ab7', 'shield'], ai: ['#993556', 'ai'], soc: ['#639922', 'leaf'], lang: ['#ba7517', 'speech'],
  team: ['#d85a30', 'team'], proj: ['#854f0b', 'gear'], ge: ['#b08a12', 'star'],
};
export const CAREER_ICONS = {
  computer: ['#185fa5', 'monitor'], software: ['#0f6e56', 'code'], network: ['#378add', 'network'], hardware: ['#3b6d11', 'chip'],
  system: ['#444441', 'server'], cyber: ['#534ab7', 'shield'], devops: ['#1d9e75', 'loop'], ai: ['#993556', 'ai'], study: ['#a3171f', 'book'],
};

const cache = new Map();
export function iconCanvas(color, glyph) {
  const key = color + glyph;
  if (cache.has(key)) return cache.get(key);
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.arc(128, 134, 118, 0, Math.PI * 2); c.fill();   // soft drop
  c.fillStyle = color; c.beginPath(); c.arc(128, 128, 118, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 108, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#ffffff'; c.strokeStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineCap = 'round'; c.lineJoin = 'round';
  G[glyph](c);
  cache.set(key, cv); return cv;
}
export const iconURL = (color, glyph) => iconCanvas(color, glyph).toDataURL();
export function iconTexture(color, glyph) {
  const t = new THREE.CanvasTexture(iconCanvas(color, glyph)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// a text label as a sprite texture; returns { texture, aspect }
export function labelTexture(lines, { size = 44, color = '#1f2328', bg = 'rgba(255,255,255,0.92)' } = {}) {
  const cv = document.createElement('canvas'), c = cv.getContext('2d');
  const fonts = lines.map((_, i) => `${i ? 400 : 600} ${i ? size * 0.72 : size}px ${FONT}`);
  let w = 0; lines.forEach((l, i) => { c.font = fonts[i]; w = Math.max(w, c.measureText(l).width); });
  const lh = lines.map((_, i) => (i ? size * 0.72 : size) * 1.35), h = lh.reduce((a, b) => a + b, 0) + size * 0.5;
  cv.width = Math.ceil(w + size); cv.height = Math.ceil(h);
  c.fillStyle = bg; c.beginPath(); c.roundRect(0, 0, cv.width, cv.height, size * 0.45); c.fill();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  let y = size * 0.25;
  lines.forEach((l, i) => { c.font = fonts[i]; c.fillStyle = i ? '#5f5e5a' : color; c.fillText(l, cv.width / 2, y + lh[i] / 2); y += lh[i]; });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { texture: t, aspect: cv.width / cv.height };
}
