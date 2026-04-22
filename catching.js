// ===== CHIMERA CATCHING SYSTEM =====
// Catch chimeras during expeditions to add to your inventory
// Caught chimeras can be viewed, named, and provide passive bonuses
// Catching requires items (nets, bait, traps) bought from the store

// ===== CATCHING ITEMS =====
const CATCH_ITEMS = [
  { id: 'basic_net', name: 'Basic Net', emoji: '🥅', price: 15, catchBonus: 0.10, tier: 'Common', desc: 'A simple net. +10% catch rate for Common chimeras.' },
  { id: 'silk_net', name: 'Silk Net', emoji: '🕸️', price: 35, catchBonus: 0.15, tier: 'Uncommon', desc: 'Woven from spider silk. +15% catch rate for Uncommon.' },
  { id: 'crystal_cage', name: 'Crystal Cage', emoji: '💎', price: 60, catchBonus: 0.12, tier: 'Rare', desc: 'A shimmering cage. +12% catch rate for Rare chimeras.' },
  { id: 'spirit_orb', name: 'Spirit Orb', emoji: '🔮', price: 100, catchBonus: 0.10, tier: 'Epic', desc: 'Resonates with spirits. +10% catch rate for Epic.' },
  { id: 'legend_seal', name: 'Legend Seal', emoji: '📜', price: 200, catchBonus: 0.08, tier: 'Legendary', desc: 'An ancient seal. +8% catch rate for Legendary.' },
  { id: 'honey_bait', name: 'Honey Bait', emoji: '🍯', price: 10, catchBonus: 0.05, tier: 'all', desc: 'Sweet bait. +5% catch rate for any chimera.' },
  { id: 'moonlight_lure', name: 'Moonlight Lure', emoji: '🌙', price: 45, catchBonus: 0.08, tier: 'all', desc: 'Glows at night. +8% catch rate for any chimera.' },
  { id: 'friendship_bell', name: 'Friendship Bell', emoji: '🔔', price: 75, catchBonus: 0.15, tier: 'all', desc: 'A gentle chime. +15% catch rate for any chimera.' },
];

// ===== NEW CHIMERAS TO ADD =====
const EXTRA_CHIMERAS = [
  // More meadow creatures
  {
    id: 'clover_sprite', name: 'Clover Sprite', emoji: '🍀',
    tier: 'Common', rarity: 2,
    habitats: ['meadow'],
    appearance: 'A tiny green fairy perched atop a four-leaf clover, wearing a dress made of pressed flower petals. She leaves a trail of glittering luck-dust.',
    description: 'Clover Sprites bring good fortune to anyone who spots them. Finding one is said to guarantee at least one rare material on your next expedition.'
  },
  {
    id: 'breeze_fox', name: 'Breeze Fox', emoji: '🌬️',
    tier: 'Common', rarity: 3,
    habitats: ['meadow', 'forest'],
    appearance: 'A translucent fox made of swirling wind currents, with leaves and flower petals caught in its body like a living snow globe.',
    description: 'Breeze Foxes are born from sudden gusts of wind on calm days. They race across meadows just for the joy of it.'
  },
  // More forest
  {
    id: 'mushroom_king', name: 'Mushroom King', emoji: '🍄',
    tier: 'Uncommon', rarity: 7,
    habitats: ['forest'],
    appearance: 'A regal toad wearing a crown of bioluminescent mushrooms, sitting on a throne of toadstools. His cape is made of moss and he carries a tiny scepter.',
    description: 'The Mushroom King rules a vast underground fungal network. He can communicate with every mushroom in the forest simultaneously.'
  },
  {
    id: 'lantern_deer', name: 'Lantern Deer', emoji: '🦌',
    tier: 'Uncommon', rarity: 6,
    habitats: ['forest', 'meadow'],
    appearance: 'A graceful deer with antlers that hold tiny paper lanterns, each glowing a different warm color. Moths circle its head like a living halo.',
    description: 'Lantern Deer guide lost travelers through dark forests. Following one always leads to safety, though never to where you originally intended.'
  },
  // More cave
  {
    id: 'gem_wyrm', name: 'Gem Wyrm', emoji: '🐉',
    tier: 'Rare', rarity: 11,
    habitats: ['cave'],
    appearance: 'A small serpentine dragon covered in gemstones instead of scales. Each gem pulses with inner light, and its breath comes out as sparkling diamond dust.',
    description: 'Gem Wyrms are the treasure guardians of deep caves. Despite their fearsome heritage, they are actually quite shy and will trade gems for compliments.'
  },
  {
    id: 'shadow_cat', name: 'Shadow Cat', emoji: '🐈‍⬛',
    tier: 'Rare', rarity: 10,
    habitats: ['cave', 'ruins'],
    appearance: 'A cat made entirely of living shadow, with eyes like two floating golden coins. It can flatten itself to slip under any door or through any crack.',
    description: 'Shadow Cats are thieves by nature but generous by choice. They steal shiny objects but always leave something of equal value behind.'
  },
  // More ruins
  {
    id: 'clock_owl', name: 'Clock Owl', emoji: '🦉',
    tier: 'Epic', rarity: 14,
    habitats: ['ruins', 'cave'],
    appearance: 'A large owl with a clock face embedded in its chest, hands perpetually spinning. Its feathers are made of old parchment covered in faded equations.',
    description: 'Clock Owls remember every second that has ever passed. If you ask one the time, it will tell you the time everywhere in the world simultaneously.'
  },
  {
    id: 'origami_crane', name: 'Origami Crane', emoji: '🦢',
    tier: 'Epic', rarity: 13,
    habitats: ['ruins', 'forest'],
    appearance: 'A life-sized crane folded from luminous white paper that somehow flies with complete grace. Wishes written on paper appear on its wings.',
    description: 'Legend says folding 1000 paper cranes grants a wish. This chimera IS the wish. It appears only to those who have demonstrated great perseverance.'
  },
  // More abyss
  {
    id: 'nebula_jellyfish', name: 'Nebula Jellyfish', emoji: '🪼',
    tier: 'Legendary', rarity: 18,
    habitats: ['abyss'],
    appearance: 'An enormous jellyfish containing an entire nebula within its bell. Stars are born and die inside it over seconds. Its tentacles trail galaxies.',
    description: 'Nebula Jellyfish drift between dimensions. Each one contains an entire universe in miniature. Looking into one for too long makes you question everything.'
  },
  {
    id: 'time_tortoise', name: 'Time Tortoise', emoji: '🐢',
    tier: 'Legendary', rarity: 19,
    habitats: ['abyss', 'ruins'],
    appearance: 'An ancient tortoise with a shell that shows different time periods when viewed from different angles - past, present, and future all at once.',
    description: 'The Time Tortoise has been everywhere and everywhen. It moves so slowly that time has given up trying to affect it. It remembers tomorrow.'
  },

  // ===== WAVE 2: MORE CHIMERAS =====
  // Meadow
  {
    id: 'dandelion_wisp', name: 'Dandelion Wisp', emoji: '🌾',
    tier: 'Common', rarity: 1,
    habitats: ['meadow'],
    appearance: 'A tiny orb of light wrapped in dandelion fluff, drifting on invisible currents. When it sneezes, seeds scatter in every direction.',
    description: 'Dandelion Wisps carry wishes on the wind. If you catch the fluff they shed, whisper a wish into it before it drifts away.'
  },
  {
    id: 'honey_slime', name: 'Honey Slime', emoji: '🍯',
    tier: 'Common', rarity: 2,
    habitats: ['meadow', 'forest'],
    appearance: 'A golden-amber blob that oozes sweet nectar. Bees orbit it like tiny moons, and flowers bloom wherever it slides.',
    description: 'Honey Slimes are considered the friendliest chimeras. They leave trails of wildflowers and attract butterflies wherever they go.'
  },
  {
    id: 'ribbon_eel', name: 'Ribbon Eel', emoji: '🎀',
    tier: 'Common', rarity: 3,
    habitats: ['meadow'],
    appearance: 'A serpentine creature made of flowing silk ribbons in pastel colors. It swims through grass as if it were water, leaving rainbow contrails.',
    description: 'Ribbon Eels are thought to be born from lost festival decorations given life by moonlight. They love to dance on breezy days.'
  },
  // Forest
  {
    id: 'amber_beetle', name: 'Amber Beetle', emoji: '🪲',
    tier: 'Uncommon', rarity: 5,
    habitats: ['forest'],
    appearance: 'A massive beetle with a translucent amber shell containing preserved prehistoric ferns. Its horn crackles with fossilized lightning.',
    description: 'Amber Beetles carry the memories of ancient forests inside their shells. Scholars pay fortunes to study what they preserve.'
  },
  {
    id: 'vine_monkey', name: 'Vine Monkey', emoji: '🐒',
    tier: 'Uncommon', rarity: 6,
    habitats: ['forest', 'meadow'],
    appearance: 'A small monkey whose limbs extend into living vines. It can swing between trees using its own body, and fruits grow from its tail.',
    description: 'Vine Monkeys replant forests faster than any creature. A single one can restore a burnt clearing to lush jungle in one season.'
  },
  {
    id: 'spore_knight', name: 'Spore Knight', emoji: '🛡️',
    tier: 'Uncommon', rarity: 7,
    habitats: ['forest', 'cave'],
    appearance: 'A small humanoid figure in armor made of hardened bracket fungus, wielding a rapier carved from a giant thorn. Bioluminescent spores trail behind.',
    description: 'Spore Knights guard the boundary between the surface world and the fungal kingdoms below. They are chivalrous to a fault.'
  },
  // Cave
  {
    id: 'echo_bat', name: 'Echo Bat', emoji: '🦇',
    tier: 'Rare', rarity: 9,
    habitats: ['cave'],
    appearance: 'A crystalline bat that emits visible sound waves in neon colors. Each screech paints the cave walls with temporary aurora borealis.',
    description: 'Echo Bats can replay any sound they have ever heard. Some cave explorers use them as living tape recorders.'
  },
  {
    id: 'magma_crab', name: 'Magma Crab', emoji: '🦀',
    tier: 'Rare', rarity: 10,
    habitats: ['cave'],
    appearance: 'A crab with a shell of cooling magma, cracks glowing cherry-red. Its claws are obsidian and steam hisses from its joints.',
    description: 'Magma Crabs forge their own shells from volcanic vents. Each shell is unique, and they take great pride in their molten designs.'
  },
  {
    id: 'prism_moth', name: 'Prism Moth', emoji: '🦋',
    tier: 'Rare', rarity: 11,
    habitats: ['cave', 'ruins'],
    appearance: 'An enormous moth with wings that split light into rainbows. In complete darkness, it glows with its own inner spectrum.',
    description: 'Prism Moths are drawn to knowledge. They gather in libraries and archives, feeding on the ambient light of understanding.'
  },
  // Ruins
  {
    id: 'golem_pup', name: 'Golem Pup', emoji: '🗿',
    tier: 'Epic', rarity: 13,
    habitats: ['ruins'],
    appearance: 'A puppy-sized stone golem covered in ancient runes. Its tail wags sending pebbles flying, and it fetches boulders instead of sticks.',
    description: 'Golem Pups are the babies of ancient guardian statues. They are fiercely loyal once bonded, but they chew on everything — including walls.'
  },
  {
    id: 'ink_serpent', name: 'Ink Serpent', emoji: '🖋️',
    tier: 'Epic', rarity: 14,
    habitats: ['ruins', 'cave'],
    appearance: 'A snake made of flowing calligraphy ink, forming and dissolving kanji as it moves. Its eyes are drops of red seal ink.',
    description: 'Ink Serpents are born from forgotten manuscripts. They remember every word ever written in the ruins they inhabit.'
  },
  {
    id: 'mirror_fox', name: 'Mirror Fox', emoji: '🪞',
    tier: 'Epic', rarity: 15,
    habitats: ['ruins', 'forest'],
    appearance: 'A fox whose fur is made of countless tiny mirrors. It reflects its surroundings perfectly, making it nearly invisible. Only its golden eyes give it away.',
    description: 'Mirror Foxes show you your true self if you look into their fur. Some people are delighted; others run away.'
  },
  // Abyss
  {
    id: 'void_whale', name: 'Void Whale', emoji: '🐋',
    tier: 'Legendary', rarity: 17,
    habitats: ['abyss'],
    appearance: 'A colossal whale that swims through empty space. Its body is a window into the void between stars, and its song vibrates reality.',
    description: 'Void Whales are the largest chimeras ever recorded. Their songs can be heard across dimensions, and each note contains a universe of meaning.'
  },
  {
    id: 'dream_weaver', name: 'Dream Weaver', emoji: '🕸️',
    tier: 'Legendary', rarity: 18,
    habitats: ['abyss', 'ruins'],
    appearance: 'A spider-like entity that weaves webs from crystallized dreams. Each strand contains a sleeping person\'s vision, shimmering with narrative.',
    description: 'Dream Weavers collect and curate dreams. If you sleep near one, you will have the most vivid and beautiful dream of your life.'
  },
  {
    id: 'paradox_cat', name: 'Paradox Cat', emoji: '🐱',
    tier: 'Legendary', rarity: 20,
    habitats: ['abyss'],
    appearance: 'A cat that exists and does not exist simultaneously. It phases between visible and invisible, solid and ghostly. Both alive and asleep at all times.',
    description: 'The Paradox Cat is the rarest chimera known. It can only be observed when you are not looking for it, and captured only by those who do not wish to.'
  },
];

// ===== CATCHING MECHANICS =====
function getCatchData() {
  if (!data.catching) {
    data.catching = {
      caughtChimeras: [],  // { id, name, nickname, caughtDate, personality, tier }
      catchItems: {},       // { itemId: count }
      totalCaught: 0,
      totalAttempts: 0,
      catchStreak: 0,
    };
    saveData();
  }
  return data.catching;
}

function getBaseCatchRate(tier) {
  switch (tier) {
    case 'Common': return 0.60;
    case 'Uncommon': return 0.40;
    case 'Rare': return 0.25;
    case 'Epic': return 0.15;
    case 'Legendary': return 0.08;
    default: return 0.30;
  }
}

function attemptCatch(chimeraId) {
  const cd = getCatchData();
  const allChimeras = [...CHIMERAS, ...EXTRA_CHIMERAS];
  const chimera = allChimeras.find(c => c.id === chimeraId);
  if (!chimera) return { success: false, message: 'Chimera not found!' };

  cd.totalAttempts++;

  // Calculate catch rate
  let catchRate = getBaseCatchRate(chimera.tier);

  // Apply catch items
  let usedItem = null;
  const bestItem = findBestCatchItem(chimera.tier);
  if (bestItem) {
    catchRate += bestItem.catchBonus;
    cd.catchItems[bestItem.id]--;
    if (cd.catchItems[bestItem.id] <= 0) delete cd.catchItems[bestItem.id];
    usedItem = bestItem;
  }

  // Streak bonus
  catchRate += cd.catchStreak * 0.02;

  // Already caught bonus (easier to catch duplicates)
  const alreadyCaught = cd.caughtChimeras.filter(c => c.id === chimeraId).length;
  if (alreadyCaught > 0) catchRate += 0.10;

  catchRate = Math.min(0.95, catchRate);

  const roll = Math.random();
  const success = roll < catchRate;

  if (success) {
    const personality = CHIMERA_PERSONALITIES[Math.floor(Math.random() * CHIMERA_PERSONALITIES.length)];
    cd.caughtChimeras.push({
      id: chimera.id,
      name: chimera.name,
      nickname: null,
      caughtDate: todayStr(),
      personality: personality.trait,
      tier: chimera.tier,
      emoji: chimera.emoji,
    });
    cd.totalCaught++;
    cd.catchStreak++;
  } else {
    cd.catchStreak = 0;
  }

  saveData();
  return {
    success,
    catchRate: Math.round(catchRate * 100),
    usedItem,
    chimera,
    message: success
      ? `Caught ${chimera.name}! (${Math.round(catchRate * 100)}% chance)`
      : `${chimera.name} escaped! (${Math.round(catchRate * 100)}% chance)`
  };
}

function findBestCatchItem(tier) {
  const cd = getCatchData();
  // First try tier-specific items
  const tierItems = CATCH_ITEMS.filter(i => i.tier === tier && cd.catchItems[i.id] > 0);
  if (tierItems.length > 0) return tierItems.reduce((a, b) => a.catchBonus > b.catchBonus ? a : b);

  // Then try 'all' tier items
  const allItems = CATCH_ITEMS.filter(i => i.tier === 'all' && cd.catchItems[i.id] > 0);
  if (allItems.length > 0) return allItems.reduce((a, b) => a.catchBonus > b.catchBonus ? a : b);

  return null;
}

function buyCatchItem(itemId) {
  const sd = getSlotData();
  const cd = getCatchData();
  const item = CATCH_ITEMS.find(i => i.id === itemId);
  if (!item) return;
  if (sd.moeBucks < item.price) return;

  sd.moeBucks -= item.price;
  if (!cd.catchItems[itemId]) cd.catchItems[itemId] = 0;
  cd.catchItems[itemId]++;

  saveData();
  updateSlotMoneyDisplay();
  renderCatchShop();
  renderCatchInventory();
}

function nicknameChimera(idx) {
  const cd = getCatchData();
  if (!cd.caughtChimeras[idx]) return;
  const name = prompt('Give a nickname to ' + cd.caughtChimeras[idx].name + ':');
  if (name && name.trim()) {
    cd.caughtChimeras[idx].nickname = name.trim();
    saveData();
    renderChimeraInventory();
  }
}

function releaseChimera(idx) {
  const cd = getCatchData();
  if (!cd.caughtChimeras[idx]) return;
  if (!confirm('Release ' + (cd.caughtChimeras[idx].nickname || cd.caughtChimeras[idx].name) + '? This cannot be undone.')) return;
  cd.caughtChimeras.splice(idx, 1);
  saveData();
  renderChimeraInventory();
}

// ===== RENDER FUNCTIONS =====
function renderCatchShop() {
  const container = document.getElementById('catch-shop-items');
  if (!container) return;
  const sd = getSlotData();
  const cd = getCatchData();

  container.innerHTML = CATCH_ITEMS.map(item => {
    const owned = cd.catchItems[item.id] || 0;
    return `
      <div class="catch-shop-card glass" onclick="buyCatchItem('${item.id}')">
        <div class="catch-shop-emoji">${item.emoji}</div>
        <div class="catch-shop-name">${item.name}</div>
        <div class="catch-shop-desc">${item.desc}</div>
        <div class="catch-shop-price">${item.price} MB</div>
        ${owned > 0 ? `<div class="catch-shop-owned">Owned: ${owned}</div>` : ''}
      </div>
    `;
  }).join('');
}

function renderCatchInventory() {
  const container = document.getElementById('catch-item-inventory');
  if (!container) return;
  const cd = getCatchData();

  const items = Object.entries(cd.catchItems).filter(([_, count]) => count > 0);
  if (items.length === 0) {
    container.innerHTML = '<div style="color:rgba(255,255,255,0.4); text-align:center; padding:10px; font-size:0.85rem;">No catching items. Buy some from the shop!</div>';
    return;
  }

  container.innerHTML = items.map(([id, count]) => {
    const item = CATCH_ITEMS.find(i => i.id === id);
    if (!item) return '';
    return `<span class="catch-inv-badge glass">${item.emoji} ${item.name} x${count}</span>`;
  }).join('');
}

function renderChimeraInventory() {
  const container = document.getElementById('chimera-inventory-list');
  if (!container) return;
  const cd = getCatchData();

  if (cd.caughtChimeras.length === 0) {
    container.innerHTML = '<div style="color:rgba(255,255,255,0.4); text-align:center; padding:30px; font-style:italic;">No chimeras caught yet. Go on expeditions and catch some!</div>';
    return;
  }

  const tierOrder = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Uncommon': 3, 'Common': 4 };
  const sorted = cd.caughtChimeras.map((c, i) => ({ ...c, _idx: i })).sort((a, b) => (tierOrder[a.tier] || 5) - (tierOrder[b.tier] || 5));

  container.innerHTML = sorted.map(c => {
    const tc = TIER_COLORS[c.tier] || TIER_COLORS['Common'];
    return `
      <div class="chimera-inv-card" style="border-color:${tc.border}; background:${tc.bg};">
        <div class="chimera-inv-emoji">${c.emoji}</div>
        <div class="chimera-inv-info">
          <div class="chimera-inv-name" style="color:${tc.text};">${c.nickname ? `"${c.nickname}" (${c.name})` : c.name}</div>
          <div class="chimera-inv-meta">${c.tier} · ${c.personality} · Caught ${c.caughtDate}</div>
        </div>
        <div class="chimera-inv-actions">
          <button class="catch-action-btn" onclick="nicknameChimera(${c._idx})">✏️</button>
          <button class="catch-action-btn catch-release-btn" onclick="releaseChimera(${c._idx})">🔓</button>
        </div>
      </div>
    `;
  }).join('');

  // Stats
  const statsEl = document.getElementById('chimera-inv-stats');
  if (statsEl) {
    const unique = new Set(cd.caughtChimeras.map(c => c.id)).size;
    statsEl.innerHTML = `
      <span>Total: ${cd.caughtChimeras.length}</span>
      <span>Unique: ${unique}</span>
      <span>Attempts: ${cd.totalAttempts}</span>
      <span>Streak: ${cd.catchStreak}</span>
    `;
  }
}

function initCatching() {
  getCatchData();
  // Register extra chimeras
  if (typeof CHIMERAS !== 'undefined') {
    EXTRA_CHIMERAS.forEach(c => {
      if (!CHIMERAS.find(existing => existing.id === c.id)) {
        CHIMERAS.push(c);
      }
    });
  }
  renderCatchShop();
  renderCatchInventory();
  renderChimeraInventory();
}
