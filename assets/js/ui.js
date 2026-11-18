'use strict';
// ================= Pindah layar, notifikasi, konfeti, dan Jago =================

const Screens = {}; // diisi oleh screens.js, quiz.js, dan extras.js

const UI = {
  app: null,
  stack: [],
  cur: null,

  init() {
    this.app = $('#app');
    this.toasts = $('#toasts');
    this.canvas = $('#confetti');
    window.addEventListener('resize', () => this.fitConfetti());
    this.fitConfetti();
  },

  // buka layar baru; replace = ganti layar sekarang tanpa menambah riwayat
  go(name, params = {}, { replace = false } = {}) {
    Speech.stop();
    if (this.cur) {
      if (this.cur.scr.destroy) this.cur.scr.destroy();
      if (!replace) this.stack.push({ name: this.cur.name, params: this.cur.params });
    }
    const scr = Screens[name](params);
    this.cur = { name, params, scr };
    this.app.innerHTML = '';
    this.app.appendChild(scr.el);
    scr.el.classList.add('screen-in');
    this.app.scrollTop = 0;
    window.scrollTo(0, 0);
    if (scr.sky) this.sky(scr.sky); else this.sky('pagi');
    const focus = $('[data-autofocus]', scr.el) || $('h1, h2', scr.el);
    if (focus) { if (!focus.hasAttribute('tabindex') && !/BUTTON|INPUT/.test(focus.tagName)) focus.setAttribute('tabindex', '-1'); focus.focus({ preventScroll: true }); }
    if (scr.mounted) scr.mounted();
  },
  back() {
    const prev = this.stack.pop();
    if (!prev) { this.go('home', {}, { replace: true }); return; }
    Speech.stop();
    if (this.cur && this.cur.scr.destroy) this.cur.scr.destroy();
    this.cur = null;
    this.go(prev.name, prev.params, { replace: true });
  },
  home() { this.stack = []; this.go('home', {}, { replace: true }); },

  // latar berganti sesuai bagian hari: pagi, siang, sore, malam
  sky(b) { document.body.dataset.sky = b; },

  el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  },

  // kepala layar: tombol kembali, judul, dan slot kanan
  header(title, right = '') {
    return `<header class="bar">
      <button class="round-btn back" data-act="back" aria-label="Kembali">${ICON.back}</button>
      <h1 class="bar-title">${title}</h1>
      <div class="bar-right">${right}</div>
    </header>`;
  },

  stars(n, max = 3, cls = '') {
    return `<span class="stars ${cls}" role="img" aria-label="${n} dari ${max} bintang">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''}">${ICON.star}</i>`).join('')}</span>`;
  },

  toast(text, kind = '') {
    const t = this.el(`<div class="toast ${kind}" role="status">${text}</div>`);
    this.toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2400);
    setTimeout(() => t.remove(), 2900);
  },

  // jendela kecil dengan tombol pilihan
  // halaman di belakang jendela dibuat inert supaya fokus keyboard tetap di jendela
  lockBehind(on) {
    const app = $('#app');
    if (!app) return;
    if (on) { this._opener = document.activeElement; app.inert = true; }
    else { app.inert = false; if (this._opener && this._opener.isConnected) this._opener.focus({ preventScroll: true }); this._opener = null; }
  },
  modal({ title, body, buttons }) {
    return new Promise((res) => {
      const bg = this.el(`<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t">
        <h2 id="modal-t">${title}</h2><div class="modal-body">${body}</div>
        <div class="modal-btns">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div></div>`);
      document.body.appendChild(bg);
      UI.lockBehind(true);
      const done = (i) => { bg.remove(); UI.lockBehind(false); res(i); };
      bg.addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]');
        if (b) { Sound.tap(); done(+b.dataset.i); }
      });
      const first = $('.modal-btns .btn:last-child', bg);
      if (first) first.focus();
    });
  },

  // ---------- konfeti bulu dan bintang ----------
  fitConfetti() {
    const c = this.canvas;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  },
  confetti(n = 70) {
    if (Motion.reduced()) return;
    const c = this.canvas, g = c.getContext('2d');
    const colors = ['#ff9f43', '#ff6b81', '#a55eea', '#4b7bec', '#20bf6b', '#f7b731', '#e8413a'];
    const ps = Array.from({ length: n }, () => ({
      x: innerWidth / 2 + rand(-80, 80), y: innerHeight * 0.38, vx: rand(-7, 7), vy: rand(-13, -5),
      r: rand(5, 10), a: rand(0, 6.3), va: rand(-0.2, 0.2), c: pick(colors), feather: Math.random() < 0.35, life: 0,
    }));
    cancelAnimationFrame(this.confettiAnim);
    const step = () => {
      g.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of ps) {
        p.life++; p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        if (p.y > innerHeight + 30) continue;
        alive++;
        g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c;
        if (p.feather) { g.beginPath(); g.ellipse(0, 0, p.r * 0.5, p.r * 1.4, 0, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(0, -p.r * 1.3); g.lineTo(0, p.r * 1.3); g.stroke(); }
        else g.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * 0.66);
        g.restore();
      }
      if (alive) this.confettiAnim = requestAnimationFrame(step);
      else g.clearRect(0, 0, innerWidth, innerHeight);
    };
    step();
  },
};

// ================= Jago: ekspresi dan balon kata =================
const Jago = {
  html(text = '', cls = '') {
    return `<div class="jago-box ${cls}"><div class="jago-bubble" aria-live="polite">${text}</div><button class="jago-btn" aria-label="Jago">${jagoSVG()}</button></div>`;
  },
  // pasang perilaku: diketuk bikin Jago berkokok
  wire(box, lines) {
    const btn = $('.jago-btn', box);
    btn.addEventListener('click', () => {
      Sound.init();
      Jago.crow(box);
      if (lines && lines.length) Jago.say(box, pick(lines), true);
    });
  },
  say(box, text, speak = false) {
    const b = $('.jago-bubble', box);
    if (!b) return;
    b.textContent = text;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (speak) Speech.say(text);
  },
  mood(box, m, ms = 1400) {
    const svg = $('svg.jago', box);
    if (!svg) return;
    svg.classList.remove('happy', 'sad', 'wow', 'crow');
    if (m) svg.classList.add(m);
    clearTimeout(svg._t);
    if (m && ms) svg._t = setTimeout(() => svg.classList.remove(m), ms);
  },
  crow(box) {
    Jago.mood(box, 'crow', 1300);
    Sound.crow();
  },
};
