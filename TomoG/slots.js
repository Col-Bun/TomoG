// ===== SLOT MACHINE SYSTEM =====
// ASCII-style slot machine with 3 switchable themes: Cute/Moe, Classic Casino, Japanese
// Earns money (moeBucks) for Moe-chan's account

const SLOT_THEMES = {
  cute: {
    name: 'Cute',
    symbols: [
      { char: '♥', name: 'Heart', value: 2, color: '#ff3c8e' },
      { char: '★', name: 'Star', value: 3, color: '#ffcc00' },
      { char: '♪', name: 'Note', value: 2, color: '#8b5cf6' },
      { char: '✿', name: 'Flower', value: 4, color: '#ff8ec4' },
      { char: '◕', name: 'Moe Face', value: 5, color: '#ff3c8e' },
      { char: '☆', name: 'Sparkle', value: 1, color: '#a8e84c' },
      { char: '♦', name: 'Diamond', value: 6, color: '#00e5ff' },
      { char: '❤', name: 'Big Heart', value: 10, color: '#ff1e78' },
    ]
  },
  casino: {
    name: 'Casino',
    symbols: [
      { char: '7', name: 'Seven', value: 7, color: '#ff4444' },
      { char: '$', name: 'Dollar', value: 5, color: '#a8e84c' },
      { char: '#', name: 'Bar', value: 3, color: '#ffcc00' },
      { char: '&', name: 'Bell', value: 4, color: '#ffa502' },
      { char: '%', name: 'Cherry', value: 2, color: '#ff3c8e' },
      { char: '@', name: 'Diamond', value: 6, color: '#00e5ff' },
      { char: '!', name: 'Lucky', value: 8, color: '#8b5cf6' },
      { char: 'X', name: 'Jackpot', value: 15, color: '#FFD700' },
    ]
  },
  japanese: {
    name: 'Japanese',
    symbols: [
      { char: '寿', name: 'Sushi', value: 3, color: '#ff6347' },
      { char: '福', name: 'Fortune', value: 5, color: '#ff3c8e' },
      { char: '猫', name: 'Neko', value: 4, color: '#ffa502' },
      { char: '桜', name: 'Sakura', value: 4, color: '#ff8ec4' },
      { char: '鯛', name: 'Tai Fish', value: 3, color: '#4488ff' },
      { char: '達', name: 'Daruma', value: 6, color: '#ff4444' },
      { char: '龍', name: 'Dragon', value: 8, color: '#a8e84c' },
      { char: '神', name: 'Kami', value: 12, color: '#FFD700' },
    ]
  }
};

let currentSlotTheme = 'cute';
let slotSpinning = false;
let slotReels = [0, 0, 0]; // Current symbol indices
let slotAnimFrames = [null, null, null];

function getSlotData() {
  if (!data.slotMachine) {
    data.slotMachine = {
      moeBucks: 100, // Starting money
      totalWon: 0,
      totalSpent: 0,
      totalSpins: 0,
      jackpots: 0,
      dailySpins: 0,
      lastSpinDate: null,
      toyCollection: [],
      dailyFoodSpent: 0,
      lastFoodDate: null
    };
    saveData();
  }
  return data.slotMachine;
}

function switchSlotTheme() {
  const themes = ['cute', 'casino', 'japanese'];
  const idx = themes.indexOf(currentSlotTheme);
  currentSlotTheme = themes[(idx + 1) % themes.length];
  renderSlotMachine();
}

function getSpinCost() {
  return 5; // 5 moeBucks per spin
}

function spinSlots() {
  if (slotSpinning) return;
  const sd = getSlotData();
  const cost = getSpinCost();

  if (sd.moeBucks < cost) {
    updateSlotMessage('Not enough MoeBucks! Win some on expeditions or wait for daily bonus.', '#ff3c8e');
    return;
  }

  slotSpinning = true;
  sd.moeBucks -= cost;
  sd.totalSpent += cost;
  sd.totalSpins++;

  const today = todayStr();
  if (sd.lastSpinDate !== today) {
    sd.dailySpins = 0;
    sd.lastSpinDate = today;
  }
  sd.dailySpins++;
  saveData();
  updateSlotMoneyDisplay();

  const theme = SLOT_THEMES[currentSlotTheme];
  const symbols = theme.symbols;

  // Determine final results
  const results = [
    Math.floor(Math.random() * symbols.length),
    Math.floor(Math.random() * symbols.length),
    Math.floor(Math.random() * symbols.length)
  ];

  // Animate each reel with staggered stops
  const reelEls = [
    document.getElementById('slot-reel-0'),
    document.getElementById('slot-reel-1'),
    document.getElementById('slot-reel-2')
  ];

  let reelsStopped = 0;

  for (let i = 0; i < 3; i++) {
    let frame = 0;
    const stopFrame = 15 + (i * 8); // Stagger: reel 0 stops first
    const el = reelEls[i];

    slotAnimFrames[i] = setInterval(() => {
      frame++;
      const randIdx = Math.floor(Math.random() * symbols.length);
      const sym = symbols[randIdx];
      if (el) {
        el.innerHTML = `<span style="color:${sym.color}">${sym.char}</span>`;
        el.classList.add('slot-reel-spinning');
      }

      if (frame >= stopFrame) {
        clearInterval(slotAnimFrames[i]);
        slotReels[i] = results[i];
        const finalSym = symbols[results[i]];
        if (el) {
          el.innerHTML = `<span style="color:${finalSym.color}">${finalSym.char}</span>`;
          el.classList.remove('slot-reel-spinning');
          el.classList.add('slot-reel-stop');
          setTimeout(() => el.classList.remove('slot-reel-stop'), 300);
        }

        reelsStopped++;
        if (reelsStopped === 3) {
          resolveSpinResult(results);
        }
      }
    }, 60);
  }
}

function resolveSpinResult(results) {
  slotSpinning = false;
  const theme = SLOT_THEMES[currentSlotTheme];
  const symbols = theme.symbols;
  const sd = getSlotData();

  const s0 = symbols[results[0]];
  const s1 = symbols[results[1]];
  const s2 = symbols[results[2]];

  let winnings = 0;
  let message = '';

  // Three of a kind - JACKPOT
  if (results[0] === results[1] && results[1] === results[2]) {
    winnings = s0.value * 10;
    message = `JACKPOT! Three ${s0.name}s! +${winnings} MoeBucks!`;
    sd.jackpots++;
    triggerSlotCelebration();
  }
  // Two of a kind
  else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
    let matchSym;
    if (results[0] === results[1]) matchSym = s0;
    else if (results[1] === results[2]) matchSym = s1;
    else matchSym = s0;
    winnings = matchSym.value * 3;
    message = `Two ${matchSym.name}s! +${winnings} MoeBucks!`;
  }
  // All different - check for adjacent values
  else {
    const vals = [s0.value, s1.value, s2.value].sort((a, b) => a - b);
    if (vals[2] - vals[0] <= 2) {
      winnings = Math.floor((s0.value + s1.value + s2.value) / 2);
      message = `Near match! +${winnings} MoeBucks`;
    } else {
      message = 'No match... try again!';
    }
  }

  if (winnings > 0) {
    sd.moeBucks += winnings;
    sd.totalWon += winnings;
  }

  saveData();
  updateSlotMoneyDisplay();
  updateSlotMessage(message, winnings > 0 ? '#a8e84c' : '#ff3c8e');
  renderSlotStats();
}

function triggerSlotCelebration() {
  const container = document.getElementById('slot-celebration');
  if (!container) return;
  container.innerHTML = '';
  const chars = ['★', '♥', '✿', '♪', '☆', '✦', '◆', '❤'];
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.className = 'slot-confetti';
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.style.left = Math.random() * 100 + '%';
    span.style.animationDelay = (Math.random() * 0.5) + 's';
    span.style.color = ['#ff3c8e', '#ffcc00', '#a8e84c', '#8b5cf6', '#00e5ff'][Math.floor(Math.random() * 5)];
    container.appendChild(span);
  }
  setTimeout(() => { container.innerHTML = ''; }, 2500);
}

function updateSlotMessage(msg, color) {
  const el = document.getElementById('slot-message');
  if (el) {
    el.textContent = msg;
    el.style.color = color || '#fff';
  }
}

function updateSlotMoneyDisplay() {
  const sd = getSlotData();
  const el = document.getElementById('slot-money');
  if (el) el.textContent = sd.moeBucks;
  const globalEl = document.getElementById('moe-bucks-display');
  if (globalEl) globalEl.textContent = sd.moeBucks;
}

function renderSlotStats() {
  const sd = getSlotData();
  const el = document.getElementById('slot-stats');
  if (!el) return;
  el.innerHTML = `
    <span>Spins: ${sd.totalSpins}</span>
    <span>Won: ${sd.totalWon}</span>
    <span>Spent: ${sd.totalSpent}</span>
    <span>Jackpots: ${sd.jackpots}</span>
  `;
}

function renderSlotMachine() {
  const theme = SLOT_THEMES[currentSlotTheme];
  const symbols = theme.symbols;
  const sd = getSlotData();

  // Build ASCII machine frame
  const reels = [0, 1, 2].map(i => {
    const sym = symbols[slotReels[i] % symbols.length];
    return `<span style="color:${sym.color}">${sym.char}</span>`;
  });

  const machineEl = document.getElementById('slot-machine-display');
  if (!machineEl) return;

  machineEl.innerHTML = `
<pre class="slot-ascii-frame">
+========================+
|   MOE-CHAN'S  SLOTS    |
|  ╔══════════════════╗  |
|  ║  Theme: ${(theme.name + '       ').slice(0, 9)} ║  |
|  ╚══════════════════╝  |
|                        |
|  ┌──────┬──────┬──────┐|
|  │      │      │      │|
|  │  <span id="slot-reel-0">${reels[0]}</span>   │  <span id="slot-reel-1">${reels[1]}</span>   │  <span id="slot-reel-2">${reels[2]}</span>   │|
|  │      │      │      │|
|  └──────┴──────┴──────┘|
|                        |
|  Cost: ${getSpinCost()} MoeBucks       |
+========================+
</pre>`;

  updateSlotMoneyDisplay();
  renderSlotStats();
}

function addDailyBonus() {
  const sd = getSlotData();
  const today = todayStr();
  if (!sd.lastBonusDate || sd.lastBonusDate !== today) {
    sd.moeBucks += 25;
    sd.lastBonusDate = today;
    saveData();
    updateSlotMoneyDisplay();
    updateSlotMessage('Daily bonus: +25 MoeBucks!', '#a8e84c');
  }
}

function initSlots() {
  getSlotData();
  addDailyBonus();
  renderSlotMachine();
}
