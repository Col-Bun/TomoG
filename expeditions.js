// ===== EXPEDITION & MATERIALS SYSTEM =====
// Tamagotchi-style idle system: Moe-chan goes on expeditions and collects materials
// Auto daily expedition + optional timed missions
// 20 material types with ascending rarity
// Flashcard bonus: every 10 min = +0.5x rarity multiplier
// Chimera encounter system: discover creatures during expeditions

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

// ===== CHIMERA DEFINITIONS =====
// Chimeras are creatures Moe-chan can encounter during expeditions.
// Each has a unique appearance, description, and habitat.
const CHIMERAS = [
  // === Meadow Chimeras (Common) ===
  {
    id: 'puffmoth', name: 'Puffmoth', emoji: '🦋',
    tier: 'Common', rarity: 2,
    habitats: ['meadow'],
    appearance: 'A plump, cotton-ball-sized moth with iridescent pastel wings that shimmer between lavender and gold. Its fuzzy antennae curl like tiny ferns, and it trails a faint sparkle of pollen wherever it drifts.',
    description: 'Puffmoths gather in sleepy clouds above wildflower patches at dawn. They are harmless and surprisingly warm to the touch, like holding a tiny, breathing pillow. Moe-chan loves chasing them.'
  },
  {
    id: 'pebblejaw', name: 'Pebblejaw', emoji: '🪨',
    tier: 'Common', rarity: 3,
    habitats: ['meadow'],
    appearance: 'A squat, tortoise-like creature whose shell is made of smooth river stones fused together. Its stubby legs are mossy green and its eyes are two chips of amber that blink very slowly.',
    description: 'Pebblejaws lumber through meadow grass munching on clover. Their stone shells rattle softly as they move, sounding like a gentle rain on a tin roof. They are incredibly patient and will let you pet them if you sit still long enough.'
  },
  {
    id: 'honeywisp', name: 'Honeywisp', emoji: '🐝',
    tier: 'Common', rarity: 1,
    habitats: ['meadow', 'forest'],
    appearance: 'A tiny luminous sprite shaped like a teardrop of golden honey. It has two translucent dragonfly wings and a single bright eye that glows like a candle flame. It hums at a perfect middle C.',
    description: 'Honeywisps are the most common chimeras in the wild. They cluster around sweet-smelling flowers and leave trails of sticky golden light. Moe-chan says they taste like warm caramel when they land on your hand (she licked one once).'
  },

  // === Forest Chimeras (Uncommon) ===
  {
    id: 'mossback', name: 'Mossback Elk', emoji: '🦌',
    tier: 'Uncommon', rarity: 5,
    habitats: ['forest', 'meadow'],
    appearance: 'A tall, graceful elk with antlers that branch into living oak limbs, complete with rustling leaves. Its coat is deep emerald dappled with patches of real moss, and tiny mushrooms grow along its spine.',
    description: 'Mossback Elk are the silent guardians of old-growth forests. They move without a sound despite their size, and where they sleep, medicinal herbs sprout overnight. Spotting one is considered very good luck among forest travelers.'
  },
  {
    id: 'silkweaver', name: 'Silkweaver', emoji: '🕷️',
    tier: 'Uncommon', rarity: 6,
    habitats: ['forest'],
    appearance: 'An elegant spider the size of a house cat, with a body like polished obsidian and legs banded in silver and violet. Its eight eyes glow a soft lilac, and the silk it produces catches light like fiber-optic threads.',
    description: 'Silkweavers are surprisingly gentle despite their intimidating size. They build elaborate geometric webs between ancient trees that hum musically in the wind. Their silk is prized for its unbreakable strength and is one of the rarest crafting materials in the land.'
  },
  {
    id: 'hollowhorn', name: 'Hollowhorn Fox', emoji: '🦊',
    tier: 'Uncommon', rarity: 7,
    habitats: ['forest'],
    appearance: 'A sleek fox with fur the color of autumn twilight, shifting between burnt orange and deep purple. Two hollow, crystalline horns sprout from its head, and when wind passes through them, they produce haunting flute-like melodies.',
    description: 'Hollowhorn Foxes are nocturnal tricksters who lead travelers in circles for fun. Despite this, they never cause real harm, they just enjoy the confusion. If you offer one a sweet fruit, it may play a song for you through its horns before vanishing into the mist.'
  },

  // === Cave Chimeras (Rare) ===
  {
    id: 'crystalcrab', name: 'Crystal Crab', emoji: '🦀',
    tier: 'Rare', rarity: 9,
    habitats: ['cave'],
    appearance: 'A large crab with a shell made entirely of interlocking amethyst and quartz crystals. Its claws are translucent rose quartz, and bioluminescent fluid pulses through visible channels in its legs, casting purple-pink light on cave walls.',
    description: 'Crystal Crabs are the jewelers of the underground. They carefully arrange mineral deposits into elaborate nests, essentially building tiny crystal palaces. They are fiercely territorial about their collections but can be pacified with offerings of moonstone.'
  },
  {
    id: 'echoveil', name: 'Echoveil Bat', emoji: '🦇',
    tier: 'Rare', rarity: 10,
    habitats: ['cave'],
    appearance: 'A bat with wings like translucent stained glass, each membrane displaying a shifting kaleidoscope of deep blues and golds. Its fur is midnight black with silver-tipped ears, and its echolocation pulses are visible as faint rings of pale blue light.',
    description: 'Echoveil Bats navigate not just by sound but by a form of sonic memory. They can replay echoes of things that happened in a cave days or even weeks ago. Scholars seek them out to literally listen to the past. Their wings are said to contain maps of every cave they have ever visited.'
  },
  {
    id: 'geodeturtle', name: 'Geode Turtle', emoji: '🐢',
    tier: 'Rare', rarity: 11,
    habitats: ['cave', 'ruins'],
    appearance: 'An ancient turtle whose shell, when cracked open (naturally, over centuries), reveals a dazzling interior of amethyst, citrine, and opal formations. Its skin is slate-grey and rough like sandpaper, and its eyes are deep amber with flecks of gold.',
    description: 'Geode Turtles are among the oldest living chimeras, some estimated at over a thousand years old. They move imperceptibly slowly, and entire stalagmites may grow around a sleeping one. The crystals inside their shells are said to record the dreams of the earth itself.'
  },

  // === Ruins Chimeras (Epic) ===
  {
    id: 'glyphserpent', name: 'Glyph Serpent', emoji: '🐍',
    tier: 'Epic', rarity: 13,
    habitats: ['ruins'],
    appearance: 'A sinuous serpent with scales of burnished bronze, each one inscribed with a tiny, glowing glyph from a forgotten language. Its eyes are molten gold, and when it moves, the glyphs on its body rearrange themselves, as though composing new sentences.',
    description: 'Glyph Serpents are living libraries. Each one carries fragments of a dead civilization written on its body. Linguists and archaeologists have spent lifetimes trying to decode a single serpent. They are non-venomous but profoundly intelligent, and some say they understand every language ever spoken.'
  },
  {
    id: 'phantomstag', name: 'Phantom Stag', emoji: '🫎',
    tier: 'Epic', rarity: 14,
    habitats: ['ruins', 'forest'],
    appearance: 'A majestic stag that flickers between solid and translucent, as though it exists in two places at once. Its antlers are made of pale blue spirit-flame, and ghostly afterimages trail behind it as it moves. Flowers of light bloom briefly in its hoofprints.',
    description: 'Phantom Stags are guardians of places where the boundary between worlds is thin. They are rarely seen by the living, appearing only to those who carry a deep question in their heart. It is said that meeting one means you are on the verge of a great revelation.'
  },
  {
    id: 'irongolem', name: 'Rusted Golem', emoji: '🤖',
    tier: 'Epic', rarity: 15,
    habitats: ['ruins'],
    appearance: 'A hulking humanoid figure cobbled together from ancient armor plates, corroded gears, and vine-wrapped stone. One eye socket holds a flickering emerald flame, the other is dark and hollow. Moss and small flowers grow in the joints of its limbs.',
    description: 'Rusted Golems are the remnants of an ancient civilization\'s guardians, still patrolling halls that crumbled centuries ago. They are not hostile but confused, endlessly searching for masters who will never return. Occasionally one will gently place a wildflower in your path, an old greeting protocol corrupted into something oddly tender.'
  },

  // === Abyss Chimeras (Legendary) ===
  {
    id: 'voidwhale', name: 'Void Whale', emoji: '🐋',
    tier: 'Legendary', rarity: 17,
    habitats: ['abyss'],
    appearance: 'An immense whale that swims through the air of the deepest caverns, its body a silhouette of pure starfield, as though a window into deep space was cut in the shape of a leviathan. Tiny galaxies swirl in its eyes, and its song reverberates through dimensions.',
    description: 'Void Whales migrate through the spaces between realities, and the Starlit Abyss is one of their resting stops. Seeing one is a once-in-a-lifetime event. Their songs can heal old wounds and are said to contain the fundamental frequencies of creation itself. Moe-chan cried the first time she heard one.'
  },
  {
    id: 'solphoenix', name: 'Sol Phoenix', emoji: '🔥',
    tier: 'Legendary', rarity: 18,
    habitats: ['abyss', 'ruins'],
    appearance: 'A radiant bird wreathed in plasma-white flames that shift through every color of the visible spectrum. Its tail feathers are streamers of concentrated sunrise, each one a different dawn from a different world. Its eyes are twin stars, calm and impossibly ancient.',
    description: 'The Sol Phoenix is said to be the original source of all fire in the world. It nests at the bottom of the Abyss, where its heat keeps the deep waters warm and the underground ecosystems alive. Every thousand years it dies and is reborn, and the burst of energy creates new mineral veins throughout the earth.'
  },
  {
    id: 'dreameater', name: 'Dream Eater', emoji: '🌀',
    tier: 'Legendary', rarity: 19,
    habitats: ['abyss'],
    appearance: 'A shapeless, undulating mass of soft indigo mist with dozens of gently blinking eyes scattered across its form like stars in a nebula. Tendrils of lavender smoke curl from it, carrying the faint scent of rain and old books. It has no fixed shape, only suggestions of one.',
    description: 'Dream Eaters feed on nightmares, drawn to sleeping creatures plagued by bad dreams. Far from malicious, they are compassionate devourers of fear. After a Dream Eater visits, you wake feeling lighter, as though a weight you did not know you carried has been lifted. They are the reason the deepest caves feel strangely peaceful.'
  },
  {
    id: 'worldturtle', name: 'World Turtle', emoji: '🌍',
    tier: 'Legendary', rarity: 20,
    habitats: ['abyss'],
    appearance: 'A turtle of incomprehensible scale, its shell a living landscape of miniature mountains, forests, rivers, and clouds. Tiny civilizations flicker in and out of existence on its back. Its skin is the deep blue of ocean trenches, and its eyes hold the patient wisdom of geological time.',
    description: 'The World Turtle is more myth than chimera, glimpsed only in the deepest reaches of the Starlit Abyss. Those who have seen it describe the overwhelming sensation that the ground itself is alive and breathing. It is said to be the foundation upon which the world was built, and that its heartbeat is the turning of the seasons.'
  },
];

const CHIMERA_TIER_COLORS = TIER_COLORS; // Reuse material tier colors

// ===== CHIMERA ENCOUNTER LOGIC =====
function rollChimeraEncounter(expeditionId, duration) {
  // Base encounter chance: 30% for timed, 15% for auto daily
  let encounterChance = duration ? 0.30 : 0.15;
  // Longer expeditions = higher chance (up to 60%)
  if (duration) encounterChance = Math.min(0.60, 0.20 + (duration / 480) * 0.40);

  // Flashcard bonus increases encounter chance slightly
  const bonus = getFlashcardRarityBonus();
  if (bonus > 1) encounterChance = Math.min(0.75, encounterChance + (bonus - 1) * 0.05);

  if (Math.random() > encounterChance) return null;

  // Determine which chimeras are eligible based on expedition habitat
  const exp = EXPEDITIONS.find(e => e.id === expeditionId);
  const habitat = exp ? exp.id : 'meadow';
  const eligible = CHIMERAS.filter(c => c.habitats.includes(habitat) && c.rarity <= (exp ? exp.maxRarity : 6));

  if (eligible.length === 0) return null;

  // Weighted random: rarer chimeras are harder to find
  let weights = eligible.map(c => {
    let w = Math.pow(21 - c.rarity, 2.5);
    if (bonus > 1) w *= Math.pow(c.rarity / 20, (bonus - 1) * 0.6);
    return w;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  let chosen = eligible[0];
  for (let j = 0; j < eligible.length; j++) {
    roll -= weights[j];
    if (roll <= 0) { chosen = eligible[j]; break; }
  }

  return chosen;
}

function addToBestiary(chimera) {
  if (!data.bestiary) data.bestiary = {};
  if (!data.bestiary[chimera.id]) {
    data.bestiary[chimera.id] = { firstSeen: todayStr(), timesSeen: 1 };
    return true; // New discovery!
  } else {
    data.bestiary[chimera.id].timesSeen++;
    return false;
  }
}

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

  // Roll for chimera encounter on daily walk
  const chimera = rollChimeraEncounter('forest', null);
  let chimeraData = null;
  if (chimera) {
    const isNew = addToBestiary(chimera);
    chimeraData = { id: chimera.id, name: chimera.name, emoji: chimera.emoji, tier: chimera.tier, isNew: isNew, appearance: chimera.appearance, description: chimera.description };
  }

  data.expeditions.lastAutoDate = today;

  const logEntry = {
    type: 'auto',
    date: today,
    loot: loot,
    expedition: 'Daily Adventure',
    rarityBonus: getFlashcardRarityBonus(),
    chimera: chimeraData
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

    // Roll for chimera encounter
    const chimera = rollChimeraEncounter(active.expeditionId, active.duration);
    let chimeraData = null;
    if (chimera) {
      const isNew = addToBestiary(chimera);
      chimeraData = { id: chimera.id, name: chimera.name, emoji: chimera.emoji, tier: chimera.tier, isNew: isNew, appearance: chimera.appearance, description: chimera.description };
    }

    const logEntry = {
      type: 'mission',
      date: todayStr(),
      loot: loot,
      expedition: exp ? exp.name : 'Unknown',
      duration: active.duration,
      rarityBonus: getFlashcardRarityBonus(),
      chimera: chimeraData
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
    showLootPopup(result.loot, result.expedition, result.chimera);
    renderExpeditions();
    renderMaterials();
    if (typeof renderBestiary === 'function') renderBestiary();
    setCreatureState('celebrate');
    setSpeech(result.chimera ? 'chimeraFound' : 'expeditionDone');
  }
}

// ===== LOOT POPUP =====
function showLootPopup(loot, expeditionName, chimeraData) {
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

  // Chimera encounter section
  let chimeraHtml = '';
  if (chimeraData) {
    const tc = CHIMERA_TIER_COLORS[chimeraData.tier] || CHIMERA_TIER_COLORS['Common'];
    const newBadge = chimeraData.isNew ? '<span class="chimera-new-badge">NEW DISCOVERY!</span>' : '';
    chimeraHtml = `
      <div class="chimera-encounter-panel" style="border-color:${tc.border}; background:${tc.bg}">
        <div class="chimera-encounter-header">
          <span class="chimera-encounter-emoji">${chimeraData.emoji}</span>
          <div>
            <span class="chimera-encounter-name" style="color:${tc.text}">${escHtml(chimeraData.name)}</span>
            ${newBadge}
            <span class="chimera-tier-label" style="color:${tc.text}">${chimeraData.tier}</span>
          </div>
        </div>
        <p class="chimera-encounter-appearance">${escHtml(chimeraData.appearance)}</p>
        <p class="chimera-encounter-desc">${escHtml(chimeraData.description)}</p>
      </div>`;
  }

  content.innerHTML = `
    <h3 class="loot-title">Expedition Complete!</h3>
    <p class="loot-subtitle">${escHtml(expeditionName)}</p>
    ${bonusHtml}
    ${chimeraHtml}
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

    let chimeraLogHtml = '';
    if (entry.chimera) {
      const tc = CHIMERA_TIER_COLORS[entry.chimera.tier] || CHIMERA_TIER_COLORS['Common'];
      chimeraLogHtml = `<div class="exp-log-chimera" style="color:${tc.text}">${entry.chimera.emoji} Encountered: ${escHtml(entry.chimera.name)}${entry.chimera.isNew ? ' (NEW!)' : ''}</div>`;
    }

    html += `<div class="exp-log-entry">
      <div class="exp-log-header">
        <span>${typeIcon} ${escHtml(entry.expedition)}</span>
        <span class="exp-log-date">${formatDate(entry.date)}${bonusStr}</span>
      </div>
      ${chimeraLogHtml}
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
  speeches.chimeraFound = { en: "I saw an incredible creature!", jp: "すごい生き物を見つけた！", es: "¡Vi una criatura increíble!" };
  speeches.chimeraNew = { en: "A chimera I've never seen before!!", jp: "見たことない合成獣だ！！", es: "¡¡Una quimera que nunca había visto!!" };
}

// ===== RENDER: Bestiary Page =====
function renderBestiary() {
  const grid = document.getElementById('bestiary-grid');
  if (!grid) return;
  if (!data.bestiary) data.bestiary = {};

  let html = '';
  const tiers = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  tiers.forEach(tier => {
    const tierChimeras = CHIMERAS.filter(c => c.tier === tier);
    const tc = CHIMERA_TIER_COLORS[tier];

    html += `<div class="mat-tier-header" style="color:${tc.text}; border-bottom: 1px solid ${tc.border};">${tier} Chimeras</div>`;
    html += '<div class="bestiary-tier-grid">';

    tierChimeras.forEach(ch => {
      const discovered = data.bestiary[ch.id];
      const isEmpty = !discovered;

      if (isEmpty) {
        html += `<div class="bestiary-card bestiary-empty" style="border-color:rgba(255,255,255,0.08); background:rgba(0,0,0,0.2)">
          <div class="bestiary-emoji" style="filter:brightness(0.2)">❓</div>
          <div class="bestiary-name" style="color:rgba(255,255,255,0.2)">???</div>
          <div class="bestiary-rarity">${'★'.repeat(Math.ceil(ch.rarity / 4))}${'☆'.repeat(5 - Math.ceil(ch.rarity / 4))}</div>
        </div>`;
      } else {
        html += `<div class="bestiary-card" style="border-color:${tc.border}; background:${tc.bg}; cursor:pointer;" onclick="showChimeraDetail('${ch.id}')">
          <div class="bestiary-emoji">${ch.emoji}</div>
          <div class="bestiary-name" style="color:${tc.text}">${ch.name}</div>
          <div class="bestiary-seen">Seen: ${discovered.timesSeen}x</div>
          <div class="bestiary-rarity">${'★'.repeat(Math.ceil(ch.rarity / 4))}${'☆'.repeat(5 - Math.ceil(ch.rarity / 4))}</div>
        </div>`;
      }
    });

    html += '</div>';
  });

  grid.innerHTML = html;

  // Update counts
  const totalEl = document.getElementById('bestiary-total-count');
  if (totalEl) {
    const total = Object.values(data.bestiary).reduce((a, b) => a + b.timesSeen, 0);
    totalEl.textContent = total;
  }

  const uniqueEl = document.getElementById('bestiary-unique-count');
  if (uniqueEl) {
    const unique = CHIMERAS.filter(c => data.bestiary[c.id]).length;
    uniqueEl.textContent = `${unique}/${CHIMERAS.length}`;
  }
}

// ===== CHIMERA DETAIL POPUP =====
function showChimeraDetail(chimeraId) {
  const ch = CHIMERAS.find(c => c.id === chimeraId);
  if (!ch) return;
  const disc = data.bestiary[ch.id];
  if (!disc) return;

  const tc = CHIMERA_TIER_COLORS[ch.tier];
  const overlay = document.getElementById('chimera-detail-overlay');
  const content = document.getElementById('chimera-detail-content');
  if (!overlay || !content) return;

  content.innerHTML = `
    <div class="chimera-detail-header" style="border-bottom: 2px solid ${tc.border};">
      <span class="chimera-detail-emoji">${ch.emoji}</span>
      <div>
        <h3 class="chimera-detail-name" style="color:${tc.text}">${ch.name}</h3>
        <span class="chimera-detail-tier" style="color:${tc.text}">${ch.tier}</span>
        <span class="chimera-detail-rarity">${'★'.repeat(Math.ceil(ch.rarity / 4))}${'☆'.repeat(5 - Math.ceil(ch.rarity / 4))}</span>
      </div>
    </div>
    <div class="chimera-detail-section">
      <h4 class="chimera-detail-label">Appearance</h4>
      <p class="chimera-detail-text">${escHtml(ch.appearance)}</p>
    </div>
    <div class="chimera-detail-section">
      <h4 class="chimera-detail-label">Description</h4>
      <p class="chimera-detail-text">${escHtml(ch.description)}</p>
    </div>
    <div class="chimera-detail-section">
      <h4 class="chimera-detail-label">Habitat</h4>
      <p class="chimera-detail-text">${ch.habitats.map(h => { const e = EXPEDITIONS.find(ex => ex.id === h); return e ? e.emoji + ' ' + e.name : h; }).join(', ')}</p>
    </div>
    <div class="chimera-detail-stats">
      <span>First seen: ${formatDate(disc.firstSeen)}</span>
      <span>Encounters: ${disc.timesSeen}</span>
    </div>
    <button class="btn-glossy btn-green" onclick="closeChimeraDetail()" style="margin-top:16px; width:100%;">Close</button>
  `;
  overlay.style.display = 'flex';
}

function closeChimeraDetail() {
  const overlay = document.getElementById('chimera-detail-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ===== Initialize expeditions on app load =====
function initExpeditions() {
  ensureExpeditionData();

  // Ensure bestiary exists
  if (!data.bestiary) data.bestiary = {};

  // Check auto daily expedition
  const autoResult = checkAutoExpedition();
  if (autoResult) {
    // Show notification of auto expedition results
    setTimeout(() => {
      showLootPopup(autoResult.loot, 'Daily Morning Walk 🌅', autoResult.chimera);
      if (typeof setSpeech === 'function') {
        if (autoResult.chimera && autoResult.chimera.isNew) setSpeech('chimeraNew');
        else if (autoResult.chimera) setSpeech('chimeraFound');
        else setSpeech('autoExpedition');
      }
      if (typeof setCreatureState === 'function') setCreatureState('happy');
    }, 1000);
  }

  // Check if a timed expedition completed while away
  const completedWhileAway = checkActiveExpedition();
  if (completedWhileAway) {
    setTimeout(() => {
      showLootPopup(completedWhileAway.loot, completedWhileAway.expedition, completedWhileAway.chimera);
      if (typeof setSpeech === 'function') {
        if (completedWhileAway.chimera && completedWhileAway.chimera.isNew) setSpeech('chimeraNew');
        else if (completedWhileAway.chimera) setSpeech('chimeraFound');
        else setSpeech('expeditionDone');
      }
      if (typeof setCreatureState === 'function') setCreatureState('celebrate');
    }, autoResult ? 3000 : 1000); // Delay if auto also triggered
  }

  renderExpeditions();
  renderMaterials();
  renderBestiary();
  startExpeditionTimer();
}
