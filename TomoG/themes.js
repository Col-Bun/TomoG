// themes.js — Theme Switcher for Moe-Chan

const THEMES = [
  { id: 'moe',       label: 'Moe-Style',       icon: '🌸', dot: 'linear-gradient(135deg, #ff3c8e, #ff8a00)' },
  { id: 'silver',    label: 'The 25th Ward',    icon: '🔲', dot: 'linear-gradient(135deg, #00e5ff, #ff0066)' },
  { id: 'win98',     label: 'Windows 98',       icon: '🪟', dot: 'linear-gradient(135deg, #008080, #000080)' },
  { id: 'terminal',  label: 'Terminal',          icon: '💻', dot: 'linear-gradient(135deg, #00ff41, #003300)' },
  { id: 'ultrakill', label: 'ULTRAKILL Gothic',  icon: '🩸', dot: 'linear-gradient(135deg, #ff0000, #ffcc00)' }
];

/* ===== JAPANESE WEEKDAY PALETTES FOR ALL THEMES ===== */
// 0: 日 (Sun/Red), 1: 月 (Moon/Purple), 2: 火 (Fire/Orange), 3: 水 (Water/Blue), 4: 木 (Wood/Green), 5: 金 (Gold/Yellow), 6: 土 (Earth/Gray)

const WEEKDAY_PALETTES = {
  moe: {
    light: [
      { bg1: '#ff4757', bg2: '#ff6b81' }, // Sunday (日)
      { bg1: '#70a1ff', bg2: '#5352ed' }, // Monday (月)
      { bg1: '#ff6348', bg2: '#eccc68' }, // Tuesday (火)
      { bg1: '#1e90ff', bg2: '#00a8ff' }, // Wednesday (水)
      { bg1: '#2ed573', bg2: '#7bed9f' }, // Thursday (木)
      { bg1: '#ffa502', bg2: '#ffb142' }, // Friday (金)
      { bg1: '#a4b0be', bg2: '#ced6e0' }  // Saturday (土)
    ],
    dark: [
      { bg1: '#2d0a12', bg2: '#4a1522' }, // Sun - Deep Crimson
      { bg1: '#0e152e', bg2: '#1a224a' }, // Mon - Midnight Blue
      { bg1: '#331308', bg2: '#4f200d' }, // Tue - Rust Orange
      { bg1: '#092140', bg2: '#0f3460' }, // Wed - Oceanic Blue
      { bg1: '#0a2e16', bg2: '#124523' }, // Thu - Forest Green
      { bg1: '#332005', bg2: '#4f340d' }, // Fri - Bronze
      { bg1: '#1e2226', bg2: '#2c3238' }  // Sat - Charcoal Slate
    ]
  },
  silver: [
    { bg1: '#12080a', bg2: '#180a0e' }, // Sun - Slight red tint
    { bg1: '#080812', bg2: '#0a0a18' }, // Mon - Slight purple tint
    { bg1: '#120a08', bg2: '#180d0a' }, // Tue - Slight orange tint
    { bg1: '#080c12', bg2: '#0a1018' }, // Wed - Slight cyan tint
    { bg1: '#08120a', bg2: '#0a180e' }, // Thu - Slight green tint
    { bg1: '#121008', bg2: '#18150a' }, // Fri - Slight gold tint
    { bg1: '#08080e', bg2: '#0e0e18' }  // Sat - Default silver charcoal
  ],
  win98: [
    { bg1: '#800000', bg2: '#800000' }, // Sun - Maroon
    { bg1: '#000080', bg2: '#000080' }, // Mon - Navy
    { bg1: '#804000', bg2: '#804000' }, // Tue - Brown
    { bg1: '#008080', bg2: '#008080' }, // Wed - Teal (Default)
    { bg1: '#008000', bg2: '#008000' }, // Thu - Green
    { bg1: '#808000', bg2: '#808000' }, // Fri - Olive
    { bg1: '#404040', bg2: '#404040' }  // Sat - Dark Gray
  ],
  terminal: [
    { bg1: '#0a0000', bg2: '#050000' }, // Sun
    { bg1: '#00000a', bg2: '#000005' }, // Mon
    { bg1: '#0a0300', bg2: '#050100' }, // Tue
    { bg1: '#00050a', bg2: '#000205' }, // Wed
    { bg1: '#000a00', bg2: '#000500' }, // Thu
    { bg1: '#0a0a00', bg2: '#050500' }, // Fri
    { bg1: '#000000', bg2: '#000000' }  // Sat - Default Black
  ],
  ultrakill: [
    { bg1: '#1a0000', bg2: '#240000' }, // Sun - Pure blood
    { bg1: '#0d001a', bg2: '#140024' }, // Mon - Void purple
    { bg1: '#1a0800', bg2: '#240c00' }, // Tue - Hellfire
    { bg1: '#00081a', bg2: '#000c24' }, // Wed - River Styx
    { bg1: '#081a00', bg2: '#0c2400' }, // Thu - Treachery
    { bg1: '#1a1a00', bg2: '#242400' }, // Fri - Greed
    { bg1: '#0a0000', bg2: '#120000' }  // Sat - Default Gothic
  ]
};

const THEME_KEY = 'studyBuddyTheme_v2';

function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  document.body.classList.add('theme-' + themeId);
  localStorage.setItem(THEME_KEY, themeId);
  
  const labelEl = document.getElementById('theme-picker-label');
  if(labelEl) {
    const tData = THEMES.find(t => t.id === themeId);
    labelEl.innerHTML = tData.icon + ' ' + tData.label;
    
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeId);
    });
  }
  
  refreshThemeColors();
}

function refreshThemeColors() {
  const themeId = localStorage.getItem(THEME_KEY) || 'moe';
  const day = new Date().getDay();
  const isDark = document.body.classList.contains('dark-mode');
  
  let vars;
  if (themeId === 'moe') {
    vars = isDark ? WEEKDAY_PALETTES.moe.dark[day] : WEEKDAY_PALETTES.moe.light[day];
  } else {
    vars = WEEKDAY_PALETTES[themeId][day];
  }
  
  // Set on BODY so it overrides the standard class/root CSS declarations
  document.body.style.setProperty('--metro-bg1', vars.bg1);
  document.body.style.setProperty('--metro-bg2', vars.bg2);
}

// Hook into the main app's dark mode toggle to instantly swap colors
const originalToggleTheme = window.toggleTheme;
window.toggleTheme = function() {
  if (typeof originalToggleTheme === 'function') {
    originalToggleTheme();
  } else {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  }
  refreshThemeColors(); // Instantly apply the light/dark palette!
};

function toggleThemeDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('theme-dropdown');
  if (dd) dd.classList.toggle('open');
}

function closeThemeDropdown() {
  const dd = document.getElementById('theme-dropdown');
  if (dd) dd.classList.remove('open');
}

document.addEventListener('click', function(e) {
  const dd = document.getElementById('theme-dropdown');
  if (dd && dd.classList.contains('open') && !e.target.closest('.theme-picker-wrap')) {
    closeThemeDropdown();
  }
});

function initThemeSystem() {
  const topControls = document.querySelector('.top-controls');
  if (!topControls) return;

  if (document.querySelector('.theme-picker-wrap')) return;

  const savedTheme = localStorage.getItem(THEME_KEY) || 'moe';
  const current = THEMES.find(t => t.id === savedTheme) || THEMES[0];
  
  const wrap = document.createElement('div');
  wrap.className = 'theme-picker-wrap';
  wrap.innerHTML = `
    <button class="theme-picker-btn" onclick="toggleThemeDropdown(event)">
      <span id="theme-picker-label">${current.icon} ${current.label}</span> ▾
    </button>
    <div class="theme-dropdown" id="theme-dropdown">
      ${THEMES.map(t => `
        <button class="theme-option ${t.id === savedTheme ? 'active' : ''}" data-theme="${t.id}" onclick="applyTheme('${t.id}'); closeThemeDropdown();">
          <span class="theme-option-dot" style="background:${t.dot}"></span>
          ${t.icon} ${t.label}
        </button>
      `).join('')}
    </div>
  `;
  
  topControls.insertBefore(wrap, topControls.firstChild);
  applyTheme(savedTheme);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeSystem);
} else {
  initThemeSystem();
}

// Early apply script to run immediately when JS loads (prevents white flashing)
(function() {
  var savedTheme = localStorage.getItem('studyBuddyTheme_v2') || 'moe';
  var isDark = localStorage.getItem('studyBuddyTheme') === 'dark';
  var day = new Date().getDay();
  
  document.body.classList.add('theme-' + savedTheme);
  
  // Lightweight duplicate of palettes for instant load
  var colors = {
    moe_light: ['#ff4757','#70a1ff','#ff6348','#1e90ff','#2ed573','#ffa502','#a4b0be'],
    moe_dark:  ['#2d0a12','#0e152e','#331308','#092140','#0a2e16','#332005','#1e2226'],
    silver:    ['#12080a','#080812','#120a08','#080c12','#08120a','#121008','#08080e'],
    win98:     ['#800000','#000080','#804000','#008080','#008000','#808000','#404040'],
    terminal:  ['#0a0000','#00000a','#0a0300','#00050a','#000a00','#0a0a00','#000000'],
    ultrakill: ['#1a0000','#0d001a','#1a0800','#00081a','#081a00','#1a1a00','#0a0000']
  };
  
  var paletteKey = savedTheme === 'moe' ? (isDark ? 'moe_dark' : 'moe_light') : savedTheme;
  var c1 = colors[paletteKey] ? colors[paletteKey][day] : null;
  
  if(c1) {
    document.body.style.setProperty('--metro-bg1', c1);
    document.body.style.setProperty('--metro-bg2', c1); 
  }
})();
