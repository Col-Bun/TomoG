// ===== POCKET MONSTERS (PMD sprite wanderers) =====
// 《幻影獣 · Monstruos de Bolsillo》
// A completely separate layer from the cats. Monsters use PMD-style sprite
// sheets (Walk/Idle/Sleep/Sit/Eat) with 8-direction facing.
// Sheets live at /monsters/<species>/<Anim>-Anim.png; frame sizes come from
// AnimData.xml (baked into the MONSTERS registry below so we don't parse
// XML at runtime).
//
// RESEARCH USE ONLY — sprites are user-provided assets.

// ---------- REGISTRY ----------
// Each species: label, folder, and per-anim {frameW, frameH, durations[]}
// where durations are in PMD "ticks" (1 tick ≈ 1/60 s).
// `directional: true` means the sheet has 8 rows (Down, DR, Right, UR, Up, UL, Left, DL).
// `directional: false` means 1 row, facing ignored.
const MONSTERS_PMD_TICK_MS = 1000 / 60;

const MONSTER_SPECIES = {
  bulbasaur: {
    id: 'bulbasaur',
    label: 'Bulbasaur',
    jp: 'フシギダネ',
    es: 'Bulbasaur',
    dir: 'monsters/bulbasaur',
    scale: 2.0,           // on-screen render multiplier
    walkSpeed: 0.7,       // px per animation-tick
    // Each anim: width/height per frame + durations (directional = 8 rows)
    anims: {
      Walk:  { w: 40, h: 40, dirs: 8, dur: [4,4,4,4,4,4] },
      Idle:  { w: 32, h: 40, dirs: 8, dur: [40,6,6] },
      Sleep: { w: 24, h: 24, dirs: 1, dur: [30,35] },
      Sit:   { w: 24, h: 32, dirs: 1, dur: [8,8,8] },
      Eat:   { w: 24, h: 32, dirs: 1, dur: [6,8,6,8] },
    },
    // Small-talk / thought bubbles, sparse on purpose
    bubbles: ['ブルバ！', 'bulba…', '🌱', '…', 'よろしく', 'saur~'],
  },
  charmander: {
    id: 'charmander',
    label: 'Charmander',
    jp: 'ヒトカゲ',
    es: 'Charmander',
    dir: 'monsters/charmander',
    scale: 2.2,
    walkSpeed: 0.8,
    anims: {
      Walk:  { w: 32, h: 32, dirs: 8, dur: [6,8,6,8] },
      Idle:  { w: 32, h: 40, dirs: 8, dur: [12,8,8,8] },
      Sleep: { w: 32, h: 24, dirs: 1, dur: [30,35] },
      Sit:   { w: 24, h: 32, dirs: 1, dur: [8,8,8] },
      Eat:   { w: 24, h: 32, dirs: 1, dur: [6,8,6,8] },
    },
    bubbles: ['ヒトカゲ！', 'char!', '🔥', 'hot hot', '…', 'mander~'],
  },
  squirtle: {
    id: 'squirtle',
    label: 'Squirtle',
    jp: 'ゼニガメ',
    es: 'Squirtle',
    dir: 'monsters/squirtle',
    scale: 2.2,
    walkSpeed: 0.65,
    anims: {
      Walk:  { w: 32, h: 32, dirs: 8, dur: [12,8,12,8] },
      Idle:  { w: 32, h: 32, dirs: 8, dur: [30,2,2,4,4,4,2,2] },
      Sleep: { w: 24, h: 24, dirs: 1, dur: [30,35] },
      Sit:   { w: 24, h: 32, dirs: 1, dur: [8,8,8] },
      Eat:   { w: 24, h: 32, dirs: 1, dur: [6,8,6,8] },
    },
    bubbles: ['ゼニガメ！', 'squirt~', '💧', 'splash', '…', 'turtle life'],
  },
  charmeleon: {
    id: 'charmeleon',
    label: 'Charmeleon',
    jp: 'リザード',
    es: 'Charmeleon',
    dir: 'monsters/charmeleon',
    scale: 2.1,
    walkSpeed: 0.85,
    anims: {
      Walk:  { w: 24, h: 32, dirs: 8, dur: [8,10,8,10] },
      Idle:  { w: 32, h: 56, dirs: 8, dur: [40,2,3,3,3,2] },
      Sleep: { w: 24, h: 32, dirs: 1, dur: [30,35] },
      Sit:   { w: 32, h: 32, dirs: 1, dur: [8,8,8] },
      Eat:   { w: 24, h: 32, dirs: 1, dur: [6,8,6,8] },
    },
    bubbles: ['リザード！', 'rawr~', '🔥', 'GRRR', '…', 'char-char'],
  },
  pidgey: {
    id: 'pidgey',
    label: 'Pidgey',
    jp: 'ポッポ',
    es: 'Pidgey',
    dir: 'monsters/pidgey',
    scale: 2.0,
    walkSpeed: 0.75,
    anims: {
      Walk:  { w: 32, h: 32, dirs: 8, dur: [6,4,4,4,4] },
      Idle:  { w: 24, h: 40, dirs: 8, dur: [30,4,4,4,4] },
      Sleep: { w: 24, h: 16, dirs: 1, dur: [35,30] },
      Sit:   { w: 24, h: 24, dirs: 1, dur: [8,8,8] },
      Eat:   { w: 24, h: 24, dirs: 1, dur: [6,8,6,8] },
    },
    bubbles: ['ポッポ！', 'chirp~', '🐦', 'tweet', '…', 'fly fly'],
  },
  rattata: {
    id: 'rattata',
    label: 'Rattata',
    jp: 'コラッタ',
    es: 'Rattata',
    dir: 'monsters/rattata',
    scale: 1.9,
    walkSpeed: 0.95,  // rattata is quick
    anims: {
      Walk:  { w: 48, h: 40, dirs: 8, dur: [6,4,4,4,4,4,4] },
      Idle:  { w: 32, h: 32, dirs: 8, dur: [40,2,2,2,4,2,2,2] },
      Sleep: { w: 32, h: 24, dirs: 1, dur: [30,35] },
      // No Sit/Eat sheets — setMonsterState falls back to Idle automatically
    },
    bubbles: ['コラッタ！', 'squeak!', '🐭', 'チュー', '…', 'nibble'],
  },
  pikachu: {
    id: 'pikachu',
    label: 'Pikachu',
    jp: 'ピカチュウ',
    es: 'Pikachu',
    dir: 'monsters/pikachu',
    scale: 2.0,
    walkSpeed: 0.8,
    anims: {
      Walk:  { w: 32, h: 40, dirs: 8, dur: [8,10,8,10] },
      Idle:  { w: 40, h: 56, dirs: 8, dur: [40,2,3,3,3,2] },
      Sleep: { w: 32, h: 40, dirs: 1, dur: [30,35] },
      Sit:   { w: 32, h: 40, dirs: 1, dur: [8,8,8] },
      Eat:   { w: 24, h: 48, dirs: 1, dur: [6,8,6,8] },
    },
    bubbles: ['ピカチュウ！', 'pika pika~', '⚡', 'chuu~', '…', 'pika!'],
  },
};

// ---------- CONFIG ----------
const MONSTER_CFG = {
  SPAWN_INTERVAL_MS: 90 * 1000,     // try to add one every 90s
  MAX_ROAMING: 7,                    // soft cap — one per species
  LIFESPAN_MS: 2 * 60 * 60 * 1000,   // 2 hours, shorter than cats
  FADEOUT_MS: 1200,
  STATE_MIN_MS: 4 * 1000,
  STATE_MAX_MS: 14 * 1000,
  TICK_MS: 60,                       // our update cadence
};

// ---------- RUNTIME ----------
const monsterRuntime = {
  roaming: [],          // { id, species, x, y, vx, vy, facingRow, state, animIdx, animTMs, targetX, targetY, nextStateAt, el, spawnTime, despawning }
  nextId: 1,
  spawnInterval: null,
  tickInterval: null,
  stageEl: null,
  imgPreloaded: {},     // species id -> { anim name -> true when loaded }
};

// ---------- DATA ----------
function getMonsterData() {
  if (!window.data) return null;
  if (!data.monsters) {
    data.monsters = {
      totalSpawnedEver: 0,
      encountered: {},   // species -> first seen timestamp
    };
    saveData();
  }
  return data.monsters;
}

// ---------- UTILITIES ----------
function monsterPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function monsterClamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Preload a species' sprite sheets (just Walk + Idle at minimum; others on demand)
function preloadSpeciesSheets(species) {
  if (monsterRuntime.imgPreloaded[species.id]) return;
  monsterRuntime.imgPreloaded[species.id] = {};
  for (const animName of Object.keys(species.anims)) {
    const img = new Image();
    img.onload = () => { monsterRuntime.imgPreloaded[species.id][animName] = true; };
    img.src = species.dir + '/' + animName + '-Anim.png';
  }
}

// Convert (vx, vy) velocity to PMD direction row index (0..7 starting Down, clockwise)
function vecToDirRow(dx, dy) {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return 0;
  // Down = 0; Right = 2; Up = 4; Left = 6 (clockwise)
  let a = -(Math.atan2(dy, dx) - Math.PI / 2);
  if (a < 0) a += 2 * Math.PI;
  const row = Math.round(a / (Math.PI / 4)) % 8;
  return row;
}

// Get frame column for current animIdx given the state's duration list.
// animTMs is ms accumulated in the current sub-frame.
function computeAnimFrame(state, species, animIdx) {
  const anim = species.anims[state];
  if (!anim) return { col: 0, animIdx: 0 };
  // animIdx already tracks which frame we're on
  const col = animIdx % anim.dur.length;
  return { col, total: anim.dur.length };
}

// ---------- SPAWN ----------
function spawnMonster(speciesId) {
  if (!monsterRuntime.stageEl) return null;
  if (monsterRuntime.roaming.length >= MONSTER_CFG.MAX_ROAMING) return null;

  // Enforce one-per-type: reject a species if one is already roaming
  const liveSet = new Set(monsterRuntime.roaming.map(mm => mm.species.id));
  let resolvedId = speciesId;
  if (resolvedId && liveSet.has(resolvedId)) return null;
  if (!resolvedId) resolvedId = pickRandomSpeciesId();
  if (!resolvedId) return null;   // all species already out

  const species = MONSTER_SPECIES[resolvedId];
  if (!species) return null;
  preloadSpeciesSheets(species);

  const md = getMonsterData();
  if (md) {
    md.totalSpawnedEver++;
    if (!md.encountered[species.id]) md.encountered[species.id] = Date.now();
    saveData();
  }

  const stage = monsterRuntime.stageEl;
  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;
  const id = 'M' + (monsterRuntime.nextId++);

  const frameW = species.anims.Walk.w;
  const frameH = species.anims.Walk.h;
  const scale = species.scale || 2;
  const renderW = frameW * scale;
  const renderH = frameH * scale;

  const x = Math.random() * Math.max(1, w - renderW);
  const y = Math.random() * Math.max(1, h - renderH);

  const m = {
    id,
    species,
    x, y,
    vx: 0, vy: 0,
    facingRow: Math.floor(Math.random() * 8),
    state: 'Idle',
    animIdx: 0,
    animTMs: 0,
    targetX: null,
    targetY: null,
    nextStateAt: performance.now() + 1200 + Math.random() * 2400,
    el: null,
    spawnTime: Date.now(),
    despawning: false,
    lastBubble: 0,
  };

  m.el = renderMonsterDom(m);
  stage.appendChild(m.el);
  monsterRuntime.roaming.push(m);
  if (typeof catLog === 'function') catLog('👾 wild ' + species.label + ' appeared!');
  return m;
}

function pickRandomSpeciesId() {
  // Only pick from species that aren't already roaming (one-per-type rule)
  const liveSet = new Set(monsterRuntime.roaming.map(m => m.species.id));
  const available = Object.keys(MONSTER_SPECIES).filter(k => !liveSet.has(k));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function renderMonsterDom(m) {
  const el = document.createElement('div');
  el.className = 'pmon pmon-' + m.species.id;
  el.dataset.mid = m.id;
  el.style.position = 'absolute';
  el.style.left = m.x + 'px';
  el.style.top = m.y + 'px';
  el.style.zIndex = '2';
  el.style.cursor = 'pointer';
  el.style.userSelect = 'none';
  el.innerHTML = `
    <div class="pmon-shadow"></div>
    <div class="pmon-sprite"></div>
    <div class="pmon-bubble" style="display:none;"></div>
    <div class="pmon-label">${m.species.label}</div>
  `;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onMonsterClick(m);
  });
  applyMonsterFrame(m);
  return el;
}

function applyMonsterFrame(m) {
  if (!m.el) return;
  const species = m.species;
  const state = m.state;
  const animDef = species.anims[state] || species.anims.Idle;
  const row = animDef.dirs === 8 ? m.facingRow : 0;
  const col = m.animIdx % animDef.dur.length;

  const sprite = m.el.querySelector('.pmon-sprite');
  if (!sprite) return;
  const url = species.dir + '/' + state + '-Anim.png';
  const scale = species.scale || 2;
  sprite.style.width = animDef.w + 'px';
  sprite.style.height = animDef.h + 'px';
  sprite.style.transform = 'scale(' + scale + ')';
  sprite.style.transformOrigin = 'top left';
  sprite.style.backgroundImage = 'url("' + url + '")';
  sprite.style.backgroundPosition = `-${col * animDef.w}px -${row * animDef.h}px`;
  sprite.style.backgroundRepeat = 'no-repeat';
  sprite.style.imageRendering = 'pixelated';

  // Outer el width follows the scaled sprite so hitbox matches
  m.el.style.width = (animDef.w * scale) + 'px';
  m.el.style.height = (animDef.h * scale) + 'px';
}

// ---------- TICK ----------
function monsterTick() {
  if (!monsterRuntime.stageEl) return;
  const now = performance.now();
  const nowMs = Date.now();
  const dtMs = MONSTER_CFG.TICK_MS;

  const w = monsterRuntime.stageEl.clientWidth || 600;
  const h = monsterRuntime.stageEl.clientHeight || 320;

  // Lifespan sweep
  for (let i = monsterRuntime.roaming.length - 1; i >= 0; i--) {
    const m = monsterRuntime.roaming[i];
    if (m.despawning) continue;
    if (nowMs - m.spawnTime >= MONSTER_CFG.LIFESPAN_MS) {
      m.despawning = true;
      if (m.el) m.el.classList.add('pmon-despawning');
      if (typeof catLog === 'function') catLog('👋 ' + m.species.label + ' wandered off');
      setTimeout(() => {
        const idx = monsterRuntime.roaming.indexOf(m);
        if (idx >= 0) monsterRuntime.roaming.splice(idx, 1);
        if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
      }, MONSTER_CFG.FADEOUT_MS);
    }
  }

  for (const m of monsterRuntime.roaming) {
    if (m.despawning) continue;

    // State transitions
    if (now >= m.nextStateAt) {
      rollMonsterState(m);
    }

    // Movement if walking
    if (m.state === 'Walk') {
      // If we have a target, steer; else pick one
      if (m.targetX === null || m.targetY === null) {
        pickMonsterTarget(m, w, h);
      }
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        m.targetX = null; m.targetY = null;
        // Sometimes pause after arriving
        if (Math.random() < 0.7) {
          setMonsterState(m, monsterPick(['Idle', 'Sit', 'Idle']), 2000 + Math.random() * 3500);
        }
      } else {
        const speed = m.species.walkSpeed;
        const nx = dx / dist, ny = dy / dist;
        m.vx = nx * speed;
        m.vy = ny * speed;
        m.facingRow = vecToDirRow(m.vx, m.vy);
        m.x += m.vx * (dtMs / 16);
        m.y += m.vy * (dtMs / 16);
        // Keep inside stage
        const rw = m.species.anims.Walk.w * (m.species.scale || 2);
        const rh = m.species.anims.Walk.h * (m.species.scale || 2);
        m.x = monsterClamp(m.x, 0, w - rw);
        m.y = monsterClamp(m.y, 0, h - rh);
        if (m.el) { m.el.style.left = m.x.toFixed(1) + 'px'; m.el.style.top = m.y.toFixed(1) + 'px'; }
      }
    } else {
      // Non-walking states — slight wiggle, zero velocity
      m.vx = 0; m.vy = 0;
    }

    // Advance frame
    const animDef = m.species.anims[m.state] || m.species.anims.Idle;
    m.animTMs += dtMs;
    const curDur = animDef.dur[m.animIdx % animDef.dur.length] * MONSTERS_PMD_TICK_MS;
    if (m.animTMs >= curDur) {
      m.animTMs = 0;
      m.animIdx = (m.animIdx + 1) % animDef.dur.length;
    }
    applyMonsterFrame(m);

    // Bubble expiry
    if (m.bubble && now > m.bubble.until) clearMonsterBubble(m);

    // Rarely bubble
    if (!m.bubble && Math.random() < 0.008 && now - m.lastBubble > 4000) {
      setMonsterBubble(m, monsterPick(m.species.bubbles), 1800);
      m.lastBubble = now;
    }

    // Interact with nearby cats — emoji reaction bubble
    if (typeof catRuntime !== 'undefined' && catRuntime.roaming) {
      for (const cat of catRuntime.roaming) {
        const d = Math.hypot(cat.x - m.x, cat.y - m.y);
        if (d < 70 && Math.random() < 0.003) {
          setMonsterBubble(m, monsterPick(['?', '!', '✨', '🌱']), 1500);
          if (typeof setCatBubble === 'function' && Math.random() < 0.35) {
            const reactions = ['…？', '¿qué es eso?', 'a creature!?', 'にゃ！？'];
            setCatBubble(cat, reactions[Math.floor(Math.random() * reactions.length)], 1800);
          }
          break;
        }
      }
    }
  }
}

function setMonsterState(m, state, durationMs) {
  // Fall back to Idle if this species doesn't have a sheet for the requested state
  // (e.g. rattata has no Sit/Eat sheet)
  if (!m.species.anims[state]) state = 'Idle';
  m.state = state;
  m.animIdx = 0;
  m.animTMs = 0;
  m.nextStateAt = performance.now() + (durationMs || 3000);
}

function rollMonsterState(m) {
  // Weighted: walk most, occasionally idle/sit/eat/sleep
  const r = Math.random();
  let state;
  if      (r < 0.55) state = 'Walk';
  else if (r < 0.75) state = 'Idle';
  else if (r < 0.87) state = 'Sit';
  else if (r < 0.95) state = 'Eat';
  else               state = 'Sleep';
  const min = MONSTER_CFG.STATE_MIN_MS, max = MONSTER_CFG.STATE_MAX_MS;
  const dur = state === 'Walk' ? min + Math.random() * (max - min)
            : state === 'Sleep' ? 8000 + Math.random() * 6000
            : 3000 + Math.random() * 4000;
  setMonsterState(m, state, dur);
  // When entering walk, clear target so it gets picked fresh
  if (state === 'Walk') { m.targetX = null; m.targetY = null; }
}

function pickMonsterTarget(m, stageW, stageH) {
  // Bias toward staying near current area but occasionally roam far
  const far = Math.random() < 0.3;
  const range = far ? Math.max(stageW, stageH) * 0.6 : 120;
  const nx = monsterClamp(m.x + (Math.random() - 0.5) * range * 2, 0, stageW - 60);
  const ny = monsterClamp(m.y + (Math.random() - 0.5) * range * 2, 0, stageH - 60);
  m.targetX = nx;
  m.targetY = ny;
}

// ---------- BUBBLES ----------
function setMonsterBubble(m, text, ms) {
  if (!m.el) return;
  m.bubble = { text, until: performance.now() + (ms || 2000) };
  const slot = m.el.querySelector('.pmon-bubble');
  if (slot) { slot.textContent = text; slot.style.display = 'block'; }
}
function clearMonsterBubble(m) {
  m.bubble = null;
  if (m.el) {
    const slot = m.el.querySelector('.pmon-bubble');
    if (slot) slot.style.display = 'none';
  }
}

// ---------- CLICK ----------
function onMonsterClick(m) {
  const md = getMonsterData();
  const seenAt = md && md.encountered[m.species.id] ? new Date(md.encountered[m.species.id]).toLocaleDateString() : '—';
  setMonsterBubble(m, m.species.label + ' !', 2200);
  if (typeof catLog === 'function') {
    catLog('👾 ' + m.species.label + ' · ' + m.species.jp + ' / ' + m.species.es + ' · first seen ' + seenAt);
  }
  // Small delight: force a Pose-ish state
  setMonsterState(m, 'Idle', 2200);
}

// ---------- LIFECYCLE ----------
function ensureMonsterSystem() {
  // Find the cat stage to attach into
  if (!monsterRuntime.stageEl) {
    monsterRuntime.stageEl = document.getElementById('cat-stage');
  }
  if (!monsterRuntime.stageEl) return;   // tab not built yet

  // Preload all registered species up front (small number of sprites)
  for (const key of Object.keys(MONSTER_SPECIES)) {
    preloadSpeciesSheets(MONSTER_SPECIES[key]);
  }

  if (!monsterRuntime.spawnInterval) {
    monsterRuntime.spawnInterval = setInterval(() => {
      if (!monsterRuntime.stageEl) return;
      if (monsterRuntime.roaming.length >= MONSTER_CFG.MAX_ROAMING) return;
      // 70% spawn chance per interval, biases to sometimes skipping
      if (Math.random() < 0.7) spawnMonster();
    }, MONSTER_CFG.SPAWN_INTERVAL_MS);
  }
  if (!monsterRuntime.tickInterval) {
    monsterRuntime.tickInterval = setInterval(monsterTick, MONSTER_CFG.TICK_MS);
  }

  // Seed one monster on first entry
  if (monsterRuntime.roaming.length === 0) {
    // Short delay so the tab DOM is fully painted
    setTimeout(() => { if (monsterRuntime.stageEl) spawnMonster(); }, 600);
  }
}

// Remove monsters on refresh-world (hook into catpark's refresh if it exists)
function clearAllMonsters() {
  for (const m of monsterRuntime.roaming.slice()) {
    if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
  }
  monsterRuntime.roaming.length = 0;
}

// ---------- HOOKS ----------
// Attach to renderCatsTab so we boot the monster system whenever the cats
// tab is shown. We also hook into refreshCatWorld to clear monsters.
(function installMonsterHooks() {
  const tryInstall = () => {
    if (typeof window.renderCatsTab !== 'function') {
      setTimeout(tryInstall, 300);
      return;
    }
    const origRender = window.renderCatsTab;
    window.renderCatsTab = function patchedRenderCatsTabForMonsters() {
      origRender.apply(this, arguments);
      ensureMonsterSystem();
    };
    if (typeof window.refreshCatWorld === 'function') {
      const origRefresh = window.refreshCatWorld;
      window.refreshCatWorld = function patchedRefreshForMonsters() {
        // Snapshot cat count BEFORE refresh runs. The refresh function asks for
        // confirmation; if the user confirms, it wipes cats/rides/robot. We
        // detect that by seeing the cat count drop, and wipe monsters in sync.
        const catsBefore = (typeof catRuntime !== 'undefined' && catRuntime.roaming)
          ? catRuntime.roaming.length : 0;
        const result = origRefresh.apply(this, arguments);
        const catsAfter = (typeof catRuntime !== 'undefined' && catRuntime.roaming)
          ? catRuntime.roaming.length : 0;
        // Reset happened if the cat roster shrank at all (refresh always wipes
        // before respawning defaults, so a confirmed reset strictly drops count).
        if (catsBefore > catsAfter) {
          clearAllMonsters();
        }
        return result;
      };
    }
  };
  tryInstall();
})();
