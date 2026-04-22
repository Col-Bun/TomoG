// ===== ECONOMY SYSTEM =====
// Grocery store, weight/energy system, toy shop
// Moe-chan needs to eat food for energy to go on expeditions
// Eating too much without expeditions = weight gain
// Expeditions burn < 1 pound each, so she needs many
// Spend enough on food daily to unlock toy purchases

// ===== FOOD ITEMS (Large variety!) =====
const GROCERY_ITEMS = [
  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎', price: 3, energy: 8, weight: 0.15, category: 'fruit' },
  { id: 'banana', name: 'Banana', emoji: '🍌', price: 2, energy: 6, weight: 0.10, category: 'fruit' },
  { id: 'strawberry', name: 'Strawberries', emoji: '🍓', price: 4, energy: 5, weight: 0.08, category: 'fruit' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', price: 8, energy: 12, weight: 0.20, category: 'fruit' },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', price: 5, energy: 7, weight: 0.12, category: 'fruit' },
  { id: 'peach', name: 'Peach', emoji: '🍑', price: 4, energy: 7, weight: 0.12, category: 'fruit' },
  { id: 'mango', name: 'Mango', emoji: '🥭', price: 6, energy: 10, weight: 0.14, category: 'fruit' },
  { id: 'orange', name: 'Orange', emoji: '🍊', price: 3, energy: 7, weight: 0.11, category: 'fruit' },
  // Vegetables
  { id: 'carrot', name: 'Carrots', emoji: '🥕', price: 2, energy: 5, weight: 0.05, category: 'vegetable' },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', price: 3, energy: 6, weight: 0.04, category: 'vegetable' },
  { id: 'corn', name: 'Corn', emoji: '🌽', price: 3, energy: 8, weight: 0.10, category: 'vegetable' },
  { id: 'potato', name: 'Potato', emoji: '🥔', price: 2, energy: 10, weight: 0.18, category: 'vegetable' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', price: 2, energy: 4, weight: 0.06, category: 'vegetable' },
  { id: 'eggplant', name: 'Eggplant', emoji: '🍆', price: 3, energy: 6, weight: 0.08, category: 'vegetable' },
  { id: 'mushroom', name: 'Mushrooms', emoji: '🍄', price: 4, energy: 5, weight: 0.03, category: 'vegetable' },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', price: 2, energy: 3, weight: 0.02, category: 'vegetable' },
  // Grains & Bread
  { id: 'rice', name: 'Rice Bowl', emoji: '🍚', price: 4, energy: 15, weight: 0.22, category: 'grain' },
  { id: 'bread', name: 'Bread', emoji: '🍞', price: 3, energy: 12, weight: 0.20, category: 'grain' },
  { id: 'onigiri', name: 'Onigiri', emoji: '🍙', price: 5, energy: 14, weight: 0.18, category: 'grain' },
  { id: 'noodles', name: 'Noodles', emoji: '🍜', price: 6, energy: 18, weight: 0.25, category: 'grain' },
  { id: 'pancakes', name: 'Pancakes', emoji: '🥞', price: 5, energy: 16, weight: 0.28, category: 'grain' },
  { id: 'cereal', name: 'Cereal', emoji: '🥣', price: 4, energy: 12, weight: 0.15, category: 'grain' },
  // Protein
  { id: 'egg', name: 'Eggs', emoji: '🥚', price: 3, energy: 10, weight: 0.08, category: 'protein' },
  { id: 'chicken', name: 'Chicken', emoji: '🍗', price: 8, energy: 22, weight: 0.18, category: 'protein' },
  { id: 'fish', name: 'Grilled Fish', emoji: '🐟', price: 7, energy: 18, weight: 0.12, category: 'protein' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣', price: 10, energy: 20, weight: 0.16, category: 'protein' },
  { id: 'steak', name: 'Steak', emoji: '🥩', price: 15, energy: 30, weight: 0.35, category: 'protein' },
  { id: 'tofu', name: 'Tofu', emoji: '🧊', price: 4, energy: 10, weight: 0.06, category: 'protein' },
  { id: 'shrimp', name: 'Shrimp', emoji: '🦐', price: 9, energy: 16, weight: 0.10, category: 'protein' },
  // Dairy
  { id: 'milk', name: 'Milk', emoji: '🥛', price: 3, energy: 8, weight: 0.10, category: 'dairy' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', price: 5, energy: 10, weight: 0.18, category: 'dairy' },
  { id: 'yogurt', name: 'Yogurt', emoji: '🍶', price: 4, energy: 7, weight: 0.08, category: 'dairy' },
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦', price: 6, energy: 10, weight: 0.30, category: 'dairy' },
  // Snacks & Treats
  { id: 'cookie', name: 'Cookies', emoji: '🍪', price: 3, energy: 8, weight: 0.22, category: 'snack' },
  { id: 'cake', name: 'Cake Slice', emoji: '🍰', price: 8, energy: 14, weight: 0.35, category: 'snack' },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', price: 5, energy: 12, weight: 0.28, category: 'snack' },
  { id: 'donut', name: 'Donut', emoji: '🍩', price: 4, energy: 10, weight: 0.30, category: 'snack' },
  { id: 'candy', name: 'Candy', emoji: '🍬', price: 2, energy: 5, weight: 0.20, category: 'snack' },
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿', price: 3, energy: 6, weight: 0.15, category: 'snack' },
  { id: 'dango', name: 'Dango', emoji: '🍡', price: 5, energy: 9, weight: 0.22, category: 'snack' },
  { id: 'taiyaki', name: 'Taiyaki', emoji: '🐠', price: 4, energy: 8, weight: 0.20, category: 'snack' },
  // Drinks
  { id: 'tea', name: 'Green Tea', emoji: '🍵', price: 2, energy: 4, weight: 0.0, category: 'drink' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', price: 3, energy: 5, weight: 0.0, category: 'drink' },
  { id: 'juice', name: 'Juice', emoji: '🧃', price: 3, energy: 6, weight: 0.05, category: 'drink' },
  { id: 'smoothie', name: 'Smoothie', emoji: '🥤', price: 5, energy: 8, weight: 0.08, category: 'drink' },
  { id: 'boba', name: 'Boba Tea', emoji: '🧋', price: 6, energy: 9, weight: 0.12, category: 'drink' },
  // Meals
  { id: 'bento', name: 'Bento Box', emoji: '🍱', price: 12, energy: 28, weight: 0.25, category: 'meal' },
  { id: 'curry', name: 'Curry Rice', emoji: '🍛', price: 10, energy: 25, weight: 0.30, category: 'meal' },
  { id: 'ramen', name: 'Ramen', emoji: '🍜', price: 9, energy: 22, weight: 0.28, category: 'meal' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', price: 8, energy: 20, weight: 0.35, category: 'meal' },
  { id: 'burger', name: 'Burger', emoji: '🍔', price: 9, energy: 22, weight: 0.40, category: 'meal' },
  { id: 'taco', name: 'Tacos', emoji: '🌮', price: 7, energy: 18, weight: 0.25, category: 'meal' },
  { id: 'dumpling', name: 'Dumplings', emoji: '🥟', price: 6, energy: 16, weight: 0.20, category: 'meal' },
  { id: 'hotpot', name: 'Hot Pot', emoji: '🫕', price: 14, energy: 32, weight: 0.30, category: 'meal' },
  { id: 'tempura', name: 'Tempura', emoji: '🍤', price: 10, energy: 20, weight: 0.22, category: 'meal' },
  { id: 'omurice', name: 'Omurice', emoji: '🍳', price: 8, energy: 20, weight: 0.28, category: 'meal' },
];

// ===== TOY ITEMS =====
const TOY_ITEMS = [
  { id: 'plushie_bear', name: 'Bear Plushie', emoji: '🧸', price: 30, desc: 'A soft cuddly bear for Moe-chan' },
  { id: 'plushie_cat', name: 'Cat Plushie', emoji: '🐱', price: 35, desc: 'A cute kitty friend' },
  { id: 'plushie_bunny', name: 'Bunny Plushie', emoji: '🐰', price: 35, desc: 'Floppy ears and all' },
  { id: 'ball', name: 'Bouncy Ball', emoji: '⚽', price: 10, desc: 'Bounces really high!' },
  { id: 'kite', name: 'Kite', emoji: '🪁', price: 20, desc: 'Perfect for windy days' },
  { id: 'puzzle', name: 'Puzzle Box', emoji: '🧩', price: 25, desc: 'A challenging wooden puzzle' },
  { id: 'music_box', name: 'Music Box', emoji: '🎵', price: 40, desc: 'Plays a gentle lullaby' },
  { id: 'telescope', name: 'Mini Telescope', emoji: '🔭', price: 50, desc: 'See the stars up close' },
  { id: 'art_set', name: 'Art Set', emoji: '🎨', price: 35, desc: 'Colors, brushes, and canvas' },
  { id: 'snow_globe', name: 'Snow Globe', emoji: '🔮', price: 45, desc: 'A tiny magical world inside' },
  { id: 'doll', name: 'Kokeshi Doll', emoji: '🎎', price: 40, desc: 'Traditional Japanese wooden doll' },
  { id: 'train', name: 'Toy Train', emoji: '🚂', price: 30, desc: 'Choo choo!' },
  { id: 'figurine', name: 'Chimera Figure', emoji: '🐲', price: 55, desc: 'A detailed figurine of a chimera' },
  { id: 'book', name: 'Picture Book', emoji: '📖', price: 15, desc: 'Beautiful illustrations inside' },
  { id: 'crown', name: 'Princess Crown', emoji: '👑', price: 60, desc: 'A sparkly tiara for Moe-chan' },
  { id: 'ribbon', name: 'Hair Ribbon', emoji: '🎀', price: 12, desc: 'A cute bow for her hair' },
  { id: 'kaleidoscope', name: 'Kaleidoscope', emoji: '🌈', price: 28, desc: 'Infinite beautiful patterns' },
  { id: 'crystal_ball', name: 'Crystal Ball', emoji: '🔮', price: 70, desc: 'See the future... maybe' },
  { id: 'garden_set', name: 'Mini Garden Kit', emoji: '🌱', price: 25, desc: 'Grow tiny plants!' },
  { id: 'lantern', name: 'Paper Lantern', emoji: '🏮', price: 20, desc: 'Glows warm and soft' },
];

const DAILY_FOOD_GOAL = 30; // Must spend 30 MoeBucks on food daily to unlock toys
const WEIGHT_PER_EXPEDITION = 0.6; // Lose 0.6 lbs per expedition (under 1)
const BASE_EXPEDITION_ENERGY_COST = 20; // Energy needed for expedition

function getEconomyData() {
  if (!data.economy) {
    data.economy = {
      energy: 50,        // Current energy
      maxEnergy: 100,    // Max energy
      weight: 120.0,     // Current weight in lbs
      idealWeight: 120.0,// Starting/ideal weight
      foodInventory: {}, // { itemId: count }
      foodEatenToday: [],// Items eaten today
      dailyFoodSpend: 0, // MoeBucks spent on food today
      lastFoodDate: null,
      toyUnlocked: false,// Can buy toys today?
      totalFoodBought: 0,
      expeditionsToday: 0,
      lastExpDate: null
    };
    saveData();
  }
  // Daily reset
  const today = todayStr();
  if (data.economy.lastFoodDate !== today) {
    data.economy.dailyFoodSpend = 0;
    data.economy.foodEatenToday = [];
    data.economy.toyUnlocked = false;
    data.economy.expeditionsToday = 0;
    data.economy.lastFoodDate = today;
    data.economy.lastExpDate = today;
    saveData();
  }
  return data.economy;
}

// ===== GROCERY STORE =====
let groceryFilter = 'all';

function setGroceryFilter(cat) {
  groceryFilter = cat;
  renderGroceryStore();
}

function buyFood(itemId) {
  const sd = getSlotData();
  const eco = getEconomyData();
  const item = GROCERY_ITEMS.find(f => f.id === itemId);
  if (!item) return;

  if (sd.moeBucks < item.price) {
    updateGroceryMessage('Not enough MoeBucks!', '#ff3c8e');
    return;
  }

  sd.moeBucks -= item.price;
  eco.dailyFoodSpend += item.price;
  eco.totalFoodBought++;
  if (!eco.foodInventory[itemId]) eco.foodInventory[itemId] = 0;
  eco.foodInventory[itemId]++;

  // Check if toy unlocked
  if (eco.dailyFoodSpend >= DAILY_FOOD_GOAL && !eco.toyUnlocked) {
    eco.toyUnlocked = true;
    updateGroceryMessage('Toy shop unlocked! You spent enough on food today!', '#a8e84c');
  } else {
    const remaining = DAILY_FOOD_GOAL - eco.dailyFoodSpend;
    if (remaining > 0) {
      updateGroceryMessage(`Bought ${item.name}! Spend ${remaining} more to unlock toys.`, '#ffcc00');
    } else {
      updateGroceryMessage(`Bought ${item.name}!`, '#a8e84c');
    }
  }

  saveData();
  updateSlotMoneyDisplay();
  renderGroceryStore();
  renderFoodInventory();
  renderWeightEnergy();
}

function eatFood(itemId) {
  const eco = getEconomyData();
  if (!eco.foodInventory[itemId] || eco.foodInventory[itemId] <= 0) return;
  const item = GROCERY_ITEMS.find(f => f.id === itemId);
  if (!item) return;

  eco.foodInventory[itemId]--;
  if (eco.foodInventory[itemId] <= 0) delete eco.foodInventory[itemId];

  eco.energy = Math.min(eco.maxEnergy, eco.energy + item.energy);
  eco.weight = Math.round((eco.weight + item.weight) * 100) / 100;
  eco.foodEatenToday.push(itemId);

  saveData();
  renderFoodInventory();
  renderWeightEnergy();
  updateGroceryMessage(`Moe-chan ate ${item.name}! +${item.energy} energy, +${item.weight} lbs`, '#a8e84c');
}

function updateGroceryMessage(msg, color) {
  const el = document.getElementById('grocery-message');
  if (el) {
    el.textContent = msg;
    el.style.color = color || '#fff';
  }
}

function renderGroceryStore() {
  const sd = getSlotData();
  const eco = getEconomyData();
  const container = document.getElementById('grocery-items');
  if (!container) return;

  const categories = ['all', 'fruit', 'vegetable', 'grain', 'protein', 'dairy', 'snack', 'drink', 'meal'];
  const catEmojis = { all: '🛒', fruit: '🍎', vegetable: '🥦', grain: '🍚', protein: '🍗', dairy: '🥛', snack: '🍪', drink: '🍵', meal: '🍱' };

  // Filter buttons
  const filterEl = document.getElementById('grocery-filters');
  if (filterEl) {
    filterEl.innerHTML = categories.map(cat =>
      `<button class="grocery-filter-btn ${groceryFilter === cat ? 'active' : ''}" onclick="setGroceryFilter('${cat}')">${catEmojis[cat] || ''} ${cat}</button>`
    ).join('');
  }

  const filtered = groceryFilter === 'all' ? GROCERY_ITEMS : GROCERY_ITEMS.filter(f => f.category === groceryFilter);

  container.innerHTML = filtered.map(item => `
    <div class="grocery-card glass" onclick="buyFood('${item.id}')">
      <div class="grocery-emoji">${item.emoji}</div>
      <div class="grocery-name">${item.name}</div>
      <div class="grocery-stats">
        <span class="grocery-energy">+${item.energy} E</span>
        <span class="grocery-weight">+${item.weight} lb</span>
      </div>
      <div class="grocery-price">${item.price} MB</div>
    </div>
  `).join('');

  // Daily progress
  const progressEl = document.getElementById('grocery-daily-progress');
  if (progressEl) {
    const pct = Math.min(100, (eco.dailyFoodSpend / DAILY_FOOD_GOAL) * 100);
    progressEl.innerHTML = `
      <div class="grocery-progress-bar">
        <div class="grocery-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="grocery-progress-text">${eco.dailyFoodSpend}/${DAILY_FOOD_GOAL} MB spent on food today ${eco.toyUnlocked ? '(Toys Unlocked!)' : ''}</div>
    `;
  }
}

function renderFoodInventory() {
  const eco = getEconomyData();
  const container = document.getElementById('food-inventory');
  if (!container) return;

  const items = Object.entries(eco.foodInventory).filter(([_, count]) => count > 0);
  if (items.length === 0) {
    container.innerHTML = '<div style="color:rgba(255,255,255,0.4); text-align:center; padding:20px;">No food in inventory. Visit the grocery store!</div>';
    return;
  }

  container.innerHTML = items.map(([id, count]) => {
    const item = GROCERY_ITEMS.find(f => f.id === id);
    if (!item) return '';
    return `
      <div class="food-inv-item glass" onclick="eatFood('${id}')">
        <span class="food-inv-emoji">${item.emoji}</span>
        <span class="food-inv-name">${item.name}</span>
        <span class="food-inv-count">x${count}</span>
        <span class="food-inv-eat">EAT</span>
      </div>
    `;
  }).join('');
}

// ===== WEIGHT & ENERGY =====
function renderWeightEnergy() {
  const eco = getEconomyData();

  const energyBar = document.getElementById('energy-bar-fill');
  const energyText = document.getElementById('energy-text');
  const weightSlider = document.getElementById('weight-display');
  const weightNum = document.getElementById('weight-number');

  if (energyBar) {
    const pct = (eco.energy / eco.maxEnergy) * 100;
    energyBar.style.width = pct + '%';
    energyBar.style.background = pct > 50 ? '#a8e84c' : pct > 25 ? '#ffcc00' : '#ff3c8e';
  }
  if (energyText) energyText.textContent = `${eco.energy} / ${eco.maxEnergy}`;

  if (weightNum) weightNum.textContent = eco.weight.toFixed(1);

  // Weight slider visual
  const weightBar = document.getElementById('weight-bar-fill');
  if (weightBar) {
    // Scale: 100 lbs (thin) to 200 lbs (heavy), ideal at 120
    const minW = 100, maxW = 200;
    const pct = Math.min(100, Math.max(0, ((eco.weight - minW) / (maxW - minW)) * 100));
    weightBar.style.width = pct + '%';
    const diff = Math.abs(eco.weight - eco.idealWeight);
    if (diff < 5) weightBar.style.background = '#a8e84c';
    else if (diff < 15) weightBar.style.background = '#ffcc00';
    else weightBar.style.background = '#ff3c8e';
  }

  // Weight status text
  const weightStatus = document.getElementById('weight-status');
  if (weightStatus) {
    const diff = eco.weight - eco.idealWeight;
    if (diff < 2) weightStatus.textContent = 'Perfect weight!';
    else if (diff < 8) weightStatus.textContent = 'Slightly over... maybe an expedition?';
    else if (diff < 20) weightStatus.textContent = 'Getting heavy! Go on more expeditions!';
    else weightStatus.textContent = 'Very overweight! Expeditions needed ASAP!';
  }

  // Can do expedition?
  const expBtn = document.getElementById('economy-expedition-btn');
  if (expBtn) {
    expBtn.disabled = eco.energy < BASE_EXPEDITION_ENERGY_COST;
    expBtn.textContent = eco.energy < BASE_EXPEDITION_ENERGY_COST
      ? `Need ${BASE_EXPEDITION_ENERGY_COST} energy (eat food!)`
      : `Go on Expedition (-${BASE_EXPEDITION_ENERGY_COST} energy)`;
  }
}

function doEconomyExpedition() {
  const eco = getEconomyData();
  if (eco.energy < BASE_EXPEDITION_ENERGY_COST) {
    updateGroceryMessage('Not enough energy! Eat some food first.', '#ff3c8e');
    return;
  }

  eco.energy -= BASE_EXPEDITION_ENERGY_COST;
  const weightLoss = Math.round((0.3 + Math.random() * 0.5) * 100) / 100; // 0.3-0.8 lbs
  eco.weight = Math.max(100, Math.round((eco.weight - weightLoss) * 100) / 100);
  eco.expeditionsToday++;

  // Small chance to earn MoeBucks from expedition
  const earnedBucks = Math.floor(Math.random() * 8) + 2;
  const sd = getSlotData();
  sd.moeBucks += earnedBucks;

  saveData();
  renderWeightEnergy();
  updateSlotMoneyDisplay();
  updateGroceryMessage(`Expedition complete! Lost ${weightLoss} lbs, earned ${earnedBucks} MB!`, '#a8e84c');
}

// ===== TOY SHOP =====
function renderToyShop() {
  const sd = getSlotData();
  const eco = getEconomyData();
  const container = document.getElementById('toy-shop-items');
  if (!container) return;

  const lockMsg = document.getElementById('toy-lock-message');
  if (lockMsg) {
    if (eco.toyUnlocked) {
      lockMsg.style.display = 'none';
    } else {
      lockMsg.style.display = 'block';
      lockMsg.innerHTML = `Spend ${DAILY_FOOD_GOAL - eco.dailyFoodSpend} more MoeBucks on food today to unlock the toy shop!`;
    }
  }

  container.innerHTML = TOY_ITEMS.map(toy => {
    const owned = (sd.toyCollection || []).includes(toy.id);
    const canBuy = eco.toyUnlocked && sd.moeBucks >= toy.price && !owned;
    return `
      <div class="toy-card glass ${owned ? 'toy-owned' : ''} ${!eco.toyUnlocked ? 'toy-locked' : ''}">
        <div class="toy-emoji">${toy.emoji}</div>
        <div class="toy-name">${toy.name}</div>
        <div class="toy-desc">${toy.desc}</div>
        <div class="toy-price">${owned ? 'OWNED' : toy.price + ' MB'}</div>
        ${!owned ? `<button class="btn-glossy btn-green toy-buy-btn" ${canBuy ? '' : 'disabled'} onclick="buyToy('${toy.id}')">Buy</button>` : ''}
      </div>
    `;
  }).join('');

  // Toy collection count
  const countEl = document.getElementById('toy-collection-count');
  if (countEl) {
    const owned = (sd.toyCollection || []).length;
    countEl.textContent = `${owned}/${TOY_ITEMS.length}`;
  }
}

function buyToy(toyId) {
  const sd = getSlotData();
  const eco = getEconomyData();
  const toy = TOY_ITEMS.find(t => t.id === toyId);
  if (!toy) return;
  if (!eco.toyUnlocked) return;
  if (sd.moeBucks < toy.price) return;
  if (!sd.toyCollection) sd.toyCollection = [];
  if (sd.toyCollection.includes(toyId)) return;

  sd.moeBucks -= toy.price;
  sd.toyCollection.push(toyId);

  saveData();
  updateSlotMoneyDisplay();
  renderToyShop();
  updateGroceryMessage(`Moe-chan got a new toy: ${toy.name}!`, '#a8e84c');
}

// ===== MOE-CHAN AUTO-GROCERY SYSTEM =====
// Moe-chan buys groceries for herself based on various factors:
// - Day of week/month (seasonal preferences)
// - Study minutes logged today
// - Reading hours logged today
// - Number of flashcards/dictionary words added
// - Streak length
// - Current weight (eats lighter if heavy)
// - Current energy (eats more if low)

function moeAutoGrocery() {
  const eco = getEconomyData();
  const sd = getSlotData();
  const today = todayStr();

  // Only auto-buy once per day
  if (eco.lastAutoBuyDate === today) return null;

  // Gather factors
  const td = data.days[today] || { flash: 0, read: 0 };
  const flashMin = td.flash || 0;
  const readHrs = td.read || 0;
  const dictSize = (data.dictionary || []).length;
  const streak = data.streak || 0;
  const dayOfWeek = new Date().getDay();
  const dayOfMonth = new Date().getDate();
  const currentWeight = eco.weight;
  const currentEnergy = eco.energy;
  const isHeavy = (currentWeight - eco.idealWeight) > 10;
  const isLowEnergy = currentEnergy < 30;

  // Determine budget based on factors
  let budget = 15; // Base budget
  budget += Math.floor(flashMin / 5) * 2;    // +2 per 5 min flashcards
  budget += Math.floor(readHrs) * 3;         // +3 per hour reading
  budget += Math.floor(dictSize / 20) * 2;   // +2 per 20 dictionary words
  budget += Math.min(streak, 10) * 1;        // +1 per streak day (cap 10)
  budget += dayOfMonth;                       // Higher later in month (payday feel)

  // Cap at available money, but ensure at least something if she has money
  budget = Math.min(budget, Math.floor(sd.moeBucks * 0.3)); // Never spend more than 30%
  if (budget < 5 && sd.moeBucks >= 10) budget = 5;
  if (sd.moeBucks < 5) {
    eco.lastAutoBuyDate = today;
    saveData();
    return null; // Too broke
  }

  // Build preference weights for food categories based on factors
  const catWeights = {
    fruit: 10,
    vegetable: 8,
    grain: 12,
    protein: 10,
    dairy: 6,
    snack: 8,
    drink: 7,
    meal: 10
  };

  // Adjust by study activity (studied = healthier choices)
  if (flashMin > 20) { catWeights.vegetable += 8; catWeights.fruit += 6; catWeights.snack -= 3; }
  if (readHrs > 1) { catWeights.drink += 6; catWeights.grain += 3; } // Tea/coffee for reading

  // Day of week preferences
  if (dayOfWeek === 0 || dayOfWeek === 6) { catWeights.meal += 8; catWeights.snack += 5; } // Weekend = treats
  if (dayOfWeek === 1) { catWeights.grain += 5; catWeights.drink += 3; } // Monday = comfort food
  if (dayOfWeek === 5) { catWeights.meal += 5; catWeights.snack += 4; } // Friday = celebrations

  // Weight-aware eating
  if (isHeavy) {
    catWeights.vegetable += 10; catWeights.fruit += 8; catWeights.drink += 5;
    catWeights.snack -= 6; catWeights.meal -= 4; catWeights.dairy -= 3;
  }

  // Low energy = hearty meals
  if (isLowEnergy) {
    catWeights.meal += 10; catWeights.protein += 8; catWeights.grain += 5;
  }

  // High streak = Moe-chan celebrates with treats
  if (streak >= 7) { catWeights.snack += 4; catWeights.meal += 3; }

  // Season (month-based)
  const month = new Date().getMonth();
  if (month >= 11 || month <= 1) { catWeights.meal += 5; catWeights.drink += 4; } // Winter: warm food
  if (month >= 3 && month <= 5) { catWeights.fruit += 5; catWeights.drink += 3; } // Spring: fresh
  if (month >= 6 && month <= 8) { catWeights.drink += 6; catWeights.fruit += 4; } // Summer: cold drinks
  if (month >= 9 && month <= 10) { catWeights.grain += 4; catWeights.meal += 3; } // Autumn: hearty

  // Normalize negative weights
  Object.keys(catWeights).forEach(k => { if (catWeights[k] < 1) catWeights[k] = 1; });

  // Shop!
  const purchased = [];
  let spent = 0;
  let attempts = 0;
  const maxAttempts = 30;

  while (spent < budget && attempts < maxAttempts) {
    attempts++;

    // Pick category by weight
    const totalCatWeight = Object.values(catWeights).reduce((a, b) => a + b, 0);
    let catRoll = Math.random() * totalCatWeight;
    let chosenCat = 'grain';
    for (const [cat, w] of Object.entries(catWeights)) {
      catRoll -= w;
      if (catRoll <= 0) { chosenCat = cat; break; }
    }

    // Pick random item from category within budget
    const affordable = GROCERY_ITEMS.filter(f => f.category === chosenCat && f.price <= (budget - spent));
    if (affordable.length === 0) continue;

    const item = affordable[Math.floor(Math.random() * affordable.length)];
    if (sd.moeBucks < item.price) break;

    sd.moeBucks -= item.price;
    spent += item.price;
    eco.dailyFoodSpend += item.price;
    eco.totalFoodBought++;
    if (!eco.foodInventory[item.id]) eco.foodInventory[item.id] = 0;
    eco.foodInventory[item.id]++;
    purchased.push(item);
  }

  // Moe-chan also eats some of what she bought (auto-eat for energy)
  const toEat = purchased.slice(0, Math.min(3, purchased.length));
  toEat.forEach(item => {
    if (eco.foodInventory[item.id] && eco.foodInventory[item.id] > 0) {
      eco.foodInventory[item.id]--;
      if (eco.foodInventory[item.id] <= 0) delete eco.foodInventory[item.id];
      eco.energy = Math.min(eco.maxEnergy, eco.energy + item.energy);
      eco.weight = Math.round((eco.weight + item.weight) * 100) / 100;
      eco.foodEatenToday.push(item.id);
    }
  });

  // Check toy unlock
  if (eco.dailyFoodSpend >= DAILY_FOOD_GOAL) eco.toyUnlocked = true;

  eco.lastAutoBuyDate = today;
  saveData();

  return { purchased, spent, eaten: toEat };
}

function renderAutoGroceryLog() {
  const result = moeAutoGrocery();
  const logEl = document.getElementById('auto-grocery-log');
  if (!logEl) return;

  if (!result || result.purchased.length === 0) {
    logEl.innerHTML = '<div style="color:rgba(255,255,255,0.5); font-style:italic;">Moe-chan hasn\'t gone shopping yet today...</div>';
    return;
  }

  const items = result.purchased.map(i => `${i.emoji} ${i.name}`).join(', ');
  const eaten = result.eaten.map(i => `${i.emoji}`).join(' ');

  logEl.innerHTML = `
    <div class="auto-grocery-card glass" style="padding:12px; border-radius:14px; margin-bottom:8px;">
      <div style="font-weight:800; color:#a8e84c; margin-bottom:4px;">🛍️ Moe-chan went shopping! (-${result.spent} MB)</div>
      <div style="font-size:0.82rem; color:rgba(255,255,255,0.7); line-height:1.5;">Bought: ${items}</div>
      ${result.eaten.length > 0 ? `<div style="font-size:0.82rem; color:#ffcc00; margin-top:4px;">She ate: ${eaten} for energy!</div>` : ''}
    </div>
  `;

  // Refresh displays
  updateSlotMoneyDisplay();
  renderFoodInventory();
  renderWeightEnergy();
  renderGroceryStore();
  renderToyShop();
}

function initEconomy() {
  getEconomyData();
  renderGroceryStore();
  renderFoodInventory();
  renderWeightEnergy();
  renderToyShop();
  renderAutoGroceryLog();
}
