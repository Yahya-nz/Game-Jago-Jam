'use strict';
// ================= Tes Waktu, Jadwal Jago, Koleksi Jam, dan Pengaturan =================

// ---------- Tes Waktu: atur dulu ----------
Screens.testSetup = () => {
  const started = UNITS.filter((u) => Save.unitStars(u.id) > 0).map((u) => u.id);
  let pickU = new Set(started.length ? started : ['tepat', 'setengah', 'seperempat']);
  let n = 10;
  const el = UI.el(`<section class="screen test-setup">
    ${UI.header('Tes Waktu')}
    <div class="panel">
      <h2>Bab yang mau dites</h2>
      <div class="chips">${UNITS.map((u) => `<button class="chip" data-u="${u.id}" aria-pressed="${pickU.has(u.id)}" style="--c:${u.color}">${u.name}</button>`).join('')}</div>
      <h2>Jumlah soal</h2>
      <div class="chips">${[10, 20].map((x) => `<button class="chip" data-n="${x}" aria-pressed="${x === n}">${x} soal</button>`).join('')}</div>
      <p class="note">Soalnya campur: baca jam, putar jarum, dan ketik jam. Nilainya 0 sampai 100.</p>
      <button class="btn huge go" data-act="start" data-autofocus>${ICON.play} Mulai Tes</button>
    </div>
    ${Save.data.tests.length ? `<div class="panel"><h2>Nilai terakhir</h2><div class="history">${Save.data.tests.slice(-10).map((t) => `<span class="bar" style="--h:${Math.max(6, t.score)}%" title="${t.score}"><b>${t.score}</b></span>`).join('')}</div></div>` : ''}
  </section>`);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-u], [data-n], [data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'back') { UI.back(); return; }
    if (b.dataset.u) {
      const id = b.dataset.u;
      if (pickU.has(id)) { if (pickU.size > 1) pickU.delete(id); } else pickU.add(id);
      $$('[data-u]', el).forEach((c) => c.setAttribute('aria-pressed', String(pickU.has(c.dataset.u))));
    }
    if (b.dataset.n) {
      n = +b.dataset.n;
      $$('[data-n]', el).forEach((c) => c.setAttribute('aria-pressed', String(+c.dataset.n === n)));
    }
    if (b.dataset.act === 'start') {
      const units = [...pickU];
      const kinds = ['read', 'set', 'type'];
      const list = Array.from({ length: n }, (_, k) => Q.make(units[k % units.length], kinds[(k + Math.floor(k / units.length)) % 3]));
      shuffle(list);
      UI.go('play', {
        unit: list[0].unit, kind: list[0].kind, list, mode: 'test', title: 'Tes Waktu',
        onDone: (r) => UI.go('testResult', { ...r, units }, { replace: true }),
      });
    }
  });
  return { el, sky: 'siang' };
};

Screens.testResult = ({ correct, n, missed }) => {
  const score = Math.round((correct / n) * 100);
  Save.data.tests.push({ score, n, at: Date.now() });
  Save.data.tests = Save.data.tests.slice(-10);
  Save.save();
  const fresh = checkClocks();
  const msg = score === 100 ? 'Nilai sempurna! Kukuruyuk!' : score >= 80 ? 'Hebat! Kamu sudah jago baca jam.' : score >= 60 ? 'Lumayan! Ulangi soal yang salah, ya.' : 'Ayo belajar lagi bareng Jago!';
  const el = UI.el(`<section class="screen result">
    ${UI.header('Nilai Tes Waktu')}
    <div class="result-card">
      ${Jago.html(msg, 'big')}
      <div class="big-score" aria-label="Nilai ${score}"><b>${score}</b><small>dari 100</small></div>
      <p class="score">${correct} dari ${n} benar di percobaan pertama</p>
      ${missed.length ? `<div class="missed"><h3>Yang perlu diingat</h3><ul>${missed.slice(0, 8).map((q) => `<li>${q.unit === 'lama' && q.kind === 'read' ? `${W.digital(q.start)} sampai ${W.digital(q.t)} = <b>${W.lama(q.d)}</b>` : `<span class="mini">${miniClockSVG(q.t % 720, Save.data.skin)}</span><b>${W.digital(q.t, q.unit === 'harian' || q.unit === 'lama')}</b> ${W.kata(q.t, { bagian: q.unit === 'harian' })}`}</li>`).join('')}</ul></div>` : ''}
      ${fresh.length ? `<p class="new-clock">${ICON.clock} Jam baru di koleksi: ${fresh.map((f) => ClockSkins[f].name).join(', ')}!</p>` : ''}
      <div class="result-btns">
        <button class="btn" data-act="again">${ICON.redo} Tes lagi</button>
        <button class="btn go" data-act="home" data-autofocus>Beranda</button>
      </div>
    </div>
  </section>`);
  const box = $('.jago-box', el);
  Jago.wire(box, PRAISE);
  const scr = { el, sky: score >= 80 ? 'pagi' : 'sore' };
  scr.mounted = () => {
    if (score >= 80) { UI.confetti(score === 100 ? 120 : 60); Sound.fanfare(); Jago.crow(box); } else Sound.good();
    if (fresh.length) setTimeout(() => { Sound.alarm(0.6); UI.toast(`Jam baru: ${ClockSkins[fresh[0]].name}`, 'gold'); }, 900);
  };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'back' || b.dataset.act === 'again') UI.go('testSetup', {}, { replace: true });
    if (b.dataset.act === 'home') UI.home();
  });
  return scr;
};

// ---------- Jadwal Jago: urutkan kegiatan dari pagi sampai malam ----------
Screens.jadwal = ({ hard = false } = {}) => {
  let day = [], placed = 0, busy = false;
  const el = UI.el(`<section class="screen jadwal">
    ${UI.header('Jadwal Jago', `<button class="chip small" data-act="mode" aria-pressed="${hard}">Sulit</button>`)}
    <div class="panel">
      ${Jago.html('Bantu aku urutkan kegiatanku dari pagi sampai malam!', 'small inline')}
      <ol class="timeline"></ol>
      <p class="note">Ketuk kegiatan yang paling pagi dulu.</p>
      <div class="cards"></div>
    </div>
  </section>`);
  const box = $('.jago-box', el);
  Jago.wire(box);

  const newDay = () => {
    const used = new Set(), times = new Set();
    day = [];
    let guard = 0;
    while (day.length < 5 && guard++ < 200) {
      const k = kegiatanAcak(hard ? 5 : 15);
      if (used.has(k.a) || times.has(k.t)) continue;
      used.add(k.a); times.add(k.t);
      day.push(k);
    }
    placed = 0; busy = false;
    const order = day.slice().sort((a, b) => a.t - b.t);
    day.forEach((d) => { d.rank = order.indexOf(d); });
    $('.timeline', el).innerHTML = day.map((_, k) => `<li class="slot"><span class="num">${k + 1}</span><span class="slot-txt">?</span></li>`).join('');
    $('.cards', el).innerHTML = shuffle(day.slice()).map((d) => `<button class="sched-card ${W.bagian(d.t)}" data-t="${d.t}">
      <span class="sc-clock">${miniClockSVG(d.t % 720, Save.data.skin)}</span>
      <span class="sc-txt"><b>${d.a.replace('Jago ', '')}</b>${hard ? `<small class="bagian">${BAGIAN_ICON[W.bagian(d.t)]}${W.bagian(d.t)}</small>` : `<small>${W.digital(d.t)} · ${W.bagian(d.t)}</small>`}</span>
    </button>`).join('');
    Jago.say(box, 'Bantu aku urutkan kegiatanku dari pagi sampai malam!');
  };

  const tapCard = async (btn) => {
    if (busy || btn.disabled) return;
    const t = +btn.dataset.t;
    const d = day.find((x) => x.t === t);
    if (d.rank === placed) {
      Sound.good();
      btn.disabled = true;
      btn.classList.add('placed');
      const slot = $$('.slot', el)[placed];
      slot.classList.add('filled', W.bagian(t));
      $('.slot-txt', slot).innerHTML = `<b>${W.digital(t)}</b> ${d.a.replace('Jago ', '')}`;
      placed++;
      Jago.mood(box, 'happy', 600);
      if (placed === day.length) {
        busy = true;
        Save.data.schedules++;
        Save.save();
        const fresh = checkClocks();
        Jago.crow(box);
        Jago.say(box, 'Kukuruyuk! Jadwalku sudah urut. Terima kasih!', Save.data.settings.voice);
        UI.confetti();
        if (fresh.length) setTimeout(() => { Sound.alarm(0.6); UI.toast(`Jam baru: ${ClockSkins[fresh[0]].name}`, 'gold'); }, 800);
        $('.cards', el).innerHTML = `<div class="done-row"><button class="btn go" data-act="again" data-autofocus>${ICON.redo} Hari baru</button><button class="btn" data-act="back2">Kembali</button></div>`;
      }
    } else {
      Sound.bad();
      Jago.mood(box, 'sad', 800);
      const first = day.find((x) => x.rank === placed);
      Jago.say(box, t < first.t ? 'Hmm, coba cek lagi jamnya.' : `Belum. Masih ada kegiatan yang lebih pagi dari ${W.digital(t)}.`);
      btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 500);
    }
  };

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act], .sched-card');
    if (!b) return;
    if (b.classList.contains('sched-card')) { tapCard(b); return; }
    Sound.tap();
    const a = b.dataset.act;
    if (a === 'back' || a === 'back2') UI.back();
    if (a === 'again') newDay();
    if (a === 'mode') { UI.go('jadwal', { hard: !hard }, { replace: true }); }
  });
  const scr = { el, sky: 'pagi' };
  scr.mounted = newDay;
  return scr;
};

// ---------- Koleksi Jam ----------
Screens.koleksi = () => {
  Save.data.newClock = false; Save.save();
  const el = UI.el(`<section class="screen koleksi">
    ${UI.header('Koleksi Jam', `<span class="pill">${Save.data.clocks.length} / ${CLOCK_ORDER.length}</span>`)}
    <p class="map-intro">Jam yang dipakai di sini jadi jam di semua permainan.</p>
    <div class="clock-grid">${CLOCK_ORDER.map((id) => {
      const own = Save.data.clocks.includes(id), s = ClockSkins[id];
      return `<button class="clock-card ${own ? '' : 'locked'} ${Save.data.skin === id ? 'on' : ''}" data-id="${id}" ${own ? '' : 'aria-disabled="true"'}>
        <span class="cc-art">${miniClockSVG(610, id)}</span>
        <b>${own ? s.name : 'Terkunci'}</b>
        <small>${own ? (Save.data.skin === id ? 'Sedang dipakai' : 'Ketuk untuk pakai') : CLOCK_RULES[id].need}</small>
      </button>`;
    }).join('')}</div>
    <p class="clock-note" aria-live="polite"></p>
  </section>`);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-id], [data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'back') { UI.back(); return; }
    const id = b.dataset.id;
    const s = ClockSkins[id];
    if (!Save.data.clocks.includes(id)) {
      $('.clock-note', el).textContent = `${CLOCK_RULES[id].need} untuk membuka jam ini.`;
      return;
    }
    Save.data.skin = id; Save.save();
    if (id === 'weker') Sound.alarm(0.7); else if (id === 'kukuk') Sound.crow(); else Sound.good();
    $$('.clock-card', el).forEach((c) => {
      const on = c.dataset.id === id;
      c.classList.toggle('on', on);
      if (Save.data.clocks.includes(c.dataset.id)) $('small', c).textContent = on ? 'Sedang dipakai' : 'Ketuk untuk pakai';
    });
    $('.clock-note', el).textContent = `${s.name}: ${s.note}`;
  });
  return { el, sky: 'siang' };
};

// ---------- Pengaturan ----------
function openSettings() {
  const st = Save.data.settings;
  const row = (id, label, on) => `<label class="toggle-row" for="${id}"><span>${label}</span><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><i class="sw" aria-hidden="true"></i></label>`;
  const bg = UI.el(`<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="set-t">
    <h2 id="set-t">Pengaturan</h2>
    <div class="modal-body settings">
      ${row('set-music', 'Musik', st.music)}
      ${row('set-sfx', 'Efek suara', st.sfx)}
      ${row('set-voice', 'Suara baca soal', st.voice)}
      ${row('set-helper', 'Angka menit di pinggir jam', st.helper)}
      ${Speech.ok ? '' : '<p class="note">Perangkat ini belum punya suara baca bahasa Indonesia.</p>'}
      <button class="btn danger small" data-act="reset">Hapus semua kemajuan</button>
    </div>
    <div class="modal-btns"><button class="btn go" data-act="close">Tutup</button></div>
  </div></div>`);
  document.body.appendChild(bg);
  UI.lockBehind(true);
  $('#set-music', bg).addEventListener('change', (e) => { Sound.init(); Sound.setMusic(e.target.checked); });
  $('#set-sfx', bg).addEventListener('change', (e) => { Sound.init(); Sound.setSfx(e.target.checked); });
  $('#set-voice', bg).addEventListener('change', (e) => { st.voice = e.target.checked; Save.save(); if (!st.voice) Speech.stop(); });
  $('#set-helper', bg).addEventListener('change', (e) => { st.helper = e.target.checked; Save.save(); });
  bg.addEventListener('click', async (e) => {
    if (e.target === bg) { $('[data-act="close"]', bg).click(); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    Sound.tap();
    if (b.dataset.act === 'close') { bg.remove(); UI.lockBehind(false); UI.go('home', {}, { replace: true }); }
    if (b.dataset.act === 'reset') {
      bg.remove();
      UI.lockBehind(false);
      const i = await UI.modal({ title: 'Hapus kemajuan?', body: '<p>Semua bintang, nilai tes, dan koleksi jam akan hilang.</p>', buttons: [{ label: 'Hapus', cls: 'danger' }, { label: 'Batal', cls: 'go' }] });
      if (i === 0) {
        const settings = Save.data.settings;
        Save.data = Save.fresh();
        Save.data.settings = settings;
        Save.save();
        UI.toast('Kemajuan sudah dihapus');
      }
      UI.home();
    }
  });
  $('#set-music', bg).focus();
}
