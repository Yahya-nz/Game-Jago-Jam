'use strict';
// ================= Soal dan kegiatan: Baca Jam, Putar Jarum, Ketik Jam =================

// kegiatan sehari-hari Jago untuk soal bab Pagi sampai Malam dan Berapa Lama
const KEGIATAN = [
  { a: 'Jago bangun dan berkokok', from: [5, 0], to: [5, 45] },
  { a: 'Jago mandi pagi', from: [5, 30], to: [6, 15] },
  { a: 'Jago sarapan jagung', from: [6, 0], to: [6, 45] },
  { a: 'Jago berangkat ke sekolah', from: [6, 30], to: [7, 0] },
  { a: 'Jago istirahat sekolah', from: [9, 30], to: [10, 0] },
  { a: 'Jago pulang sekolah', from: [12, 0], to: [13, 0] },
  { a: 'Jago makan siang', from: [12, 30], to: [13, 30] },
  { a: 'Jago tidur siang', from: [13, 30], to: [14, 30] },
  { a: 'Jago main layangan', from: [15, 30], to: [17, 0] },
  { a: 'Jago mandi sore', from: [16, 30], to: [17, 30] },
  { a: 'Jago makan malam', from: [18, 30], to: [19, 30] },
  { a: 'Jago belajar', from: [19, 0], to: [20, 0] },
  { a: 'Jago tidur', from: [20, 30], to: [21, 30] },
];
const kegiatanAcak = (step = 15) => {
  const k = pick(KEGIATAN);
  const a = k.from[0] * 60 + k.from[1], b = k.to[0] * 60 + k.to[1];
  return { a: k.a, t: a + Math.floor(Math.random() * ((b - a) / step + 1)) * step };
};

const Q = {
  snap(unit) { return unit === 'menit' ? 1 : 5; },

  // waktu acak sesuai bab (bab 1-5 memakai jam 1 sampai 12)
  time(unit) {
    const H = randi(1, 12);
    switch (unit) {
      case 'tepat': return W.make(H, 0);
      case 'setengah': return W.make(H, Math.random() < 0.8 ? 30 : 0);
      case 'seperempat': return W.make(H, pick([15, 45, 15, 45, 30]));
      case 'limamenit': return W.make(H, pick([5, 10, 20, 25, 35, 40, 50, 55, 15, 45]));
      case 'menit': {
        let m;
        do m = randi(1, 59); while (m % 5 === 0 && Math.random() < 0.8);
        return W.make(H, m);
      }
      default: return W.make(H, randi(0, 11) * 5);
    }
  },

  // jawaban keliru yang sering terjadi, supaya pilihan gandanya mendidik
  wrongTimes(unit, t) {
    const h = W.h(t), m = W.m(t);
    const c = [];
    const add = (hh, mm) => c.push(W.make(hh, mm));
    if (unit === 'tepat') {
      add(h + 1, 0); add(h - 1, 0); add(h, 30); add(12, h % 12 * 5);
    } else if (unit === 'setengah') {
      add(h - 1, 30); add(h + 1, 30); add(h, 0); add(h + 1, 0); add(6, h % 12 * 5);
    } else if (unit === 'seperempat') {
      if (m === 15) { add(h, 45); add(h - 1, 45); add(h, 30); add(3, h % 12 * 5); }
      else if (m === 45) { add(h, 15); add(h + 1, 15); add(h + 1, 45); add(9, h % 12 * 5); }
      else { add(h - 1, 30); add(h, 15); add(h, 45); add(h + 1, 30); }
    } else if (unit === 'limamenit') {
      add(h, m + 5); add(h, m - 5); add(h, m / 5); add(m >= 30 ? h + 1 : h - 1, m); add(h, 60 - m);
    } else {
      add(h, m + 1); add(h, m - 1); add(h, m + 5); add(h, m - 5); add(m >= 30 ? h + 1 : h - 1, m);
    }
    return c;
  },

  // buat satu soal. kind: read | set | type
  make(unit, kind) {
    if (unit === 'harian') return Q.makeHarian(kind);
    if (unit === 'lama') return Q.makeLama(kind);
    const t = Q.time(unit);
    const q = { unit, kind, t, snap: Q.snap(unit) };
    if (kind === 'read') {
      const wrong = shuffle(Q.wrongTimes(unit, t).filter((x) => !W.samaDiJarum(x, t)));
      const opts = [t];
      for (const x of wrong) if (opts.length < 4 && !opts.some((o) => W.samaDiJarum(o, x))) opts.push(x);
      while (opts.length < 4) { const x = Q.time(unit); if (!opts.some((o) => W.samaDiJarum(o, x))) opts.push(x); }
      q.opts = shuffle(opts).map((x) => ({ t: x, big: W.digital(x, false), small: W.kata(x), ok: W.samaDiJarum(x, t) }));
      q.prompt = 'Jam berapa ini?';
      q.say = 'Jam berapa ini?';
    } else if (kind === 'set') {
      const useWords = unit === 'tepat' || unit === 'setengah' || unit === 'seperempat' || Math.random() < 0.5;
      q.prompt = useWords ? cap(W.kata(t)) : W.digital(t, false);
      q.say = W.kata(t);
      q.start = Q.startFor(t, q.snap);
    } else {
      q.prompt = 'Tulis jamnya';
      q.say = 'Tulis jam berapa yang ditunjukkan jam ini.';
      q.mode24 = false;
    }
    return q;
  },

  // posisi awal jarum di Putar Jarum: jauh dari jawaban
  startFor(t, snap) {
    let s;
    do s = W.make(randi(1, 12), randi(0, 59 / snap) * snap); while (Math.abs((s % 720) - (t % 720)) < 60);
    return s;
  },

  makeHarian(kind) {
    const unit = 'harian';
    const k = kegiatanAcak(15);
    const q = { unit, kind, t: k.t, snap: 5, act: k.a, sky: W.bagian(k.t) };
    if (kind === 'read') {
      const opts = [k.t, k.t + 720, k.t + 60, k.t + 720 - 60].map((x) => ((x % 1440) + 1440) % 1440);
      q.prompt = `${k.a}. Pukul berapa sekarang?`;
      q.say = `${k.a}. Pukul berapa sekarang? Lihat langitnya ya.`;
      q.opts = shuffle(opts).map((x) => ({ t: x, big: W.digital(x), small: cap(W.kata(x, { bagian: true })), ok: x === k.t }));
    } else if (kind === 'set') {
      q.prompt = `${k.a} pukul ${W.digital(k.t)}`;
      q.say = `${k.a} pukul ${W.kata(k.t, { bagian: true })}. Putar jarumnya!`;
      q.start = Q.startFor(k.t, 5);
    } else {
      q.prompt = `${k.a} ${W.kata(k.t, { bagian: true })}. Tulis pukulnya dalam 24 jam.`;
      q.say = `${k.a} ${W.kata(k.t, { bagian: true })}. Tulis pukulnya.`;
      q.mode24 = true;
      q.hideClock = true;
    }
    return q;
  },

  makeLama(kind) {
    const unit = 'lama';
    const k = kegiatanAcak(15);
    const durs = kind === 'read' ? [15, 30, 45, 60, 90, 120, 75, 105, 150, 180] : [10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120];
    const d = pick(durs);
    const t1 = k.t, t2 = (k.t + d) % 1440;
    const q = { unit, kind, t: t2, start: t1, d, snap: 5, act: k.a, sky: W.bagian(t1) };
    if (kind === 'read') {
      const cand = [d + 15, d - 15, d + 30, d - 30, d + 60, d - 60, 60 - d % 60 + Math.floor(d / 60) * 60].filter((x) => x > 0 && x !== d);
      const opts = [d];
      for (const x of shuffle(cand)) if (opts.length < 4 && !opts.includes(x)) opts.push(x);
      q.prompt = `${k.a}. Berapa lama?`;
      q.say = `${k.a} mulai ${W.kata(t1)} sampai ${W.kata(t2)}. Berapa lama?`;
      q.opts = shuffle(opts).map((x) => ({ t: x, big: W.lama(x), small: x % 60 === 30 && x > 60 ? W.lamaKata(x) : '', ok: x === d }));
    } else if (kind === 'set') {
      q.prompt = `Mulai ${W.digital(t1)}, lamanya ${W.lama(d)}. Kapan selesai?`;
      q.say = `${k.a} mulai ${W.kata(t1)}, lamanya ${W.lamaKata(d)}. Putar jarumnya ke jam selesai!`;
    } else {
      q.prompt = `Mulai ${W.digital(t1)}, lamanya ${W.lama(d)}. Selesai pukul berapa?`;
      q.say = `${k.a} mulai ${W.kata(t1)}, lamanya ${W.lamaKata(d)}. Selesai pukul berapa?`;
      q.mode24 = true;
      q.hideClock = true;
    }
    return q;
  },

  // cocokkan ketikan HH.MM dengan jawaban
  checkTyped(q, hh, mm) {
    if (mm > 59 || hh > 23) return false;
    const typed = W.make(hh, mm);
    if (q.mode24) return typed === q.t % 1440;
    // jam jarum tidak tahu pagi atau malam: 07.30 dan 19.30 sama-sama benar
    return W.samaDiJarum(typed, q.t);
  },
};

const PRAISE = ['Jago!', 'Mantap!', 'Kukuruyuk, benar!', 'Tepat sekali!', 'Hebat!', 'Pintar!', 'Keren!'];
const OOPS = ['Hampir! Coba lihat lagi.', 'Belum tepat, nggak apa-apa.', 'Ayo coba sekali lagi.'];

// ================= Layar kegiatan =================
// params: { unit, kind, n, list?, mode: 'unit' | 'test' | 'ulang', title }
Screens.play = (params) => {
  const { unit, kind } = params;
  const n = params.list ? params.list.length : params.n || (kind === 'read' ? 8 : 6);
  const qs = params.list || Array.from({ length: n }, () => Q.make(unit, kind));
  const title = params.title || `${ACT_NAME[kind]} · ${UNITS.find((u) => u.id === unit).name}`;
  let i = 0, mistakes = 0, correct = 0, firstTry = true, clock = null, busy = false, typed = '';
  let alive = true; // false setelah layar ditinggal, supaya jeda yang tertunda nggak lanjut
  const missed = [];
  const el = UI.el(`<section class="screen play">
    ${UI.header(title, `<span class="count" aria-live="polite">1 / ${n}</span>`)}
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="0"><i></i></div>
    <div class="play-card">
      <div class="q-row">
        <div class="prompt" id="prompt"></div>
        <button class="round-btn speak" data-act="speak" aria-label="Dengarkan soal">${ICON.sound}</button>
      </div>
      <div class="stage">
        <div class="clocks"></div>
        ${Jago.html('', 'small')}
      </div>
      <div class="answer"></div>
    </div>
  </section>`);
  const jagoBox = $('.jago-box', el);
  Jago.wire(jagoBox, PRAISE);
  const scr = { el, sky: 'pagi' };

  const show = () => {
    if (!alive) return;
    const q = qs[i];
    firstTry = true; busy = false; typed = '';
    $('.count', el).textContent = `${i + 1} / ${n}`;
    $('.progress i', el).style.width = `${(i / n) * 100}%`;
    $('.progress', el).setAttribute('aria-valuenow', String(i));
    $('#prompt', el).textContent = q.prompt;
    Jago.say(jagoBox, q.kind === 'set' ? 'Tarik jarum panjangnya ya!' : q.kind === 'type' ? 'Ketik angkanya!' : 'Pilih yang benar!');
    UI.sky(q.sky || 'pagi');
    const box = $('.clocks', el);
    box.innerHTML = '';
    if (clock) { clock.destroy(); clock = null; }
    // jam untuk soal Berapa Lama: dua jam (mulai dan selesai)
    if (q.unit === 'lama' && q.kind === 'read') {
      for (const [lab, t] of [['Mulai', q.start], ['Selesai', q.t]]) {
        const f = UI.el(`<figure class="clock-fig"><figcaption>${lab} · ${W.digital(t)}</figcaption></figure>`);
        box.appendChild(f);
        Clock.create(f, { t, label: lab });
      }
    } else if (!q.hideClock) {
      const startT = q.kind === 'set' ? q.start : q.t;
      clock = Clock.create(box, { t: startT, interactive: q.kind === 'set', snap: q.snap, label: 'Jam, putar jarumnya' });
      if (q.unit === 'harian' && q.kind === 'read') box.insertAdjacentHTML('beforeend', `<div class="sky-badge ${q.sky}">${BAGIAN_ICON[q.sky]}<span>Lihat langitnya</span></div>`);
    } else {
      box.innerHTML = `<div class="scene-card ${q.sky}"><div class="scene-ico">${BAGIAN_ICON[q.sky]}</div><p>${q.act}</p></div>`;
    }
    renderAnswer(q);
    if (Save.data.settings.voice) setTimeout(() => { if (UI.cur && UI.cur.scr === scr) Speech.say(q.say); }, 250);
  };

  const renderAnswer = (q) => {
    const ans = $('.answer', el);
    if (q.kind === 'read') {
      ans.innerHTML = `<div class="opts">${q.opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="key">${k + 1}</span><b>${o.big}</b>${o.small ? `<small>${o.small}</small>` : ''}</button>`).join('')}</div>`;
      $$('.opt', ans).forEach((b) => b.addEventListener('click', () => choose(+b.dataset.k)));
    } else if (q.kind === 'set') {
      ans.innerHTML = `<div class="set-row"><p class="hint">Jarum panjang: menit. Jarum pendek: jam. Tarik jarumnya, atau pakai tombol panah.</p><button class="btn big go" data-act="check">${ICON.check} Cek</button></div>`;
      $('[data-act="check"]', ans).addEventListener('click', checkSet);
    } else {
      ans.innerHTML = `<div class="type-box">
        <div class="digits" aria-live="polite" aria-label="Jawaban"><span class="d"></span><span class="d"></span><b>.</b><span class="d"></span><span class="d"></span></div>
        <p class="hint">${q.mode24 ? 'Pakai jam 24: 13.00 sampai 23.59 buat siang ke malam.' : 'Contoh: setengah delapan ditulis 07.30'}</p>
        <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button class="key" data-d="${d}">${d}</button>`).join('')}
          <button class="key erase" data-d="del" aria-label="Hapus">${ICON.erase}</button><button class="key" data-d="0">0</button><button class="key ok" data-d="ok" aria-label="Cek">${ICON.check}</button></div>
      </div>`;
      $$('.keypad .key', ans).forEach((b) => b.addEventListener('click', () => press(b.dataset.d)));
      drawDigits();
    }
  };

  const drawDigits = () => {
    const ds = $$('.digits .d', el);
    ds.forEach((d, k) => { d.textContent = typed[k] || ''; d.classList.toggle('cur', k === typed.length); });
  };
  const press = (d) => {
    if (busy) return;
    Sound.tap();
    if (d === 'del') typed = typed.slice(0, -1);
    else if (d === 'ok') { checkType(); return; }
    else if (typed.length < 4) typed += d;
    drawDigits();
    if (typed.length === 4) setTimeout(checkType, 180);
  };

  const result = async (ok, q, feedbackEl) => {
    busy = true;
    if (ok) {
      if (firstTry) correct++;
      Sound.good();
      Jago.mood(jagoBox, 'happy');
      Jago.say(jagoBox, pick(PRAISE));
      if (params.mode === 'ulang' && firstTry) Save.clearWeak(weakOf(q));
      if (feedbackEl) feedbackEl.classList.add('right');
      if (q.kind !== 'read' && clock) await clock.set(q.t, { animate: true });
      if (!alive) return;
      Speech.say(q.unit === 'lama' && q.kind === 'read' ? W.lamaKata(q.d) : W.kata(q.t, { bagian: q.unit === 'harian' || q.unit === 'lama' }));
      await wait(1100);
      if (!alive) return;
      i++;
      if (i >= n) finish(); else show();
    } else {
      if (firstTry) { mistakes++; missed.push(q); Save.addWeak(weakOf(q)); }
      firstTry = false;
      Sound.bad();
      Jago.mood(jagoBox, 'sad');
      Jago.say(jagoBox, pick(OOPS));
      if (feedbackEl) { feedbackEl.classList.add('wrong'); setTimeout(() => feedbackEl.classList.remove('wrong'), 600); }
      // setelah dua kali salah, Jago menunjukkan jawabannya
      if (q.tries >= 1) {
        await wait(500);
        if (!alive) return;
        if (clock && q.kind !== 'read') await clock.set(q.t, { animate: true });
        if (!alive) return;
        Jago.say(jagoBox, `Jawabannya ${q.unit === 'lama' && q.kind === 'read' ? W.lama(q.d) : W.digital(q.t, q.mode24 !== false && (q.unit === 'harian' || q.unit === 'lama'))}. Ayo lanjut!`);
        await wait(1600);
        if (!alive) return;
        i++;
        if (i >= n) finish(); else show();
        return;
      }
      q.tries = (q.tries || 0) + 1;
      busy = false;
    }
  };

  const choose = (k) => {
    if (busy) return;
    const q = qs[i];
    const b = $$('.opt', el)[k];
    if (!b || b.disabled) return;
    if (q.opts[k].ok) result(true, q, b);
    else { b.disabled = true; result(false, q, b); }
  };
  const checkSet = () => {
    if (busy) return;
    const q = qs[i];
    const ok = W.samaDiJarum(clock.t, q.t);
    result(ok, q, clock.el);
  };
  const checkType = () => {
    if (busy) return;
    const q = qs[i];
    if (typed.length < 4) { UI.toast('Ketik empat angka, misalnya 07.30'); return; }
    const hh = +typed.slice(0, 2), mm = +typed.slice(2);
    const ok = Q.checkTyped(q, hh, mm);
    const box = $('.digits', el);
    if (!ok) { typed = ''; drawDigits(); }
    result(ok, q, box);
  };

  const finish = () => {
    $('.progress i', el).style.width = '100%';
    if (params.onDone) { params.onDone({ correct, n, missed }); return; }
    const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
    UI.go('result', { unit, kind, stars, correct, n, missed, mode: params.mode, again: params }, { replace: true });
  };

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'back') { Sound.tap(); UI.back(); }
    if (b.dataset.act === 'speak') { Sound.init(); Speech.say(qs[i].say); }
  });
  scr.onKey = (e) => {
    const q = qs[i];
    if (!q || busy) return false;
    if (q.kind === 'read' && /^[1-4]$/.test(e.key)) { choose(+e.key - 1); return true; }
    if (q.kind === 'type') {
      if (/^[0-9]$/.test(e.key)) { press(e.key); return true; }
      if (e.key === 'Backspace') { press('del'); return true; }
      if (e.key === 'Enter') { press('ok'); return true; }
    }
    if (q.kind === 'set' && e.key === 'Enter' && document.activeElement && !document.activeElement.matches('button')) { checkSet(); return true; }
    return false;
  };
  scr.mounted = show;
  scr.destroy = () => { alive = false; if (clock) clock.destroy(); Speech.stop(); };
  scr.test = { get q() { return qs[i]; }, get i() { return i; }, choose, press, checkSet, get clock() { return clock; } };
  return scr;
};

const weakOf = (q) => ({ u: q.unit, k: q.kind, t: q.t, d: q.d || 0, s: q.start || 0 });

// ubah catatan soal salah kembali jadi soal
function fromWeak(w) {
  let q;
  for (let k = 0; k < 30; k++) {
    q = Q.make(w.u, w.k);
    if (w.u === 'harian' || w.u === 'lama') break;
    if (W.samaDiJarum(q.t, w.t)) break;
  }
  // samakan waktunya dengan soal yang dulu salah (untuk bab 1-5)
  if (w.u !== 'harian' && w.u !== 'lama') {
    q.t = w.t;
    if (q.kind === 'read') {
      const wrong = shuffle(Q.wrongTimes(w.u, w.t).filter((x) => !W.samaDiJarum(x, w.t)));
      const opts = [w.t];
      for (const x of wrong) if (opts.length < 4 && !opts.some((o) => W.samaDiJarum(o, x))) opts.push(x);
      while (opts.length < 4) { const x = Q.time(w.u); if (!opts.some((o) => W.samaDiJarum(o, x))) opts.push(x); }
      q.opts = shuffle(opts).map((x) => ({ t: x, big: W.digital(x, false), small: W.kata(x), ok: W.samaDiJarum(x, w.t) }));
    } else if (q.kind === 'set') {
      q.prompt = cap(W.kata(w.t)); q.say = W.kata(w.t); q.start = Q.startFor(w.t, q.snap);
    }
  }
  return q;
}

// ================= Layar hasil =================
Screens.result = (p) => {
  const unitName = p.unit ? UNITS.find((u) => u.id === p.unit).name : '';
  let gained = 0;
  if (p.mode === 'unit') gained = Save.setStar(p.unit, p.kind, p.stars);
  const fresh = checkClocks();
  const title = p.mode === 'ulang' ? 'Ulangi Soal Salah' : `${ACT_NAME[p.kind]} · ${unitName}`;
  const lines = p.stars === 3 ? 'Kukuruyuk! Sempurna!' : p.stars === 2 ? 'Bagus! Sedikit lagi sempurna.' : 'Terus latihan, pasti makin jago!';
  const el = UI.el(`<section class="screen result">
    ${UI.header(title)}
    <div class="result-card">
      ${Jago.html(lines, 'big')}
      ${p.mode === 'ulang' ? '' : UI.stars(p.stars, 3, 'big-stars')}
      <p class="score">${p.correct} dari ${p.n} benar di percobaan pertama</p>
      ${p.missed.length ? `<div class="missed"><h3>Yang perlu diingat</h3><ul>${p.missed.slice(0, 6).map((q) => `<li>${q.unit === 'lama' && q.kind === 'read' ? `${W.digital(q.start)} sampai ${W.digital(q.t)} = <b>${W.lama(q.d)}</b>` : `<span class="mini">${miniClockSVG(q.t % 720, Save.data.skin)}</span><b>${W.digital(q.t, q.unit === 'harian' || q.unit === 'lama')}</b> ${W.kata(q.t, { bagian: q.unit === 'harian' })}`}</li>`).join('')}</ul></div>` : ''}
      ${fresh.length ? `<p class="new-clock">${ICON.clock} Jam baru di koleksi: ${fresh.map((f) => ClockSkins[f].name).join(', ')}!</p>` : ''}
      <div class="result-btns">
        <button class="btn" data-act="again">${ICON.redo} Main lagi</button>
        <button class="btn go" data-act="next" data-autofocus>${p.mode === 'unit' ? 'Lanjut' : 'Selesai'} ${ICON.right}</button>
      </div>
    </div>
  </section>`);
  const box = $('.jago-box', el);
  Jago.wire(box, PRAISE);
  const scr = { el, sky: 'pagi' };
  scr.mounted = () => {
    if (p.stars === 3) { UI.confetti(); Sound.fanfare(); Jago.crow(box); } else Sound.good();
    $$('.big-stars i', el).forEach((s, k) => { s.style.animationDelay = `${0.15 + k * 0.18}s`; if (s.classList.contains('on')) setTimeout(() => Sound.star(k), 180 + k * 180); });
    if (gained && p.mode === 'unit') UI.toast(`+${gained} bintang baru!`, 'gold');
    if (fresh.length) setTimeout(() => { Sound.alarm(0.6); UI.toast(`Jam baru: ${ClockSkins[fresh[0]].name}`, 'gold'); }, 900);
  };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'back') UI.back();
    if (b.dataset.act === 'again') {
      if (p.mode === 'ulang') {
        if (Save.data.weak.length) UI.go('play', ulangParams(), { replace: true });
        else { UI.toast('Semua soal salah sudah beres!', 'gold'); UI.back(); }
      } else UI.go('play', { ...p.again, list: undefined }, { replace: true });
    }
    if (b.dataset.act === 'next') UI.back();
  });
  return scr;
};
