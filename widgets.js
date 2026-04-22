// widgets.js — Floating draggable widgets
// 1. Suba (Colombia) clock, always visible, themed
// 2. Pomodoro mini-widget, only visible while pomState is running/paused

// ---------- POSITION PERSISTENCE ----------
const WIDGET_POS_KEY = 'tomog_widget_pos_v1';
let widgetPositions = (() => {
  try { return JSON.parse(localStorage.getItem(WIDGET_POS_KEY)) || {}; }
  catch (e) { return {}; }
})();
function saveWidgetPositions() {
  try { localStorage.setItem(WIDGET_POS_KEY, JSON.stringify(widgetPositions)); }
  catch (e) {}
}

function makeDraggable(el, id) {
  let dragging = false;
  let moved = false;
  let offX = 0, offY = 0;

  const onDown = (ev) => {
    if (ev.target && ev.target.closest('[data-widget-nodrag]')) return;
    dragging = true;
    moved = false;
    el.classList.add('widget-dragging');
    const pt = ev.touches ? ev.touches[0] : ev;
    const rect = el.getBoundingClientRect();
    offX = pt.clientX - rect.left;
    offY = pt.clientY - rect.top;
    // Convert right/bottom layout into explicit left/top so dragging is absolute
    el.style.left = rect.left + 'px';
    el.style.top  = rect.top  + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    if (!ev.touches) ev.preventDefault();
  };
  const onMove = (ev) => {
    if (!dragging) return;
    const pt = ev.touches ? ev.touches[0] : ev;
    const nx = Math.max(4, Math.min(window.innerWidth  - el.offsetWidth  - 4, pt.clientX - offX));
    const ny = Math.max(4, Math.min(window.innerHeight - el.offsetHeight - 4, pt.clientY - offY));
    el.style.left = nx + 'px';
    el.style.top  = ny + 'px';
    moved = true;
    if (ev.touches) ev.preventDefault();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('widget-dragging');
    if (moved) {
      const rect = el.getBoundingClientRect();
      widgetPositions[id] = { left: rect.left, top: rect.top };
      saveWidgetPositions();
    }
  };
  el.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  el.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);
  window.addEventListener('touchcancel', onUp);
}

function applyWidgetPosition(el, id, defaults) {
  const saved = widgetPositions[id];
  if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
    // Clamp inside viewport in case window shrank since last visit
    const left = Math.max(4, Math.min(window.innerWidth  - 80, saved.left));
    const top  = Math.max(4, Math.min(window.innerHeight - 40, saved.top));
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  } else {
    Object.entries(defaults || {}).forEach(([k, v]) => { el.style[k] = v; });
  }
}

// =========================================================================
//  SUBA, COLOMBIA CLOCK
//  Suba is a locality of Bogotá D.C. → America/Bogota, COT (UTC-5, no DST)
// =========================================================================
const SUBA_TZ = 'America/Bogota';
let subaInterval = null;

function ensureSubaClockWidget() {
  let el = document.getElementById('suba-clock-widget');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'suba-clock-widget';
  el.className = 'widget-float glass-dark';
  el.innerHTML =
    '<div class="widget-handle">' +
      '<span class="widget-title">🕰️ Suba · スバ</span>' +
      '<span class="widget-meta">COT · UTC-5</span>' +
    '</div>' +
    '<div class="widget-body">' +
      '<div class="suba-time" id="suba-clock-time">—</div>' +
      '<div class="suba-date" id="suba-clock-date">—</div>' +
      '<div class="suba-flag">🇨🇴 Bogotá D.C., Colombia</div>' +
    '</div>';
  document.body.appendChild(el);

  applyWidgetPosition(el, 'suba-clock', { left: '16px', top: '16px' });
  makeDraggable(el, 'suba-clock');

  updateSubaClock();
  if (subaInterval) clearInterval(subaInterval);
  subaInterval = setInterval(updateSubaClock, 1000);
  return el;
}

function updateSubaClock() {
  const t = document.getElementById('suba-clock-time');
  const d = document.getElementById('suba-clock-date');
  if (!t || !d) return;
  const now = new Date();
  try {
    t.textContent = now.toLocaleTimeString('en-GB', {
      timeZone: SUBA_TZ,
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const dateFmt = now.toLocaleDateString('es-CO', {
      timeZone: SUBA_TZ,
      weekday: 'long', day: 'numeric', month: 'long'
    });
    d.textContent = dateFmt;
  } catch (e) {
    t.textContent = now.toISOString().slice(11, 19);
    d.textContent = now.toDateString();
  }
}

// =========================================================================
//  POMODORO MINI WIDGET
//  Only shown when pomState.running || pomState.paused
// =========================================================================
let pomMiniInterval = null;

function ensurePomMiniWidget() {
  let el = document.getElementById('pom-mini-widget');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'pom-mini-widget';
  el.className = 'widget-float glass-dark';
  el.style.display = 'none';
  el.innerHTML =
    '<div class="widget-handle">' +
      '<span class="widget-title" id="pom-mini-label">🍅 Pomodoro</span>' +
      '<span class="widget-meta" id="pom-mini-status">●</span>' +
    '</div>' +
    '<div class="widget-body">' +
      '<div class="pom-mini-time" id="pom-mini-time">--:--</div>' +
      '<div class="pom-mini-bar-track"><div class="pom-mini-bar" id="pom-mini-bar"></div></div>' +
      '<div class="pom-mini-ctl">' +
        '<button class="pom-mini-btn" id="pom-mini-toggle-btn" data-widget-nodrag>⏸</button>' +
        '<button class="pom-mini-btn" onclick="skipPomodoro()" data-widget-nodrag>⏭</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(el);

  // Default: top-right corner (won't clash with Suba clock at top-left)
  applyWidgetPosition(el, 'pom-mini', { right: '16px', top: '16px' });
  makeDraggable(el, 'pom-mini');

  // Wire toggle
  const toggleBtn = el.querySelector('#pom-mini-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (typeof pomState === 'undefined') return;
      if (pomState.running) { if (typeof pausePomodoro === 'function') pausePomodoro(); }
      else if (pomState.paused) { if (typeof startPomodoro === 'function') startPomodoro(); }
    });
  }
  return el;
}

function updatePomMini() {
  const el = document.getElementById('pom-mini-widget');
  if (!el) return;
  if (typeof pomState === 'undefined') { el.style.display = 'none'; return; }

  const active = !!(pomState.running || pomState.paused);
  if (!active) { el.style.display = 'none'; return; }
  if (el.style.display === 'none') el.style.display = '';

  const MODES = (typeof POM_MODES !== 'undefined') ? POM_MODES : {};
  const mi = MODES[pomState.mode] || { color: '#ff4757', label: pomState.mode, emoji: '🍅' };

  const m = Math.floor((pomState.timeLeft || 0) / 60);
  const s = (pomState.timeLeft || 0) % 60;
  const timeStr = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  const pct = pomState.totalTime > 0
    ? ((pomState.totalTime - pomState.timeLeft) / pomState.totalTime) * 100
    : 0;

  const lbl = el.querySelector('#pom-mini-label');
  const timeEl = el.querySelector('#pom-mini-time');
  const barEl  = el.querySelector('#pom-mini-bar');
  const stat   = el.querySelector('#pom-mini-status');
  const toggle = el.querySelector('#pom-mini-toggle-btn');
  if (lbl)   { lbl.textContent  = mi.emoji + ' ' + mi.label; lbl.style.color = mi.color; }
  if (timeEl){ timeEl.textContent = timeStr; timeEl.style.color = mi.color; }
  if (barEl) { barEl.style.width = pct + '%'; barEl.style.background = mi.color; }
  if (stat)  { stat.textContent = pomState.paused ? '⏸ paused' : '● active'; }
  if (toggle){ toggle.textContent = pomState.paused ? '▶' : '⏸'; }
}

function startPomMiniTicker() {
  ensurePomMiniWidget();
  if (pomMiniInterval) return;
  pomMiniInterval = setInterval(updatePomMini, 500);
  updatePomMini();
}

// =========================================================================
//  INIT
// =========================================================================
function initTomogWidgets() {
  ensureSubaClockWidget();
  startPomMiniTicker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTomogWidgets);
} else {
  // DOM already parsed
  setTimeout(initTomogWidgets, 0);
}
