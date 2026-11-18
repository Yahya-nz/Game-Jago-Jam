'use strict';
// ================= Mulai: latar, tombol keyboard, dan layar pertama =================

UI.init();
try { Speech.init(); } catch { Speech.ok = false; }

// suara baru boleh nyala setelah ada sentuhan, klik, atau tombol ditekan
const wake = () => Sound.init();
window.addEventListener('pointerdown', wake, { once: true });
window.addEventListener('keydown', wake, { once: true });

document.addEventListener('visibilitychange', () => {
  if (!Sound.ctx) return;
  if (document.hidden) Sound.ctx.suspend(); else Sound.ctx.resume();
});

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const modal = $('.modal-bg');
  if (modal) {
    if (e.key === 'Escape') {
      e.preventDefault();
      const close = $('[data-act="close"]', modal) || $('.modal-btns .btn:last-child', modal);
      if (close) close.click();
    }
    return;
  }
  const scr = UI.cur && UI.cur.scr;
  if (scr && scr.onKey && scr.onKey(e)) { e.preventDefault(); return; }
  if (e.key === 'Escape' && UI.cur && UI.cur.name !== 'home') { e.preventDefault(); Sound.tap(); UI.back(); }
});

// jam di lumbung menunjukkan jam sungguhan saat ini
function tickBarnClock() {
  const now = new Date();
  const h = now.getHours() % 12, m = now.getMinutes();
  const g = document.getElementById('barn-clock');
  if (!g) return;
  g.querySelector('.bh').setAttribute('transform', `rotate(${(h + m / 60) * 30})`);
  g.querySelector('.bm').setAttribute('transform', `rotate(${m * 6})`);
}
tickBarnClock();
setInterval(tickBarnClock, 20000);

UI.go('home');

// pegangan untuk tes otomatis
window.__jago = { UI, Save, W, Q, Screens, ClockSkins, checkClocks };
