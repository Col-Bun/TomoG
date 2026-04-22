// ===== POMODORO TIMER =====
// Moe-chan's Pomodoro timer with customizable work/break times
// Integrates with MoeBucks economy and study tracking

function getPomodoroData() {
  if (!data.pomodoro) {
    data.pomodoro = {
      totalSessions: 0,
      totalWorkMinutes: 0,
      totalBreakMinutes: 0,
      todaysSessions: 0,
      todaysDate: null,
      longestStreak: 0,
      currentStreak: 0,
      workDuration: 25,      // minutes
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,  // long break after every N sessions
      autoStartBreak: true,
      autoStartWork: false,
      soundEnabled: true,
    };
    saveData();
  }
  // Reset daily counter
  if (data.pomodoro.todaysDate !== todayStr()) {
    data.pomodoro.todaysSessions = 0;
    data.pomodoro.todaysDate = todayStr();
  }
  return data.pomodoro;
}

// ===== TIMER STATE =====
let pomState = {
  running: false,
  paused: false,
  mode: 'work',         // 'work', 'shortBreak', 'longBreak'
  timeLeft: 0,           // seconds
  totalTime: 0,          // seconds (for progress calc)
  interval: null,
  sessionsInCycle: 0,    // sessions completed in current cycle
};

const POM_MODES = {
  work:       { label: 'Focus Time',   color: '#ff4757', emoji: '🔥', bgClass: 'pom-work' },
  shortBreak: { label: 'Short Break',  color: '#7bed9f', emoji: '☕', bgClass: 'pom-break' },
  longBreak:  { label: 'Long Break',   color: '#70a1ff', emoji: '🌴', bgClass: 'pom-long-break' },
};

const MOE_WORK_PHRASES = [
  'Ganbare! You can do it! 💪',
  'Focus, focus~! ✨',
  'Moe-chan believes in you! 🌟',
  'Keep going, you\'re amazing! 🔥',
  'Study hard, play hard! 📚',
  'Almost there~! がんばって！',
  'You\'re doing great! すごい！',
];

const MOE_BREAK_PHRASES = [
  'Good job! Take a rest~ ☕',
  'Stretch those legs! 🧘',
  'Hydrate! Drink some water! 💧',
  'You earned this break~ 🌸',
  'おつかれさま！ Good work! 🎉',
  'Relax~ the next round awaits! 🌙',
  'Close your eyes for a moment~ 😌',
];

const MOE_COMPLETE_PHRASES = [
  'AMAZING! Full cycle complete!! 🏆',
  'You\'re a study machine!! ⚡',
  'Moe-chan is SO proud!! 🥰',
  'Legend status achieved!! 🌟',
];

// ===== TIMER CONTROLS =====
function startPomodoro() {
  const pd = getPomodoroData();

  if (pomState.paused) {
    // Resume
    pomState.paused = false;
    pomState.running = true;
    pomState.interval = setInterval(pomodoroTick, 1000);
    renderPomodoroTimer();
    return;
  }

  // Start new session
  pomState.mode = 'work';
  pomState.timeLeft = pd.workDuration * 60;
  pomState.totalTime = pd.workDuration * 60;
  pomState.running = true;
  pomState.paused = false;

  pomState.interval = setInterval(pomodoroTick, 1000);
  renderPomodoroTimer();
}

function pausePomodoro() {
  if (!pomState.running) return;
  pomState.paused = true;
  pomState.running = false;
  if (pomState.interval) clearInterval(pomState.interval);
  renderPomodoroTimer();
}

function resetPomodoro() {
  if (pomState.interval) clearInterval(pomState.interval);
  pomState.running = false;
  pomState.paused = false;
  pomState.mode = 'work';
  const pd = getPomodoroData();
  pomState.timeLeft = pd.workDuration * 60;
  pomState.totalTime = pd.workDuration * 60;
  renderPomodoroTimer();
}

function skipPomodoro() {
  if (pomState.interval) clearInterval(pomState.interval);
  pomState.running = false;
  pomState.paused = false;

  if (pomState.mode === 'work') {
    // Skipping work doesn't count as completed
    transitionToBreak();
  } else {
    // Skipping break, go back to work
    transitionToWork();
  }
}

function pomodoroTick() {
  if (!pomState.running) return;

  pomState.timeLeft--;

  if (pomState.timeLeft <= 0) {
    clearInterval(pomState.interval);
    pomState.running = false;

    if (pomState.mode === 'work') {
      completeWorkSession();
    } else {
      completeBreakSession();
    }
    return;
  }

  updatePomodoroDisplay();
}

function completeWorkSession() {
  const pd = getPomodoroData();

  // Track stats
  pd.totalSessions++;
  pd.totalWorkMinutes += pd.workDuration;
  pd.todaysSessions++;
  pd.currentStreak++;
  if (pd.currentStreak > pd.longestStreak) pd.longestStreak = pd.currentStreak;
  pomState.sessionsInCycle++;

  // Award MoeBucks: 5 MB per completed pomodoro
  if (typeof getSlotData === 'function') {
    const sd = getSlotData();
    sd.moeBucks += 5;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  }

  // Play sound
  if (pd.soundEnabled) playPomSound('complete');

  saveData();

  // Summon a cat for the cat tab
  if (typeof onPomodoroWorkComplete === 'function') {
    onPomodoroWorkComplete();
  }

  // Show completion notification
  const phrase = MOE_BREAK_PHRASES[Math.floor(Math.random() * MOE_BREAK_PHRASES.length)];
  showPomNotification(phrase, 'break');

  // Auto-transition or wait
  if (pd.autoStartBreak) {
    setTimeout(() => transitionToBreak(), 1500);
  } else {
    pomState.mode = 'done';
    renderPomodoroTimer();
  }
}

function completeBreakSession() {
  const pd = getPomodoroData();
  const breakMins = pomState.mode === 'longBreak' ? pd.longBreakDuration : pd.shortBreakDuration;
  pd.totalBreakMinutes += breakMins;

  if (pd.soundEnabled) playPomSound('break_end');

  saveData();

  // Award Pomodoro Token (work + break = 1 🎫) — hook lives in catpark.js
  if (typeof onPomodoroBreakComplete === 'function') {
    try { onPomodoroBreakComplete(); } catch (e) { console.warn('pomodoro break hook:', e); }
  }

  const phrase = MOE_WORK_PHRASES[Math.floor(Math.random() * MOE_WORK_PHRASES.length)];
  showPomNotification(phrase, 'work');

  if (pd.autoStartWork) {
    setTimeout(() => transitionToWork(), 1500);
  } else {
    pomState.mode = 'done';
    renderPomodoroTimer();
  }
}

function transitionToBreak() {
  const pd = getPomodoroData();

  if (pomState.sessionsInCycle >= pd.longBreakInterval) {
    pomState.mode = 'longBreak';
    pomState.timeLeft = pd.longBreakDuration * 60;
    pomState.totalTime = pd.longBreakDuration * 60;
    pomState.sessionsInCycle = 0;

    const phrase = MOE_COMPLETE_PHRASES[Math.floor(Math.random() * MOE_COMPLETE_PHRASES.length)];
    showPomNotification(phrase, 'complete');

    // Bonus MB for completing a full cycle
    if (typeof getSlotData === 'function') {
      const sd = getSlotData();
      sd.moeBucks += 10;
      if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
    }
    saveData();
  } else {
    pomState.mode = 'shortBreak';
    pomState.timeLeft = pd.shortBreakDuration * 60;
    pomState.totalTime = pd.shortBreakDuration * 60;
  }

  pomState.running = true;
  pomState.paused = false;
  pomState.interval = setInterval(pomodoroTick, 1000);
  renderPomodoroTimer();
}

function transitionToWork() {
  const pd = getPomodoroData();
  pomState.mode = 'work';
  pomState.timeLeft = pd.workDuration * 60;
  pomState.totalTime = pd.workDuration * 60;
  pomState.running = true;
  pomState.paused = false;
  pomState.interval = setInterval(pomodoroTick, 1000);
  renderPomodoroTimer();
}

// ===== SOUND =====
function playPomSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'complete') {
      // Happy ascending chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);      // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);  // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'break_end') {
      // Gentle double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // Single tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) { /* AudioContext not available */ }
}

// ===== NOTIFICATION OVERLAY =====
function showPomNotification(text, type) {
  const el = document.getElementById('pom-notification');
  if (!el) return;
  const colors = { work: '#ff4757', break: '#7bed9f', complete: '#ffd700' };
  el.innerHTML = `<div class="pom-notif-inner" style="border-color:${colors[type] || '#fff'}44;">${text}</div>`;
  el.style.display = 'flex';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ===== DISPLAY =====
function formatPomTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updatePomodoroDisplay() {
  const timeEl = document.getElementById('pom-time');
  if (timeEl) timeEl.textContent = formatPomTime(pomState.timeLeft);

  const progressEl = document.getElementById('pom-progress-fill');
  if (progressEl && pomState.totalTime > 0) {
    const pct = ((pomState.totalTime - pomState.timeLeft) / pomState.totalTime) * 100;
    progressEl.style.width = pct + '%';
  }

  // Update ring
  const ringEl = document.getElementById('pom-ring-progress');
  if (ringEl && pomState.totalTime > 0) {
    const pct = pomState.timeLeft / pomState.totalTime;
    const circumference = 2 * Math.PI * 120; // r=120
    ringEl.style.strokeDasharray = circumference;
    ringEl.style.strokeDashoffset = circumference * (1 - pct);
  }
}

function renderPomodoroTimer() {
  const container = document.getElementById('pom-main');
  if (!container) return;
  const pd = getPomodoroData();
  const modeInfo = POM_MODES[pomState.mode] || POM_MODES.work;
  const isActive = pomState.running || pomState.paused;
  const isDone = pomState.mode === 'done';

  // Session dots
  const dotsHtml = Array.from({ length: pd.longBreakInterval }, (_, i) =>
    `<span class="pom-dot ${i < pomState.sessionsInCycle ? 'pom-dot-filled' : ''}" style="background:${i < pomState.sessionsInCycle ? modeInfo.color : 'rgba(255,255,255,0.15)'}"></span>`
  ).join('');

  // Random phrase
  const phrases = pomState.mode === 'work' ? MOE_WORK_PHRASES : MOE_BREAK_PHRASES;
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];

  // Ring SVG
  const circumference = 2 * Math.PI * 120;
  const pct = pomState.totalTime > 0 ? pomState.timeLeft / pomState.totalTime : 1;

  // Controls
  let controlsHtml = '';
  if (isDone) {
    controlsHtml = `
      <button class="btn-glossy btn-green pom-ctrl-btn" onclick="startPomodoro()">▶ Start Next</button>
      <button class="btn-glossy pom-ctrl-btn" onclick="resetPomodoro()" style="background:rgba(255,255,255,0.15);">↺ Reset</button>
    `;
  } else if (pomState.running) {
    controlsHtml = `
      <button class="btn-glossy pom-ctrl-btn" onclick="pausePomodoro()" style="background:linear-gradient(180deg,#ffa502,#e06500);">⏸ Pause</button>
      <button class="btn-glossy pom-ctrl-btn" onclick="skipPomodoro()" style="background:rgba(255,255,255,0.15);">⏭ Skip</button>
    `;
  } else if (pomState.paused) {
    controlsHtml = `
      <button class="btn-glossy btn-green pom-ctrl-btn" onclick="startPomodoro()">▶ Resume</button>
      <button class="btn-glossy pom-ctrl-btn" onclick="resetPomodoro()" style="background:rgba(255,255,255,0.15);">↺ Reset</button>
    `;
  } else {
    controlsHtml = `
      <button class="btn-glossy btn-green pom-ctrl-btn" onclick="startPomodoro()">▶ Start Focus</button>
    `;
  }

  container.innerHTML = `
    <div class="pom-timer-section">
      <div class="pom-mode-label" style="color:${modeInfo.color};">${modeInfo.emoji} ${isDone ? 'Session Complete!' : modeInfo.label}</div>
      <div class="pom-phrase">${isDone ? 'Ready for the next round?' : phrase}</div>

      <div class="pom-ring-wrap">
        <svg class="pom-ring-svg" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
          <circle id="pom-ring-progress" cx="130" cy="130" r="120" fill="none"
            stroke="${modeInfo.color}" stroke-width="8" stroke-linecap="round"
            transform="rotate(-90 130 130)"
            style="stroke-dasharray:${circumference}; stroke-dashoffset:${circumference * (1 - pct)}; transition: stroke-dashoffset 1s linear;"/>
        </svg>
        <div class="pom-time-display">
          <div class="pom-time" id="pom-time" style="color:${modeInfo.color};">${formatPomTime(pomState.timeLeft)}</div>
          <div class="pom-session-dots">${dotsHtml}</div>
        </div>
      </div>

      <div class="pom-controls">${controlsHtml}</div>
    </div>

    <div class="pom-stats-strip">
      <div class="pom-stat-card glass">
        <div class="pom-stat-num">${pd.todaysSessions}</div>
        <div class="pom-stat-label">Today</div>
      </div>
      <div class="pom-stat-card glass">
        <div class="pom-stat-num">${pd.totalSessions}</div>
        <div class="pom-stat-label">Total Sessions</div>
      </div>
      <div class="pom-stat-card glass">
        <div class="pom-stat-num">${Math.round(pd.totalWorkMinutes / 60 * 10) / 10}h</div>
        <div class="pom-stat-label">Focus Hours</div>
      </div>
      <div class="pom-stat-card glass">
        <div class="pom-stat-num">${pd.longestStreak}</div>
        <div class="pom-stat-label">Best Streak</div>
      </div>
      <div class="pom-stat-card glass">
        <div class="pom-stat-num">${pd.totalSessions * 5}</div>
        <div class="pom-stat-label">MB Earned</div>
      </div>
    </div>

    <div id="pom-notification" class="pom-notification" style="display:none;"></div>

    <div class="pom-settings glass-dark" style="padding:18px; border-radius:18px; margin-top:16px;">
      <h4 style="font-family:'Baloo 2',cursive; color:rgba(255,255,255,0.7); margin-bottom:14px;">⚙️ Timer Settings</h4>
      <div id="pom-settings-area"></div>
    </div>
  `;

  renderPomodoroSettings();
}

function renderPomodoroSettings() {
  const el = document.getElementById('pom-settings-area');
  if (!el) return;
  const pd = getPomodoroData();

  el.innerHTML = `
    <div class="pom-setting-row">
      <label class="pom-setting-label">Focus Duration</label>
      <div class="pom-setting-control">
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('workDuration',-5)">−</button>
        <span class="pom-setting-value">${pd.workDuration} min</span>
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('workDuration',5)">+</button>
      </div>
    </div>
    <div class="pom-setting-row">
      <label class="pom-setting-label">Short Break</label>
      <div class="pom-setting-control">
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('shortBreakDuration',-1)">−</button>
        <span class="pom-setting-value">${pd.shortBreakDuration} min</span>
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('shortBreakDuration',1)">+</button>
      </div>
    </div>
    <div class="pom-setting-row">
      <label class="pom-setting-label">Long Break</label>
      <div class="pom-setting-control">
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('longBreakDuration',-5)">−</button>
        <span class="pom-setting-value">${pd.longBreakDuration} min</span>
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('longBreakDuration',5)">+</button>
      </div>
    </div>
    <div class="pom-setting-row">
      <label class="pom-setting-label">Long Break Every</label>
      <div class="pom-setting-control">
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('longBreakInterval',-1)">−</button>
        <span class="pom-setting-value">${pd.longBreakInterval} sessions</span>
        <button class="pom-adj-btn glass" onclick="adjustPomSetting('longBreakInterval',1)">+</button>
      </div>
    </div>
    <div class="pom-toggles-row">
      <button class="pom-toggle-btn glass ${pd.autoStartBreak ? 'pom-toggle-active' : ''}" onclick="togglePomSetting('autoStartBreak')">
        ${pd.autoStartBreak ? '✅' : '⬜'} Auto-start Break
      </button>
      <button class="pom-toggle-btn glass ${pd.autoStartWork ? 'pom-toggle-active' : ''}" onclick="togglePomSetting('autoStartWork')">
        ${pd.autoStartWork ? '✅' : '⬜'} Auto-start Work
      </button>
      <button class="pom-toggle-btn glass ${pd.soundEnabled ? 'pom-toggle-active' : ''}" onclick="togglePomSetting('soundEnabled')">
        ${pd.soundEnabled ? '🔔' : '🔕'} Sound
      </button>
    </div>
  `;
}

function adjustPomSetting(key, delta) {
  const pd = getPomodoroData();
  pd[key] = Math.max(1, (pd[key] || 1) + delta);
  saveData();

  // Update timer if not running
  if (!pomState.running && !pomState.paused) {
    if (key === 'workDuration' && pomState.mode === 'work') {
      pomState.timeLeft = pd.workDuration * 60;
      pomState.totalTime = pd.workDuration * 60;
    }
  }
  renderPomodoroSettings();
  if (!pomState.running && !pomState.paused) renderPomodoroTimer();
}

function togglePomSetting(key) {
  const pd = getPomodoroData();
  pd[key] = !pd[key];
  saveData();
  renderPomodoroSettings();
}

// ===== INIT =====
function initPomodoro() {
  const pd = getPomodoroData();
  pomState.timeLeft = pd.workDuration * 60;
  pomState.totalTime = pd.workDuration * 60;
  renderPomodoroTimer();
}

// Render when tab becomes active
document.addEventListener('click', function(e) {
  if (e.target.matches && e.target.matches('[data-tab="pomodoro"]')) {
    setTimeout(renderPomodoroTimer, 50);
  }
});
