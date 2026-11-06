/* zzz.js: dữ liệu dùng chung của zzzlearning cho cả trang chủ và 2 app con (Vở Ôn Toán, Đạp Xe Sài Gòn).
   Tất cả nằm trong localStorage của cùng tên miền:
   - zzz-wallet  : ví xu chung { k2: n, k4: n }. Lần đầu tạo bằng cách cộng xu đang có của 2 app.
   - zzz-kids    : tên bé dùng chung [{ id, name, grade }]. App đổi tên thì ghi vào đây, app khác mở lên sẽ lấy tên mới.
   - zzz-rewards : phiếu thưởng ngoài đời { items: [{ id, title, cost, em }], redeemed: [{ id, title, em, cost, ts, done, doneTs, pid }] }.
   - zzz-hub     : (sessionStorage) "1" khi app con được mở từ trang chủ, để nút Phụ huynh dẫn ra trang chung.
   File này là script thường (không module) để cả 2 app nạp được. */
(function () {
  const K = { wallet: 'zzz-wallet', kids: 'zzz-kids', rewards: 'zzz-rewards' };
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
        Object.defineProperty(p, 'coins', { get: () => ZZZ.coins(p.id), set: (v) => ZZZ.setCoins(p.id, v), enumerable: true, configurable: true });
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
    /* ---- mở từ trang chủ? ---- */
    noteHub() { try { if (new URLSearchParams(location.search).get('hub') === '1') sessionStorage.setItem('zzz-hub', '1'); } catch (e) { } },
    fromHub() { try { return sessionStorage.getItem('zzz-hub') === '1'; } catch (e) { return false; } }
  };
  window.ZZZ = ZZZ;
})();
