// ===================================================================
// MOE-CHAN RPG — "Kotoba no Meikyuu" / "El Laberinto de las Palabras"
// A turn-based, non-combat, vocabulary roguelike in the spirit of
// Binding of Isaac + Dwarf Fortress + SRS flashcards.
//
// How it learns the player:
//   - Rooms are populated using YOUR tagged dictionary words (script.js).
//   - Each NPC asks for a VERB + OBJECT combo drawn from your own flashcards.
//   - Correct answers reinforce words (SRS-style 'correct' counter).
//   - Missed words resurface more often later.
//   - Language toggle (ja / es) flips all prompts.
// ===================================================================

// ---------- CONFIG ----------
const RPG_GRID_W = 8;
const RPG_GRID_H = 8;
const RPG_TARGET_ROOMS = 16;     // total rooms per floor
const RPG_MOE_REWARD_BASE = 5;   // base MoeBucks reward per satisfied NPC
const RPG_STREAK_BONUS = 2;      // extra MB per consecutive correct
const RPG_PENALTY_HINT = true;   // on wrong, reveal hint instead of hard-fail

// ---------- LANGUAGE PACKS ----------
// Room-generic phrases (not from user dictionary). Kept short and polite.
const RPG_LANG = {
  ja: {
    greet: ['こんにちは！', 'あの…', 'すみません…', 'よく来たね！', 'お願いが…'],
    ask_verb_object: (v, o) => `${o}を${v}してください。`,
    ask_verb_only:   (v)    => `${v}てほしいんだ。`,
    thanks: ['ありがとう！', '助かった！', 'すごい！', 'さすが！'],
    sad:    ['…違うみたい。', 'う〜ん、もう一度？', 'ちょっと違う…'],
    shopkeeper: 'いらっしゃいませ！',
    treasure: '宝箱がある！',
    empty: 'しずかな部屋。',
    start: 'ここから始まる。',
    boss: '長老が待っている。',
    boss_satisfied: '長老が微笑む。よくやった。',
    inventory_label: '持ち物',
    verbs_label: '動詞を選ぶ',
    room_label: '部屋',
    floor_label: '階',
    turn_label: '手番',
    bucks_earned: 'モエバックス獲得！',
    new_floor: '下の階へ…',
  },
  es: {
    greet: ['¡Hola!', 'Perdón…', '¡Oye!', 'Disculpa…', 'Una cosita…'],
    ask_verb_object: (v, o) => `Por favor, ${v} el/la ${o}.`,
    ask_verb_only:   (v)    => `Necesito que lo/la ${v}.`,
    thanks: ['¡Gracias!', '¡Mil gracias!', '¡Qué bien!', '¡Genial!'],
    sad:    ['Mmm, no es eso…', '¿Otra vez?', 'Casi, pero no.'],
    shopkeeper: '¡Bienvenida a mi tienda!',
    treasure: '¡Un cofre!',
    empty: 'Habitación tranquila.',
    start: 'Aquí empieza el laberinto.',
    boss: 'El anciano aguarda.',
    boss_satisfied: 'El anciano sonríe. Bien hecho.',
    inventory_label: 'Inventario',
    verbs_label: 'Elige un verbo',
    room_label: 'Sala',
    floor_label: 'Piso',
    turn_label: 'Turno',
    bucks_earned: '¡MoeBucks ganados!',
    new_floor: 'Bajando…',
  }
};

function rpgLang() {
  const key = (data && data.rpg && data.rpg.lang) ? data.rpg.lang : 'ja';
  return RPG_LANG[key] || RPG_LANG.ja;
}

// ---------- DATA SHAPE ----------
function ensureRpgData() {
  if (!data.rpg) {
    data.rpg = {
      lang: 'ja',
      run: null,      // current run
      stats: { runs: 0, satisfied: 0, floors: 0, correctTotal: 0, wrongTotal: 0, bestStreak: 0 },
    };
  }
  if (!data.rpg.stats) data.rpg.stats = { runs:0, satisfied:0, floors:0, correctTotal:0, wrongTotal:0, bestStreak:0 };
}

// ---------- HELPERS ----------
function rpgRand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function rpgShuffle(a) {
  const x = a.slice();
  for (let i = x.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// Return up to N dictionary words matching the predicate, weighted so
// rarely-used / wrong-recent words show up more (light SRS).
function rpgPickWords(predicate, n) {
  const pool = (data.dictionary || []).filter(predicate);
  if (pool.length === 0) return [];
  const weighted = pool.map(w => {
    const uses = w.uses || 0;
    const correct = w.correct || 0;
    // Higher weight = more likely. New (uses=0) gets medium weight.
    // Often-correct -> lower weight. Missed (uses > correct) -> higher weight.
    let weight = 1;
    if (uses === 0) weight = 2;              // new words get priority
    else weight = 1 + Math.max(0, (uses - correct)) * 0.8;
    return { w, weight };
  });
  const out = [];
  const pickPool = weighted.slice();
  for (let i=0; i<n && pickPool.length > 0; i++) {
    const total = pickPool.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let j=0; j<pickPool.length; j++) {
      r -= pickPool[j].weight;
      if (r <= 0) { idx = j; break; }
    }
    out.push(pickPool[idx].w);
    pickPool.splice(idx, 1);
  }
  return out;
}

function rpgWordText(w, lang) {
  if (!w) return '';
  if (lang === 'es') return w.es && w.es !== '—' ? w.es : (w.jp !== '—' ? w.jp : w.en);
  return w.jp && w.jp !== '—' ? w.jp : (w.es !== '—' ? w.es : w.en);
}

function rpgUsageTick(word, correct) {
  if (!word) return;
  // Match by the 3-tuple since there's no id
  const hit = (data.dictionary || []).find(x => x.en === word.en && x.jp === word.jp && x.es === word.es);
  if (!hit) return;
  hit.uses = (hit.uses || 0) + 1;
  if (correct) hit.correct = (hit.correct || 0) + 1;
}

// ---------- MAP GENERATION (Isaac-style flood fill) ----------
function rpgGenerateMap(floor) {
  const cx = Math.floor(RPG_GRID_W/2), cy = Math.floor(RPG_GRID_H/2);
  const rooms = {};
  const key = (x,y) => `${x},${y}`;
  rooms[key(cx,cy)] = { x: cx, y: cy, type: 'start', visited: true, npc: null, treasure: null };
  const queue = [[cx, cy]];
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  let count = 1;
  const targetRooms = Math.min(RPG_TARGET_ROOMS + floor, 24);
  while (queue.length > 0 && count < targetRooms) {
    const [x,y] = queue.shift();
    const shuffledDirs = rpgShuffle(dirs);
    for (const [dx,dy] of shuffledDirs) {
      if (count >= targetRooms) break;
      const nx = x+dx, ny = y+dy;
      if (nx < 0 || nx >= RPG_GRID_W || ny < 0 || ny >= RPG_GRID_H) continue;
      if (rooms[key(nx,ny)]) continue;
      // count neighbors already in rooms — avoid tight clusters
      let neighborCount = 0;
      for (const [ddx,ddy] of dirs) if (rooms[key(nx+ddx,ny+ddy)]) neighborCount++;
      if (neighborCount > 1 && Math.random() < 0.7) continue;
      if (Math.random() < 0.55) {
        rooms[key(nx,ny)] = { x: nx, y: ny, type: 'empty', visited: false, npc: null, treasure: null };
        queue.push([nx,ny]);
        count++;
      }
    }
  }

  // Pick special rooms: boss (farthest), shop, 1-2 treasure rooms, rest become NPC rooms.
  const cells = Object.values(rooms).filter(r => r.type !== 'start');
  // BFS distances from start
  const dist = { [key(cx,cy)]: 0 };
  const bfs = [[cx,cy]];
  while (bfs.length) {
    const [x,y] = bfs.shift();
    for (const [dx,dy] of dirs) {
      const nx=x+dx, ny=y+dy, k=key(nx,ny);
      if (rooms[k] && dist[k] === undefined) {
        dist[k] = dist[key(x,y)] + 1;
        bfs.push([nx,ny]);
      }
    }
  }
  // boss: the single farthest
  let farthest = null, maxD = -1;
  for (const k in dist) if (dist[k] > maxD && rooms[k].type !== 'start') { maxD = dist[k]; farthest = k; }
  if (farthest) rooms[farthest].type = 'boss';

  // shop: random mid-distance room
  const midRooms = cells.filter(r => {
    const d = dist[key(r.x,r.y)];
    return d >= 2 && d <= Math.max(3, maxD-1) && r.type === 'empty';
  });
  if (midRooms.length) { const sh = rpgRand(midRooms); sh.type = 'shop'; }

  // treasures: ~2
  const emptyRooms = cells.filter(r => r.type === 'empty');
  rpgShuffle(emptyRooms).slice(0, Math.min(2, emptyRooms.length)).forEach(r => r.type = 'treasure');

  // remaining empties become npc rooms (most of them)
  cells.filter(r => r.type === 'empty').forEach(r => {
    r.type = Math.random() < 0.85 ? 'npc' : 'empty';
  });

  return { rooms, startKey: key(cx,cy) };
}

// ---------- THEMES (from tags) ----------
// Pick 1-3 "theme tags" that dominate this floor. NPCs in the floor will prefer
// words carrying one of those tags, giving each floor a coherent motif
// ("kitchen", "emotion", "garden", etc.).
function rpgPickFloorThemes(floor) {
  const counts = {};
  (data.dictionary || []).forEach(w => (w.tags||[]).forEach(t => { counts[t] = (counts[t]||0)+1; }));
  const tags = Object.entries(counts).filter(([t, n]) => n >= 2).sort((a,b) => b[1]-a[1]);
  if (tags.length === 0) return [];
  // Pick up to 3 themes, weighted toward diversity (not always top)
  const pool = tags.slice(0, Math.min(8, tags.length));
  const chosen = [];
  for (let i = 0; i < Math.min(3, pool.length); i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool[idx][0]);
    pool.splice(idx, 1);
  }
  return chosen;
}

// Filter dictionary by at least one of the floor themes (or all if no themes).
function rpgThemedPool(type) {
  const run = data.rpg && data.rpg.run;
  const themes = (run && run.themes) ? run.themes : [];
  const all = (data.dictionary || []).filter(w => w.type === type);
  if (themes.length === 0) return all;
  const themed = all.filter(w => (w.tags||[]).some(t => themes.includes(t)));
  // Fallback to full pool if themed set is too small
  return themed.length >= 2 ? themed : all;
}

// ---------- NPC REQUEST GENERATION ----------
function rpgGenerateNpcRequest(floor) {
  const lang = (data.rpg && data.rpg.lang) || 'ja';
  const L = rpgLang();

  // 1. pick a verb — prefer themed ones
  const verbPool = rpgThemedPool('verb');
  const verbs = (function() {
    if (verbPool.length === 0) return [];
    // reuse weighting logic by directly calling pickWords on the themed pool
    const savedDict = data.dictionary;
    // Simple weighted pick
    const weighted = verbPool.map(w => {
      const uses = w.uses || 0, correct = w.correct || 0;
      let wt = uses === 0 ? 2 : 1 + Math.max(0, uses - correct) * 0.8;
      return { w, wt };
    });
    const total = weighted.reduce((s,x) => s+x.wt, 0);
    let r = Math.random()*total;
    for (const e of weighted) { r -= e.wt; if (r <= 0) return [e.w]; }
    return [weighted[0].w];
  })();

  // 2. pick an object (noun) — prefer themed ones
  const nounPool = rpgThemedPool('noun');
  const objects = (function() {
    if (nounPool.length === 0) return [];
    const weighted = nounPool.map(w => {
      const uses = w.uses || 0, correct = w.correct || 0;
      let wt = uses === 0 ? 2 : 1 + Math.max(0, uses - correct) * 0.8;
      return { w, wt };
    });
    const total = weighted.reduce((s,x) => s+x.wt, 0);
    let r = Math.random()*total;
    for (const e of weighted) { r -= e.wt; if (r <= 0) return [e.w]; }
    return [weighted[0].w];
  })();

  if (verbs.length === 0 && objects.length === 0) return null;

  const verb = verbs[0] || null;
  const object = objects[0] || null;

  // Build prompt
  let prompt;
  if (verb && object) {
    prompt = L.ask_verb_object(rpgWordText(verb, lang), rpgWordText(object, lang));
  } else if (verb) {
    prompt = L.ask_verb_only(rpgWordText(verb, lang));
  } else {
    // object only: simple "give me the X"
    prompt = lang === 'ja' ? `${rpgWordText(object, 'ja')}をください。` : `Dame el/la ${rpgWordText(object, 'es')}, por favor.`;
  }

  return {
    greet: rpgRand(L.greet),
    prompt: prompt,
    verb: verb ? { en: verb.en, jp: verb.jp, es: verb.es } : null,
    object: object ? { en: object.en, jp: object.jp, es: object.es } : null,
    satisfied: false,
    attempts: 0,
    reward: RPG_MOE_REWARD_BASE + Math.floor(floor * 1.5),
  };
}

// ---------- DECOY VERB / OBJECT CHOICES ----------
function rpgChoices(correctWord, type, count = 4) {
  const lang = (data.rpg && data.rpg.lang) || 'ja';
  const pool = (data.dictionary || []).filter(w => w.type === type);
  if (pool.length <= 1) return correctWord ? [correctWord] : [];
  const others = pool.filter(w => !(w.en === correctWord.en && w.jp === correctWord.jp));
  const decoys = rpgShuffle(others).slice(0, Math.max(0, count - 1));
  return rpgShuffle([correctWord, ...decoys]);
}

// ---------- RUN LIFECYCLE ----------
function rpgStartRun(floor = 1) {
  ensureRpgData();
  const map = rpgGenerateMap(floor);
  const rooms = map.rooms;

  // Establish run state BEFORE populating rooms (so themes drive NPC gen)
  const themes = rpgPickFloorThemes(floor);
  data.rpg.run = {
    floor: floor,
    rooms: rooms,
    startKey: map.startKey,
    currentKey: map.startKey,
    turns: 0,
    satisfied: 0,
    streak: 0,
    log: [],
    themes: themes,
    selectedObject: null,
  };

  // Populate rooms with themed NPCs and treasures
  Object.values(rooms).forEach(r => {
    if (r.type === 'npc') {
      r.npc = rpgGenerateNpcRequest(floor);
      if (!r.npc) r.type = 'empty';
    } else if (r.type === 'treasure') {
      r.treasure = { moe: 8 + Math.floor(Math.random() * (8 + floor * 3)) };
    }
  });
  // Boss always has an NPC (hardest word of the floor's theme)
  const bossRoom = Object.values(rooms).find(r => r.type === 'boss');
  if (bossRoom) {
    bossRoom.npc = rpgGenerateNpcRequest(floor);
    if (bossRoom.npc) bossRoom.npc.reward = (bossRoom.npc.reward || RPG_MOE_REWARD_BASE) * 2;
  }

  if (themes.length) rpgLog(`📖 Theme: ${themes.map(t => '#'+t).join(' ')}`);
  data.rpg.stats.runs++;
  rpgLog(`🌀 ${rpgLang().new_floor || 'New floor'} ${floor}`);
  saveData();
  if (typeof renderRpg === 'function') renderRpg();
}

function rpgLog(text) {
  if (!data.rpg.run) return;
  data.rpg.run.log.unshift({ t: Date.now(), text });
  if (data.rpg.run.log.length > 30) data.rpg.run.log.length = 30;
}

function rpgCurrentRoom() {
  if (!data.rpg || !data.rpg.run) return null;
  return data.rpg.run.rooms[data.rpg.run.currentKey];
}

function rpgMove(dx, dy) {
  ensureRpgData();
  const run = data.rpg.run;
  if (!run) return;
  const cur = rpgCurrentRoom();
  if (!cur) return;
  const nx = cur.x + dx, ny = cur.y + dy;
  const newKey = `${nx},${ny}`;
  const next = run.rooms[newKey];
  if (!next) return;

  run.currentKey = newKey;
  run.turns++;
  next.visited = true;

  // Auto-open treasure rooms
  if (next.type === 'treasure' && next.treasure && !next.treasure.opened) {
    const mb = next.treasure.moe;
    if (typeof getSlotData === 'function') {
      const sd = getSlotData();
      sd.moeBucks += mb;
      if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
    }
    next.treasure.opened = true;
    rpgLog(`💰 +${mb} MoeBucks from treasure.`);
  }

  if (next.type === 'boss') {
    rpgLog(`👵 ${rpgLang().boss}`);
  }

  saveData();
  if (typeof renderRpg === 'function') renderRpg();
}

function rpgSelectObject(wordKey) {
  if (!data.rpg.run) return;
  data.rpg.run.selectedObject = wordKey || null;
  renderRpg();
}

// Convert dictionary word -> key (en+jp since no id)
function rpgWordKey(w) { return (w.en||'') + '|' + (w.jp||''); }

// Resolve key -> word
function rpgWordFromKey(key) {
  return (data.dictionary || []).find(w => rpgWordKey(w) === key);
}

function rpgOfferVerb(verbKey) {
  const run = data.rpg.run;
  if (!run) return;
  const room = rpgCurrentRoom();
  if (!room || !room.npc || room.npc.satisfied) return;

  const chosenVerbWord = rpgWordFromKey(verbKey);
  const chosenObjectWord = run.selectedObject ? rpgWordFromKey(run.selectedObject) : null;

  const needVerb = room.npc.verb;
  const needObject = room.npc.object;

  const verbOk = !needVerb || (chosenVerbWord && chosenVerbWord.en === needVerb.en && chosenVerbWord.jp === needVerb.jp);
  const objectOk = !needObject || (chosenObjectWord && chosenObjectWord.en === needObject.en && chosenObjectWord.jp === needObject.jp);

  room.npc.attempts++;
  run.turns++;

  // Track usage on whatever the player chose (learning reinforcement)
  if (chosenVerbWord) rpgUsageTick(chosenVerbWord, verbOk);
  if (chosenObjectWord) rpgUsageTick(chosenObjectWord, objectOk);

  if (verbOk && objectOk) {
    room.npc.satisfied = true;
    run.satisfied++;
    run.streak++;
    data.rpg.stats.satisfied++;
    data.rpg.stats.correctTotal++;
    if (run.streak > data.rpg.stats.bestStreak) data.rpg.stats.bestStreak = run.streak;

    const reward = (room.npc.reward || RPG_MOE_REWARD_BASE) + Math.max(0, (run.streak - 1) * RPG_STREAK_BONUS);
    if (typeof getSlotData === 'function') {
      const sd = getSlotData();
      sd.moeBucks += reward;
      if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
    }
    rpgLog(`✅ ${rpgRand(rpgLang().thanks)} +${reward} MB (streak ×${run.streak})`);
    run.selectedObject = null;
  } else {
    run.streak = 0;
    data.rpg.stats.wrongTotal++;
    rpgLog(`❌ ${rpgRand(rpgLang().sad)}`);
  }

  // Boss room logic: once all NPC rooms satisfied, boss rewards huge MB
  if (room.type === 'boss' && room.npc && room.npc.satisfied) {
    rpgCompleteBoss();
  }

  saveData();
  renderRpg();
}

function rpgCompleteBoss() {
  const run = data.rpg.run;
  if (!run) return;
  const reward = 50 + run.floor * 15;
  if (typeof getSlotData === 'function') {
    const sd = getSlotData();
    sd.moeBucks += reward;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  }
  data.rpg.stats.floors++;
  rpgLog(`👑 ${rpgLang().boss_satisfied} +${reward} MB`);
  // auto-advance floor
  setTimeout(() => {
    rpgStartRun((run.floor || 1) + 1);
  }, 400);
}

function rpgToggleLang() {
  ensureRpgData();
  data.rpg.lang = data.rpg.lang === 'ja' ? 'es' : 'ja';
  saveData();
  renderRpg();
}

// ---------- RENDERING ----------
function renderRpg() {
  const container = document.getElementById('rpg-body');
  if (!container) return;
  ensureRpgData();

  // No words yet? guide the user
  const dictCount = (data.dictionary || []).length;
  const verbCount = (data.dictionary || []).filter(w => w.type === 'verb').length;
  const nounCount = (data.dictionary || []).filter(w => w.type === 'noun').length;

  if (dictCount < 4 || (verbCount === 0 && nounCount === 0)) {
    container.innerHTML = `<div class="rpg-empty glass-dark">
      <h3>🗝️ The Labyrinth needs your words.</h3>
      <p>Add at least a handful of <b>nouns</b> and <b>verbs</b> to the <b>Dictionary</b> tab to generate rooms.</p>
      <p style="opacity:0.7;">Tag words like <code>#kitchen</code>, <code>#emotion</code>, <code>#plant</code> — NPCs draw from your tags for themed rooms.</p>
      <p>Current: ${dictCount} words, ${verbCount} verbs, ${nounCount} nouns.</p>
    </div>`;
    return;
  }

  if (!data.rpg.run) {
    const langLabel = data.rpg.lang === 'ja' ? '日本語' : 'Español';
    container.innerHTML = `<div class="rpg-intro glass-dark">
      <h3>🗾 Kotoba no Meikyuu · El Laberinto de las Palabras</h3>
      <p>A turn-based labyrinth of NPCs asking for objects and actions. No combat — just words.</p>
      <p>Language: <b>${langLabel}</b> <button class="rpg-btn rpg-btn-sm" onclick="rpgToggleLang()">🌐 toggle</button></p>
      <button class="btn-glossy btn-green rpg-btn-big" onclick="rpgStartRun(1)">⚔️ Begin Run</button>
      <div class="rpg-stats-row">
        <span>Runs: ${data.rpg.stats.runs}</span>
        <span>NPCs satisfied: ${data.rpg.stats.satisfied}</span>
        <span>Floors cleared: ${data.rpg.stats.floors}</span>
        <span>Best streak: ${data.rpg.stats.bestStreak}</span>
      </div>
    </div>`;
    return;
  }

  const L = rpgLang();
  const run = data.rpg.run;
  const room = rpgCurrentRoom();

  // Render: HEADER + MAP + ROOM + INVENTORY + LOG
  let html = `<div class="rpg-layout">
    <div class="rpg-col-left">
      <div class="rpg-header glass-dark">
        <div class="rpg-header-stats">
          <span>${L.floor_label}: <b>${run.floor}</b></span>
          <span>${L.room_label}: <b>${room ? room.type : '—'}</b></span>
          <span>${L.turn_label}: <b>${run.turns}</b></span>
          ${(run.themes && run.themes.length) ? `<span>📖 ${run.themes.map(t => `<span class="rpg-theme-chip">#${escHtml(t)}</span>`).join(' ')}</span>` : ''}
          <span>😀 NPCs: <b>${run.satisfied}</b></span>
          <span>🔥 streak: <b>${run.streak}</b></span>
          <span>🌐 <button class="rpg-btn rpg-btn-sm" onclick="rpgToggleLang()">${data.rpg.lang.toUpperCase()}</button></span>
          <span><button class="rpg-btn rpg-btn-sm rpg-btn-danger" onclick="rpgAbandonRun()">abandon</button></span>
        </div>
      </div>
      ${renderRpgMap(run)}
    </div>
    <div class="rpg-col-right">
      ${renderRpgRoom(room, L)}
      ${renderRpgInventory(L)}
      ${renderRpgLog(run)}
    </div>
  </div>`;
  container.innerHTML = html;
}

function renderRpgMap(run) {
  // Compute bbox of rooms to avoid huge empty grid
  let minX=99,maxX=-99,minY=99,maxY=-99;
  Object.values(run.rooms).forEach(r => {
    minX=Math.min(minX,r.x); maxX=Math.max(maxX,r.x);
    minY=Math.min(minY,r.y); maxY=Math.max(maxY,r.y);
  });
  const cols = (maxX-minX)+1, rows = (maxY-minY)+1;
  let html = `<div class="rpg-map glass-dark" style="grid-template-columns: repeat(${cols}, 1fr);">`;
  for (let y=minY; y<=maxY; y++) {
    for (let x=minX; x<=maxX; x++) {
      const k = `${x},${y}`;
      const r = run.rooms[k];
      if (!r) { html += `<div class="rpg-cell rpg-cell-void"></div>`; continue; }
      const isCurrent = k === run.currentKey;
      const cls = [
        'rpg-cell',
        'rpg-type-' + r.type,
        r.visited ? 'visited' : 'unseen',
        isCurrent ? 'current' : '',
        (r.npc && r.npc.satisfied) ? 'satisfied' : '',
      ].join(' ');
      const icon = {
        start: '🏠', npc: '🗣', shop: '🛒', treasure: '💰', boss: '👑', empty: '·'
      }[r.type] || '?';
      const opened = (r.type === 'treasure' && r.treasure && r.treasure.opened) ? '·' : icon;
      const satisfiedIcon = (r.npc && r.npc.satisfied) ? '✓' : opened;
      html += `<div class="${cls}" onclick="rpgClickCell(${x},${y})" title="(${x},${y}) ${r.type}">${r.visited ? satisfiedIcon : '?'}</div>`;
    }
  }
  html += `</div>`;
  // Movement controls
  html += `<div class="rpg-move-pad">
    <button class="rpg-move-btn" onclick="rpgMove(0,-1)">▲</button>
    <div class="rpg-move-row">
      <button class="rpg-move-btn" onclick="rpgMove(-1,0)">◀</button>
      <button class="rpg-move-btn rpg-move-center" onclick="renderRpg()">●</button>
      <button class="rpg-move-btn" onclick="rpgMove(1,0)">▶</button>
    </div>
    <button class="rpg-move-btn" onclick="rpgMove(0,1)">▼</button>
  </div>`;
  return html;
}

// click-to-move on adjacent cell
function rpgClickCell(x, y) {
  const run = data.rpg && data.rpg.run; if (!run) return;
  const cur = rpgCurrentRoom(); if (!cur) return;
  const dx = x - cur.x, dy = y - cur.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return; // must be adjacent
  rpgMove(dx, dy);
}

function renderRpgRoom(room, L) {
  if (!room) return '';
  if (room.type === 'start') {
    return `<div class="rpg-room glass-dark"><h4>🏠 ${L.start}</h4><p>${L.start}</p></div>`;
  }
  if (room.type === 'empty') {
    return `<div class="rpg-room glass-dark"><h4>· ${L.empty}</h4><p>${L.empty}</p></div>`;
  }
  if (room.type === 'treasure') {
    const opened = room.treasure && room.treasure.opened;
    return `<div class="rpg-room glass-dark"><h4>💰 ${L.treasure}</h4><p>${opened ? '(empty)' : `+${room.treasure.moe} MB!`}</p></div>`;
  }
  if (room.type === 'shop') {
    return renderRpgShop(L);
  }
  if (room.type === 'npc' || room.type === 'boss') {
    return renderRpgNpc(room, L);
  }
  return '';
}

function renderRpgNpc(room, L) {
  if (!room.npc) return `<div class="rpg-room glass-dark"><h4>${L.empty}</h4></div>`;
  if (room.npc.satisfied) {
    return `<div class="rpg-room glass-dark rpg-room-done"><h4>${room.type==='boss'?'👑':'🗣'} ${rpgRand(L.thanks)}</h4><p>(${room.npc.reward} MB collected)</p></div>`;
  }
  const lang = data.rpg.lang;
  // Build verb choice buttons. If NPC needs no verb (object-only), skip.
  let verbButtons = '';
  if (room.npc.verb) {
    const verbWordInDict = (data.dictionary || []).find(w => w.en === room.npc.verb.en && w.jp === room.npc.verb.jp);
    const choices = rpgChoices(verbWordInDict || room.npc.verb, 'verb', 4);
    verbButtons = choices.map(c => {
      const key = rpgWordKey(c);
      return `<button class="rpg-choice-btn" onclick="rpgOfferVerb('${key.replace(/'/g, "\\'")}')">${escHtml(rpgWordText(c, lang))}</button>`;
    }).join('');
  } else {
    // No verb needed — one big "give" button using empty key
    verbButtons = `<button class="rpg-choice-btn" onclick="rpgOfferVerb('')">${lang==='ja'?'あげる':'dar'}</button>`;
  }

  const hint = room.npc.attempts > 0 && RPG_PENALTY_HINT ? `<div class="rpg-hint">hint (EN): ${escHtml((room.npc.verb?room.npc.verb.en:'') + (room.npc.object?' · '+room.npc.object.en:''))}</div>` : '';

  const selObj = data.rpg.run.selectedObject ? rpgWordFromKey(data.rpg.run.selectedObject) : null;
  const selObjLabel = selObj ? `🧺 ${escHtml(rpgWordText(selObj, lang))}` : `<em style="opacity:0.5">— ${lang==='ja'?'持ち物から選ぶ':'elige inventario'} —</em>`;

  return `<div class="rpg-room glass-dark rpg-npc-room">
    <div class="rpg-npc-greet">${escHtml(room.npc.greet)}</div>
    <div class="rpg-npc-prompt">“${escHtml(room.npc.prompt)}”</div>
    ${hint}
    <div class="rpg-npc-selected"><b>${L.inventory_label}:</b> ${selObjLabel}</div>
    <div class="rpg-verbs-label">${L.verbs_label}:</div>
    <div class="rpg-verb-choices">${verbButtons}</div>
  </div>`;
}

function renderRpgShop(L) {
  // Shop offers 3 random catching items if they exist, else hint
  const sd = typeof getSlotData === 'function' ? getSlotData() : { moeBucks: 0 };
  let wares = [];
  if (typeof CATCH_ITEMS !== 'undefined') {
    wares = rpgShuffle(CATCH_ITEMS).slice(0, 3);
  }
  const items = wares.map(it => {
    const p = Math.floor((it.price || 20) * 0.8); // shop discount
    return `<div class="rpg-shop-item">
      <div>${it.emoji || '❓'} <b>${escHtml(it.name)}</b></div>
      <button class="rpg-btn rpg-btn-sm" onclick="rpgShopBuy('${escHtml(it.id)}', ${p})">${p} MB</button>
    </div>`;
  }).join('') || `<em>(no wares)</em>`;
  return `<div class="rpg-room glass-dark">
    <h4>🛒 ${L.shopkeeper}</h4>
    <p style="opacity:0.7; font-size:0.85rem;">${sd.moeBucks} MB in pouch</p>
    <div class="rpg-shop-list">${items}</div>
  </div>`;
}

function rpgShopBuy(itemId, price) {
  if (typeof getSlotData !== 'function') return;
  const sd = getSlotData();
  if (sd.moeBucks < price) { alert('Not enough MoeBucks!'); return; }
  sd.moeBucks -= price;
  if (!data.catchInventory) data.catchInventory = {};
  data.catchInventory[itemId] = (data.catchInventory[itemId] || 0) + 1;
  if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  rpgLog(`🛒 Bought ${itemId} for ${price} MB`);
  saveData();
  renderRpg();
}

function renderRpgInventory(L) {
  // "Inventory" here is the player's noun-dictionary — objects they can offer.
  const lang = data.rpg.lang;
  const nouns = (data.dictionary || []).filter(w => w.type === 'noun');
  if (nouns.length === 0) {
    return `<div class="rpg-inventory glass-dark"><h4>🎒 ${L.inventory_label}</h4><em>(No nouns in dictionary yet)</em></div>`;
  }
  const sel = data.rpg.run.selectedObject;
  // Show up to 24 most-used + most-recently-added
  const sorted = nouns.slice().sort((a,b) => (b.uses||0) - (a.uses||0)).slice(0, 30);
  const chips = sorted.map(w => {
    const k = rpgWordKey(w);
    const isSel = k === sel;
    return `<button class="rpg-inv-chip ${isSel?'selected':''}" onclick="rpgSelectObject('${k.replace(/'/g, "\\'")}')" title="${escHtml(w.en)}">${escHtml(rpgWordText(w, lang))}</button>`;
  }).join('');
  const clearBtn = sel ? `<button class="rpg-btn rpg-btn-sm" onclick="rpgSelectObject('')">clear</button>` : '';
  return `<div class="rpg-inventory glass-dark">
    <h4>🎒 ${L.inventory_label} ${clearBtn}</h4>
    <div class="rpg-inv-chips">${chips}</div>
  </div>`;
}

function renderRpgLog(run) {
  if (!run.log || run.log.length === 0) return '';
  const items = run.log.slice(0, 8).map(l => `<li>${escHtml(l.text)}</li>`).join('');
  return `<div class="rpg-log glass-dark"><h4>📜 Log</h4><ul>${items}</ul></div>`;
}

function rpgAbandonRun() {
  if (!data.rpg || !data.rpg.run) return;
  if (!confirm('Abandon current run? Rewards already earned are kept.')) return;
  data.rpg.run = null;
  saveData();
  renderRpg();
}

// ---------- KEYBOARD ----------
document.addEventListener('keydown', (e) => {
  // Only respond when RPG tab is active
  const rpgTab = document.getElementById('tab-rpg');
  if (!rpgTab || !rpgTab.classList.contains('active')) return;
  if (document.activeElement && ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  switch (e.key) {
    case 'ArrowUp': case 'w': rpgMove(0,-1); e.preventDefault(); break;
    case 'ArrowDown': case 's': rpgMove(0,1); e.preventDefault(); break;
    case 'ArrowLeft': case 'a': rpgMove(-1,0); e.preventDefault(); break;
    case 'ArrowRight': case 'd': rpgMove(1,0); e.preventDefault(); break;
  }
});

// expose for index rendering hook
window.renderRpg = renderRpg;
