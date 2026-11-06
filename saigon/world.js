/* Thế giới 3D của Shipper Nhí Sài Gòn: đường phố, nhà cửa, cây xanh, xe cộ, người đi bộ, xe đạp của bé.
   Dùng three.js (vendor/three.module.min.js, giấy phép MIT). Đơn vị: mét. Hướng đi ban đầu là -Z. */
import * as THREE from './vendor/three.module.min.js';

export { THREE };

const UP = new THREE.Vector3(0, 1, 0);

/* ================= ngẫu nhiên có hạt giống (để mỗi lần chơi phố xá y như nhau) ================= */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  const f = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  f.int = (a, b) => a + Math.floor(f() * (b - a + 1));
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  return f;
}

/* ================= vải (texture) vẽ bằng canvas ================= */
const texCache = new Map();
function canvasTex(w, h, draw, key) {
  if (key && texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (key) texCache.set(key, t);
  return t;
}

function roadTexture() {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#5b5e63'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},${Math.random() * .07})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    // vạch tim đường (vàng, đứt) ở giữa; vạch trắng đứt chia làn; vạch liền sát lề
    g.fillStyle = '#e8c547'; g.fillRect(w / 2 - 4, 0, 8, h / 2);
    g.fillStyle = '#eceff1'; g.fillRect(w / 4 - 3, 0, 6, h / 2); g.fillRect(3 * w / 4 - 3, 0, 6, h / 2);
    g.fillRect(4, 0, 6, h); g.fillRect(w - 10, 0, 6, h);
  }, 'road').clone();
}
function sidewalkTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9b1a6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8f877c'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .08})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
  }, 'sidewalk').clone();
}
function plazaTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cdbfa8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b8a890';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) g.fillRect(x * 32, y * 32, 32, 32);
  }, 'plaza').clone();
}
const SKY = {
  morning: ['#2f7fd0', '#8fc6ef', '#dff0fb', '#f6e9d2'],
  sunset: ['#3b4c8f', '#c97d8e', '#f4a261', '#ffe0a3'],
  dusk: ['#0b1a3a', '#24386b', '#5a4f8a', '#d98a6a']
};
function skyTexture(time = 'morning') {
  return canvasTex(64, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); const c = SKY[time] || SKY.morning;
    gr.addColorStop(0, c[0]); gr.addColorStop(.45, c[1]); gr.addColorStop(.62, c[2]); gr.addColorStop(1, c[3]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, 'sky-' + time);
}
function glowTexture() {
  return canvasTex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 'glow');
}
function cloudTexture() {
  return canvasTex(256, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const blobs = [[70, 80, 40], [120, 60, 50], [170, 78, 42], [100, 90, 36], [150, 92, 34]];
    for (const [x, y, r] of blobs) { const gr = g.createRadialGradient(x, y, r * .2, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  }, 'cloud');
}

const SHOP_NAMES = ['PHỞ BÒ', 'CÀ PHÊ', 'TẠP HÓA', 'HIỆU THUỐC', 'TIỆM VÀNG', 'SỬA XE', 'CƠM TẤM', 'HỦ TIẾU', 'BÚN BÒ', 'TIỆM TÓC', 'ĐIỆN MÁY', 'GIẶT ỦI', 'TRÀ SỮA', 'ÁO DÀI', 'NHÀ SÁCH', 'BÁNH CUỐN', 'KEM', 'HOA TƯƠI'];
const WALLS = ['#f4e3c1', '#f7d9c4', '#dfe9f3', '#f9efc7', '#e7f1e0', '#f3d5d5', '#fff3e0', '#e3e0f5', '#cfe6f0', '#f8e2b8'];
const SIGN_BG = ['#c62828', '#1565c0', '#2e7d32', '#ef6c00', '#6a1b9a', '#00838f', '#ad1457'];

/* Mặt tiền nhà ống: tầng trệt là cửa tiệm có bảng hiệu, các tầng trên có cửa sổ, ban công, máy lạnh. */
function facadeTexture(floors, variant) {
  const key = `facade-${floors}-${variant}`;
  return canvasTex(256, 128 * (floors + 1), (g, w, h) => {
    const r = rng(1000 * floors + variant * 7919 + 13);
    const wall = r.pick(WALLS);
    g.fillStyle = wall; g.fillRect(0, 0, w, h);
    // vệt bẩn, ố nhẹ cho thật
    for (let i = 0; i < 20; i++) { g.fillStyle = `rgba(90,70,40,${r() * .07})`; g.fillRect(r() * w, r() * h, 8 + r() * 60, 3 + r() * 90); }
    const fh = 128;
    for (let f = 0; f < floors; f++) {
      const y0 = f * fh; // tầng trên cùng ở y=0
      // ban công
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(16, y0 + 92, w - 32, 10);
      g.fillStyle = r.pick(['#8d6e63', '#546e7a', '#9e9d24', '#78909c']); g.fillRect(16, y0 + 84, w - 32, 8);
      g.strokeStyle = 'rgba(40,40,40,.55)'; g.lineWidth = 2;
      for (let x = 20; x < w - 16; x += 12) { g.beginPath(); g.moveTo(x, y0 + 60); g.lineTo(x, y0 + 86); g.stroke(); }
      // cửa sổ / cửa ban công
      const nw = r.int(1, 2);
      for (let k = 0; k < nw; k++) {
        const ww = nw === 1 ? 90 : 70, wx = nw === 1 ? (w - ww) / 2 : 30 + k * (w - 60 - ww);
        g.fillStyle = r.pick(['#355c7d', '#2b4a66', '#4f6d8a']); g.fillRect(wx, y0 + 22, ww, 60);
        g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(wx + 6, y0 + 26, ww / 2 - 8, 24);
        g.strokeStyle = '#f5f5f5'; g.lineWidth = 4; g.strokeRect(wx, y0 + 22, ww, 60);
        g.beginPath(); g.moveTo(wx + ww / 2, y0 + 22); g.lineTo(wx + ww / 2, y0 + 82); g.stroke();
      }
      if (r() < .45) { g.fillStyle = '#cfd8dc'; g.fillRect(w - 46, y0 + 30, 30, 22); g.fillStyle = '#90a4ae'; g.fillRect(w - 42, y0 + 34, 22, 14); }
      g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y0 + fh - 4, w, 4);
    }
    // tầng trệt: bảng hiệu + mái hiên + cửa kính
    const y0 = floors * fh;
    g.fillStyle = r.pick(SIGN_BG); g.fillRect(0, y0, w, 42);
    g.fillStyle = '#fff'; g.font = 'bold 26px "Baloo 2", "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(r.pick(SHOP_NAMES), w / 2, y0 + 22);
    // mái hiên sọc
    const aw = r.pick(['#d84315', '#1e88e5', '#43a047', '#fbc02d']);
    for (let x = 0; x < w; x += 24) { g.fillStyle = x % 48 ? '#fafafa' : aw; g.fillRect(x, y0 + 42, 24, 18); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y0 + 60, w, 6);
    g.fillStyle = '#263238'; g.fillRect(20, y0 + 66, w - 40, 62);
    g.fillStyle = 'rgba(173,216,230,.35)'; g.fillRect(26, y0 + 70, w - 52, 54);
    g.fillStyle = '#8d6e63'; g.fillRect(w / 2 - 22, y0 + 76, 44, 52);
    g.fillStyle = '#ffeb3b'; g.fillRect(w / 2 + 10, y0 + 100, 6, 6);
  }, key);
}
function sideWallTexture(variant) {
  return canvasTex(64, 64, (g, w, h) => { const r = rng(variant * 31 + 5); g.fillStyle = r.pick(['#d7ccc8', '#cfd8dc', '#e0d6c3', '#dcd0bd']); g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(0,0,0,${r() * .1})`; g.fillRect(r() * w, r() * h, 3, 3); } }, 'side-' + variant);
}

/* Bảng chữ (tên đường, bảng hiệu quán). */
export function textBoardTexture(text, { bg = '#1565c0', fg = '#fff', w = 512, h = 128, size = 64, border = true } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    if (border) { g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); }
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = size; g.font = `800 ${fs}px "Baloo 2","Be Vietnam Pro",sans-serif`;
    while (g.measureText(text).width > w - 40 && fs > 18) { fs -= 2; g.font = `800 ${fs}px "Baloo 2","Be Vietnam Pro",sans-serif`; }
    g.fillText(text, w / 2, h / 2 + 2);
  }, 'board-' + text + bg + w + h);
}

/* Biển báo giao thông: vẽ ra canvas, dùng cho cả 3D và câu đố. */
export function drawSignCanvas(type, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); const s = size / 256;
  g.scale(s, s);
  const bike = (x, y, k, col) => { g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(x - 28 * k, y + 18 * k, 18 * k, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 28 * k, y + 18 * k, 18 * k, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - 28 * k, y + 18 * k); g.lineTo(x - 8 * k, y - 16 * k); g.lineTo(x + 20 * k, y - 16 * k); g.lineTo(x + 28 * k, y + 18 * k); g.moveTo(x - 8 * k, y - 16 * k); g.lineTo(x + 4 * k, y + 18 * k); g.lineTo(x + 20 * k, y - 16 * k); g.moveTo(x - 16 * k, y - 26 * k); g.lineTo(x - 2 * k, y - 26 * k); g.stroke(); };
  const person = (x, y, k, col) => { g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 8 * k; g.beginPath(); g.arc(x, y - 40 * k, 10 * k, 0, 7); g.fill(); g.beginPath(); g.moveTo(x, y - 28 * k); g.lineTo(x, y + 2 * k); g.moveTo(x, y + 2 * k); g.lineTo(x - 14 * k, y + 38 * k); g.moveTo(x, y + 2 * k); g.lineTo(x + 16 * k, y + 34 * k); g.moveTo(x - 2 * k, y - 20 * k); g.lineTo(x - 22 * k, y + 2 * k); g.moveTo(x + 2 * k, y - 20 * k); g.lineTo(x + 20 * k, y - 6 * k); g.stroke(); };
  const circle = (fill, ring) => { g.fillStyle = ring; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = fill; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.fill(); };
  const tri = () => { g.fillStyle = '#d32f2f'; g.beginPath(); g.moveTo(128, 14); g.lineTo(246, 232); g.lineTo(10, 232); g.closePath(); g.fill(); g.fillStyle = '#ffd54f'; g.beginPath(); g.moveTo(128, 50); g.lineTo(214, 214); g.lineTo(42, 214); g.closePath(); g.fill(); };
  if (type === 'nobike') { circle('#fff', '#d32f2f'); bike(128, 128, 1.6, '#111'); g.strokeStyle = '#d32f2f'; g.lineWidth = 16; g.beginPath(); g.moveTo(60, 60); g.lineTo(196, 196); g.stroke(); }
  else if (type === 'oneway') { g.fillStyle = '#d32f2f'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(44, 110, 168, 36); }
  else if (type === 'bikelane') { g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = '#1565c0'; g.beginPath(); g.arc(128, 128, 110, 0, 7); g.fill(); bike(128, 128, 1.6, '#fff'); }
  else if (type === 'ped') { tri(); person(128, 150, 1.2, '#111'); }
  else if (type === 'school') { tri(); person(108, 160, .9, '#111'); person(150, 160, .75, '#111'); }
  else if (type === 'stop') { g.fillStyle = '#d32f2f'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(128 + 118 * Math.cos(a), 128 + 118 * Math.sin(a)); } g.closePath(); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOP', 128, 132); }
  return c;
}
function clockTexture() {
  return canvasTex(256, 256, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 112, 0, 7); c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(128 + 95 * Math.cos(a), 128 + 95 * Math.sin(a)); c.lineTo(128 + 108 * Math.cos(a), 128 + 108 * Math.sin(a)); c.stroke(); } c.lineWidth = 10; c.beginPath(); c.moveTo(128, 128); c.lineTo(128, 60); c.moveTo(128, 128); c.lineTo(185, 128); c.stroke(); }, 'clock');
}
/* bảng emoji to (thú trong vườn, biển hiệu): sprite luôn quay về camera */
function emojiBillboard(emoji, size) {
  const t = canvasTex(128, 128, (c) => { c.clearRect(0, 0, 128, 128); c.font = '100px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, 64, 72); }, 'emoji128-' + emoji);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true })); sp.scale.set(size, size, 1); sp.position.y = size / 2; return sp;
}
function signTexture(type) {
  return canvasTex(256, 256, (g) => { g.drawImage(drawSignCanvas(type, 256), 0, 0); }, 'sign-' + type);
}

/* ================= vật liệu dùng chung ================= */
const M = {
  pole: new THREE.MeshStandardMaterial({ color: 0x4b5560, roughness: .6, metalness: .3 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x222831, roughness: .7 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: .6 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: .9 }),
  leaf: [0x2e7d32, 0x388e3c, 0x43a047, 0x558b2f].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true })),
  skin: new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: .8 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .9 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: .3, metalness: .7 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x90caf9, roughness: .1, metalness: .2, transparent: true, opacity: .55 }),
  red: new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: .6 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: .6 }),
  curb: new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: .9 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x8e9e7a, roughness: 1 }),
  lamp: new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffe08a, emissiveIntensity: 0, roughness: .4 }),
  window: new THREE.MeshStandardMaterial({ color: 0x90caf9, emissive: 0xffd27a, emissiveIntensity: 0, roughness: .1, metalness: .2, transparent: true, opacity: .6 }),
  water: new THREE.MeshStandardMaterial({ color: 0x3d8fbf, roughness: .25, metalness: .15 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: .9 }),
  lawn: new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 1 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x5d6d4b, roughness: .5, metalness: .4 }),
  brick: new THREE.MeshStandardMaterial({ color: 0xb5563c, roughness: .9 }),
  ochre: new THREE.MeshStandardMaterial({ color: 0xf2c75c, roughness: .9 }),
  tile: new THREE.MeshStandardMaterial({ color: 0xb23a2b, roughness: .9 }),
  green: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: .8 }),
  olive: new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: .9 })
};
const mat = (color, roughness = .85) => new THREE.MeshStandardMaterial({ color, roughness });
const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 10),
  tube: (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 8); g.rotateX(Math.PI / 2); return g; })(),
  sphere: new THREE.SphereGeometry(1, 14, 10),
  leaf: new THREE.IcosahedronGeometry(1, 1)
};

function box(w, h, d, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(G.box, mat); m.scale.set(w, h, d); m.position.set(x, y, z); return m; }
function cyl(r, h, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(G.cyl, mat); m.scale.set(r, h, r); m.position.set(x, y, z); return m; }
function sph(r, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(G.sphere, mat); m.scale.setScalar(r); m.position.set(x, y, z); return m; }
/* ống nối hai điểm (khung xe, tay chân) */
function tube(r, mat) { const m = new THREE.Mesh(G.tube, mat); m.userData.r = r; return m; }
const _mid = new THREE.Vector3(), _dir = new THREE.Vector3(), _Z = new THREE.Vector3(0, 0, 1);
/* đặt ống theo tọa độ cục bộ của nhóm cha (không dùng lookAt vì lookAt tính theo tọa độ thế giới) */
function placeTube(m, a, b) { _mid.addVectors(a, b).multiplyScalar(.5); m.position.copy(_mid); _dir.subVectors(b, a); const len = _dir.length() || .001; _dir.divideScalar(len); m.quaternion.setFromUnitVectors(_Z, _dir); m.scale.set(m.userData.r, m.userData.r, len); }

/* ================= lộ trình: đoạn thẳng + khúc rẽ 90° ================= */
export class Path {
  constructor() { this.segs = []; this.length = 0; this.cursor = { pos: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(0, 0, -1) }; this.R = 8; }
  get right() { return new THREE.Vector3().crossVectors(this.cursor.dir, UP).normalize(); }
  addStraight(len) {
    const seg = { type: 'line', s0: this.length, len, start: this.cursor.pos.clone(), dir: this.cursor.dir.clone(), right: this.right };
    this.segs.push(seg); this.length += len; this.cursor.pos.addScaledVector(seg.dir, len); return seg;
  }
  addTurn(side) {
    const R = this.R, dir = this.cursor.dir.clone(), right = this.right, C = this.cursor.pos.clone();
    const sign = side === 'right' ? 1 : -1;
    const center = C.clone().addScaledVector(right, sign * R);
    const len = Math.PI / 2 * R;
    const seg = { type: 'arc', s0: this.length, len, center, R, sign, dir, right, cross: C.clone().addScaledVector(dir, R) };
    this.segs.push(seg); this.length += len;
    this.cursor.pos.copy(C).addScaledVector(dir, R).addScaledVector(right, sign * R);
    this.cursor.dir.copy(right).multiplyScalar(sign);
    return seg;
  }
  /* vị trí và hướng tại quãng đường s, lệch ngang d (dương = bên phải) */
  pose(s, d, out) {
    out = out || { pos: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3() };
    s = Math.max(0, Math.min(this.length, s));
    let seg = this.segs[this.segs.length - 1];
    for (const g of this.segs) if (s <= g.s0 + g.len) { seg = g; break; }
    const t = s - seg.s0;
    if (seg.type === 'line') {
      out.dir.copy(seg.dir); out.right.copy(seg.right);
      out.pos.copy(seg.start).addScaledVector(seg.dir, t).addScaledVector(seg.right, d);
    } else {
      const a = (t / seg.len) * Math.PI / 2, c = Math.cos(a), si = Math.sin(a);
      const radial = seg.right.clone().multiplyScalar(-seg.sign * c).addScaledVector(seg.dir, si);
      out.dir.copy(seg.right).multiplyScalar(seg.sign * si).addScaledVector(seg.dir, c).normalize();
      out.right.crossVectors(out.dir, UP).normalize();
      out.pos.copy(seg.center).addScaledVector(radial, seg.R - seg.sign * d);
    }
    return out;
  }
}

/* ================= dựng cảnh ================= */
export function createRenderer(canvas, lite = false) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' });
  renderer.setPixelRatio(lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !lite; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

/* Khoảng dọc đường không xây nhà: quanh đèn/vạch qua đường, trường, địa danh, cầu */
function gapsOf(st) {
  const gaps = [];
  for (const ev of st.events) {
    if (ev.type === 'light' || ev.type === 'zebra') gaps.push([ev.x - (ev.card ? 7 : 3), ev.x + (ev.card ? 7 : 3)]);
    if (ev.type === 'school') gaps.push([ev.x + 10, ev.x + 50]);
    if (ev.type === 'landmark') gaps.push([ev.x - 14, ev.x + 14]);
    if (ev.type === 'bridge') gaps.push([ev.x - 6, ev.x + 86]);
  }
  return gaps;
}

export class World {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa9d6f5);
    this.scene.fog = new THREE.Fog(0xcfe6f7, 70, 260);
    this.camera = new THREE.PerspectiveCamera(58, 16 / 9, .1, 600);
    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x8a7a5a, .95); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff2d6, 2.2); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048); const sc = this.sun.shadow.camera; sc.near = 5; sc.far = 160; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; this.sun.shadow.bias = -.0008;
    this.scene.add(this.sun); this.scene.add(this.sun.target);
    // bầu trời + mây
    const sky = new THREE.Mesh(new THREE.SphereGeometry(520, 24, 12), new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false })); this.sky = sky; this.scene.add(sky);
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(16, 24), new THREE.MeshBasicMaterial({ color: 0xfff6d0, fog: false })); sunDisc.position.set(-220, 250, -300); sunDisc.lookAt(0, 0, 0); sky.add(sunDisc); this.sunDisc = sunDisc;
    const cm = new THREE.MeshBasicMaterial({ map: cloudTexture(), transparent: true, depthWrite: false, fog: false });
    const cg = new THREE.PlaneGeometry(90, 45);
    for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(cg, cm); const a = i / 14 * Math.PI * 2; c.position.set(Math.cos(a) * 380, 120 + (i % 4) * 25, Math.sin(a) * 380); c.lookAt(0, 90, 0); sky.add(c); }
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 40, 40), M.ground); // chia nhỏ để độ sâu chính xác, mặt đường không bị mặt đất đè this.ground.rotation.x = -Math.PI / 2; this.ground.position.y = -.05; this.ground.receiveShadow = true; this.scene.add(this.ground);
    this.statics = new THREE.Group(); this.scene.add(this.statics);
    this.glows = []; this.facadeMats = [];
    this.actors = new THREE.Group(); this.scene.add(this.actors);
    this.path = new Path();
    this.tmpPose = { pos: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3() };
  }

  clear() {
    for (const grp of [this.statics, this.actors]) { while (grp.children.length) { const c = grp.children.pop(); c.traverse(o => { if (o.geometry && !Object.values(G).includes(o.geometry)) o.geometry.dispose(); }); } }
    this.path = new Path(); this.glows = []; this.facadeMats = [];
  }

  /* Dựng toàn bộ tuyến: trả về danh sách đường với vị trí s tuyệt đối của từng sự kiện. */
  buildRoute(route, seed = 7) {
    this.clear();
    const r = rng(seed);
    const streets = [];
    let facadeVariant = 0;
    route.streets.forEach((st, i) => {
      const isLast = i === route.streets.length - 1;
      const seg = this.path.addStraight(st.length);
      const info = { def: st, s0: seg.s0, len: st.length, seg, events: [], objects: {} };
      const gaps = gapsOf(st); // chỗ không xây nhà (ngã tư nhỏ, hẻm, cầu, trường, địa danh)
      for (const ev of st.events) info.events.push(Object.assign({}, ev, { s: seg.s0 + ev.x }));
      const prevTurn = i > 0 ? route.streets[i - 1].turn : null;
      this.buildStraight(seg, st, info, gaps, r, () => facadeVariant++, isLast, prevTurn);
      // biển tên đường đầu phố (hai bên)
      const card = st.cardTitle || '';
      this.addStreetSign(seg, 7, 5.6, card); this.addStreetSign(seg, 7, -5.6, card);
      if (!isLast) {
        const arc = this.path.addTurn(st.turn);
        info.turnSeg = arc; info.cornerS = arc.s0; info.endS = arc.s0 + arc.len;
        this.buildIntersection(seg, arc, r, () => facadeVariant++, st.next, st, route.streets[i + 1]);
      } else { info.endS = seg.s0 + seg.len; }
      streets.push(info);
    });
    // nhà của bé ở đầu tuyến
    this.addHome(streets[0].seg);
    // nơi đến: mô hình theo thẻ địa danh của tuyến
    this.addGoal(streets[streets.length - 1].seg, route);
    this.totalLength = this.path.length;
    return streets;
  }

  /* một đoạn phố thẳng: mặt đường, lề, nhà hai bên, cây, đèn đường, xe máy đậu, vật thể sự kiện */
  buildStraight(seg, st, info, gaps, r, nextVariant, isLast, prevTurn = null) {
    const { start, dir, right, len } = seg;
    const place = (obj, s, d, y = 0) => { obj.position.copy(start).addScaledVector(dir, s).addScaledVector(right, d); obj.position.y += y; obj.lookAt(obj.position.clone().add(dir)); this.statics.add(obj); return obj; };
    const s0 = -3, s1 = len + (isLast ? 14 : 3);
    // mặt đường
    const rt = roadTexture(); rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(1, (s1 - s0) / 6);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, s1 - s0), new THREE.MeshStandardMaterial({ map: rt, roughness: .95 }));
    road.rotation.x = -Math.PI / 2; road.receiveShadow = true;
    const rg = new THREE.Group(); rg.add(road); place(rg, (s0 + s1) / 2, 0, 0);
    // lề đường hai bên
    for (const side of [1, -1]) {
      const swt = sidewalkTexture(); swt.wrapS = swt.wrapT = THREE.RepeatWrapping; swt.repeat.set(1.5, (s1 - s0) / 2);
      const sw = new THREE.Mesh(new THREE.BoxGeometry(3, .15, s1 - s0), [M.curb, M.curb, new THREE.MeshStandardMaterial({ map: swt, roughness: .95 }), M.curb, M.curb, M.curb]);
      sw.receiveShadow = true; sw.castShadow = false;
      const g = new THREE.Group(); g.add(sw); place(g, (s0 + s1) / 2, side * 6.5, .075);
    }
    // bờ sông (nếu có) thay cho dãy nhà một bên
    if (st.river) this.addRiverside(place, seg, st, info, r, isLast, prevTurn);
    const onBridge = (s) => info.events.some(e => e.type === 'bridge' && s > e.x - 6 && s < e.x + 86);
    // nhà hai bên
    for (const side of [1, -1]) {
      if (st.river === side) continue;
      let s = -2 + r() * 2;
      while (s < len - 2) {
        const w = r.int(4, 7) + r() * 1.5;
        const inGap = gaps.some(([a, b]) => side === 1 ? (s + w > a && s < b) : (s + w > a - 2 && s < b + 2));
        if (inGap) { s += 1; continue; }
        const floors = r.int(2, 5), h = floors * 3.4 + 3.4 * .6;
        const depth = 12 + r() * 4;
        const fv = nextVariant() % 6;
        const mats = [sideWallTexture(fv), sideWallTexture(fv + 1)].map(t => new THREE.MeshStandardMaterial({ map: t, roughness: .9 }));
        const front = new THREE.MeshStandardMaterial({ map: facadeTexture(floors, fv + floors), roughness: .85, emissiveMap: facadeTexture(floors, fv + floors), emissive: 0xffffff, emissiveIntensity: 0 }); this.facadeMats.push(front);
        const roof = new THREE.MeshStandardMaterial({ color: r.pick([0x8d6e63, 0x795548, 0xa1887f, 0xb0bec5]), roughness: 1 });
        const b = new THREE.Mesh(new THREE.BoxGeometry(w - .15, h, depth), [mats[0], mats[1], roof, roof, front, mats[0]]);
        b.castShadow = true; b.receiveShadow = true;
        // mặt tiền quay ra đường: box face +Z là "front" (index 4); nhóm quay theo hướng nhìn ra đường
        const g = new THREE.Group(); g.add(b); b.position.set(0, h / 2, -depth / 2);
        if (r() < .35) { const tank = cyl(.6, 1.2, M.chrome, (r() - .5) * (w - 2), h + .6, -depth / 2 - 2 + r() * 2); g.add(tank); }
        if (r() < .3) { const ac = box(1.2, .9, .8, M.white, (r() - .5) * (w - 2), h + .45, -depth / 2 + 2); g.add(ac); }
        g.position.copy(start).addScaledVector(dir, s + w / 2).addScaledVector(right, side * 8);
        g.lookAt(g.position.clone().addScaledVector(right, -side)); // quay mặt tiền về phía đường
        this.statics.add(g);
        s += w + (r() < .15 ? 1.2 : 0);
      }
    }
    // cây, đèn đường, xe máy đậu
    for (const side of [1, -1]) {
      for (let s = 6 + (side === 1 ? 7 : 0); s < len - 6; s += 14 + r() * 4) {
        const busy = info.events.some(e => Math.abs(e.x - s) < 7 && side === 1) || onBridge(s);
        if (busy) continue;
        if (r() < .8) this.addTree(place, s, side * 6.9, r);
        if (r() < .5 && st.river !== side) this.addParkedMotos(place, s + 5, side * 6.4, r);
      }
      for (let s = 18; s < len - 10; s += 30) { if (!info.events.some(e => Math.abs(e.x - s) < 5)) this.addLamp(place, s, side * 5.3); }
    }
    // vật thể sự kiện
    for (const e of info.events) {
      if (e.type === 'light') this.addTrafficLight(place, seg, e, r);
      else if (e.type === 'zebra') this.addZebra(place, seg, e);
      else if (e.type === 'shop') this.addShop(place, e);
      else if (e.type === 'obstacle') this.addObstacle(place, e, r);
      else if (e.type === 'school') this.addSchool(place, e);
      else if (e.type === 'landmark') this.addLandmark(place, e);
      else if (e.type === 'bridge') this.addBridge(place, e, st);
    }
  }

  addTree(place, s, d, r) {
    const g = new THREE.Group();
    const h = 3 + r() * 2.5;
    const t = cyl(.14, h, M.trunk, 0, h / 2, 0); t.castShadow = true; g.add(t);
    const n = r.int(2, 3);
    for (let i = 0; i < n; i++) { const c = new THREE.Mesh(G.leaf, r.pick(M.leaf)); const rad = 1.4 + r() * 1.2; c.scale.set(rad, rad * .8, rad); c.position.set((r() - .5) * 1.6, h + (i * .9), (r() - .5) * 1.6); c.castShadow = true; g.add(c); }
    place(g, s, d);
  }
  addLamp(place, s, d) {
    const g = new THREE.Group();
    const p = cyl(.08, 7, M.pole, 0, 3.5, 0); g.add(p);
    const side = d > 0 ? 1 : -1; // +X cục bộ là phía đường đối với lề phải
    const arm = box(.12, .12, 2.2, M.pole, 0, 6.9, 0); arm.position.x = side * 1; arm.rotation.y = Math.PI / 2; g.add(arm);
    const lamp = box(.5, .2, .3, M.lamp, side * 2, 6.85, 0); g.add(lamp);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 })); glow.position.set(side * 2, 6.6, 0); glow.scale.set(5, 5, 1); glow.visible = false; g.add(glow); this.glows.push(glow);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .45 })); pool.rotation.x = -Math.PI / 2; pool.position.set(side * 2, .02, 0); pool.visible = false; g.add(pool); this.glows.push(pool);
    place(g, s, d);
  }
  addParkedMotos(place, s, d, r) {
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) { const m = makeMoto(r.pick([0xe53935, 0x1e88e5, 0x43a047, 0xfdd835, 0x8e24aa, 0x37474f]), false); m.scale.setScalar(.95); const g = new THREE.Group(); g.add(m); m.rotation.y = Math.PI / 2 * (d > 0 ? 1 : -1); place(g, s + i * .9, d + (r() - .5) * .3, .15); }
  }
  addStreetSign(seg, s, d, text) {
    if (!text) return;
    const g = new THREE.Group();
    g.add(cyl(.05, 3, M.pole, 0, 1.5, 0));
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, .45, .05), [M.pole, M.pole, M.pole, M.pole, new THREE.MeshStandardMaterial({ map: textBoardTexture(text.toUpperCase(), { bg: '#0d47a1', w: 512, h: 144, size: 56 }), roughness: .5 }), new THREE.MeshStandardMaterial({ map: textBoardTexture(text.toUpperCase(), { bg: '#0d47a1', w: 512, h: 144, size: 56 }), roughness: .5 })]);
    board.position.set(0, 2.8, 0); g.add(board);
    g.position.copy(seg.start).addScaledVector(seg.dir, s).addScaledVector(seg.right, d); g.lookAt(g.position.clone().add(seg.dir)); this.statics.add(g);
  }

  addTrafficLight(place, seg, e, r) {
    // vạch dừng phía làn của bé
    const line = new THREE.Mesh(new THREE.PlaneGeometry(4.6, .45), M.white); line.rotation.x = -Math.PI / 2; const lg = new THREE.Group(); lg.add(line); place(lg, e.x - 1.2, 2.6, .012);
    // đường ngang (ngã tư nhỏ hoặc hẻm)
    const wide = e.card ? 10 : 5;
    const rt = roadTexture(); rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(1, 20);
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(wide, 120), new THREE.MeshStandardMaterial({ map: rt, roughness: .95 })); cross.rotation.x = -Math.PI / 2; cross.receiveShadow = true;
    const cg = new THREE.Group(); cg.add(cross); cg.position.copy(seg.start).addScaledVector(seg.dir, e.x + 3.5); cg.position.y = .004; cg.lookAt(cg.position.clone().add(seg.right)); this.statics.add(cg);
    // trụ đèn bên phải, cần vươn ra giữa đường, đèn quay về phía bé
    const g = new THREE.Group();
    g.add(cyl(.12, 6, M.pole, 0, 3, 0));
    const arm = box(4.2, .14, .14, M.pole, 2.1, 5.9, 0); g.add(arm); // cần vươn ra giữa đường (local +X = phía đường)
    const head = makeLightHead(); head.position.set(3.6, 5.2, 0); head.rotation.y = Math.PI; g.add(head); // quay về phía xe tới
    const head2 = makeLightHead(); head2.position.set(0, 3.6, -.3); head2.rotation.y = Math.PI; g.add(head2);
    place(g, e.x + 1.4, 5.4);
    e.obj = { heads: [head, head2], setState(s) { for (const h of this.heads) h.userData.set(s); } };
    e.obj.setState('green');
    // biển tên đường cắt ngang (nếu là ngã tư có thẻ)
    if (e.card) { this.addStreetSign(seg, e.x + 8.5, 5.6, e.cardTitle || ''); }
  }
  addZebra(place, seg, e) {
    const g = new THREE.Group();
    for (let i = 0; i < 10; i++) { const st = new THREE.Mesh(new THREE.PlaneGeometry(.6, 2.6), M.white); st.rotation.x = -Math.PI / 2; st.position.set(-4.5 + i, 0, 0); g.add(st); }
    place(g, e.x, 0, .012);
    // biển báo người đi bộ trước vạch
    this.addSignPost(place, e.x - 18, 5.5, 'ped');
    e.obj = {};
  }
  addSignPost(place, s, d, type) {
    const g = new THREE.Group(); g.add(cyl(.05, 2.6, M.pole, 0, 1.3, 0));
    const mat = new THREE.MeshStandardMaterial({ map: signTexture(type), roughness: .5, transparent: true });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), mat); b.position.set(0, 2.5, -.06); b.rotation.y = Math.PI; g.add(b);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), M.pole); back.position.set(0, 2.5, -.05); g.add(back);
    place(g, s, d);
  }
  addShop(place, e) {
    const shop = e.shopDef;
    const g = new THREE.Group();
    // xe đẩy
    const body = box(1.8, .9, .9, new THREE.MeshStandardMaterial({ color: shop.color || 0xffb74d, roughness: .7 }), 0, .85, 0); body.castShadow = true; g.add(body);
    const glass = new THREE.Mesh(G.box, M.glass); glass.scale.set(1.6, .6, .8); glass.position.set(0, 1.6, 0); g.add(glass);
    for (const x of [-.6, .6]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(.22, .05, 8, 16), M.tire); wh.position.set(x, .25, .5); g.add(wh); const wh2 = wh.clone(); wh2.position.z = -.5; g.add(wh2); }
    // dù che
    const pole = cyl(.03, 2.6, M.pole, .6, 1.3, -.2); g.add(pole);
    const umb = new THREE.Mesh(new THREE.ConeGeometry(1.5, .5, 10), new THREE.MeshStandardMaterial({ color: shop.umbrella || 0xe53935, roughness: .8 })); umb.position.set(.6, 2.75, -.2); umb.castShadow = true; g.add(umb);
    // bảng hiệu
    const board = new THREE.Mesh(new THREE.BoxGeometry(2, .5, .06), [M.pole, M.pole, M.pole, M.pole, new THREE.MeshStandardMaterial({ map: textBoardTexture(shop.sign, { bg: shop.signBg || '#c62828', w: 512, h: 128, size: 70 }), roughness: .5 }), M.pole]);
    board.position.set(0, 2.1, .5); g.add(board);
    // hàng bày bán (mấy khối màu)
    for (let i = 0; i < 5; i++) { const it = sph(.12, new THREE.MeshStandardMaterial({ color: shop.itemColor || 0xff9800, roughness: .6 }), -.6 + i * .3, 1.4, .1); g.add(it); }
    // người bán
    const seller = makePedestrian(0xffffff, 0x3949ab, true); seller.position.set(0, 0, -.9); seller.rotation.y = 0; g.add(seller);
    place(g, e.x, 6.4, .15);
    g.rotation.y += Math.PI / 2; // quay mặt ra đường (sau place, local +X là phía đường)
    e.obj = { group: g };
  }
  addObstacle(place, e, r) {
    // xe hàng rong đậu lấn xuống lòng đường, cạnh lề
    const g = new THREE.Group();
    const cart = box(1.2, .8, 2, new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: .8 }), 0, .7, 0); cart.castShadow = true; g.add(cart);
    for (let i = 0; i < 3; i++) { const bx = box(.5, .4, .5, new THREE.MeshStandardMaterial({ color: r.pick([0xffcc80, 0xa5d6a7, 0xef9a9a]), roughness: .9 }), (i - 1) * .35, 1.3, (i - 1) * .4); g.add(bx); }
    for (const z of [-.6, .6]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(.3, .06, 8, 16), M.tire); wh.rotation.y = Math.PI / 2; wh.position.set(.65, .3, z); g.add(wh); const w2 = wh.clone(); w2.position.x = -.65; g.add(w2); }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.22, .6, 10), new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: .7 })); cone.position.set(0, .3, -1.6); g.add(cone);
    place(g, e.x, 3.8);
    e.obj = { group: g, d: 3.8, halfW: .7, halfL: 1.1 };
  }
  addSchool(place, e) {
    this.addSignPost(place, e.x - 6, 5.5, 'school');
    const g = new THREE.Group();
    const named = !!e.card, floors = named ? 3 : 2, h = floors * 3.4 + 1.2;
    const wall = new THREE.MeshStandardMaterial({ color: named ? 0xf4d58d : 0xfff176, roughness: .9 });
    const b = box(34, h, 12, wall, 0, h / 2, -8); b.castShadow = true; b.receiveShadow = true; g.add(b);
    const roof = box(35, .6, 13, new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: .9 }), 0, h + .3, -8); g.add(roof);
    if (named) { const top = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), M.tile); top.rotation.y = Math.PI / 4; top.scale.set(35 / 2 * Math.SQRT2, 2.6, 13 / 2 * Math.SQRT2); top.position.set(0, h + 1.9, -8); g.add(top); }
    // cửa sổ (trường có tên: cửa vòm trắng kiểu Pháp)
    for (let i = 0; i < 7; i++) for (let f = 0; f < floors; f++) { const w = box(2.4, 1.8, .1, M.window, -14 + i * 4.6, 2.3 + f * 3.4, -1.95); g.add(w); if (named) { const arc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 16), M.white); arc.position.set(-14 + i * 4.6, 3.1 + f * 3.4, -1.98); g.add(arc); w.position.z = -1.9; } }
    const sign = new THREE.Mesh(new THREE.BoxGeometry(named ? 16 : 12, 1.2, .1), [wall, wall, wall, wall, new THREE.MeshStandardMaterial({ map: textBoardTexture(e.sign || 'TRƯỜNG TIỂU HỌC', { bg: '#1565c0', w: 1024, h: 110, size: 72 }), roughness: .5 }), wall]); sign.position.set(0, h - .8, -1.9); g.add(sign);
    // cổng và hàng rào
    for (let x = -17; x <= 17; x += 1.1) { if (Math.abs(x) < 2.5) continue; g.add(cyl(.05, 1.6, M.pole, x, .8, -.2)); }
    g.add(box(34, .12, .1, M.pole, 0, 1.55, -.2));
    g.add(cyl(.12, 7, M.pole, -4, 3.5, 1)); const flag = box(1.6, 1.05, .05, M.red, -3.2, 6.4, 1); g.add(flag);
    const star = new THREE.Mesh(new THREE.CircleGeometry(.25, 5), M.yellow); star.position.set(-3.2, 6.4, 1.04); g.add(star);
    if (named) for (const x of [-15, 15]) { const t = new THREE.Group(); t.add(cyl(.22, 6, M.trunk, 0, 3, 0)); const c = new THREE.Mesh(G.leaf, M.leaf[0]); c.scale.set(3, 2.4, 3); c.position.y = 7; c.castShadow = true; t.add(c); t.position.set(x, 0, 1.5); g.add(t); }
    place(g, e.x + 30, 8);
    g.rotation.y += Math.PI / 2; // mặt tiền ra đường
    e.obj = { zone: [e.x, e.x + 60] };
  }
  /* bờ sông một bên đường: kè đá, lan can, mặt nước rộng, vài chiếc tàu, nhà cao bên bờ xa.
     Mặt nước được cắt ở hai đầu để không tràn lên đường trước/sau khi rẽ: nếu đường trước rẽ về phía sông
     (nước nằm dọc đường trước) thì bắt đầu sát góc; nếu đường này rẽ về phía sông thì dừng trước ngã tư. */
  addRiverside(place, seg, st, info, r, isLast, prevTurn = null) {
    const side = st.river, len = seg.len;
    const towardRiver = side === -1 ? 'left' : 'right';
    const prevToward = prevTurn === towardRiver, nextToward = !isLast && st.turn === towardRiver;
    const a = prevToward ? -2 : -12, b = isLast ? len + 200 : len - 2;
    const water = new THREE.Mesh(new THREE.PlaneGeometry(130, b - a), M.water); water.rotation.x = -Math.PI / 2; water.receiveShadow = true;
    const wg = new THREE.Group(); wg.add(water); place(wg, (a + b) / 2, side * (9.5 + 65), .03);
    const qb = isLast ? len + 20 : b;
    const quay = box(1.2, .7, qb - a, M.stone, 0, 0, 0); const qg = new THREE.Group(); qg.add(quay); place(qg, (a + qb) / 2, side * 8.9, .35);
    for (let x = a + 3; x < qb - 1; x += 5) { const post = cyl(.05, 1.1, M.pole, 0, .55, 0); const pg = new THREE.Group(); pg.add(post); place(pg, x, side * 8.3); }
    const rail = box(.08, .08, qb - a - 4, M.pole, 0, 0, 0); const rg = new THREE.Group(); rg.add(rail); place(rg, (a + qb) / 2, side * 8.3, 1.1);
    // tàu thuyền
    for (let x = 30 + r() * 20; x < len - 10; x += 55 + r() * 30) {
      const bt = new THREE.Group(); const big = r() < .4;
      bt.add(box(big ? 16 : 7, big ? 2.6 : 1.4, big ? 5 : 2.6, mat(big ? 0x37474f : r.pick([0x1565c0, 0x6d4c41, 0x2e7d32])), 0, big ? 1.3 : .7, 0));
      bt.add(box(big ? 6 : 2.4, big ? 3 : 1.5, big ? 4 : 2, M.white, big ? -3 : -1, big ? 4.1 : 2.1, 0));
      if (big) bt.add(cyl(.5, 2.4, M.red, -3, 6.8, 0));
      place(bt, x, side * (18 + r() * 25), .1); bt.rotation.y += (r() - .5) * .6;
    }
    // bờ xa: vài tòa nhà cao (chừa góc sông nơi hai đường ven sông gặp nhau)
    const ta = prevToward ? a + 150 : a + 10, tb = nextToward ? len - 150 : b - 20;
    for (let x = ta + r() * 20; x < tb; x += 28 + r() * 20) {
      const hgt = 25 + r() * 45; const t = box(9 + r() * 6, hgt, 9 + r() * 6, new THREE.MeshStandardMaterial({ color: r.pick([0x90caf9, 0xb0bec5, 0xe3f2fd, 0xcfd8dc]), roughness: .4, metalness: .2 }), 0, hgt / 2, 0);
      const tg = new THREE.Group(); tg.add(t); place(tg, x, side * (148 + r() * 25));
    }
  }
  /* cầu 80 m: lan can hai bên, mặt nước bên dưới (bên không có bờ sông sẵn) */
  addBridge(place, e, st) {
    for (const side of [1, -1]) {
      for (let x = e.x; x <= e.x + 80; x += 4) { const post = cyl(.06, 1.3, M.pole, 0, .65, 0); const pg = new THREE.Group(); pg.add(post); place(pg, x, side * 5.6); }
      for (const y of [1.3, .75]) { const rail = box(.1, .1, 81, M.pole, 0, 0, 0); const rg = new THREE.Group(); rg.add(rail); place(rg, e.x + 40, side * 5.6, y); }
      if (st.river !== side) {
        const water = new THREE.Mesh(new THREE.PlaneGeometry(72, 92), M.water); water.rotation.x = -Math.PI / 2;
        const wg = new THREE.Group(); wg.add(water); place(wg, e.x + 40, side * 44.5, .03);
        const bank = box(2, .5, 92, M.stone, 0, 0, 0); const bg = new THREE.Group(); bg.add(bank); place(bg, e.x + 40, side * 9.2, .25);
      }
    }
    // cột đèn cao đầu cầu
    for (const x of [e.x - 2, e.x + 82]) for (const side of [1, -1]) { const g = new THREE.Group(); g.add(cyl(.12, 9, M.pole, 0, 4.5, 0)); g.add(box(.6, .25, .4, M.lamp, 0, 9, 0)); place(g, x, side * 5.9); }
    e.obj = { zone: [e.x, e.x + 80] };
  }
  /* nơi đến của tuyến, đặt ở cuối đường cuối cùng */
  addGoal(seg, route) {
    const id = route.goalCard;
    if (id === 'ducba') this.addCathedral(seg);
    else if (id === 'dinh') this.addPalace(seg);
    else if (id === 'zoo') this.addZoo(seg);
    else if (id === 'nharong') this.addWharf(seg);
    else this.addMarket(seg);
  }
  /* nhóm đặt ở cuối đường (s = len + 40), local +Z hướng về phía xe tới, +X là bên phải đường */
  goalGroup(seg) { const g = new THREE.Group(); g.position.copy(seg.start).addScaledVector(seg.dir, seg.len + 40); g.lookAt(g.position.clone().addScaledVector(seg.dir, -1)); this.statics.add(g); return g; }
  plaza(g, w, d, x, z, texture = true) {
    if (texture) { const pt = plazaTexture(); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(w / 4.4, d / 4); const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: pt, roughness: 1 })); pl.rotation.x = -Math.PI / 2; pl.position.set(x, .01, z); pl.receiveShadow = true; g.add(pl); }
    else { const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.lawn); pl.rotation.x = -Math.PI / 2; pl.position.set(x, .01, z); pl.receiveShadow = true; g.add(pl); }
  }
  bigTree(g, x, z, h = 5, leaf = 1) { const t = new THREE.Group(); t.add(cyl(.22, h, M.trunk, 0, h / 2, 0)); const c = new THREE.Mesh(G.leaf, M.leaf[leaf]); c.scale.set(h * .55, h * .45, h * .55); c.position.y = h + .6; c.castShadow = true; t.add(c); t.position.set(x, 0, z); g.add(t); }
  board(g, text, bg, w, h, x, y, z, size = 84) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .1), [M.pole, M.pole, M.pole, M.pole, new THREE.MeshStandardMaterial({ map: textBoardTexture(text, { bg, w: 1024, h: 120, size }), roughness: .5 }), M.pole]); b.position.set(x, y, z); g.add(b); return b;
  }
  /* Nhà thờ Đức Bà: gạch đỏ, hai tháp chuông nhọn, cửa sổ tròn, tượng Đức Mẹ, công viên */
  addCathedral(seg) {
    const g = this.goalGroup(seg);
    const nave = box(22, 14, 40, M.brick, 0, 7, -20); nave.castShadow = true; nave.receiveShadow = true; g.add(nave);
    const roof = box(12.7, 12.7, 41, M.stone, 0, 14, -20); roof.rotation.z = Math.PI / 4; g.add(roof);
    g.add(box(8, 20, 1, M.brick, 0, 10, 4.5)); // mặt tiền giữa hai tháp
    for (const x of [-8.5, 8.5]) {
      const t = box(7, 30, 7, M.brick, x, 15, 1.5); t.castShadow = true; g.add(t);
      const sp = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 4), M.stone); sp.rotation.y = Math.PI / 4; sp.position.set(x, 36, 1.5); sp.castShadow = true; g.add(sp);
      g.add(box(.25, 2, .25, M.white, x, 43, 1.5)); g.add(box(1.2, .25, .25, M.white, x, 43.4, 1.5));
      for (const y of [19, 26]) { g.add(box(1, 4, .2, M.white, x - 1.6, y, 5.05)); g.add(box(1, 4, .2, M.white, x + 1.6, y, 5.05)); }
      for (const y of [8, 13]) { g.add(box(1.6, 2.6, .2, M.white, x, y, 5.05)); }
      g.add(box(2, 3.6, .3, mat(0x4e342e), x, 1.8, 5.1)); // cửa tháp
    }
    const rose = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), mat(0x5c6bc0, .3)); rose.position.set(0, 14, 5.05); g.add(rose);
    const roseRing = new THREE.Mesh(new THREE.RingGeometry(2.4, 3, 24), M.white); roseRing.position.set(0, 14, 5.06); g.add(roseRing);
    g.add(box(3, 5, .3, mat(0x4e342e), 0, 2.5, 5.1)); const arc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 20), M.white); arc.position.set(0, 5.4, 5.12); g.add(arc);
    for (let i = 0; i < 4; i++) g.add(box(18 + i * 2, .25, 1 + i * .6, M.stone, 0, .125 + (3 - i) * .25, 5.6 + i * .3)); // bậc thềm
    // công viên trước nhà thờ + tượng Đức Mẹ Hòa Bình
    this.plaza(g, 70, 24, 0, 18, false); this.plaza(g, 8, 22, 0, 18);
    g.add(cyl(1.3, 2.6, M.stone, 0, 1.3, 15)); g.add(cyl(.55, 2.6, M.white, 0, 3.9, 15)); g.add(sph(.45, M.white, 0, 5.6, 15));
    for (const [x, z] of [[-26, 12], [-18, 24], [18, 24], [26, 12], [-12, 10], [12, 10]]) this.bigTree(g, x, z, 5 + (Math.abs(x) % 3), (Math.abs(x) / 2) % 4 | 0);
    this.board(g, 'NHÀ THỜ ĐỨC BÀ', '#b5563c', 10, 1.3, -14, 2.4, 24); g.add(cyl(.08, 2, M.pole, -14, 1, 24));
  }
  /* Dinh Độc Lập: tòa nhà trắng dài, rèm hoa đá, cột cờ, đài phun nước, hai xe tăng, hàng rào */
  addPalace(seg) {
    const g = this.goalGroup(seg);
    const white = mat(0xfafafa, .85);
    const main = box(56, 12, 22, white, 0, 6, -16); main.castShadow = true; main.receiveShadow = true; g.add(main);
    g.add(box(58, .8, 24, M.stone, 0, 12.4, -16));
    for (let x = -26; x <= 26; x += 1.6) g.add(box(.5, 9, .5, white, x, 7.2, -4.6)); // rèm hoa đá
    g.add(box(50, 2.3, .2, M.window, 0, 1.5, -4.95));
    g.add(box(16, .5, 7, white, 0, 3.4, -1.5)); for (const x of [-6, 6]) g.add(cyl(.35, 3.2, white, x, 1.6, 1.5));
    // trực thăng trên sân thượng
    g.add(box(1.4, 1.2, 3.4, M.olive, 9, 13.4, -17)); g.add(box(.5, .5, 3, M.olive, 9, 13.7, -20)); g.add(box(7, .12, .35, M.dark, 9, 14.3, -17)); g.add(cyl(.12, .6, M.dark, 9, 14, -17));
    // cột cờ
    g.add(cyl(.12, 15, M.pole, 0, 7.5, 7)); g.add(box(3.2, 2.1, .06, M.red, 1.7, 14, 7)); const star = new THREE.Mesh(new THREE.CircleGeometry(.5, 5), M.yellow); star.position.set(1.7, 14, 7.04); g.add(star);
    // sân cỏ, đài phun nước
    this.plaza(g, 72, 32, 0, 14, false); this.plaza(g, 7, 30, 0, 14);
    const basin = cyl(5.5, .6, M.stone, 0, .3, 16); basin.scale.z = 3.8; g.add(basin); const wat = cyl(5, .5, M.water, 0, .38, 16); wat.scale.z = 3.3; g.add(wat);
    g.add(cyl(.15, 1.6, M.white, 0, .9, 16)); g.add(sph(.7, M.white, 0, 1.8, 16));
    // hai xe tăng
    for (const x of [-20, 20]) {
      g.add(box(3.4, 1.2, 6, M.olive, x, .95, 20)); g.add(box(2, .9, 2.4, M.olive, x, 2, 20)); for (const dx of [-1.75, 1.75]) g.add(box(.7, 1, 6.2, M.dark, x + dx, .5, 20));
      const barrel = cyl(.12, 3.6, M.dark, x, 2.1, 23); barrel.rotation.x = Math.PI / 2; g.add(barrel);
    }
    // hàng rào + cổng
    for (let x = -34; x <= 34; x += 1.5) { if (Math.abs(x) < 5.5) continue; g.add(cyl(.06, 2.2, M.pole, x, 1.1, 28)); }
    for (const side of [-1, 1]) g.add(box(29, .1, .1, M.pole, side * 20, 2.1, 28));
    for (const x of [-6, 6]) g.add(box(1.3, 3.4, 1.3, M.stone, x, 1.7, 28));
    this.board(g, 'DINH ĐỘC LẬP', '#5c6bc0', 11, 1.2, 0, 3.6, 28, 84);
    for (const [x, z] of [[-32, 8], [-32, 22], [32, 8], [32, 22]]) this.bigTree(g, x, z, 6, 2);
  }
  /* Thảo Cầm Viên: cổng vòm xanh, hàng rào, quầy vé, nhiều cây và thú */
  addZoo(seg) {
    const g = this.goalGroup(seg);
    this.plaza(g, 60, 20, 0, 16);
    for (const x of [-7, 7]) { const p = box(2.2, 7, 2.2, mat(0xd7ccc8), x, 3.5, 4); p.castShadow = true; g.add(p); }
    g.add(box(18, 1.8, 2.2, M.green, 0, 7.5, 4));
    this.board(g, 'THẢO CẦM VIÊN', '#2e7d32', 16, 1.3, 0, 7.5, 5.2, 90);
    for (const side of [-1, 1]) { for (let x = 8.5; x <= 34; x += 1.4) g.add(cyl(.06, 2.2, M.pole, side * x, 1.1, 4)); for (const y of [2.1, 1.2]) g.add(box(26, .1, .1, M.pole, side * 21.5, y, 4)); }
    // quầy vé
    g.add(box(3.2, 2.6, 2.6, mat(0xffcc80), -12, 1.3, 9)); g.add(box(3.8, .3, 3.2, M.tile, -12, 2.75, 9)); this.board(g, 'VÉ', '#ef6c00', 2.2, .7, -12, 2.2, 10.35, 90);
    // bên trong: cỏ, cây, thú
    this.plaza(g, 80, 44, 0, -18, false);
    const trees = [[-30, -6, 6, 0], [-20, -18, 8, 1], [-8, -26, 7, 2], [6, -30, 9, 3], [20, -24, 7, 0], [30, -10, 6, 1], [34, -28, 8, 2], [-34, -24, 9, 3], [0, -12, 5, 1], [14, -8, 6, 2]];
    for (const [x, z, h, l] of trees) this.bigTree(g, x, z, h, l);
    const animals = [['🦒', 7, -24, -8], ['🐘', 6, -10, -14], ['🦁', 4, 8, -8], ['🦓', 4, 20, -14], ['🦛', 4.5, 28, -20], ['🐒', 3, -2, -20], ['🦜', 2.5, 12, -22], ['🐊', 3, -18, -4]];
    for (const [em, size, x, z] of animals) { const sp = emojiBillboard(em, size); sp.position.x = x; sp.position.z = z; g.add(sp); }
    for (const x of [-16, 16]) g.add(box(.3, .3, 20, M.stone, x, .2, -14)); // lối đi
  }
  /* Bến Nhà Rồng: nhà vàng mái ngói hai con rồng chầu mặt trăng, kè sông, tàu */
  addWharf(seg) {
    const g = this.goalGroup(seg);
    const cx = 6; // nhà lệch sang phải, bờ sông (bên trái) sát kè
    this.plaza(g, 30, 22, cx, 15);
    const main = box(30, 10, 16, M.ochre, cx, 5, -12); main.castShadow = true; main.receiveShadow = true; g.add(main);
    g.add(box(31, .8, 17, M.tile, cx, 10.4, -12));
    const top = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), M.tile); top.rotation.y = Math.PI / 4; top.scale.set(31 / 2 * Math.SQRT2, 4, 17 / 2 * Math.SQRT2); top.position.set(cx, 12.8, -12); g.add(top);
    // hai con rồng chầu mặt trăng trên nóc
    g.add(sph(.8, mat(0xfff59d, .4), cx, 15.6, -12));
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) { const t = i / 5; g.add(sph(.62 - i * .07, M.green, cx + side * (2 + i * 1.3), 14.8 + Math.sin(t * Math.PI) * 1.1, -12)); }
      g.add(sph(.75, M.green, cx + side * 1.9, 15.3, -12)); g.add(box(.5, .15, .15, M.red, cx + side * 1.1, 15.3, -12)); g.add(sph(.14, M.white, cx + side * 1.7, 15.6, -11.5));
    }
    // cửa vòm hai tầng, cột trắng
    for (let i = 0; i < 7; i++) { const x = cx - 12 + i * 4; for (const y of [2.5, 7]) { g.add(box(1.6, 2.4, .1, M.window, x, y, -3.95)); const arc = new THREE.Mesh(new THREE.CircleGeometry(.95, 16), M.white); arc.position.set(x, y + 1.3, -3.98); g.add(arc); } if (i < 6) g.add(box(.5, 9.4, .25, M.white, x + 2, 4.7, -3.9)); }
    g.add(box(2.2, 3.6, .3, mat(0x4e342e), cx, 1.8, -3.85));
    this.board(g, 'BẾN NHÀ RỒNG', '#ef6c00', 12, 1.3, cx, 9.3, -3.8);
    g.add(cyl(.1, 7, M.pole, cx, 17.5, -12)); g.add(box(2.4, 1.6, .05, M.red, cx + 1.3, 20.2, -12));
    // kè và tàu bên sông (bên trái, x âm)
    g.add(box(1.2, .7, 60, M.stone, -9, .35, 0));
    for (let z = -26; z <= 28; z += 5) g.add(cyl(.05, 1.1, M.pole, -8.4, .55, z)); g.add(box(.08, .08, 56, M.pole, -8.4, 1.1, 1));
    const ship = new THREE.Group(); ship.add(box(18, 3, 5.5, mat(0x37474f), 0, 1.5, 0)); ship.add(box(7, 3.2, 4.5, M.white, -3, 4.6, 0)); ship.add(cyl(.55, 2.6, M.red, -3, 7.5, 0)); ship.add(box(3, .3, 5.6, M.white, 7, 3.1, 0)); ship.position.set(-26, .1, 2); ship.rotation.y = .2; g.add(ship);
    for (const [x, z] of [[-3, 24], [24, 24], [26, 8]]) this.bigTree(g, x, z, 5, 1);
  }
  addLandmark(place, e) {
    if (e.card === 'opera') {
      const g = new THREE.Group();
      const cream = new THREE.MeshStandardMaterial({ color: 0xfbe9d0, roughness: .8 });
      const main = box(26, 13, 20, cream, 0, 6.5, -11); main.castShadow = true; g.add(main);
      const roof = box(27, 1, 21, new THREE.MeshStandardMaterial({ color: 0x6d7f8c, roughness: .8 }), 0, 13.4, -11); g.add(roof);
      const dome = sph(6, new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: .6 }), 0, 13.5, -11); dome.scale.y = 3.5; g.add(dome);
      // vòm cửa chính + cột
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 1, 20, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: .9 })); arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2; arch.position.set(0, 4.2, -.6); g.add(arch);
      g.add(box(6.4, 4.2, .8, new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: .9 }), 0, 2.1, -.6));
      for (const x of [-9, -6, 6, 9]) { g.add(cyl(.5, 9, M.white, x, 4.5, .4)); }
      g.add(box(26, 1.2, 2, M.white, 0, 9.6, 0));
      for (const x of [-4.2, 4.2]) { g.add(sph(.7, M.white, x, 7.6, .3)); g.add(cyl(.5, 2.2, M.white, x, 5.9, .3)); }
      // bậc thềm
      for (let i = 0; i < 4; i++) g.add(box(16 + i * 2, .3, 1.2 + i * .8, M.white, 0, .15 + (3 - i) * .3, 1.2 + i * .3));
      place(g, e.x, 9.5);
      g.rotation.y += Math.PI / 2;
    } else if (e.card === 'buudien') {
      const g = new THREE.Group();
      const main = box(26, 11, 14, M.ochre, 0, 5.5, -8); main.castShadow = true; g.add(main);
      g.add(box(27, .6, 15, M.tile, 0, 11.3, -8));
      g.add(box(8, 2.4, 1, M.ochre, 0, 12.4, -1.4)); const ped = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), M.tile); ped.rotation.y = Math.PI / 4; ped.scale.set(8 / 2 * Math.SQRT2, 1.4, 1.2); ped.position.set(0, 14.3, -1.4); g.add(ped);
      for (let i = 0; i < 7; i++) { const x = -12 + i * 4; for (const y of [2.6, 7.4]) { if (i === 3 && y < 3) continue; g.add(box(1.8, 2.6, .1, mat(0x2e7d32, .7), x, y, -.95)); const arc = new THREE.Mesh(new THREE.CircleGeometry(1.05, 16), M.white); arc.position.set(x, y + 1.4, -.98); g.add(arc); } if (i < 6) g.add(box(.6, 10.4, .25, M.white, x + 2, 5.2, -.9)); }
      g.add(box(3.2, 4.6, .3, mat(0x1b5e20), 0, 2.3, -.85));
      const clock = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshStandardMaterial({ map: clockTexture(), roughness: .5 })); clock.position.set(0, 12.5, -.85); g.add(clock);
      this.board(g, 'BƯU ĐIỆN THÀNH PHỐ', '#1b5e20', 13, 1.1, 0, 10.3, -.85, 72);
      for (let i = 0; i < 3; i++) g.add(box(18 + i * 2, .25, .8 + i * .5, M.white, 0, .125 + (2 - i) * .25, -.3 + i * .25));
      g.add(cyl(.08, 5, M.pole, -9, 2.5, 1)); g.add(box(1.6, 1.05, .05, M.red, -8.2, 4.6, 1));
      place(g, e.x, 9.5);
      g.rotation.y += Math.PI / 2;
    } else if (e.card === 'tranhungdao') {
      const g = new THREE.Group();
      const pl = new THREE.Mesh(new THREE.CircleGeometry(7, 28), new THREE.MeshStandardMaterial({ map: plazaTexture(), roughness: 1 })); pl.rotation.x = -Math.PI / 2; pl.position.y = .01; g.add(pl);
      g.add(box(4.4, 1, 4.4, M.stone, 0, .5, 0)); g.add(box(2.8, 5.2, 2.8, M.stone, 0, 3.6, 0));
      g.add(cyl(.85, 3.4, M.bronze, 0, 7.9, 0)); g.add(sph(.55, M.bronze, 0, 10.1, 0)); g.add(cyl(.6, .5, M.bronze, 0, 10.7, 0));
      const arm = box(.32, .32, 2.4, M.bronze, 0, 9.2, 1.4); arm.rotation.x = -.5; g.add(arm); // tay chỉ về phía trước (ra sông)
      g.add(box(1.2, .2, .2, M.bronze, 0, 8.4, .4));
      for (const a of [0, 1, 2, 3]) { const x = Math.cos(a * Math.PI / 2 + .4) * 5.2, z = Math.sin(a * Math.PI / 2 + .4) * 5.2; g.add(cyl(.05, 4, M.pole, x, 2, z)); g.add(box(.9, .6, .04, M.red, x + .45, 3.6, z)); }
      place(g, e.x, 10.5);
      g.rotation.y += Math.PI / 2;
    }
    e.obj = {};
  }
  addHome(seg) {
    const g = new THREE.Group();
    const wall = new THREE.MeshStandardMaterial({ color: 0xffe0b2, roughness: .9 });
    g.add(box(8, 6.5, 10, wall, 0, 3.25, -6));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: .9 })); roof.rotation.y = Math.PI / 4; roof.position.set(0, 8, -6); g.add(roof);
    g.add(box(1.6, 2.6, .2, new THREE.MeshStandardMaterial({ color: 0x6d4c41 }), 0, 1.3, -.9));
    g.add(box(1.6, 1.4, .1, M.glass, -2.5, 3.5, -.95)); g.add(box(1.6, 1.4, .1, M.glass, 2.5, 3.5, -.95));
    const sign = new THREE.Mesh(new THREE.BoxGeometry(3, .7, .06), [wall, wall, wall, wall, new THREE.MeshStandardMaterial({ map: textBoardTexture('NHÀ MÌNH', { bg: '#ef6c00', w: 512, h: 120, size: 70 }), roughness: .5 }), wall]); sign.position.set(0, 5.3, -.9); g.add(sign);
    g.position.copy(seg.start).addScaledVector(seg.dir, -2).addScaledVector(seg.right, 8); g.lookAt(g.position.clone().addScaledVector(seg.right, -1)); this.statics.add(g);
  }
  addMarket(seg) {
    const { start, dir, right, len } = seg;
    const g = new THREE.Group();
    const wall = new THREE.MeshStandardMaterial({ color: 0xf6e7c8, roughness: .9 });
    const roofM = new THREE.MeshStandardMaterial({ color: 0xb23a2b, roughness: .9 });
    const main = box(60, 7, 26, wall, 0, 3.5, -13); main.castShadow = true; main.receiveShadow = true; g.add(main);
    const roof = box(62, 1, 28, roofM, 0, 7.5, -13); g.add(roof);
    // mái vòm lợp ngói nhô cao ở giữa
    const mid = box(20, 3, 26, wall, 0, 9.5, -13); g.add(mid); g.add(box(21, .8, 27, roofM, 0, 11.4, -13));
    // tháp đồng hồ cửa Nam
    const tower = box(9, 17, 9, wall, 0, 8.5, 2); tower.castShadow = true; g.add(tower);
    g.add(box(9.6, .8, 9.6, roofM, 0, 17.3, 2));
    const top = new THREE.Mesh(new THREE.ConeGeometry(6.2, 3.6, 4), roofM); top.rotation.y = Math.PI / 4; top.position.set(0, 19.5, 2); g.add(top);
    const clock = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshStandardMaterial({ map: clockTexture(), roughness: .5 })); clock.position.set(0, 13, 6.55); g.add(clock);
    // cổng vòm vào chợ
    for (const x of [-3, 0, 3]) { const a = box(2.2, 4.2, .6, new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: .9 }), x, 2.1, 6.4); g.add(a); }
    const sign = new THREE.Mesh(new THREE.BoxGeometry(14, 1.6, .1), [wall, wall, wall, wall, new THREE.MeshStandardMaterial({ map: textBoardTexture('CHỢ BẾN THÀNH', { bg: '#b23a2b', w: 1024, h: 120, size: 84 }), roughness: .5 }), wall]); sign.position.set(0, 7.8, 6.6); g.add(sign);
    // dãy cửa sổ vòm ngang hai cánh
    for (let i = -6; i <= 6; i++) { if (Math.abs(i) < 2) continue; g.add(box(2.2, 2.6, .1, new THREE.MeshStandardMaterial({ color: 0x3e2723 }), i * 4.4, 3.4, 0.05)); }
    // quảng trường lát gạch trước chợ
    const pt = plazaTexture(); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(16, 6);
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(70, 24), new THREE.MeshStandardMaterial({ map: pt, roughness: 1 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, .01, 18); plaza.receiveShadow = true; g.add(plaza);
    // vài cây trong quảng trường
    for (const x of [-26, -18, 18, 26]) { const t = new THREE.Group(); t.add(cyl(.2, 4, M.trunk, 0, 2, 0)); const c = new THREE.Mesh(G.leaf, M.leaf[1]); c.scale.set(2.4, 2, 2.4); c.position.y = 4.6; c.castShadow = true; t.add(c); t.position.set(x, 0, 14); g.add(t); }
    g.position.copy(start).addScaledVector(dir, len + 40); g.lookAt(g.position.clone().addScaledVector(dir, -1));
    this.statics.add(g);
  }

  /* ngã tư ở cuối phố: ô vuông mặt đường, đường cắt ngang, lề và nhà dọc đường ngang, đèn tín hiệu */
  buildIntersection(seg, arc, r, nextVariant, nextName, st = {}, nextSt = null) {
    const Cx = arc.cross, dir = seg.dir, right = seg.right, sign = arc.sign; // sign: +1 rẽ phải, -1 rẽ trái
    const nextGaps = nextSt ? gapsOf(nextSt) : [];
    // nhánh ngã tư trùng với đường kế (sideL === sign): u là khoảng cách từ tâm ngã tư, s của đường kế = u - R
    const skipRow = (sideF, sideL) => {
      if (sideL === sign) return !!nextSt && nextSt.river === -sign * sideF; // phía sông của đường kế
      return sideF === -1 && st.river === -sign; // nhánh giả đi vào sông của đường này
    };
    const inNextGap = (sideL, u, w) => sideL === sign && nextGaps.some(([g0, g1]) => u - 8 + w > g0 && u - 8 < g1);
    const rt = roadTexture(); rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(1, 30);
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(10, 180), new THREE.MeshStandardMaterial({ map: rt, roughness: .95 })); cross.rotation.x = -Math.PI / 2; cross.receiveShadow = true;
    const cg = new THREE.Group(); cg.add(cross); cg.position.copy(Cx).setY(.004); cg.lookAt(cg.position.clone().add(right)); this.statics.add(cg);
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x5b5e63, roughness: .95 })); sq.rotation.x = -Math.PI / 2; sq.position.copy(Cx).setY(.006); this.statics.add(sq);
    // lề + nhà dọc đường ngang (hai phía của ngã tư, trừ ô vuông)
    for (const sideF of [1, -1]) { // phía trước / phía sau theo hướng đi
      for (const sideL of [1, -1]) { // trái / phải
        const swt = sidewalkTexture(); swt.wrapS = swt.wrapT = THREE.RepeatWrapping; swt.repeat.set(1.5, 40);
        const sw = new THREE.Mesh(new THREE.BoxGeometry(3, .15, 84), [M.curb, M.curb, new THREE.MeshStandardMaterial({ map: swt, roughness: .95 }), M.curb, M.curb, M.curb]); sw.receiveShadow = true;
        const g = new THREE.Group(); g.add(sw);
        g.position.copy(Cx).addScaledVector(dir, sideF * 6.5).addScaledVector(right, sideL * 47); g.position.y = .075; g.lookAt(g.position.clone().add(right)); this.statics.add(g);
        // nhà dọc đường ngang
        let s = 5;
        while (s < 86 && !skipRow(sideF, sideL)) {
          const w = r.int(4, 7) + r() * 1.5, floors = r.int(2, 5), h = floors * 3.4 + 2, depth = 12 + r() * 4;
          if (inNextGap(sideL, s, w)) { s += 1; continue; }
          const fv = nextVariant() % 6;
          const front = new THREE.MeshStandardMaterial({ map: facadeTexture(floors, fv + floors), roughness: .85, emissiveMap: facadeTexture(floors, fv + floors), emissive: 0xffffff, emissiveIntensity: 0 }); this.facadeMats.push(front);
          const side = new THREE.MeshStandardMaterial({ map: sideWallTexture(fv), roughness: .9 });
          const roof = new THREE.MeshStandardMaterial({ color: r.pick([0x8d6e63, 0x795548, 0xa1887f, 0xb0bec5]), roughness: 1 });
          const b = new THREE.Mesh(new THREE.BoxGeometry(w - .15, h, depth), [side, side, roof, roof, front, side]); b.castShadow = true; b.receiveShadow = true;
          const bg = new THREE.Group(); bg.add(b); b.position.set(0, h / 2, -depth / 2);
          bg.position.copy(Cx).addScaledVector(dir, sideF * 8).addScaledVector(right, sideL * (s + w / 2));
          bg.lookAt(bg.position.clone().addScaledVector(dir, -sideF)); this.statics.add(bg);
          s += w;
        }
        if (sideF === 1) for (let s2 = 12; s2 < 80; s2 += 16) { if (inNextGap(sideL, s2, 1)) continue; const t = new THREE.Group(); const h = 3.5 + r() * 2; const tr = cyl(.14, h, M.trunk, 0, h / 2, 0); t.add(tr); const c = new THREE.Mesh(G.leaf, r.pick(M.leaf)); c.scale.set(1.8, 1.5, 1.8); c.position.y = h + .5; c.castShadow = true; t.add(c); t.position.copy(Cx).addScaledVector(dir, 6.9).addScaledVector(right, sideL * s2); this.statics.add(t); }
      }
    }
    // biển tên đường mới ở góc ngã tư
    const sgn = new THREE.Group(); sgn.add(cyl(.05, 3, M.pole, 0, 1.5, 0));
    const tex = textBoardTexture(('Đ. ' + (nextName || '')).toUpperCase(), { bg: '#0d47a1', w: 512, h: 144, size: 56 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, .45, .05), [M.pole, M.pole, M.pole, M.pole, new THREE.MeshStandardMaterial({ map: tex, roughness: .5 }), new THREE.MeshStandardMaterial({ map: tex, roughness: .5 })]); board.position.set(0, 2.8, 0); sgn.add(board);
    sgn.position.copy(Cx).addScaledVector(dir, -5.6).addScaledVector(right, 5.6); sgn.lookAt(sgn.position.clone().add(right)); this.statics.add(sgn);
  }

  /* giờ trong ngày: sáng, chiều hoàng hôn, chập tối (đèn đường sáng) */
  setTime(time = 'morning') {
    this.time = time;
    this.sky.material.map = skyTexture(time); this.sky.material.needsUpdate = true;
    const cfg = {
      morning: { bg: 0xa9d6f5, fog: 0xcfe6f7, sun: [0xfff2d6, 2.2], hemi: [0xcfe8ff, 0x8a7a5a, .95], sunPos: [-40, 70, 30], disc: [-220, 250, -300], discCol: 0xfff6d0, lamp: 0 },
      sunset: { bg: 0xf0b48a, fog: 0xf3c7a4, sun: [0xffb070, 1.9], hemi: [0xf7c9a8, 0x6b5a4a, .8], sunPos: [60, 22, -40], disc: [300, 60, -200], discCol: 0xffcf7a, lamp: 0 },
      dusk: { bg: 0x46598f, fog: 0x56689c, sun: [0xaabcff, 1.15], hemi: [0x8c9ad6, 0x4a4a5a, 1.25], sunPos: [-30, 50, 40], disc: [0, 400, -300], discCol: 0xdde7ff, lamp: 2.4 }
    }[time] || null;
    if (!cfg) return;
    for (const gl of this.glows) gl.visible = time === 'dusk';
    for (const m of this.facadeMats) m.emissiveIntensity = time === 'dusk' ? .45 : 0;
    this.scene.background.set(cfg.bg); this.scene.fog.color.set(cfg.fog);
    this.sun.color.set(cfg.sun[0]); this.sun.intensity = cfg.sun[1]; this.sunOffset = cfg.sunPos;
    this.hemi.color.set(cfg.hemi[0]); this.hemi.groundColor.set(cfg.hemi[1]); this.hemi.intensity = cfg.hemi[2];
    this.sunDisc.position.set(...cfg.disc); this.sunDisc.lookAt(0, 0, 0); this.sunDisc.material.color.set(cfg.discCol); this.sunDisc.scale.setScalar(time === 'dusk' ? .6 : 1);
    M.lamp.emissiveIntensity = cfg.lamp; M.window.emissiveIntensity = cfg.lamp * .25;
  }

  /* ánh sáng và bóng đi theo xe */
  followSun(pos) {
    const o = this.sunOffset || [-40, 70, 30];
    this.sun.position.set(pos.x + o[0], o[1], pos.z + o[2]); this.sun.target.position.copy(pos); this.sun.target.updateMatrixWorld();
    this.sky.position.copy(pos);
  }
}

/* ================= đầu đèn tín hiệu ================= */
function makeLightHead() {
  const g = new THREE.Group();
  g.add(box(.42, 1.15, .32, M.dark, 0, 0, 0));
  const lamps = {};
  const cols = { red: 0xff1744, yellow: 0xffea00, green: 0x00e676 };
  let y = .36;
  for (const k of ['red', 'yellow', 'green']) {
    const m = new THREE.MeshStandardMaterial({ color: cols[k], emissive: cols[k], emissiveIntensity: 0, roughness: .3 });
    const l = sph(.13, m, 0, y, .17); g.add(l); lamps[k] = m; y -= .36;
    const hood = box(.3, .05, .2, M.dark, 0, y + .36 + .15, .2); g.add(hood);
  }
  g.userData.set = (s) => { for (const k in lamps) { lamps[k].emissiveIntensity = k === s ? 1.6 : 0; lamps[k].color.set(k === s ? cols[k] : 0x333333); } };
  return g;
}

/* ================= người đi bộ ================= */
export function makePedestrian(shirt = 0xe53935, pants = 0x1e88e5, still = false) {
  const g = new THREE.Group();
  const sm = new THREE.MeshStandardMaterial({ color: shirt, roughness: .8 }), pm = new THREE.MeshStandardMaterial({ color: pants, roughness: .8 });
  const torso = box(.42, .55, .24, sm, 0, 1.12, 0); torso.castShadow = true; g.add(torso);
  const head = sph(.14, M.skin, 0, 1.56, 0); g.add(head);
  const hair = sph(.145, new THREE.MeshStandardMaterial({ color: 0x3e2723 }), 0, 1.6, -.02); hair.scale.y = .145 * .7; g.add(hair);
  const hip = new THREE.Vector3(0, .85, 0);
  const legs = [], arms = [];
  for (const sx of [-1, 1]) {
    const l = tube(.07, pm); g.add(l); legs.push({ m: l, sx });
    const a = tube(.055, M.skin); g.add(a); arms.push({ m: a, sx });
  }
  const foot = new THREE.Vector3(), hand = new THREE.Vector3(), sh = new THREE.Vector3();
  g.userData.walk = (t) => {
    for (const { m, sx } of legs) { const sw = still ? 0 : Math.sin(t * 7 + (sx > 0 ? 0 : Math.PI)) * .35; foot.set(sx * .11, 0, sw); hip.x = sx * .11; placeTube(m, hip, foot); }
    for (const { m, sx } of arms) { const sw = still ? 0 : Math.sin(t * 7 + (sx > 0 ? Math.PI : 0)) * .3; sh.set(sx * .25, 1.36, 0); hand.set(sx * .27, .9, sw); placeTube(m, sh, hand); }
  };
  g.userData.walk(0);
  return g;
}

/* ================= xe máy (có hoặc không người lái) ================= */
export function makeMoto(color = 0xe53935, rider = true) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color, roughness: .5, metalness: .2 });
  for (const z of [-.65, .65]) { const w = new THREE.Mesh(new THREE.TorusGeometry(.27, .09, 10, 18), M.tire); w.rotation.y = Math.PI / 2; w.position.set(0, .3, z); g.add(w); g.add(cyl(.06, .3, M.chrome, 0, .3, z).rotateZ(Math.PI / 2)); }
  const frame = box(.4, .3, 1.1, body, 0, .55, 0); frame.castShadow = true; g.add(frame);
  g.add(box(.46, .14, .7, M.dark, 0, .78, -.15));
  g.add(box(.36, .5, .3, body, 0, .7, .55));
  g.add(box(.6, .05, .05, M.chrome, 0, .98, .55));
  g.add(sph(.08, M.yellow, 0, .75, .72));
  if (rider) {
    const p = makePedestrian(0x455a64, 0x263238, true); p.position.set(0, .35, -.15); p.scale.setScalar(.95);
    const helmet = sph(.17, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 }), 0, 1.58, 0); p.add(helmet);
    g.add(p);
  }
  return g;
}

/* ================= xe cứu thương ================= */
export function makeAmbulance() {
  const g = new THREE.Group();
  const body = box(2, 1.6, 4.6, M.white, 0, 1.2, 0); body.castShadow = true; g.add(body);
  g.add(box(2.02, .3, 4.62, M.red, 0, 1.1, 0));
  g.add(box(1.9, .7, .1, M.glass, 0, 1.6, 2.31));
  for (const z of [-1.5, 1.5]) for (const x of [-.9, .9]) { const w = cyl(.38, .3, M.tire, x, .38, z); w.rotation.z = Math.PI / 2; g.add(w); }
  const crossTex = canvasTex(128, 128, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#d32f2f'; c.fillRect(44, 14, 40, 100); c.fillRect(14, 44, 100, 40); }, 'redcross');
  const crossMat = new THREE.MeshStandardMaterial({ map: crossTex, roughness: .6 });
  for (const x of [-1.005, 1.005]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), crossMat); p.position.set(x, 1.45, -.4); p.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(p); }
  const lampA = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 1.5 });
  const lampB = new THREE.MeshStandardMaterial({ color: 0x2979ff, emissive: 0x2979ff, emissiveIntensity: 0 });
  g.add(box(.5, .2, .4, lampA, -.4, 2.1, 1.5)); g.add(box(.5, .2, .4, lampB, .4, 2.1, 1.5));
  g.userData.flash = (t) => { const on = Math.floor(t * 5) % 2 === 0; lampA.emissiveIntensity = on ? 2 : 0; lampB.emissiveIntensity = on ? 0 : 2; };
  return g;
}

/* ================= xe hơi (xe ngược chiều trang trí) ================= */
export function makeCar(color = 0x1e88e5) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .3 });
  const b = box(1.8, .6, 4.2, m, 0, .65, 0); b.castShadow = true; g.add(b);
  g.add(box(1.6, .6, 2.2, m, 0, 1.25, -.2));
  g.add(box(1.5, .5, 2.1, M.glass, 0, 1.3, -.2));
  for (const z of [-1.3, 1.3]) for (const x of [-.85, .85]) { const w = cyl(.33, .25, M.tire, x, .33, z); w.rotation.z = Math.PI / 2; g.add(w); }
  g.add(box(.3, .15, .05, M.yellow, -.6, .7, 2.12)); g.add(box(.3, .15, .05, M.yellow, .6, .7, 2.12));
  return g;
}

/* ================= xe đạp + bé =================
   cfg.bike: { frame, rim, basket: 'tre'|'hoa'|'khong', flag, tua }
   cfg.avatar: { skin, hair: 'ngan'|'dai'|'bim'|'bui', hairColor, face: 'cuoi'|'vui'|'nhay'|'kinh', outfit: 'ao'|'vay'|'aodai'|'hocsinh',
                 outfitColor, pantsColor, helmet: 'tron'|'meo'|'no', helmetColor, backpack }
   Trục cục bộ: +Z phía trước, +Y lên, +X là bên TRÁI của bé (nên tay phải nằm ở -X). */
export const AVATAR_DEFAULT = { skin: 0xf1c27d, hair: 'ngan', hairColor: 0x3e2723, face: 'cuoi', outfit: 'ao', outfitColor: 0x29b6f6, pantsColor: 0x3949ab, helmet: 'tron', helmetColor: 0xffca28, backpack: false };
export const BIKE_DEFAULT = { frame: 0xff7043, rim: 0xcfd8dc, basket: 'tre', flag: false, tua: false };

function faceTexture(face) {
  return canvasTex(128, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#2b1d14'; g.strokeStyle = '#2b1d14'; g.lineWidth = 6; g.lineCap = 'round';
    const eye = (x, kind) => {
      if (kind === 'dot') { g.beginPath(); g.arc(x, 40, 8, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 3, 37, 2.5, 0, 7); g.fill(); g.fillStyle = '#2b1d14'; }
      else if (kind === 'happy') { g.beginPath(); g.arc(x, 44, 9, Math.PI, 2 * Math.PI); g.stroke(); }
      else if (kind === 'wink') { g.beginPath(); g.moveTo(x - 9, 42); g.lineTo(x + 9, 42); g.stroke(); }
    };
    if (face === 'vui') { eye(40, 'happy'); eye(88, 'happy'); }
    else if (face === 'nhay') { eye(40, 'dot'); eye(88, 'wink'); }
    else { eye(40, 'dot'); eye(88, 'dot'); }
    // má hồng
    g.fillStyle = 'rgba(255,120,140,.45)'; g.beginPath(); g.arc(26, 62, 9, 0, 7); g.fill(); g.beginPath(); g.arc(102, 62, 9, 0, 7); g.fill();
    // miệng
    g.strokeStyle = '#b3412f'; g.lineWidth = 5; g.beginPath();
    if (face === 'vui') { g.fillStyle = '#b3412f'; g.arc(64, 66, 11, 0, Math.PI); g.fill(); } else { g.arc(64, 62, 11, .15 * Math.PI, .85 * Math.PI); g.stroke(); }
    if (face === 'kinh') { g.strokeStyle = '#1a237e'; g.lineWidth = 5; g.beginPath(); g.arc(40, 42, 16, 0, 7); g.stroke(); g.beginPath(); g.arc(88, 42, 16, 0, 7); g.stroke(); g.beginPath(); g.moveTo(56, 42); g.lineTo(72, 42); g.stroke(); }
  }, 'face-' + face);
}

export function makeBike(cfg = {}) {
  const B = Object.assign({}, BIKE_DEFAULT, cfg.bike || {}), A = Object.assign({}, AVATAR_DEFAULT, cfg.avatar || {});
  const g = new THREE.Group();
  const frameM = new THREE.MeshStandardMaterial({ color: B.frame, roughness: .4, metalness: .3 });
  const rimM = new THREE.MeshStandardMaterial({ color: B.rim, roughness: .3, metalness: .6 });
  const P = {
    rear: new THREE.Vector3(0, .34, -.52), front: new THREE.Vector3(0, .34, .52), crank: new THREE.Vector3(0, .36, -.08),
    seat: new THREE.Vector3(0, .98, -.32), head: new THREE.Vector3(0, .95, .42), headLow: new THREE.Vector3(0, .62, .5)
  };
  const wheels = [];
  for (const p of [P.rear, P.front]) {
    const wg = new THREE.Group(); wg.position.copy(p);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(.33, .035, 10, 28), M.tire); tire.rotation.y = Math.PI / 2; tire.castShadow = true; wg.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.29, .014, 6, 28), rimM); rim.rotation.y = Math.PI / 2; wg.add(rim);
    for (let i = 0; i < 6; i++) { const sp = cyl(.006, .58, M.chrome); sp.rotation.x = i * Math.PI / 6; wg.add(sp); }
    wg.add(sph(.04, rimM));
    g.add(wg); wheels.push(wg);
  }
  const tubes = [[P.rear, P.crank], [P.crank, P.seat], [P.seat, P.head], [P.crank, P.headLow], [P.rear, P.seat], [P.head, P.front], [P.head, P.headLow]];
  for (const [a, b] of tubes) { const t = tube(.028, frameM); placeTube(t, a, b); t.castShadow = true; g.add(t); }
  const bar = box(.52, .03, .03, M.chrome, 0, 1.0, .42); g.add(bar);
  for (const x of [-.26, .26]) g.add(box(.08, .04, .04, M.dark, x, 1.0, .42));
  g.add(box(.2, .06, .3, M.dark, 0, 1.0, -.32));
  // tua rua ở tay lái
  if (B.tua) for (const x of [-.3, .3]) for (let i = 0; i < 3; i++) { const t = tube(.006, new THREE.MeshStandardMaterial({ color: [0xff4081, 0x40c4ff, 0xffd740][i] })); placeTube(t, new THREE.Vector3(x, 1.0, .42), new THREE.Vector3(x + (x > 0 ? .04 : -.04) * i, .82 - i * .03, .40 + i * .03)); g.add(t); }
  // cờ nhỏ sau yên
  if (B.flag) { const pole = cyl(.008, .7, M.chrome, -.12, 1.3, -.55); g.add(pole); const fl = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.12, 1.65, -.55), new THREE.Vector3(-.12, 1.45, -.55), new THREE.Vector3(-.12, 1.55, -.8)]), new THREE.MeshStandardMaterial({ color: 0xff5252, side: THREE.DoubleSide })); fl.geometry.computeVertexNormals(); g.add(fl); }
  // đèn pha (bật khi trời tối)
  const lampM = new THREE.MeshStandardMaterial({ color: 0xfff8e1, emissive: 0xfff2b0, emissiveIntensity: 0, roughness: .3 });
  g.add(sph(.045, lampM, 0, .92, .6));
  const head = new THREE.SpotLight(0xfff1c8, 0, 36, .55, .5, 1.6); head.position.set(0, .95, .62); const tgt = new THREE.Object3D(); tgt.position.set(0, -.1, 12); g.add(tgt); head.target = tgt; g.add(head);
  g.userData.setHeadlight = (on) => { head.intensity = on ? 90 : 0; lampM.emissiveIntensity = on ? 2 : 0; };
  // giỏ xe
  const basket = new THREE.Group(); basket.position.set(0, .9, .68);
  if (B.basket !== 'khong') {
    const bm = new THREE.MeshStandardMaterial({ color: B.basket === 'hoa' ? 0xf8bbd0 : 0x8d6e63, roughness: .9 });
    basket.add(box(.36, .02, .28, bm, 0, -.11, 0)); basket.add(box(.36, .22, .02, bm, 0, 0, .13)); basket.add(box(.36, .22, .02, bm, 0, 0, -.13)); basket.add(box(.02, .22, .28, bm, -.17, 0, 0)); basket.add(box(.02, .22, .28, bm, .17, 0, 0));
    if (B.basket === 'hoa') { const cols = [0xff4081, 0xffd740, 0x40c4ff, 0xff6e40, 0xffffff]; for (let i = 0; i < 5; i++) { basket.add(sph(.045, new THREE.MeshStandardMaterial({ color: cols[i] }), -.14 + i * .07, .14, (i % 2 ? .06 : -.06))); } basket.add(cyl(.01, .3, M.leaf[0], 0, .02, 0)); }
  }
  g.add(basket);
  // bàn đạp + tay quay
  const crank = new THREE.Group(); crank.position.copy(P.crank); g.add(crank);
  const pedalsL = box(.12, .025, .07, M.dark, -.1, -.16, 0), pedalsR = box(.12, .025, .07, M.dark, .1, .16, 0);
  crank.add(tube(.012, M.chrome)); placeTube(crank.children[0], new THREE.Vector3(-.09, .16, 0), new THREE.Vector3(.09, -.16, 0));
  crank.add(pedalsL); crank.add(pedalsR);
  // ===== bé =====
  const skinM = new THREE.MeshStandardMaterial({ color: A.skin, roughness: .8 });
  const hairM = new THREE.MeshStandardMaterial({ color: A.hairColor, roughness: .85 });
  const isHS = A.outfit === 'hocsinh';
  const topM = new THREE.MeshStandardMaterial({ color: isHS ? 0xffffff : A.outfitColor, roughness: .8 });
  const legM = A.outfit === 'vay' ? skinM : new THREE.MeshStandardMaterial({ color: A.outfit === 'aodai' ? 0xfafafa : isHS ? 0x1e3a8a : A.pantsColor, roughness: .8 });
  const torso = box(.34, .5, .22, topM, 0, 1.3, -.1); torso.rotation.x = .38; torso.castShadow = true; g.add(torso);
  if (A.outfit === 'vay') { const skirt = new THREE.Mesh(new THREE.ConeGeometry(.3, .3, 14, 1, true), new THREE.MeshStandardMaterial({ color: A.pantsColor, roughness: .85, side: THREE.DoubleSide })); skirt.position.set(0, .98, -.2); skirt.rotation.x = .25; g.add(skirt); }
  if (A.outfit === 'aodai') { for (const z of [-.02, -.36]) { const flap = box(.3, .55, .025, topM, 0, .82, z); flap.rotation.x = z > -.1 ? .35 : -.15; g.add(flap); } }
  if (isHS) { const scarf = new THREE.Mesh(new THREE.ConeGeometry(.11, .22, 3), new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: .8 })); scarf.position.set(0, 1.42, .08); scarf.rotation.x = Math.PI + .3; g.add(scarf); }
  if (A.backpack) { const bp = box(.28, .3, .13, new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: .8 }), 0, 1.32, -.3); bp.rotation.x = .38; g.add(bp); }
  const headS = sph(.15, skinM, 0, 1.7, .02); g.add(headS);
  // mặt
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.2, .15), new THREE.MeshStandardMaterial({ map: faceTexture(A.face), transparent: true, roughness: .9 })); face.position.set(0, 1.68, .165); g.add(face);
  // tóc
  const hairCap = sph(.155, hairM, 0, 1.72, -.01); hairCap.scale.y = .155 * .95; g.add(hairCap);
  if (A.hair === 'dai') { const back = box(.26, .4, .1, hairM, 0, 1.48, -.14); g.add(back); }
  if (A.hair === 'bim') { for (const x of [-.17, .17]) { g.add(sph(.06, hairM, x, 1.6, -.02)); const st = tube(.035, hairM); placeTube(st, new THREE.Vector3(x, 1.6, -.02), new THREE.Vector3(x * 1.2, 1.38, -.06)); g.add(st); g.add(sph(.03, new THREE.MeshStandardMaterial({ color: 0xff4081 }), x, 1.62, .04)); } }
  if (A.hair === 'bui') { g.add(sph(.07, hairM, 0, 1.8, -.15)); }
  // mũ bảo hiểm
  const helmetM = new THREE.MeshStandardMaterial({ color: A.helmetColor, roughness: .4 });
  const helmet = sph(.175, helmetM, 0, 1.74, .0); helmet.scale.y = .175 * .72; g.add(helmet);
  g.add(box(.2, .02, .1, helmetM, 0, 1.78, .17));
  if (A.helmet === 'meo') { for (const x of [-.1, .1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(.05, .1, 8), helmetM); ear.position.set(x, 1.9, -.02); ear.rotation.z = x > 0 ? -.3 : .3; g.add(ear); } }
  if (A.helmet === 'no') { const bowM = new THREE.MeshStandardMaterial({ color: 0xff4081, roughness: .6 }); g.add(sph(.05, bowM, .1, 1.86, .03)); g.add(sph(.05, bowM, .17, 1.84, .03)); g.add(sph(.025, new THREE.MeshStandardMaterial({ color: 0xffd740 }), .135, 1.86, .06)); }
  const limbs = { arms: [], legs: [] };
  for (const sx of [-1, 1]) {
    const up = tube(.045, topM), lo = tube(.04, skinM); g.add(up); g.add(lo); limbs.arms.push({ sx, up, lo });
    const th = tube(.06, legM), sh = tube(.055, legM); g.add(th); g.add(sh); limbs.legs.push({ sx, th, sh });
  }
  const V = () => new THREE.Vector3();
  const shoulder = V(), elbow = V(), hand = V(), hip = V(), knee = V(), foot = V(), mid = V(), nrm = V(), delta = V();
  const solveKnee = (a, b, L, out, fwd) => { mid.addVectors(a, b).multiplyScalar(.5); delta.subVectors(b, a); const D = delta.length(); const h = Math.sqrt(Math.max(0, L * L - D * D / 4)); nrm.set(0, delta.z, -delta.y).normalize(); if (nrm.dot(fwd) < 0) nrm.negate(); out.copy(mid).addScaledVector(nrm, h); };
  const FWD = new THREE.Vector3(0, .3, 1).normalize();
  let dist = 0, signalBlend = { L: 0, R: 0 };
  g.userData.update = (dt, speed, signal) => {
    dist += speed * dt;
    const ang = dist / .33;
    for (const w of wheels) w.rotation.x = ang;
    const ped = speed > .2 ? dist / .33 * .55 : crank.rotation.x; crank.rotation.x = ped;
    for (const { sx, th, sh } of limbs.legs) {
      const a = ped + (sx > 0 ? 0 : Math.PI);
      foot.set(sx * .11, P.crank.y + .16 * Math.cos(a), P.crank.z + .16 * Math.sin(a));
      hip.set(sx * .1, 1.06, -.22); solveKnee(hip, foot, .43, knee, FWD); placeTube(th, hip, knee); placeTube(sh, knee, foot);
    }
    for (const side of ['L', 'R']) { const t = signal === side ? 1 : 0; signalBlend[side] += (t - signalBlend[side]) * Math.min(1, dt * 8); }
    for (const { sx, up, lo } of limbs.arms) {
      const b = sx < 0 ? signalBlend.R : signalBlend.L; // +X là bên trái của bé, nên tay phải ở sx = -1
      shoulder.set(sx * .2, 1.5, -.02);
      hand.set(sx * .26, 1.02, .42).lerp(new THREE.Vector3(sx * .9, 1.55, 0), b);
      elbow.set(sx * .27, 1.26, .18).lerp(new THREE.Vector3(sx * .55, 1.52, -.02), b);
      placeTube(up, shoulder, elbow); placeTube(lo, elbow, hand);
    }
  };
  g.userData.update(0, 0, null);
  g.userData.basket = basket;
  return g;
}

/* món hàng trong giỏ xe: thẻ chữ emoji */
export function makeItemSprite(emoji) {
  const t = canvasTex(64, 64, (c) => { c.clearRect(0, 0, 64, 64); c.font = '48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, 32, 36); }, 'emoji-' + emoji);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true })); s.scale.setScalar(.26); return s;
}
