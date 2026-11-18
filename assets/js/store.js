'use strict';
// ================= Fungsi bantu, bahasa waktu, dan penyimpanan kemajuan =================

const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Bilangan ke kata, 0 sampai 99 (cukup untuk jam dan menit)
function terbilang(n) {
  const satuan = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  if (n < 12) return satuan[n];
  if (n < 20) return satuan[n - 10] + ' belas';
  const p = Math.floor(n / 10), s = n % 10;
  return satuan[p] + ' puluh' + (s ? ' ' + satuan[s] : '');
}

// ================= Bahasa waktu =================
// Semua waktu disimpan sebagai menit sejak tengah malam: 0 sampai 1439.
const W = {
  make: (h, m) => ((h * 60 + m) % 1440 + 1440) % 1440,
  h: (t) => Math.floor(t / 60) % 24,
  m: (t) => t % 60,
  pad: (n) => String(n).padStart(2, '0'),

  // jam di muka jam dinding: 1 sampai 12
  jam12(h) { const x = h % 12; return x === 0 ? 12 : x; },

  // tulisan digital ala Indonesia pakai titik: 07.30
  digital(t, mode24 = true) {
    const h = W.h(t), m = W.m(t);
    const hh = mode24 ? h : W.jam12(h);
    return W.pad(hh) + '.' + W.pad(m);
  },

  // pagi 04.00-10.59, siang 11.00-14.59, sore 15.00-17.59, malam 18.00-03.59
  bagian(t) {
    const h = W.h(t);
    if (h >= 4 && h < 11) return 'pagi';
    if (h >= 11 && h < 15) return 'siang';
    if (h >= 15 && h < 18) return 'sore';
    return 'malam';
  },

  // Cara bilang waktu yang diajarkan di SD:
  // 07.00 jam tujuh tepat, 07.15 jam tujuh lewat seperempat, 07.30 jam setengah delapan,
  // 07.45 jam delapan kurang seperempat, 07.10 jam tujuh lewat sepuluh menit,
  // 07.50 jam delapan kurang sepuluh menit.
  kata(t, { bagian = false, tepat = true } = {}) {
    const h = W.h(t), m = W.m(t);
    const H = terbilang(W.jam12(h)), N = terbilang(W.jam12(h + 1));
    let s;
    if (m === 0) s = `jam ${H}` + (tepat && !bagian ? ' tepat' : '');
    else if (m === 30) s = `jam setengah ${N}`;
    else if (m === 15) s = `jam ${H} lewat seperempat`;
    else if (m === 45) s = `jam ${N} kurang seperempat`;
    else if (m < 30) s = `jam ${H} lewat ${terbilang(m)} menit`;
    else s = `jam ${N} kurang ${terbilang(60 - m)} menit`;
    if (bagian) s += ' ' + W.bagian(t);
    return s;
  },

  // lama waktu dalam kata: 90 -> "1 jam 30 menit"
  lama(min) {
    const j = Math.floor(min / 60), m = min % 60;
    if (!j) return `${m} menit`;
    if (!m) return `${j} jam`;
    return `${j} jam ${m} menit`;
  },
  lamaKata(min) {
    const j = Math.floor(min / 60), m = min % 60;
    if (!j) return `${terbilang(m)} menit`;
    if (!m) return `${terbilang(j)} jam`;
    if (m === 30) return `${terbilang(j)} setengah jam`;
    return `${terbilang(j)} jam ${terbilang(m)} menit`;
  },
  // selisih maju dari a ke b, dalam menit
  beda(a, b) { return ((b - a) % 1440 + 1440) % 1440; },

  // dua waktu terlihat sama di jam jarum (jam 07.30 dan 19.30)
  samaDiJarum: (a, b) => a % 720 === b % 720,
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "07.30" dibaca "pukul tujuh lewat tiga puluh menit", supaya suara baca nggak bilang "nol tujuh titik"
function ucapkan(text) {
  return text.replace(/(?:pukul\s+)?\b(\d{1,2})\.(\d{2})\b/g, (_, hh, mm) => {
    const h = +hh, m = +mm;
    if (h > 23 || m > 59) return _;
    return 'pukul ' + terbilang(h) + (m ? ' lewat ' + terbilang(m) + ' menit' : '');
  });
}

// ================= Bab belajar =================
// tiap bab punya empat kegiatan: belajar, baca, putar, ketik
const UNITS = [
  { id: 'tepat', name: 'Jam Tepat', sub: 'Jarum panjang di angka 12', color: '#ff9f43', icon: '12' },
  { id: 'setengah', name: 'Setengah', sub: 'Jarum panjang di angka 6', color: '#ff6b81', icon: '½' },
  { id: 'seperempat', name: 'Seperempat', sub: 'Lewat dan kurang seperempat', color: '#a55eea', icon: '¼' },
  { id: 'limamenit', name: 'Lima Menitan', sub: 'Tiap angka 5 menit', color: '#4b7bec', icon: '5' },
  { id: 'menit', name: 'Tiap Menit', sub: 'Hitung garis kecilnya', color: '#20bf6b', icon: '1' },
  { id: 'harian', name: 'Pagi sampai Malam', sub: 'Jam 24 dan bagian hari', color: '#f7b731', icon: '24' },
  { id: 'lama', name: 'Berapa Lama?', sub: 'Hitung lama waktu', color: '#0fb9b1', icon: '⧗' },
];
const ACTS = ['learn', 'read', 'set', 'type'];
const ACT_NAME = { learn: 'Belajar', read: 'Baca Jam', set: 'Putar Jarum', type: 'Ketik Jam' };

// ================= Penyimpanan =================
const Save = {
  key: 'jago-jam:v1',
  data: null,

  fresh() {
    return {
      stars: {},          // { tepat: { learn: 3, read: 2, set: 0, type: 1 } }
      weak: [],           // soal yang pernah salah: [{ u: 'setengah', k: 'read', t: 450, d: 0 }]
      tests: [],          // riwayat Tes Waktu: [{ score, n, at }]
      schedules: 0,       // berapa kali Jadwal Jago selesai
      clocks: ['kayu'],   // koleksi jam yang sudah terbuka
      skin: 'kayu',
      newClock: false,
      lastUnit: 0,
      settings: { music: true, sfx: true, voice: true, helper: true },
    };
  },

  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.key) || 'null'); } catch { d = null; }
    const f = this.fresh();
    if (!d || typeof d !== 'object' || Array.isArray(d)) { this.data = f; return; }
    // ambil yang bentuknya benar saja, sisanya pakai nilai awal
    const ok = (v, type) => (type === 'array' ? Array.isArray(v) : v !== null && typeof v === type && !Array.isArray(v));
    this.data = {
      stars: ok(d.stars, 'object') ? d.stars : f.stars,
      weak: ok(d.weak, 'array') ? d.weak.filter((w) => w && typeof w.t === 'number').slice(-40) : f.weak,
      tests: ok(d.tests, 'array') ? d.tests.slice(-10) : f.tests,
      schedules: typeof d.schedules === 'number' ? d.schedules : 0,
      clocks: ok(d.clocks, 'array') && d.clocks.includes('kayu') ? d.clocks : f.clocks,
      skin: typeof d.skin === 'string' ? d.skin : 'kayu',
      newClock: !!d.newClock,
      lastUnit: Number.isInteger(d.lastUnit) && d.lastUnit >= 0 && d.lastUnit < UNITS.length ? d.lastUnit : 0,
      settings: { ...f.settings, ...(ok(d.settings, 'object') ? d.settings : {}) },
    };
    if (!this.data.clocks.includes(this.data.skin)) this.data.skin = 'kayu';
  },

  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch { /* penyimpanan nggak tersedia */ }
  },

  starOf(u, act) { return (this.data.stars[u] && this.data.stars[u][act]) || 0; },
  setStar(u, act, n) {
    const s = this.data.stars[u] || (this.data.stars[u] = {});
    const before = s[act] || 0;
    if (n > before) { s[act] = n; this.save(); }
    return Math.max(0, n - before);
  },
  unitStars(u) { return ACTS.reduce((a, k) => a + this.starOf(u, k), 0); },
  totalStars() { return UNITS.reduce((a, u) => a + this.unitStars(u.id), 0); },

  addWeak(w) {
    const key = (x) => `${x.u}|${x.k}|${x.t}|${x.d || 0}`;
    this.data.weak = this.data.weak.filter((x) => key(x) !== key(w));
    this.data.weak.push(w);
    if (this.data.weak.length > 40) this.data.weak.shift();
    this.save();
  },
  clearWeak(w) {
    const key = (x) => `${x.u}|${x.k}|${x.t}|${x.d || 0}`;
    const before = this.data.weak.length;
    this.data.weak = this.data.weak.filter((x) => key(x) !== key(w));
    if (this.data.weak.length !== before) this.save();
  },
};
Save.load();
