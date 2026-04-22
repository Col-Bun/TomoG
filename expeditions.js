// ===== EXPEDITION & MATERIALS SYSTEM =====
// Tamagotchi-style idle system: Moe-chan goes on expeditions and collects materials
// Auto daily expedition + optional timed missions
// 20 material types with ascending rarity
// Flashcard bonus: every 10 min = +0.5x rarity multiplier

// ===== MATERIAL DEFINITIONS (20 types, ascending rarity) =====
const MATERIALS = [
  // Common (Tier 1) - high drop rate
  { id: 'twig',         name: 'Twig',              emoji: '🪵', rarity: 1, tier: 'Common',      color: '#8B7355' },
  { id: 'pebble',       name: 'Pebble',            emoji: '🪨', rarity: 2, tier: 'Common',      color: '#A0A0A0' },
  { id: 'herb',         name: 'Wild Herb',         emoji: '🌿', rarity: 3, tier: 'Common',      color: '#6B8E23' },
  { id: 'clay',         name: 'River Clay',        emoji: '🏺', rarity: 4, tier: 'Common',      color: '#CD853F' },
  // Uncommon (Tier 2)
  { id: 'iron_ore',     name: 'Iron Ore',          emoji: '⛏️', rarity: 5, tier: 'Uncommon',    color: '#708090' },
  { id: 'feather',      name: 'Phoenix Feather',   emoji: '🪶', rarity: 6, tier: 'Uncommon',    color: '#FF6347' },
  { id: 'silk',         name: 'Spider Silk',       emoji: '🕸️', rarity: 7, tier: 'Uncommon',    color: '#E8E8E8' },
  { id: 'amber',        name: 'Amber Chunk',       emoji: '🔶', rarity: 8, tier: 'Uncommon',    color: '#FFB347' },
  // Rare (Tier 3)
  { id: 'silver',       name: 'Silver Ingot',      emoji: '🥈', rarity: 9,  tier: 'Rare',       color: '#C0C0C0' },
  { id: 'moonstone',    name: 'Moonstone',         emoji: '🌙', rarity: 10, tier: 'Rare',       color: '#B0C4DE' },
  { id: 'crystal',      name: 'Spirit Crystal',    emoji: '💎', rarity: 11, tier: 'Rare',       color: '#87CEEB' },
  { id: 'enchanted_wood', name: 'Enchanted Wood',  emoji: '🌳', rarity: 12, tier: 'Rare',       color: '#228B22' },
  // Epic (Tier 4)
  { id: 'gold',         name: 'Gold Ingot',        emoji: '🥇', rarity: 13, tier: 'Epic',       color: '#FFD700' },
  { id: 'dragon_scale', name: 'Dragon Scale',      emoji: '🐉', rarity: 14, tier: 'Epic',       color: '#DC143C' },
  { id: 'void_shard',   name: 'Void Shard',        emoji: '🔮', rarity: 15, tier: 'Epic',       color: '#9370DB' },
  { id: 'starlight',    name: 'Starlight Essence',  emoji: '✨', rarity: 16, tier: 'Epic',       color: '#FFE4B5' },
  // Legendary (Tier 5)
  { id: 'mythril',      name: 'Mythril Ore',       emoji: '💠', rarity: 17, tier: 'Legendary',  color: '#00CED1' },
  { id: 'phoenix_tear', name: 'Phoenix Tear',      emoji: '🔥', rarity: 18, tier: 'Legendary',  color: '#FF4500' },
  { id: 'celestial',    name: 'Celestial Fragment', emoji: '🌟', rarity: 19, tier: 'Legendary',  color: '#E6E6FA' },
  { id: 'philosophers',  name: "Philosopher's Stone", emoji: '⚗️', rarity: 20, tier: 'Legendary',  color: '#FF1493' },
];

const TIER_COLORS = {
  'Common':    { bg: 'rgba(139,115,85,0.2)',  border: 'rgba(139,115,85,0.4)',  text: '#C4A882' },
  'Uncommon':  { bg: 'rgba(0,200,100,0.15)',   border: 'rgba(0,200,100,0.35)', text: '#00C864' },
  'Rare':      { bg: 'rgba(0,153,255,0.15)',   border: 'rgba(0,153,255,0.35)', text: '#0099FF' },
  'Epic':      { bg: 'rgba(163,53,238,0.15)',  border: 'rgba(163,53,238,0.35)', text: '#A335EE' },
  'Legendary': { bg: 'rgba(255,128,0,0.15)',   border: 'rgba(255,128,0,0.4)',  text: '#FF8000' },
};

// ===== EXPEDITION DEFINITIONS =====
const EXPEDITIONS = [
  { id: 'meadow',    name: 'Sunny Meadow',      emoji: '🌻', duration: 30,  maxRarity: 6,  description: 'A peaceful meadow with common herbs and stones.' },
  { id: 'forest',    name: 'Whispering Forest',  emoji: '🌲', duration: 60,  maxRarity: 10, description: 'A dense forest hiding uncommon treasures.' },
  { id: 'cave',      name: 'Crystal Caverns',    emoji: '🦇', duration: 120, maxRarity: 14, description: 'Deep caves glittering with rare crystals.' },
  { id: 'ruins',     name: 'Ancient Ruins',      emoji: '🏛️', duration: 240, maxRarity: 18, description: 'Crumbling ruins of a lost civilization.' },
  { id: 'abyss',     name: 'The Starlit Abyss',  emoji: '🌌', duration: 480, maxRarity: 20, description: 'The deepest reaches, where legends are found.' },
];

// ===== HELPER: Get flashcard rarity bonus =====
function getFlashcardRarityBonus() {
  const today = todayStr();
  const td = data.days[today];
  if (!td) return 1.0;
  const flashMinutes = td.flash || 0;
  // Every 10 minutes = +0.5x bonus
  const bonus = 1.0 + Math.floor(flashMinutes / 10) * 0.5;
  return bonus;
}

// ===== HELPER: Roll loot from an expedition =====
function rollExpeditionLoot(maxRarity, itemCount) {
  const rarityBonus = getFlashcardRarityBonus();
  const loot = [];
  const eligible = MATERIALS.filter(m => m.rarity <= maxRarity);

  for (let i = 0; i < itemCount; i++) {
    // Weighted random: lower rarity = higher weight, but bonus shifts toward rarer items
    let weights = eligible.map(m => {
      // Base weight: inversely proportional to rarity
      let w = Math.pow(maxRarity - m.rarity + 1, 2);
      // Bonus shifts weight toward rarer items
      if (rarityBonus > 1) {
        w *= Math.pow(m.rarity / maxRarity, (rarityBonus - 1) * 0.8);
      }
      return w;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    let chosen = eligible[0];
    for (let j = 0; j < eligible.length; j++) {
      roll -= weights[j];
      if (roll <= 0) { chosen = eligible[j]; break; }
    }

    // Find if already in loot
    const existing = loot.find(l => l.id === chosen.id);
    if (existing) { existing.qty++; }
    else { loot.push({ id: chosen.id, qty: 1 }); }
  }

  return loot;
}

// ===== ENSURE expedition data exists =====
function ensureExpeditionData() {
  if (!data.materials) data.materials = {};
  if (!data.expeditions) data.expeditions = { active: null, log: [], lastAutoDate: null };
  if (!data.expeditions.log) data.expeditions.log = [];
  if (!data.expeditions.lastAutoDate) data.expeditions.lastAutoDate = null;
}

// ===== ADD materials to inventory =====
function addMaterialsToInventory(loot) {
  ensureExpeditionData();
  loot.forEach(item => {
    data.materials[item.id] = (data.materials[item.id] || 0) + item.qty;
  });
}

// ===== AUTO DAILY EXPEDITION =====
function checkAutoExpedition() {
  ensureExpeditionData();
  const today = todayStr();

  if (data.expeditions.lastAutoDate === today) return null; // Already ran today

  // Moe-chan goes on an automatic daily expedition (medium difficulty)
  const loot = rollExpeditionLoot(10, 5); // Up to Rare, 5 items
  addMaterialsToInventory(loot);

  data.expeditions.lastAutoDate = today;

  const logEntry = {
    type: 'auto',
    date: today,
    loot: loot,
    expedition: 'Daily Adventure',
    rarityBonus: getFlashcardRarityBonus()
  };
  data.expeditions.log.unshift(logEntry);
  if (data.expeditions.log.length > 30) data.expeditions.log.length = 30; // Keep last 30

  saveData();
  return logEntry;
}

// ===== START A TIMED EXPEDITION =====
function startExpedition(expeditionId) {
  ensureExpeditionData();

  if (data.expeditions.active) {
    alert("Moe-chan is already on an expedition! Wait for her to return.");
    return;
  }

  const exp = EXPEDITIONS.find(e => e.id === expeditionId);
  if (!exp) return;

  data.expeditions.active = {
    expeditionId: exp.id,
    startTime: Date.now(),
    duration: exp.duration, // minutes
    maxRarity: exp.maxRarity
  };

  saveData();
  renderExpeditions();
}

// ===== CHECK IF TIMED EXPEDITION IS DONE =====
function checkActiveExpedition() {
  ensureExpeditionData();
  if (!data.expeditions.active) return null;

  const active = data.expeditions.active;
  const elapsed = (Date.now() - active.startTime) / 60000; // minutes

  if (elapsed >= active.duration) {
    // Expedition complete!
    const exp = EXPEDITIONS.find(e => e.id === active.expeditionId);
    const itemCount = Math.floor(3 + (active.duration / 30) * 2); // More items for longer expeditions
    const loot = rollExpeditionLoot(active.maxRarity, itemCount);
    addMaterialsToInventory(loot);

    const logEntry = {
      type: 'mission',
      date: todayStr(),
      loot: loot,
      expedition: exp ? exp.name : 'Unknown',
      duration: active.duration,
      rarityBonus: getFlashcardRarityBonus()
    };
    data.expeditions.log.unshift(logEntry);
    if (data.expeditions.log.length > 30) data.expeditions.log.length = 30;

    data.expeditions.active = null;
    saveData();

    return logEntry;
  }

  return null; // Still in progress
}

// ===== COLLECT (claim) completed expedition =====
function collectExpedition() {
  const result = checkActiveExpedition();
  if (result) {
    showLootPopup(result.loot, result.expedition);
    renderExpeditions();
    renderMaterials();
    setCreatureState('celebrate');
    setSpeech('expeditionDone');
  }
}

// ===== LOOT POPUP =====
function showLootPopup(loot, expeditionName) {
  const overlay = document.getElementById('loot-popup-overlay');
  const content = document.getElementById('loot-popup-content');
  if (!overlay || !content) return;

  const bonus = getFlashcardRarityBonus();
  const bonusHtml = bonus > 1 ? `<div class="loot-bonus">📇 Flashcard Bonus: ${bonus.toFixed(1)}x Rarity!</div>` : '';

  let itemsHtml = loot.map(item => {
    const mat = MATERIALS.find(m => m.id === item.id);
    if (!mat) return '';
    const tc = TIER_COLORS[mat.tier];
    return `<div class="loot-item" style="border-color:${tc.border}; background:${tc.bg}">
      <span class="loot-emoji">${mat.emoji}</span>
      <span class="loot-name" style="color:${tc.text}">${mat.name}</span>
      <span class="loot-qty">x${item.qty}</span>
    </div>`;
  }).join('');

  content.innerHTML = `
    <h3 class="loot-title">Expedition Complete!</h3>
    <p class="loot-subtitle">${escHtml(expeditionName)}</p>
    ${bonusHtml}
    <div class="loot-items">${itemsHtml}</div>
    <button class="btn-glossy btn-green loot-close-btn" onclick="closeLootPopup()">Collect!</button>
  `;
  overlay.style.display = 'flex';
}

function closeLootPopup() {
  const overlay = document.getElementById('loot-popup-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ===== RENDER: Materials Inventory Page =====
function renderMaterials() {
  const grid = document.getElementById('materials-grid');
  if (!grid) return;
  ensureExpeditionData();

  let html = '';
  const tiers = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  tiers.forEach(tier => {
    const tierMats = MATERIALS.filter(m => m.tier === tier);
    const tc = TIER_COLORS[tier];

    html += `<div class="mat-tier-header" style="color:${tc.text}; border-bottom: 1px solid ${tc.border};">${tier}</div>`;
    html += '<div class="mat-tier-grid">';

    tierMats.forEach(mat => {
      const qty = data.materials[mat.id] || 0;
      const isEmpty = qty === 0;
      html += `<div class="mat-card ${isEmpty ? 'mat-empty' : ''}" style="border-color:${isEmpty ? 'rgba(255,255,255,0.08)' : tc.border}; background:${isEmpty ? 'rgba(0,0,0,0.2)' : tc.bg}">
        <div class="mat-emoji">${mat.emoji}</div>
        <div class="mat-name" style="color:${isEmpty ? 'rgba(255,255,255,0.3)' : tc.text}">${mat.name}</div>
        <div class="mat-qty" style="color:${isEmpty ? 'rgba(255,255,255,0.2)' : '#fff'}">${qty}</div>
        <div class="mat-rarity-stars">${'★'.repeat(Math.ceil(mat.rarity / 4))}${'☆'.repeat(5 - Math.ceil(mat.rarity / 4))}</div>
      </div>`;
    });

    html += '</div>';
  });

  grid.innerHTML = html;

  // Update total count
  const totalEl = document.getElementById('mat-total-count');
  if (totalEl) {
    const total = Object.values(data.materials).reduce((a, b) => a + b, 0);
    totalEl.textContent = total;
  }

  // Update unique count
  const uniqueEl = document.getElementById('mat-unique-count');
  if (uniqueEl) {
    const unique = MATERIALS.filter(m => (data.materials[m.id] || 0) > 0).length;
    uniqueEl.textContent = `${unique}/20`;
  }
}

// ===== RENDER: Expeditions Panel =====
function renderExpeditions() {
  ensureExpeditionData();
  renderExpeditionMissions();
  renderExpeditionStatus();
  renderExpeditionLog();
  updateRarityBonusDisplay();
}

function renderExpeditionMissions() {
  const container = document.getElementById('exp-missions-list');
  if (!container) return;

  const hasActive = !!data.expeditions.active;

  let html = '';
  EXPEDITIONS.forEach(exp => {
    const isActive = hasActive && data.expeditions.active.expeditionId === exp.id;
    const hrs = Math.floor(exp.duration / 60);
    const mins = exp.duration % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
    const maxTier = MATERIALS.find(m => m.rarity === exp.maxRarity);

    html += `<div class="exp-mission-card ${isActive ? 'exp-active' : ''} ${hasActive && !isActive ? 'exp-disabled' : ''}">
      <div class="exp-mission-header">
        <span class="exp-mission-emoji">${exp.emoji}</span>
        <span class="exp-mission-name">${exp.name}</span>
        <span class="exp-mission-time">${timeStr}</span>
      </div>
      <p class="exp-mission-desc">${exp.description}</p>
      <div class="exp-mission-footer">
        <span class="exp-mission-rarity">Max: ${maxTier ? maxTier.name : '???'}</span>
        ${hasActive ? (isActive ? '<span class="exp-badge-active">In Progress...</span>' : '') : `<button class="btn-glossy exp-send-btn" onclick="startExpedition('${exp.id}')">Send Moe-chan!</button>`}
      </div>
    </div>`;
  });

  container.innerHTML = html;
}

function renderExpeditionStatus() {
  const statusEl = document.getElementById('exp-status');
  if (!statusEl) return;

  if (!data.expeditions.active) {
    statusEl.innerHTML = `<div class="exp-idle">
      <img src="./idle.png" alt="Moe-chan" class="exp-moe-sprite">
      <p>Moe-chan is resting at camp. Send her on an expedition!</p>
    </div>`;
    return;
  }

  const active = data.expeditions.active;
  const exp = EXPEDITIONS.find(e => e.id === active.expeditionId);
  const elapsed = (Date.now() - active.startTime) / 60000;
  const progress = Math.min(100, (elapsed / active.duration) * 100);
  const done = elapsed >= active.duration;

  const remaining = Math.max(0, active.duration - elapsed);
  const rHrs = Math.floor(remaining / 60);
  const rMins = Math.ceil(remaining % 60);
  const timeLeft = done ? 'Complete!' : (rHrs > 0 ? `${rHrs}h ${rMins}m left` : `${rMins}m left`);

  statusEl.innerHTML = `<div class="exp-in-progress">
    <img src="./study.png" alt="Moe-chan" class="exp-moe-sprite ${done ? 'exp-bounce' : ''}">
    <div class="exp-progress-info">
      <h4>${exp ? exp.emoji + ' ' + exp.name : 'Expedition'}</h4>
      <div class="exp-progress-bar"><div class="exp-progress-fill" style="width:${progress}%; background: ${done ? '#a8e84c' : 'linear-gradient(90deg, #0099ff, #00e5ff)'}"></div></div>
      <span class="exp-time-left">${timeLeft}</span>
    </div>
    ${done ? `<button class="btn-glossy btn-green exp-collect-btn" onclick="collectExpedition()">Collect Loot!</button>` : ''}
  </div>`;
}

function renderExpeditionLog() {
  const logEl = document.getElementById('exp-log');
  if (!logEl) return;

  if (!data.expeditions.log || data.expeditions.log.length === 0) {
    logEl.innerHTML = '<p style="color:rgba(255,255,255,0.4); text-align:center; padding:12px;">No expeditions completed yet.</p>';
    return;
  }

  let html = '';
  data.expeditions.log.slice(0, 10).forEach(entry => {
    const lootStr = entry.loot.map(l => {
      const mat = MATERIALS.find(m => m.id === l.id);
      return mat ? `${mat.emoji} ${mat.name} x${l.qty}` : `??? x${l.qty}`;
    }).join(', ');

    const typeIcon = entry.type === 'auto' ? '🌅' : '⚔️';
    const bonusStr = entry.rarityBonus > 1 ? ` (${entry.rarityBonus.toFixed(1)}x bonus)` : '';

    html += `<div class="exp-log-entry">
      <div class="exp-log-header">
        <span>${typeIcon} ${escHtml(entry.expedition)}</span>
        <span class="exp-log-date">${formatDate(entry.date)}${bonusStr}</span>
      </div>
      <div class="exp-log-loot">${lootStr}</div>
    </div>`;
  });

  logEl.innerHTML = html;
}

function updateRarityBonusDisplay() {
  const el = document.getElementById('exp-rarity-bonus');
  if (!el) return;
  const bonus = getFlashcardRarityBonus();
  const flashMin = (data.days[todayStr()] || {}).flash || 0;
  el.innerHTML = `<span class="bonus-label">📇 Flashcard Bonus:</span> <span class="bonus-value">${bonus.toFixed(1)}x</span> <span class="bonus-detail">(${flashMin} min studied today)</span>`;
}

// ===== Expedition status timer (updates every 30s) =====
let expTimerInterval = null;
function startExpeditionTimer() {
  if (expTimerInterval) clearInterval(expTimerInterval);
  expTimerInterval = setInterval(() => {
    if (data.expeditions && data.expeditions.active) {
      renderExpeditionStatus();
    }
  }, 30000);
}

// ===== Add expedition speech =====
if (typeof speeches !== 'undefined') {
  speeches.expeditionDone = { en: "I found amazing loot!", jp: "すごいアイテムを見つけた！", es: "¡Encontré un tesoro increíble!" };
  speeches.expeditionStart = { en: "I'm heading out! Wish me luck!", jp: "行ってきます！応援してね！", es: "¡Me voy de aventura!" };
  speeches.autoExpedition = { en: "I went on a morning walk and found things!", jp: "朝の散歩で色々見つけたよ！", es: "¡Encontré cosas en mi paseo matutino!" };
}

// ===== Initialize expeditions on app load =====
function initExpeditions() {
  ensureExpeditionData();

  // Check auto daily expedition
  const autoResult = checkAutoExpedition();
  if (autoResult) {
    // Show notification of auto expedition results
    setTimeout(() => {
      showLootPopup(autoResult.loot, 'Daily Morning Walk 🌅');
      if (typeof setSpeech === 'function') setSpeech('autoExpedition');
      if (typeof setCreatureState === 'function') setCreatureState('happy');
    }, 1000);
  }

  // Check if a timed expedition completed while away
  const completedWhileAway = checkActiveExpedition();
  if (completedWhileAway) {
    setTimeout(() => {
      showLootPopup(completedWhileAway.loot, completedWhileAway.expedition);
      if (typeof setSpeech === 'function') setSpeech('expeditionDone');
      if (typeof setCreatureState === 'function') setCreatureState('celebrate');
    }, autoResult ? 3000 : 1000); // Delay if auto also triggered
  }

  renderExpeditions();
  renderMaterials();
  startExpeditionTimer();
}
