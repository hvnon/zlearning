/* zzz.js: dữ liệu dùng chung của zzzlearning cho cả trang chủ và 2 app con (Vở Ôn Toán, Shipper Nhí Sài Gòn).
   Tất cả nằm trong localStorage của cùng tên miền:
   - zzz-wallet  : ví xu chung { k2: n, k4: n }. Lần đầu tạo bằng cách cộng xu đang có của 2 app.
   - zzz-kids    : tên bé dùng chung [{ id, name, grade }]. App đổi tên thì ghi vào đây, app khác mở lên sẽ lấy tên mới.
   - zzz-rewards : phiếu thưởng ngoài đời { items: [{ id, title, cost, em }], redeemed: [{ id, title, em, cost, ts, done, doneTs, pid }] }.
   - zzz-hub     : (sessionStorage) "1" khi app con được mở từ trang chủ, để nút Phụ huynh dẫn ra trang chung.
   - zzz-pin     : { h } mã 4 số của bố mẹ (đã băm) khóa trang phụ huynh; mở khóa nhớ trong sessionStorage zzz-pin-ok.
   - zzz-plan    : việc hôm nay bố mẹ đặt { [pid]: { math, mathFirst, rideMin } } (0 = không đặt).
   - zzz-today   : tiến độ hôm nay { day, kids: { [pid]: { answers, ok, secs, ride, bonus, stk: { math, bike } } }, hist: { [day]: kids } } (giữ 35 ngày).
   - zzz-family  : hũ cả nhà { goal: { title, em, target, since } | null, jar, contrib: { [pid]: n }, history: [...] }.
   - zzz-gifts   : bé tặng xu cho nhau [{ from, to, n, ts }] (giữ 50 lần gần nhất).
   - zzz-stickers: album sticker chung { [pid]: [id] }; danh mục STICKERS ở dưới.
   - zzz-settings: { weekendX2 } cuối tuần (T7, CN) xu kiếm trong app nhân đôi (mặc định bật).
   Ngoài ra ZZZ.weakSkills(pid) đọc (không ghi) thẻ FSRS trong vo-on-toan-v1 để game xe biết bé hay quên kỹ năng nào.
   File này là script thường (không module) để cả 2 app nạp được. */
(function () {
  const K = { wallet: 'zzz-wallet', kids: 'zzz-kids', rewards: 'zzz-rewards', pin: 'zzz-pin', plan: 'zzz-plan', today: 'zzz-today', family: 'zzz-family', gifts: 'zzz-gifts', stickers: 'zzz-stickers', settings: 'zzz-settings' };
  const APP_KEYS = { toan: 'vo-on-toan-v1', saigon: 'dap-xe-sai-gon-v1' };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const readApp = (k) => { const s = load(k, null); return s && Array.isArray(s.profiles) ? s : null; };

  function wallet() {
    let w = load(K.wallet, null);
    if (!w || typeof w !== 'object') {
      // lần đầu: gộp xu của 2 app lại
      w = {};
      for (const key of Object.values(APP_KEYS)) { const s = readApp(key); if (s) for (const p of s.profiles) w[p.id] = (w[p.id] || 0) + (Math.round(+p.coins) || 0); }
      store(K.wallet, w);
    }
    return w;
  }

  const ZZZ = {
    KEYS: K, APP_KEYS,
    /* ---- ví xu ---- */
    coins(pid) { return Math.max(0, Math.round(+wallet()[pid]) || 0); },
    setCoins(pid, n) { const w = wallet(); w[pid] = Math.max(0, Math.round(+n) || 0); store(K.wallet, w); },
    addCoins(pid, n) { this.setCoins(pid, this.coins(pid) + (Math.round(+n) || 0)); },
    /* Gắn p.coins của app vào ví chung: đọc/ghi p.coins là đọc/ghi ví. Gọi lại sau mỗi lần thay state (khôi phục file, xóa dữ liệu). */
    bindCoins(profiles) {
      const w = wallet(); let changed = false;
      for (const p of profiles || []) {
        const d = Object.getOwnPropertyDescriptor(p, 'coins');
        if (d && d.get) continue;
        if (!(p.id in w)) { w[p.id] = Math.max(0, Math.round(+p.coins) || 0); changed = true; }
        // xu app cộng thêm (v > hiện có) vào cuối tuần thì nhân đôi; trừ xu, tặng xu, bố mẹ cho xu thì không
        Object.defineProperty(p, 'coins', { get: () => ZZZ.coins(p.id), set: (v) => { const cur = ZZZ.coins(p.id), d = (Math.round(+v) || 0) - cur; ZZZ.setCoins(p.id, d > 0 && ZZZ.weekendBoost() ? cur + d * 2 : v); }, enumerable: true, configurable: true });
      }
      if (changed) store(K.wallet, w);
    },
    /* ---- tên bé ---- */
    kids() { return load(K.kids, []); },
    /* App gọi khi mở: chưa có danh sách chung thì tạo từ app; có rồi thì lấy tên chung cho app. */
    syncKids(profiles) {
      let kids = load(K.kids, null);
      if (!Array.isArray(kids) || !kids.length) { store(K.kids, (profiles || []).map(p => ({ id: p.id, name: p.name, grade: p.grade }))); return; }
      for (const p of profiles || []) { const k = kids.find(x => x.id === p.id); if (k && k.name) p.name = k.name; }
    },
    setKid(id, patch) {
      const kids = load(K.kids, []); let k = kids.find(x => x.id === id);
      if (!k) { k = { id }; kids.push(k); }
      Object.assign(k, patch); store(K.kids, kids);
      // ghi luôn vào 2 app để app nào mở trước cũng đúng tên
      for (const key of Object.values(APP_KEYS)) { const s = readApp(key); if (!s) continue; const p = s.profiles.find(x => x.id === id); if (p && patch.name) { p.name = patch.name; store(key, s); } }
    },
    /* ---- phiếu thưởng ---- */
    rewards() {
      let r = load(K.rewards, null);
      if (!r || !Array.isArray(r.items)) {
        // lần đầu: lấy phần thưởng và phiếu đã đổi từ Vở Ôn Toán (trước đây nằm trong app đó)
        const s = readApp(APP_KEYS.toan);
        r = { items: (s && Array.isArray(s.rewards)) ? s.rewards : [], redeemed: s ? s.profiles.flatMap(p => (p.redeemed || []).map(x => ({ ...x, pid: p.id }))) : [] };
        store(K.rewards, r);
      }
      r.redeemed = r.redeemed || [];
      return r;
    },
    saveRewards(r) { store(K.rewards, r); },
    addReward(title, cost, em) { const r = this.rewards(); const it = { id: 'r' + Date.now(), title: String(title).trim(), cost: Math.max(1, Math.round(+cost) || 1), em: (em || '').trim() }; r.items.push(it); this.saveRewards(r); return it; },
    removeReward(id) { const r = this.rewards(); r.items = r.items.filter(x => x.id !== id); this.saveRewards(r); },
    /* Bé đổi phiếu: trừ xu, thêm phiếu chờ bố mẹ. Trả về phiếu, hoặc null nếu không đủ xu. */
    redeem(pid, rewardId) {
      const r = this.rewards(); const it = r.items.find(x => x.id === rewardId);
      if (!it || this.coins(pid) < it.cost) return null;
      this.addCoins(pid, -it.cost);
      const t = { id: it.id, title: it.title, em: it.em, cost: it.cost, ts: Date.now(), done: false, pid };
      r.redeemed.push(t); this.saveRewards(r); return t;
    },
    pending(pid) { return this.rewards().redeemed.filter(x => !x.done && (!pid || x.pid === pid)); },
    markDone(ts, pid) { const r = this.rewards(); const x = r.redeemed.find(y => y.ts === ts && y.pid === pid); if (x) { x.done = true; x.doneTs = Date.now(); this.saveRewards(r); } return x; },
    /* ---- mã của bố mẹ (khóa trang phụ huynh) ---- */
    hashPin(s) { let h = 2166136261; const t = 'zzz:' + String(s); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); },
    hasPin() { const p = load(K.pin, null); return !!(p && p.h); },
    /* pin null/rỗng = xóa mã. Đặt xong coi như đã mở khóa phiên này. */
    setPin(pin) { if (pin == null || pin === '') { try { localStorage.removeItem(K.pin); } catch (e) { } } else store(K.pin, { h: this.hashPin(pin) }); try { sessionStorage.setItem('zzz-pin-ok', '1'); } catch (e) { } },
    checkPin(pin) { const p = load(K.pin, null); const ok = !!p && p.h === this.hashPin(pin); if (ok) { try { sessionStorage.setItem('zzz-pin-ok', '1'); } catch (e) { } } return ok; },
    pinOk() { if (!this.hasPin()) return true; try { return sessionStorage.getItem('zzz-pin-ok') === '1'; } catch (e) { return false; } },
    /* Hỏi mã trước khi vào trang phụ huynh (bàn phím số tự vẽ, dùng được trong cả 3 trang). Không có mã thì vào thẳng. */
    gate(onOk, onCancel) {
      if (this.pinOk()) { onOk(); return; }
      const old = document.getElementById('zzzGate'); if (old) old.remove();
      const theme = document.documentElement.getAttribute('data-theme');
      const dark = theme === 'dark' || (theme !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
      const c = dark ? { bg: '#1f1c36', fg: '#ece9f8', mut: '#a29dc0', ink: '#b9a6ff', key: '#2b2550', bad: '#ff7a6e' } : { bg: '#ffffff', fg: '#25213a', mut: '#6b6784', ink: '#4a2f91', key: '#ece6fa', bad: '#d2382f' };
      const el = document.createElement('div'); el.id = 'zzzGate';
      el.setAttribute('style', 'position:fixed;inset:0;z-index:9999;background:rgba(10,20,30,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Be Vietnam Pro",system-ui,sans-serif');
      el.innerHTML = `<div role="dialog" aria-modal="true" aria-label="Mã của bố mẹ" style="background:${c.bg};color:${c.fg};border-radius:22px;padding:22px;width:min(320px,100%);box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center">
        <div style="font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:22px;color:${c.ink}">🔒 Mã của bố mẹ</div>
        <div id="zzzGateMsg" style="min-height:1.5em;font-size:14px;color:${c.mut};margin:4px 0 10px">Nhập 4 số để vào trang phụ huynh</div>
        <div id="zzzGateDots" style="display:flex;justify-content:center;gap:12px;margin-bottom:14px"></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'x', 0, '<'].map(k => k === 'x' ? '<span></span>' : `<button type="button" data-k="${k}" aria-label="${k === '<' ? 'Xóa' : k}" style="border:0;border-radius:14px;background:${c.key};color:${c.fg};font-family:'Baloo 2',system-ui,sans-serif;font-weight:700;font-size:24px;height:56px;cursor:pointer">${k === '<' ? '⌫' : k}</button>`).join('')}</div>
        <button type="button" id="zzzGateCancel" style="margin-top:14px;border:0;background:none;color:${c.mut};font-family:inherit;font-weight:600;font-size:15px;cursor:pointer;padding:6px 12px">Thôi</button></div>`;
      document.body.appendChild(el);
      let buf = '';
      const dots = () => { el.querySelector('#zzzGateDots').innerHTML = [0, 1, 2, 3].map(i => `<span style="width:16px;height:16px;border-radius:50%;border:2px solid ${c.ink};background:${i < buf.length ? c.ink : 'transparent'}"></span>`).join(''); };
      const close = () => { el.remove(); document.removeEventListener('keydown', onKey); };
      const press = (k) => {
        if (k === '<') { buf = buf.slice(0, -1); dots(); return; }
        if (buf.length >= 4) return; buf += k; dots();
        if (buf.length === 4) {
          if (ZZZ.checkPin(buf)) { close(); onOk(); }
          else { const m = el.querySelector('#zzzGateMsg'); m.textContent = 'Sai mã rồi, thử lại nhé.'; m.style.color = c.bad; setTimeout(() => { buf = ''; dots(); }, 350); }
        }
      };
      const onKey = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('<'); else if (e.key === 'Escape') { close(); if (onCancel) onCancel(); } };
      el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => press(b.dataset.k));
      el.querySelector('#zzzGateCancel').onclick = () => { close(); if (onCancel) onCancel(); };
      el.addEventListener('click', (e) => { if (e.target === el) { close(); if (onCancel) onCancel(); } });
      document.addEventListener('keydown', onKey);
      dots();
    },
    /* ---- việc hôm nay: mục tiêu mỗi ngày bố mẹ đặt ---- */
    DAILY_BONUS: 5,
    dayKey(d) { const x = d == null ? new Date() : new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; },
    plans() { const p = load(K.plan, {}); return p && typeof p === 'object' && !Array.isArray(p) ? p : {}; },
    /* Kế hoạch của bé, hoặc null nếu bố mẹ chưa đặt gì (math 0 và rideMin 0). */
    plan(pid) { const p = this.plans()[pid]; return p && (p.math > 0 || p.rideMin > 0) ? p : null; },
    setPlan(pid, patch) { const ps = this.plans(); ps[pid] = { math: 0, mathFirst: true, rideMin: 0, ...(ps[pid] || {}), ...patch }; store(K.plan, ps); },
    todayData() {
      const day = this.dayKey(); let t = load(K.today, null);
      if (!t || typeof t !== 'object') t = { day, kids: {}, hist: {} };
      t.kids = t.kids || {}; t.hist = t.hist || {};
      if (t.day !== day) { // sang ngày mới: cất hôm qua vào lịch sử, giữ 35 ngày
        if (t.day && Object.keys(t.kids).length) t.hist[t.day] = t.kids;
        t.day = day; t.kids = {};
        t.hist = Object.fromEntries(Object.keys(t.hist).sort().slice(-35).map(k => [k, t.hist[k]]));
        store(K.today, t);
      }
      return t;
    },
    today(pid) { return { answers: 0, ok: 0, secs: 0, ride: 0, bonus: false, stk: {}, ...(this.todayData().kids[pid] || {}) }; },
    /* App gọi mỗi câu trả lời (answers/ok/secs) hay mỗi vài giây chơi game xe (ride, giây).
       Lần đầu trong ngày đạt mục tiêu toán thì cộng DAILY_BONUS xu; trả về true đúng lúc đó. */
    logToday(pid, add) {
      const t = this.todayData(); const k = t.kids[pid] = { answers: 0, ok: 0, secs: 0, ride: 0, bonus: false, ...(t.kids[pid] || {}) };
      for (const f of ['answers', 'ok', 'secs', 'ride']) if (add && add[f]) k[f] = Math.round((k[f] + (+add[f] || 0)) * 10) / 10;
      let just = false; const pl = this.plan(pid);
      if (pl && pl.math > 0 && k.answers >= pl.math && !k.bonus) { k.bonus = true; just = true; this.addCoins(pid, this.DAILY_BONUS); }
      store(K.today, t);
      if (just) this.earnSticker(pid, 'math');
      return just;
    },
    /* Hôm nay bé còn được đạp xe không: why = 'math' (chưa làm đủ toán) | 'time' (hết phút) | null. */
    status(pid) {
      const pl = this.plan(pid), t = this.today(pid);
      const mathDone = !pl || !(pl.math > 0) || t.answers >= pl.math;
      const rideLeft = pl && pl.rideMin > 0 ? Math.max(0, pl.rideMin * 60 - t.ride) : Infinity;
      const why = pl && pl.math > 0 && pl.mathFirst !== false && !mathDone ? 'math' : rideLeft <= 0 ? 'time' : null;
      return { plan: pl, today: t, mathDone, rideLeft, canRide: !why, why };
    },
    /* Lịch sử theo ngày (cho báo cáo tuần), gồm cả hôm nay: { [day]: { [pid]: {...} } } */
    history() { const t = this.todayData(); return { ...t.hist, [t.day]: t.kids }; },
    /* ---- cài đặt chung ---- */
    settings() { const o = load(K.settings, {}); return o && typeof o === 'object' ? o : {}; },
    setSetting(k, v) { const o = this.settings(); o[k] = v; store(K.settings, o); },
    /* Cuối tuần (T7, CN) xu kiếm trong app nhân đôi, bố mẹ tắt được. */
    weekendBoost() { const d = new Date().getDay(); return this.settings().weekendX2 !== false && (d === 0 || d === 6); },
    /* ---- hũ cả nhà: cả hai bé góp xu cho một mục tiêu chung ---- */
    family() { const f = load(K.family, null); const o = f && typeof f === 'object' ? f : {}; return { goal: o.goal || null, jar: Math.max(0, Math.round(+o.jar) || 0), contrib: o.contrib || {}, history: Array.isArray(o.history) ? o.history : [] }; },
    saveFamily(f) { store(K.family, f); },
    setGoal(title, em, target) { const f = this.family(); f.goal = { title: String(title).trim(), em: (em || '🎉').trim(), target: Math.max(1, Math.round(+target) || 1), since: Date.now() }; this.saveFamily(f); return f.goal; },
    clearGoal() { const f = this.family(); f.goal = null; this.saveFamily(f); },
    /* Bé góp xu từ ví vào hũ. Trả về false nếu không đủ xu hoặc chưa có mục tiêu. */
    contribute(pid, n) {
      n = Math.round(+n) || 0; const f = this.family();
      if (!f.goal || n <= 0 || this.coins(pid) < n) return false;
      this.addCoins(pid, -n); f.jar += n; f.contrib[pid] = (f.contrib[pid] || 0) + n; this.saveFamily(f); return true;
    },
    goalReached() { const f = this.family(); return !!(f.goal && f.jar >= f.goal.target); },
    /* Bố mẹ bấm "Đã thực hiện": cất vào lịch sử, xu dư giữ lại trong hũ. */
    completeGoal() {
      const f = this.family(); if (!f.goal) return null;
      const done = { ...f.goal, doneTs: Date.now(), contrib: { ...f.contrib } };
      f.history.unshift(done); f.history = f.history.slice(0, 20); f.jar = Math.max(0, f.jar - f.goal.target); f.goal = null; f.contrib = {};
      this.saveFamily(f); return done;
    },
    /* ---- tặng xu cho nhau ---- */
    gifts() { const g = load(K.gifts, []); return Array.isArray(g) ? g : []; },
    gift(from, to, n) {
      n = Math.round(+n) || 0; if (!from || !to || from === to || n <= 0 || this.coins(from) < n) return false;
      this.addCoins(from, -n); this.addCoins(to, n);
      const g = this.gifts(); g.unshift({ from, to, n, ts: Date.now() }); store(K.gifts, g.slice(0, 50)); return true;
    },
    /* ---- album sticker chung ---- */
    STICKERS: [
      ['cun', '🐶', 'Cún con', 'pet'], ['meo', '🐱', 'Mèo mun', 'pet'], ['tho', '🐰', 'Thỏ trắng', 'pet'], ['cao', '🦊', 'Cáo con', 'pet'], ['gautruc', '🐼', 'Gấu trúc', 'pet'], ['koala', '🐨', 'Koala', 'pet'], ['sutu', '🦁', 'Sư tử con', 'pet'], ['canhcut', '🐧', 'Cánh cụt', 'pet'],
      ['xedap', '🚲', 'Xe đạp', 'sg'], ['xemay', '🛵', 'Xe máy', 'sg'], ['banhmi', '🥖', 'Bánh mì', 'sg'], ['caphe', '☕', 'Cà phê sữa', 'sg'], ['pho', '🍜', 'Phở', 'sg'], ['cay', '🌳', 'Cây dầu', 'sg'], ['nhatho', '⛪', 'Nhà thờ Đức Bà', 'sg'], ['buudien', '🏛️', 'Bưu điện', 'sg'],
      ['tenlua', '🚀', 'Tên lửa', 'space'], ['saotho', '🪐', 'Sao Thổ', 'space'], ['trang', '🌙', 'Mặt trăng', 'space'], ['sao', '⭐', 'Ngôi sao', 'space'], ['phihanh', '👩‍🚀', 'Phi hành gia', 'space'], ['diabay', '🛸', 'Đĩa bay', 'space'], ['saochoi', '☄️', 'Sao chổi', 'space'], ['traidat', '🌍', 'Trái đất', 'space']
    ].map(([id, em, name, page]) => ({ id, em, name, page })),
    STICKER_PAGES: [['pet', '🐾 Thú cưng'], ['sg', '🏙️ Sài Gòn'], ['space', '🚀 Vũ trụ']],
    sticker(id) { return this.STICKERS.find(s => s.id === id) || null; },
    stickers(pid) { const o = load(K.stickers, {}); const a = o && o[pid]; return Array.isArray(a) ? a : []; },
    /* Mỗi nguồn ('math' xong việc hôm nay, 'bike' chuyến 3 sao) tối đa 1 sticker/ngày; chọn ngẫu nhiên trong số chưa có. Trả về sticker hoặc null. */
    earnSticker(pid, source) {
      const t = this.todayData(); const k = t.kids[pid] = { answers: 0, ok: 0, secs: 0, ride: 0, bonus: false, ...(t.kids[pid] || {}) }; k.stk = k.stk || {};
      if (k.stk[source]) return null;
      const have = this.stickers(pid), left = this.STICKERS.filter(s => !have.includes(s.id));
      if (!left.length) return null;
      const st = left[Math.floor(Math.random() * left.length)];
      const o = load(K.stickers, {}) || {}; o[pid] = [...have, st.id]; store(K.stickers, o);
      k.stk[source] = st.id; store(K.today, t); return st;
    },
    /* ---- mở từ trang chủ? ---- */
    noteHub() { try { if (new URLSearchParams(location.search).get('hub') === '1') sessionStorage.setItem('zzz-hub', '1'); } catch (e) { } },
    fromHub() { try { return sessionStorage.getItem('zzz-hub') === '1'; } catch (e) { return false; } },
    /* ---- kỹ năng toán bé hay quên (đọc thẻ FSRS của Vở Ôn Toán, không ghi gì) ----
       Trả về tối đa n kỹ năng đã học, yếu nhất trước: [{ id, r, lapses, overdue }], r = xác suất còn nhớ (0..1).
       Yếu = còn nhớ dưới 85%, hoặc đã quên từ 2 lần, hoặc quá hạn ôn. Game xe dùng để đố thêm một câu ở tiệm. */
    weakSkills(pid, n = 3) {
      const s = readApp(APP_KEYS.toan); const p = s && s.profiles.find(x => x.id === pid);
      if (!p || !p.skills || typeof p.skills !== 'object') return [];
      const now = Date.now(), day = Math.floor((now - new Date().getTimezoneOffset() * 60000) / 86400000), out = [];
      for (const [id, c] of Object.entries(p.skills)) {
        if (!c || !(c.s > 0)) continue;
        const t = Math.max(0, (now - (c.last || now)) / 86400000), r = Math.pow(1 + 19 / 81 * t / c.s, -0.5);
        out.push({ id, r, lapses: c.lapses || 0, overdue: typeof c.due === 'number' ? day - c.due : 0 });
      }
      return out.filter(k => k.r < .85 || k.lapses >= 2 || k.overdue > 0).sort((a, b) => a.r - b.r || b.lapses - a.lapses).slice(0, n);
    }
  };
  window.ZZZ = ZZZ;
})();
