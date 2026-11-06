/* sync.js: đồng bộ dữ liệu của zzzlearning giữa nhiều máy trong một gia đình, qua Firestore (Firebase, gói miễn phí).
   Nạp ngay sau zzz.js ở cả 4 trang. Tắt thì không làm gì (không gọi mạng).

   Cách làm (không cần đăng nhập, không cần SDK, chỉ gọi REST bằng fetch):
   - Mỗi gia đình có một mã 16 ký tự (bố mẹ tạo ở trang Phụ huynh, nhập cùng mã trên mỗi máy). Mã là chìa khóa: ai có mã mới đọc/ghi được.
   - Mỗi máy chỉ ghi tài liệu của riêng mình: families/{mã}/devices/{máy} (toàn bộ dữ liệu của máy) và families/{mã}/ev/{máy}_{tháng}
     (nhật ký từng câu trả lời của Vở Ôn Toán do máy đó tạo). Không bao giờ có hai máy ghi đè lên nhau.
   - Mỗi máy đọc tài liệu của các máy khác rồi tự gộp vào dữ liệu của mình:
     * số đếm (ví xu, số câu/giây/phút hôm nay, xu trong hũ cả nhà): mỗi máy giữ phần cộng/trừ do chính nó làm ("own"),
       số hiển thị = tổng phần của mọi máy. Hai máy cùng cộng xu lúc mất mạng thì vẫn đủ, không đè nhau.
     * phần đổi cả cụm (tên bé, việc hôm nay, mã bố mẹ, cài đặt, danh sách phần thưởng, mục tiêu hũ, hồ sơ từng bé trong mỗi app):
       lấy bản sửa sau cùng (mỗi phần có giờ sửa riêng, ghi lại khi app lưu).
     * phần chỉ thêm vào (phiếu đã đổi, quà tặng xu, sticker, thẻ/con dấu/chuyến xe, đồ đã mua, sao): gộp hết, không mất món nào.
     * thẻ FSRS của từng kỹ năng toán: lấy thẻ có lần ôn mới nhất.
   - Mở app / quay lại app / có mạng lại / mỗi 90 giây: kéo về và gộp. App lưu gì thì vài giây sau đẩy lên.
   - Đang làm bài (Vở Ôn Toán) hay đang đạp xe (Shipper Nhí) thì chưa thay dữ liệu của app, đợi xong lượt.
   localStorage riêng của phần này: zzz-sync (mã gia đình, mã máy, tên máy, trạng thái), zzz-sync-own, zzz-sync-mt, zzz-sync-ev, zzz-sync-prejoin. */
(function () {
  /* Điền project của Firebase ở đây (Project settings > General). Để trống thì bố mẹ nhập ở trang Phụ huynh. */
  const FIREBASE = { projectId: '', apiKey: '' };

  const ls = window.localStorage; if (!ls) return;
  const K = { s: 'zzz-sync', own: 'zzz-sync-own', mt: 'zzz-sync-mt', ev: 'zzz-sync-ev', pre: 'zzz-sync-prejoin' };
  const rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem;
  const rd = (k) => { try { return JSON.parse(ls.getItem(k)); } catch (e) { return null; } };
  const wr = (k, v) => { try { if (v == null) rawRemove.call(ls, k); else rawSet.call(ls, k, JSON.stringify(v)); } catch (e) { } };
  const st = () => { const s = rd(K.s); return s && typeof s === 'object' ? s : {}; };
  const setSt = (patch) => wr(K.s, { ...st(), ...patch });
  const isOn = () => { const s = st(); return !!(s.on && s.fam && s.dev && cfg().projectId); };
  const cfg = () => { const s = st(); return { projectId: FIREBASE.projectId || s.projectId || '', apiKey: FIREBASE.apiKey || s.apiKey || '', base: s.base || '' }; };
  const obj = (v) => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const arr = (v) => Array.isArray(v) ? v : [];
  const r1 = (n) => Math.round(n * 10) / 10;
  /* chuỗi JSON có khóa sắp xếp, để so hai bản có thật sự khác nhau không */
  const canon = (v) => JSON.stringify(v, function (k, x) { return x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x; });
  const clone = (v) => v == null ? v : JSON.parse(JSON.stringify(v));
  const noCoins = (p) => { if (!p) return p; const q = { ...p }; delete q.coins; return q; };

  /* ---------- cách gộp từng khóa ----------
     counter(v) -> { path: số } phần đếm; zero: true nghĩa là path biến mất = về 0 (ngược lại: bỏ qua, ví dụ ngày cũ bị dọn)
     parts(v)   -> { phần: giá trị } phần lấy bản sửa sau cùng
     merge(list, M) -> giá trị mới; list[0] là máy này, list[i] = { dev, v, mt }; M = tổng số đếm */
  const winner = (list, part) => {
    let best = null;
    for (const b of list) {
      const t = (b.mt && b.mt[part]) || 0, has = b.v != null ? 1 : 0;
      if (!best || t > best.t || (t === best.t && (has > best.has || (has === best.has && b.dev > best.b.dev)))) best = { b, t, has };
    }
    return best ? best.b : list[0];
  };
  const lww = { parts: (v) => ({ _: v }), merge: (list) => clone(winner(list, '_').v) };
  const fromM = (M, pre) => { const o = {}; for (const p in M) if (p.startsWith(pre)) o[p.slice(pre.length)] = M[p]; return o; };
  const TODAY_F = ['answers', 'ok', 'secs', 'ride'];
  const todayDays = (v) => { const t = obj(v); return { ...obj(t.hist), ...(t.day ? { [t.day]: obj(t.kids) } : {}) }; };

  const SPEC = {
    'zzz-wallet': {
      counter: (v) => { const o = {}; for (const [p, n] of Object.entries(obj(v))) if (typeof n === 'number') o[p] = n; return o; }, zero: true,
      merge: (list, M) => { const o = {}; for (const [p, n] of Object.entries(M)) o[p] = Math.max(0, Math.round(n)); return o; }
    },
    'zzz-kids': lww, 'zzz-plan': lww, 'zzz-pin': lww, 'zzz-settings': lww,
    'zzz-rewards': {
      parts: (v) => ({ items: v ? v.items : null }),
      merge: (list) => {
        const w = winner(list, 'items'), red = new Map();
        for (const b of list) for (const x of arr(b.v && b.v.redeemed)) {
          const key = `${x.pid}|${x.ts}`, o = red.get(key);
          if (!o) red.set(key, clone(x)); else if (x.done) { o.done = true; o.doneTs = Math.max(o.doneTs || 0, x.doneTs || 0) || x.doneTs; }
        }
        if (!w.v && !red.size) return null;
        return { items: clone(arr(w.v && w.v.items)), redeemed: [...red.values()].sort((a, b) => a.ts - b.ts) };
      }
    },
    'zzz-gifts': {
      merge: (list) => {
        const m = new Map(); for (const b of list) for (const g of arr(b.v)) m.set(`${g.from}|${g.to}|${g.n}|${g.ts}`, g);
        return m.size ? [...m.values()].sort((a, b) => b.ts - a.ts).slice(0, 50) : null;
      }
    },
    'zzz-stickers': {
      merge: (list) => {
        const o = {}; for (const b of list) for (const [pid, a] of Object.entries(obj(b.v))) { const cur = o[pid] || (o[pid] = []); for (const id of arr(a)) if (!cur.includes(id)) cur.push(id); }
        return Object.keys(o).length ? o : null;
      }
    },
    'zzz-today': {
      counter: (v) => { const o = {}; for (const [day, kids] of Object.entries(todayDays(v))) for (const [pid, k] of Object.entries(obj(kids))) for (const f of TODAY_F) if (typeof obj(k)[f] === 'number') o[`${day}|${pid}|${f}`] = k[f]; return o; },
      merge: (list, M) => {
        const days = {};
        const kid = (d, p) => ((days[d] || (days[d] = {}))[p] || (days[d][p] = { answers: 0, ok: 0, secs: 0, ride: 0, bonus: false, stk: {} }));
        for (const [path, n] of Object.entries(M)) { const [d, p, f] = path.split('|'); kid(d, p)[f] = Math.max(0, r1(n)); }
        for (const b of list) for (const [d, ks] of Object.entries(todayDays(b.v))) for (const [p, k] of Object.entries(obj(ks))) {
          const x = kid(d, p); if (k.bonus) x.bonus = true;
          for (const [src, id] of Object.entries(obj(k.stk))) if (id && !x.stk[src]) x.stk[src] = id;
        }
        const today = window.ZZZ ? ZZZ.dayKey() : Object.keys(days).sort().pop();
        const hist = {}; for (const d of Object.keys(days).filter(d => d < today).sort().slice(-35)) hist[d] = days[d];
        return { day: today, kids: days[today] || {}, hist };
      }
    },
    'zzz-family': {
      counter: (v) => { const f = obj(v), o = {}; if (typeof f.jar === 'number') o.jar = f.jar; for (const [p, n] of Object.entries(obj(f.contrib))) if (typeof n === 'number') o['c|' + p] = n; return o; }, zero: true,
      parts: (v) => ({ goal: v ? { goal: v.goal || null, history: v.history || [] } : null }),
      merge: (list, M) => {
        const w = winner(list, 'goal'); if (!w.v && !Object.keys(M).length) return null;
        const contrib = {}; for (const [p, n] of Object.entries(fromM(M, 'c|'))) if (Math.round(n) > 0) contrib[p] = Math.round(n);
        return { goal: clone((w.v && w.v.goal) || null), jar: Math.max(0, Math.round(M.jar || 0)), contrib, history: clone(arr(w.v && w.v.history)) };
      }
    }
  };
  /* hồ sơ trong app: lấy hồ sơ sửa sau cùng của từng bé, rồi gộp những phần chỉ thêm vào */
  function appSpec(mergeProfile) {
    return {
      app: true,
      parts: (v) => { const o = {}; if (!v || !Array.isArray(v.profiles)) return o; const top = { ...v }; delete top.profiles; o._ = top; for (const p of v.profiles) o['p:' + p.id] = noCoins(p); return o; },
      merge: (list) => {
        const has = list.filter(b => b.v && Array.isArray(b.v.profiles)); if (!has.length) return list[0].v;
        const top = clone(winner(has, '_').v); const out = { ...top }; delete out.profiles;
        const ids = []; for (const b of has) for (const p of b.v.profiles) if (!ids.includes(p.id)) ids.push(p.id);
        out.profiles = ids.map(id => {
          const own = has.filter(b => b.v.profiles.some(p => p.id === id));
          const w = winner(own, 'p:' + id), base = clone(w.v.profiles.find(p => p.id === id));
          mergeProfile(base, own.map(b => b.v.profiles.find(p => p.id === id)));
          return base;
        });
        return out;
      }
    };
  }
  const unionArr = (all, f) => { const out = []; for (const p of all) for (const x of arr(p[f])) if (!out.includes(x)) out.push(x); return out; };
  SPEC['vo-on-toan-v1'] = appSpec((base, all) => {
    const skills = {};
    for (const p of all) for (const [id, c] of Object.entries(obj(p.skills))) { const o = skills[id]; if (!o || (c.last || 0) > (o.last || 0) || ((c.last || 0) === (o.last || 0) && (c.reps || 0) > (o.reps || 0))) skills[id] = clone(c); }
    base.skills = skills;
  });
  SPEC['dap-xe-sai-gon-v1'] = appSpec((base, all) => {
    for (const f of ['cards', 'stamps', 'owned']) base[f] = unionArr(all, f);
    const stars = {}; for (const p of all) for (const [r, n] of Object.entries(obj(p.stars))) stars[r] = Math.max(stars[r] || 0, +n || 0); base.stars = stars;
    const seen = new Set(), trips = []; for (const p of [base, ...all]) for (const t of arr(p.trips)) { const k = canon(t); if (!seen.has(k)) { seen.add(k); trips.push(t); } }
    base.trips = trips;
  });
  const KEYS = Object.keys(SPEC);

  /* ---------- ghi nhận mỗi lần app lưu: phần đếm cộng vào "own", phần sửa cả cụm ghi giờ sửa ---------- */
  function track(k, oldStr, newStr) {
    const sp = SPEC[k]; let o = null, n = null;
    try { o = JSON.parse(oldStr); } catch (e) { } try { n = JSON.parse(newStr); } catch (e) { }
    if (sp.counter) {
      const fo = sp.counter(o), fn = sp.counter(n), own = obj(rd(K.own)), mine = obj(own[k]); let ch = false;
      const paths = new Set([...Object.keys(fn), ...(sp.zero ? Object.keys(fo) : [])]);
      for (const p of paths) { const d = (fn[p] || 0) - (fo[p] || 0); if (Math.abs(d) > 1e-9) { mine[p] = r1((mine[p] || 0) + d); ch = true; } }
      if (ch) { own[k] = mine; wr(K.own, own); }
    }
    if (sp.parts) {
      const po = sp.parts(o), pn = sp.parts(n), mt = obj(rd(K.mt)), m = obj(mt[k]), now = Date.now(); let ch = false;
      for (const p of new Set([...Object.keys(po), ...Object.keys(pn)])) if (canon(po[p]) !== canon(pn[p])) { m[p] = now; ch = true; }
      if (ch) { mt[k] = m; wr(K.mt, mt); }
    }
    dirty = true; schedulePush();
  }
  Storage.prototype.setItem = function (k, v) {
    if (this === ls && SPEC[k] && isOn()) { const old = ls.getItem(k); const r = rawSet.call(this, k, v); if (old !== String(v)) try { track(k, old, String(v)); } catch (e) { } return r; }
    return rawSet.call(this, k, v);
  };
  Storage.prototype.removeItem = function (k) {
    if (this === ls && SPEC[k] && isOn()) { const old = ls.getItem(k); const r = rawRemove.call(this, k); if (old != null) try { track(k, old, null); } catch (e) { } return r; }
    return rawRemove.call(this, k);
  };

  /* lúc tạo gia đình: những gì đang có trên máy này là phần của máy này */
  function stampAll() {
    const own = {}, mt = {}, now = Date.now();
    for (const k of KEYS) {
      const sp = SPEC[k], v = rd(k);
      if (sp.counter) own[k] = sp.counter(v);
      if (sp.parts) { const m = {}; for (const p of Object.keys(sp.parts(v))) m[p] = now; mt[k] = m; }
    }
    wr(K.own, own); wr(K.mt, mt);
  }

  /* ---------- Firestore REST ---------- */
  function url(path, params) {
    const c = cfg(), base = c.base || `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(c.projectId)}/databases/(default)/documents`;
    const q = [c.apiKey ? 'key=' + encodeURIComponent(c.apiKey) : '', params || ''].filter(Boolean).join('&');
    return `${base}/${path}${q ? '?' + q : ''}`;
  }
  async function api(method, path, body, params) {
    const r = await fetch(url(path, params), { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    if (r.status === 404) return null;
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return r.json();
  }
  const docData = (d) => { try { return JSON.parse(d.fields.d.stringValue); } catch (e) { return null; } };
  async function listDevices(fam) {
    const out = []; let token = '';
    do {
      const res = await api('GET', `families/${fam}/devices`, null, 'pageSize=100' + (token ? '&pageToken=' + encodeURIComponent(token) : ''));
      for (const d of (res && res.documents) || []) { const x = docData(d); if (x && x.dev) out.push(x); }
      token = res && res.nextPageToken;
    } while (token);
    return out;
  }
  const putDoc = (path, data) => api('PATCH', path, { fields: { d: { stringValue: JSON.stringify(data) }, ts: { integerValue: String(Date.now()) } } });

  /* ---------- nhật ký Vở Ôn Toán (IndexedDB vo-on-toan) ---------- */
  let idb = null;
  function openDB() {
    return idb || (idb = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('no-idb'));
      const r = indexedDB.open('vo-on-toan', 1);
      r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('events')) { const ev = d.createObjectStore('events', { keyPath: 'id', autoIncrement: true }); ev.createIndex('pid', 'pid'); } if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('blocked'));
    }).catch(e => { idb = null; throw e; }));
  }
  async function allEvents() { try { const d = await openDB(); return await new Promise((res, rej) => { const q = d.transaction('events', 'readonly').objectStore('events').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error); }); } catch (e) { return null; } }
  async function addEvents(evs) { if (!evs.length) return; const d = await openDB(); await new Promise((res, rej) => { const t = d.transaction('events', 'readwrite'), s = t.objectStore('events'); for (const e of evs) s.add(e); t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); }
  const evKey = (e) => `${e.pid}|${e.ts}|${e.t}|${e.sid || ''}`;
  const ym = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const MAX_DOC = 700000;
  /* nhật ký do máy này tạo, chia theo tháng (tháng nào dài quá thì chia thêm phần) -> { docId: [events] } */
  function ownEventDocs(evs, dev) {
    const byM = {}; for (const e of evs) if (!e.dev) (byM[ym(e.ts)] || (byM[ym(e.ts)] = [])).push(e);
    const out = {};
    for (const [m, list] of Object.entries(byM)) {
      list.sort((a, b) => a.ts - b.ts); let part = [], size = 0, i = 0;
      const flush = () => { if (part.length) out[`${dev}_${m}_${i++}`] = part; part = []; size = 0; };
      for (const e of list) { const x = { ...e }; delete x.id; const s = JSON.stringify(x).length + 1; if (size + s > MAX_DOC) flush(); part.push(x); size += s; }
      flush();
    }
    return out;
  }

  /* ---------- gộp ---------- */
  let hooks = [];
  const appBusy = () => hooks.some(h => { try { return h.busy && h.busy(); } catch (e) { return false; } });
  function bundle() { const vals = {}; for (const k of KEYS) vals[k] = rd(k); return { dev: st().dev, own: obj(rd(K.own)), mt: obj(rd(K.mt)), vals }; }
  /* gộp dữ liệu các máy vào máy này. includeLocal=false khi vào gia đình: bỏ dữ liệu cũ của máy này. Trả về các khóa đã đổi. */
  function mergeIn(peers, includeLocal) {
    const local = bundle(), all = includeLocal ? [local, ...peers] : peers, changed = [], mt = local.mt, busy = appBusy();
    for (const k of KEYS) {
      const sp = SPEC[k]; if (sp.app && busy) continue;
      const list = all.map(b => ({ dev: b.dev, v: b.vals ? b.vals[k] : null, mt: obj(b.mt && b.mt[k]) }));
      if (!list.length) continue;
      let M = {};
      if (sp.counter) for (const b of [local, ...peers.filter(x => x.dev !== local.dev)]) for (const [p, n] of Object.entries(obj(b.own && b.own[k]))) M[p] = (M[p] || 0) + (+n || 0);
      let v = sp.merge(list, M);
      if (v === undefined) v = null;
      if (sp.parts) { const m = {}; for (const p of new Set(list.flatMap(b => Object.keys(b.mt)))) { const w = winner(list, p); if (w.mt[p]) m[p] = w.mt[p]; } mt[k] = m; }
      if (canon(v) !== canon(local.vals[k])) { wr(k, v); changed.push(k); }
    }
    wr(K.mt, mt);
    return changed;
  }
  async function pullEvents(peers) {
    const seen = obj(rd(K.ev)).seen || {}; const want = [];
    for (const p of peers) for (const [id, n] of Object.entries(obj(p.evm))) if (seen[id] !== n) want.push([id, n, p.dev]);
    if (!want.length) return 0;
    const evs = await allEvents(); if (!evs) return 0;
    const have = new Set(evs.map(evKey)); let added = 0;
    for (const [id, n, dev] of want) {
      const d = await api('GET', `families/${st().fam}/ev/${id}`); const list = d ? arr(docData(d)) : [];
      const add = []; for (const e of list) { const key = evKey(e); if (!have.has(key)) { have.add(key); const x = { ...e, dev }; delete x.id; add.push(x); } }
      await addEvents(add); added += add.length; seen[id] = n;
      const ev = obj(rd(K.ev)); ev.seen = seen; wr(K.ev, ev);
    }
    return added;
  }
  async function pushEvents() {
    const s = st(), evs = await allEvents(); if (!evs) return obj(obj(rd(K.ev)).sent);
    const docs = ownEventDocs(evs, s.dev), ev = obj(rd(K.ev)), sent = obj(ev.sent), evm = {};
    for (const [id, list] of Object.entries(docs)) { evm[id] = list.length; if (sent[id] !== list.length) { await putDoc(`families/${s.fam}/ev/${id}`, list); sent[id] = list.length; ev.sent = sent; wr(K.ev, ev); } }
    return evm;
  }
  async function pushDevice() {
    const s = st(), b = bundle();
    const evm = await pushEvents();
    await putDoc(`families/${s.fam}/devices/${s.dev}`, { v: 1, dev: s.dev, name: s.name || s.dev, ts: Date.now(), ua: navigator.userAgent.slice(0, 120), own: b.own, mt: b.mt, vals: b.vals, evm });
    dirty = false;
  }

  /* ---------- lịch đồng bộ ---------- */
  let dirty = false, running = null, pushTimer = 0, lastPush = 0, again = false;
  function schedulePush() {
    if (!isOn() || pushTimer) return;
    const wait = Math.max(6000, 15000 - (Date.now() - lastPush));
    pushTimer = setTimeout(() => { pushTimer = 0; syncNow({ quiet: true }); }, wait);
  }
  function emit(detail) { try { window.dispatchEvent(new CustomEvent('zzz-sync', { detail })); } catch (e) { } }
  async function run() {
    const s = st(); setSt({ busy: true }); emit({ status: 'run' });
    try {
      const docs = await listDevices(s.fam);
      const peers = docs.filter(d => d.dev !== s.dev);
      const changed = mergeIn(peers, true);
      const added = await pullEvents(peers);
      const me = docs.find(d => d.dev === s.dev);
      if (dirty || changed.length || !me) { await pushDevice(); lastPush = Date.now(); }
      const list = docs.filter(d => d.dev !== s.dev).map(d => ({ dev: d.dev, name: d.name, ts: d.ts }));
      list.unshift({ dev: s.dev, name: st().name, ts: lastPush || (me && me.ts) || 0 });
      setSt({ busy: false, last: Date.now(), err: '', peers: list });
      if (changed.some(k => SPEC[k].app) || added) for (const h of hooks) { try { if (h.reload) h.reload(changed, added); } catch (e) { } }
      emit({ status: 'ok', changed, added });
      return { ok: true, changed, added };
    } catch (e) {
      const msg = !navigator.onLine ? 'offline' : e && e.status === 403 ? 'denied' : e && e.status ? 'http' + e.status : 'network';
      setSt({ busy: false, err: msg, errTs: Date.now() }); emit({ status: 'err', err: msg });
      return { ok: false, err: msg };
    }
  }
  function syncNow() {
    if (!isOn()) return Promise.resolve({ ok: false, err: 'off' });
    if (running) { again = true; return running; }
    running = run().finally(() => { running = null; if (again) { again = false; setTimeout(syncNow, 500); } });
    return running;
  }

  /* ---------- tạo / vào / rời gia đình ---------- */
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const rand = (n) => { const a = new Uint32Array(n); crypto.getRandomValues(a); return [...a].map(x => ALPHA[x % ALPHA.length]).join(''); };
  const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prettyCode = (c) => normCode(c).replace(/(.{4})(?=.)/g, '$1-');
  function defaultName() {
    const ua = navigator.userAgent; const t = /iPad|Macintosh.*Mobile|Macintosh/.test(ua) && navigator.maxTouchPoints > 1 ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? (/Mobile/.test(ua) ? 'Điện thoại Android' : 'Máy tính bảng Android') : 'Máy tính';
    return t;
  }
  function ensureDev() { const s = st(); if (!s.dev) setSt({ dev: 'd' + rand(10).toLowerCase(), name: s.name || defaultName() }); return st(); }

  const ZZZSync = {
    configured: () => !!cfg().projectId,
    config: cfg,
    setConfig(c) { setSt({ projectId: String(c.projectId || '').trim(), apiKey: String(c.apiKey || '').trim(), ...(c.base != null ? { base: c.base } : {}) }); },
    state() { const s = st(); return { on: isOn(), fam: s.fam || '', code: s.fam ? prettyCode(s.fam) : '', dev: s.dev || '', name: s.name || defaultName(), last: s.last || 0, err: s.err || '', busy: !!s.busy && !!running, peers: arr(s.peers), configured: !!cfg().projectId }; },
    prettyCode, normCode,
    validCode: (c) => new RegExp(`^[${ALPHA}]{16}$`).test(normCode(c)),
    setName(n) { setSt({ name: String(n || '').trim().slice(0, 40) || defaultName() }); dirty = true; schedulePush(); },
    /* máy này tạo gia đình mới: dữ liệu đang có trở thành dữ liệu của gia đình */
    async create() {
      if (!cfg().projectId) throw new Error('config');
      ensureDev(); const fam = rand(16);
      setSt({ fam, on: true, last: 0, err: '' }); wr(K.ev, {}); stampAll(); dirty = true;
      const r = await syncNow(); if (!r.ok) { setSt({ on: false, fam: '' }); throw new Error(r.err); }
      return prettyCode(fam);
    },
    /* máy này vào gia đình có sẵn: dữ liệu cũ của máy được cất (zzz-sync-prejoin) rồi thay bằng dữ liệu gia đình */
    async join(code) {
      if (!cfg().projectId) throw new Error('config');
      const fam = normCode(code); if (!this.validCode(fam)) throw new Error('code');
      const s = ensureDev();
      const docs = await listDevices(fam).catch(e => { throw new Error(e && e.status === 403 ? 'denied' : 'network'); });
      if (!docs.length) throw new Error('empty');
      const pre = {}; for (const k of KEYS) pre[k] = ls.getItem(k); wr(K.pre, { ts: Date.now(), vals: pre });
      const mine = docs.find(d => d.dev === s.dev), peers = docs.filter(d => d.dev !== s.dev);
      // máy từng ở trong gia đình này thì giữ phần của nó; máy mới thì bắt đầu từ 0
      wr(K.own, mine ? obj(mine.own) : {}); wr(K.mt, mine ? obj(mine.mt) : {});
      wr(K.ev, mine ? { sent: obj(mine.evm) } : {});
      const src = mine ? [mine, ...peers] : peers;
      const hooksSaved = hooks; hooks = []; // vào gia đình: thay luôn kể cả khi app đang mở
      try { mergeIn(src, false); } finally { hooks = hooksSaved; }
      setSt({ fam, on: true, last: 0, err: '' }); dirty = true;
      const r = await syncNow();
      for (const h of hooks) { try { if (h.reload) h.reload(KEYS, 0); } catch (e) { } }
      emit({ status: 'ok', changed: KEYS });
      return r;
    },
    /* tắt trên máy này: dữ liệu vẫn ở lại máy, gia đình vẫn còn. Bật lại bằng cùng mã. */
    leave() { if (pushTimer) { clearTimeout(pushTimer); pushTimer = 0; } setSt({ on: false }); emit({ status: 'off' }); },
    resume() { const s = st(); if (s.fam) return this.join(s.fam); return Promise.reject(new Error('code')); },
    syncNow,
    /* app đăng ký: busy() = đang trong lượt chơi (chưa thay dữ liệu), reload() = đọc lại dữ liệu sau khi gộp */
    register(h) { hooks.push(h); },
    _test: { mergeIn, bundle, SPEC, canon }
  };
  window.ZZZSync = ZZZSync;

  if (isOn()) {
    const kick = () => { if (document.visibilityState !== 'hidden') syncNow(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(kick, 300)); else setTimeout(kick, 300);
  }
  setInterval(() => { if (isOn() && document.visibilityState === 'visible') syncNow(); }, 90000);
  document.addEventListener('visibilitychange', () => { if (!isOn()) return; if (document.visibilityState === 'visible') syncNow(); else if (dirty) syncNow(); });
  window.addEventListener('online', () => { if (isOn()) syncNow(); });
})();
