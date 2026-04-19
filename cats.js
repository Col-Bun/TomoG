// ===== ASCII CATS =====
// 《虚数猫計画 · Gatos Imaginarios》
// 2chan-flavored wandering cats. Spawn every few minutes. Lucky ones
// trigger a JP/ES dialog. Roaming cats are volatile per page-load; only
// captured cats persist in data.cats.collection.

// ---------- DATA SHAPE ----------
function getCatData() {
  if (!data.cats) {
    data.cats = {
      collection: [],       // array of captured cats { id, face, kanji, color, lucky, capturedAt, lang }
      totalCaptured: 0,
      totalSpawnedEver: 0,  // lifetime stat (optional)
      lastLang: null,       // 'jp' | 'es' — alternates roughly
    };
    saveData();
  }
  if (!Array.isArray(data.cats.collection)) data.cats.collection = [];
  return data.cats;
}

// ---------- CAT TEMPLATES ----------
// Popular 2chan-style kaomoji cat faces
const CAT_FACES = [
  '(=^・ω・^=)', '(=^･ｪ･^=)', '(=ＴェＴ=)', '(=ФェФ=)',
  '(=ↀωↀ=)',   '(=^‥^=)',   '(=｀ェ´=)',   '(=ΦᆺΦ=)',
  '(=οωο=)',    '(=^皿^=)',   '(=✪ω✪=)',   '(=˘ω˘=)',
  '(=ΦｴΦ=)ﾉ',  'ヾ(=ﾟ･ﾟ=)ﾉ', '(^・ω・^ )',  'ᓚ₍ ^. .^₎'
];
const LUCKY_FACES = ['(=✧ω✧=)', '(=★ω★=)', '₍^ >ヮ<^₎', '(=✨ω✨=)'];

const CAT_COLORS = [
  '#ff6ea8', '#a8e84c', '#66ccff', '#ffb86c',
  '#c792ea', '#82e9de', '#f78fb3', '#f6e58d',
  '#7bed9f', '#ff7979', '#e056fd', '#74b9ff'
];
const LUCKY_COLOR = '#ffd700';

const CAT_KANJI = [
  '猫','夢','風','光','影','静','狂','空','水','火','森','雪','桜','鏡','刻',
  '雲','月','星','霧','雷','花','海','山','道','音','色','紅','碧','黒','白',
  '鬼','龍','鳳','虎','魚','鳥','翼','牙','爪','瞳','魂','縁','運','禅','無'
];

// Bogotá-flavored dialog prompts. Roughly alternate JP / ES per lucky spawn.
const LUCKY_DIALOGS_JP = [
  { prompt: '「お魚、くれる？」',        correct: 'あげる',   wrong: ['いらない','食べない'] },
  { prompt: '「撫でて欲しいにゃ……」',   correct: '撫でる',   wrong: ['無視する','蹴る'] },
  { prompt: '「お腹すいた……」',         correct: 'ご飯あげる', wrong: ['ダイエット','寝る'] },
  { prompt: '「こっちおいで？」',         correct: 'はい',     wrong: ['怖い','逃げる'] },
  { prompt: '「友達になる？」',           correct: 'なる',     wrong: ['いや','知らない'] },
];
const LUCKY_DIALOGS_ES = [
  { prompt: '«¿Me das un pescado, parce?»',    correct: 'Claro, toma', wrong: ['Qué jartera','No tengo'] },
  { prompt: '«Hágame cariñitos, sumercé.»',    correct: 'Ven acá',     wrong: ['No me moleste','Quieto'] },
  { prompt: '«Tengo un filo tenaz, ¿oís?»',    correct: 'Te doy comida', wrong: ['Aguántate','Chao'] },
  { prompt: '«¿Querés ser mi amigo, chino?»',  correct: 'Dale pues',   wrong: ['Qué pereza','Bájese'] },
  { prompt: '«Rasque atrás de la oreja, porfa.»', correct: 'Listo',   wrong: ['Ni de riesgos','No'] },
];

// ---------- RUNTIME STATE (volatile) ----------
const catRuntime = {
  nextId: 1,                 // starts at 1 every page load — per spec
  roaming: [],               // { id, face, kanji, color, lucky, x, y, vx, vy, el, wiggle }
  spawnInterval: null,
  animFrame: null,
  lastTs: 0,
  stageEl: null,
  countEl: null,
  dialogOpen: false,
  bgCharsEl: null,
};

// Spawn cadence
const CAT_SPAWN_MS = 3 * 60 * 1000;  // every 3 minutes while tab is open
const CAT_MAX_ROAMING = 14;          // soft cap
const LUCKY_CHANCE = 0.05;           // 5% per spawn

// ---------- HELPERS ----------
function catPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeCatEntity(opts = {}) {
  const cd = getCatData();
  cd.totalSpawnedEver++;

  const lucky = opts.forceLucky === true ? true :
               (opts.forceLucky === false ? false : Math.random() < LUCKY_CHANCE);

  const id = catRuntime.nextId++;
  const face = lucky ? catPick(LUCKY_FACES) : catPick(CAT_FACES);
  const kanji = catPick(CAT_KANJI);
  const color = lucky ? LUCKY_COLOR : catPick(CAT_COLORS);

  const stage = catRuntime.stageEl;
  if (!stage) return null;
  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;
  const x = Math.random() * Math.max(1, w - 90);
  const y = Math.random() * Math.max(1, h - 70);
  const speed = lucky ? 0.55 : 0.35;
  const angle = Math.random() * Math.PI * 2;

  const cat = {
    id, face, kanji, color, lucky,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    wiggle: Math.random() * Math.PI * 2,
    el: null,
  };

  cat.el = renderCatDom(cat);
  stage.appendChild(cat.el);
  catRuntime.roaming.push(cat);

  // Soft-cap: evict the oldest non-lucky if we're over the limit
  if (catRuntime.roaming.length > CAT_MAX_ROAMING) {
    const victimIdx = catRuntime.roaming.findIndex(c => !c.lucky);
    if (victimIdx >= 0) {
      const victim = catRuntime.roaming[victimIdx];
      if (victim.el && victim.el.parentNode) victim.el.parentNode.removeChild(victim.el);
      catRuntime.roaming.splice(victimIdx, 1);
    }
  }

  updateCatHud();
  saveData();
  return cat;
}

function renderCatDom(cat) {
  const el = document.createElement('div');
  el.className = 'ascii-cat' + (cat.lucky ? ' ascii-cat-lucky' : '');
  el.style.position = 'absolute';
  el.style.color = cat.color;
  el.style.left = cat.x + 'px';
  el.style.top = cat.y + 'px';
  el.style.cursor = 'pointer';
  el.style.whiteSpace = 'pre';
  el.style.textAlign = 'center';
  el.style.fontFamily = "'Courier New', 'MS Gothic', monospace";
  el.style.fontSize = '13px';
  el.style.lineHeight = '1.15';
  el.style.userSelect = 'none';
  el.style.textShadow = cat.lucky
    ? '0 0 8px rgba(255,215,0,0.9), 0 0 14px rgba(255,215,0,0.5)'
    : '0 1px 2px rgba(0,0,0,0.45)';
  el.style.transition = 'transform 0.15s';
  el.innerHTML =
    '<div style="font-size:10px;opacity:0.8;">[' + cat.id + ']</div>' +
    '<div class="ascii-cat-face">' + cat.face + '</div>' +
    '<div style="font-size:16px;font-weight:700;">' + cat.kanji + '</div>';

  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)'; });
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
  el.addEventListener('click', () => onCatClick(cat));
  return el;
}

// ---------- BACKGROUND (ascii field) ----------
function buildCatBackground() {
  const bg = catRuntime.bgCharsEl;
  if (!bg) return;
  const CHARS = ['·','∴','∵','.','⋅','⁘','⁙','•','·','·','.'];
  const COLORS = ['#3a2e4d','#2e3a4d','#4d3a2e','#2e4d3a','#4d2e3a'];
  let html = '';
  const count = 180;
  for (let i = 0; i < count; i++) {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
    const cl = COLORS[Math.floor(Math.random() * COLORS.length)];
    const op = (0.25 + Math.random() * 0.5).toFixed(2);
    html += '<span style="position:absolute;top:' + top.toFixed(1) + '%;left:' + left.toFixed(1) +
            '%;color:' + cl + ';opacity:' + op + ';font-size:' +
            (10 + Math.floor(Math.random()*6)) + 'px;">' + ch + '</span>';
  }
  bg.innerHTML = html;
}

// ---------- ANIMATION LOOP ----------
function catAnimateTick(ts) {
  if (!catRuntime.stageEl) return;
  if (!catRuntime.lastTs) catRuntime.lastTs = ts;
  const dt = Math.min(50, ts - catRuntime.lastTs);
  catRuntime.lastTs = ts;

  const w = catRuntime.stageEl.clientWidth || 600;
  const h = catRuntime.stageEl.clientHeight || 320;

  catRuntime.roaming.forEach(c => {
    c.wiggle += 0.04;
    const wob = Math.sin(c.wiggle) * 0.15;
    c.x += (c.vx + wob) * (dt / 16);
    c.y += (c.vy - wob * 0.5) * (dt / 16);
    if (c.x < 0) { c.x = 0; c.vx = Math.abs(c.vx); }
    if (c.x > w - 80) { c.x = w - 80; c.vx = -Math.abs(c.vx); }
    if (c.y < 0) { c.y = 0; c.vy = Math.abs(c.vy); }
    if (c.y > h - 60) { c.y = h - 60; c.vy = -Math.abs(c.vy); }
    if (c.el) {
      c.el.style.left = c.x.toFixed(1) + 'px';
      c.el.style.top = c.y.toFixed(1) + 'px';
    }
  });

  catRuntime.animFrame = requestAnimationFrame(catAnimateTick);
}

// ---------- CLICK HANDLERS ----------
function onCatClick(cat) {
  if (catRuntime.dialogOpen) return;
  if (cat.lucky) {
    openLuckyDialog(cat);
  } else {
    // Normal cats just give a small peek — display their entry in a flash
    flashCatInfo(cat);
  }
}

function flashCatInfo(cat) {
  const flash = document.getElementById('cat-flash');
  if (!flash) return;
  flash.innerHTML = '<span style="color:' + cat.color + '">' + cat.face + '</span> ' +
                    '<b>#' + cat.id + '</b> · ' + cat.kanji +
                    ' <span style="color:rgba(255,255,255,0.4);font-size:0.75rem;margin-left:6px;">(not lucky — roams free)</span>';
  flash.style.opacity = '1';
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { flash.style.opacity = '0.3'; }, 1800);
}

function openLuckyDialog(cat) {
  catRuntime.dialogOpen = true;
  const cd = getCatData();
  const useJP = cd.lastLang === 'es' ? true : (cd.lastLang === 'jp' ? false : Math.random() < 0.5);
  const pool = useJP ? LUCKY_DIALOGS_JP : LUCKY_DIALOGS_ES;
  const dlg = pool[Math.floor(Math.random() * pool.length)];
  cd.lastLang = useJP ? 'jp' : 'es';

  // Scramble answer order
  const options = [dlg.correct, dlg.wrong[0], dlg.wrong[1]].sort(() => Math.random() - 0.5);

  const modal = document.getElementById('cat-dialog');
  if (!modal) { catRuntime.dialogOpen = false; return; }
  modal.style.display = 'flex';
  modal.innerHTML =
    '<div class="cat-dialog-inner">' +
      '<div class="cat-dialog-face" style="color:' + cat.color + ';">' + cat.face + '</div>' +
      '<div class="cat-dialog-kanji" style="color:' + cat.color + ';">' + cat.kanji + '</div>' +
      '<div class="cat-dialog-tag">' + (useJP ? '幸運猫 · Lucky Cat' : 'Gato de la Suerte') + ' · #' + cat.id + '</div>' +
      '<div class="cat-dialog-prompt">' + dlg.prompt + '</div>' +
      '<div class="cat-dialog-options">' +
        options.map(o => '<button class="cat-dialog-btn" data-answer="' + o + '">' + o + '</button>').join('') +
      '</div>' +
    '</div>';

  modal.querySelectorAll('.cat-dialog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.dataset.answer;
      if (ans === dlg.correct) {
        captureCat(cat, useJP ? 'jp' : 'es');
      } else {
        escapeCat(cat);
      }
    });
  });
}

function closeCatDialog() {
  const modal = document.getElementById('cat-dialog');
  if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
  catRuntime.dialogOpen = false;
}

function captureCat(cat, lang) {
  const cd = getCatData();
  cd.collection.push({
    id: cat.id,
    face: cat.face,
    kanji: cat.kanji,
    color: cat.color,
    lucky: true,
    lang: lang,
    capturedAt: Date.now(),
  });
  cd.totalCaptured++;

  // MoeBucks reward for capturing a lucky cat
  if (typeof getSlotData === 'function') {
    const sd = getSlotData();
    sd.moeBucks += 15;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  }

  saveData();

  // Celebrate
  const modal = document.getElementById('cat-dialog');
  if (modal) {
    modal.innerHTML =
      '<div class="cat-dialog-inner cat-dialog-win">' +
        '<div class="cat-dialog-face" style="color:' + cat.color + ';">' + cat.face + '</div>' +
        '<div class="cat-dialog-kanji" style="color:' + cat.color + ';">' + cat.kanji + '</div>' +
        '<div class="cat-dialog-prompt">' +
          (lang === 'jp' ? '仲間になった！ +15 MB' : '¡Se unió a tu colección! +15 MB') +
        '</div>' +
        '<button class="cat-dialog-btn" id="cat-dialog-close">OK</button>' +
      '</div>';
    const btn = document.getElementById('cat-dialog-close');
    if (btn) btn.addEventListener('click', closeCatDialog);
  }

  // Remove from roaming
  if (cat.el && cat.el.parentNode) cat.el.parentNode.removeChild(cat.el);
  catRuntime.roaming = catRuntime.roaming.filter(c => c.id !== cat.id);

  renderCatCollection();
  updateCatHud();
}

function escapeCat(cat) {
  const modal = document.getElementById('cat-dialog');
  if (modal) {
    modal.innerHTML =
      '<div class="cat-dialog-inner cat-dialog-lose">' +
        '<div class="cat-dialog-face" style="color:#888;">' + cat.face + '</div>' +
        '<div class="cat-dialog-prompt">逃げた · ¡Se fue corriendo!</div>' +
        '<button class="cat-dialog-btn" id="cat-dialog-close">…</button>' +
      '</div>';
    const btn = document.getElementById('cat-dialog-close');
    if (btn) btn.addEventListener('click', closeCatDialog);
  }
  // Cat bolts off-stage
  if (cat.el && cat.el.parentNode) cat.el.parentNode.removeChild(cat.el);
  catRuntime.roaming = catRuntime.roaming.filter(c => c.id !== cat.id);
  updateCatHud();
}

// ---------- HUD / COLLECTION ----------
function updateCatHud() {
  const cd = getCatData();
  if (catRuntime.countEl) {
    catRuntime.countEl.textContent =
      'Roaming: ' + catRuntime.roaming.length +
      ' · Next ID: ' + catRuntime.nextId +
      ' · Collected: ' + cd.collection.length;
  }
}

function renderCatCollection() {
  const host = document.getElementById('cat-collection');
  if (!host) return;
  const cd = getCatData();
  if (cd.collection.length === 0) {
    host.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.4);font-size:0.85rem;">' +
                     'No cats collected yet. Catch a LUCKY cat to start your collection.' +
                     '</div>';
    return;
  }
  // Group by face+kanji+color signature
  const groups = {};
  cd.collection.forEach(c => {
    const key = c.face + '|' + c.kanji + '|' + c.color;
    if (!groups[key]) groups[key] = { ...c, count: 0 };
    groups[key].count++;
  });
  const entries = Object.values(groups).sort((a, b) => b.count - a.count);
  host.innerHTML = entries.map(c =>
    '<div class="cat-collect-card">' +
      '<div class="cat-collect-face" style="color:' + c.color + '">' + c.face + '</div>' +
      '<div class="cat-collect-kanji" style="color:' + c.color + '">' + c.kanji + '</div>' +
      (c.count > 1 ? '<div class="cat-collect-count">×' + c.count + '</div>' : '') +
      '<div class="cat-collect-lang">' + (c.lang === 'jp' ? '日' : 'ES') + '</div>' +
    '</div>'
  ).join('');
}

// ---------- TAB RENDER ----------
function renderCatsTab() {
  const host = document.getElementById('tab-cats');
  if (!host) return;
  // Only build once — subsequent enters just refresh HUD & collection
  if (host.dataset.built === '1') {
    updateCatHud();
    renderCatCollection();
    ensureCatSpawner();
    return;
  }
  host.dataset.built = '1';

  host.innerHTML =
    '<div class="glass-dark" style="padding:22px;">' +
      '<h3 style="font-family:\'Baloo 2\', cursive;color:#fff;margin-bottom:4px;font-size:1.4rem;">' +
        '🐈 ASCII Cats · 虚数猫計画' +
      '</h3>' +
      '<p style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin-bottom:14px;">' +
        'A new cat appears every few minutes. Pomodoro sessions also summon them. ' +
        'Catch a ✧LUCKY✧ cat by answering it right.' +
      '</p>' +

      '<div class="cat-hud" id="cat-hud-row">' +
        '<span id="cat-hud-count">Roaming: 0 · Next ID: 1 · Collected: 0</span>' +
        '<span id="cat-flash" style="opacity:0.3;transition:opacity 0.3s;font-size:0.8rem;"></span>' +
        '<button class="cat-btn" id="cat-btn-spawn">+ Spawn cat (debug)</button>' +
      '</div>' +

      '<div class="cat-stage-wrap">' +
        '<div id="cat-stage" class="cat-stage">' +
          '<div id="cat-stage-bg" class="cat-stage-bg"></div>' +
        '</div>' +
      '</div>' +

      '<h4 class="cat-collect-title">Collection · 収集</h4>' +
      '<div id="cat-collection" class="cat-collection-grid"></div>' +

      '<div id="cat-dialog" class="cat-dialog-backdrop"></div>' +
    '</div>';

  catRuntime.stageEl = document.getElementById('cat-stage');
  catRuntime.countEl = document.getElementById('cat-hud-count');
  catRuntime.bgCharsEl = document.getElementById('cat-stage-bg');

  buildCatBackground();

  const spawnBtn = document.getElementById('cat-btn-spawn');
  if (spawnBtn) spawnBtn.addEventListener('click', () => makeCatEntity());

  renderCatCollection();
  updateCatHud();
  ensureCatSpawner();

  // Seed: two cats on first entry per load, so the stage isn't empty
  if (catRuntime.roaming.length === 0) {
    makeCatEntity({ forceLucky: false });
    makeCatEntity({ forceLucky: false });
  }
}

// ---------- SPAWNER / LIFECYCLE ----------
function ensureCatSpawner() {
  if (catRuntime.spawnInterval) return;
  catRuntime.spawnInterval = setInterval(() => {
    // Only spawn while the cats tab is the active one OR the stage is mounted
    const tab = document.getElementById('tab-cats');
    if (!tab || !catRuntime.stageEl) return;
    makeCatEntity();
  }, CAT_SPAWN_MS);
  if (!catRuntime.animFrame) {
    catRuntime.animFrame = requestAnimationFrame(catAnimateTick);
  }
}

// ---------- POMODORO HOOK ----------
// Exposed globally so pomodoro.js can ping us on session complete.
// One-line addition in pomodoro.js → see instructions.
window.onPomodoroWorkComplete = function () {
  // Always spawn on a pomodoro finish — bonus cat, even if tab not open.
  // (If stage not mounted yet, nextId still advances; when user opens tab
  // it'll seed fresh. We only attempt DOM spawn if stage is live.)
  if (catRuntime.stageEl) {
    // Pomodoro-spawned cat has a slightly higher lucky chance (12%).
    const forceLucky = Math.random() < 0.12;
    makeCatEntity({ forceLucky });
  } else {
    // Still advance the ID and roll lifetime stat so captures feel earned later
    getCatData().totalSpawnedEver++;
    catRuntime.nextId++;
    saveData();
  }
};

// ---------- INIT ----------
// Lazy-init when the tab is first shown (see script.js hook).
// The spawner starts only once the stage is mounted.
