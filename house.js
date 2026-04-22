// ===== HOUSE MINIMAP SYSTEM =====
// Click Moe-chan's house on the map to enter a house minimap
// 11 rooms total: Kitchen, Bedroom, Bathroom, Living Room, Storage, Garden, Study,
// Game Room, Attic, Basement, Secret Room

const HOUSE_ROOMS = {
  entrance: {
    name: 'Entrance Hall',
    emoji: '🚪',
    ascii: [
      '╔══════════════════════════════╗',
      '║         ENTRANCE HALL        ║',
      '║                              ║',
      '║   ┌────┐    🚪    ┌────┐    ║',
      '║   │coat│  doorway │shoe│    ║',
      '║   │rack│         │rack│    ║',
      '║   └────┘          └────┘    ║',
      '║                              ║',
      '║     🪞 mirror   📮 mail     ║',
      '║                              ║',
      '║  ◄ living    kitchen ►      ║',
      '║     ▼ basement              ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['living', 'kitchen', 'basement'],
    desc: 'A cozy entrance with a shoe rack and coat hooks. A small mirror hangs on the wall.'
  },
  kitchen: {
    name: 'Kitchen',
    emoji: '🍳',
    ascii: [
      '╔══════════════════════════════╗',
      '║           KITCHEN            ║',
      '║                              ║',
      '║  ┌──────────────────┐       ║',
      '║  │ 🍳 stove │ 🔪 prep│       ║',
      '║  └──────────────────┘       ║',
      '║                              ║',
      '║  🧊 fridge    🍶 pantry     ║',
      '║                              ║',
      '║   ┌────────┐   🚰 sink      ║',
      '║   │  table │   🧹 broom     ║',
      '║   │  🍽️   │                 ║',
      '║   └────────┘                 ║',
      '║                              ║',
      '║  ◄ entrance    garden ►     ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['entrance', 'garden'],
    desc: 'A warm kitchen filled with the smell of freshly cooked rice. Pots and pans hang neatly.'
  },
  living: {
    name: 'Living Room',
    emoji: '🛋️',
    ascii: [
      '╔══════════════════════════════╗',
      '║         LIVING ROOM          ║',
      '║                              ║',
      '║  ┌──────────────┐            ║',
      '║  │  🛋️ sofa     │  📺 TV    ║',
      '║  │              │            ║',
      '║  └──────────────┘            ║',
      '║                              ║',
      '║  🪴 plant    🕯️ candle      ║',
      '║                              ║',
      '║  📚 bookshelf  🎮 console   ║',
      '║                              ║',
      '║  ◄ study    entrance ►      ║',
      '║     ▲ bedroom               ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['study', 'entrance', 'bedroom'],
    desc: 'A comfortable room with a big squishy sofa, a modest TV, and stacks of manga.'
  },
  bedroom: {
    name: 'Bedroom',
    emoji: '🛏️',
    ascii: [
      '╔══════════════════════════════╗',
      '║           BEDROOM            ║',
      '║                              ║',
      '║  ┌──────────────────┐       ║',
      '║  │  🛏️  bed          │       ║',
      '║  │  zzz...          │       ║',
      '║  └──────────────────┘       ║',
      '║                              ║',
      '║  🪟 window    🧸 plushies   ║',
      '║                              ║',
      '║  💡 lamp   👗 wardrobe      ║',
      '║               🪞 vanity     ║',
      '║                              ║',
      '║  ◄ bathroom   living ▼      ║',
      '║     ▲ attic                 ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['bathroom', 'living', 'attic'],
    desc: 'Moe-chan\'s cozy bedroom. Plushies line the shelves, and the bed has a fluffy pink comforter.'
  },
  bathroom: {
    name: 'Bathroom',
    emoji: '🛁',
    ascii: [
      '╔══════════════════════════════╗',
      '║          BATHROOM            ║',
      '║                              ║',
      '║  ┌──────┐    ┌──────────┐   ║',
      '║  │ 🚿   │    │  🛁 tub  │   ║',
      '║  │shower │    │  bubbly! │   ║',
      '║  └──────┘    └──────────┘   ║',
      '║                              ║',
      '║  🚽 toilet    🪥 brushes    ║',
      '║                              ║',
      '║  🧴 shampoo   🧼 soap      ║',
      '║  🪞 mirror    🌸 bath bomb  ║',
      '║                              ║',
      '║     bedroom ►               ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['bedroom'],
    desc: 'A sparkling clean bathroom with a big tub. Rubber duckies float in the water.'
  },
  study: {
    name: 'Study',
    emoji: '📖',
    ascii: [
      '╔══════════════════════════════╗',
      '║            STUDY             ║',
      '║                              ║',
      '║  ┌──────────────────┐       ║',
      '║  │ 💻 desk          │       ║',
      '║  │ 📝 notebook      │       ║',
      '║  │ 🖊️ pens          │       ║',
      '║  └──────────────────┘       ║',
      '║                              ║',
      '║  📚📚📚 bookshelves         ║',
      '║  📖 dictionary  🗾 map      ║',
      '║                              ║',
      '║  🏮 lantern  ☕ tea corner   ║',
      '║                              ║',
      '║  living ►    gameroom ◄     ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['living', 'gameroom'],
    desc: 'Where Moe-chan studies Japanese! Covered in sticky notes and vocabulary lists.'
  },
  gameroom: {
    name: 'Game Room',
    emoji: '🎮',
    ascii: [
      '╔══════════════════════════════╗',
      '║         GAME ROOM            ║',
      '║                              ║',
      '║  🕹️ arcade    🎯 dartboard  ║',
      '║                              ║',
      '║  ┌──────────────────┐       ║',
      '║  │ 🎰 SLOT MACHINE │       ║',
      '║  │  [7] [7] [7]    │       ║',
      '║  └──────────────────┘       ║',
      '║                              ║',
      '║  🎲 board games  🃏 cards   ║',
      '║  🧩 puzzles      🎵 radio   ║',
      '║                              ║',
      '║  ◄ study   storage ►       ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['study', 'storage'],
    desc: 'Moe-chan\'s fun zone! Arcade machines, board games, and of course, the slot machine.'
  },
  storage: {
    name: 'Storage Room',
    emoji: '📦',
    ascii: [
      '╔══════════════════════════════╗',
      '║        STORAGE ROOM          ║',
      '║                              ║',
      '║  📦📦📦   boxes everywhere   ║',
      '║  📦📦                        ║',
      '║                              ║',
      '║  🧹 cleaning supplies       ║',
      '║  🔧 toolbox   🪜 ladder     ║',
      '║                              ║',
      '║  🎒 expedition gear          ║',
      '║  ⚗️ materials stash          ║',
      '║  🗺️ old maps                ║',
      '║                              ║',
      '║  ◄ gameroom                 ║',
      '║  ★ secret ★ (find the key!) ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['gameroom', 'secret'],
    desc: 'Dusty and packed with expedition supplies. Something glimmers behind the boxes...'
  },
  garden: {
    name: 'Garden',
    emoji: '🌸',
    ascii: [
      '╔══════════════════════════════╗',
      '║           GARDEN             ║',
      '║                              ║',
      '║  🌸🌺🌻  flower beds        ║',
      '║  🌷🌹🌼                     ║',
      '║                              ║',
      '║  🌳 cherry tree  ⛲ fountain ║',
      '║                              ║',
      '║  🦋 butterflies  🐛 bugs    ║',
      '║  🪴🪴🪴 herb garden         ║',
      '║                              ║',
      '║  🪑 bench   🏮 garden light ║',
      '║  🍃 windchime               ║',
      '║                              ║',
      '║  ◄ kitchen                  ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['kitchen'],
    desc: 'A beautiful garden with cherry blossoms, a stone fountain, and herb beds.'
  },
  attic: {
    name: 'Attic',
    emoji: '🏚️',
    ascii: [
      '╔══════════════════════════════╗',
      '║            ATTIC             ║',
      '║         /\\      /\\           ║',
      '║        /  \\    /  \\          ║',
      '║       /    \\  /    \\         ║',
      '║                              ║',
      '║  🕯️ dusty     🕸️ cobwebs    ║',
      '║                              ║',
      '║  📦 old photos  🎭 masks    ║',
      '║  🪆 antique doll            ║',
      '║  📜 mysterious scroll       ║',
      '║  🔭 telescope (sky view!)   ║',
      '║                              ║',
      '║     bedroom ▼               ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['bedroom'],
    desc: 'A creaky attic filled with memories. A telescope points toward the stars.'
  },
  basement: {
    name: 'Basement',
    emoji: '🏗️',
    ascii: [
      '╔══════════════════════════════╗',
      '║          BASEMENT            ║',
      '║                              ║',
      '║  ▓▓▓ stone walls ▓▓▓        ║',
      '║                              ║',
      '║  🕯️🕯️ torches              ║',
      '║                              ║',
      '║  🧪 alchemy station         ║',
      '║  ⚗️ potions     📊 charts   ║',
      '║                              ║',
      '║  🗃️ filing     🔮 crystal   ║',
      '║  📻 old radio               ║',
      '║                              ║',
      '║     entrance ▲              ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['entrance'],
    desc: 'A cool, underground room. An alchemy station bubbles away quietly.'
  },
  secret: {
    name: 'Secret Room',
    emoji: '✨',
    ascii: [
      '╔══════════════════════════════╗',
      '║       ✨ SECRET ROOM ✨      ║',
      '║                              ║',
      '║  ·  · ★ ·  · ★  ·  · ★ ·   ║',
      '║     ·    ★    ·    ★        ║',
      '║                              ║',
      '║  🏆 trophy case             ║',
      '║  👑 Moe-chan\'s crown         ║',
      '║  🎭 costume collection      ║',
      '║                              ║',
      '║  💎 treasure chest           ║',
      '║  📜 ancient prophecy         ║',
      '║  🌟 wishing star            ║',
      '║                              ║',
      '║     storage ►               ║',
      '╚══════════════════════════════╝',
    ],
    connections: ['storage'],
    desc: 'A hidden room glittering with treasures and secrets. Only the most dedicated find it.'
  }
};

// House overview ASCII map
const HOUSE_OVERVIEW = `
┌─────────────────────────────────────────────────┐
│               MOE-CHAN'S HOUSE                   │
│                                                  │
│    ┌─────────┐                                   │
│    │  ATTIC  │                                   │
│    └────┬────┘                                   │
│  ┌──────┴──────┬──────────┬──────────┐           │
│  │  BEDROOM    │ BATHROOM │  GARDEN  │           │
│  └──────┬──────┴──────────┘──────┬───┘           │
│  ┌──────┴──────┬──────────┬──────┴───┐           │
│  │ LIVING ROOM │ ENTRANCE │ KITCHEN  │           │
│  └──────┬──────┴────┬─────┴──────────┘           │
│  ┌──────┴──────┬────┴─────┐                      │
│  │   STUDY     │ BASEMENT │                      │
│  └──────┬──────┴──────────┘                      │
│  ┌──────┴──────┬──────────┐                      │
│  │ GAME ROOM   │ STORAGE  │───► SECRET           │
│  └─────────────┴──────────┘                      │
│                                                  │
│  Click a room to explore!                        │
└─────────────────────────────────────────────────┘`;

let currentRoom = null; // null = overview, string = room id
let houseActive = false;

function enterHouse() {
  houseActive = true;
  currentRoom = null;
  renderHouse();
  // Switch to house tab
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const houseTab = document.querySelector('[data-tab="house"]');
  if (houseTab) houseTab.classList.add('active');
  document.getElementById('tab-house').classList.add('active');
}

function exitHouse() {
  houseActive = false;
  currentRoom = null;
  // Switch back to map tab
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const mapTab = document.querySelector('[data-tab="map"]');
  if (mapTab) mapTab.classList.add('active');
  document.getElementById('tab-map').classList.add('active');
}

function goToRoom(roomId) {
  if (!HOUSE_ROOMS[roomId]) return;
  currentRoom = roomId;
  renderHouse();
}

function goToOverview() {
  currentRoom = null;
  renderHouse();
}

function renderHouse() {
  const container = document.getElementById('house-display');
  if (!container) return;

  if (currentRoom === null) {
    // Overview
    container.innerHTML = `
      <div class="house-overview">
        <pre class="house-ascii-map">${HOUSE_OVERVIEW}</pre>
        <div class="house-room-grid">
          ${Object.entries(HOUSE_ROOMS).map(([id, room]) => `
            <button class="house-room-btn glass" onclick="goToRoom('${id}')">
              <span class="house-room-emoji">${room.emoji}</span>
              <span class="house-room-name">${room.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    // Room view
    const room = HOUSE_ROOMS[currentRoom];
    container.innerHTML = `
      <div class="house-room-view">
        <div class="house-room-header">
          <button class="btn-theme house-back-btn" onclick="goToOverview()">◀ Back to Overview</button>
          <h3 class="house-room-title">${room.emoji} ${room.name}</h3>
        </div>
        <pre class="house-room-ascii">${room.ascii.join('\n')}</pre>
        <p class="house-room-desc">${room.desc}</p>
        <div class="house-connections">
          <span class="house-conn-label">Connected rooms:</span>
          ${room.connections.map(id => {
            const r = HOUSE_ROOMS[id];
            return r ? `<button class="house-conn-btn glass" onclick="goToRoom('${id}')">${r.emoji} ${r.name}</button>` : '';
          }).join('')}
        </div>
      </div>
    `;
  }
}

function initHouse() {
  renderHouse();
}
