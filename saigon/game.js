/* Đạp Xe Sài Gòn: lối chơi, giao diện, lưu tiến độ. Thế giới 3D nằm trong world.js, dữ liệu trong data.js. */
import { THREE, World, createRenderer, makeBike, makePedestrian, makeMoto, makeAmbulance, makeCar, makeItemSprite, drawSignCanvas, rng, AVATAR_DEFAULT, BIKE_DEFAULT } from './world.js';

/* ================= tiện ích ================= */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (k) => `${k} nghìn`;
const moneyFull = (k) => `${k} nghìn (${(k * 1000).toLocaleString('vi-VN')}đ)`;
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ================= lưu trữ ================= */
const KEY = 'dap-xe-sai-gon-v1';
function freshState() {
  return { sound: true, profiles: [
    { id: 'k2', name: 'Bé lớp 2', grade: 'g2', coins: 0, stars: {}, cards: [], stamps: [], trips: [], license: false, bike: { ...BIKE_DEFAULT }, avatar: { ...AVATAR_DEFAULT }, owned: [] },
    { id: 'k4', name: 'Bé lớp 4', grade: 'g4', coins: 0, stars: {}, cards: [], stamps: [], trips: [], license: false, bike: { ...BIKE_DEFAULT, frame: 0x26a69a }, avatar: { ...AVATAR_DEFAULT, outfitColor: 0xef5350, helmetColor: 0x7e57c2 }, owned: [] }
  ] };
}
let state;
try { state = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch (e) { state = freshState(); }
// nâng cấp dữ liệu cũ (bản đầu chỉ có màu khung, áo, mũ)
for (const p of state.profiles) {
  if (!p.avatar) { p.avatar = { ...AVATAR_DEFAULT, outfitColor: (p.bike && p.bike.shirt) || AVATAR_DEFAULT.outfitColor, helmetColor: (p.bike && p.bike.helmet) || AVATAR_DEFAULT.helmetColor }; }
  p.bike = { ...BIKE_DEFAULT, ...(p.bike || {}) }; delete p.bike.shirt; delete p.bike.helmet;
  p.owned = p.owned || [];
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
const prof = (id) => state.profiles.find(p => p.id === id);
/* ví xu và tên bé dùng chung với zzzlearning (../zzz.js): p.coins đọc/ghi thẳng vào ví chung. Gọi lại sau khi thay state. */
function syncZZZ() { if (!window.ZZZ) return; ZZZ.syncKids(state.profiles); ZZZ.bindCoins(state.profiles); }
if (window.ZZZ) ZZZ.noteHub();
syncZZZ();

/* ================= âm thanh (tự tạo, không cần file) ================= */
const Audio = {
  ctx: null,
  get() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  tone(f, t = .12, type = 'sine', vol = .18, when = 0, slide = 0) {
    if (!state.sound) return; const c = this.get(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; if (slide) o.frequency.linearRampToValueAtTime(f + slide, c.currentTime + when + t);
    g.gain.setValueAtTime(vol, c.currentTime + when); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + when + t);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + when); o.stop(c.currentTime + when + t + .02);
  },
  bell() { this.tone(2100, .25, 'triangle', .2); this.tone(2600, .3, 'triangle', .12, .08); },
  ok() { this.tone(660, .1, 'triangle', .15); this.tone(880, .14, 'triangle', .15, .1); },
  coin() { this.tone(1200, .08, 'square', .08); this.tone(1800, .12, 'square', .08, .07); },
  bad() { this.tone(220, .25, 'sawtooth', .12); this.tone(160, .3, 'sawtooth', .1, .12); },
  honk() { this.tone(420, .18, 'square', .1); this.tone(420, .18, 'square', .1, .25); },
  siren() { for (let i = 0; i < 6; i++) { this.tone(700, .3, 'triangle', .07, i * .6); this.tone(950, .3, 'triangle', .07, i * .6 + .3); } },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .22, 'triangle', .16, i * .13)); }
};

/* ================= trang chính ================= */
let selectedKid = state.profiles[0].id;
let showParent = false;
const home = $('home'), play = $('play');

function paintSound() { $('soundBtn').textContent = state.sound ? '🔊' : '🔇'; }
$('soundBtn').onclick = () => { state.sound = !state.sound; save(); paintSound(); if (state.sound) Audio.bell(); };
$('parentBtn').onclick = () => { if (window.ZZZ && ZZZ.fromHub()) { location.href = '../phuhuynh/'; return; } if (showParent) { showParent = false; renderHome(); return; } const open = () => { showParent = true; renderHome(); }; if (window.ZZZ) ZZZ.gate(open); else open(); };
$('brand').onclick = () => { showParent = false; renderHome(); };

function renderHome() {
  paintSound();
  const p = prof(selectedKid);
  const allCards = Object.values(CARDS);
  const totalStars = (x) => Object.values(x.stars).reduce((a, b) => a + b, 0);
  const lockChip = (x) => { if (!window.ZZZ) return ''; const st = ZZZ.status(x.id); return st.why === 'math' ? '<span class="chip">🔒 Làm toán trước</span>' : st.why === 'time' ? '<span class="chip">⏱️ Hết giờ hôm nay</span>' : ''; };
  $('homeBody').innerHTML = `
    <section class="stack">
      <h2>Ai đạp xe hôm nay?</h2>
      <div class="kids">${state.profiles.map(x => `
        <button class="kid" type="button" data-pid="${x.id}" aria-pressed="${x.id === selectedKid}">
          <span class="grade">${x.grade === 'g2' ? 'Lớp 2' : 'Lớp 4'}</span>
          <span class="name">${esc(x.name)}</span>
          <span class="row" style="gap:6px"><span class="chip amber">🪙 ${x.coins}</span><span class="chip">⭐ ${totalStars(x)}</span><span class="chip green">📜 ${x.cards.length}/${allCards.length}</span>${x.license ? '<span class="chip">🪪 Bằng lái</span>' : ''}${lockChip(x)}</span>
          <span class="edit" data-edit="${x.id}" role="button" aria-label="Đổi tên" title="Đổi tên">✏️</span>
          <span class="edit" style="right:50px" data-paint="${x.id}" role="button" aria-label="Tủ thời trang" title="Tủ thời trang">👗</span>
        </button>`).join('')}</div>
    </section>
    <section class="stack">
      <div class="row" style="justify-content:space-between"><h2>Chọn chuyến đi cho ${esc(p.name)}</h2>
        <div class="views" role="group" aria-label="Góc nhìn"><button type="button" data-view="chase" aria-pressed="${state.view !== 'top'}">🚲 Sau lưng xe</button><button type="button" data-view="top" aria-pressed="${state.view === 'top'}">🗺️ Bản đồ trên cao</button></div></div>
      <div class="routes">${ROUTES.map(r => `
        <button class="route ${r.soon ? 'soon' : ''}" type="button" data-route="${r.id}" ${r.soon ? 'disabled' : ''}>
          <span class="ico">${r.emoji}</span>
          <span><span class="t">${esc(r.name)}</span><br><span class="d">${r.soon ? 'Sắp có' : esc(r.desc)}</span></span>
          <span class="stars">${r.soon ? '' : (p.stars[r.id] ? '⭐'.repeat(p.stars[r.id]) + '☆'.repeat(3 - p.stars[r.id]) : '☆☆☆')}</span>
        </button>`).join('')}</div>
      <div class="row" style="justify-content:space-between"><p class="muted" style="margin:0;font-size:14px">Trong lúc đi có thể bấm 🗺️ ở góc trên để đổi qua lại giữa góc nhìn sau lưng xe và bản đồ nhìn từ trên cao.</p>
        <div class="views" role="group" aria-label="Đồ họa"><button type="button" data-lite="0" aria-pressed="${!state.lite}">✨ Đồ họa đẹp</button><button type="button" data-lite="1" aria-pressed="${!!state.lite}">🪶 Đồ họa nhẹ</button></div></div>
    </section>
    <section class="stack">
      <h2>Bộ sưu tập thẻ của ${esc(p.name)}</h2>
      <div class="album">${allCards.map(c => `<button class="tile ${p.cards.includes(c.id) ? 'unlocked' : 'locked'}" type="button" data-card="${c.id}" ${p.cards.includes(c.id) ? '' : 'disabled'}><span class="e">${c.emoji}</span><span class="n">${esc(c.title)}</span></button>`).join('')}</div>
    </section>
    <section class="stack">
      <div class="row" style="justify-content:space-between"><h2>Bản đồ con dấu của ${esc(p.name)}</h2><span class="chip amber">📍 ${ROUTES.filter(r => p.stamps.includes(r.goalCard)).length}/${ROUTES.length} nơi${p.explorer ? ' · 🏅 Nhà thám hiểm Sài Gòn' : ''}</span></div>
      ${stampMap(p)}
      <p class="muted" style="margin:0;font-size:14px">Đạp tới một nơi là được đóng dấu lên bản đồ. Bấm vào một nơi để đi chuyến đó. Đủ 5 con dấu được danh hiệu <b>Nhà thám hiểm Sài Gòn</b> và thưởng 50 xu.</p>
    </section>
    ${showParent ? renderParent() : ''}
    <p class="muted" style="font-size:13px;margin:0">Bấm 👗 trên thẻ của bé để mở tủ thời trang (tóc, mặt, trang phục, mũ, màu xe...). Cách chơi: giữ nút <b>Đạp</b> để đi, <b>Thắng</b> để dừng. Xe đạp đi <b>sát lề phải</b>; gặp xe hàng rong đậu thì bấm <b>Lách trái</b> rồi về lề. Đèn đỏ dừng trước vạch, nhường người đi bộ, giơ tay trước khi rẽ. Bàn phím: mũi tên ← → đạp/thắng, ↑ ↓ đổi làn, A/D giơ tay, E vào quán, B chuông.</p>`;
  $('homeBody').querySelectorAll('.kid').forEach(b => b.onclick = (ev) => {
    if (ev.target.dataset.edit) { renameKid(ev.target.dataset.edit); return; }
    if (ev.target.dataset.paint) { wardrobe(ev.target.dataset.paint); return; }
    selectedKid = b.dataset.pid; renderHome();
  });
  $('homeBody').querySelectorAll('[data-route]').forEach(b => b.onclick = () => startTrip(b.dataset.route));
  $('homeBody').querySelectorAll('[data-go]').forEach(b => { b.onclick = () => startTrip(b.dataset.go); b.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); startTrip(b.dataset.go); } }; });
  $('homeBody').querySelectorAll('[data-lite]').forEach(b => b.onclick = () => { const v = b.dataset.lite === '1'; if (v !== !!state.lite) { state.lite = v; save(); if (renderer) { renderer.dispose(); renderer = null; } renderHome(); } });
  $('homeBody').querySelectorAll('[data-view]').forEach(b => b.onclick = () => { state.view = b.dataset.view; save(); renderHome(); });
  $('homeBody').querySelectorAll('[data-card]').forEach(b => b.onclick = () => showCard(CARDS[b.dataset.card], { readOnly: true }));
  if (showParent) bindParent();
}
/* Bản đồ con dấu: vị trí cách điệu của nhà và 5 nơi đến (không theo tỉ lệ thật), đường đi nét đứt từ nhà. */
const STAMP_MAP = {
  home: [150, 95],
  benthanh: { at: [235, 312], way: 'M150 95 V312 H235' },
  dinh: { at: [262, 188], way: 'M150 95 V188 H262' },
  ducba: { at: [358, 168], way: 'M150 95 H358 V168' },
  zoo: { at: [492, 108], way: 'M150 95 H492 V108' },
  nharong: { at: [462, 332], way: 'M150 95 V252 H462 V332' }
};
function stampMap(p) {
  const [hx, hy] = STAMP_MAP.home;
  const nodes = ROUTES.map(r => {
    const m = STAMP_MAP[r.id]; if (!m) return '';
    const done = p.stamps.includes(r.goalCard), [x, y] = m.at, st = p.stars[r.id] || 0;
    return `<path class="way ${done ? 'done' : ''}" d="${m.way}"/>
      <g class="node ${done ? 'done' : 'todo'}" data-go="${r.id}" role="button" tabindex="0" aria-label="${esc(r.to)}${done ? ', đã tới' : ', chưa tới'}">
        <circle cx="${x}" cy="${y}" r="30"/>
        <text class="em" x="${x}" y="${y + 10}" text-anchor="middle">${r.emoji}</text>
        <text class="nm" x="${x}" y="${y + 50}" text-anchor="middle">${esc(r.to)}</text>
        <text class="sr" x="${x}" y="${y + 66}" text-anchor="middle">${st ? '⭐'.repeat(st) + '☆'.repeat(3 - st) : '☆☆☆'}</text>
        ${done ? `<g class="seal" transform="rotate(-14 ${x + 24} ${y - 26})"><rect x="${x - 2}" y="${y - 36}" width="54" height="19" rx="6"/><text x="${x + 25}" y="${y - 22.5}" text-anchor="middle">ĐÃ TỚI</text></g>` : ''}
      </g>`;
  }).join('');
  return `<svg class="smap" viewBox="0 0 640 400" role="img" aria-label="Bản đồ con dấu">
    <rect class="bg" width="640" height="400" rx="16"/>
    <path class="river" d="M600 -10 C 585 80, 625 150, 585 220 S 520 330, 548 420"/>
    <path class="river thin" d="M300 400 C 330 360, 420 350, 470 332 S 540 300, 585 220"/>
    <rect class="park" x="300" y="112" width="86" height="34" rx="8"/><rect class="park" x="438" y="60" width="92" height="70" rx="10"/>
    <line class="grid" x1="40" y1="60" x2="520" y2="60"/><line class="grid" x1="40" y1="250" x2="520" y2="250"/><line class="grid" x1="90" y1="20" x2="90" y2="380"/><line class="grid" x1="400" y1="20" x2="400" y2="320"/>
    <text class="rv" x="612" y="120" text-anchor="middle" transform="rotate(80 612 120)">sông Sài Gòn</text>
    ${nodes}
    <g class="node home" aria-label="Nhà mình"><circle cx="${hx}" cy="${hy}" r="26"/><text class="em" x="${hx}" y="${hy + 9}" text-anchor="middle">🏠</text><text class="nm" x="${hx}" y="${hy - 34}" text-anchor="middle">Nhà mình</text></g>
  </svg>`;
}
function renameKid(pid) {
  const p = prof(pid);
  openModal(`<h2>Đổi tên bé</h2><input class="name" id="nameInput" value="${esc(p.name)}" maxlength="20" aria-label="Tên bé"><div class="actions"><button class="btn ghost" id="cancelBtn" type="button">Thôi</button><button class="btn primary" id="okBtn" type="button">Lưu</button></div>`);
  $('cancelBtn').onclick = closeModal;
  $('okBtn').onclick = () => { const v = $('nameInput').value.trim(); if (v) { p.name = v; if (window.ZZZ) ZZZ.setKid(p.id, { name: v }); save(); } closeModal(); renderHome(); };
  $('nameInput').focus();
}
/* Tủ thời trang: bé tự chọn tóc, mặt, da, trang phục, mũ, màu xe, giỏ, cờ... có xem trước 3D.
   Kiểu cơ bản miễn phí; vài món đặc biệt (🔒) mua bằng xu. */
const COLORS = {
  skin: [0xffe0bd, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524],
  hair: [0x3e2723, 0x1b1b1b, 0x6d4c41, 0xd7a86e, 0xb71c1c, 0x7e57c2],
  cloth: [0x29b6f6, 0xef5350, 0x66bb6a, 0xffca28, 0xab47bc, 0xff8a65, 0x5c6bc0, 0xf48fb1, 0xffffff, 0x263238],
  helmet: [0xffca28, 0x7e57c2, 0xef5350, 0x29b6f6, 0x66bb6a, 0xff7043, 0xf48fb1, 0xffffff],
  frame: [0xff7043, 0x26a69a, 0x1e88e5, 0xfdd835, 0xec407a, 0x8d6e63, 0x212121, 0xffffff],
  rim: [0xcfd8dc, 0xffd740, 0xff4081, 0x40c4ff, 0x69f0ae, 0x212121]
};
const PREMIUM_COST = 20;
const WARDROBE = {
  avatar: [
    { key: 'hair', label: 'Kiểu tóc', opts: [['ngan', '✂️ Tóc ngắn'], ['dai', '💇 Tóc dài'], ['bim', '🎀 Hai bím'], ['bui', '🥟 Búi tóc']] },
    { key: 'hairColor', label: 'Màu tóc', colors: COLORS.hair },
    { key: 'skin', label: 'Màu da', colors: COLORS.skin },
    { key: 'face', label: 'Gương mặt', opts: [['cuoi', '🙂 Cười'], ['vui', '😄 Vui tươi'], ['nhay', '😉 Nháy mắt'], ['kinh', '🤓 Đeo kính']] },
    { key: 'outfit', label: 'Trang phục', opts: [['ao', '👕 Áo thun + quần'], ['vay', '👗 Váy'], ['hocsinh', '🎒 Đồng phục học sinh'], ['aodai', '👘 Áo dài', true]] },
    { key: 'outfitColor', label: 'Màu áo', colors: COLORS.cloth },
    { key: 'pantsColor', label: 'Màu quần / váy', colors: COLORS.cloth },
    { key: 'helmet', label: 'Mũ bảo hiểm', opts: [['tron', '⛑️ Mũ tròn'], ['meo', '🐱 Mũ tai mèo', true], ['no', '🎀 Mũ có nơ', true]] },
    { key: 'helmetColor', label: 'Màu mũ', colors: COLORS.helmet },
    { key: 'backpack', label: 'Ba lô', opts: [[false, 'Không'], [true, '🎒 Đeo ba lô', true]] }
  ],
  bike: [
    { key: 'frame', label: 'Màu khung xe', colors: COLORS.frame },
    { key: 'rim', label: 'Màu vành bánh', colors: COLORS.rim },
    { key: 'basket', label: 'Giỏ xe', opts: [['tre', '🧺 Giỏ tre'], ['hoa', '💐 Giỏ hoa', true], ['khong', 'Không giỏ']] },
    { key: 'flag', label: 'Cờ sau yên', opts: [[false, 'Không'], [true, '🚩 Có cờ', true]] },
    { key: 'tua', label: 'Tua rua tay lái', opts: [[false, 'Không'], [true, '🎏 Có tua rua', true]] }
  ]
};
let pv = null; // xem trước 3D
function wardrobe(pid) {
  const p = prof(pid); let tab = 'avatar'; let msg = '';
  const hex = (c) => '#' + c.toString(16).padStart(6, '0');
  const light = (c) => ((c >> 16) * .3 + ((c >> 8) & 255) * .59 + (c & 255) * .11) > 170;
  const ownKey = (k, v) => `${k}:${v}`;
  const render = () => {
    const cfg = p[tab];
    openModal(`<div class="head"><div class="avatar" style="background:#1b6fb3">👗</div><div><div class="kicker">Tủ thời trang</div><h2>${esc(p.name)}</h2><div class="muted">Món có 🔒 giá ${PREMIUM_COST} xu · con có 🪙 ${p.coins}</div></div></div>
      <div class="wardrobe"><div class="pv"><canvas id="pv" width="300" height="300" aria-label="Xem trước"></canvas></div>
      <div class="wopts"><div class="views"><button type="button" data-tab="avatar" aria-pressed="${tab === 'avatar'}">🧒 Bé</button><button type="button" data-tab="bike" aria-pressed="${tab === 'bike'}">🚲 Xe đạp</button></div>
      ${WARDROBE[tab].map(row => `<div class="wrow"><b>${row.label}</b><div class="wchoices">${row.colors ? row.colors.map(c => `<button class="swatch" type="button" data-key="${row.key}" data-val="${c}" style="background:${hex(c)};color:${light(c) ? '#333' : '#fff'}" aria-pressed="${cfg[row.key] === c}" aria-label="Màu">${cfg[row.key] === c ? '✓' : ''}</button>`).join('')
        : row.opts.map(([v, label, prem]) => { const owned = !prem || p.owned.includes(ownKey(row.key, v)); return `<button class="wopt" type="button" data-key="${row.key}" data-val="${v}" aria-pressed="${cfg[row.key] === v}">${label}${owned ? '' : ' 🔒'}</button>`; }).join('')}</div></div>`).join('')}
      <div class="fb ${msg.startsWith('Không') ? 'no' : 'ok'}">${msg}</div></div></div>
      <div class="actions"><button class="btn primary" id="okBtn" type="button">Xong</button></div>`);
    dialog.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; msg = ''; render(); });
    dialog.querySelectorAll('[data-key]').forEach(b => b.onclick = () => {
      const k = b.dataset.key; let v = b.dataset.val; if (v === 'true') v = true; else if (v === 'false') v = false; else if (/^\d+$/.test(v)) v = +v;
      const row = WARDROBE[tab].find(r => r.key === k); const opt = row.opts && row.opts.find(o => o[0] === v);
      if (opt && opt[2] && !p.owned.includes(ownKey(k, v))) {
        if (p.coins < PREMIUM_COST) { msg = `Không đủ xu, cần ${PREMIUM_COST} xu. Đi thêm một chuyến nhé!`; Audio.bad(); render(); return; }
        p.coins -= PREMIUM_COST; p.owned.push(ownKey(k, v)); msg = 'Mua được món mới rồi! 🎉'; Audio.coin();
      } else msg = '';
      p[tab][k] = v; save(); render();
    });
    $('okBtn').onclick = () => { stopPreview(); closeModal(); renderHome(); };
    startPreview(p);
  };
  render();
}
function startPreview(p) {
  const c = $('pv'); if (!c) return;
  try {
    if (pv && pv.r.domElement !== c) { cancelAnimationFrame(pv.raf); pv.r.dispose(); pv = null; }
    if (!pv) {
      const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a5a, 1.2)); const sun = new THREE.DirectionalLight(0xfff2d6, 2.2); sun.position.set(3, 6, 4); scene.add(sun);
      const cam = new THREE.PerspectiveCamera(32, 1, .1, 50);
      pv = { r, scene, cam, model: null, raf: 0, t: 0 };
    }
    if (pv.model) pv.scene.remove(pv.model);
    pv.model = makeBike({ bike: p.bike, avatar: p.avatar }); pv.scene.add(pv.model);
    cancelAnimationFrame(pv.raf);
    const loop = () => { pv.raf = requestAnimationFrame(loop); pv.t += .012; pv.model.rotation.y = Math.sin(pv.t) * .9 + .5; pv.model.userData.update(.016, .6, null); pv.cam.position.set(0, 1.9, 4.2); pv.cam.lookAt(0, .95, 0); pv.r.render(pv.scene, pv.cam); };
    loop();
  } catch (e) { /* không có WebGL thì bỏ xem trước */ }
}
function stopPreview() { if (pv) { cancelAnimationFrame(pv.raf); if (pv.model) { pv.scene.remove(pv.model); pv.model = null; } } }
function renderParent() {
  return `<section class="panel stack" id="parentPanel">
    <h2>Góc phụ huynh</h2>
    <p class="muted" style="margin:0">Nhật ký các chuyến đi của từng bé lưu trên máy này. Nội dung lịch sử và giá hàng quán nằm trong file <code>data.js</code>.</p>
    ${state.profiles.map(x => `<h3>${esc(x.name)}</h3>${x.trips.length ? `<div class="scroll"><table class="log"><thead><tr><th>Ngày</th><th>Chuyến</th><th>Sao</th><th>Lỗi giao thông</th><th>Toán</th><th>Câu đố</th><th>Xu</th><th>Phút</th></tr></thead><tbody>
      ${x.trips.slice(-20).reverse().map(t => `<tr><td>${t.date}</td><td>${esc((ROUTES.find(r => r.id === t.route) || {}).name || t.route)}</td><td>${'⭐'.repeat(t.stars)}</td><td>${t.violations}${t.rules && t.rules.length ? ` <span class="muted">(${t.rules.map(r => RULES[r] ? RULES[r].title : r).join(', ')})</span>` : ''}</td><td>${t.math[0]}/${t.math[1]}</td><td>${t.quiz[0]}/${t.quiz[1]}</td><td>${t.coins}</td><td>${Math.round(t.secs / 60)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted" style="margin:0">Chưa có chuyến nào.</p>'}`).join('')}
    <div class="row"><button class="btn small" id="backupBtn" type="button">Tải file sao lưu (JSON)</button><label class="btn small" style="display:inline-block">Mở file sao lưu<input type="file" id="restoreInput" accept="application/json" hidden></label><button class="btn small ghost" id="resetBtn" type="button">Xóa hết dữ liệu</button></div>
  </section>`;
}
function bindParent() {
  $('backupBtn').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' })); a.download = `dap-xe-sai-gon-${todayStr()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  $('restoreInput').onchange = async (ev) => { const f = ev.target.files[0]; if (!f) return; try { const s = JSON.parse(await f.text()); if (s && s.profiles) { state = s; syncZZZ(); save(); renderHome(); } } catch (e) { alert('File không đúng định dạng.'); } };
  $('resetBtn').onclick = () => { if (confirm('Xóa toàn bộ tiến độ, thẻ và nhật ký của cả hai bé? (Ví xu chung không bị xóa.)')) { state = freshState(); syncZZZ(); save(); renderHome(); } };
}

/* ================= hộp thoại ================= */
const modal = $('modal'), dialog = $('dialog');
let modalOpen = false;
function openModal(html) { dialog.innerHTML = html; modal.hidden = false; modalOpen = true; releaseInputs(); return dialog; }
function closeModal() { modal.hidden = true; modalOpen = false; dialog.innerHTML = ''; }
function waitClick(id) { return new Promise(res => { const b = $(id); if (b) b.onclick = () => res(); }); }

function cardHTML(card, extra = '') {
  return `<div class="head"><div class="avatar" style="background:${card.color}">${card.emoji}</div><div><div class="kicker">${card.kind === 'street' ? 'Tên đường kể chuyện' : 'Địa danh'}</div><h2>${esc(card.title)}</h2><div class="muted">${esc(card.who)}</div></div></div>
    <ul class="facts">${card.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <div class="src">Nguồn tham khảo: sách giáo khoa Lịch sử, Wikipedia tiếng Việt. ${extra}</div>`;
}
function showCard(card, { readOnly = false, isNew = false } = {}) {
  return new Promise(res => {
    openModal(cardHTML(card, isNew ? '<b style="color:var(--green)">Thẻ mới vào bộ sưu tập!</b>' : '') + `<div class="actions"><button class="btn primary" id="okBtn" type="button">${readOnly ? 'Đóng' : 'Đã đọc, đạp tiếp 🚲'}</button></div>`);
    $('okBtn').onclick = () => { closeModal(); res(); };
  });
}

/* ================= phiên chơi ================= */
const VMAX = 6.5, ACC = 2.6, COAST = .7, BRAKE = 6.5, LANE_D = [3.9, 1.6];
let renderer, world, bike, canvas = $('cv');
let G = null; // phiên chơi hiện tại
Object.defineProperty(window, '__G', { get: () => G }); Object.defineProperty(window, '__W', { get: () => world }); // để kiểm tra tự động xem được trạng thái và thế giới
const input = { pedal: false, brake: false };
function releaseInputs() { input.pedal = input.brake = false; document.querySelectorAll('.pad.on').forEach(b => b.classList.remove('on')); }

function ensure3D() {
  if (renderer) return true;
  const lite = !!state.lite || /[?&]lite=1/.test(location.search);
  try { renderer = createRenderer(canvas, lite); } catch (e) { alert('Máy này không chạy được đồ họa 3D (WebGL). Thử trình duyệt khác nhé.'); return false; }
  if (!world) { world = new World(); window.addEventListener('resize', resize); requestAnimationFrame(tick); }
  return true;
}
function resize() {
  if (!renderer) return;
  const w = play.clientWidth, h = play.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false);
  world.camera.aspect = w / h; world.camera.fov = w < h ? 72 : 58; world.camera.updateProjectionMatrix();
  $('rotateHint').hidden = !(w < h && w < 600);
}

function prepRoute(route) {
  for (const st of route.streets) {
    st.cardTitle = 'Đ. ' + CARDS[st.card].title.replace(/^Đường /, '');
    for (const ev of st.events) { if (ev.card) ev.cardTitle = 'Đ. ' + CARDS[ev.card].title.replace(/^Đường /, ''); if (ev.shop) ev.shopDef = SHOPS[ev.shop]; if (ev.type === 'school' && ev.card) ev.sign = CARDS[ev.card].sign || CARDS[ev.card].title.toUpperCase(); }
  }
}

async function startTrip(routeId) {
  const route = ROUTES.find(r => r.id === routeId); if (!route || route.soon) return;
  const p = prof(selectedKid);
  if (window.ZZZ) { const st = ZZZ.status(p.id); if (!st.canRide) { showBlocked(p, st); return; } }
  if (!ensure3D()) return;
  Audio.get();
  prepRoute(route);
  home.hidden = true; play.hidden = false; resize();
  const streets = world.buildRoute(route, 7 + ROUTES.indexOf(route));
  if (bike) world.actors.remove(bike);
  bike = makeBike({ bike: p.bike, avatar: p.avatar }); world.actors.add(bike);
  const time = new URLSearchParams(location.search).get('time') || ['morning', 'morning', 'morning', 'sunset', 'dusk'][Math.floor(Math.random() * 5)]; world.setTime(time);
  bike.userData.setHeadlight(time === 'dusk');
  const mission = MISSIONS[p.grade];
  G = {
    p, route, streets, si: 0, s: 0, d: LANE_D[0], lane: 0, v: 0, signal: null, signalT: 0, signaled: null,
    hearts: 3, violations: 0, rules: [], money: mission.money, mission, bought: {}, shopsVisited: {}, coins: 0, math: [0, 0], quiz: [0, 0],
    actors: [], decor: [], laneT: 0, t: 0, startAt: Date.now(), paused: true, finished: false, cardShown: {}, cornerPhase: 0, view: state.view === 'top' ? 'top' : 'chase', time
  };
  spawnDecor();
  updateHUD(true);
  setCtx([]);
  renderFrame(0);
  await showBrief();
  G.paused = false;
}
function currentStreet() { return G.streets[G.si]; }

function showBrief() {
  const m = G.mission;
  const items = m.items.map(it => { const sh = SHOPS[it.shop], g = sh.goods.find(x => x.id === it.good); return `<div>${g.emoji} <b>${it.qty}</b> ${esc(g.name)} <span class="muted">ở ${esc(sh.name)}</span></div>`; }).join('');
  openModal(`<div class="head"><div class="avatar" style="background:#ef6c00">👩</div><div><div class="kicker">Nhiệm vụ hôm nay</div><h2>Mẹ nhờ ${esc(G.p.name)} đi chợ</h2></div></div>
    <div class="mission-list">${items}</div>
    <p style="margin:0">${{ morning: '🌞 Trời sáng đẹp.', sunset: '🌇 Buổi chiều hoàng hôn, đi cẩn thận nhé.', dusk: '🌆 Trời chập tối, đèn đường đã bật, nhớ đi chậm và sát lề.' }[G.time]} Mẹ cho con <b>${moneyFull(m.money)}</b>. Đạp xe từ nhà qua <b>${G.route.streets.map(s => CARDS[s.card].title.replace('Đường ', '')).join(' → ')}</b> tới <b>${esc(G.route.to)}</b>. Tiền thừa con được giữ làm xu nhé!</p>
    <div class="cop"><div class="face">👮</div><div class="say">Nhớ: đi <b>sát lề phải</b>, <b>dừng đèn đỏ</b> trước vạch, <b>nhường người đi bộ</b>, và <b>giơ tay</b> trước khi rẽ. Con có 3 ❤️ an toàn.</div></div>
    <div class="actions"><button class="btn ghost" id="homeBtn" type="button">Về trang chính</button><button class="btn primary" id="okBtn" type="button">Lên xe! 🚲</button></div>`);
  return new Promise(res => { $('okBtn').onclick = () => { closeModal(); res(); }; $('homeBtn').onclick = () => { closeModal(); exitToHome(); }; });
}
function exitToHome() { flushRide(); G = null; play.hidden = true; home.hidden = false; setCtx([]); renderHome(); }
/* Việc hôm nay (bố mẹ đặt ở trang phụ huynh chung): chưa làm đủ toán hoặc hết phút đạp xe thì chưa cho lên xe. */
function showBlocked(p, st) {
  const pl = st.plan, t = st.today, math = st.why === 'math';
  openModal(`<div class="head"><div class="avatar" style="background:#ef6c00">👩</div><div><div class="kicker">Mẹ nhắn</div><h2>${math ? 'Làm toán xong rồi mới đạp xe nha!' : 'Hôm nay đạp xe đủ giờ rồi!'}</h2></div></div>
    <p style="margin:0">${math ? `Việc hôm nay: làm <b>${pl.math} câu</b> trong Vở Ôn Toán. ${esc(p.name)} đã làm <b>${Math.min(t.answers, pl.math)}/${pl.math}</b> câu, còn <b>${pl.math - t.answers}</b> câu nữa thôi. Xong là được +${ZZZ.DAILY_BONUS} xu và lên xe liền!` : `Bố mẹ cho đạp xe <b>${pl.rideMin} phút</b> mỗi ngày, hôm nay đã đủ rồi. Mai đạp tiếp nhé, xe vẫn chờ con 🚲`}</p>
    <div class="actions"><button class="btn ghost" id="okBtn" type="button">Để sau</button>${math ? `<a class="btn primary" href="../toan/${ZZZ.fromHub() ? '?hub=1' : ''}">📘 Đi làm toán</a>` : ''}</div>`);
  $('okBtn').onclick = closeModal;
}
/* Cộng phút chơi hôm nay vào dữ liệu chung (mỗi ~5 giây một lần và khi rời chuyến). */
function flushRide() { if (window.ZZZ && G && G.rideAcc) { ZZZ.logToday(G.p.id, { ride: G.rideAcc }); G.rideAcc = 0; } }

/* ---------- HUD ---------- */
let lastHUD = '';
function updateHUD(force) {
  if (!G) return;
  const st = currentStreet();
  const missionStr = G.mission.items.map(it => { const g = SHOPS[it.shop].goods.find(x => x.id === it.good); const have = G.bought[it.good] || 0; return `<span class="${have >= it.qty ? 'done' : ''}">${g.emoji}${Math.min(have, it.qty)}/${it.qty}</span>`; }).join(' ');
  const key = `${G.hearts}|${G.money}|${missionStr}|${st.def.card}`;
  if (key !== lastHUD || force) {
    lastHUD = key;
    $('hudHearts').textContent = '❤️'.repeat(G.hearts) + '🖤'.repeat(3 - G.hearts);
    $('hudMoney').textContent = `💵 ${money(G.money)}`;
    $('hudMission').querySelector('.mission').innerHTML = missionStr;
    $('hudStreet').textContent = CARDS[st.def.card].title + (G.si < G.streets.length - 1 ? ` → rẽ ${st.def.turn === 'right' ? 'phải' : 'trái'} vào ${st.def.next}` : ` → ${G.route.to}`);
  }
  const prog = Math.max(0, Math.min(1, (G.s - st.s0) / (st.endS - st.s0)));
  $('hudBar').style.width = (prog * 100).toFixed(1) + '%';
  const sp = $('hudSpeed'); sp.textContent = `${Math.round(G.v * 3.6)} km/h`; sp.classList.toggle('hot', !!G.schoolHot);
}
let bannerTimer = 0;
function banner(text, cls = '', ms = 2600) {
  const b = $('banner'); b.textContent = text; b.className = 'banner show ' + cls; clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('show'), ms);
}
let ctxKey = '';
function setCtx(list) {
  const key = list.map(x => x.id).join(',');
  if (key === ctxKey) return; ctxKey = key;
  $('ctx').innerHTML = list.map(x => `<button class="pad ctx ${x.cls || ''}" data-act="${x.id}" type="button"><span class="big">${x.icon}</span>${x.label}</button>`).join('');
}
function praise(text, coins) { G.coins += coins; Audio.coin(); banner(`${text} +${coins} xu`, 'good', 2200); }

/* ---------- vòng lặp ---------- */
let lastT = 0;
function tick(now) {
  requestAnimationFrame(tick);
  const raw = (now - lastT) / 1000 || 0, dt = Math.min(.05, raw); lastT = now;
  if (play.hidden || !G) return;
  // phút chơi hôm nay (tính cả lúc mua bán, đọc thẻ) cho "Việc hôm nay"
  if (window.ZZZ && !G.finished) { G.rideAcc = (G.rideAcc || 0) + Math.min(1, raw); if (G.rideAcc >= 5) flushRide(); }
  if (!G.paused && !modalOpen && !G.finished) update(dt);
  renderFrame(dt);
}
const pose = { pos: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3() };
const camTarget = new THREE.Vector3(), lookTarget = new THREE.Vector3(), tmpV = new THREE.Vector3();
function renderFrame(dt) {
  world.path.pose(G.s, G.d, pose);
  bike.position.copy(pose.pos); tmpV.copy(pose.pos).add(pose.dir); bike.lookAt(tmpV);
  bike.rotateZ(-(G.dLean || 0) * .25); // nghiêng nhẹ khi đổi làn
  const cam = world.camera;
  if (G.view === 'top') {
    camTarget.copy(pose.pos).addScaledVector(pose.dir, 6).add(new THREE.Vector3(0, 48, 0));
    cam.position.lerp(camTarget, 1 - Math.exp(-dt * 4)); cam.up.copy(pose.dir); lookTarget.copy(pose.pos).addScaledVector(pose.dir, 6); cam.lookAt(lookTarget);
  } else {
    camTarget.copy(pose.pos).addScaledVector(pose.dir, -5.6).addScaledVector(pose.right, .4); camTarget.y += 2.5;
    cam.position.lerp(camTarget, 1 - Math.exp(-dt * 5)); cam.up.set(0, 1, 0);
    lookTarget.copy(pose.pos).addScaledVector(pose.dir, 9); lookTarget.y += 1.1; cam.lookAt(lookTarget);
  }
  world.followSun(pose.pos);
  renderer.render(world.scene, cam);
}

function update(dt) {
  G.t += dt;
  // tốc độ
  if (input.pedal) G.v += ACC * dt; else G.v -= COAST * dt;
  if (input.brake) G.v -= BRAKE * dt;
  G.v = Math.max(0, Math.min(VMAX, G.v));
  G.s += G.v * dt;
  // làn
  const target = LANE_D[G.lane];
  const before = G.d; G.d += (target - G.d) * Math.min(1, dt * 3.2); G.dLean = (G.d - before) / Math.max(dt, .001) / 4;
  if (G.signal) { G.signalT -= dt; if (G.signalT <= 0) G.signal = null; }
  bike.userData.update(dt, G.v, G.signal);
  updateActors(dt);
  updateDecor(dt);
  processEvents(dt);
  processCorner();
  laneRule(dt);
  updateHUD();
  if (!G.finished && G.si === G.streets.length - 1 && G.s >= currentStreet().endS - .5) finishTrip();
}

/* ---------- sự kiện trên đường ---------- */
function stopBike() { G.v = 0; releaseInputs(); }
function pushBack(toS) { G.s = Math.min(G.s, toS); stopBike(); }
function violate(ruleId) {
  if (G.finished) return;
  G.hearts--; G.violations++; G.rules.push(ruleId); stopBike(); Audio.bad();
  updateHUD(true);
  const r = RULES[ruleId];
  openModal(`<div class="hearts-big">${'❤️'.repeat(G.hearts)}${'🖤'.repeat(3 - G.hearts)}</div>
    <div class="cop"><div class="face">👮</div><div class="say"><b>${esc(r.title)}.</b> ${esc(r.text)}</div></div>
    <div class="actions"><button class="btn primary" id="okBtn" type="button">Con nhớ rồi</button></div>`);
  $('okBtn').onclick = () => { closeModal(); if (G.hearts <= 0) heartsOut(); };
}
function heartsOut() {
  const st = currentStreet();
  openModal(`<h2>Hết tim rồi! 💔</h2><p style="margin:0">Không sao, mình đạp lại từ đầu <b>${esc(CARDS[st.def.card].title)}</b> nhé. Đồ đã mua vẫn còn trong giỏ.</p>
    <div class="actions"><button class="btn ghost" id="homeBtn" type="button">Về trang chính</button><button class="btn primary" id="okBtn" type="button">Đạp lại 🚲</button></div>`);
  $('homeBtn').onclick = () => { closeModal(); exitToHome(); };
  $('okBtn').onclick = () => { closeModal(); restartStreet(); };
}
function restartStreet() {
  const st = currentStreet();
  G.hearts = 3; G.s = st.s0 + 1; G.v = 0; G.lane = 0; G.d = LANE_D[0]; G.signaled = null; G.cornerPhase = 0; G.laneT = 0;
  for (const e of st.events) { const keep = e.type === 'shop'; const obj = e.obj; const shopDef = e.shopDef, cardTitle = e.cardTitle; const visited = e.visited; for (const k of Object.keys(e)) if (!['x', 'type', 'shop', 'card', 's', 'obj', 'shopDef', 'cardTitle'].includes(k)) delete e[k]; if (keep) e.visited = visited; if (obj && obj.setState) obj.setState('green'); }
  for (const a of G.actors) world.actors.remove(a.obj); G.actors = [];
  updateHUD(true); setCtx([]);
}

function processEvents(dt) {
  const st = currentStreet();
  const ctx = [];
  for (const e of st.events) {
    if (e.done) continue;
    const rel = e.s - G.s; // còn cách bao xa
    switch (e.type) {
      case 'light': {
        if (!e.started && rel < 45) { e.started = true; e.state = 'yellow'; e.obj.setState('yellow'); e.t = 0; e.stopT = 0; e.redT = 0; }
        if (e.started) {
          e.t += dt;
          if (e.state === 'yellow' && e.t > 1.3) { e.state = 'red'; e.obj.setState('red'); }
          if (e.state === 'red') {
            e.redT += dt;
            if (G.v < .15 && rel > 1.2 && rel < 12) e.stopT += dt;
            if (e.stopT > 1.8 || e.redT > 9) { e.state = 'green'; e.obj.setState('green'); if (e.stopT > 1.8 && !e.violated) { e.goodStop = true; praise('Dừng đèn đỏ đúng chỗ! 👍', 5); } }
            else if (rel <= 1.2 && !e.violated) { e.violated = true; violate('redlight'); pushBack(e.s - 4); return; }
          }
        }
        if (rel < -3) { e.done = true; if (e.card && !G.cardShown[e.card]) { G.cardShown[e.card] = true; stopBike(); showStreetCard(CARDS[e.card]); } }
        break;
      }
      case 'zebra': {
        if (!e.started && rel < 42) { e.started = true; e.peds = []; const n = 1 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) { const fromRight = Math.random() < .5; const ped = makePedestrian([0xe53935, 0x1e88e5, 0xfdd835, 0x8e24aa, 0x00897b][Math.floor(Math.random() * 5)], [0x263238, 0x5d4037, 0x1565c0][Math.floor(Math.random() * 3)]); world.actors.add(ped); const a = { obj: ped, kind: 'ped', s: e.s + (i - .5) * .9, d: fromRight ? 6.3 : -6.3, vd: (fromRight ? -1 : 1) * (1.15 + Math.random() * .3), delay: i * .8, zebra: e }; G.actors.push(a); e.peds.push(a); } }
        if (e.started && !e.done) {
          const onRoad = e.peds.some(a => Math.abs(a.d) < 5.3);
          if (onRoad && Math.abs(rel) < 2.2 && !e.violated) { e.violated = true; violate('pedestrian'); pushBack(e.s - 5); return; }
          if (onRoad && G.v < .15 && rel > 1.5 && rel < 12) e.waited = (e.waited || 0) + dt;
          if (rel < -3) { e.done = true; if (e.waited > .8 && !e.violated) praise('Nhường người đi bộ đúng! 👍', 5); }
        }
        break;
      }
      case 'shop': {
        if (e.visited) { e.done = true; break; }
        if (rel < 18 && rel > -4) ctx.push({ id: 'shop', icon: SHOPS[e.shop].emoji, label: 'Vào quán', cls: 'shop' });
        if (rel <= -4) { const need = G.mission.items.some(it => it.shop === e.shop && (G.bought[it.good] || 0) < it.qty); if (need && !e.asked) { e.asked = true; stopBike(); askEnterShop(e); return; } else if (!need) e.done = true; }
        break;
      }
      case 'obstacle': {
        if (!e.warned && rel < 32) { e.warned = true; banner('⚠️ Xe hàng rong đậu lấn đường phía trước, lách trái rồi về lề nhé!', 'warn', 3000); }
        if (Math.abs(G.d - e.obj.d) < 1.25 && rel < 1.6 && rel > -1.6 && !e.violated) { e.violated = true; violate('crash'); pushBack(e.s - 5); return; }
        if (rel < -3) e.done = true;
        break;
      }
      case 'moto': case 'ambulance': {
        if (!e.started && rel < 18) {
          e.started = true;
          const amb = e.type === 'ambulance';
          const obj = amb ? makeAmbulance() : makeMoto([0xe53935, 0x1e88e5, 0x43a047, 0x37474f][Math.floor(Math.random() * 4)]);
          world.actors.add(obj);
          G.actors.push({ obj, kind: e.type, s: G.s - 26, d: amb ? 1.3 : 1.6, vs: amb ? 13 : 14, ev: e });
          if (amb) { Audio.siren(); banner('🚑 Xe cứu thương phía sau! Nép sát lề phải, đi chậm lại.', 'warn', 3200); } else { Audio.honk(); banner('🏍️ Xe máy sắp vượt bên trái, đi sát lề nhé!', 'warn', 2600); }
        }
        break;
      }
      case 'school': {
        const inZone = G.s > e.s && G.s < e.s + 60;
        if (!e.entered && inZone) { e.entered = true; e.hot = 0; banner('🏫 Gần trường học: đi chậm lại nhé!', '', 2600); }
        if (inZone) { G.schoolHot = G.v > VMAX * .55; if (G.schoolHot) { e.hot += dt; if (e.hot > 1.6 && !e.violated) { e.violated = true; violate('speed'); G.v = VMAX * .4; return; } } }
        else { G.schoolHot = false; if (e.entered && G.s >= e.s + 60) { e.done = true; if (!e.violated) praise('Đi chậm qua trường học đúng! 👍', 5); if (e.card && !G.cardShown[e.card]) { G.cardShown[e.card] = true; stopBike(); showStreetCard(CARDS[e.card]); return; } } }
        break;
      }
      case 'bridge': {
        if (!e.entered && rel < 20) { e.entered = true; banner('🌉 Lên cầu Khánh Hội! Nhìn sông Sài Gòn hai bên kìa.', '', 3200); }
        if (rel < -80) e.done = true;
        break;
      }
      case 'landmark': {
        if (rel < -6 && !G.cardShown[e.card]) { G.cardShown[e.card] = true; e.done = true; stopBike(); showStreetCard(CARDS[e.card]); return; }
        break;
      }
    }
  }
  // thẻ tên đường đầu phố
  if (!G.cardShown[st.def.card] && G.s > st.s0 + 10) { G.cardShown[st.def.card] = true; stopBike(); showStreetCard(CARDS[st.def.card]); return; }
  // nút giơ tay khi sắp tới ngã rẽ
  if (st.def.turn && G.s > st.cornerS - 60 && G.s < st.cornerS) { ctx.push({ id: 'signalL', icon: '✋', label: 'Tay trái' }, { id: 'signalR', icon: '🤚', label: 'Tay phải' }); }
  setCtx(ctx);
}
function showStreetCard(card) {
  const isNew = !G.p.cards.includes(card.id);
  if (isNew) { G.p.cards.push(card.id); save(); Audio.ok(); }
  if (!G.tripCards) G.tripCards = []; if (!G.tripCards.includes(card.id)) G.tripCards.push(card.id);
  showCard(card, { isNew });
}
function askEnterShop(e) {
  const sh = SHOPS[e.shop]; const items = G.mission.items.filter(it => it.shop === e.shop).map(it => sh.goods.find(g => g.id === it.good).name).join(', ');
  openModal(`<div class="head"><div class="avatar" style="background:#ef6c00">${sh.emoji}</div><div><div class="kicker">${esc(sh.name)}</div><h2>Ở đây có ${esc(items)} mẹ nhờ mua!</h2></div></div><p style="margin:0">Dừng lại mua nhé?</p>
    <div class="actions"><button class="btn ghost" id="skipBtn" type="button">Đi tiếp</button><button class="btn primary" id="okBtn" type="button">Vào quán 🛒</button></div>`);
  $('skipBtn').onclick = () => { closeModal(); e.done = true; };
  $('okBtn').onclick = () => { closeModal(); shopFlow(e); };
}
function processCorner() {
  const st = currentStreet();
  if (!st.def.turn) return;
  if (G.cornerPhase === 0 && G.s > st.cornerS - 60) { G.cornerPhase = 1; G.signaled = null; banner(`↪️ Sắp rẽ ${st.def.turn === 'right' ? 'PHẢI' : 'TRÁI'} vào đường ${st.def.next}. Giơ tay báo hiệu nhé!`, '', 3200); }
  if (G.cornerPhase === 1 && G.s >= st.cornerS) {
    G.cornerPhase = 2;
    const want = st.def.turn === 'right' ? 'R' : 'L';
    if (G.signaled === want) praise('Giơ tay đúng! 👍', 5);
    else if (G.signaled) { violate('wrongsignal'); } else { violate('signal'); }
  }
  if (G.cornerPhase === 2 && G.s >= st.endS) {
    G.si++; G.cornerPhase = 0; G.signaled = null; G.laneT = 0;
    for (const a of G.actors) world.actors.remove(a.obj); G.actors = [];
    spawnDecor();
    updateHUD(true);
  }
}
function laneRule(dt) {
  const st = currentStreet();
  const nearObstacle = st.events.some(e => e.type === 'obstacle' && G.s > e.s - 30 && G.s < e.s + 6);
  const vehicle = G.actors.some(a => a.kind === 'moto' || a.kind === 'ambulance');
  if (G.lane === 1 && !nearObstacle && !vehicle) {
    G.laneT += dt;
    if (G.laneT > 3 && !G.laneWarned) { G.laneWarned = true; banner('Xe đạp đi sát lề phải nhé! ➡️', 'warn', 2200); }
    if (G.laneT > 7) { G.laneT = 0; G.laneWarned = false; G.lane = 0; violate('lane'); }
  } else { G.laneT = Math.max(0, G.laneT - dt * 2); if (G.laneT === 0) G.laneWarned = false; }
}

/* ---------- xe cộ, người đi bộ động ---------- */
const aPose = { pos: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3() };
function placeActor(a, facingBack = false) {
  world.path.pose(a.s, a.d, aPose);
  a.obj.position.copy(aPose.pos);
  if (a.kind === 'ped') { tmpV.copy(aPose.pos).addScaledVector(aPose.right, a.vd > 0 ? 1 : -1); a.obj.lookAt(tmpV); }
  else { tmpV.copy(aPose.pos).addScaledVector(aPose.dir, facingBack ? -1 : 1); a.obj.lookAt(tmpV); }
}
function updateActors(dt) {
  for (const a of G.actors.slice()) {
    if (a.kind === 'ped') {
      if (a.delay > 0) { a.delay -= dt; } else { a.d += a.vd * dt; }
      a.obj.userData.walk(a.delay > 0 ? 0 : G.t);
      if (Math.abs(a.d) > 7.5) { world.actors.remove(a.obj); G.actors.splice(G.actors.indexOf(a), 1); continue; }
      placeActor(a);
    } else {
      a.s += a.vs * dt;
      if (a.obj.userData.flash) a.obj.userData.flash(G.t);
      const passing = Math.abs(a.s - G.s) < 1.8;
      if (passing && !a.ev.resolved) {
        a.ev.resolved = true;
        if (G.d < 2.9) { violate(a.kind); }
        else if (a.kind === 'ambulance') { if (G.v < VMAX * .6) praise('Nhường xe cứu thương đúng! 👍', 5); }
        else praise('Đi sát lề, an toàn! 👍', 3);
      }
      if (a.s > G.s + 45) { world.actors.remove(a.obj); G.actors.splice(G.actors.indexOf(a), 1); a.ev.done = true; continue; }
      placeActor(a);
    }
  }
}
/* xe ngược chiều và người đi dạo trên lề cho phố có sức sống */
function spawnDecor() {
  for (const a of G.decor) world.actors.remove(a.obj); G.decor = [];
  const st = currentStreet();
  const r = rng(G.si * 97 + 11);
  for (let i = 0; i < 4; i++) { const car = r() < .5; const obj = car ? makeCar(r.pick([0x1e88e5, 0xf9a825, 0xe53935, 0xfafafa, 0x37474f, 0x43a047])) : makeMoto(r.pick([0xe53935, 0x1e88e5, 0x43a047, 0xfdd835])); world.actors.add(obj); G.decor.push({ obj, kind: 'oncoming', s: st.s0 + 40 + i * 70 + r() * 30, d: car ? -2.6 : -4.1, vs: -(6 + r() * 4), st }); }
  for (let i = 0; i < 6; i++) { const obj = makePedestrian(r.pick([0xe53935, 0x1e88e5, 0xfdd835, 0x8e24aa, 0x00897b, 0xffffff]), r.pick([0x263238, 0x5d4037, 0x1565c0])); world.actors.add(obj); G.decor.push({ obj, kind: 'walker', s: st.s0 + 20 + r() * (st.len - 40), d: r() < .5 ? 6.4 : -6.4, vs: (r() < .5 ? 1 : -1) * (.8 + r() * .5), st }); }
}
function updateDecor(dt) {
  for (const a of G.decor) {
    a.s += a.vs * dt;
    if (a.kind === 'oncoming') {
      if (a.s < G.s - 25) { a.s = G.s + 110 + Math.random() * 60; }
      if (a.s > a.st.s0 + a.st.len - 5) { a.s = a.st.s0 + a.st.len - 5; }
      world.path.pose(a.s, a.d, aPose); a.obj.position.copy(aPose.pos); tmpV.copy(aPose.pos).addScaledVector(aPose.dir, -1); a.obj.lookAt(tmpV);
    } else {
      if (a.s < a.st.s0 + 10 || a.s > a.st.s0 + a.st.len - 10) a.vs = -a.vs;
      a.obj.userData.walk(G.t + a.s);
      world.path.pose(a.s, a.d, aPose); a.obj.position.copy(aPose.pos); tmpV.copy(aPose.pos).addScaledVector(aPose.dir, a.vs > 0 ? 1 : -1); a.obj.lookAt(tmpV);
    }
  }
}

/* ---------- mua bán ---------- */
function askNumber({ kicker, title, prompt, answer, unit = 'nghìn', explain }) {
  return new Promise(res => {
    let val = '', tries = 0;
    const render = (fb = '', fbCls = '') => {
      openModal(`<div class="kicker">${esc(kicker || '')}</div><h2>${esc(title)}</h2><div class="ask">${prompt}</div>
        <div class="ans"><span id="ansVal">${val || '…'}</span><small>${esc(unit)}</small></div><div class="fb ${fbCls}" id="fb">${fb}</div>
        <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-k="${n}">${n}</button>`).join('')}<button type="button" data-k="del" class="del">⌫</button><button type="button" data-k="0">0</button><button type="button" data-k="ok" class="ok">Xong</button></div>`);
      dialog.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        if (k === 'del') val = val.slice(0, -1);
        else if (k === 'ok') { if (!val) return; check(); return; }
        else if (val.length < 4) val = (val === '0' ? '' : val) + k;
        $('ansVal').textContent = val || '…';
      });
    };
    const check = () => {
      G.math[1] += tries === 0 ? 1 : 0;
      if (parseInt(val, 10) === answer) {
        if (tries === 0) G.math[0]++;
        Audio.ok(); render(tries === 0 ? '✓ Đúng rồi! +10 xu' : '✓ Đúng rồi!', 'ok'); if (tries === 0) G.coins += 10;
        dialog.querySelectorAll('[data-k]').forEach(b => b.disabled = true);
        setTimeout(() => res(tries === 0), 900);
      } else {
        tries++; Audio.bad();
        if (tries < 2) { val = ''; render('Chưa đúng, con tính lại nhé!', 'no'); }
        else {
          openModal(`<div class="kicker">${esc(kicker || '')}</div><h2>${esc(title)}</h2><div class="ask">${prompt}</div><div class="fb no">Đáp án là <b>${answer} ${esc(unit)}</b>.</div><p style="margin:0">${explain || ''}</p><div class="actions"><button class="btn primary" id="okBtn" type="button">Hiểu rồi</button></div>`);
          $('okBtn').onclick = () => res(false);
        }
      }
    };
    render();
  });
}
function askChoice({ kicker, title, prompt, options, answer, explain }) {
  return new Promise(res => {
    openModal(`<div class="kicker">${esc(kicker || '')}</div><h2>${esc(title)}</h2><div class="ask">${prompt}</div><div class="opts">${options.map((o, i) => `<button class="opt" type="button" data-i="${i}">${o}</button>`).join('')}</div><div class="fb" id="fb"></div><div class="actions" id="next"></div>`);
    dialog.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, ok = i === answer;
      dialog.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.i === answer) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      $('fb').className = 'fb ' + (ok ? 'ok' : 'no'); $('fb').innerHTML = ok ? '✓ Đúng rồi!' : `Chưa đúng. ${explain || ''}`;
      if (ok) Audio.ok(); else Audio.bad();
      $('next').innerHTML = '<button class="btn primary" id="okBtn" type="button">Tiếp</button>'; $('okBtn').onclick = () => res(ok);
    });
  });
}
const NOTES = [{ v: 100, c: '#2e7d32' }, { v: 50, c: '#c2185b' }, { v: 20, c: '#1565c0' }, { v: 10, c: '#b71c1c' }, { v: 5, c: '#6a1b9a' }, { v: 2, c: '#00695c' }, { v: 1, c: '#5d4037' }];
async function shopFlow(e) {
  const sh = SHOPS[e.shop], grade = G.p.grade;
  const pron = sh.seller.split(' ')[0]; const Pron = pron.charAt(0).toUpperCase() + pron.slice(1); // cô / chú / dì
  const price = (g) => g.price[grade];
  const want = {}; for (const it of G.mission.items) if (it.shop === e.shop) want[it.good] = Math.max(0, it.qty - (G.bought[it.good] || 0));
  const qty = {}; for (const g of sh.goods) qty[g.id] = want[g.id] || 0;
  // bước 1: chọn hàng
  let total;
  while (true) {
    await new Promise(res => {
      const render = () => {
        openModal(`<div class="head"><div class="avatar" style="background:#ef6c00">${sh.emoji}</div><div><div class="kicker">${esc(sh.name)}</div><h2>${esc(sh.seller)}: "Chào con, mua gì nào?"</h2></div></div>
          <div class="row" style="justify-content:space-between"><span class="chip amber">💵 Con có ${money(G.money)}</span>${Object.keys(want).length ? `<span class="muted">Mẹ nhờ: ${Object.entries(want).map(([id, q]) => `${sh.goods.find(g => g.id === id).emoji}×${q}`).join(' ')}</span>` : ''}</div>
          <div class="goods">${sh.goods.map(g => `<div class="good ${want[g.id] ? 'want' : ''}"><span class="e">${g.emoji}</span><span class="nm">${esc(g.name)}<br><span class="pr">${moneyFull(price(g))}${g.id === 'cam' || g.id === 'xoai' ? '/kg' : g.id === 'chuoi' ? '/nải' : ''}</span></span><span class="qty"><button type="button" data-m="${g.id}" aria-label="Bớt">−</button><b>${qty[g.id]}</b><button type="button" data-p="${g.id}" aria-label="Thêm">+</button></span></div>`).join('')}</div>
          <div class="actions"><button class="btn ghost" id="skipBtn" type="button">Không mua</button><button class="btn primary" id="okBtn" type="button" ${Object.values(qty).some(q => q > 0) ? '' : 'disabled'}>Tính tiền 🧮</button></div>`);
        dialog.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (qty[b.dataset.p] < 9) qty[b.dataset.p]++; render(); });
        dialog.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { if (qty[b.dataset.m] > 0) qty[b.dataset.m]--; render(); });
        $('skipBtn').onclick = () => { total = -1; res(); };
        $('okBtn').onclick = () => { total = sh.goods.reduce((a, g) => a + qty[g.id] * price(g), 0); res(); };
      };
      render();
    });
    if (total === -1) { closeModal(); e.visited = true; e.done = true; return; }
    if (total > G.money) { openModal(`<h2>Ơ, không đủ tiền rồi!</h2><p style="margin:0">Hàng tính ra <b>${money(total)}</b> mà con chỉ có <b>${money(G.money)}</b>. Bỏ bớt món nhé.</p><div class="actions"><button class="btn primary" id="okBtn" type="button">Chọn lại</button></div>`); await waitClick('okBtn'); continue; }
    break;
  }
  const lines = sh.goods.filter(g => qty[g.id] > 0);
  // lớp 4: so giá khuyến mãi (nếu mua từ 3 món cùng loại)
  const big = lines.find(g => qty[g.id] >= 3);
  if (grade === 'g4' && big && Math.random() < .8) {
    const n = qty[big.id], normal = n * price(big), cheaper = Math.random() < .6; const combo = cheaper ? normal - (2 + Math.floor(Math.random() * 4)) : normal + (2 + Math.floor(Math.random() * 4));
    const ok = await askChoice({ kicker: sh.name, title: `${sh.seller}: "Có khuyến mãi nè!"`, prompt: `Mua lẻ ${n} ${esc(big.name)} giá ${price(big)} nghìn mỗi món, hoặc lấy <b>combo ${n} món giá ${combo} nghìn</b>. Cách nào rẻ hơn?`, options: [`Mua lẻ: ${n} × ${price(big)} nghìn`, `Combo ${n} món: ${combo} nghìn`], answer: cheaper ? 1 : 0, explain: `${n} × ${price(big)} = ${normal} nghìn, so với combo ${combo} nghìn.` });
    G.math[1]++; if (ok) { G.math[0]++; G.coins += 10; }
    if (cheaper) { total = total - normal + combo; }
  }
  // bước 2: tính tổng
  const expr = lines.map(g => qty[g.id] > 1 ? `${qty[g.id]} × ${price(g)}` : `${price(g)}`).join(' + ');
  const prompt = `${lines.map(g => `${g.emoji} ${qty[g.id]} ${esc(g.name)} (${price(g)} nghìn${qty[g.id] > 1 ? ' mỗi món' : ''})`).join('<br>')}<br>Tổng cộng bao nhiêu nghìn?`;
  await askNumber({ kicker: sh.name, title: `${sh.seller}: "Tất cả bao nhiêu tiền con?"`, prompt, answer: total, explain: `${expr} = ${total} nghìn.` });
  // bước 3: trả tiền
  let paid = 0;
  await new Promise(res => {
    const render = () => {
      openModal(`<div class="kicker">${esc(sh.name)}</div><h2>Con đưa tiền cho ${esc(sh.seller)}</h2><div class="ask">Hàng hết <b>${total} nghìn</b>. Bấm các tờ tiền để đưa (ít nhất bằng ${total} nghìn).</div>
        <div class="notes">${NOTES.filter(n => n.v <= G.money).map(n => `<button class="note" type="button" data-n="${n.v}" style="background:${n.c}">${n.v} nghìn</button>`).join('')}</div>
        <div class="ans"><span>${paid}</span><small>nghìn đã đưa</small></div>
        <div class="actions"><button class="btn ghost" id="resetBtn" type="button">Đưa lại</button><button class="btn primary" id="okBtn" type="button" ${paid >= total && paid <= G.money ? '' : 'disabled'}>Đưa tiền</button></div>
        ${paid > G.money ? '<div class="fb no">Con không có nhiều tiền vậy đâu!</div>' : ''}`);
      dialog.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { paid += +b.dataset.n; Audio.coin(); render(); });
      $('resetBtn').onclick = () => { paid = 0; render(); };
      $('okBtn').onclick = () => res();
    };
    render();
  });
  const change = paid - total;
  if (change > 0) {
    await askNumber({ kicker: sh.name, title: `${sh.seller}: "${Pron} thối lại bao nhiêu nhỉ?"`, prompt: `Con đưa <b>${paid} nghìn</b>, hàng hết <b>${total} nghìn</b>. ${esc(Pron)} phải thối lại bao nhiêu nghìn?`, answer: change, explain: `${paid} − ${total} = ${change} nghìn.` });
  } else {
    openModal(`<h2>Vừa đủ, không cần thối! 👌</h2><div class="actions"><button class="btn primary" id="okBtn" type="button">Tiếp</button></div>`); await waitClick('okBtn');
  }
  // xong
  G.money -= total;
  for (const g of lines) { G.bought[g.id] = (G.bought[g.id] || 0) + qty[g.id]; for (let i = 0; i < Math.min(qty[g.id], 2); i++) { const sp = makeItemSprite(g.emoji); sp.position.set((Math.random() - .5) * .22, .12 + bike.userData.basket.children.length * .01, (Math.random() - .5) * .14); bike.userData.basket.add(sp); } }
  e.visited = true; e.done = true;
  Audio.fanfare();
  openModal(`<div class="head"><div class="avatar" style="background:#ef6c00">${sh.emoji}</div><div><div class="kicker">${esc(sh.name)}</div><h2>${esc(sh.seller)}: "Cảm ơn con, đi cẩn thận nhé!"</h2></div></div>
    <div class="basket">${lines.map(g => g.emoji.repeat(qty[g.id])).join(' ')}</div>
    <p style="margin:0">Còn lại <b>${moneyFull(G.money)}</b>.</p><div class="actions"><button class="btn primary" id="okBtn" type="button">Đạp tiếp 🚲</button></div>`);
  await waitClick('okBtn'); closeModal(); updateHUD(true);
}

/* ---------- về đích ---------- */
async function finishTrip() {
  flushRide(); G.finished = true; stopBike(); setCtx([]); updateHUD(true);
  Audio.fanfare(); banner(`🎉 Tới ${G.route.to} rồi!`, 'good', 3000); confetti();
  await sleep(1400);
  const goal = CARDS[G.route.goalCard];
  const isNew = !G.p.cards.includes(goal.id); if (isNew) G.p.cards.push(goal.id);
  if (!G.p.stamps.includes(goal.id)) G.p.stamps.push(goal.id);
  // đủ con dấu của mọi tuyến -> Nhà thám hiểm Sài Gòn (một lần, +50 xu ở tổng kết)
  const explorerNew = !G.p.explorer && ROUTES.every(r => r.soon || G.p.stamps.includes(r.goalCard)); if (explorerNew) G.p.explorer = true;
  save();
  await showCard(goal, { isNew });
  // kiểm nhiệm vụ
  const missing = G.mission.items.filter(it => (G.bought[it.good] || 0) < it.qty);
  const complete = missing.length === 0; if (complete) G.coins += 20;
  openModal(`<div class="head"><div class="avatar" style="background:#ef6c00">👩</div><div><div class="kicker">Mẹ gọi điện</div><h2>${complete ? 'Giỏi quá, mua đủ hết rồi! +20 xu' : 'Con mua được gì rồi?'}</h2></div></div>
    <div class="mission-list">${G.mission.items.map(it => { const g = SHOPS[it.shop].goods.find(x => x.id === it.good); const have = G.bought[it.good] || 0; return `<div class="${have >= it.qty ? 'done' : ''}">${g.emoji} ${esc(g.name)}: ${Math.min(have, it.qty)}/${it.qty}${have >= it.qty ? ' ✓' : ''}</div>`; }).join('')}</div>
    ${complete ? '' : '<p style="margin:0">Còn thiếu vài món, lần sau nhớ ghé mua nhé. Không sao!</p>'}
    <p style="margin:0">Tiền còn lại <b>${moneyFull(G.money)}</b> con được giữ làm xu.</p>
    <div class="actions"><button class="btn primary" id="okBtn" type="button">Tiếp</button></div>`);
  await waitClick('okBtn');
  // giúp bán hàng (người giúp tùy tuyến, xem helper trong data.js)
  const hp = G.route.helper, hpTitle = hp.who.split(' ')[0], hpLow = hpTitle.toLowerCase();
  openModal(`<div class="head"><div class="avatar" style="background:${hp.bg}">${hp.emoji}</div><div><div class="kicker">${esc(hp.where)}</div><h2>${esc(hp.who)}: "${esc(hp.ask)}"</h2></div></div><p style="margin:0">Khách đông quá, con tính tiền giúp ${esc(hpLow)} 2 lượt, mỗi lượt đúng được 10 xu.</p>
    <div class="actions"><button class="btn ghost" id="skipBtn" type="button">Thôi, con mệt rồi</button><button class="btn primary" id="okBtn" type="button">Giúp ${esc(hpLow)}! 💪</button></div>`);
  const help = await new Promise(res => { $('okBtn').onclick = () => res(true); $('skipBtn').onclick = () => res(false); });
  if (help) await sellFlow();
  // câu đố
  const hist = shuffle((G.tripCards || []).flatMap(id => CARDS[id].quiz.map(q => ({ ...q, card: id })))).slice(0, 2);
  const traf = shuffle(TRAFFIC_QUIZ).slice(0, 2);
  const qs = shuffle([...hist, ...traf]);
  openModal(`<h2>Đố vui cuối chuyến 🧠</h2><p style="margin:0">${qs.length} câu về những gì con vừa đi qua. Mỗi câu đúng được 5 xu.</p><div class="actions"><button class="btn primary" id="okBtn" type="button">Bắt đầu</button></div>`); await waitClick('okBtn');
  for (const q of qs) {
    const order = shuffle(q.o.map((o, i) => i));
    const opts = order.map(i => q.o[i]); const ans = order.indexOf(q.a);
    const ok = await askChoice({ kicker: q.card ? CARDS[q.card].title : 'Luật giao thông', title: q.q, prompt: q.sign ? `<div class="signbox"><img alt="Biển báo" width="120" height="120" src="${drawSignCanvas(q.sign, 240).toDataURL()}"></div>` : '', options: opts.map(esc), answer: ans, explain: `Đáp án đúng: ${esc(q.o[q.a])}.` });
    G.quiz[1]++; if (ok) { G.quiz[0]++; G.coins += 5; }
  }
  // tổng kết
  const stars = G.violations === 0 ? 3 : G.violations <= 2 ? 2 : 1;
  const coins = G.coins + G.money + (explorerNew ? 50 : 0);
  const secs = Math.round((Date.now() - G.startAt) / 1000);
  const p = G.p;
  p.coins += coins; p.stars[G.route.id] = Math.max(p.stars[G.route.id] || 0, stars);
  const gotLicense = stars === 3 && !p.license; if (gotLicense) p.license = true;
  p.trips.push({ date: todayStr(), route: G.route.id, stars, violations: G.violations, rules: G.rules, math: G.math, quiz: G.quiz, coins, secs });
  save();
  // album sticker chung (zzz.js): chuyến 3 sao được 1 sticker mỗi ngày; cuối tuần ví nhận gấp đôi
  const stk = (window.ZZZ && stars === 3) ? ZZZ.earnSticker(p.id, 'bike') : null, boost = !!(window.ZZZ && ZZZ.weekendBoost());
  confetti();
  openModal(`<div class="stars-big">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2 style="text-align:center">${stars === 3 ? 'Tuyệt vời! Đi đúng luật suốt chuyến!' : stars === 2 ? 'Giỏi lắm! Chỉ vài lỗi nhỏ.' : 'Về tới đích rồi! Lần sau cẩn thận hơn nhé.'}</h2>
    <div class="result"><div class="cell"><b>${G.violations}</b><span>lỗi giao thông</span></div><div class="cell"><b>${G.math[0]}/${G.math[1]}</b><span>bài toán đúng</span></div><div class="cell"><b>${G.quiz[0]}/${G.quiz[1]}</b><span>câu đố đúng</span></div><div class="cell"><b>🪙 ${boost ? coins * 2 : coins}</b><span>xu nhận được${boost ? ' (×2 cuối tuần)' : ''}</span></div></div>
    ${gotLicense ? '<div class="cop"><div class="face">🪪</div><div class="say"><b>Bằng lái xe đạp!</b> Con đã đi đúng luật suốt chuyến, chú công an tặng con bằng lái xe đạp nè.</div></div>' : ''}
    ${explorerNew ? '<div class="cop"><div class="face">🏅</div><div class="say"><b>Nhà thám hiểm Sài Gòn!</b> Con đã đạp xe tới đủ 5 nơi trên bản đồ con dấu. Thưởng thêm 50 xu!</div></div>' : ''}
    ${stk ? `<div class="cop"><div class="face">${stk.em}</div><div class="say"><b>Sticker mới: ${esc(stk.name)}!</b> Chuyến đi 3 sao được một sticker vào album cả nhà (xem ở trang chủ zzzlearning).</div></div>` : ''}
    <p class="muted" style="margin:0;text-align:center">Thẻ đã sưu tập: ${(G.tripCards || []).concat(G.route.goalCard).map(id => CARDS[id].emoji).join(' ')} · ${Math.round(secs / 60)} phút</p>
    <div class="actions"><button class="btn ghost" id="againBtn" type="button">Đạp lại</button><button class="btn primary" id="okBtn" type="button">Về trang chính</button></div>`);
  $('okBtn').onclick = () => { closeModal(); exitToHome(); };
  $('againBtn').onclick = () => { closeModal(); const rid = G.route.id; exitToHome(); startTrip(rid); };
}
async function sellFlow() {
  const hp = G.route.helper, gr = G.p.grade, g2 = gr === 'g2';
  const [i0, i1] = hp.items, m = hp.multi, unit = m.unit || 'kg';
  const a = g2 ? i0.price[gr] : m.price, b = i1.price[gr], n = g2 ? 1 : m.n;
  const total = g2 ? a + b : a * n + b;
  const whoL = hp.who.replace(/^\S+/, w => w.toLowerCase()), kicker = `Giúp ${whoL} ${hp.job}`;
  await askNumber({ kicker, title: 'Khách thứ nhất', prompt: g2 ? `Khách mua ${i0.emoji} ${esc(i0.label)} <b>${a} nghìn</b> và ${i1.emoji} ${esc(i1.label)} <b>${b} nghìn</b>. Tổng bao nhiêu nghìn?` : `Khách mua ${m.emoji} ${n} ${esc(m.label)} giá <b>${a} nghìn</b>/${esc(unit)} và ${i1.emoji} ${esc(i1.label)} <b>${b} nghìn</b>. Tổng bao nhiêu nghìn?`, answer: total, explain: g2 ? `${a} + ${b} = ${total} nghìn.` : `${n} × ${a} + ${b} = ${total} nghìn.` });
  const paid = total < 50 ? 50 : total < 100 ? 100 : 200;
  await askNumber({ kicker, title: 'Khách thứ hai', prompt: `Khách mua hết <b>${total} nghìn</b> và đưa tờ <b>${paid} nghìn</b>. ${esc(hp.who.split(' ')[0])} thối lại bao nhiêu nghìn?`, answer: paid - total, explain: `${paid} − ${total} = ${paid - total} nghìn.` });
  openModal(`<h2>${esc(hp.who)}: "Cảm ơn con nhiều lắm!" ${hp.emoji}</h2><div class="actions"><button class="btn primary" id="okBtn" type="button">Tiếp</button></div>`); await waitClick('okBtn');
}

/* ---------- pháo giấy ---------- */
function confetti() {
  const c = $('confetti'), g = c.getContext('2d'); c.hidden = false; c.width = innerWidth; c.height = innerHeight;
  const ps = Array.from({ length: 120 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, r: 4 + Math.random() * 5, col: ['#ff7043', '#29b6f6', '#ffca28', '#66bb6a', '#ab47bc'][Math.floor(Math.random() * 5)], a: Math.random() * 6 }));
  let t = 0; const step = () => { t++; g.clearRect(0, 0, c.width, c.height); for (const p of ps) { p.x += p.vx; p.y += p.vy; p.a += .1; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.col; g.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .6); g.restore(); } if (t < 170) requestAnimationFrame(step); else c.hidden = true; };
  step();
}

/* ================= điều khiển ================= */
function act(id, down) {
  if (!G) return;
  if (id === 'pedal' || id === 'brake') { input[id] = down; Audio.get(); return; }
  if (!down) return;
  if (id === 'laneIn') G.lane = 0;
  else if (id === 'laneOut') G.lane = 1;
  else if (id === 'bell') Audio.bell();
  else if (id === 'signalL' || id === 'signalR') { G.signal = id === 'signalL' ? 'L' : 'R'; G.signalT = 2.2; G.signaled = G.signal; banner(G.signal === 'L' ? '✋ Giơ tay trái: rẽ trái' : '🤚 Giơ tay phải: rẽ phải', '', 1200); }
  else if (id === 'shop') { const e = currentStreet().events.find(x => x.type === 'shop' && !x.visited && x.s - G.s < 18 && x.s - G.s > -4); if (e) { stopBike(); shopFlow(e); } }
  else if (id === 'view') { G.view = G.view === 'top' ? 'chase' : 'top'; state.view = G.view; save(); }
}
document.querySelectorAll('.ctl').forEach(ctl => {
  ctl.addEventListener('pointerdown', (ev) => { const b = ev.target.closest('.pad'); if (!b) return; ev.preventDefault(); b.classList.add('on'); b.setPointerCapture?.(ev.pointerId); act(b.dataset.act, true); });
  const up = (ev) => { const b = ev.target.closest('.pad'); if (!b) return; b.classList.remove('on'); if (b.dataset.act === 'pedal' || b.dataset.act === 'brake') act(b.dataset.act, false); };
  ctl.addEventListener('pointerup', up); ctl.addEventListener('pointercancel', up); ctl.addEventListener('lostpointercapture', up);
  ctl.addEventListener('contextmenu', ev => ev.preventDefault());
});
$('pauseBtn').onclick = () => {
  if (!G || modalOpen) return; stopBike();
  openModal(`<h2>Tạm dừng ⏸</h2><div class="actions"><button class="btn ghost" id="homeBtn" type="button">Về trang chính</button><button class="btn primary" id="okBtn" type="button">Chơi tiếp</button></div>`);
  $('okBtn').onclick = closeModal; $('homeBtn').onclick = () => { if (confirm('Bỏ chuyến này? Tiến độ chuyến sẽ mất.')) { closeModal(); exitToHome(); } };
};
const viewBtn = document.createElement('button'); viewBtn.className = 'iconbtn'; viewBtn.type = 'button'; viewBtn.textContent = '🗺️'; viewBtn.setAttribute('aria-label', 'Đổi góc nhìn'); viewBtn.onclick = () => act('view', true);
$('pauseBtn').before(viewBtn);
const KEYS = { ArrowRight: 'pedal', ArrowLeft: 'brake', ArrowUp: 'laneIn', ArrowDown: 'laneOut', a: 'signalL', d: 'signalR', b: 'bell', e: 'shop', v: 'view' };
window.addEventListener('keydown', (ev) => { if (!G || modalOpen || play.hidden) return; const k = KEYS[ev.key] || KEYS[ev.key.toLowerCase?.()]; if (!k) return; ev.preventDefault(); if (ev.repeat && k !== 'pedal' && k !== 'brake') return; act(k, true); });
window.addEventListener('keyup', (ev) => { const k = KEYS[ev.key] || KEYS[ev.key.toLowerCase?.()]; if (k === 'pedal' || k === 'brake') act(k, false); });
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseInputs(); });

/* ================= khởi động ================= */
renderHome();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) { window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { })); }
