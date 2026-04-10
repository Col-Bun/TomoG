// ===== DWARF FORTRESS-STYLE ASCII MAP =====
// Generates a procedural world map that expands daily from Moe-chan's house

const MAP_CONFIG = {
  INITIAL_RADIUS: 4,      // Starting visible radius around house
  DAILY_EXPANSION: 2,     // Tiles revealed per day
  MAX_RADIUS: 40,         // Maximum map radius
  TILE_SIZE: 1,           // Each char = 1 tile
  CENTER: 40,             // Center of the internal grid (house position)
  GRID_SIZE: 81           // 81x81 internal grid
};

// ===== TERRAIN TILES =====
// Each tile: { char, fg (foreground color), bg (optional background), name, walkable }
const TERRAIN = {
  HOUSE:      { char: '@', fg: '#ff3c8e', name: "Moe-chan's House", walkable: true, priority: 100 },
  GARDEN:     { char: '"', fg: '#a8e84c', name: 'Garden', walkable: true },
  PATH:       { char: '·', fg: '#c8b88a', name: 'Dirt Path', walkable: true },
  GRASS:      { char: '.', fg: '#4a8c2a', name: 'Grass', walkable: true },
  TALL_GRASS: { char: ',', fg: '#6aac3a', name: 'Tall Grass', walkable: true },
  FLOWERS:    { char: '*', fg: '#ffcc00', name: 'Wildflowers', walkable: true },
  TREE_OAK:   { char: 'T', fg: '#2d7a1e', name: 'Oak Tree', walkable: false },
  TREE_PINE:  { char: '♠', fg: '#1a5c0e', name: 'Pine Tree', walkable: false },
  TREE_CHERRY:{ char: '❀', fg: '#ff8ec4', name: 'Cherry Blossom', walkable: false },
  BUSH:       { char: '♣', fg: '#3a9a2a', name: 'Bush', walkable: false },
  WATER:      { char: '~', fg: '#4488ff', name: 'Water', walkable: false },
  DEEP_WATER: { char: '≈', fg: '#2255cc', name: 'Deep Water', walkable: false },
  BRIDGE:     { char: '=', fg: '#c8a060', name: 'Bridge', walkable: true },
  MOUNTAIN:   { char: '^', fg: '#888888', name: 'Mountain', walkable: false },
  PEAK:       { char: '▲', fg: '#cccccc', name: 'Mountain Peak', walkable: false },
  ROCK:       { char: '●', fg: '#666666', name: 'Boulder', walkable: false },
  SAND:       { char: '░', fg: '#e8d490', name: 'Sand', walkable: true },
  SHRINE:     { char: '⛩', fg: '#ff4444', name: 'Torii Gate', walkable: true },
  TEMPLE:     { char: '卍', fg: '#cc8800', name: 'Temple', walkable: true },
  VILLAGE_H:  { char: '▪', fg: '#cc9944', name: 'Village House', walkable: false },
  SHOP:       { char: '$', fg: '#ffaa00', name: 'Shop', walkable: true },
  WELL:       { char: 'O', fg: '#7799bb', name: 'Well', walkable: true },
  LANTERN:    { char: '¤', fg: '#ffdd55', name: 'Stone Lantern', walkable: true },
  RUINS:      { char: '#', fg: '#776655', name: 'Ancient Ruins', walkable: true },
  CAVE:       { char: 'Ω', fg: '#554433', name: 'Cave Entrance', walkable: true },
  BAMBOO:     { char: '|', fg: '#55cc55', name: 'Bamboo', walkable: false },
  RICE:       { char: '≡', fg: '#88cc44', name: 'Rice Paddy', walkable: true },
  STATUE:     { char: '☗', fg: '#aaaaaa', name: 'Stone Statue', walkable: false },
  FOG:        { char: '░', fg: '#334455', name: 'Unexplored', walkable: false },
  VOID:       { char: ' ', fg: '#111111', name: 'Unknown', walkable: false }
};

// ===== BIOME DEFINITIONS =====
const BIOMES = {
  FOREST:   { weight: 25, tiles: ['TREE_OAK', 'TREE_PINE', 'GRASS', 'TALL_GRASS', 'BUSH', 'FLOWERS', 'TREE_CHERRY'] },
  PLAINS:   { weight: 20, tiles: ['GRASS', 'TALL_GRASS', 'FLOWERS', 'PATH', 'GRASS', 'GRASS', 'TALL_GRASS'] },
  MOUNTAIN: { weight: 12, tiles: ['MOUNTAIN', 'PEAK', 'ROCK', 'GRASS', 'MOUNTAIN', 'MOUNTAIN', 'ROCK'] },
  WATER:    { weight: 10, tiles: ['WATER', 'WATER', 'DEEP_WATER', 'SAND', 'WATER', 'WATER', 'WATER'] },
  BAMBOO:   { weight: 8,  tiles: ['BAMBOO', 'BAMBOO', 'GRASS', 'BAMBOO', 'BAMBOO', 'TALL_GRASS', 'BAMBOO'] },
  VILLAGE:  { weight: 5,  tiles: ['VILLAGE_H', 'PATH', 'PATH', 'SHOP', 'WELL', 'LANTERN', 'GARDEN'] },
  SACRED:   { weight: 5,  tiles: ['SHRINE', 'LANTERN', 'PATH', 'GRASS', 'STATUE', 'TREE_CHERRY', 'GRASS'] },
  RICE:     { weight: 8,  tiles: ['RICE', 'RICE', 'WATER', 'RICE', 'GRASS', 'RICE', 'PATH'] },
  RUINS:    { weight: 4,  tiles: ['RUINS', 'ROCK', 'GRASS', 'RUINS', 'CAVE', 'TALL_GRASS', 'RUINS'] },
  BEACH:    { weight: 3,  tiles: ['SAND', 'SAND', 'WATER', 'SAND', 'SAND', 'SAND', 'GRASS'] }
};

// ===== SEEDED RANDOM =====
function mapSeedRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return hash >>> 0;
}

// ===== BIOME MAP (Voronoi-ish) =====
function generateBiomeMap(worldSeed) {
  const rng = mapSeedRandom(worldSeed);
  const size = MAP_CONFIG.GRID_SIZE;
  const biomeMap = Array.from({ length: size }, () => Array(size).fill(null));

  // Place biome seed points
  const numSeeds = 30 + Math.floor(rng() * 15);
  const seeds = [];
  const biomeKeys = Object.keys(BIOMES);

  for (let i = 0; i < numSeeds; i++) {
    const x = Math.floor(rng() * size);
    const y = Math.floor(rng() * size);

    // Weighted biome selection
    const totalWeight = biomeKeys.reduce((sum, k) => sum + BIOMES[k].weight, 0);
    let roll = rng() * totalWeight;
    let biome = biomeKeys[0];
    for (const k of biomeKeys) {
      roll -= BIOMES[k].weight;
      if (roll <= 0) { biome = k; break; }
    }

    // Force village/sacred near center for early discovery
    const distFromCenter = Math.abs(x - MAP_CONFIG.CENTER) + Math.abs(y - MAP_CONFIG.CENTER);
    if (i < 3 && distFromCenter > 15) {
      // Place first few seeds near center
      seeds.push({
        x: MAP_CONFIG.CENTER + Math.floor((rng() - 0.5) * 16),
        y: MAP_CONFIG.CENTER + Math.floor((rng() - 0.5) * 16),
        biome: i === 0 ? 'PLAINS' : i === 1 ? 'FOREST' : 'VILLAGE'
      });
      continue;
    }

    seeds.push({ x, y, biome });
  }

  // Assign each cell to nearest seed (simplified Voronoi)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let minDist = Infinity;
      let closestBiome = 'PLAINS';
      for (const seed of seeds) {
        const dist = Math.abs(x - seed.x) + Math.abs(y - seed.y) + (rng() * 3 - 1.5); // jitter
        if (dist < minDist) {
          minDist = dist;
          closestBiome = seed.biome;
        }
      }
      biomeMap[y][x] = closestBiome;
    }
  }

  return biomeMap;
}

// ===== TILE GENERATION =====
function generateTile(x, y, biomeMap, worldSeed) {
  const cx = MAP_CONFIG.CENTER;
  const cy = MAP_CONFIG.CENTER;

  // Moe-chan's house at center
  if (x === cx && y === cy) return 'HOUSE';

  // Garden around house
  const distFromHouse = Math.abs(x - cx) + Math.abs(y - cy);
  if (distFromHouse <= 1) return 'GARDEN';
  if (distFromHouse === 2 && ((x + y) % 2 === 0)) return 'PATH';

  // Paths radiating from house
  const tileSeed = hashString(`${worldSeed}-${x}-${y}`);
  const tileRng = mapSeedRandom(tileSeed);

  if ((x === cx || y === cy) && distFromHouse <= 8 && tileRng() > 0.3) return 'PATH';

  // Get biome for this tile
  const biome = biomeMap[y] && biomeMap[y][x] ? biomeMap[y][x] : 'PLAINS';
  const biomeDef = BIOMES[biome];

  // Rivers - sinuous water paths
  const riverSeed = mapSeedRandom(worldSeed + 777);
  const riverOffset = Math.sin(y * 0.3 + riverSeed() * 10) * 4;
  if (Math.abs(x - (cx + 12 + riverOffset)) < 1.5) {
    // Check for bridge on paths
    if (y === cy) return 'BRIDGE';
    return 'WATER';
  }

  // Second river
  const river2Offset = Math.cos(x * 0.25 + riverSeed() * 10) * 3;
  if (Math.abs(y - (cy - 15 + river2Offset)) < 1) {
    if (x === cx) return 'BRIDGE';
    return 'WATER';
  }

  // Pick tile from biome
  const tileIdx = Math.floor(tileRng() * biomeDef.tiles.length);
  return biomeDef.tiles[tileIdx];
}

// ===== MAP STATE MANAGEMENT =====
function getMapData() {
  if (!data.mapState) {
    data.mapState = {
      worldSeed: hashString(todayStr().slice(0, 7) + '-moe-world'), // Seed from first month
      revealedRadius: MAP_CONFIG.INITIAL_RADIUS,
      lastExpandDate: null,
      discoveredLocations: [],
      totalTilesRevealed: 0,
      firstGenDate: todayStr()
    };
    saveData();
  }
  return data.mapState;
}

function expandMap() {
  const mapData = getMapData();
  const today = todayStr();

  if (mapData.lastExpandDate === today) return false; // Already expanded today

  // Calculate days since first gen
  const firstDate = new Date(mapData.firstGenDate);
  const now = new Date(today);
  const daysSinceStart = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));

  // Expansion rate: base + bonus from streak
  let expansion = MAP_CONFIG.DAILY_EXPANSION;
  if (data.streak >= 3) expansion += 1;
  if (data.streak >= 7) expansion += 1;
  if (data.streak >= 14) expansion += 1;

  const newRadius = Math.min(
    mapData.revealedRadius + expansion,
    MAP_CONFIG.MAX_RADIUS
  );

  mapData.revealedRadius = newRadius;
  mapData.lastExpandDate = today;
  mapData.totalTilesRevealed = Math.floor(Math.PI * newRadius * newRadius);

  saveData();
  return true;
}

// ===== SPECIAL LOCATION DISCOVERY =====
const SPECIAL_LOCATIONS = [
  { name: '忘れられた祠 (Forgotten Shrine)', minRadius: 6, biome: 'SACRED', tile: 'SHRINE', desc: 'An ancient shrine covered in moss. The air feels peaceful.' },
  { name: '隠れ里 (Hidden Village)', minRadius: 10, biome: 'VILLAGE', tile: 'VILLAGE_H', desc: 'A small settlement where friendly faces greet travelers.' },
  { name: '竹林の道 (Bamboo Path)', minRadius: 8, biome: 'BAMBOO', tile: 'BAMBOO', desc: 'Towering bamboo sways gently, filtering dappled light.' },
  { name: '古代遺跡 (Ancient Ruins)', minRadius: 14, biome: 'RUINS', tile: 'RUINS', desc: 'Crumbling stone walls whisper stories of a forgotten age.' },
  { name: '龍の洞窟 (Dragon Cave)', minRadius: 18, biome: 'RUINS', tile: 'CAVE', desc: 'A dark cave entrance. Something glimmers in the depths.' },
  { name: '天空の峰 (Sky Peak)', minRadius: 22, biome: 'MOUNTAIN', tile: 'PEAK', desc: 'The tallest mountain in the region. Clouds drift below you.' },
  { name: '桜の園 (Cherry Garden)', minRadius: 5, biome: 'FOREST', tile: 'TREE_CHERRY', desc: 'A grove of eternal cherry blossoms. Petals dance in the breeze.' },
  { name: '月見台 (Moon-Viewing Terrace)', minRadius: 12, biome: 'SACRED', tile: 'LANTERN', desc: 'A stone terrace where scholars once gazed at the moon.' },
  { name: '温泉 (Hot Spring)', minRadius: 16, biome: 'WATER', tile: 'WATER', desc: 'Steam rises from a natural hot spring. Very relaxing.' },
  { name: '商人街道 (Merchant Road)', minRadius: 20, biome: 'VILLAGE', tile: 'SHOP', desc: 'A bustling trade route connecting distant villages.' },
  { name: '迷いの森 (Bewildering Forest)', minRadius: 24, biome: 'FOREST', tile: 'TREE_OAK', desc: 'Trees grow so thick here that even the wind gets lost.' },
  { name: '星見の塔 (Stargazing Tower)', minRadius: 28, biome: 'RUINS', tile: 'RUINS', desc: 'A tall tower still standing among the ruins. Perfect for stargazing.' },
  { name: '白砂の浜 (White Sand Beach)', minRadius: 15, biome: 'BEACH', tile: 'SAND', desc: 'Pristine sand meets turquoise waves. Shells dot the shore.' },
  { name: '稲荷の丘 (Inari Hill)', minRadius: 9, biome: 'SACRED', tile: 'SHRINE', desc: 'A hillside lined with vermillion torii gates.' },
  { name: '水田の里 (Rice Paddy Village)', minRadius: 7, biome: 'RICE', tile: 'RICE', desc: 'Terraced paddies glow green in the sunlight. Frogs sing.' }
];

function checkNewDiscoveries(mapData) {
  const newFinds = [];
  for (const loc of SPECIAL_LOCATIONS) {
    if (mapData.revealedRadius >= loc.minRadius) {
      const alreadyFound = mapData.discoveredLocations.some(d => d.name === loc.name);
      if (!alreadyFound) {
        mapData.discoveredLocations.push({
          name: loc.name,
          desc: loc.desc,
          discoveredDate: todayStr()
        });
        newFinds.push(loc);
      }
    }
  }
  if (newFinds.length > 0) saveData();
  return newFinds;
}

// ===== MAP RENDERING =====
function renderAsciiMap() {
  const mapData = getMapData();
  const expanded = expandMap();
  const discoveries = checkNewDiscoveries(mapData);

  const biomeMap = generateBiomeMap(mapData.worldSeed);
  const cx = MAP_CONFIG.CENTER;
  const cy = MAP_CONFIG.CENTER;
  const radius = mapData.revealedRadius;

  // Determine viewport (what we show)
  const viewRadius = Math.min(radius + 2, 35); // show a bit beyond revealed
  const startX = cx - viewRadius;
  const startY = cy - viewRadius;
  const endX = cx + viewRadius;
  const endY = cy + viewRadius;

  let html = '';

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist > radius + 1) {
        // Beyond revealed area - void
        html += '<span class="map-void"> </span>';
      } else if (dist > radius - 0.5) {
        // Fog edge
        const fog = TERRAIN.FOG;
        html += `<span class="map-fog" title="Unexplored">${fog.char}</span>`;
      } else {
        // Revealed tile
        const tileKey = generateTile(x, y, biomeMap, mapData.worldSeed);
        const tile = TERRAIN[tileKey] || TERRAIN.GRASS;
        const isHouse = (x === cx && y === cy);
        const cls = isHouse ? 'map-tile map-house map-house-clickable' : 'map-tile';
        if (isHouse) {
          html += `<span class="${cls}" style="color:${tile.fg}; cursor:pointer;" title="Click to enter Moe-chan's House!" onclick="enterHouse()">${tile.char}</span>`;
        } else {
          html += `<span class="${cls}" style="color:${tile.fg}" title="${tile.name}">${tile.char}</span>`;
        }
      }
    }
    html += '\n';
  }

  const mapDisplay = document.getElementById('map-display');
  if (mapDisplay) mapDisplay.innerHTML = html;

  // Update stats
  const radiusEl = document.getElementById('map-radius');
  const tilesEl = document.getElementById('map-tiles');
  const locationsEl = document.getElementById('map-locations-count');
  const streakBonusEl = document.getElementById('map-streak-bonus');

  if (radiusEl) radiusEl.textContent = radius;
  if (tilesEl) tilesEl.textContent = mapData.totalTilesRevealed;
  if (locationsEl) locationsEl.textContent = mapData.discoveredLocations.length;

  if (streakBonusEl) {
    let bonus = 0;
    if (data.streak >= 3) bonus++;
    if (data.streak >= 7) bonus++;
    if (data.streak >= 14) bonus++;
    streakBonusEl.textContent = bonus > 0 ? `+${bonus}` : '—';
  }

  // Render discoveries list
  renderDiscoveries(mapData);

  // Show popup for new discoveries
  if (discoveries.length > 0 && expanded) {
    showDiscoveryPopup(discoveries);
  }

  // Update day info
  const dayInfoEl = document.getElementById('map-day-info');
  if (dayInfoEl) {
    const daysSinceStart = Math.floor((new Date(todayStr()) - new Date(mapData.firstGenDate)) / (1000 * 60 * 60 * 24));
    dayInfoEl.textContent = `Day ${daysSinceStart + 1}`;
  }
}

function renderDiscoveries(mapData) {
  const listEl = document.getElementById('map-discoveries-list');
  if (!listEl) return;

  if (mapData.discoveredLocations.length === 0) {
    listEl.innerHTML = '<div class="map-no-discoveries">No locations discovered yet. Keep exploring!</div>';
    return;
  }

  listEl.innerHTML = mapData.discoveredLocations.map(loc => `
    <div class="map-discovery-card glass">
      <div class="map-discovery-name">${loc.name}</div>
      <div class="map-discovery-desc">${loc.desc}</div>
      <div class="map-discovery-date">Found: ${loc.discoveredDate}</div>
    </div>
  `).join('');
}

function showDiscoveryPopup(discoveries) {
  const popup = document.getElementById('map-discovery-popup');
  if (!popup) return;

  const content = discoveries.map(d => `
    <div class="map-popup-discovery">
      <div class="map-popup-name">✦ ${d.name}</div>
      <div class="map-popup-desc">${d.desc}</div>
    </div>
  `).join('');

  document.getElementById('map-popup-content').innerHTML = content;
  popup.style.display = 'flex';
}

function closeMapPopup() {
  const popup = document.getElementById('map-discovery-popup');
  if (popup) popup.style.display = 'none';
}

// ===== MAP LEGEND =====
function renderMapLegend() {
  const legendItems = [
    { char: '@', fg: '#ff3c8e', name: "Moe's House" },
    { char: '.', fg: '#4a8c2a', name: 'Grass' },
    { char: 'T', fg: '#2d7a1e', name: 'Tree' },
    { char: '~', fg: '#4488ff', name: 'Water' },
    { char: '^', fg: '#888888', name: 'Mountain' },
    { char: '⛩', fg: '#ff4444', name: 'Shrine' },
    { char: '▪', fg: '#cc9944', name: 'Building' },
    { char: '#', fg: '#776655', name: 'Ruins' },
    { char: '|', fg: '#55cc55', name: 'Bamboo' },
    { char: '≡', fg: '#88cc44', name: 'Rice' },
    { char: '░', fg: '#334455', name: 'Fog' }
  ];

  const el = document.getElementById('map-legend');
  if (!el) return;

  el.innerHTML = legendItems.map(item =>
    `<span class="map-legend-item"><span style="color:${item.fg}" class="map-legend-char">${item.char}</span>${item.name}</span>`
  ).join('');
}

// ===== INIT =====
function initMap() {
  renderAsciiMap();
  renderMapLegend();
}
