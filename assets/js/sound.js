'use strict';
// ================= Suara: musik, detak jam, kokok Jago, dan suara baca =================

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

const Sound = {
  ctx: null,
  lastTick: 0,

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    let ctx;
    try { ctx = this.ctx = new AC(); } catch { return; }
    this.master = ctx.createGain();
    this.master.gain.value = 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    this.master.connect(comp).connect(ctx.destination);
    this.fx = ctx.createGain();
    this.fx.gain.value = Save.data.settings.sfx ? 1 : 0;
    this.fx.connect(this.master);
    this.mus = ctx.createGain();
    this.mus.gain.value = Save.data.settings.music ? 0.2 : 0;
    this.mus.connect(this.master);
    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.startMusic();
  },

  setSfx(on) {
    Save.data.settings.sfx = on; Save.save();
    if (this.ctx) this.fx.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.03);
  },
  setMusic(on) {
    Save.data.settings.music = on; Save.save();
    if (this.ctx) this.mus.gain.setTargetAtTime(on ? 0.2 : 0, this.ctx.currentTime, 0.2);
  },

  // ---------- bahan dasar ----------
  kal(m, t, vol = 0.2, dest) {
    const ctx = this.ctx;
    if (!ctx) return;
    const f = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 3.01;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(vol * 0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); o2.connect(g2);
    g.connect(dest || this.fx); g2.connect(dest || this.fx);
    o.start(t); o.stop(t + 0.85); o2.start(t); o2.stop(t + 0.15);
  },
  tone(f0, f1, dur, type = 'sine', vol = 0.2, delay = 0, dest) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest || this.fx);
    o.start(t); o.stop(t + dur + 0.02);
  },
  // bunyi kayu: tok untuk detak jam
  wood(f, t, vol = 0.18, dest) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.05);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g).connect(dest || this.fx);
    o.start(t); o.stop(t + 0.08);
  },

  // ---------- efek ----------
  tap() { if (this.ctx) this.wood(1300, this.ctx.currentTime, 0.12); },
  // tik waktu jarum diputar (dibatasi supaya nggak berisik)
  tick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastTick < 0.035) return;
    this.lastTick = now;
    this.wood(this.tickHigh ? 2100 : 1700, now, 0.1);
    this.tickHigh = !this.tickHigh;
  },
  good() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [72, 76, 79, 84].forEach((m, i) => this.kal(m, t + i * 0.07, 0.22));
  },
  bad() {
    this.tone(330, 196, 0.32, 'triangle', 0.16);
    this.tone(311, 185, 0.32, 'triangle', 0.1, 0.02);
  },
  star(i = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.kal(84 + i * 3, t, 0.2);
    this.kal(91 + i * 3, t + 0.06, 0.12);
  },
  fanfare() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [67, 72, 76, 79, 84, 88].forEach((m, i) => this.kal(m, t + i * 0.09, 0.22));
    this.kal(60, t, 0.18); this.kal(64, t + 0.36, 0.16);
  },
  // jam weker berdering
  alarm(dur = 0.9) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let k = 0; k < dur / 0.06; k++) {
      const s = t + k * 0.06;
      this.tone(k % 2 ? 2350 : 2650, null, 0.05, 'square', 0.035, s - t);
    }
  },
  // kukuruyuk! empat suku kata dengan suara serak
  crow() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.02;
    const parts = [[0, 0.12, 620, 700], [0.15, 0.12, 640, 720], [0.31, 0.14, 700, 600], [0.48, 0.62, 760, 980, 640]];
    for (const [d, dur, f0, f1, f2] of parts) {
      const t = t0 + d;
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, t);
      if (f2) {
        o.frequency.linearRampToValueAtTime(f1, t + dur * 0.35);
        o.frequency.linearRampToValueAtTime(f2, t + dur);
      } else o.frequency.linearRampToValueAtTime(f1, t + dur);
      const vib = ctx.createOscillator(); vib.frequency.value = 22;
      const vg = ctx.createGain(); vg.gain.value = f2 ? 18 : 8;
      vib.connect(vg).connect(o.frequency);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.6;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.025);
      g.gain.setValueAtTime(0.32, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(bp).connect(lp).connect(g).connect(this.fx);
      o.start(t); o.stop(t + dur + 0.02); vib.start(t); vib.stop(t + dur + 0.02);
    }
  },

  // ---------- musik: kalimba santai dengan detak tik-tok ----------
  startMusic() {
    const ctx = this.ctx;
    if (!ctx || this.musicTimer) return;
    const scale = [60, 62, 64, 67, 69, 72, 74, 76];
    const chords = [[48, 55], [53, 60], [45, 52], [55, 62]];
    const beat = 0.42;
    let step = 0, next = ctx.currentTime + 0.1;
    let phrase = [0, 2, 4, 3, 2, 4, 5, 4];
    this.musicTimer = setInterval(() => {
      if (document.hidden) return;
      while (next < ctx.currentTime + 0.3) {
        const bar = Math.floor(step / 8) % 4;
        if (step % 8 === 0) {
          chords[bar].forEach((m) => this.kal(m, next, 0.11, this.mus));
          if (Math.random() < 0.5) phrase = phrase.map((x) => clamp(x + randi(-1, 1), 0, scale.length - 1));
        }
        if (step % 2 === 0 || Math.random() < 0.25) this.kal(scale[phrase[step % 8]] + (bar === 3 && step % 8 > 5 ? 12 : 0), next, 0.13, this.mus);
        this.wood(step % 2 ? 1500 : 1900, next, 0.05, this.mus);
        step++;
        next += beat;
      }
    }, 90);
  },
};

// ================= Suara baca (Web Speech API) =================
const Speech = {
  voice: null,
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  init() {
    if (!this.ok) return;
    const pickVoice = () => {
      const vs = speechSynthesis.getVoices();
      this.voice = vs.find((v) => /^id(-|_|$)/i.test(v.lang)) || vs.find((v) => /indones/i.test(v.name)) || null;
    };
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  },
  say(text) {
    if (!this.ok || !Save.data.settings.voice) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(ucapkan(text));
      u.lang = 'id-ID';
      if (this.voice) u.voice = this.voice;
      u.rate = 0.92;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch { /* perangkat tanpa suara baca */ }
  },
  stop() { if (this.ok) try { speechSynthesis.cancel(); } catch { /* abaikan */ } },
};
