'use strict';
// ================= Jam jarum: gambar, animasi, dan putar jarum =================
// Jam bekerja seperti jam asli: kalau jarum panjang diputar satu putaran penuh,
// jarum pendek ikut maju satu angka.

const Clock = {
  create(host, opt = {}) {
    const o = {
      t: 0,              // menit sejak tengah malam (ditampilkan modulo 12 jam)
      skin: Save.data.skin,
      interactive: false,
      snap: 5,           // jarum panjang berhenti tiap 5 menit (atau 1)
      helper: Save.data.settings.helper, // angka menit kecil di pinggir
      label: 'Jam',
      ...opt,
    };
    const skin = ClockSkins[o.skin] || ClockSkins.kayu;
    const wrap = document.createElement('div');
    wrap.className = 'clock-wrap' + (o.interactive ? ' interactive' : '');
    wrap.innerHTML = Clock.svg(skin, o.helper);
    host.appendChild(wrap);
    const svg = wrap.querySelector('svg');
    const hourHand = svg.querySelector('.hand.hour');
    const minHand = svg.querySelector('.hand.minute');

    const api = {
      el: wrap,
      svg,
      t: o.t % 720,
      onChange: null,
      anim: 0,

      draw(t) {
        const m = ((t % 60) + 60) % 60;
        const h = (((t / 60) % 12) + 12) % 12;
        minHand.setAttribute('transform', `rotate(${m * 6})`);
        hourHand.setAttribute('transform', `rotate(${h * 30})`);
      },

      // pindah ke waktu baru, jarum berputar maju seperti jam asli
      set(t, { animate = false, forward = true } = {}) {
        t = ((t % 720) + 720) % 720;
        cancelAnimationFrame(api.anim);
        const from = api.t;
        api.t = t;
        if (!animate || Motion.reduced()) { api.draw(t); api.aria(); return Promise.resolve(); }
        let diff = t - from;
        if (forward) diff = ((diff % 720) + 720) % 720;
        else if (Math.abs(diff) > 360) diff -= Math.sign(diff) * 720;
        if (diff === 0) { api.draw(t); return Promise.resolve(); }
        const dur = Math.min(1600, 380 + Math.abs(diff) * 2.2);
        const start = performance.now();
        return new Promise((res) => {
          const step = (now) => {
            const k = Math.min(1, (now - start) / dur);
            const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            api.draw(from + diff * e);
            if (k < 1) api.anim = requestAnimationFrame(step);
            else { api.draw(t); api.aria(); res(); }
          };
          api.anim = requestAnimationFrame(step);
        });
      },

      // denyut di salah satu jarum (dipakai di mode Belajar)
      glow(which) {
        hourHand.classList.toggle('glow', which === 'hour' || which === 'both');
        minHand.classList.toggle('glow', which === 'minute' || which === 'both');
      },
      // tandai angka tertentu di muka jam (misalnya angka 6 untuk setengah)
      mark(nums) {
        $$('.num', svg).forEach((n) => n.classList.toggle('marked', nums.includes(+n.dataset.n)));
      },
      aria() {
        if (!o.interactive) return;
        wrap.setAttribute('aria-valuetext', `${W.kata(api.t)} (${W.digital(api.t, false)})`);
        wrap.setAttribute('aria-valuenow', String(api.t));
      },
      destroy() { cancelAnimationFrame(api.anim); wrap.remove(); },
    };
    api.draw(api.t);

    if (o.interactive) Clock.makeDraggable(api, svg, hourHand, minHand, o);
    return api;
  },

  // ---------- gambar SVG jam ----------
  svg(skin, helper) {
    const R = 86;
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      const a = (i * 6 * Math.PI) / 180;
      const r1 = big ? R - 11 : R - 6, r2 = R - 2;
      ticks += `<line x1="${(Math.sin(a) * r1).toFixed(2)}" y1="${(-Math.cos(a) * r1).toFixed(2)}" x2="${(Math.sin(a) * r2).toFixed(2)}" y2="${(-Math.cos(a) * r2).toFixed(2)}" class="${big ? 'tk big' : 'tk'}"/>`;
    }
    let nums = '';
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180, r = R - 25;
      nums += `<g class="num" data-n="${n}"><circle cx="${(Math.sin(a) * r).toFixed(2)}" cy="${(-Math.cos(a) * r).toFixed(2)}" r="12" class="num-bg"/><text x="${(Math.sin(a) * r).toFixed(2)}" y="${(-Math.cos(a) * r + 6.5).toFixed(2)}">${n}</text></g>`;
    }
    let mins = '';
    if (helper) {
      for (let k = 0; k < 12; k++) {
        const a = (k * 30 * Math.PI) / 180, r = R + 12;
        mins += `<text x="${(Math.sin(a) * r).toFixed(2)}" y="${(-Math.cos(a) * r + 3.6).toFixed(2)}">${W.pad(k * 5)}</text>`;
      }
    }
    return `<svg viewBox="-125 -125 250 250" class="clock" style="--face:${skin.face};--ink:${skin.ink};--hour:${skin.hour};--minute:${skin.minute};--rim:${skin.rim}">
      <g class="frame">${skin.frame}</g>
      <circle r="${R + 22}" class="helper-ring" ${helper ? '' : 'style="display:none"'}/>
      <circle r="${R}" class="face"/>
      <g class="ticks">${ticks}</g>
      <g class="nums">${nums}</g>
      <g class="mins">${mins}</g>
      <g class="hand hour"><path d="M-6 10 L-4.5 -44 Q0 -54 4.5 -44 L6 10 Z"/></g>
      <g class="hand minute"><path d="M-4 12 L-2.6 -72 Q0 -80 2.6 -72 L4 12 Z"/></g>
      <circle r="7.5" class="cap"/><circle r="3" class="cap-dot"/>
    </svg>`;
  },

  // ---------- putar jarum pakai tarik, ketuk, atau tombol panah ----------
  makeDraggable(api, svg, hourHand, minHand, o) {
    const wrap = api.el;
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'slider');
    wrap.setAttribute('aria-label', o.label);
    wrap.setAttribute('aria-valuemin', '0');
    wrap.setAttribute('aria-valuemax', '719');
    api.aria();
    let drag = null;

    const angleAt = (e) => {
      const r = svg.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      const deg = (Math.atan2(x, -y) * 180) / Math.PI;
      return { deg: (deg + 360) % 360, dist: Math.hypot(x, y) / (r.width / 2) };
    };
    const change = (t) => {
      t = ((t % 720) + 720) % 720;
      if (t === api.t) return;
      api.t = t;
      api.draw(t);
      api.aria();
      Sound.tick();
      if (api.onChange) api.onChange(t);
    };
    const moveMinute = (deg) => {
      const step = o.snap;
      let m = Math.round(deg / 6 / step) * step;
      if (m >= 60) m = 0;
      const curM = api.t % 60;
      let h = Math.floor(api.t / 60);
      // lewat angka 12 ke depan: jam maju; ke belakang: jam mundur.
      // Pakai jarak terpendek, supaya tarikan cepat (lompat 15+ menit) tetap benar.
      const diff = m - curM;
      if (diff < -30) h += 1;
      else if (diff > 30) h -= 1;
      change(h * 60 + m);
    };
    const moveHour = (deg) => {
      const m = api.t % 60;
      let h = Math.round(deg / 30 - m / 60);
      change(h * 60 + m);
    };
    const which = (a) => {
      const hourDeg = ((api.t / 60) % 12) * 30, minDeg = (api.t % 60) * 6;
      const d = (x, y) => Math.min(Math.abs(x - y), 360 - Math.abs(x - y));
      const dh = d(a.deg, hourDeg), dm = d(a.deg, minDeg);
      if (Math.abs(dh - dm) < 20) return a.dist < 0.55 ? 'hour' : 'minute';
      return dh < dm ? 'hour' : 'minute';
    };

    wrap.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      const a = angleAt(e);
      if (a.dist > 1.12) return;
      drag = { id: e.pointerId, hand: which(a) };
      wrap.setPointerCapture(e.pointerId);
      wrap.classList.add('dragging', 'drag-' + drag.hand);
      (drag.hand === 'hour' ? moveHour : moveMinute)(a.deg);
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const a = angleAt(e);
      (drag.hand === 'hour' ? moveHour : moveMinute)(a.deg);
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      wrap.classList.remove('dragging', 'drag-hour', 'drag-minute');
      drag = null;
    };
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);

    wrap.addEventListener('keydown', (e) => {
      const step = o.snap;
      const k = e.key;
      let d = 0;
      if (k === 'ArrowRight' || k === 'ArrowUp') d = step;
      else if (k === 'ArrowLeft' || k === 'ArrowDown') d = -step;
      else if (k === 'PageUp') d = 60;
      else if (k === 'PageDown') d = -60;
      if (!d) return;
      e.preventDefault();
      e.stopPropagation();
      const base = Math.round(api.t / step) * step;
      change(base + d);
    });
  },
};

// Gerak dikurangi kalau perangkat atau pengaturan memintanya
const Motion = {
  reduced: () => (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
};
