// themes.js — Theme Switcher for Moe-Chan

const THEMES = [
  { id: 'moe',       label: 'Moe-Style',       icon: '🌸', dot: 'linear-gradient(135deg, #ff3c8e, #ff8a00)' },
  { id: 'silver',    label: 'Silver Case',      icon: '🔲', dot: 'linear-gradient(135deg, #00ff41, #005500)' },
  { id: 'win98',     label: 'Windows 98',       icon: '🪟', dot: 'linear-gradient(135deg, #008080, #000080)' },
  { id: 'terminal',  label: 'Terminal',          icon: '💻', dot: 'linear-gradient(135deg, #00ff41, #003300)' },
  { id: 'ultrakill', label: 'ULTRAKILL Gothic',  icon: '🩸', dot: 'linear-gradient(135deg, #ff0000, #ffcc00)' }
];

const THEME_KEY = 'studyBuddyTheme_v2';

// ===== APPLY =====
function applyTheme(themeId) {
  // Remove all theme classes
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));

  // Add the new one
  document.body.classList.add('theme-' + themeId);

  // For Moe (default), also re-apply daily color theme
  if (themeId === 'moe' && typeof setDailyTheme === 'function') {
    setDailyTheme();
  }

  // Persist
  localStorage.setItem(THEME_KEY, themeId);

  // Update dropdown UI
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === themeId);
  });

  // Update picker button text
  const current = THEMES.find(t => t.id === themeId);
  const btn = document.getElementById('theme-picker-label');
  if (btn && current) btn.textContent = current.icon + ' ' + current.label;
}

// ===== DROPDOWN TOGGLE =====
function toggleThemeDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('theme-dropdown');
  dropdown.classList.toggle('open');

  // Close on outside click
  if (dropdown.classList.contains('open')) {
    setTimeout(() => {
      document.addEventListener('click', closeThemeDropdown, { once: true });
    }, 0);
  }
}

function closeThemeDropdown() {
  document.getElementById('theme-dropdown').classList.remove('open');
}

// ===== BUILD UI =====
function initThemeSystem() {
  const topControls = document.querySelector('.top-controls');
  if (!topControls) return;

  // Create picker
  const wrap = document.createElement('div');
  wrap.className = 'theme-picker-wrap';

  const savedTheme = localStorage.getItem(THEME_KEY) || 'moe';
  const current = THEMES.find(t => t.id === savedTheme) || THEMES[0];

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

  // Insert before the dark mode button
  topControls.insertBefore(wrap, topControls.firstChild);

  // Apply saved theme immediately
  applyTheme(savedTheme);
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeSystem);
} else {
  initThemeSystem();
}

// Also apply early to prevent flash (runs before DOM is fully ready)
(function() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved && saved !== 'moe') {
    document.body.classList.add('theme-' + saved);
  }
})();
