'use strict';
// ================= Beranda, Jalan Waktu, halaman bab, dan Belajar =================

const HOME_LINES = [
  'Kukuruyuk! Ayo belajar baca jam!',
  'Jarum pendek itu jam, jarum panjang itu menit.',
  'Setengah delapan itu 07.30, lho!',
  'Aku bangun tiap jam lima pagi.',
  'Ketuk aku lagi, aku suka berkokok!',
];

Screens.home = () => {
  // langit beranda ikut jam sungguhan, dan Jago menyebut jam sekarang
  const now = new Date();
  const nowT = W.make(now.getHours(), now.getMinutes());
  const lines = [`Sekarang ${W.kata(nowT, { bagian: true })}, ${W.digital(nowT)}!`, ...HOME_LINES];
  const stars = Save.totalStars();
  const weakN = Save.data.weak.length;
  const owned = Save.data.clocks.length;
  const el = UI.el(`<section class="screen home">
    <div class="home-top">
      <span class="pill" title="Bintang terkumpul">${ICON.star}<b>${stars}</b></span>
      <button class="round-btn" data-act="settings" aria-label="Pengaturan">${ICON.gear}</button>
    </div>
    <h1 class="logo"><span class="l1">Jago</span><span class="l2">${'Jam'.split('').map((c) => `<i>${c}</i>`).join('')}</span></h1>
    <p class="tagline">Belajar membaca jam bareng Jago si ayam jago!</p>
    ${Jago.html(lines[0], 'hero')}
    <button class="btn huge go" data-act="play" data-autofocus>${ICON.play} Ayo Main!</button>
    <div class="menu-grid">
      <button class="menu-card c-orange" data-act="test">${ICON.test}<b>Tes Waktu</b><small>Kumpulkan nilai 100</small></button>
      <button class="menu-card c-purple" data-act="jadwal">${ICON.calendar}<b>Jadwal Jago</b><small>Urutkan kegiatan Jago</small></button>
      <button class="menu-card c-pink" data-act="ulang">${ICON.redo}<b>Ulangi Soal Salah</b><small>${weakN ? `${weakN} soal menunggu` : 'Belum ada'}</small></button>
      <button class="menu-card c-blue" data-act="koleksi">${ICON.clock}<b>Koleksi Jam</b><small>${owned} dari ${CLOCK_ORDER.length}</small>${Save.data.newClock ? '<span class="badge">Baru</span>' : ''}</button>
    </div>
  </section>`);
  const box = $('.jago-box', el);
  Jago.wire(box, lines);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    Sound.init(); Sound.tap();
    const a = b.dataset.act;
    if (a === 'play') UI.go('map');
    if (a === 'test') UI.go('testSetup');
    if (a === 'jadwal') UI.go('jadwal');
    if (a === 'ulang') {
      if (!Save.data.weak.length) UI.toast('Belum ada soal yang salah. Hebat!');
      else UI.go('play', ulangParams());
    }
    if (a === 'koleksi') UI.go('koleksi');
    if (a === 'settings') openSettings();
  });
  return { el, sky: W.bagian(nowT) };
};

// ---------- Jalan Waktu: tujuh bab dari subuh sampai malam ----------
const MAP_SKY = ['pagi', 'pagi', 'pagi', 'siang', 'siang', 'sore', 'malam'];
Screens.map = () => {
  const firstOpen = UNITS.findIndex((u) => Save.unitStars(u.id) < 12);
  const el = UI.el(`<section class="screen map">
    ${UI.header('Jalan Waktu', `<span class="pill">${ICON.star}<b>${Save.totalStars()}</b></span>`)}
    <p class="map-intro">Ikuti jalan Jago dari pagi sampai malam. Tiap pos punya 4 kegiatan.</p>
    <ol class="path">
      ${UNITS.map((u, k) => `<li class="stop ${k % 2 ? 'right' : 'left'} ${Save.data.lastUnit === k ? 'last' : ''}" style="--c:${u.color}">
        <button class="stop-btn" data-u="${k}">
          <span class="stop-ico">${miniClockSVG(k === 0 ? 180 : k === 1 ? 450 : k === 2 ? 525 : k === 3 ? 580 : k === 4 ? 617 : k === 5 ? 900 : 690, Save.data.skin)}</span>
          <span class="stop-txt"><b>${k + 1}. ${u.name}</b><small>${u.sub}</small>${UI.stars(Math.round(Save.unitStars(u.id) / 4), 3)}<em>${Save.unitStars(u.id)} / 12 bintang</em></span>
          ${k === firstOpen ? '<span class="here">Mulai di sini</span>' : ''}
        </button>
        <span class="time-of-day">${BAGIAN_ICON[MAP_SKY[k]]}</span>
      </li>`).join('')}
    </ol>
  </section>`);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-u], [data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'back') { UI.back(); return; }
    const k = +b.dataset.u;
    Save.data.lastUnit = k; Save.save();
    UI.go('unit', { k });
  });
  return { el, sky: 'pagi' };
};

// ---------- Halaman bab: empat kegiatan ----------
const ACT_ICON = { learn: ICON.book, read: ICON.clock, set: ICON.hand, type: ICON.keys };
const ACT_DESC = {
  learn: 'Jago menjelaskan pelan-pelan',
  read: 'Lihat jamnya, pilih jawabannya',
  set: 'Tarik jarum ke waktu yang diminta',
  type: 'Tulis jamnya pakai angka',
};
Screens.unit = ({ k }) => {
  const u = UNITS[k];
  const el = UI.el(`<section class="screen unit" style="--c:${u.color}">
    ${UI.header(`${k + 1}. ${u.name}`, `<span class="pill">${ICON.star}<b>${Save.unitStars(u.id)}/12</b></span>`)}
    <p class="unit-sub">${u.sub}</p>
    <div class="acts">
      ${ACTS.map((a) => `<button class="act-card" data-a="${a}">
        <span class="act-ico">${ACT_ICON[a]}</span>
        <span class="act-txt"><b>${ACT_NAME[a]}</b><small>${ACT_DESC[a]}</small></span>
        ${UI.stars(Save.starOf(u.id, a))}
      </button>`).join('')}
    </div>
  </section>`);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a], [data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'back') { UI.back(); return; }
    const a = b.dataset.a;
    if (a === 'learn') UI.go('learn', { unit: u.id });
    else UI.go('play', { unit: u.id, kind: a, mode: 'unit' });
  });
  return { el, sky: MAP_SKY[k] };
};

// ================= Belajar =================
// tiap langkah: text, t (waktu di jam), glow (jarum yang berdenyut), mark (angka yang ditandai)
// langkah terakhir: try (waktu yang harus dipasang anak sendiri)
const LESSONS = {
  tepat: [
    { text: 'Ini jam dinding. Jam punya dua jarum: satu pendek, satu panjang.', t: 180 },
    { text: 'Jarum PENDEK menunjukkan JAM.', t: 180, glow: 'hour' },
    { text: 'Jarum PANJANG menunjukkan MENIT.', t: 180, glow: 'minute' },
    { text: 'Kalau jarum panjang tepat di angka 12, artinya jam TEPAT.', t: 180, glow: 'minute', mark: [12] },
    { text: 'Jarum pendek di angka 3. Jadi sekarang jam tiga tepat, ditulis 03.00.', t: 180, glow: 'hour', mark: [3] },
    { text: 'Jarum pendek di angka 7, jarum panjang di 12. Jam tujuh tepat, 07.00.', t: 420, glow: 'both', mark: [7, 12] },
    { text: 'Kalau dua jarum sama-sama di angka 12, itu jam dua belas tepat, 12.00.', t: 720, glow: 'both', mark: [12] },
    { try: 540, text: 'Sekarang giliranmu! Putar jarum ke jam sembilan tepat.' },
  ],
  setengah: [
    { text: 'Jarum panjang butuh 60 menit untuk berputar satu kali.', t: 420, glow: 'minute' },
    { text: 'Setengah putaran, jarum panjang sampai di angka 6. Artinya sudah lewat 30 menit.', t: 450, glow: 'minute', mark: [6] },
    { text: 'Lihat jarum pendek: sudah lewat angka 7, setengah jalan ke angka 8.', t: 450, glow: 'hour', mark: [7, 8] },
    { text: 'Kita bilang jam SETENGAH DELAPAN, karena setengah jam lagi jam delapan. Ditulis 07.30.', t: 450, glow: 'both', mark: [6, 8] },
    { text: 'Jangan sampai ketukar ya! Setengah delapan itu 07.30, bukan 08.30.', t: 450, mark: [7, 8] },
    { text: 'Ini jam setengah tiga, ditulis 02.30.', t: 150, glow: 'both', mark: [2, 3, 6] },
    { try: 270, text: 'Giliranmu! Putar jarum ke jam setengah lima.' },
  ],
  seperempat: [
    { text: 'Satu jam bisa dibagi empat bagian sama besar. Tiap bagian 15 menit, namanya seperempat jam.', t: 480, mark: [3, 6, 9, 12] },
    { text: 'Jarum panjang di angka 3 artinya LEWAT SEPEREMPAT. Jam delapan lewat seperempat, 08.15.', t: 495, glow: 'minute', mark: [3] },
    { text: 'Jarum panjang di angka 9 artinya KURANG SEPEREMPAT. Tinggal 15 menit lagi ke jam sembilan, jadi jam sembilan kurang seperempat, 08.45.', t: 525, glow: 'minute', mark: [9] },
    { text: 'Gampangnya: angka 3 itu lewat, angka 9 itu kurang.', t: 525, mark: [3, 9] },
    { text: 'Jam sepuluh lewat seperempat, 10.15.', t: 615, glow: 'both', mark: [3, 10] },
    { text: 'Jam dua kurang seperempat, 01.45.', t: 105, glow: 'both', mark: [9, 2] },
    { try: 225, text: 'Giliranmu! Putar jarum ke jam empat kurang seperempat.' },
  ],
  limamenit: [
    { text: 'Untuk jarum panjang, tiap angka berarti 5 menit. Lihat angka kecil di pinggir jam.', t: 60, glow: 'minute', helper: true },
    { text: 'Angka 1 itu 5 menit, angka 2 itu 10 menit, angka 3 itu 15 menit. Hitung lompat lima!', t: 75, glow: 'minute', mark: [1, 2, 3], helper: true },
    { text: 'Jarum panjang di angka 4: empat kali lima, 20 menit. Jam satu lewat dua puluh menit, 01.20.', t: 80, glow: 'minute', mark: [4], helper: true },
    { text: 'Kalau jarum panjang sudah lewat angka 6, kita pakai KURANG. Di angka 10, tinggal 10 menit lagi ke angka 12.', t: 110, glow: 'minute', mark: [10, 11, 12], helper: true },
    { text: 'Jadi ini jam dua kurang sepuluh menit, ditulis 01.50.', t: 110, glow: 'both', mark: [10, 2], helper: true },
    { text: 'Ini jam tujuh kurang dua puluh lima menit, 06.35.', t: 395, glow: 'both', mark: [7], helper: true },
    { try: 205, text: 'Giliranmu! Putar jarum ke 03.25, jam tiga lewat dua puluh lima menit.' },
  ],
  menit: [
    { text: 'Di antara dua angka ada garis-garis kecil. Tiap garis kecil itu 1 menit.', t: 120, glow: 'minute', helper: true },
    { text: 'Caranya: hitung angkanya dulu (lompat lima), lalu tambah garis kecilnya.', t: 137, glow: 'minute', mark: [3], helper: true },
    { text: 'Angka 3 itu 15 menit, lebih 2 garis jadi 17 menit. Jam dua lewat tujuh belas menit, 02.17.', t: 137, glow: 'both', mark: [3, 2], helper: true },
    { text: 'Angka 8 itu 40 menit, lebih 2 garis jadi 42 menit. Ditulis 09.42, atau jam sepuluh kurang delapan belas menit.', t: 582, glow: 'both', mark: [8, 10], helper: true },
    { try: 248, snap: 1, text: 'Giliranmu! Putar jarum ke 04.08. Hitung garisnya pelan-pelan.' },
  ],
  harian: [
    { text: 'Satu hari ada 24 jam, jadi jarum pendek berputar dua kali dalam sehari.', t: 0, sky: 'malam' },
    { text: 'Putaran pertama dari tengah malam sampai siang: 00.00 sampai 11.59. Jago bangun jam lima pagi, 05.00.', t: 300, sky: 'pagi', glow: 'hour' },
    { text: 'Putaran kedua dari siang sampai tengah malam. Angkanya diteruskan: 13, 14, sampai 23.', t: 780, sky: 'siang', glow: 'hour' },
    { text: 'Jam dua belas siang tetap ditulis 12.00, dan jam setengah satu siang ditulis 12.30.', t: 750, sky: 'siang', glow: 'both', mark: [12, 1, 6] },
    { text: 'Mulai jam satu siang, caranya tambah 12. Jam tiga sore itu 3 + 12 = 15, ditulis 15.00.', t: 900, sky: 'sore', glow: 'hour', mark: [3] },
    { text: 'Pagi: 04.00 sampai 10.59. Siang: 11.00 sampai 14.59. Sore: 15.00 sampai 17.59. Malam: 18.00 sampai 03.59.', t: 900, sky: 'sore' },
    { text: 'Jago makan malam jam tujuh malam: 7 + 12 = 19, ditulis 19.00.', t: 1140, sky: 'malam', glow: 'both', mark: [7] },
    { try: 1260, text: 'Giliranmu! Jago tidur jam sembilan malam, 21.00. Putar jarumnya!' },
  ],
  lama: [
    { text: 'Berapa lama? Hitung dari jam mulai sampai jam selesai.', t: 480 },
    { text: 'Jago mulai belajar pukul 08.00. Kalau jarum panjang berputar satu kali penuh, lewat 1 jam.', t: 540, from: 480, glow: 'minute' },
    { text: 'Lalu jarum panjang jalan lagi sampai angka 6: lewat 30 menit lagi.', t: 570, from: 540, glow: 'minute', mark: [6] },
    { text: 'Jadi Jago belajar 1 jam 30 menit, dari 08.00 sampai 09.30.', t: 570, glow: 'both' },
    { text: 'Tips: hitung jam penuhnya dulu, baru tambah menitnya.', t: 570 },
    { try: 945, from: 900, text: 'Giliranmu! Jago main mulai 15.00 selama 45 menit. Putar jarum ke jam selesai.' },
  ],
};

Screens.learn = ({ unit }) => {
  const steps = LESSONS[unit];
  const u = UNITS.find((x) => x.id === unit);
  let s = 0, clock = null, done = false, alive = true;
  const el = UI.el(`<section class="screen learn" style="--c:${u.color}">
    ${UI.header(`Belajar · ${u.name}`, `<span class="count">1 / ${steps.length}</span>`)}
    <div class="learn-card">
      <div class="learn-clock"></div>
      <div class="learn-side">
        ${Jago.html('', 'learn-jago')}
        <div class="learn-btns">
          <button class="round-btn" data-act="prev" aria-label="Sebelumnya">${ICON.left}</button>
          <button class="round-btn speak" data-act="speak" aria-label="Dengarkan">${ICON.sound}</button>
          <button class="btn go" data-act="next">Lanjut ${ICON.right}</button>
        </div>
      </div>
    </div>
  </section>`);
  const box = $('.jago-box', el);
  Jago.wire(box);
  const scr = { el, sky: 'pagi' };

  const makeClock = (st) => {
    if (clock) clock.destroy();
    clock = Clock.create($('.learn-clock', el), {
      t: st.try !== undefined ? (st.from !== undefined ? st.from : (st.try + 330) % 720) : (st.from !== undefined ? st.from : st.t),
      interactive: st.try !== undefined,
      snap: st.snap || 5,
      helper: st.helper || Save.data.settings.helper,
      label: 'Jam latihan, putar jarumnya',
    });
  };

  const show = async () => {
    const st = steps[s];
    $('.count', el).textContent = `${s + 1} / ${steps.length}`;
    $('[data-act="prev"]', el).disabled = s === 0;
    const next = $('[data-act="next"]', el);
    UI.sky(st.sky || (unit === 'harian' && st.try !== undefined ? 'malam' : 'pagi'));
    const wantHelper = !!(st.helper || Save.data.settings.helper);
    if (!clock || st.try !== undefined || clock.helper !== wantHelper || clock.interactive) {
      makeClock(st);
      clock.helper = wantHelper;
      clock.interactive = st.try !== undefined;
    }
    Jago.say(box, st.text, Save.data.settings.voice);
    if (st.try !== undefined) {
      next.innerHTML = `${ICON.check} Cek`;
      next.dataset.mode = 'check';
      clock.glow(null); clock.mark([]);
      $('.learn-clock', el).classList.add('try');
      return;
    }
    $('.learn-clock', el).classList.remove('try');
    next.innerHTML = `Lanjut ${ICON.right}`;
    next.dataset.mode = 'next';
    clock.glow(st.glow || null);
    clock.mark(st.mark || []);
    if (st.from !== undefined) { clock.set(st.from); await wait(400); if (!alive || steps[s] !== st) return; }
    clock.set(st.t, { animate: true });
  };

  const check = async () => {
    const st = steps[s];
    if (W.samaDiJarum(clock.t, st.try)) {
      Sound.good(); Jago.mood(box, 'happy'); Jago.crow(box);
      const is24 = unit === 'harian' || unit === 'lama';
      Jago.say(box, `Benar! Itu ${W.kata(st.try, { bagian: is24 })}, ${W.digital(st.try, is24)}. Kamu jago!`, Save.data.settings.voice);
      const gained = Save.setStar(unit, 'learn', 3);
      const fresh = checkClocks();
      if (fresh.length) setTimeout(() => { Sound.alarm(0.6); UI.toast(`Jam baru: ${ClockSkins[fresh[0]].name}`, 'gold'); }, 900);
      if (gained) UI.toast(`+${gained} bintang!`, 'gold');
      UI.confetti();
      done = true;
      const next = $('[data-act="next"]', el);
      next.innerHTML = `Selesai ${ICON.check}`;
      next.dataset.mode = 'done';
    } else {
      Sound.bad(); Jago.mood(box, 'sad');
      const hint = clock.t % 60 !== st.try % 60 ? 'Cek lagi jarum panjangnya (menit).' : 'Jarum panjangnya sudah benar. Cek jarum pendeknya (jam).';
      Jago.say(box, hint, Save.data.settings.voice);
      clock.el.classList.add('wrong'); setTimeout(() => clock.el.classList.remove('wrong'), 600);
    }
  };

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    Sound.tap();
    const a = b.dataset.act;
    if (a === 'back') UI.back();
    if (a === 'speak') { Sound.init(); Speech.say(steps[s].text); }
    if (a === 'prev' && s > 0) { s--; show(); }
    if (a === 'next') {
      if (b.dataset.mode === 'check') check();
      else if (b.dataset.mode === 'done' || done) UI.back();
      else if (s < steps.length - 1) { s++; show(); }
    }
  });
  scr.onKey = (e) => {
    if (e.key === 'ArrowRight' && document.activeElement !== (clock && clock.el)) { $('[data-act="next"]', el).click(); return true; }
    if (e.key === 'ArrowLeft' && document.activeElement !== (clock && clock.el)) { $('[data-act="prev"]', el).click(); return true; }
    return false;
  };
  scr.mounted = show;
  scr.destroy = () => { alive = false; if (clock) clock.destroy(); };
  return scr;
};

// parameter untuk Ulangi Soal Salah
function ulangParams() {
  const list = shuffle(Save.data.weak.slice()).slice(0, 10).map(fromWeak);
  return { unit: list[0].unit, kind: list[0].kind, list, mode: 'ulang', title: 'Ulangi Soal Salah' };
}
