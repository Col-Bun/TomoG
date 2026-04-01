// themes.js — Theme Switcher for Moe-Chan

const THEMES = [
  { id: 'moe',       label: 'Moe-Style',       icon: '🌸', dot: 'linear-gradient(135deg, #ff3c8e, #ff8a00)' },
  { id: 'silver',    label: 'The 25th Ward',    icon: '🔲', dot: 'linear-gradient(135deg, #00e5ff, #ff0066)' },
  { id: 'win98',     label: 'Windows 98',       icon: '🪟', dot: 'linear-gradient(135deg, #008080, #000080)' },
  { id: 'terminal',  label: 'Terminal',          icon: '💻', dot: 'linear-gradient(135deg, #00ff41, #003300)' },
  { id: 'ultrakill', label: 'ULTRAKILL Gothic',  icon: '🩸', dot: 'linear-gradient(135deg, #ff0000, #ffcc00)' }
];

// Theme-specific CSS variable overrides — kills the inline vars from setDailyTheme
const THEME_VARS = {
  silver:    { bg1: '#08080e', bg2: '#0e0e18' },
  win98:     { bg1: '#008080', bg2: '#008080' },
  terminal:  { bg1: '#000000', bg2: '#000000' },
  ultrakill: { bg1: '#0a0000', bg2: '#120000' }
};

const THEME_KEY = 'studyBuddyTheme_v2';

function applyTheme(themeId) {
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  document.body.classList.add('theme-' + themeId);

  if (themeId === 'moe') {
    if (typeof setDailyTheme === 'function') setDailyTheme();
  } else {
    const vars = THEME_VARS[themeId];
    if (vars) {
      document.documentElement.style.setProperty('--metro-bg1', vars.bg1);
      document.documentElement.style.setProperty('--metro-bg2', vars.bg2);
    }
  }

  localStorage.setItem(THEME_KEY, themeId);
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === themeId);
  });
  const current = THEMES.find(t => t.id === themeId);
  const btn = document.getElementById('theme-picker-label');
  if (btn && current) btn.textContent = current.icon + ' ' + current.label;
}

function toggleThemeDropdown(e) {
  e.stopPropagation();
  document.getElementById('theme-dropdown').classList.toggle('open');
  setTimeout(() => document.addEventListener('click', closeThemeDropdown, { once: true }), 0);
}
function closeThemeDropdown() {
  var dd = document.getElementById('theme-dropdown');
  if (dd) dd.classList.remove('open');
}

function initThemeSystem() {
  const topControls = document.querySelector('.top-controls');
  if (!topControls) return;
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

// Early apply to prevent flash
(function() {
  var saved = localStorage.getItem('studyBuddyTheme_v2');
  if (saved && saved !== 'moe') {
    document.body.classList.add('theme-' + saved);
    var v = { silver: ['#08080e','#0e0e18'], win98: ['#008080','#008080'], terminal: ['#000','#000'], ultrakill: ['#0a0000','#120000'] };
    if (v[saved]) {
      document.documentElement.style.setProperty('--metro-bg1', v[saved][0]);
      document.documentElement.style.setProperty('--metro-bg2', v[saved][1]);
    }
  }
})();
