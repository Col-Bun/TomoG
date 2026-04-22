// ===== CAT PARK (RCT-STYLE EXTENSIONS) =====
// 《猫の遊園地 · El Parque de los Gatos》
// Adds on top of cats.js:
//   · Click a cat → inspection popup (thoughts / happiness / bank / language / age)
//   · Pomodoro Tokens (🎫) — +1 after every work+break cycle
//   · Rides: ASCII structures, bought with tokens, cats queue & enter
//   · Fling mechanic: drag a cat to launch them
//   · Robot cat: spawnable, click-to-move, despawnable
//   · Per-cat language (en/es/ja) — same-language cats linger together longer
//   · Dictionary-word chatter (sometimes pulls real vocab)
//   · Day/night cycle with in-world day counter
//   · Refresh-world button
//
// All state is attached under `data.catPark` for persistence and under
// `catRuntime.park` for volatile live state. We never edit cats.js itself;
// we monkey-augment the cat factory via `installCatParkHooks()`.

// ---------- CONFIG ----------
const PARK = {
  DAY_MS: 8 * 60 * 1000,             // one in-world day = 8 real minutes
  LANGS: [
    { id: 'ja', flag: '🇯🇵', name: '日本語',  bubbles: ['にゃー','ふむ','…','おはよう','ねむい','元気？','お魚','そうですか','また後で','よきかな'] },
    { id: 'es', flag: '🇨🇴', name: 'Español', bubbles: ['miau','¿qué hubo?','ajá','ñero','pues sí','buena','qué pereza','vea pues','hágale','listo'] },
    { id: 'en', flag: '🇬🇧', name: 'English', bubbles: ['meow','hm.','yeah','hi!','sup','cool','whatever','okay','bye','purr…'] },
  ],
  THOUGHTS: [
    'needs a nap', 'hungry for fish', 'bored', 'content', 'curious about the ride',
    'misses a friend', 'wants to be pet', 'too crowded', 'wants to fling themselves',
    'composing a haiku', 'planning a heist', 'wondering if they\'re a cat',
    'happy', 'suspicious of the bench', 'wants a pomodoro',
  ],
  RIDES: [
    {
      id: 'ferris', name: '観覧車', es: 'Rueda',    price: 3, cap: 4, durationMs: 18000, happyGain: 20,
      art: [
        "  ⌒⌒⌒  ",
        " /  O  \\ ",
        "| O   O |",
        " \\  O  / ",
        "  \\___/  ",
        "    |    ",
        "  __|__  ",
      ].join('\n')
    },
    {
      id: 'coaster', name: 'ジェットコースター', es: 'Montaña rusa', price: 5, cap: 3, durationMs: 14000, happyGain: 30,
      art: [
        "  ___    _  ",
        " /   \\__/ \\ ",
        "/    ____  \\",
        "|===|    |==|",
        " ‾‾‾      ‾‾ ",
      ].join('\n')
    },
    {
      id: 'teacup', name: 'ティーカップ', es: 'Tazas giratorias', price: 2, cap: 3, durationMs: 10000, happyGain: 12,
      art: [
        "  _____  ",
        " / ☕☕ \\ ",
        " \\____/ ",
        "   ||   ",
      ].join('\n')
    },
    {
      id: 'fishing', name: '釣り堀', es: 'Muelle', price: 2, cap: 2, durationMs: 12000, happyGain: 15,
      art: [
        "   __|__   ",
        "  |  >  |  ",
        "   ‾‾‾‾‾   ",
        "  ~🐟~🐟~  ",
      ].join('\n')
    },
    {
      id: 'fountain', name: '噴水', es: 'Fuente', price: 1, cap: 2, durationMs: 8000, happyGain: 8,
      art: [
        "   ∴∵∴   ",
        "  ∵ ∴ ∵  ",
        "  |___|  ",
        "  \\___/  ",
      ].join('\n')
    },
    {
      id: 'bathhouse', name: '銭湯', es: 'Baño', price: 4, cap: 3, durationMs: 20000, happyGain: 25,
      art: [
        "  _____  ",
        " /♨️♨️\\ ",
        "|  ___  |",
        "| |♨ |  |",
        "|_|___|_|",
      ].join('\n')
    },
  ],
};

// ---------- DATA ----------
function getParkData() {
  if (!window.data) return null;
  if (!data.catPark) {
    data.catPark = {
      tokens: 0,                  // Pomodoro Tokens (🎫)
      ridesBuilt: [],             // { id, rideId, x, y, builtAt }
      dayStartMs: Date.now(),
      dayNumber: 1,
      catExtras: {},              // { [catId]: { happiness, bank, language, thoughts[] } } — pseudo-persistent per spawn
      robotActive: false,
      stats: { tokensEarned: 0, flingsThrown: 0, ridesRidden: 0, robotSpawns: 0 },
    };
    saveData();
  }
  if (!data.catPark.stats) data.catPark.stats = { tokensEarned: 0, flingsThrown: 0, ridesRidden: 0, robotSpawns: 0 };
  return data.catPark;
}

// ---------- RUNTIME ----------
if (typeof catRuntime !== 'undefined') {
  catRuntime.park = catRuntime.park || {
    rides: [],           // { id, rideId, name, x, y, art, el, occupants:[catIds], queue:[catIds], currentRideUntil:0, cap, durationMs, happyGain }
    robot: null,         // { id, x, y, vx, vy, el, targetX, targetY }
    hudEl: null,
    dayTickInterval: null,
    stageClickHandler: null,
    fling: { dragging: null, startX: 0, startY: 0, lastX: 0, lastY: 0, lastT: 0 },
    nextRideId: 1,
  };
}

// ---------- HELPERS ----------
function parkPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function parkClamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Pick a language for a new cat (weighted: ~40% ja / 40% es / 20% en — matches the site's JP+ES flavor)
function pickCatLang() {
  const r = Math.random();
  if (r < 0.4) return 'ja';
  if (r < 0.8) return 'es';
  return 'en';
}
function parkLangDef(id) { return PARK.LANGS.find(l => l.id === id) || PARK.LANGS[0]; }

// Pull a real word from data.dictionary that matches this cat's language
function dictionaryWordFor(lang) {
  if (!window.data || !Array.isArray(data.dictionary) || data.dictionary.length === 0) return null;
  const field = (lang === 'es') ? 'es' : (lang === 'en') ? 'en' : 'jp';
  // Filter words that actually have this field
  const pool = data.dictionary.filter(w => w && w[field] && w[field] !== '—');
  if (pool.length === 0) return null;
  const w = pool[Math.floor(Math.random() * pool.length)];
  return w[field];
}

function getOrMakeCatExtras(cat) {
  const pd = getParkData();
  if (!pd) return null;
  let ex = pd.catExtras[cat.id];
  if (!ex) {
    ex = {
      happiness: 55 + Math.floor(Math.random() * 30),
      bank: Math.floor(Math.random() * 8),            // 🐟 "Fish coins" — pocket money
      language: cat.language || pickCatLang(),
      thoughts: [],
      bornDay: (pd.dayNumber || 1),
    };
    pd.catExtras[cat.id] = ex;
    // Mirror onto the cat object so neighbors can check language without going through data
    cat.language = ex.language;
    // Seed one initial thought
    ex.thoughts.push(parkPick(PARK.THOUGHTS));
    saveData();
  } else if (!cat.language) {
    cat.language = ex.language;
  }
  return ex;
}

function pushCatThought(cat, text) {
  const ex = getOrMakeCatExtras(cat);
  if (!ex) return;
  ex.thoughts.unshift(text);
  if (ex.thoughts.length > 6) ex.thoughts.length = 6;
}

// ---------- INSPECTION MODAL (RCT-STYLE) ----------
function openCatInspector(cat) {
  const ex = getOrMakeCatExtras(cat);
  if (!ex) return;
  closeCatInspector();

  const langDef = parkLangDef(ex.language);
  const ageDays = Math.max(0, (getParkData().dayNumber || 1) - (ex.bornDay || 1));

  const backdrop = document.createElement('div');
  backdrop.id = 'cat-park-inspector';
  backdrop.className = 'cat-park-inspector-backdrop';
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCatInspector();
  });

  // Build HTML
  const personalityBits = cat.personality ?
    `${cat.personality.jp} · ${cat.personality.es} <span class="cpi-dim">— ${cat.personality.hint}</span>` : '—';
  const jobStr = cat.job ? `${cat.job.emoji} ${cat.job.jp} / ${cat.job.es}` : '<span class="cpi-dim">unemployed</span>';
  const thoughtList = (ex.thoughts.length
    ? ex.thoughts.map(t => `<li>💭 ${escHtmlSafe(t)}</li>`).join('')
    : `<li class="cpi-dim">…mind is empty…</li>`);
  const happiness = parkClamp(ex.happiness, 0, 100);
  const happyColor = happiness < 30 ? '#ff6e6e' : happiness < 60 ? '#ffc46e' : '#8cff8c';

  backdrop.innerHTML = `
    <div class="cat-park-inspector glass-dark">
      <div class="cpi-header">
        <div class="cpi-portrait" style="color:${cat.color}">
          <div class="cpi-face">${cat.face}</div>
          <div class="cpi-kanji">${cat.kanji}</div>
        </div>
        <div class="cpi-header-main">
          <div class="cpi-title">Cat #${cat.id} ${cat.lucky ? '<span class="cpi-lucky">✧LUCKY✧</span>' : ''}</div>
          <div class="cpi-subtitle">${personalityBits}</div>
          <div class="cpi-row"><span class="cpi-chip">${langDef.flag} ${langDef.name}</span>
            <span class="cpi-chip">🎂 ${ageDays}d old</span>
            <span class="cpi-chip">👔 ${jobStr}</span></div>
        </div>
        <button class="cpi-close" onclick="closeCatInspector()">×</button>
      </div>
      <div class="cpi-stats">
        <div class="cpi-stat">
          <div class="cpi-stat-label">😊 Happiness</div>
          <div class="cpi-bar"><div class="cpi-bar-fill" style="width:${happiness}%;background:${happyColor};"></div></div>
          <div class="cpi-stat-val">${happiness}/100</div>
        </div>
        <div class="cpi-stat">
          <div class="cpi-stat-label">🐟 Fish bank</div>
          <div class="cpi-stat-big">${ex.bank}</div>
        </div>
        <div class="cpi-stat">
          <div class="cpi-stat-label">🏃 Speed</div>
          <div class="cpi-stat-big">${((cat.speedMult || 1)).toFixed(2)}×</div>
        </div>
      </div>
      <div class="cpi-thoughts">
        <div class="cpi-stat-label">Recent thoughts · 最近の思考</div>
        <ul class="cpi-thought-list">${thoughtList}</ul>
      </div>
      <div class="cpi-actions">
        <button class="cpi-btn cpi-btn-pet" onclick="catParkPet(${cat.id})">🫶 Pet (+happy)</button>
        <button class="cpi-btn cpi-btn-feed" onclick="catParkFeed(${cat.id})">🐟 Feed (+bank)</button>
        <button class="cpi-btn cpi-btn-fling" onclick="catParkFlingButton(${cat.id})">💫 Fling</button>
        <button class="cpi-btn cpi-btn-close" onclick="closeCatInspector()">閉じる / Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
}

function closeCatInspector() {
  const el = document.getElementById('cat-park-inspector');
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function catParkPet(catId) {
  const cat = findCatById(catId);
  if (!cat) return;
  const ex = getOrMakeCatExtras(cat);
  ex.happiness = parkClamp(ex.happiness + 8, 0, 100);
  pushCatThought(cat, 'got pet · ' + (ex.language === 'es' ? 'me rasqueteó' : ex.language === 'ja' ? 'なでてくれた' : 'got pet'));
  if (typeof setCatBubble === 'function') setCatBubble(cat, ex.language === 'es' ? 'purr💕' : ex.language === 'ja' ? 'ごろごろ💕' : 'purr💕', 1800);
  saveData();
  openCatInspector(cat);
}

function catParkFeed(catId) {
  const cat = findCatById(catId);
  if (!cat) return;
  const ex = getOrMakeCatExtras(cat);
  ex.bank += 1;
  ex.happiness = parkClamp(ex.happiness + 4, 0, 100);
  pushCatThought(cat, 'ate fish · +1🐟');
  if (typeof setCatBubble === 'function') setCatBubble(cat, '🐟!', 1500);
  saveData();
  openCatInspector(cat);
}

function catParkFlingButton(catId) {
  const cat = findCatById(catId);
  if (!cat) return;
  closeCatInspector();
  const angle = Math.random() * Math.PI * 2;
  const power = 10 + Math.random() * 10;
  cat.vx = Math.cos(angle) * power;
  cat.vy = Math.sin(angle) * power;
  cat._flungUntil = performance.now() + 1200;
  if (cat.el) cat.el.classList.add('ascii-cat-flung');
  const ex = getOrMakeCatExtras(cat);
  ex.happiness = parkClamp(ex.happiness - 6, 0, 100);
  pushCatThought(cat, 'FLUNG across the sky');
  if (typeof setCatBubble === 'function') setCatBubble(cat, ex.language === 'es' ? '¡aaah!' : ex.language === 'ja' ? 'にゃあぁぁ！' : 'WOAH!', 1400);
  getParkData().stats.flingsThrown++;
  saveData();
  if (typeof catLog === 'function') catLog('💫 fling! #' + cat.id + ' soars');
}

function escHtmlSafe(s) {
  if (typeof escHtml === 'function') return escHtml(s);
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function findCatById(id) {
  if (typeof catRuntime === 'undefined') return null;
  return catRuntime.roaming.find(c => c.id === id) || null;
}

// ---------- FLING MECHANIC (mousedown-drag on a cat) ----------
function installCatFlingHooks(cat) {
  if (!cat.el) return;
  cat.el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    // Skip fling-drag if the user is clicking — we'll still allow click to open inspector
    // by only flinging when the mouse moves more than a small threshold.
    catRuntime.park.fling.dragging = cat;
    const rect = catRuntime.stageEl.getBoundingClientRect();
    catRuntime.park.fling.startX = e.clientX - rect.left;
    catRuntime.park.fling.startY = e.clientY - rect.top;
    catRuntime.park.fling.lastX = catRuntime.park.fling.startX;
    catRuntime.park.fling.lastY = catRuntime.park.fling.startY;
    catRuntime.park.fling.lastT = performance.now();
    catRuntime.park.fling.moved = false;
    cat.el.classList.add('ascii-cat-grabbed');
    // Freeze velocity while held
    cat._flingHeld = true;
    e.preventDefault();
  });
}

function initParkGlobalMouse() {
  if (catRuntime.park._mouseInstalled) return;
  catRuntime.park._mouseInstalled = true;

  document.addEventListener('mousemove', (e) => {
    const f = catRuntime.park.fling;
    if (!f.dragging) return;
    const rect = catRuntime.stageEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - f.startX, dy = y - f.startY;
    if (Math.hypot(dx, dy) > 6) f.moved = true;
    const cat = f.dragging;
    cat.x = x - 40;
    cat.y = y - 20;
    if (cat.el) {
      cat.el.style.left = cat.x.toFixed(1) + 'px';
      cat.el.style.top = cat.y.toFixed(1) + 'px';
    }
    f.lastX = x;
    f.lastY = y;
    f.lastT = performance.now();
  });

  document.addEventListener('mouseup', (e) => {
    const f = catRuntime.park.fling;
    if (!f.dragging) return;
    const cat = f.dragging;
    cat._flingHeld = false;
    if (cat.el) cat.el.classList.remove('ascii-cat-grabbed');
    if (f.moved) {
      // Compute fling velocity from the recent mouse movement
      const rect = catRuntime.stageEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dt = Math.max(0.016, (performance.now() - f.lastT) / 1000);
      const vx = (x - f.lastX) / dt * 0.02;   // scale down
      const vy = (y - f.lastY) / dt * 0.02;
      const sp = Math.hypot(vx, vy);
      const max = 20;
      cat.vx = sp > max ? vx / sp * max : vx;
      cat.vy = sp > max ? vy / sp * max : vy;
      cat._flungUntil = performance.now() + 1200;
      cat._suppressNextClick = true;    // swallow the trailing click event
      if (cat.el) cat.el.classList.add('ascii-cat-flung');
      const ex = getOrMakeCatExtras(cat);
      ex.happiness = parkClamp(ex.happiness - 6, 0, 100);
      pushCatThought(cat, 'manually flung by the hand of god');
      if (typeof setCatBubble === 'function') setCatBubble(cat, '!?', 1200);
      getParkData().stats.flingsThrown++;
      saveData();
      if (typeof catLog === 'function') catLog('💫 flung #' + cat.id + ' manually');
    } else {
      // Plain click → open inspector via the standard click path (onCatClick
      // will fire immediately after; we don't duplicate it here)
    }
    f.dragging = null;
    f.moved = false;
  });
}

// ---------- ROBOT CAT ----------
function spawnRobotCat() {
  if (typeof catRuntime === 'undefined' || !catRuntime.stageEl) return null;
  if (catRuntime.park.robot) return catRuntime.park.robot;
  const stage = catRuntime.stageEl;
  const el = document.createElement('div');
  el.className = 'ascii-cat ascii-cat-robot';
  el.style.position = 'absolute';
  el.style.color = '#00e5ff';
  el.style.fontFamily = "'Courier New','MS Gothic',monospace";
  el.style.fontSize = '14px';
  el.style.lineHeight = '1.15';
  el.style.textAlign = 'center';
  el.style.pointerEvents = 'none';    // so stage clicks pass through to move it
  el.style.userSelect = 'none';
  el.style.textShadow = '0 0 8px #00e5ff, 0 0 14px rgba(0,229,255,0.6)';
  el.innerHTML =
    '<div style="font-size:10px;opacity:0.9;">[R0]</div>' +
    '<div>(=◉ω◉=)</div>' +
    '<div style="font-size:15px;font-weight:700;">機</div>';
  stage.appendChild(el);
  const robot = {
    id: 'R0',
    x: (stage.clientWidth || 600) / 2,
    y: (stage.clientHeight || 320) / 2,
    vx: 0, vy: 0,
    el,
    targetX: null, targetY: null,
  };
  el.style.left = robot.x + 'px';
  el.style.top = robot.y + 'px';
  catRuntime.park.robot = robot;
  const pd = getParkData();
  pd.robotActive = true;
  pd.stats.robotSpawns++;
  saveData();
  if (typeof catLog === 'function') catLog('🤖 robot cat deployed · click anywhere to move it');
  installStageClickForRobot();
  updateParkHud();
  return robot;
}

function despawnRobotCat() {
  const r = catRuntime.park.robot;
  if (!r) return;
  if (r.el && r.el.parentNode) r.el.parentNode.removeChild(r.el);
  catRuntime.park.robot = null;
  const pd = getParkData();
  pd.robotActive = false;
  saveData();
  if (typeof catLog === 'function') catLog('🤖 robot cat powered down');
  updateParkHud();
}

function installStageClickForRobot() {
  if (catRuntime.park.stageClickHandler) return;
  const stage = catRuntime.stageEl;
  if (!stage) return;
  const handler = (e) => {
    // Only react if it's a click on the stage (not on a cat)
    // Robot is pointer-events:none so cat clicks aren't blocked;
    // here we listen on the stage itself.
    if (e.target.closest('.ascii-cat') && !e.target.closest('.ascii-cat-robot')) return;
    const r = catRuntime.park.robot;
    if (!r) return;
    const rect = stage.getBoundingClientRect();
    r.targetX = e.clientX - rect.left - 40;
    r.targetY = e.clientY - rect.top - 20;
  };
  stage.addEventListener('click', handler);
  catRuntime.park.stageClickHandler = handler;
}

function tickRobotCat(dtSec) {
  const r = catRuntime.park.robot;
  if (!r || !catRuntime.stageEl) return;
  const w = catRuntime.stageEl.clientWidth || 600;
  const h = catRuntime.stageEl.clientHeight || 320;
  if (r.targetX !== null) {
    const dx = r.targetX - r.x;
    const dy = r.targetY - r.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) {
      r.vx *= 0.5; r.vy *= 0.5;
      r.targetX = null; r.targetY = null;
    } else {
      const speed = 3.6;
      r.vx = (dx / dist) * speed;
      r.vy = (dy / dist) * speed;
    }
  }
  r.x += r.vx;
  r.y += r.vy;
  r.x = parkClamp(r.x, 0, w - 80);
  r.y = parkClamp(r.y, 0, h - 60);
  if (r.el) {
    r.el.style.left = r.x.toFixed(1) + 'px';
    r.el.style.top = r.y.toFixed(1) + 'px';
  }
  // Interact with nearby cats — boost their happiness & shout
  if (catRuntime.roaming) {
    for (const c of catRuntime.roaming) {
      const d = Math.hypot(c.x - r.x, c.y - r.y);
      if (d < 70 && !c._robotPingedUntil || (c._robotPingedUntil && performance.now() > c._robotPingedUntil)) {
        if (d < 70) {
          c._robotPingedUntil = performance.now() + 5000;
          const ex = getOrMakeCatExtras(c);
          ex.happiness = parkClamp(ex.happiness + 1, 0, 100);
          if (typeof setCatBubble === 'function' && Math.random() < 0.25) {
            setCatBubble(c, ex.language === 'es' ? '¿un robot?' : ex.language === 'ja' ? 'ロボット猫…' : 'a robot!?', 1500);
          }
        }
      }
    }
  }
}

// ---------- RIDES ----------
function buildRide(rideId) {
  const def = PARK.RIDES.find(r => r.id === rideId);
  if (!def) return null;
  const pd = getParkData();
  if (pd.tokens < def.price) {
    if (typeof catLog === 'function') catLog('🎫 not enough tokens (' + pd.tokens + '/' + def.price + ')');
    return null;
  }
  const stage = catRuntime.stageEl;
  if (!stage) return null;
  pd.tokens -= def.price;
  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;
  // Place at a random non-overlapping spot
  const x = 40 + Math.random() * Math.max(40, w - 180);
  const y = 40 + Math.random() * Math.max(40, h - 180);

  const el = document.createElement('div');
  el.className = 'park-ride';
  el.style.position = 'absolute';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.whiteSpace = 'pre';
  el.style.fontFamily = "'Courier New','MS Gothic',monospace";
  el.style.fontSize = '12px';
  el.style.lineHeight = '1.0';
  el.style.color = '#ffd57a';
  el.style.textShadow = '0 0 6px rgba(255,213,122,0.55)';
  el.style.pointerEvents = 'auto';
  el.style.zIndex = '2';
  el.innerHTML = `<div class="park-ride-art">${def.art}</div>
    <div class="park-ride-label">${def.name} · ${def.es}</div>
    <div class="park-ride-occ"></div>`;
  stage.appendChild(el);

  const ride = {
    id: 'ride-' + (catRuntime.park.nextRideId++),
    rideId: def.id,
    name: def.name,
    es: def.es,
    x, y,
    el,
    cap: def.cap,
    happyGain: def.happyGain,
    durationMs: def.durationMs,
    occupants: [],
    ridingUntil: 0,
    price: def.price,
  };
  catRuntime.park.rides.push(ride);
  pd.ridesBuilt.push({ id: ride.id, rideId: def.id, builtAt: Date.now() });
  saveData();
  updateParkHud();
  if (typeof catLog === 'function') catLog('🎡 built ' + def.name + ' / ' + def.es + ' for ' + def.price + '🎫');
  return ride;
}

function demolishRide(rideId) {
  const idx = catRuntime.park.rides.findIndex(r => r.id === rideId);
  if (idx < 0) return;
  const ride = catRuntime.park.rides[idx];
  // Release any cats riding it
  for (const cid of ride.occupants) {
    const c = findCatById(cid);
    if (c) { c._onRide = null; if (c.el) c.el.style.visibility = 'visible'; }
  }
  if (ride.el && ride.el.parentNode) ride.el.parentNode.removeChild(ride.el);
  catRuntime.park.rides.splice(idx, 1);
  const pd = getParkData();
  pd.ridesBuilt = pd.ridesBuilt.filter(r => r.id !== rideId);
  saveData();
  updateParkHud();
  if (typeof catLog === 'function') catLog('🧨 demolished ride ' + rideId);
}

function tickRides() {
  const now = performance.now();
  for (const ride of catRuntime.park.rides) {
    // If no one riding, occasionally draft a nearby unhappy/bored cat
    if (ride.occupants.length < ride.cap && catRuntime.roaming) {
      for (const c of catRuntime.roaming) {
        if (ride.occupants.length >= ride.cap) break;
        if (c._onRide || c.despawning || c._flingHeld) continue;
        const d = Math.hypot(c.x - ride.x, c.y - ride.y);
        if (d < 90 && Math.random() < 0.02) {
          ride.occupants.push(c.id);
          c._onRide = { rideId: ride.id, until: now + ride.durationMs };
          if (c.el) c.el.style.visibility = 'hidden';
          const ex = getOrMakeCatExtras(c);
          ex.happiness = parkClamp(ex.happiness + ride.happyGain, 0, 100);
          pushCatThought(c, 'rode the ' + ride.name);
          getParkData().stats.ridesRidden++;
          if (typeof catLog === 'function') catLog('🎢 #' + c.id + ' boards ' + ride.name);
        }
      }
    }
    // Release cats whose ride timer expired
    ride.occupants = ride.occupants.filter(cid => {
      const c = findCatById(cid);
      if (!c || !c._onRide || now > c._onRide.until) {
        if (c) {
          c._onRide = null;
          if (c.el) c.el.style.visibility = 'visible';
          if (typeof setCatBubble === 'function') {
            const ex = getOrMakeCatExtras(c);
            setCatBubble(c, ex.language === 'es' ? '¡qué chimba!' : ex.language === 'ja' ? 'たのしい〜' : 'wheee!', 1800);
          }
        }
        return false;
      }
      return true;
    });
    // Update occupancy label
    const occEl = ride.el && ride.el.querySelector('.park-ride-occ');
    if (occEl) occEl.textContent = ride.occupants.length + '/' + ride.cap;
  }
}

// ---------- DAY / NIGHT ----------
function tickDayNight() {
  const pd = getParkData();
  if (!pd) return;
  const elapsed = Date.now() - pd.dayStartMs;
  if (elapsed >= PARK.DAY_MS) {
    pd.dayStartMs = Date.now();
    pd.dayNumber = (pd.dayNumber || 1) + 1;
    saveData();
    if (typeof catLog === 'function') catLog('🌅 a new day dawns — day ' + pd.dayNumber);
  }
  // Compute time-of-day 0..1
  const t = (Date.now() - pd.dayStartMs) / PARK.DAY_MS;
  applyDayNightTint(t);
  updateParkHud();
}

function applyDayNightTint(t) {
  const stage = catRuntime.stageEl;
  if (!stage) return;
  // Four phases: dawn(0 - .15) · day(.15 - .55) · dusk(.55 - .75) · night(.75 - 1)
  let overlay = stage.querySelector('.park-day-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'park-day-overlay';
    stage.appendChild(overlay);
  }
  let phase, colorA, colorB, opacity;
  if (t < 0.15) { phase = 'dawn';   colorA = 'rgba(255,180,140,0.25)'; colorB = 'rgba(120,80,160,0.15)'; opacity = 0.45; }
  else if (t < 0.55) { phase = 'day';    colorA = 'rgba(255,255,255,0.00)'; colorB = 'rgba(255,255,255,0.00)'; opacity = 0.0; }
  else if (t < 0.75) { phase = 'dusk';   colorA = 'rgba(180,90,120,0.25)';  colorB = 'rgba(90,40,110,0.35)';  opacity = 0.5; }
  else               { phase = 'night';  colorA = 'rgba(8,16,40,0.55)';     colorB = 'rgba(18,6,42,0.65)';    opacity = 0.75; }
  overlay.style.background = `linear-gradient(135deg, ${colorA}, ${colorB})`;
  overlay.style.opacity = opacity;
  overlay.dataset.phase = phase;
}

function currentTimePhase() {
  const pd = getParkData();
  if (!pd) return 'day';
  const t = (Date.now() - pd.dayStartMs) / PARK.DAY_MS;
  if (t < 0.15) return 'dawn';
  if (t < 0.55) return 'day';
  if (t < 0.75) return 'dusk';
  return 'night';
}

// ---------- CAT BEHAVIOR AUGMENT: language bubbles & dictionary pulls ----------
// We don't override catChatWith; we run our own independent bubble-nudge tick
// that occasionally has cats speak in their language or pull a dictionary word.
// Also: same-language neighbors get a small speed-damp (they hang around).
function tickParkCatBehavior(dtSec) {
  if (!catRuntime.roaming) return;
  const now = performance.now();
  for (const c of catRuntime.roaming) {
    if (c.despawning || c._flingHeld || c._onRide) continue;
    getOrMakeCatExtras(c);   // lazy init

    // Recover from fling state
    if (c._flungUntil && now > c._flungUntil) {
      c._flungUntil = 0;
      if (c.el) c.el.classList.remove('ascii-cat-flung');
    }

    // Language-bubble roll
    if (!c.bubble && Math.random() < 0.003) {
      const langDef = parkLangDef(c.language);
      let text;
      // 25% chance to pull a real dictionary word in their language
      if (Math.random() < 0.25) {
        const w = dictionaryWordFor(c.language);
        text = w ? w : parkPick(langDef.bubbles);
      } else {
        text = parkPick(langDef.bubbles);
      }
      if (typeof setCatBubble === 'function') setCatBubble(c, text, 2200);
      pushCatThought(c, 'said "' + text + '"');
    }

    // Same-language linger: if within 80px of same-language cat, damp velocity
    for (const o of catRuntime.roaming) {
      if (o === c || o.despawning) continue;
      if (o.language !== c.language) continue;
      const d = Math.hypot(o.x - c.x, o.y - c.y);
      if (d < 80 && d > 6) {
        // Pull gently toward each other & slow down
        const nx = (o.x - c.x) / d, ny = (o.y - c.y) / d;
        c.vx = c.vx * 0.98 + nx * 0.01;
        c.vy = c.vy * 0.98 + ny * 0.01;
        // Happiness trickle
        const ex = getOrMakeCatExtras(c);
        if (Math.random() < 0.002) ex.happiness = parkClamp(ex.happiness + 1, 0, 100);
      }
    }

    // Slow happiness drift over time
    if (Math.random() < 0.0008) {
      const ex = getOrMakeCatExtras(c);
      const phase = currentTimePhase();
      const drift = phase === 'night' ? -1 : phase === 'day' ? +1 : 0;
      ex.happiness = parkClamp(ex.happiness + drift, 0, 100);
      if (Math.random() < 0.35) pushCatThought(c, parkPick(PARK.THOUGHTS));
    }
  }

  tickRobotCat(dtSec);
  tickRides();
}

// ---------- POMODORO TOKEN HOOKS ----------
function awardPomodoroToken(reason) {
  const pd = getParkData();
  if (!pd) return;
  pd.tokens++;
  pd.stats.tokensEarned++;
  saveData();
  updateParkHud();
  if (typeof catLog === 'function') catLog('🎫 +1 Pomodoro Token (' + (reason || 'cycle') + ') · total ' + pd.tokens);
  // Flash the token chip
  const chip = document.getElementById('park-hud-tokens');
  if (chip) {
    chip.classList.add('park-chip-flash');
    setTimeout(() => chip.classList.remove('park-chip-flash'), 900);
  }
}

// ---------- REFRESH WORLD ----------
function refreshCatWorld() {
  if (!confirm('Refresh the cat world? Clears cats, rides, and resets day count. (Tokens are kept.)')) return;
  // Remove cats
  if (catRuntime.roaming) {
    for (const c of catRuntime.roaming.slice()) {
      if (c.el && c.el.parentNode) c.el.parentNode.removeChild(c.el);
    }
    catRuntime.roaming.length = 0;
  }
  // Remove rides
  for (const ride of catRuntime.park.rides.slice()) {
    if (ride.el && ride.el.parentNode) ride.el.parentNode.removeChild(ride.el);
  }
  catRuntime.park.rides.length = 0;
  // Remove robot
  despawnRobotCat();
  // Reset day
  const pd = getParkData();
  pd.dayStartMs = Date.now();
  pd.dayNumber = 1;
  pd.ridesBuilt = [];
  pd.catExtras = {};
  saveData();
  updateParkHud();
  if (typeof catLog === 'function') catLog('🔄 world refreshed — day 1 begins');
  // Seed a couple fresh cats
  if (typeof makeCatEntity === 'function') {
    makeCatEntity({ forceLucky: false });
    makeCatEntity({ forceLucky: false });
  }
}

// ---------- HUD ----------
function renderParkHud() {
  // Injects the HUD bar above the stage if not already there.
  if (document.getElementById('cat-park-hud')) {
    updateParkHud();
    return;
  }
  const host = document.getElementById('cat-hud-row');
  if (!host) return;
  const hud = document.createElement('div');
  hud.id = 'cat-park-hud';
  hud.className = 'cat-park-hud';
  hud.innerHTML = `
    <span class="park-chip" id="park-hud-day">☀️ Day 1</span>
    <span class="park-chip park-chip-token" id="park-hud-tokens">🎫 0</span>
    <span class="park-chip" id="park-hud-rides">🎡 0 rides</span>
    <span class="park-chip" id="park-hud-phase">—</span>
    <button class="cat-btn park-btn" id="park-btn-shop">🎪 Ride shop</button>
    <button class="cat-btn park-btn" id="park-btn-robot">🤖 Robot</button>
    <button class="cat-btn park-btn park-btn-danger" id="park-btn-refresh">🔄 Refresh world</button>
  `;
  host.parentNode.insertBefore(hud, host.nextSibling);
  document.getElementById('park-btn-shop').addEventListener('click', openRideShop);
  document.getElementById('park-btn-robot').addEventListener('click', () => {
    if (catRuntime.park.robot) despawnRobotCat(); else spawnRobotCat();
  });
  document.getElementById('park-btn-refresh').addEventListener('click', refreshCatWorld);
  updateParkHud();
}

function updateParkHud() {
  const pd = getParkData();
  if (!pd) return;
  const dayEl = document.getElementById('park-hud-day');
  const tokEl = document.getElementById('park-hud-tokens');
  const ridEl = document.getElementById('park-hud-rides');
  const phaseEl = document.getElementById('park-hud-phase');
  const robotBtn = document.getElementById('park-btn-robot');
  const phase = currentTimePhase();
  const phaseIcon = phase === 'dawn' ? '🌅' : phase === 'day' ? '☀️' : phase === 'dusk' ? '🌆' : '🌙';
  if (dayEl) dayEl.textContent = phaseIcon + ' Day ' + pd.dayNumber;
  if (tokEl) tokEl.textContent = '🎫 ' + pd.tokens;
  if (ridEl) ridEl.textContent = '🎡 ' + (catRuntime.park.rides.length) + ' rides';
  if (phaseEl) phaseEl.textContent = phase;
  if (robotBtn) robotBtn.textContent = catRuntime.park.robot ? '🤖 Despawn robot' : '🤖 Robot';
}

function openRideShop() {
  closeRideShop();
  const pd = getParkData();
  const backdrop = document.createElement('div');
  backdrop.id = 'park-ride-shop';
  backdrop.className = 'cat-park-inspector-backdrop';
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeRideShop(); });
  const cards = PARK.RIDES.map(r => `
    <div class="park-ride-card">
      <pre class="park-ride-card-art">${r.art}</pre>
      <div class="park-ride-card-title">${r.name}</div>
      <div class="park-ride-card-sub">${r.es}</div>
      <div class="park-ride-card-meta">🎫 ${r.price} · cap ${r.cap} · +${r.happyGain} 😊</div>
      <button class="cpi-btn park-ride-card-buy" ${pd.tokens < r.price ? 'disabled' : ''} onclick="buildRide('${r.id}'); updateParkHud(); openRideShop();">
        ${pd.tokens < r.price ? 'not enough 🎫' : 'Build · 建てる'}
      </button>
    </div>
  `).join('');
  const built = catRuntime.park.rides.map(r => `
    <li>🎡 ${r.name} / ${r.es} <button class="cpi-btn park-btn-sm" onclick="demolishRide('${r.id}'); openRideShop();">× demolish</button></li>
  `).join('');
  backdrop.innerHTML = `
    <div class="cat-park-inspector glass-dark" style="max-width:700px;">
      <div class="cpi-header">
        <div class="cpi-header-main">
          <div class="cpi-title">🎪 Ride Shop · 遊園地</div>
          <div class="cpi-subtitle">You have <b>🎫 ${pd.tokens}</b> Pomodoro Tokens.</div>
        </div>
        <button class="cpi-close" onclick="closeRideShop()">×</button>
      </div>
      <div class="park-ride-shop-grid">${cards}</div>
      <div class="park-ride-built">
        <div class="cpi-stat-label">Built rides</div>
        <ul class="park-ride-built-list">${built || '<li class="cpi-dim">none yet</li>'}</ul>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
}
function closeRideShop() {
  const el = document.getElementById('park-ride-shop');
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// ---------- WIRING: MONKEY-HOOK INTO cats.js ----------
// Replace onCatClick so clicks (without drag) open the inspector.
// Wrap makeCatEntity so we can install fling handlers + assign language.
(function installCatParkHooks() {
  // Wait until the cats module has loaded
  const tryInstall = () => {
    if (typeof catRuntime === 'undefined' || typeof makeCatEntity !== 'function') {
      setTimeout(tryInstall, 200);
      return;
    }
    // Ensure park runtime exists
    catRuntime.park = catRuntime.park || {
      rides: [], robot: null, hudEl: null, dayTickInterval: null,
      stageClickHandler: null, nextRideId: 1,
      fling: { dragging: null, startX: 0, startY: 0, lastX: 0, lastY: 0, lastT: 0, moved: false },
    };

    // ---- override click behavior ----
    // The existing cats.js installs a click handler on each cat el. We let that
    // still fire, but we redefine onCatClick to route through the fling-state
    // gate: if the mouse actually dragged, fling wins; otherwise inspect.
    const _origOnCatClick = window.onCatClick;
    window.onCatClick = function patchedOnCatClick(cat) {
      // Swallow the trailing click after a fling-drag
      if (cat._suppressNextClick) { cat._suppressNextClick = false; return; }
      // Lucky cats still trigger the original capture dialog
      if (cat.lucky && typeof _origOnCatClick === 'function' && !cat._flungUntil) {
        _origOnCatClick(cat);
      } else {
        openCatInspector(cat);
      }
    };

    // ---- wrap makeCatEntity to augment new cats ----
    const _origMake = window.makeCatEntity;
    window.makeCatEntity = function patchedMakeCatEntity(opts) {
      const cat = _origMake(opts || {});
      if (cat) {
        // Assign language if not already present
        if (!cat.language) cat.language = pickCatLang();
        getOrMakeCatExtras(cat);   // seed happiness/bank/thoughts
        installCatFlingHooks(cat);
      }
      return cat;
    };

    // Install global mouse listeners (once)
    initParkGlobalMouse();

    // Park tick loop — 10 Hz is plenty for behavior that's not per-frame
    if (!catRuntime.park.dayTickInterval) {
      catRuntime.park.dayTickInterval = setInterval(() => {
        if (!catRuntime.stageEl) return;
        tickParkCatBehavior(0.1);
        tickDayNight();
      }, 100);
    }

    // Wrap renderCatsTab so the HUD mounts alongside the standard tab
    const _origRender = window.renderCatsTab;
    if (typeof _origRender === 'function') {
      window.renderCatsTab = function patchedRenderCatsTab() {
        _origRender();
        renderParkHud();
        // Re-install stage click handler for robot movement (stage re-created? no — built once)
        if (catRuntime.park.robot) installStageClickForRobot();
      };
    }
  };
  tryInstall();
})();

// ---------- POMODORO HOOK — +1 token per work+break cycle ----------
// pomodoro.js's completeBreakSession() calls window.onPomodoroBreakComplete()
// whenever a break finishes. One break = one full work+break cycle = 1🎫.
window.onPomodoroBreakComplete = function () { awardPomodoroToken('break done'); };
