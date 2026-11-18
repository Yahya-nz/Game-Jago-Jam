'use strict';
// ================= Gambar SVG: Jago, bingkai jam, ikon =================

// ---------- Jago si ayam jago ----------
// Ekspresi diatur lewat kelas: happy, sad, wow, crow. Sayap dan kepala bisa dianimasikan lewat CSS.
function jagoSVG(cls = '') {
  return `<svg class="jago ${cls}" viewBox="0 0 200 230" aria-hidden="true">
    <g class="tail">
      <path d="M58 132 C20 120 6 74 30 40 C40 70 52 92 74 110 Z" fill="#1e8f5a" stroke="#14653f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M62 128 C34 104 34 60 58 30 C60 64 70 88 84 106 Z" fill="#e8762d" stroke="#b3541a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M142 132 C180 120 194 74 170 40 C160 70 148 92 126 110 Z" fill="#1e8f5a" stroke="#14653f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M138 128 C166 104 166 60 142 30 C140 64 130 88 116 106 Z" fill="#2f6fd0" stroke="#1f4f9a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <g class="legs" stroke="#e8902a" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M84 186 V210 M84 210 l-11 7 M84 210 l0 9 M84 210 l11 7"/>
      <path d="M116 186 V210 M116 210 l-11 7 M116 210 l0 9 M116 210 l11 7"/>
    </g>
    <g class="body">
      <ellipse cx="100" cy="148" rx="58" ry="50" fill="#fff6e6" stroke="#e0b07a" stroke-width="3.5"/>
      <ellipse cx="100" cy="160" rx="34" ry="30" fill="#ffe2b8" opacity=".85"/>
      <g class="wing wing-l"><path d="M50 128 C30 140 30 172 54 182 C66 168 70 146 62 128 Z" fill="#f2a93b" stroke="#c87f1c" stroke-width="3" stroke-linejoin="round"/></g>
      <g class="wing wing-r"><path d="M150 128 C170 140 170 172 146 182 C134 168 130 146 138 128 Z" fill="#f2a93b" stroke="#c87f1c" stroke-width="3" stroke-linejoin="round"/></g>
    </g>
    <g class="head">
      <path class="comb" d="M76 52 C70 30 88 24 92 40 C92 20 112 18 110 40 C116 24 134 32 124 54 Z" fill="#e8413a" stroke="#b02a24" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="100" cy="80" r="40" fill="#fffaf0" stroke="#e0b07a" stroke-width="3.5"/>
      <ellipse cx="73" cy="94" rx="8" ry="5" fill="#ff9aa2" opacity=".75"/>
      <ellipse cx="127" cy="94" rx="8" ry="5" fill="#ff9aa2" opacity=".75"/>
      <g class="eyes eyes-open">
        <circle cx="84" cy="76" r="11" fill="#fff" stroke="#2d3436" stroke-width="2.5"/>
        <circle cx="116" cy="76" r="11" fill="#fff" stroke="#2d3436" stroke-width="2.5"/>
        <g class="pupils"><circle cx="85.5" cy="77.5" r="6" fill="#2d3436"/><circle cx="117.5" cy="77.5" r="6" fill="#2d3436"/>
        <circle cx="87.5" cy="75" r="2.2" fill="#fff"/><circle cx="119.5" cy="75" r="2.2" fill="#fff"/></g>
      </g>
      <g class="eyes eyes-happy" fill="none" stroke="#2d3436" stroke-width="4" stroke-linecap="round">
        <path d="M75 79 Q84 68 93 79"/><path d="M107 79 Q116 68 125 79"/>
      </g>
      <g class="eyes eyes-sad">
        <circle cx="84" cy="78" r="9" fill="#fff" stroke="#2d3436" stroke-width="2.5"/>
        <circle cx="116" cy="78" r="9" fill="#fff" stroke="#2d3436" stroke-width="2.5"/>
        <circle cx="84" cy="81" r="5" fill="#2d3436"/><circle cx="116" cy="81" r="5" fill="#2d3436"/>
        <path d="M72 66 L94 72 M128 66 L106 72" stroke="#2d3436" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <g class="beak">
        <path class="beak-low" d="M92 96 L108 96 L100 110 Z" fill="#e8902a" stroke="#b86a14" stroke-width="2.5" stroke-linejoin="round"/>
        <path class="beak-up" d="M90 88 L110 88 L100 101 Z" fill="#ffb93b" stroke="#c87f1c" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <path class="wattle" d="M96 104 C92 118 100 124 104 116 C106 110 104 106 103 103 Z" fill="#e8413a" stroke="#b02a24" stroke-width="2.5"/>
    </g>
    <g class="watch">
      <path d="M72 112 Q100 128 128 112" fill="none" stroke="#2f6fd0" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="134" r="13" fill="#fff" stroke="#c9961c" stroke-width="4"/>
      <circle cx="100" cy="119" r="3" fill="#c9961c"/>
      <path class="watch-hands" d="M100 134 V126 M100 134 L106 137" stroke="#2d3436" stroke-width="2.4" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// ---------- Bingkai jam (koleksi) ----------
// face/ink/hour/minute/rim dipakai muka jam; frame digambar di belakang muka jam.
const ClockSkins = {
  kayu: {
    name: 'Jam Dinding Kayu', note: 'Jam pertama Jago, tergantung di dinding kandang.',
    face: '#fffaf0', ink: '#3d2c1e', hour: '#3d2c1e', minute: '#d6453d', rim: '#8a5a32',
    frame: `<circle r="110" fill="#a8703f"/><circle r="110" fill="none" stroke="#6e4422" stroke-width="5"/>
      <circle r="98" fill="#c78a50"/><circle r="92" fill="#6e4422"/>
      <circle cx="0" cy="-104" r="3.5" fill="#6e4422"/><circle cx="0" cy="104" r="3.5" fill="#6e4422"/><circle cx="-104" cy="0" r="3.5" fill="#6e4422"/><circle cx="104" cy="0" r="3.5" fill="#6e4422"/>`,
  },
  weker: {
    name: 'Jam Weker', note: 'Bunyinya kring-kring, buat bangunin Jago kalau kesiangan.',
    face: '#ffffff', ink: '#2d3436', hour: '#2d3436', minute: '#e8413a', rim: '#e8413a',
    frame: `<path d="M-70 92 L-88 120 M70 92 L88 120" stroke="#2d3436" stroke-width="9" stroke-linecap="round"/>
      <path d="M-30 -112 Q0 -126 30 -112" stroke="#2d3436" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="-62" cy="-92" r="26" fill="#ffc83d" stroke="#c99a1c" stroke-width="5"/>
      <circle cx="62" cy="-92" r="26" fill="#ffc83d" stroke="#c99a1c" stroke-width="5"/>
      <circle r="106" fill="#e8413a" stroke="#a82820" stroke-width="5"/><circle r="94" fill="#ff7b6e"/>`,
  },
  saku: {
    name: 'Jam Saku Emas', note: 'Jam saku kakeknya Jago, dibuka pakai tutup bulat.',
    face: '#fff8e1', ink: '#4a3410', hour: '#4a3410', minute: '#2f6fd0', rim: '#c9961c',
    frame: `<circle cx="0" cy="-120" r="13" fill="none" stroke="#c9961c" stroke-width="6"/>
      <rect x="-9" y="-112" width="18" height="12" rx="3" fill="#e2b23a" stroke="#a87a12" stroke-width="3"/>
      <circle r="106" fill="#e2b23a" stroke="#a87a12" stroke-width="5"/><circle r="97" fill="#f5d36b"/>
      <circle r="92" fill="#c9961c"/>`,
  },
  kukuk: {
    name: 'Jam Kukuk', note: 'Tiap jam, burung kecil keluar dari pintu atas dan bilang kukuk.',
    face: '#fffaf0', ink: '#3d2c1e', hour: '#3d2c1e', minute: '#1e8f5a', rim: '#7a4a24',
    frame: `<path d="M-50 108 V150 M50 108 V150" stroke="#5a3418" stroke-width="3"/>
      <ellipse cx="-50" cy="158" rx="9" ry="16" fill="#8a5a32" stroke="#5a3418" stroke-width="3"/>
      <ellipse cx="50" cy="158" rx="9" ry="16" fill="#8a5a32" stroke="#5a3418" stroke-width="3"/>
      <path d="M-118 -60 L0 -150 L118 -60 Z" fill="#a8703f" stroke="#5a3418" stroke-width="5" stroke-linejoin="round"/>
      <rect x="-104" y="-70" width="208" height="186" rx="10" fill="#c78a50" stroke="#5a3418" stroke-width="5"/>
      <rect x="-16" y="-128" width="32" height="30" rx="4" fill="#5a3418"/>
      <path d="M-10 -112 q10 -10 20 0 q-10 6 -20 0" fill="#ffc83d"/>
      <circle r="96" fill="#7a4a24"/>`,
  },
  tangan: {
    name: 'Jam Tangan', note: 'Jam yang dipakai di pergelangan tangan, biar bisa dibawa ke mana-mana.',
    face: '#1f3a5f', ink: '#ffffff', hour: '#ffffff', minute: '#ffd32a', rim: '#9aa7b8',
    frame: `<rect x="-54" y="-150" width="108" height="80" rx="16" fill="#e8762d" stroke="#b3541a" stroke-width="5"/>
      <rect x="-54" y="70" width="108" height="80" rx="16" fill="#e8762d" stroke="#b3541a" stroke-width="5"/>
      <circle cx="0" cy="118" r="5" fill="#b3541a"/><circle cx="0" cy="136" r="5" fill="#b3541a"/>
      <rect x="104" y="-12" width="14" height="24" rx="4" fill="#9aa7b8" stroke="#6b7889" stroke-width="3"/>
      <circle r="106" fill="#c3cdd9" stroke="#6b7889" stroke-width="5"/><circle r="94" fill="#9aa7b8"/>`,
  },
  gadang: {
    name: 'Jam Gadang', note: 'Menara jam di Bukittinggi, Sumatra Barat. Atapnya bergonjong seperti rumah gadang, dan angka 4-nya ditulis IIII, bukan IV.',
    face: '#ffffff', ink: '#1d1d1d', hour: '#1d1d1d', minute: '#1d1d1d', rim: '#c8c2b4',
    frame: `<rect x="-112" y="-112" width="224" height="250" fill="#f3efe6" stroke="#9c9583" stroke-width="5"/>
      <path d="M-126 -110 Q-118 -150 -132 -186 Q-96 -150 -60 -146 Q-30 -172 0 -150 Q30 -172 60 -146 Q96 -150 132 -186 Q118 -150 126 -110 Z" fill="#2f2f2f" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-100 -120 Q0 -136 100 -120" stroke="#c9961c" stroke-width="5" fill="none"/>
      <rect x="-112" y="112" width="224" height="22" fill="#d9d2c2"/>
      <circle r="100" fill="#d9d2c2" stroke="#9c9583" stroke-width="5"/>`,
  },
  neon: {
    name: 'Jam Neon', note: 'Hadiah buat yang dapat nilai 100 di Tes Waktu. Nyala di malam hari!',
    face: '#14102b', ink: '#7df9ff', hour: '#ff4fd8', minute: '#7df9ff', rim: '#7df9ff',
    frame: `<circle r="108" fill="#0b0820"/><circle r="104" fill="none" stroke="#ff4fd8" stroke-width="5"/>
      <circle r="96" fill="none" stroke="#7df9ff" stroke-width="3"/>`,
  },
  bunga: {
    name: 'Jam Bunga', note: 'Hadiah buat yang menyelesaikan Jadwal Jago tiga kali.',
    face: '#fffdf5', ink: '#5b2a6e', hour: '#5b2a6e', minute: '#e84393', rim: '#ffb3d9',
    frame: Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-104" rx="22" ry="30" fill="${i % 2 ? '#ffb3d9' : '#ffd96b'}" stroke="#d1689f" stroke-width="3" transform="rotate(${i * 30})"/>`).join('') + '<circle r="94" fill="#ffe7f3"/>',
  },
};

// Syarat membuka tiap jam di Koleksi Jam
const CLOCK_ORDER = ['kayu', 'weker', 'saku', 'kukuk', 'tangan', 'gadang', 'neon', 'bunga'];
const CLOCK_RULES = {
  kayu: { need: 'Sudah punya', ok: () => true },
  weker: { need: 'Kumpulkan 8 bintang', ok: () => Save.totalStars() >= 8 },
  saku: { need: 'Kumpulkan 20 bintang', ok: () => Save.totalStars() >= 20 },
  kukuk: { need: 'Kumpulkan 35 bintang', ok: () => Save.totalStars() >= 35 },
  tangan: { need: 'Kumpulkan 50 bintang', ok: () => Save.totalStars() >= 50 },
  gadang: { need: 'Kumpulkan 70 bintang', ok: () => Save.totalStars() >= 70 },
  neon: { need: 'Dapat nilai 100 di Tes Waktu', ok: () => Save.data.tests.some((t) => t.score === 100) },
  bunga: { need: 'Selesaikan Jadwal Jago 3 kali', ok: () => Save.data.schedules >= 3 },
};

// buka jam baru kalau syaratnya terpenuhi; kembalikan daftar yang baru terbuka
function checkClocks() {
  const fresh = [];
  for (const id of CLOCK_ORDER) {
    if (!Save.data.clocks.includes(id) && CLOCK_RULES[id].ok()) { Save.data.clocks.push(id); fresh.push(id); }
  }
  if (fresh.length) { Save.data.newClock = true; Save.save(); }
  return fresh;
}

// jam kecil untuk kartu dan ikon
function miniClockSVG(t, skin = 'kayu') {
  const s = ClockSkins[skin] || ClockSkins.kayu;
  const m = t % 60, h = (t / 60) % 12;
  return `<svg viewBox="-125 -125 250 250" class="mini-clock" aria-hidden="true" style="--face:${s.face};--ink:${s.ink};--hour:${s.hour};--minute:${s.minute}">
    <g>${s.frame}</g><circle r="86" fill="${s.face}"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${(Math.sin(i * Math.PI / 6) * 72).toFixed(1)}" cy="${(-Math.cos(i * Math.PI / 6) * 72).toFixed(1)}" r="${i % 3 ? 4 : 7}" fill="${s.ink}"/>`).join('')}
    <path d="M-7 10 L-5 -42 Q0 -52 5 -42 L7 10 Z" fill="${s.hour}" transform="rotate(${h * 30})"/>
    <path d="M-5 12 L-3 -68 Q0 -76 3 -68 L5 12 Z" fill="${s.minute}" transform="rotate(${m * 6})"/>
    <circle r="9" fill="${s.ink}"/></svg>`;
}

// ---------- Ikon ----------
const ICON = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z" fill="currentColor"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  test: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9 3.5h6v3H9z" fill="currentColor"/><path d="M8.5 13l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="8.5" cy="14.5" r="1.5" fill="currentColor"/><circle cx="12.5" cy="14.5" r="1.5" fill="currentColor"/></svg>',
  redo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.4-5.7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C7 4 10 4 12 6c2-2 5-2 8-.5V19c-3-1.5-6-1.5-8 .5-2-2-5-2-8-.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 6v13.5" stroke="currentColor" stroke-width="2.2"/></svg>',
  hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 12V5.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M15.5 4.5a8.5 8.5 0 0 1 4 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.8 6.3l-.3 3.3-3.1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  keys: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M7 10h.01M10.5 10h.01M14 10h.01M17.5 10h.01M8 14h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  erase: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h11v14H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 9.5l5 5M17 9.5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="currentColor"/></svg>',
};

// ikon bagian hari
const BAGIAN_ICON = { pagi: ICON.sun, siang: ICON.sun, sore: ICON.sun, malam: ICON.moon };
